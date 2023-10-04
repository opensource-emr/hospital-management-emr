import { ChangeDetectorRef, Component, Directive, ViewChild } from '@angular/core';
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import { PHRMReportsModel } from '../../shared/phrm-reports-model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { DispensaryService } from '../../../dispensary/shared/dispensary.service';
import { PHRMStoreModel } from '../../shared/phrm-store.model';

@Component({
    selector: 'my-app',
    templateUrl: "./phrm-billing-report.html"
})
export class PHRMBillingReportComponent {

    ///Pharmacy Billing Report Columns variable
    PHRMBillingReportColumns: Array<any> = null;
    ///Pharmacy Billing Report Data variable
    PHRMBillingReportData: Array<any> = new Array<any>();
    ////Variable to Bind Item Name
    public InvoiceNumber: number = 0;
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

    public footerContent = '';
    public dateRange: string = "";

    dispensaryList: any[] = [];
    storeWiseBillingSummary: { StoreName: string, SubTotal: number, Discount: number, TotalAmount: number, ReceivedAmount: number, CreditAmount: number }[] = [];
    public loading: boolean = false;



    constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService, public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef, public dispensaryService: DispensaryService) {
        this.PHRMBillingReportColumns = PHRMReportsGridColumns.PHRMBillingReport;
        this.InvoiceNumber = null;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("InvoiceDate"));
        this.getAllDispensaries();
    }


    //////Export data grid options for excel file
    gridExportOptions = {
        fileName: 'BillingReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    getAllDispensaries() {
        this.dispensaryService.GetAllDispensaryList().subscribe(res => {
            if (res.Status == "OK") {
                this.dispensaryList = res.Results;
            }
            else {
                this.msgBoxServ.showMessage("Failed", ["Failed to load the dispensaries."]);
            }
        });
    }

    //////Function Call on Button Click of Report
    GetReportData() {
        if (this.phrmReports.FromDate == null || this.phrmReports.ToDate == null) {
            this.msgBoxServ.showMessage('Notice', ['Please select valid date.']);
            return;
        }
        this.loading = true;
        if (this.phrmReports.FromDate && this.phrmReports.ToDate) {
            this.PHRMBillingReportData = [];
            this.pharmacyBLService.GetPharmacyBillingReport(this.phrmReports, this.InvoiceNumber).finally(() => {
                this.loading = false;
            }).subscribe(res => {
                if (res.Status == 'OK' && res.Results.length > 0) {
                    ////Assign report Column from GridConstant to PHRMBillingReportColumns
                    this.PHRMBillingReportColumns = PHRMReportsGridColumns.PHRMBillingReport;
                    ////Assign  Result to PHRMBillingReportData
                    this.PHRMBillingReportData = res.Results;
                    this.calulateSummaryData();

                    this.changeDetector.detectChanges();
                    this.footerContent = document.getElementById("print_summary").innerHTML;
                }
                if (res.Status == 'OK' && res.Results.length == 0) {
                    this.msgBoxServ.showMessage("Notice-Message", ["No Data is Available for Selected Record"]);
                }
            });
        }
    }

    calulateSummaryData() {
        this.storeWiseBillingSummary = [];
        this.dispensaryList.forEach(dispensary => {
            var storeWiseReportData = this.PHRMBillingReportData.filter(a => a.StoreId == dispensary.StoreId);

            var storeWiseSubtotalAmount = storeWiseReportData.reduce((a, b) => a + b.SubTotal, 0);
            var storeWiseTotalDiscount = storeWiseReportData.reduce((a, b) => a + b.DiscountAmount, 0);
            var storeWiseTotalAmount = storeWiseReportData.reduce((a, b) => a + b.TotalAmount, 0);
            var storeWiseReceivedAmount = storeWiseReportData.reduce((a, b) => a + b.ReceivedAmount, 0);
            var storeWiseCreditAmount = storeWiseReportData.reduce((a, b) => a + b.CreditAmount, 0);
            this.storeWiseBillingSummary.push(
                { StoreName: dispensary.Name, SubTotal: storeWiseSubtotalAmount, Discount: storeWiseTotalDiscount, TotalAmount: storeWiseTotalAmount, ReceivedAmount: storeWiseReceivedAmount, CreditAmount: storeWiseCreditAmount }
            );
        });

        var grandSubTotal = this.PHRMBillingReportData.reduce((a, b) => a + b.SubTotal, 0);
        var grandTotalDiscount = this.PHRMBillingReportData.reduce((a, b) => a + b.DiscountAmount, 0);
        var grandTotalAmount = this.PHRMBillingReportData.reduce((a, b) => a + b.TotalAmount, 0);
        var grandReceivedAmount = this.PHRMBillingReportData.reduce((a, b) => a + b.ReceivedAmount, 0);
        var grandCreditAmount = this.PHRMBillingReportData.reduce((a, b) => a + b.CreditAmount, 0);
        this.storeWiseBillingSummary.push(
            { StoreName: "All", SubTotal: grandSubTotal, Discount: grandTotalDiscount, TotalAmount: grandTotalAmount, ReceivedAmount: grandReceivedAmount, CreditAmount: grandCreditAmount }
        );
    }

    ////on click grid export button we are catching in component an event.. 
    ////and in that event we are calling the server excel export....
    OnGridExport($event: GridEmitModel) {
        this.dlService.ReadExcel("/api/PharmacyReport/ExportToExcelPHRMBillingReport?InvoiceNumber=" + this.InvoiceNumber)
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "BillingReport" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
                document.body.appendChild(a);
                a.click();
            },

                res => this.ErrorMsg(res));
    }
    ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
        console.log(err.ErrorMessage);
    }

    OnFromToDateChange($event) {
        if ($event) {
            this.phrmReports.FromDate = $event.fromDate;
            this.phrmReports.ToDate = $event.toDate;
            this.dateRange = "<b>Date:</b>&nbsp;" + this.phrmReports.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.phrmReports.ToDate;
        }

    }
}






