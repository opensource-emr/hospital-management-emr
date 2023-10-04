
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { CoreService } from "../../core/shared/core.service";
import { SecurityService } from "../../security/shared/security.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";

@Component({
  selector: 'mktreferral-settings',
  templateUrl: './mktreferral-settings.component.html',
})
export class MarketingReferralSettingsComponent {
  public validSecondaryRoutes: any;
  public secondaryNavItems: [] = [];
  constructor(
    public securityService: SecurityService,
    public router: Router,
    public coreService: CoreService,
    public msgBoxServ: MessageboxService) {
    this.validSecondaryRoutes = this.securityService.GetChildRoutes("MktReferral/Settings");
    this.secondaryNavItems = this.validSecondaryRoutes.filter(a => a.IsSecondaryNavInDropdown == true);

  }
}

