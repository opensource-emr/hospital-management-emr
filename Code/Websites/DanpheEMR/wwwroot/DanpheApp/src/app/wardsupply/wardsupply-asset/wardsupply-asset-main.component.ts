import { Component } from '@angular/core'
import { Router } from '@angular/router';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../security/shared/security.service';
import { WardSupplyBLService } from '../shared/wardsupply.bl.service';
import { wardsupplyService } from '../shared/wardsupply.service';

@Component({

  templateUrl: "./wardsupply-asset-main.component.html"  

})
export class WardSupplyAssetMainComponent {
  validRoutes: any;
  public CurrentStoreId: number = 0;
  constructor(public securityService: SecurityService,
    public router: Router,
    public msgBoxServ: MessageboxService,
    public wardSupplyBLService: WardSupplyBLService, public wardsupplyService:wardsupplyService) {
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
        this.wardsupplyService.activeSubstoreId=this.CurrentStoreId;
        //write whatever is need to be initialise in constructor here.
        this.validRoutes = this.securityService.GetChildRoutes("WardSupply/FixedAsset"); 
      }
    } catch (exception) {
      this.msgBoxServ.showMessage("Error", [exception]);
    }
  }

}
