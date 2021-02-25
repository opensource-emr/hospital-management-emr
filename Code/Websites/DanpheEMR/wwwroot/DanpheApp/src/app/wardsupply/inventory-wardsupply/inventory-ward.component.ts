import { Component } from '@angular/core'
import { SecurityService } from '../../security/shared/security.service';
import { Router } from '@angular/router';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { InventoryService } from '../../inventory/shared/inventory.service';
import { InventoryBLService } from '../../inventory/shared/inventory.bl.service';
@Component({

  templateUrl: "./inventory-ward.html"  //"/InventoryView/InternalMain"

})
export class InventoryWardComponent {
  validRoutes: any;
  public CurrentStoreId: number = 0;
  constructor(public securityService: SecurityService,
    public router: Router,
    public msgBoxServ: MessageboxService,
    public inventoryService: InventoryService,
    public inventoryBLService: InventoryBLService) {
    this.validRoutes = this.securityService.GetChildRoutes("WardSupply/Inventory"); //activate from routeguard
    this.inventoryBLService.GetAllInventoryFiscalYears()
    .subscribe(res =>{
      if(res.Status == "OK"){
        console.log("fiscal years loaded succesfully.");
        this.inventoryService.LoadAllFiscalYearList(res.Results);
      }
      else{
        console.log("failed to laod fiscal year list");
      }
    })
  }
  CheckForSubstoreActivation() {
    this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
    try {
      if (!this.CurrentStoreId) {
        //routeback to substore selection page.
        this.router.navigate(['/WardSupply']);
      }
      else {
        //write whatever is need to be initialise in constructor here.
        this.validRoutes = this.securityService.GetChildRoutes("WardSupply/Inventory"); //activate from routeguard
      }
    } catch (exception) {
      this.msgBoxServ.showMessage("Error", [exception]);
    }
  }
}
