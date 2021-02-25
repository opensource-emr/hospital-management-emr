/*
 FILE: billing-transaction-item.component.ts
 CREATED: 28Jan'17-Dinesh
 DESCRIPTION: this page is a summary page before payment.
             -- actions allowed  i. Discount on receipt level, ii. Partial Billing, iv. Deposit Deduction, 
             -- before coming to this page, BillingTransaction model should be filled with required TransactionItems.
             -- user cannot change Price/Quantity/Item level-Discount from this page.
             -- currently we're routing from 1. BillingTransaction 2.UnpaidBills pages to this one.
 NOTE:  This is the page with HIGHEST SIGNIFICANCE in BILLING MODULE, also It's fragile in some part, so change/update carefully.
 KNOWN ISSUES: [ negative discount percent is not handled ]
 REMARKS:  try to change later so that the function CalculationForAll() could be used for all types of calculation.
           currently ChangeSubtotal() function is used to handle the initial loading and Partial Payment
          -- Add dynamic validation for remarks instead of showing an alert.         
 -------------------------------------------------------------------
 change history:
 -------------------------------------------------------------------
 S.No     UpdatedBy/Date             description           remarks
 -------------------------------------------------------------------
 1.       Dinesh/28Jan'17           created                 
 -------------------------------------------------------------------
 */
