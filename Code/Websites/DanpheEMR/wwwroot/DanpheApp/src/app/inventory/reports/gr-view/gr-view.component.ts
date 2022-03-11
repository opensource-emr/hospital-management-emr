import { Component, Input, ChangeDetectorRef } from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { CoreService } from "../../../core/shared/core.service";
import { GoodsReceipt } from "../../shared/goods-receipt.model";
import { GoodsReceiptItems } from "../../shared/goods-receipt-item.model";
import * as moment from "moment/moment";
@Component({
  selector: "gr-view",
  templateUrl: "./gr-view.component.html",
})
export class GRViewComponent {
  public goodsreceiptID: number = null;
  public goodsreceiptDetails: GoodsReceipt = new GoodsReceipt();
  public goodsreceiptItemsDetails: Array<GoodsReceiptItems> = new Array<
    GoodsReceiptItems
  >();
  //msgBoxServ: any;
  creator: any = new Object();

  public header: any = null;
  public showGR: boolean = false;
  private GRId: number = 0;
  constructor(
    public changeDetect: ChangeDetectorRef,
    public messageBoxService: MessageboxService,
    public inventoryBLService: InventoryBLService,
    public coreservice: CoreService
  ) {}

  @Input("GRId")
  public set getGRId(val) {
    if (val > 0) {
      this.changeDetect.detectChanges();
      this.GRId = 0;
      this.showGR = true;
      this.GRId = val;
      this.GetGRDetailsById();
    }
  }

  public GetGRDetailsById() {
    this.header = JSON.parse(this.coreservice.Parameters[1].ParameterValue);
    this.GetInventoryBillingHeaderParameter();
    this.LoadGoodsReceiptDetails();
  }
  LoadGoodsReceiptDetails() {
    if (this.GRId > 0) {
      this.inventoryBLService
        .GetGRItemsByGRId(this.GRId)
        .subscribe((res) => this.ShowGoodsReceiptDetails(res));
    } else {
      this.messageBoxService.showMessage("notice-message", [
        "Please, Select GoodsReceipt for Details.",
      ]);
      this.Close();
    }
  }
  ShowGoodsReceiptDetails(res) {
    if (res.Status == "OK") {
      this.goodsreceiptItemsDetails = res.Results.grItems;
      this.creator = res.Results.creator;
      this.goodsreceiptDetails = res.Results.grDetails;
      if (this.goodsreceiptItemsDetails.length > 0) {
        this.goodsreceiptItemsDetails.forEach((itm) => {
          if (itm.ExpiryDate != null)
            itm.ExpiryDate = moment(itm.ExpiryDate).format("DD-MM-YYYY");
        });
        this.goodsreceiptDetails.GoodsReceiptDate = moment(
          this.goodsreceiptDetails.GoodsReceiptDate
        ).format("YYYY-MM-DD");
        this.goodsreceiptDetails.ReceivedDate = moment(
          this.goodsreceiptDetails.ReceivedDate
        ).format("YYYY-MM-DD");
        this.goodsreceiptDetails.CreatedOn = moment(
          this.goodsreceiptDetails.CreatedOn
        ).format("YYYY-MM-DD");
      } else {
        this.messageBoxService.showMessage("notice-message", [
          "Selected GoodsReceipt is without Items",
        ]);
        this.Close();
      }
    } else {
      this.messageBoxService.showMessage("notice-message", [
        "There is no GoodsReceipt details !",
      ]);
      this.Close();
    }
  }
  public Close() {
    this.showGR = false;
    this.GRId = 0;
  }
  Print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open(
      "",
      "_blank",
      "width=800,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no"
    );
    popupWinindow.document.open();
    popupWinindow.document.write(
      `
        <html>
          <head>
          <style>
            .img-responsive{ position: relative;left: -65px;top: 10px;}
            .qr-code{position:relative;left: 87px;}
            .cancelStamp {transform: rotate(12deg);color: #555;font-size: 3rem;font-weight: 700;border: 0.25rem solid #555;display: inline-block;padding: 0.25rem 1rem;text-transform: uppercase;border-radius: 1rem;font-family: 'Courier';mix-blend-mode: multiply;color: #D23;border: 0.5rem solid #D23;transform: rotate(-14deg);border-radius: 0;}
          </style>
          <link rel="stylesheet" type="text/css" href="../../../themes/theme-default/ReceiptList.css" />
          </head>
          <body onload="window.print()">` +
        printContents +
        `</body>
        </html>`
    );
    popupWinindow.document.close();
  }
  public headerDetail: { header1, header2, header3, header4, hospitalName; address; email; PANno; tel; DDA };

  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreservice.Parameters.find(
      (a) => a.ParameterName == "Inventory Receipt Header"
    ).ParameterValue;
    if (paramValue) this.headerDetail = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage("error", [
        "Please enter parameter values for Inventory Billing header",
      ]);
  }
}
