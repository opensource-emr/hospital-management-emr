import { Component } from '@angular/core';
import * as moment from 'moment/moment';
import { PHRMReportsModel } from "../../shared/phrm-reports-model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import { DLService } from "../../../shared/dl.service"
import { ReportingService } from "../../../reporting/shared/reporting-service"
@Component({
  selector: "my-app",
  templateUrl: "./phrm-deposit-balance-report.html"
})

export class PHRMDepositBalanceReport {                                        //"DepositBalanceReport"
  PHRMDepositBalanceReportColumn: Array<any> = null;
  PHRMDepositBalanceReportData: Array<any> = new Array<PHRMReportsModel>();
  public phrmReports: PHRMReportsModel = new PHRMReportsModel();
  dlService: DLService = null;
  public pharmacy:string = "pharmacy";

  constructor(
    public pharmacyBLService: PharmacyBLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    _dlService: DLService,

  ) {
    this.PHRMDepositBalanceReportColumn = PHRMReportsGridColumns.PHRMDepositBalanceReport;
   
    this.dlService = _dlService;
    this.Load();
  };

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'PharmacyDepositBalanceReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Load() {
    this.pharmacyBLService.GetPHRMDepositBalanceReport()
      .subscribe(res => {
        if (res.Status == 'OK') {

          this.PHRMDepositBalanceReportColumn = PHRMReportsGridColumns.PHRMDepositBalanceReport;
          this.PHRMDepositBalanceReportData = res.Results;
        }
        else {

          this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
        }
      });

  }

  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }
}
