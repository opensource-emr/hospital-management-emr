import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment";
import { CoreService } from "../../../core/shared/core.service";
import { ENUM_PrintingType, PrinterSettingsModel } from "../../../settings-new/printers/printer-settings.model";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_Country, ENUM_MembershipTypeName } from "../../../shared/shared-enums";
import { CashDiscountReturnInfoVM, DepositInfoVM, PatientInfoVM, SalesInfoVM, SalesReturnInfoVM, SettlementInfoVM } from "../../shared/bill-settlement.model";
import { BillingBLService } from "../../shared/billing.bl.service";
import { BillingService } from "../../shared/billing.service";

@Component({
  selector: 'bil-print-settlement-slip',
  templateUrl: './bil-print-settlement-slip.html'
})
export class BIL_Print_SettlementSlip_Component {
  @Input("settlementId")
  public settlementId: number = 0;
  @Input("showReceipt")
  public showReceipt: boolean;
  public localDate: string;
  //public currencyUnit: string;
  public totalCrAmount: number = 0;

  @Output("close-receipt")
  public receiptClosed: EventEmitter<boolean> = new EventEmitter<boolean>();

  public settlementDetails: any = {};
  public PatientInfo: PatientInfoVM = new PatientInfoVM();
  public SalesInfo: SalesInfoVM[] = [];
  public SalesReturnInfo: SalesReturnInfoVM[] = [];
  public CashDiscountReturnInfo: CashDiscountReturnInfoVM[] = [];
  // public DepositReturnInfo:DepositReturnInfoVM[] = [];
  public DepositInfo: DepositInfoVM[] = [];
  public SettlementInfo: SettlementInfoVM = new SettlementInfoVM();;
  public SalesTotal: number = 0;
  public SalesReturnTotal: number = 0;
  public NetAmount: number = 0;
  public CashDiscount: number = 0;
  public PaidAmount: number = 0;
  public PayableAmount: number = 0;
  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  public browserPrintContentObj: any;
  public openBrowserPrintWindow: boolean = false;
  public headerRightColLen: number = 32;
  public nline: any = '\n';
  public InvoiceDisplaySettings: any = { "ShowHeader": true, "ShowQR": true, "ShowHospLogo": true, "HeaderType": '' };
  public hospitalCode: string = "";

