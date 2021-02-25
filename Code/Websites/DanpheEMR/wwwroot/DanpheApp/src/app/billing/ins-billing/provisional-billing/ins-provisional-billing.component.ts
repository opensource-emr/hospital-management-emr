import { Component, ChangeDetectorRef } from "@angular/core";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { SecurityService } from "../../../security/shared/security.service";
import { CallbackService } from "../../../shared/callback.service";
import { Router } from "@angular/router";
import GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";
import { BillingBLService } from "../../shared/billing.bl.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { PatientService } from "../../../patients/shared/patient.service";
import { BillingTransactionItem } from "../../shared/billing-transaction-item.model";
import { BillingReceiptModel } from "../../shared/billing-receipt.model";
import * as moment from 'moment/moment';
import { BillingService } from "../../shared/billing.service";
import { Patient } from "../../../patients/shared/patient.model";
import { CommonFunctions } from "../../../shared/common.functions";
import { PatientBillingContextVM } from "../../shared/patient-billing-context-vm";
import { RouteFromService } from "../../../shared/routefrom.service";
import { BillingTransaction } from "../../shared/billing-transaction.model";
import { ENUM_BillingStatus } from "../../../shared/shared-enums";

@Component({
  templateUrl: './ins-provisional-billing.html'
})

// App Component class
export class INSProvisionalBillingComponent {
  public creditBillGridColumns: Array<any> = null;
  public InsuranceProvisionalBillsSummary: Array<any> = [];
  public counterId: number = 0;
  public showAllPatient: boolean = true;  // to show the form required to show the credit insurance details
  public receiptDetails: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();
  public patientDetails: Patient = new Patient();
  public selItem: any = null;

  public showActionPanel: boolean = false;
  public selectAllItems: boolean = false;
  public showCancelSummaryPanel: boolean = false;
  public cancelledItems: Array<BillingTransactionItem> = [];
  public doctorsList: Array<any> = [];

  public currBillingContext: PatientBillingContextVM;
  public filteredPendingItems: Array<BillingTransactionItem> = [];
  public uniqueItemNames: Array<any> = [];//for searching.
  public showUpdateItemsPopup: boolean = false;
  public updatedItems: Array<BillingTransactionItem> = [];
  public UsersList: Array<any> = [];//to view who has added that particular item.

  public selItemsTotAmount: number = 0;
  public selItemsSubTotal: number = 0;
  public selItemsTotalDiscAmount: number = 0;

  public selItemForEdit: BillingTransactionItem = new BillingTransactionItem();
  public showEditItemsPopup: boolean = false;

  public showPatBillHistory: boolean = false;
  public loading: boolean = false;
  public showInpatientMessage = false;
  //public itemList: Array<any>;

  //Insurance Item Request:
  public showInsuranceAddItemPopUp: boolean = false;
  public patientId: number = 0;

  public patBillHistory = {
    IsLoaded: false,
    PatientId: null,
    CreditAmount: null,
    InsuranceProvisionalAmt: null,
    TotalDue: null,
    DepositBalance: null,
    BalanceAmount: null
  };

  public model = {
    PharmacyProvisionalAmount: 0,
    SubTotal: 0,
    TotalDiscount: 0,
    TaxAmount: 0,
    NetTotal: 0,
    TotalAmount: 0,
    ToBePaid: 0,
    ToBeRefund: 0,
    PayType: "cash",
    PaymentDetails: null,
    Remarks: null,
  };
  public billingTransaction: BillingTransaction = new BillingTransaction();

  constructor(public securityService: SecurityService,
    public callbackservice: CallbackService,
    public router: Router,
    public changeDetector: ChangeDetectorRef,
    public billingBLService: BillingBLService,
    public msgBoxServ: MessageboxService,
    public patientService: PatientService,
    public billingService: BillingService,
    public routeFromService: RouteFromService) {

    this.counterId = this.securityService.getLoggedInCounter().CounterId;
    if (!this.counterId || this.counterId < 1) {
      this.callbackservice.CallbackRoute = '/Billing/InsuranceMain/InsProvisional';
      this.router.navigate(['/Billing/CounterActivate']);
    } else {
      //this.GetBillingItems();
      this.creditBillGridColumns = GridColumnSettings.InsuranceBillCreditBillSearch;
      this.GetInsuranceUnpaidTotalBills();
      this.GetDoctorsList();

    }
  }

