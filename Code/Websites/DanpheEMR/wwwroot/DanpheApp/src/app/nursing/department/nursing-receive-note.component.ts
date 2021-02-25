import { Component, Output, EventEmitter, Input } from "@angular/core";
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

@Component({
  selector: "nursing-receive-note",
  templateUrl: "./nursing-receive-note.html",
})
export class NursingReceiveNoteComponent {

  //public patientData: any;
  public note: NotesModel = new NotesModel();
  public selTemplateList: any;
  public selectedNoteType: any;

  public currentPatInfo: any;
  public currentWardBedInfo: any;
  public previousWardBedInfo: any;

  public receivedDateEn: any;
  public bufferTimeForReceivedOn: number;
  public vitalsEntered: boolean = false;
  public validVitalsEntryTimeFrame: number;


  constructor(
    public notetemplateBLService: NoteTemplateBLService,
    public adtBlService: ADT_BLService, public npCalendarService: NepaliCalendarService,
    public msgBoxServ: MessageboxService, public coreService: CoreService,
    public nursingBlService: NursingBLService) {

    this.GetNoteTypeList();
    this.SetReceivedOnToCurrentDateTime();
    this.bufferTimeForReceivedOn = this.coreService.GetBufferTimeForReceivedOn();
    this.validVitalsEntryTimeFrame = this.coreService.GetTimeFrameForPatReceiveVitalsEntry();

  }
  @Input("currentBedInfo")
  public set setCurrentBedInfo(data) {
    this.currentPatInfo = data;
    this.GetADTWardPlusBedInfo();
  }

  @Output("receiveNoteCallback")
  public emiter: EventEmitter<Object> = new EventEmitter<Object>();


  public GetADTWardPlusBedInfo() {

    this.adtBlService.GetAdmissionHistory(this.currentPatInfo.PatientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          var data: any = res.Results;
          var rightVisit: any = data.find(a => a.PatientVisitId == this.currentPatInfo.PatientVisitId);

          //BedInformations array is in descending order(date) i.e. current ward and bed info -> index 0
          // index 1 is the previous ward and bed... if there are more than 1
          var currentAction = rightVisit.BedInformations[0].Action;
          if (rightVisit.BedInformations[0].WardId == this.currentPatInfo.BedInformation.WardId && currentAction != 'cancel') {

            this.currentWardBedInfo = rightVisit.BedInformations[0];

            if (rightVisit.BedInformations.length > 1 && currentAction == "transfer") {
              this.previousWardBedInfo = rightVisit.BedInformations[1];

            } else { // currentAction = admission
              this.previousWardBedInfo = null;
            }
          }
        }
      });
  }

  public GetAllVitals($event) {
    let allVitals = $event.vitalsList;
    let currentDateTime = moment();
    let vitalCreated;
    let diff = 0;

    if (allVitals && allVitals.length) {
      allVitals.forEach(v => {
        vitalCreated = moment(v.CreatedOn);
        diff = currentDateTime.diff(vitalCreated, 'minutes');
        console.log(diff);
        if (diff < this.validVitalsEntryTimeFrame) {
          this.vitalsEntered = true;
        }
      });      
    } else {
      this.vitalsEntered = false;
    }   
  }


  //public GetNoteTypeList() {
  //  try {
  //    this.notetemplateBLService.GetNoteTypeList().subscribe((res) => {
  //      if (res.Status == "OK") {
  //        if (res.Results.length) {
  //          var noteTypeList: any = res.Results;
  //          if (noteTypeList.length > 0) {
  //            this.selectedNoteType = noteTypeList.find(
  //              (a) => a.NoteType == "Receive Note"
  //            );
  //          }
  //        } else {
  //          console.log(res.ErrorMessage);
  //        }
  //      }
  //    });
  //  } catch (exception) {
  //    this.msgBoxServ.showMessage("Error", [exception]);
  //  }
  //}

  public GetNoteTypeList() {
    try {
      this.nursingBlService.GetNoteTypeList().subscribe((res) => {
        if (res.Status == "OK") {
          if (res.Results.length) {
            var noteTypeList: any = res.Results;
            if (noteTypeList.length > 0) {
              this.selectedNoteType = noteTypeList.find(
                (a) => a.NoteType == "Receive Note"
              );
            }
          } else {
            console.log(res.ErrorMessage);
          }
        }
      });
    } catch (exception) {
      this.msgBoxServ.showMessage("Error", [exception]);
    }
  }

  public SubmitReceiveNote() {
    let valMsg = {isValid: true, invalidMsg: []};
    if (!this.vitalsEntered) {
      valMsg.isValid = false;
      valMsg.invalidMsg.push("Vitals not Taken. You cannot proceed without adding Vitals !!");
    }
    if (!this.note || !this.note.FreeTextNote || !this.note.FreeTextNote.FreeText
      || !this.note.FreeTextNote.FreeText.trim() || !this.note.FreeTextNote.FreeText.trim().length) {
      valMsg.isValid = false;
      valMsg.invalidMsg.push("Receive Note is Mandatory !!");
    }


    if (valMsg.isValid) {
      this.note.TemplateId = 4;
      this.note.NoteTypeId = this.selectedNoteType
        ? this.selectedNoteType.NoteTypeId
        : 8;

      this.note.TemplateName = "Free Text";

      this.note.ProviderId = this.currentPatInfo.AdmittingDoctorId;
      this.note.PatientId = this.currentPatInfo.PatientId;
      this.note.PatientVisitId = this.currentPatInfo.PatientVisitId;

      this.note.FreeTextNote.PatientId = this.currentPatInfo.PatientId;
      this.note.FreeTextNote.PatientVisitId = this.currentPatInfo.PatientVisitId;
      if (this.note.ReceivedOn && moment().diff(moment(this.note.ReceivedOn), 'minutes') < this.bufferTimeForReceivedOn) {
        this.UpdateReceivedStatus();
      } else {
        this.msgBoxServ.showMessage('error', ['You have entered past day that is long ago and cannot be allowed. Please enter valid ReceivedOn DateTime']);
        return;
      }
    } else {
      this.msgBoxServ.showMessage("Warning", valMsg.invalidMsg);
    }
  } 

  public UpdateReceivedStatus() {
    this.nursingBlService
      .PostPatientReceivedStatus(this.note)
      .subscribe((res) => {
        if (res.Status == "OK") {
          this.emiter.emit(true);
          this.msgBoxServ.showMessage("Success", ["Receive Note added !"]);
        } else {
          this.msgBoxServ.showMessage("Failed", [
            "Error in Posting Receive Note Template",
          ]);
        }
      });
  }

  Discard() {
    this.emiter.emit(true);
  }

  NepCalendarOnDateChange() {
    let diffInMin = moment().diff(moment(this.note.ReceivedOn), 'minutes');
    if (diffInMin > this.bufferTimeForReceivedOn) {
      this.msgBoxServ.showMessage('error', ['You have entered past day that is long ago and cannot be allowed. Please enter valid ReceivedOn DateTime']);
      this.note.ReceivedOn = null;
      return false;
    }
    if (diffInMin < 0 && diffInMin <= -5) {
      this.msgBoxServ.showMessage('error', ['You have entered future date/time..Future date/time is not allowed']);
      this.note.ReceivedOn = null;
      return false;
    }
    return true;
  }

  SetReceivedOnToCurrentDateTime() {
    this.note.ReceivedOn = moment().format("YYYY-MM-DD HH:mm");
    this.receivedDateEn = this.note.ReceivedOn;
  }

  public onChangeEditorData(data) {
    this.note.FreeTextNote.FreeText = data;
  }

}