  public isReceiptDetailLoaded: boolean = false;
  public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };
  public showMunicipality: boolean;
  public CountryNepal: string = ENUM_Country.Nepal;
  public SSFMembershipTypeName: string = ENUM_MembershipTypeName.SSF;
  public ECHSMembershipTypeName: string = ENUM_MembershipTypeName.ECHS;

  constructor(public msgBoxService: MessageboxService,
    public billingService: BillingService,
    public nepaliCalendarServ: NepaliCalendarService,
    public billingBLService: BillingBLService,
    public changeDetector: ChangeDetectorRef,
    public router: Router,
    public coreService: CoreService,
    public msgBoxServ: MessageboxService) {

    this.InvoiceDisplaySettings = this.coreService.GetInvoiceDisplaySettings();
    var param = this.coreService.Parameters.find(a => a.ParameterName === 'BillingHeader');
    let paramValue = param ? param.ParameterValue : null;
    this.showMunicipality = this.coreService.ShowMunicipality().ShowMunicipality;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
  }

  ngOnInit() {
    if (this.settlementId) {

      this.billingBLService.GetSettlementInfoBySettlmentId(this.settlementId).subscribe(
        res => {
          this.settlementDetails = res.Results;
          this.PatientInfo = this.settlementDetails.PatientInfo;
          this.SettlementInfo = this.settlementDetails.SettlementInfo;
          this.SalesInfo = this.settlementDetails.SalesInfo;
          this.SalesReturnInfo = this.settlementDetails.SalesReturn;
          this.CashDiscountReturnInfo = this.settlementDetails.CashDiscountReturn;
          this.DepositInfo = this.settlementDetails.DepositInfo;
          this.localDate = this.GetLocalDate(this.SettlementInfo.SettlementDate);
          this.CalculateTotals();

        }
      )
    }
  }

  CalculateTotals() {
    if (this.SalesInfo && this.SalesInfo.length) {
      this.SalesInfo.forEach(a => {
        this.SalesTotal += a.Amount;
      });
    }
    if (this.SalesReturnInfo && this.SalesReturnInfo.length) {
      this.SalesReturnInfo.forEach(b => {
        this.SalesReturnTotal += b.Amount;
      });
    }

    this.NetAmount = this.SalesTotal - this.SalesReturnTotal;
    this.CashDiscount = this.SettlementInfo.CashDiscountGiven ? this.SettlementInfo.CashDiscountGiven : 0;
    this.PayableAmount = Number((this.NetAmount - this.CashDiscount).toFixed(4));
    if (this.DepositInfo && this.DepositInfo.length) {
      this.DepositInfo.forEach(a => {
        if ((a.TransactionType) === "Deposit Deducted") {
          this.PaidAmount = Number((this.NetAmount - a.OutAmount - this.CashDiscount).toFixed(4));
        }
      })
    } else {
      this.PaidAmount = Number((this.NetAmount - this.CashDiscount).toFixed(4));
    }
  }

  GetLocalDate(engDate: string): string {
    let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
    return npDate + " BS";
  }
  BrowserPrint() {
    let popupWinindow;
    var printContents = document.getElementById("dv_settlement_printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/CommonPrintStyle.css"/><link rel="stylesheet" type="text/css" href="../../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/></head><body>' + printContents + '</body></html>');
    popupWinindow.document.close();

    let tmr = setTimeout(function () {
      popupWinindow.print();
      popupWinindow.close();
    }, 300);

    this.billingBLService.UpdateSettlementPrintCount(this.SettlementInfo.SettlementId)
      .subscribe(res => {

      });
  }

  CloseReceipt() {
    this.showReceipt = false;
    this.settlementDetails = {};
    this.receiptClosed.emit(true);

  }

  public PrintFromSelectedPrinter() {

    //Open 'Browser Print' if printer not found or selected printing type is Browser.
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType === ENUM_PrintingType.browser) {
      this.BrowserPrint();
    }
    else if (this.selectedPrinter.PrintingType === ENUM_PrintingType.dotmatrix) {
      //-----qz-tray start----->
      this.coreService.QzTrayObject.websocket.connect()
        .then(() => {
          return this.coreService.QzTrayObject.printers.find();
        })
        .then(() => {
          var config = this.coreService.QzTrayObject.configs.create(this.selectedPrinter.PrinterName);

          let dataToPrint = this.MakeReceipt();
          return this.coreService.QzTrayObject.print(config, CommonFunctions.GetEpsonPrintDataForPage(dataToPrint, this.selectedPrinter.mh, this.selectedPrinter.ml, this.selectedPrinter.ModelName));

        })
        .catch(function (e) {
          console.error(e);
        })
        .finally(() => {
          return this.coreService.QzTrayObject.websocket.disconnect();
        });
      //-----qz-tray end----->
    }
    else {
      this.msgBoxServ.showMessage('error', ["Printer Not Supported."]);
      return;
    }

  }

  public MakeReceipt(): string {
    let totalHeight_lines = this.selectedPrinter.Height_Lines;
    let headerGap_lines = this.selectedPrinter.HeaderGap_Lines;
    let horizontalCols = this.selectedPrinter.Width_Lines;
    let headerLeftColLen = horizontalCols - this.headerRightColLen;
    let finalDataToPrint = '';

    let hlen_SN = 5;
    let hlen_Date = 15;
    let hlen_Receipt_NO = 15;
    let hlen_price = 10;
    let hlen_amt = 10;
    let hlen_Particular = horizontalCols - (hlen_SN + hlen_Receipt_NO + hlen_price + hlen_amt + hlen_Date);
    let footerRightColLen = hlen_Receipt_NO + hlen_price + hlen_amt;
    let footerLeftColLen = horizontalCols - footerRightColLen;
    let headerStr = '';

    let invoiceHeaderLabel = "Settlement Slip";
    if (this.InvoiceDisplaySettings.ShowHeader) {
      headerStr += CommonFunctions.GetTextCenterAligned(this.headerDetail.CustomerName, horizontalCols);
      headerStr += CommonFunctions.GetTextCenterAligned(this.headerDetail.Address, horizontalCols);
      headerStr += CommonFunctions.GetTextCenterAligned("Ph No: " + this.headerDetail.Tel, horizontalCols);
      headerStr += CommonFunctions.GetTextCenterAligned(this.headerDetail.CustomerRegLabel, horizontalCols);
      headerStr += this.nline;
    }
    headerStr += CommonFunctions.GetTextCenterAligned(invoiceHeaderLabel, horizontalCols) + this.nline;

    headerStr += CommonFunctions.GetTextFilledToALengthForLongString('Receipt No: SR' + this.SettlementInfo.SettlementReceiptNo, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Date: ' + moment(this.SettlementInfo.SettlementDate).format("YYYY-MM-DD"), this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFilledToALengthForLongString('Patients Name: ' + this.PatientInfo.PatientName, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Age/Sex : ' + moment(this.PatientInfo.DateOfBirth).format("YYYY-MM-DD") + '/' + this.PatientInfo.Gender, this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Hospital No: ' + this.PatientInfo.HospitalNo, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Contact No: ' + (this.PatientInfo.ContactNo ? this.PatientInfo.ContactNo : ''), this.headerRightColLen) + this.nline;
    if (this.PatientInfo.CountryName === ENUM_Country.Nepal) {
      headerStr += CommonFunctions.GetTextFilledToALengthForLongString('Address: ' + ((this.showMunicipality && this.PatientInfo.MunicipalityName) ? this.PatientInfo.MunicipalityName + (this.PatientInfo.WardNumber ? "-" + this.PatientInfo.WardNumber : "") + ", " : "") + this.PatientInfo.CountrySubDivisionName, headerLeftColLen);
    }
    else {
      headerStr += CommonFunctions.GetTextFilledToALengthForLongString('Address: ' + (this.PatientInfo.Address ? this.PatientInfo.Address + ", " : "" + this.PatientInfo.CountrySubDivisionName + this.PatientInfo.CountryName), headerLeftColLen);
    }
    headerStr += CommonFunctions.GetTextFIlledToALength('Payment Mode: ' + this.SettlementInfo.PaymentMode, this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFilledToALengthForLongString('Type: ' + this.PatientInfo.MembershipTypeName, headerLeftColLen)
      + ((this.PatientInfo.SSFPolicyNo && (this.PatientInfo.MembershipTypeName === ENUM_MembershipTypeName.SSF)) ? CommonFunctions.GetTextFIlledToALength('SSF Policy No: ' + this.PatientInfo.SSFPolicyNo, this.headerRightColLen) : "")
      + ((this.PatientInfo.PolicyNo && (this.PatientInfo.MembershipTypeName === ENUM_MembershipTypeName.ECHS)) ? CommonFunctions.GetTextFIlledToALength('ECHS No: ' + this.PatientInfo.PolicyNo, this.headerRightColLen) : "")
      + this.nline;

    headerStr += CommonFunctions.GetHorizontalLineOfLength(horizontalCols);

    finalDataToPrint = finalDataToPrint + headerStr + this.nline;

    var tableBody = '';
    if (this.SalesInfo && this.SalesInfo.length > 0) {
      var tableHead = CommonFunctions.GetTextFIlledToALength('SN.', hlen_SN) + CommonFunctions.GetTextFIlledToALength('Patriculars', hlen_Particular) +
        CommonFunctions.GetTextFIlledToALength('Receipt No', hlen_Receipt_NO) +
        CommonFunctions.GetTextFIlledToALength('Receipt Date', hlen_Date) + CommonFunctions.GetTextFIlledToALength('Amount', hlen_amt) + this.nline;
      tableBody += tableHead;
      let billItems = this.SalesInfo;
      for (let i = 0; i < billItems.length; i++) {
        var tblRow = '';
        tblRow += CommonFunctions.GetTextFIlledToALength((i + 1).toString(), hlen_SN)
          + CommonFunctions.GetTextFIlledToALength('Sales', hlen_Particular)
          + CommonFunctions.GetTextFIlledToALength(billItems[i].ReceiptNo, hlen_Receipt_NO)
          + CommonFunctions.GetTextFIlledToALength(moment(billItems[i].ReceiptDate).format("YYYY-MM-DD").toString(), hlen_Date)
          + CommonFunctions.GetTextFIlledToALength(billItems[i].Amount.toString(), hlen_amt) + this.nline;

        tableBody += tblRow + this.nline;
      }
      tableBody += CommonFunctions.GetTextFIlledToALength('', headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Sales Total: ' + this.SalesTotal, this.headerRightColLen) + this.nline;
      tableBody += CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
    }

    if (this.SalesReturnInfo && this.SalesReturnInfo.length > 0) {
      var tableHead = CommonFunctions.GetTextFIlledToALength('SN.', hlen_SN) + CommonFunctions.GetTextFIlledToALength('Patriculars', hlen_Particular) +
        CommonFunctions.GetTextFIlledToALength('Receipt No', hlen_Receipt_NO) +
        CommonFunctions.GetTextFIlledToALength('Receipt Date', hlen_Date) + CommonFunctions.GetTextFIlledToALength('Amount', hlen_amt) + this.nline;
      tableBody += tableHead;
      let billItems = this.SalesReturnInfo;
      for (let i = 0; i < billItems.length; i++) {
        var tblRow = '';
        tblRow += CommonFunctions.GetTextFIlledToALength((i + 1).toString(), hlen_SN)
          + CommonFunctions.GetTextFIlledToALength('Sales Return', hlen_Particular)
          + CommonFunctions.GetTextFIlledToALength(billItems[i].ReceiptNo, hlen_Receipt_NO)
          + CommonFunctions.GetTextFIlledToALength(moment(billItems[i].ReceiptDate).format("YYYY-MM-DD").toString(), hlen_Date)
          + CommonFunctions.GetTextFIlledToALength(billItems[i].Amount.toString(), hlen_amt) + this.nline;

        tableBody += tblRow + this.nline;
      }
      tableBody += CommonFunctions.GetTextFIlledToALength('', headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Sales Return Total: ' + this.SalesReturnTotal, this.headerRightColLen) + this.nline;
      tableBody += CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
    }

    if (this.SalesInfo && this.SalesInfo.length > 0) {
      tableBody += CommonFunctions.GetTextFIlledToALength('', headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Net Amount: ' + this.NetAmount, this.headerRightColLen) + this.nline;
      tableBody += CommonFunctions.GetTextFIlledToALength('', headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Cash Discount:  ' + this.CashDiscount, this.headerRightColLen) + this.nline;
      tableBody += CommonFunctions.GetTextFIlledToALength('', headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Payable Amount: ' + this.PayableAmount, this.headerRightColLen) + this.nline;
      if (this.SettlementInfo.PaidAmount && this.SettlementInfo.PaidAmount > 0) {
        tableBody += CommonFunctions.GetTextFIlledToALength('', headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Cash Paid:' + this.SettlementInfo.PaidAmount, this.headerRightColLen) + this.nline;
      }
      tableBody += CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
    }

    if (this.DepositInfo && this.DepositInfo.length > 0) {
      var tableHead = CommonFunctions.GetTextFIlledToALength('SN.', hlen_SN) + CommonFunctions.GetTextFIlledToALength('Patriculars', hlen_Particular) +
        CommonFunctions.GetTextFIlledToALength('Receipt No', hlen_Receipt_NO) +
        CommonFunctions.GetTextFIlledToALength('Receipt Date', hlen_Date) + CommonFunctions.GetTextFIlledToALength('Amount', hlen_amt) + this.nline;
      let billItems = this.DepositInfo;
      tableBody += tableHead;
      for (let i = 0; i < billItems.length; i++) {
        let tblRow = '';
        tblRow += CommonFunctions.GetTextFIlledToALength((i + 1).toString(), hlen_SN)
          + CommonFunctions.GetTextFIlledToALength(billItems[i].TransactionType, hlen_Particular)
          + CommonFunctions.GetTextFIlledToALength(billItems[i].ReceiptNo, hlen_Receipt_NO)
          + CommonFunctions.GetTextFIlledToALength(moment(billItems[i].ReceiptDate).format("YYYY-MM-DD").toString(), hlen_Date)
          + CommonFunctions.GetTextFIlledToALength((billItems[i].TransactionType !== 'Deposit Received' ? billItems[i].OutAmount.toString() : billItems[i].InAmount.toString()), hlen_amt) + this.nline;

        tableBody += tblRow + this.nline;
      }
      tableBody += CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
    }

    if (this.CashDiscountReturnInfo && this.CashDiscountReturnInfo.length > 0) {
      var tableHead = CommonFunctions.GetTextFIlledToALength('SN.', hlen_SN) + CommonFunctions.GetTextFIlledToALength('Patriculars', hlen_Particular) +
        CommonFunctions.GetTextFIlledToALength('Receipt No', hlen_Receipt_NO) +
        CommonFunctions.GetTextFIlledToALength('Receipt Date', hlen_Date) + CommonFunctions.GetTextFIlledToALength('Amount', hlen_amt) + this.nline;
      let billItems = this.CashDiscountReturnInfo;
      tableBody += tableHead;
      for (let i = 0; i < billItems.length; i++) {
        var tblRow = '';
        tblRow += CommonFunctions.GetTextFIlledToALength((i + 1).toString(), hlen_SN)
          + CommonFunctions.GetTextFIlledToALength('Cash Discount Return', hlen_Particular)
          + CommonFunctions.GetTextFIlledToALength(billItems[i].ReceiptNo, hlen_Receipt_NO)
          + CommonFunctions.GetTextFIlledToALength(moment(billItems[i].ReceiptDate).format("YYYY-MM-DD").toString(), hlen_Date)
          + CommonFunctions.GetTextFIlledToALength(billItems[i].CashDiscountReceived.toString(), hlen_amt) + this.nline;

        tableBody += tblRow + this.nline;
      }
      tableBody += CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
    }

    var footerStr = '';
    if (this.SettlementInfo.CreditOrganizationName) {
      footerStr += CommonFunctions.GetTextFilledToALengthForLongString('Credit Organization: ' + this.SettlementInfo.CreditOrganizationName, headerLeftColLen) + this.nline;
    }
    footerStr += CommonFunctions.GetTextFIlledToALength('Processed By: ' + this.SettlementInfo.BillingUser, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Acknowledged By: ', this.headerRightColLen) + this.nline;
    footerStr += CommonFunctions.GetTextFIlledToALength('Time: ' + moment(this.SettlementInfo.SettlementDate).format("HH:mm"), headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Signature: ', this.headerRightColLen) + this.nline;

    finalDataToPrint = finalDataToPrint + tableBody + footerStr;
    let finalDataToPrintArr = finalDataToPrint.split("\n");
    let totalRowsToPrint = finalDataToPrint.split("\n").length - 1; //to get the number of lines
    let dataToPrint = '';

    for (let i = 0; i <= totalRowsToPrint; i++) {
      //subtracted 2 for continue
      if ((i % (totalHeight_lines - (headerGap_lines + 5))) === 0) {
        const preContTxt = this.nline + 'Continue...' + '\x0C';  //this is the command to push the postion to next paper head
        const postContTxt = this.nline + 'Continue...' + CommonFunctions.GetNewLineRepeat(2);
        dataToPrint = dataToPrint + ((i > 0) ? preContTxt : '') + CommonFunctions.GetNewLineRepeat(headerGap_lines) + ((i > 0) ? postContTxt : '');
      }
      dataToPrint = dataToPrint + finalDataToPrintArr[i] + this.nline;
    }
    return dataToPrint;
  }

  OnPrinterChanged($event) {
    this.selectedPrinter = $event;
  }
}
