import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_BIL_DoctorRevenue } from "./doctor-revenue.model"
import { DLService } from "../../../shared/dl.service"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import * as moment from 'moment/moment';

@Component({
  templateUrl: "./doctor-revenue.html"
})

export class RPT_BIL_DoctorRevenueComponent {
  public fromDate: Date = null;
  public toDate: Date = null;
  public selProvider: any = null;
  public doctorList: any;
  DoctorRevenueColumns: Array<any> = null;
  DoctorRevenueData: Array<any> = new Array<RPT_BIL_DoctorRevenue>();
  public currentdoctorrevenuereport: RPT_BIL_DoctorRevenue = new RPT_BIL_DoctorRevenue();
  dlService: DLService = null;
  public DoctorsList: Array<any> = [];

  constructor(
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    this.DoctorRevenueColumns = this.reportServ.reportGridCols.DoctorRevenue;
    this.dlService = _dlService;
    this.currentdoctorrevenuereport.fromDate = moment().format('YYYY-MM-DD');
    this.currentdoctorrevenuereport.toDate = moment().format('YYYY-MM-DD');
    this.loadDoctorsList();
  }

  gridExportOptions = {
    fileName: 'DoctorRevenueReportList_' + moment().format('YYYY-MM-DD') + '.xls',
    //displayColumns: ['Date', 'Doctor', 'Department', 'Total']
  };

  Load() {
    if (this.currentdoctorrevenuereport.fromDate != null && this.currentdoctorrevenuereport.toDate != null) {
      this.dlService.Read("/BillingReports/DoctorRevenue?FromDate="
        + this.currentdoctorrevenuereport.fromDate + "&ToDate=" + this.currentdoctorrevenuereport.toDate + "&ProviderName=" + this.currentdoctorrevenuereport.ProviderName)
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
      this.DoctorRevenueColumns = this.reportServ.reportGridCols.DoctorRevenue;
      this.DoctorRevenueData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates'])
      this.DoctorRevenueColumns = this.reportServ.reportGridCols.DoctorRevenue;
      this.DoctorRevenueData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
    }
  }

  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelDoctorRevenue?FromDate="
      + this.currentdoctorrevenuereport.fromDate + "&ToDate=" + this.currentdoctorrevenuereport.toDate + "&ProviderName=" + this.currentdoctorrevenuereport.ProviderName)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "DoctorRevenue_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
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
    this.currentdoctorrevenuereport.ProviderName = this.selProvider ? this.selProvider.FirstName + ' ' + this.selProvider.LastName : "";
  }
}






