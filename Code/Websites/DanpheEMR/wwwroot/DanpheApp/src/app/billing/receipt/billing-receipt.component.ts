import { Component, Input, Output, Injector, ChangeDetectorRef, Inject, OnChanges } from "@angular/core";
import { BillingReceiptModel } from '../shared/billing-receipt.model';
import { Router } from '@angular/router';
//sud:5May'18--BackButtonDisable is not working as expected, correct and implement later
//import { BackButtonDisable } from "../../core/shared/backbutton-disable.service";
import { BillingBLService } from "../shared/billing.bl.service";
import { BillingService } from "../shared/billing.service";
import { CoreService } from "../../core/shared/core.service";
import { HttpClient } from '@angular/common/http';
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { CommonFunctions } from "../../shared/common.functions";
import { DanpheCache, MasterType } from "../../shared/danphe-cache-service-utility/cache-services";
import { BillingTransactionItem } from "../shared/billing-transaction-item.model";
import { PatientService } from "../../patients/shared/patient.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import * as moment from 'moment/moment';


@Component({
  selector: "billing-receipt",
  templateUrl: "./billing-receipt.html",
})

export class BillingReceiptComponent {
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

  @Input("showSelectCheckBox")
  public showSelectCheckBox: boolean = false;

  @Input("PrintReturnReceipt")
  public PrintReturnReceipt: boolean = false;

  @Input("ShowPrintCount")
  public ShowPrintCount: boolean = true;

  @Input("IsAllSelectedItems")
  public IsAllSelectedItems: boolean = false;

  public localDateTime: string;
  public taxLabel: string;
  public currencyUnit: string;
  public patientQRCodeInfo: string = "";
  // public showQrCode: boolean = false;
  //public indexNo: number = 0;
  public numOfCopies: number = 1;

  public invoiceDetails: any = null;//Rajesh:29Aug19 Declared for Copy Invoice Items

  public Invoice_Label: string = "INVOICE";//sud:19Nov'19--we're getting this value from Parameter since different hospital needed it differently.
  public EnableCreditNote: boolean;
  public ShowProviderName: boolean;

  public CreditInvoiceDisplaySettings = { ShowPatAmtForCrOrganization: false, PatAmtValue: "0.00", ValidCrOrgNameList: ["Nepal Govt Dialysis"] };
  public QueueNoSetting = { "ShowInInvoice": false, "ShowInSticker": false };

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
    public routeFromService: RouteFromService, ) {
    this.taxLabel = this.billingService.taxLabel;
    this.currencyUnit = this.billingService.currencyUnit;
    this.SetInvoiceLabelNameFromParam();
    this.SetCreditNoteFlag();
    //this.SetShowProviderNameFlag();
    this.ShowProviderName = this.coreService.SetShowProviderNameFlag();

    this.LoadCreditInvoiceDisplaySettingsFromParameter();

    this.QueueNoSetting = this.coreService.GetQueueNoSetting();
  }

  OnChangeSelectAll() {
    this.receipt.BillingItems.forEach(item => {
      item.IsSelected = this.IsAllSelectedItems;
    });
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
  //public SetShowProviderNameFlag() {
  //  var currval = this.coreService.Parameters
  //    .find(a => a.ParameterGroupName == "Bill Print" && a.ParameterName == "ShowAssignedDoctorInReceipt")
  //    .ParameterValue;
  //  if (currval == "true") {
  //    this.ShowProviderName = true;
  //  }
  //  else {
  //    this.ShowProviderName = false;
  //  }
  //}



  OnChangeItemSelect($event) {
    if ($event) {
      this.IsAllSelectedItems = false;
    } else {
      this.IsAllSelectedItems = false;
    }
  }

  GetLocalDate(engDate: string): string {
    let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
    return npDate + " BS";
  }

  print() {
    let popupWinindow;
    var printContents = '';
    if (this.PrintReturnReceipt) {
      printContents = document.getElementById("printReturnPage").innerHTML;
    } else {
      for (var i = 1; i <= this.BillGenerate; i++) {
        printContents = printContents + document.getElementById("printpage").innerHTML;
      }
    }
    popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    //popupWinindow.document.write('<html><head><link href="../assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

    popupWinindow.document.close();

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

  }

  ngOnInit() {

    this.receipt.Patient.CountrySubDivisionName;
    this.receipt.Patient.CountryName;
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
      // this.showQrCode = true;
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


  CreateCopyOfCurrentReceipt() {

    //  var data = this.receipt;

    //this.invoiceDetails.patient = this.receipt;

    this.patientService.setGlobal(this.receipt.Patient);
    // ashim: 29Sep2018
    // if (this.invoiceDetails && this.invoiceDetails.LatestPatientVisitInfo) {
    //   this.patientService.globalPatient.LatestVisitCode = this.invoiceDetails.LatestPatientVisitInfo.LatestVisitCode;
    //   this.patientService.globalPatient.LatestVisitId = this.invoiceDetails.LatestPatientVisitInfo.LatestVisitId;
    //   this.patientService.globalPatient.LatestVisitType = this.invoiceDetails.LatestPatientVisitInfo.LatestVisitType;
    // }
    // else {
    // this.patientService.globalPatient.LatestVisitType = "outpatient";
    // }

    let txn = this.billingService.CreateNewGlobalBillingTransaction();
    this.receipt.BillingItems.forEach(item => {
      //we were not getting validation instance when assigned directly.
      let billItem = new BillingTransactionItem();
      billItem = Object.assign(billItem, item);
      billItem.BillingTransactionItemId = 0;
      billItem.BillingTransactionId = null;
      billItem.ReturnQuantity = null;
      billItem.ReturnStatus = null;
      billItem.CreatedBy = null;
      billItem.CreatedOn = null;
      billItem.PaidDate = null;
      billItem.CounterId = null;
      billItem.CounterDay = null;
      txn.BillingTransactionItems.push(billItem);
    });
    txn.PatientId = this.receipt.Patient.PatientId;
    txn.PatientVisitId = this.receipt.VisitId;
    txn.PaymentMode = this.receipt.PaymentMode;
    txn.PaymentDetails = this.receipt.PaymentDetails;
    txn.DiscountPercent = this.receipt.DiscountPercent;
    txn.Remarks = this.receipt.Remarks;
    txn.PackageId = this.receipt.PackageId;
    txn.PackageName = this.receipt.PackageName;
    txn.TransactionType = this.receipt.BillingType;
    txn.IsCopyReceipt = true;
    txn.BillingTransactionId = 0;
    this.billingService.BillingType = this.receipt.BillingType;
    this.routeFromService.RouteFrom = "BillReturn";
    this.router.navigate(['/Billing/BillingTransaction']);

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
    var patId = this.receipt.BillingItems[0].PatientId;
    var patVisitId = this.receipt.BillingItems[0].PatientVisitId;

    this.billingBLService.GetInPatientDetailForPartialBilling(patId, patVisitId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.receipt.IpNumber = res.Results.InpatientNo;
        }
      });
  }
}
