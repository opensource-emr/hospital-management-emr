import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { BillingBLService } from "../../billing/shared/billing.bl.service";
import { SecurityService } from '../../security/shared/security.service';
import { CallbackService } from '../../shared/callback.service';
import { DanpheHTTPResponse } from "../../shared/common-models";
import { DanpheCache, MasterType } from '../../shared/danphe-cache-service-utility/cache-services';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../shared/routefrom.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../shared/shared-enums";
import { ActivateBillingCounterService } from "../shared/activate-billing-counter.service";
import { BillingCounter } from '../shared/billing-counter.model';
@Component({
  selector: 'change-billing-counter',
  templateUrl: './change-billing-counter.component.html',
  styleUrls: ['./change-billing-counter.component.css']
})

export class ChangeBillingCounterComponent implements OnInit {
  public counterList = new Array<BillingCounter>();
  public isCounterActivated: boolean = false;
  public currentBillingCounter: BillingCounter = new BillingCounter();
  public currentCounterName: string = "";
  public showChangeBillingCounterPopup: boolean = false;

  constructor(
    public router: Router,
    public securityService: SecurityService,
    public callBackService: CallbackService,
    public messageBoxService: MessageboxService,
    public billingBLService: BillingBLService,
    private activateBillingCounterService: ActivateBillingCounterService,
    private routeFromService: RouteFromService
  ) {
    this.currentBillingCounter = this.activateBillingCounterService.getActiveBillingCounter();
    this.LoadCounter();
  }

  ngOnInit() {
  }

  public LoadCounter(): void {
    let allCounters: Array<BillingCounter>;
    allCounters = DanpheCache.GetData(MasterType.BillingCounter, null);
    if (allCounters && allCounters.length) {
      this.counterList = allCounters.filter(counter => counter.CounterType === null || counter.CounterType === "BILLING");
      this.isCounterActivated = false;
      if (this.currentBillingCounter && this.currentBillingCounter.CounterId) {
        this.isCounterActivated = true;
        let currentCounter = this.counterList.find(counter => counter.CounterId === this.currentBillingCounter.CounterId);
        if (currentCounter) {
          this.currentCounterName = currentCounter.CounterName;
          this.activateBillingCounterService.setActiveBillingCounter(currentCounter);
          this.securityService.setLoggedInCounter(currentCounter);
        }
      }
    }
    this.showChangeBillingCounterPopup = true;
  }

  public ActivateCounter(counter): void {
    this.billingBLService.ActivateCounter(counter.CounterId)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          console.info("Counter Activated Successfully");
        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Couldn't activate counter please try again."]);
          console.log(res.ErrorMessage);
        }
      });
  }

  public DeactivateCounter(): void {
    this.billingBLService.DeActivateCounter()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.activateBillingCounterService.removeActiveBillingCounter();
          this.currentBillingCounter = new BillingCounter();
          this.currentCounterName = null;
          this.LoadCounter();
          this.showChangeBillingCounterPopup = true;
        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Couldn't de-activate current counter. Please try again later."]);
          console.log(res.ErrorMessage);
        }
      });
  }

  public CloseChangeBillingCounterPopup(): void {
    this.router.navigate(['']);
    this.showChangeBillingCounterPopup = false;
  }

  public SetGlobalBillingCounter(counterId: number): void {
    const selectedCounter = this.counterList.find(a => a.CounterId === counterId);
    this.activateBillingCounterService.setActiveBillingCounter(selectedCounter);
    this.router.navigate([`/${this.routeFromService.RouteFrom}`]);
  }
}

