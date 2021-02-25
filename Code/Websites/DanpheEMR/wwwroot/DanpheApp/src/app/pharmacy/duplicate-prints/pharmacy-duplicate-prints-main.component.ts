import { Component } from '@angular/core'
import { SecurityService } from "../../security/shared/security.service"

@Component({
    selector: 'duplicate-bills',
    templateUrl: "./DuplicatePrints-main.html"
})

export class PharmacyDuplicatePrintsMainComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        //get the chld routes of Clinical from valid routes available for this user.
        this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/DuplicatePrints");
    }
    
}
