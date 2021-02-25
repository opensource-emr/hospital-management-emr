import { Component } from "@angular/core";
import { SecurityService } from "../../security/shared/security.service";

@Component({
  templateUrl: "./security-setting.main.html"

})
//testing
export class SecuritySettingsMainComponent {
  validRoutes: any;
  constructor(public securityService: SecurityService) {
    //get the chld routes of ADTMain from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Settings/SecurityManage");
  }
}
