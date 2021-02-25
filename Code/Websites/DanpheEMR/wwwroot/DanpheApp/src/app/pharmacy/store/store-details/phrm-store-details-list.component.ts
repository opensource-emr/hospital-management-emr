import { Component, ChangeDetectorRef } from "@angular/core";
import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { PharmacyService } from "../../shared/pharmacy.service"
import { MessageboxService } from "../../../shared/messagebox/messagebox.service"
import { Router } from '@angular/router';
import { PHRMStoreStockModel } from "../../shared/phrm-storestock.model";
import { PHRMDispensaryModel } from "../../shared/phrm-dispensary.model";
import { IMRPUpdatedStock } from "../../setting/mrp/phrm-update-mrp.component";
import { ENUM_StockLocations } from "../../../shared/shared-enums";
import { SecurityService } from "../../../security/shared/security.service";
import { PHRMUpdatedStockVM } from "../../setting/expiry-batch/phrm-update-exp-batch.component ";
import { invalid } from "@angular/compiler/src/render3/view/util";
@Component({
  selector: 'store-details-list',
  templateUrl: "./phrm-store-details-list.html"
})
export class PHRMStoreDetailsListComponent {

  public stockDetailsGridColumns: Array<any> = null;
  public stockDetailsList: Array<any> = new Array<any>();
  loading: boolean = false;
  public newstockDetailsList: Array<any> = new Array<any>();
  public stockDetailList: Array<any> = new Array<any>();
  public rowIndex: number = null;
  public showStockList: boolean = true;
  public selectedItem: PHRMStoreStockModel = new PHRMStoreStockModel();
  public Status: string = "";
  public goodReceiptId:any;
  public showTransferPage: boolean = false;

