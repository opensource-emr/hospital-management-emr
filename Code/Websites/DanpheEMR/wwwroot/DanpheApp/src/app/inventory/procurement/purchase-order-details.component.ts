import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { PurchaseOrder } from "../shared/purchase-order.model";
import { PurchaseOrderItems } from "../shared/purchase-order-items.model";
import { CoreService } from "../../core/shared/core.service"
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { InventoryService } from '../shared/inventory.service';
import { EmailModel } from '../../shared/email.model';

import * as moment from 'moment/moment';
import { EmailService } from '../shared/email.service';
@Component({
  templateUrl: "../../view/inventory-view/PurchaseOrderDetails.html"  // "/InventoryView/PurchaseOrderDetails"
})
export class PurchaseOrderDetailsComponent {
  public purchaseorderID: number = null;
  public purchaseorderDetails: PurchaseOrder = new PurchaseOrder();
  public purchaseorderItemsDetails: Array<PurchaseOrderItems> = new Array<PurchaseOrderItems>();
  public header: any = null;
  public email: EmailModel = new EmailModel();
  public PoTime: string = "";
  public creator: any = new Object();
  public authorizer: any = new Object();
  public terms: string = null;
  public vendorEmail: string = null;

  constructor(
    public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public messageBoxService: MessageboxService,
    public router: Router,
    public emailService: EmailService,
    public coreservice: CoreService) {
    this.LoadPurchaseOrderDetails(this.inventoryService.Id);
    this.header = JSON.parse(this.coreservice.Parameters[1].ParameterValue);
  }

  LoadPurchaseOrderDetails(id: number) {
    if (id != null) {
      this.purchaseorderID = id;
      this.inventoryBLService.GetPOItemsByPOId(this.purchaseorderID)
        .subscribe(res => this.ShowPurchaseOrderDetails(res));
    }
    else {
      this.messageBoxService.showMessage("notice-message", ['Please, Select PurchaseOrder for Details.']);
      this.purchaseorderList();
    }
  }
  ShowPurchaseOrderDetails(res) {
    if (res.Status == "OK") {
      this.purchaseorderItemsDetails = res.Results.poItems;
      this.purchaseorderDetails = res.Results.poDetails;
      this.creator = res.Results.creator;
      this.authorizer = res.Results.authorizer;
      this.vendorEmail = res.Results.poDetails.VendorEmail;
      this.PoTime = moment(this.purchaseorderDetails.PoDate).format('HH:mm');
      this.purchaseorderDetails.PoDate = moment(this.purchaseorderDetails.PoDate).format('DD-MM-YYYY');
    }
    else {
      this.messageBoxService.showMessage("notice-message", ["There is no PurchaseOrder details !"]);
      this.purchaseorderList();
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
  //route to purchase order list page
  purchaseorderList() {
    this.router.navigate(['/Inventory/ProcurementMain/PurchaseOrderList']);
  }
  EditPurchaseOrder(status) {
    if (status == "complete") {
        this.messageBoxService.showMessage("Access Denied", ["Good Receipt has already been created.", "Further editing is forbidden."]);
      }
      else {
      this.inventoryService.POId = this.purchaseorderID;
      this.router.navigate(['/Inventory/ProcurementMain/PurchaseOrderItems']);
    }
  }
  sendEmail() {

    if (!this.vendorEmail) {
      this.messageBoxService.showMessage("failed", ["Could not found vendor email address."]);
    } else {
      this.email.Content = document.getElementById("printpage").innerHTML;
      this.email.EmailAddress = this.vendorEmail;
      this.email.Subject = "Purchase Order";
      this.emailService.SendEmail(this.email).subscribe(res => this.afterEmail(res));
    }
  }

  afterEmail(res) {
    if (res.Status == "OK") {
      this.messageBoxService.showMessage("success", ["Succesfully send email to vendor."]);
    }
    else {
      err => {
        this.messageBoxService.showMessage("failed", ["Failed to send email to vendor."]);
        console.log(err.ErrorMessage);

      }
    }
  }
}
