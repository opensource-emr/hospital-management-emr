import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import ProcurementGridColumns from '../../../procurement/shared/procurement-grid-column';
import { ReturnToVendorItem } from '../return-to-vendor-items.model';
import { InventoryBLService } from '../../shared/inventory.bl.service';

@Component({
  selector: 'app-return-to-vendor-list',
  templateUrl: './return-to-vendor-list.component.html',
})
export class ReturnToVendorListComponent implements OnInit {
  ngOnInit() {
  }
  public returnVendorItemList: Array<ReturnToVendorItem> = new Array<ReturnToVendorItem>();
  public returnVendorItemColumn: Array<any> = null;
  constructor(
    public inventoryBLService: InventoryBLService,
    public messageBoxService: MessageboxService,
    public inventoryService: InventoryService,
    public router: Router
  ) {
    this.returnVendorItemColumn = ProcurementGridColumns.ReturnToVendorList;
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

          this.router.navigate(['/Inventory/ReturnToVendor/ReturnToVendorView']);
        }
      default:
        break;
    }
  }

}
