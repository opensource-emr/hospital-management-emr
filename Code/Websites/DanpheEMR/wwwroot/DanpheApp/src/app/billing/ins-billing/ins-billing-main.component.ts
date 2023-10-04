import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"

@Component({
  templateUrl: "./ins-billing-main.html"

})
export class INSBillingMainComponent {

  validRoutes: any;
  constructor(public securityService: SecurityService) {
    //get the chld routes of Clinical from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Billing/InsuranceMain");
  }
}