  CloseNewItemAdd($event) {
    if ($event.action == "close") {
      this.showInsuranceAddItemPopUp = false;
    }
    else if ($event.action == "items-added" && $event && $event.newItems) {
      $event.newItems.forEach(billItem => {
        this.receiptDetails.push(billItem);
        this.filteredPendingItems = this.receiptDetails;
        this.receiptDetails = this.receiptDetails.slice();
        this.filteredPendingItems = this.filteredPendingItems.slice();
      });
      this.showInsuranceAddItemPopUp = false;
    }
    this.GetPatientInsuranceProvisionalItems(this.patientId);
    this.CalculationForAll();
  }

  GetDoctorsList() {
    this.billingBLService.GetDoctorsList()
      .subscribe((res: DanpheHTTPResponse) => {
        console.log(res);
        if (res.Status == "OK") {
          this.doctorsList = res.Results;
          let Obj = new Object();
          Obj["EmployeeId"] = null;
          Obj["FullName"] = "SELF";
          this.doctorsList.push(Obj);
        }
      });
  }

  GetInsuranceUnpaidTotalBills() {
    this.billingBLService.GetUnpaidInsuranceTotalBills()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.InsuranceProvisionalBillsSummary = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Not able to get Insurance Provisional items."]);
        }
      });
  }
  CreditBillGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "showDetails":
        {
          var data = $event.Data;
          this.patientId = data.PatientId;
          this.ShowPatientProvisionalItems(data);
        }
        break;
      case "view":
        {
          var data = $event.Data;
          this.GetPatientInsuranceProvisionalItems(data.PatientId, true);
        }
        break;
      default:
        break;
    }
  }


  ShowPatientProvisionalItems(row): void {
    this.showAllPatient = false;
    //patient mapping later used in receipt print
    var patient = this.patientService.CreateNewGlobal();
    patient.ShortName = row.ShortName;
    patient.PatientCode = row.PatientCode;
    patient.DateOfBirth = row.DateOfBirth;
    patient.Gender = row.Gender;
    patient.PatientId = row.PatientId;
    patient.PhoneNumber = row.PhoneNumber;
    this.currBillingContext = null;
    //this.admissionDetail = null;
    this.GetPatientInsuranceProvisionalItems(patient.PatientId);
    this.LoadPatientBillingContext(patient.PatientId);
  }

  LoadPatientBillingContext(patientId) {
    this.billingBLService.GetPatientBillingContext(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.currBillingContext = res.Results;
          this.billingService.BillingType = this.currBillingContext.BillingType;
        }
      });
  }

  GenerateInsuranceInvoice() {

    let goToPaidFollowup = window.confirm("This will generate final Insurance Invoice for this patient. Transaction cannot be UnDone. Do you want to Continue?");
    if (!goToPaidFollowup) {
      return;
    }

    if (this.HasZeroPriceItems()) {
      return;
    }
    //var billingTransaction = this.billingService.CreateNewGlobalBillingTransaction();
    this.billingTransaction.PatientId = this.receiptDetails[0].Patient.PatientId;
    this.billingTransaction.PatientVisitId = this.currBillingContext.PatientVisitId;

    this.billingTransaction.BillingTransactionItems = this.receiptDetails;
    if (this.billingTransaction.BillingTransactionItems.length > 0) {

      //to add taxable amount for current transaction. 
      let totTaxableAmt: number = 0, totNonTaxableAmt: number = 0, totQuantity = 0;
      this.billingTransaction.BillingTransactionItems.forEach(bil => {
        totTaxableAmt += bil.TaxableAmount;
        totNonTaxableAmt += bil.NonTaxableAmount;
        totQuantity += bil.Quantity;

      });

      this.billingTransaction.BillingTransactionItems.forEach(itm => {
        itm.BillStatus = ENUM_BillingStatus.unpaid;// "unpaid";
        //itm.PaidCounterId = this.counterId; //Insurance is Claimed 
      });

      this.billingTransaction.TaxableAmount = totTaxableAmt;
      this.billingTransaction.NonTaxableAmount = totNonTaxableAmt;
      this.billingTransaction.TaxId = this.billingService.taxId;
      this.billingTransaction.IsInsuranceBilling = true;
      this.billingTransaction.PaymentMode = "credit";
      this.billingTransaction.BillStatus = "unpaid";
      this.billingTransaction.PaidAmount = 0;
      //this.billingTransaction.TransactionType = this.billingService.BillingType;
      this.billingTransaction.InsuranceProviderId = this.currBillingContext.Insurance.InsuranceProviderId;
      this.billingTransaction.PaymentDetails = "InsuranceName: " + this.currBillingContext.Insurance.InsuranceProviderName
        + "/" + "InsuranceNumber:" + this.currBillingContext.Insurance.InsuranceNumber;

      this.billingTransaction.SubTotal = this.selItemsSubTotal;
      this.billingTransaction.DiscountAmount = this.selItemsTotalDiscAmount;
      this.billingTransaction.TotalAmount = this.selItemsTotAmount;
      //since the price of items does not include discount for insurance items and items price is deducted from the insurance balance... 
      this.billingTransaction.Tender = this.selItemsTotAmount;
      this.billingTransaction.CounterId = this.counterId;
      this.billingTransaction.TotalQuantity = totQuantity;
      this.billingTransaction.InsTransactionDate = this.insTxnDate;//sud: 19Jul'19--for insurance date..
      this.billingTransaction.TransactionType = "outpatient"; //For Insurance patient we are sending hard-coded transactionType as 'outpatient'

      this.billingBLService.PostBillingTransaction(this.billingTransaction)
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

  CallBackPostBillTxn(billingTxn: BillingTransaction) {
    this.billingTransaction.BillingTransactionId = billingTxn.BillingTransactionId;
    //this.model.PaidDate = moment(billingTxn.PaidDate).format("YYYY-MM-DD HH:mm:ss");
    this.billingTransaction.DiscountPercent = billingTxn.DiscountPercent;
    this.billingTransaction.Remarks = billingTxn.Remarks;
    this.billingTransaction.FiscalYear = billingTxn.FiscalYear;//sud:5May'18
    this.billingTransaction.InvoiceCode = billingTxn.InvoiceCode;
    this.billingTransaction.InvoiceNo = billingTxn.InvoiceNo;
    this.billingTransaction.BillingTransactionId = billingTxn.BillingTransactionId;
    this.billingTransaction.TaxId = billingTxn.TaxId;
    this.billingTransaction.CreatedBy = billingTxn.CreatedBy;
    this.billingTransaction.CreatedOn = billingTxn.CreatedOn;
    this.billingTransaction.IsInsuranceBilling = true;
    let txnReceipt = BillingReceiptModel.GetReceiptForTransaction(this.billingTransaction);
    txnReceipt.Patient = Object.create(this.patientService.globalPatient);
    txnReceipt.IsValid = true;
    //txnReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
    txnReceipt.BillingUser = billingTxn.BillingUserName; //Yubraj 28th June '19
    txnReceipt.Remarks = this.model.Remarks;
    if (this.billingTransaction.TransactionType && this.billingTransaction.TransactionType.toLowerCase() == "inpatient" && this.routeFromService.RouteFrom == "inpatient") {
      txnReceipt.ReceiptType = "ip-receipt";
    }
    txnReceipt.BillingDate = txnReceipt.InsTransactionDate || txnReceipt.BillingDate;//sud-20Jul'19: for Ins Transaction Date.

    this.billingService.globalBillingReceipt = txnReceipt;
    this.loading = false;//enables the submit button once all the calls are completed
    this.router.navigate(['Billing/ReceiptPrint']);
  }

  //public GetBillingItems() {
  //  this.billingBLService.GetBillItemList()
  //    .subscribe(res => {
  //      if (res.Status == 'OK' && res.Results.length) {
  //        this.itemList = res.Results;
  //      }
  //      else {
  //        this.msgBoxServ.showMessage('Failed', ["Unable to get Item List. Check log for error message."]);
  //        console.log(res.ErrorMessage);
  //      }
  //    },
  //      err => {
  //        console.log(err.ErrorMessage);
  //      });
  //}

  GetPatientInsuranceProvisionalItems(patientId: number, printProvisional: boolean = false) {
    this.billingBLService.GetInsuranceProvisionalItemsByPatientId(patientId)
      .subscribe(res => {

        this.receiptDetails = res.Results.InsCreditItems;
        this.patientService.globalPatient = res.Results.Patient;
        if (printProvisional) {
          this.print();
        }
        this.patientDetails = this.patientService.globalPatient;
        this.receiptDetails.forEach(function (val) {
          val.Patient = res.Results.Patient;
          val.IsSelected = false;
        });
        ////by default selecting all items.
        this.selectAllItems = true;
        this.SelectAllChkOnChange();

        //sud: 21Sept'18-- assign all items to list at first..
        this.filteredPendingItems = this.receiptDetails.slice();
        this.GetItemsForSearchDDL(this.receiptDetails);

        this.LoadPatientPastBillSummary(patientId);
        this.HasZeroPriceItems();
      });
  }

  HasZeroPriceItems(): boolean {
    var items = this.receiptDetails.filter(a => a.Price == 0);
    if (items && items.length) {
      this.UpdateItems(items);
      this.msgBoxServ.showMessage("Warning!", ["Some of the items has price 0. Please update."]);
      return true;
    }
  }

  BackToGrid() {
    this.showAllPatient = true;
    //reset current patient value on back button.. 
    this.patientService.CreateNewGlobal();
    this.showCancelSummaryPanel = false;
    this.showActionPanel = false;
    this.receiptDetails = [];
    this.cancelledItems = [];
    this.showPatBillHistory = false;
    this.GetInsuranceUnpaidTotalBills();
  }

  SelectAllChkOnChange() {
    if (this.receiptDetails && this.receiptDetails.length) {
      if (this.selectAllItems) {
        this.receiptDetails.forEach(itm => {
          itm.IsSelected = true;
        });
        this.showActionPanel = true;
      }
      else {
        this.receiptDetails.forEach(itm => {
          itm.IsSelected = false;
        });
        this.showActionPanel = false;

      }
    }
    this.CalculationForAll();
  }

  ItemValueChanged() {
    if (this.selItem && this.selItem.ItemName) {
      this.filteredPendingItems = this.receiptDetails.filter(itm => itm.ItemName == this.selItem.ItemName);
    }
    else {
      this.filteredPendingItems = this.receiptDetails;
    }
  }

  GetItemsForSearchDDL(itemsInfo: Array<BillingTransactionItem>) {
    let allItems = itemsInfo.map(itm => {
      return itm.ItemName;
    });

    let uniqueItms = CommonFunctions.GetUniqueItemsFromArray(allItems);

    this.uniqueItemNames = uniqueItms.map(itm => {
      return { ItemName: itm }
    });
  }

  SearchItemsListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }

  UpdateItems(items: Array<BillingTransactionItem> = null) {
    if (items) {
      this.updatedItems = items.map(a => Object.assign({}, a));
    }
    else {
      this.updatedItems = this.receiptDetails.map(a => Object.assign({}, a));
    }
    this.updatedItems = this.updatedItems.sort((itemA: BillingTransactionItem, itemB: BillingTransactionItem) => {
      if (itemA.Price > itemB.Price) return 1;
      if (itemA.Price < itemB.Price) return -1;
    });
    this.updatedItems.forEach(item => item.IsSelected = false);
    this.showUpdateItemsPopup = true;
  }

  CloseUpdatePricePopup($event) {
    if ($event && $event.modifiedItems) {
      let items = $event.modifiedItems
      this.receiptDetails
        .forEach(patItem => {
          for (let item of items) {
            if (item.BillingTransactionItemId == patItem.BillingTransactionItemId) {
              patItem = Object.assign(patItem, item);
              items.splice(items.findIndex(a => a.BillingTransactionItemId == item.BillingTransactionItemId), 1)
              break;
            }
          }
        });
      this.receiptDetails = this.receiptDetails.slice();
    }
    this.showUpdateItemsPopup = false;
    this.LoadPatientPastBillSummary(this.patientService.globalPatient.PatientId);
    this.CalculationForAll();
  }

  print() {
    let txnReceipt = BillingReceiptModel.GetReceiptFromTxnItems(this.receiptDetails);
    txnReceipt.Patient = Object.create(this.patientService.globalPatient);
    txnReceipt.IsValid = true;
    txnReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
    //    txnReceipt.Remarks = this.model.Remarks;
    txnReceipt.BillingDate = moment().format("YYYY-MM-DD HH:mm:ss");
    txnReceipt.ReceiptType = "provisional";
    //    txnReceipt.DepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
    txnReceipt.IsInsuranceBilling = true;//Yubraj 5th July '19 for showing in Provisional Receipt page
    this.billingService.globalBillingReceipt = txnReceipt;
    this.router.navigate(['Billing/ReceiptPrint']);
  }

  CalculationForAll() {
    //reset global variables to zero before starting the calculation.
    this.selItemsTotAmount = 0;
    this.selItemsSubTotal = 0;
    this.selItemsTotalDiscAmount = 0;
    //    let admInfo = this.admissionDetail;
    let itemsInfo = this.receiptDetails;
    let subTotal: number = 0;
    let totAmount: number = 0;
    let discAmt: number = 0;
    this.receiptDetails.forEach(itm => {
      if (itm.IsSelected) {
        this.selItemsSubTotal += itm.SubTotal ? itm.SubTotal : 0;
        this.selItemsTotalDiscAmount += itm.DiscountAmount ? itm.DiscountAmount : 0;
        this.selItemsTotAmount += itm.TotalAmount ? itm.TotalAmount : 0;
      }
    });
    this.selItemsTotAmount = CommonFunctions.parseAmount(this.selItemsTotAmount);
    this.selItemsSubTotal = CommonFunctions.parseAmount(this.selItemsSubTotal);
    this.selItemsTotalDiscAmount = CommonFunctions.parseAmount(this.selItemsTotalDiscAmount);
    if (itemsInfo && itemsInfo.length > 0) {
      itemsInfo.forEach(itm => {
        //let itemDiscount = itm.SubTotal * (itm.DiscountPercent / 100);//sud:12Mar'For testing--undo if it doesn't work.

        let itemDiscount = itm.DiscountAmount;
        itm.TotalAmount = itm.SubTotal - itemDiscount;

        subTotal += (itm.SubTotal ? itm.SubTotal : 0);
        totAmount += (itm.TotalAmount ? itm.TotalAmount : 0);

        discAmt += (itm.DiscountAmount ? itm.DiscountAmount : 0);

        itm.DiscountPercentAgg = (itm.DiscountAmount / itm.SubTotal) * 100;

        itm.TaxableAmount = itm.IsTaxApplicable ? (itm.SubTotal - itm.DiscountAmount) : 0;
        itm.NonTaxableAmount = itm.IsTaxApplicable ? 0 : (itm.SubTotal - itm.DiscountAmount);
      });

      this.model.SubTotal = CommonFunctions.parseAmount(subTotal);
      this.model.TotalAmount = CommonFunctions.parseAmount(totAmount);
      this.model.TotalDiscount = CommonFunctions.parseAmount(discAmt);
    }
    else {
      this.model.SubTotal = 0;
      this.model.TotalAmount = 0;
      this.model.TotalDiscount = 0;
    }
  }

  EditItemBtnOnClick(index, txnItem) {
    this.selItemForEdit = txnItem;
    this.showEditItemsPopup = true;
  }

  //this will be called when Item's edit window is closed.
  CloseItemEditWindow($event) {
    this.showEditItemsPopup = false;
    if ($event && ($event.EventName == "update" || $event.EventName == "cancelled")) {
      this.GetPatientInsuranceProvisionalItems(this.patientService.globalPatient.PatientId);
    }
  }

  //To display patient's bill history
  LoadPatientPastBillSummary(patientId: number) {
    this.billingBLService.GetPatientPastInsuranceBillSummary(patientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.patBillHistory = res.Results;
          this.patBillHistory.InsuranceProvisionalAmt = CommonFunctions.parseAmount(this.patBillHistory.InsuranceProvisionalAmt);
          this.patBillHistory.BalanceAmount = CommonFunctions.parseAmount(this.patBillHistory.BalanceAmount);
          this.patBillHistory.DepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
          this.patBillHistory.CreditAmount = CommonFunctions.parseAmount(this.patBillHistory.CreditAmount);
          this.patBillHistory.TotalDue = CommonFunctions.parseAmount(this.patBillHistory.TotalDue);
          this.patBillHistory.IsLoaded = true;
          this.showPatBillHistory = true;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          this.loading = false;
        }
      });
  }



  AddInsuranceItems() {
    this.patientId = this.patientService.globalPatient.PatientId;
    this.showInsuranceAddItemPopUp = false;
    this.changeDetector.detectChanges();
    this.showInsuranceAddItemPopUp = true;
  }

  GenerateInsuranceProvisionalInvoice() {
    this.GetPatientInsuranceProvisionalItems(this.patientId, true);
  }

  //start: sud:19Jul'19--For InsTransaction--
  public allowInsTxnDate: boolean = true;//take it from parameter.
  public insTxnDate: string = moment().format("YYYY-MM-DD HH:mm:ss");
  public insTxnCalendarDate: string = this.insTxnDate; // both will be same at first.
  public showCalendar: boolean = false;

  ShowCalendar() {
    this.showCalendar = true;
  }

  CloseDateChangeCalendar() {
    this.insTxnCalendarDate = this.insTxnDate;
    this.showCalendar = false;
  }

  ChangeTxnDate() {
    this.insTxnDate = this.insTxnCalendarDate + moment().format(" HH:mm:ss");

    console.log(this.insTxnDate);

    this.showCalendar = false;
  }

  //end: sud:19Jul'19--For InsTransaction--
}
