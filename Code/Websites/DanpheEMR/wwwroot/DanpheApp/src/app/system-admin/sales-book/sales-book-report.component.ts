import { Component, Directive, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SystemAdminBLService } from '../shared/system-admin.bl.service';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from "../../core/shared/core.service";
import { InvoiceDetailsModel } from '../shared/invoice-details.model'
import { CommonFunctions } from '../../shared/common.functions';
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { NepaliDate } from '../../shared/calendar/np/nepali-dates';
import { PhrmInvoiceDetailsModel } from '../shared/phrm-invoice-details.model'

@Component({
    templateUrl: "../../view/system-admin-view/SalesBookReport.html" // /SystemAdminView/SalesBookReport
})

export class SalesBookReportComponent {

    public fromDate: string = null;
    public toDate: string = null;
    public displayStartDate: string = "";
    public displayEndDate: string = "";
    public calType: string = "en,np";

    public sumTotalAmount: number = 0;
    public sumDiscountAmount: number = 0;
    public sumTaxableAmount: number = 0;
    public sumTaxableTAX: number = 0;
    public sumNONTaxableSales: number = 0;
    public sumExportSales: number = 0;
    public displayReport: boolean = false;
    public systemAdminBLService: SystemAdminBLService = null;
    public curtSalesBookDetail: Array<InvoiceDetailsModel> = new Array<InvoiceDetailsModel>();
    public curtPhrmSalesBookDetail: Array<PhrmInvoiceDetailsModel> = new Array<PhrmInvoiceDetailsModel>();
    public finalData: Array<InvoiceDetailsModel> = new Array<InvoiceDetailsModel>();
    public headerDetail: { CustomerName, Address, Email, CustomerRegLabel,CustomerRegNo,Tel};
    constructor(_systemAdminBLService: SystemAdminBLService, public msgBoxServ: MessageboxService
        , public changeDetectorRef: ChangeDetectorRef
        , public coreservice: CoreService, public npCalService: NepaliCalendarService) {
        this.systemAdminBLService = _systemAdminBLService;
        this.fromDate = moment().format('YYYY-MM-DD');
        this.toDate = moment().format('YYYY-MM-DD');
        this.LoadCalendarTypes();
        this.GetBillingHeaderParameter();
    }
    //loads CalendarTypes from Paramter Table (database) and assign the require CalendarTypes to local variable.
    LoadCalendarTypes() {
        let Parameter = this.coreservice.Parameters;
        Parameter = Parameter.filter(parms => parms.ParameterGroupName == "SysAdmin" && parms.ParameterName == "CalendarTypes");
        let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
        this.calType = calendarTypeObject.IRDSalesBook;
    }

