import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from '../../../core/shared/core.service';
import { EmailService } from '../../../inventory/shared/email.service';
import { InventoryBLService } from '../../../inventory/shared/inventory.bl.service';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { EmailModel } from '../../../shared/email.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ProcurementBLService } from '../../shared/procurement.bl.service';
import { PurchaseOrderItems } from '../purchase-order-items.model';
import { PurchaseOrder } from '../purchase-order.model';

@Component({
  selector: 'app-purchase-order-view',
  templateUrl: './purchase-order-view.component.html',
  host: { '(window:keydown)': 'KeysPressed($event)' },
  styles: []
})
export class PurchaseOrderViewComponent implements OnInit {
  public purchaseorderID: number = null;
  public purchaseorderDetails: PurchaseOrder = new PurchaseOrder();
  public purchaseorderItemsDetails: Array<PurchaseOrderItems> = new Array<PurchaseOrderItems>();
  //public header: any = null;
  public email: EmailModel = new EmailModel();
  public PoTime: string = "";
  public creator: any = new Object();
  public authorizer: any = new Object();
  public verifiers: Array<any> = new Array<any>();
  public vendorEmail: string = null;
  public editPO: boolean = false;
  public showNepaliReceipt: boolean;
  showPopUp: boolean;
  printDetaiils: HTMLElement;
  showPrint: boolean;
  poFormParameterValue: any;
  poEximCodeParameterValue: any;
  colspan: any;
  CheckedBy: any = new Object();
  ApprovedBy: any = new Object();;

  constructor(
    public procBLService: ProcurementBLService,
    public coreService: CoreService,
    public inventoryService: InventoryService,
    public messageBoxService: MessageboxService,
    public router: Router,
    public emailService: EmailService,
    public coreservice: CoreService) {
    //this.header = JSON.parse(this.coreservice.Parameters[1].ParameterValue);//sud:3Mar'20-removed unused field.
    this.GetInventoryBillingHeaderParameter();
    this.LoadPurchaseOrderDetails(this.inventoryService.POId);
    this.GetPOFormCustomizationParameter();
    this.GetPOEximCodeParameter();
  }

