import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { StockLevelReport } from '../../shared/stock-level-report.model';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../../shared/inventory-reports.dl.service';
import { ReportingService } from "../../../../reporting/shared/reporting-service";
import { InventoryBLService } from '../../../shared/inventory.bl.service';
import { PHRMStoreModel } from '../../../../pharmacy/shared/phrm-store.model';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
import { CommonFunctions } from '../../../../shared/common.functions';
import { ActivateInventoryService } from '../../../../shared/activate-inventory/activate-inventory.service';
import * as moment from 'moment/moment';
@Component({
  //selector: 'my-app',
  templateUrl: "./stock-level.component.html"

})
export class StockLevelComponent implements OnInit {
  public value: string = 'a';
  public CurrentStockLevel: StockLevelReport = new StockLevelReport();
  public ItemList: any[] = [];
  public filteredStockLevelReport: Array<any> = new Array<any>();
  StockLevelReportColumns: Array<any> = null;
  StockLevelReportData: Array<any> = new Array<any>();
  Totalvalue: any;
  public storeList: Array<PHRMStoreModel> = new Array<PHRMStoreModel>();
  SelectedStores: Array<any> = new Array<any>();
  public preSelectedStores: Array<any> = new Array<any>();
  selectedIds: string = "";
  public showStoreList: boolean = false;
  public DetailsView: boolean = false;
  public grdetails: Array<any> = new Array<any>();
  public itemDetails = { ItemName: '', ItemCode: '', ItemType: '' };
  public selectedGRCategory: string = "Consumables & Capital Goods";
  public summary = { TotalQuantity: 0, TotalStockValue: 0 };
  public storeNames: string = "";
  public loading: boolean = false;
  constructor(public inventoryReportBLService: InventoryReportsBLService,
    public inventoryDLService: InventoryReportsDLService,
    public inventoryService: InventoryBLService,
    public reportServ: ReportingService,
    public _activateInventoryService: ActivateInventoryService,
    public msgBoxServ: MessageboxService,
    public changedDetector: ChangeDetectorRef) {

    this.showStoreList = false;
    this.ShowStoreList();
  }

  ngOnInit() {
  }

