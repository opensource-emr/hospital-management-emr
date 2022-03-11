import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
@Component({
    templateUrl: "./phrm-report-main.html"
})
export class PHRMReportMainComponent {

    validRoutes: any;
    public primaryNavItems: Array<any> = null;
    public secondaryNavItems: Array<any> = null;

    constructor(private _securityService: SecurityService, public router: Router) {
        //get the child routes of Dispensary from valid routes available for this user.
        this.validRoutes = this._securityService.GetChildRoutes("Pharmacy/Report");
        this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
        this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
    }
}