import { Component, Input, Output, ChangeDetectorRef, EventEmitter } from "@angular/core";
import { SecurityService } from "../../security/shared/security.service";
import { VisitService } from "../../appointments/shared/visit.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { PatientService } from "../../patients/shared/patient.service";
import { ProblemsBLService } from "../../clinical/shared/problems.bl.service";
import { ICD10 } from "../../clinical/shared/icd10.model";
import { AssessmentAndPlanModel, DiagnosisOrderVM } from "../shared/assessment-and-plan.model";
import { PatientOrderListModel } from "../../clinical/shared/order-list.model";
import * as _ from 'lodash';
import { HttpClient, HttpHeaders } from '@angular/common/http';

//Imported For Mapping Purpose
import { LabTestRequisition } from "../../labs/shared/lab-requisition.model";
import { ImagingItemRequisition } from "../../radiology/shared/imaging-item-requisition.model";
import { PHRMPrescriptionItem } from "../../pharmacy/shared/phrm-prescription-item.model";
import { OrderService } from "../../orders/shared/order.service";
import { IcdWithOrdersViewModel } from "../../clinical/shared/all-icd-with-orders.viewmodel";
import { DanpheCache, MasterType } from "../../shared/danphe-cache-service-utility/cache-services";


@Component({
  selector: "assessment-plan",
  templateUrl: "./assessment-plan.html"
})

export class AssessmentPlanComponent {

  icd10Selected: ICD10 = null;
  public icdEditSelect: ICD10 = null;

  public ICD10List = [];

  public assessments: AssessmentAndPlanModel = new AssessmentAndPlanModel();
  public DiagnosisOrder: DiagnosisOrderVM = new DiagnosisOrderVM();
  public openOrderBox: boolean = false;
  public selectedIndex: number = null;
  public editIndex: number = null;
  public currUser: any = null;
  public ordersSelected: Array<PatientOrderListModel> = [];

  @Output("callback-assessmentandplan")
  public CallBackAssessmentAndPlan: EventEmitter<Object> = new EventEmitter<Object>();



  //Declare variables for Mapping Lab Requisition, ImagingRequisition and PHrmacy Prescription
  public mappedLabItems: Array<LabTestRequisition> = [];
  public mappedImagingItems: Array<ImagingItemRequisition> = [];
  public mappedPrescriptionItems: Array<PHRMPrescriptionItem> = [];

  public allIcdAndOrders: Array<IcdWithOrdersViewModel> = [];
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  public editMode: boolean;

  constructor(public patientService: PatientService, public visitService: VisitService, public http: HttpClient,
    public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService,
    public problemsBLService: ProblemsBLService, public ordServ: OrderService,
    public securityService: SecurityService) {
    //prefilling the OnSetDate as today's date.
    this.GetICDList();
    this.currUser = this.securityService.GetLoggedInUser();
  }

  @Input('editMode') public set editModeStatus(d) {
    this.editMode = d;
  }

  @Input('assessments') public set editAssesments(data) {
    //console.log("Data: ");
    //console.log(typeof data);
    //console.log(data);
    //console.log(data.editMode);

    if (this.editMode) {
      this.assessments = data;
    }
  }
  

  public GetICDList() {
    this.ICD10List = DanpheCache.GetData(MasterType.ICD, null);
    //this.problemsBLService.GetICDList()
    //  .subscribe(res => {
    //    if (res.Status == "OK") {
    //        this.ICD10List = res.Results;
    //this.Initialize();
    //this.GetPatientPastMedicalList();
    //this.GetPatientActiveMedicalList();
    //    }
    //     else {
    //         this.msgBoxServ.showMessage("failed", ["Failed ! "], res.ErrorMessage);
    //  });

  }


  ICDListFormatter(data: any): string {
    let html;
    //if the ICD is not valid for coding then it will be displayed as bold.
    //needs to disable the field that are not valid for coding as well.
    if (!data.ValidForCoding) {
      html = "<b>" + data["ICD10Code"] + "  " + data["ICD10Description"] + "</b>";
    }
    else {
      html = data["ICD10Code"] + "  " + data["ICD10Description"];
    }
    return html;
  }

