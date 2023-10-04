import { Component } from '@angular/core';
import { Router } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service";
import { CallbackService } from '../shared/callback.service';
import { RouteFromService } from '../shared/routefrom.service';

@Component({
  templateUrl: './adt-main.html'
})

// App Component class
export class ADTMainComponent {

  validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;
  constructor(public securityService: SecurityService,
    public callbackService: CallbackService, public router: Router,
    private _routeFrom: RouteFromService) {
    //get the chld routes of ADTMain from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("ADTMain");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
  }

}
