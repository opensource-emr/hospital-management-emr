import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../../security/shared/security.service"


@Component({
    //selector: 'my-app',
    templateUrl: "../../view/inventory-view/Reports/ReportsMain.html"  //"/InventoryReports/ReportsMain"
})
export class InventoryReportsComponent {

validRoutes: any;
constructor(public securityService: SecurityService) {
    //get the chld routes of ADTMain from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Inventory/Reports");
}

}