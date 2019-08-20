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


@Component({
  selector: "billing-receipt",
  templateUrl: "./billing-receipt.html",
})

export class BillingReceiptComponent {

  @Input("receipt")
  public receipt: BillingReceiptModel = new BillingReceiptModel();


  @Input("showPrintBtn")
  public showPrintBtn: boolean = true;
  public localDateTime: string;
  public taxLabel: string;
  public currencyUnit: string;
  public patientQRCodeInfo: string = "";
  // public showQrCode: boolean = false;
  //public indexNo: number = 0;
  public numOfCopies: number = 1;

  constructor(
    public billingBLService: BillingBLService,
    public nepaliCalendarServ: NepaliCalendarService,
    public billingService: BillingService,
    public coreService: CoreService,
    public httpobj: HttpClient,
    public router: Router,
    public injector: Injector) {
    this.taxLabel = this.billingService.taxLabel;
    this.currencyUnit = this.billingService.currencyUnit;
  }


  GetLocalDate(engDate: string): string {
    let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
    return npDate + " BS";
  }

  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
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
    if (this.receipt) {
      let invDate = this.receipt.BillingDate;
      this.receipt.InvIssueDateLocal = this.GetLocalDate(invDate);

      this.patientQRCodeInfo = `Name: ` + this.receipt.Patient.ShortName + `
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
        a.ServiceDepartmentName == "Department OPD Old Patient" || a.ServiceDepartmentName == "Doctor OPD Old Patient" );

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
    //this.showAllPatient = true;
    ////reset current patient value on back button.. 
    //this.patientService.CreateNewGlobal();
    //this.showCancelSummaryPanel = false;
    //this.showActionPanel = false;
    //this.receiptDetails = [];
    //this.cancelledItems = [];
    //this.showPatBillHistory = false;
    if (this.receipt.AppointmentType == "New") {
      this.router.navigate(['/Appointment/PatientSearch']);
    }
    else {
      this.router.navigate(['/Appointment/ListVisit']);
    }
  }
}
