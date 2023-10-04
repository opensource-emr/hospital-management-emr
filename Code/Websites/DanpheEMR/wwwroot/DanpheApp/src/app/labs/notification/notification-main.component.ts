import { Component } from "@angular/core";
import { SecurityService } from "../../security/shared/security.service";

@Component({
    selector: 'lab-notification',
    templateUrl: 'notification-main.html'
})

export class LabNotificationComponent{
    validRoutes: any;
  constructor(public securityService: SecurityService) {
    //get the chld routes of Clinical from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Lab/Notification");
  }
}