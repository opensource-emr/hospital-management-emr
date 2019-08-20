import { Component, Input, Output, Injector, ChangeDetectorRef, Inject } from "@angular/core";
import {  EventEmitter, OnInit } from "@angular/core"
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { BillingService } from "../shared/billing.service";
import { BillingBLService } from "../shared/billing.bl.service";
import { BillSettlementModel } from "../shared/bill-settlement.model";
import { CommonFunctions } from "../../shared/common.functions";

@Component({
    selector: 'settlement-receipt',
    templateUrl: './settlement-receipt.html'
})
export class BillSettlementReceiptComponent {
    @Input("settlementInfo")
    public settlementInfo: BillSettlementModel;
    @Input("showReceipt")
    public showReceipt: boolean;
    public localDate: string;
    public currencyUnit: string;
    public totalCrAmount: number = 0;

    @Output("close-receipt")
    public receiptClosed: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(public msgBoxService: MessageboxService,
        public billingService: BillingService,
        public nepaliCalendarServ: NepaliCalendarService,
        public billingBLService: BillingBLService) {

    }

    ngOnInit() {
        this.currencyUnit = this.billingService.currencyUnit;
        if (this.settlementInfo) {
            this.localDate = this.GetLocalDate(this.settlementInfo.CreatedOn);
            if (this.settlementInfo.BillingTransactions) {
                this.settlementInfo.BillingTransactions.forEach(bil => {
                    this.totalCrAmount += bil.TotalAmount;
                });
                this.totalCrAmount = CommonFunctions.parseAmount(this.totalCrAmount);
            }
        }
    }
    GetLocalDate(engDate: string): string {
        let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
        return npDate + " BS";
    }
    print() {
        let popupWinindow;
        var printContents = document.getElementById("printpage").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
        popupWinindow.document.close();

        this.billingBLService.UpdateSettlementPrintCount(this.settlementInfo.SettlementId)
            .subscribe(res => {

            });
    }

    CloseReceipt() {
        this.showReceipt = false;
        this.settlementInfo = new BillSettlementModel();
        this.receiptClosed.emit(true);

    }
}