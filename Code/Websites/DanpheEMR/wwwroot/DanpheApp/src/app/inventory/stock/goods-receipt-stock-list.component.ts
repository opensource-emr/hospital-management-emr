import { Component } from "@angular/core";
import * as moment from "moment";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant"
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { GoodsReceipt } from "../shared/goods-receipt.model";
import { InventoryBLService } from "../shared/inventory.bl.service";
import { InventoryService } from "../shared/inventory.service";
import { Router } from "@angular/router";
import { SecurityService } from "../../security/shared/security.service";
import { RouteFromService } from "../../shared/routefrom.service";

@Component({
  templateUrl: "./goods-receipt-stock-list.component.html"
})
export class GoodsReceiptStockListComponent {
  public goodsReceiptList: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public fromDate: any;
  public toDate: any;
  public goodsreceiptGridColumns: Array<any> = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public grListfiltered: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public dateRange: string = null;
  isQuantityAvailable: boolean = false;


  constructor(
    public inventoryBLService: InventoryBLService,
    public msgBoxServ: MessageboxService,
    public inventoryService: InventoryService,
    public router: Router,
    public securityService: SecurityService,
    public fromRoute: RouteFromService

  ) {
    this.goodsreceiptGridColumns = GridColumnSettings.GRSList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('GoodsReceiptDate'), new NepaliDateInGridColumnDetail('VendorBillDate')]);
    this.dateRange = 'None'; //means last 1 month
  }

  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetGoodsReceiptStockList();
      } else {
        this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }
  GetGoodsReceiptStockList() {
    this.inventoryBLService.GetGoodsReceiptStockList(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.goodsReceiptList = res.Results;
          this.CanGRDispatch();
          this.goodsReceiptList.map(a => {
            a.GoodsReceiptDate = moment(a.GoodsReceiptDate).format("YYYY-MM-DD");
            a.VendorBillDate = moment(a.VendorBillDate).format("YYYY-MM-DD");
          })
          this.grListfiltered = this.goodsReceiptList;

        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get GoodsReceiptList. " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get GoodsReceiptList. " + err.ErrorMessage]);
        });
  }
  public CanGRDispatch() {
    var canGRDispatch = this.securityService.HasPermission('btn-inventory-stock-gr-dispatch');
    this.goodsReceiptList.forEach(a => a.canGRDispatch = canGRDispatch);
  }



  public filterlist() {
    if (this.fromDate && this.toDate) {
      this.grListfiltered = [];
      this.goodsReceiptList.forEach(inv => {
        let selinvDate = moment(inv.GoodsReceiptDate).format('YYYY-MM-DD');
        let isGreterThanFrom = selinvDate >= moment(this.fromDate).format('YYYY-MM-DD');
        let isSmallerThanTo = selinvDate <= moment(this.toDate).format('YYYY-MM-DD')
        if (isGreterThanFrom && isSmallerThanTo) {
          this.grListfiltered.push(inv);
        }
      });
    }
  }

  GoodsReceiptGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        this.RouteToViewDetails($event.Data.GoodsReceiptID);
        break;
      }
      case "fileupload": {

      }

      case "gr-dispatch": {
        this.RouteToDispatch($event.Data.GoodsReceiptID);
      }
      default:
        break;
    }
  }

  RouteToViewDetails(goodsReceiptId: number) {
    //pass the goodsreceiptID to goodreceiptDetails page
    this.inventoryService.GoodsReceiptId = goodsReceiptId;
    this.router.navigate(['/Inventory/StockMain/GoodsReceiptStockDetails']);
  }

  RouteToDispatch(goodsReceiptId: number) {
    this.inventoryService.GoodsReceiptId = goodsReceiptId;
    this.fromRoute.RouteFrom = 'GRToDispatch';
    this.router.navigate(['/Inventory/InternalMain/Requisition/DirectDispatch']);
  }


  GetGridExportOptions() {
    let gridExportOptions = {
      fileName: 'Good-Receipt-Stock-List-' + moment().format('YYYY-MM-DD') + '.xls',
      displayColumns: ["GoodsReceiptNo", "GoodsReceiptDate", "PurchaseOrderId", "GRCategory", "VendorName", "ContactNo", "BillNo", "TotalAmount", "PaymentMode", "CreatedOn"]
    };

    return gridExportOptions;
  }
}