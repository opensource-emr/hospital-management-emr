import { Component, Input, ChangeDetectorRef } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { PurchaseOrder } from "../../shared/purchase-order.model";
import { PurchaseOrderItems } from "../../shared/purchase-order-items.model";
import * as moment from "moment/moment";
@Component({
  selector: "po-view",
  templateUrl: "./po-view.component.html",
})
export class POViewComponent {
  public purchaseorderID: number = null;
  public purchaseorderDetails: PurchaseOrder = new PurchaseOrder();
  public purchaseorderItemsDetails: Array<PurchaseOrderItems> = new Array<
    PurchaseOrderItems
  >();
  public PoTime: string = "";
  public creator: any = new Object();
  public authorizer: any = new Object();
  public vendorEmail: string = null;
  public showPO: boolean = false;
  private POId: number = 0;
  constructor(
    public changeDetect: ChangeDetectorRef,
    public coreService: CoreService,
    public messageBoxService: MessageboxService,
    private inventoryBLService: InventoryBLService
  ) {}

  @Input("POId")
  public set getPOId(val) {
    if (val > 0) {
      this.changeDetect.detectChanges();
      this.POId = 0;
      this.showPO = true;
      this.POId = val;
      this.GetPoDetailsById();
    }
  }

  public GetPoDetailsById() {
    this.GetInventoryBillingHeaderParameter();
    this.LoadPurchaseOrderDetails();
  }
  public LoadPurchaseOrderDetails() {
    if (this.POId > 0) {
      this.inventoryBLService
        .GetPOItemsByPOId(this.POId)
        .subscribe((res) => this.ShowPurchaseOrderDetails(res));
    } else {
      this.messageBoxService.showMessage("notice-message", [
        "Please, Select PurchaseOrder for Details.",
      ]);
      this.Close();
    }
  }
  ShowPurchaseOrderDetails(res) {
    if (res.Status == "OK") {
      this.purchaseorderItemsDetails = res.Results.poItems;
      this.purchaseorderDetails = res.Results.poDetails;
      this.creator = res.Results.creator;
      this.authorizer = res.Results.authorizer;
      this.vendorEmail = res.Results.poDetails.VendorEmail;
      this.PoTime = moment(this.purchaseorderDetails.PoDate).format("HH:mm");
      this.purchaseorderDetails.CancelRemarks = "";
      this.purchaseorderDetails.PoDate = moment(
        this.purchaseorderDetails.PoDate
      ).format("DD-MM-YYYY");
    } else {
      this.messageBoxService.showMessage("notice-message", [
        "There is no PurchaseOrder details !",
      ]);
      this.Close();
    }
  }

  public Close() {
    this.showPO = false;
    this.POId = 0;
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
      '<html><head><style>.img-responsive{ position: relative;left: -65px;top: 10px;}.qr-code{position:relative;left: 87px;}</style><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">' +
        printContents +
        "</body></html>"
    );
    popupWinindow.document.close();
  }

  public headerDetail: { header1, header2, header3, header4, hospitalName; address; email; PANno; tel; DDA };

  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(
      (a) => a.ParameterName == "Inventory Receipt Header"
    ).ParameterValue;
    if (paramValue) this.headerDetail = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage("error", [
        "Please enter parameter values for inventory Billing Header",
      ]);
  }
}