  ngOnInit() {
    //core cfg parameter check for nepali and english receipt.
    let receipt = this.coreService.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
    this.showNepaliReceipt = (receipt == "true");
    this.FocusElementById("printbtn");
  }
  GetPOFormCustomizationParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'POFormCustomization').ParameterValue;
    if (paramValue) {

      this.poFormParameterValue = JSON.parse(paramValue);
      /* Rohit: below code are added to maintain the table with table header and data using the colspan
      if the respective field i.e. MSSNO,HSNCODE,VendorItemCode are disabled from the Parameter POFormCustomization */

      if (this.poFormParameterValue.showMSSNO == true && this.poFormParameterValue.showHSNCODE == true && this.poFormParameterValue.showVendorItemCode == true) {
        this.colspan = 7;
      }
      if (this.poFormParameterValue.showMSSNO == true && this.poFormParameterValue.showHSNCODE == true && this.poFormParameterValue.showVendorItemCode == false) {
        this.colspan = 6;
      }
      if (this.poFormParameterValue.showMSSNO == true && this.poFormParameterValue.showHSNCODE == false && this.poFormParameterValue.showVendorItemCode == false) {
        this.colspan = 5;
      }
      if (this.poFormParameterValue.showMSSNO == true && this.poFormParameterValue.showHSNCODE == false && this.poFormParameterValue.showVendorItemCode == true) {
        this.colspan = 6;
      }
      if (this.poFormParameterValue.showMSSNO == false && this.poFormParameterValue.showHSNCODE == true && this.poFormParameterValue.showVendorItemCode == true) {
        this.colspan = 6;
      }
      if (this.poFormParameterValue.showMSSNO == false && this.poFormParameterValue.showHSNCODE == false && this.poFormParameterValue.showVendorItemCode == true) {
        this.colspan = 5;
      }
      if (this.poFormParameterValue.showMSSNO == false && this.poFormParameterValue.showHSNCODE == false && this.poFormParameterValue.showVendorItemCode == false) {
        this.colspan = 4;
      }
    }
    else {
      this.messageBoxService.showMessage("error", ["Failed to get POFormCustomization value."]);
    }
  }
  GetPOEximCodeParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'POEXIMCode').ParameterValue;
    if (paramValue)
      this.poEximCodeParameterValue = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage("error", ["Failed to get POFormCustomization value."]);
  }
  private FocusElementById(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }

  LoadPurchaseOrderDetails(poId: number) {
    if (poId != null) {
      this.purchaseorderID = poId;
      this.procBLService.GetPOItemsByPOId(this.purchaseorderID)
        .subscribe(res => this.ShowPurchaseOrderDetails(res));
    }
    else {
      this.messageBoxService.showMessage("notice-message", ['Please, Select PurchaseOrder for Details.']);
      this.purchaseorderList();
    }
  }
  ngOnDestroy() {
    if (this.editPO == false) {
      this.inventoryService.POId = 0;
    }
  }
  ShowPurchaseOrderDetails(res) {
    if (res.Status == "OK") {
      this.purchaseorderItemsDetails = res.Results.poItems;
      this.purchaseorderDetails = res.Results.poDetails;
      this.creator = res.Results.creator;
      this.authorizer = res.Results.authorizer;
      this.verifiers = res.Results.verifiers;
      this.SetVerifyDetails();
      this.vendorEmail = res.Results.poDetails.VendorEmail;
      this.PoTime = moment(this.purchaseorderDetails.PoDate).format('HH:mm');
      this.purchaseorderDetails.CancelRemarks = "";
      this.purchaseorderDetails.PoDate = moment(this.purchaseorderDetails.PoDate).format('YYYY-MM-DD');
      this.purchaseorderDetails.PurchaseOrderItems = this.purchaseorderItemsDetails;
      this.CheckForModificationApplicable();
    }
    else {
      this.messageBoxService.showMessage("notice-message", ["There is no PurchaseOrder details !"]);
      this.purchaseorderList();
    }
  }
  //To show the verify details in Purchase Order View
  SetVerifyDetails() {
    if (this.verifiers.length > 0) {
      this.CheckedBy = this.verifiers[0];
      this.ApprovedBy = this.verifiers[1];
    }
  }
  private CheckForModificationApplicable() {
    if (this.purchaseorderDetails.IsVerificationEnabled == true && this.purchaseorderDetails.CurrentVerificationLevelCount > 0) {
      this.purchaseorderDetails.IsModificationAllowed = false;
      // this.messageBoxService.showMessage("Warning", ["You cannot edit or cancel this order."]);
    }
    else if (this.purchaseorderDetails.IsVerificationEnabled == false && this.purchaseorderDetails.POStatus != "active") {
      this.purchaseorderDetails.IsModificationAllowed = false;
      //this.messageBoxService.showMessage("Warning", ["You cannot edit or cancel this order."]);
    }
    else {
      this.purchaseorderDetails.IsModificationAllowed = true;
    }
  }

  //this is used to print the receipt
  print() {
    this.printDetaiils = document.getElementById("printpage");
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetaiils = null;
    this.showPrint = false;
  }
  //route to purchase order list page
  purchaseorderList() {
    this.router.navigate(['/ProcurementMain/PurchaseOrder/PurchaseOrderList']);
  }
  EditPurchaseOrder(status) {
    if (status == "complete" || status == "partial") {
      this.messageBoxService.showMessage("Access Denied", ["Good Receipt has already been created.", "Further editing is forbidden."]);
    }
    else {
      this.editPO = true;
      this.inventoryService.POId = this.purchaseorderID;
      //this.router.navigate(['/ProcurementMain/PurchaseOrder/PurchaseOrderAdd'],{ queryParams: { id: this.inventoryService.POId }});
      this.router.navigate(['/ProcurementMain/PurchaseOrder/PurchaseOrderAdd']);
    }
  }
  //Confirmation for Purchase Order Cancel
  WithdrawPO(status) {
    if (status == "complete") {
      this.messageBoxService.showMessage("Access Denied", ["Good Receipt has already been created.", "Cancelling is forbidden."]);
    } else {
      this.cancelPO();
    }
  }
  //Purchase Order Cancellation Method
  cancelPO() {
    this.procBLService.PostPurchaseOrderCancelDetail(this.purchaseorderDetails.PurchaseOrderId, this.purchaseorderDetails.CancelRemarks)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            this.purchaseorderList();
            this.messageBoxService.showMessage("Success", [`Purchase Order ${this.purchaseorderDetails.PurchaseOrderId} Cancelled`]);
          } else {
            this.messageBoxService.showMessage("Error", ["Purchase Order Cancel Failed"]);
          }
        },
        err => {
          this.messageBoxService.showMessage("Error", [err.ErrorMessage]);
        });
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
  public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }

  KeysPressed(event) {
    if (event.keyCode == 27) { ////if ESCAPE_KEYCODE key is pressed
      this.purchaseorderList();
    }
  }
}
