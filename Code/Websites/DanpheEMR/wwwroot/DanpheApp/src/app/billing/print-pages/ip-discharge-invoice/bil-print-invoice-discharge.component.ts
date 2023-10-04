import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { Router } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { ENUM_PrintingType, PrinterSettingsModel } from "../../../settings-new/printers/printer-settings.model";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_BillPaymentMode, ENUM_Country, ENUM_DanpheHTTPResponses, ENUM_MembershipTypeName, ENUM_PriceCategory } from "../../../shared/shared-enums";
import { BillingBLService } from "../../shared/billing.bl.service";
import { BillingService } from "../../shared/billing.service";
import { BilPrint_VM } from "../../shared/invoice-print-vms";

@Component({
  selector: "bil-print-invoice-discharge",
  templateUrl: "./bil-print-invoice-discharge.html"
})
export class BIL_Print_Invoice_Discharge_Component {

  @Input("invoice")
  public invoice: BilPrint_VM = new BilPrint_VM();

  @Input("redirect-path-after-print")
  redirectUrlPath: string = null;

  @Input('focus-print-btn')
  public focusPrintBtn: boolean = true;


  @Output("closeDischargeBill")
  public closeDischargeBill: EventEmitter<object> = new EventEmitter<object>();

  @Input("duplicate-prints")
  public isDuplicatePrint: boolean = false;

  @Output("dischargeemmiter")
  public dischargeemmiter: EventEmitter<object> = new EventEmitter<object>()

  //public ServiceDepartmentIdFromParametes: number = 0;

  public InvoiceDisplaySettings = { ShowHeader: true, ShowQR: true, ShowHospLogo: true, HeaderType: '' };
  public InvoiceFooterNoteSettings: any = { ShowFooter: true, ShowEnglish: true, ShowNepali: false, EnglishText: "Please bring this invoice on your next visit.", NepaliText: "कृपया अर्को पटक आउँदा यो बिल अनिवार्य रुपमा लिएर आउनुहोला ।" };

  public currTime: string = "";
  public hospitalCode: string = "";

  // public Enable_Dotmatrix_Printer: boolean;
  // public Dotmatrix_Printer = { BillingReceipt: "EPSON" };
  // public printerNameSelected: any = null;
  // public printerName: string = null;
  // public showPrinterChange: boolean = false;
  // public dotPrinterDimensions: any;
  // public billingDotMatrixPrinters: any;

