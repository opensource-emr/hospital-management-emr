import { Component } from '@angular/core';

import { SecurityService } from '../security/shared/security.service';

@Component({
  templateUrl: './incentive-main.html'
})

// App Component class
export class IncentiveMainComponent {
  validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;
  constructor(public securityService: SecurityService) {
    // get the chld routes of Settings from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes('Incentive');
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
  }
}
