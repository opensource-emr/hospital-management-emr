import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { DLService } from '../../../shared/dl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import PHRMReportsGridColumns from '../../shared/phrm-reports-grid-columns';

@Component({
  selector: 'app-datewise-purchase-report',
  templateUrl: './datewise-purchase-report.component.html',
  styleUrls: ['./datewise-purchase-report.component.css']
})
export class DatewisePurchaseReportComponent implements OnInit {
  DateWisePurchaseReportColumns: Array<any> = null;
  DateWisePurchaseReportData: Array<any> = new Array<any>();
  public fromDate: string = moment().format("YYYY-MM-HH");
  public toDate: string = moment().format("YYYY-MM-HH");
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public dateRange:string="";	
  supplierId: number = null;

  constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService,
    public msgBoxServ: MessageboxService) {
    this.DateWisePurchaseReportColumns = PHRMReportsGridColumns.PHRMDateWisePurchaseReport;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("GoodReceiptDate", false));
  }
  ngOnInit() {
  }
  gridExportOptions = {
    fileName: 'DateWisePurchaseReport' + moment().format('YYYY-MM-DD') + '.xls',
  };
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  GetReportData() {
    this.pharmacyBLService.GetDateWisePurchaseReport(this.fromDate, this.toDate, this.supplierId)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          this.DateWisePurchaseReportData = res.Results;

        }
        if (res.Status == 'OK' && res.Results.length == 0) {
          this.DateWisePurchaseReportData = null;
          this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
        }

      });
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    this.dateRange="<b>Date:</b>&nbsp;"+this.fromDate+"&nbsp;<b>To</b>&nbsp;"+this.toDate;
  }
}