import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"
import { VisitService } from '../appointments/shared/visit.service';
import { CoreService } from '../core/shared/core.service';
import { DanpheCache, MasterType } from '../shared/danphe-cache-service-utility/cache-services';

@Component({

    selector: 'my-app',
    templateUrl: "../../app/view/clinical-view/Clinical.html"  // "/ClinicalView/Clinical"

})

// App Component class
export class ClinicalComponent {
    validRoutes: any;
    public primaryNavItems: Array<any> = null;
    public secondaryNavItems: Array<any> = null;
    constructor(public securityService: SecurityService, public visitService: VisitService, public coreService: CoreService) {
        DanpheCache.GetData(MasterType.ICD, null);
        DanpheCache.GetData(MasterType.ProcedureBillItemPrices,null);
        //get the chld routes of Clinical from valid routes available for this user.
        this.validRoutes = this.securityService.GetChildRoutes("Doctors/PatientOverviewMain/Clinical");
        if (this.visitService.globalVisit.VisitType == "outpatient") {
            let excludedRoutes = this.coreService.GetExcludedOPpages('Clinical');
            this.validRoutes = this.validRoutes.filter(function (r) {
                return !excludedRoutes.includes(r.RouterLink);
            });
        }
        this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
        this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
    }

}