  public headerRightColLen: number = 32;
  public nline: any = '\n';

  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;
  public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };
  public ShowProviderName: boolean;
  public SSFPriceCategory: string = ENUM_PriceCategory.SSF;

  public patientQRCodeInfo = "";

  public creditPaymentMode = ENUM_BillPaymentMode.credit.toLowerCase();
  public showMunicipality: boolean;
  public CountryNepal: string = ENUM_Country.Nepal;
  public SSFMembershipTypeName: string = ENUM_MembershipTypeName.SSF;
  public ECHSMembershipTypeName: string = ENUM_MembershipTypeName.ECHS;
  public OtherCurrencyDetail: OtherCurrencyDetail = { CurrencyCode: '', ExchangeRate: 0, BaseAmount: 0, ConvertedAmount: 0 };


  constructor(
    public msgBoxServ: MessageboxService,
    public billingBLService: BillingBLService,
    public nepaliCalendarServ: NepaliCalendarService,
    public CoreService: CoreService,
    public billingServ: BillingService,
    public changeDetector: ChangeDetectorRef,
    public router: Router
  ) {

    //this.ServiceDepartmentIdFromParametes = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "Bed_Charges_SevDeptId").ParameterValue;
    this.InvoiceDisplaySettings = this.CoreService.GetInvoiceDisplaySettings();
    this.InvoiceFooterNoteSettings = this.CoreService.GetInvoiceFooterNoteSettings();
    this.hospitalCode = this.CoreService.GetHospitalCode();
    this.ShowProviderName = this.CoreService.SetShowProviderNameFlag();
    if (!this.hospitalCode) {
      this.hospitalCode = "default";
    }

    var paramValue = this.CoreService.Parameters.find(a => a.ParameterName === 'BillingHeader').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    //this.SetPrinterFromParam();
    this.showMunicipality = this.CoreService.ShowMunicipality().ShowMunicipality;
  }


  public localDateTime: string = null;
  public finalAge: string = null;
  public ipdNumber: string = null;
  public isInsurance: boolean = false;

  ngOnInit() {

    if (this.invoice) {
      if (this.invoice.InvoiceInfo.OtherCurrencyDetail) {
        this.OtherCurrencyDetail = JSON.parse(this.invoice.InvoiceInfo.OtherCurrencyDetail);
      } else {
        this.OtherCurrencyDetail = null;
      }
      this.localDateTime = this.GetLocalDate(this.invoice.InvoiceInfo.TransactionDate);
      this.finalAge = CommonFunctions.GetFormattedAgeSex(this.invoice.PatientInfo.DateOfBirth, this.invoice.PatientInfo.Gender);

      this.ipdNumber = this.invoice.VisitInfo.VisitCode;
      this.isInsurance = this.invoice.InvoiceInfo.IsInsuranceBilling;
      this.currTime = moment(this.invoice.InvoiceInfo.TransactionDate).format("HH:mm").toString();

      this.patientQRCodeInfo = `Name: ${this.invoice.PatientInfo.ShortName}
            Age/Sex: ${this.invoice.PatientInfo.Age} / ${this.invoice.PatientInfo.Gender.charAt(0)}
            Hospital No: [ ${this.invoice.PatientInfo.PatientCode} ]
            Invoice No: ${this.invoice.InvoiceInfo.InvoiceNumFormatted}`;

    }
  }

  ngAfterViewInit() {
    var btnObj = document.getElementById('btnPrintDischargeInvoice');
    if (btnObj && this.focusPrintBtn) {
      btnObj.focus();
    }
  }

  public loading: boolean = false;
  public print() {
    this.loading = true;
    //Open 'Browser Print' if printer not found or selected printing type is Browser.
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType === ENUM_PrintingType.browser) {
      this.openBrowserPrintWindow = false;
      this.browserPrintContentObj = document.getElementById("dvDischargeBillPrintPage");
      this.changeDetector.detectChanges();
      this.loading = false;

      setTimeout(() => {
        this.openBrowserPrintWindow = true;
      }, 100);

      // if (this.isDuplicatePrint) {
      //     this.AfterDuplicatePrint();
      // }
      //this.router.navigate(['/Billing/DuplicatePrints']);
    }
    else if (this.selectedPrinter.PrintingType === ENUM_PrintingType.dotmatrix) {
      this.CoreService.QzTrayObject.websocket.connect()
        .then(() => {
          return this.CoreService.QzTrayObject.printers.find();
        })
        .then(() => {
          this.loading = false;
          var config = this.CoreService.QzTrayObject.configs.create(this.selectedPrinter.PrinterName);
          let dataToPrint = this.MakeReceipt();
          return this.CoreService.QzTrayObject.print(config, CommonFunctions.GetEpsonPrintDataForPage(dataToPrint, this.selectedPrinter.mh, this.selectedPrinter.ml));
        })
        .catch(function (e) {
          console.error(e);
          this.loading = false;
        })
        .finally(() => {
          this.UpdatePrintCount();
          this.loading = false;
          return this.CoreService.QzTrayObject.websocket.disconnect();
        });
      //this.router.navigate(['/Billing/DuplicatePrints']);
    }
    else {
      this.loading = false;
      this.msgBoxServ.showMessage('error', ["Printer Not Supported."]);
    }
  }

  public MakeReceipt() {
    let totalHeight_lines = this.selectedPrinter.Height_Lines;
    let headerGap_lines = this.selectedPrinter.HeaderGap_Lines;
    let horizontalCols = this.selectedPrinter.Width_Lines;
    let headerLeftColLen = horizontalCols - this.headerRightColLen;
    let finalDataToPrint = '';


    var hlen_SN = 8;
    var hlen_qty = 8;
    var hlen_amt = 10;
    var hlen_Particular = horizontalCols - (hlen_SN + hlen_qty + hlen_amt);
    let footerRightColLen = hlen_SN + hlen_amt + 10;
    let footerLeftColLen = horizontalCols - footerRightColLen;

    let headerStr = '';

    let invoiceHeaderLabel = this.invoice.InvoiceInfo.IsInsuranceBilling ? "Health Insurance Credit Invoice | Discharge Bill" : "Invoice | Discharge Bill";

    let duplicatePrintString = this.invoice.InvoiceInfo.PrintCount > 0 ? ' | COPY(' + this.invoice.InvoiceInfo.PrintCount + ') OF ORIGINAL' : '';


    let userName = this.invoice.InvoiceInfo.UserName;

    if (this.InvoiceDisplaySettings.ShowHeader) {
      headerStr += CommonFunctions.GetTextCenterAligned(
        this.headerDetail.CustomerName,
        horizontalCols
      );
      headerStr += CommonFunctions.GetTextCenterAligned(
        this.headerDetail.Address,
        horizontalCols
      );
      headerStr += CommonFunctions.GetTextCenterAligned(
        "Ph No: " + this.headerDetail.Tel,
        horizontalCols
      );
      headerStr += CommonFunctions.GetTextCenterAligned(
        this.headerDetail.CustomerRegLabel,
        horizontalCols
      );
    }
    headerStr += CommonFunctions.GetTextCenterAligned(invoiceHeaderLabel + duplicatePrintString, horizontalCols) + this.nline;

    var invoiceNumberStr: string = '';
    var invoiceDateStr: string = '';
    var TransactionDateStr: string = "";
    var methodOfPaymentStr: string = "";
    var localDateStr: string = "";
    let space: string = " ";

    invoiceNumberStr = CommonFunctions.GetTextFIlledToALength('Invoice No: ' + this.invoice.InvoiceInfo.InvoiceNumFormatted, this.headerRightColLen);
    invoiceDateStr = CommonFunctions.GetTextFIlledToALength('Invoice Date:' + moment(this.invoice.InvoiceInfo.TransactionDate).format('YYYY-MM-DD'), this.headerRightColLen);
    TransactionDateStr = CommonFunctions.GetTextFIlledToALength('Trans. Date:' + moment(this.invoice.InvoiceInfo.TransactionDate).format("YYYY-MM-DD"), this.headerRightColLen);

    localDateStr = CommonFunctions.GetTextFIlledToALength("(" + this.GetLocalDate(this.invoice.InvoiceInfo.TransactionDate) + ")", this.headerRightColLen);
    methodOfPaymentStr = CommonFunctions.GetTextFIlledToALength('Method of Payment:' + this.invoice.InvoiceInfo.PaymentMode.toUpperCase(), this.headerRightColLen);


    headerStr += CommonFunctions.GetTextFIlledToALength('Hospital No: ' + this.invoice.PatientInfo.PatientCode, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('IP No: ' + this.ipdNumber, this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Patient Name:' + this.invoice.PatientInfo.ShortName, headerLeftColLen) + invoiceNumberStr + this.nline;
    headerStr += CommonFunctions.GetTextFilledToALengthForLongString('Age/Sex:' + CommonFunctions.GetFormattedAge(this.invoice.PatientInfo.DateOfBirth) + '/' + this.invoice.PatientInfo.Gender, headerLeftColLen) + TransactionDateStr + this.nline;
    if (this.invoice.PatientInfo.CountryName === ENUM_Country.Nepal) {
      headerStr += CommonFunctions.GetTextFIlledToALength('Address: ' + ((this.showMunicipality && this.invoice.PatientInfo.MunicipalityName) ? this.invoice.PatientInfo.MunicipalityName + (this.invoice.PatientInfo.WardNumber ? "-" + this.invoice.PatientInfo.WardNumber : "") + ", " : "") + this.invoice.PatientInfo.CountrySubDivisionName, headerLeftColLen) + this.nline;
    }
    else {
      headerStr += CommonFunctions.GetTextFilledToALengthForLongString('Address: ' + ((this.invoice.PatientInfo.Address ? this.invoice.PatientInfo.Address + ", " : "") + this.invoice.PatientInfo.CountrySubDivisionName + ", " + this.invoice.PatientInfo.CountryName), headerLeftColLen) + this.nline;
    }
    headerStr += CommonFunctions.GetTextFIlledToALength('DOA: ' + moment(this.invoice.VisitInfo.AdmissionDate).format("YYYY-MM-DD") + " (" + this.GetLocalDate(this.invoice.VisitInfo.AdmissionDate) + ")", headerLeftColLen) + invoiceDateStr + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('DOD: ' + moment(this.invoice.VisitInfo.DischargeDate).format("YYYY-MM-DD") + " (" + this.GetLocalDate(this.invoice.VisitInfo.DischargeDate) + ")", headerLeftColLen) + localDateStr + this.nline;

    if (this.invoice.InvoiceInfo.IsInsuranceBilling) {
      headerStr += CommonFunctions.GetTextFIlledToALength('NSHI: ' + this.invoice.PatientInfo.Ins_NshiNumber, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Claim Code : ' + this.invoice.InvoiceInfo.ClaimCode, this.headerRightColLen) + this.nline;
    }
    headerStr += CommonFunctions.GetTextFilledToALengthForLongString('Room Category:' + this.invoice.VisitInfo.WardName, headerLeftColLen) + methodOfPaymentStr + this.nline;
    headerStr += CommonFunctions.GetTextFilledToALengthForLongString('Type: ' + this.invoice.PatientInfo.MembershipTypeName, headerLeftColLen)
      + ((this.invoice.PatientInfo.SSFPolicyNo && (this.invoice.PatientInfo.MembershipTypeName === ENUM_MembershipTypeName.SSF)) ? CommonFunctions.GetTextFIlledToALength('SSF Policy No: ' + this.invoice.PatientInfo.SSFPolicyNo, this.headerRightColLen) : "")
      + ((this.invoice.PatientInfo.PolicyNo && (this.invoice.PatientInfo.MembershipTypeName === ENUM_MembershipTypeName.ECHS)) ? CommonFunctions.GetTextFIlledToALength('ECHS No: ' + this.invoice.PatientInfo.PolicyNo, this.headerRightColLen) : "")
      + this.nline;


    headerStr += CommonFunctions.GetHorizontalLineOfLength(horizontalCols);
    finalDataToPrint = finalDataToPrint + headerStr + this.nline;

    //Footer Code
    let totAmtInWords = (this.invoice.InvoiceInfo.TotalAmount !== 0) ? 'In Words : ' + CommonFunctions.GetNumberInWords(this.invoice.InvoiceInfo.TotalAmount) : '';
    var footerStr = CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
    let amtWordLen = totAmtInWords.length;
    let footerRightColArr = [CommonFunctions.GetTextFIlledToALength('Amount:' + parseFloat(this.invoice.InvoiceInfo.SubTotal.toString()).toFixed(2), footerRightColLen), CommonFunctions.GetTextFIlledToALength('Discount:' + parseFloat(this.invoice.InvoiceInfo.DiscountAmount.toString()).toFixed(2), footerRightColLen),
    CommonFunctions.GetTextFIlledToALength('Credit Amount:' + ' ' + parseFloat((this.invoice.InvoiceInfo.TotalAmount - this.invoice.InvoiceInfo.ReceivedAmount).toString()).toFixed(2), footerRightColLen),
    CommonFunctions.GetTextFIlledToALength('Received Amount:' + ' ' + parseFloat(this.invoice.InvoiceInfo.ReceivedAmount.toString()).toFixed(2), footerRightColLen), CommonFunctions.GetTextFIlledToALength('Grand Total:' + '  ' + parseFloat(this.invoice.InvoiceInfo.TotalAmount.toString()).toFixed(2), footerRightColLen),
    CommonFunctions.GetTextFIlledToALength('Tender:' + ' ' + parseFloat(this.invoice.InvoiceInfo.Tender.toString()).toFixed(2), footerRightColLen)];

    footerStr += CommonFunctions.GetNewLineRepeat(1);

    let paymentDetails = null;
    if (this.invoice.InvoiceInfo.PaymentDetails) {
      paymentDetails = `PaymentDetails: ${this.invoice.InvoiceInfo.PaymentDetails}`;
    }

    for (let i = 0; i < footerRightColArr.length; i++) {
      let startLen = i * (footerLeftColLen - 8);
      footerStr += CommonFunctions.GetTextFIlledToALength(totAmtInWords.substr(startLen, (footerLeftColLen - 8)), footerLeftColLen) + footerRightColArr[i] + this.nline;
      if (paymentDetails) {
        footerStr += CommonFunctions.GetTextFIlledToALength(paymentDetails.substr(startLen, (footerLeftColLen - 8)), footerLeftColLen) + footerRightColArr[i] + this.nline;
      }
    }
    if (this.invoice.InvoiceInfo.DepositAvailable) {
      var depositinfo: string = '';
      if (this.invoice.InvoiceInfo.TotalAmount > this.invoice.InvoiceInfo.DepositAvailable) {
        depositinfo = CommonFunctions.GetTextFIlledToALength('To Be Paid: ' + (this.invoice.InvoiceInfo.TotalAmount - this.invoice.InvoiceInfo.DepositAvailable).toFixed(2), footerRightColLen)
      }
      else if (this.invoice.InvoiceInfo.TotalAmount < this.invoice.InvoiceInfo.DepositAvailable) {
        depositinfo = CommonFunctions.GetTextFIlledToALength('To be Returned: ' + (this.invoice.InvoiceInfo.DepositReturnAmount), footerRightColLen)
      }

      footerStr += CommonFunctions.GetTextFIlledToALength('Deposit:  ' + this.invoice.InvoiceInfo.DepositAvailable, footerLeftColLen) + depositinfo + this.nline;
    }
    if (this.invoice.InvoiceInfo.Remarks)
      footerStr += CommonFunctions.GetTextFIlledToALength('Remarks:  ' + this.invoice.InvoiceInfo.Remarks, horizontalCols) + this.nline;
    if (this.invoice.InvoiceInfo.CreditOrganizationName) {
      footerStr += CommonFunctions.GetTextFilledToALengthForLongString('Credit Organization: ' + this.invoice.InvoiceInfo.CreditOrganizationName, footerLeftColLen) + this.nline;
    }
    footerStr += CommonFunctions.GetTextFIlledToALength('User:  ' + userName, footerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Time: ' + this.currTime, footerRightColLen) + this.nline;

    if (this.InvoiceFooterNoteSettings.ShowFooter && this.InvoiceFooterNoteSettings.ShowEnglish) {
      footerStr += CommonFunctions.GetTextCenterAligned(
        this.InvoiceFooterNoteSettings.EnglishText,
        horizontalCols
      );
    }
    //items listing table
    var tableHead = CommonFunctions.GetTextFIlledToALength('Sn.', hlen_SN) + CommonFunctions.GetTextFIlledToALength('Service Particular(s)', hlen_Particular) + CommonFunctions.GetTextFIlledToALength('Qty', hlen_qty) + CommonFunctions.GetTextFIlledToALength('Amount', hlen_amt) + this.nline;

    var tableBody = '';
    // for (let i = 0; i < billItems.length; i++) {
    //     var tblRow = '';

    //     tblRow += CommonFunctions.GetTextFIlledToALength((i + 1).toString(), hlen_SN)
    //         + CommonFunctions.GetTextFIlledToALength(billItems[i].ItemName, hlen_Particular)
    //         + CommonFunctions.GetTextFIlledToALength(billItems[i].Quantity.toString(), hlen_qty)
    //         + CommonFunctions.GetTextFIlledToALength(parseFloat(billItems[i].SubTotal.toString()).toFixed(2), hlen_amt) + this.nline;

    //     tableBody = tableBody + tblRow;
    // }

    // * Changing above looping as follows, Krishna, 29th March'22
    let tempBillItms = _.cloneDeep(this.invoice.InvoiceItems);
    let billItems = tempBillItms.reduce((acc, currVal) => {
      if (acc.hasOwnProperty(currVal.ItemName)) {
        acc[currVal.ItemName].Quantity += currVal.Quantity;
        acc[currVal.ItemName].SubTotal += currVal.SubTotal;
      } else {
        acc[currVal.ItemName] = currVal;
      }
      return acc;
    }, []);
    // * Above code combines together repeated billItems increasing their quantity and subtotal accordingly..., Krishna, 29th March'22

    var count = 1;
    for (let key in billItems) {
      // * Need to break this loop after all the items are looped through....., Krishna, 29th March'22
      if (key == "remove") {
        break;
      }
      let value = billItems[key];
      var tblRow = '';


      tblRow += CommonFunctions.GetTextFIlledToALength((count).toString(), hlen_SN)
        + CommonFunctions.GetTextFIlledToALength(value.ItemName, hlen_Particular)
        + CommonFunctions.GetTextFIlledToALength(value.Quantity.toString(), hlen_qty)
        + CommonFunctions.GetTextFIlledToALength(parseFloat(value.SubTotal.toString()).toFixed(2), hlen_amt) + this.nline;

      tableBody = tableBody + tblRow;
      count++;
    }

    finalDataToPrint = finalDataToPrint + tableHead + tableBody + footerStr;


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

  // UpdateBillPrintCount() {
  //     //add 1 to existing printcount.
  //     let printCount = this.invoice.InvoiceInfo.PrintCount + 1;

  //     this.billingBLService.PutPrintCount(printCount, this.invoice.InvoiceInfo.BillingTransactionId)
  //         .subscribe(res => {
  //             if (res.Status == "OK") {

  //             }
  //             else {

  //             }
  //         });

  // }


  UpdatePrintCount() {
    let printCount = this.invoice.InvoiceInfo.PrintCount + 1;
    this.billingBLService.PutPrintCount(printCount, this.invoice.InvoiceInfo.BillingTransactionId)
      .subscribe(res => {
        if (res.Status !== ENUM_DanpheHTTPResponses.OK) {
          //if OK then do nothing.
          console.log("Failed to Update Print Count");
        }
        //if redirect url path is found, then redirect to that page else go to billing-searchpatient.
        if (this.redirectUrlPath) {
          this.router.navigate([this.redirectUrlPath]);
        }
        else {
          if (this.isDuplicatePrint) {
            this.dischargeemmiter.emit({ Close: "close" });
          } else {
            this.router.navigate(['/Billing/SearchPatient']);
          }
        }

      });
  }



  GetLocalDate(engDate: string): string {
    let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
    return npDate + " BS";
  }

  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  OnPrinterChanged($event) {
    this.selectedPrinter = $event;
  }

  AfterDuplicatePrint() {
    //this.dischargeemmiter.emit({ Close: "close" });
  }
}
