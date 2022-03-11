import { Component, Directive, ViewChild } from "@angular/core";
import { ReportingService } from "../../shared/reporting-service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { RPT_LAB_DoctorWiseLabModel } from "./doctor-wise-lab.model";
import { DLService } from "../../../shared/dl.service";
import * as moment from "moment/moment";
import { NepaliDate } from "../../../shared/calendar/np/nepali-dates";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

@Component({
  templateUrl: "./doctor-wise-lab-report.html",
})
export class RPT_LAB_DoctorWisePatientCountLabReportComponent {
  DoctorWiseLabReportColumns: Array<any> = null;
  DoctorWiseLabReportData: Array<any> = new Array<RPT_LAB_DoctorWiseLabModel>();
  public currentdoctorwiselab: RPT_LAB_DoctorWiseLabModel = new RPT_LAB_DoctorWiseLabModel();
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange:string = "";

  constructor(
    public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public npCalendarService: NepaliCalendarService,
    public reportServ: ReportingService
  ) {
    this.currentdoctorwiselab.fromDate = moment().format("YYYY-MM-DD");
    this.currentdoctorwiselab.toDate = moment().format("YYYY-MM-DD");
  }

  gridExportOptions = {
    fileName:
      "DoctorWisePatientCountLabReportList_" +
      moment().format("YYYY-MM-DD") +
      ".xls",
  };

  Load() {
    if (this.currentdoctorwiselab.fromDate != null && this.currentdoctorwiselab.toDate != null) {
      this.fromDate = this.currentdoctorwiselab.fromDate;
      this.toDate = this.currentdoctorwiselab.toDate;
      this.dlService
        .Read(
          "/Reporting/DoctorWisePatientCountLabReport?FromDate=" +
          this.fromDate +
          "&ToDate=" +
          this.toDate
        )
        .map((res) => res)
        .subscribe(
          (res) => this.Success(res),
          (err) => this.Error(err)
        );
    } else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }
    
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }

  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.DoctorWiseLabReportColumns = this.reportServ.reportGridCols.DoctorWisePatientCountLabReport;
      this.DoctorWiseLabReportData = res.Results;
    } else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", [
        "No Data is Avaliable for Selected Parameters.....Try Different",
      ]);
      this.DoctorWiseLabReportColumns = this.reportServ.reportGridCols.DoctorWisePatientCountLabReport;
      this.DoctorWiseLabReportColumns = res.Results;
    } else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  OnGridExport($event: GridEmitModel) {
    let summaryHeader = "Doctor Wise Lab Report";
    this.dlService
      .ReadExcel(
        "/ReportingNew/ExportToExcelDoctorWisePatientCountLabReport?FromDate=" +
          this.fromDate +
          "&ToDate=" +
          this.toDate +
          "&SummaryHeader=" +
          summaryHeader
      )
      .map((res) => res)
      .subscribe(
        (data) => {
          let blob = data;
          let a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download =
            "DoctorWisePatientCountLabReport_" +
            moment().format("DD-MMM-YYYY_HHmmA") +
            ".xls";
          document.body.appendChild(a);
          a.click();
        },
        (res) => this.ErrorMsg(res)
      );
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", [
      "Sorry!!! Not able export the excel file.",
    ]);
    console.log(err.ErrorMessage);
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentdoctorwiselab.fromDate = this.fromDate;
    this.currentdoctorwiselab.toDate = this.toDate;
    this.dateRange="<b>Date:</b>&nbsp;"+this.fromDate+"&nbsp;<b>To</b>&nbsp;"+this.toDate;
  }
}