    GetInvoiceDetails(): void {
        this.displayStartDate = this.fromDate;
        this.displayEndDate = this.toDate;
        this.GetBillingInvoiceDetails();
    }
    public GetBillingInvoiceDetails(): void {
        this.systemAdminBLService.GetInvoiceDetails(this.displayStartDate, this.displayEndDate).
            subscribe(res => {
                if (res.Status == 'OK') {
                    this.finalData = new Array<InvoiceDetailsModel>();
                    let salesDetails: Array<any> = res.Results;
                    salesDetails.forEach(itm => {
                        //itm.Is_Active = true;
                        // itm.BillNo = itm.Bill_No;
                        itm.BillDate_Np = this.npCalService.ConvertEngToNepDateString(itm.BillDate);
                        itm.BillDate = moment(itm.BillDate).format("YYYY-MM_DD");
                    });

                    this.curtSalesBookDetail = salesDetails;
                    this.curtSalesBookDetail.forEach(itm => {
                        var amt = 0;
                       // itm.Bill_No = this.extractBillNumbers(itm.Bill_No);
                        itm.DiscountAmount = CommonFunctions.parseAmount(itm.DiscountAmount);
                        itm.Taxable_Amount = CommonFunctions.parseAmount(itm.Taxable_Amount);
                        itm.Tax_Amount = CommonFunctions.parseAmount(itm.Tax_Amount);
                        itm.Total_Amount = CommonFunctions.parseAmount(itm.Total_Amount);
                        itm.Bill_No_Str = itm.Bill_No.toString();
                        itm.NonTaxable_Amount = CommonFunctions.parseAmount(itm.Total_Amount - itm.Taxable_Amount);
                    }
                    );
                    this.calculation();
                    this.finalData = Object.assign(this.finalData, this.curtSalesBookDetail);
                    // this.callBackBillingInvoiceDetails();//call for get phrm invoice details
                }
                else if (res.Status == 'Failed') {
                    console.log(res.ErrorMessage);
                    this.msgBoxServ.showMessage("error", ['error please check console log for details']);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to take database backup Log.']);
                });
    }
    //call for get phrm invoice details
    public callBackBillingInvoiceDetails() {
        this.systemAdminBLService.GetPhrmInvoiceDetails(this.displayStartDate, this.displayEndDate).
            subscribe(res => {
                if (res.Status == 'OK') {
                    let salesDetails: Array<any> = res.Results;
                    salesDetails.forEach(itm => {
                        itm.BillDate_Np = this.npCalService.ConvertEngToNepDateString(itm.BillDate);

                    });
                    this.curtPhrmSalesBookDetail = salesDetails;
                    this.curtPhrmSalesBookDetail.forEach(itm => {
                        itm.Bill_No = this.extractBillNumbers(itm.Bill_No);
                        itm.Total_Amount = CommonFunctions.parseAmount(itm.Total_Amount);
                        itm.DiscountAmount = CommonFunctions.parseAmount(itm.DiscountAmount);
                        itm.Taxable_Amount = CommonFunctions.parseAmount(itm.Taxable_Amount);
                        itm.Tax_Amount = CommonFunctions.parseAmount(itm.Tax_Amount);
                        itm.NonTaxable_Amount = CommonFunctions.parseAmount(itm.NonTaxable_Amount);
                        itm.Bill_No_Str = "PH" + itm.Bill_No;
                    }
                    );
                    this.calculation();
                    // this.changeDetectorRef.detectChanges();
                    Array.prototype.push.apply(this.curtSalesBookDetail, this.curtPhrmSalesBookDetail);
                    //this.curtSalesBookDetail.sort(function (a, b) {
                    //    return a.Bill_No - b.Bill_No
                    //});
                    this.curtSalesBookDetail.sort(function (a, b) {
                        return +new Date(b.BillDate) - +new Date(a.BillDate)
                    });
                    this.finalData = Object.assign(this.finalData, this.curtSalesBookDetail);
                    this.changeDetectorRef.detectChanges();
                }
                else if (res.Status == 'Failed') {
                    console.log(res.ErrorMessage);
                    this.msgBoxServ.showMessage("error", ['error please check console log for details']);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to take database backup Log.']);
                });
    }
    extractBillNumbers(value: any) {
        if (!value) return 0;
        let number = value;
        if (isNaN(value)) {
            number = value.toString().replace(/[^\d.-]/g, '');
        }
        return Number(number);
    }
    calculation() {

        if (this.fromDate != null && this.toDate != null) {
            this.displayReport = true;
            this.sumDiscountAmount = 0;
            this.sumTaxableAmount = 0;
            this.sumTaxableTAX = 0;
            this.sumTotalAmount = 0;
            this.sumNONTaxableSales = 0;
            this.sumExportSales = 0;
            if (this.curtSalesBookDetail != null) {
                for (let i = 0; i < this.curtSalesBookDetail.length; i++) {
                    this.sumTotalAmount = CommonFunctions.parseAmount(this.sumTotalAmount + this.curtSalesBookDetail[i].Total_Amount);
                    this.sumDiscountAmount = CommonFunctions.parseAmount(this.sumDiscountAmount + this.curtSalesBookDetail[i].DiscountAmount);
                    this.sumTaxableAmount = CommonFunctions.parseAmount(this.sumTaxableAmount + this.curtSalesBookDetail[i].Taxable_Amount);
                    this.sumTaxableTAX = CommonFunctions.parseAmount(this.sumTaxableTAX + this.curtSalesBookDetail[i].Tax_Amount);
                    this.sumNONTaxableSales = CommonFunctions.parseAmount(this.sumNONTaxableSales + this.curtSalesBookDetail[i].NonTaxable_Amount);
                }
            }
            if (this.curtPhrmSalesBookDetail != null) {
                for (let i = 0; i < this.curtPhrmSalesBookDetail.length; i++) {
                    this.sumTotalAmount = CommonFunctions.parseAmount(this.sumTotalAmount + this.curtPhrmSalesBookDetail[i].Total_Amount);
                    this.sumDiscountAmount = CommonFunctions.parseAmount(this.sumDiscountAmount + this.curtPhrmSalesBookDetail[i].DiscountAmount);
                    this.sumTaxableAmount = CommonFunctions.parseAmount(this.sumTaxableAmount + this.curtPhrmSalesBookDetail[i].Taxable_Amount);
                    this.sumTaxableTAX = CommonFunctions.parseAmount(this.sumTaxableTAX + this.curtPhrmSalesBookDetail[i].Tax_Amount);
                    this.sumNONTaxableSales = CommonFunctions.parseAmount(this.sumNONTaxableSales + (this.curtPhrmSalesBookDetail[i].Total_Amount - (this.curtPhrmSalesBookDetail[i].Taxable_Amount + this.curtPhrmSalesBookDetail[i].Tax_Amount)))

                }
            }
        }
        else {
            this.msgBoxServ.showMessage("error", ['please Provide Dates'])
        }

    }

    PrintReport() {
        let popupWinindow;
        var printContents = document.getElementById("dvReport").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
        popupWinindow.document.close();
    }
    GetBillingHeaderParameter() {
        var paramValue = this.coreservice.Parameters.find(a => a.ParameterName == 'BillingHeader').ParameterValue;
        if (paramValue)
            this.headerDetail = JSON.parse(paramValue);
        else
            this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }

    //Anjana:2020/10/02: reusable from to date selector
    OnFromToDateChange($event) {
        this.fromDate = $event ? $event.fromDate : this.fromDate;
        this.toDate = $event ? $event.toDate : this.toDate;
    }
}