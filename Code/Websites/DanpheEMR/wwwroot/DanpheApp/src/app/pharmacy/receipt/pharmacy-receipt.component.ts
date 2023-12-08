import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { Router } from '@angular/router';
import * as moment from 'moment/moment';
import { CoreService } from "../../core/shared/core.service";
import { DispensaryService } from "../../dispensary/shared/dispensary.service";
import { PatientService } from "../../patients/shared/patient.service";
import { ENUM_PrintingType, PrinterSettingsModel } from "../../settings-new/printers/printer-settings.model";
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { CommonFunctions } from "../../shared/common.functions";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { PaymentDetailsPipe } from "../../shared/pipes/payment-details.pipe";
import { RouteFromService } from "../../shared/routefrom.service";
import { ENUM_DanpheHTTPResponses, ENUM_InvoiceReceiptMode, ENUM_MessageBox_Status } from "../../shared/shared-enums";
import { PharmacyBLService } from "../shared/pharmacy.bl.service";
import { PharmacyService } from "../shared/pharmacy.service";
import { PHRMInvoiceReturnItemsModel } from "../shared/phrm-invoice-return-items.model";
import { PHRMInvoiceReturnModel } from "../shared/phrm-invoice-return.model ";
import { PHRMStoreModel } from "../shared/phrm-store.model";
import { PharmacyInvoiceReceipt_DTO } from "./pharmacy-receipt.model";

@Component({
  selector: "pharmacy-receipt",
  templateUrl: "./pharmacy-receipt.html"
})
export class PharmacyReceiptComponent {
  public receipt: PharmacyInvoiceReceipt_DTO = new PharmacyInvoiceReceipt_DTO();
  @Input('receipt-mode') ReceiptMode: string = null;
  @Input("invoice-id") public InvoiceId: number = 0;

  @Input("showPrintBtn")
  public patientQRCodeInfo: string = "";

  //selectedPrinter: any;
  // printerName: any;
  // showPrinterChange: boolean = false;
  // Enable_Dotmatrix_Printer: boolean;
  // dotPrinterDimensions: any;
  public headerRightColLen: number = 32;
  public nline: any = '\n';

  //we're assigning these values to separate child component afterwards..
  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any = { innerHTML: '' };

  PrintReturnReceipt: any;
  IsCurrentDispensaryInsurace: boolean;
  isItemLevelVATApplicable: boolean;
  isMainVATApplicable: boolean;
  isMainDiscountAvailable: boolean;
  public showGenericName: boolean = false;
  public showGenNameAfterItemName: boolean = false;
  public showItemName: boolean = false;
  public LeadingSeparator: string = "";
  currentActiveDispensary: PHRMStoreModel;
  showExpiryDateInPrint: boolean = false;
  showRackNoInPrint: boolean = false;
  

  @Input("BillGenerate") public set billgenerateindex(val: number) {
    this.BillGenerate = val ? val : 1;
  }

  @Output("call-back-print") callBackPrint: EventEmitter<object> = new EventEmitter();
  public BillGenerate: number = 1;
  public patient: any;
  //for show and hide item level discount features
  IsitemlevlDis: boolean = false;
  showDis: boolean;
  public salesReturn: PHRMInvoiceReturnModel = new PHRMInvoiceReturnModel();
  public saleReturnModelList: Array<PHRMInvoiceReturnItemsModel> = new Array<PHRMInvoiceReturnItemsModel>();
  public receiptPrintNo = null;
  showFooter: boolean;
  showEnglish: boolean;
  englishText: string;
  nepaliText: string;
  showNepali: boolean;
  showPrint: boolean;
  printDetaiils: any;
  public pharmacyDotMatrixPrinters: any;
  public showQrCode: boolean = false;
  public isRealPrint: boolean = false;
  public ageOfPatient: string = null;
  public finalAge: string = null;
  public unitOfAge: string = null;
  constructor(public coreService: CoreService,
    public msgserv: MessageboxService,
    public pharmacyBLService: PharmacyBLService, public pharmacyService: PharmacyService,
    public routeFromService: RouteFromService,
    public patientService: PatientService, public nepaliCalendarServ: NepaliCalendarService,

    public router: Router, public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef, public _dispensaryService: DispensaryService) {
    this.checkSalesCustomization();
    this.GetPharmacyInvoiceFooterParameter();
    this.GetDotMatrixParameterSettings();
    this.IsCurrentDispensaryInsurace = this._dispensaryService.isInsuranceDispensarySelected;
    this.currentActiveDispensary = this._dispensaryService.activeDispensary;

    

  }

