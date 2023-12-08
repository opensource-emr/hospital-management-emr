import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, Output } from "@angular/core";
import { Router } from '@angular/router';
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { PatientService } from "../../../patients/shared/patient.service";
import { ENUM_PrintingType, PrinterSettingsModel } from "../../../settings-new/printers/printer-settings.model";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { RouteFromService } from "../../../shared/routefrom.service";
import { ENUM_Country, ENUM_DanpheHTTPResponseText, ENUM_MembershipTypeName, ENUM_PriceCategory } from "../../../shared/shared-enums";
import { BillingBLService } from "../../shared/billing.bl.service";
import { BillingService } from "../../shared/billing.service";
import { BilPrint_VM } from "../../shared/invoice-print-vms";


@Component({
  selector: "bil-print-invoice-default",
  templateUrl: "./bil-print-invoice-default.html",
})

export class Bil_Print_Invoice_DefaultComponent {
  @Input("invoice")
  public invoice: BilPrint_VM = new BilPrint_VM();

  @Input("redirect-path-after-print")
  redirectUrlPath: string = null;

  @Input('focus-print-btn')
  public focusPrintBtn: boolean = true;

  @Input('from-duplicate-prints')
  public isPrintFromDuplicate: boolean = false;

  @Input('from-ADT-prints')
  public isPrintFromADT: boolean = false;

  @Input('from-visit-prints')
  public isPrintFromVisit: boolean = false;

  @Output('dpemmiter')
  public dpemmiter: EventEmitter<object> = new EventEmitter<object>();

  public finalAge: string = null;
  public localDateTime: string;
  public ipdNumber: string = null;
  public isInsurance: boolean = false;

  public taxLabel: string;
  //public currencyUnit: string;
  public patientQRCodeInfo: string = "";

  public Invoice_Label: string = "INVOICE";//sud:19Nov'19--we're getting this value from Parameter since different hospital needed it differently.
  public EnableCreditNote: boolean;
  public ShowProviderName: boolean;

  public CreditInvoiceDisplaySettings = { ShowPatAmtForCrOrganization: false, PatAmtValue: "0.00", ValidCrOrgNameList: ["Nepal Govt Dialysis"] };
  public QueueNoSetting = { "ShowInInvoice": false, "ShowInSticker": false };

