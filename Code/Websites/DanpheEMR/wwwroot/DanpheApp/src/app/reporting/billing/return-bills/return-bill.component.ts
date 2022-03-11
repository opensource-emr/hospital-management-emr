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

  public loading: boolean = false;

  public reportHeaderHtml: string = '';
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public dateRange: string = "";

  public SummaryData = {
    "TotalReturnAmount":0,
    "TotalDiscountAmount":0,
    "NetReturnAmount":0
  };
  public ShowReturnBillsDetail:boolean = false;
  public IsReturnBillDetailsLoaded:boolean = false;
  public ReturnBillDetail:any;
  public ReturnBillRowData:any;
  public footerContent:any;

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



  ngAfterViewChecked() {
    if (document.getElementById("summary") != null)
      this.footerContent = document.getElementById("summary").innerHTML;
  }
  Load() {
    if (this.currentReturnBill.fromDate != null && this.currentReturnBill.toDate != null) {
      this.dlService.Read("/BillingReports/ReturnBillReport?FromDate="
        + this.currentReturnBill.fromDate + "&ToDate=" + this.currentReturnBill.toDate)
        .map(res => res)
        .finally(() => { this.loading = false; })
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
      if(this.ReturnBillData.length>0){
        this.CalculateReturnBillSummary(this.ReturnBillData);
      }
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

  CalculateReturnBillSummary(returnBillData){
    if(returnBillData){
      let netReturnAmount = 0;

      let totalReturnAmount = returnBillData.reduce(function(acc,itm) { return acc + itm.SubTotal; }, 0)
      let totalDiscountAmount = returnBillData.reduce(function(acc,itm) { return acc + itm.DiscountAmount; }, 0)
      netReturnAmount = (totalReturnAmount - totalDiscountAmount);

      this.SummaryData.TotalReturnAmount = CommonFunctions.parseAmount(totalReturnAmount);
      this.SummaryData.TotalDiscountAmount = CommonFunctions.parseAmount(totalDiscountAmount);
      this.SummaryData.NetReturnAmount = CommonFunctions.parseAmount(netReturnAmount);
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
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }

  public ReturnBillGridActions($event:GridEmitModel){
    switch($event.Action){
      case 'view':{
        this.ShowReturnBillsDetail = true;
        var data = $event.Data;
        if(data){
          this.IsReturnBillDetailsLoaded = true;
           this.ReturnBillRowData = data;
          this.LoadReturnBillDetail(data.BillReturnId);

        }
        break;
      }
    }
  }

 public CloseDetailsPopup(){
  this.ShowReturnBillsDetail = false;
  }

  public LoadReturnBillDetail(billReturnId:number){
    if (billReturnId) {
      this.dlService.Read("/BillingReports/ReturnBillReportViewDetail?BillReturnId="+billReturnId)
        .map(res => res)
        .finally(() => { this.loading = false; })
        .subscribe(res => this.GotReturnBillData(res),
          res => this.Error(res));
    }
    else {
      this.msgBoxServ.showMessage("error", ['Bill Return Is not Available']);
    }
  }
  GotReturnBillData(res){
    if (res.Status == "OK" && res.Results.length > 0) {
      this.ReturnBillDetail = res.Results; 
      }
  }

}
