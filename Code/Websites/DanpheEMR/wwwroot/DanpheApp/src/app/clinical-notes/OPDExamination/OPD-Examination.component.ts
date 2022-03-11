import { Component, Output, EventEmitter, Input, ChangeDetectorRef } from "@angular/core";
import * as moment from 'moment/moment';
import { Patient } from "../../patients/shared/patient.model";
import { Visit } from "../../appointments/shared/visit.model";
import { NotesModel } from "../shared/notes.model";
import { PatientClinicalDetail } from "../../clinical/shared/patient-clinical-details.vmodel";
import { AssessmentAndPlanModel, DiagnosisOrderVM } from "../shared/assessment-and-plan.model";
import { VisitService } from "../../appointments/shared/visit.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { CoreService } from "../../core/shared/core.service";
import { NoteTemplateBLService } from "../shared/note-template.bl.service";
import { PatientService } from "../../patients/shared/patient.service";
import { PatientOrderListModel } from "../../clinical/shared/order-list.model";
import { OrderService } from "../../orders/shared/order.service";
import { LabTestRequisition } from "../../labs/shared/lab-requisition.model";
import { ImagingItemRequisition } from "../../radiology/shared/imaging-item-requisition.model";
import { PHRMPrescriptionItem } from "../../pharmacy/shared/phrm-prescription-item.model";
import { SecurityService } from "../../security/shared/security.service";
import { PHRMItemMasterModel } from "../../pharmacy/shared/phrm-item-master.model";
import { PHRMGenericModel } from "../../pharmacy/shared/phrm-generic.model";
import { ClinicalPrescriptionNotesModel } from "../shared/clinical-prescription-note.model";
import { DanpheCache, MasterType } from "../../shared/danphe-cache-service-utility/cache-services";
import { ICD10 } from "../../clinical/shared/icd10.model";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { OrderItemsVM } from "../../orders/shared/orders-vms";
import { CommonFunctions } from "../../shared/common.functions";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

@Component({
  selector: "OPD-Examination",
  templateUrl: "./OPD-Examination.component.html",
})

export class OPDExaminationComponent{
  public pat: Patient = new Patient();
  public patVisit: Visit = new Visit();
  
  public notes: NotesModel = new NotesModel();
  public date: string = null;
  public selectedDepartment: any = null;
  public FollowUp = {
    Number: 0,
    Unit: 'Days',
  }
  public clinicalDetail: PatientClinicalDetail = new PatientClinicalDetail();
  //Diagnosis
  @Input("prescriptionNote")
  public prescriptionNotes: ClinicalPrescriptionNotesModel = new ClinicalPrescriptionNotesModel();
  public ICD10List = [];
  @Input("notesId")
  public notesId: number;
  public update: boolean = false;
  @Output()
  public outPutHpNote: EventEmitter<Object> = new EventEmitter<Object>();  
  public assessment: AssessmentAndPlanModel = new AssessmentAndPlanModel();
  public showAP: boolean = false;
  public APeditMode: boolean = false;
  public assessmentForEdit: any;
  public showSOnotes: boolean = false;
  public showExamination : boolean = true;
  public showAllergyAddBox: boolean = false; //@input-allergy
  public showFreeText: boolean = false;
  public freetextnotes: any = null;
  public selectedSecondaryDoctor: any = "";
  public mappedLabItems: Array<LabTestRequisition> = [];
  public mappedImagingItems: Array<ImagingItemRequisition> = [];
  public mappedPrescriptionItems: Array<PHRMPrescriptionItem> = [];
  public templateList: any = "";
  public noteTypeList: any;
  public NoteType : string="";
  public showView :boolean = false;
  
