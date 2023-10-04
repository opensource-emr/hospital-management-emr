import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"
import { EmergencyService } from './shared/emergency.service';


@Component({
    templateUrl: "./emergency-main.html"
})

// App Component class
export class EmergencyMainComponent {
    validRoutes: any;
    public primaryNavItems: Array<any> = null;
    public secondaryNavItems: Array<any> = null;
    constructor(public securityService: SecurityService, public erService: EmergencyService) {
        //get the chld routes of Lab from valid routes available for this user.
        this.validRoutes = this.securityService.GetChildRoutes("Emergency");
        this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
        this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
        this.GetAllCasesDetailLookUp();
        this.GetAllBittenBodyPartList();
        this.GetAllFirstAidList();
        this.GetAllSnakeList();
    }

    GetAllCasesDetailLookUp() {
        this.erService.GetAllCasesLookUpDetailData();
    }

    GetAllBittenBodyPartList(){
        this.erService.GetAllBittenBodyPartList();
    }

    GetAllSnakeList(){
        this.erService.GetAllSnakeList();
    }

    GetAllFirstAidList(){
        this.erService.GetAllFirstAidList();
    }
}