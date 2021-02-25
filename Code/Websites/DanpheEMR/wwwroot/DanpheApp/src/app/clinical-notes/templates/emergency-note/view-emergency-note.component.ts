import { Component, OnInit, OnDestroy } from "@angular/core";
import { NoteTemplateBLService } from "../../shared/note-template.bl.service";


@Component({
  selector: "view-emergency-note",
  templateUrl: "./view-emergency-note.html"
})

export class ViewEmergencyNoteComponent implements OnInit, OnDestroy {
  public note: any = null;
  public emergencyNote: any = null;
  public subjectiveNote: any = null;
  public objectiveNote: any = null;
  public diagnosisOrderList: Array<any> = null;
  constructor(public noteTemplateBLService: NoteTemplateBLService) {

  }

  ngOnInit() {
    if (this.noteTemplateBLService.NotesId > 0) {
      this.noteTemplateBLService.GetEmergencyNoteById(this.noteTemplateBLService.NotesId).
        subscribe((res) => {

          if (res.Status == "OK" && res.Results) {
            this.note = res.Results;
            this.subjectiveNote = this.note.SubjectiveNote;
            this.objectiveNote = this.note.ObjectiveNote;
            this.diagnosisOrderList = this.note.DiagnosisOrdersList;
            this.emergencyNote = this.note.EmergencyNote;
            console.log(this.note);
            console.log(this.diagnosisOrderList);
          }
        });
    }
  }

  ngOnDestroy() {
    this.noteTemplateBLService.NotesId = 0;
  }
}