  gridExportOptions = {
    fileName: 'CurrentStockLevelList' + moment().format('YYYY-MM-DD') + '.xls',
  };
  LoadItemList(): void {
    this.inventoryService.GetItemListByStoreId(this._activateInventoryService.activeInventory.StoreId)
      .subscribe(
        res =>
          this.CallBackGetItemList(res),
        err => {
          console.log(err);
          this.msgBoxServ.showMessage("failed", ['failed to get Item.. please check log for details.']);
        }
      );
  }
  ShowStoreList() {
    this.inventoryReportBLService.LoadInventoryStores()
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.changedDetector.detectChanges();
          this.storeList = res.Results;
          if (this.storeList.length > 0) {
            var preselectedStore = this.storeList.filter(s => s.StoreId == this._activateInventoryService.activeInventory.StoreId);
            if (preselectedStore.length > 0) {
              this.preSelectedStores.push(preselectedStore[0]);
              this.SelectedStores = this.preSelectedStores;
              this.selectedIds = this.SelectedStores.map(({ StoreId }) => StoreId).toString();
              this.storeNames = this.SelectedStores.map(({ Name }) => Name).toString();
            }
          }
          this.showStoreList = true;
          // this.ShowStockLevelReport();
        }
      },
        err => this.Error(err));
  }
  onChange($event) {
    let x = $event;
    this.SelectedStores = $event;
    this.selectedIds = this.SelectedStores.map(({ StoreId }) => StoreId).toString();
    this.storeNames = this.SelectedStores.map(({ Name }) => Name).toString();
    this.filteredStockLevelReport = new Array<StockLevelReport>();
    this.summary.TotalQuantity = 0;
    this.summary.TotalStockValue = 0;

  }
  CallBackGetItemList(res) {
    if (res.Status == 'OK') {
      this.ItemList = [];
      if (res && res.Results) {
        this.ItemList = res.Results
      }
    }
    else {
      this.msgBoxServ.showMessage("failed", ['failed to get Item.. please check log for details.']);
    }
  }
  SelectItemFromSearchBox(Item) {
    this.CurrentStockLevel.ItemId = Item.ItemId;
  }

  ShowStockLevelReport() {
    this.loading = true;
    this.StockLevelReportData = new Array<StockLevelReport>();
    this.summary = { TotalQuantity: 0, TotalStockValue: 0 }
    if (this.selectedIds != "") {
      this.inventoryReportBLService.ShowStockLevelReportDataByItemId(this.selectedIds)
        .map(res => res)
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    }
    else {
      this.msgBoxServ.showMessage("Warn", ['Please select Store']);
      this.loading = false;
    }

  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
    this.loading = false;
  }
  Success(res) {
    if (res.Status == "OK") {
      this.StockLevelReportColumns = this.reportServ.reportGridCols.CurrentStockLevelReport;
      this.StockLevelReportData = res.Results;
      this.filteredStockLevelReport = this.StockLevelReportData;
      var category = this.selectedGRCategory;
      this.filteredStockLevelReport = (category != "Consumables & Capital Goods") ? this.StockLevelReportData.filter(s => s.ItemType == category) : this.StockLevelReportData;

      if (this.filteredStockLevelReport.length > 0) {
        this.Totalvalue = this.filteredStockLevelReport.map(c => c.StockValue).reduce((sum, current) => sum + current);
        let grandTotal = CommonFunctions.getGrandTotalData(this.filteredStockLevelReport);
        this.summary.TotalQuantity = grandTotal[0].AvailableQuantity;
        this.summary.TotalStockValue = grandTotal[0].StockValue;
      }
      else {
        this.msgBoxServ.showMessage("notice-message", ['Data is Not Available '])
      }
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
    this.loading = false;
  }

  LoadStockLevelReportByStatus(value: string) {
    this.filteredStockLevelReport = new Array<StockLevelReport>();
    this.summary = { TotalStockValue: 0, TotalQuantity: 0 };
    this.selectedGRCategory = "";
    if (this.value == 'b') {
      this.selectedGRCategory = "Capital Goods";
      this.filteredStockLevelReport = this.StockLevelReportData.filter(s => s.ItemType == 'Capital Goods');
      if (this.filteredStockLevelReport.length > 0) {
        this.Totalvalue = this.filteredStockLevelReport.map(c => c.TotalValue).reduce((sum, current) => sum + current);
      }
    }
    if (this.value == 'c') {
      this.selectedGRCategory = "Consumables";
      this.filteredStockLevelReport = this.StockLevelReportData.filter(s => s.ItemType == 'Consumables');
      if (this.filteredStockLevelReport.length > 0) {
        this.Totalvalue = this.filteredStockLevelReport.map(c => c.TotalValue).reduce((sum, current) => sum + current);
      }
    }
    if (this.value == 'a') {
      this.selectedGRCategory = "Consumables & Capital Goods";
      this.filteredStockLevelReport = this.StockLevelReportData;
      if (this.filteredStockLevelReport.length > 0) {
        this.Totalvalue = this.filteredStockLevelReport.map(c => c.TotalValue).reduce((sum, current) => sum + current);
      }
    }
    this.getSummaryData();
  }
  getSummaryData() {
    if (this.filteredStockLevelReport && this.filteredStockLevelReport.length > 0) {
      this.summary.TotalQuantity = this.filteredStockLevelReport.map(c => c.AvailableQuantity).reduce((sum, current) => sum + current, 0);
      this.summary.TotalStockValue = this.filteredStockLevelReport.map(c => c.StockValue).reduce((sum, current) => sum + current, 0);
    }
    let grandTotal = CommonFunctions.getGrandTotalData(this.filteredStockLevelReport);
    this.summary.TotalQuantity = grandTotal[0].AvailableQuantity;
    this.summary.TotalStockValue = grandTotal[0].StockValue;
  }
  StockLevelGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        this.DetailsView = true;
        this.itemDetails.ItemName = $event.Data.ItemName;
        this.itemDetails.ItemCode = $event.Data.Code;
        this.itemDetails.ItemType = $event.Data.ItemType;
        this.GetItemDetails($event.Data.StoreIds, $event.Data.ItemId);
        break;
      }
      default:
        break;
    }
  }
  ClosePopup() {
    this.DetailsView = false;
  }
  GetItemDetails(selectedIds, itemId) {
    if (itemId > 0 || itemId != null) {
      this.inventoryReportBLService.GetItemDetailsByIds(selectedIds, itemId)
        .map(res => res)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.grdetails = res.Results;
          }
        },
          err => this.Error(err));
    }
  }
}
