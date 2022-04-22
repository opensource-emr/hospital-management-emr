import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router';
import { SecurityService } from "../security/shared/security.service";
import { DanpheCache, MasterType } from '../shared/danphe-cache-service-utility/cache-services';


@Component({
  templateUrl: "./reporting-main.html"
})

export class RPT_ReportingMainComponent {
    validRoutes: any;
    public primaryNavItems : Array<any> = null;
    public secondaryNavItems:Array<any>=null;
    constructor(public securityService: SecurityService) {
      DanpheCache.GetData(MasterType.ICD, null);
        //get the chld routes of Reports from valid routes available for this user.
        this.validRoutes = this.securityService.GetChildRoutes("Reports");
        this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
        this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1); 
    }
}
