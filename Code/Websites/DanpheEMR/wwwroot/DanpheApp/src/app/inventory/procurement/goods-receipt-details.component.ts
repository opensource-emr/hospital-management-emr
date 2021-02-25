import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { GoodsReceipt } from "../shared/goods-receipt.model"
import { GoodsReceiptItems } from "../shared/goods-receipt-item.model"
import { CoreService } from "../../core/shared/core.service"
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { InventoryService } from '../shared/inventory.service';
import * as moment from 'moment/moment';
import { BillingFiscalYear } from '../../billing/shared/billing-fiscalyear.model';
import { PharmacyBLService } from '../../pharmacy/shared/pharmacy.bl.service';
@Component({
  templateUrl: "../../view/inventory-view/GoodsReceiptDetails.html"  //"/InventoryView/GoodsReceiptDetails"
})
export class GoodsReceiptDetailsComponent { 
  public goodsreceiptID: number = null;
  public goodsreceiptDetails: GoodsReceipt = new GoodsReceipt();
  public goodsreceiptItemsDetails: Array<GoodsReceiptItems> = new Array<GoodsReceiptItems>();
  public header: any = null;
  msgBoxServ: any;
  creator: any = new Object();
  public editGR: boolean = false;

  constructor(
    public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public messageBoxService: MessageboxService,
    public router: Router,
    public coreservice: CoreService) {

    this.LoadGoodsReceiptDetails(this.inventoryService.GoodsReceiptId);
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
  ngOnDestroy() {
    if (this.editGR == false) {
      this.inventoryService.GoodsReceiptId = 0;
    }
  }

  ShowGoodsReceiptDetails(res) {
    if (res.Status == "OK") {
      this.goodsreceiptItemsDetails = res.Results.grItems;
      this.creator = res.Results.creator;
      this.goodsreceiptDetails = res.Results.grDetails;
      if (this.goodsreceiptItemsDetails.length > 0) {
        this.goodsreceiptItemsDetails.forEach(itm => {
          if (itm.ExpiryDate != null)
            itm.ExpiryDate = moment(itm.ExpiryDate).format('DD-MM-YYYY');
        });
        this.goodsreceiptDetails.GoodsReceiptDate = moment(this.goodsreceiptDetails.GoodsReceiptDate).format('YYYY-MM-DD');
        this.goodsreceiptDetails.ReceivedDate = moment(this.goodsreceiptDetails.ReceivedDate).format('YYYY-MM-DD');
        this.goodsreceiptDetails.CreatedOn = moment(this.goodsreceiptDetails.CreatedOn).format('YYYY-MM-DD');
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
    popupWinindow.document.write(`
    <html>
      <head>
      <style>
        .img-responsive{ position: relative;left: -65px;top: 10px;}
        .qr-code{position:relative;left: 87px;}
        .cancelStamp {transform: rotate(12deg);color: #555;font-size: 3rem;font-weight: 700;border: 0.25rem solid #555;display: inline-block;padding: 0.25rem 1rem;text-transform: uppercase;border-radius: 1rem;font-family: 'Courier';mix-blend-mode: multiply;color: #D23;border: 0.5rem solid #D23;transform: rotate(-14deg);border-radius: 0;}
      </style>
      <link rel="stylesheet" type="text/css" href="../../../themes/theme-default/ReceiptList.css" />
      </head>
      <body onload="window.print()">`
      + printContents +
      `</body>
    </html>`);
    popupWinindow.document.close();
  }
  //route to goods receipt list page
  goodsreceiptList() {
    this.router.navigate(['/Inventory/ProcurementMain/GoodsReceiptList']);
  }
  ////Confirmation for Goods Receipt cancel
  //cancelGoodsReceipt(flag: boolean) {
  //  if (flag) {
  //    this.messageBoxService.showMessage("Access Denied", ["This Receipt has been transferred to Accounting", "Cancelling is forbidden."]);
  //  } else {
  //    let printAgain: boolean = true;
  //    let cancel_msg = "NOTE !!! Do you want to cancel Goods Receipt?";
  //    printAgain = window.confirm(cancel_msg);
  //    if (printAgain) {
  //      this.cancelGR();
  //    }
  //  }
  //}
  //Goods Receipt cancellation method
  cancelGR() {
    if (this.goodsreceiptItemsDetails[0].IsTransferredToACC == true) {
      this.messageBoxService.showMessage("Access Denied", ["This Receipt has been transferred to Accounting", "Cancelling is forbidden."]);
    }
    else {
      this.inventoryBLService.PostGoodsReceiptCancelDetail(this.goodsreceiptDetails.GoodsReceiptID, this.goodsreceiptDetails.CancelRemarks)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.goodsreceiptList();
              this.messageBoxService.showMessage("Success", ["Goods Receipt Cancelled"]);
            }
            else {
              this.messageBoxService.showMessage("Error", [res.ErrorMessage]);
            }
          },
          err => {
            this.messageBoxService.showMessage("Error", [err.ErrorMessage]);
          });
    }
  }

  editReceipt(flag: boolean) {
    if (flag) {
      this.messageBoxService.showMessage("Access Denied", ["This receipt has been transfered to accounting.", "Further editing is forbidden."]);
    }
    else {
      this.editGR = true;
      //this.inventoryService.Id = this.goodsreceiptDetails.GoodsReceiptID;//sud:19Feb'20: changed after adding GoodsReceiptId field in service.
      this.inventoryService.GoodsReceiptId = this.goodsreceiptDetails.GoodsReceiptID;
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
