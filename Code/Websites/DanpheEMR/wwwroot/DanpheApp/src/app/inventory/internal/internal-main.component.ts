import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
@Component({

    templateUrl: "../../view/inventory-view/InternalMain.html"  //"/InventoryView/InternalMain"

})
export class InternalMainComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        this.validRoutes = this.securityService.GetChildRoutes("Inventory/InternalMain");
       
    }
}