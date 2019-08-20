import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
@Component({
    templateUrl: "../../view/pharmacy-view/Sale/SaleMain.html" // "/PharmacyView/SaleMain"
})
export class SaleMainComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/Sale");
    }
}