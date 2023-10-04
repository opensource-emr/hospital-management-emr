import { Component } from '@angular/core'
import {RouterOutlet, RouterModule } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../../security/shared/security.service"

@Component({
    selector: 'duplicate-bills',
    templateUrl: './bill-duplicate-prints-main.html'
})

// App Component class
export class BIL_DuplicatePrint_MainComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        //get the chld routes of Clinical from valid routes available for this user.
        this.validRoutes = this.securityService.GetChildRoutes("Billing/DuplicatePrints");
    }
    
}