import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
@Component({
    templateUrl: "../../view/pharmacy-view/Prescription/PrescriptionMain.html" // "/PharmacyView/PrescriptionMain"
})
export class PrescriptionMainComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/Prescription");
    }
}