import { Component } from '@angular/core';
import { ReportingService } from '../../../../reporting/shared/reporting-service';
import { InventoryBLService } from '../../../../inventory/shared/inventory.bl.service';
import { SupplierWiseStockReportModel } from './supplier-wise-stock-report.model';
import { InventoryReportsBLService } from '../../shared/inventory-reports.bl.service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import * as moment from 'moment';
import { IGetRowsParams } from 'ag-grid-community';
import { IGridFilterParameter } from '../../../../shared/danphe-grid/grid-filter-parameter.interface';

@Component({
  templateUrl: './supplier-wise-stock-report.html'
})
export class SupplierWiseStockReportComponent {
  public supplierWiseStockObj: SupplierWiseStockReportModel = new SupplierWiseStockReportModel();
  supplierWiseStockReportColumns: Array<any> = null;
  supplierWiseStockReportGridData: Array<any> = new Array<SupplierWiseStockReportModel>();
  filteredEmployee: Array<any> = new Array<SupplierWiseStockReportModel>();
  public vendorList: any[] = [];
  public storeList: any[] = [];
  public itemsList: any[] = [];
  public selVendor: any = "";
  public selStore: any = "";
  public selItem: any = "";
  dateRange: string;

  FilterParameters: IGridFilterParameter[] = [];

  constructor(public invReportsBlService: InventoryReportsBLService,
    public reportServ: ReportingService,
    public msgBoxServ: MessageboxService) {
    this.supplierWiseStockReportColumns = this.reportServ.reportGridCols.SupplierWiseStockReportColumns;
    this.GetAllVendorList();
    this.GetAllStoreList();
    this.GetAllItemsList();
  }

  ngOnInit() {
    this.supplierWiseStockObj.FromDate = moment().format('YYYY-MM-DD');
    this.supplierWiseStockObj.ToDate = moment().format('YYYY-MM-DD');
    this.supplierWiseStockObj.VendorId = null;
    this.supplierWiseStockObj.ItemId = null;
    this.supplierWiseStockObj.StoreId = null;
  }

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'Supplier Wise Stock Report' + moment().format('YYYY-MM-DD') + '.xls',
  };

  vendorChanged() {
    this.supplierWiseStockObj.VendorId = this.selVendor ? this.selVendor.VendorId : null;
  }

  storeChanged() {
    this.supplierWiseStockObj.StoreId = this.selStore ? this.selStore.StoreId : null;
  }

  itemChanged() {
    this.supplierWiseStockObj.ItemId = this.selItem ? this.selItem.ItemId : null;
  }

  VendorListFormatter(data: any): string {
    return data["VendorName"];
  }

  StoreListFormatter(data: any): string {
    return data["Name"];
  }

  ItemListFormatter(data: any): string {
    return data["ItemName"];
  }

  public validDate: boolean = true;
  selectDate(event) {
    if (event) {
      this.supplierWiseStockObj.FromDate = event.fromDate;
      this.supplierWiseStockObj.ToDate = event.toDate;
      this.validDate = true;
    }
    else {
      this.validDate = false;
    }
  }

  private GetAllVendorList() {
    this.invReportsBlService.GetAllVendorList().subscribe(res => {
      if (res.Status == "OK") {
        this.vendorList = res.Results;
      }
      else {
        this.msgBoxServ.showMessage("Notice-Message", ["Failed to load vendor list."]);
      }
    }, err => {
      console.log(err);
      this.msgBoxServ.showMessage("Failed", ["Failed to load vendor list."]);
    });
  }

  private GetAllStoreList() {
    this.invReportsBlService.GetInventoryList().subscribe(res => {
      if (res.Status == "OK") {
        this.storeList = res.Results;
      }
      else {
        this.msgBoxServ.showMessage("Notice-Message", ["Failed to load Department list."]);
      }
    }, err => {
      console.log(err);
      this.msgBoxServ.showMessage("Failed", ["Failed to load Department list."]);
    });
  }

  private GetAllItemsList() {
    this.invReportsBlService.GetAllItemsList().subscribe(res => {
      if (res.Status == "OK") {
        this.itemsList = res.Results;
      }
      else {
        this.msgBoxServ.showMessage("Notice-Message", ["Failed to load Items list."]);
      }
    }, err => {
      console.log(err);
      this.msgBoxServ.showMessage("Failed", ["Failed to load Items list."]);
    });
  }


  Load() {
    this.FilterParameters = [
      { DisplayName: "Vendor", Value: this.selVendor },
      { DisplayName: "ItemName", Value: this.selItem },
      { DisplayName: "Store", Value: this.selStore },
      { DisplayName: "DateRange", Value: this.dateRange },
    ]
    this.invReportsBlService.GetSupplierWiseStockReportList(this.supplierWiseStockObj)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));
  }
  Error(err) {
    this.msgBoxServ.showMessage("Error", [err]);
  }

  Success(res) {
    this.supplierWiseStockReportGridData = new Array<SupplierWiseStockReportModel>();
    if (res.Status == "OK" && res.Results.length > 0) {
      this.supplierWiseStockReportGridData = res.Results;
      this.supplierWiseStockReportGridData.forEach(ele => {
        if (ele.BatchNO == null || ele.BatchNO == '' || ele.BatchNO == undefined) {
          ele.BatchNO = 'N/A';
        }
        if (ele.ExpiryDate == null || ele.ExpiryDate == '' || ele.ExpiryDate == undefined) {
          ele.ExpiryDate = 'N/A'
        }
      })
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("Error", ["There is no data available."]);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }
  ngAfterViewChecked() {
    this.dateRange = "<b>From:</b>&nbsp;" + this.supplierWiseStockObj.FromDate + "&nbsp;<b>To:</b>&nbsp;" + this.supplierWiseStockObj.ToDate;;
  }
}
