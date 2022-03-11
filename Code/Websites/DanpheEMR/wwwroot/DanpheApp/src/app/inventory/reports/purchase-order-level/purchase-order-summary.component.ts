import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { PurchaseOrderSummeryReport } from '../shared/purchase-order-summery-report.model'
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { ReportingService } from "../../../reporting/shared/reporting-service";

import * as moment from 'moment/moment';
import { VendorMaster } from '../../shared/vendor-master.model';
import { InventoryService } from '../../shared/inventory.service';
import { ItemModel } from "../../../accounting/settings/shared/item.model";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
@Component({
  //selector: 'my-app',
  templateUrl: "./purchase-order-summary.component.html"  //"/InventoryReports/PurchaseOrderSummery"

})
export class PurchaseOrderSummaryComponent {
  public FromDate: Date = null;
  public ToDate: Date = null;
  public VendorList: Array<VendorMaster> = new Array<VendorMaster>();
  public itemList: Array<ItemModel> = new Array<ItemModel>();
  public CurrentPurchaseOrder: PurchaseOrderSummeryReport = new PurchaseOrderSummeryReport();
  public selecteditem: any;
  public selectedVndr: any;
  public selectedItemSubCategory: string = '';
  public selectedItemCode: string = '';
  public PurchaseOrderReportColumns: Array<any> = null;
  public selectedItemTypeFilter: string = "All";

