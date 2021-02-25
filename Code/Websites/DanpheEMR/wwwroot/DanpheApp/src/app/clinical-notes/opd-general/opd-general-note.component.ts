import { Component, Input, ChangeDetectorRef, EventEmitter, Output } from "@angular/core";
import { OPDGeneralNote } from "../shared/opd-general-note.model";
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { VisitService } from '../../appointments/shared/visit.service';
import { Visit } from '../../appointments/shared/visit.model';
import { PatientClinicalDetail } from "../../clinical/shared/patient-clinical-details.vmodel";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as _ from 'lodash';
import { SubjectiveNotesModel } from "../shared/subjective-note.model";
import { ObjectiveNotesModel } from "../shared/objective-notes.model";
import { PatientService } from "../../patients/shared/patient.service";
import * as moment from 'moment/moment';
import { OrderService } from "../../orders/shared/order.service";

import { LabTestRequisition } from "../../labs/shared/lab-requisition.model";
import { ImagingItemRequisition } from "../../radiology/shared/imaging-item-requisition.model";
import { PHRMPrescriptionItem } from "../../pharmacy/shared/phrm-prescription-item.model";
import { SecurityService } from "../../security/shared/security.service";
import { PHRMGenericModel } from "../../pharmacy/shared/phrm-generic.model";
import { PHRMItemMasterModel } from "../../pharmacy/shared/phrm-item-master.model";

import { DiagnosisOrderVM } from "../shared/assessment-and-plan.model";
import { ICD10 } from "../../clinical/shared/icd10.model";
import { PatientOrderListModel } from "../../clinical/shared/order-list.model";
import { OrderItemsVM } from "../../orders/shared/orders-vms";

@Component({
  selector: "opd-general-note",
  templateUrl: "./opd-general-note.html"
})
export class OPDGeneralNoteComponenet {

  public objectivenote: any; 
  public subjectivenotes: any; 
  public passessmentplan: any; 


  @Input("notesId")
  public notesId: number = null;
  public opdGeneralNote: OPDGeneralNote = new OPDGeneralNote();
  public showOPDGeneralNote: boolean = false;
  public currentVisit: Visit;
  public PatientDetail = {
    PatientId: null,
    PatientVisitId: null,
    ProvderId: null
  };
  @Output("callBackAddUpdate")
  callBackAddUpdate: EventEmitter<object> = new EventEmitter<object>();

