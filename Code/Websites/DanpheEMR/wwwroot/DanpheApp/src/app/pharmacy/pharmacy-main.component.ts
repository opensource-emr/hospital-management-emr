import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router';
import { SecurityService } from "../security/shared/security.service";

@Component({
    templateUrl: "./pharmacy-main.html"
})
//Module's main component class
export class PharmacyMainComponent {
    validRoutes: any;
    public primaryNavItems : Array<any> = null;
    public secondaryNavItems:Array<any>=null;
    constructor(public securityService: SecurityService) {
        //get the chld routes of PatientMain from valid routes available for this user.
        this.validRoutes = this.securityService.GetChildRoutes("Pharmacy");
        this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
        this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1); 
    }
}
