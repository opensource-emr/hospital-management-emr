import { Component, Output, EventEmitter, Input } from "@angular/core";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { VisitService } from '../../../appointments/shared/visit.service';
import { Visit } from '../../../appointments/shared/visit.model';
import { Patient } from "../../../patients/shared/patient.model";
import { PatientService } from "../../../patients/shared/patient.service";
import * as moment from 'moment/moment';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { VisitBLService } from "../../../appointments/shared/visit.bl.service";
import { CoreService } from "../../../core/shared/core.service";
import { Department } from "../../../settings-new/shared/department.model";
import { NotesModel } from "../../shared/notes.model";
import { PatientClinicalDetail } from "../../../clinical/shared/patient-clinical-details.vmodel";
import { DanpheCache, MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";
import { ICD10 } from "../../../clinical/shared/icd10.model";
import { NoteTemplateBLService } from "../../shared/note-template.bl.service";
import { AssessmentAndPlanModel, DiagnosisOrderVM } from "../../shared/assessment-and-plan.model";
import { PatientOrderListModel } from "../../../clinical/shared/order-list.model";

@Component({
  selector: "emergency-note",
  templateUrl: "./emergency-note.html",
})

export class EmergencyNoteComponent {
  public pat: Patient = new Patient();
  public patVisit: Visit = new Visit();
  public departmentList: Array<Department>;
  public date: string = null;
  public selectedDepartment: any = null;//sud:12Apr'20-added to resolve prod build issue.
  public notes: NotesModel = new NotesModel();
  public FollowUp = {
    Number: 0,
    Unit: 'Days',
  }
  public clinicalDetail: PatientClinicalDetail = new PatientClinicalDetail();
  public assessmentandplans: any;
  public assessmentandplanorderlist: any;
  public ICD10List: ICD10;
  public icd10Selected: any;

  @Output()
  public outPutErNote: EventEmitter<Object> = new EventEmitter<Object>();  
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
    this.getDepts();
    this.GetICDList();
  }
  @Input('editErNote')
  public set ErNote(erNote: any) {
    if (this.notetemplateBLService.NotesId != 0) {
      //this.editMode = true;
      this.notes = erNote;
      console.log(this.notes);

      // assign department
      if (this.notes.EmergencyNote.DispositionDepartmentId) {
        this.departmentList = this.visitService.ApptApplicableDepartmentList;
        this.selectedDepartment = this.departmentList.find(f => f.DepartmentId == this.notes.EmergencyNote.DispositionDepartmentId);
      }      

      // get assessment orders
      this.GetAllOrders(this.notes.NotesId);
      this.APeditMode = true;
      this.showSOnotes = true;

    } else {
      this.showSOnotes = true;
      this.showAP = true;
    }
  }

  getDepts() {
    this.visitBLService.GetDepartment()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.visitService.ApptApplicableDepartmentList = res.Results;
          this.visitService.ApptApplicableDepartmentList = this.coreService.Masters.Departments.filter(d => d.IsAppointmentApplicable == true && d.IsActive == true).map(d => {
            return {
              DepartmentId: d.DepartmentId,
              DepartmentName: d.DepartmentName
            };
          });
        }

      });
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


  public AssignSelectedDepartment() {
    this.departmentList = this.visitService.ApptApplicableDepartmentList;
  }

  myDepartmentListFormatter(data: any): string {
    let html = data["DepartmentName"];
    return html;
  }
  public AssignDispositionDepartment() {
    this.notes.EmergencyNote.DispositionDepartmentId = this.selectedDepartment.DepartmentId;
  }
 
  FocusOut() {
    //console.log(this.notes.EmergencyNote);
    this.outPutErNote.emit(this.notes);
  }

  CallBackSubjective($event) {
    this.notes.SubjectiveNote = $event.subjectivenote;
    //console.log(this.notes.EmergencyNote.SubjectiveNote);
    this.outPutErNote.emit(this.notes);
  }

  CallBackObjective($event) {
    this.notes.ObjectiveNote = $event.objectivenote;
    //console.log(this.notes.EmergencyNote.ObjectiveNote);
    this.outPutErNote.emit(this.notes);
  }

  CallBackAssesmentAndPlan(data) {

    console.log("in er-note, assessment orders callback:");
    console.log(data);
    this.notes.ClinicalDiagnosis = data;
    this.outPutErNote.emit(this.notes);
  }

}



