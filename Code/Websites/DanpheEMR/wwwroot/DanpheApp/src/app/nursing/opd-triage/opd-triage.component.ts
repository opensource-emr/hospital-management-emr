import { Component, Output, EventEmitter, Input, ChangeDetectorRef } from "@angular/core";
import { NoteTemplateBLService } from "../../clinical-notes/shared/note-template.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { NotesModel } from "../../clinical-notes/shared/notes.model";
import { ADT_BLService } from "../../adt/shared/adt.bl.service";
import { NursingBLService } from "../shared/nursing.bl.service";
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { NepaliDate } from "../../shared/calendar/np/nepali-dates";
import { CoreService } from "../../core/shared/core.service";
import * as moment from "moment";
import { viewAttached } from "@angular/core/src/render3/instructions";
import { PatientService } from "../../patients/shared/patient.service";
import { VisitService } from "../../appointments/shared/visit.service";

@Component({
  selector: "opd-triage",
  templateUrl: "./opd-triage.html",
  styles: [`.single-complaint{margin-bottom: 15px;} textarea{border-radius: 3px !important;
    padding: 3px 7px !important;
    font-size: 12px !important;
    font-family: 'Quicksand','Open Sans', sans-serif !important;
    border: 1px solid #ccc;}`]
})
export class OPDTriageComponent {
  @Output("opdTriagedCallback")
  public emitter: EventEmitter<Object> = new EventEmitter<Object>();

  @Input("currentPatInfo") public currentPatInfo: any;

  @Input("isEditMode") public isEdit: boolean = false;

  public chiefComplaints: Array<ComplaintsModel> = [];

  public comments: ComplaintsModel = new ComplaintsModel();

  public complainsList: Array<ComplaintsModel> = [];
  public loading: boolean = false;

  public patId: number;
  public patVisitId: number;

  constructor(
    public notetemplateBLService: NoteTemplateBLService, public patientService: PatientService,
    public visitService: VisitService,
    public msgBoxServ: MessageboxService, public coreService: CoreService,
    public nursingBlService: NursingBLService, public changeDetector: ChangeDetectorRef) {

    this.patId = this.patientService.globalPatient.PatientId;
    this.patVisitId = this.visitService.globalVisit.PatientVisitId;
    this.comments.PatientId = this.patId;
    this.comments.PatientVisitId = this.patVisitId;

  }

  ngOnInit() {
    if (this.isEdit) {
      this.nursingBlService.GetComplaints(this.patVisitId)
        .subscribe(res => {
          if (res.Status = "OK") {
            for (var i = 0; i < res.Results.length; i++) {
              if (res.Results[i].KeyName == "chief-complaint") {
                this.chiefComplaints.push(res.Results[i]);
              } else if (res.Results[i].KeyName == "opd-triage-comments") {
                this.comments = res.Results[i];
              }
            }
          } else {
            this.msgBoxServ.showMessage("failed to load data", [res.ErrorMessage]);
          }
        });
    } else {
      this.AddNewComplaintRow();
      this.comments.KeyName = 'opd-triage-comments';
      this.comments.IsActive = true;
      this.patId = this.patientService.globalPatient.PatientId;
      this.patVisitId = this.visitService.globalVisit.PatientVisitId;
    }
  }

  AddNewComplaintRow() {
    let complain = new ComplaintsModel();
    complain.KeyName = "chief-complaint";
    complain.IsActive = true;
    complain.PatientId = this.patId;
    complain.PatientVisitId = this.patVisitId;
    this.chiefComplaints.push(complain);
  }

  removeComplaint(ind: number) {
    if (this.chiefComplaints.length > 1) {
      this.chiefComplaints.splice(ind, 1);
      this.chiefComplaints.slice();
    }
  }

  public GetAllVitals($event) {
    let allVitals = $event.vitalsList;
    let currentDateTime = moment();
    let vitalCreated;
    let diff = 0;
  }

  public GetAllAllergy($event) {
    let allAllergy = $event.allergieLists;
  }

  public discard() {
    this.emitter.emit({ isSubmitted: false, data: null });
  }

  public triage() {
    this.loading = true;
    let isValid = this.checkIfDataIsValid();

    if (isValid) {
      this.comments.Value = this.comments.Value.trim();
      if (this.comments.Value.length) {
        this.chiefComplaints.push(this.comments);
      }

      if (!this.isEdit) {
        //server call to add the chiefComplaints and comments
        this.nursingBlService.AddComplaints(this.chiefComplaints)
          .subscribe((res) => {
            if (res.Status == "OK") {
              console.log(res.Results);
              this.msgBoxServ.showMessage("success", ['Chief Complaint Added Successfully']);
              this.emitter.emit({ isSubmitted: true, data: this.chiefComplaints })
            } else {
              this.msgBoxServ.showMessage("error", ['Please enter atleast one Chief Complaint']);
            }
          });
        //this.msgBoxServ.showMessage("success", ['Chief Complaint Added Successfully']);
        //this.emitter.emit({ isSubmitted: true, data: this.chiefComplaints })
      } else {
        //server call to update the chiefComplaints and comments
        this.nursingBlService.UpdateClinicalInfo(this.patId, this.patVisitId, this.chiefComplaints)
          .subscribe((res) => {
            if (res.Status == "OK") {              
              this.msgBoxServ.showMessage("success", ['Chief Complaint Updated Successfully']);
              this.emitter.emit({ isSubmitted: true, data: this.chiefComplaints });
            } else {
              this.msgBoxServ.showMessage("error", ['Couldnot update complaint']);
              this.loading = false;
            }
          });
        // this.nursingBlService.UpdateClinicalInfo()
        //this.msgBoxServ.showMessage("success", ['Chief Complaint Updated Successfully']);
        
      }

    } else {
      this.msgBoxServ.showMessage("error", ['Please enter atleast one Chief Complaint']);
      this.loading = false;
    }
  }

  checkIfDataIsValid() {
    let isValid = false;
    this.chiefComplaints.map(c => {
      if (c.Value && c.Value.length) {
        c.Value = c.Value.trim();
      }
      if (c.Value && c.Value.length) {
        isValid = true;        
      }
    });


    return isValid;
  }

}




export class ComplaintsModel {
  public InfoId: number = 0;
  public PatientId: number;
  public PatientVisitId: number;
  public CreatedBy: number;
  public CreatedOn: string;
  public ModifiedBy: number;
  public ModifiedOn: string;
  public IsActive: boolean;
  public KeyName: string = "";
  public Value: string = "";
}

