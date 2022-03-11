import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { BillingBLService } from '../../shared/billing.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { BillingService } from '../../shared/billing.service';
import * as moment from 'moment/moment';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DanpheLoadingInterceptor } from '../../../shared/danphe-loader-intercepter/danphe-loading.services';
import { CoreService } from '../../../core/shared/core.service';
import { BillInvoiceReturnModel } from '../../shared/bill-invoice-return.model';
import { Router } from '@angular/router';
import { CommonFunctions } from '../../../shared/common.functions';
import { NepaliCalendarService } from '../../../shared/calendar/np/nepali-calendar.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { ENUM_PrintingType, PrinterSettingsModel } from '../../../settings-new/printers/printer-settings.model';

@Component({
  selector: 'bill-print-credit-note',
  templateUrl: './bill-print-credit-note.html',
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: DanpheLoadingInterceptor,
    multi: true,
  }]
})

// App Component class
export class Bill_Print_CreditNote_Component {

  @Input('credit-note-number')
  public CreditNoteNumber: number = null;

  @Input('FiscalYearId')
  public FiscalYearId: number = null;

  @Input("redirect-path-after-print")
  redirectUrlPath: string = null;

  public ReturnInvoice: BillInvoiceReturnModel = new BillInvoiceReturnModel();
  public Patient: any = null;
  public BillReturnUserName: string = null;

  public patientQRCodeInfo: string = "";
  public showQrCode: boolean = false;
  public printSize: string = "A4";
  public InvoiceDisplaySettings: any = { ShowHeader: true, ShowQR: true, ShowHospLogo: true };
  public isDataLoaded: boolean = false;

  public loading: boolean = false;


  constructor(
    public BillingBLService: BillingBLService,
    public msgBoxServ: MessageboxService,
    public billingService: BillingService,
    public coreService: CoreService,
    public router: Router,
    public nepaliCalendarServ: NepaliCalendarService,
    public routeFromService: RouteFromService,
    public changeDetector: ChangeDetectorRef) {

    this.InvoiceDisplaySettings = this.coreService.GetInvoiceDisplaySettings();
    //this.SetPrinterFromParam();

  }

  ngOnInit() {
    if (this.CreditNoteNumber && this.FiscalYearId) {
      this.GetCreditNoteByCreditNoteNo(this.CreditNoteNumber, this.FiscalYearId);

    }
    else {
      this.router.navigate(['Billing/DuplicatePrints/InvoiceReturn']);
    }
  }

  ngAfterViewInit() {

  }


