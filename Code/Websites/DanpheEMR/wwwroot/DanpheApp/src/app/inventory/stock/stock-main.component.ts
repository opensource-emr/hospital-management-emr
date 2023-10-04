import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"

@Component({
    templateUrl: "../../view/inventory-view/StockMain.html" //"/InventoryView/StockMain"
})

export class StockMainComponent {
    validRoutes: any;
    constructor(public securityService: SecurityService) {
        this.validRoutes = this.securityService.GetChildRoutes("Inventory/StockMain");
    }
}