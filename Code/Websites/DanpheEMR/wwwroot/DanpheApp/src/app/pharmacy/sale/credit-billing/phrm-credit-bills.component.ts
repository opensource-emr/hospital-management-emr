
import { Component, OnChanges, SimpleChanges, DoCheck, Input, AfterContentChecked } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { RouterOutlet, RouterModule, Router } from '@angular/router'
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { PatientService } from '../../../patients/shared/patient.service';
import { SecurityService } from '../../../security/shared/security.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { CallbackService } from '../../../shared/callback.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { BillingTransactionItem } from '../../../billing/shared/billing-transaction-item.model';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { CommonFunctions } from '../../../shared/common.functions';
import { PatientBillingContextVM } from '../../../billing/shared/patient-billing-context-vm';

//below are for pharmacy model.
import { PHRMInvoiceModel } from '../../shared/phrm-invoice.model';
import { PHRMInvoiceItemsModel } from '../../shared/phrm-invoice-items.model';
import { Patient } from '../../../patients/shared/patient.model';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import { forEach } from '@angular/router/src/utils/collection';
import { PharmacyReceiptModel } from '../../shared/pharmacy-receipt.model';
import { PharmacyService } from '../../shared/pharmacy.service';
import { PHRMPatient } from '../../shared/phrm-patient.model';
import { PHRMDepositModel } from '../../shared/phrm-deposit.model';
import { BillingFiscalYear } from "../../../billing/shared/billing-fiscalyear.model";

@Component({
  templateUrl: "./credit-bills.html"
})

// App Component class
export class PHRMCreditBillsComponent {

  public counterId: number = 0;
  //public BillingTransaction: Array<BillingTransaction> = new Array<BillingTransaction>();  //to show the credit information
  public allCreditItems: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();
  public provisionalBillsSummary: Array<any> = [];
  public showAllPatient: boolean = true;  // to show the form required to show the credit details

  public creditBillGridColumns: Array<any> = null;
  //declare boolean loading variable for disable the double click event of button
  loading: boolean = false;
  //added: sud:12May'18
  public selectAllItems: boolean = false;
  public currentPatient: PHRMPatient = new PHRMPatient();
  public showActionPanel: boolean = false;
  public selectedItemsTotAmount: number = 0;
  public remarks: string = null;
  public showCancelSummaryPanel: boolean = false;
  public checkDeductfromDeposit: boolean = false;
  public deductDeposit: boolean = false;
  public cancelledItems: Array<BillingTransactionItem> = [];
  public highlightRemark: boolean = false;
  public currBillingContext: PatientBillingContextVM;
  public admissionDetail;
  public selectedSaleCreditData: PHRMPatient = new PHRMPatient();
  //sud: 31May'18--to display patient bill summary
  public showPatBillHistory: boolean = false;
  public isPrint: boolean = false;
  public showSaleItemsPopup: boolean = false;
  public allFiscalYrs: Array<BillingFiscalYear> = new Array<BillingFiscalYear>();
  public pharmacyReceipt: PharmacyReceiptModel = new PharmacyReceiptModel();
  public patBillHistory = {
    IsLoaded: false,
    PatientId: null,
    CreditAmount: null,
    ProvisionalAmt: null,
    TotalDue: null,
    DepositBalance: null,
    BalanceAmount: null
  };

  public currentCounter: number = null;
  public total: number = 0;

  constructor(
    public routeFromService: RouteFromService,
    public router: Router,
    public pharmacyService: PharmacyService,
    public patientService: PatientService,
    public securityService: SecurityService,
    public callbackservice: CallbackService,
    public messageboxService: MessageboxService,
    public pharmacyBLService: PharmacyBLService) {
    this.currentCounter = this.securityService.getPHRMLoggedInCounter().CounterId;
    if (this.currentCounter < 1) {
      this.callbackservice.CallbackRoute = '/Pharmacy/Sale/New'
      this.router.navigate(['/Pharmacy/ActivateCounter']);
    }
    else {
      this.creditBillGridColumns = GridColumnSettings.BillCreditBillSearch;
      this.GetUnpaidTotalBills();
      this.GetAllFiscalYrs();
      //this.LoadPatientInvoiceSummary(this.patientService.getGlobal().PatientId);
    }

  }
  ngOnDestroy() {
    this.patientService.CreateNewGlobal();
    this.showCancelSummaryPanel = false;
    this.showActionPanel = false;
    this.allCreditItems = [];
    this.cancelledItems = [];
    this.showPatBillHistory = false;
  }

