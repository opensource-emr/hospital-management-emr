import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService} from "../../../reporting/shared/reporting-service";
import { DLService } from "../../../shared/dl.service"

import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../../shared/common.functions';

import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

@Component({
  templateUrl: "./bill-cancel-summary.html"
})
export class RPT_BIL_BillCancelSummaryComponent {

    public TodayDate: string = null;

    billCancelSummaryColumns: Array<any> = null;
    billCancelSummaryData: Array<any> = new Array<any>();


    dlService: DLService = null;

    constructor(_dlService: DLService, public msgBoxServ: MessageboxService, public reportServ: ReportingService) {
       
        this.dlService = _dlService;
        this.TodayDate = moment().format('DD-MM-YYYY');
        this.Load();
    }
    gridExportOptions = {
        fileName: 'BillCancelReport' + moment().format('YYYY-MM-DD') + '.xls'
    };


    Load() {
      this.dlService.Read("/BillingReports/BillCancelSummaryReport")
            .map(res => res)
            .subscribe(res => this.Success(res),
            res => this.Error(res));
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", [err]);
    }
    Success(res) {
        if (res.Status == "OK") {
            this.billCancelSummaryColumns = this.reportServ.reportGridCols.BillCancelSummaryColumns;
            this.billCancelSummaryData = res.Results;

        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }

    }


    //on click grid export button we are catching in component an event.. 
    //and in that event we are calling the server excel export....
    OnGridExport($event: GridEmitModel) {
        this.dlService.ReadExcel("/ReportingNew/ExportToExcelCancelBills")
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "CancelBillsReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
                document.body.appendChild(a);
                a.click();
            },

            res => this.ErrorMsg(res));
    }
    ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
        console.log(err.ErrorMessage);
    }

}
