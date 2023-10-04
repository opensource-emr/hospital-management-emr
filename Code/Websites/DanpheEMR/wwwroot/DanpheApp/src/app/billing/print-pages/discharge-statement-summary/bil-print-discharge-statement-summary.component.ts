import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { CoreService } from '../../../core/shared/core.service';
import { SecurityService } from '../../../security/shared/security.service';
import { PrinterSettingsModel } from '../../../settings-new/printers/printer-settings.model';
import { NepaliCalendarService } from '../../../shared/calendar/np/nepali-calendar.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { DLService } from '../../../shared/dl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_Country, ENUM_DanpheHTTPResponses } from '../../../shared/shared-enums';
import { BillingTransactionItem } from '../../shared/billing-transaction-item.model';
import { BillingBLService } from '../../shared/billing.bl.service';
import { BillingService } from '../../shared/billing.service';
import { BillItemVM, DischargeBillVM, PharmacyBillItemVM } from '../../shared/discharge-bill.view.model';

@Component({
  selector: 'bil-print-discharge-statement-summary',
  templateUrl: './bil-print-discharge-statement-summary.component.html',
})
export class Bil_Print_DischargeStatementSummaryComponent implements OnInit {


  @Input("patientId")
  public patientId: number;
  @Input("ipVisitId")
  public patientVisitId: number;

  @Input('discharge-statement-id') DischargeStatementId: number = 0;

  public dischargeBill: DischargeBillVM = new DischargeBillVM();
  public billItems: Array<BillItemVM>;
  public showDischargeBillSummary: boolean = true;
  public showDischargeBillBreakup: boolean = false;

  public printDate: string;
  public patientQRCodeInfo: string = "";
  public showQrCode: boolean = false;
  public showDate: boolean = false;
  @Input("estimated-dischargeDate")
  public estDischargeDate: string;

  @Input('estimated-discountPercent')
  public estimatedDiscountPercent: number = 0;

  public showReturnWaterMark: boolean = false;
  public checkouttimeparameter: string;//sud:8Feb2019--its format example is: 13:00 (string)
  //for the foreigner customers
  @Input("TotalAmountInUSD")
  public TotalAmountInUSD: number = 0;
  @Input("ExchangeRate")
  public ExchangeRate: number = 0;


  @Output("closeEstimationBill")
  public closeEstimationeBill: EventEmitter<object> = new EventEmitter<object>();

  @Input("DepositBalance")
  public DepositBalance: number = 0;

  @Input("CoPaymentAmount") CoPaymentAmount = { CoPaymentCashAmount: 0, CoPaymentCreditAmount: 0 };


  public filteredPendingItems: Array<BillingTransactionItem> = [];
  public AmountType: string = "";//this.billStatus.toLocaleLowerCase() != "paid" ? "Amount to be Paid" : "Paid Amount";
  public ServiceDepartmentIdFromParametes: number = 0;

  public InvoiceDisplaySettings: any = { ShowHeader: true, ShowQR: true, ShowHospLogo: true };
  public InvoiceFooterNoteSettings: any = { ShowFooter: true, ShowEnglish: true, ShowNepali: false, EnglishText: "Please bring this invoice on your next visit.", NepaliText: "कृपया अर्को पटक आउँदा यो बिल अनिवार्य रुपमा लिएर आउनुहोला ।" };

  public currTime: string = "";
  public currentUserName: string = "";
  public hospitalCode: string = "";

  public Enable_Dotmatrix_Printer: boolean;
  public Dotmatrix_Printer = { BillingReceipt: "EPSON" };
  public printerNameSelected: any = null;
  public printerName: string = null;
  public showPrinterChange: boolean = false;
  public dotPrinterDimensions: any;
  public billingDotMatrixPrinters: any;

  public pharmacyBillingItems: PharmacyBillItemVM[] = [];
  public pharmacyDeposit = { DepositAmount: 0, DepositBalance: 0 };
  pharmacyBillingTotal = { Quantity: 0, SubTotal: 0, DiscountAmount: 0, VATAmount: 0, TotalAmount: 0 }
  billingTotal = { Quantity: 0, SubTotal: 0, DiscountAmount: 0, VATAmount: 0, TotalAmount: 0 }
  public autoBedBillParam = { DoAutoAddBillingItems: false, DoAutoAddBedItem: false, ItemList: [] };
  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;
  currDate: string;
  public loading: boolean = false;
  public ShowProviderName: boolean = false;
  public CountryNepal: string = null;
  public showMunicipality: boolean;