  @Input("renderType") renderType: string = null;
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };

  public clinicalDetail: PatientClinicalDetail = new PatientClinicalDetail();
  public FollowUp = {
    Number: 0,
    Unit: 'Days',
  }
  //Declare variables for Mapping Lab Requisition, ImagingRequisition and PHrmacy Prescription
  public mappedLabItems: Array<LabTestRequisition> = [];
  public mappedImagingItems: Array<ImagingItemRequisition> = [];
  public mappedPrescriptionItems: Array<PHRMPrescriptionItem> = [];
  public DiagnosisVM: DiagnosisOrderVM = new DiagnosisOrderVM();


  constructor(public http: HttpClient,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef, public ordServ: OrderService,
    public securityService: SecurityService,
    public visitService: VisitService, public patService: PatientService) {
    this.currentVisit = this.visitService.getGlobal();


    //in the mean time, load all required module's items so that we can map them later on. 
    this.ordServ.LoadAllImagingItems();
    this.ordServ.LoadAllLabTests();
    this.ordServ.LoadAllMedications();
    this.ordServ.LoadAllGenericItems();
  }
  @Input("showOPDGeneralNote")
  public set viewPage(viewPage: boolean) {
    if (viewPage) {
      if (this.notesId) {
        this.GetOPDGeneralNotes();
      }
      else {
        this.Initialize();
      }
      this.showOPDGeneralNote = true;
    }
    else {
      this.showOPDGeneralNote = false;
    }
  }
  Initialize() {
    this.opdGeneralNote = new OPDGeneralNote();
    this.opdGeneralNote.PatientId = this.PatientDetail.PatientId = this.currentVisit.PatientId;
    this.opdGeneralNote.PatientVisitId = this.PatientDetail.PatientVisitId = this.currentVisit.PatientVisitId;
    this.opdGeneralNote.ProviderId = this.PatientDetail.ProvderId = this.currentVisit.ProviderId;

    this.opdGeneralNote.SubjectiveNote.PatientId = this.PatientDetail.PatientId;
    this.opdGeneralNote.SubjectiveNote.PatientVisitId = this.PatientDetail.PatientVisitId;

    this.opdGeneralNote.ObjectiveNote.PatientId = this.PatientDetail.PatientId;
    this.opdGeneralNote.ObjectiveNote.PatientVisitId = this.PatientDetail.PatientVisitId;

    this.GetClinicalDetail();

  }

  GetOPDGeneralNotes() {
    this.http.get<any>("/api/Clinical?reqType=opd-general&notesId=" + this.notesId, this.options)
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results) {
          this.MapOPDGeneralNote(res.Results);
          this.ReverseMapIcdOrders();
          this.GetClinicalDetail();
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get patient clinical notes."]);
          console.log(res.ErrorMessage);
        }
      });
  }

  MapOPDGeneralNote(_opdGeneral) {
    this.opdGeneralNote = new OPDGeneralNote();

    this.opdGeneralNote = Object.assign(this.opdGeneralNote, _opdGeneral);
    this.PatientDetail.PatientId = this.opdGeneralNote.PatientId;
    this.PatientDetail.PatientVisitId = this.opdGeneralNote.PatientVisitId;
    let date = this.opdGeneralNote.VisitDate;
    this.opdGeneralNote.VisitDate = moment(date).format("YYYY-MM-DD");
    //if there are some data with subjective then assign.
    if (this.opdGeneralNote.SubjectiveNote) {
      this.opdGeneralNote.SubjectiveNote = new SubjectiveNotesModel();
      this.opdGeneralNote.SubjectiveNote = Object.assign(this.opdGeneralNote.SubjectiveNote, _opdGeneral.SubjectiveNote);
    }
    //else create a new Subjective with mandatory data
    else {

      this.opdGeneralNote.SubjectiveNote = new SubjectiveNotesModel();
      this.opdGeneralNote.SubjectiveNote.PatientId = this.opdGeneralNote.PatientId;
      this.opdGeneralNote.SubjectiveNote.PatientVisitId = this.opdGeneralNote.PatientVisitId;

    }
    if (this.opdGeneralNote.ObjectiveNote) {
      this.opdGeneralNote.ObjectiveNote = new ObjectiveNotesModel();
      this.opdGeneralNote.ObjectiveNote = Object.assign(this.opdGeneralNote.ObjectiveNote, _opdGeneral.ObjectiveNote);
    }
    else {
      this.opdGeneralNote.ObjectiveNote = new ObjectiveNotesModel();
      this.opdGeneralNote.ObjectiveNote.PatientId = this.opdGeneralNote.PatientId;
      this.opdGeneralNote.ObjectiveNote.PatientVisitId = this.opdGeneralNote.PatientVisitId;

    }


    if (this.opdGeneralNote.AllIcdAndOrders.length) {
      this.opdGeneralNote.AllIcdAndOrders = [];
      this.opdGeneralNote.AllIcdAndOrders = Object.assign(this.opdGeneralNote.AllIcdAndOrders, _opdGeneral.AllIcdAndOrders);
    }
    else {
      this.opdGeneralNote.AllIcdAndOrders = [];
    }



   // this.FollowUp = this.opdGeneralNote.FollowUp ? JSON.parse(this.opdGeneralNote.FollowUp) : { Number: 0, Unit: 'Days' };


    if (this.renderType == "view") {
      this.CheckIfAnyData();
    }

  }

  ReverseMapIcdOrders() {
    this.opdGeneralNote.ClinicalDiagnosis.NotesId = this.opdGeneralNote.NotesId;
    this.opdGeneralNote.ClinicalDiagnosis.PatientId = this.opdGeneralNote.PatientId;
    this.opdGeneralNote.ClinicalDiagnosis.PatientVisitId = this.opdGeneralNote.PatientVisitId;

    this.opdGeneralNote.AllIcdAndOrders.forEach(val => {

      //this.opdGeneralNote.ClinicalDiagnosis.DiagnosisOrdersList.push(new DiagnosisOrderVM());
      this.DiagnosisVM = new DiagnosisOrderVM();
      this.DiagnosisVM.ICD = new ICD10();

      var ln: number = 0;



      this.DiagnosisVM.IsEditable = false;
      this.DiagnosisVM.ICD.ICD10ID = val.ICD10ID;
      this.DiagnosisVM.ICD.ICD10Code = val.ICD10Code;
      this.DiagnosisVM.ICD.ICD10Description = val.ICD10Description;
      this.DiagnosisVM.DiagnosisId = val.DiagnosisId;

      val.AllIcdLabOrders.forEach(lab => {
        let eachOrder = new OrderItemsVM();
        this.DiagnosisVM.OrdersList.push(new PatientOrderListModel());
        eachOrder.ItemName = lab.LabTestName;
        eachOrder.ItemId = lab.LabTestId;
        this.DiagnosisVM.OrdersList[ln].Order = eachOrder;
        ln++;
      });

      val.AllIcdImagingOrders.forEach(imag => {
        let eachOrder = new OrderItemsVM();
        this.DiagnosisVM.OrdersList.push(new PatientOrderListModel());
        eachOrder.ItemName = imag.ImagingItemName;
        eachOrder.ItemId = imag.ImagingItemId;
        this.DiagnosisVM.OrdersList[ln].Order = eachOrder;
        ln++;
      });

      val.AllIcdPrescriptionOrders.forEach(pres => {
        let eachOrder = new OrderItemsVM();
        this.DiagnosisVM.OrdersList.push(new PatientOrderListModel());

        if (this.ordServ.allGenericItems.length) {
          let currGeneric = this.ordServ.allGenericItems.find(gen => gen.GenericId == pres.GenericId);
          if (currGeneric) {
            eachOrder.ItemName = currGeneric.GenericName;
            eachOrder.ItemId = pres.ItemId;
          }
        }

        this.DiagnosisVM.OrdersList[ln].Order = eachOrder;
        ln++;
      });


      this.opdGeneralNote.ClinicalDiagnosis.DiagnosisOrdersList.push(this.DiagnosisVM);

    });

    this.opdGeneralNote.AllIcdAndOrders = [];
  }


  GetClinicalDetail() {
    this.http.get<any>("/api/Clinical?reqType=patient-clinicaldetail&patientId="
      + this.PatientDetail.PatientId
      + '&patientVisitId=' + this.PatientDetail.PatientVisitId, this.options)
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.clinicalDetail = res.Results;
          console.log(this.opdGeneralNote.ClinicalDiagnosis);
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get clinical data for subjective note"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  SaveOPDGeneralNote(): void {

    if (this.CheckValidations() && this.CheckIfAnyData()) {

      this.opdGeneralNote.ClinicalDiagnosis.PatientId = this.patService.globalPatient.PatientId;
      this.opdGeneralNote.ClinicalDiagnosis.PatientVisitId = this.visitService.globalVisit.PatientVisitId;

      if (this.opdGeneralNote.ClinicalDiagnosis.DiagnosisOrdersList.length) {
        this.MapAllOrdersAndAssign();
      }

  //    this.opdGeneralNote.FollowUp = (this.FollowUp.Number && this.FollowUp.Number > 0) ? JSON.stringify(this.FollowUp) : null;

      var temp = _.omit(this.opdGeneralNote, SubjectiveNotesModel ? ['SubjectiveNote.SubjectiveNoteValidator'] : null);
      let data = JSON.stringify(temp);
      if (this.opdGeneralNote.NotesId)
        this.UpdateOPDGeneralNote(data);
      else
        this.PostOPDGeneralNote(data);
    }
  }

  Save() {
    //this.opdGeneralNote.ClinicalDiagnosis.NotesId = 11;
    //this.opdGeneralNote.ClinicalDiagnosis.PatientId = this.patService.globalPatient.PatientId;
    //this.opdGeneralNote.ClinicalDiagnosis.PatientVisitId = this.visitService.globalVisit.PatientVisitId;


    //if (this.opdGeneralNote.ClinicalDiagnosis.DiagnosisOrdersList.length) {
    //    this.MapAllOrdersAndAssign();
    //this.AddData();
    //}
    //else {
    //    this.msgBoxServ.showMessage("failed", ["Failes!! Please Enter atLeast One ICD Item."]);
    //}

  }

  MapAllOrdersAndAssign() {
    var allLabTests = this.ordServ.allLabtests; //check if there is runnumbertype or not, if not get it as well
    var allImgItems = this.ordServ.allImagingItems;
    var allMedItms = this.ordServ.allMedicationItems;
    var defaultMed = new PHRMPrescriptionItem();

    if (this.opdGeneralNote.ClinicalDiagnosis.DiagnosisOrdersList && this.opdGeneralNote.ClinicalDiagnosis.DiagnosisOrdersList.length > 0) {
      this.opdGeneralNote.ClinicalDiagnosis.DiagnosisOrdersList.forEach(itm => {
        if (itm.IsEditable) {
          this.mappedLabItems = [];
          this.mappedImagingItems = [];
          this.mappedPrescriptionItems = [];

          itm.OrdersList.forEach(odr => {
            if (odr.Order.PreferenceType.toLowerCase() == 'lab') {

              let labTest = allLabTests.find(test => test.LabTestId == odr.Order.ItemId);
              let currReq = new LabTestRequisition();

              currReq.LabTestId = labTest.LabTestId;
              currReq.LabTestName = labTest.LabTestName;
              currReq.LabTestSpecimen = labTest.LabTestSpecimen;
              currReq.LabTestSpecimenSource = labTest.LabTestSpecimenSource;
              currReq.ProcedureCode = labTest.ProcedureCode;
              //Lonic Code should come from database.....but for now  it is hard coded value 
              currReq.LOINC = "LONIC Code";
              currReq.OrderStatus = "active";
              currReq.BillingStatus = "unpaid";
              currReq.RunNumberType = labTest.RunNumberType;
              //currReq.VisitType = this.patService.globalPatient.LatestVisitType.toLowerCase();
              currReq.PatientId = this.patService.globalPatient.PatientId;
              currReq.PatientName = this.patService.globalPatient.FirstName + " " + this.patService.globalPatient.LastName;
              currReq.PatientVisitId = this.visitService.globalVisit.PatientVisitId;
              currReq.ProviderName = this.visitService.globalVisit.ProviderName;
              currReq.ProviderId = this.visitService.globalVisit.ProviderId;
              currReq.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
              currReq.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
              this.mappedLabItems.push(currReq);
            }
            else if (odr.Order.PreferenceType.toLowerCase() == 'imaging') {
              let imgItem = allImgItems.find(test => test.ImagingItemId == odr.Order.ItemId);
              let currReq = new ImagingItemRequisition();

              currReq.ImagingItemId = imgItem.ImagingItemId;
              currReq.ImagingItemName = imgItem.ImagingItemName;
              currReq.ImagingTypeId = imgItem.ImagingTypeId;
              currReq.ProcedureCode = imgItem.ProcedureCode;
              currReq.PatientId = this.patService.globalPatient.PatientId;
              currReq.PatientVisitId = this.visitService.globalVisit.PatientVisitId;
              currReq.ProviderName = this.visitService.globalVisit.ProviderName;
              currReq.ProviderId = this.visitService.globalVisit.ProviderId;
              currReq.OrderStatus = "active";
              currReq.BillingStatus = "unpaid"; //see this billing status for Radiology patient
              this.mappedImagingItems.push(currReq);
            }
            else {
              let currMed = new PHRMItemMasterModel();
              let currGeneric = new PHRMGenericModel();

              //incase of generic, we have GenericId as Itemid.
              if (odr.Order.IsGeneric) {
                currGeneric = this.ordServ.allGenericItems.find(gen => gen.GenericId == odr.Order.ItemId);
              } else {
                currMed = allMedItms.find(med => med.ItemId == odr.Order.ItemId);
                currGeneric = this.ordServ.allGenericItems.find(gen => gen.GenericId == odr.Order.GenericId);
              }

              let newReq = new PHRMPrescriptionItem();

              newReq.ItemId = currMed.ItemId;
              newReq.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
              newReq.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
              newReq.Frequency = odr.Frequency ? odr.Frequency : 0;
              newReq.HowManyDays = odr.Duration ? odr.Duration : 0;
              newReq.ItemName = odr.Order.ItemName;
              newReq.PatientId = this.patService.globalPatient.PatientId;
              newReq.Dosage = odr.Dosage ? odr.Dosage : currMed.Dosage;//if current item has dosage, then fill it as it is.
              newReq.Notes = odr.Remarks ? odr.Remarks : "";
              newReq.OrderStatus = "active";
              newReq.Route = odr.Route ? odr.Route : "mouth";
              newReq.ProviderId = this.visitService.globalVisit.ProviderId;
              newReq.GenericId = currGeneric ? currGeneric.GenericId : 0;
              newReq.GenericName = currGeneric ? currGeneric.GenericName : '';
              newReq.Quantity = newReq.Frequency * newReq.HowManyDays;
              newReq.PHRMPrescriptionItemsValidator = null;

              this.mappedPrescriptionItems.push(newReq);
            }
          });

          this.opdGeneralNote.AllIcdAndOrders.push({
            DiagnosisId: 0,
            NotesId: this.opdGeneralNote.ClinicalDiagnosis.NotesId,
            PatientId: this.opdGeneralNote.ClinicalDiagnosis.PatientId,
            PatientVisitId: this.opdGeneralNote.ClinicalDiagnosis.PatientVisitId,
            ICD10ID: itm.ICD.ICD10ID,
            ICD10Code: itm.ICD.ICD10Code,
            ICD10Description: itm.ICD.ICD10Description,
            AllIcdLabOrders: this.mappedLabItems,
            AllIcdImagingOrders: this.mappedImagingItems,
            AllIcdPrescriptionOrders: this.mappedPrescriptionItems,
            CreatedBy: null,
            ModifiedBy: null,
            CreatedOn: null,
            ModifiedOn: null,
            IsActive: itm.IsActive,
          });
        }

      });
    }
  }


  //AddData() {

  //    let data = JSON.stringify(this.opdGeneralNote.AllIcdAndOrders);
  //    this.http.post<any>("/api/Clinical?reqType=clinical-diagnosis", data, this.options)
  //        .map(res => res)
  //        .subscribe(res => {
  //            if (res.Status == "OK") {
  //                this.msgBoxServ.showMessage("success", ["Clinical Diagnosis successfully Added"]);


  //            }
  //            else {
  //                this.msgBoxServ.showMessage("failed", ["Unable to add Clinical Diagnosis"]);
  //                console.log(res.ErrorMessage);
  //            }
  //        });
  //}


  PostOPDGeneralNote(data) {

    this.http.post<any>("/api/Clinical?reqType=opd-general-note", data, this.options)
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("success", ["OPD General Note added successfully."]);
          this.CallBackAddUpdate();
          this.InitializeAssessmentArrays();
          this.MakeDiagnosisUneditable();
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to add OPD General Note"]);
          console.log(res.ErrorMessage);
          this.InitializeAssessmentArrays();
        }
      });
  }

  MakeDiagnosisUneditable() {
    if (this.opdGeneralNote.ClinicalDiagnosis.DiagnosisOrdersList && this.opdGeneralNote.ClinicalDiagnosis.DiagnosisOrdersList.length > 0) {
      this.opdGeneralNote.ClinicalDiagnosis.DiagnosisOrdersList.forEach(itm => {
        itm.IsEditable = false;
      });
    }
  }

  InitializeAssessmentArrays() {
    this.mappedImagingItems = [];
    this.mappedLabItems = [];
    this.mappedPrescriptionItems = [];
    this.opdGeneralNote.AllIcdAndOrders = [];
  }

  UpdateOPDGeneralNote(data) {
    this.http.put<any>("/api/Clinical?reqType=opd-general-note", data, this.options)
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("success", ["OPD General Note updated successfully."]);
          this.CallBackAddUpdate();
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to update OPD General Note"]);
          console.log(res.ErrorMessage);
        }
      });
  }
  CallBackAddUpdate() {
    this.opdGeneralNote = new OPDGeneralNote();
    this.opdGeneralNote.AllIcdAndOrders = [];
    this.mappedPrescriptionItems = [];
    this.mappedLabItems = [];
    this.mappedImagingItems = [];
    this.callBackAddUpdate.emit();
  }
  CheckValidations(): boolean {
    if (this.opdGeneralNote.SubjectiveNote) {
      for (var i in this.opdGeneralNote.SubjectiveNote.SubjectiveNoteValidator.controls) {
        this.opdGeneralNote.SubjectiveNote.SubjectiveNoteValidator.controls[i].markAsDirty();
        this.opdGeneralNote.SubjectiveNote.SubjectiveNoteValidator.controls[i].updateValueAndValidity();
      }
      if (!this.opdGeneralNote.SubjectiveNote.IsValidCheck(undefined, undefined)) {
        return false;
      }
    }

    //similar check for Objective and Assessment and Plan Notes.
    return true;
  }
  //checks if user has filled
  CheckIfAnyData(): boolean {
    let isValidSubjective: boolean = true;
    let isValidObjective: boolean = true;
    let isValidInstructions: boolean = true;
    let IsValidAssessment: boolean = true;
    if (!this.FollowUp.Number && !this.opdGeneralNote.Remarks) {
      isValidInstructions = false;
    }

    if (!this.opdGeneralNote.SubjectiveNote.ChiefComplaint
      && !this.opdGeneralNote.SubjectiveNote.HistoryOfPresentingIllness
      && !this.opdGeneralNote.SubjectiveNote.ReviewOfSystems) {
      isValidSubjective = false;
    }
    if (!this.opdGeneralNote.ObjectiveNote.Abdomen
      && !this.opdGeneralNote.ObjectiveNote.Chest
      && !this.opdGeneralNote.ObjectiveNote.CVS
      && !this.opdGeneralNote.ObjectiveNote.Extremity
      && !this.opdGeneralNote.ObjectiveNote.HEENT
      && !this.opdGeneralNote.ObjectiveNote.Neurological
      && !this.opdGeneralNote.ObjectiveNote.Skin) {
      isValidObjective = false;
    }
    if (!this.opdGeneralNote.ClinicalDiagnosis.DiagnosisOrdersList[0].OrdersList[0].Order && !this.opdGeneralNote.ClinicalDiagnosis.DiagnosisOrdersList[0].OrdersList[0].Dosage && !this.opdGeneralNote.ClinicalDiagnosis.DiagnosisOrdersList[0].OrdersList[0].Duration && !this.opdGeneralNote.ClinicalDiagnosis.DiagnosisOrdersList[0].OrdersList[0].Frequency && !this.opdGeneralNote.ClinicalDiagnosis.DiagnosisOrdersList[0].OrdersList[0].Remarks) {
      IsValidAssessment = false;
    }
    //if nothing is filled
    if (!isValidObjective && !isValidSubjective && !isValidInstructions && !IsValidAssessment) {
      this.Initialize();
      this.msgBoxServ.showMessage("failed", ["Please insert some data."]);
      return false;
    }

    //in case of edit. user might delete exisiting data.
    //if there is PK Id, do not set this.opdGeneralNote.SubjectiveNote = null;
    //in case of view mode we're checking *ngIf="this.opdGeneralNote.SubjectiveNote" so if there are no data don't display the block
    if (!isValidObjective
      && (!this.opdGeneralNote.ObjectiveNote.ObjectiveNotesId || this.renderType == "view")) {
      this.opdGeneralNote.ObjectiveNote = null;
    }
    if (!isValidSubjective
      && (!this.opdGeneralNote.SubjectiveNote.SubjectiveNoteId || this.renderType == "view")) {
      this.opdGeneralNote.SubjectiveNote = null;
    }
    return true;
  }

  print() {
    let popupWinindow;
    var printContents = document.getElementById("notePrintBlock").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' +
      `<style>
                .each-card {padding: 0px 10px 10px 0px;}
                .each-card h3 {margin: 0;font-size: 18px;font-weight: 700;}
                .all-components {padding: 7px;border: 1px solid grey;margin-top: 5px;}
                .all-components p {margin: 0;line-height: 1.6;padding-bottom: 4px;}
                table.all-sub-com tr td, table.all-obj-com tr td, .pat-info-table tr td { padding: 2px; vertical-align: text-top; text-align: left;}
                .subjective .all-sub-com tr td:first-child { min-width: 180px;}
                .objective .all-obj-com tr td:first-child{min-width: 90px;}
            </style>`
      + printContents + '</body > </html>');

    popupWinindow.document.close();

  }


  CallBackSubjective($event) {
    this.subjectivenotes = $event.subjectivenote;
    console.log(this.objectivenote);

  }
  CallBackObjective($event) {
    this.objectivenote = $event.freetexts;
    console.log(this.objectivenote);

  }



}
