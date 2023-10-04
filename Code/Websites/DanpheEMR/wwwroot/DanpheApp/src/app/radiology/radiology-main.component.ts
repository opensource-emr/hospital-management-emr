import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"

@Component({
    selector: 'my-app',
    templateUrl: "./radiology-main.html" //"/RadiologyView/Radiology"

})

export class RadiologyMainComponent {
    validRoutes: any;
    public primaryNavItems : Array<any> = null;
    public secondaryNavItems:Array<any>=null;
    constructor(public securityService: SecurityService) {
        //get the chld routes of Radiology from valid routes available for this user.
        this.validRoutes = this.securityService.GetChildRoutes("Radiology");
        this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
        this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1); 
    }
}
