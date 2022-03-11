import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from '../../../shared/pharmacy.bl.service';
import PHRMReportsGridColumns from '../../../shared/phrm-reports-grid-columns';

@Component({
  templateUrl: './phrm-stock-summary-second.component.html',
})
export class PHRMStockSummarySecondComponent implements OnInit {

  tillDate: string;
  stockSummaryResult: Array<any> = new Array<any>();
  stockSummaryGrid: Array<any> = null;
  public footerContent = '';
  public dateRange: string = "";
  public pharmacy: string = "pharmacy";
  loading: boolean;

  constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef) {
    this.stockSummaryGrid = PHRMReportsGridColumns.PHRMStockSummary;
    this.tillDate = moment().format("YYYY-MM-DD");
  }

  ngOnInit() {
  }
  ngAfterViewChecked() {

    this.dateRange = "<b>Opening On Date:</b>&nbsp;" + this.tillDate;
  }
  LoadReport() {
    this.loading = true;
    this.stockSummaryResult = [];
    this.pharmacyBLService.getStockSummarySecondReport(this.tillDate)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          this.stockSummaryResult = res.Results;
          this.changeDetector.detectChanges();
          // this.footerContent=document.getElementById("print_summary").innerHTML; 
        }
        else {
          this.stockSummaryResult = null;
          this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
        }
        this.dateRange = "<b>Date:</b>&nbsp;" + this.tillDate;
        this.loading = false;
      });
  }

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'PharmacyStockSummaryReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };
  refreshDate() {
    this.dateRange = "<b>Date:</b>&nbsp;" + this.tillDate;
    this.changeDetector.detectChanges();
  }
}
