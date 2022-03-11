import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ENUM_PrintingType, PrinterSettingsModel } from '../../settings-new/printers/printer-settings.model';
import { CommonFunctions } from '../../shared/common.functions';
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from '../../security/shared/security.service';
import { CallbackService } from '../../shared/callback.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { MaternityBLService } from '../shared/maternity.bl.service';
import { MaternityPaymentReceiptModel } from './maternity-payment-receipt.model';
import { Observable, Subscription } from "rxjs";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BillingService } from '../../billing/shared/billing.service';
import { NepaliCalendarService } from '../../shared/calendar/np/nepali-calendar.service';

@Component({
  selector: 'maternity-payment-receipt',
  templateUrl: './maternity-payment-receipt.html',
})
export class MaternityPaymentReceiptComponent {
  @Input("patient-paymentId")
  public patientPaymentId: any;

  @Output("popup-close-action")
  emitCloseAction: EventEmitter<Object> = new EventEmitter<Object>();
  public showPatientSticker: boolean = true;
  public PatientStickerDetails: any = [];
  public time: any;
  public maternityPatientPaymentData: MaternityPaymentReceiptModel = new MaternityPaymentReceiptModel();
  afterPrintAction: EventEmitter<Object> = new EventEmitter<Object>();
  public showServerPrintBtn: boolean = false;
  public showLoading: boolean = false;
  public printerNameSelected: any = null;

