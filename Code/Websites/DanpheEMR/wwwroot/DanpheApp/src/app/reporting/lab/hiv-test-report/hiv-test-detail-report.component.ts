import { Component } from "@angular/core";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../../app/shared/danphe-grid/NepaliColGridSettingsModel";
import { CoreService } from "../../../../app/core/shared/core.service";
import { DLService } from "../../../../app/shared/dl.service";
import { MessageboxService } from "../../../../app/shared/messagebox/messagebox.service";
import { ReportingService } from "../../shared/reporting-service";
import * as moment from "moment";

@Component({
  selector: "hiv-test-report",
  templateUrl: "hiv-test-detail-report.html",
})
export class RPT_HIVTestDetailReport {
  public hivTestReportColumns: Array<any> = null;
  public filteredHivTestReportData: Array<any> = null;
  public hivTestReportData: Array<any> = null;
  public fromDate: any;
  public toDate: any;
  public showGrid: boolean = false;
  public NepaliDateInGridSettings: NepaliDateInGridParams =
    new NepaliDateInGridParams();
  public labLists:any;
  public dateRange:string="";	
  public selectedLab:string = 'all';
  public loading:boolean = false;
  constructor(
    public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public coreService: CoreService
  ) {
    this.hivTestReportColumns = this.reportServ.reportGridCols.HIVTestsReport;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(
      new NepaliDateInGridColumnDetail("ResultDate", false)
    );
    this.labLists = this.coreService.labTypes;
  }

  Load() {
    this.filteredHivTestReportData = [];
    this.dlService
      .Read(
        "/Reporting/GetHIVTestsDetailReport?FromDate=" +
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
    this.loading = false;
  }

  Success(res) {
    this.loading = false;
    if (res.Status == "OK" && res.Results.length > 0) {
      this.hivTestReportData = res.Results;
      console.log(this.hivTestReportData)
      this.onLabTypeChange();
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
    fileName: "HIVTestDetailsReport" + moment().format("YYYY-MM-DD") + ".xls",
  };

  OnFromToDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    this.dateRange="<b>Date:</b>&nbsp;"+this.fromDate+"&nbsp;<b>To</b>&nbsp;"+this.toDate;
  }

  onLabTypeChange(){
    if(this.hivTestReportData && this.hivTestReportData.length>0){
     var value = this.selectedLab;
     if(value == 'all')
     this.filteredHivTestReportData = this.hivTestReportData;
     else
     this.filteredHivTestReportData = this.hivTestReportData.filter(a=>a.LabTypeName == value);
   }
 }
}