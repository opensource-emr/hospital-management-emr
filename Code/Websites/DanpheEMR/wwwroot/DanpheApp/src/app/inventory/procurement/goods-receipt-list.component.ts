import { Component } from "@angular/core";
import { Router } from '@angular/router';

import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant"
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { GoodsReceipt } from "../shared/goods-receipt.model"
import { InventoryBLService } from "../shared/inventory.bl.service"
import { InventoryService } from '../shared/inventory.service';
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
import * as moment from 'moment/moment';

@Component({
    templateUrl: "../../view/inventory-view/GoodsReceiptList.html" // "/InventoryView/GoodsReceiptList"
})
export class GoodsReceiptListComponent {
    public goodsReceiptList: Array<GoodsReceipt> = new Array<GoodsReceipt>();
    public goodsreceiptGridColumns: Array<any> = null;
    public fromDate: string = null;
    public toDate: string = null;
    public grListfiltered: Array<GoodsReceipt> = new Array<GoodsReceipt>();

    constructor(
        public inventoryBLService: InventoryBLService,
        public inventoryService: InventoryService,
        public msgBoxServ: MessageboxService,
        public router: Router) {
        this.goodsreceiptGridColumns = GridColumnSettings.GRList;
        this.fromDate = moment().format('YYYY-MM-DD');
        this.toDate = moment().format('YYYY-MM-DD');
        this.GetGoodsReceiptList();
    }

    GetGoodsReceiptList() {
      this.inventoryBLService.GetGoodsReceiptList(this.fromDate, this.toDate)
            .subscribe(res => {
                if (res.Status == "OK") {
                  this.goodsReceiptList = res.Results;
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
    RouteToViewDetails(id) {
        //pass the goodsreceiptID to goodreceiptDetails page
        this.inventoryService.Id = id;
        this.router.navigate(['/Inventory/ProcurementMain/GoodsReceiptDetails']);
    }

    CreateNewGoodReceipt() {
        this.inventoryService.Id = null;
        this.router.navigate(['/Inventory/ProcurementMain/GoodsReceiptAdd']);
    }

    public filterlist() {
      if (this.fromDate && this.toDate) {
        this.grListfiltered = [];
        this.goodsReceiptList.forEach(inv => {
          let selinvDate = moment(inv.CreatedOn).format('YYYY-MM-DD');
          let isGreterThanFrom = selinvDate >= moment(this.fromDate).format('YYYY-MM-DD');
          let isSmallerThanTo = selinvDate <= moment(this.toDate).format('YYYY-MM-DD')
          if (isGreterThanFrom && isSmallerThanTo) {
            this.grListfiltered.push(inv);
          }
        });
      }
      else {
        this.grListfiltered = this.goodsReceiptList;
      }

    }
}
