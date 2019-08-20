import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../../security/shared/security.service"
@Component({
  templateUrl: "./appointment-reports-main.html"
})
export class RPT_APPT_AppointmentReportsMainComponent {
  validRoutes: any;
  constructor(public securityService: SecurityService) {
    //get the chld routes of AppointmentMain from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Reports/AppointmentMain");
  }
}