  AssignSelectedICD() {
    if (this.icd10Selected) {
      var IsDuplicate = this.IsDuplicated();
      if (IsDuplicate) {
        this.msgBoxServ.showMessage("failed", ["Sorry, this ICD Already Exists ! Please Select Other ICD"]);
      }
      else {
        if (this.editIndex == null) {
          //Add Case
          this.openOrderBox = false;
          this.ordersSelected = [];
          this.changeDetector.detectChanges();
          this.openOrderBox = true;
        } else {
          //Edit Case
          this.assessments.DiagnosisOrdersList[this.editIndex].ICD = this.icd10Selected;
          this.assessments.DiagnosisOrdersList.slice();
          this.editIndex = null;
          this.icd10Selected = null;
        }
      }
    }
  }

  IsDuplicated() {
    var existingIndex = this.assessments.DiagnosisOrdersList.findIndex(val => val.ICD.ICD10Code == this.icd10Selected.ICD10Code && val.IsEditable == true);
    if ((existingIndex > -1)) {
      if (existingIndex == this.editIndex) {
        return false;
      }
      return true;
    } else {
      return false;
    }
  }

  GetOrders($event) {
    this.openOrderBox = $event.displayProp;
    if ($event.submit) {
      if (this.selectedIndex != null && ((this.selectedIndex == 0) || (this.selectedIndex > 0))) {
        //edit case
        this.assessments.DiagnosisOrdersList[this.selectedIndex].OrdersList = $event.allorders;
        if ($event.allRemovedOrders.length > 0) {          
          
          $event.allRemovedOrders.forEach(d => { 
            this.assessments.DiagnosisOrdersList[this.selectedIndex].RemovedOrdersList.push(d);
          });
          
        }
        this.CallBackAssessmentAndPlan.emit(this.assessments);


      } else {
        this.DiagnosisOrder.ICD = this.icd10Selected;
        this.DiagnosisOrder.OrdersList = $event.allorders;
        this.assessments.DiagnosisOrdersList.push(this.DiagnosisOrder);
        this.CallBackAssessmentAndPlan.emit(this.assessments);

      }
    } else {
      this.icd10Selected = null;
      this.editIndex = null;
      this.ordersSelected = [];
    }
    this.InitializeAllObj();
  }

  InitializeAllObj() {
    this.selectedIndex = null;
    this.icd10Selected = null;
    this.DiagnosisOrder = new DiagnosisOrderVM();
    this.editIndex = null;
  }

  Reset() {
    this.icd10Selected = null;
    this.editIndex = null;
  }

  Remove(diagListInd: number, ordListInd: number) {

    if (this.editMode) {

      //var rmValue: any = this.assessments.DiagnosisOrdersList[diagListInd].OrdersList.slice(ordListInd, ordListInd + 1);
      var rmValue = this.assessments.DiagnosisOrdersList[diagListInd].OrdersList[ordListInd];
      this.assessments.DiagnosisOrdersList[diagListInd].RemovedOrdersList.push(rmValue);
    }

    this.assessments.DiagnosisOrdersList[diagListInd].OrdersList.splice(ordListInd, 1);
    this.CallBackAssessmentAndPlan.emit(this.assessments);

  }

  EditOrder(dIndx: number) {
    this.selectedIndex = dIndx;
    this.ordersSelected = this.assessments.DiagnosisOrdersList[dIndx].OrdersList;
    this.openOrderBox = true;
  }

  AssignEditedICD() {
    //this.assessments.DiagnosisOrdersList[this.editIndex].ICD = this.icdEditSelect;
    //this.editable = true;
    //this.changeDetector.detectChanges();
    //this.editable = false;
  }

  EditIcd(indexOfIcd: number) {
    this.editIndex = indexOfIcd
    this.icd10Selected = this.assessments.DiagnosisOrdersList[this.editIndex].ICD;
  }

