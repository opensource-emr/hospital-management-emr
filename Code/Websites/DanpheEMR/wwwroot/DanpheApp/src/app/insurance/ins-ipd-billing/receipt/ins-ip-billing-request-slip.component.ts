import { Component, Input, Output, Injector, Inject, EventEmitter, Renderer2 } from "@angular/core";
import { BillingReceiptModel } from "../../../billing/shared/billing-receipt.model";
import { CommonFunctions } from "../../../shared/common.functions";
import { CoreService } from "../../../core/shared/core.service";

@Component({
  selector: 'ins-ip-bill-item-request-slip',
  templateUrl: './ins-ip-billing-request-slip.html'
})
export class InsuranceIPBillingRequestSlipComponent {
  @Input("popup-action")
  popupAction: string = "add";//add or edit.. logic will change accordingly.

  public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
  @Input("receipt")
  public receipt: BillingReceiptModel = new BillingReceiptModel();
  @Output("emit-IpBillReq")
  public emitIpBillReq: EventEmitter<Object> = new EventEmitter<Object>();
  CloseBillRequestSlip() {
    this.emitIpBillReq.emit();
  }

  public provSlipFooterParam = { ShowFooter: false, EnglishText: "!! This is not Final Invoice !!", NepaliText: "!! जानकारीको लागि मात्र !!", VerticalAlign: true };
  public hospitalCode: string = "";
  public InsInvoiceDisplaySettings = { ShowHeader: false, ShowQR: false, ShowPANNo: false, ShowSubtotal: false, ShowDiscount: false };
  public taxLabel: string;

  constructor(public coreService: CoreService,
    public renderer: Renderer2,) {
    this.provSlipFooterParam = this.coreService.LoadFooterNoteSettingsFromParameter();
    this.hospitalCode = this.coreService.GetHospitalCode();

    let taxInfo1 = this.coreService.Parameters.find(a => a.ParameterName == 'TaxInfo');
    if (taxInfo1) {
      let taxInfoStr = taxInfo1.ParameterValue;
      let taxInfo = JSON.parse(taxInfoStr);
      this.taxLabel = taxInfo.TaxLabel;
    }

    if (!this.hospitalCode) {
      this.hospitalCode = "default";
    }
    this.InvoiceDisplaySettings();
  }

  ngOnInit() {
    if (this.receipt) {
      this.receipt.BillingItems.forEach(a => a.Price = CommonFunctions.parseAmount(a.Price));
    }
    this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
      if (e.keyCode == this.ESCAPE_KEYCODE) {
        //this.onClose.emit({ CloseWindow: true, EventName: "close" });
        this.CloseBillRequestSlip()
      }
    });
  }
  globalListenFunc: Function;
  ngOnDestroy() {
    // remove listener
    this.globalListenFunc();
  }

  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    //popupWinindow.document.write('<html><head><link href="../assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/PrintStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

    popupWinindow.document.close();
    this.CloseBillRequestSlip();
  }

  InvoiceDisplaySettings() {
    if (this.coreService.Parameters) {
      this.InsInvoiceDisplaySettings = JSON.parse(this.coreService.Parameters.filter(p => p.ParameterName == "InsInvoiceDisplaySettings" && p.ParameterGroupName == "Insurance")[0].ParameterValue);
    }
  }
}
