import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router'
import { SecurityService } from '../security/shared/security.service';
import { MessageboxService } from '../shared/messagebox/messagebox.service';
@Component({

  templateUrl: "./pharmacy-ward.html"  //"/InventoryView/InternalMain/"

})
export class PharmacyWardComponent {
  public validRoutes: any;
  public CurrentStoreId: number = 0;

  constructor(public securityService: SecurityService,
    public router: Router,
    public msgBoxServ: MessageboxService) {
    this.CheckForSubstoreActivation();
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
        this.validRoutes = this.securityService.GetChildRoutes("WardSupply/Pharmacy"); //to activate from routeguard
      }
    } catch (exception) {
      this.msgBoxServ.showMessage("Error", [exception]);
    }
  }
}
