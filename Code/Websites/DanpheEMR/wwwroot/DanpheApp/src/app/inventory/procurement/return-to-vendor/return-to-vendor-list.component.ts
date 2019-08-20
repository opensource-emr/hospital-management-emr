import { Component } from "@angular/core";
import { ReturnToVendorItem } from "../../shared/return-to-vendor-items.model";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { InventoryService } from "../../shared/inventory.service";
import { Router } from "@angular/router";

@Component({
  templateUrl: "./return-to-vendor-list.html"
})

export class ReturnToVendorListComponent {

  public returnVendorItemList: Array<ReturnToVendorItem> = new Array<ReturnToVendorItem>();
  public returnVendorItemColumn: Array<any> = null;
  constructor(
    public inventoryBLService: InventoryBLService,
    public messageBoxService: MessageboxService,
    public inventoryService: InventoryService,
    public router: Router
  ) {
    this.returnVendorItemColumn = GridColumnSettings.returnToVendorItemList;
    this.GetReturnVendorItemList();
  }

  GetReturnVendorItemList() {
    this.inventoryBLService.GetVendorItemReturnList().
      subscribe(res => {
        if (res.Status == "OK") {
          this.returnVendorItemList = res.Results;
        }
        else {
          this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
        }
      });
  }

  //grid actions for item-wise requisition list
  GridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "view":
        {
          this.inventoryService.CreatedOn = $event.Data.CreatedOn;
          this.inventoryService.VendorId = $event.Data.VendorId;

          this.router.navigate(['/Inventory/ProcurementMain/ReturnToVendorDetails']);
        }
      default:
        break;
    }
  }

}
