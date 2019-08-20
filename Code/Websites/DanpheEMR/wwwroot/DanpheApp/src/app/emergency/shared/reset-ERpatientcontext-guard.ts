import { Injectable } from '@angular/core';
import { CanDeactivate, CanActivate } from '@angular/router';
import { VisitService } from '../../appointments/shared/visit.service';
import { PatientService } from '../../patients/shared/patient.service';


///Sudarshan-10Apr'17
//We're using this single class to Reset PatientContext (i.e. PatientService and VisitService) for both canActive and canDeactivate guard.
//canDeactivate() gets called when user leaves a route, canActivate() gets called when route enters.

@Injectable()
export class ResetERPatientcontextGuard<T> implements CanDeactivate<T>, CanActivate {
    constructor(public visitService: VisitService, public patientService: PatientService) {
    }
    //Clear patient and visit services before it leaves the route
    canDeactivate() {
        this.patientService.CreateNewGlobal();
        this.visitService.CreateNewGlobal();
        return true;
    }
    //Clear patient and visit services before when user Enters a Route.
    canActivate() {
        this.patientService.CreateNewGlobal();
        this.visitService.CreateNewGlobal();
        return true;
    }


}



