import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";

import { BillingDeposit } from '../../shared/billing-deposit.model';

import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { ENUM_PrintingType, PrinterSettingsModel } from "../../../settings-new/printers/printer-settings.model";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_BillDepositType, ENUM_DateTimeFormat, } from '../../../shared/shared-enums';
import { BillingBLService } from "../../shared/billing.bl.service";
import { BillingService } from "../../shared/billing.service";

@Component({
  selector: 'bil-print-deposit-slip',
  templateUrl: './bil-print-deposit-slip.html',
  styles: [`table.pat-data-tbl tbody tr td{
    border: none !important;
  }`]
})

export class DepositReceiptComponent {
  @Input("deposit")
  public deposit: BillingDeposit;

  @Input("showReceipt")
  public showReceipt: boolean;

  @Input('from-ADT-prints')
  public isPrintFromADT: boolean = false;

  @Input('admissionDate')
  public AdmissionDate: string = null;

  @Input('admissionCase')
  public AdmissionCase: string = null;

  @Output("callback-close")
  callbackClose: EventEmitter<Object> = new EventEmitter<Object>();
  public DateTimeNow: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);


  public depositFlag: boolean = false; //yubraj 4th Feb '19 //used while displaying receipt header either Deposit or Refund
  public localDate: string;
  public doaLocalDate: string;
  //public currencyUnit: string;
  public depositType: string;
  public printDetaiils: any;
  // public Enable_Dotmatrix_Printer: boolean;
  // public printerNameSelected: any = null;
  // public printerName: string = null;
  // public modelName: string = null;
  // public showPrinterChange: boolean = false;
  // public dotPrinterDimensions: any;
  // public billingDotMatrixPrinters: any;

  public headerRightColLen: number = 32;
  public nline: any = '\n';

  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;

  public EnableEnglishCalendarOnly: boolean = false;
  public defaultFocusPrint: string = null;
  public closePopUpAfterInvoicePrint: boolean = true;
  public headerDetail: { hospitalName, address, email, tel };
  public InvoiceDisplaySettings: any = { ShowHeader: true, ShowQR: true, ShowHospLogo: true, ShowPriceCategory: false, HeaderType: '' };


  constructor(public msgBoxService: MessageboxService,
    public billingService: BillingService,
    public coreService: CoreService,
    public nepaliCalendarServ: NepaliCalendarService,
    public billingBLService: BillingBLService,
    public changeDetector: ChangeDetectorRef) {

    this.InvoiceDisplaySettings = this.coreService.GetInvoiceDisplaySettings();
    this.GetCalendarParameter();

    let paramValue = this.coreService.Parameters.find(a => a.ParameterName === 'CustomerHeader').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    //this.SetPrinterFromParam();
  }

  GetCalendarParameter(): void {
    const param = this.coreService.Parameters.find(p => p.ParameterGroupName === "Common" && p.ParameterName === "EnableEnglishCalendarOnly");
    if (param && param.ParameterValue) {
      const paramValue = JSON.parse(param.ParameterValue);
      this.EnableEnglishCalendarOnly = paramValue;
    }
  }
  ngOnInit() {
    //this.currencyUnit = this.billingService.currencyUnit;
    if (this.deposit) {
      this.deposit.InAmount = CommonFunctions.parseAmount(this.deposit.InAmount);
      this.deposit.OutAmount = CommonFunctions.parseAmount(this.deposit.OutAmount);
      this.localDate = this.GetLocalDate(this.deposit.CreatedOn);
      this.doaLocalDate = this.AdmissionDate ? this.GetLocalDate(this.AdmissionDate) : null;
      this.depositType = this.deposit.TransactionType == ENUM_BillDepositType.Deposit ? this.deposit.TransactionType : ENUM_BillDepositType.ReturnDeposit;
      if (this.depositType == ENUM_BillDepositType.ReturnDeposit) {
        this.depositFlag = true;
      }
      else {
        this.depositFlag = false;
      }
      this.changeDetector.detectChanges();

      let adtVal = this.coreService.Parameters.find(p => p.ParameterGroupName == 'ADT' && p.ParameterName == 'AdmissionPrintSettings');
      let params = JSON.parse(adtVal && adtVal.ParameterValue);
      if (params) {
        this.defaultFocusPrint = params.DefaultFocus;
        this.closePopUpAfterInvoicePrint = params.closePopUpAfterInvoicePrint;
      }
      //this.focusOnPrint()
      this.SetFocusOnButton('btn_PrintReceipt');
    }
  }

  GetLocalDate(engDate: string): string {
    if (this.EnableEnglishCalendarOnly) {
      return null;
    } else {
      let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
      //return npDate + " BS";
      return `(${npDate} BS)`;
    }
  }


  print() {
    //Open 'Browser Print' if printer not found or selected printing type is Browser.
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType == ENUM_PrintingType.browser) {
      this.openBrowserPrintWindow = false;
      this.changeDetector.detectChanges();
      this.printDetaiils = document.getElementById("printDepositReceiptPage");
      this.openBrowserPrintWindow = true;
      //this.Close();

    }
    else if (this.selectedPrinter.PrintingType == ENUM_PrintingType.dotmatrix) {
      this.coreService.QzTrayObject.websocket.connect()
        .then(() => {
          return this.coreService.QzTrayObject.printers.find();
        })
        .then(() => {
          var config = this.coreService.QzTrayObject.configs.create(this.selectedPrinter.PrinterName);
          let dataToPrint = this.MakeReceipt();
          return this.coreService.QzTrayObject.print(config, CommonFunctions.GetEpsonPrintDataForPage(dataToPrint, this.selectedPrinter.mh, this.selectedPrinter.ml));
        })
        .catch(function (e) {
          console.error(e);
        })
        .finally(() => {
          this.callBackBillPrint();
          return this.coreService.QzTrayObject.websocket.disconnect();
        });
    }
    else {
      this.msgBoxService.showMessage('error', ["Printer Not Supported."]);
    }

  }
  callBackBillPrint() {
    //add 1 to existing printcount.
    this.billingBLService.UpdateDepositPrintCount(this.deposit.DepositId)
      .subscribe().unsubscribe();

    this.Close();
  }
  SetFocusOnButton(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
    }
  }

  Close() {
    this.callbackClose.emit({});
  }

  public MakeReceipt() {
    let totalHeight_lines = this.selectedPrinter.Height_Lines;
    let headerGap_lines = this.selectedPrinter.HeaderGap_Lines;
    let horizontalCols = this.selectedPrinter.Width_Lines;
    let headerLeftColLen = horizontalCols - this.headerRightColLen;
    let hlen_SN = 8;
    let hlen_unit = 8;
    let hlen_price = 10;
    let hlen_amt = 10;
    let hlen_Particular = horizontalCols - (hlen_SN + hlen_unit + hlen_price + hlen_amt);
    let footerRightColLen = hlen_unit + hlen_price + hlen_amt;
    let footerLeftColLen = horizontalCols - footerRightColLen;
    let nline = '\n';
    let finalDataToPrint = '';


    let headerStr = '';
    let duplicatePrintString = this.deposit.PrintCount > 0 ? ' | COPY(' + this.deposit.PrintCount + ') OF ORIGINAL' : '';
    headerStr += CommonFunctions.GetTextCenterAligned(this.depositType + duplicatePrintString, horizontalCols) + nline;

    headerStr += CommonFunctions.GetTextFIlledToALength('Receipt No: ' + this.deposit.FiscalYear + '-' + this.deposit.ReceiptNo, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Date: ' + moment(this.deposit.CreatedOn).format("YYYY-MM-DD") + '(' + this.localDate + ')', this.headerRightColLen) + nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Hospital No: ' + this.deposit.PatientCode, headerLeftColLen) + (this.deposit.InpatientpNumber ? CommonFunctions.GetTextFIlledToALength('Inpatient No: ' + this.deposit.InpatientpNumber, this.headerRightColLen) : '') + nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Patients Name: ' + this.deposit.PatientName, headerLeftColLen) + (this.deposit.PhoneNumber ? CommonFunctions.GetTextFIlledToALength('Phone No: ' + this.deposit.PhoneNumber, this.headerRightColLen) : "") + nline;
    headerStr += (this.AdmissionDate ? CommonFunctions.GetTextFIlledToALength('DOA: ' + this.AdmissionDate + '(' + this.doaLocalDate + ')', headerLeftColLen) : '') + (this.AdmissionCase ? CommonFunctions.GetTextFIlledToALength('Case: ' + this.AdmissionCase, this.headerRightColLen) : "") + nline;
    headerStr += nline;

    if (this.deposit && this.deposit.Address) {
      headerStr += CommonFunctions.GetTextFIlledToALength('Address: ' + this.deposit.Address, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength((!this.depositFlag ? 'Deposited Amount: ' : 'Refund Amount: ') + this.coreService.currencyUnit + (!this.depositFlag ? this.deposit.InAmount.toFixed(2) : this.deposit.OutAmount.toFixed(2)), this.headerRightColLen) + nline;
    } else {
      headerStr += CommonFunctions.GetTextFIlledToALength((!this.depositFlag ? 'Deposited Amount: ' : 'Refund Amount: ') + this.coreService.currencyUnit + this.deposit.OutAmount.toFixed(2), headerLeftColLen) + nline
    }
    finalDataToPrint = finalDataToPrint + headerStr;

    //body part
    let body = "";
    let depositedByDetail = this.deposit.CareOf ? (!this.depositFlag ? ('Deposit of ' + this.coreService.currencyUnit + this.deposit.InAmount.toFixed(2) + ' received from ' + this.deposit.CareOf + ' for ' + this.deposit.PatientName) : "") : (!this.depositFlag ? ('Deposit of ' + this.coreService.currencyUnit + this.deposit.InAmount.toFixed(2) + ' received from ' + this.deposit.PatientName) : ('Refund Deposit of ' + this.coreService.currencyUnit + this.deposit.OutAmount.toFixed(2) + ' to ' + this.deposit.PatientName)) + nline;
    body += depositedByDetail + nline;

    // body += 'In Words: ' + CommonFunctions.GetNumberInWords(this.deposit.Amount) + nline;
    body += 'In Words: ' + (!this.depositFlag ? CommonFunctions.GetNumberInWords(this.deposit.InAmount) : CommonFunctions.GetNumberInWords(this.deposit.OutAmount)) + nline;
    body += CommonFunctions.GetTextFIlledToALength('Deposit Balance: ' + this.deposit.DepositBalance.toFixed(2), headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Payment Mode: ' + this.deposit.PaymentMode, this.headerRightColLen) + nline;
    if (this.deposit.PaymentDetails) { body += CommonFunctions.GetTextFIlledToALength('Payment Details: ' + this.deposit.PaymentDetails, horizontalCols) + nline; }
    if (this.deposit.Remarks) { body += CommonFunctions.GetTextFIlledToALength('Remarks: ' + this.deposit.Remarks, horizontalCols) + nline; }
    finalDataToPrint = finalDataToPrint + body;

    finalDataToPrint += CommonFunctions.GetTextFIlledToALength('User:  ' + this.deposit.BillingUser, footerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Time: ' + moment(this.deposit.CreatedOn).format("HH:mm"), footerRightColLen) + nline;


    let finalDataToPrintArr = finalDataToPrint.split("\n");
    let totalRowsToPrint = finalDataToPrint.split("\n").length - 1; //to get the number of lines
    let dataToPrint = '';

    for (let i = 0; i <= totalRowsToPrint - 1; i++) {
      //subtracted 2 for continue
      if ((i % (totalHeight_lines - (headerGap_lines + 5))) == 0) {
        const preContTxt = nline + 'Continue...' + '\x0C';  //this is the command to push the postion to next paper head
        const postContTxt = nline + 'Continue...' + CommonFunctions.GetNewLineRepeat(2);
        dataToPrint = dataToPrint + ((i > 0) ? preContTxt : '') + CommonFunctions.GetNewLineRepeat(headerGap_lines) + ((i > 0) ? postContTxt : '');
      }
      dataToPrint = dataToPrint + finalDataToPrintArr[i] + nline;
    }

    return dataToPrint;
  }




  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  OnPrinterChanged($event) {
    this.selectedPrinter = $event;
  }


  focusOnPrint() {
    this.changeDetector.detectChanges();
    if (this.deposit) {
      let btnObj = document.getElementById('btnAdtSticker');
      if (btnObj && this.defaultFocusPrint.toLowerCase() == 'deposit') {
        btnObj.focus();
      }
    }
  }
}
