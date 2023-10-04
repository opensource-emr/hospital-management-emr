import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { DLService } from "../../shared/dl.service";
import { ReportingService } from "../shared/reporting-service";
import * as moment from "moment/moment";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../shared/danphe-grid/NepaliColGridSettingsModel";

@Component({
    selector: 'police-case',
    templateUrl: './police-case-report.html'
})

export class RPT_PoliceCaseReportComponent {
    public PoliceCaseGridColumns: Array<any> = null;
    public PoliceCaseData: Array<any> = null;
    public fromDate: string = null;
    public toDate: string = null;
    dlService: DLService = null;
    http: HttpClient = null;
    public showGrid:boolean = false;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public showDischargedOnly: boolean = false;

    constructor(
        _http: HttpClient,
        _dlService: DLService,
        public msgBoxService: MessageboxService,
        public reportService: ReportingService
    ) {
        this.http = _http;
        this.dlService = _dlService;
        this.fromDate = moment().format("YYYY-MM-DD");
        this.toDate = moment().format("YYYY-MM-DD");
    }

    Load(){
        this.NepaliDateInGridSettings = new NepaliDateInGridParams();
        this.dlService.Read("/Reporting/PoliceCaseReport?FromDate=" +this.fromDate + "&ToDate=" +this.toDate).map((res) => res).subscribe(
            (res) => this.Success(res),
            (res) => this.Error(res)
        );
    }
    Error(err) {
        this.msgBoxService.showMessage("error", [err]);
    }
    Success(res) {
        if(res.Status == "OK" && res.Results.length > 0){
            this.showGrid = true;
            this.PoliceCaseGridColumns = this.reportService.reportGridCols.PoliceCaseReportCol;
            this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("AdmissionDate", false));
            this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("DischargedDate", false));
            if(this.showDischargedOnly == true){
                this.PoliceCaseData = res.Results.filter(d => d.AdmissionStatus == "discharged");
            }else{
                this.PoliceCaseData = res.Results;
            }
            
        }else if(res.Status == "OK" && res.Results.length == 0){
            this.msgBoxService.showMessage("notice-message", [
                "No Data is Available for Selected Parameters"
            ]);
        }else{
            this.msgBoxService.showMessage("failed", [res.ErrorMessage]);
        }
    }

    onDateChange($event) {
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
    }

    public checkValue(event){
        if(event == true){
            this.showDischargedOnly = true;
            this.Load();
          }else{
            this.showDischargedOnly = false;
            this.Load();
          }
    }
}