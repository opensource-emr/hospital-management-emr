import { Injectable } from '@angular/core';
import { BillingCounter } from '../../billing/shared/billing-counter.model';
import { SecurityService } from '../../security/shared/security.service';

@Injectable({
    providedIn: 'root'
})
export class ActivateBillingCounterService {
    private _activeBillingCounter: BillingCounter = new BillingCounter();
    constructor(
        private securityService: SecurityService) {
    }

    public getActiveBillingCounter(): BillingCounter {
        this._activeBillingCounter = this.securityService.getLoggedInCounter();
        return this._activeBillingCounter;
    }

    public setActiveBillingCounter(counter: BillingCounter) {
        this._activeBillingCounter = counter;
        this.securityService.setLoggedInCounter(this._activeBillingCounter);
    }

    public removeActiveBillingCounter() {
        this._activeBillingCounter = null;
        this.securityService.setLoggedInCounter(this._activeBillingCounter);
    }
}