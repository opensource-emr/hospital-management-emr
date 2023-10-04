import { Injectable } from '@angular/core';
import { CanDeactivate, CanActivate } from '@angular/router';
import { BillingService } from '../billing/shared/billing.service';
import { VisitService } from '../appointments/shared/visit.service';
import { PatientService } from '../patients/shared/patient.service';


///Sudarshan-10Apr'17
//We're using this single class to Reset PatientContext (i.e. PatientService and VisitService) for both canActive and canDeactivate guard.
//canDeactivate() gets called when user leaves a route, canActivate() gets called when route enters.

@Injectable()
export class ResetPatientcontextGuard<T> implements CanDeactivate<T>, CanActivate {
    constructor(public visitService: VisitService,
        public billingService: BillingService,
        public patientService: PatientService) {
    }
    //Clear patient and visit services before it leaves the route
    canDeactivate() {
        this.patientService.CreateNewGlobal();
        this.visitService.CreateNewGlobal();
        this.billingService.ResetToNormalBilling();
        this.visitService.appointmentType = "New";
        return true;
    }
    //Clear patient and visit services before when user Enters a Route.
    canActivate() {
        this.patientService.CreateNewGlobal();
        this.visitService.CreateNewGlobal();
        this.billingService.ResetToNormalBilling();
        this.visitService.appointmentType = "New";
        return true;
    }

   
}



