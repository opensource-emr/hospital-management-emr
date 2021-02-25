import { Component, Directive, ViewChild } from '@angular/core';
import { RPT_BIL_DoctorReport } from "./doctor-report.model"
import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import { ReportingService } from "../../shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../../shared/common.functions';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
@Component({
  templateUrl: "./doctor-report.html"
})
export class RPT_BIL_DoctorReportComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public selProvider: any = "";
  public doctorList: any;
  DoctorReportColumns: Array<any> = null;
  DoctorReportData: Array<any> = new Array<RPT_BIL_DoctorReport>();
  public currentdoctorreport: RPT_BIL_DoctorReport = new RPT_BIL_DoctorReport();
  dlService: DLService = null;
  http: HttpClient = null;
  public summary: any = { tot_Quantity: 0, tot_SubTotal: 0, tot_Discount: 0, tot_TotalAmount: 0, tot_ReturnAmount: 0, tot_NetTotal: 0 };
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    this.http = _http;
    this.dlService = _dlService;
    this.currentdoctorreport.fromDate = moment().format('YYYY-MM-DD');
    this.currentdoctorreport.toDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
    this.loadDoctorsList();
  }

  gridExportOptions = {
    fileName: 'DoctorReportList_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Load() {
    if (this.currentdoctorreport.fromDate != null && this.currentdoctorreport.toDate != null) {
      this.dlService.Read("/BillingReports/DoctorReport?FromDate="
        + this.currentdoctorreport.fromDate + "&ToDate=" + this.currentdoctorreport.toDate + "&ProviderName=" + this.currentdoctorreport.ProviderName)
        .map(res => res)
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    }
    else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }
  }

  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }

  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.DoctorReportColumns = this.reportServ.reportGridCols.DoctorReport;
      this.DoctorReportData = res.Results;
      this.CalculateColumnsTotal(res.Results);
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates'])
      this.DoctorReportColumns = this.reportServ.reportGridCols.DoctorReport;
      this.DoctorReportData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }
  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelDoctorReport?FromDate="
      + this.currentdoctorreport.fromDate + "&ToDate=" + this.currentdoctorreport.toDate + "&ProviderName=" + this.currentdoctorreport.ProviderName)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "DoctorReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },

        res => this.ErrorMsg(res));
  }

  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  loadDoctorsList() {
    this.dlService.Read("/BillingReports/GetDoctorList")
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.doctorList = res.Results;
        }
      });
  }

  myListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  providerChanged() {
    this.currentdoctorreport.ProviderName = this.selProvider ? this.selProvider.FullName : "";
  }

  public CalculateColumnsTotal(data) {
    //initailize to zero
    this.summary.tot_SubTotal = this.summary.tot_Discount = this.summary.tot_ReturnAmount = this.summary.tot_NetTotal = this.summary.tot_TotalAmount = this.summary.tot_Quantity = 0;

    data.forEach(a => {
      this.summary.tot_SubTotal += a.SubTotal;
      this.summary.tot_Discount += a.Discount;
      this.summary.tot_ReturnAmount += a.ReturnAmount;
      this.summary.tot_NetTotal += a.NetAmount;
      this.summary.tot_Quantity += a.Quantity;
      this.summary.tot_TotalAmount += a.Total;
    });

    this.summary.tot_SubTotal = CommonFunctions.parseAmount(this.summary.tot_SubTotal);
    this.summary.tot_Discount = CommonFunctions.parseAmount(this.summary.tot_Discount);
    this.summary.tot_ReturnAmount = CommonFunctions.parseAmount(this.summary.tot_ReturnAmount);
    this.summary.tot_NetTotal = CommonFunctions.parseAmount(this.summary.tot_NetTotal);
    this.summary.tot_Quantity = CommonFunctions.parseAmount(this.summary.tot_Quantity);
    this.summary.tot_TotalAmount = CommonFunctions.parseAmount(this.summary.tot_TotalAmount);
  }
  //Anjana:10June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentdoctorreport.fromDate = this.fromDate;
    this.currentdoctorreport.toDate = this.toDate;
  }
}