  callBackBillPrint($event) {
    //add 1 to existing printcount.
    let printCount = this.receipt.PrintCount + 1;
    let invoiceId = this.receipt.InvoiceId;
    this.receiptPrintNo = "PH" + this.receipt.ReceiptPrintNo;
    this.pharmacyBLService.PutPrintCount(printCount, invoiceId).subscribe();
    this.callBackPrint.emit();
  }
  ngOnInit() {
    this.GetPharmacyBillingHeaderParameter();
    this.getPharmacyItemNameDisplaySettings();
    if (this.ReceiptMode) {
      if (this.ReceiptMode === ENUM_InvoiceReceiptMode.Invoice) {
        this.GetInvoiceInfo(this.InvoiceId);
      }
      else {
        this.GetCreditNoteInfo(this.InvoiceId);
      }
    }


    this.patientQRCodeInfo = `Name: ` + this.receipt.PatientInfo.ShortName + `
            Hospital No: `+ '[' + this.receipt.PatientInfo.PatientCode + ']' + `
            Invoice No: ` + this.receipt.CurrentFiscalYearName + ` - PH` + this.receipt.ReceiptPrintNo;
    this.showQrCode = true;
    if (this.receipt.DiscountAmount > 0) {
      this.showDis = true;
    }
    for (let index = 0; index < this.receipt.InvoiceItems.length; index++) {
      if (this.receipt.InvoiceItems[index].DiscountAmount > 0) {
        this.showDis = true;
      }
    }

    //call this to show print button, else it's not showing.. 
    this.changeDetector.detectChanges();
    //set focus on print receipt button
    this.SetFocusOnButton('btnPrintPhrmInvoice');

    this.receipt.PatientInfo.CountrySubDivisionName;
    if (this.receipt.PrintCount == 0) {
      this.unitOfAge = "Y";
      this.finalAge = CommonFunctions.GetFormattedAge(this.receipt.PatientInfo.DateOfBirth);
    }
    else {
      this.unitOfAge = this.receipt.PatientInfo.Age.slice(this.receipt.PatientInfo.Age.length - 1);

      let currentDate = moment().format('YYYY-MM-DD');
      let years = moment(currentDate).diff(moment(this.receipt.PatientInfo.DateOfBirth).format('YYYY-MM-DD'), 'years');
      let totMonths = moment(currentDate).diff(moment(this.receipt.PatientInfo.DateOfBirth).format('YYYY-MM-DD'), 'months');
      let totDays = moment(currentDate).diff(moment(this.receipt.PatientInfo.DateOfBirth).format('YYYY-MM-DD'), 'days');
      //show years if it's above 1.
      if (years >= 0 || totMonths >= 0 || totDays >= 0) {

        if (years >= 1 && this.unitOfAge == "Y") {
          this.ageOfPatient = years.toString() + ' Y';
          this.finalAge = this.ageOfPatient;
        }
        else if (this.unitOfAge == 'M') {
          this.ageOfPatient = totMonths.toString() + 'M';
          this.finalAge = this.ageOfPatient;
        }
        //show days for less than 1 month. 
        else if (this.unitOfAge == "D") {
          if (Number(totDays) == 0)
            totDays = 1;
          this.ageOfPatient = totDays.toString() + 'D';
          this.finalAge = this.ageOfPatient;
        }
        //else show only months for 1 to 35 months (other cases are checked in above conditions).
        else {
          this.ageOfPatient = years.toString() + ' Y';
          this.finalAge = this.ageOfPatient;
        }
      }
    }

  }


