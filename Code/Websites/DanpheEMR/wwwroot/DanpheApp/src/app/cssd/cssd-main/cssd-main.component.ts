import { Component } from '@angular/core';
import { SecurityService } from '../../security/shared/security.service';

@Component({
  selector: 'app-cssd-main',
  templateUrl: './cssd-main.component.html',
})
export class CssdMainComponent {
  validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;
  constructor(public securityService: SecurityService) {
    //get the child routes of Helpdesk from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("CSSD");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
  }
}
