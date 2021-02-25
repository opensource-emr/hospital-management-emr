import { Component, Directive, ViewChild } from '@angular/core';
import * as moment from 'moment/moment';

import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_BIL_ReturnBillModel } from './return-bill.model';

import { DLService } from "../../../shared/dl.service"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

import { CommonFunctions } from '../../../shared/common.functions';

import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { CoreService } from '../../../core/shared/core.service';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./return-bill.html"
})
export class RPT_BIL_ReturnBillReportComponent {

  public fromDate: string = null;
  public toDate: string = null;
  public showPrintButton: boolean = true;
  public currentReturnBill: RPT_BIL_ReturnBillModel = new RPT_BIL_ReturnBillModel();
  ReturnBillColumns: Array<any> = null;
  ReturnBillData: Array<any> = new Array<any>();
  dlService: DLService = null;

  public reportHeaderHtml: string = '';
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(_dlService: DLService, public msgBoxServ: MessageboxService,
    public reportServ: ReportingService, public coreService: CoreService) {
    this.dlService = _dlService;
    this.currentReturnBill.fromDate = moment().format('YYYY-MM-DD');
    this.currentReturnBill.toDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
  }
  gridExportOptions = {
    fileName: 'ReturnBill_' + moment().format('YYYY-MM-DD') + '.xls'
  };


  Load() {
    if (this.currentReturnBill.fromDate != null && this.currentReturnBill.toDate != null) {
      this.dlService.Read("/BillingReports/ReturnBillReport?FromDate="
        + this.currentReturnBill.fromDate + "&ToDate=" + this.currentReturnBill.toDate)
        .map(res => res)
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    }
    else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }


  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {

      this.reportHeaderHtml = this.coreService.GetReportHeaderParameterHTML(moment(this.currentReturnBill.fromDate).format('YYYY-MM-DD'),
        moment(this.currentReturnBill.toDate).format('YYYY-MM-DD'),
        this.coreService.GetReportHeaderTextForProperty('CreditNoteReportHeader')
      );

      this.ReturnBillColumns = this.reportServ.reportGridCols.ReturnBillGridColumn;

      if (res.Results && res.Results.length) {
        res.Results.forEach(bil => {
          bil.Date = moment(bil.Date).format('YYYY-MM-DD');
          bil.SubTotal = CommonFunctions.parseAmount(bil.SubTotal);
          bil.DiscountAmount = CommonFunctions.parseAmount(bil.DiscountAmount);
          bil.TaxableAmount = CommonFunctions.parseAmount(bil.TaxableAmount);
          bil.TaxTotal = CommonFunctions.parseAmount(bil.TaxTotal);
          bil.TotalAmount = CommonFunctions.parseAmount(bil.TotalAmount);
        });
      }

      this.ReturnBillData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['No Data is Available Between Selected Parameters....Try Different Dates'])
      this.ReturnBillColumns = this.reportServ.reportGridCols.ReturnBillGridColumn;
      this.ReturnBillData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }


  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelReturnBills?FromDate="
      + this.currentReturnBill.fromDate + "&ToDate=" + this.currentReturnBill.toDate)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "ReturnBills_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },

        res => this.ErrorMsg(res));
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }
  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentReturnBill.fromDate = this.fromDate;
    this.currentReturnBill.toDate = this.toDate;
  }

}
