import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_BIL_DepositBalanceModel } from "./deposit-balance.model";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import * as moment from 'moment/moment';
import { NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./deposit-balance.html"
})
export class RPT_BIL_DepositBalanceComponent {
  //public fromDate: Date = null;
  //public toDate: Date = null;
  DepositBalanceColumns: Array<any> = null;
  DepositBalanceData: Array<any> = new Array<RPT_BIL_DepositBalanceModel>();
  public currentdepositbalance: RPT_BIL_DepositBalanceModel = new RPT_BIL_DepositBalanceModel();
  dlService: DLService = null;

  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  
  constructor(
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    //this.DepartmentSalesDaybookColumns = ReportGridColumnSettings.DeptSalesDaybookReport;
    this.dlService = _dlService;
    this.Load();
    //this.currentdepartmentsales.fromDate = moment().format('YYYY-MM-DD');
    //this.currentdepartmentsales.toDate = moment().format('YYYY-MM-DD');
    //this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("DepositDate", false));
  }

  gridExportOptions = {
    fileName: 'DepositBalanceList_' + moment().format('YYYY-MM-DD') + '.xls',
    //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']
  };

  Load() {
    this.dlService.Read("/BillingReports/DepositBalance")
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }
  Success(res) {
    if (res.Status == "OK") {
      this.DepositBalanceColumns = this.reportServ.reportGridCols.DepositBalanceReport;
      this.DepositBalanceData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelDepositBalance")
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "DepositBalance_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
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
