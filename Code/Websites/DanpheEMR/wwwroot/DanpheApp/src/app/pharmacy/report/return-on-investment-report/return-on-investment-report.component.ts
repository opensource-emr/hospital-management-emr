import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { CommonFunctions } from '../../../shared/common.functions';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import PHRMGridColumns from '../../shared/phrm-grid-columns';

@Component({
  selector: 'app-return-on-investment-report',
  templateUrl: './return-on-investment-report.component.html'
})
export class ReturnOnInvestmentReportComponent implements OnInit {
  FromDate: string = null;
  ToDate: string = null;
  dateRange: string = null;
  loading: boolean = false;
  ReturnOnInvestmentReportDataColumns: Array<any> = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  ReturnOnInvestmentReportData: Array<any> = new Array<any>();
  grandTotal: any = { totalInvestedValue: 0, totalSalesValue: 0, profit: 0, profitper: 0, ROI: 0 };


  constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService) {
    this.FromDate = moment().format("YYYY-MM-DD");
    this.ToDate = moment().format("YYYY-MM-DD");
    this.ReturnOnInvestmentReportDataColumns = PHRMGridColumns.ReturnOnInvestmentReportColumn;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("TransactionDate", false));
  }

  ngOnInit() {
  }
  OnFromToDateChange($event) {
    if ($event) {
      this.FromDate = $event.fromDate;
      this.ToDate = $event.toDate;
      this.dateRange = "<b>Date:</b>&nbsp;" + this.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.ToDate;
    }
  }
  GetReportData() {
    if (this.FromDate == null || this.ToDate == null) {
      this.msgBoxServ.showMessage('Notice', ['Please Provide Valid Date.']);
      return;
    }
    else {
      this.loading = true;
      this.pharmacyBLService.GetReturnOnInvestmentReport(this.FromDate, this.ToDate).finally(() => {
        this.loading = false;
      })
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.ReturnOnInvestmentReportData = res.Results;
            this.grandTotal.totalInvestedValue = CommonFunctions.parsePhrmAmount(this.ReturnOnInvestmentReportData.reduce((a, b) => a + b.TotalAmount, 0));
            this.grandTotal.totalSalesValue = CommonFunctions.parsePhrmAmount(this.ReturnOnInvestmentReportData.reduce((a, b) => a + b.SalesValue, 0));
            this.grandTotal.profit = CommonFunctions.parsePhrmAmount(this.ReturnOnInvestmentReportData.reduce((a, b) => a + b.Profit, 0));
            this.grandTotal.profitPer = CommonFunctions.parseAmount((this.grandTotal.profit / this.grandTotal.totalSalesValue) * 100);
            this.grandTotal.ROI = CommonFunctions.parseAmount((this.grandTotal.profit / this.grandTotal.totalInvestedValue) * 100);
          } else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
          }
        });
    }
  }
  gridExportOptions = {
    fileName: 'ReturnOnInvestmentReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };


}
