import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from '../../../shared/pharmacy.bl.service';
import PHRMReportsGridColumns from '../../../shared/phrm-reports-grid-columns';

@Component({
  templateUrl: './phrm-sales-summary.component.html',
})
export class PHRMSalesSummaryComponent implements OnInit {

  fromDate: string;
  toDate: string;
  salesSummaryResult: Array<any> = new Array<any>();
  salesSummaryGrid: Array<any> = null;
  grandTotalSalesSummary: any[];
  public footerContent = '';
  public dateRange: string = "";
  public pharmacy: string = "pharmacy";

  public loading: boolean = false;
  constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef) {
    this.salesSummaryGrid = PHRMReportsGridColumns.PHRMSalesSummary;
    this.fromDate = moment().format("YYYY-MM-DD");
    this.toDate = moment().format("YYYY-MM-DD");
  }

  ngOnInit() {
  }
  ngAfterViewChecked() {
    this.footerContent = document.getElementById("print_summary").innerHTML;
  }
  LoadReport() {
    this.loading = true;
    this.salesSummaryResult = [];
    this.pharmacyBLService.getSalesSummaryReport(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          this.salesSummaryResult = res.Results;
          this.grandTotalSalesSummary = this.salesSummaryResult.filter(x => x.StoreName == "Total");
          this.changeDetector.detectChanges();
          this.footerContent = document.getElementById("print_summary").innerHTML;
        }
        else {
          this.salesSummaryResult = null;
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
