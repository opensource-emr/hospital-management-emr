import { Component, ChangeDetectorRef } from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service'
import { Router } from '@angular/router';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';


@Component({
  templateUrl: "./ward-inventory-reports.html"
})
export class WardInventoryReportComponent {
  public CurrentStoreId: number = 0;
  validRoutes: any;
  constructor(public securityService: SecurityService, public router: Router, public msgBoxServ: MessageboxService) {
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
        this.validRoutes = this.securityService.GetChildRoutes("WardSupply/Inventory/Reports");
      }
    } catch (exception) {
      this.msgBoxServ.showMessage("Error", [exception]);
    }
  }
}
