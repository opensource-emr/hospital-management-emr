import { Component } from "@angular/core";
import { SecurityService } from "../../../security/shared/security.service";

@Component({
  templateUrl: "./gov-ins-reports-main.html"
})

export class GovInsuranceReportsComponent {
  validRoutes: any;
  constructor(public securityService: SecurityService) {
    //get the chld routes of Reports from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Insurance/Reports");
  }
}