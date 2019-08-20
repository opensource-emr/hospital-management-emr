import { Component } from "@angular/core";
import { SecurityService } from "../../../security/shared/security.service";

@Component({
  templateUrl: "./ins-reports-main.html"
})

export class InsuranceReportsMainComponent {

  validRoutes: any;

  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;

  constructor(public securityService: SecurityService) {
    //get the chld routes of Reports from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Billing/InsuranceMain/Reports");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
  }
}
