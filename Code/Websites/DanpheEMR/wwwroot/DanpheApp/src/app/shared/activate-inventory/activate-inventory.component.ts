import { AfterContentInit, AfterViewInit, Component, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { PHRMStoreModel } from '../../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../routefrom.service';
import { ActivateInventoryService } from './activate-inventory.service';

@Component({
  selector: 'app-activate-dispensary',
  templateUrl: './activate-inventory.component.html',
  styleUrls: ['./activate-inventory.component.css']
})
export class ActivateInventoryComponent {

  inventoryList: PHRMStoreModel[] = [];
  inventory: PHRMStoreModel = new PHRMStoreModel();

  constructor(public activateInvService: ActivateInventoryService, public msgBox: MessageboxService, private _router: Router, private routeFrom: RouteFromService, public securityService: SecurityService) {
    this.GetAllInventory();
  }
  GetAllInventory() {
    this.activateInvService.GetAllInventoryList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.inventoryList = res.Results;
          this.inventoryList = this.inventoryList.filter(a => a.IsActive == true);
          // if only one inventory is available for the user, automatically set it as active inventory
          if (this.inventoryList.length == 1) {
            this.msgBox.showMessage("Notice-Message", [`You are only allowed to see ${this.inventoryList[0].Name}.`]);
            this.setGlobalInventory(this.inventoryList[0].StoreId);
          }
          if (this.inventoryList.length > 1) {
            this.getActiveInventory()
          }
        }
        else {
          this.msgBox.showMessage("Failed", ["Failed to load Inventory list."]);
        }
      }, () => {
        this.msgBox.showMessage("Failed", ["Failed to load Inventory list."]);
      });
  }
  setGlobalInventory(storeId: number) {
    var selectedInventory = this.inventoryList.find(a => a.StoreId == storeId);
    this.activateInvService.activeInventory = selectedInventory;
    this._router.navigate([`/${this.routeFrom.RouteFrom}`]);
  }

  ActivateInventory(inventory) {
    this.activateInvService.ActivateInventory(inventory.StoreId).subscribe(
      res => {
        if (res.Status == "OK") {
          let activeInventory = res.Results;
          console.log("success");
        }
      }
    )
  }
  getActiveInventory() {
    this.activateInvService.getActiveInventory().subscribe(
      res => {
        if (res.Status == "OK") {
          let activeInventory = res.Results;
          if (activeInventory.StoreId != null && activeInventory.StoreId != 0) {
            this.setGlobalInventory(activeInventory.StoreId);
          }
        }
        else{
          this.msgBox.showMessage("Failed", ["Failed to load inventory"]);
        }
      }
    )
  }

}
