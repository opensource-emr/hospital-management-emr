import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { PatientService } from '../../patients/shared/patient.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
@Injectable()
export class AdmissionSelectPatientCanActivateGuard implements CanActivate {
    constructor(public patientService: PatientService,
        public msgBoxServ: MessageboxService,
        public router: Router) {

    }
    //Activates the clinical, lab, radiology module only if the patient is selected.
    canActivate() {
        if (this.patientService.getGlobal().PatientId)
            return true;

        else {
            this.router.navigate(['/ADTMain/AdmissionSearchPatient']);
            this.msgBoxServ.showMessage("notice-message", ["Please select a patient and proceed for admission."]);
            return false;
        }


    }
}