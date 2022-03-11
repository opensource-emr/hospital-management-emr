import { Component, Directive, ViewChild } from "@angular/core";
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { RPT_ADT_TotalAdmittedPatientModel } from "../../shared/total-admitted-patient.model";
import { DLService } from "../../../shared/dl.service";
import { HttpClient } from "@angular/common/http";
import * as moment from "moment/moment";
import { RPT_ADT_DischargedPatientModel } from "../../shared/discharged-patient.model";
import { ReportDateModel } from "../../shared/report-date.model";
import {
  NepaliDateInGridParams,
  NepaliDateInGridColumnDetail,
} from "../../../shared/danphe-grid/NepaliColGridSettingsModel";

@Component({
  templateUrl: "./inpatient-census.html",
  styles: [`.margin-15-tp{margin-top: 15px;}.lnht-2{line-height: 2;}`]
})
export class RPT_ADT_InpatientCensusComponent {
  public fromDate: string = null;
  public toDate: string = null;
  TotalAdmittedPatientColumns: Array<any> = null;
  DischargedPatientColumns: Array<any> = null;
  TotalAdmittedPatientData: Array<any> = new Array<RPT_ADT_TotalAdmittedPatientModel>();
  DischargedPatientData: Array<any> = new Array<any>();
  // public reportDate: ReportDateModel = new ReportDateModel();
  dlService: DLService = null;
  http: HttpClient = null;
  public currentdischargepatient: RPT_ADT_DischargedPatientModel = new RPT_ADT_DischargedPatientModel();
  public totalAdmittedCount: number = 0;
  public totalDischargedCount: number = 0;
  public showDischaredPopup: boolean = false;
  public showAdmittedPopup: boolean = false;

  public NepaliDateInAdmittedGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public NepaliDateInDischargedGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  public totalWardWiseCount: any;
  public summaryCount: any = {};

  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService
  ) {
    this.http = _http;
    this.dlService = _dlService;
    this.DischargedPatientColumns = this.reportServ.reportGridCols.DischargedPatient;
    this.TotalAdmittedPatientColumns = this.reportServ.reportGridCols.TotalAdmittedPatient;
    // this.LoadTotalAdmittedData();
    // this.LoadTotalDischargedData();
    // this.LoadWardWiseCount();

    this.NepaliDateInAdmittedGridSettings.NepaliDateColumnList.push(
      new NepaliDateInGridColumnDetail("AdmissionDate", false)
    );
    this.NepaliDateInDischargedGridSettings.NepaliDateColumnList.push(
      new NepaliDateInGridColumnDetail("AdmissionDate", false)
    );
    this.NepaliDateInDischargedGridSettings.NepaliDateColumnList.push(
      new NepaliDateInGridColumnDetail("DischargedDate", false)
    );
  }

  gridExportOptionsAdmitted = {
    fileName:
      "TotalAdmittedpatientList_" + moment().format("YYYY-MM-DD") + ".xls",
  };

  gridExportOptionsDischarged = {
    fileName:
      "TotalDischargedpatientList_" + moment().format("YYYY-MM-DD") + ".xls",
  };

  Load() {
    this.totalAdmittedCount = 0;
    this.totalDischargedCount = 0;

    this.LoadTotalAdmittedData();
    this.LoadTotalDischargedData();
    this.LoadWardWiseCount();
  }

  LoadWardWiseCount() {
    //reset variable before reload.
    this.totalWardWiseCount = [];
    this.summaryCount = {};

    this.dlService.Read("/Reporting/AllWardCountDetail?FromDate=" + this.fromDate + "&ToDate=" + this.toDate)
      .map((res) => res)
      .subscribe(
        (res) => {
          if (res.Status == "OK") {
            this.totalWardWiseCount = res.Results;

            this.summaryCount["totalInBed"] = 0;
            this.summaryCount["totalNewAdmission"] = 0;
            this.summaryCount["totalTransIn"] = 0;
            this.summaryCount["totalTransOut"] = 0;
            this.summaryCount["totalDischarged"] = 0;
            this.summaryCount["grandTotal"] = 0;

            this.totalWardWiseCount.forEach(w => {
              this.summaryCount["totalInBed"] += w.InBed;
              this.summaryCount["totalNewAdmission"] += w.NewAdmission;
              this.summaryCount["totalTransIn"] += w.TransIn;
              this.summaryCount["totalTransOut"] += w.TransOut;
              this.summaryCount["totalDischarged"] += w.Discharged;
              this.summaryCount["grandTotal"] += w.Total;
            });
          }
        },
        (res) => this.Error(res)
      );
  }

  LoadTotalDischargedData() {
    this.dlService.Read("/Reporting/DischargedPatient?FromDate=" + this.fromDate + "&ToDate=" + this.toDate)
      .map((res) => res)
      .subscribe(
        (res) => this.DischargeSuccess(res),
        (res) => this.Error(res)
      );
  }

  LoadTotalAdmittedData() {
    this.dlService.Read("/Reporting/TotalAdmittedPatient?FromDate=" + this.fromDate + "&ToDate=" + this.toDate)
      .map((res) => res)
      .subscribe(
        (res) => this.AdmittedSuccess(res),
        (res) => this.Error(res)
      );
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }
  DischargeSuccess(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.DischargedPatientData = res.Results;
      this.totalDischargedCount = res.Results.length;
    } else if (res.Status == "OK" && res.Results.length == 0) {
      // this.msgBoxServ.showMessage("notice-message", [
      //   "No Data is Avaliable for Selected Parameters.....Try Different",
      // ]);
      this.DischargedPatientData = res.Results;
    } else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }
  AdmittedSuccess(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.TotalAdmittedPatientData = res.Results;
      this.totalAdmittedCount = res.Results.length;
    } else if (res.Status == "OK" && res.Results.length == 0) {
      //this.msgBoxServ.showMessage("notice-message", [
      //  "No Data is Avaliable for Selected Parameters.....Try Different",
      //]);
      this.TotalAdmittedPatientData = res.Results;
    } else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  Close() {
    this.showAdmittedPopup = false;
    this.showDischaredPopup = false;
  }

  Print() {
    try {
      let popupWinindow;
      var printContents = document.getElementById("totalCoundWardWiseSummary").innerHTML;
      popupWinindow = window.open(
        "",
        "_blank",
        "width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no"
      );
      popupWinindow.document.open();

      let documentContent = "<html><head>";
      documentContent +=
        '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
      documentContent +=
        '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
      documentContent +=
        '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
      documentContent += "</head>";
      documentContent +=
        '<body onload="window.print()">' + printContents + "</body></html>";

      popupWinindow.document.write(documentContent);
      popupWinindow.document.close();
    } catch (ex) {
      console.log(ex);
    }
  }
  public dateRange : string = '';
  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }
}
