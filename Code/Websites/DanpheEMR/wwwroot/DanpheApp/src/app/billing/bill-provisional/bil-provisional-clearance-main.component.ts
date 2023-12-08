import { Component } from "@angular/core";
import { SecurityService } from "../../security/shared/security.service";

@Component({
  templateUrl: './bil-provisional-clearance-main.component.html'
})
export class BIL_ProvisionalClearance_MainComponent {
  validRoutes: any;
  constructor(public securityService: SecurityService) {
    //get the child routes of Clinical from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Billing/ProvisionalClearance");
  }
}
