import { Component, Input, Output, Injector, ChangeDetectorRef, Inject, OnChanges } from "@angular/core";
import { BillingReceiptModel } from '../../shared/billing-receipt.model';
import { Router } from '@angular/router';
//sud:5May'18--BackButtonDisable is not working as expected, correct and implement later
//import { BackButtonDisable } from "../../core/shared/backbutton-disable.service";
import { BillingBLService } from "../../shared/billing.bl.service";
import { BillingService } from "../../shared/billing.service";
import { CoreService } from "../../../core/shared/core.service";
import { HttpClient } from '@angular/common/http';
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { DanpheCache, MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";
import { BillingTransactionItem } from "../../shared/billing-transaction-item.model";
import { PatientService } from "../../../patients/shared/patient.service";
import { RouteFromService } from "../../../shared/routefrom.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import * as moment from 'moment/moment';
import { ENUM_InvoiceType } from "../../../shared/shared-enums";
import { parse } from "querystring";


@Component({
  selector: "billing-receipt-old",
  templateUrl: "./billing-receipt-old.html",
})

export class BillingReceiptComponent_Old {
  public unitOfAge: string = null;
  public ageOfPatient: string = null;
  public finalAge: string = null;
  public BillGenerate: number = 1;

  @Input("receipt")
  public receipt: BillingReceiptModel = new BillingReceiptModel();

  @Input("BillGenerate")
  public set billgenerateindex(val: number) {
    this.BillGenerate = val ? val : 1;
  }

  @Input("showPrintBtn")
  public showPrintBtn: boolean = true;

  @Input("PrintReturnReceipt")
  public PrintReturnReceipt: boolean = false;

  @Input("ShowPrintCount")
  public ShowPrintCount: boolean = true;

  public localDateTime: string;
  public taxLabel: string;
  //public currencyUnit: string;
  public patientQRCodeInfo: string = "";

  public Invoice_Label: string = "INVOICE";//sud:19Nov'19--we're getting this value from Parameter since different hospital needed it differently.
  public EnableCreditNote: boolean;
  public ShowProviderName: boolean;

  public CreditInvoiceDisplaySettings = { ShowPatAmtForCrOrganization: false, PatAmtValue: "0.00", ValidCrOrgNameList: ["Nepal Govt Dialysis"] };
  public QueueNoSetting = { "ShowInInvoice": false, "ShowInSticker": false };

  public InvoiceDisplaySettings: any = { ShowHeader: true, ShowQR: true, ShowHospLogo: true };
  public InvoiceFooterNoteSettings: any = { ShowFooter: true, ShowEnglish: true, ShowNepali: false, EnglishText: "Please bring this invoice on your next visit.", NepaliText: "कृपया अर्को पटक आउँदा यो बिल अनिवार्य रुपमा लिएर आउनुहोला ।" };
  public hospitalCode: string = "";

  public Enable_Dotmatrix_Printer: boolean;
  public Dotmatrix_Printer = { BillingReceipt: "EPSON" };
  //public printerName_Storage: any = null;
  public PrinterDisplayName: string = null;
  public PrinterName: string = null;
  public showPrinterChange: boolean = false;
  public isReceiptDetailLoaded: boolean = false;

  constructor(
    public billingBLService: BillingBLService,
    public nepaliCalendarServ: NepaliCalendarService,
    public billingService: BillingService,
    public coreService: CoreService,
    public httpobj: HttpClient,
    public router: Router,
    public injector: Injector,
    public msgbox: MessageboxService,
    public patientService: PatientService,
    public routeFromService: RouteFromService,
    public changeDetector: ChangeDetectorRef) {
    this.taxLabel = this.billingService.taxLabel;
    //this.currencyUnit = this.billingService.currencyUnit;
    this.SetInvoiceLabelNameFromParam();
    this.SetCreditNoteFlag();
    //this.SetShowProviderNameFlag();
    this.ShowProviderName = this.coreService.SetShowProviderNameFlag();

    this.LoadCreditInvoiceDisplaySettingsFromParameter();

    this.QueueNoSetting = this.coreService.GetQueueNoSetting();
    this.InvoiceDisplaySettings = this.coreService.GetInvoiceDisplaySettings();
    this.InvoiceFooterNoteSettings = this.coreService.GetInvoiceFooterNoteSettings();
    this.hospitalCode = this.coreService.GetHospitalCode();
    if (!this.hospitalCode) {
      this.hospitalCode = "default";
    }

    this.SetPrinterFromParam();

  }

  ngAfterViewInit() {
    var btnObj = document.getElementById('btnPrintRecipt');
    if (btnObj) {
      btnObj.focus();
    }
  }

  public SetInvoiceLabelNameFromParam() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "BillingInvoiceDisplayLabel");
    if (currParam && currParam.ParameterValue) {
      this.Invoice_Label = currParam.ParameterValue;
    }
  }

  public SetCreditNoteFlag() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "EnableCreditNote");
    if (currParam && currParam.ParameterValue) {
      var val = currParam.ParameterValue;
      if (val == "0") {
        this.EnableCreditNote = true;
      }
      else {
        this.EnableCreditNote = false;
      }
    }
  }

  GetLocalDate(engDate: string): string {
    let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
    return npDate + " BS";
  }

  public SetPrinterFromParam() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "PrinterSetting" && a.ParameterName == "PrintByDotMatrix");
    if (currParam && currParam.ParameterValue) {
      var val = currParam.ParameterValue;
      if (val == 'false') {
        this.Enable_Dotmatrix_Printer = false;
      }
      else {
        this.Enable_Dotmatrix_Printer = true;

        if (!this.coreService.billingDotMatrixPrinters || !this.coreService.billingDotMatrixPrinters.length) {
          this.coreService.billingDotMatrixPrinters = this.coreService.GetBillingDotMatrixPrinterSettings();
        }

        this.billingDotMatrixPrinters = this.coreService.billingDotMatrixPrinters;

        if (!this.billingService.BillingMainDotMatrixPrinterPageDimension) {
          this.billingService.BillingMainDotMatrixPrinterPageDimension = this.coreService.GetDotMatrixPrinterDimensions(); //1 is for ins billing
        }

        this.dotPrinterDimensions = this.billingService.BillingMainDotMatrixPrinterPageDimension;

        let prntrInStorage = localStorage.getItem('BillingInvoiceSelectedPrinter');
        if (prntrInStorage) {
          //this.printerName_Storage = prntrInStorage;
          let val = this.billingDotMatrixPrinters.find(p => p.DisplayName == prntrInStorage);
          this.PrinterDisplayName = val ? val.DisplayName : '';
          this.PrinterName = val ? val.PrinterName : '';
        } else {
          this.showPrinterChange = true;
        }
      }
    }
  }

  public ChangePrinterLocationName() {
    if (this.PrinterDisplayName) {
      if (localStorage.getItem('BillingInvoiceSelectedPrinter')) {
        localStorage.removeItem('BillingInvoiceSelectedPrinter');
      }
      localStorage.setItem('BillingInvoiceSelectedPrinter', this.PrinterDisplayName);
      let ptr = this.billingDotMatrixPrinters.find(p => p.DisplayName == this.PrinterDisplayName);
      //this.PrinterDisplayName = ptr ? ptr.DisplayName : '';
      this.PrinterName = ptr ? ptr.PrinterName : '';
      this.showPrinterChange = false;
    } else {
      this.msgbox.showMessage('error', ["Please select Printer."]);
    }
  }

  public ShowPrinterLocationChange() {
    let ptr = this.billingDotMatrixPrinters.find(p => p.DisplayName == this.PrinterDisplayName);
    //this.printerName_Storage = ptr ? ptr.PrinterName : '';
    this.PrinterName = ptr ? ptr.PrinterName : '';
    this.showPrinterChange = true;
  }


  public openBrowserPrintWindow: boolean = false;
  public printDetaiils: any;
  public dotPrinterDimensions: any;
  public billingDotMatrixPrinters: any;
  public headerRightColLen: number = 32;
  public nline: any = '\n';
  public modelName: string;

  public print() {

    //-----qz-tray start----->
    if (this.Enable_Dotmatrix_Printer == true) {
      if (!this.PrinterDisplayName || (this.PrinterDisplayName.trim().length == 0)) {
        this.msgbox.showMessage('error', ["Please select Printer"]);
        return;
      }

      let ptr = this.billingDotMatrixPrinters.find(p => p.DisplayName == this.PrinterName);
      this.modelName = ptr ? ptr.ModelName : '';

      this.coreService.QzTrayObject.websocket.connect()
        .then(() => {
          return this.coreService.QzTrayObject.printers.find();
        })
        .then(() => {
          var config = this.coreService.QzTrayObject.configs.create(this.PrinterName);

          let dataToPrint = this.MakeReceipt();

          return this.coreService.QzTrayObject.print(config, CommonFunctions.GetEpsonPrintDataForPage(dataToPrint, this.dotPrinterDimensions.mh, this.dotPrinterDimensions.ml, this.modelName));
          //return null;

        })
        .catch(function (e) {
          console.error(e);
        })
        .finally(() => {
          this.updateCount();
          return this.coreService.QzTrayObject.websocket.disconnect();
        });

    } else {
      let popupWinindow;
      var printContents = document.getElementById("printpage").innerHTML;
      this.printDetaiils = printContents;
      this.openBrowserPrintWindow = true;
      popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
      popupWinindow.document.open();
      popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

      popupWinindow.document.close();
      this.updateCount();

    }

  }



  public MakeReceipt() {
    let totalHeight_lines = this.dotPrinterDimensions.totalHeight;
    let headerGap_lines = this.dotPrinterDimensions.headerGap;
    let horizontalCols = this.dotPrinterDimensions.totalWidth;
    let headerLeftColLen = horizontalCols - this.headerRightColLen;
    let finalDataToPrint = '';

    let hlen_SN = 8;
    let hlen_unit = 8;
    let hlen_price = 10;
    let hlen_amt = 10;
    let hlen_Particular = horizontalCols - (hlen_SN + hlen_unit + hlen_price + hlen_amt);
    let footerRightColLen = hlen_unit + hlen_price + hlen_amt;
    let footerLeftColLen = horizontalCols - footerRightColLen;

    let addressValue = this.receipt.Patient.Address ? this.receipt.Patient.Address + "," : "";

    if (this.receipt.Patient.CountrySubDivision && this.receipt.Patient.CountrySubDivision.CountrySubDivisionName) {
      addressValue += this.receipt.Patient.CountrySubDivision.CountrySubDivisionName;
    }
    else {
      addressValue += this.receipt.Patient.CountrySubDivisionName;
    }

    let insuranceInfoStr = "";
    if (this.receipt.IsInsuranceBilling) {
      insuranceInfoStr = CommonFunctions.GetTextFIlledToALength('NSHI: ' + this.receipt.Ins_NshiNumber, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Claim Code : ' + this.receipt.ClaimCode, this.headerRightColLen) + this.nline;
    }



    let headerStr = '';

    let invoiceHeaderLabel = this.receipt.IsInsuranceBilling ? "Health Insurance Credit Invoice" : "INVOICE";

    let duplicatePrintString = this.receipt.PrintCount > 0 ? ' | COPY(' + this.receipt.PrintCount + ') OF ORIGINAL' : '';

    headerStr += CommonFunctions.GetTextCenterAligned(invoiceHeaderLabel + duplicatePrintString + ((this.receipt.PackageId && this.receipt.PackageName) ? "|" + this.receipt.PackageName : ""), horizontalCols) + this.nline;

    headerStr += CommonFunctions.GetTextFIlledToALength('Invoice No:' + this.receipt.CurrentFinYear + '-' + this.receipt.InvoiceCode + this.receipt.InvoiceNo, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Transaction Date: ' + moment(this.receipt.BillingDate).format("YYYY-MM-DD"), this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Hospital No:' + this.receipt.Patient.PatientCode, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Invoice Date: ' + moment(this.receipt.BillingDate).format("YYYY-MM-DD"), this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Patients Name: ' + this.receipt.Patient.ShortName, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('(' + this.receipt.InvIssueDateLocal + ')', this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Address: ' + addressValue, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Age/Sex : ' + this.finalAge + '/' + this.receipt.Patient.Gender, this.headerRightColLen) + this.nline;
    if (insuranceInfoStr) {
      headerStr += insuranceInfoStr;
    }

    if (this.receipt.Patient.PhoneNumber || this.receipt.Patient.PANNumber) {
      headerStr += CommonFunctions.GetTextFIlledToALength('Contact No: ' + this.receipt.Patient.PhoneNumber, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Purchasers PAN : ' + this.receipt.Patient.PANNumber, this.headerRightColLen) + this.nline;
    }

    if (this.receipt.IpNumber) {
      headerStr += CommonFunctions.GetTextFIlledToALength('IP Number:' + this.receipt.IpNumber, headerLeftColLen) + this.nline;
    }

    if (this.receipt.LabTypeName) {
      headerStr += CommonFunctions.GetTextFIlledToALength('LAB TYPE:' + this.receipt.LabTypeName.toUpperCase(), headerLeftColLen);
    }
    else {
      headerStr += CommonFunctions.GetSpaceRepeat(headerLeftColLen);
    }

    headerStr += CommonFunctions.GetTextFIlledToALength('Method of payment: ' + this.receipt.PaymentMode.toUpperCase(), this.headerRightColLen) + this.nline;


    headerStr += CommonFunctions.GetHorizontalLineOfLength(horizontalCols);

    finalDataToPrint = finalDataToPrint + headerStr + this.nline;

    //Footer Code
    let totAmtInWords = 'In Words : ' + CommonFunctions.GetNumberInWords(this.receipt.TotalAmount);
    var footerStr = CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
    let footerRightColArr = [CommonFunctions.GetTextFIlledToALength('SubTotal:' + this.receipt.SubTotal.toString(), footerRightColLen), CommonFunctions.GetTextFIlledToALength('Discount:' + this.receipt.DiscountAmount.toString(), footerRightColLen),
    CommonFunctions.GetTextFIlledToALength('Total Amount:' + '  ' + this.receipt.TotalAmount.toString(), footerRightColLen)];

    for (let i = 0; i < footerRightColArr.length; i++) {
      let startLen = i * (footerLeftColLen - 8); //8 is given for gap
      footerStr += CommonFunctions.GetTextFIlledToALength(totAmtInWords.substr(startLen, (footerLeftColLen - 8)), footerLeftColLen) + footerRightColArr[i] + this.nline;
    }
    
    if(this.receipt.DepositUsed){
      footerStr += CommonFunctions.GetTextFIlledToALength('Deposit: [Deducted:' + this.receipt.DepositUsed+'/Balance:' + this.receipt.DepositBalance+"]", headerLeftColLen) + this.nline;
    } 

    footerStr += CommonFunctions.GetTextFIlledToALength('User:  ' + this.receipt.BillingUser, footerLeftColLen) + CommonFunctions.GetTextFIlledToALength('Time: ' + moment(this.receipt.BillingDate).format("HH:mm"), footerRightColLen);


    //items listing table
    var tableHead = CommonFunctions.GetTextFIlledToALength('Sn.', hlen_SN) + CommonFunctions.GetTextFIlledToALength('Particular(s)', hlen_Particular) +
      CommonFunctions.GetTextFIlledToALength('Unit', hlen_unit) + CommonFunctions.GetTextFIlledToALength('Price', hlen_price) + CommonFunctions.GetTextFIlledToALength('Amount', hlen_amt) + this.nline;
    var tableBody = '';
    let billItems = this.receipt.BillingItems;
    for (let i = 0; i < billItems.length; i++) {
      var tblRow = '';
      var totalamount = billItems[i].Quantity * billItems[i].Price;

      tblRow += CommonFunctions.GetTextFIlledToALength((i + 1).toString(), hlen_SN)
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

  updateCount() {
    let printCount = this.receipt.PrintCount + 1;
    this.billingBLService.PutPrintCount(printCount, this.receipt.BillingTransactionId) //Yubraj: 13th August'19--sending BillingTransactionId instead of ReceiptNo
      .subscribe(res => {
        if (res.Status != "OK") {
          //if OK then do nothing.
          console.log("Failed to Update Print Count");
        }
        this.router.navigate(['/Billing/SearchPatient']);
      });

  }



  ngOnInit() {

    this.unitOfAge = this.receipt.Patient.Age.slice(this.receipt.Patient.Age.length - 1);

    let currentDate = moment().format('YYYY-MM-DD');
    let years = moment(currentDate).diff(moment(this.receipt.Patient.DateOfBirth).format('YYYY-MM-DD'), 'years');
    let totMonths = moment(currentDate).diff(moment(this.receipt.Patient.DateOfBirth).format('YYYY-MM-DD'), 'months');
    let totDays = moment(currentDate).diff(moment(this.receipt.Patient.DateOfBirth).format('YYYY-MM-DD'), 'days');
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

    if (this.receipt) {
      let invDate = this.receipt.BillingDate;
      this.receipt.InvIssueDateLocal = this.GetLocalDate(invDate);

      //sud:20Nov'19--added age/sex in qr-code.

      this.patientQRCodeInfo = `Name: ` + this.receipt.Patient.ShortName + `
Age/Sex : `+ this.receipt.Patient.Age + `/` + this.receipt.Patient.Gender.charAt(0) + `
Hospital No: `+ '[' + this.receipt.Patient.PatientCode + ']' + `
Invoice No: ` + this.receipt.CurrentFinYear + ` - ` + this.receipt.InvoiceCode + this.receipt.InvoiceNo;
      // this.showQrCode = true;

      //sud:12Aug'19--centralized logic to get consulting doctor at bottom of receipt.
      this.receipt.ConsultingDrName = this.GetConsultingDoctorName(this.receipt.BillingItems);
      this.receipt.OPDReferredByDrName = this.GetOPDReferrDoctorName(this.receipt.BillingItems);



      let _tax = this.coreService.Masters.Taxes.find(tax => tax.TaxId == this.receipt.TaxId);
      if (_tax)
        this.taxLabel = _tax.TaxLabel;

      this.receipt.BillingItems.forEach(a => a.Price = CommonFunctions.parseAmount(a.Price));

    }

    //if current invoice's Organization name is in the list of Valid CreditOrganization list then only show PatientAmount, else hide PatientAmount field.
    if (this.receipt && this.CreditInvoiceDisplaySettings.ShowPatAmtForCrOrganization && this.receipt.OrganizationName
      && this.CreditInvoiceDisplaySettings.ValidCrOrgNameList && this.CreditInvoiceDisplaySettings.ValidCrOrgNameList.length > 0
      && this.CreditInvoiceDisplaySettings.ValidCrOrgNameList.filter(orgName => orgName.toLowerCase() == this.receipt.OrganizationName.toLowerCase()).length > 0) {
      this.CreditInvoiceDisplaySettings.ShowPatAmtForCrOrganization = true;
    }
    else {
      this.CreditInvoiceDisplaySettings.ShowPatAmtForCrOrganization = false;
    }

    if (this.receipt.BillingItems[0].BillingType == "inpatient") {
      this.GetInPatientDetail();
    }

    this.isReceiptDetailLoaded = true;
  }


  //Out of all requesting doctors we'll be taking only the first one here.
  //HardCoding was needed for HAMS for Doctor's team.
  //This will be null for OPD, since we have to show OPD-Doctor in another field: 'Referred By'
  GetConsultingDoctorName(txnItems: Array<BillingTransactionItem>): string {
    let retDocName: string = "";

    let reqDocId: number = 0;

    if (txnItems && txnItems.length > 0) {

      //we won't show this field if either of below servicedepartment is true.
      let opdItemObj = txnItems.find(a => a.ServiceDepartmentName == "OPD" || a.ServiceDepartmentName == "Department OPD"
        || a.ServiceDepartmentName == "Department Followup Charges" || a.ServiceDepartmentName == "Doctor Followup Charges" ||
        a.ServiceDepartmentName == "Department OPD Old Patient" || a.ServiceDepartmentName == "Doctor OPD Old Patient");

      //if found, then return from here..
      if (opdItemObj) {
        retDocName = "";
        return retDocName;

      }


      //get all reqDoctors Id into one single arraya and take the first one to get his/her name.
      let reqDocIdLists = txnItems.filter(itm => itm.RequestedBy && itm.RequestedBy != 0).map(a => {
        return a.RequestedBy;
      });
      if (reqDocIdLists && reqDocIdLists.length > 0) {
        reqDocId = reqDocIdLists[0];
      }
    }


    if (reqDocId) {
      let allDocs: Array<any> = DanpheCache.GetData(MasterType.Employee, null);

      //WARNING: Extreme Hardcoded is done for HAMS hospital below, it'll work normal for other hospitals.

      let hospitalName = this.coreService.GetHospitalName();
      if (hospitalName.toLowerCase() == "hams" && (reqDocId == 110 || reqDocId == 112 || reqDocId == 140)) {
        //110: sunita pun, 112: Padam Raj Pant, 140: Atit Poudel
        retDocName = "Prof. Dr.Padam Raj Pant and Team";
      }
      else {
        let reqDocObj = allDocs.find(e => e.EmployeeId == reqDocId);
        if (reqDocObj) {
          retDocName = reqDocObj.FullName;
        }

      }

    }

    return retDocName;
  }


  GetOPDReferrDoctorName(txnItems: Array<BillingTransactionItem>): string {
    let refDocname: string = null;
    let opdItemObj = txnItems.find(a => a.ServiceDepartmentName == "OPD" || a.ServiceDepartmentName == "Department OPD"
      || a.ServiceDepartmentName == "Department Followup Charges" || a.ServiceDepartmentName == "Doctor Followup Charges" ||
      a.ServiceDepartmentName == "Department OPD Old Patient" || a.ServiceDepartmentName == "Doctor OPD Old Patient");

    if (opdItemObj) {
      refDocname = opdItemObj.ProviderName;
    }

    return refDocname;
  }

  ngOnChanges() {
    if (this.receipt) {

      let invDate = this.receipt.BillingDate;
      this.receipt.InvIssueDateLocal = this.GetLocalDate(invDate);

      this.patientQRCodeInfo = `Name: ` + this.receipt.Patient.ShortName + `
            Hospital No: `+ '[' + this.receipt.Patient.PatientCode + ']' + `
            Invoice No: ` + this.receipt.CurrentFinYear + ` - ` + this.receipt.InvoiceCode + this.receipt.InvoiceNo;

    }
  }
  BackToAppointment() {
    if (this.receipt.AppointmentType == "New") {
      this.router.navigate(['/Appointment/PatientSearch']);
    }
    else {
      this.router.navigate(['/Appointment/ListVisit']);
    }
  }


  public LoadCreditInvoiceDisplaySettingsFromParameter() {
    let param = this.coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "CreditInvoiceDisplaySettings");
    if (param) {
      let paramValueStr = param.ParameterValue;
      if (paramValueStr) {
        this.CreditInvoiceDisplaySettings = JSON.parse(paramValueStr);
      }
    }
  }

  // need to show Inpateint DEtail in the invoice for Inpateint partial invoice.
  public GetInPatientDetail() {
    var patId = this.receipt.Patient.PatientId;
    var patVisitId = this.receipt.VisitId;

    this.billingBLService.GetInPatientDetailForPartialBilling(patId, patVisitId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.receipt.IpNumber = res.Results.InpatientNo;
        }
      });
  }

  callBackBillPrint($event) {
    //add 1 to existing printcount.
    let printCount = this.receipt.PrintCount + 1;
    this.billingBLService.PutPrintCount(printCount, this.receipt.BillingTransactionId) //Yubraj: 13th August'19--sending BillingTransactionId instead of ReceiptNo
      .subscribe(res => {
        if (res.Status == "OK") {
        }
        else {
          //this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      });
    this.router.navigate(['/Billing/SearchPatient']);
  }
  //it was used initially while doing the rnd and testing, where the name for dotprinter name was given
  // public LoadPrinterFromParameter() {
  //   let param = this.coreService.Parameters.find(p => p.ParameterGroupName == "PrinterSetting" && p.ParameterName == "DefaultDotMatrixPrinterName");
  //   if (param) {
  //     let paramValueStr = param.ParameterValue;
  //     if (paramValueStr) {
  //       this.Dotmatrix_Printer = JSON.parse(paramValueStr);
  //     }
  //   }
  // }
}
