import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from '../../../shared/pharmacy.bl.service';
import PHRMReportsGridColumns from '../../../shared/phrm-reports-grid-columns';

@Component({
  templateUrl: './phrm-purchase-summary.component.html',
})
export class PHRMPurchaseSummaryComponent implements OnInit {

  fromDate: string;
  toDate: string;
  purchaseStatementResult: Array<any> = new Array<any>();
  purchaseStatementGrid: Array<any> = null;
  public dateRange: string = "";
  public pharmacy: string = "pharmacy";
  loading: boolean;
  constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService) {
    this.purchaseStatementGrid = PHRMReportsGridColumns.PHRMPurchaseStatement;
    this.fromDate = moment().format("YYYY-MM-DD");
    this.toDate = moment().format("YYYY-MM-DD");
    this.LoadReport();
  }

  ngOnInit() {
  }
  LoadReport() {
    this.loading = true;
    this.purchaseStatementResult = [];
    this.pharmacyBLService.getPurchaseSummaryReport(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          this.purchaseStatementResult = res.Results;
        }
        else {
          this.purchaseStatementResult = null;
          this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
        }
        this.loading = false;
      });
  }

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'PharmacyPurchaseSummaryReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }
}
