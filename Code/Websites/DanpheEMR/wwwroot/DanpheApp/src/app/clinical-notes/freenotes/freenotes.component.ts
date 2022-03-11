import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from '@angular/router';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { VisitService } from '../../appointments/shared/visit.service';
import { Visit } from '../../appointments/shared/visit.model';
import { Patient } from "../../patients/shared/patient.model";
import { PatientService } from "../../patients/shared/patient.service";
import * as moment from 'moment/moment';
import { VisitBLService } from "../../appointments/shared/visit.bl.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { DoctorsBLService } from "../../doctors/shared/doctors.bl.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { SecurityService } from "../../security/shared/security.service";
import { NotesModel } from "../shared/notes.model";
import { NoteTemplateBLService } from "../shared/note-template.bl.service";
import { User } from "../../security/shared/user.model";
import { PatientClinicalDetail } from "../../clinical/shared/patient-clinical-details.vmodel";
import { CoreService } from "../../core/shared/core.service";
import { ADT_BLService } from "../../adt/shared/adt.bl.service";
import { LabTestRequisition } from "../../labs/shared/lab-requisition.model";
import { ImagingItemRequisition } from "../../radiology/shared/imaging-item-requisition.model";
import { PHRMPrescriptionItem } from "../../pharmacy/shared/phrm-prescription-item.model";
import { OrderService } from "../../orders/shared/order.service";
import { PHRMItemMasterModel } from "../../pharmacy/shared/phrm-item-master.model";
import { PHRMGenericModel } from "../../pharmacy/shared/phrm-generic.model";
import * as _ from 'lodash';

@Component({
  selector: "freenotes",
  templateUrl: "./freenotes.html",
  providers: [VisitBLService]
})

export class FreeNotesComponent implements OnInit, OnDestroy {
  //public selectedNotes: NotesModel = new NotesModel();
  public pat: Patient = new Patient();
  public clinicalDetail: PatientClinicalDetail = new PatientClinicalDetail();
  public patVisit: Visit = new Visit();
  public date: string = null;
  public showHandP: boolean = false;
  public showFreeText: boolean = false;
  public showProcedureNote: boolean = false;
  public showProgressNote: boolean = false;
  public showEmergencyNote: boolean = false;
  public editMode: boolean = false;
  public selectedSecondaryDoctor: any = "";
  public selTemplateList: any = "";
  public PreviouslySelectedTemplate: any = "";
  public Visittype: string = "";

  public templateList: any = "";
  public progressnotes: any = null;
  public procedurenotes: any = null;
  public freetextnotes: any = null;

  public DoctorList: Array<any> = new Array<any>();
  public selectVisit: Array<any> = new Array<any>();
  public Visits: Array<any> = new Array<any>();
  public validRoutes: any;
  public isVisitConcluded = false;
  public notes: NotesModel = new NotesModel();
  public visit: Visit = new Visit();
  public loggedInUser: User = new User();
  public noteTypeList: any;
  public mappedLabItems: Array<LabTestRequisition> = [];
  public mappedImagingItems: Array<ImagingItemRequisition> = [];
  public mappedPrescriptionItems: Array<PHRMPrescriptionItem> = [];
  //public DiagnosisVM: DiagnosisOrderVM = new DiagnosisOrderVM();

  patientVisitId: number;

  public selectedPatient: any;
  public showDischargeSummaryAdd = false;
  public showDischargeSummaryView = false;
  public dischargeNote: any = null;
  public selectedNoteType: any = null;
  public currentModule: string;
  public showPrescriptionNote: boolean = false;

  constructor(public visitService: VisitService,
    public msgBoxServ: MessageboxService,
    public router: Router,
    public coreService: CoreService, public ordServ: OrderService,
    public notetemplateBLService: NoteTemplateBLService,
    public visitBLService: VisitBLService,
    public doctorsBLService: DoctorsBLService,
    public routeFromService: RouteFromService,
    public securityService: SecurityService,
    public patientService: PatientService,
    public adtBlService: ADT_BLService) {

    this.pat = this.patientService.globalPatient;
    this.patVisit = this.visitService.getGlobal();
    this.date = moment().format("YYYY-MM-DD,h:mm:ss a");

    this.GetNoteTypeList()
    this.GetDoctorList();
    this.GetTemplateList();
    this.ShowPatientPreview();
    this.ordServ.LoadAllImagingItems();
    this.ordServ.LoadAllLabTests();
    this.ordServ.LoadAllMedications();
    this.ordServ.LoadAllGenericItems();
    //this.DataHold();
    this.loggedInUser = this.securityService.GetLoggedInUser();

    //get the child routes of Doctors/PatientOverviewMain from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Doctors/PatientOverviewMain");
    this.currentModule = this.securityService.currentModule;

    if (this.visitService.globalVisit.ConcludeDate) {
      this.isVisitConcluded = true;
    } else {
      this.isVisitConcluded = false;
    }
  }