  public allOrdItems: Array<OrderItemsVM> = [];
  public ordItemsFiltered: Array<OrderItemsVM> = [];
  public itemsType: Array<any> = [];
  public selItemType: string = "All";
  public selOrdItem: any = null;
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  isVisitConcluded = false;
  @Input("patientVisitId")
  public patientVisitId: number;
  constructor(public visitService: VisitService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public notetemplateBLService: NoteTemplateBLService,
    public patientService: PatientService,
    public changeDetector: ChangeDetectorRef,
    public ordServ: OrderService, public router: Router,
    public securityService: SecurityService,
    public http: HttpClient) {
    this.pat = this.patientService.globalPatient;
    this.patVisit = this.visitService.globalVisit,
    this.date = moment().format("YYYY-MM-DD,h:mm:ss a");
    this.GetICDList();
    this.LoadAllOrderItems();
    this.GetNoteTypeList()
    this.GetTemplateList();
    this.getNoteType();
  }
  ngOnInit() {
    if (this.notesId) {
      this.update = true;

      if (this.prescriptionNotes && this.prescriptionNotes.ICDSelected && this.prescriptionNotes.ICDSelected.trim().length) {
        this.prescriptionNotes.ICDList = JSON.parse(this.prescriptionNotes.ICDSelected);
      } else {
        this.AddNewICDRow();
      }

      if (this.prescriptionNotes && this.prescriptionNotes.OrdersSelected && this.prescriptionNotes.OrdersSelected.trim().length) {
        this.prescriptionNotes.SelectedOrderItems = JSON.parse(this.prescriptionNotes.OrdersSelected);
      }

    } else {
      this.AddNewICDRow();
      this.update = false
    }   
  }

  getNoteType(){
    var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Clinical" && a.ParameterName == "DefaultNotesType_OPDExamination").ParameterValue;
    if (paramValue){
      this.NoteType = paramValue;
     
    }
  }
  @Input('editHpNote')
  public set HpNote(hpNote: any) {
    if (this.notetemplateBLService.NotesId != 0) {
      //this.editMode = true;
      this.notes = hpNote;
      console.log("notes in hp component, edit input:");
      console.log(this.notes);

      // get assessment orders
      this.GetAllOrders(this.notes.NotesId);
      this.APeditMode = true;
      this.showSOnotes = true;

    } else {
      this.showSOnotes = true;
      this.showAP = true;
    }
  }
  
  public GetAllOrders(NoteId) {
    this.notetemplateBLService.GetAllOrdersByNoteId(NoteId)
      .subscribe(res => {
        if (res.Status = "OK") {

          var diagnosis: any = res.Results;

          console.log("diagnosis Temp:");
          console.log(diagnosis);

          var DiagnosisOrdersList: Array<DiagnosisOrderVM> = [];

          diagnosis[0].DiagnosisOrdersList.forEach(item => {


            var OrdersList: Array<PatientOrderListModel> = [];


            item.AllIcdLabOrders.forEach(lab => {
              var Order: PatientOrderListModel = new PatientOrderListModel();
              Order.Order = lab; OrdersList.push(Order);
            });
            item.AllIcdImagingOrders.forEach(img => {
              var Order: PatientOrderListModel = new PatientOrderListModel();
              Order.Order = img; OrdersList.push(Order);
            });

            item.AllIcdPrescriptionOrders.forEach(med => {
              var Order: PatientOrderListModel = new PatientOrderListModel();
              Order.Order = med;
              Order.Dosage = med.Dosage;
              Order.Frequency = med.Frequency;
              Order.Duration = med.HowManyDays;
              OrdersList.push(Order);
            });


            var DiagnosisOrders: DiagnosisOrderVM = new DiagnosisOrderVM();

            DiagnosisOrders.DiagnosisId = item.DiagnosisId;
            DiagnosisOrders.ICD = item.ICD[0];
            DiagnosisOrders.IsEditable = item.IsEditable;
            DiagnosisOrders.OrdersList = OrdersList;

            DiagnosisOrdersList.push(DiagnosisOrders);

          });

          console.log("Generated DiagnosisOrdersList:");
          console.log(DiagnosisOrdersList);

          this.assessment.DiagnosisOrdersList = DiagnosisOrdersList;
          this.assessment.NotesId = diagnosis[0].NotesId;
          this.assessment.PatientId = diagnosis[0].PatientId;
          this.assessment.PatientVisitId = diagnosis[0].PatientVisitId;

          console.log("new diagnosis:");
          console.log(this.assessment);

          //var length = Object.keys(this.diagnosis).length
          //console.log(length);

          //var test: any;
          //test = Object.keys(this.diagnosis1).map(key => this.diagnosis1[key]);
          //console.log("test:");
          //console.log(test);

          //this.assessmentForEdit = { editMode: false, assessment: this.assessment }
          this.showAP = true;
        } 
      });
  }

