import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
@Component({
    templateUrl: "./phrm-store-main.html"
})
export class PHRMStoreMainComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/Store");
    }
}