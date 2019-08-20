import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { SecurityService } from "../security/shared/security.service"
@Component({
    templateUrl: "../../app/view/scheduling-view/SchedulingMain.html" // "/SchedulingView/SchedulingMain"
})

export class SchedulingMainComponent {
    validRoutes: any;
    public primaryNavItems : Array<any> = null;
    public secondaryNavItems:Array<any>=null;
    constructor(public securityService: SecurityService) {
        //get the child routes of scheduling from valid routes available for this user.
        this.validRoutes = this.securityService.GetChildRoutes("Scheduling");
        this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
        this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1); 
    }
    public  MyTestDecorator(value) {
        return function decorator(target) {
           target.isTestable = value;
        }
     }
}


