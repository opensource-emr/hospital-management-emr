import { Component, Input, Output, Injector, ChangeDetectorRef, Inject } from "@angular/core";

import { BillingDeposit } from '../shared/billing-deposit.model';

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { BillingService } from "../shared/billing.service";
import { BillingBLService } from "../shared/billing.bl.service";
import { Patient } from "../../patients/shared/patient.model";
import { CommonFunctions } from "../../shared/common.functions";
@Component({
    selector: 'deposit-receipt',
    templateUrl: './deposit-receipt.html'
})
export class DepositReceiptComponent {
    @Input("deposit")
    public deposit: BillingDeposit;
    @Input("showReceipt")
    public showReceipt: boolean;
 	public depositFlag: boolean = false; //yubraj 4th Feb '19 //used while displaying receipt header either Deposit or Refund
   	public localDate: string;
    public currencyUnit: string;
    public depositType: string;
    constructor(public msgBoxService: MessageboxService,
        public billingService: BillingService,
        public nepaliCalendarServ: NepaliCalendarService,
        public billingBLService: BillingBLService) {

    }

    ngOnInit() {
        this.currencyUnit = this.billingService.currencyUnit;
        if (this.deposit) {
            this.deposit.Amount = CommonFunctions.parseAmount(this.deposit.Amount);
            this.localDate = this.GetLocalDate(this.deposit.CreatedOn);
            this.depositType = this.deposit.DepositType == "Deposit" ? this.deposit.DepositType : "Deposit Refund";
            if (this.depositType == "Deposit Refund") {
                this.depositFlag = true;
            }
            else {
                this.depositFlag = false;
            }}
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

        this.billingBLService.UpdateDepositPrintCount(this.deposit.DepositId)
            .subscribe().unsubscribe();
    }

}