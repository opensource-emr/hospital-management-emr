import { Component } from '@angular/core';
import { SystemAdminBLService } from '../shared/system-admin.bl.service';

import { PhrmInvoiceDetailsModel } from '../shared/phrm-invoice-details.model'
import { CommonFunctions } from '../../shared/common.functions';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { CoreService } from "../../core/shared/core.service";
import * as moment from 'moment/moment';

@Component({

    templateUrl:"../../view/system-admin-view/PHRMSalesBookReport.html" //"/SystemAdminView/PHRMSalesBookReport"
})
export class PHRMSalesBookComponent
{

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
    public headerDetail: { CustomerName, Address, Email, CustomerRegLabel,CustomerRegNo,Tel};
    public curtSalesBookDetail: Array<PhrmInvoiceDetailsModel> = new Array<PhrmInvoiceDetailsModel>();
    public systemAdminBLService: SystemAdminBLService = null;
    constructor(_systemAdminBLService: SystemAdminBLService, public msgBoxServ: MessageboxService
        , public coreservice: CoreService, public npCalService: NepaliCalendarService) {
        this.systemAdminBLService = _systemAdminBLService;
        this.fromDate = moment().format('YYYY-MM-DD');
        this.toDate = moment().format('YYYY-MM-DD');
        this.LoadCalendarTypes();
        this.GetBillingHeaderParameter();
    }
    LoadCalendarTypes() {
        let Parameter = this.coreservice.Parameters;
        Parameter = Parameter.filter(parms => parms.ParameterGroupName == "SysAdmin" && parms.ParameterName == "CalendarTypes");
        let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
        this.calType = calendarTypeObject.IRDSalesBook;
    }
    GetInvoiceDetails(): void {
            this.displayStartDate = this.fromDate;
            this.displayEndDate = this.toDate;
            this.systemAdminBLService.GetPhrmInvoiceDetails(this.displayStartDate, this.displayEndDate).
                subscribe(res => {
                    if (res.Status == 'OK') {
                        let salesDetails: Array<any> = res.Results;
                        salesDetails.forEach(itm => {
                            itm.BillDate_Np = this.npCalService.ConvertEngToNepDateString(itm.BillDate);
                        });
                        this.curtSalesBookDetail = salesDetails;
                        this.curtSalesBookDetail.forEach(itm => {
                            itm.Total_Amount = CommonFunctions.parseAmount(itm.Total_Amount);
                            itm.DiscountAmount = CommonFunctions.parseAmount(itm.DiscountAmount);
                            itm.Taxable_Amount =  CommonFunctions.parseAmount(itm.Taxable_Amount);
                            itm.Tax_Amount = CommonFunctions.parseAmount(itm.Tax_Amount);
                            itm.NonTaxable_Amount = CommonFunctions.parseAmount(itm.NonTaxable_Amount);
                        }
                        );
                        this.calculation();

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
                    this.sumNONTaxableSales = CommonFunctions.parseAmount(this.sumNONTaxableSales + (this.curtSalesBookDetail[i].Total_Amount - (this.curtSalesBookDetail[i].Taxable_Amount + this.curtSalesBookDetail[i].Tax_Amount)))
                   
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
}