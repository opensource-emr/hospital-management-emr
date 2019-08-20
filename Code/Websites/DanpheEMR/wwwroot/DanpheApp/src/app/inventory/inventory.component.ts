import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"
import { DanpheCache, MasterType } from '../shared/danphe-cache-service-utility/cache-services';

@Component({

    templateUrl: "../../app/view/inventory-view/InventoryMain.html" //"/InventoryView/InventoryMain"

})
export class InventoryComponent {
    validRoutes: any;
    public primaryNavItems : Array<any> = null;
    public secondaryNavItems:Array<any>=null;
    constructor(public securityService: SecurityService) {
        DanpheCache.GetData(MasterType.AllMasters,null);
        //get the chld routes of Inventory from valid routes available for this user.
        this.validRoutes = this.securityService.GetChildRoutes("Inventory");
        this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
        this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
    }
}
