import { Component, Input, Output, ChangeDetectorRef, Inject, EventEmitter } from "@angular/core";
import { BillingBLService } from "../../shared/billing.bl.service";
import { BillingService } from "../../shared/billing.service";
import { CoreService } from "../../../core/shared/core.service";
import { HttpClient } from '@angular/common/http';
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { BillingTransactionItem } from "../../shared/billing-transaction-item.model";
import { Patient } from "../../../patients/shared/patient.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import * as moment from 'moment/moment';
import { SecurityService } from "../../../security/shared/security.service";
import { ENUM_PrintingType, PrinterSettingsModel } from "../../../settings-new/printers/printer-settings.model";
import { Router } from "@angular/router";

@Component({
  selector: "bil-print-provisional-slip",
  templateUrl: "./bil-print-provisional-slip.html",
})
export class BIL_Print_ProvisionalSlip_Component {

  @Input('PatientId')
  public PatientId: number = null;

  @Input('ProvFiscalYrId')
  public ProvFiscalYrId: number = null;

  @Input('ProvReceiptNo')
  public ProvReceiptNo: number = null;

  @Input('visitType')
  public visitType: string = null;
  @Input('isInsurance')
  public isInsurance: boolean = false;


  public allBillItems: Array<BillingTransactionItem> = [];
  public PatientInfo: Patient = null;
  public isReceiptLoaded: boolean = false;

  public ProvisionalSlipDetails: any = null;
  public model = {
    SubTotal: 0,
    TotalDiscount: 0,
    TaxAmount: 0,
    TotalAmount: 0
  };

  public CurrentDate: string;
  public taxLabel: string;
  //public currencyUnit: string;

  public provSlipFooterParam = { ShowFooter: false, EnglishText: "!! This is not Final Invoice !!", NepaliText: "!! जानकारीको लागि मात्र !!", VerticalAlign: true };
  public InvoiceDisplaySettings: any = { "ShowHeader": true, "ShowQR": true, "ShowHospLogo": true };
  public hospitalCode: string = "";

