import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"
@Component({
    templateUrl: "../../app/view/doctors-view/DashboardMain.html" // "/DoctorsView/DashboardMain"
})


export class DoctorsMainComponent {

    validRoutes: any;
    constructor(public securityService: SecurityService) {
        //get the chld routes of doctors/PatientOverviewMain from valid routes available for this user.
        this.validRoutes = this.securityService.GetChildRoutes("Doctors/PatientOverviewMain");
    }
}  