import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_BIL_DepartmentSalesDaybookModel } from "./dept-sales-daybook.model";
import * as moment from 'moment/moment';
import { DLService } from "../../../shared/dl.service"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
@Component({
  templateUrl: "./dept-sales-daybook.html"
})
export class RPT_BIL_DepartmentSalesDaybookComponent {

  public fromDate: Date = null;
  public toDate: Date = null;

  DepartmentSalesDaybookColumns: Array<any> = null;
  DepartmentSalesDaybookData: Array<any> = new Array<RPT_BIL_DepartmentSalesDaybookModel>();
  public currentdepartmentsales: RPT_BIL_DepartmentSalesDaybookModel = new RPT_BIL_DepartmentSalesDaybookModel();
  dlService: DLService = null;

  constructor(_dlService: DLService, public msgBoxServ: MessageboxService, public reportServ: ReportingService) {
    this.dlService = _dlService;
    this.currentdepartmentsales.fromDate = moment().format('YYYY-MM-DD');
    this.currentdepartmentsales.toDate = moment().format('YYYY-MM-DD');
  }


  gridExportOptions = {
    fileName: 'DepartmentSalesDaybookList_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Load() {
    this.dlService.Read("/BillingReports/DepartmentSalesDaybook?FromDate="
      + this.currentdepartmentsales.fromDate + "&ToDate=" + this.currentdepartmentsales.toDate)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));

  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);


  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.DepartmentSalesDaybookColumns = this.reportServ.reportGridCols.DeptSalesDaybookReport;
      this.DepartmentSalesDaybookData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected Parameters...Try Different'])
      this.DepartmentSalesDaybookColumns = this.reportServ.reportGridCols.DeptSalesDaybookReport;
      this.DepartmentSalesDaybookData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }

  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelDepartmentSales?FromDate="
      + this.currentdepartmentsales.fromDate + "&ToDate=" + this.currentdepartmentsales.toDate)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "DepartmentSales_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },

        res => this.ErrorMsg(res));
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }
}
