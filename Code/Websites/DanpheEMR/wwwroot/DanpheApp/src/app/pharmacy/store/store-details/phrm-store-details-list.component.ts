import { Component, ChangeDetectorRef } from "@angular/core";
import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { PharmacyService } from "../../shared/pharmacy.service"
import { MessageboxService } from "../../../shared/messagebox/messagebox.service"
import { Router } from '@angular/router';
import { PHRMStoreStockModel } from "../../shared/phrm-storestock.model";
import { IMRPUpdatedStock } from "../../setting/mrp/phrm-update-mrp.component";
import { ENUM_StockLocations } from "../../../shared/shared-enums";
import { SecurityService } from "../../../security/shared/security.service";
import { PHRMUpdatedStockVM } from "../../setting/expiry-batch/phrm-update-exp-batch.component ";
import { DispensaryService } from "../../../dispensary/shared/dispensary.service";
import { PHRMStoreModel } from "../../shared/phrm-store.model";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import * as moment from "moment";
@Component({
  selector: 'store-details-list',
  templateUrl: "./phrm-store-details-list.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PHRMStoreDetailsListComponent {

  public stockDetailsGridColumns: Array<any> = null;
  public stockList: Array<any> = new Array<any>();
  loading: boolean = false;
  public stockListCopy: Array<any> = new Array<any>();
  public stockDetailList: Array<any> = new Array<any>();
  public rowIndex: number = null;
  public showStockList: boolean = true;
  public selectedItem: PHRMStoreStockModel = new PHRMStoreStockModel();
  public Status: string = "";
  public goodReceiptId: any;
  public showTransferPage: boolean = false;

  public storeList: Array<any> = new Array<any>();
  public currentDispensary: PHRMStoreModel = new PHRMStoreModel();
  public showUpdateMRPPopUpBox: boolean = false;
  public showUpdateExpBatchPopUpBox: boolean = false;
  public selectedStockForMRPUpdate: IMRPUpdatedStock;
  public selectedStockForExpBatchUpdate: PHRMUpdatedStockVM;
  public showStockWithZeroQty: boolean = false;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public selectedStoreId: number = null;
  selectedStockBarcodeNumber: number;
  showBarcodePopUp: boolean;
  printDetaiils: HTMLElement;
  showPrint: boolean;
  constructor(
    public pharmacyBLService: PharmacyBLService, public pharmacyService: PharmacyService,
    public changeDetector: ChangeDetectorRef, public router: Router,
    public msgBoxServ: MessageboxService, public dispensaryService: DispensaryService,
    public securityService: SecurityService) {
    this.GetStockDetailsList();
    this.GetPharmacyStores();
  }
  ngOnInit() {
    var phrmGridColumns = new PHRMGridColumns(this.securityService);
    this.stockDetailsGridColumns = phrmGridColumns.StoreStockDetailList;
    //this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('ExpiryDate', false)]); 
  }
  gridExportOptions = {
    fileName: 'PharmacyStocksReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };
  // GET: Stock Details with 0, null or > 0 Quantity
  //this stock details with all unique (by ItemId,ExpiryDate,BatchNo)  records with sum of Quantity
  //items with 0 quantity or more than 0 showing in list    
  //get all items list with 0 or more than 0 stock qty for manage stock items
  GetStockDetailsList() {
    this.pharmacyBLService.GetMainStoreStock(true)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.stockList = res.Results;
          this.stockListCopy = this.stockList;
          this.FilterStockList();

        }
        if (res.Status == 'OK' && res.Results.length == 0) {
          this.msgBoxServ.showMessage("Error", ["No data is available"]);
        }
      });
  }
  //get all the available Dispensary
  GetPharmacyStores() {
    this.dispensaryService.GetAllPharmacyStores()
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          this.storeList = res.Results;
        }
        if (res.Status == 'OK' && res.Results.length == 0) {
          this.msgBoxServ.showMessage("Error", ["Stores are not available."]);
        }
      });
  }

  //Showing zero quantity item details
  FilterStockList() {
    //filter stock based on store
    this.stockList = this.stockListCopy.filter(s => s.StoreId == this.selectedStoreId || this.selectedStoreId == null);
    if (this.showStockWithZeroQty) {
      this.stockList = this.stockList.filter(a => a.AvailableQuantity < 1);
    }
    else {
      this.stockList = this.stockList.filter(a => a.AvailableQuantity > 0);
    }
  }
  ////Grid Action Method
  StockDetailsGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "manage-store": {
        this.rowIndex = $event.RowIndex;
        this.ManageStock($event.Data);
        break;
      }
      case "transfer": {
        this.rowIndex = $event.RowIndex;
        this.selectedItem = Object.assign(this.selectedItem, $event.Data);
        this.showTransferPage = true;
        this.selectedItem.Quantity = $event.Data.AvailableQuantity;
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
        this.selectedStockForMRPUpdate = { ItemId: $event.Data.ItemId, BatchNo: $event.Data.BatchNo, ExpiryDate: $event.Data.ExpiryDate, LocationId: ENUM_StockLocations.Store, MRP: $event.Data.MRP, GoodsReceiptItemId: $event.Data.GoodsReceiptItemId, oldMRP: $event.Data.MRP, CostPrice: $event.Data.CostPrice };
        break;
      }
      case "update-expirydate-batchno": {
        this.showUpdateExpBatchPopUpBox = true;
        this.selectedStockForExpBatchUpdate = null;
        this.selectedStockForExpBatchUpdate = { ItemId: $event.Data.ItemId, BatchNo: $event.Data.BatchNo, ExpiryDate: $event.Data.ExpiryDate, LocationId: ENUM_StockLocations.Store, MRP: $event.Data.MRP, GoodsReceiptItemId: $event.Data.GoodsReceiptItemId, OldBatchNo: $event.Data.OldBatchNo, OldExpiryDate: $event.Data.OldExpiryDate, OldMRP: $event.Data.OldMRP, CostPrice: $event.Data.CostPrice };
        break;
      }
      case "print-barcode": {
        this.openBarcodePopUp($event.Data.BarcodeNumber);
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
        this.selectedItem.Quantity = data.AvailableQuantity;
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
                  let tempItm = this.stockList[this.rowIndex];
                  if (this.selectedItem.InOut == 'in') {
                    this.stockList[this.rowIndex].AvailableQuantity = tempItm.AvailableQuantity + this.selectedItem.UpdatedQty;
                  } else if (this.selectedItem.InOut == 'out') {
                    this.stockList[this.rowIndex].AvailableQuantity = tempItm.AvailableQuantity - this.selectedItem.UpdatedQty;
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
    this.selectedItem.DispensaryId = this.currentDispensary.StoreId;
    if (this.selectedItem.UpdatedQty <= 0) {
      alert("Transfer Quantity is not valid.");
    }
    else if (this.selectedItem.UpdatedQty > this.selectedItem.Quantity) {
      alert("Transfer Quantity is greater than Available Quantity.")
    }
    else if (this.selectedItem.StoreManageValidator.controls['UpdatedQty'].status == 'INVALID') {
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
              let tempItm = this.stockList[this.rowIndex];
              this.stockList[this.rowIndex].AvailableQuantity = tempItm.AvailableQuantity - this.selectedItem.UpdatedQty;
              //this.stockDetailsList = this.stockDetailsList.filter(a => a.AvailableQuantity != 0);
              this.stockList = this.stockList.slice();
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
    this.currentDispensary = null;
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
      var stockInClient = this.stockList.filter(s => s.ItemId == updatedStock.ItemId && s.ExpiryDate == updatedStock.ExpiryDate && s.BatchNo == updatedStock.BatchNo);
      stockInClient.forEach(stock => stock.MRP = updatedStock.MRP);
      this.stockList = this.stockList.slice();
    }

  }
  CallBackUpdateExpiryDateandBatch($event) {
    this.showUpdateExpBatchPopUpBox = false;
    if ($event.event == 'update') {
      let updatedStock = $event.stock;
      var stockInClient = this.stockList.filter(s => s.ItemId == updatedStock.ItemId && s.ExpiryDate == updatedStock.OldExpiryDate && s.BatchNo == updatedStock.OldBatchNo);
      stockInClient.forEach(stock => { stock.ExpiryDate = updatedStock.ExpiryDate; stock.BatchNo = updatedStock.BatchNo });
      this.stockList = this.stockList.slice();
    }
  }
  OnNewStockReceive() {
    this.GetStockDetailsList();
  }


  // Barcode Pop up
  openBarcodePopUp(barcodeNumber: number) {
    if (barcodeNumber == null) {
      this.msgBoxServ.showMessage("Failed", ["Barcode not found for this stock."])
      return;
    }
    this.selectedStockBarcodeNumber = barcodeNumber;
    this.showBarcodePopUp = true;
  }
  closeBarcodePopUp() {
    this.showBarcodePopUp = false;
    this.selectedStockBarcodeNumber = null;
  }
  printBarcode() {
    this.print("stock-barcode");
  }

  // Print Functions
  print(idToBePrinted) {
    this.printDetaiils = document.getElementById(idToBePrinted);
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetaiils = null;
    this.showPrint = false;
  }
  public hotkeys(event) {
    //For ESC key => close the pop up
    if (event.keyCode == 27) {
          this.closeBarcodePopUp();
    }
}
}



