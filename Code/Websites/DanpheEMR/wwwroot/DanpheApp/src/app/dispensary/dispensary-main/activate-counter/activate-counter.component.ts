import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PharmacyBLService } from '../../../pharmacy/shared/pharmacy.bl.service';
import { SecurityService } from '../../../security/shared/security.service';
import { CallbackService } from '../../../shared/callback.service';
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

@Component({
  selector: 'app-activate-counter',
  templateUrl: './activate-counter.component.html',
  styleUrls: ['./activate-counter.component.css']
})
export class ActivateCounterComponent implements OnInit {

  public counterlist: any;
  public disable: boolean = true;
  public currentCounterId: number = 0;
  public currentCounterName: string = null;


  constructor(public router: Router, public securityService: SecurityService, public callbackservice: CallbackService, public msgBox: MessageboxService, public pharmacyBLService: PharmacyBLService) {
    this.currentCounterId = this.securityService.getPHRMLoggedInCounter().CounterId;
    this.currentCounterName = this.securityService.getPHRMLoggedInCounter().CounterName;
    if (this.currentCounterId) {
      this.disable = false;
    }
    else {
      this.LoadCounter();
    }

  }
  ngOnInit() {

  }

  LoadCounter(): void {
    this.counterlist = DanpheCache.GetData(MasterType.PhrmCounter, null);
    this.disable = true;
  }
  ActivateCounter(counter): void {

    this.pharmacyBLService.ActivateCounter(counter.CounterId, counter.CounterName)
      .subscribe(res => {
        if (res.Status == "OK") {
          let actCtrId = res.Results;
          this.securityService.getPHRMLoggedInCounter().CounterId = actCtrId.CounterId;
          this.securityService.getPHRMLoggedInCounter().CounterName = actCtrId.CounterName;

          this.currentCounterId = this.securityService.getPHRMLoggedInCounter().CounterId;
          this.currentCounterName = this.securityService.getPHRMLoggedInCounter().CounterName;
          if (this.callbackservice.CallbackRoute != "") {
            var _routeName = this.callbackservice.CallbackRoute;
            this.callbackservice.CallbackRoute = "";
            this.router.navigate([_routeName]);
          }
          else
            this.router.navigate(['Dispensary/']);

        }
        else {
          this.msgBox.showMessage("error", ["couldn't activate counter please try again."]);
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
          this.msgBox.showMessage("error", ["Couldn't de-activate current counter. Please try again later."]);
          console.log(res.ErrorMessage);
        }
      });
  }
}