  public filteredPurchaseOrderReportData: Array<PurchaseOrderSummeryReport> = [];
  public PurchaseOrderReportData: Array<PurchaseOrderSummeryReport> = [];

  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public StoreId: number;
  userHasChangedDateRange: boolean;
  constructor(public inventoryBLService: InventoryReportsBLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService, public inventoryService: InventoryService,
    private _activateInventoryService: ActivateInventoryService) {
    this.PurchaseOrderReportColumns = this.reportServ.reportGridCols.PurchaseOrderReport;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('Date', false)]);
    this.CurrentPurchaseOrder.FromDate = moment().format('YYYY-MM-DD');
    this.CurrentPurchaseOrder.ToDate = moment().format('YYYY-MM-DD');
    this.GetVendorList();
    this.GetItem();
    this.StoreId = this._activateInventoryService.activeInventory.StoreId;
  }
  gridExportOptions = {
    fileName: 'PurchaseOrderList' + moment().format('YYYY-MM-DD') + '.xls',
  };

  ShowPurchaseOrderSummery() {
    this.CurrentPurchaseOrder.VendorName = (this.selectedVndr != null) ? this.selectedVndr.VendorName : null;
    this.CurrentPurchaseOrder.ItemName = (this.selecteditem != null) ? this.selecteditem.ItemName : null;
    this.CurrentPurchaseOrder.ItemCode = (this.selectedItemCode != null) ? this.selectedItemCode : null;
    this.CurrentPurchaseOrder.SubCategory = (this.selectedItemSubCategory != null) ? this.selectedItemSubCategory : null;

    // clear the grid data before getting the reloaded
    this.filteredPurchaseOrderReportData = [];
    if (this.userHasChangedDateRange) {
      // call server side
      this.getPurchaseOrderReportDataFromServer();
    }
    else {
      // call client side filter
      this.filterPODataInClientSide()
    }

  }
  private getPurchaseOrderReportDataFromServer() {
    this.inventoryBLService.ShowPurchaseOrder(this.CurrentPurchaseOrder, this.StoreId)
      .subscribe(
        res => {
          if (res.Status == "OK" && res.Results.length > 0) {
            this.PurchaseOrderReportData = res.Results;
            this.filterPODataInClientSide();
          }
          else if (res.Status == "OK" && res.Results.length == 0) {
            this.msgBoxServ.showMessage("Notice-Message", ["There is no data available."]);
          }
          else {
            this.showErrorMessageInScreen(res.ErrorMessage);
          }

        },
        err => this.showErrorMessageInScreen(err),
        // after the response is return successfully, set userHasChangedDateRange to false again.
        () => this.userHasChangedDateRange = false
      );
  }

  public filterPODataInClientSide() {
    this.filteredPurchaseOrderReportData = this.PurchaseOrderReportData;
    if (this.CurrentPurchaseOrder.VendorName) {
      this.filteredPurchaseOrderReportData = this.filteredPurchaseOrderReportData.filter(p => p.VendorName == this.CurrentPurchaseOrder.VendorName);
    }
    if (this.CurrentPurchaseOrder.ItemName) {
      this.filteredPurchaseOrderReportData = this.filteredPurchaseOrderReportData.filter(p => p.ItemName == this.CurrentPurchaseOrder.ItemName);
    }
    if (this.CurrentPurchaseOrder.SubCategory) {
      this.filteredPurchaseOrderReportData = this.filteredPurchaseOrderReportData.filter(p => p.SubCategory == this.CurrentPurchaseOrder.SubCategory);
    }
    if (this.CurrentPurchaseOrder.ItemCode) {
      this.filteredPurchaseOrderReportData = this.filteredPurchaseOrderReportData.filter(p => p.ItemCode == this.CurrentPurchaseOrder.ItemCode);
    }

    switch (this.selectedItemTypeFilter) {
      case "Consumables": {
        this.filteredPurchaseOrderReportData = this.filteredPurchaseOrderReportData.filter(P => P.ItemType == "Consumables");
        break;
      }
      case "CapitalGoods": {
        this.filteredPurchaseOrderReportData = this.filteredPurchaseOrderReportData.filter(P => P.ItemType == "Capital Goods");
        break;
      }
      default: {
        this.filteredPurchaseOrderReportData = this.filteredPurchaseOrderReportData;
      }
    }
  }

  private showErrorMessageInScreen(err) {
    this.msgBoxServ.showMessage("Failed", [err]);
  }
  OnDateRangeChange($event) {
    if ($event) {
      this.CurrentPurchaseOrder.FromDate = $event.fromDate;
      this.CurrentPurchaseOrder.ToDate = $event.toDate;
      this.userHasChangedDateRange = true;
    }
  }
  GetVendorList() {
    try {
      this.VendorList = this.inventoryService.allVendorList;
      if (this.VendorList.length <= 0) {
        this.msgBoxServ.showMessage("Failed", ["Failed to load the vendor list."]);
      }
      else {
        this.VendorList = this.VendorList.filter(vendor => vendor.IsActive == true);
      }
    } catch (ex) {
      this.msgBoxServ.showMessage("Failed", ["Something went wrong while loading vendor list."]);
    }
  }
  VendorListFormatter(data: any): string {
    return data["VendorName"];
  }
  onVendorChange() {
    let vendor = null;
    if (!this.selectedVndr) {
      this.CurrentPurchaseOrder.ItemId = null;
    }
    else if (typeof (this.selectedVndr) == 'string') {
      vendor = this.VendorList.find(a => a.VendorName.toLowerCase() == this.selectedVndr.toLowerCase());
    }
    else if (typeof (this.selectedVndr == "object")) {
      vendor = this.selectedVndr;

    }
    if (vendor) {
      this.CurrentPurchaseOrder.VendorId = vendor.vendorId;
    }
    else {
      this.CurrentPurchaseOrder.VendorId = null;
    }
  }

  GetItem() {
    this.inventoryBLService.GetItem()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.itemList = res.Results.filter(a => a.IsActive == true);
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      });
  }
  ItemListFormatter(data: any): string {
    return data["ItemName"];
  }
  onItemChange() {
    let item = null;
    if (!this.selecteditem) {
      this.CurrentPurchaseOrder.ItemId = null;
    }
    else if (typeof (this.selecteditem) == 'string') {
      item = this.itemList.find(a => a.ItemName.toLowerCase() == this.selecteditem.toLowerCase());

    }
    else if (typeof (this.selecteditem == "object")) {
      item = this.selecteditem;

    }
    if (item) {
      this.CurrentPurchaseOrder.ItemId = item.ItemId;
    }
    else {
      this.CurrentPurchaseOrder.ItemId = null;
    }
  }

  clearAllFilters() {
    this.selectedVndr = null;
    this.selecteditem = null;
    this.selectedItemCode = '';
    this.selectedItemSubCategory = '';
    this.selectedItemTypeFilter = 'All';

    this.CurrentPurchaseOrder.VendorName = null;
    this.CurrentPurchaseOrder.ItemName = null;
    this.CurrentPurchaseOrder.ItemCode = null;
    this.CurrentPurchaseOrder.SubCategory = null;
    this.filterPODataInClientSide();
  }
  showClearFilterButton() {
    return this.selectedVndr
      ||
      this.selecteditem
      ||
      this.selectedItemCode != ''
      || 
      this.selectedItemSubCategory != ''
      || 
      (this.selectedItemTypeFilter != 'All');
  }
}
