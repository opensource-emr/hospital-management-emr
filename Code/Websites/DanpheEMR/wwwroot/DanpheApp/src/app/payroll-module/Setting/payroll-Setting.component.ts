import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"

@Component({

  templateUrl: "./payroll-setting.html",

})
export class PayrollSettingComponent {
  validRoutes: any;
    constructor(public securityService: SecurityService) {
      this.validRoutes = this.securityService.GetChildRoutes("PayrollMain/Setting");
    }
}
