import { Component } from '@angular/core'
import {RouterOutlet, RouterModule } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"
import { template } from '@angular/core/src/render3';

@Component({
    selector: 'my-app',
    template:''
})

// App Component class
export class DischargeSummaryComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        //get the chld routes of Clinical from valid routes available for this user.
        //this.validRoutes = this.securityService.GetChildRoutes("Doctors/PatientOverviewMain/Clinical");
    }
    
}