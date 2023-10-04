import { Component, ChangeDetectorRef } from "@angular/core";
import { DenominationModel } from "../shared/denomination.model";
import { HandOverModel } from "../shared/hand-over.model";
import { BillingBLService } from "../shared/billing.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { User } from '../../security/shared/user.model';
import { SecurityService } from "../../security/shared/security.service";


@Component({
  templateUrl: './bill-denomination-main.html',
})

// App Component class
export class BillingDenominationMainComponent {
  validRoutes: any;
  constructor(public securityService: SecurityService) {
    //get the chld routes of Clinical from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Billing/BillingDenomination");
  }

}
