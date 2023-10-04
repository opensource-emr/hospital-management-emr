import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
@Component({
    templateUrl: "./phrm-order-main.html"
})
export class PHRMOrderMainComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/Order");
    }
}