  FocusOut() {
    //console.log(this.notes.EmergencyNote);
    this.outPutHpNote.emit(this.notes);
  }

  CallBackSubjective($event) {
    this.notes.SubjectiveNote = $event.subjectivenote;
    //console.log(this.notes.EmergencyNote.SubjectiveNote);
    this.outPutHpNote.emit(this.notes);
  }
  CallBackProcedureNotes($event) {
    this.notes.ProcedureNote = $event.prescriptionNote;
    //console.log(this.notes.EmergencyNote.SubjectiveNote);
    this.outPutHpNote.emit(this.notes);
  }

  CallBackObjective($event) {
    this.notes.ObjectiveNote = $event.objectivenote;
    //console.log(this.notes.EmergencyNote.ObjectiveNote);
    this.outPutHpNote.emit(this.notes);
  }
  CallBackView($event) {
    if ($event.Data.TemplateName ==  this.NoteType) {
      this.showView = true;
      this.notetemplateBLService.NotesId = $event.Data.NotesId;
    }
  }

  CallBackAssesmentAndPlan(data) {
    console.log("from assessment orders:");
    console.log(data);
    this.notes.ClinicalDiagnosis = data;
    this.outPutHpNote.emit(this.notes); 
  }
  CallBackAddAllergy($event) { //@output
    if ($event && $event.allergy) {
        this.clinicalDetail.Allergies.push($event.allergy);
    }
    this.showAllergyAddBox = false;
    this.changeDetector.detectChanges();
}
CallBackFreeTexts($event) {
  this.notes.FreeTextNote= $event.freetexts;
  
  console.log(this.freetextnotes);

}
SubmitTemplate(value) {
  if (value == 1) { // 1 --> Submit Button --> incase Note is not pending  (Created; not Updated)
    this.notes.IsPending = false;
    var view: boolean;
    view = window.confirm("Want to Submit Note? You won't be able to edit or update note in future ! Click Save button if you want to change Note in future !");
    if (view) { // confirming before final submit of Note

      this.PostTemplate();
    }
  }
  if (value == 0) { //  0 --> Save Button --> incase Note is pending (Created; not Updated)
    this.notes.IsPending = true;
    this.PostTemplate();
  }
}
PostTemplate() {
  // if (this.visitService.globalVisit.ConcludeDate) {
  //   this.isVisitConcluded = true;
  //   this.msgBoxServ.showMessage("Warning", ["This Visit is concluded"]);
  // } else 
  // {
  //   this.isVisitConcluded = false;
  
  this.notes.ClinicalPrescriptionNote.PatientId = this.patVisit.PatientId;
  this.notes.ClinicalPrescriptionNote.PatientVisitId = this.patVisit.PatientVisitId;
 this.notes.SecondaryDoctorId = this.selectedSecondaryDoctor ? this.selectedSecondaryDoctor.ProviderId : null;
  this.notes.ProviderId = this.patVisit.ProviderId ? this.patVisit.ProviderId : 0;
  this.notes.ClinicalPrescriptionNote.OrdersSelected = JSON.stringify(this.prescriptionNotes.SelectedOrderItems);
  this.notes.ClinicalPrescriptionNote.ICDSelected = JSON.stringify(this.prescriptionNotes.ICDList);

  this.notes.PatientId = this.patVisit.PatientId;
  this.notes.PatientVisitId = this.patVisit.PatientVisitId;
  this.notes.TemplateId = this.templateList.find(temp=>temp.TemplateName == this.NoteType).TemplateId;
  this.notes.TemplateName=this.templateList.find(temp=>temp.TemplateName == this.NoteType).TemplateName;
    this.notes.NoteTypeId =   this.noteTypeList.find(type => type.NoteType == this.NoteType).NoteTypeId;
  //Logic for Posting History and Physical Note
 
    if (this.notes.ClinicalDiagnosis) {
      this.MapAllOrdersAndAssign();
    }

    if (this.notes.IsPending) { // if notes are are pending then, empty fields are allowed to post 
      this.PostHistoryAndPhysical();
    } else {
      if (this.notes.SubjectiveNote && this.notes.ObjectiveNote && this.notes.AllIcdAndOrders.length > 0 && this.notes.FreeTextNote) {

        this.PostHistoryAndPhysical();
      } else {
        this.msgBoxServ.showMessage("Warning", ["Submit can't be done with all fields empty !"]);
      }
    }

}
MapAllOrdersAndAssign() {

  if (this.notes.ClinicalDiagnosis.DiagnosisOrdersList && this.notes.ClinicalDiagnosis.DiagnosisOrdersList.length > 0) {

    var allLabTests = this.ordServ.allLabtests; //check if there is runnumbertype or not, if not get it as well
    var allImgItems = this.ordServ.allImagingItems;
    var allMedItms = this.ordServ.allMedicationItems;
    //var defaultMed = new PHRMPrescriptionItem();

    this.notes.ClinicalDiagnosis.DiagnosisOrdersList.forEach(itm => {

      if (itm.RemovedOrdersList.length > 0) {
        this.notes.ClinicalDiagnosis.RemovedDiagnosisOrdersList.push(itm);
      }
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
            currReq.PatientId = this.patientService.globalPatient.PatientId;
            currReq.PatientName = this.patientService.globalPatient.FirstName + " " + this.patientService.globalPatient.LastName;
            currReq.PatientVisitId = this.visitService.globalVisit.PatientVisitId;
            currReq.ProviderName = this.visitService.globalVisit.ProviderName;
            currReq.ProviderId = this.visitService.globalVisit.ProviderId;
            currReq.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            currReq.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
            currReq.DiagnosisId = itm.DiagnosisId;

            this.mappedLabItems.push(currReq);
          }
          else if (odr.Order.PreferenceType.toLowerCase() == 'imaging') {
            let imgItem = allImgItems.find(test => test.ImagingItemId == odr.Order.ItemId);
            let currReq = new ImagingItemRequisition();

            currReq.ImagingItemId = imgItem.ImagingItemId;
            currReq.ImagingItemName = imgItem.ImagingItemName;
            currReq.ImagingTypeId = imgItem.ImagingTypeId;
            currReq.ProcedureCode = imgItem.ProcedureCode;
            currReq.PatientId = this.patientService.globalPatient.PatientId;
            currReq.PatientVisitId = this.visitService.globalVisit.PatientVisitId;
            currReq.ProviderName = this.visitService.globalVisit.ProviderName;
            currReq.ProviderId = this.visitService.globalVisit.ProviderId;
            currReq.OrderStatus = "active";
            currReq.DiagnosisId = itm.DiagnosisId;
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
            newReq.PatientId = this.patientService.globalPatient.PatientId;
            newReq.Dosage = odr.Dosage ? odr.Dosage : currMed.Dosage;//if current item has dosage, then fill it as it is.
            newReq.Notes = odr.Remarks ? odr.Remarks : "";
            newReq.OrderStatus = "active";
            newReq.Route = odr.Route ? odr.Route : "mouth";
            newReq.ProviderId = this.visitService.globalVisit.ProviderId;
            newReq.GenericId = currGeneric ? currGeneric.GenericId : 0;
            newReq.GenericName = currGeneric ? currGeneric.GenericName : '';
            newReq.Quantity = newReq.Frequency * newReq.HowManyDays;
            newReq.PHRMPrescriptionItemsValidator = null;
            newReq.DiagnosisId = itm.DiagnosisId;

            this.mappedPrescriptionItems.push(newReq);
          }
        });

        this.notes.AllIcdAndOrders.push({
          DiagnosisId: itm.DiagnosisId,
          NotesId: this.notes.NotesId,
          PatientId: this.patVisit.PatientId,
          PatientVisitId: this.patVisit.PatientVisitId,
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

  // for mapping removed icd-orders
  if (this.notes.ClinicalDiagnosis.RemovedDiagnosisOrdersList && this.notes.ClinicalDiagnosis.RemovedDiagnosisOrdersList.length > 0) {

    var allLabTests = this.ordServ.allLabtests; //check if there is runnumbertype or not, if not get it as well
    var allImgItems = this.ordServ.allImagingItems;
    var allMedItms = this.ordServ.allMedicationItems;
    //var defaultMed = new PHRMPrescriptionItem();

    this.notes.ClinicalDiagnosis.RemovedDiagnosisOrdersList.forEach(itm => {

      if (itm.IsEditable) {
        this.mappedLabItems = [];
        this.mappedImagingItems = [];
        this.mappedPrescriptionItems = [];

        itm.RemovedOrdersList.forEach(odr => {
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
            currReq.PatientId = this.patientService.globalPatient.PatientId;
            currReq.PatientName = this.patientService.globalPatient.FirstName + " " + this.patientService.globalPatient.LastName;
            currReq.PatientVisitId = this.visitService.globalVisit.PatientVisitId;
            currReq.ProviderName = this.visitService.globalVisit.ProviderName;
            currReq.ProviderId = this.visitService.globalVisit.ProviderId;
            currReq.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            currReq.DiagnosisId = itm.DiagnosisId;
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
            currReq.PatientId = this.patientService.globalPatient.PatientId;
            currReq.PatientVisitId = this.visitService.globalVisit.PatientVisitId;
            currReq.ProviderName = this.visitService.globalVisit.ProviderName;
            currReq.ProviderId = this.visitService.globalVisit.ProviderId;
            currReq.OrderStatus = "active";
            currReq.DiagnosisId = itm.DiagnosisId;
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
            newReq.PatientId = this.patientService.globalPatient.PatientId;
            newReq.Dosage = odr.Dosage ? odr.Dosage : currMed.Dosage;//if current item has dosage, then fill it as it is.
            newReq.Notes = odr.Remarks ? odr.Remarks : "";
            newReq.OrderStatus = "active";
            newReq.Route = odr.Route ? odr.Route : "mouth";
            newReq.ProviderId = this.visitService.globalVisit.ProviderId;
            newReq.GenericId = currGeneric ? currGeneric.GenericId : 0;
            newReq.GenericName = currGeneric ? currGeneric.GenericName : '';
            newReq.Quantity = newReq.Frequency * newReq.HowManyDays;
            newReq.PHRMPrescriptionItemsValidator = null;
            newReq.DiagnosisId = itm.DiagnosisId;

            this.mappedPrescriptionItems.push(newReq);
          }
        });

        this.notes.RemovedIcdAndOrders.push({
          DiagnosisId: itm.DiagnosisId,
          NotesId: this.notes.NotesId,
          PatientId: this.patVisit.PatientId,
          PatientVisitId: this.patVisit.PatientVisitId,
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
  //Post function handling History and Physical Note
  public PostHistoryAndPhysical() {

    this.notetemplateBLService.PostOpdExamination(this.notes)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", ["OPD Examination done successfully."]);
          this.RouteToNotesList();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Error in Posting OPD Examination"]);
          console.log(res.ErrorMessage);
        }
      });
  }
public RouteToNotesList(){
  this.router.navigate([
    "/Doctors/PatientOverviewMain/NotesSummary/NotesList",
  ]);
}
public GetNoteTypeList() {
  try {

    this.notetemplateBLService.GetNoteTypeList()
      .subscribe(res => {
        if (res.Status == "OK") {
          if (res.Results.length) {

            this.noteTypeList = res.Results;

          }
          else {
            console.log(res.Errors);
          }
        }
      });

  } catch (exception) {
    this.msgBoxServ.showMessage("Error", [exception]);
  }
}
public GetTemplateList() {
  try {

    this.notetemplateBLService.GetAllTemplateList()
      .subscribe(res => {
        if (res.Status == "OK") {
          if (res.Results.length) {
            this.templateList = res.Results;
          }
          else {
            //  console.log(res.Errors);
          }
        }
      });

  } catch (exception) {
    this.msgBoxServ.showMessage("Error", [exception]);
  }
}
public DeleteRow(ind: number) {
  this.prescriptionNotes.ICDList.splice(ind, 1);
}
public GetICDList() {
  this.ICD10List = DanpheCache.GetData(MasterType.ICD, null);
}
LoadAllOrderItems() {
  this.http.get<any>('/api/Orders?reqType=allOrderItems', this.options).map(res => res)
    .subscribe((res: DanpheHTTPResponse) => {
      if (res.Status == "OK") {
        this.allOrdItems = res.Results.filter(d => d.PreferenceType.toLowerCase() != 'medication');

        this.allOrdItems.forEach(itm => {
          itm.IsSelected = false;
          itm.FormattedName = itm.Type + "-" + itm.ItemName;
        });

        this.GenerateItemTypes();
      }
      else {
        this.msgBoxServ.showMessage("failed", ['Failed. please check log for details.'], res.ErrorMessage);
      }
    });
}


GenerateItemTypes() {
  let allItmsType = this.allOrdItems.map(itm => {
    return itm.PreferenceType;
  });
  this.itemsType = CommonFunctions.GetUniqueItemsFromArray(allItmsType);
  this.itemsType.unshift("All");//add default itemstype to the beginning of array.

  this.ordItemsFiltered = Object.assign([], this.allOrdItems);
}

ItemsTypeOnChange() {
  if (this.selItemType && (this.selItemType != "All")) {
    this.ordItemsFiltered = this.allOrdItems.filter(itm => itm.PreferenceType.toLowerCase() == this.selItemType.toLowerCase());
  }
  else {
    this.ordItemsFiltered = Object.assign([], this.allOrdItems);
  }
}
OrderItemValueChanged() {
  if (this.selOrdItem && this.selOrdItem.ItemId) {
    let oditem = Object.assign({}, this.selOrdItem);
    this.AddNewItemToOrders(oditem);
  }
  this.changeDetector.detectChanges();
  this.selOrdItem = '';
}
AddNewItemToOrders(item) {
  item.IsSelected = true;
  let alreadyExists = this.prescriptionNotes.SelectedOrderItems.filter(itm => itm.Type == item.Type && itm.ItemId == item.ItemId).length;
  if (!alreadyExists) {
    this.prescriptionNotes.SelectedOrderItems.unshift(item);
  }
}

RemoveOrderItem(item) {
  item.IsSelected = false;
  let itmIndex = this.prescriptionNotes.SelectedOrderItems.findIndex(itm => itm.Type == item.Type && itm.ItemId == item.ItemId);
  this.prescriptionNotes.SelectedOrderItems.splice(itmIndex, 1);
}
orderItemsListFormatter(data: any): string {
  let isGeneric = data["IsGeneric"];
  let retHtml = "";


  if (!isGeneric) {
    let dosage = data["Dosage"];
    let freq = data["FreqInWords"];


    retHtml = data["ItemName"] + "|" + data["GenericName"] + "|" + (dosage != null && dosage != "" ? dosage : "Dose:NA") + "|" + (freq != null && freq != "" ? freq : "Frequency:NA" + " | Available Quantity: " + data["AvailableQuantity"]);
    // retHtml = "(" + data["Type"] + ")" + "<b>" + data["ItemName"] + "</b>";
  }
  else {
    retHtml = "(" + data["Type"] + ")" + data["ItemName"] + " | Available Quantity: " + data["AvailableQuantity"];
  }

  return retHtml;
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
public AddNewICDRow() {
  let newicd: ICD10 = Object.assign({},new ICD10());
  newicd.ICD10Description = '';
  this.prescriptionNotes.ICDList.push(newicd);

  let new_index = this.prescriptionNotes.ICDList.length - 1;
  if (new_index > 0) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById('icd10-box' + new_index);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 500);
  }
}
print(){
  this.patientVisitId = this.patVisit.PatientVisitId
this.showView = true;
}
printTemplate(id: string = 'print-template') {
  let popupWinindow;
  var printContents = document.getElementById(id).innerHTML;
  popupWinindow = window.open(
    "",
    "_blank",
    "width=1600,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no"
  );
  popupWinindow.document.open();
  popupWinindow.document.write(
    `<html><head>
    <link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" />
    <link rel="stylesheet" type="text/css" href="../../assets-dph/external/global/plugins/bootstrap/css/bootstrap.min.css" />
    </head><body onload="window.print()">` +
      printContents +
      "</body></html>"
  );

  popupWinindow.document.close();
}
Close(){
  this.showView = false;
}

}



