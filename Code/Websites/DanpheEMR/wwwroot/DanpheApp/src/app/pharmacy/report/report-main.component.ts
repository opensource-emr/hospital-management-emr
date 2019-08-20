import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
@Component({
//    templateUrl: "/PharmacyReportController/ReportMain"
    templateUrl: "../../view/pharmacy-view/Report/ReportMain.html" //"/PharmacyReport/ReportMain"
})
export class ReportMainComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/Report");
    }
}