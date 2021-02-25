import { Component, Input, Output, Injector, ChangeDetectorRef, Inject, EventEmitter } from "@angular/core";
import { BillingReceiptModel } from '../shared/billing-receipt.model';
//sud:5May'18--BackButtonDisable is not working as expected, correct and implement later
//import { BackButtonDisable } from "../../core/shared/backbutton-disable.service";
import { BillingBLService } from "../shared/billing.bl.service";
import { BillingService } from "../shared/billing.service";
import { CoreService } from "../../core/shared/core.service";
import { HttpClient } from '@angular/common/http';
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { CommonFunctions } from "../../shared/common.functions";

@Component({
  selector: "billing-provisional-receipt",
  templateUrl: "./billing-provisional-receipt.html",
})
export class BillingProvisionalReceiptComponent {
  @Input("receipt")
  public receipt: BillingReceiptModel = new BillingReceiptModel();

  @Input("showPrintBtn")
  public showPrintBtn: boolean = true;

  //@Output("emit-InsuranceBillReq")
  //public emitInsuranceBillReq: EventEmitter<Object> = new EventEmitter<Object>();

  //CloseBillRequestSlip() {
  //  this.emitInsuranceBillReq.emit();
  //}

  public localDateTime: string;
  public taxLabel: string;
  public currencyUnit: string;
  public headerName: string;

  public provSlipFooterParam = { ShowFooter: false, EnglishText: "!! This is not Final Invoice !!", NepaliText: "!! जानकारीको लागि मात्र !!", VerticalAlign: true };

  constructor(
    public billingBLService: BillingBLService,
    public nepaliCalendarServ: NepaliCalendarService,
    public billingService: BillingService,
    public coreService: CoreService,
    public httpobj: HttpClient,
    public injector: Injector) {
    this.taxLabel = this.billingService.taxLabel;
    this.currencyUnit = this.billingService.currencyUnit;
  }

  @Input("items")
  public set value(_receipt: BillingReceiptModel) {
    if (_receipt) {
      this.receipt = _receipt;
      let _tax = this.coreService.Masters.Taxes.find(tax => tax.TaxId == this.receipt.TaxId);
      if (_tax)
        this.taxLabel = _tax.TaxLabel;
    }
  }

  GetLocalDate(engDate: string): string {
    let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
    return npDate + " BS";
  }

  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    //popupWinindow.document.write('<html><head><link href="../assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

    popupWinindow.document.close();

    ////add 1 to existing printcount.
    //let printCount = this.receipt.PrintCount + 1;
    //let recptNo = this.receipt.ReceiptNo;

    //this.billingBLService.PutPrintCount(printCount, recptNo)
    //    .subscribe(res => {
    //        if (res.Status == "OK") {

    //        }
    //        else {

    //            //this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    //        }
    //    });

  }

  ngOnInit() {
    if (this.receipt) {
      //    let invDate = this.receipt.BillingDate;
      //    this.receipt.InvIssueDateLocal = this.GetLocalDate(invDate);

      //    this.patientQRCodeInfo = `Name: ` + this.receipt.Patient.ShortName + `
      //    Hospital No: `+ '[' + this.receipt.Patient.PatientCode + ']' + `Invoice No: ` + this.receipt.CurrentFinYear + ` - ` + this.receipt.InvoiceCode + this.receipt.InvoiceNo;
      //    this.showQrCode = true;
      //}

      if (this.billingService.BillingFlow == "insurance" || this.receipt.IsInsuranceBilling) {
        this.headerName = "Insurance";
      }
      this.receipt.BillingItems.forEach(a => a.Price = CommonFunctions.parseAmount(a.Price));
    }
    this.provSlipFooterParam = this.coreService.LoadFooterNoteSettingsFromParameter();
  }

  //LoadFooterNoteSettingsFromParameter() {
  //  let param = this.coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "ProvisionalSlipFooterNoteSettings");
  //  if (param) {
  //    let paramValueStr = param.ParameterValue;
  //    if (paramValueStr) {
  //      this.provSlipFooterParam = JSON.parse(paramValueStr);
  //    }
  //  }

  //}

}
