import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment";
import { CoreService } from "../../core/shared/core.service";
import { Charge } from "../../procurement/goods-receipt/goods-receipt-view/goods-receipt-view.component";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { GoodsReceiptItems } from "../shared/goods-receipt-item.model";
import { GoodsReceipt } from "../shared/goods-receipt.model";
import { InventoryBLService } from "../shared/inventory.bl.service";
import { InventoryService } from "../shared/inventory.service";
import { GeneralFieldLabels } from "../../shared/DTOs/general-field-label.dto";

@Component({
  templateUrl: "./goods-receipt-inv-view.html"
})
export class GoodsReceiptInvViewComponent implements OnInit {
  public goodsreceiptID: number = null;
  public goodsreceiptDetails: GoodsReceipt = new GoodsReceipt();
  public goodsreceiptItemsDetails: Array<GoodsReceiptItems> = new Array<GoodsReceiptItems>();

  public selectedGRItem: GoodsReceiptItems = new GoodsReceiptItems();

  public header: any = null;
  creator: any = new Object();
  public editGR: boolean = false;
  public showPrintPage: boolean = false;
  receivedRemarks: string = '';
  public showNepaliReceipt: boolean;
  printDetaiils: HTMLElement;
  showPrint: boolean;
  showFreeQty: boolean = false;
  showCCCharge: boolean = false;
  showDiscount: boolean = false;
  loading: boolean;
  verifierDetails: any[] = [];

  public GeneralFieldLabel = new GeneralFieldLabels();
  constructor(
    public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public messageBoxService: MessageboxService,
    public router: Router, public ref: ChangeDetectorRef,
    public coreservice: CoreService) {
    this.LoadGoodsReceiptDetails(this.inventoryService.GoodsReceiptId);
    this.header = JSON.parse(this.coreservice.Parameters[1].ParameterValue);
    this.GetInventoryBillingHeaderParameter();
    this.checkGRCustomization();
    this.GeneralFieldLabel = coreservice.GetFieldLabelParameter();
  }
  ngOnInit() {
    let receipt = this.coreservice.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
    this.showNepaliReceipt = (receipt == "true");
    this.setFocusById('ReceivedRemarks');
    if (this.showNepaliReceipt == false) {
      this.LoadGoodsReceiptDetails(this.inventoryService.GoodsReceiptId);
    }
    if (this.goodsreceiptDetails.GRStatus == 'verified') {
      this.setFocusById('ReceivedRemarks');
    }
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
      this.verifierDetails = res.Results.verifier;
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
  prints() {
    // this.showPrint = true;
    this.ref.detectChanges();
    //this.showPrintPage = true;    
    let popupWinindow;
    var printContents = document.getElementById("printpageInventory").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=800,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write(`
      <html>
        <head>
        <style>
          .img-responsive{ position: relative;left: -65px;top: 10px;}
          .qr-code{position:relative;left: 87px;}
          .no-print{display:none;}
          @page { size: auto;  margin: 0mm; }
          .cancelStamp {transform: rotate(12deg);color: #555;font-size: 3rem;font-weight: 700;border: 0.25rem solid #555;display: inline-block;padding: 0.25rem 0;text-transform: uppercase;border-radius: 1rem;font-family: 'Courier';mix-blend-mode: multiply;color: #D23;border: 0.5rem solid #D23;transform: rotate(-14deg);border-radius: 0;}
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
    this.router.navigate(['/Inventory/StockMain/GoodsReceiptStockList']);
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
  public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreservice.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }

  Close() {
    this.showPrintPage = false;
    this.selectedGRItem = new GoodsReceiptItems();
  }
  receive() {
    this.loading = true;//this disables the double click of Receive Button.
    if (this.receivedRemarks.trim().length == 0) {
      this.messageBoxService.showMessage("Failed", ["Remarks is mandatory"]);
      this.loading = false;
    }
    else {

      this.inventoryBLService.ReceiveGR(this.inventoryService.GoodsReceiptId, this.receivedRemarks)
        .finally(() => { this.loading = false; })//whatever happens enable the receive button.
        .subscribe(res => {
          if (res.Status == "OK") {
            this.router.navigate(['/Inventory/StockMain/GoodsReceiptStockList']);
            this.messageBoxService.showMessage("success", ["Goods Receipt Received Successfully."]);
            this.messageBoxService.showMessage("Notice-Message", ["Stock added in Inventory."]);
          }
          else if (res.Status == "Failed") {
            this.messageBoxService.showMessage("Failed", [res.ErrorMessage]);
          }
          else {
            this.messageBoxService.showMessage("Failed", ["Something went wrong..."]);
          }
        }, err => {
          this.messageBoxService.showMessage("Error", ["Something went wrong..."]);
        })
    }


  }
  checkGRCustomization() {
    let GRParameterStr = this.coreservice.Parameters.find(p => p.ParameterName == "GRFormCustomization" && p.ParameterGroupName == "Procurement");
    if (GRParameterStr != null) {
      let GRParameter = JSON.parse(GRParameterStr.ParameterValue);
      if (GRParameter.showFreeQuantity == true) {
        this.showFreeQty = true;
      }
      if (GRParameter.showCCCharge == true) {
        this.showCCCharge = true;
      }
      if (GRParameter.showDiscount == true) {
        this.showDiscount = true;
      }
    }
  }

  setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    var timer = window.setTimeout(function () {
      let htmlObject = document.getElementById(targetId);
      if (htmlObject) {
        htmlObject.focus();
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
  }
}