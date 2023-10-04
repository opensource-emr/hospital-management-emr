import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../../security/shared/security.service"


@Component({
    templateUrl: "../../view/clinical-view/ProblemsMain.html" // "/ClinicalView/ProblemsMain"
})
export class ProblemsMainComponent {

validRoutes: any;
constructor(public securityService: SecurityService) {
    //get the chld routes of ADTMain from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Doctors/PatientOverviewMain/ProblemsMain");
}

}




