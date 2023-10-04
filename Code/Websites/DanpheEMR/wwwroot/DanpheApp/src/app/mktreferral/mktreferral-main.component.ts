import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { CoreService } from "../core/shared/core.service";
import { SecurityService } from "../security/shared/security.service";
import { MessageboxService } from "../shared/messagebox/messagebox.service";

@Component({
    selector: 'mktreferral',
    templateUrl: './mktreferral-main.component.html'
})
export class MarketingreferralMainComponent {

    validRoutes: any;
    public primaryNavItems: [] = [];
    public secondaryNavItems: [] = [];
    constructor(public securityService: SecurityService, public router: Router,
        public coreService: CoreService,
        public msgBoxServ: MessageboxService) {
        this.validRoutes = this.securityService.GetChildRoutes("MktReferral");
        this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
        // this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);

    }

    public ShowSchemeReturnEntryPage: boolean = false;


}