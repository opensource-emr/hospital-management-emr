import { Component, OnInit } from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  selector: 'phrm-rack-main',
  templateUrl: './phrm-rack-main.component.html',
  styleUrls: ['./phrm-rack-main.component.css']
})
export class PhrmRackMainComponent {
  rackRoutes: Array<RouteConfig> = new Array<RouteConfig>();
  rackPrimaryNavItems: Array<RouteConfig> = new Array<RouteConfig>();
  constructor(
    public securityService: SecurityService
  ) {
    this.rackRoutes = this.securityService.GetChildRoutes("Pharmacy/Setting/RackSetting");
    this.rackPrimaryNavItems = this.rackRoutes.filter(a => a.IsSecondaryNavInDropdown === null || a.IsSecondaryNavInDropdown);
  }

}
export class RouteConfig {
  RouteId: number = 0;
  DisplayName: string = '';
  UrlFullPath: string = '';
  RouterLink: string = '';
  Css: string = '';
  IsSecondaryNavInDropdown: boolean = false;
}
