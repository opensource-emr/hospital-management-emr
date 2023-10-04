import { Injectable } from '@angular/core';
import { CanDeactivate, CanActivate } from '@angular/router';
import { BillingService } from '../billing/shared/billing.service';
import { VisitService } from '../appointments/shared/visit.service';
import { PatientService } from '../patients/shared/patient.service';
@Injectable()
export class ResetBillingContextGuard<T> implements CanDeactivate<T>, CanActivate {
    constructor(public billingService: BillingService,
        public visitService: VisitService,
        public patientService: PatientService) {
    }
    canDeactivate() {
        this.patientService.CreateNewGlobal();
        this.visitService.CreateNewGlobal();
        this.billingService.ResetToNormalBilling();
        return true;
    }
    canActivate() {
        this.patientService.CreateNewGlobal();
        this.visitService.CreateNewGlobal();
        this.billingService.ResetToNormalBilling();
        return true;
    }

}



