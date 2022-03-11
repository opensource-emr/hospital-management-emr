import { AfterContentInit, AfterViewInit, Component, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { PHRMStoreModel } from '../../pharmacy/shared/phrm-store.model';
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

  constructor(public activateInvService: ActivateInventoryService, public msgBox: MessageboxService, private _router: Router, private routeFrom: RouteFromService) {
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
            this.setGlobalDispensary(this.inventoryList[0].StoreId);
          }
        }
        else {
          this.msgBox.showMessage("Failed", ["Failed to load Inventory list."]);
        }
      }, () => {
        this.msgBox.showMessage("Failed", ["Failed to load Inventory list."]);
      });
  }
  setGlobalDispensary(storeId: number) {
    var selectedInventory = this.inventoryList.find(a => a.StoreId == storeId);
    this.activateInvService.activeInventory = selectedInventory;
    this._router.navigate([`/${this.routeFrom.RouteFrom}`]);
  }
}
