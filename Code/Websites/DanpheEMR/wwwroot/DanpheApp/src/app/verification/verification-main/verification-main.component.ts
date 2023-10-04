import { Component, OnInit } from '@angular/core';
import { SecurityService } from '../../security/shared/security.service';

@Component({
  selector: 'app-verification-main',
  templateUrl: './verification-main.component.html'
})
export class VerificationMainComponent implements OnInit {

  validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;

  constructor(public securityService: SecurityService) {
    //get the child routes of WardSupply from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Verification");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
  }

  ngOnInit() {
  }

}
