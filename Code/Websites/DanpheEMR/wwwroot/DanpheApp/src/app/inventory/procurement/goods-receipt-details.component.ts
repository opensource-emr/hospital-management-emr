import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { GoodsReceipt } from "../shared/goods-receipt.model"
import { GoodsReceiptItems } from "../shared/goods-receipt-item.model"
import { CoreService } from "../../core/shared/core.service"
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { InventoryService } from '../shared/inventory.service';
import * as moment from 'moment/moment';
@Component({
    templateUrl: "../../view/inventory-view/GoodsReceiptDetails.html"  //"/InventoryView/GoodsReceiptDetails"
})
export class GoodsReceiptDetailsComponent {
    public goodsreceiptID: number = null;
    public goodsreceiptDetails: GoodsReceipt = new GoodsReceipt();
    public goodsreceiptItemsDetails: Array<GoodsReceiptItems> = new Array<GoodsReceiptItems>();
    public header: any = null;
    msgBoxServ: any;
    creator: any;

    constructor(
        public inventoryBLService: InventoryBLService,
        public inventoryService: InventoryService,
        public messageBoxService: MessageboxService,
        public router: Router,
        public coreservice: CoreService) {
       
        this.LoadGoodsReceiptDetails(this.inventoryService.Id);
      this.header = JSON.parse(this.coreservice.Parameters[1].ParameterValue);
      this.GetInventoryBillingHeaderParameter();
    }

    LoadGoodsReceiptDetails(id: number) {
        if (id != null) {
            this.goodsreceiptID = id;
            
            this.inventoryBLService.GetGRItemsByGRId(this.goodsreceiptID)
                .subscribe(res => this.ShowGoodsReceiptDetails(res));
        }
        else {
            this.messageBoxService.showMessage("notice-message", ['Please, Select GoodsReceipt for Details.']);
            this.goodsreceiptList();
        }
    }

    ShowGoodsReceiptDetails(res) {
        if (res.Status == "OK") {
          this.goodsreceiptItemsDetails = res.Results.grItems;
          this.creator = res.Results.creator;
            this.goodsreceiptDetails = res.Results.grDetails[0];
            if (this.goodsreceiptItemsDetails.length > 0) {
                this.goodsreceiptItemsDetails.forEach(itm => {
                    if (itm.ExpiryDate != null)
                    itm.ExpiryDate = moment(itm.ExpiryDate).format('DD-MM-YYYY');
                });
                this.goodsreceiptDetails.GoodsReceiptDate = moment(this.goodsreceiptDetails.GoodsReceiptDate).format('YYYY-MM-DD');
                this.goodsreceiptDetails.ReceivedDate = moment(this.goodsreceiptDetails.ReceivedDate).format('YYYY-MM-DD');
            }
            else {
                this.messageBoxService.showMessage("notice-message", ["Selected GoodsReceipt is without Items"]);
                this.goodsreceiptList();
            }
        }
        else {
            this.messageBoxService.showMessage("notice-message", ["There is no GoodsReceipt details !"]);
            this.goodsreceiptList();
        }
    }
    //this is used to print the receipt
    print() {
        let popupWinindow;
        var printContents = document.getElementById("printpage").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=800,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
        popupWinindow.document.close();
    }
    //route to goods receipt list page
    goodsreceiptList() {
        this.router.navigate(['/Inventory/ProcurementMain/GoodsReceiptList']);
  }
  editReceipt(flag: boolean) {
    if (flag) {
      this.messageBoxService.showMessage("Access Denied", ["This receipt has been transfered to accounting.","Further editing is forbidden."]);
    }
    else {
      this.inventoryService.Id = this.goodsreceiptDetails.GoodsReceiptID;
      this.router.navigate(['/Inventory/ProcurementMain/GoodsReceiptAdd']);
    }
  }
  public headerDetail: { hospitalName, address, email, PANno, tel, DDA };

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreservice.Parameters.find(a => a.ParameterName == 'Inventory BillingHeader').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }
}
