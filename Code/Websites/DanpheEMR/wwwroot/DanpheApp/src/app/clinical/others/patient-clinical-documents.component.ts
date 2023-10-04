import { Component } from "@angular/core";
import { PatientService } from "../../patients/shared/patient.service"
//"/patients/shared/patient.service";
@Component({
    selector: "patient-clincial-documents",
    template: ` 
              <div class="row">
    <div *ngIf="showDocumentsDetails">
        <patient-upload-files [isShowUploadMode]="isShowUploadMode"
                              [isShowListMode]="isShowListMode"
                              [patientId]="patientId">
        </patient-upload-files>
    </div>
</div>
                `
})
export class PatientClinicalDocumentsComponent {
    public isShowUploadMode: boolean = false;
    public isShowListMode: boolean = false;
    public patientId: number = null;
    public showDocumentsDetails: boolean = true;
     constructor(
        //public changeDetector: ChangeDetectorRef,
        public patientService: PatientService,
        ) {
         this.LoadPatFiles();
    }
    LoadPatFiles() {        
        let patId = this.patientService.getGlobal().PatientId;
        if (patId > 0) {
            this.isShowUploadMode = false;
            this.isShowListMode = true;
            this.patientId = patId;
            this.showDocumentsDetails = true;
        } else {
            this.showDocumentsDetails = false;
        }
    }
}