  GetCreditNoteByCreditNoteNo(CreditNoteNo: number, fiscalYrId: number) {
    this.BillingBLService.GetCreditNoteByCreditNoteNo(CreditNoteNo, fiscalYrId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.Patient = res.Results.BillReturnTransaction.Patient;
          this.BillReturnUserName = res.Results.UserName;
          this.ReturnInvoice = res.Results.BillReturnTransaction;
          this.ReturnInvoice.ReturnInvoiceItems = res.Results.BillReturnTransactionItems;

          this.patientQRCodeInfo = `Name: ` + this.Patient.ShortName + `
          Age/Sex : `+ this.Patient.Age + `/` + this.Patient.Gender.charAt(0) + `
          Hospital No: `+ '[' + this.Patient.PatientCode + ']' + `
          CRN No: CR` + this.ReturnInvoice.CreditNoteNumber + `
          Ref Invoice No: ` + this.ReturnInvoice.FiscalYear + ` - ` + this.ReturnInvoice.InvoiceCode + this.ReturnInvoice.RefInvoiceNum;

          this.isDataLoaded = true;
          this.coreService.FocusInputById("btnPrintCreditNote");
        }
        else {
          this.msgBoxServ.showMessage("error", ["Unable to fetch Credit Note. Pls try again later.."]);
          console.log(res.ErrorMessage);
          this.isDataLoaded = false;
        }
      },
        err => {
          //add messagebox here..
          this.msgBoxServ.showMessage("error", ["Unable to fetch Credit Note details. Pls try again later.."]);
          console.log(err);
          this.isDataLoaded = false;
        });
  }


  public showPrint: boolean = false;

  //public dotPrinterDimensions: any;
  //public billingDotMatrixPrinters: any;
  public headerRightColLen: number = 32;
  public nline: any = '\n';

  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;

  public print() {
    this.loading = true;
    //Open 'Browser Print' if printer not found or selected printing type is Browser.
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType == ENUM_PrintingType.browser) {
      this.openBrowserPrintWindow = false;
      this.changeDetector.detectChanges();
      this.browserPrintContentObj = document.getElementById("divCreditNotePrintPage");
      this.openBrowserPrintWindow = true;
      this.loading = false;

    }
    else if (this.selectedPrinter.PrintingType == ENUM_PrintingType.dotmatrix) {
      this.coreService.QzTrayObject.websocket.connect()
        .then(() => {
          return this.coreService.QzTrayObject.printers.find();
        })
        .then(() => {
          this.loading = false;
          var config = this.coreService.QzTrayObject.configs.create(this.selectedPrinter.PrinterName);
          let dataToPrint = this.MakeReceipt();
          return this.coreService.QzTrayObject.print(config, CommonFunctions.GetEpsonPrintDataForPage(dataToPrint, this.selectedPrinter.mh, this.selectedPrinter.ml));

        })
        .catch(function (e) {
          console.error(e);
          this.loading = false;
        })
        .finally(() => {
          this.AfterPrintCompleted();
          this.loading = false;
          return this.coreService.QzTrayObject.websocket.disconnect();
        });
    }
    else {
      this.msgBoxServ.showMessage('error', ["Printer Not Supported."]);
      this.loading = false;
    }
  }


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

    let headerStr = '';
    let invName = 'Credit Note';

    var creditNoteDateLocal = this.GetLocalDate(this.ReturnInvoice.CreatedOn);

    headerStr += CommonFunctions.GetTextCenterAligned(invName, horizontalCols) + this.nline;

    headerStr += CommonFunctions.GetTextFIlledToALength('Credit Note No:' + this.ReturnInvoice.FiscalYear + '-' + 'CRN' + this.ReturnInvoice.CreditNoteNumber, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('CRN Date: ' + moment(this.ReturnInvoice.CreatedOn).format("YYYY-MM-DD"), this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Ref. Invoice No:' + this.ReturnInvoice.FiscalYear + '-' + this.ReturnInvoice.InvoiceCode + this.ReturnInvoice.RefInvoiceNum, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('(' + creditNoteDateLocal + ')', this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Hospital No: ' + this.Patient.PatientCode, headerLeftColLen) + CommonFunctions.GetSpaceRepeat(headerLeftColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Patients Name: ' + this.Patient.ShortName, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Age/Sex : ' + this.Patient.Age + '/' + this.Patient.Gender, this.headerRightColLen) + this.nline;

    headerStr += CommonFunctions.GetHorizontalLineOfLength(horizontalCols);

    finalDataToPrint = finalDataToPrint + headerStr + this.nline;

    //Footer Code
    let totAmtInWords = this.ReturnInvoice.TotalAmount != 0 ? 'In Words : ' + CommonFunctions.GetNumberInWords(this.ReturnInvoice.TotalAmount) : '';
    var footerStr = CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
    let footerRightColArr = [CommonFunctions.GetTextFIlledToALength('Total Amount:' + '  ' + this.ReturnInvoice.TotalAmount.toString(), footerRightColLen)];

    for (let i = 0; i < footerRightColArr.length; i++) {
      let startLen = i * (footerLeftColLen - 8); //8 is given for gap
      footerStr += CommonFunctions.GetTextFIlledToALength(totAmtInWords.substr(startLen, (footerLeftColLen - 8)), footerLeftColLen) + footerRightColArr[i] + this.nline;
    }
    footerStr += CommonFunctions.GetTextFIlledToALength('User:  ' + this.BillReturnUserName, footerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Time: ' + moment(this.ReturnInvoice.CreatedOn).format("HH:mm"), footerRightColLen);
    footerStr += this.nline + CommonFunctions.GetTextFIlledToALength('Remarks:  ' + this.ReturnInvoice.Remarks, horizontalCols);


    //items listing table
    var tableHead = CommonFunctions.GetTextFIlledToALength('Sn.', hlen_SN) + CommonFunctions.GetTextFIlledToALength('Particular(s)', hlen_Particular) +
      CommonFunctions.GetTextFIlledToALength('Unit', hlen_unit) + CommonFunctions.GetTextFIlledToALength('Amount', hlen_amt) + this.nline;
    var tableBody = '';
    let billItems = this.ReturnInvoice.ReturnInvoiceItems;
    for (let i = 0; i < billItems.length; i++) {
      var tblRow = '';
      //var totalamount = billItems[i].RetQuantity * billItems[i].Price;

      tblRow += CommonFunctions.GetTextFIlledToALength((i + 1).toString(), hlen_SN)
        + CommonFunctions.GetTextFIlledToALength(billItems[i].ItemName, hlen_Particular)
        + CommonFunctions.GetTextFIlledToALength(billItems[i].RetQuantity.toString(), hlen_unit)
        + CommonFunctions.GetTextFIlledToALength(billItems[i].RetTotalAmount.toString(), hlen_amt) + this.nline;

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

  GetLocalDate(engDate: string): string {
    let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
    return npDate + " BS";
  }

  //sud:21May'21: Capture the selected printer setting.
  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  OnPrinterChanged($event) {
    this.selectedPrinter = $event;
  }

  public AfterPrintCompleted() {
    //this.router.navigate(['/Billing/SearchPatient']);
    //if redirect url path is found, then redirect to that page else go to billing-searchpatient.
    if (this.redirectUrlPath) {
      this.router.navigate([this.redirectUrlPath]);
    }
    else {
      this.router.navigate(['/Billing/SearchPatient']);
    }
  }

}
