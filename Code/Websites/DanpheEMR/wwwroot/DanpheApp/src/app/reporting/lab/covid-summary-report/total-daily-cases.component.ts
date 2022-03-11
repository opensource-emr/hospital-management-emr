import { Component } from "@angular/core";
import * as moment from "moment";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../../app/shared/danphe-grid/NepaliColGridSettingsModel";
import { CoreService } from "../../../../app/core/shared/core.service";
import { DLService } from "../../../../app/shared/dl.service";
import { MessageboxService } from "../../../../app/shared/messagebox/messagebox.service";
import { ReportingService } from "../../shared/reporting-service";
import { CountrySubdivision } from "../../../../app/settings-new/shared/country-subdivision.model";
import { filter } from "rxjs/operators";

@Component({
  selector: 'daily-total-covid-cases',
  templateUrl: 'total-daily-cases.html'
})

export class RPT_TotalDailyCovidCasesReport {
  public totalDailyCovidCasesReportColumns: Array<any> = null;
  public TotalDailyCovidCasesReportData: Array<any> = null;
  public FilltedDailyCovidCasesReportData: Array<any> = null;
  public fromDate: any;
  public toDate: any;
  reportData: Array<any> = [];
  public showGrid: boolean = false;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public testname: string = null;
  public countrySubDivisions: Array<CountrySubdivision> = [];
  public countrySubDivision: CountrySubdivision = null;
  public resultType: string = 'all';
  public Gender: string = 'all';
  public CaseType: string = 'all';
  public componentName: string = null;
  public dateRange: string = "";
  public footer = '';

  public summaryFormatted = {
    TotalPositiveCase: 0,
    TotalNegativeCase: 0,
    TotalCase: 0
  }

  loading: boolean = false;//to disable multiple-clicks of the show-report button.
  constructor(public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public coreService: CoreService
  ) {
    this.GetCountrySubDivision();

    this.totalDailyCovidCasesReportColumns = this.reportServ.reportGridCols.TotalCovidCasesDetailReport;
    var name = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'common' && a.ParameterName == 'CovidTestName');
    if (name) {
      var paramValue = JSON.parse(name.ParameterValue);
      this.testname = paramValue ? paramValue.DisplayName : 'RT-PCR NCOV-2';
    }

    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("CollectionDate", false));
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("TestDate", false));
  }

  ngAfterViewChecked() {
    if (document.getElementById("summaryFooter") != null)
      this.footer = document.getElementById("summaryFooter").innerHTML;
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

  Load() {
    this.loading = true;//disable the button until some report comes.. 
    var countrySubDivisionId = this.countrySubDivision ? this.countrySubDivision.CountrySubDivisionId : 0;
    this.TotalDailyCovidCasesReportData = [];
    this.FilltedDailyCovidCasesReportData = [];
    this.dlService
      .Read(
        "/Reporting/TotalCovidTestsDetailReport?testName=" + this.testname + "&CountrySubDivisionId=" +
        countrySubDivisionId + "&ResultType=" + this.resultType + "&FromDate=" + this.fromDate + "&ToDate=" + this.toDate + "&CaseType=" + this.CaseType + "&gender=" + this.Gender)
      .map((res) => res)
      .finally(() => { this.loading = false; })//re-enable show report button after api call is success..
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
      this.TotalDailyCovidCasesReportData = res.Results;
      this.OnGenderChange();
      //this.FilltedDailyCovidCasesReportData = res.Results;
      this.getSummary(this.FilltedDailyCovidCasesReportData)
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
    fileName: 'TotalCovidTestsDetailsReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

  districtListFormatter(data: any): string {
    let html = data["CountrySubDivisionName"];
    return html;
  }

  OnFromToDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }

  OnGenderChange() {
    if (this.Gender == 'male') {
      this.FilltedDailyCovidCasesReportData = this.TotalDailyCovidCasesReportData.filter(a => a.Gender && a.Gender.toLowerCase() == 'male');
    }
    else if (this.Gender == 'female') {
      this.FilltedDailyCovidCasesReportData = this.TotalDailyCovidCasesReportData.filter(a => a.Gender && a.Gender.toLowerCase() == 'female');
    }
    else {
      this.FilltedDailyCovidCasesReportData = Object.assign([], this.TotalDailyCovidCasesReportData);
    }
  }

  OnCaseTypeChange() {
    //console.log(this.CaseType);
  }

  OnResultTypeChange() {
    //console.log(this.resultType);
  }

  getSummary(data: any) {
    this.summaryFormatted.TotalPositiveCase = data.filter(a => a.Report.toLowerCase() == 'positive').length;
    this.summaryFormatted.TotalNegativeCase = data.filter(a => a.Report.toLowerCase() == 'negative').length;
    this.summaryFormatted.TotalCase = this.summaryFormatted.TotalPositiveCase + this.summaryFormatted.TotalNegativeCase;
  }

}