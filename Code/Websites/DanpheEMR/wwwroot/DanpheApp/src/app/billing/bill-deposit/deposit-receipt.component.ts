import { Component, Input, Output, Injector, ChangeDetectorRef, Inject, EventEmitter } from "@angular/core";

import { BillingDeposit } from '../shared/billing-deposit.model';

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { BillingService } from "../shared/billing.service";
import { BillingBLService } from "../shared/billing.bl.service";
import { Patient } from "../../patients/shared/patient.model";
import { CommonFunctions } from "../../shared/common.functions";
@Component({
  selector: 'deposit-receipt',
  templateUrl: './deposit-receipt.html',
  styles: [`table.pat-data-tbl tbody tr td{
    border: none !important;
  }`]
})
export class DepositReceiptComponent {
  @Input("deposit")
  public deposit: BillingDeposit;

  @Input("showReceipt")
  public showReceipt: boolean;

  @Output("callback-close")
  callbackClose: EventEmitter<Object> = new EventEmitter<Object>();

  public depositFlag: boolean = false; //yubraj 4th Feb '19 //used while displaying receipt header either Deposit or Refund
  public localDate: string;
  public currencyUnit: string;
  public depositType: string;

  public showPrint: boolean = false;
  public printDetaiils: any;

  constructor(public msgBoxService: MessageboxService,
    public billingService: BillingService,
    public nepaliCalendarServ: NepaliCalendarService,
    public billingBLService: BillingBLService,
    public changeDetector: ChangeDetectorRef) {

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
      }
      this.changeDetector.detectChanges();
      this.SetFocusOnButton('btn_PrintReceipt');
    }
  }
  GetLocalDate(engDate: string): string {
    let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
    return npDate + " BS";
  }
  print() {
    //let popupWinindow;
    //var printContents = document.getElementById("printpage").innerHTML;
    //popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    //popupWinindow.document.open();
    //popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    //popupWinindow.document.close();

    this.showPrint = false;
    this.printDetaiils = null;
    this.changeDetector.detectChanges();
    this.showPrint = true;
    this.printDetaiils = document.getElementById("printpage");
    

    this.billingBLService.UpdateDepositPrintCount(this.deposit.DepositId)
      .subscribe().unsubscribe();

    this.changeDetector.detectChanges();
    this.Close();
  }

  SetFocusOnButton(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
    }
  }

  Close() {
    this.callbackClose.emit({});
  }
}
