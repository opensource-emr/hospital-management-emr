import { Component } from "@angular/core";
import { SecurityService } from "../../security/shared/security.service";

@Component({
  templateUrl: "./dept-settings-main.html"
})
export class DepartmentSettingsMainComponent {
  public showDepartment: boolean = true;
  public showSubstore: boolean = false;
  //public showServiceDepartment: boolean = false;

  validRoutes: any;
  constructor(public securityService: SecurityService) {
    //get the chld routes of ADTMain from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Settings/DepartmentsManage");
  }
}