  public InvoiceDisplaySettings: any = { ShowHeader: true, ShowQR: true, ShowHospLogo: true, ShowPriceCategory: false, HeaderType: '' };
  public InvoiceFooterNoteSettings: any = { ShowFooter: true, ShowEnglish: true, ShowNepali: false, EnglishText: "Please bring this invoice on your next visit.", NepaliText: "कृपया अर्को पटक आउँदा यो बिल अनिवार्य रुपमा लिएर आउनुहोला ।" };
  public hospitalCode: string = "";
  public isReceiptDetailLoaded: boolean = false;
  public defaultFocusADT: string = null;
  public defaultFocusVisit: string = null;
  public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };

  public closePopUpAfterInvoicePrintFromVisit: boolean = true;
  public closePopUpAfterInvoicePrintFromADT: boolean = true;
  public showLabType: boolean = false;
  public labCount: number = 0;
  public SSFPriceCategory: string = ENUM_PriceCategory.SSF;
  public ECHSMembershipTypeName: string = ENUM_MembershipTypeName.ECHS;

  public showMunicipality: boolean = false;
  public CountryNepal: string = null;
  public OtherCurrencyDetail: OtherCurrencyDetail = { CurrencyCode: '', ExchangeRate: 0, BaseAmount: 0, ConvertedAmount: 0 };
  public BillingPackageInvoiceColumnSelection = { Unit: false, Price: false, DiscountPercent: false, DiscountAmount: false, Amount: false, InvoiceSubTotal: false, InvoiceDiscount: false };
  public BillingInvoiceDisplaySetting = { Unit: true, Price: true, DiscountPercent: true, DiscountAmount: true, Amount: true, InvoiceSubTotal: true, InvoiceDiscount: true };

  public EnableEnglishCalendarOnly: boolean = false;
  constructor(
    public billingBLService: BillingBLService,
    public nepaliCalendarService: NepaliCalendarService,
    public billingService: BillingService,
    public coreService: CoreService,
    public httpClient: HttpClient,
    public router: Router,
    public injector: Injector,
    public messageBoxService: MessageboxService,
    public patientService: PatientService,
    public routeFromService: RouteFromService,
    public changeDetector: ChangeDetectorRef) {
    this.taxLabel = this.billingService.taxLabel;
    //this.currencyUnit = this.billingService.currencyUnit;
    this.GetCalendarParameter();
    this.SetInvoiceLabelNameFromParam();
    this.GetBillingPackageInvoiceColumnSelection();
    this.GetBillingInvoiceDisplaySetting();
    //this.ShowHideSubTotalAndDiscount();
    this.ShowProviderName = this.coreService.SetShowProviderNameFlag();
    this.LoadCreditInvoiceDisplaySettingsFromParameter();
    this.QueueNoSetting = this.coreService.GetQueueNoSetting();
    this.InvoiceDisplaySettings = this.coreService.GetInvoiceDisplaySettings();
    this.InvoiceFooterNoteSettings = this.coreService.GetInvoiceFooterNoteSettings();
    this.hospitalCode = this.coreService.GetHospitalCode();
    if (!this.hospitalCode) {
      this.hospitalCode = "default";
    }

    this.showMunicipality = this.coreService.ShowMunicipality().ShowMunicipality;
    this.CountryNepal = ENUM_Country.Nepal;

    let paramValue = this.coreService.Parameters.find(a => a.ParameterName === 'BillingHeader').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);

    let StrParam = this.coreService.Parameters.find(a => a.ParameterGroupName === "Billing" && a.ParameterName === "OPBillingRequestDisplaySettings");
    if (StrParam && StrParam.ParameterValue) {
      let currParam = JSON.parse(StrParam.ParameterValue);
      this.showLabType = currParam.LabType;
    }
    this.labCount = this.coreService.labTypes.length;
  }
  GetCalendarParameter(): void {
    const param = this.coreService.Parameters.find(p => p.ParameterGroupName === "Common" && p.ParameterName === "EnableEnglishCalendarOnly");
    if (param && param.ParameterValue) {
      const paramValue = JSON.parse(param.ParameterValue);
      this.EnableEnglishCalendarOnly = paramValue;
    }
  }
  ngAfterViewInit() {
    let btnObj = document.getElementById('btnPrintReceipt');
    if (btnObj && this.focusPrintBtn) {
      btnObj.focus();
    }
  }

  GetBillingInvoiceDisplaySetting() {
    let currParam = this.coreService.Parameters.find(a => a.ParameterGroupName === "Billing" && a.ParameterName === "BillingInvoiceDisplaySettings");
    if (currParam && currParam.ParameterValue) {
      this.BillingInvoiceDisplaySetting = JSON.parse(currParam.ParameterValue);
    }
  }
  public SetInvoiceLabelNameFromParam() {
    let currParam = this.coreService.Parameters.find(a => a.ParameterGroupName === "Billing" && a.ParameterName === "BillingInvoiceDisplayLabel");
    if (currParam && currParam.ParameterValue) {
      this.Invoice_Label = currParam.ParameterValue;
    }
  }

  public GetBillingPackageInvoiceColumnSelection() {
    let currParam = this.coreService.Parameters.find(a => a.ParameterGroupName === "Billing" && a.ParameterName === "BillingPackageInvoiceColumnSelection");
    if (currParam && currParam.ParameterValue) {
      this.BillingPackageInvoiceColumnSelection = JSON.parse(currParam.ParameterValue);
    }
  }

  /**checks params to show or hide discount and subtotal in default print invoice slip. */
  // public ShowHideSubTotalAndDiscount(){
  //   var currParam = this.coreService.GetBillingPackageInvoiceColumnSelection();
  //   this.showSubTotal = currParam.SubTotal;
  //   this.showDiscount = currParam.Discount;
  // }

  GetLocalDate(engDate: string): string {
    if (this.EnableEnglishCalendarOnly) {
      return null;
    } else {
      let npDate = this.nepaliCalendarService.ConvertEngToNepDateString(engDate);
      // return npDate + " BS";
      return `(${npDate} BS)`;
    }
  }

  public loading: boolean = false;
  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;

  public print() {
    this.loading = true;
    //Open 'Browser Print' if printer not found or selected printing type is Browser.
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType === ENUM_PrintingType.browser) {
      this.browserPrintContentObj = document.getElementById("billing-receipt");
      this.openBrowserPrintWindow = false;
      this.changeDetector.detectChanges();
      this.openBrowserPrintWindow = true;
      this.UpdatePrintCount();
      this.loading = false;

      //this.router.navigate(['/Billing/DuplicatePrints']);
    }
    else if (this.selectedPrinter.PrintingType === ENUM_PrintingType.dotmatrix) {
      //-----qz-tray start----->
      this.coreService.QzTrayObject.websocket.connect()
        .then(() => {
          return this.coreService.QzTrayObject.printers.find();
        })
        .then(() => {
          this.loading = false;
          var config = this.coreService.QzTrayObject.configs.create(this.selectedPrinter.PrinterName);
          let dataToPrint = this.MakeReceipt();
          return this.coreService.QzTrayObject.print(config, CommonFunctions.GetEpsonPrintDataForPage(dataToPrint, this.selectedPrinter.mh, this.selectedPrinter.ml, this.selectedPrinter.ModelName));
        })
        .catch(function (e) {
          console.error(e);
          this.loading = false;
        })
        .finally(() => {
          this.loading = false;
          this.UpdatePrintCount();
          return this.coreService.QzTrayObject.websocket.disconnect();
        });
      //-----qz-tray end----->

      //this.router.navigate(['/Billing/DuplicatePrints']);

    } else {
      this.loading = false;
      this.messageBoxService.showMessage('error', ["Printer Not Supported."]);
    }

  }


  public headerRightColLen: number = 32;
  public nline: any = '\n';

  public MakeReceipt() {
    let totalHeight_lines = this.selectedPrinter.Height_Lines;
    let headerGap_lines = this.selectedPrinter.HeaderGap_Lines;
    let horizontalCols = this.selectedPrinter.Width_Lines;
    let headerLeftColLen = horizontalCols - this.headerRightColLen;
    let finalDataToPrint = '';

    let hlen_SN = 8;
    let hlen_unit = 8;
    let hlen_price = 10;
    let hlen_amt = 10;
    let hlen_Particular = horizontalCols - (hlen_SN + hlen_unit + hlen_price + hlen_amt);
    let footerRightColLen = hlen_unit + hlen_price + hlen_amt;
    let footerLeftColLen = horizontalCols - footerRightColLen;

    let addressValue: string = "";
    if (this.invoice.PatientInfo.CountryName === ENUM_Country.Nepal) {
      addressValue = ((this.showMunicipality && this.invoice.PatientInfo.MunicipalityName) ? this.invoice.PatientInfo.MunicipalityName + (this.invoice.PatientInfo.WardNumber ? "-" + this.invoice.PatientInfo.WardNumber : "") + ", " : "") + this.invoice.PatientInfo.CountrySubDivisionName;
    }
    else {
      addressValue = (this.invoice.PatientInfo.Address ? this.invoice.PatientInfo.Address + ", " : "") + this.invoice.PatientInfo.CountrySubDivisionName + ", " + this.invoice.PatientInfo.CountryName;
    }

    let insuranceInfoStr = "";
    if (this.invoice.InvoiceInfo.IsInsuranceBilling) {
      insuranceInfoStr = CommonFunctions.GetTextFIlledToALength('NSHI: ' + this.invoice.PatientInfo.Ins_NshiNumber, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Claim Code : ' + this.invoice.InvoiceInfo.ClaimCode, this.headerRightColLen) + this.nline;
    }


    let headerStr = '';

    let invoiceHeaderLabel = this.invoice.InvoiceInfo.IsInsuranceBilling ? "Health Insurance Credit Invoice" : "INVOICE";

    let duplicatePrintString = this.invoice.InvoiceInfo.PrintCount > 0 ? ' | COPY(' + this.invoice.InvoiceInfo.PrintCount + ') OF ORIGINAL' : '';
    if (this.InvoiceDisplaySettings.ShowHeader) {
      headerStr += CommonFunctions.GetTextCenterAligned(this.headerDetail.CustomerName, horizontalCols);
      headerStr += CommonFunctions.GetTextCenterAligned(this.headerDetail.Address, horizontalCols);
      headerStr += CommonFunctions.GetTextCenterAligned('Ph No: ' + this.headerDetail.Tel, horizontalCols);
      headerStr += CommonFunctions.GetTextCenterAligned(this.headerDetail.CustomerRegLabel, horizontalCols);
    }

    headerStr += CommonFunctions.GetTextCenterAligned(invoiceHeaderLabel + duplicatePrintString + ((this.invoice.InvoiceInfo.PackageId && this.invoice.InvoiceInfo.PackageName) ? "|" + this.invoice.InvoiceInfo.PackageName : ""), horizontalCols) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Invoice No:' + this.invoice.InvoiceInfo.InvoiceNumFormatted, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Transaction Date: ' + moment(this.invoice.InvoiceInfo.TransactionDate).format("YYYY-MM-DD"), this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Hospital No:' + this.invoice.PatientInfo.PatientCode, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Invoice Date: ' + moment(this.invoice.InvoiceInfo.TransactionDate).format("YYYY-MM-DD"), this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFilledToALengthForLongString('Patients Name: ' + this.invoice.PatientInfo.ShortName, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('(' + this.GetLocalDate(this.invoice.InvoiceInfo.TransactionDate) + ')', this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFilledToALengthForLongString('Address: ' + addressValue, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Age/Sex : ' + this.finalAge, this.headerRightColLen) + this.nline;
    if (insuranceInfoStr) {
      headerStr += insuranceInfoStr;
    }

    if (this.invoice.PatientInfo.PhoneNumber || this.invoice.PatientInfo.PANNumber) {
      headerStr += CommonFunctions.GetTextFilledToALengthForLongString('Contact No: ' + this.invoice.PatientInfo.PhoneNumber, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Purchasers PAN : ' + this.invoice.PatientInfo.PANNumber, this.headerRightColLen) + this.nline;
    }

    if (this.ipdNumber) {
      headerStr += CommonFunctions.GetTextFIlledToALength('IP Number:' + this.ipdNumber, headerLeftColLen) + this.nline;
    }

    if (this.invoice.InvoiceInfo.LabTypeName) {
      headerStr += CommonFunctions.GetTextFIlledToALength('LAB TYPE:' + this.invoice.InvoiceInfo.LabTypeName.toUpperCase(), headerLeftColLen);
    }
    else {
      headerStr += CommonFunctions.GetSpaceRepeat(headerLeftColLen + 1);
    }

    headerStr += CommonFunctions.GetTextFIlledToALength('Method of payment: ' + this.invoice.InvoiceInfo.PaymentMode.toUpperCase(), this.headerRightColLen) + this.nline;

    //Show PriceCategory for other than Normal.
    //Note: We're checking PriceCategory for 1st Item, it will not work if 1st item is Normal and 2nd Item is EHS.
    // Correct approach is to add PriceCategory in the Invoice Level similar to Lab-Type. (Future Enhancement)
    if (this.InvoiceDisplaySettings.ShowPriceCategory) {
      if (this.invoice.InvoiceItems && this.invoice.InvoiceItems.length > 0 && this.invoice.InvoiceItems[0].PriceCategory
        && this.invoice.InvoiceItems[0].PriceCategory.toLowerCase() !== 'normal') {
        headerStr += CommonFunctions.GetTextFIlledToALength('Price Category:' + this.invoice.InvoiceItems[0].PriceCategory, headerLeftColLen);
      }
    }
    // if(this.invoice.InvoiceItems && this.invoice.InvoiceItems.length>0 && this.invoice.InvoiceItems[0].PriceCategory && this.invoice.InvoiceItems[0].PriceCategory.toLowerCase() === this.SSFPriceCategory){
    //   headerStr += CommonFunctions.GetTextFIlledToALength('SSF Policy No: ' + this.invoice.PatientInfo.SSFPolicyNo, this.headerRightColLen) + this.nline;
    // }
    // if(this.invoice.InvoiceItems && this.invoice.InvoiceItems.length>0 && this.invoice.InvoiceItems[0].PriceCategory && this.invoice.PatientInfo.MembershipTypeName === ENUM_MembershipTypeName.ECHS){
    //   headerStr += CommonFunctions.GetTextFIlledToALength('ECHS No: ' + this.invoice.PatientInfo.PolicyNo, this.headerRightColLen) + this.nline;
    // }
    headerStr += CommonFunctions.GetTextFilledToALengthForLongString('Type: ' + this.invoice.PatientInfo.MembershipTypeName, headerLeftColLen)
      + ((this.invoice.PatientInfo.SSFPolicyNo && (this.invoice.PatientInfo.MembershipTypeName === ENUM_MembershipTypeName.SSF)) ? CommonFunctions.GetTextFIlledToALength('SSF Policy No: ' + this.invoice.PatientInfo.SSFPolicyNo, this.headerRightColLen) : "")
      + ((this.invoice.PatientInfo.PolicyNo && (this.invoice.PatientInfo.MembershipTypeName === ENUM_MembershipTypeName.ECHS)) ? CommonFunctions.GetTextFIlledToALength('ECHS No: ' + this.invoice.PatientInfo.PolicyNo, this.headerRightColLen) : "")
      + this.nline;
    headerStr += CommonFunctions.GetHorizontalLineOfLength(horizontalCols);

    finalDataToPrint = finalDataToPrint + headerStr + this.nline;

    //Footer Code
    let totAmtInWords = this.invoice.InvoiceInfo.TotalAmount !== 0 ? 'In Words : ' + CommonFunctions.GetNumberInWords(this.invoice.InvoiceInfo.TotalAmount) : '';
    var footerStr = CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
    let footerRightColArr = [CommonFunctions.GetTextFIlledToALength('SubTotal:' + this.invoice.InvoiceInfo.SubTotal.toString(), footerRightColLen), CommonFunctions.GetTextFIlledToALength('Discount:' + this.invoice.InvoiceInfo.DiscountAmount.toString(), footerRightColLen),
    CommonFunctions.GetTextFIlledToALength('Total Amount:' + '  ' + this.invoice.InvoiceInfo.TotalAmount.toString(), footerRightColLen),
    CommonFunctions.GetTextFIlledToALength('Credit Amount:' + ' ' + (this.invoice.InvoiceInfo.TotalAmount - this.invoice.InvoiceInfo.ReceivedAmount).toString(), footerRightColLen),
    CommonFunctions.GetTextFIlledToALength('Received Amount:' + '  ' + this.invoice.InvoiceInfo.ReceivedAmount.toString(), footerRightColLen)
    ];

    for (let i = 0; i < footerRightColArr.length; i++) {
      let startLen = i * (footerLeftColLen - 8); //8 is given for gap
      footerStr += CommonFunctions.GetTextFIlledToALength(totAmtInWords.substr(startLen, (footerLeftColLen - 8)), footerLeftColLen) + footerRightColArr[i] + this.nline;
    }

    if (this.invoice.InvoiceInfo.PaymentDetails) {
      footerStr += CommonFunctions.GetTextFIlledToALength('PaymentDetails: ' + this.invoice.InvoiceInfo.PaymentDetails, horizontalCols) + this.nline;
    }

    if (this.invoice.InvoiceInfo.DepositUsed) {
      footerStr += CommonFunctions.GetTextFIlledToALength('Deposit: [Deducted:' + this.invoice.InvoiceInfo.DepositUsed + '/Balance:' + this.invoice.InvoiceInfo.DepositBalance + "]", headerLeftColLen) + this.nline;
    }

    if (this.invoice.InvoiceInfo.Remarks) {
      footerStr += CommonFunctions.GetTextFIlledToALength('Remarks:  ' + this.invoice.InvoiceInfo.Remarks, footerLeftColLen) + this.nline;
    }

    if (this.invoice.InvoiceInfo.CreditOrganizationName) {
      footerStr += CommonFunctions.GetTextFIlledToALength('Credit Organization:  ' + this.invoice.InvoiceInfo.CreditOrganizationName, footerLeftColLen) + this.nline;
    }

    if (this.invoice.InvoiceItems[0].RequestedByName) {
      footerStr += CommonFunctions.GetTextFIlledToALength('Prescribed By: ' + this.invoice.InvoiceItems[0].RequestedByName, footerLeftColLen) + this.nline;
    }

    if (this.invoice.VisitInfo.ConsultingDoctor && this.isPrintFromVisit) {
      footerStr += CommonFunctions.GetTextFIlledToALength('Consulting Doctor: ' + this.invoice.VisitInfo.ConsultingDoctor, footerLeftColLen) + this.nline;
    }

    if (this.invoice.VisitInfo.ItemsRequestingDoctors && (this.invoice.VisitInfo.ItemsRequestingDoctors != this.invoice.VisitInfo.ConsultingDoctor)) {
      footerStr += CommonFunctions.GetTextFIlledToALength('Referred By: ' + this.invoice.VisitInfo.ItemsRequestingDoctors, footerLeftColLen) + this.nline;
    }


    footerStr += CommonFunctions.GetTextFIlledToALength('User:  ' + this.invoice.InvoiceInfo.UserName, footerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Time: ' + moment(this.invoice.InvoiceInfo.TransactionDate).format("HH:mm"), footerRightColLen) + this.nline;

    if (this.InvoiceFooterNoteSettings.ShowFooter && this.InvoiceFooterNoteSettings.ShowEnglish) {
      footerStr += CommonFunctions.GetTextCenterAligned(
        this.InvoiceFooterNoteSettings.EnglishText,
        horizontalCols
      );
    }
    //items listing table
    var tableHead = CommonFunctions.GetTextFIlledToALength('Sn.', hlen_SN) + CommonFunctions.GetTextFIlledToALength('Particular(s)', hlen_Particular) +
      CommonFunctions.GetTextFIlledToALength('Unit', hlen_unit) + CommonFunctions.GetTextFIlledToALength('Price', hlen_price) + CommonFunctions.GetTextFIlledToALength('Amount', hlen_amt) + this.nline;
    var tableBody = '';
    let billItems = this.invoice.InvoiceItems;
    for (let i = 0; i < billItems.length; i++) {
      var tblRow = '';
      var totalamount = billItems[i].Quantity * billItems[i].Price;
      let strProviderName = '';
      if (this.ShowProviderName && billItems[i].PerformerName) {
        strProviderName = '(' + billItems[i].PerformerName + ')';
      }

      tblRow += CommonFunctions.GetTextFIlledToALength((i + 1).toString(), hlen_SN)
        + CommonFunctions.GetTextFIlledToALength(billItems[i].ItemName + strProviderName, hlen_Particular) //Append ProviderName If Available.
        //+ CommonFunctions.GetTextFIlledToALength(billItems[i].ItemName, hlen_Particular)
        + CommonFunctions.GetTextFIlledToALength(billItems[i].Quantity.toString(), hlen_unit)
        + CommonFunctions.GetTextFIlledToALength(billItems[i].Price.toString(), hlen_price)
        + CommonFunctions.GetTextFIlledToALength(totalamount.toString(), hlen_amt) + this.nline;

      tableBody = tableBody + tblRow;
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

  UpdatePrintCount() {
    let printCount = this.invoice.InvoiceInfo.PrintCount + 1;
    this.billingBLService.PutPrintCount(printCount, this.invoice.InvoiceInfo.BillingTransactionId) //Yubraj: 13th August'19--sending BillingTransactionId instead of ReceiptNo
      .subscribe(res => {
        if (res.Status !== ENUM_DanpheHTTPResponseText.OK) {
          //if OK then do nothing.
          console.log("Failed to Update Print Count");
        }
        this.invoice.InvoiceInfo.PrintCount = printCount;
        //if redirect url path is found, then redirect to that page else go to billing-searchpatient.
        if (this.redirectUrlPath) {
          this.router.navigate([this.redirectUrlPath]);
        }
        else {
          if (this.isPrintFromDuplicate) {

            this.dpemmiter.emit({ Close: "close" });

          } else {
            if ((!this.isPrintFromADT && !this.isPrintFromVisit) || (this.isPrintFromADT && this.closePopUpAfterInvoicePrintFromADT) ||
              (this.isPrintFromVisit && this.closePopUpAfterInvoicePrintFromVisit)) {
              this.router.navigate(['/Billing/SearchPatient']);
            }
            // if (this.isPrintFromVisit && this.closePopUpAfterInvoicePrintFromVisit) {
            //   this.router.navigate(['/Billing/SearchPatient']);
            // }
            // if (!this.isPrintFromADT && !this.isPrintFromVisit) {
            //   this.router.navigate(['/Billing/SearchPatient']);
            //}
          }
        }

      });
  }


  ngOnInit() {

    if (this.invoice) {
      console.log(this.invoice.InvoiceInfo)
      if (this.invoice.InvoiceInfo.OtherCurrencyDetail) {
        this.OtherCurrencyDetail = JSON.parse(this.invoice.InvoiceInfo.OtherCurrencyDetail);
      } else {
        this.OtherCurrencyDetail = null;
      }
      //let invDate = this.invoice.InvoiceInfo.TransactionDate;
      this.localDateTime = this.GetLocalDate(this.invoice.InvoiceInfo.TransactionDate);
      this.finalAge = CommonFunctions.GetFormattedAgeSex(this.invoice.PatientInfo.DateOfBirth, this.invoice.PatientInfo.Gender);

      if (this.invoice.InvoiceInfo.TransactionType === "inpatient") {
        this.ipdNumber = this.invoice.VisitInfo.VisitCode;
      }

      this.isInsurance = this.invoice.InvoiceInfo.IsInsuranceBilling;



      this.patientQRCodeInfo = `Name: ` + this.invoice.PatientInfo.ShortName + `
Age/Sex : `+ this.invoice.PatientInfo.Age + `/` + this.invoice.PatientInfo.Gender.charAt(0) + `
Hospital No: `+ '[' + this.invoice.PatientInfo.PatientCode + ']' + `
Invoice No: ` + this.invoice.InvoiceInfo.InvoiceNumFormatted;

      this.invoice.InvoiceItems.forEach(a => a.Price = CommonFunctions.parseAmount(a.Price));
    }

    //if current invoice's Organization name is in the list of Valid CreditOrganization list then only show PatientAmount, else hide PatientAmount field.
    if (this.invoice && this.CreditInvoiceDisplaySettings.ShowPatAmtForCrOrganization && this.invoice.InvoiceInfo.CreditOrganizationName
      && this.CreditInvoiceDisplaySettings.ValidCrOrgNameList && this.CreditInvoiceDisplaySettings.ValidCrOrgNameList.length > 0
      && this.CreditInvoiceDisplaySettings.ValidCrOrgNameList.filter(orgName => orgName.toLowerCase() === this.invoice.InvoiceInfo.CreditOrganizationName.toLowerCase()).length > 0) {
      this.CreditInvoiceDisplaySettings.ShowPatAmtForCrOrganization = true;
    }
    else {
      this.CreditInvoiceDisplaySettings.ShowPatAmtForCrOrganization = false;
    }

    this.invoice.IsInvoiceFound = true;
    let val = this.coreService.Parameters.find(p => p.ParameterGroupName === 'Appointment' && p.ParameterName === 'VisitPrintSettings');
    let param = JSON.parse(val && val.ParameterValue);
    if (param) {
      this.defaultFocusVisit = param.DefaultFocus;
      this.closePopUpAfterInvoicePrintFromVisit = param.closePopUpAfterInvoicePrint;
    }

    let adtVal = this.coreService.Parameters.find(p => p.ParameterGroupName === 'ADT' && p.ParameterName === 'AdmissionPrintSettings');
    let params = JSON.parse(adtVal && adtVal.ParameterValue);
    if (params) {
      this.defaultFocusADT = params.DefaultFocus;
      this.closePopUpAfterInvoicePrintFromADT = params.closePopUpAfterInvoicePrint;
    }
  }


  public LoadCreditInvoiceDisplaySettingsFromParameter() {
    let param = this.coreService.Parameters.find(p => p.ParameterGroupName === "Billing" && p.ParameterName === "CreditInvoiceDisplaySettings");
    if (param) {
      let paramValueStr = param.ParameterValue;
      if (paramValueStr) {
        this.CreditInvoiceDisplaySettings = JSON.parse(paramValueStr);
      }
    }
  }

  //sud:21May'21: Capture the selected printer setting.
  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  OnPrinterChanged($event) {
    this.selectedPrinter = $event;
  }


}