  ngOnInit() {
    if (this.notetemplateBLService.NotesId != 0) {
      this.editMode = true;
      var NotesId = this.notetemplateBLService.NotesId;
      this.notetemplateBLService.GetTemplateDetailsByNotesId(NotesId)
        .subscribe(res => {
          if (res.Status == "OK") {

            this.notes = res.Results;
            this.notes.AllIcdAndOrders = [];
            this.notes.RemovedIcdAndOrders = [];
            this.notes.Date = moment(this.notes.CreatedOn).format("YYYY-MM-DD");

            if (this.notes && this.notes.SubjectiveNote && this.notes.ClinicalPrescriptionNote) {
              this.notes.ClinicalPrescriptionNote.ChiefComplaint = this.notes.SubjectiveNote.ChiefComplaint;
              this.notes.ClinicalPrescriptionNote.ReviewOfSystems = this.notes.SubjectiveNote.ReviewOfSystems;
              this.notes.ClinicalPrescriptionNote.HistoryOfPresentingIllness = this.notes.SubjectiveNote.HistoryOfPresentingIllness;
              this.notes.ClinicalPrescriptionNote.FollowUpTime = this.notes.FollowUp;
              this.notes.ClinicalPrescriptionNote.FollowUpUnit = this.notes.FollowUpUnit;
            }

            if (this.noteTypeList.length > 0) {
              this.selectedNoteType = this.noteTypeList.find(type => type.NoteTypeId == this.notes.NoteTypeId);
            }

            if (this.DoctorList.length > 0 && this.notes.SecondaryDoctorId) {
              this.selectedSecondaryDoctor = this.DoctorList.find(doc => doc.ProviderId == this.notes.SecondaryDoctorId);
              //this.AssignSelectedSecondaryDoctor();
            }
            if (this.templateList.length > 0) {
              this.selTemplateList = this.templateList.find(temp => temp.TemplateId == this.notes.TemplateId);
              //this.TemplateId = this.selTemplateList.TemplateId;
              this.SelectTemplate(this.selTemplateList.TemplateName);
            }

          }
          else {
            this.msgBoxServ.showMessage("Failed", ["Can not load notes."])
          }
        });
    }
  }

  ngOnDestroy() {
    this.notetemplateBLService.NotesId = 0;
  }

  CheckEmptyTemplateFields(templateName): boolean {
    var isFieldsEmpty: boolean = true;
    switch (templateName) {
      case "Progress Note": {
        if (this.progressnotes) {
          isFieldsEmpty = false;
        }
        break;
      }
      case "Free Text": {
        if (this.freetextnotes) {
          isFieldsEmpty = false;
        }
        break;
      }
      case "Discharge Note": {
        if (this.dischargeNote) {
          isFieldsEmpty = false;
        }
        break;
      }
      case "Procedure Note": {
        if (this.procedurenotes) {
          isFieldsEmpty = false;
        }
        break;
      }
      //case "Health & Physical": {
      //  if (this.assessmentandplanorderlist && this.assessmentandplans) {
      //    isFieldsEmpty = false;
      //  }
      //  break;
      //}      
      //case "Consult Note": {
      //  if (this.assessmentandplanorderlist && this.assessmentandplans) {
      //    isFieldsEmpty = false;
      //  }
      //  break;
      //}
      //case "Emergency Note": {
      //  if (this.assessmentandplanorderlist && this.assessmentandplans) {

      //  }
      //  break;
      //}
      default: {
        isFieldsEmpty = true;
      }
    }
    return isFieldsEmpty;
  }

