import { Component, ChangeDetectorRef } from '@angular/core'
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { WardSupplyBLService } from '../../shared/wardsupply.bl.service';
import { WardStockModel } from '../../shared/ward-stock.model'
import WARDGridColumns from '../../shared/ward-grid-cloumns';
import { Router } from '@angular/router';
import * as moment from 'moment/moment'
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { SecurityService } from '../../../security/shared/security.service';
import { FixedAssetStockModel } from '../../../fixed-asset/shared/fixed-asset-stock.model';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
import { PHRMStoreModel } from '../../../pharmacy/shared/phrm-store.model';
import { wardsupplyService } from '../../shared/wardsupply.service';
import { WardSupplyAssetMainComponent } from '../wardsupply-asset-main.component';
@Component({
  templateUrl: "./wardsupply-asset-stock.component.html",
})
export class WardSupplyAssetStockComponent {
  public WARDAssetsStockGridColumns: Array<WARDGridColumns> = []
  public WARDAssetStockDetailsList: Array<FixedAssetStockModel> = []
  public DepartmentId: number = 0;
  public CurrentStoreId: number = 0;
  public rowIndex: number = null;
  public showStockTransfer: boolean = false;
  public departmentList: Array<any> = new Array<any>();
  public availableDepartmentList: Array<any> = new Array<any>();
  public transferBackToInventory: boolean = false;
  public FixedAssetStockId: number = 0;
  searchText: string = '';
  selectedStock: FixedAssetStockModel = new FixedAssetStockModel();
  public allFixedAssetList: Array<FixedAssetStockModel> = new Array<FixedAssetStockModel>();
  public PrintView: boolean = false;
  public selectedAssetListStatus: string = "all";
  public wardSupplyAssetMainComponent: WardSupplyAssetMainComponent
  //public selectedInventoryStatus : string ="General Inventory";
  public inventoryList: Array<PHRMStoreModel> = new Array<PHRMStoreModel>();

  public selectedInventory: number = 0;
  constructor(public securityService: SecurityService,
    public wardSupplyBLService: WardSupplyBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public router: Router,
    public wardsupplyService: wardsupplyService) {
    this.WARDAssetsStockGridColumns = WARDGridColumns.WARDAssetsStockGridColumns;
    this.selectedAssetListStatus = "all";
    this.GetFixedAssetStockDetailsList();
  }
  public OnAssetStatusChange() {
    switch (this.selectedAssetListStatus) {
      case "all": {
        this.WARDAssetStockDetailsList = this.allFixedAssetList.filter(a => a.StoreId == this.selectedInventory);
        break;
      }
      case "damaged": {
        this.WARDAssetStockDetailsList = this.allFixedAssetList.filter(a => a.IsAssetDamaged == true && a.StoreId == this.selectedInventory);
        break;
      }
      case "warrantyExpired": {
        this.WARDAssetStockDetailsList = this.allFixedAssetList.filter(a => a.WarrantyExpiryDate >= moment().format('YYYY-MM-DD') ? null : a.WarrantyExpiryDate && a.StoreId == this.selectedInventory);
      }
      default: {
        break;
      }
    }

  }
  gridExportOptions = {
    fileName: 'StockDetailsList_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  ////Grid Action Method
  StockDetailsGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      // case "transfer-inventory-stock": {
      //   let x = $event.Action;
      //   this.rowIndex = this.WARDAssetStockDetailsList.findIndex(stk => stk.FixedAssetStockId == $event.Data.FixedAssetStockId);
      //   let data = $event.Data;
      //   this.transferStock(data);
      //   break;
      // }
      case "print-barcode": {
        this.selectedStock = $event.Data;
        this.PrintView = true;
        break;
      }
      case "send-to-cssd": {
        this.selectedStock = $event.Data;
        const sendAssetToCssd = confirm(`Are you sure you want to send ${this.selectedStock.ItemName} to CSSD?`);
        if (sendAssetToCssd == true) {
          this.wardSupplyBLService.SendStockToCssd(this.selectedStock.FixedAssetStockId)
            .subscribe(res => {
              if (res.Status == "OK") {
                this.WARDAssetStockDetailsList.find(a => a.FixedAssetStockId == this.selectedStock.FixedAssetStockId).CssdStatus = "pending";
                this.WARDAssetStockDetailsList = this.WARDAssetStockDetailsList.slice();
                this.msgBoxServ.showMessage("Success", [`${this.selectedStock.ItemName} is sent to CSSD successfully.`])
              }
              else {
                this.msgBoxServ.showMessage("Failed", [`${this.selectedStock.ItemName} transfer failed.`])
              }
            }, err => {
              this.msgBoxServ.showMessage("Failed", [`${this.selectedStock.ItemName} transfer failed.`])
            })
        }
      }
      default:
        break;
    }
  }

  GetFixedAssetStockDetailsList() {
    this.GetInventoryList();
    this.wardSupplyBLService.GetFixedAssetStockBySubStoreId(this.wardsupplyService.activeSubstoreId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allFixedAssetList =
            this.allFixedAssetList = res.Results;
          this.OnAssetStatusChange();
        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get AssetsGoodsReceiptList. " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get AssetsGoodsReceiptList. " + err.ErrorMessage]);
        });
  }
  GetInventoryList() {
    this.inventoryList = this.wardsupplyService.inventoryList;

    if (this.wardsupplyService.inventoryList.length > 0) {
      this.selectedInventory = this.inventoryList[0].StoreId;
      this.OnAssetStatusChange();
    }
  }
  // transferStock(StockData) {
  //   //this.selectedStock.DepartmentId = StockData.DepartmentId;
  //   //this.selectedStock.DepartmentName = StockData.DepartmentName;
  //   this.selectedStock.ItemId = StockData.ItemId;
  //   this.selectedStock.ItemName = StockData.ItemName;
  //   //this.selectedStock.Quantity = StockData.Quantity;
  //   //this.selectedStock.AvailableQuantity = StockData.Quantity;
  //   this.selectedStock.SubStoreId = StockData.SubStoreId;
  //   //this.selectedStock.ExpiryDate = StockData.ExpiryDate;
  //   this.selectedStock.BatchNo = StockData.BatchNo;
  //   //this.selectedStock.MRP = StockData.MRP;
  //   this.availableDepartmentList = this.departmentList.filter(a => a.DepartmentId != StockData.DepartmentId);
  //   this.showStockTransfer = true;
  // }
  //cancelbutton
  Close(): void {
    this.selectedStock = new FixedAssetStockModel();
    this.showStockTransfer = false;
    this.transferBackToInventory = false;
  }
  Print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=800,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.close();
    popupWinindow.document.write('<html><head><style>.img-responsive{ position: relative;left: -65px;top: 10px;}.qr-code{position:relative;left: 87px;}</style><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.close();
  }
  Closeprint() {
    this.PrintView = false;
    this.router.navigate(['/WardSupply/FixedAsset/Stock']);
  }
  Cancel() {
    try {
      this.selectedStock = new FixedAssetStockModel();
      this.transferBackToInventory = false;
      this.rowIndex = null;
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  ////This function only for show catch messages in console 
  ShowCatchErrMessage(exception) {
    if (exception) {
      this.msgBoxServ.showMessage("Error", ['Error, Please check console log for details'])
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }

  OnInventoryChange() {
    try {
      this.OnAssetStatusChange();
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
}