import { Component, OnChanges, SimpleChanges, DoCheck, Input, AfterContentChecked, Injector, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router'
import { PatientService } from '../../patients/shared/patient.service';
import { CallbackService } from '../../shared/callback.service';
import { BillingService } from '../shared/billing.service';
import { BillingBLService } from '../shared/billing.bl.service';
import { BillingTransaction } from '../shared/billing-transaction.model';
import { BillingTransactionItem } from "../shared/billing-transaction-item.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../shared/routefrom.service';
import { SecurityService } from '../../security/shared/security.service';
import { BillingDeposit } from '../shared/billing-deposit.model';
import { CommonFunctions } from '../../shared/common.functions';
import * as moment from 'moment/moment';
import { BillingReceiptModel } from '../shared/billing-receipt.model';
import { DanpheHTTPResponse } from "../../shared/common-models";
import { ENUM_BillingStatus, ENUM_InvoiceType } from '../../shared/shared-enums';
import { CoreService } from '../../core/shared/core.service';
import { CreditOrganization } from '../../settings-new/shared/creditOrganization.model';
//sud:5May'18--BackButtonDisable is not working as expected, correct and implement later
//import { BackButtonDisable } from "../../core/shared/backbutton-disable.service";

@Component({
  templateUrl: "./billing-transaction-item.html"// "/BillingView/BillingTransactionItem"
})
// App Component class
export class BillingTransactionItemComponent {
  public model: BillingTransaction = new BillingTransaction();
  public BillingTransactionItems: Array<BillingTransactionItem> = null;
  public currencyUnit: string = null;
  loading: boolean = false;
  public checkDeductfromDeposit: boolean = false; //flag to check checkbox selected

  public creditOrganizationsList: Array<CreditOrganization> = new Array<CreditOrganization>();
  public CreditOrganizationMandatory: boolean = false;

  //sud: 13May'18--to display patient bill summary
  public patBillHistory = {
    IsLoaded: false,
    PatientId: null,
    CreditAmount: null,
    ProvisionalAmt: null,
    TotalDue: null,
    DepositBalance: null,
    BalanceAmount: null
  };

  public showProvisionalReceipt: boolean = false;

  constructor(public billingService: BillingService,
    public routeFromService: RouteFromService,
    public router: Router,
    public callbackService: CallbackService,
    public BillingBLService: BillingBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public patientService: PatientService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService) {
    //this.BackButton.DisableBackButton();
    this.currencyUnit = this.billingService.currencyUnit;
    this.model = this.billingService.getGlobalBillingTransaction();

    this.model.CounterId = this.securityService.getLoggedInCounter().CounterId;
    //route to counteractivation if conter no counter is selected.
    if (this.model.CounterId < 1) {
      this.router.navigate(['/Billing/CounterActivate']);
    }
    //route to patient search if patient is not selected. Happens if User reloads this page 
    else if (!this.model.PatientId) {
      this.router.navigate(['/Billing/SearchPatient']);
    }
    else {
      let patientId = this.model.PatientId;
      this.LoadPatientPastBillSummary(patientId);
      this.ChangeSubTotal();//check once more if we can use CalculationForAll for this. 

      //assign default values to model and billingItems.
      this.model.PaymentMode = "cash";
      this.model.BillStatus = "paid";
      this.model.BillingTransactionItems.forEach(item => {
        item.BillStatus = ENUM_BillingStatus.paid;// "paid";
        item.DiscountPercentAgg = CommonFunctions.parseAmount(item.DiscountPercentAgg);//sud:12Mar'19--to round off disc. percent for display
      });

      this.creditOrganizationsList = this.billingService.AllCreditOrganizationsList;
      this.CreditOrganizationMandatory = this.coreService.LoadCreditOrganizationMandatory();//pratik: 26feb'20 --Credit Organization compulsoryor not while Payment Mode is credit 
    }
  }

  //sud: 13May'18--to display patient's bill history
  LoadPatientPastBillSummary(patientId: number) {
    this.BillingBLService.GetPatientPastBillSummary(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.patBillHistory = res.Results;
          //provisional amount should exclude itmes those are listed for payment in current window.
          this.patBillHistory.ProvisionalAmt = CommonFunctions.parseAmount(this.patBillHistory.ProvisionalAmt - this.model.TotalAmount);
          this.patBillHistory.TotalDue = CommonFunctions.parseAmount(this.patBillHistory.CreditAmount + this.patBillHistory.ProvisionalAmt);
          this.patBillHistory.BalanceAmount = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance - this.patBillHistory.TotalDue);
          this.patBillHistory.IsLoaded = true;
          //this.currentDepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
          //this.newDepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
          this.patBillHistory.DepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
          this.currentDepositBalance = this.patBillHistory.DepositBalance;
          this.newDepositBalance = this.currentDepositBalance;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          this.loading = false;
        }
      });
  }

  //updates the billing Transaction only after the amount paid by the patient
  PostBillingTransaction() {
    this.loading = true;

    if (this.model.DiscountPercent < 0 || this.model.DiscountPercent > 100) {
      this.msgBoxServ.showMessage("failed", ["Please enter valid Total Discount Percent."]);
      this.loading = false;
      return;
    }
    //this is to set final discount percent before going to the server, 
    //earlier it was in modelchange event, and which was causing it to fire twice and hence wrong calculation. --sud:12Aug'17
    this.model.DiscountPercent = CommonFunctions.parseAmount(this.model.DiscountAmount * 100 / (this.model.SubTotal));

    if (this.CheckBillingValidations()) {
      //ashim: 26Aug2018: Moved to server side.
      //this.model.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      //this.model.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");

      if (this.model.InvoiceType != ENUM_InvoiceType.inpatientPartial) {//&& this.model.InvoiceType != ENUM_InvoiceType.inpatientDischarge
        this.model.TransactionType = this.billingService.BillingType;
      }

      if (this.model.Change >= 0) {
        //added: sud: 1June'18
        this.model.DepositBalance = this.newDepositBalance;
        this.model.DepositReturnAmount = this.depositDeductAmount;
        this.model.PaidAmount = this.GetPaidAmount();//sud: 4june'18

        if (this.model.BillingTransactionItems.length > 0) {

          //to add taxable amount for current transaction. 
          let totTaxableAmt: number = 0, totNonTaxableAmt: number = 0;
          this.model.BillingTransactionItems.forEach(bil => {
            totTaxableAmt += bil.TaxableAmount;
            totNonTaxableAmt += bil.NonTaxableAmount;
          });
          this.model.TaxableAmount = totTaxableAmt;
          this.model.NonTaxableAmount = totNonTaxableAmt;

          this.model.TaxId = this.billingService.taxId;

          if (this.model.OrganizationId) {
            let org = this.creditOrganizationsList.find(a => a.OrganizationId == this.model.OrganizationId);
            this.model.OrganizationName = org.OrganizationName
          }

          this.BillingBLService.PostBillingTransaction(this.model)
            .subscribe((res: DanpheHTTPResponse) => {
              if (res.Status == "OK") {
                this.CallBackPostBillTxn(res.Results);
              }
              else {
                this.msgBoxServ.showMessage("failed", ["couldn't submit the request. please check the log for detail."], res.ErrorMessage);
                this.loading = false;
              }
            },
              err => {
                this.loading = false;
                this.msgBoxServ.showMessage("error", ["couldn't submit the request. please check the log for detail."], err);
              });
        }
        else {
          this.msgBoxServ.showMessage("error", ["Sorry..! Unable to process empty receipt."]);
          this.loading = false;//enables the submit button once all the calls are completed
        }


      }
      else {
        this.msgBoxServ.showMessage("error", ["The tender amount is less than the payable amount"]);
        this.loading = false;//enables the submit button once all the calls are completed
      }
    }
  }



  CheckBillingValidations(): boolean {
    let isFormValid = true;
    //show "Remarks is mandatory" if discount is filled but remarks is not added.. 
    if ((this.model.DiscountPercent && this.model.DiscountPercent > 0) && !this.model.Remarks) {
      this.msgBoxServ.showMessage("failed", ["Remarks is mandatory."]);
      this.loading = false;
      isFormValid = false;
    }

    if (this.model.PaymentMode == "credit") {
      if (this.CreditOrganizationMandatory && !this.model.OrganizationId) {
        isFormValid = false;
        this.loading = false;
        this.msgBoxServ.showMessage("failed", ["Credit Organization is mandatory for credit bill"]);
      }
      else if (!this.model.Remarks) {
        isFormValid = false;
        this.loading = false;
        this.msgBoxServ.showMessage("failed", ["Remarks is mandatory for credit bill"]);
      }
    }
    return isFormValid;
  }


  CallBackPostBillTxn(billingTxn: BillingTransaction) {

    this.model.BillingTransactionId = billingTxn.BillingTransactionId;
    //this.model.PaidDate = moment(billingTxn.PaidDate).format("YYYY-MM-DD HH:mm:ss");
    this.model.DiscountPercent = billingTxn.DiscountPercent;
    this.model.Remarks = billingTxn.Remarks;
    this.model.FiscalYear = billingTxn.FiscalYear;//sud:5May'18
    this.model.InvoiceCode = billingTxn.InvoiceCode;
    this.model.InvoiceNo = billingTxn.InvoiceNo;
    this.model.BillingTransactionId = billingTxn.BillingTransactionId;
    this.model.TaxId = billingTxn.TaxId;
    this.model.CreatedBy = billingTxn.CreatedBy;
    this.model.CreatedOn = billingTxn.CreatedOn;
    let txnReceipt = BillingReceiptModel.GetReceiptForTransaction(this.model);
    txnReceipt.Patient = Object.create(this.patientService.globalPatient);
    txnReceipt.IsValid = true;
    //txnReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
    txnReceipt.BillingUser = billingTxn.BillingUserName; //Yubraj 28th June '19
    txnReceipt.Remarks = this.model.Remarks;


    if (this.model.TransactionType && this.model.TransactionType.toLowerCase() == "inpatient" && this.routeFromService.RouteFrom == "inpatient") {
      if (this.model.InvoiceType != ENUM_InvoiceType.inpatientPartial) {
        txnReceipt.ReceiptType = "ip-receipt";
      }

    }

    this.billingService.globalBillingReceipt = txnReceipt;

    this.loading = false;//enables the submit button once all the calls are completed


    this.router.navigate(['Billing/ReceiptPrint']);


    //if (this.routeFromService.RouteFrom == "inpatient") {

    //}

  }


  //--------Calculation of the Form----------

  ChangeSubTotal() {
    this.model.SubTotal = 0;
    this.model.TotalQuantity = 0;
    let sum = 0;
    let subtotal = 0;
    let loopTax: number = 0;
    let calsubtotal: number = 0;
    let totalamount: number = 0;
    let totalTax: number = 0;
    let totaldiscount: number = 0;
    this.model.BillingTransactionItems.forEach(item => {
      this.model.TotalQuantity += item.Quantity;
      //this.model.SubTotal += item.TotalAmount;

      subtotal = item.Quantity * item.Price;
      //item.TotalAmount = CommonFunctions.parseAmount(subtotal)
      let DiscountedAmountTotal = (subtotal - (item.DiscountPercentAgg / 100) * subtotal);
      loopTax = (item.TaxPercent * (DiscountedAmountTotal / 100));
      item.TotalAmount = CommonFunctions.parseAmount(DiscountedAmountTotal + item.Tax);
      item.TaxableAmount = item.IsTaxApplicable ? CommonFunctions.parseAmount(item.SubTotal - item.DiscountAmount) : 0;
      item.NonTaxableAmount = item.IsTaxApplicable ? 0 : CommonFunctions.parseAmount(item.SubTotal - item.DiscountAmount);
      totalTax = totalTax + loopTax;
      //calsubtotal = calsubtotal + subtotal + loopTax;//**
      calsubtotal = calsubtotal + subtotal;
      this.model.DiscountPercent = 0;
      sum = sum + (item.Quantity * item.Price);
      totalamount = totalamount + item.TotalAmount;
      totaldiscount = totaldiscount + item.DiscountPercentAgg * subtotal / 100;
      item.Price = CommonFunctions.parseAmount(item.Price);
      //}
    });
    //this.model.TaxTotal = totalTax;
    this.model.SubTotal = CommonFunctions.parseAmount(calsubtotal);
    this.model.DiscountAmount = CommonFunctions.parseAmount(totaldiscount);
    this.model.TaxTotal = CommonFunctions.parseAmount(totalTax);
    //this.model.DiscountAmount = this.model.SubTotal - sum;
    this.model.TotalAmount = CommonFunctions.parseAmount(totalamount);
    this.model.DiscountPercent = CommonFunctions.parseAmount(this.model.DiscountAmount * 100 / (this.model.SubTotal));
    this.model.Tender = this.model.TotalAmount;
    this.ChangeTenderAmount();
  }

  ChangeTenderAmount() {
    if (this.deductDeposit) {
      this.model.Change = CommonFunctions.parseAmount(this.model.Tender + this.depositDeductAmount - this.model.TotalAmount);
    }
    else {
      this.model.Change = CommonFunctions.parseAmount(this.model.Tender - (this.model.TotalAmount));
    }
  }


  Calculationforall() {

    let DP: number = 0; //discountPercent for the model (aggregate total) 
    let dp_item: number = 0; // discountPercent for individual item
    let totalTax: number = 0;
    let loopTax: number = 0;
    let SubTotal: number = 0;
    let totalAmount: number = 0;
    let totalAmountAgg: number = 0;
    let totalQuantity: number = 0;
    let subtotal: number = 0;
    let calsubtotal: number = 0;
    let subtotalfordiscountamount: number = 0;
    DP = this.model.DiscountPercent;
    let successiveDiscount: number = 0;
    let totalAmountforDiscountAmount: number = 0;
    let DiscountAgg: number = 0;
    let DiscountedAmountTotalAggnew: number = 0;
    //-------------------------------------------------------------------------------------------------------------------------------
    for (var i = 0; i < this.model.BillingTransactionItems.length; i++) {
      let curRow = this.model.BillingTransactionItems[i];

      dp_item = curRow.DiscountPercent;
      //don't change discountpercentagg if current row already has it. 
      curRow.DiscountPercentAgg = curRow.DiscountPercentAgg ? curRow.DiscountPercentAgg : CommonFunctions.parseAmount(dp_item);
      subtotal = (curRow.Quantity * curRow.Price); //100
      let DiscountedAmountItem = (subtotal - (dp_item / 100) * subtotal) //Discounted Amount for individual Item 
      let DiscountedAmountTotal = (DiscountedAmountItem - DP * DiscountedAmountItem / 100); // Discounted Amount From the Total Discount //**
      let tax = (curRow.TaxPercent / 100 * (DiscountedAmountTotal));
      curRow.Tax = CommonFunctions.parseAmount(tax);
      curRow.Price = CommonFunctions.parseAmount(curRow.Price);
      //go for calculation even when models's discount percent is zero.
      if (DP >= 0) {
        successiveDiscount = ((100 - dp_item) / 100 * (100 - DP) / 100 * subtotal);
        let successiveDiscountAmount = successiveDiscount + curRow.TaxPercent / 100 * successiveDiscount;
        DiscountAgg = ((subtotal - successiveDiscountAmount) + curRow.Tax) * 100 / subtotal;
        curRow.DiscountPercentAgg = CommonFunctions.parseAmount(DiscountAgg);
        curRow.DiscountAmount = CommonFunctions.parseAmount(curRow.DiscountPercentAgg * subtotal / 100);
      }
      else {
        curRow.DiscountAmount = CommonFunctions.parseAmount(curRow.DiscountPercentAgg * subtotal / 100);
      }

      let DiscountedAmountTotalAgg = (DiscountedAmountItem - (DP * DiscountedAmountItem / 100));
      totalAmountAgg = DiscountedAmountTotalAgg + curRow.Tax;
      totalAmount = DiscountedAmountTotal + curRow.Tax;
      curRow.TotalAmount = CommonFunctions.parseAmount(totalAmount);
      //separate taxable and non-taxable amount based on IsTaxApplicable field.
      //@Ashim: Pls check here if we have Those two fields or not in currRow
      curRow.TaxableAmount = curRow.IsTaxApplicable ? curRow.SubTotal - curRow.DiscountAmount : 0;
      curRow.NonTaxableAmount = curRow.IsTaxApplicable ? 0 : curRow.SubTotal - curRow.DiscountAmount;

      totalAmountforDiscountAmount = totalAmountforDiscountAmount + curRow.DiscountPercentAgg * subtotal / 100;
      //totalAmountforDiscountAmount = totalAmountforDiscountAmount + subtotal - DiscountedAmountTotalAgg;
      loopTax = (curRow.TaxPercent * DiscountedAmountTotalAgg / 100);
      totalTax = totalTax + loopTax;
      SubTotal = SubTotal + totalAmountAgg;
      let CurQuantity = curRow.Quantity;
      totalQuantity = totalQuantity + CurQuantity;
      subtotalfordiscountamount = subtotalfordiscountamount + subtotal;
      calsubtotal = calsubtotal + subtotal;
    }

    this.model.SubTotal = CommonFunctions.parseAmount(calsubtotal);
    this.model.TotalQuantity = totalQuantity;
    this.model.DiscountAmount = CommonFunctions.parseAmount(totalAmountforDiscountAmount);
    this.model.TotalAmount = CommonFunctions.parseAmount(SubTotal);
    this.model.Tender = CommonFunctions.parseAmount(this.model.TotalAmount);
    this.model.TaxTotal = CommonFunctions.parseAmount(totalTax);

    if (this.checkDeductfromDeposit) {
      this.CalculateDepositBalance();
    }
  }

  //we need to set certain properties acc. to current payment mode. 
  OnPaymentModeChange() {
    if (this.model.PaymentMode == "credit") {
      this.model.PaidAmount = 0;
      this.model.BillStatus = "unpaid";
      this.model.PaidDate = null;
      this.model.PaidCounterId = null;//sud:29May'18
      this.model.Tender = 0;//tender is zero and is disabled in when credit
      if (this.model.BillingTransactionItems) {
        this.model.BillingTransactionItems.forEach(txnItm => {
          txnItm.BillStatus = ENUM_BillingStatus.unpaid;// "unpaid";
          txnItm.PaidDate = null;
        });
      }
    }
    else {
      this.model.Tender = this.model.TotalAmount;
      this.model.BillStatus = "paid";
      this.model.PaidDate = moment().format("YYYY-MM-DD HH:mm:ss");//default paiddate.
      this.model.PaidCounterId = this.securityService.getLoggedInCounter().CounterId;//sud:29May'18
      if (this.model.BillingTransactionItems) {
        this.model.BillingTransactionItems.forEach(txnItm => {
          txnItm.BillStatus = ENUM_BillingStatus.paid;// "paid";
          txnItm.PaidDate = moment().format("YYYY-MM-DD HH:mm:ss");
        });
      }
    }
  }

  PrintProvisionalSlip() {
    if (this.model.DiscountPercent < 0 || this.model.DiscountPercent > 100) {
      this.msgBoxServ.showMessage("error", ["Please enter valid Total Discount Percent."]);
      this.loading = false;
      return;
    }
    let txnReceipt = BillingReceiptModel.GetReceiptFromTxnItems(this.model.BillingTransactionItems);
    txnReceipt.Patient = Object.create(this.patientService.globalPatient);
    txnReceipt.IsValid = true;
    txnReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
    txnReceipt.Remarks = this.model.Remarks;
    txnReceipt.BillingDate = moment().format("YYYY-MM-DD HH:mm:ss");
    txnReceipt.ReceiptType = "provisional";
    txnReceipt.DepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
    this.billingService.globalBillingReceipt = txnReceipt;
    this.router.navigate(['Billing/ReceiptPrint']);
  }


  public deductDeposit: boolean = false;
  public currentDepositBalance: number = 0;
  public newDepositBalance: number = 0;
  public depositDeductAmount: number = 0;


  //Change the Checkbox value and call Calculation logic from here. 
  DepositDeductCheckBoxChanged() {
    //toggle Checked-Unchecked of 'Deduct From Deposit Checkbox'
    //this.deductDeposit = !this.deductDeposit;
    this.checkDeductfromDeposit = true;
    this.CalculateDepositBalance();
  }


  CalculateDepositBalance() {
    if (this.deductDeposit) {
      if (this.currentDepositBalance > 0) {
        let patientId = this.model.PatientId;
        this.newDepositBalance = this.currentDepositBalance - this.model.TotalAmount;
        this.newDepositBalance = CommonFunctions.parseAmount(this.newDepositBalance);
        if (this.newDepositBalance >= 0) {
          this.depositDeductAmount = this.model.Tender;
          this.model.Tender = null;
          this.changeDetector.detectChanges();
          this.model.Tender = 0;
          this.model.Change = 0;
        }
        //newDepositBalance will be in negative if it comes to else.
        else {
          this.model.Tender = -(this.newDepositBalance);//Tender is set to positive value of newDepositBalance.
          this.depositDeductAmount = this.currentDepositBalance;//all deposit has been returned.
          this.newDepositBalance = 0;//reset newDepositBalance since it's all Used NOW. 
          this.model.Change = 0;//Reset Change since we've reset Tender above.
        }
        //this.routeFromService.RouteFrom = "DepositDeductpart";        //ramavtar: 24Oct'18
      }
      else {
        this.msgBoxServ.showMessage("failed", ["Deposit balance is zero, Please add deposit to use this feature."]);
        this.deductDeposit = !this.deductDeposit;
      }
    }
    else {
      //reset all required properties..
      this.model.TransactionType = "ItemTransaction"
      this.model.Tender = this.model.TotalAmount;
      this.newDepositBalance = this.currentDepositBalance;
      this.depositDeductAmount = 0;
      this.model.DepositReturnAmount = 0;
      this.model.Change = 0;
      this.routeFromService.RouteFrom = ""; // while clicking the checkbox route from "DepositDeductpart" is assigning which must be initialize again to control the data to inserrt on the deposit table 
    }
  }

  //sud: 4June'18-- needed this function since there are lot of ifs and where for this calculation.
  GetPaidAmount(): number {
    let paidAmt = 0;
    if (this.model.PaymentMode == "credit") {
      paidAmt = 0;
    }
    else {
      paidAmt = this.model.Tender - this.model.Change;
      ////we need to have different logic for deposit deduction case.
      //if (this.deductDeposit) {

      //} else {
      //    this.model.PaidAmount = this.model.TotalAmount;
      //}
    }
    return paidAmt;
  }

  PaymentModeChanges($event) {
    this.model.PaymentMode = $event.PaymentMode;
    this.model.PaymentDetails = $event.PaymentDetails;

    this.OnPaymentModeChange();
  }

  CreditOrganizationChanges($event) {
    this.model.OrganizationName = $event.OrganizationName;
    this.model.OrganizationId = $event.OrganizationId;
  }

}
