import { ChangeDetectorRef, Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment";
import { CoreService } from "../../../core/shared/core.service";
import { PrinterSettingsModel } from "../../../settings-new/printers/printer-settings.model";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponseText } from "../../../shared/shared-enums";
import { BillingBLService } from "../../shared/billing.bl.service";

@Component({
  selector: 'bill-provisional-cancel-receipt',
  templateUrl: "./bill-provisional-cancel-receipt.html",

})
export class BIL_Print_ProvisionalCancellationReceiptComponent {
  @Input('PatientId')
  public PatientId: number = null;
  @Input('visitType')
  public visitType: string = null;
  @Input('ProvFiscalYrId')
  public ProvFiscalYrId: number = null;
  @Input('ProvReceiptNo')
  public ProvReceiptNo: number = null;
  @Input('schemeId')

  @Input("provisionalReturnItemId")
  public provisionalReturnItemId: number = null;
  public SchemeId: number = null;
  public isReceiptLoaded: boolean = false;
  public ProvisionalDetails: any = null;
  public CurrentDate: string;
  public hospitalCode: string = "";
  public SchemeName: string = "";
  public PolicyNo: string = "";
  public taxLabel: string;
  public ShowProviderName: boolean = false;
  public IsCoPaymentTransactions: boolean = false;
  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;
  public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };

  public billCancellationReceiptFooter = { ShowFooter: false, EnglishText: "!! This is not Final Invoice !!", NepaliText: "!! जानकारीको लागि मात्र !!", VerticalAlign: true };

  public model = {
    SubTotal: 0,
    TotalDiscount: 0,
    TaxAmount: 0,
    TotalAmount: 0,
    CoPayAmount: 0
  };
  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();

  public InvoiceDisplaySettings: any = { "ShowHeader": true, "ShowQR": true, "ShowHospLogo": true };
  billCancellationresuest: any;
  constructor(
    public billingBLService: BillingBLService,
    public router: Router,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService,
  ) {
    this.hospitalCode = this.coreService.GetHospitalCode();
    this.billCancellationReceiptFooter = this.coreService.LoadFooterNoteSettingsFromParameter();
    this.InvoiceDisplaySettings = this.coreService.GetInvoiceDisplaySettings();
    if (!this.hospitalCode) {
      this.hospitalCode = "default";
    }
    this.CurrentDate = moment().format("YYYY-MM-DD HH:mm:ss");
    this.ShowProviderName = this.coreService.SetShowProviderNameFlag();
    let paramValue = this.coreService.Parameters.find(a => a.ParameterName === 'BillingHeader').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
  }
  ngOnInit() {
    if (this.PatientId) {
      this.GetDetailfForCancellationReceipt(this.PatientId, this.provisionalReturnItemId);
    }
  }

  GetDetailfForCancellationReceipt(PatientId, provisionalReturnItemId) {
    this.billingBLService.GetDetailForCancellationReceipt(PatientId, provisionalReturnItemId).subscribe(
      res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.ProvisionalDetails = res.Results;

          this.CalculateTotalAmounts(this.ProvisionalDetails);
          this.isReceiptLoaded = true;
          this.coreService.FocusInputById("btnPrintProvisionalCancelReceipt");//focus on print button after provisional slip is loaded.
        }
        else {
          this.msgBoxServ.showMessage("failed", ["..."]);
          console.log(res.ErrorMessage);
          this.isReceiptLoaded = false;
        }
      }
    )
  }
  CalculateTotalAmounts(billTxnItem) {
    if (billTxnItem) {
      this.IsCoPaymentTransactions = billTxnItem.IsCoPayment;
      this.model.SubTotal = CommonFunctions.parseAmount(billTxnItem.CancelledSubtotal);
      this.model.TotalAmount = CommonFunctions.parseAmount(billTxnItem.CancelledTotalAmount);
      this.model.TotalDiscount = CommonFunctions.parseAmount(billTxnItem.CancelledDiscountAmount);
      this.model.TaxAmount = CommonFunctions.parseAmount(billTxnItem.TaxAmount);
      this.model.CoPayAmount = CommonFunctions.parseAmount(billTxnItem.CoPayCash);
    }
    else {
      this.model.SubTotal = 0;
      this.model.TotalAmount = 0;
      this.model.TotalDiscount = 0;
      this.model.TaxAmount = 0;
      this.model.CoPayAmount = 0;
    }
  }
  public print() {
    this.browserPrintContentObj = document.getElementById("id_provisional_cancel_receipt");
    this.openBrowserPrintWindow = true;
    this.changeDetector.detectChanges();
  }

}