  SelectTemplate(event: any) {
    var comparisionVar = "";
    if (typeof (event) == "string") {
      comparisionVar = event;
    }
    else {
      comparisionVar = event.target.value;
    }
    // console.log(event.target.value);


    switch (comparisionVar) {
      case "History & Physical": {
        this.showHandP = true;
        this.showPrescriptionNote = false;
        this.showFreeText = false;
        this.showProcedureNote = false;
        this.showProgressNote = false;
        this.showDischargeSummaryAdd = false;
        this.showDischargeSummaryView = false;
        this.showEmergencyNote = false;
        break;
      }
      case "Progress Note": {
        this.progressnotes = null;
        this.showProgressNote = true;
        this.showPrescriptionNote = false;
        this.showHandP = false;
        this.showFreeText = false;
        this.showProcedureNote = false;
        this.showEmergencyNote = false;
        this.showDischargeSummaryAdd = false;
        this.showDischargeSummaryView = false;
        break;

      } case "Free Text": {
        if (this.notetemplateBLService.NotesId == 0) {
          this.freetextnotes = null;
        }
        this.showHandP = false;
        this.showFreeText = true;
        this.showPrescriptionNote = false;
        this.showProcedureNote = false;
        this.showProgressNote = false;
        this.showEmergencyNote = false;
        this.showDischargeSummaryAdd = false;
        this.showDischargeSummaryView = false;
        break;

      } case "Discharge Note": {
        this.dischargeNote = null;
        this.showHandP = false;
        this.showFreeText = false;
        this.showPrescriptionNote = false;
        this.showProcedureNote = false;
        this.showProgressNote = false;
        this.showEmergencyNote = false;
        this.getPatientPlusBedInfo();
        break;

      } case "Emergency Note": {
        this.showPrescriptionNote = false;
        this.showHandP = false;
        this.showFreeText = false;
        this.showEmergencyNote = true;
        this.showFreeText = false;
        this.showProcedureNote = false;
        this.showProgressNote = false;
        this.showDischargeSummaryAdd = false;
        this.showDischargeSummaryView = false;

        break;

      } case "Procedure Note": {
        this.progressnotes = null;
        this.showProcedureNote = true;
        this.showPrescriptionNote = false;
        this.showHandP = false;
        this.showFreeText = false;
        this.showProgressNote = false;
        this.showEmergencyNote = false;
        this.showDischargeSummaryAdd = false;
        this.showDischargeSummaryView = false;
        break;
      }
      case "Consult Note": {
        this.showHandP = true;
        this.showPrescriptionNote = false;
        this.showFreeText = false;
        this.showProcedureNote = false;
        this.showProgressNote = false;
        this.showEmergencyNote = false;
        this.showDischargeSummaryAdd = false;
        this.showDischargeSummaryView = false;

        break;
      }
      case "Prescription Note": {
        this.notes.PatientId = this.notes.ClinicalPrescriptionNote.PatientVisitId = this.patientVisitId;
        this.notes.PatientVisitId = this.notes.ClinicalPrescriptionNote.PatientId = this.patientService.getGlobal().PatientId;
        this.showPrescriptionNote = true;
        this.showHandP = false;
        this.showFreeText = false;
        this.showProcedureNote = false;
        this.showProgressNote = false;
        this.showEmergencyNote = false;
        this.showDischargeSummaryAdd = false;
        this.showDischargeSummaryView = false;
        //also assign items for case of edit 
        break;
      }
      default: {
        this.showHandP = false;
        this.showFreeText = false;
        this.showProcedureNote = false;
        this.showProgressNote = false;
        this.showEmergencyNote = false;
        this.showDischargeSummaryAdd = false;
        this.showDischargeSummaryView = false;
        break;
      }
    }

  }

  DocListFormatter(data: any): string {
    let html = data["ProviderName"];
    return html;
  }

  TemplateListFormatter(data: any): string {
    let html = data["TemplateName"];
    return html;
  }
  public NoteTypeFormatter(data: any): string {
    return data["NoteType"];
  }

  public AssignSelectedTemplate(event: any) {
    try {

      var isFieldsEmpty: boolean;

      //var previousTemplateName = this.TemplateId ? this.templateList.find(a => a.TemplateId == this.TemplateId).TemplateName : "";

      var previousTemplateName = this.PreviouslySelectedTemplate.TemplateName ? this.PreviouslySelectedTemplate.TemplateName : " ";
      var isFieldsEmpty = this.CheckEmptyTemplateFields(previousTemplateName);
      if (isFieldsEmpty) {
        //this.TemplateId = this.selTemplateList.TemplateId;
        this.PreviouslySelectedTemplate = this.selTemplateList;
        this.SelectTemplate(event.TemplateName);
      } else {
        var view: boolean;
        view = window.confirm("Do you want to Change Template? This will discard your current changes!")
        if (view) {

          this.PreviouslySelectedTemplate = this.selTemplateList;
          //this.TemplateId = this.selTemplateList.TemplateId;
          this.SelectTemplate(event.TemplateName);

        } else {
          this.selTemplateList = this.PreviouslySelectedTemplate;
        }
      }

    } catch (ex) {
      this.ShowCatchTemplateErrMessage(ex);
    }
  }

