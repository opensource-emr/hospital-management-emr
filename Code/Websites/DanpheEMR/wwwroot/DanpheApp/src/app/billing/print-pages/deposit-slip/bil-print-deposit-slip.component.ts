import { Component, Input, Output, Injector, ChangeDetectorRef, Inject, EventEmitter } from "@angular/core";

import { BillingDeposit } from '../../shared/billing-deposit.model';

import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { BillingService } from "../../shared/billing.service";
import { BillingBLService } from "../../shared/billing.bl.service";
import { Patient } from "../../../patients/shared/patient.model";
import { CommonFunctions } from "../../../shared/common.functions";
import { CoreService } from "../../../core/shared/core.service";
import * as moment from 'moment/moment';
import { ENUM_PrintingType, PrinterSettingsModel } from "../../../settings-new/printers/printer-settings.model";

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

  @Output("callback-close")
  callbackClose: EventEmitter<Object> = new EventEmitter<Object>();

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

  public defaultFocusPrint: string = null;
  public closePopUpAfterInvoicePrint: boolean = true;

  constructor(public msgBoxService: MessageboxService,
    public billingService: BillingService,
    public coreService: CoreService,
    public nepaliCalendarServ: NepaliCalendarService,
    public billingBLService: BillingBLService,
    public changeDetector: ChangeDetectorRef) {
    //this.SetPrinterFromParam();
  }

  ngOnInit() {
    //this.currencyUnit = this.billingService.currencyUnit;
    if (this.deposit) {
      this.deposit.Amount = CommonFunctions.parseAmount(this.deposit.Amount);
      this.localDate = this.GetLocalDate(this.deposit.CreatedOn);
      this.doaLocalDate = this.GetLocalDate(this.deposit.AdmissionDate);
      this.depositType = this.deposit.DepositType == "Deposit" ? this.deposit.DepositType : "Deposit Refund";
      if (this.depositType == "Deposit Refund") {
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
    let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
    return npDate + " BS";
  }


  print() {
    //Open 'Browser Print' if printer not found or selected printing type is Browser.
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType == ENUM_PrintingType.browser) {
      this.openBrowserPrintWindow = false;
      this.changeDetector.detectChanges();
      this.printDetaiils = document.getElementById("printpage");
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
    headerStr += (this.deposit.AdmissionDate ? CommonFunctions.GetTextFIlledToALength('DOA: ' + this.deposit.AdmissionDate + '(' + this.doaLocalDate + ')', headerLeftColLen) : '') + (this.deposit.AdmissionCase ? CommonFunctions.GetTextFIlledToALength('Case: ' + this.deposit.AdmissionCase, this.headerRightColLen) : "") + nline;
    headerStr += nline;

    if (this.deposit && this.deposit.Address) {
      headerStr += CommonFunctions.GetTextFIlledToALength('Address: ' + this.deposit.Address, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength((!this.depositFlag ? 'Deposited Amount: ' : 'Refund Amount: ') + this.coreService.currencyUnit + this.deposit.Amount.toFixed(2), this.headerRightColLen) + nline;
    } else {
      headerStr += CommonFunctions.GetTextFIlledToALength((!this.depositFlag ? 'Deposited Amount: ' : 'Refund Amount: ') + this.coreService.currencyUnit + this.deposit.Amount.toFixed(2), headerLeftColLen) + nline
    }
    finalDataToPrint = finalDataToPrint + headerStr;

    //body part
    let body = "";
    let depositedByDetail = this.deposit.CareOf ? (!this.depositFlag ? ('Deposit of ' + this.coreService.currencyUnit + this.deposit.Amount.toFixed(2) + ' received from ' + this.deposit.CareOf + ' for ' + this.deposit.PatientName) : "") : (!this.depositFlag ? ('Deposit of ' + this.coreService.currencyUnit + this.deposit.Amount.toFixed(2) + ' received from ' + this.deposit.PatientName) : ('Refund Deposit of ' + this.coreService.currencyUnit + this.deposit.Amount.toFixed(2) + ' to ' + this.deposit.PatientName)) + nline;
    body += depositedByDetail + nline;

    body += 'In Words: ' + CommonFunctions.GetNumberInWords(this.deposit.Amount) + nline;
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
