import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { SubjectiveNotesModel } from '../shared/subjective-note.model';
import { PatientClinicalDetail } from "../../clinical/shared/patient-clinical-details.vmodel";
import { NotesModel } from '../shared/notes.model';
import { Visit } from '../../appointments/shared/visit.model';
import { VisitService } from '../../appointments/shared/visit.service';


@Component({
    selector: 'subjective-note',
    templateUrl: "./subjective-note.html"
})
export class SubjectiveNoteComponent {
    public loading: any;
    public patVisit: Visit = new Visit();
    public notes: NotesModel = new NotesModel();
    
    public subjectiveNote: SubjectiveNotesModel = new SubjectiveNotesModel;

    @Input("clinical-detail")
    public clinicalDetail: PatientClinicalDetail = new PatientClinicalDetail();

    @Output("callback-subjectivenote")
    public CallBackSubjectiveNotes: EventEmitter<Object> = new EventEmitter<Object>();

    @Input("subjective-note")
    public set SubNote(data) {
      this.subjectiveNote = data;
    }

    public showAllergyAddBox: boolean = false; //@input-allergy
    public addPastProblemBox: boolean = false;  //@input Past
    public showSurgicalAddBox: boolean = false; //@input surgery
    public showSocialAddBox: boolean = false; //@input social
    public showFamilyHistoryBox: boolean = false; ///@input family

    constructor(public changeDetector: ChangeDetectorRef,
        public visitService: VisitService) {
        this.patVisit = this.visitService.getGlobal();
    }

    //-------------------Add Allergy------------------
    AddAllergyPopUp() {
        this.showAllergyAddBox = false;
        this.changeDetector.detectChanges();
        this.showAllergyAddBox = true;
    }

    CallBackAddAllergy($event) { //@output
        if ($event && $event.allergy) {
            this.clinicalDetail.Allergies.push($event.allergy);
        }
        this.showAllergyAddBox = false;
        this.changeDetector.detectChanges();
    }


    //--------------Add past Medical---------------------

    AddPastMedicalPopUp() {
        this.addPastProblemBox = false;
        this.changeDetector.detectChanges();
        this.addPastProblemBox = true;
    }

    CallBackAddPastMedical($event) { //@output
        if ($event && $event.pastMedical) {
            this.clinicalDetail.PastMedicals.push($event.pastMedical);
        }
        this.addPastProblemBox = false;
        this.changeDetector.detectChanges();
    }

    //--------------Add Surgical History---------------------
    AddSurgeryHistoryPopUp() {
        this.showSurgicalAddBox = false;
        this.changeDetector.detectChanges();
        this.showSurgicalAddBox = true;
    }

    callBackAddSurgical($event) { //@output
        if ($event && $event.surgicalHistory) {
            this.clinicalDetail.SurgicalHistory.push($event.surgicalHistory);
        }
        this.showSurgicalAddBox = false;
        this.changeDetector.detectChanges();
    }

    //--------------Add Social History---------------------
    AddSocialHistoryPopUp() {
        this.showSocialAddBox = false;
        this.changeDetector.detectChanges();
        this.showSocialAddBox = true;
    }

    CallBackAddSocialHistory($event) { //@output
        if ($event && $event.socialHistory) {
            this.clinicalDetail.SocialHistory.push($event.socialHistory);
        }
        this.showSocialAddBox = false;
        this.changeDetector.detectChanges();
    }

    //--------------Add Family History---------------------
    AddFamilyHistoryPopUp() {
        this.showFamilyHistoryBox = false;
        this.changeDetector.detectChanges();
        this.showFamilyHistoryBox = true;
    }

    CallBackAddFamilyHistory($event) { //@output
        if ($event && $event.familyHistory) {
            this.clinicalDetail.FamilyHistory.push($event.familyHistory);
        }
        this.showFamilyHistoryBox = false;
        this.changeDetector.detectChanges();
    }

    Focusit() {
        this.subjectiveNote.PatientId = this.patVisit.PatientId;
        this.subjectiveNote.PatientVisitId = this.patVisit.PatientId;
        if (this.subjectiveNote) {
            this.CallBackSubjectiveNotes.emit({ subjectivenote: this.subjectiveNote });
        }
    }
}
