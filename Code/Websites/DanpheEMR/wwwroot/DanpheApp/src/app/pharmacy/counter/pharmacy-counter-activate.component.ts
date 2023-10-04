
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Component } from "@angular/core";
import { Observable } from 'rxjs/Rx';
import { PharmacyMainComponent } from '../pharmacy-main.component';
import { SecurityService } from '../../security/shared/security.service';
import { PharmacyBLService } from '../shared/pharmacy.bl.service';
//import { BillingCounter } from '../shared/billing-counter.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CallbackService } from '../../shared/callback.service';
import { DanpheCache, MasterType } from '../../shared/danphe-cache-service-utility/cache-services';
@Component({
    templateUrl: "./pharmacy-counter-activate.html"
})


export class PharmacyCounterActivateComponent {
    public counterlist: any;
    public disable: boolean = true;
    public currentCounterId: number = 0;
    public currentCounterName: string = null;


    constructor(
        public router: Router,
        public securityService: SecurityService,
        public callbackservice: CallbackService,
        public msgBoxServ: MessageboxService,
        public pharmacyBLService: PharmacyBLService
    ) {
        this.currentCounterId = this.securityService.getPHRMLoggedInCounter().CounterId;
        this.currentCounterName = this.securityService.getPHRMLoggedInCounter().CounterName;
       // this.currentCounterName = this.securityService.getLoggedInCounter().CounterName;
        if (this.currentCounterId) {
            this.disable = false;
        }
        else {
            this.LoadCounter();

        }

    }

    LoadCounter(): void {

        this.counterlist =DanpheCache.GetData(MasterType.PhrmCounter,null);
        this.disable = true;

        // this.pharmacyBLService.GetAllPharmacyCounters()
        //     .subscribe(res => {
        //         if (res.Status == "OK") {
        //             this.counterlist = res.Results
        //             this.disable = true;
        //         }
        //         else {
        //             this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        //             console.log(res.ErrorMessage);
        //         }

        //     });

    }
    ActivateCounter(counter): void {

        this.pharmacyBLService.ActivateCounter(counter.CounterId, counter.CounterName)
            .subscribe(res => {
                if (res.Status == "OK") {
                    let actCtrId = res.Results;
                    this.securityService.getPHRMLoggedInCounter().CounterId = actCtrId.CounterId;
                    this.securityService.getPHRMLoggedInCounter().CounterName = actCtrId.CounterName;

                    this.currentCounterId = this.securityService.getPHRMLoggedInCounter().CounterId ;
                    this.currentCounterName = this.securityService.getPHRMLoggedInCounter().CounterName;
                    if (this.callbackservice.CallbackRoute != "") {
                        var _routeName = this.callbackservice.CallbackRoute;
                        this.callbackservice.CallbackRoute = "";
                        this.router.navigate([_routeName]);
                    }
                    else
                        this.router.navigate(['Pharmacy/Dashboard']);

                }
                else {
                    this.msgBoxServ.showMessage("error", ["couldn't activate counter please try again."]);
                    console.log(res.ErrorMessage);
                }

            });
        
       
    }


    DeactivateCounter(): void {
        this.pharmacyBLService.DeActivateCounter()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.securityService.getPHRMLoggedInCounter().CounterId = 0;
                    this.LoadCounter();
                }
                else {
                    this.msgBoxServ.showMessage("error", ["Couldn't de-activate current counter. Please try again later."]);
                    console.log(res.ErrorMessage);
                }
            });

        
       
    }



}