  public isReceiptDetailLoaded: boolean = false;
  public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };

  constructor(
    public billingBLService: BillingBLService,
    public nepaliCalendarServ: NepaliCalendarService,
    public billingService: BillingService,
    public coreService: CoreService,
    public httpobj: HttpClient,
    public msgBoxServ: MessageboxService,
    public securityService: SecurityService, public router: Router, public changeDetector: ChangeDetectorRef) {
    this.taxLabel = this.billingService.taxLabel;
    //this.currencyUnit = this.billingService.currencyUnit;
    this.hospitalCode = this.coreService.GetHospitalCode();
    this.InvoiceDisplaySettings = this.coreService.GetInvoiceDisplaySettings();
    if (!this.hospitalCode) {
      this.hospitalCode = "default";
    }

    var paramValue = this.coreService.Parameters.find(
      (a) => a.ParameterName == "BillingHeader"
    ).ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);

    //this.SetPrinterFromParam();
    this.CurrentDate = moment().format("YYYY-MM-DD HH:mm:ss");
  }

  ngOnInit() {
    if (this.PatientId && this.isInsurance == false) {
      this.GetProvisionalItemsInfoForPrint(this.PatientId, this.ProvFiscalYrId, this.ProvReceiptNo, this.visitType);
    }
    if(this.isInsurance && this.PatientId){
      this.GetInsuranceProvisionalInfoForPrint(this.PatientId,this.ProvFiscalYrId, this.ProvReceiptNo, this.visitType);
    }
    this.provSlipFooterParam = this.coreService.LoadFooterNoteSettingsFromParameter();
  }

  public GetProvisionalItemsInfoForPrint(PatientId, ProvFiscalYrId, ProvReceiptNo, visitType) {
    this.billingBLService.GetProvisionalItemsInfoForPrint(PatientId, ProvFiscalYrId, ProvReceiptNo, visitType)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            //this.RouteToReceipt(res.Results)
            this.ProvisionalSlipDetails = res.Results;
            this.CalculateTotalAmounts(this.ProvisionalSlipDetails.ItemsList);
            this.isReceiptLoaded = true;
            this.coreService.FocusInputById("btnPrintProvisionalSlip");//focus on print button after provisional slip is loaded.
          }
          else {
            this.msgBoxServ.showMessage("failed", ["..."]);
            console.log(res.ErrorMessage);
            this.isReceiptLoaded = false;
          }
        });
  }
  public GetInsuranceProvisionalInfoForPrint(PatientId, ProvFiscalYrId, ProvReceiptNo, visitType) {
    this.billingBLService.GetInsuranceProvisionalInfoForPrint(PatientId, ProvFiscalYrId, ProvReceiptNo, visitType)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            //this.RouteToReceipt(res.Results)
            this.ProvisionalSlipDetails = res.Results;
            this.CalculateTotalAmounts(this.ProvisionalSlipDetails.ItemsList);
            this.isReceiptLoaded = true;
            this.coreService.FocusInputById("btnPrintProvisionalSlip");//focus on print button after provisional slip is loaded.
          }
          else {
            this.msgBoxServ.showMessage("failed", ["..."]);
            console.log(res.ErrorMessage);
            this.isReceiptLoaded = false;
          }
        });
  }

  CalculateTotalAmounts(billTxnItms) {
    if (billTxnItms && billTxnItms.length > 0) {
      let subTotal: number = 0;
      let totAmount: number = 0;
      let discAmt: number = 0;
      let TaxAmount: number = 0;

      billTxnItms.forEach(itm => {
        subTotal += (itm.SubTotal ? itm.SubTotal : 0);
        totAmount += (itm.TotalAmount ? itm.TotalAmount : 0);
        discAmt += (itm.DiscountAmount ? itm.DiscountAmount : 0);
        TaxAmount += itm.TaxableAmount ? itm.TaxableAmount : 0;
      });

      this.model.SubTotal = CommonFunctions.parseAmount(subTotal);
      this.model.TotalAmount = CommonFunctions.parseAmount(totAmount);
      this.model.TotalDiscount = CommonFunctions.parseAmount(discAmt);
      this.model.TaxAmount = CommonFunctions.parseAmount(TaxAmount);
    }
    else {
      this.model.SubTotal = 0;
      this.model.TotalAmount = 0;
      this.model.TotalDiscount = 0;
      this.model.TaxAmount = 0;
    }
  }

  GetLocalDate(engDate: string): string {
    let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
    return npDate + " BS";
  }

  //we're assigning these values to separate child component afterwards..
  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;


  public print() {

    //Open 'Browser Print' if printer not found or selected printing type is Browser.
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType == ENUM_PrintingType.browser) {
      this.browserPrintContentObj = document.getElementById("divProvisionalSlipPrintPage");
      this.openBrowserPrintWindow = true;
      this.changeDetector.detectChanges();

        this.router.navigate(['/Billing/SearchPatient']);

      //this.router.navigate(['/Billing/SearchPatient']);
    }
    else if (this.selectedPrinter.PrintingType == ENUM_PrintingType.dotmatrix) {
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
          //this.router.navigate(['/Billing/DuplicatePrints']);
          return this.coreService.QzTrayObject.websocket.disconnect();
        });
      //-----qz-tray end----->
    }
    else {
      this.msgBoxServ.showMessage('error', ["Printer Not Supported."]);
      return;
    }

  }


  public headerRightColLen: number = 32;
  public nline: any = '\n';

  public MakeReceipt(): string {
    let totalHeight_lines = this.selectedPrinter.Height_Lines;
    let headerGap_lines = this.selectedPrinter.HeaderGap_Lines;
    let horizontalCols = this.selectedPrinter.Width_Lines;
    let headerLeftColLen = horizontalCols - this.headerRightColLen;
    let finalDataToPrint = '';

    let hlen_SN = 5;
    let hlen_Date = 18;
    let hlen_unit = 5;
    let hlen_price = 10;
    let hlen_amt = 10;
    let hlen_Particular = horizontalCols - (hlen_SN + hlen_unit + hlen_price + hlen_amt + hlen_Date);
    let footerRightColLen = hlen_unit + hlen_price + hlen_amt;
    let footerLeftColLen = horizontalCols - footerRightColLen;

    let addressValue = this.ProvisionalSlipDetails.Address ? this.ProvisionalSlipDetails.Address + "," : "";

    if (this.ProvisionalSlipDetails.CountrySubDivision && this.ProvisionalSlipDetails.CountrySubDivision.CountrySubDivisionName) {
      addressValue += this.ProvisionalSlipDetails.CountrySubDivision.CountrySubDivisionName;
    }
    else {
      addressValue += this.ProvisionalSlipDetails.CountrySubdivisionName;
    }

    let insuranceInfoStr = "";
    if (this.ProvisionalSlipDetails.IsInsuranceBilling) {
      insuranceInfoStr = CommonFunctions.GetTextFIlledToALength('NSHI: ' + this.ProvisionalSlipDetails.Ins_NshiNumber, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Claim Code : ' + this.ProvisionalSlipDetails.ClaimCode, this.headerRightColLen) + this.nline;
    }



    let headerStr = '';

    let invoiceHeaderLabel = "Provisional Slip";
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
    headerStr += CommonFunctions.GetTextCenterAligned(invoiceHeaderLabel, horizontalCols) + this.nline;

    headerStr += CommonFunctions.GetTextFIlledToALength('Hospital No:' + this.ProvisionalSlipDetails.PatientCode, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Print Date: ' + moment(this.CurrentDate).format("YYYY-MM-DD"), this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Patients Name: ' + this.ProvisionalSlipDetails.PatientName, headerLeftColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Address: ' + addressValue, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Age/Sex : ' + this.ProvisionalSlipDetails.Age + '/' + this.ProvisionalSlipDetails.Gender, this.headerRightColLen) + this.nline;
    if (insuranceInfoStr) {
      headerStr += insuranceInfoStr;
    }

    if (this.ProvisionalSlipDetails.PhoneNumber || this.ProvisionalSlipDetails.PANNumber) {
      headerStr += CommonFunctions.GetTextFIlledToALength('Contact No: ' + this.ProvisionalSlipDetails.PhoneNumber, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Purchasers PAN : ' + this.ProvisionalSlipDetails.PANNumber, this.headerRightColLen) + this.nline;
    }

    headerStr += CommonFunctions.GetHorizontalLineOfLength(horizontalCols);

    finalDataToPrint = finalDataToPrint + headerStr + this.nline;

    //Footer Code
    let totAmtInWords = 'In Words : ' + CommonFunctions.GetNumberInWords(this.model.TotalAmount);
    var footerStr = CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
    let footerRightColArr = [CommonFunctions.GetTextFIlledToALength('SubTotal:' + this.model.SubTotal.toString(), footerRightColLen), CommonFunctions.GetTextFIlledToALength('Discount:' + this.model.TotalDiscount.toString(), footerRightColLen),
    CommonFunctions.GetTextFIlledToALength('Total Amount:' + '  ' + this.model.TotalAmount.toString(), footerRightColLen)];

    for (let i = 0; i < footerRightColArr.length; i++) {
      let startLen = i * (footerLeftColLen - 8); //8 is given for gap
      footerStr += CommonFunctions.GetTextFIlledToALength(totAmtInWords.substr(startLen, (footerLeftColLen - 8)), footerLeftColLen) + footerRightColArr[i] + this.nline;
    }


    footerStr += CommonFunctions.GetTextFIlledToALength('User:  ' + this.ProvisionalSlipDetails.BillingUser, footerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Time: ' + moment(this.CurrentDate).format("HH:mm"), footerRightColLen) + this.nline;
    if (this.provSlipFooterParam.ShowFooter) {
      footerStr += CommonFunctions.GetTextCenterAligned(
        this.provSlipFooterParam.EnglishText,
        horizontalCols
      );
    }

    //items listing table
    var tableHead = CommonFunctions.GetTextFIlledToALength('Sn.', hlen_SN) + CommonFunctions.GetTextFIlledToALength('Entry Date', hlen_Date) +
      CommonFunctions.GetTextFIlledToALength('Particular(s)', hlen_Particular) +
      CommonFunctions.GetTextFIlledToALength('Unit', hlen_unit) + CommonFunctions.GetTextFIlledToALength('Price', hlen_price) + CommonFunctions.GetTextFIlledToALength('Amount', hlen_amt) + this.nline;
    var tableBody = '';
    let billItems = this.ProvisionalSlipDetails.ItemsList;
    for (let i = 0; i < billItems.length; i++) {
      var tblRow = '';
      var totalamount = billItems[i].Quantity * billItems[i].Price;

      tblRow += CommonFunctions.GetTextFIlledToALength((i + 1).toString(), hlen_SN)
        + CommonFunctions.GetTextFIlledToALength(moment(billItems[i].CreatedOn).format("YYYY-MM-DD") + ('(PR-' + billItems[i].ProvisionalReceiptNo + ') '), hlen_Date)
        + CommonFunctions.GetTextFIlledToALength(billItems[i].ItemName, hlen_Particular)
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
      if ((i % (totalHeight_lines - (headerGap_lines + 5))) == 0) {
        const preContTxt = this.nline + 'Continue...' + '\x0C';  //this is the command to push the postion to next paper head
        const postContTxt = this.nline + 'Continue...' + CommonFunctions.GetNewLineRepeat(2);
        dataToPrint = dataToPrint + ((i > 0) ? preContTxt : '') + CommonFunctions.GetNewLineRepeat(headerGap_lines) + ((i > 0) ? postContTxt : '');
      }
      dataToPrint = dataToPrint + finalDataToPrintArr[i] + this.nline;
    }
    return dataToPrint;
  }


  //sud:21May'21: Capture the selected printer setting.
  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  OnPrinterChanged($event) {
    this.selectedPrinter = $event;
  }

}
