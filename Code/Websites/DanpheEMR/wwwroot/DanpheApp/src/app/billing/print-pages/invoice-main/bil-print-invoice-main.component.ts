import {
  Component,
  Injector,
  ChangeDetectorRef,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { RouterOutlet, RouterModule, Router } from "@angular/router";
import { BillingBLService } from "../../shared/billing.bl.service";
import { BillingReceiptModel } from "../../shared/billing-receipt.model";
import * as moment from "moment/moment";
import { CoreService } from "../../../core/shared/core.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { BilPrint_VM } from "../../shared/invoice-print-vms";

@Component({
  selector: "bil-print-invoice-main",
  templateUrl: "./bil-print-invoice-main.html",
})
export class Bil_Print_InvoiceMain_Component implements OnInit {
  @Input("invoiceNumber")
  invoiceNumber: number = null;

  @Input("fiscalYrId")
  fiscalYrId: number = null;

  @Input("bil-txn-id")
  inputBillingTxnId: number = null;

  @Input("redirect-path-after-print")
  redirectUrlPath: string = null;

  @Input("focus-print-btn")
  public focusPrintBtn: boolean = true;

  @Output("print-emitter")
  public printEmitter: EventEmitter<object> = new EventEmitter<object>();

  @Output("dischargeIp")
  public dischargePrint: EventEmitter<object> = new EventEmitter<object>();

  @Input("duplicate-print")
  public isFromDuplicatePrints: boolean = false;

  @Input('from-ADT-prints')
  public isPrintFromADT: boolean = false;

  @Input('from-visit-prints')
  public isPrintFromVisit: boolean = false;

  public invoiceInfoObj: BilPrint_VM = new BilPrint_VM();

  public invoiceType: string = null;
  public isInvoiceFound: boolean = false;

  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    public billingBlService: BillingBLService,
    public router: Router,
    public msgbox: MessageboxService,
    public injector: Injector,
    public coreService: CoreService
  ) { }

  ngOnInit(): void {
    if (this.fiscalYrId && this.invoiceNumber) {
      this.invoiceType = null; //reset invoicetype .

      this.LoadInvoiceForPrint(this.invoiceNumber, this.fiscalYrId, this.inputBillingTxnId);
    }
  }

  LoadInvoiceForPrint(invoiceNo: number, fiscalYrId,billingTxnId) {
    this.billingBlService
      .GetInvoiceDetailsForDuplicatePrint(invoiceNo, fiscalYrId, billingTxnId)
      .subscribe((res) => {
        if (res.Status == "OK") {
          this.invoiceInfoObj = res.Results;
          this.isInvoiceFound =
            this.invoiceInfoObj && this.invoiceInfoObj.IsInvoiceFound;
          if (this.isInvoiceFound) {
            this.invoiceType = this.invoiceInfoObj.InvoiceInfo.InvoiceType;
          }
        }
      });
  }

  DuplicatePrintCallBack(data) {
    if (data.Close == "close") {
      this.isInvoiceFound = false;
      this.printEmitter.emit({ Close: "close" });
      this.dischargePrint.emit({ Close: "close" });
    }
  }
}