  ShowCatchErrMessage(ex: any) {
    throw new Error("Error in loading Doctor list.");
  }

  ShowCatchTemplateErrMessage(ex: any) {
    throw new Error("Error in loading Template list.");
  }

  GetDoctorList() {
    this.visitBLService.GetVisitDoctors()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.visitService.ApptApplicableDoctorsList = res.Results;
          this.DoctorList = res.Results;
        }
      });
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
              //if (this.notetemplateBLService.NotesId != 0 && this.notes.NotesId != 0) {
              //  this.selTemplateList = this.templateList.find(temp => temp.TemplateId == this.notes.TemplateId);
              //  this.AssignSelectedTemplate();
              //  this.SelectTemplate(this.selTemplateList.TemplateName);
              //}
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

  ShowPatientPreview() {

    let patientId = this.patientService.getGlobal().PatientId;

    this.visitService.getGlobal().PatientId = patientId;
    this.patientVisitId = this.visitService.globalVisit.PatientVisitId;
    let patientVisitId = this.visitService.getGlobal().PatientVisitId;
    this.doctorsBLService.GetPatientPreview(patientId, patientVisitId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.selectVisit = res.Results;
          // this.Visittype = this.selectVisit[0].Visits;
        }
      });
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

  UpdateTemplate(value: number) {
    if (value == 1) { // 1 --> incase of Submit Button (Updated; not Created)
      var view: boolean;
      view = window.confirm("Want to Submit Note? You won't be able to edit or update note in future ! Click Save button if you want to change Note in future !");
      if (view) {
        this.notes.IsPending = false;
        this.PutTemplate();
      }
    }
    if (value == 0) { //  0 --> incase of Save Button (Updated; not Created)
      this.notes.IsPending = true;
      this.PutTemplate();
    }
  }


  PostTemplate() {
    this.notes.ClinicalPrescriptionNote.PatientId = this.patVisit.PatientId;
    this.notes.ClinicalPrescriptionNote.PatientVisitId = this.patVisit.PatientVisitId;
    this.notes.TemplateId = this.selTemplateList.TemplateId;
    this.notes.NoteTypeId = this.selectedNoteType ? this.selectedNoteType.NoteTypeId : null;
    //this.notes.WrittenBy = this.loggedInUser.UserName;
    //this.notes.TemplateName = this.templateList.find(a => a.TemplateId == this.TemplateId).TemplateName;
    this.notes.TemplateName = this.selTemplateList.TemplateName;
    this.notes.SecondaryDoctorId = this.selectedSecondaryDoctor ? this.selectedSecondaryDoctor.ProviderId : null;
    this.notes.ProviderId = this.patVisit.ProviderId ? this.patVisit.ProviderId : 0;

    this.notes.PatientId = this.patVisit.PatientId;
    this.notes.PatientVisitId = this.patVisit.PatientVisitId;


    //Logic for posting Progress Note
    if (this.notes.TemplateId == 1 || this.notes.TemplateName == "Progress Note") {

      this.notes.ProgressNote = this.progressnotes;
      if (this.notes.IsPending) {
        this.PostProgressNote();
      } else {
        if (this.notes.ProgressNote.SubjectiveNotes != null || this.notes.ProgressNote.ObjectiveNotes != null || this.notes.ProgressNote.AssessmentPlan != null || this.notes.ProgressNote.Instructions != null) {
          this.PostProgressNote();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Submit can't be done with all fields empty !"]);
        }
      }
    }

    //Logic for posting Procedure Note
    if (this.notes.TemplateId == 7 || this.notes.TemplateName == "Procedure Note") {
      this.notes.ProcedureNote = this.procedurenotes;
      if (this.notes.IsPending) {
        this.PostProcedureNote();
      } else {
        if (this.notes.ProcedureNote.FreeText != null || this.notes.ProcedureNote.LinesProse != null || this.notes.ProcedureNote.Site != null || this.notes.ProcedureNote.Remarks != null) {
          this.PostProcedureNote();
        } else {
          this.msgBoxServ.showMessage("Failed", ["Submit can't be done with all fields empty !"]);
        }
      }
    }

    //Logic for posting FreeText Note
    if (this.notes.TemplateId == 4 || this.notes.TemplateName == "Free Text") {

      this.notes.FreeTextNote = this.freetextnotes;
      if (this.notes.IsPending) {
        this.PostFreeTextNote();
      } else {
        if (this.notes.FreeTextNote.FreeText !== null) {
          this.PostFreeTextNote();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Submit can't be done with all fields empty !"]);
        }
      }
    }

    //Logic for posting Discharge Note
    if (this.notes.TemplateId == 5 || this.notes.TemplateName == "Discharge Note") {
      this.PostDischargeSummary();
    }

    //Logic for Posting History and Physical Note
    if (this.notes.TemplateId == 2 || this.notes.TemplateName == "History & Physical") {

      if (this.notes.ClinicalDiagnosis) {
        this.MapAllOrdersAndAssign();
      }

      if (this.notes.IsPending) { // if notes are are pending then, empty fields are allowed to post 
        this.PostHistoryAndPhysical();
      } else {
        if (this.notes.SubjectiveNote && this.notes.ObjectiveNote && this.notes.AllIcdAndOrders.length > 0) {

          this.PostHistoryAndPhysical();
        } else {
          this.msgBoxServ.showMessage("Warning", ["Submit can't be done with all fields empty !"]);
        }
      }
    }

    //Logic for Posting Emergency Note
    if (this.notes.TemplateId == 6 || this.notes.TemplateName == "Emergency Note") {

      this.notes.EmergencyNote.PatientId = this.notes.PatientId;
      this.notes.EmergencyNote.PatientVisitId = this.notes.PatientVisitId;

      if (this.notes.ClinicalDiagnosis) {
        this.MapAllOrdersAndAssign();
      }
      console.log("Er-note before adding");
      if (this.notes.IsPending) { // if notes are are pending then, empty fields are allowed to post
        this.PostEmergencyNote();
      } else {
        if (this.notes.SubjectiveNote && this.notes.ObjectiveNote && this.notes.AllIcdAndOrders.length > 0) {
          this.PostEmergencyNote();
        } else {
          this.msgBoxServ.showMessage("Warning", ["Submit can't be done with fields empty !"]);
        }
      }
    }

    //Logic for Posting Prescription Note
    if (this.notes.TemplateName == "Prescription Note") {
      this.ManagePrescriptionData();

      if (this.notes.IsPending) {
        this.PostPrescriptionNote();
      } else {
        if ((this.notes.SubjectiveNote.ReviewOfSystems && this.notes.SubjectiveNote.ReviewOfSystems.trim().length)
          && (this.notes.SubjectiveNote.HistoryOfPresentingIllness && this.notes.SubjectiveNote.HistoryOfPresentingIllness.trim().length)
          && (this.notes.SubjectiveNote.ChiefComplaint && this.notes.SubjectiveNote.ChiefComplaint.trim().length)) {
          this.PostPrescriptionNote();
        } else {
          this.msgBoxServ.showMessage("Warning", ["Submit can't be done with fields empty !"]);
        }
      }
    }

  }

  PutTemplate() {

    this.notes.ClinicalPrescriptionNote.PatientId = this.patVisit.PatientId;
    this.notes.ClinicalPrescriptionNote.PatientVisitId = this.patVisit.PatientVisitId;
    this.notes.TemplateId = this.selTemplateList.TemplateId;
    this.notes.NoteTypeId = this.selectedNoteType.NoteTypeId;
    //this.notes.TemplateName = this.templateList.find(a => a.TemplateId == this.TemplateId).TemplateName;
    this.notes.TemplateName = this.selTemplateList.TemplateName;
    this.notes.SecondaryDoctorId = this.selectedSecondaryDoctor.ProviderId;

    this.notes.PatientId = this.patVisit.PatientId;
    this.notes.PatientVisitId = this.patVisit.PatientVisitId;

    if (this.notes.TemplateId == 4 || this.notes.TemplateName == "Free Text") {
      this.notes.FreeTextNote = this.freetextnotes;
      if (this.notes.IsPending) {
        this.PutFreeTextNote();
      } else {
        if (this.notes.FreeTextNote.FreeText !== null) {
          this.PutFreeTextNote();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Submit can't be done with all fields empty !"]);
        }
      }
    }

    if (this.notes.TemplateId == 7 || this.notes.TemplateName == "Procedure Note") {
      this.notes.ProcedureNote = this.procedurenotes;

      if (this.notes.IsPending) {
        this.PutProcedureNote();
      } else {
        if (this.notes.ProcedureNote.FreeText != null || this.notes.ProcedureNote.LinesProse != null || this.notes.ProcedureNote.Site != null || this.notes.ProcedureNote.Remarks != null) {
          this.PutProcedureNote();
        } else {
          this.msgBoxServ.showMessage("Failed", ["Submit can't be done with all fields empty !"]);
        }
      }
    }

    if (this.notes.TemplateId == 1 || this.notes.TemplateName == "Progress Note") {
      this.notes.ProgressNote = this.progressnotes;

      if (this.notes.IsPending) {
        this.PutProgressNote();
      } else {
        if (this.notes.ProgressNote.SubjectiveNotes && this.notes.ProgressNote.ObjectiveNotes && this.notes.ProgressNote.AssessmentPlan && this.notes.ProgressNote.Instructions) {
          this.PutProgressNote();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Submit can't be done with all fields empty !"]);
        }
      }
    }

    if (this.notes.TemplateId == 5 || this.notes.TemplateName == "Discharge Note") {
      if (this.notes.IsPending == false) {
        this.dischargeNote.IsSubmitted = true;
      }
      this.notes.DischargeSummaryNote = this.dischargeNote;
      this.PutDischargeSummary();
    }

    if (this.notes.TemplateId == 2 || this.notes.TemplateName == "History & Physical") {
      //this.msgBoxServ.showMessage("Warning", ["Update of History and physical is work in progress !"]);

      if (this.notes.ClinicalDiagnosis) {
        this.MapAllOrdersAndAssign();
      }

      if (this.notes.IsPending) { // if notes are are pending then, empty fields are allowed to post 
        this.PutHistoryAndPhysicalNote();
      } else {
        if (this.notes.SubjectiveNote && this.notes.ObjectiveNote && this.notes.AllIcdAndOrders.length > 0) {

          this.PutHistoryAndPhysicalNote();
        } else {
          this.msgBoxServ.showMessage("Warning", ["Submit can't be done with all fields empty !"]);
        }
      }

    }
    if (this.notes.TemplateId == 6 || this.notes.TemplateName == "Emergency Note") {

      this.notes.EmergencyNote.PatientId = this.patVisit.PatientId;
      this.notes.EmergencyNote.PatientVisitId = this.patVisit.PatientVisitId;

      if (this.notes.ClinicalDiagnosis) {
        this.MapAllOrdersAndAssign();
      }
      console.log("note before updating Er-note");
      console.log(this.notes);
      if (this.notes.IsPending) { // if notes are pending then, empty fields are allowed to post
        this.PutEmergencyNote();
      } else {
        if (this.notes.SubjectiveNote && this.notes.ObjectiveNote && this.notes.AllIcdAndOrders.length > 0) {
          this.PutEmergencyNote();
        } else {
          this.msgBoxServ.showMessage("Warning", ["Submit can't be done with fields empty !"]);
        }
      }
    }

    if (this.notes.TemplateName == "Prescription Note") {
      this.ManagePrescriptionData();

      if (this.notes.IsPending) {
        this.PutPrescriptionNote();
      } else {
        if ((this.notes.SubjectiveNote.ReviewOfSystems && this.notes.SubjectiveNote.ReviewOfSystems.trim().length)
          && (this.notes.SubjectiveNote.HistoryOfPresentingIllness && this.notes.SubjectiveNote.HistoryOfPresentingIllness.trim().length)
          && (this.notes.SubjectiveNote.ChiefComplaint && this.notes.SubjectiveNote.ChiefComplaint.trim().length)) {
          this.PutPrescriptionNote();
        } else {
          this.msgBoxServ.showMessage("Warning", ["Submit can't be done with fields empty !"]);
        }
      }
    }
  }


  public ManagePrescriptionData() {
    this.notes.ClinicalPrescriptionNote.PatientId = this.patVisit.PatientId;
    this.notes.ClinicalPrescriptionNote.PatientVisitId = this.patVisit.PatientVisitId;
    this.notes.ClinicalPrescriptionNote.OrdersSelected = JSON.stringify(this.notes.ClinicalPrescriptionNote.SelectedOrderItems);
    this.notes.ClinicalPrescriptionNote.ICDSelected = JSON.stringify(this.notes.ClinicalPrescriptionNote.ICDList);

    this.notes.FollowUp = this.notes.ClinicalPrescriptionNote.FollowUpTime;
    this.notes.FollowUpUnit = this.notes.ClinicalPrescriptionNote.FollowUpUnit;

    this.notes.SubjectiveNote.PatientId = this.notes.PatientId;
    this.notes.SubjectiveNote.PatientVisitId = this.notes.PatientVisitId;
    this.notes.SubjectiveNote.ReviewOfSystems = this.notes.ClinicalPrescriptionNote.ReviewOfSystems;
    this.notes.SubjectiveNote.HistoryOfPresentingIllness = this.notes.ClinicalPrescriptionNote.HistoryOfPresentingIllness;
    this.notes.SubjectiveNote.ChiefComplaint = this.notes.ClinicalPrescriptionNote.ChiefComplaint;
  }

  //Post function handling Clinical Prescription Note
  public PostPrescriptionNote() {
    this.notetemplateBLService.PostClinicalPrescriptionNoteTemplate(this.notes)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", ["Clinical Prescripiton Note Template added."]);
          this.RouteToViewNotes();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Error in Clinical Prescripiton Note Template"]);
        }
      });
  }

  //Post function handling Progress Note
  public PostProgressNote() {
    this.notetemplateBLService.PostProgressNoteTemplate(this.notes)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", ["Progress Note Template added."]);
          this.RouteToViewNotes();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Error in Posting Progress Note Template"]);
        }
      });
  }

  //Post function handling FreeText Note
  public PostFreeTextNote() {
    this.notetemplateBLService.PostFreetextNoteTemplate(this.notes)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", ["Free Text Template added."]);
          this.RouteToViewNotes();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Error in Posting Free Text Template"]);
        }
      });
  }

  //Post function handling Procedure Note
  public PostProcedureNote() {
    this.notetemplateBLService.PostProcedureNoteTemplate(this.notes)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", [" Procedure Note Template added."]);
          this.RouteToViewNotes();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Error in Posting Procedure Note Template"]);
        }
      });
  }

  //Post function handling Discharge Note
  public PostDischargeSummary() {

    if (this.notes.IsPending == false) {
      this.dischargeNote.IsSubmitted = true;
    }

    this.notes.DischargeSummaryNote = this.dischargeNote;
    this.notetemplateBLService.PostDischargeSummary(this.notes)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            this.showDischargeSummaryAdd = false;
            this.RouteToViewNotes();
            this.msgBoxServ.showMessage("success", ["Discharge Summary Saved"]);

          }
          else {
            this.msgBoxServ.showMessage("failed", ["Check log for errors"]);
            console.log(res.ErrorMessage);
          }
        },
        err => {
          console.log(err);

        });
  }

  //Post function handling History and Physical Note
  public PostHistoryAndPhysical() {

    this.notetemplateBLService.PostHistoryAndPhysicalNoteTemplate(this.notes)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", [" History and Physical Note Template added."]);
          this.RouteToViewNotes();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Error in Posting History and Physical Note Template"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  //Post function handling Emergency Note
  public PostEmergencyNote() {
    this.notetemplateBLService.PostEmergencyNoteTemplate(this.notes)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", ["Emergency Note added."]);
          this.RouteToViewNotes();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Error in Posting Emergency Note"]);
        }
      });
  }

  //Put function handling Discharge Note
  public PutDischargeSummary() {
    this.notetemplateBLService.PutDischargeNoteTemplateByNotesId(this.notes)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", ["Discharge Note Template Updating."]);
          this.RouteToViewNotes();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Error in Updating Discharge Note Template"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  //Put function handling Free Text Note
  public PutFreeTextNote() {
    this.notetemplateBLService.PutFreetextNoteTemplateByNotesId(this.notes)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", [" Free Text Template Update."]);
          this.RouteToViewNotes();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Error in Update Free Text Template"]);
          console.log(res.ErrorMessage);

        }
      });
  }

  //Put function handling Procedure Note
  public PutProcedureNote() {
    this.notetemplateBLService.PutProcedureNoteTemplateByNotesId(this.notes)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", [" Procedure Note Template Update."]);
          this.RouteToViewNotes();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Error while Updating Procedure NoteTemplate"]);
          console.log(res.ErrorMessage);
        }

      });
  }

  //Put function handling Progress Note
  public PutProgressNote() {
    this.notetemplateBLService.PutProgressNoteTemplateByNotesId(this.notes)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", ["Progress Note Template added."]);
          this.RouteToViewNotes();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Error while updating Progress Note Template"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  //Put function handling Emergency Note
  public PutEmergencyNote() {

    this.notetemplateBLService.PutEmergencyNoteTemplate(this.notes)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", ["Emergency Note Saved."]);
          this.RouteToViewNotes();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Error while Saving Emergency Note"]);
          console.log(res.ErrorMessage);
        }
      });

  }

  //Put function handling Emergency Note
  public PutHistoryAndPhysicalNote() {

    this.notetemplateBLService.PutHistoryAndPhysicalNote(this.notes)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", ["History and Physical Note Saved !"]);
          this.RouteToViewNotes();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Error while Saving Emergency Note !"]);
          console.log(res.ErrorMessage);
        }
      });

  }

  public PutPrescriptionNote() {
    this.notetemplateBLService.PutPrescriptionNote(this.notes)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("Success", ["History and Physical Note Saved !"]);
          this.RouteToViewNotes();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Error while Saving Emergency Note !"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  RouteToViewNotes() {
    if (this.currentModule == 'doctor') {
      this.router.navigate(['/Doctors/PatientOverviewMain/NotesSummary']);
    } else if (this.currentModule == 'nursing') {
      this.router.navigate(['/Nursing/PatientOverviewMain/Notes']);
    }

  }

  BackToViewNotes() {
    var isFieldsEmpty = this.CheckEmptyTemplateFields(this.selTemplateList.TemplateName);
    if (isFieldsEmpty) {
      if (this.currentModule == 'doctor') {
        this.router.navigate(['/Doctors/PatientOverviewMain/NotesSummary']);
      } else if (this.currentModule == 'nursing') {
        this.router.navigate(['/Nursing/PatientOverviewMain/Notes']);
      }
    } else {
      var view: boolean;
      view = window.confirm("Unsaved changes will be discarded! Do you want to continue ?");
      if (view) {
        if (this.currentModule == 'doctor') {
          this.router.navigate(['/Doctors/PatientOverviewMain/NotesSummary']);
        } else if (this.currentModule == 'nursing') {
          this.router.navigate(['/Nursing/PatientOverviewMain/Notes']);
        }
      }
    }
  }

  CallBackProcedureNotes($event) {
    this.procedurenotes = $event.procedurenote;
    console.log(this.procedurenotes);

  }

  CallBackFreeTexts($event) {
    this.freetextnotes = $event.freetexts;
    this.notes.FreeTextNote = this.freetextnotes;
    console.log(this.freetextnotes);

  }

  CallBackProgressNotes($event) {
    this.progressnotes = $event.progressnote;
    console.log(this.progressnotes);
  }


  CallBackDischargeTemplate(data) {
    this.dischargeNote = data;
    console.log(this.dischargeNote);
  }

  CallBackEmergencyNoteTemplate(data) {
    this.notes.EmergencyNote = data.EmergencyNote;
    this.notes.SubjectiveNote = data.SubjectiveNote;
    this.notes.ObjectiveNote = data.ObjectiveNote;
    this.notes.ClinicalDiagnosis = data.ClinicalDiagnosis;
    this.notes.FollowUp = data.FollowUp;
    this.notes.FollowUpUnit = data.FollowUpUnit;
    this.notes.Remarks = data.Remarks;

    //console.log(this.notes.EmergencyNote);
  }
  CallBackHistoryAndPhysical(data) {
    this.notes.SubjectiveNote = data.SubjectiveNote;
    this.notes.ObjectiveNote = data.ObjectiveNote;
    this.notes.ClinicalDiagnosis = data.ClinicalDiagnosis;
    this.notes.FollowUp = data.FollowUp;
    this.notes.FollowUpUnit = data.FollowUpUnit;
    this.notes.Remarks = data.Remarks;
  }

  getPatientPlusBedInfo() {
    this.adtBlService.GetPatientPlusBedInfo(this.pat.PatientId, this.patVisit.PatientVisitId).subscribe(res => {
      if (res.Status == "OK" && res.Results.length != 0) {
        this.selectedPatient = res.Results[0];

        if (this.selectedPatient) {
          console.log(this.selectedPatient.IsSubmitted);
          console.log(this.selectedPatient.IsPending);
          if (!this.selectedPatient.IsSubmitted) { // if (IsSubmitted==false)
            if (this.selectedPatient.IsPending) {
              this.editMode = true;
            } else {
              this.editMode = false;
            }
            this.showDischargeSummaryView = false;
            this.showDischargeSummaryAdd = true;
          }
          else { // else, discharge note has been submitted
            this.editMode = false;
            this.showDischargeSummaryAdd = false;
            this.msgBoxServ.showMessage("Warning", ["Discharge note is already Finalized !! You can only view it !"]);
            this.RouteToViewNotes();
          }
        } else {
          this.msgBoxServ.showMessage("Warning", ["Patient is not admitted!"]);
        }
      }
    });
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




}
