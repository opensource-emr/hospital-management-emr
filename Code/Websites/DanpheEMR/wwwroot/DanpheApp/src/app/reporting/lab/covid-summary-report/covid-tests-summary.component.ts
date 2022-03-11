import { Component } from "@angular/core";
import * as moment from "moment";
import { CountrySubdivision } from "../../../settings-new/shared/country-subdivision.model";
import { CoreService } from "../../../../app/core/shared/core.service";
import { NepaliDateInGridParams } from "../../../../app/shared/danphe-grid/NepaliColGridSettingsModel";
import { DLService } from "../../../../app/shared/dl.service";
import { MessageboxService } from "../../../../app/shared/messagebox/messagebox.service";
import { ReportingService } from "../../shared/reporting-service";

@Component({
  selector: 'covid-tests-summary',
  templateUrl: 'covid-tests-summary.html'
})

export class RPT_CovidTestsSummaryReport {

  public countrySubDivisions: Array<CountrySubdivision> = [];
  public countrySubDivision: CountrySubdivision = null;

  public testname: string = null;
  public districtName: string = '';
  public resultType: string = '';
  public showGrid: boolean = false;
  public covidCaseSummaryReportColumns: Array<any> = null;
  public covidCaseSummaryReportData: Array<any> = null;
  public fromDate: any;
  public toDate: any;
  public footer = '';
  public dateRange:string = "";

  public summaryFormatted = {
    TotalNewPositiveCase: 0,
    TotalNewNegativeCase: 0,
    TotalFollowUpPositiveCase: 0,
    TotalFollowUpNegativeCase: 0,
    TotalCase: 0
  }

  constructor(public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public coreService: CoreService) {
    this.GetCountrySubDivision();
    this.covidCaseSummaryReportColumns = this.reportServ.reportGridCols.CovidTestsSummary;
    var name = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'common' && a.ParameterName == 'CovidTestName');
    if (name) {
      var paramValue = JSON.parse(name.ParameterValue);
      this.testname = paramValue.DisplayName;
    }
  }

  ngAfterViewChecked() {
    if (document.getElementById("summaryFooter") != null)
      this.footer = document.getElementById("summaryFooter").innerHTML;
  }


  Load() {
    var countrySubDivisionId = this.countrySubDivision ? this.countrySubDivision.CountrySubDivisionId : 0;
    this.dlService
      .Read(
        "/Reporting/CovidTestsCumulativeReport?testName=" + this.testname + "&CountrySubDivisionId=" + countrySubDivisionId + "&FromDate=" + this.fromDate + "&ToDate=" + this.toDate)
      .map((res) => res)
      .subscribe(
        (res) => this.Success(res),
        (err) => this.Error(err)
      );
  }

  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }

  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.covidCaseSummaryReportData = res.Results;
      this.getSummary(this.covidCaseSummaryReportData);
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
    fileName: 'CovidTestSummaryReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

  

  districtListFormatter(data: any): string {
    let html = data["CountrySubDivisionName"];
    return html;
  }

  GetCountrySubDivision() {
    this.dlService
      .Read("/api/Master?type=GetCountrySubDivision&countryId=" + 0)
      .map((res) => res)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results) {
          this.countrySubDivisions = [];
          this.countrySubDivisions = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", ['Failed to get country sub divisions.']);
          console.log(res.ErrorMessage);
        }
      });
  }
  getSummary(data: any) {
    this.summaryFormatted.TotalNewPositiveCase = 0;
    this.summaryFormatted.TotalNewNegativeCase = 0;
    this.summaryFormatted.TotalFollowUpPositiveCase = 0;
    this.summaryFormatted.TotalFollowUpNegativeCase = 0;
    this.summaryFormatted.TotalCase = 0;

    data.forEach(a => {
      this.summaryFormatted.TotalNewPositiveCase += a.NewPositiveCases;
      this.summaryFormatted.TotalNewNegativeCase += a.NewNegativeCases;
      this.summaryFormatted.TotalFollowUpPositiveCase += a.FollowupPositiveCases;
      this.summaryFormatted.TotalFollowUpNegativeCase += a.FollowupNegativeCases;
      this.summaryFormatted.TotalCase += (a.NewPositiveCases + a.NewNegativeCases + a.FollowupPositiveCases + a.FollowupNegativeCases);
    });
  }
    OnFromToDateChange($event) {
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
        this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
    }
}