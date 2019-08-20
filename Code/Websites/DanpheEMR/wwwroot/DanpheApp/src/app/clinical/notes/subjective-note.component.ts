import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { SubjectiveNote } from '../shared/subjective-note.model';
import { PatientClinicalDetail } from "../shared/patient-clinical-details.vmodel";


@Component({
    selector: 'subjective-note',
    templateUrl: "./subjective-note.html"
})
export class SubjectiveNoteComponent {
    public loading: any;
    @Input("subjective-note")
    public subjectiveNote: SubjectiveNote;

    @Input("clinical-detail")
    public clinicalDetail: PatientClinicalDetail = new PatientClinicalDetail();

    public showAllergyAddBox: boolean = false; //@input-allergy
    public addPastProblemBox: boolean = false;  //@input Past
    public showSurgicalAddBox: boolean = false; //@input surgery
    public showSocialAddBox: boolean = false; //@input social
    public showFamilyHistoryBox: boolean = false; ///@input family

    constructor(public changeDetector: ChangeDetectorRef) {

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
}