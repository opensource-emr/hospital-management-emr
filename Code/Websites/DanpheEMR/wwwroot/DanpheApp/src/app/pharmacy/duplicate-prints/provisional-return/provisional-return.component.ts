import { ChangeDetectorRef, Component } from '@angular/core';
import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { PHRMInvoiceItemsModel } from '../../shared/phrm-invoice-items.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PHRMPatient } from '../../shared/phrm-patient.model';
import * as moment from 'moment/moment';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { PrinterSettingsModel } from '../../../settings-new/printers/printer-settings.model';
import { CommonFunctions } from '../../../shared/common.functions';
import { CoreService } from '../../../core/shared/core.service';
import { ENUM_PrintingType } from '../../../settings-new/printers/printer-settings.model';
@Component({
    templateUrl: './provisional-return.html'
})
export class PHRMProvisionalReturnComponent {

    public ProvisionalReturnListGrid: any;
    public provisionalBillsSummary: Array<any> = [];
    public provisionalBillFiltered: Array<any> = [];
    public remarks: string = null;
    public isPrint: boolean = false;
    public currSaleItemsRetOnly: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();
    public fromDate: string = null;
    public toDate: string = null;
    public dateRange: string = "last1Week";
    public total: number = 0;
    public showSaleItemsPopup: boolean = false;
    public currentPatient: PHRMPatient = new PHRMPatient();
    public TransactionDate: string = null;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

    public headerRightColLen: number = 32;
    public nline: any = '\n';

    //we're assigning these values to separate child component afterwards..
    public openBrowserPrintWindow: boolean = false;
    public browserPrintContentObj: any;

    constructor(public pharmacyBLService: PharmacyBLService,
        public msgBoxServ: MessageboxService,
        public coreService: CoreService,
        public changeDetector: ChangeDetectorRef) {
        this.ProvisionalReturnListGrid = PHRMGridColumns.ProvisionalReturnList;
        this.fromDate = moment().format('YYYY-MM-DD');
        this.toDate = moment().format('YYYY-MM-DD');
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('LastCreditBillDate', false));
        // this.GetAllProvisionalReturn();
    }
    //must be implemented later in dispensary model
    //gets summary of all patients
    // GetAllProvisionalReturn(): void {
    //     try {
    //         this.pharmacyBLService.GetAllProvisionalReturn(this.fromDate, this.toDate)
    //             .subscribe(res => {
    //                 if (res.Status == 'OK') {
    //                     this.provisionalBillsSummary = res.Results;
    //                     this.provisionalBillFiltered = this.provisionalBillsSummary;
    //                 }
    //                 else {
    //                     this.logError(res.ErrorMessage);
    //                 }
    //             },
    //             );
    //     } catch (exception) {
    //         this.ShowCatchErrMessage(exception);
    //     }

    // }
    logError(err: any) {
        this.msgBoxServ.showMessage("error", [err]);
        console.log(err);
    }

    onGridDateChange($event) {

        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
        if (this.fromDate != null && this.toDate != null) {
            if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
                //this.GetAllProvisionalReturn();
            } else {
                this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
            }

        }

    }

    CreditBillGridActions($event: GridEmitModel) {
        switch ($event.Action) {

            case "view": {
                if ($event.Data != null) {
                    this.currentPatient = new PHRMPatient();
                    let CreditData = $event.Data;
                    this.currentPatient.PatientCode = CreditData.PatientCode;
                    this.currentPatient.ShortName = CreditData.ShortName;
                    this.currentPatient.DateOfBirth = CreditData.DateOfBirth;
                    this.currentPatient.Gender = CreditData.Gender;
                    this.currentPatient.Address = CreditData.Address;
                    this.currentPatient.CountrySubDivisionName = CreditData.CountrySubDivisionName;
                    this.currentPatient.PhoneNumber = CreditData.PhoneNumber;
                    this.currentPatient.PANNumber = CreditData.PANNumber;
                    this.currentPatient.Age = CreditData.Age;
                    this.GetAllProvisionalReturnDuplicatePrint(CreditData.PatientId);
                }
                break;
            }
            default:
                break;
        }
    }
    GetAllProvisionalReturnDuplicatePrint(PatientId) {
        this.pharmacyBLService.GetAllProvisionalReturnDuplicatePrint(PatientId)
            .subscribe((res: DanpheHTTPResponse) => {
                this.CallBackupdaeInvoice(res);
            });
    }

    CallBackupdaeInvoice(res) {
        try {
            if (res.Status == "OK") {
                this.total = 0;
                var resData = res.Results;
                this.currSaleItemsRetOnly = resData;

                this.currSaleItemsRetOnly.forEach(sum => {
                    this.total += sum.TotalAmount;
                });
                this.remarks = "";
                this.TransactionDate = resData[0].CreatedOn;
                this.showSaleItemsPopup = true;
            }
            else {
                // this.messageboxService.showMessage("failed", [res.ErrorMessage]);
                //this.loading = false;
            }
        }
        catch (exception) {
            // this.ShowCatchErrMessage(exception);
        }

    }
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }
    Close() {
        this.showSaleItemsPopup = false;
    }
    // print() {
    //     let popupWinindow;
    //     var printContents = document.getElementById("printpage").innerHTML;
    //     popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    //     popupWinindow.document.open();
    //     //popupWinindow.document.write('<html><head><link href="../assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    //     popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

    //     popupWinindow.document.close();
    //     this.showSaleItemsPopup = false;
    // }

    print() {

        //Open 'Browser Print' if printer not found or selected printing type is Browser.
        if (!this.selectedPrinter || this.selectedPrinter.PrintingType == ENUM_PrintingType.browser) {
            this.browserPrintContentObj = document.getElementById("printpage").innerHTML;
            this.openBrowserPrintWindow = true;
            this.changeDetector.detectChanges();
            this.showSaleItemsPopup = false;
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
                    this.Close();
                    return this.coreService.QzTrayObject.websocket.disconnect();
                });
            //-----qz-tray end----->
        }
        else {
            this.msgBoxServ.showMessage('error', ["Printer Not Supported."]);
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
}
