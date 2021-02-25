import { Component, ChangeDetectorRef, OnInit, OnDestroy, Output, EventEmitter, Input } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Visit } from '../../../appointments/shared/visit.model';
import { Patient } from "../../../patients/shared/patient.model";
import { PatientService } from "../../../patients/shared/patient.service";
import * as moment from 'moment/moment';
import { ProgressNotesModel } from "../../shared/progress-note.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { VisitService } from "../../../appointments/shared/visit.service";
import { NoteTemplateBLService } from "../../shared/note-template.bl.service";


@Component({
    selector: "progress-note",
  templateUrl: "./progress-note.html"
})

export class ProgressNoteComponent {
  public pat: Patient = new Patient();
  public patVisit: Visit = new Visit();
  public date: string = null;
    public patDetail: Visit = new Visit();
    //@Input("progressNote")
  public progressNote: ProgressNotesModel = new ProgressNotesModel ();
  //public editProgressNote: ProgressNotesModel = new ProgressNotesModel ();
  constructor(public visitService: VisitService,
    public msgBoxServ: MessageboxService,
    public notetemplateBLService: NoteTemplateBLService,
    public patientService: PatientService) {
    this.pat = this.patientService.globalPatient;
    this.patVisit = this.visitService.globalVisit,
      this.date = moment().format("YYYY-MM-DD,h:mm:ss a");
  }

  @Input("patDetail")
  public set obtainPatDetail(val: any) {
    this.patDetail = val ? val : "";
      console.log(this.patDetail);
      //this.Focusit();
  }

  @Input("editProgressNote")
  public set procedureNoteForEdit(pn: any) {
    if (this.notetemplateBLService.NotesId != 0) {
      this.progressNote = pn;
    }
  }

  @Output("callback-progressnotes")
  public CallBackProgressNotes: EventEmitter<Object> = new EventEmitter<Object>();

  Focusit() {
    this.progressNote.PatientId = this.patDetail.PatientId;
    this.progressNote.PatientVisitId = this.patDetail.PatientVisitId;
    if (this.progressNote) {
      this.CallBackProgressNotes.emit({ progressnote: this.progressNote });
    }
  }

}
