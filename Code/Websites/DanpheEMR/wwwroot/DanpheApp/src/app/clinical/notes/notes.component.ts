import { Component, ChangeDetectorRef, OnInit, OnDestroy } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { VisitService } from '../../appointments/shared/visit.service';
import { Visit } from '../../appointments/shared/visit.model';
import { SubjectiveNote } from "../shared/subjective-note.model";
@Component({
    templateUrl: "../../view/clinical-view/Notes.html" //"/ClinicalView/Notes"
})
export class NotesComponent implements OnInit, OnDestroy {
    public showOPDGeneralNote: boolean = false;
    public showOrthoNote: boolean = false;
    public showNotesMain: boolean = true;
    public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
    public patientClinicalNotes = [];
    public currentVisit: Visit;
    public notesId: number = null;
    public renderMode: string = null;
    public summaryMode: boolean = false;

    sub: any;

    constructor(public http: HttpClient, public route: ActivatedRoute,
        public changeDetector: ChangeDetectorRef,
        public visitService: VisitService,
        public msgBoxServ: MessageboxService) {
        this.currentVisit = this.visitService.getGlobal();
        this.GetPatientClinicalNotes();
    }

    ngOnInit() {
        this.sub = this.route.data
            .subscribe(v => {
                if (v && v.summaryMode) {
                    this.summaryMode = true;
                }
            });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    AddNewOPDGeneralNote() {
        this.notesId = null;
        this.showNotesMain = false;
        this.renderMode = "edit";
        this.ViewOPDGeneral();
    }


    ViewOPDGeneral() {
        this.showNotesMain = false;
        this.showOPDGeneralNote = false;
        this.changeDetector.detectChanges();
        this.showOPDGeneralNote = true;
        this.showOrthoNote = false;
    }
    BackToNotesMain() {
        this.showOPDGeneralNote = false;
        this.showNotesMain = false;
        this.notesId = null;
        this.changeDetector.detectChanges();
        this.showNotesMain = true;
        this.GetPatientClinicalNotes();
    }
    GetPatientClinicalNotes() {
        this.http.get<any>("/api/Clinical?reqType=patient-clinical-notes&patientId=" + this.currentVisit.PatientId, this.options)
            .map(res => res)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.patientClinicalNotes = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("failed", ["Unable to get patient clinical notes."]);
                    console.log(res.ErrorMessage);
                }
            });
    }
    EditNote(notes) {
        if (notes.NoteType == "OPDGeneralNote") {
            this.notesId = notes.NotesId;
            this.showNotesMain = false;
            this.renderMode = "edit";
            this.ViewOPDGeneral();
        }
    }
    ViewNote(notes) {
        if (notes.NoteType == "OPDGeneralNote") {
            this.notesId = notes.NotesId;
            this.showNotesMain = false;
            this.renderMode = "view";
            this.ViewOPDGeneral();
        }
    }

    //sud: 7Aug'18
    AddNewOPDOrthoNote() {
        this.notesId = null;
        this.showNotesMain = false;
        this.renderMode = "edit";
        this.showOPDGeneralNote = false;
        this.showOrthoNote = true;
    }
    OPDOrthoCallback() {

  }



   //sud:11July-Prescription Notes-Temporarry

  public showPrescriptionNote: boolean = false;
  public ShowPrescriptionNote() {
    this.showPrescriptionNote = true;
  }

  public HidePrescriptionNote() {
    this.showPrescriptionNote = false;
  }

}