  public OtherCurrencyDetail: OtherCurrencyDetail = { CurrencyCode: '', ExchangeRate: 0, BaseAmount: 0, ConvertedAmount: 0 };

  constructor(public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public billingBLService: BillingBLService,
    public nepaliCalendarServ: NepaliCalendarService,
    public CoreService: CoreService,
    public securityService: SecurityService,
    public billingServ: BillingService,
    public changeDetector: ChangeDetectorRef
  ) {
    this.setCheckOutParameter();
    this.ServiceDepartmentIdFromParametes = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "Bed_Charges_SevDeptId").ParameterValue;
    this.SetAutoBedAndAutoBillItemParameters();
    this.InvoiceDisplaySettings = this.CoreService.GetInvoiceDisplaySettings();
    this.InvoiceFooterNoteSettings = this.CoreService.GetInvoiceFooterNoteSettings();
    this.currentUserName = this.securityService.loggedInUser.UserName;
    this.hospitalCode = this.CoreService.GetHospitalCode();
    this.ShowProviderName = this.CoreService.SetShowProviderNameFlag();
    if (!this.hospitalCode) {
      this.hospitalCode = "default";
    }
    this.printDate = moment().format('YYYY-MM-DD HH:mm');
    this.showMunicipality = this.CoreService.ShowMunicipality().ShowMunicipality;
    this.CountryNepal = ENUM_Country.Nepal;

  }

  ngOnInit() {
    if (this.patientId && this.patientVisitId) {
      this.GetDischargeSummaryInfo();
    }
  }

  setCheckOutParameter() {
    var param = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "CheckoutTime");
    if (param) {
      this.checkouttimeparameter = param.ParameterValue;
    }
  }

  SetAutoBedAndAutoBillItemParameters() {
    let param = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "AutoAddBillingItems");
    if (param && param.ParameterValue) {
      this.autoBedBillParam = JSON.parse(param.ParameterValue);
    }
  }

  GetDischargeSummaryInfo() {
    this.billingBLService.GetDischrageStatementSummary(this.patientId, this.patientVisitId, this.DischargeStatementId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.dischargeBill.AdmissionDetail = res.Results.AdmissionInfo;
        this.dischargeBill.PatientDetail = res.Results.PatientDetail;
        this.dischargeBill.DepositDetails = res.Results.DepositInfo;
        this.dischargeBill.BillItems = res.Results.BillItems;
        if (res.Results.DischargeInfo.StatementNo !== null) {
          this.dischargeBill.DischargeInfo = res.Results.DischargeInfo;
        }

        if (this.dischargeBill.AdmissionDetail.DischargeDate === null) {
          this.currTime = moment().format("HH:mm").toString();
          this.currDate = moment().format('YYYY-MM-DD').toString();
        }
        else {
          this.currTime = moment(this.dischargeBill.AdmissionDetail.DischargeDate).format("HH:mm").toString();
          this.currDate = moment(this.dischargeBill.AdmissionDetail.DischargeDate).format('YYYY-MM-DD').toString();
        }

        this.dischargeBill.SubTotal = this.dischargeBill.BillItems.reduce((sum, item) => sum + item.SubTotal, 0);
        this.dischargeBill.DiscountAmount = this.dischargeBill.BillItems.reduce((sum, item) => sum + item.DiscountAmount, 0);
        this.dischargeBill.TotalAmount = this.dischargeBill.BillItems.reduce((sum, item) => sum + item.TotalAmount, 0);
      }
    })
  }
  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();

  OnPrinterChanged($event) {
    this.selectedPrinter = $event;
  }

  print() {
    this.loading = true;
    //Open 'Browser Print' if printer not found or selected printing type is Browser.
    this.browserPrintContentObj = document.getElementById("id_divEstimationBillPrintPage");
    this.openBrowserPrintWindow = false;
    this.changeDetector.detectChanges();
    this.openBrowserPrintWindow = true;
    this.UpdatePrintCount();
    this.loading = false;
  }

  UpdatePrintCount(): void {

  }

}
