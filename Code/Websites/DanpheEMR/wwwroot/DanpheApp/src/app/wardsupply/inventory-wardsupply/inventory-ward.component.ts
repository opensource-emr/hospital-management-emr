import { Component } from '@angular/core'
import { SecurityService } from '../../security/shared/security.service';
@Component({

  templateUrl: "./inventory-ward.html"  //"/InventoryView/InternalMain"

})
export class InventoryWardComponent {
  validRoutes: any;
  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes("WardSupply/Inventory"); //activate from routeguard
  }

}
