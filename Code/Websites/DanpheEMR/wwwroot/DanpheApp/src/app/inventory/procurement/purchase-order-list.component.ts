import { Component } from "@angular/core";
import { Router } from '@angular/router';

import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { PurchaseOrder } from "../shared/purchase-order.model"
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
import { InventoryService } from '../shared/inventory.service';
import * as moment from 'moment/moment';
@Component({
  templateUrl: "../../view/inventory-view/PurchaseOrderList.html"  // "/InventoryView/PurchaseOrderList"
})
export class PurchaseOrderListComponent {

  public purchaseOrderList: Array<PurchaseOrder> = new Array<PurchaseOrder>();
  public polistVendorwise: any;
  public index: number = 0;
  public purchaseOrdersGridColumns: Array<any> = null;
  public polistVendorwiseGridColumns: Array<any> = null;
  public disable: boolean = true;
  public showVendorwise: boolean = false;
  public fromDate: string = '';
  public toDate: string = '';
  public poListfiltered: Array<PurchaseOrder> = new Array<PurchaseOrder>();
  public showDetails: any;

  constructor(
    public InventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public router: Router,
    public messageBoxService: MessageboxService) {
    this.polistVendorwiseGridColumns = GridColumnSettings.POlistVendorwise;
    this.purchaseOrdersGridColumns = GridColumnSettings.POList;
    //this.purchaseOrderList = null;
    this.disable = true;

    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    //load 'pending' at first: This is also default selection in the cshtml.
    this.LoadPOListByStatus("all");
  }
  //this function will load PO -> vendor wise..
  LoadPOVendorwise() {
    this.showVendorwise = true;
    this.InventoryBLService.GetPOlistVendorwise()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.polistVendorwise = res.Results;
        }
        else {
          this.messageBoxService.showMessage("failed", ['failed to get purchase order.. please check log for details.']);
          console.log(res.ErrorMessage);
        }
      });

  }

  LoadPOListByStatus(status): void {
    //there is if condition because we have to check diferent and multiple status in one action ....
    //like in pending we have to check the active and partial both...
    var Status = "";
    if (status == "pending") {
      Status = "active,partial";
    }
    else if (status == "complete") {
      Status = "complete";
    }
    else if (status == "all") {
      Status = "active,partial,complete,initiated";
    }
    else {
      Status = "initiated"
    }
    this.showVendorwise = false;
    this.InventoryBLService.GetPurchaseOrderList(this.fromDate, this.toDate, Status)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.purchaseOrderList = res.Results;
          this.poListfiltered = this.purchaseOrderList;
        }
        else {
          this.messageBoxService.showMessage("failed", ['failed to get Purchase Order.. please check log for details.']);
          console.log(res.ErrorMessage);
        }
      });
  }

  PurchaseOrderGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "genReceipt":
        {
          var data = $event.Data;
          this.ShowDetails(data);
          break;
        }
      case "view":
        {
          this.RouteToViewDetails($event.Data.PurchaseOrderId)
          break;
        }
      default:
        break;
    }
  }

  povendorGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "genGR": {
        break;
      }
      default:
        break;
    }
  }

  ShowDetails(details) {
    //Pass the Purchase order Id  to Next page for getting PUrchaserOrderItems using inventoryService
    this.inventoryService.POId = details.PurchaseOrderId;
    this.router.navigate(['/Inventory/ProcurementMain/GoodsReceiptAdd']);
  }
  //route to create PO page
  CreatePurchaseOrder() {
    this.router.navigate(['/Inventory/ProcurementMain/PurchaseOrderItems']);
  }
  RouteToViewDetails(id) {
    //pass the purchaseorderID to purchaseorderDetails page
    this.inventoryService.Id = id;
    this.router.navigate(['/Inventory/ProcurementMain/PurchaseOrderDetails']);
  }

  //temp to create quotation analysis
  QAnalysis() {
    this.router.navigate(['/Inventory/ExternalMain/QuotationAnalysis']);
  }

  public filterlist() {
    if (this.fromDate && this.toDate) {
      this.poListfiltered = [];
      this.purchaseOrderList.forEach(inv => {
        let selinvDate = moment(inv.CreatedOn).format('YYYY-MM-DD');
        let isGreterThanFrom = selinvDate >= moment(this.fromDate).format('YYYY-MM-DD');
        let isSmallerThanTo = selinvDate <= moment(this.toDate).format('YYYY-MM-DD')
        if (isGreterThanFrom && isSmallerThanTo) {
          this.poListfiltered.push(inv);
        }
      });
    }
    else {
      this.poListfiltered = this.purchaseOrderList;
    }

  }
}