  //for QR-specific purpose only--sud.
  public showQrCode: boolean = false;
  public patientQRCodeInfo: string = "";
  public maxFollowUpDays: number = null;
  public doctorOrDepartment: string = null;
  public EnableShowTicketPrice: boolean = false;
  public hospitalCode: string = '';
  public QueueNoSetting = { "ShowInInvoice": false, "ShowInSticker": false };
  public allPrinterName: any = null;
  public showStickerChange: boolean = false;
  public printerName: string = null;
  public showRoomNumber: boolean = false;
  public roomNo: string = null;
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };

  public dotPrinterDimensions: any;
  public printByDotMatrixPrinter: boolean = false;
  public PrinterDisplayName: string = null;
  public PrinterNameDotMatix: string = null;
  public ModelName: string = null;
  public showPrinterChange: boolean = false;
  public billingDotMatrixPrinters: Array<any>;
  public serverPrintFolderPath: any;
  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;
  public defaultFocus: string = null;

  public closePopUpAfterStickerPrint: boolean = true;
  loading: boolean;
  public localDate: any;
  constructor(public maternityBlService: MaternityBLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public securityService: SecurityService,
    public callbackService: CallbackService,
    public changeDetector: ChangeDetectorRef,
    public router: Router,
    public http: HttpClient,
    public billingService: BillingService,
    public nepaliCalendarServ: NepaliCalendarService) {

  }

  ngOnInit() {
    if (this.patientPaymentId > 0) {
      this.GetPatientPaymentDetailByPaymentId(this.patientPaymentId)
    }
  }

  GetPatientPaymentDetailByPaymentId(patientPaymentId: number) {
    this.maternityBlService.GetPatientPaymentDetailByPaymentId(patientPaymentId)
      .subscribe((res) => {
        if (res.Status == 'OK') {
          this.maternityPatientPaymentData = res.Results;
          let date = new Date(this.maternityPatientPaymentData.CreatedOn);
          this.time = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
          var nepDate = this.nepaliCalendarServ.ConvertEngToNepDateString(this.maternityPatientPaymentData.CreatedOn);
          this.localDate = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " (" + nepDate + " BS)";
        }
        else {
          this.msgBoxServ.showMessage('failed', ['Failed to get the payment details. Please try later.']);
        }
      }, (err) => {
        this.msgBoxServ.showMessage('failed', ['Failed to get the payment details. Please try later.']);
      })
  }

  public closeClaimPopup() {
    this.emitCloseAction.emit({ showPrintPopup: true });
  }

  public print() {
    this.coreService.loading = true;
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType == ENUM_PrintingType.browser) {
      this.browserPrintContentObj = document.getElementById("patientprintpage");
      this.openBrowserPrintWindow = false;
      this.changeDetector.detectChanges();
      this.openBrowserPrintWindow = true;
      this.coreService.loading = false;
    } else if (this.selectedPrinter.PrintingType == ENUM_PrintingType.dotmatrix) {
      //-----qz-tray start----->
      this.coreService.QzTrayObject.websocket.connect()
        .then(() => {
          return this.coreService.QzTrayObject.printers.find();
        })
        .then(() => {
          var config = this.coreService.QzTrayObject.configs.create(this.selectedPrinter.PrinterName);
          let printOutType = "bill-receipt";
          let dataToPrint = this.PrintDotMatrix();
          return this.coreService.QzTrayObject.print(config, CommonFunctions.GetEpsonPrintDataForPage(dataToPrint, this.selectedPrinter.mh, this.selectedPrinter.ml, this.selectedPrinter.ModelName));

        })
        .catch(function (e) {
          console.error(e);
        })
        .finally(() => {
          this.coreService.loading = false;
          return this.coreService.QzTrayObject.websocket.disconnect();
        });
      //-----qz-tray end----->
    } else if (this.selectedPrinter.PrintingType == ENUM_PrintingType.server) {

      this.printStickerServer();
      this.coreService.loading = false;
    }
    else {
      this.msgBoxServ.showMessage('error', ["Printer Not Supported."]);
      this.coreService.loading = true;
      return;
    }
  }
  //06April2018 print from server
  printStickerServer() {
    let printContents = document.getElementById("OPDsticker").innerHTML;
    var printableHTML = `<style>
              .opdstickercontainer {
              width: 370px;
              margin: 0px;
              display: block;
              font-size: 13px;
            }
        
            .stkrtopsection {
              width: 100%;
            }
        
           .dptdesc-left {
              width: 80%;
              display: inline-block;
              margin - top: 5px
            }
        
            .opd-qrcode {
              width: 15%;
              display: inline-block;
              vertical-align: top;
              float: right;
              margin: 8px 15px 0 0;
            }
            </style>`;
    printableHTML += '<meta charset="utf-8">';
    printableHTML += '<body>' + printContents + '</body></html>';
    var PrinterName = this.coreService.AllPrinterSettings.find(a => a.PrintingType == 'server' && a.GroupName == 'bill-receipt').PrinterDisplayName;;
    PrinterName += this.PatientStickerDetails.HospitalNo;
    var filePath = this.coreService.AllPrinterSettings.find(a => a.PrintingType == 'server' && a.GroupName == 'bill-receipt').ServerFolderPath;
    var lastCharacter = filePath.substr(filePath.length - 1);
    if (lastCharacter != '\\') {
      filePath += '\\';
    }
    this.loading = true;
    this.showLoading = true;
    this.http.post<any>("/api/Billing?reqType=saveHTMLfile&PrinterName=" + PrinterName + "&FilePath=" + filePath, printableHTML, this.options)
      .map(res => res).subscribe(res => {
        if (res.Status = "OK") {
          this.timerFunction();
        }
        else {
          this.loading = false;
          this.showLoading = false;
        }
      });

    this.AfterPrintAction();
  }

  public printDetaiils: any;

  public headerRightColLen: number = 32;

  public PrintDotMatrix() {
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
    let finalDataToPrint = "";


    let headerStr = '';
    let invoiceHeaderLabel = (this.maternityPatientPaymentData.TransactionType == 'MaternityAllowanceReturn') ? 'Maternity Allowance Return Receipt' : 'Maternity Allowance Payment Receipt';
    headerStr += CommonFunctions.GetTextCenterAligned(invoiceHeaderLabel, horizontalCols) + nline;

    finalDataToPrint = finalDataToPrint + headerStr + nline;


    finalDataToPrint += CommonFunctions.GetTextFIlledToALength("Receipt No:" + this.maternityPatientPaymentData.ReceiptNo, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength(this.localDate ? "Date :" + this.localDate : "", this.headerRightColLen) + nline;
    finalDataToPrint += "Hosp. No:" + this.maternityPatientPaymentData.HospitalNo + nline;
    finalDataToPrint += CommonFunctions.GetTextFIlledToALength("Patient Name:" + this.maternityPatientPaymentData.PatientName, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength("Age/Sex :" + this.maternityPatientPaymentData.Age + "/" + this.maternityPatientPaymentData.Gender, this.headerRightColLen) + nline;
    if (this.maternityPatientPaymentData.TransactionType != 'MaternityAllowanceReturn') {
      finalDataToPrint += "Paid Amount :" + this.maternityPatientPaymentData.OutAmount + nline;
      finalDataToPrint += nline;
      finalDataToPrint += this.coreService.currencyUnit + + this.maternityPatientPaymentData.OutAmount + " paid to " + this.maternityPatientPaymentData.PatientName + " , Hosp. No: " + this.maternityPatientPaymentData.HospitalNo + nline;
      finalDataToPrint += nline;
    }
    else {
      finalDataToPrint += "Return Amount :" + this.maternityPatientPaymentData.InAmount + nline;

      finalDataToPrint += nline;
      finalDataToPrint += this.coreService.currencyUnit + + this.maternityPatientPaymentData.InAmount + " returned from " + this.maternityPatientPaymentData.PatientName + " , Hosp. No: " + this.maternityPatientPaymentData.HospitalNo + nline;
      finalDataToPrint += nline;
    }
    finalDataToPrint += "User: " + this.maternityPatientPaymentData.EmployeeName + " " + "Time: " + this.time + nline;


    let finalDataToPrintArr = finalDataToPrint.split("\n");
    let totalRowsToPrint = finalDataToPrint.split("\n").length - 1; //to get the number of lines
    let dataToPrint = '';

    for (let i = 0; i <= totalRowsToPrint; i++) {
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


  public SetPrinterFromParam() {
    this.printByDotMatrixPrinter = this.coreService.EnableDotMatrixPrintingInRegistration();
    if (this.printByDotMatrixPrinter) {
      if (!this.coreService.billingDotMatrixPrinters || !this.coreService.billingDotMatrixPrinters.length) {
        this.coreService.billingDotMatrixPrinters = this.coreService.GetBillingDotMatrixPrinterSettings();
      }

      this.billingDotMatrixPrinters = this.coreService.billingDotMatrixPrinters;

      if (!this.billingService.OpdStickerDotMatrixPageDimension) {
        this.billingService.OpdStickerDotMatrixPageDimension = this.coreService.GetDotMatrixPrinterDimensions(); //1 is for ins billing
      }

      this.dotPrinterDimensions = this.billingService.OpdStickerDotMatrixPageDimension;

      let prntrInStorage = localStorage.getItem('BillingStickerPrinter');
      if (prntrInStorage) {
        let val = this.billingDotMatrixPrinters.find(p => p.DisplayName == prntrInStorage);
        this.PrinterDisplayName = val ? val.DisplayName : '';
        this.PrinterNameDotMatix = val ? val.PrinterName : '';
      } else {
        this.showPrinterChange = true;
      }
    }
  }

  public ShowPrinterLocationChange() {
    let ptr = this.billingDotMatrixPrinters.find(p => p.DisplayName == this.PrinterDisplayName);
    this.PrinterNameDotMatix = ptr ? ptr.PrinterName : '';
    this.showPrinterChange = true;
  }

  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  OnPrinterChanged($event) {
    this.selectedPrinter = $event;
  }

  //set button for preview
  showHidePrintButton() {
    let params = this.coreService.Parameters;
    params = params.filter(p => p.ParameterName == "showServerPrintBtn");
    let jsonObj = JSON.parse(params[0].ParameterValue);
    let value = jsonObj.OPDSticker;
    if (value == "true") {
      this.showServerPrintBtn = true;
    }
    else {
      this.showServerPrintBtn = false;
    }
  }

  //timer function
  timerFunction() {
    var timer = Observable.timer(10000);
    var sub: Subscription;
    sub = timer.subscribe(t => {
      this.showLoading = false;
    });
  }

  printStickerDotMatrix() {
    if (this.printByDotMatrixPrinter) {
      this.PrintDotMatrix();
      return;
    }
  }

  printStickerClient() {

    let popupWinindow;
    var printContents = document.getElementById("OPDsticker").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = '<html><head>';
    documentContent += `<style>
          .opdstickercontainer {
          width: 370px;
          margin: 0px;
          display: block;
          font-size: 13px;
        }
    
        .stkrtopsection {
          width: 100%;
        }
    
       .dptdesc-left {
          width: 80%;
          display: inline-block;
          margin - top: 5px
        }
    
        .opd-qrcode {
          width: 15%;
          display: inline-block;
          vertical-align: top;
          float: right;
          margin: 8px 15px 0 0;
        }
        </style>`;
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    /// documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body>' + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();

    let tmr = setTimeout(function () {
      popupWinindow.print();
      popupWinindow.close();
    }, 200);

    this.AfterPrintAction();
  }

  AfterPrintAction() {
    if (this.closePopUpAfterStickerPrint) {
      this.afterPrintAction.emit({ showPatientSticker: false });
    }

  }

  ClosePrintStickerPopup() {
    this.emitCloseAction.emit(true);
  }
}