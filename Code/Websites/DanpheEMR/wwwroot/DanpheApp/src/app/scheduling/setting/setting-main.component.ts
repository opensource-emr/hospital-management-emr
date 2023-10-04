import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
@Component({
    templateUrl: "../../view/scheduling-view/Setting/SettingMain.html" //  "/SchedulingView/SettingMain"
})
export class SettingMainComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        this.validRoutes = this.securityService.GetChildRoutes("Scheduling/Setting");
    }
}