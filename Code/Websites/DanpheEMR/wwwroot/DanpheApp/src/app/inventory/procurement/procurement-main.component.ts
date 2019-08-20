import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
@Component({

    templateUrl: "../../view/inventory-view/ProcurementMain.html" //"/InventoryView/ExternalMain"

})
export class ProcurementMainComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        this.validRoutes = this.securityService.GetChildRoutes("Inventory/ProcurementMain");
     
    }

}