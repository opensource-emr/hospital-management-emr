import { Component } from "@angular/core";
import { Router } from '@angular/router';

import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant"
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { GoodsReceipt } from "../shared/goods-receipt.model"
import { InventoryBLService } from "../shared/inventory.bl.service"
import { InventoryService } from '../shared/inventory.service';
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../shared/danphe-grid/NepaliColGridSettingsModel';
import * as moment from 'moment/moment';
import { SecurityService } from "../../security/shared/security.service";

@Component({
  templateUrl: "../../view/inventory-view/GoodsReceiptList.html" // "/InventoryView/GoodsReceiptList"
})
export class GoodsReceiptListComponent {
  public goodsReceiptList: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public goodsreceiptGridColumns: Array<any> = null;
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = null;
  public grListfiltered: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public newGoodsReceiptList: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public GRFilterStatus: string = 'complete';

  constructor(
    public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public msgBoxServ: MessageboxService,
    public router: Router,
    public securityService: SecurityService) {
    this.dateRange = 'None'; //means last 1 month
    this.goodsreceiptGridColumns = GridColumnSettings.GRList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('GoodReceiptDate', false), new NepaliDateInGridColumnDetail('CreatedOn', false)]);
  }

  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetGoodsReceiptList();
      } else {
        this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }


  GetGoodsReceiptList() {
    this.inventoryBLService.GetGoodsReceiptList(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.goodsReceiptList = res.Results;
          this.SetVerificationData();
          this.LoadGoodsReceiptListByStatus();
        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get GoodsReceiptList. " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get GoodsReceiptList. " + err.ErrorMessage]);
        });
  }

  private SetVerificationData() {
    this.goodsReceiptList.forEach(GR => {
      if (GR.IsVerificationEnabled == true) {
        var VerifierIdsParsed: any[] = JSON.parse(GR.VerifierIds);
        GR.MaxVerificationLevel = VerifierIdsParsed.length;
      }
    });
  }

  GoodsReceiptGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        this.RouteToViewDetails($event.Data.GoodsReceiptID);
        break;
      }
      default:
        break;
    }
  }
  RouteToViewDetails(goodsReceiptId: number) {
    //pass the goodsreceiptID to goodreceiptDetails page
    this.inventoryService.GoodsReceiptId = goodsReceiptId;
    this.router.navigate(['/Inventory/ProcurementMain/GoodsReceiptDetails']);
  }

  CreateNewGoodReceipt() {
    this.inventoryService.GoodsReceiptId = null;
    this.inventoryService.POId = 0;
    this.router.navigate(['/Inventory/ProcurementMain/GoodsReceiptAdd']);
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
    this.LoadGoodsReceiptListByStatus();

  }

  LoadGoodsReceiptListByStatus() {
    this.grListfiltered = new Array<GoodsReceipt>();
    switch (this.GRFilterStatus) {
      case "complete":
        this.grListfiltered = this.goodsReceiptList.filter(s => s.IsCancel == false);
        break;
      case "cancelled":
        this.grListfiltered = this.goodsReceiptList.filter(s => s.IsCancel == true);
        break;
      default:
        break;
    }
    this.newGoodsReceiptList = this.grListfiltered;
  }

  //start: sud-4May'20-- For Export feature in gr-list
  GetGridExportOptions() {
    let gridExportOptions = {
      fileName: 'Goods-Receipt-List-' + moment().format('YYYY-MM-DD') + '.xls',
      displayColumns: ["GoodsReceiptNo", "GoodReceiptDate", "PurchaseOrderId", "GRCategory", "VendorName", "ContactNo", "BillNo", "TotalAmount", "PaymentMode", "Remarks", "CreatedOn"]
    };
    return gridExportOptions;
  }
  //End: sud-4May'20-- For Export feature in gr-list



}
