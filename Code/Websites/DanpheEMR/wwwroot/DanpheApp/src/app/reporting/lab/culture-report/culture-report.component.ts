import { Component } from "@angular/core";
import { CoreService } from "../../../../app/core/shared/core.service";
import { DLService } from "../../../../app/shared/dl.service";
import { MessageboxService } from "../../../../app/shared/messagebox/messagebox.service";
import { ReportingService } from "../../shared/reporting-service";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../../app/shared/danphe-grid/NepaliColGridSettingsModel";
import * as moment from "moment";

@Component({
  selector: "lab-culture-report",
  templateUrl: "./culture-report.html",
})
export class RPT_LabCultureReport {
  public cultureTestReportColumns: Array<any> = null;
  public cultureTestReportData: Array<any> = null;
  public fromDate: any;
  public toDate: any;
  public showGrid: boolean = false;
  public NepaliDateInGridSettings: NepaliDateInGridParams =
    new NepaliDateInGridParams();
    public dateRange:string="";	
  constructor(
    public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public coreService: CoreService
  ) {
    this.cultureTestReportColumns =
      this.reportServ.reportGridCols.CultureTestsReport;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(
      new NepaliDateInGridColumnDetail("ResultDate", false)
    );
  }

  Load() {
    this.dlService
      .Read(
        "/Reporting/GetCultureTestsDetailReport?FromDate=" +
          this.fromDate +
          "&ToDate=" +
          this.toDate
      )
      .map((res) => res)
      .subscribe(
        (res) => this.Success(res),
        (err) => this.Error(err)
      );
  }

  Error(err) {
    this.msgBoxServ.showMessage("error", ["Problem in fetching data."]);
  }

  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.cultureTestReportData = res.Results;
      this.showGrid = true;
    } else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", [
        "No Data is Avaliable for Selected Parameters.....Try Different",
      ]);
    } else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  gridExportOptions = {
    fileName: "CultureTestDetailsReport" + moment().format("YYYY-MM-DD") + ".xls",
  };

  OnFromToDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    this.dateRange="<b>Date:</b>&nbsp;"+this.fromDate+"&nbsp;<b>To</b>&nbsp;"+this.toDate;
  }
}