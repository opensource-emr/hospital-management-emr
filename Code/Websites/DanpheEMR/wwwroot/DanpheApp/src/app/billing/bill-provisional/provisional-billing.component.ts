import { Component, OnChanges, SimpleChanges, DoCheck, Input, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router'
import * as moment from 'moment/moment';

import { PatientService } from '../../patients/shared/patient.service';
import { Patient } from '../../patients/shared/patient.model';
import { BillingService } from '../shared/billing.service';
import { BillingBLService } from '../shared/billing.bl.service';
import { BillingTransaction } from '../shared/billing-transaction.model';
import { BillingTransactionItem } from "../shared/billing-transaction-item.model";
import { BillingReceiptModel } from '../shared/billing-receipt.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
//to add danphe-grid in credit-details page:sudarshan 26Mar'17
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { SecurityService } from '../../security/shared/security.service';
import { CallbackService } from '../../shared/callback.service';
import { CommonFunctions } from '../../shared/common.functions';
import { RouteFromService } from '../../shared/routefrom.service';
import * as _ from 'lodash';
import { CancelStatusHoldingModel, DanpheHTTPResponse } from "../../shared/common-models";
import { PatientBillingContextVM } from '../shared/patient-billing-context-vm';
import { CoreService } from "../../core/shared/core.service"
import { ENUM_BillingType } from '../../shared/shared-enums';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../shared/danphe-grid/NepaliColGridSettingsModel";

@Component({
  templateUrl: "./provisional-billing.html"
})

// App Component class
export class ProvisionalBillingComponent {

  public counterId: number = 0;
  //public BillingTransaction: Array<BillingTransaction> = new Array<BillingTransaction>();  //to show the credit information
  public receiptDetails: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();
  public provisionalBillsSummary: Array<any> = [];
  //public billingService: BillingService;
  public showAllPatient: boolean = true;  // to show the form required to show the credit details
  public showUpdateItemsPopup: boolean = false;
  public creditBillGridColumns: Array<any> = null;
  //declare boolean loading variable for disable the double click event of button
  loading: boolean = false;
  //added: sud:12May'18
  public selectAllItems: boolean = false;
  public showActionPanel: boolean = false;
  public selItemsTotAmount: number = 0;
  public selItemsSubTotal: number = 0;
  public selItemsTotalDiscAmount: number = 0;
  public patientDetails: Patient = new Patient();
  public updatedItems: Array<BillingTransactionItem> = [];
  public remarks: string = null;
  public showCancelSummaryPanel: boolean = false;
  public cancelledItems: Array<BillingTransactionItem> = [];
  public highlightRemark: boolean = false;
  public itemList: Array<any>;
  public currBillingContext: PatientBillingContextVM;
  public admissionDetail;
  //sud: 31May'18--to display patient bill summary
  public showInpatientMessage = false;
  public showPatBillHistory: boolean = false;
  public checkouttimeparameter: string;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  public patBillHistory = {
    IsLoaded: false,
    PatientId: null,
    CreditAmount: null,
    ProvisionalAmt: null,
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


  //sud: 21Sept'for ItemFiltering
  public patAllPendingItems: Array<BillingTransactionItem> = [];
  public uniqueItemNames: Array<any> = [];//for searching.
  public selItem: any = null;
  public filteredPendingItems: Array<BillingTransactionItem> = [];
  public discountApplicable: boolean = false;

  public enablePartialProvBill: boolean = false;
  public showBackButton: boolean = false;

  public overallCancellationRule: any;
  public billingCancellationRule: CancelStatusHoldingModel = new CancelStatusHoldingModel();
  public isCancelRuleEnabled: boolean;

  public cancellationNumber: number = 0;
  public showInvoicePrintPage: boolean = false;//sud:16May'21--to print from same page.

  constructor(public billingService: BillingService,
    public routeFromService: RouteFromService,
    public router: Router,
    public billingBLService: BillingBLService,
    public patientService: PatientService,
    public securityService: SecurityService,
    public callbackservice: CallbackService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public CoreService: CoreService
  ) {
    this.counterId = this.securityService.getLoggedInCounter().CounterId;
    if (!this.counterId || this.counterId < 1) {
      this.callbackservice.CallbackRoute = '/Billing/UnpaidBills';
      this.router.navigate(['/Billing/CounterActivate']);
    } else {
      // this.CheckAndLoadBillItemPrice();
      // this.creditBillGridColumns = GridColumnSettings.BillCreditBillSearch;
      // this.GetUnpaidTotalBills();
      // this.SetDoctorsList();

      // this.SetBillingParameters();

    }
    this.setCheckOutParameter();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('LastCreditBillDate', true));

    this.overallCancellationRule = this.CoreService.GetOpBillCancellationRule();
    if (this.overallCancellationRule && this.overallCancellationRule.Enable) {
      this.isCancelRuleEnabled = this.overallCancellationRule.Enable;
      this.billingCancellationRule.labStatus = this.overallCancellationRule.LabItemsInBilling;
      this.billingCancellationRule.radiologyStatus = this.overallCancellationRule.ImagingItemsInBilling;
    }
  }

  ngOnInit() {
    console.log(this.patientService.globalPatient);
    if (this.routeFromService.RouteFrom == "BillingTransactionProvisional") {
      this.CheckAndLoadBillItemPrice();//need this to ensure billitem price are set to the item list.
      var data = this.patientService.globalPatient;
      this.filteredPendingItems = [];
      this.ShowPatientProvisionalItems(data);
    }
    this.CheckAndLoadBillItemPrice();
    this.creditBillGridColumns = GridColumnSettings.BillCreditBillSearch;
    this.GetUnpaidTotalBills();
    this.SetDoctorsList();
    this.SetBillingParameters();
  }

  public enablNewItmAddInProvisional: boolean = false;
  SetBillingParameters() {
    this.enablePartialProvBill = this.CoreService.EnablePartialProvBilling();

    //for enable/disable item add in provisional.

    let param = this.CoreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "EnableNewItemAddInOpProvisional");
    if (param && (param.ParameterValue == "true" || param.ParameterValue == true || param.ParameterValue == "True")) {
      this.enablNewItmAddInProvisional = true;
    }

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

  //end: sud--21Sept'18-- for Filtering items from unpaid list.


  setCheckOutParameter() {
    var param = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "CheckoutTime");
    if (param) {
      this.checkouttimeparameter = param.ParameterValue;
    }
  }

  GetUnpaidTotalBills() {
    this.billingBLService.GetUnpaidTotalBills()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.provisionalBillsSummary = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Not able to get provisional items."]);
        }
      });
  }



  GetPatientProvisionalItems(patientId: number, printProvisional: boolean = false) {
    this.billingBLService.GetProvisionalItemsByPatientId(patientId)
      .subscribe((res: DanpheHTTPResponse) => {

        if (res.Status == "OK") {

          this.receiptDetails = res.Results.CreditItems;
          this.patientService.globalPatient = res.Results.Patient;
          if (printProvisional) {
            this.print();
          }
          this.patientDetails = this.patientService.globalPatient;
          this.receiptDetails.forEach(function (val) {
            val.Patient = res.Results.Patient;
            // val.RequisitionDate = moment(val.RequisitionDate).format("YY/MM/DD HH:mm");
            val.IsSelected = true;
          });
          //by default selecting all items.
          this.selectAllItems = true;
          this.SelectAllChkOnChange();

          //sud: 21Sept'18-- assign all items to list at first..
          this.filteredPendingItems = [];
          this.filteredPendingItems = this.receiptDetails.slice();
          this.selItemForEdit.AllowCancellation = true;

          if (this.isCancelRuleEnabled && this.selItemForEdit.SrvDeptIntegrationName && this.selItemForEdit.RequisitionId > 0) {
            if ((this.selItemForEdit.SrvDeptIntegrationName.toLowerCase() == 'lab' && !this.billingCancellationRule.labStatus.includes(this.selItemForEdit.OrderStatus))
              || (this.selItemForEdit.SrvDeptIntegrationName.toLowerCase() == 'radiology' && !this.billingCancellationRule.radiologyStatus.includes(this.selItemForEdit.OrderStatus))) {
              this.selItemForEdit.AllowCancellation = false;
            }
          }
          this.GetItemsForSearchDDL(this.receiptDetails);

          this.LoadPatientPastBillSummary(patientId);
          this.HasZeroPriceItems();
        }
        else {
          this.msgBoxServ.showMessage("Failed", ["Couldn't load Provisional Details of this Patient. Please try again."]);
          this.BackToGrid();
        }
      });
  }

  public isBillItemPriceLoaded: boolean = false;



  CheckAndLoadBillItemPrice() {
    if (!this.isBillItemPriceLoaded) {
      this.itemList = this.billingService.allBillItemsPriceList;
      this.isBillItemPriceLoaded = this.itemList.length > 0;
      console.log("bill items price set inside provisional.");
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
    this.admissionDetail = null;

    this.GetPatientProvisionalItems(patient.PatientId);
    this.LoadPatientBillingContext(patient.PatientId);
  }


  PayAll() {
    //changed: 4May-anish
    if (this.currBillingContext.BillingType.toLowerCase() == ENUM_BillingType.inpatient) {
      this.showInpatientMessage = true;
      return;
    }
    if (this.HasZeroPriceItems()) {
      return;
    }
    var billingTransaction = this.billingService.CreateNewGlobalBillingTransaction();
    this.receiptDetails[0].PatientId = this.receiptDetails[0].Patient.PatientId;
    billingTransaction.PatientId = this.receiptDetails[0].Patient.PatientId;

    //added: ashim: 20Aug2018
    billingTransaction.PatientVisitId = this.currBillingContext.PatientVisitId;
    this.receiptDetails.forEach(bil => {
      //push only selected items for pay-all
      if (bil.IsSelected) {
        let curBilTxnItm = BillingTransactionItem.GetClone(bil);
        let item = this.itemList.find(a => a.ItemId == curBilTxnItm.ItemId && a.ServiceDepartmentId == curBilTxnItm.ServiceDepartmentId);
        if (item)
          curBilTxnItm.IsTaxApplicable = item.TaxApplicable;
        billingTransaction.BillingTransactionItems.push(curBilTxnItm);

        //if (bil.DiscountSchemeId not in distinct)
        //distinct.push(array[i].age)

      }

    });
    const arr = billingTransaction.BillingTransactionItems.map(p => p.DiscountSchemeId); 
    const s = new Set(arr); //  a set removes duplications, but it's still a set
    const unique2 = Array.from(s); // use Array.from to transform a set into an array

    if (unique2 && unique2.length > 1) {
      this.msgBoxServ.showMessage("Notice", ["Provisional billing was done using Multiple Schemes. Please change to the correct one during Final Invoice."]);
    }

    if (this.currBillingContext.BillingType.toLowerCase() == ENUM_BillingType.inpatient)
      this.routeFromService.RouteFrom = "inpatient";
    this.router.navigate(['/Billing/BillingTransactionItem']);
  }

  CreditBillGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "showDetails":
        {
          this.CheckAndLoadBillItemPrice();//need this to ensure billitem price are set to the item list.

          var data = $event.Data;
          this.filteredPendingItems = [];
          this.ShowPatientProvisionalItems(data);
        }
        break;
      case "view":
        {
          var data = $event.Data;
          this.GetPatientProvisionalItems(data.PatientId, true);

        }
        break;
      default:
        break;
    }
  }

  print() {
    let txnReceipt = BillingReceiptModel.GetReceiptFromTxnItems(this.receiptDetails);
    txnReceipt.Patient = Object.create(this.patientService.globalPatient);
    txnReceipt.IsValid = true;
    txnReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
    txnReceipt.Remarks = this.model.Remarks;
    txnReceipt.BillingDate = moment().format("YYYY-MM-DD HH:mm:ss");
    txnReceipt.ReceiptType = "provisional";
    txnReceipt.DepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
    this.billingService.globalBillingReceipt = txnReceipt;
    this.showInvoicePrintPage = true;
    // this.router.navigate(['Billing/ReceiptPrint']);
  }
  BackToGrid() {
    this.showAllPatient = true;
    //reset current patient value on back button.. 
    this.patientService.CreateNewGlobal();
    this.showCancelSummaryPanel = false;
    this.showActionPanel = false;
    this.showBackButton = false;
    this.receiptDetails = [];
    this.cancelledItems = [];
    this.filteredPendingItems = [];
    this.showPatBillHistory = false;
  }

  SelectAllChkOnChange() {
    if (this.receiptDetails && this.receiptDetails.length) {
      if (this.selectAllItems) {
        this.receiptDetails.forEach(itm => {
          itm.IsSelected = true;
        });
        this.showAllPatient = false;
        this.showActionPanel = true;
        this.showBackButton = true;
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



  CancelItems() {
    if (this.remarks && this.remarks != "") {

      var a = window.confirm("are you sure you want to cancel?")
      if (a) {
        let selectedBilItems = this.receiptDetails.filter(b => b.IsSelected);
        let txnItemsToCancel = selectedBilItems.map(bil => {
          let txnItm = BillingTransactionItem.GetClone(bil);
          txnItm.CancelRemarks = this.remarks;
          return txnItm;
        });
        this.billingBLService.CancelMultipleTxnItems(txnItemsToCancel)
          .subscribe((res: DanpheHTTPResponse) => {
            let results = res;
            if (res.Status == "OK") {
              this.OnCancelSuccess(res.Results);
            }
            else {
              this.msgBoxServ.showMessage("error", ["Some error occured, please try again."], res.ErrorMessage);
            }
          });
      }
      else {
        //this.router.navigate(['/Billing/BillCancellationRequest'])
      }
    }
    else {
      this.msgBoxServ.showMessage("error", ["Remarks is mandatory for cancellation."]);
      //this.highlightRemark = true;
      //setTimeout(function () {
      //    this.highlightRemark = false;
      //}, 3000);

    }
  }

  OnCancelSuccess(itms: Array<BillingTransactionItem>) {
    this.showActionPanel = false;
    this.remarks = null;
    this.msgBoxServ.showMessage("success", ["Items Cancelled successfully"]);
    if (itms) {
      itms.forEach(itm => {
        let itmId = itm.BillingTransactionItemId;
        let itmIndex = this.receiptDetails.findIndex(a => a.BillingTransactionItemId == itm.BillingTransactionItemId);
        if (itmIndex >= 0) {
          this.receiptDetails.splice(itmIndex, 1);//this will remove current item from receipt details list.
          this.cancelledItems.push(itm);
          this.showCancelSummaryPanel = true;
        }
      });

    }
  }


  //sud: 13May'18--to display patient's bill history
  LoadPatientPastBillSummary(patientId: number) {
    this.billingBLService.GetPatientPastBillSummary(patientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.patBillHistory = res.Results;
          this.patBillHistory.ProvisionalAmt = CommonFunctions.parseAmount(this.patBillHistory.ProvisionalAmt);
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
  LoadPatientBillingContext(patientId) {
    this.billingBLService.GetPatientBillingContext(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.currBillingContext = res.Results;
          this.billingService.BillingType = this.currBillingContext.BillingType;
        }
      });
  }

  public calculateDays() {
    this.admissionDetail.BedInformations.forEach(bed => {
      //calculate days
      var duration = CommonFunctions.calculateADTBedDuration(bed.StartDate, bed.EndDate, this.checkouttimeparameter);
      if (duration.days > 0 && duration.hours)
        bed.Days = duration.days + ' + ' + duration.hours + ' hour';
      else if (duration.days && !duration.hours)
        bed.Days = duration.days;
      else if (!duration.days && duration.hours)
        bed.Days = duration.hours + ' hour';
      bed.Action = bed.Action.charAt(0).toUpperCase() + bed.Action.slice(1);
    });
  }


  //sud: 25Sept2018 For Ip/Billing and Edit items.. couldn't wait until IP Billinig feature comes to live. 
  //start: Edit Items
  public selItemForEdit: BillingTransactionItem = new BillingTransactionItem();
  public showEditItemsPopup: boolean = false;

  EditItemBtnOnClick(index, txnItem) {
    //console.log(this.doctorsList);
    this.selItemForEdit = txnItem;

    //Yubraj 29th July 2019 -- Disable discount TextBox in case of DiscableApplicable is false
    let itmId = this.selItemForEdit.ItemId;
    let itmName = this.selItemForEdit.ItemName;

    var selItemDetails = this.itemList.find(a => a.ItemId == itmId && a.ItemName == itmName)
    this.discountApplicable = selItemDetails.DiscountApplicable;

    this.selItemForEdit.SrvDeptIntegrationName = this.selItemForEdit.ServiceDepartment.IntegrationName;
    this.selItemForEdit.AllowCancellation = true;
    console.log(this.selItemForEdit);
    if (this.selItemForEdit.OrderStatus == null) {
      this.selItemForEdit.OrderStatus = 'active';
    }
    if (this.isCancelRuleEnabled && this.selItemForEdit.SrvDeptIntegrationName && this.selItemForEdit.RequisitionId > 0) {
      if ((this.selItemForEdit.SrvDeptIntegrationName.toLowerCase() == 'lab' && !this.billingCancellationRule.labStatus.includes(this.selItemForEdit.OrderStatus))
        || (this.selItemForEdit.SrvDeptIntegrationName.toLowerCase() == 'radiology' && !this.billingCancellationRule.radiologyStatus.includes(this.selItemForEdit.OrderStatus))) {
        this.selItemForEdit.AllowCancellation = false;
      }
    }
    this.showEditItemsPopup = true;


  }
  //this will be called when Item's edit window is closed.
  CloseItemEditWindow($event) {
    this.showEditItemsPopup = false;
    if ($event && ($event.EventName == "update" || $event.EventName == "cancelled")) {
      this.GetPatientProvisionalItems(this.patientService.globalPatient.PatientId);
    }
  }




  public doctorsList: Array<any> = [];
  public UsersList: Array<any> = [];//to view who has added that particular item.

  SetDoctorsList() {
    //doctorslist is available in billingservice.. reuse it.. 
    this.doctorsList = this.billingService.GetDoctorsListForBilling();
    let Obj = new Object();
    Obj["EmployeeId"] = null;
    Obj["FullName"] = "SELF";
    this.doctorsList.push(Obj);

  }

  HasZeroPriceItems(): boolean {
    var items = this.receiptDetails.filter(a => a.Price == 0);
    if (items && items.length) {
      this.UpdateItems(items);
      this.msgBoxServ.showMessage("Warning!", ["Some of the items has price 0. Please update."]);
      return true;
    }
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

  CalculationForAll() {
    //reset global variables to zero before starting the calculation.
    this.selItemsTotAmount = 0;
    this.selItemsSubTotal = 0;
    this.selItemsTotalDiscAmount = 0;
    let admInfo = this.admissionDetail;
    let itemsInfo = this.receiptDetails;
    let subTotal: number = 0;
    let totAmount: number = 0;
    let discAmt: number = 0;
    this.receiptDetails.forEach(itm => {
      if (itm.IsSelected) {
        if (!this.showActionPanel) {
          this.showActionPanel = true;
        }
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

  SelectUnselectItem() {

    if (this.currBillingContext.BillingType.toLowerCase() != ENUM_BillingType.inpatient) {
      if (this.filteredPendingItems.every(a => a.IsSelected == true)) {
        this.selectAllItems = true;
      } else {
        this.selectAllItems = false;
        this.showActionPanel = false;
      }

      this.CalculationForAll();
    } else {
      this.showInpatientMessage = true;
    }
  }


  LoadInitialValues() {

  }

  public showNewItemsPopup: boolean = false;
  NewItemBtn_Click() {
    this.showNewItemsPopup = false;
    this.changeDetector.detectChanges();
    this.itemList
    this.showNewItemsPopup = true;
  }

  CloseNewItemAdd($event) {
    //action are either: save or close. we don't have to load provisional item when it's only close.
    if ($event && $event.action == "save") {
      this.GetPatientProvisionalItems(this.patientService.globalPatient.PatientId);
    }

    this.showNewItemsPopup = false;
  }


  //sud:16May'21--Moving Invoice Printing as Popup
  public CloseInvoicePrint() {
    this.showInvoicePrintPage = false;
    this.router.navigate(["/Billing/UnpaidBills"]);
  }

}