  public dispensaryList: Array<any> = new Array<any>();
  public currentDispensary: PHRMDispensaryModel = new PHRMDispensaryModel();
  public showUpdateMRPPopUpBox: boolean = false;
  public showUpdateExpBatchPopUpBox: boolean = false;
  public selectedStockForMRPUpdate: IMRPUpdatedStock;
  public selectedStockForExpBatchUpdate: PHRMUpdatedStockVM;
  public ZeroAvlQty:any;
  constructor(
    public pharmacyBLService: PharmacyBLService, public pharmacyService: PharmacyService,
    public changeDetector: ChangeDetectorRef, public router: Router,
    public msgBoxServ: MessageboxService,
    public securityService: SecurityService) {
    this.GetStockDetailsList();
    this.GetDispensaryList();
  }
  // GET: Stock Details with 0, null or > 0 Quantity
  //this stock details with all unique (by ItemId,ExpiryDate,BatchNo)  records with sum of Quantity
  //items with 0 quantity or more than 0 showing in list    
  //get all items list with 0 or more than 0 stock qty for manage stock items
  GetStockDetailsList() {
    this.pharmacyBLService.GetStoreRequestedItemList(this.Status)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          var phrmGridColumns = new PHRMGridColumns(this.securityService);
          this.stockDetailsGridColumns = phrmGridColumns.StoreRequestItemsList;
          this.stockDetailsList = res.Results;
          this.newstockDetailsList = this.stockDetailsList;
          this.stockDetailList  =  this.stockDetailsList;
          this.stockDetailsList = this.stockDetailsList.filter(a=>a.AvailableQty > 0)

        }
        if (res.Status == 'OK' && res.Results.length == 0) {
          this.msgBoxServ.showMessage("Error", ["No data is available"]);
        }
      });
  }
  //get all the available Dispensary
  GetDispensaryList() {
    this.pharmacyBLService.GetDispensaryList()
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          this.dispensaryList = res.Results;
          this.dispensaryList = this.dispensaryList.filter(a => a.IsActive == true);
        }
        if (res.Status == 'OK' && res.Results.length == 0) {
          this.msgBoxServ.showMessage("Error", ["Dispensary is not available."]);
        }
      });
  }

  //Showing zero quantity item details
  LoadZeroQuantity(){
    if(this.ZeroAvlQty)
    {
      this.stockDetailsList  = this.newstockDetailsList.filter(a=>a.AvailableQty < 1); 
    }
    else{
      this.stockDetailsList  = this.newstockDetailsList.filter(a=>a.AvailableQty > 0);  
	  
    } 

  }
  ////Grid Action Method
  StockDetailsGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "manage-store": {
        // let x = $event.Action;
        this.rowIndex = $event.RowIndex;
        this.ManageStock($event.Data);
        break;
      }
      case "transfer": {
        this.rowIndex = $event.RowIndex;
        this.selectedItem = Object.assign(this.selectedItem, $event.Data);
        this.showTransferPage = true;
        this.selectedItem.Quantity = $event.Data.AvailableQty;
        this.selectedItem.UpdatedQty = 0;
        this.selectedItem.ItemId = $event.Data.ItemId;
        this.selectedItem.GoodsReceiptItemId = $event.Data.GoodsReceiptItemId;
        this.selectedItem.StoreId = $event.Data.StoreId;
        this.selectedItem.Price = $event.Data.Price;
        this.selectedItem.InOut = null;
        this.selectedItem.ModifiedOn = null;
        this.selectedItem.ModifiedBy = null;
        this.selectedItem.GoodReceiptPrintId = $event.Data.GoodsReceiptItemId;
        break;
      }
      case "update-mrp": {
        this.showUpdateMRPPopUpBox = true;
        this.selectedStockForMRPUpdate = null;
        this.selectedStockForMRPUpdate = { ItemId: $event.Data.ItemId, BatchNo: $event.Data.BatchNo, ExpiryDate: $event.Data.ExpiryDate, LocationId: ENUM_StockLocations.Store, MRP: $event.Data.MRP, GoodsReceiptItemId: $event.Data.GoodsReceiptItemId,oldMRP:$event.Data.MRP ,StoreStockId:$event.Data.StoreStockId};
        break;
      }
      case "update-expirydate-batchno": {
        this.showUpdateExpBatchPopUpBox = true;
        this.selectedStockForExpBatchUpdate = null;
        this.selectedStockForExpBatchUpdate = { ItemId: $event.Data.ItemId, BatchNo: $event.Data.BatchNo, ExpiryDate: $event.Data.ExpiryDate, LocationId: ENUM_StockLocations.Store, MRP: $event.Data.MRP, GoodsReceiptItemId: $event.Data.GoodsReceiptItemId, OldBatchNo: $event.Data.OldBatchNo, OldExpiryDate: $event.Data.OldExpiryDate, OldMRP: $event.Data.OldMRP };
        break;
      }
      default:
        break;
    }
  }

  ManageStock(data) {
    try {
      if (data) {
        this.selectedItem = new PHRMStoreStockModel();
        this.selectedItem = Object.assign(this.selectedItem, data);
        this.selectedItem.Quantity = data.AvailableQty;
        this.selectedItem.UpdatedQty = 0;
        this.selectedItem.ItemId = data.ItemId;
        this.goodReceiptId = data.GoodReceiptId;
        this.selectedItem.GoodsReceiptItemId = data.GoodsReceiptItemId;
        this.selectedItem.StoreId = data.StoreId;
        this.selectedItem.IsActive = true;
        this.selectedItem.ModifiedBy = null;
        this.selectedItem.ModifiedOn = null;
        //this.selectedItem.Price = data.Price;
        this.selectedItem.InOut = null;
        //this.selectedItem.GoodReceiptPrintId = data.GoodReceiptPrintId;
        this.showStockList = false;

      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  //update stockManage transaction
  //Post to StockManage table and post to stockTxnItem table 
  SaveManagedStock() {
    try {
      if (this.selectedItem) {
        for (var b in this.selectedItem.StoreManageValidator.controls) {
          this.selectedItem.StoreManageValidator.controls[b].markAsDirty();
          this.selectedItem.StoreManageValidator.controls[b].updateValueAndValidity();
        }
        let flag = (this.selectedItem.InOut == "out") ? (this.selectedItem.Quantity < this.selectedItem.UpdatedQty) ? false : true : true;
        if ((this.selectedItem.IsValidCheck(undefined, undefined) == true) && flag) {
          this.loading = true;
          this.pharmacyBLService.PostManagedStoreDetails(this.selectedItem).
            subscribe(res => {
              if (res.Status == 'OK') {
                if (res.Results) {
                  this.msgBoxServ.showMessage("success", ["stock adjustment saved"]);
                  this.changeDetector.detectChanges();
                  let tempItm = this.stockDetailsList[this.rowIndex];
                  if (this.selectedItem.InOut == 'in') {
                    this.stockDetailsList[this.rowIndex].AvailableQty = tempItm.AvailableQty + this.selectedItem.UpdatedQty;
                  } else if (this.selectedItem.InOut == 'out') {
                    this.stockDetailsList[this.rowIndex].AvailableQty = tempItm.AvailableQty - this.selectedItem.UpdatedQty;
                  }
                  this.GetStockDetailsList();
                  this.Cancel();
                }
              }
              else {
                this.msgBoxServ.showMessage("failed", ['failed ,please check log for details.']);
                console.log(res);
                this.Cancel();
              }
            });
        } else {
          this.msgBoxServ.showMessage("notice", ['please see error message']);
          this.loading = false;

        }
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }


  Cancel() {
    this.loading = true;
    try {
      this.selectedItem = new PHRMStoreStockModel();
      this.showStockList = true;
      this.loading = false;
      this.rowIndex = null;
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //tranfer to dispensary
  transferToDispensary() {
    this.selectedItem.DispensaryId = this.currentDispensary.DispensaryId;
    if (this.selectedItem.UpdatedQty <= 0) {
      alert("Transfer Quantity is not valid.");
    }
    else if (this.selectedItem.UpdatedQty > this.selectedItem.Quantity) {
      alert("Transfer Quantity is greater than Available Quantity.")
    }
   else if (this.selectedItem.StoreManageValidator.controls['UpdatedQty'].status == 'INVALID'){
      alert("Transfer Quantity format not proper");
    }
    else {
      this.selectedItem.InOut = "out";
      this.loading = true;
      this.pharmacyBLService.TransferToDispensary(this.selectedItem).
        subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results) {
              this.msgBoxServ.showMessage("success", ["stock adjustment saved"]);
              this.changeDetector.detectChanges();
              let tempItm = this.stockDetailsList[this.rowIndex];
              this.stockDetailsList[this.rowIndex].AvailableQty = tempItm.AvailableQty - this.selectedItem.UpdatedQty;
              //this.stockDetailsList = this.stockDetailsList.filter(a => a.AvailableQty != 0);
              this.stockDetailsList = this.stockDetailsList.slice();
              this.GetStockDetailsList();
            }
            this.Cancel();
          }
          else {
            this.msgBoxServ.showMessage("Failed", ["Stock adjustment Failed"]);
            this.Cancel();
          }
        });
      this.showTransferPage = false;
      this.loading = false;
    }

  }
  //close transfer page
  Close() {
    this.showTransferPage = false;
    this.currentDispensary=null;
  }

  myDispensaryListFormatter(data: any): string {
    let html = data["Name"];
    return html;
  }
  ////This function only for show catch messages in console 
  ShowCatchErrMessage(exception) {
    if (exception) {
      this.msgBoxServ.showMessage("error", ['error please check console log for details'])
      this.showStockList = true;
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
      this.loading = false;
    }
  }
  CallBackUpdateMRP($event) {
    this.showUpdateMRPPopUpBox = false;
    if ($event.event == 'update') {
      let updatedStock = $event.stock;
      var stockInClient = this.stockDetailsList.filter(s => s.ItemId == updatedStock.ItemId && s.ExpiryDate == updatedStock.ExpiryDate && s.BatchNo == updatedStock.BatchNo);
      stockInClient.forEach(stock => stock.MRP = updatedStock.MRP);
      this.stockDetailsList = this.stockDetailsList.slice();
    }

  }
  CallBackUpdateExpiryDateandBatch($event) {
    this.showUpdateExpBatchPopUpBox = false;
    if ($event.event == 'update') {
      let updatedStock = $event.stock;
      var stockInClient = this.stockDetailsList.filter(s => s.ItemId == updatedStock.ItemId && s.ExpiryDate == updatedStock.OldExpiryDate && s.BatchNo == updatedStock.OldBatchNo);
      stockInClient.forEach(stock => { stock.ExpiryDate = updatedStock.ExpiryDate; stock.BatchNo = updatedStock.BatchNo });
      this.stockDetailsList = this.stockDetailsList.slice();

    }
  }
}



