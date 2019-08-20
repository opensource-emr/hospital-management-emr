import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from '../security/shared/security.service';
@Component({

    templateUrl: "./pharmacy-ward.html"  //"/InventoryView/InternalMain/"

})
export class PharmacyWardComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        this.validRoutes = this.securityService.GetChildRoutes("WardSupply/Pharmacy" ); //to activate from routeguard
    }
}
