import { Component, Directive, ViewChild } from '@angular/core';
import { PHRMReportsModel } from "../../shared/phrm-reports-model"
import PHRMGridColumns from '../../shared/phrm-grid-columns';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";

@Component({
  templateUrl: "./phrm-narcotics-stock-report.html"
})
export class PHRMNarcoticsStockReportComponent {
  totalstockvalue: any;
  PHRMNarcoticsStockReportColumns: Array<any> = null;
  PHRMNarcoticsStockReportData: Array<any> = new Array<PHRMReportsModel>();
  storeList: any;
  PHRMNarcoticsStockReportDataCopy: any[];
  public selectedStoreId: number = null;
  public showReportWithZeroQty: boolean = false;
  public pharmacy:string = "pharmacy";

  constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService) {
    this.PHRMNarcoticsStockReportColumns = PHRMGridColumns.PHRMNArcoticsStockDetailsList;
    this.GetActiveStore();
    this.Load();
  }

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'PharmacyNarcoticsStockReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };
  GetActiveStore() {
    this.pharmacyBLService.GetActiveStore()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.storeList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("Notice-Message", ["Failed to load stores."]);
        }
      }, () => {
        this.msgBoxServ.showMessage("Failed", ["Failed to load stores."]);
      });
  }
  FilterNarcoticsStockReportList() {
    //filter stock based on store
    this.PHRMNarcoticsStockReportData = this.PHRMNarcoticsStockReportDataCopy.filter(s => s.StoreId == this.selectedStoreId || this.selectedStoreId == null);
    if (this.showReportWithZeroQty) {
      this.PHRMNarcoticsStockReportData = this.PHRMNarcoticsStockReportData.filter(a => a.StockQty < 1);
    }
    else {
      this.PHRMNarcoticsStockReportData = this.PHRMNarcoticsStockReportData.filter(a => a.StockQty > 0);
    }
  }
  public Load() {
    this.pharmacyBLService.GetNarcoticsStoreReport()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.PHRMNarcoticsStockReportColumns = PHRMGridColumns.PHRMNArcoticsStockDetailsList;
          this.PHRMNarcoticsStockReportData = res.Results;
          this.PHRMNarcoticsStockReportDataCopy = this.PHRMNarcoticsStockReportData;
          this.FilterNarcoticsStockReportList();
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
        }
      });
  }
}






