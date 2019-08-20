import { Component, Input, Output, Injector, Inject, EventEmitter } from "@angular/core";
import { BillingReceiptModel } from "../shared/billing-receipt.model";
import { CommonFunctions } from "../../shared/common.functions";

@Component({
  selector: 'ip-bill-item-request-slip',
  templateUrl: './ip-billing-request-slip.html'
})
export class IPBillingRequestSlipComponent {
  @Input("receipt")
  public receipt: BillingReceiptModel = new BillingReceiptModel();
  @Output("emit-IpBillReq")
  public emitIpBillReq: EventEmitter<Object> = new EventEmitter<Object>();
  CloseBillRequestSlip() {
    this.emitIpBillReq.emit();
  }
  constructor() {

  }

  ngOnInit() {
    if (this.receipt) {
      this.receipt.BillingItems.forEach(a => a.Price = CommonFunctions.parseAmount(a.Price));
    }
  }

  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    //popupWinindow.document.write('<html><head><link href="../assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

    popupWinindow.document.close();

  }
}
