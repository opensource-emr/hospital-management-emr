import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService} from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

import { RPT_RAD_TotalRevenueFromRadiologyModel } from "./total-revenue-from-radiology.model"
import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';

@Component({
  templateUrl: "./total-revenue-from-radiology.html"
})
export class RPT_RAD_TotalRevenueFromRadiologyComponent {

    public fromDate: Date = null;
    public toDate: Date = null;

    RevenueGeneratedColumns: Array<any> = null;
  RevenueGeneratedData: Array<any> = new Array<RPT_RAD_TotalRevenueFromRadiologyModel>();
  public CurrentRadiologyRevenue: RPT_RAD_TotalRevenueFromRadiologyModel = new RPT_RAD_TotalRevenueFromRadiologyModel();


    dlService: DLService = null;
    http: HttpClient = null;
    constructor(_http: HttpClient, _dlService: DLService, public msgBoxServ: MessageboxService, public reportServ: ReportingService) {
        //this.RevenueGeneratedColumns = ReportGridColumnSettings.RevenueGenerated;
        this.http = _http;
        this.dlService = _dlService;
        this.CurrentRadiologyRevenue.fromDate = moment().format('YYYY-MM-DD');
        this.CurrentRadiologyRevenue.toDate = moment().format('YYYY-MM-DD');
    }
    

        gridExportOptions = {
            fileName: 'RevenueGeneratedList_' + moment().format('YYYY-MM-DD') + '.xls',
            //displayColumns: ['EMPI', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']
            
        };


    Load() {
        this.dlService.Read("/Reporting/RevenueGenerated?FromDate="
            + this.CurrentRadiologyRevenue.fromDate + "&ToDate=" + this.CurrentRadiologyRevenue.toDate)
            .map(res => res)
            .subscribe(res => this.Success(res),
            res => this.Error(res));
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
    }
    Success(res) {
        if (res.Status == "OK" && res.Results.length > 0) {

          this.RevenueGeneratedColumns = this.reportServ.reportGridCols.RPT_RAD_RevenueGenerated;
            this.RevenueGeneratedData = res.Results;
        }
        else if (res.Status == "OK" && res.Results.length == 0) {
            this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
    }
}
