import { Component, Input, Output, Injector, ChangeDetectorRef, Inject } from "@angular/core";
import {  EventEmitter, OnInit } from "@angular/core"
import { PHRMSettlementModel } from "../../../shared/pharmacy-settlementModel";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { PharmacyBLService } from "../../../shared/pharmacy.bl.service";
import { NepaliCalendarService } from "../../../../shared/calendar/np/nepali-calendar.service";
import { PharmacyService } from "../../../shared/pharmacy.service";
import { CommonFunctions } from "../../../../shared/common.functions";


@Component({
    selector: 'phrm-settlement-receipt',
    templateUrl: './phrm-settlement-receipt.html'
})
export class PHRMSettlementReceiptComponent {
    @Input("settlementInfo")
    public settlementInfo: PHRMSettlementModel;
    @Input("showReceipt")
    public showReceipt: boolean;
    public localDate: string;
    public currencyUnit: string;
    public totalCrAmount: number = 0;

    @Output("close-receipt")
    public receiptClosed: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(public msgBoxService: MessageboxService,
        public pharmacyBLService: PharmacyBLService,
        public nepaliCalendarServ: NepaliCalendarService,
        public pharmacyService: PharmacyService) {

    }

    ngOnInit() {
        this.currencyUnit = this.pharmacyService.currencyUnit;
        if (this.settlementInfo) {
            this.localDate = this.GetLocalDate(this.settlementInfo.CreatedOn);
            if (this.settlementInfo.PHRMInvoiceTransactions) {
                this.settlementInfo.PHRMInvoiceTransactions.forEach(bil => {
                    this.totalCrAmount += bil.TotalAmount;
                });
                this.totalCrAmount = CommonFunctions.parseAmount(this.totalCrAmount);
            }
        }

        this.settlementInfo.Patient.ShortName = this.settlementInfo.Patient.FirstName 
                                                    +" "+(this.settlementInfo.Patient.MiddleName == null ? "" :this.settlementInfo.Patient.MiddleName)
                                                    +" "+(this.settlementInfo.Patient.LastName);
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

        this.pharmacyBLService.UpdateSettlementPrintCount(this.settlementInfo.SettlementId)
            .subscribe(res => {

            });
    }

    CloseReceipt() {
        this.showReceipt = false;
        this.settlementInfo = new PHRMSettlementModel();
        this.receiptClosed.emit(true);

    }
}