  GetInvoiceInfo(InvoiceId) {
    if (InvoiceId > 0) {
      this.pharmacyBLService.GetInvoiceReceiptByInvoiceId(InvoiceId).subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.receipt = res.Results;
          this.updateItemDisplayName(this.showGenericName, this.showItemName, this.LeadingSeparator, this.showGenNameAfterItemName);
        }
        else {
          this.msgserv.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to retrieve invoice information']);
        }
      },
        err => {
          this.msgserv.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to retrieve invoice information' + err.ErrorMessage]);
        });
    }
  }


  GetCreditNoteInfo(InvoiceIdReturnId) {
    if (InvoiceIdReturnId > 0) {
      this.pharmacyBLService.GetSaleReturnInvoiceItemsByInvoiceRetId(InvoiceIdReturnId).subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.receipt = res.Results;
          this.updateItemDisplayName(this.showGenericName, this.showItemName, this.LeadingSeparator, this.showGenNameAfterItemName);
        }
        else {
          this.msgserv.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to retrieve credit note information']);
        }
      },
        err => {
          this.msgserv.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to credit note information' + err.ErrorMessage]);
        });
    }
  }

  SetFocusOnButton(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let btn = <HTMLInputElement>document.getElementById(idToSelect);
      btn.focus();
    }
  }

  ngOnChange() {
    this.patientQRCodeInfo = `Name: ` + this.receipt.PatientInfo.ShortName + `
            Hospital No: `+ '[' + this.receipt.PatientInfo.PatientCode + ']' + `
            Invoice No: ` + this.receipt.CurrentFiscalYearName + ` - PH` + this.receipt.InvoiceId;
    this.showQrCode = true;
  }
  public headerDetail: { hospitalName, address, email, PANno, tel, DDA };

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetPharmacyBillingHeaderParameter() {
    const storeBillHeader = this._dispensaryService.getDispensaryHeader(this.receipt.StoreId)
    if (storeBillHeader != null) {
      this.headerDetail = {
        hospitalName: storeBillHeader.StoreLabel,
        address: storeBillHeader.Address,
        email: storeBillHeader.Email,
        PANno: storeBillHeader.PanNo,
        tel: storeBillHeader.ContactNo,
        DDA: ''
      }
    }
    else {
      // default core cfg parameter header
      var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Pharmacy BillingHeader').ParameterValue;
      if (paramValue)
        this.headerDetail = JSON.parse(paramValue);
      else
        this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }
  }
  //Get Pharmacy Invoice Footer Paramater
  GetPharmacyInvoiceFooterParameter() {
    let InvFooterParameterStr = this.coreService.Parameters.find(p => p.ParameterName == "PharmacyInvoiceFooterNoteSettings" && p.ParameterGroupName == "Pharmacy");
    if (InvFooterParameterStr != null) {
      let FooterParameter = JSON.parse(InvFooterParameterStr.ParameterValue);
      if (FooterParameter.ShowFooter == true) {
        this.showFooter = true;
        if (FooterParameter.ShowEnglish == true) {
          this.showEnglish = true;
          this.englishText = FooterParameter.EnglishText;
        }
        if (FooterParameter.ShowNepali == true) {
          this.showNepali = true;
          this.nepaliText = FooterParameter.NepaliText;
        }
      }
    }
  }

  //check the Sales Page Customization ie enable or disable Vat and Discount;
  checkSalesCustomization() {
    let salesParameterString = this.coreService.Parameters.find(p => p.ParameterName == "SalesFormCustomization" && p.ParameterGroupName == "Pharmacy");
    if (salesParameterString != null) {
      let SalesParameter = JSON.parse(salesParameterString.ParameterValue);
      this.isItemLevelVATApplicable = (SalesParameter.EnableItemLevelVAT == true);
      this.isMainVATApplicable = (SalesParameter.EnableMainVAT == true);
      this.IsitemlevlDis = (SalesParameter.EnableItemLevelDiscount == true);
      this.isMainDiscountAvailable = (SalesParameter.EnableMainDiscount == true);

    }
  }

  CreateCopyForResale() {
    try {
      if (this.receipt.PatientInfo) {
        this.patientService.setGlobal(<any>this.receipt.PatientInfo);
        let returnItems = this.pharmacyService.CreateNewGlobalReturnSaleTransaction();
        returnItems = Object.assign(returnItems, this.receipt.InvoiceItems);
        this.routeFromService.RouteFrom = "returnedBill";
        this.router.navigate(['/Dispensary/Sale/New']);
      } else {
        this.msgBoxServ.showMessage("notice", ['please select patient or items.']);
      }

    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  ShowCatchErrMessage(exception) {
    try {
      if (exception) {
        let ex: Error = exception;
        console.log("Error Messsage =>  " + ex.message);
        console.log("Stack Details =>   " + ex.stack);
      }
    } catch (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }

  public print(idToBePrinted: string = 'printpage') {

    // let testDataToPrint = this.MakeReceipt(); //For testing purpose
    // let testDataTosmallPrint = this.MakeReceipt_Small(); //For testing purpose


    //Open 'Browser Print' if printer not found or selected printing type is Browser.
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType == ENUM_PrintingType.browser) {
      for (var i = 1; i <= this.BillGenerate; i++) {
        this.browserPrintContentObj.innerHTML = this.browserPrintContentObj.innerHTML + document.getElementById(idToBePrinted).innerHTML;
      }
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

          let dataToPrint = this.MakeReceipt();
          return this.coreService.QzTrayObject.print(config, CommonFunctions.GetEpsonPrintDataForPage(dataToPrint, this.selectedPrinter.mh, this.selectedPrinter.ml, this.selectedPrinter.ModelName));

        })
        .catch(function (e) {
          console.error(e);
        })
        .finally(() => {
          this.callBackBillPrint(null);
          return this.coreService.QzTrayObject.websocket.disconnect();
        });
      //-----qz-tray end----->
    }
    else if (this.selectedPrinter.PrintingType == ENUM_PrintingType.receiptDotMatrix) {
      //-----qz-tray start----->
      this.coreService.QzTrayObject.websocket.connect()
        .then(() => {
          return this.coreService.QzTrayObject.printers.find();
        })
        .then(() => {
          var config = this.coreService.QzTrayObject.configs.create(this.selectedPrinter.PrinterName);

          let dataToPrint = this.MakeReceipt_Small();
          return this.coreService.QzTrayObject.print(config, CommonFunctions.GetReceiptDotMatrixPrintDataForPage(dataToPrint, this.selectedPrinter));

        })
        .catch(function (e) {
          console.error(e);
        })
        .finally(() => {
          this.callBackBillPrint(null);
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
    let totalHeight_lines = this.selectedPrinter.Height_Lines;
    let headerGap_lines = this.selectedPrinter.HeaderGap_Lines;
    let horizontalCols = this.selectedPrinter.Width_Lines;
    let headerLeftColLen = horizontalCols - this.headerRightColLen;
    let finalDataToPrint = '';

    var hlen_SN = 4;
    var hlen_unit = 6;
    var hlen_rate = 7;
    var hlen_amt = 9;
    var hlen_expiry = 10;

    if (this.showExpiryDateInPrint && !this.showRackNoInPrint) {
      var hlen_Particular = horizontalCols - (hlen_SN + hlen_unit + hlen_rate + hlen_amt + hlen_expiry);
    }
    else {
      var hlen_Particular = horizontalCols - (hlen_SN + hlen_unit + hlen_rate + hlen_amt);
    }
    let footerRightColLen = hlen_expiry + hlen_rate + hlen_amt;
    let footerLeftColLen = horizontalCols - footerRightColLen;

    let headerStr = '';
    this.receipt.InvoiceCode = 'PH';
    //ramesh: Print Header only if the Flag set in Dispensary level is true
    if (this.currentActiveDispensary.PrintInvoiceHeaderInDotMatrix == true) {
      headerStr += CommonFunctions.GetTextCenterAligned(this.headerDetail.hospitalName, horizontalCols);
      headerStr += CommonFunctions.GetTextCenterAligned(this.headerDetail.address, horizontalCols);
      if (this.headerDetail.tel !== '') {
        headerStr += CommonFunctions.GetTextCenterAligned('Tel :' + this.headerDetail.tel, horizontalCols);
      }
      if (this.headerDetail.PANno !== '') {
        headerStr += CommonFunctions.GetTextCenterAligned('PanNo :' + this.headerDetail.PANno, horizontalCols);
      }
      if (this.headerDetail.DDA !== '') {
        headerStr += CommonFunctions.GetTextCenterAligned('DDA :' + this.headerDetail.DDA, horizontalCols);
      }
      headerStr += CommonFunctions.GetTextCenterAligned('Department Of Pharmacy', horizontalCols) + this.nline + this.nline;
    }
    let duplicatePrintString = this.receipt.PrintCount > 0 ? ' | COPY(' + this.receipt.PrintCount + ') OF ORIGINAL' : '';
    if (this.receipt.IsReturned == true) {
      headerStr += CommonFunctions.GetTextCenterAligned('CreditNote' + duplicatePrintString, horizontalCols) + this.nline;
      headerStr += CommonFunctions.GetTextFIlledToALength('CRN.No: ' + this.receipt.CurrentFiscalYearName + '-' + 'CR' + '-' + this.receipt.InvoiceCode + this.receipt.CreditNoteNo, headerLeftColLen)
    }
    else {
      if (this.receipt.InvoiceId == 0) {
        headerStr += CommonFunctions.GetTextCenterAligned('Provisional Slip' + duplicatePrintString, horizontalCols) + this.nline;
        headerStr += CommonFunctions.GetTextFIlledToALength('Inv.No: ' + this.receipt.CurrentFiscalYearName + '-' + this.receipt.InvoiceCode + this.receipt.ReceiptPrintNo, headerLeftColLen)
      }
      else {
        headerStr += CommonFunctions.GetTextCenterAligned('Invoice' + duplicatePrintString, horizontalCols) + this.nline;
        headerStr += CommonFunctions.GetTextFIlledToALength('Inv.No: ' + this.receipt.CurrentFiscalYearName + '-' + this.receipt.InvoiceCode + this.receipt.ReceiptPrintNo, headerLeftColLen)
      }
    }
    headerStr += CommonFunctions.GetTextFIlledToALength('Date: ' + moment(this.receipt.ReceiptDate).format("YYYY-MM-DD"), this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Hosp.No:' + this.receipt.PatientInfo.PatientCode, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('(' + this.receipt.LocalReceiptDate + ')', this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Patient: ' + this.receipt.PatientInfo.ShortName, headerLeftColLen)
    if (this.receipt.PatientInfo.PatientId > 0) {
      headerStr += CommonFunctions.GetTextFIlledToALength('Age/Sex : ' + this.finalAge + '/' + this.receipt.PatientInfo.Gender, this.headerRightColLen) + this.nline;
      headerStr += CommonFunctions.GetTextFIlledToALength('Address: ' + this.receipt.PatientInfo.Address + ',' + this.receipt.PatientInfo.CountrySubDivisionName, headerLeftColLen);
    }
    headerStr += CommonFunctions.GetTextFIlledToALength('Method of payment: ' + this.receipt.PaymentMode, this.headerRightColLen) + this.nline;
    if (this.receipt.ProviderName != null) {
      headerStr += CommonFunctions.GetTextFIlledToALength('Prescriber: ' + CommonFunctions.SplitStringAndReturnFirstTwoWord(this.receipt.ProviderName), headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('NMCNumber: ' + ((this.receipt.ProviderNMCNumber != null) ? this.receipt.ProviderNMCNumber : 'N/A'), this.headerRightColLen) + this.nline;
    }

    if (this.receipt.PatientInfo.PhoneNumber) {
      headerStr += CommonFunctions.GetTextFIlledToALength('Contact No: ' + this.receipt.PatientInfo.PhoneNumber, headerLeftColLen) + this.nline;
    }
    if (this.receipt.PatientInfo.PANNumber) {
      headerStr += CommonFunctions.GetTextFIlledToALength('Purchasers PAN : ' + this.receipt.PatientInfo.PANNumber, this.headerRightColLen) + this.nline;
    }
    if (this.receipt.IsReturned == true)
      headerStr += CommonFunctions.GetTextFIlledToALength('Ref. No: ' + this.receipt.ReceiptPrintNo, this.headerRightColLen) + this.nline;
    if (this.IsCurrentDispensaryInsurace == true) {
      headerStr += CommonFunctions.GetTextFIlledToALength('Claim Code: ' + this.receipt.ClaimCode, headerLeftColLen);
      // headerStr += CommonFunctions.GetTextFIlledToALength('NSHI: ' + this.receipt.Patient.NSHINumber, this.headerRightColLen) + this.nline;
    }
    if (this.receipt.PolicyNo != null) {
      headerStr += CommonFunctions.GetTextFIlledToALength('SSF PolicyNo: ' + this.receipt.PolicyNo, this.headerRightColLen) + this.nline;
    }
    headerStr += CommonFunctions.GetHorizontalLineOfLength(horizontalCols);

    finalDataToPrint = finalDataToPrint + headerStr + this.nline;

    //Footer Code
    let totAmtInWords = 'In Words : ' + CommonFunctions.GetNumberInWords(CommonFunctions.parseAmount(this.receipt.TotalAmount));
    var footerStr = CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
    let footerRightColArr = [
      CommonFunctions.GetTextFIlledToALength('Subtotal:' + '  ' + CommonFunctions.parseAmount(this.receipt.SubTotal).toString(), footerRightColLen),
      CommonFunctions.GetTextFIlledToALength('Discount:' + '  ' + CommonFunctions.parseAmount(this.receipt.DiscountAmount).toString(), footerRightColLen),
      CommonFunctions.GetTextFIlledToALength('Cash Amt:' + '  ' + CommonFunctions.parseAmount(this.receipt.CashAmount).toString(), footerRightColLen),
      CommonFunctions.GetTextFIlledToALength('Credit Amt:' + '  ' + CommonFunctions.parseAmount(this.receipt.CreditAmount).toString(), footerRightColLen),
      CommonFunctions.GetTextFIlledToALength('Cash Ret Amt:' + '  ' + CommonFunctions.parseAmount(this.receipt.CashAmount).toString(), footerRightColLen),
      CommonFunctions.GetTextFIlledToALength('Credit Ret Amt:' + '  ' + CommonFunctions.parseAmount(this.receipt.CreditAmount).toString(), footerRightColLen),
      CommonFunctions.GetTextFIlledToALength('Total Amt:' + '  ' + CommonFunctions.parseAmount(this.receipt.TotalAmount).toString(), footerRightColLen)
    ];
    for (let i = 0; i < footerRightColArr.length; i++) {
      let startLen = i * (footerLeftColLen - 8); //8 is given for gap
      if (i == 0) {
        footerStr += CommonFunctions.GetPHRMTextFIlledToALengthForParticulars(totAmtInWords, footerLeftColLen, 0) + footerRightColArr[0] + this.nline;
      }
      else if (i == 1 && (this.IsitemlevlDis == true || this.isMainDiscountAvailable == true) && this.showDis == true) {
        footerStr += CommonFunctions.GetPHRMTextFIlledToALengthForParticulars(' ', footerLeftColLen, 0) + footerRightColArr[1] + this.nline;
      }
      else if (i == 2 && !this.receipt.IsReturned) {
        footerStr += CommonFunctions.GetPHRMTextFIlledToALengthForParticulars(' ', footerLeftColLen, 0) + footerRightColArr[2] + this.nline;
      }
      else if (i == 3 && !this.receipt.IsReturned) {
        footerStr += CommonFunctions.GetPHRMTextFIlledToALengthForParticulars(' ', footerLeftColLen, 0) + footerRightColArr[3] + this.nline;
      }
      else if (i == 4 && this.receipt.IsReturned) {
        footerStr += CommonFunctions.GetPHRMTextFIlledToALengthForParticulars(' ', footerLeftColLen, 0) + footerRightColArr[4] + this.nline;
      }
      else if (i == 5 && this.receipt.IsReturned) {
        footerStr += CommonFunctions.GetPHRMTextFIlledToALengthForParticulars(' ', footerLeftColLen, 0) + footerRightColArr[5] + this.nline;
      }
      else if (i == 6) {
        footerStr += CommonFunctions.GetPHRMTextFIlledToALengthForParticulars(' ', footerLeftColLen, 0) + footerRightColArr[6] + this.nline;
      }
    }
    if (!this.receipt.IsReturned && this.receipt.InvoiceId != 0) {
      footerStr += this.getPaymentDetails(this.receipt.PaymentModeDetails) + this.nline;
    }
    footerStr += CommonFunctions.GetTextFIlledToALength('Remarks:  ' + this.receipt.Remarks, footerLeftColLen) + this.nline;
    footerStr += CommonFunctions.GetTextFIlledToALength('User:  ' + this.receipt.BillingUser, footerLeftColLen) + CommonFunctions.GetTextFIlledToALength(' Time: ' + moment(this.receipt.ReceiptDate).format("HH:mm"), footerRightColLen);


    //items listing table
    var tableHead = CommonFunctions.GetTextFIlledToALength('Sn.', hlen_SN) + CommonFunctions.GetTextFIlledToALength('Particular(s)', hlen_Particular)
    tableHead += CommonFunctions.GetTextFIlledToALength('Qty', hlen_unit);
    if (this.showExpiryDateInPrint && !this.showRackNoInPrint) {
      tableHead += CommonFunctions.GetTextFIlledToALength('Expiry. ', hlen_expiry) + CommonFunctions.GetTextFIlledToALength('Rate', hlen_rate);
    }
    else {
      tableHead += CommonFunctions.GetTextFIlledToALength('Rate', hlen_rate);
    }
    tableHead += CommonFunctions.GetTextFIlledToALength('Amount', hlen_amt) + this.nline;
    var tableBody = '';
    let invoiceitems = this.receipt.InvoiceItems;
    for (let i = 0; i < invoiceitems.length; i++) {
      var tblRow = '';
      var totalamount = invoiceitems[i].Quantity * invoiceitems[i].SalePrice;
      invoiceitems[i].ExpiryDate = moment(invoiceitems[i].ExpiryDate).format("YYYY-MM")
      tblRow += CommonFunctions.GetTextFIlledToALength((i + 1).toString(), hlen_SN)
        + CommonFunctions.GetPHRMTextFIlledToALengthForParticulars(invoiceitems[i].ItemDisplayName, (invoiceitems[i].ItemDisplayName.length > hlen_Particular ? hlen_Particular - 2 : hlen_Particular - 1), (hlen_SN))
      tblRow += CommonFunctions.GetSpaceRepeat(2); //for space between itemname and qty
      if (this.receipt.IsReturned == true) {
        tblRow += CommonFunctions.GetTextFIlledToALength(invoiceitems[i].ReturnedQty.toString(), hlen_unit)
      }
      else {
        tblRow += CommonFunctions.GetTextFIlledToALength(invoiceitems[i].Quantity.toString(), hlen_unit)
      }
      if (this.showExpiryDateInPrint && !this.showRackNoInPrint) {
        tblRow += CommonFunctions.GetTextFIlledToALength(invoiceitems[i].ExpiryDate.toString(), hlen_expiry)
          + CommonFunctions.GetTextFIlledToALength(CommonFunctions.parseAmount(invoiceitems[i].SalePrice).toString(), hlen_rate);
      }
      else {
        tblRow += CommonFunctions.GetTextFIlledToALength(CommonFunctions.parseAmount(invoiceitems[i].SalePrice).toString(), hlen_rate);
      }

      //tblRow += CommonFunctions.GetTextFIlledToALength(CommonFunctions.parseAmount(invoiceitems[i].SalePrice).toString(), hlen_rate);

      if (this.IsitemlevlDis == true && this.receipt.IsReturned == true && this.showDis == true) {
        tblRow += CommonFunctions.GetTextFIlledToALength(CommonFunctions.parseAmount(invoiceitems[i].DiscountAmount).toString(), hlen_amt);
      }
      tblRow += CommonFunctions.GetTextFIlledToALength(CommonFunctions.parseAmount(invoiceitems[i].SubTotal).toString(), hlen_amt) + this.nline;

      if (this.showExpiryDateInPrint && this.showRackNoInPrint) {
        tblRow += CommonFunctions.GetSpaceRepeat(hlen_SN) + '(' + 'Expiry: ' + invoiceitems[i].ExpiryDate.toString() + ' RackNo: ' + (invoiceitems[i].RackNo == null ? '-' : invoiceitems[i].RackNo.toString()) + ')' + this.nline;
      }

      tableBody = tableBody + tblRow;
    }


    finalDataToPrint = finalDataToPrint + tableHead + tableBody + footerStr;

    let finalDataToPrintArr = finalDataToPrint.split("\n");
    let totalRowsToPrint = finalDataToPrint.split("\n").length - 1; //to get the number of lines
    let dataToPrint = '';

    for (let i = 0; i <= totalRowsToPrint; i++) {
      // subtracted 2 for continue
      if ((i % (totalHeight_lines - (headerGap_lines + 5))) == 0) {
        const preContTxt = this.nline + 'Continue...' + '\x0C';  //this is the command to push the postion to next paper head
        const postContTxt = this.nline + 'Continue...' + CommonFunctions.GetNewLineRepeat(2);
        dataToPrint = dataToPrint + ((i > 0) ? preContTxt : '') + CommonFunctions.GetNewLineRepeat(headerGap_lines) + ((i > 0) ? postContTxt : '');
      }
      dataToPrint = dataToPrint + finalDataToPrintArr[i] + this.nline;
    }
    return dataToPrint;
  }

  //This is for WeCare dotmatrix print
  MakeReceipt_Small() {
    let totalHeight_lines = this.selectedPrinter.Height_Lines;
    let headerGap_lines = this.selectedPrinter.HeaderGap_Lines;
    let horizontalCols = this.selectedPrinter.Width_Lines;
    let headerLeftColLen = horizontalCols - this.headerRightColLen;
    let finalDataToPrint = '';

    var hlen_SN = 3;
    var hlen_unit = 6;
    var hlen_rate = 7;
    var hlen_amt = 9;
    var hlen_Particular = horizontalCols - (hlen_SN + hlen_unit + hlen_rate + hlen_amt);
    let footerRightColLen = hlen_rate + hlen_amt;
    let footerLeftColLen = horizontalCols - footerRightColLen;

    let headerStr = '';
    this.receipt.InvoiceCode = 'PH';
    headerStr += CommonFunctions.GetTextCenterAligned_Sm(this.headerDetail.hospitalName, horizontalCols) + this.nline;
    headerStr += CommonFunctions.GetTextCenterAligned_Sm(this.headerDetail.address, horizontalCols) + this.nline;
    if (this.headerDetail.tel !== '') {
      headerStr += CommonFunctions.GetTextCenterAligned_Sm('Phone: ' + this.headerDetail.tel, horizontalCols) + this.nline;
    }
    if (this.headerDetail.PANno !== '') {
      headerStr += CommonFunctions.GetTextCenterAligned_Sm('PAN No.: ' + this.headerDetail.PANno, horizontalCols) + this.nline;
    }
    if (this.headerDetail.DDA !== '') {
      headerStr += CommonFunctions.GetTextCenterAligned_Sm('DDA: ' + this.headerDetail.DDA, horizontalCols) + this.nline;
    }
    let duplicatePrintString = this.receipt.PrintCount > 0 ? ' | COPY(' + this.receipt.PrintCount + ') OF ORIGINAL' : '';
    if (this.receipt.IsReturned == true) {
      headerStr += CommonFunctions.GetTextCenterAligned_Sm('Credit Note' + duplicatePrintString, horizontalCols) + this.nline + this.nline;
      headerStr += CommonFunctions.GetTextFIlledToALength_Sm('CRN.No: ' + this.receipt.CurrentFiscalYearName + '-' + 'CR' + '-' + this.receipt.InvoiceCode + this.receipt.CreditNoteNo, horizontalCols) + this.nline;
    }
    else {
      if (this.receipt.InvoiceId == 0) {
        headerStr += CommonFunctions.GetTextCenterAligned('Provisional Slip' + duplicatePrintString, horizontalCols) + this.nline;
        headerStr += CommonFunctions.GetTextFIlledToALength('Inv.No: ' + this.receipt.CurrentFiscalYearName + '-' + this.receipt.InvoiceCode + this.receipt.ReceiptPrintNo, headerLeftColLen)
      }
      else {
        headerStr += CommonFunctions.GetTextCenterAligned('Invoice' + duplicatePrintString, horizontalCols) + this.nline;
        headerStr += CommonFunctions.GetTextFIlledToALength('Inv.No: ' + this.receipt.CurrentFiscalYearName + '-' + this.receipt.InvoiceCode + this.receipt.ReceiptPrintNo, headerLeftColLen)
      }
    }
    headerStr += CommonFunctions.GetTextFIlledToALength_Sm('Date: ' + moment(this.receipt.ReceiptDate).format("YYYY-MM-DD"), horizontalCols) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength_Sm('Miti: ' + this.receipt.LocalReceiptDate, horizontalCols) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength_Sm('Name: ' + this.receipt.PatientInfo.ShortName, horizontalCols) + this.nline
    if (this.receipt.PatientInfo.PatientId > 0) {
      headerStr += CommonFunctions.GetTextFIlledToALength_Sm('Address: ' + this.receipt.PatientInfo.CountrySubDivisionName, horizontalCols) + this.nline;
      if (this.receipt.PatientInfo.PhoneNumber)
        headerStr += CommonFunctions.GetTextFIlledToALength_Sm('Phone: ' + this.receipt.PatientInfo.PhoneNumber, horizontalCols) + this.nline;
    }
    if (this.receipt.PatientInfo.PANNumber) {
      headerStr += CommonFunctions.GetTextFIlledToALength_Sm('PAN : ' + this.receipt.PatientInfo.PANNumber, horizontalCols) + this.nline;
    }
    headerStr += CommonFunctions.GetTextFIlledToALength_Sm('Payment Mode: ' + this.receipt.PaymentMode, horizontalCols) + this.nline;
    if (this.receipt.IsReturned == true)
      headerStr += CommonFunctions.GetTextFIlledToALength_Sm('Ref. Bill No: ' + this.receipt.ReceiptPrintNo, horizontalCols) + this.nline;
    if (this.receipt.PolicyNo != null) {
      headerStr += CommonFunctions.GetTextFIlledToALength_Sm('SSF PolicyNo: ' + this.receipt.PolicyNo, horizontalCols) + this.nline;
    }

    finalDataToPrint = finalDataToPrint + headerStr + this.nline;


    //items listing table
    var tableHead = CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;

    tableHead += CommonFunctions.GetTextFIlledToALength_Sm('Sn.', hlen_SN + 2)
    tableHead += CommonFunctions.GetTextFIlledToALength_Sm('Particular(s)', hlen_Particular - 2)
    tableHead += CommonFunctions.GetTextFIlledToALength_Sm('Qty', hlen_unit)
    tableHead += CommonFunctions.GetTextFIlledToALength_Sm('RATE', hlen_rate)
    tableHead += CommonFunctions.GetTextFIlledToALength_Sm('Amount', hlen_amt) + this.nline;

    tableHead += CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;

    var tableBody = '';
    let invoiceitems = this.receipt.InvoiceItems;
    for (let i = 0; i < invoiceitems.length; i++) {
      var tblRow = '';
      invoiceitems[i].ExpiryDate = moment(invoiceitems[i].ExpiryDate).format("YYYY-MM");
      tblRow += CommonFunctions.GetTextFIlledToALength_Sm((i + 1).toString(), hlen_SN);
      if (invoiceitems[i].ItemDisplayName.length <= (hlen_Particular - 1)) {
        tblRow += CommonFunctions.GetTextFIlledToALength_Sm(invoiceitems[i].ItemDisplayName, hlen_Particular)
      }
      else {
        tblRow += CommonFunctions.GetTextFIlledToALength(invoiceitems[i].ItemDisplayName.substring(0, hlen_Particular - 1), hlen_Particular);
      }
      if (this.receipt.IsReturned == true) {
        tblRow += CommonFunctions.GetTextFIlledToALength_Sm(" " + invoiceitems[i].ReturnedQty.toString(), hlen_unit)
      }
      else {
        tblRow += CommonFunctions.GetTextFIlledToALength_Sm(" " + invoiceitems[i].Quantity.toString(), hlen_unit)
      }
      tblRow += CommonFunctions.GetTextFIlledToALength_Sm(CommonFunctions.parseAmount(invoiceitems[i].SalePrice).toString(), hlen_rate)
      tblRow += CommonFunctions.GetTextFIlledToALength_Sm(CommonFunctions.parseAmount(invoiceitems[i].SubTotal).toString(), hlen_amt) + this.nline;

      if (invoiceitems[i].ItemDisplayName.length > (hlen_Particular - 1)) {
        tblRow += CommonFunctions.GetTextFIlledToALengthWithLeftMargin_Sm(invoiceitems[i].ItemDisplayName.substring(hlen_Particular - 1, invoiceitems[i].ItemDisplayName.length), (hlen_Particular), (hlen_SN - 1))
      }
      tblRow += this.nline;
      tblRow += CommonFunctions.GetTextFIlledToALength_Sm("BatchNo: " + invoiceitems[i].BatchNo, (horizontalCols)) + this.nline;
      tblRow += CommonFunctions.GetTextFIlledToALength_Sm("ExpiryDate: " + invoiceitems[i].ExpiryDate, (horizontalCols)) + this.nline;
      tableBody = tableBody + tblRow;
    }

    // Summary
    var leftMargin = CommonFunctions.GetSpaceRepeat(hlen_SN + hlen_Particular - 5);
    var summaryColLen = horizontalCols - (hlen_SN + hlen_Particular - 5)
    var summaryStr = '';
    summaryStr += leftMargin + CommonFunctions.GetHorizontalLineOfLength(summaryColLen) + this.nline;
    summaryStr += leftMargin + CommonFunctions.GetTextFilledToALength_SpaceBetween_Sm("Gross Amt:", this.receipt.SubTotal.toString(), summaryColLen) + this.nline;
    summaryStr += leftMargin + CommonFunctions.GetTextFilledToALength_SpaceBetween_Sm("Discount:", this.receipt.DiscountAmount.toString(), summaryColLen) + this.nline;
    if (this.receipt.VATAmount) {
      summaryStr += leftMargin + CommonFunctions.GetTextFilledToALength_SpaceBetween_Sm('Taxable:', this.receipt.TaxableAmount.toString(), summaryColLen) + this.nline;
      summaryStr += leftMargin + CommonFunctions.GetTextFilledToALength_SpaceBetween_Sm('Nontaxable:', this.receipt.NonTaxableAmount.toString(), summaryColLen) + this.nline;
      summaryStr += leftMargin + CommonFunctions.GetTextFilledToALength_SpaceBetween_Sm(`VAT (${this.receipt.VATPercentage}%):`, this.receipt.VATAmount.toString(), summaryColLen) + this.nline;
    }
    if (!this.receipt.IsReturned) {
      summaryStr += leftMargin + CommonFunctions.GetTextFilledToALength_SpaceBetween_Sm("Cash Amt", this.receipt.CashAmount.toString(), summaryColLen) + this.nline;
      summaryStr += leftMargin + CommonFunctions.GetTextFilledToALength_SpaceBetween_Sm("Credit Amt", this.receipt.CreditAmount.toString(), summaryColLen) + this.nline;
    }
    if (this.receipt.IsReturned) {
      summaryStr += leftMargin + CommonFunctions.GetTextFilledToALength_SpaceBetween_Sm("Cash Ret Amt", this.receipt.CashAmount.toString(), summaryColLen) + this.nline;
      summaryStr += leftMargin + CommonFunctions.GetTextFilledToALength_SpaceBetween_Sm("Credit Ret Amt", this.receipt.CreditAmount.toString(), summaryColLen) + this.nline;
    }

    summaryStr += leftMargin + CommonFunctions.GetTextFilledToALength_SpaceBetween_Sm("Net Amt:", this.receipt.TotalAmount.toString(), summaryColLen) + this.nline;
    summaryStr += leftMargin + CommonFunctions.GetHorizontalLineOfLength(summaryColLen) + this.nline;

    if (!this.receipt.IsReturned) {
      summaryStr += leftMargin + CommonFunctions.GetTextFilledToALength_SpaceBetween_Sm("Tender:", this.receipt.Tender.toString(), summaryColLen) + this.nline;
      summaryStr += leftMargin + CommonFunctions.GetTextFilledToALength_SpaceBetween_Sm("Change:", this.receipt.Change.toString(), summaryColLen) + this.nline;
    }
    if (!this.receipt.IsReturned) {
      summaryStr += leftMargin + CommonFunctions.GetHorizontalLineOfLength(summaryColLen) + this.nline;
    }
    if (!this.receipt.IsReturned && this.receipt.InvoiceId != 0) {
      summaryStr += this.getPaymentDetails(this.receipt.PaymentModeDetails).trim() + this.nline;
    }
    //Footer Code
    let totAmtInWords = 'Rs. ' + CommonFunctions.GetNumberInWords(this.receipt.TotalAmount);
    var footerStr = '';
    footerStr += CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
    footerStr += CommonFunctions.GetPHRMTextFIlledToALengthForParticulars(totAmtInWords, horizontalCols, 0) + this.nline;

    if (this.showEnglish) {
      footerStr += CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
      footerStr += CommonFunctions.GetTextCenterAligned_Sm(this.englishText, horizontalCols) + this.nline;
      footerStr += CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
    }


    footerStr += CommonFunctions.GetTextFIlledToALength_Sm('User:  ' + this.receipt.BillingUser, footerLeftColLen) + CommonFunctions.GetTextFIlledToALength_Sm('Time: ' + moment(this.receipt.ReceiptDate).format("HH:mm"), footerRightColLen);

    finalDataToPrint = finalDataToPrint + tableHead + tableBody + summaryStr + footerStr;

    //to remove continue part
    return finalDataToPrint + '\x0C';

    // to print continue during page end
    // let finalDataToPrintArr = finalDataToPrint.split("\n");
    // let totalRowsToPrint = finalDataToPrint.split("\n").length - 1; //to get the number of lines
    // let dataToPrint = '';

    // for (let i = 0; i <= totalRowsToPrint; i++) {
    //   // subtracted 2 for continue
    //   if ((i % (totalHeight_lines - (headerGap_lines + 5))) == 0) {
    //     const preContTxt = this.nline + 'Continue...' + '\x0C';  //this is the command to push the postion to next paper head
    //     const postContTxt = this.nline + 'Continue...' + CommonFunctions.GetNewLineRepeat(2);
    //     dataToPrint = dataToPrint + ((i > 0) ? preContTxt : '') + CommonFunctions.GetNewLineRepeat(headerGap_lines) + ((i > 0) ? postContTxt : '');
    //   }
    //   dataToPrint = dataToPrint + finalDataToPrintArr[i] + this.nline;
    // }
    // return dataToPrint;
  }

  GetLocalDate(engDate: string): string {
    let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
    return npDate + " BS";
  }

  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  OnPrinterChanged($event) {
    this.selectedPrinter = $event;
  }

  getPharmacyItemNameDisplaySettings() {
    let checkGeneric = this.coreService.Parameters.find(p => p.ParameterName == "PharmacyItemNameDisplaySettings" && p.ParameterGroupName == "Pharmacy");
    if (checkGeneric != null) {
      let phrmItemNameSettingValue = JSON.parse(checkGeneric.ParameterValue);
      this.showGenericName = phrmItemNameSettingValue.Show_GenericName
      this.showItemName = phrmItemNameSettingValue.Show_ItemName;
      this.showGenNameAfterItemName = phrmItemNameSettingValue.Show_GenericName_After_ItemName;
      this.LeadingSeparator = phrmItemNameSettingValue.Separator.trim();
    }
  }


  /**
 * Display the ItemName in the receipts based on core cfg parameter "PharmacyItemNameDisplaySettings"
 * @param showGenericName true if generic name should be seen
 * @param showItemName true if item name should be seen
 * @param separator string that separates itemname and genericname, wild card value "brackets" uses '()' to separate item name and generic name
 * @param showGenericNameAfterItemName true if itemname should be seen first and genericname should be seen after
 * @returns void
 * @default Shows only ItemName
 * @description created by Sanjit, Ramesh, Rohit on 4th Oct, 2021
 */
  public updateItemDisplayName(showGenericName: boolean, showItemName: boolean, separator: string = '', showGenericNameAfterItemName: boolean) {
    for (var i = 0; i < this.receipt.InvoiceItems.length; i++) {
      var item = this.receipt.InvoiceItems[i];
      if (showGenericName == true && showItemName == false) {
        item.ItemDisplayName = item.GenericName;
      }
      else if (showGenericName == false && showItemName == true) {
        item.ItemDisplayName = item.ItemName;
      }
      else if (showGenericName == true && showItemName == true) {
        if (showGenericNameAfterItemName == true) {
          if (separator == "" || separator.toLowerCase() == "brackets") {
            item.ItemDisplayName = `${item.ItemName}(${item.GenericName})`;
          }
          else {
            item.ItemDisplayName = item.ItemName + separator + item.GenericName;
          }
        }
        else {
          if (separator == "" || separator.toLowerCase() == "brackets") {
            item.ItemDisplayName = `${item.GenericName}(${item.ItemName})`;
          }
          else {
            item.ItemDisplayName = item.GenericName + separator + item.ItemName;
          }
        }
      }
      else {
        item.ItemDisplayName = item.ItemName;
      }
    }
  }
  // * Convert Array to String
  public getPaymentDetails(data): string {
    const filterPipe = new PaymentDetailsPipe();
    let result = null;
    result = filterPipe.transform(data);
    let finalResult = '';
    finalResult = this.splitString(result);
    return finalResult;
  }
  // * Split string and Added new Line
  public splitString(stringData: string): string {
    let splittedString = [];
    let result = '';
    splittedString = stringData.split(',');
    splittedString.forEach(_ => {
      result += (_.trim() + this.nline);
    })
    return result;
  }

  GetDotMatrixParameterSettings(): void {
    let dotMatrixExpiryDatePrintSetting = this.coreService.Parameters.find(p => p.ParameterName == "ShowExpiryDateInPharmacyDotMatrixPrint" && p.ParameterGroupName == "Pharmacy");
    if (dotMatrixExpiryDatePrintSetting) {
      let showExpiryDateInPrint = JSON.parse(dotMatrixExpiryDatePrintSetting.ParameterValue);
      this.showExpiryDateInPrint = showExpiryDateInPrint;
    }
    let dotMatrixRackNoPrintSetting = this.coreService.Parameters.find(p => p.ParameterName == "ShowRackNoInPharmacyDotMatrixPrint" && p.ParameterGroupName == "Pharmacy");
    if (dotMatrixRackNoPrintSetting) {
      let showRackNoInPrint = JSON.parse(dotMatrixRackNoPrintSetting.ParameterValue);
      this.showRackNoInPrint = showRackNoInPrint;
    }

  }

}
