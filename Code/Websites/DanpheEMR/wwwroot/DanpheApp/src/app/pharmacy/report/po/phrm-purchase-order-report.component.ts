
import { Component, Directive, ViewChild } from '@angular/core';
import { FormControlName } from '@angular/forms';
import * as moment from 'moment/moment';
import { PHRMReportsModel } from "../../shared/phrm-reports-model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';


@Component({
    templateUrl: "./phrm-purchase-order-report.html"
})
export class PHRMPurchaseOrderReportComponent {

    public calType: string = "";

    public Status: string = "";
    // public fromDate: string = null;
    //  public toDate: string = null;
    //  public selFromDate: string = null;
    //  public selToDate: string = null;
    PHRMPurchaseOrderReportColumns: Array<any> = null;
    PHRMPurchaseOrderReportData: Array<any> = new Array<PHRMReportsModel>();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public dateRange: string = "";
    public pharmacy: string = "pharmacy";
    public loading: boolean = false;

    constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService) {
        this.PHRMPurchaseOrderReportColumns = PHRMReportsGridColumns.PHRMPurchaseOrderReport;
        this.phrmReports.FromDate = moment().format('YYYY-MM-DD');
        this.phrmReports.ToDate = moment().format('YYYY-MM-DD');
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
        // this.fromDate = moment().format('YYYY-MM-DD');
        // this.toDate = moment().format('YYYY-MM-DD');
        this.phrmReports.Status = "all";
        this.Load();
    };

    //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'PharmacyPurchaseOrderReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    Load() {
        this.loading = true;
        this.pharmacyBLService.GetPHRMPurchaseOrderReport(this.phrmReports)
            .subscribe(res => {
                if (res.Status == 'OK') {

                    this.PHRMPurchaseOrderReportColumns = PHRMReportsGridColumns.PHRMPurchaseOrderReport;
                    this.PHRMPurchaseOrderReportData = res.Results;

                }
                else {

                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                }
                this.loading = false;
            });

    }


    OnFromToDateChange($event) {
        this.phrmReports.FromDate = $event ? $event.fromDate : this.phrmReports.FromDate;
        this.phrmReports.ToDate = $event ? $event.toDate : this.phrmReports.ToDate;
        this.dateRange = "<b>Date:</b>&nbsp;" + this.phrmReports.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.phrmReports.ToDate;
    }



}






