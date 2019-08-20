import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { VisitService } from '../appointments/shared/visit.service';
@Injectable()
export class SelectVisitCanActivateGuard implements CanActivate {
    constructor(public visitService: VisitService) {

    }
    //Activates the clinical, lab, radiology module only if the patient is selected.
    canActivate() {
        if (this.visitService.getGlobal().PatientId && this.visitService.getGlobal().PatientVisitId)
            return true;

        else {
            alert("Error ! Please select a patient-visit first.");
            return false;
        }


    }
}