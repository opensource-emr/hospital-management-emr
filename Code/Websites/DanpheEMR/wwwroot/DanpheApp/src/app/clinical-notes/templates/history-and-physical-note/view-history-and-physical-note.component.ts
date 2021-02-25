import { Component, OnInit, OnDestroy } from "@angular/core";
import { NoteTemplateBLService } from "../../shared/note-template.bl.service";

//@Component({
//  selector: "view-history-and-physical-note",
//  templateUrl: "./view-history-and-physical-note.html",
//})

@Component({
  selector: "view-history-and-physical-note",
  templateUrl: "./view-history-and-physical-note.html"
})

export class ViewHistoryAndPhysicalNoteComponent implements OnInit, OnDestroy {
  public hpNote: any=null;
  public subjectiveNote: any=null;
  public objectiveNote: any=null;
  public diagnosisOrderList: Array<any> = null;
  constructor(public noteTemplateBLService: NoteTemplateBLService) {

  }

  ngOnInit() {
    if (this.noteTemplateBLService.NotesId > 0) {
      this.noteTemplateBLService.GetHistoryAndPhysicalNoteById(this.noteTemplateBLService.NotesId).
        subscribe((res) => {

          if (res.Status == "OK" && res.Results) {
            this.hpNote = res.Results;
            this.subjectiveNote = this.hpNote.SubjectiveNote;
            this.objectiveNote = this.hpNote.ObjectiveNote;
            this.diagnosisOrderList = this.hpNote.DiagnosisOrdersList;
            console.log(this.hpNote);
            console.log(this.diagnosisOrderList);
          }
        });
    }
  }

  ngOnDestroy() {
    this.noteTemplateBLService.NotesId = 0;
  }
}



