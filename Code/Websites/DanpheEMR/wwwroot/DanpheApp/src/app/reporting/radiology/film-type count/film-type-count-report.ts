import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import * as moment from "moment";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ReportingService } from "../../shared/reporting-service";
import { RPT_RAD_Film_Type_CountModel } from "./film-type-count-report.model";

@Component({
    templateUrl: "./film-type-count-report-view.html"
})
export class RPT_RAD_FilmTypeCountReportComponent {

    // FilmTypeId, FilmQuantity
    public FilmTypeCountColumns: Array<any> = null;
    public FilmTypeCountData: Array<RPT_RAD_Film_Type_CountModel> = new Array<RPT_RAD_Film_Type_CountModel>();
    public NepaliDateInGridSettings: any;
    public fromDate: any;
    public toDate: any;
    public filterParameters: any;
    dlService: DLService = null;
    http: HttpClient = null;

    public CurrentFilmCount: RPT_RAD_Film_Type_CountModel = new RPT_RAD_Film_Type_CountModel();

    constructor(_http: HttpClient, _dlService: DLService, public msgBoxServ: MessageboxService, public reportServ: ReportingService) {
        //this.RevenueGeneratedColumns = ReportGridColumnSettings.RevenueGenerated;
        this.http = _http;
        this.dlService = _dlService;
        this.CurrentFilmCount.fromDate = moment().format('YYYY-MM-DD');
        this.CurrentFilmCount.toDate = moment().format('YYYY-MM-DD');
        this.FilmTypeCountColumns = reportServ.reportGridCols.RPT_RAD_FilmTypeCountColumns;

    }

    gridExportOptions = {
        fileName: 'filmTypeCount' + moment().format('YYYY-MM-DD') + '.xls',
        //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']

    };

    OnFromToDateChange($event) {
        this.fromDate = $event ? $event.fromDate : this.fromDate;
        this.toDate = $event ? $event.toDate : this.toDate;
        this.CurrentFilmCount.fromDate = this.fromDate;
        this.CurrentFilmCount.toDate = this.toDate;
    }

    Load() {

        if (this.CurrentFilmCount.fromDate != null && this.CurrentFilmCount.toDate != null) {

            this.filterParameters = [{ DisplayName: "FromDate", Value: this.fromDate },
            { DisplayName: "ToDate", Value: this.toDate }]
            this.NepaliDateInGridSettings = new NepaliDateInGridParams();
            this.dlService.Read("/Reporting/FilmTypeCountReport?FromDate="
                + this.CurrentFilmCount.fromDate + "&ToDate=" + this.CurrentFilmCount.toDate)
                .map(res => res)
                .subscribe(res => this.Success(res),
                    res => this.Error(res));
        } else {
            this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
        }

    }
    OnGridExport($event: GridEmitModel) {
        this.dlService.ReadExcel("/ReportingNew/ExportToExcelDailyAppointment?FromDate="
            + this.fromDate + "&ToDate=" + this.toDate
        )
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "Radiology_Film_Used" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
                document.body.appendChild(a);
                a.click();
            },
                res => this.Error(res));
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
    }
    Success(res) {
        if (res.Status == "OK" && res.Results.length > 0) {

            this.FilmTypeCountColumns = this.reportServ.reportGridCols.RPT_RAD_FilmTypeCountColumns;
            this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
            this.FilmTypeCountData = res.Results;
        }
        else if (res.Status == "OK" && res.Results.length == 0) {
            this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
    }
}