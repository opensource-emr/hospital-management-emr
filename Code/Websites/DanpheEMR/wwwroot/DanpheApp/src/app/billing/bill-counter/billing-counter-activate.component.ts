/// <reference path="../../shared/callback.service.ts" />
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Component } from "@angular/core";
import { Observable } from 'rxjs/Rx';// this is
import { SecurityService } from '../../security/shared/security.service';
import { BillingBLService } from '../shared/billing.bl.service';
import { BillingCounter } from '../shared/billing-counter.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CallbackService } from '../../shared/callback.service';
import { DanpheCache, MasterType } from '../../shared/danphe-cache-service-utility/cache-services';
@Component({
   templateUrl: "./billing-counter-activate.html" // "/BillingView/CounterActivate"  //controller in BillingViewController
})


export class BillingCounterActivateComponent {
    public counterlist: Array<any>;
    //loading: boolean = false;
    public disable: boolean = true;
    public currentCounterId: number = 0;
    //isCounterActivated: boolean = false;

    public currentCounterName: string = null;


    constructor(
        public router: Router,
        public securityService: SecurityService,
        public callbackservice: CallbackService,
        public msgBoxServ: MessageboxService,
        public billingBLService: BillingBLService
    ) {
        this.currentCounterId = this.securityService.getLoggedInCounter().CounterId;
        this.LoadCounter();
        //this.currentCounterName = this.securityService.getLoggedInCounter().CounterName;


        //else {
        //    this.LoadCounter();
        //    //this.isCounterActivated = true;
        //}

    }

    LoadCounter(): void {
           
        let allCounters: Array<BillingCounter> ;
        allCounters=DanpheCache.GetData(MasterType.BillingCounter,null);
        if (allCounters && allCounters.length) {
            this.counterlist = allCounters.filter(cnt => cnt.CounterType == null || cnt.CounterType == "BILLING");
            this.disable = true;
            if (this.currentCounterId) {
                this.disable = false;
                let currCtr = this.counterlist.find(cntr => cntr.CounterId == this.currentCounterId);
                if (currCtr) {
                    this.currentCounterName = currCtr.CounterName;
                    this.securityService.getLoggedInCounter().CounterName = currCtr.CounterName;
                }

            
            }
        }
        // this.billingBLService.GetAllBillingCounters()
        //     .subscribe(res => {
        //         if (res.Status == "OK") {
        //             let allCounters: Array<BillingCounter> = res.Results;

        //             if (allCounters && allCounters.length) {
        //                 //sud: 13Sept'18-- now we get all counters list (including Labs), we've to get only Billing Counters.
        //                 this.counterlist = allCounters.filter(cnt => cnt.CounterType == null || cnt.CounterType == "BILLING");
        //                 // this.counterlist = res.Results;
        //                 this.disable = true;
        //                 if (this.currentCounterId) {
        //                     this.disable = false;
        //                     let currCtr = this.counterlist.find(cntr => cntr.CounterId == this.currentCounterId);
        //                     if (currCtr) {
        //                         this.currentCounterName = currCtr.CounterName;
        //                         this.securityService.getLoggedInCounter().CounterName = currCtr.CounterName;
        //                     }

        //                     //code optimization, see above.. 
        //                     //this.counterlist.forEach(ctr => {
        //                     //    if (ctr.CounterId == this.currentCounterId) {
        //                     //        this.currentCounterName = ctr.CounterName;
        //                     //        this.securityService.getLoggedInCounter().CounterName = ctr.CounterName;
        //                     //    }
        //                     //});
        //                 }
        //             }
        //         }
        //         else {
        //             this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        //             console.log(res.ErrorMessage);
        //         }

        //     });

    }
    ActivateCounter(counter): void {
        //this.Counter[0].CounterId = this.counterlist[0].CounterId;

        this.billingBLService.ActivateCounter(counter.CounterId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    let actCtrId = res.Results;
                    this.securityService.getLoggedInCounter().CounterId = actCtrId;
                    this.currentCounterId = actCtrId;
                    this.counterlist.forEach(ctr => {
                        if (ctr.CounterId == this.currentCounterId) {
                            this.currentCounterName = ctr.CounterName;
                            this.securityService.getLoggedInCounter().CounterName = ctr.CounterName;
                        }
                    });

                    if (this.callbackservice.CallbackRoute != "") {
                        var _routeName = this.callbackservice.CallbackRoute;
                        this.callbackservice.CallbackRoute = "";
                        this.router.navigate([_routeName]);
                    }
                    else
                        this.router.navigate(['Billing/SearchPatient']);

                }
                else {
                    this.msgBoxServ.showMessage("error", ["couldn't activate counter please try again."]);
                    console.log(res.ErrorMessage);
                }

            });


    }


    DeactivateCounter(): void {
        this.billingBLService.DeActivateCounter()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.securityService.getLoggedInCounter().CounterId = 0;
                    this.securityService.getLoggedInCounter().CounterName = null;
                    this.currentCounterId = 0;
                    this.currentCounterName = null;
                    this.LoadCounter();
                }
                else {
                    this.msgBoxServ.showMessage("error", ["Couldn't de-activate current counter. Please try again later."]);
                    console.log(res.ErrorMessage);
                }
            });



    }


    //CallBack(res) {
    //    if (res.Status == 'OK') {
    //        this.counterName=[];
    //        if (res && res.Results) {
    //            res.Results.forEach(a => {
    //                this.counterName.push({
    //                    "CounterId": a.CounterId, "CounterName": a.CounterName

    //                });
    //            });
    //        }
    //    }
    //}

}
