import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from '../../../shared/pharmacy.bl.service';
import PHRMReportsGridColumns from '../../../shared/phrm-reports-grid-columns';

@Component({
  templateUrl: './phrm-sales-statement.component.html',
})
export class PHRMSalesStatementComponent implements OnInit {

  fromDate: string;
  toDate: string;
  salesStatementResult: Array<any> = new Array<any>();
  salesStatementGrid: Array<any> = null;
  public dateRange: string = "";
  public pharmacy: string = "pharmacy";
  public loading: boolean = false;

  constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService) {
    this.salesStatementGrid = PHRMReportsGridColumns.PHRMSalesStatement;
    this.fromDate = moment().format("YYYY-MM-DD");
    this.toDate = moment().format("YYYY-MM-DD");
  }

  ngOnInit() {
  }
  LoadReport() {
    this.loading = true;
    this.salesStatementResult = [];
    this.pharmacyBLService.getSalesStatementReport(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          this.salesStatementResult = res.Results;
        }
        else {
          this.salesStatementResult = null;
          this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
        }
        this.loading = false;
      });
  }

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'PharmacySalesStatementReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }
}
