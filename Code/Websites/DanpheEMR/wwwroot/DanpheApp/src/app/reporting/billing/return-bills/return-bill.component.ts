import { Component, Directive, ViewChild } from '@angular/core';
import * as moment from 'moment/moment';

import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_BIL_ReturnBillModel } from './return-bill.model';

import { DLService } from "../../../shared/dl.service"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

import { CommonFunctions } from '../../../shared/common.functions';

import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

@Component({
  templateUrl: "./return-bill.html"
})
export class RPT_BIL_ReturnBillReportComponent {

    public fromDate: Date = null;
    public toDate: Date = null;
  public currentReturnBill: RPT_BIL_ReturnBillModel = new RPT_BIL_ReturnBillModel();
    ReturnBillColumns: Array<any> = null;
    ReturnBillData: Array<any> = new Array<any>();
    dlService: DLService = null;

    constructor(_dlService: DLService, public msgBoxServ: MessageboxService, public reportServ: ReportingService) {
        this.dlService = _dlService;
        this.currentReturnBill.fromDate = moment().format('YYYY-MM-DD');
        this.currentReturnBill.toDate = moment().format('YYYY-MM-DD');
    }
    gridExportOptions = {
        fileName: 'ReturnBill_' + moment().format('YYYY-MM-DD') + '.xls'

    };


    Load() {
        this.dlService.Read("/BillingReports/ReturnBillReport?FromDate="
            + this.currentReturnBill.fromDate + "&ToDate=" + this.currentReturnBill.toDate)
            .map(res => res)
            .subscribe(res => this.Success(res),
            res => this.Error(res));
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", [err]);
    }
    Success(res) {
        if (res.Status == "OK" && res.Results.length > 0) {
            this.ReturnBillColumns = this.reportServ.reportGridCols.ReturnBillGridColumn;
            this.ReturnBillData = res.Results;
            if (this.ReturnBillData) {
                this.ReturnBillData.forEach(bil => {
                    bil.SubTotal = CommonFunctions.parseAmount(bil.SubTotal);
                    bil.DiscountAmount = CommonFunctions.parseAmount(bil.DiscountAmount);
                    bil.TaxableAmount = CommonFunctions.parseAmount(bil.TaxableAmount);
                    bil.TaxTotal = CommonFunctions.parseAmount(bil.TaxTotal);
                    bil.TotalAmount = CommonFunctions.parseAmount(bil.TotalAmount);
                });

            }
        }
        else if (res.Status == "OK" && res.Results.length == 0) {
            this.msgBoxServ.showMessage("notice-message", ['No Data is Available Between Selected Parameters....Try Different Dates'])
            this.ReturnBillColumns = this.reportServ.reportGridCols.ReturnBillGridColumn;
            this.ReturnBillData = res.Results;
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
    }


    //on click grid export button we are catching in component an event.. 
    //and in that event we are calling the server excel export....
    OnGridExport($event: GridEmitModel) {
        this.dlService.ReadExcel("/ReportingNew/ExportToExcelReturnBills?FromDate="
            + this.currentReturnBill.fromDate + "&ToDate=" + this.currentReturnBill.toDate)
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "ReturnBills_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
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
