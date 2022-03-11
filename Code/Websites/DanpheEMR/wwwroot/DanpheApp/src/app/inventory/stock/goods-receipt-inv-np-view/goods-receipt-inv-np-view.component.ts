import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment";
import { CoreService } from "../../../core/shared/core.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { GoodsReceiptItems } from "../../shared/goods-receipt-item.model";
import { GoodsReceipt } from "../../shared/goods-receipt.model";
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { InventoryService } from "../../shared/inventory.service";

@Component({
  selector: 'app-goods-receipt-inv-np-view',
  templateUrl: "./goods-receipt-inv-np-view.component.html",
  styleUrls: ['./goods-receipt-inv-np-view.component.css']
})
export class GoodsReceiptInvNpViewComponent implements OnInit {
  public goodsreceiptID: number = null;
  public goodsreceiptDetails: GoodsReceipt = new GoodsReceipt();
  public goodsreceiptItemsDetails: Array<GoodsReceiptItems> = new Array<GoodsReceiptItems>();

  public selectedGRItem: GoodsReceiptItems = new GoodsReceiptItems();

  public header: any = null;
  msgBoxServ: any;
  creator: any = new Object();
  public editGR: boolean = false;
  public showPrintPage: boolean = false;

  receivedRemarks: string = '';
  public showNepaliReceipt: boolean;
  isConsumableGR: boolean;
  loading: boolean = false;//sud,sanjit:20Sept'21:for double click handling in Receive Button.

  constructor(
    public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public messageBoxService: MessageboxService,
    public router: Router, public ref: ChangeDetectorRef,
    public coreservice: CoreService) {
    this.LoadGoodsReceiptDetails(this.inventoryService.GoodsReceiptId);
    this.header = JSON.parse(this.coreservice.Parameters[1].ParameterValue);
    this.GetInventoryBillingHeaderParameter();



  }
  ngOnInit() {

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

  }

  ShowGoodsReceiptDetails(res) {
    if (res.Status == "OK") {
      this.goodsreceiptItemsDetails = res.Results.grItems;
      this.creator = res.Results.creator;
      this.goodsreceiptDetails = res.Results.grDetails;
      this.isConsumableGR = (this.goodsreceiptDetails.GRCategory == "Consumables");
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
  //route to goods receipt list page
  goodsreceiptList() {
    this.router.navigate(['/Inventory/StockMain/GoodsReceiptStockList']);
  }
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
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }

  Close() {
    this.showPrintPage = false;
    this.selectedGRItem = new GoodsReceiptItems();
  }
  receive() {
    this.loading = true;
    if (this.receivedRemarks.trim().length == 0) {
      this.messageBoxService.showMessage("Failed", ["Remarks is mandatory"]);
      this.loading = false;
    }
    else {
      this.inventoryBLService.ReceiveGR(this.inventoryService.GoodsReceiptId, this.receivedRemarks)
        .finally(() => { this.loading = false; })
        .subscribe(res => {
          if (res.Status == "OK") {
            this.router.navigate(['/Inventory/StockMain/GoodsReceiptStockList']);
            this.messageBoxService.showMessage("success", ["Goods Receipt Received Successfully."]);
            this.messageBoxService.showMessage("Notice-Message", ["Stock added in Inventory."]);
          }
          else {
            this.messageBoxService.showMessage("Failed", ["Something went wrong..."]);
          }
        }, err => {
          this.messageBoxService.showMessage("Error", ["Something went wrong..."]);
        })
    }

  }


}