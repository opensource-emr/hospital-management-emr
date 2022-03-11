import { Component, Output, EventEmitter, Input } from "@angular/core";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { VisitService } from '../../../appointments/shared/visit.service';
import { Visit } from '../../../appointments/shared/visit.model';
import { Patient } from "../../../patients/shared/patient.model";
import { PatientService } from "../../../patients/shared/patient.service";
import * as moment from 'moment/moment';
import { VisitBLService } from "../../../appointments/shared/visit.bl.service";
import { CoreService } from "../../../core/shared/core.service";
import { NotesModel } from "../../shared/notes.model";
import { PatientClinicalDetail } from "../../../clinical/shared/patient-clinical-details.vmodel";
import { NoteTemplateBLService } from "../../shared/note-template.bl.service";
import { AssessmentAndPlanModel, DiagnosisOrderVM } from "../../shared/assessment-and-plan.model";
import { PatientOrderListModel } from "../../../clinical/shared/order-list.model";

@Component({
  selector: "history-and-physical-note",
  templateUrl: "./history-and-physical-note.html",
})

export class HistoryAndPhsicalNoteComponent {
  public pat: Patient = new Patient();
  public patVisit: Visit = new Visit();
  public date: string = null;
  public selectedDepartment: any = null;
  public notes: NotesModel = new NotesModel();
  public FollowUp = {
    Number: 0,
    Unit: 'Days',
  }
  public clinicalDetail: PatientClinicalDetail = new PatientClinicalDetail();

  @Output()
  public outPutHpNote: EventEmitter<Object> = new EventEmitter<Object>();  
  public assessment: AssessmentAndPlanModel = new AssessmentAndPlanModel();
  public showAP: boolean = false;
  public APeditMode: boolean = false;
  public assessmentForEdit: any;
  public showSOnotes: boolean = false;

  constructor(public visitService: VisitService,
    public visitBLService: VisitBLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public notetemplateBLService: NoteTemplateBLService,
    public patientService: PatientService) {
    this.pat = this.patientService.globalPatient;
    this.patVisit = this.visitService.globalVisit,
    this.date = moment().format("YYYY-MM-DD,h:mm:ss a");

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
              //Order.Route = med.Route;
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

  CallBackObjective($event) {
    this.notes.ObjectiveNote = $event.objectivenote;
    //console.log(this.notes.EmergencyNote.ObjectiveNote);
    this.outPutHpNote.emit(this.notes);
  }

  CallBackAssesmentAndPlan(data) {
    console.log("from assessment orders:");
    console.log(data);
    this.notes.ClinicalDiagnosis = data;
    this.outPutHpNote.emit(this.notes); 
  }

}