  RemoveCompleteRow(indToDel: number) {
    var value = window.confirm("Do you want to remove all Orders?");
    if (value) {
      if (this.editMode) {
        this.assessments.DiagnosisOrdersList[indToDel].IsActive = false;
        var removedDiagnosis: any = this.assessments.DiagnosisOrdersList.slice(indToDel, indToDel + 1);
        this.assessments.RemovedDiagnosisOrdersList.push(removedDiagnosis[0]);
      }

      this.assessments.DiagnosisOrdersList.splice(indToDel, 1);

      this.CallBackAssessmentAndPlan.emit(this.assessments);
      this.InitializeAllObj();
    }    
  }





  //Save() {
  //    this.assessments.NotesId = 11;
  //    this.assessments.PatientId = this.patientService.globalPatient.PatientId;
  //    this.assessments.PatientVisitId = this.visitService.globalVisit.PatientVisitId;


  //    if (this.assessments.DiagnosisOrdersList.length) {
  //        this.MapAllOrdersAndAssign();
  //        console.log(this.allIcdAndOrders);
  //        this.AddData();
  //    }
  //    else
  //    {
  //        this.msgBoxServ.showMessage("failed", ["Failes!! Please Enter atLeast One ICD Item."]);
  //    }

  //}

  //MapAllOrdersAndAssign() {
  //    var allLabTests = this.ordServ.allLabtests;
  //    var allImgItems = this.ordServ.allImagingItems;
  //    var allMedItms = this.ordServ.allMedicationItems;
  //    var defaultMed = new PHRMPrescriptionItem();

  //    if (this.assessments.DiagnosisOrdersList && this.assessments.DiagnosisOrdersList.length > 0) {
  //        this.assessments.DiagnosisOrdersList.forEach(itm => {
  //            this.mappedLabItems = [];
  //            this.mappedImagingItems = [];
  //            this.mappedPrescriptionItems = [];

  //            itm.OrdersList.forEach(odr => {
  //                if (odr.Order.PreferenceType.toLowerCase() == 'lab') {

  //                    let labTest = allLabTests.find(test => test.LabTestId == odr.Order.ItemId);
  //                    let currReq = new LabTestRequisition();

  //                    currReq.LabTestId = labTest.LabTestId;
  //                    currReq.LabTestName = labTest.LabTestName;
  //                    currReq.LabTestSpecimen = labTest.LabTestSpecimen;
  //                    currReq.LabTestSpecimenSource = labTest.LabTestSpecimenSource;
  //                    currReq.ProcedureCode = labTest.ProcedureCode;
  //                    //Lonic Code should come from database.....but for now  it is hard coded value 
  //                    currReq.LOINC = "LONIC Code";
  //                    currReq.OrderStatus = "active";
  //                    currReq.BillingStatus = "unpaid";
  //                    currReq.PatientId = this.patientService.globalPatient.PatientId;
  //                    currReq.PatientName = this.patientService.globalPatient.FirstName + " " + this.patientService.globalPatient.LastName;
  //                    currReq.PatientVisitId = this.visitService.globalVisit.PatientVisitId;
  //                    currReq.ProviderName = this.visitService.globalVisit.ProviderName;
  //                    currReq.ProviderId = this.visitService.globalVisit.ProviderId;
  //                    currReq.CreatedBy = this.currUser.EmployeeId;
  //                    currReq.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
  //                    this.mappedLabItems.push(currReq);
  //                }
  //                else if (odr.Order.PreferenceType.toLowerCase() == 'imaging') {
  //                    let imgItem = allImgItems.find(test => test.ImagingItemId == odr.Order.ItemId);
  //                    let currReq = new ImagingItemRequisition();

