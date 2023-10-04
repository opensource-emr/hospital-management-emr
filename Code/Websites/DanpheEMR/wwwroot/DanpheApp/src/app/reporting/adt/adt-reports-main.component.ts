import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../../security/shared/security.service"
@Component({
  templateUrl: "adt-reports-main.html"
})

export class RPT_ADT_ADTReportsMainComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        //get the chld routes of AdmissionMain from valid routes available for this user.
        this.validRoutes = this.securityService.GetChildRoutes("Reports/AdmissionMain");
    }
}
