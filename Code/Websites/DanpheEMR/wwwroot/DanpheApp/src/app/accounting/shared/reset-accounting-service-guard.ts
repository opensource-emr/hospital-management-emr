import { Injectable } from '@angular/core';
import { CanDeactivate, CanActivate } from '@angular/router';
import { AccountingService } from './accounting.service';

//06 march 2020- NageshBB/AshishBhogan created this routeguard for clear service data after leave route or enter into route
@Injectable()
export class ResetAccountingServiceGuard<T> implements CanDeactivate<T>, CanActivate {
    constructor(
        public accountingSer: AccountingService) {
    }
    //Clear accounting service data before it leaves the route
    canDeactivate() {        
        this.accountingSer.IsEditVoucher=false;
        this.accountingSer.VoucherNumber="";
        return true;
    }
    //Clear accounting service data before when user Enters a Route.
    canActivate() {
      
        return true;
    }

   
}