  //gets summary of all patients
  GetUnpaidTotalBills() {
    this.pharmacyBLService.GetAllCreditSummary()
      .subscribe((res: DanpheHTTPResponse) => {
        this.patientService
        this.provisionalBillsSummary = res.Results;
      });


  }


  //gets credit items of single patient. 
  GetPatientProvisionalItems(patientId: number) {

    this.pharmacyBLService.GetPatientCreditItems(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allCreditItems = res.Results;
          if (this.isPrint == true) {
            if (this.allCreditItems) {
              this.AssignAllValues();
              this.currSaleItems = this.allCreditItems;
              this.AllCalculation();
              let invoicedetails = this.currSale;
            }
            this.ProvisionalDataReceipt(res);
          }
        }
        this.allCreditItems.forEach((item, index) => {
          item.DispatchQty = item.Quantity;
          item.ReturnQty = 0;
        });
        this.allCreditItems
        this.allCreditItems.forEach(function (val) {
          val.IsSelected = false;
        });
        this.selectAllItems = true;
        this.SelectAllChkOnChange();
      });


  }



  ShowPatientProvisionalItems(row): void {
    this.showAllPatient = false;
    //patient mapping later used in receipt print
    this.currentPatient.ShortName = row.ShortName;
    this.currentPatient.FirstName = row.FirstName;
    this.currentPatient.LastName = row.LastName;
    this.currentPatient.PatientCode = row.PatientCode;
    this.currentPatient.DateOfBirth = row.DateOfBirth;
    this.currentPatient.Gender = row.Gender;
    this.currentPatient.Address = row.Address;
    this.currentPatient.PANNumber = row.PANNumber;
    this.currentPatient.PatientId = row.PatientId;
    this.currentPatient.PhoneNumber = row.PhoneNumber;
    this.currentPatient.CreatedOn = row.TransactionDate;
    var patient = this.patientService.CreateNewGlobal();
    patient.ShortName = row.ShortName;
    patient.PatientCode = row.PatientCode;
    patient.DateOfBirth = row.DateOfBirth;
    patient.Gender = row.Gender;
    patient.PatientId = row.PatientId;
    patient.PhoneNumber = row.PhoneNumber;
    this.currBillingContext = null;
    this.admissionDetail = null;
    this.GetPatientProvisionalItems(patient.PatientId);
    //this.LoadPatientBillingContext(patient.PatientId);
  }


  //PrintReceipt() {
  //    //Post to server from here..
  //    this.msgBoxServ.showMessage("success", ["Items Successfully posted to Server"]);
  //}

  CreditBillGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "showDetails":
        {
          var data = $event.Data;
          this.ShowPatientProvisionalItems(data);
          this.LoadPatientInvoiceSummary(this.patientService.getGlobal().PatientId);
        }
        break;
      case "view": {
        if ($event.Data != null) {
          var CreditData = $event.Data;
          this.isPrint = true;
          this.ShowPatientProvisionalItems(CreditData);
        }
        break;
      }
      default:
        break;
    }
  }

  BackToGrid() {
    this.showAllPatient = true;
    //reset current patient value on back button.. 
    this.patientService.CreateNewGlobal();
    this.showCancelSummaryPanel = false;
    this.showActionPanel = false;
    this.allCreditItems = [];
    this.cancelledItems = [];
    this.showPatBillHistory = false;
  }

  SelectAllChkOnChange() {
    if (this.allCreditItems && this.allCreditItems.length) {
      if (this.selectAllItems) {

        this.allCreditItems.forEach(itm => {
          itm.IsSelected = true;
        });
        //push all CreditItems to CurrentSaleItems when Select All is clicked.
        this.currSaleItems = this.allCreditItems.map(itm => {
          return itm;
        })
        this.showActionPanel = true;
      }
      else {
        this.allCreditItems.forEach(itm => {
          itm.IsSelected = false;
        });

        this.currSaleItems = [];//reset currSalesItem when SelectAll was Unchecked.

        this.showActionPanel = false;

      }
      this.AllCalculation();
      //this.CalculateTotalAmt();
    }
  }

  //Sets the component's check-unchecked properties on click of Component-Level Checkbox.
  SelectItemChkOnChange(item: BillingTransactionItem) {

    //show action panel if any one of item is checked.
    if (this.allCreditItems.find(itm => itm.IsSelected)) {
      this.showActionPanel = true;
    }
    else {
      this.showActionPanel = false;
    }

    if ((this.allCreditItems.every(a => a.IsSelected == true))) {
      this.selectAllItems = true;
    }
    else {
      this.selectAllItems = false;
    }

    this.currSaleItems = this.allCreditItems.filter(itm => itm.IsSelected);
    this.AllCalculation();
    //this.CalculateTotalAmt();
  }



  CancelItems() {
    if (this.remarks && this.remarks != "") {

      var a = window.confirm("are you sure you want to cancel?")
      if (a) {
        let selectedBilItems = this.allCreditItems.filter(b => b.IsSelected);
        let txnItemsToCancel = selectedBilItems.map(bil => {
          bil.CancelRemarks = this.currSale.Remark;//we should use same remarks for both payment and cancellation.
        });

      }
      else {

      }
    }
    else {
      this.messageboxService.showMessage("error", ["Remarks is mandatory for cancellation."]);


    }
  }

  //OnCancelSuccess(itms: Array<BillingTransactionItem>) {
  //    this.showActionPanel = false;
  //    this.remarks = null;
  //    this.msgBoxServ.showMessage("success", ["Items Cancelled successfully"]);
  //    if (itms) {
  //        itms.forEach(itm => {
  //            let itmId = itm.BillingTransactionItemId;
  //            let itmIndex = this.allCreditItems.findIndex(a => a.BillingTransactionItemId == itm.BillingTransactionItemId);
  //            if (itmIndex >= 0) {
  //                this.allCreditItems.splice(itmIndex, 1);//this will remove current item from receipt details list.
  //                this.cancelledItems.push(itm);
  //                this.showCancelSummaryPanel = true;
  //            }
  //        });

  //    }
  //}


  //sud: 13May'18--to display patient's bill history

  //LoadPatientPastBillSummary(patientId: number) {
  //    this.billingBLService.GetPatientPastBillSummary(patientId)
  //        .subscribe(res => {
  //            if (res.Status == "OK") {
  //                this.patBillHistory = res.Results;
  //                this.patBillHistory.ProvisionalAmt = CommonFunctions.parseAmount(this.patBillHistory.ProvisionalAmt);
  //                this.patBillHistory.BalanceAmount = CommonFunctions.parseAmount(this.patBillHistory.BalanceAmount);
  //                this.patBillHistory.DepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
  //                this.patBillHistory.CreditAmount = CommonFunctions.parseAmount(this.patBillHistory.CreditAmount);
  //                this.patBillHistory.TotalDue = CommonFunctions.parseAmount(this.patBillHistory.TotalDue);
  //                this.patBillHistory.IsLoaded = true;
  //                this.showPatBillHistory = true;
  //            }
  //            else {
  //                this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
  //                this.loading = false;
  //            }
  //        });
  //}

  //LoadPatientBillingContext(patientId) {
  //    this.billingBLService.GetPatientBillingContext(patientId)
  //        .subscribe((res: DanpheHTTPResponse) => {
  //            if (res.Status == "OK") {
  //                this.currBillingContext = res.Results;
  //                this.billingService.BillingType = this.currBillingContext.BillingType;
  //                //if (this.currBillingContext.BillingType.toLowerCase() == "inpatient") {
  //                //    this.GetAdmissionDetail(patientId);
  //                //}
  //            }
  //        });
  //}




  //start: Changes for Pharmacy : sud--4Sept'18
  public currSale: PHRMInvoiceModel = new PHRMInvoiceModel();
  public currSaleItems: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();
  public currSaleItemsRetOnly: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();

  //end: Changes for Pharmacy : sud--4Sept'18
  ValueChanged(index) {
    try {
      if (this.currSaleItems[index].Quantity > this.currSaleItems[index].TotalQty) {
        // this.currSaleItems[index].Quantity = null;
        this.currSaleItems[index].IsDirty('Quantity');

        //this.currSaleItems[index].InvoiceItemsValidator.controls["Quantity"].setErrors({ 'incorrect': true });
      }
      this.currSaleItems[index].Quantity = this.currSaleItems[index].DispatchQty - this.currSaleItems[index].ReturnQty;
      let temp = (this.currSaleItems[index].Quantity - this.currSaleItems[index].FreeQuantity) * this.currSaleItems[index].MRP;
      let subtotal = temp - (this.currSaleItems[index].DiscountPercentage * temp) / 100;
      this.currSaleItems[index].SubTotal = CommonFunctions.parseAmount(subtotal);
      this.currSaleItems[index].TotalAmount = CommonFunctions.parseAmount(subtotal + (this.currSaleItems[index].VATPercentage * this.currSaleItems[index].SubTotal) / 100);
      this.currSale.Tender = CommonFunctions.parseAmount(this.currSale.TotalAmount);
      this.AllCalculation();
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //Method for all calculation
  AllCalculation(discPer?, discAmt?) {
    try {
      if (this.currSaleItems.length > 0) {
        var subTotal: number = 0;
        this.currSale.SubTotal = 0;
        this.currSale.TotalAmount = 0;
        this.currSale.VATAmount = 0;
        this.currSale.DiscountAmount = 0;
        for (var i = 0; i < this.currSaleItems.length; i++) {
          this.currSale.SubTotal = CommonFunctions.parseAmount(this.currSale.SubTotal + this.currSaleItems[i].SubTotal);
          this.currSale.TotalAmount = CommonFunctions.parseAmount(this.currSale.TotalAmount + this.currSaleItems[i].TotalAmount);
          let temp = (this.currSaleItems[i].Quantity - this.currSaleItems[i].FreeQuantity) * this.currSaleItems[i].MRP;
          this.currSale.DiscountAmount = CommonFunctions.parseAmount(this.currSale.DiscountAmount + (temp - this.currSaleItems[i].SubTotal));

        }
        this.currSale.VATAmount = CommonFunctions.parseAmount(this.currSale.TotalAmount - this.currSale.SubTotal);

        //for bulk discount calculation and conversion of percentage into amount and vice versa

        if (discPer == 0 && discAmt > 0) {
          this.currSale.TotalAmount = this.currSale.TotalAmount - discAmt;
          this.currSale.DiscountAmount = discAmt;
          discPer = (discAmt / this.currSale.SubTotal) * 100;
          this.currSale.DiscountPer = CommonFunctions.parsePhrmAmount(discPer);
        }
        if (discPer > 0 && discAmt == 0) {
          discAmt = CommonFunctions.parsePhrmAmount(this.currSale.TotalAmount * (discPer) / 100)
          this.currSale.TotalAmount = this.currSale.SubTotal - discAmt;
          this.currSale.DiscountAmount = discAmt;
          this.currSale.DiscountPer = discPer;
        }
        if (discPer == 0 && discAmt == 0) {
          this.currSale.SubTotal = this.currSale.SubTotal;
          this.currSale.TotalAmount = this.currSale.TotalAmount;
          //this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parseAmount(DAmount);
          //this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parseAmount(VAmount);
          this.currSale.DiscountAmount = discAmt;
          this.currSale.DiscountPer = discPer;
        }
        this.currSale.Tender = CommonFunctions.parseAmount(this.currSale.TotalAmount);
        this.currSale.DiscountAmount = CommonFunctions.parsePhrmAmount(this.currSale.SubTotal * (this.currSale.DiscountPer) / 100);
        this.currSale.TotalAmount = CommonFunctions.parseAmount(this.currSale.SubTotal - this.currSale.DiscountAmount);
        this.currSale.Change = CommonFunctions.parseAmount(this.currSale.Tender - this.currSale.TotalAmount);
        this.currSale.PaidAmount = CommonFunctions.parseFinalAmount(this.currSale.SubTotal - this.currSale.DiscountAmount);
        this.currSale.Adjustment = CommonFunctions.parseAmount(this.currSale.PaidAmount - this.currSale.TotalAmount);
        //this.currSale.PatientId = this.currSale.InvoiceItems[0].
        if (!this.isPrint)
          this.ChangeTenderAmount();
        //else {
        //    this.goodsReceiptVM.goodReceipt.SubTotal = CommonFunctions.parseAmount(STotal);
        //    this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parseAmount(TAmount) - this.goodsReceiptVM.goodReceipt.DiscountAmount;
        //    //this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parseAmount(DAmount);
        //    this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parseAmount(VAmount);
        //}
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }

  ChangeTenderAmount() {
    this.currSale.Change = CommonFunctions.parseAmount(this.currSale.Tender - this.currSale.PaidAmount);
  }

  //This function only for show catch messages
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.routeFromService.RouteFrom = null;
      this.messageboxService.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
      //this.messageboxService.showMessage("error", [ex.message + "     " + ex.stack]);
    }
  }
  //after invoice is succesfully added this function is called.
  CallBackSaveSale(res) {
    try {
      if (res.Status == "OK") {
        let txnReceipt = PharmacyReceiptModel.GetReceiptForTransaction(res.Results);

        // txnReceipt.ReceiptNo = res.InvoiceId;//////Math.floor(Math.random() * 100) + 1;
        //txnReceipt.ReceiptDate = moment().format("YYYY-MM-DD"); 
        txnReceipt.IsValid = true;
        txnReceipt.ReceiptType = "Sale Receipt";
        txnReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;

        txnReceipt.Patient = this.currentPatient;
        txnReceipt.CurrentFinYear = this.allFiscalYrs.find(f => f.FiscalYearId == res.Results.FiscalYearId).FiscalYearName;
        this.pharmacyService.globalPharmacyReceipt = txnReceipt;
        this.router.navigate(['/Pharmacy/Sale/ReceiptPrint']);
        this.currSale = new PHRMInvoiceModel();
        this.currSaleItems = new Array<PHRMInvoiceItemsModel>();
        this.messageboxService.showMessage("success", ["Succesfully. "]);
        this.loading = false;
      }
      else {
        this.messageboxService.showMessage("failed", [res.ErrorMessage]);
        this.loading = false;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  ProvisionalDataReceipt(res) {
    try {
      if (res.Status == "OK") {

        this.loading = true;
        this.currSale.InvoiceItems = this.currSaleItems;
        let invoicedetails = this.currSale;
        let txnReceipt = PharmacyReceiptModel.GetReceiptForTransaction(this.currSale);
        //   txnReceipt.ReceiptDate = moment().format("YYYY-MM-DD hh.mm.ss"); 

        txnReceipt.ReceiptDate = moment().format("YYYY-MM-DD HH:mm");
        txnReceipt.IsValid = true;
        txnReceipt.ReceiptType = "Credit Receipt";
        txnReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
        txnReceipt.Patient = this.currentPatient;
        this.pharmacyService.globalPharmacyReceipt = txnReceipt;
        this.router.navigate(['/Pharmacy/Sale/ReceiptPrint']);
        this.currSale = new PHRMInvoiceModel();
        this.currSaleItems = new Array<PHRMInvoiceItemsModel>();
        this.messageboxService.showMessage("success", ["Succesfully. "]);
        this.loading = false;
      }
      else {
        this.messageboxService.showMessage("failed", [res.ErrorMessage]);
        this.loading = false;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  PrintReceipt(): void {
    try {
      let check: boolean = true;
      if (check) {

        this.loading = true;
        this.currSale.InvoiceItems = this.currSaleItems;
        let invoicedetails = this.currSale;
        this.pharmacyBLService.AddInvoiceForCreditItems(this.currSale)
          .subscribe(res => {
            if (res.Status == "OK" && res.Results != null) {

              this.CallBackSaveSale(res),
                this.loading = false;
            }
            else if (res.Status == "Failed") {
              this.loading = false;
              this.messageboxService.showMessage("error", ['There is problem, please try again']);

            }
          },
            err => {
              this.loading = false;
              this.messageboxService.showMessage("error", [err.ErrorMessage]);
            });
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  update(): void {
    try {
      let check: boolean = true;
      if (check) {

        this.loading = true;
        this.currSale.InvoiceItems = this.currSaleItems;

        this.pharmacyBLService.updateInvoiceForCreditItems(this.currSaleItems)
          .subscribe(res => {
            if (res.Status == "OK" && res.Results != null) {

              this.currSaleItems = res.Results;
              for (var i = 0; i < this.currSaleItems.length; i++) {
                if (this.currSaleItems[i].ReturnQty != 0) {
                  this.currSaleItems[i].TotalAmount = this.currSaleItems[i].ReturnQty * this.currSaleItems[i].MRP;
                  this.currSaleItemsRetOnly.push(this.currSaleItems[i]);
                }
                //var x = this.currSaleItems[i].ReturnQty
                //if (this.currSaleItems[i].Quantity == 0) {
                //    this.currSaleItems.splice(i, 1);
                //}
              }


              this.CallBackupdaeInvoice(res),
                this.loading = false;
            }
            else if (res.Status == "Failed") {
              this.loading = false;
              this.messageboxService.showMessage("error", ['There is problem, please try again']);

            }
          },
            err => {
              this.loading = false;
              this.messageboxService.showMessage("error", [err.ErrorMessage]);
            });

      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  CallBackupdaeInvoice(res) {
    try {
      if (res.Status == "OK") {
        var newSaleItem = new PHRMInvoiceItemsModel();
        this.currSaleItemsRetOnly.unshift(newSaleItem);
        this.currSaleItemsRetOnly.reduce((previousValue, currentValue) => {
            previousValue.TotalAmount = previousValue.TotalAmount + currentValue.TotalAmount;
            return previousValue;
        });
        this.total = this.currSaleItemsRetOnly[0].TotalAmount;
        this.currSaleItemsRetOnly.shift();
        this.showSaleItemsPopup = true;
      }
      else {
        this.messageboxService.showMessage("failed", [res.ErrorMessage]);
        this.loading = false;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }


  //This method make all invoice property value initialization
  AssignAllValues() {
    try {
      //Initialize  invoice details for Post to db
      this.currSale.BilStatus = (this.currSale.TotalAmount == this.currSale.PaidAmount) ? "paid" : (this.currSale.PaidAmount > 0) ? "partial" : "unpaid";
      this.currSale.CreditAmount = CommonFunctions.parseAmount(this.currSale.TotalAmount - this.currSale.PaidAmount);
      //this.currSale.IsOutdoorPat = this.currSale.selectedPatient.IsOutdoorPat;
      //this.currSale.PatientId = this.currSale.selectedPatient.PatientId;

      //Initialize Invoice Items  details for post to database
      //Initialize Invoice IteCheckValidaitonms  details for post to database
      for (var i = 0; i < this.currSaleItems.length; i++) {
        //lots of workaround here--need to revise and update properly--sud:8Feb18
        //assign value from searchTbx selected item only if searchTbx is enabled, else we already have other values assigned to the model.

        this.currSaleItems[i].CompanyId = this.currSaleItems[i].selectedItem.CompanyId;
        this.currSaleItems[i].ItemId = this.currSaleItems[i].selectedItem.ItemId;
        this.currSaleItems[i].ItemName = this.currSaleItems[i].selectedItem.ItemName;
      }


    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  // for cancel the credit bill.
  Cancel() {
    if (confirm("Are you Sure to Cancel this credit bill ")) {
      try {
        this.pharmacyBLService.CancelCreditBill(this.allCreditItems)
          .subscribe(res => {
            if (res.Status == "OK" && res.Results != null) {
              this.messageboxService.showMessage("success", ["Succesfully Credit Bill Canceled. "]);
              this.GetUnpaidTotalBills();
              this.BackToGrid();
            }
            else if (res.Status == "Failed") {
              this.messageboxService.showMessage("error", ['There is problem, please try again']);
            }
          },
            err => {
              this.loading = false;
              this.messageboxService.showMessage("error", [err.ErrorMessage]);
            });
      }
      catch (exception) {
        this.ShowCatchErrMessage(exception);
      }
    }
  }
  Close() {
    this.showSaleItemsPopup = false;
    this.GetUnpaidTotalBills();
    this.total = 0;
    this.showAllPatient = true;
    this.showActionPanel = false;
  }
  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    //popupWinindow.document.write('<html><head><link href="../assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

    popupWinindow.document.close();
    this.showSaleItemsPopup = false;
    this.GetUnpaidTotalBills();
    this.showAllPatient = true;
    this.showActionPanel = false;
  }

  LoadPatientInvoiceSummary(patientId: number) {
    this.pharmacyBLService.GetPatientSummary(patientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.patBillHistory = res.Results;
          this.patBillHistory.ProvisionalAmt = CommonFunctions.parseAmount(this.patBillHistory.ProvisionalAmt);
          this.patBillHistory.BalanceAmount = CommonFunctions.parseAmount(this.patBillHistory.BalanceAmount);
          this.patBillHistory.DepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
          this.patBillHistory.TotalDue = CommonFunctions.parseAmount(this.patBillHistory.TotalDue);
          this.patBillHistory.IsLoaded = true;
        }
        else {
          this.messageboxService.showMessage("Select Patient", [res.ErrorMessage]);
          this.loading = false;
        }
      });
  }
  //Change the Checkbox value and call Calculation logic from here. 
  DepositDeductCheckBoxChanged() {
    this.checkDeductfromDeposit = true;
    this.CalculateDepositBalance();
  }
  public newdepositBalance: number = 0;
  public depositDeductAmount: number = 0;

  GetAllFiscalYrs() {
    this.pharmacyBLService.GetAllFiscalYears()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allFiscalYrs = res.Results;
        }
      });
  }

  CalculateDepositBalance() {
    if (this.deductDeposit) {
      if (this.patBillHistory.DepositBalance > 0) {
        this.newdepositBalance = this.patBillHistory.DepositBalance - this.currSale.PaidAmount;
        this.newdepositBalance = CommonFunctions.parseAmount(this.newdepositBalance);
        if (this.newdepositBalance >= 0) {
          this.depositDeductAmount = this.currSale.PaidAmount;
          this.currSale.Tender = null;
          this.currSale.Tender = 0;
          this.currSale.Change = 0;
        }
        else {
          this.currSale.Tender = -(this.newdepositBalance);//Tender is set to positive value of newDepositBalance.
          this.depositDeductAmount = this.patBillHistory.DepositBalance;//all deposit has been returned.
          this.newdepositBalance = 0;//reset newDepositBalance since it's all Used NOW. 
          this.currSale.Change = 0;//Reset Change since we've reset Tender above.
        }
      }
      else {
        this.messageboxService.showMessage("Failed", ["Deposit balance is zero, Please add deposit to use this feature."]);
        this.deductDeposit = !this.deductDeposit;
      }
    }
    else {
      //reset all required properties..
      this.currSale.Tender = this.currSale.TotalAmount;
      this.newdepositBalance = this.patBillHistory.DepositBalance;
      this.depositDeductAmount = 0;
      this.currSale.Change = 0;
    }
  }
}
