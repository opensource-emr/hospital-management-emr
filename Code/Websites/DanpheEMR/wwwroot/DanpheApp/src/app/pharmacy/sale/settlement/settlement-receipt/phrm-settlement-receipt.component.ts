import { Component, Input, Output, Injector, ChangeDetectorRef, Inject } from "@angular/core";
import { EventEmitter, OnInit } from "@angular/core"
import { PHRMSettlementModel } from "../../../shared/pharmacy-settlementModel";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { PharmacyBLService } from "../../../shared/pharmacy.bl.service";
import { NepaliCalendarService } from "../../../../shared/calendar/np/nepali-calendar.service";
import { PharmacyService } from "../../../shared/pharmacy.service";
import { CommonFunctions } from "../../../../shared/common.functions";
import { ENUM_PrintingType, PrinterSettingsModel } from "../../../../settings-new/printers/printer-settings.model";
import { CoreService } from "../../../../core/shared/core.service";
import { DanpheHTTPResponse } from "../../../../shared/common-models";
import { SecurityService } from "../../../../security/shared/security.service";


@Component({
    selector: 'phrm-settlement-receipt',
    templateUrl: './phrm-settlement-receipt.html'
})
export class PHRMSettlementReceiptComponent {
    @Input("settlementInfo")
    public settlementInfo: PHRMSettlementModel;

    
    @Input("showReceipt")
    public showReceipt: boolean;
    public localDate: string;
    //public currencyUnit: string;
    public totalCrAmount: number = 0;

    @Output("close-receipt")
    public receiptClosed: EventEmitter<boolean> = new EventEmitter<boolean>();

    public headerRightColLen: number = 32;
    public nline: any = '\n';

    //we're assigning these values to separate child component afterwards..
    public openBrowserPrintWindow: boolean = false;
    public browserPrintContentObj: any;

    

    constructor(public msgBoxService: MessageboxService,
        public pharmacyBLService: PharmacyBLService,
        public nepaliCalendarServ: NepaliCalendarService,
        public pharmacyService: PharmacyService,
        public coreService: CoreService,
        public changeDetector: ChangeDetectorRef,
        public securityService:SecurityService) {

    }

    ngOnInit() {
        //this.currencyUnit = this.pharmacyService.currencyUnit;
        if (this.settlementInfo) {
            this.localDate = this.GetLocalDate(this.settlementInfo.CreatedOn);
            if (this.settlementInfo.PHRMInvoiceTransactions) {
                this.settlementInfo.PHRMInvoiceTransactions.forEach(bil => {
                    this.totalCrAmount += bil.TotalAmount;
                });
                this.totalCrAmount = CommonFunctions.parseAmount(this.totalCrAmount);
            }
        }

        

        this.settlementInfo.Patient.ShortName = this.settlementInfo.Patient.FirstName
            + " " + (this.settlementInfo.Patient.MiddleName == null ? "" : this.settlementInfo.Patient.MiddleName)
            + " " + (this.settlementInfo.Patient.LastName);
    }

    
    GetLocalDate(engDate: string): string {
        let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
        return npDate + " BS";
    }
    print() {

        //Open 'Browser Print' if printer not found or selected printing type is Browser.
        if (!this.selectedPrinter || this.selectedPrinter.PrintingType == ENUM_PrintingType.browser) {
            this.browserPrintContentObj = document.getElementById("printpage").innerHTML;
            this.pharmacyBLService.UpdateSettlementPrintCount(this.settlementInfo.SettlementId)
                .subscribe(res => {

                });
            this.openBrowserPrintWindow = true;
            this.changeDetector.detectChanges();
        }
        else if (this.selectedPrinter.PrintingType == ENUM_PrintingType.dotmatrix) {
            //-----qz-tray start----->
            this.coreService.QzTrayObject.websocket.connect()
                .then(() => {
                    return this.coreService.QzTrayObject.printers.find();
                })
                .then(() => {
                    var config = this.coreService.QzTrayObject.configs.create(this.selectedPrinter.PrinterName);

                   // let dataToPrint = this.MakeReceipt();
                    let dataToPrint = null;
                    return this.coreService.QzTrayObject.print(config, CommonFunctions.GetEpsonPrintDataForPage(dataToPrint, this.selectedPrinter.mh, this.selectedPrinter.ml, this.selectedPrinter.ModelName));

                })
                .catch(function (e) {
                    console.error(e);
                })
                .finally(() => {
                    this.CloseReceipt();
                    return this.coreService.QzTrayObject.websocket.disconnect();
                });
            //-----qz-tray end----->
        }
        else {
            this.msgBoxService.showMessage('error', ["Printer Not Supported."]);
            return;
        }
    }