  //                    currReq.ImagingItemId = imgItem.ImagingItemId;
  //                    currReq.ImagingItemName = imgItem.ImagingItemName;
  //                    currReq.ImagingTypeId = imgItem.ImagingTypeId;
  //                    currReq.ProcedureCode = imgItem.ProcedureCode;
  //                    currReq.PatientId = this.patientService.globalPatient.PatientId;
  //                    currReq.PatientVisitId = this.visitService.globalVisit.PatientVisitId;
  //                    currReq.ProviderName = this.visitService.globalVisit.ProviderName;
  //                    currReq.ProviderId = this.visitService.globalVisit.ProviderId;
  //                    currReq.OrderStatus = "active";
  //                    currReq.BillingStatus = "unpaid";
  //                    this.mappedImagingItems.push(currReq);
  //                }
  //                else {
  //                        let currMed = new PHRMItemMasterModel();
  //                        let currGeneric = new PHRMGenericModel();

  //                        //incase of generic, we have GenericId as Itemid.
  //                        if (odr.Order.IsGeneric) {
  //                            currGeneric = this.ordServ.allGenericItems.find(gen => gen.GenericId == odr.Order.ItemId);
  //                        } else {
  //                            currMed = allMedItms.find(med => med.ItemId == odr.Order.ItemId);
  //                            currGeneric = this.ordServ.allGenericItems.find(gen => gen.GenericId == odr.Order.GenericId);
  //                        }

  //                        let newReq = new PHRMPrescriptionItem();

  //                        newReq.ItemId = currMed.ItemId;
  //                        newReq.CreatedBy = this.currUser.EmployeeId;
  //                        newReq.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
  //                        newReq.Frequency = odr.Frequency ? odr.Frequency : 0;
  //                        newReq.HowManyDays = odr.Duration ? odr.Duration : 0;
  //                        newReq.ItemName = odr.Order.ItemName;
  //                        newReq.PatientId = this.patientService.globalPatient.PatientId;
  //                        newReq.Dosage = odr.Dosage ? odr.Dosage : currMed.Dosage;//if current item has dosage, then fill it as it is.
  //                        newReq.Notes = odr.Remarks ? odr.Remarks : "";
  //                        newReq.OrderStatus = "active";
  //                        newReq.Route = odr.Route ? odr.Route : "mouth";
  //                        newReq.ProviderId = this.visitService.globalVisit.ProviderId;
  //                        newReq.GenericId = currGeneric.GenericId;
  //                        newReq.GenericName = currGeneric.GenericName;
  //                        newReq.Quantity = newReq.Frequency * newReq.HowManyDays;
  //                        newReq.PHRMPrescriptionItemsValidator = null;

  //                        this.mappedPrescriptionItems.push(newReq);
  //                    }
  //            });

  //            this.allIcdAndOrders.push({
  //                DiagnosisId: 0,
  //                NotesId: this.assessments.NotesId,
  //                PatientId: this.assessments.PatientId,
  //                PatientVisitId: this.assessments.PatientVisitId,
  //                ICD10ID: itm.ICD.ICD10ID,
  //                ICD10Code: itm.ICD.ICD10Code,
  //                ICD10Description: itm.ICD.ICD10Description,
  //                AllIcdLabOrders: this.mappedLabItems,
  //                AllIcdImagingOrders: this.mappedImagingItems,
  //                AllIcdPrescriptionOrders: this.mappedPrescriptionItems,
  //                CreatedBy: null,
  //                ModifiedBy: null,
  //                CreatedOn: null,
  //                ModifiedOn: null
  //            });

  //        });
  //    }       
  //}

  //AddData() {

  //    let data = JSON.stringify(this.allIcdAndOrders);
  //    this.http.post<any>("/api/Clinical?reqType=clinical-diagnosis", data, this.options)
  //        .map(res => res)
  //        .subscribe(res => {
  //            if (res.Status == "OK") {
  //                this.msgBoxServ.showMessage("success", ["Clinical Diagnosis successfully Added"]);
  //                this.InitializeAllObj();
  //                this.allIcdAndOrders = [];
  //                this.assessments = new AssessmentAndPlanModel();
  //                this.mappedPrescriptionItems = [];
  //                this.mappedLabItems = [];
  //                this.mappedImagingItems = [];
  //            }
  //            else {
  //                this.msgBoxServ.showMessage("failed", ["Unable to add Clinical Diagnosis"]);
  //                console.log(res.ErrorMessage);
  //            }
  //        });
  //}

}