    MakeReceipt() {
        // let totalHeight_lines = this.selectedPrinter.Height_Lines;
        // let headerGap_lines = this.selectedPrinter.HeaderGap_Lines;
        // let horizontalCols = this.selectedPrinter.Width_Lines;
        // let headerLeftColLen = horizontalCols - this.headerRightColLen;
        // let finalDataToPrint = '';

        // var hlen_SN = 4;
        // var hlen_unit = 6;
        // var hlen_rate = 7;
        // var hlen_amt = 9;
        // var hlen_expiry = 12;
        // var hlen_Particular = horizontalCols - (hlen_SN + hlen_unit + hlen_rate + hlen_amt + hlen_expiry);
        // let footerRightColLen = hlen_expiry + hlen_rate + hlen_amt;
        // let footerLeftColLen = horizontalCols - footerRightColLen;

        // let headerStr = '';
        // this.receipt.InvoiceCode = 'PH';
        // let duplicatePrintString = this.receipt.PrintCount > 0 ? ' | COPY(' + this.receipt.PrintCount + ') OF ORIGINAL' : '';
        // if (this.receipt.IsReturned == true) {
        //     headerStr += CommonFunctions.GetTextCenterAligned('CreditNote' + duplicatePrintString, horizontalCols) + this.nline;
        //     headerStr += CommonFunctions.GetTextFIlledToALength('CRN.No: ' + this.receipt.CurrentFinYear + '-' + 'CR' + '-' + this.receipt.InvoiceCode + this.receipt.CRNNo, headerLeftColLen)
        // }
        // else {
        //     headerStr += CommonFunctions.GetTextCenterAligned('Invoice' + duplicatePrintString, horizontalCols) + this.nline;
        //     headerStr += CommonFunctions.GetTextFIlledToALength('Inv.No: ' + this.receipt.CurrentFinYear + '-' + this.receipt.InvoiceCode + this.receipt.ReceiptPrintNo, headerLeftColLen)
        // }
        // headerStr += CommonFunctions.GetTextFIlledToALength('Date: ' + moment(this.receipt.ReceiptDate).format("YYYY-MM-DD"), this.headerRightColLen) + this.nline;
        // headerStr += CommonFunctions.GetTextFIlledToALength('Hosp.No:' + this.receipt.Patient.PatientCode, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('(' + this.receipt.localReceiptdate + ')', this.headerRightColLen) + this.nline;
        // headerStr += CommonFunctions.GetTextFIlledToALength('Patient: ' + this.receipt.Patient.ShortName, headerLeftColLen)
        // if (this.receipt.Patient.PatientId > 0) {
        //     headerStr += CommonFunctions.GetTextFIlledToALength('Age/Sex : ' + this.finalAge + '/' + this.receipt.Patient.Gender, this.headerRightColLen) + this.nline;
        //     headerStr += CommonFunctions.GetTextFIlledToALength('Address: ' + this.receipt.Patient.CountrySubDivisionName, headerLeftColLen);
        // }
        // headerStr += CommonFunctions.GetTextFIlledToALength('Method of payment: ' + this.receipt.PaymentMode, this.headerRightColLen) + this.nline;
        // if (this.receipt.ProviderName != null) {
        //     headerStr += CommonFunctions.GetTextFIlledToALength('Provider Name: ' + this.receipt.ProviderName, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('NMCNumber: ' + ((this.receipt.ProviderNMCNumber != null) ? this.receipt.ProviderNMCNumber : 'N/A'), this.headerRightColLen) + this.nline;
        // }

        // if (this.receipt.Patient.PhoneNumber) {
        //     headerStr += CommonFunctions.GetTextFIlledToALength('Contact No: ' + this.receipt.Patient.PhoneNumber, headerLeftColLen) + this.nline;
        // }
        // if (this.receipt.Patient.PANNumber) {
        //     headerStr += CommonFunctions.GetTextFIlledToALength('Purchasers PAN : ' + this.receipt.Patient.PANNumber, this.headerRightColLen) + this.nline;
        // }
        // if (this.receipt.IsReturned == true)
        //     headerStr += CommonFunctions.GetTextFIlledToALength('Ref. No: ' + this.receipt.ReceiptPrintNo, this.headerRightColLen) + this.nline;
        // if (this.IsCurrentDispensaryInsurace == true) {
        //     headerStr += CommonFunctions.GetTextFIlledToALength('Claim Code: ' + this.receipt.ClaimCode, headerLeftColLen);
        //     headerStr += CommonFunctions.GetTextFIlledToALength('NSHI: ' + this.receipt.Patient.NSHINumber, this.headerRightColLen) + this.nline;
        // }
        // headerStr += CommonFunctions.GetHorizontalLineOfLength(horizontalCols);

        // finalDataToPrint = finalDataToPrint + headerStr + this.nline;

        // //Footer Code
        // let totAmtInWords = 'In Words : ' + CommonFunctions.GetNumberInWords(this.receipt.TotalAmount);
        // var footerStr = CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
        // let footerRightColArr = [CommonFunctions.GetTextFIlledToALength('Total Amount:' + '  ' + this.receipt.TotalAmount.toString(), footerRightColLen)];

        // for (let i = 0; i < footerRightColArr.length; i++) {
        //     let startLen = i * (footerLeftColLen - 8); //8 is given for gap
        //     footerStr += CommonFunctions.GetPHRMTextFIlledToALengthForParticulars(totAmtInWords, footerLeftColLen, 0) + footerRightColArr[i] + this.nline;
        // }
        // footerStr += CommonFunctions.GetTextFIlledToALength('User:  ' + this.receipt.BillingUser, footerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Time: ' + moment(this.receipt.ReceiptDate).format("HH:mm"), footerRightColLen);


        // //items listing table
        // var tableHead = CommonFunctions.GetTextFIlledToALength('Sn.', hlen_SN) + CommonFunctions.GetTextFIlledToALength('Particular(s)', hlen_Particular)
        // tableHead += CommonFunctions.GetTextFIlledToALength('Qty', hlen_unit)

        // tableHead += CommonFunctions.GetTextFIlledToALength('Expiry', hlen_expiry) + CommonFunctions.GetTextFIlledToALength('RATE', hlen_rate)
        // tableHead += CommonFunctions.GetTextFIlledToALength('Amount', hlen_amt) + this.nline;
        // var tableBody = '';
        // let invoiceitems = this.receipt.InvoiceItems;
        // for (let i = 0; i < invoiceitems.length; i++) {
        //     var tblRow = '';
        //     var totalamount = invoiceitems[i].Quantity * invoiceitems[i].MRP;
        //     invoiceitems[i].ExpiryDate = moment(invoiceitems[i].ExpiryDate).format("YYYY-MM-DD")
        //     tblRow += CommonFunctions.GetTextFIlledToALength((i + 1).toString(), hlen_SN)
        //         + CommonFunctions.GetPHRMTextFIlledToALengthForParticulars(invoiceitems[i].ItemName, hlen_Particular, (hlen_SN - 1))
        //     if (this.receipt.IsReturned == true) {
        //         tblRow += CommonFunctions.GetTextFIlledToALength(invoiceitems[i].ReturnedQty.toString(), hlen_unit)
        //     }
        //     else {
        //         tblRow += CommonFunctions.GetTextFIlledToALength(invoiceitems[i].Quantity.toString(), hlen_unit)
        //     }
        //     tblRow += CommonFunctions.GetTextFIlledToALength(invoiceitems[i].ExpiryDate.toString(), hlen_expiry)
        //         + CommonFunctions.GetTextFIlledToALength(invoiceitems[i].MRP.toString(), hlen_rate)
        //     if (this.IsitemlevlDis == true && this.receipt.IsReturned == true && this.showDis == true) {
        //         tblRow += CommonFunctions.GetTextFIlledToALength(invoiceitems[i].DiscountAmount.toString(), hlen_amt) + this.nline;
        //     }
        //     tblRow += CommonFunctions.GetTextFIlledToALength(invoiceitems[i].TotalAmount.toString(), hlen_amt) + this.nline;

        //     tableBody = tableBody + tblRow;
        // }


        // finalDataToPrint = finalDataToPrint + tableHead + tableBody + footerStr;

        // let finalDataToPrintArr = finalDataToPrint.split("\n");
        // let totalRowsToPrint = finalDataToPrint.split("\n").length - 1; //to get the number of lines
        // let dataToPrint = '';

        // for (let i = 0; i <= totalRowsToPrint; i++) {
        //     // subtracted 2 for continue
        //     if ((i % (totalHeight_lines - (headerGap_lines + 5))) == 0) {
        //         const preContTxt = this.nline + 'Continue...' + '\x0C';  //this is the command to push the postion to next paper head
        //         const postContTxt = this.nline + 'Continue...' + CommonFunctions.GetNewLineRepeat(2);
        //         dataToPrint = dataToPrint + ((i > 0) ? preContTxt : '') + CommonFunctions.GetNewLineRepeat(headerGap_lines) + ((i > 0) ? postContTxt : '');
        //     }
        //     dataToPrint = dataToPrint + finalDataToPrintArr[i] + this.nline;
        // }
        // return dataToPrint;
    }

    public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
    OnPrinterChanged($event) {
        this.selectedPrinter = $event;
    }

    CloseReceipt() {
        this.showReceipt = false;
        this.settlementInfo = new PHRMSettlementModel();
        this.receiptClosed.emit(true);
    }
}