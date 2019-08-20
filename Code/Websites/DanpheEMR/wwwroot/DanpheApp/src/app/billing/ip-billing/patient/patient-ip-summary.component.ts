import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core'
import { DLService } from '../../../shared/dl.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import * as moment from 'moment/moment';
import { BillingTransactionItem } from '../../shared/billing-transaction-item.model';
import { CommonFunctions } from '../../../shared/common.functions';
import { PatientService } from '../../../patients/shared/patient.service';
import { BillingTransaction } from '../../shared/billing-transaction.model';
import { BillingService } from '../../shared/billing.service';
import { BillingBLService } from '../../shared/billing.bl.service';
import { PatientsBLService } from "../../../patients/shared/patients.bl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../../security/shared/security.service';
import { DischargeDetailBillingVM, BedDetailVM, BedDurationTxnDetailsVM } from '../shared/discharge-bill.view.models';
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { CoreService } from "../../../core/shared/core.service"
import { Patient } from '../../../patients/shared/patient.model';
import { CreditOrganization } from '../../../settings/shared/creditOrganization.model';
@Component({
  selector: 'pat-ip-bill-summary',
  templateUrl: "./patient-ip-summary.html"
})
export class PatientIpSummaryComponent {

  @Output("on-summary-closed")
  public onClose = new EventEmitter<object>();

  @Input("patientId")
  public patientId: number = 0;

  @Input("ipVisitId")
  public ipVisitId: number = 0;

  public patAllPendingItems: Array<BillingTransactionItem> = [];
  public uniqueItemNames: Array<any> = [];//for searching.
  public selItem: any = null;

  public filteredPendingItems: Array<BillingTransactionItem> = [];
  public allItemslist: Array<any> = []; //Yubraj 30th July '19 //All Billing Lists

  public admissionInfo: any = null;
  public billingTransaction: BillingTransaction;
  public showIpBillRequest: boolean = false;
  public showDischargeBill: boolean = false;
  public showUpdatePricePopup: boolean = false;
  public billType: string;
  public dischargeDetail: DischargeDetailBillingVM = new DischargeDetailBillingVM();
  //Is updated once the billing transaction is post during discharge patient.
  public billingTxnId: number;
  public billStatus: string;
  public adtItems: BillingTransactionItem;
  public hasPreviousCredit: boolean = false;
  public showCreditBillAlert: boolean = false;
  public showCancelAdmissionAlert: boolean = false;
  public validDischargeDate: boolean = true;
  public checkouttimeparameter: string;
  public exchangeRate: number = 0;
  //create a new model to assign global variables and bind to html
  public model = {
    PharmacyProvisionalAmount: 0,
    SubTotal: 0,
    TotalDiscount: 0,
    TaxAmount: 0,
    NetTotal: 0,
    DepositAdded: 0,
    DepositReturned: 0,
    DepositBalance: 0,
    TotalAmount: 0,
    TotalAmountInUSD: 0,
    ToBePaid: 0,
    ToBeRefund: 0,
    PayType: "cash",
    Tender:0,
    Change:0,
    PaymentDetails: null,
    Remarks: null,
    OrganizationId: null
  };
  public patientInfo: Patient;
  public showDischargePopUpBox: boolean = false;
  public showEditItemsPopup: boolean = false;
  public doctorsList: Array<any> = [];
  public UsersList: Array<any> = [];//to view who has added that particular item.
  public selItemForEdit: BillingTransactionItem = new BillingTransactionItem();

  public showDepositPopUp: boolean = false;
  public bedDetails: Array<BedDetailVM> = [];
  public bedDurationDetails: Array<BedDurationTxnDetailsVM>;
  public totalAdmittedDays: number = 0;
  public estimatedDischargeDate: string;

  public estimatedDiscountPercent: number = 0;

  public loading: boolean = false; //yub 27th Nov '18 :: Avoiding double click whild loading

  public isAllItemsSelected: boolean = true;  //yubraj: 28th Nov '18
  /*    public groupDiscountPercent: number = 0;*/  //yubraj: 28th Nov '18
  public discountGroupItems: Array<BillingTransactionItem> = [];
  public updatedItems: Array<BillingTransactionItem> = [];
  public showGroupDiscountPopUp: boolean = false; //yubraj: 28th Nov '18

  public hasZeroItemPrice: boolean = false;
  public itemsToModify: Array<BillingTransactionItem> = [];
  public organizationList: Array<CreditOrganization> = new Array<CreditOrganization>(); //yubraj:22nd April 2019 Credit Organization
  public discountApplicable: boolean = false; //Yubraj 30th July

  constructor(public dlService: DLService,
    public patService: PatientService,
    public changeDetector: ChangeDetectorRef,
    public billingService: BillingService,
    public billingBLService: BillingBLService,
    public msgBoxServ: MessageboxService,
    public npCalendarService: NepaliCalendarService,
    public CoreService: CoreService,
    public patientBLServie: PatientsBLService,
    public securityService: SecurityService) {
    this.GetDoctorsList();
    this.GetUsersList();
    this.setCheckOutParameter();
    this.GetOrganizationList();
  }

  setCheckOutParameter() {
    var param = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "CheckoutTime");
    if (param) {
      this.checkouttimeparameter = param.ParameterValue;
    }
  }
  ngOnInit() {
    if (this.patientId && this.ipVisitId) {
      this.bedDurationDetails = [];
      this.getPatientDetails();
      this.LoadPatientBillingSummary(this.patientId, this.ipVisitId);
      this.CheckCreditBill(this.patientId);
      this.GetPharmacyProvisionalBalance();
      this.dischargeDetail.DischargeDate = moment().format('YYYY-MM-DDTHH:mm:ss');
      this.EngCalendarOnDateChange();
    }
  }

  getPatientDetails() {
    this.patientBLServie.GetPatientById(this.patientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.patientInfo = res.Results;
        }
      });
  }
  LoadPatientBillingSummary(patientId: number, patientVisitId: number) {
    this.dlService.Read("/api/IpBilling?reqType=pat-pending-items&patientId=" + this.patientId + "&ipVisitId=" + this.ipVisitId)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK" && res.Results) {
          this.admissionInfo = res.Results.AdmissionInfo;
          this.admissionInfo.AdmittedOn = this.admissionInfo.AdmittedOn;
          this.admissionInfo.DischargedOn = moment(this.admissionInfo.DischargedOn).format('YYYY-MM-DDTHH:mm:ss');
          this.patAllPendingItems = res.Results.PendingBillItems;
          this.filteredPendingItems = res.Results.PendingBillItems;
          this.allItemslist = res.Results.allBillItem;
          this.GetItemsForSearchDDL(this.patAllPendingItems);
          this.FormatItemsToGroup(this.filteredPendingItems);
          this.bedDetails = res.Results.AdmissionInfo.BedDetails;
          this.calculateAdmittedDays();
          this.CalculationForAll();
          this.HasZeroPriceItems();
        }
        else {
          this.msgBoxServ.showMessage("failed", [" Unable to get bill summary."]);
          console.log(res.ErrorMessage);
        }
      });
  }
  //Hom 17 Jan'19
  HasZeroPriceItems(): boolean {
    var items = this.patAllPendingItems.filter(a => a.Price == 0);
    if (items && items.length) {
      this.UpdateItems(items);
      this.msgBoxServ.showMessage("Warning!", ["Some of the items has price 0. Please update."]);
      return true;
    }
  }

  CheckCreditBill(patientId: number) {
    this.hasPreviousCredit = false;
    this.showCreditBillAlert = false;
    this.dlService.Read("/api/Billing?reqType=check-credit-bill&patientId=" + this.patientId)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.hasPreviousCredit = res.Results;
        }
      });
  }

  GetPharmacyProvisionalBalance() {
    this.dlService.Read("/api/GetPatCrDetail/" + this.patientId + "/null/null/null")
      .map(res => res)
      .subscribe(res => {
        if (res) {
          this.model.PharmacyProvisionalAmount = res.TotalAmount;
        }
      });
  }
  BackToGrid() {
    this.onClose.emit();
    this.patService.CreateNewGlobal();
  }

  ClosePatientSummary(showConfirmAlert = true) {
    if (showConfirmAlert) {
      //we need to be sure if the user wants to close the window.
      let sure = window.confirm("are you sure you want to Cancel ?");
      if (sure) {
        this.onClose.emit({ CloseWindow: true });
      }
    }
    else {
      this.onClose.emit({ CloseWindow: true });
    }

  }
  CloseGroupDiscountPopup($event) {
    this.showGroupDiscountPopUp = false;
    this.CalculationForAll();
  }
  ConfirmDischarge() {
    if (this.patAllPendingItems && this.patAllPendingItems.length) {
      if (!this.validDischargeDate) {
        return;
      }
      if ((this.model.PayType == "credit" || this.estimatedDiscountPercent) && !this.model.Remarks) {
        this.msgBoxServ.showMessage("failed", [" Remarks is mandatory."]);
      }
      else {
        let sure = true;
        if (this.model.PayType == "credit")
          sure = window.confirm("Are you sure to discharge this patient on CREDIT?");
        if (sure) {
          this.showCreditBillAlert = this.hasPreviousCredit;
          this.showDischargePopUpBox = true;
        }
      }
    }
    else {
      this.showCancelAdmissionAlert = true;
    }

  }
  //to check whether pharmacy charge is cleared or not : 2019/1/25
  PostBillAndDischargePatientPharmacyCharge() {
    if (this.model.PharmacyProvisionalAmount > 0) {
      let discharge: boolean = true;
      let discharge_msg = "NOTE !!! Pharmacy charge of Rs. " + this.model.PharmacyProvisionalAmount + " Remaining. Are you sure to discharge?";
      discharge = window.confirm(discharge_msg);
      if (discharge) {
        this.PostBillAndDischargePatient();
      }
    }
    else
      this.PostBillAndDischargePatient();
  }

  PostBillAndDischargePatient() {
    if (this.HasZeroPriceItems()) {
      return;
    }

    if (this.dischargeDetail.Remarks) {
      this.loading = true;
      this.dischargeDetail.PatientVisitId = this.ipVisitId;
      this.showDischargePopUpBox = false;
      this.billType = "invoice";
      this.billStatus = "";
      this.PostBillingTransaction();
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Discharge Remarks is mandatory."]);
    }


  }

  CloseRecieptView() {
    this.showDischargeBill = false;
    if (this.billType == "invoice") {
      this.ClosePatientSummary(false);
    }
  }

  NewItemBtn_Click() {
    this.showIpBillRequest = false;
    this.changeDetector.detectChanges();
    this.showIpBillRequest = true;
  }
  CloseNewItemAdd($event) {
    if ($event && $event.newItems) {
      $event.newItems.forEach(billItem => {
        this.patAllPendingItems.push(billItem);
        this.filteredPendingItems = this.patAllPendingItems;
        this.patAllPendingItems = this.patAllPendingItems.slice();
        this.filteredPendingItems = this.filteredPendingItems.slice();
      });
    }
    this.CalculationForAll();
    this.showIpBillRequest = false;
  }

  AddDepositBtn_Click() {
    this.patService.globalPatient.PatientId = this.patientId;
    this.showDepositPopUp = true;
  }
  //Hom 17 Jan'19
  UpdateItems(items: Array<BillingTransactionItem> = null) {
    if (items) {
      this.updatedItems = items.map(a => Object.assign({}, a));
    }
    else {
      this.updatedItems = this.patAllPendingItems.map(a => Object.assign({}, a));
    }
    this.updatedItems = this.updatedItems.sort((itemA: BillingTransactionItem, itemB: BillingTransactionItem) => {
      if (itemA.Price > itemB.Price) return 1;
      if (itemA.Price < itemB.Price) return -1;
    });
    this.updatedItems.forEach(item => item.IsSelected = false);
    this.showUpdatePricePopup = true;
  }

  //yubraj: 28th Nov '18
  GroupDiscountBtn_Click() {
    //   this.groupDiscountPercent = null;
    this.discountGroupItems = this.patAllPendingItems.map(a => Object.assign({}, a));
    this.discountGroupItems.forEach(item => item.IsSelected = true);
    this.showGroupDiscountPopUp = true;
  }

  CalculationForAll() {
    let admInfo = this.admissionInfo;
    let itemsInfo = this.patAllPendingItems;
    let subTotal: number = 0;
    let totAmount: number = 0;
    let discAmt: number = 0;
    if (itemsInfo && itemsInfo.length > 0) {
      itemsInfo.forEach(itm => {
        let itemDiscount = itm.SubTotal * (itm.DiscountPercent / 100);
        itm.TotalAmount = itm.SubTotal - itemDiscount;
        let invoiceDiscount = itm.TotalAmount * (this.estimatedDiscountPercent / 100);
        itm.TotalAmount = itm.TotalAmount - (invoiceDiscount ? invoiceDiscount : 0);
        itm.DiscountAmount = itemDiscount + (invoiceDiscount ? invoiceDiscount : 0);

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

    this.model.DepositAdded = CommonFunctions.parseAmount(admInfo.DepositAdded);
    this.model.DepositReturned = CommonFunctions.parseAmount(admInfo.DepositReturned);
    this.model.DepositBalance = CommonFunctions.parseAmount((this.model.DepositAdded || 0) - (this.model.DepositReturned || 0));

    if (this.model.DepositBalance >= this.model.TotalAmount) {
      this.model.ToBeRefund = CommonFunctions.parseAmount(this.model.DepositBalance - this.model.TotalAmount);
      this.model.ToBePaid = 0;
      this.model.PayType = "cash";
    }
    else {
      this.model.ToBePaid = CommonFunctions.parseAmount(this.model.TotalAmount - this.model.DepositBalance);
      this.model.ToBeRefund = 0;
      if (this.model.ToBePaid)
      {
            this.model.Tender=this.model.ToBePaid;
      }
      this.ChangeTenderAmount();
    }
    if (this.model.PayType == "credit") {
      this.model.ToBePaid = this.model.TotalAmount;
      this.model.DepositReturned = 0;
      if (this.patientInfo.CountryId != 1) {
        this.exchangeRate = this.CoreService.GetExchangeRate();
        this.model.TotalAmountInUSD = (this.model.TotalAmount / this.exchangeRate);
      }
    }
    else {
      this.exchangeRate = 0;
      this.model.TotalAmountInUSD = 0;
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
    //this.uniqueItemNames.unshift({ ItemName: "---All---" });
  }

  ItemValueChanged() {
    if (this.selItem && this.selItem.ItemName) {
      this.filteredPendingItems = this.patAllPendingItems.filter(itm => itm.ItemName == this.selItem.ItemName);
    }
    else {
      this.filteredPendingItems = this.patAllPendingItems;
    }

  }


  ItemsListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }


  CallBackDepositAdd($event = null) {
    if ($event && $event.depositBalance) {
      this.admissionInfo.DepositAdded = $event.depositBalance;
      this.CalculationForAll();
      //find a better alternative and do LocalCalculation for deposit if possible..

      //this.LoadPatientBillingSummary(this.patientId, this.ipVisitId);
      //this.model.DepositAdded = (this.model.DepositAdded ? this.model.DepositAdded : 0) + $event.DepositAdded;
      ////this.model.DepositBalance = this.model.DepositAdded - this.model.DepositBalance;
      //this.CalculationForAll(this.admissionInfo, this.patAllPendingItems);//use local calculation if possible..
      //this.patBillHistory.DepositBalance = $event.depositBalance;
      //this.patBillHistory.BalanceAmount = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance - this.patBillHistory.TotalDue);
    }
    // this.showDepositPopUp = false;
    //this.loading = false;
  }
  CloseDepositPopUp() {
    this.showDepositPopUp = false;
  }

  ShowDepositPopUp() {
    //this.showIpBillingWarningBox = false;
    this.showDepositPopUp = true;
  }


  EditItemBtnOnClick(index, txnItem) {
    //console.log(this.doctorsList);
    this.selItemForEdit = txnItem;

    //Yubraj 30th July -- Disable discount TextBox in case of DiscableApplicable is false
    let itmId = this.selItemForEdit.ItemId;
    let itmName = this.selItemForEdit.ItemName;
    var selItemDetails = this.allItemslist.find(a => a.ItemId == itmId && a.ItemName == itmName)
    this.discountApplicable = selItemDetails.DiscountApplicable;
    this.showEditItemsPopup = true;
    //alert(index);
  }

  //this will be called when Item's edit window is closed.
  CloseItemEditWindow($event) {
    this.showEditItemsPopup = false;
    if ($event && $event.updatedItem && $event.updatedItem.ServiceDepartmentName == "Bed Charges") {
      this.LoadPatientBillingSummary(this.patientId, this.ipVisitId);
    }
    else {
      let index = this.patAllPendingItems.findIndex(a => a.BillingTransactionItemId == this.selItemForEdit.BillingTransactionItemId);
      let filteredListIndex = this.filteredPendingItems.findIndex(a => a.BillingTransactionItemId == this.selItemForEdit.BillingTransactionItemId);
      if ($event.EventName == "update" && $event.updatedItem) {
        this.filteredPendingItems[filteredListIndex] = $event.updatedItem;
        this.patAllPendingItems[index] = $event.updatedItem;
      }
      else if ($event.EventName == "cancelled") {
        this.filteredPendingItems.splice(filteredListIndex, 1);
        this.patAllPendingItems.splice(index, 1);
      }
      this.filteredPendingItems = this.filteredPendingItems.slice();
      this.patAllPendingItems = this.patAllPendingItems.slice();
      this.CalculationForAll();
    }
  }

  GetDoctorsList() {
    this.dlService.Read("/api/Billing?reqType=doctor-list")
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.doctorsList = res.Results;
          let Obj = new Object();
          Obj["EmployeeId"] = null;
          Obj["FullName"] = "SELF";
          this.doctorsList.push(Obj);
        }
      });
  }

  GetUsersList() {
    this.dlService.Read("/api/Settings?reqType=employee")
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.UsersList = res.Results;
        }
      });
  }

  //getting credit organization_list yubraj --22nd April '19
  public GetOrganizationList() {
    this.billingBLService.GetOrganizationList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.organizationList = res.Results;
          }
        }
        else {
          this.msgBoxServ.showMessage("failed", ['Failed to get Organization List.' + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get Organization List.' + err.ErrorMessage]);
        });
  }

  //Yubraj : 20th Dec '18
  UpdateProcedure() {
    this.loading = true;

    var admissionPatId = this.admissionInfo.AdmissionPatientId;
    var ProcedureType = this.admissionInfo.ProcedureType;
    if (ProcedureType) {

      this.billingBLService.UpdateProcedure(admissionPatId, ProcedureType)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ["Procedure Type Updated Successfully."]);
              this.loading = false;
            }
            else {
              this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
              this.loading = false;
            }
          });
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Please enter Procedure Description."]);
      this.loading = false;
    }
  }


  //NOTE: Below function may not work as expected if more than one item has same name in database !!
  FormatItemsToGroup(allBillItems: Array<BillingTransactionItem>) {
    //
    let allItemNames = allBillItems.map(itm => {
      return itm.ItemName;
    });

    let uniqueItms = CommonFunctions.GetUniqueItemsFromArray(allItemNames);

    let retItems = uniqueItms.map(itmName => {
      let currBilItems = allBillItems.filter(bItm => bItm.ItemName == itmName);
      let newBillItem = new BillingTransactionItem();
      newBillItem.ItemName = itmName;
      newBillItem.ServiceDepartmentId = currBilItems[0].ServiceDepartmentId;
      newBillItem.ItemId = currBilItems[0].ItemId;
      //below function is equivalent to C# Function : Items.Sum(itm=> itm.Subtotal)
      newBillItem.SubTotal = currBilItems.reduce((sum, c) => sum + c.SubTotal, 0);
      newBillItem.Quantity = currBilItems.reduce((sum, c) => sum + c.Quantity, 0);
      newBillItem.DiscountAmount = currBilItems.reduce((sum, c) => sum + c.DiscountAmount, 0);
      newBillItem.Tax = currBilItems.reduce((sum, c) => sum + c.Tax, 0);
      newBillItem.TotalAmount = currBilItems.reduce((sum, c) => sum + c.TotalAmount, 0);
      return newBillItem;
    });
  }
  ShowEstimationBill() {
    this.billType = "estimation";
    this.billStatus = "provisional";
    this.showDischargeBill = true;
  }

  UpdateBedDuration() {

    this.billingBLService.UpdateBedDurationBillTxn(this.bedDurationDetails)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          console.log("ADT Bill Items Quantity updated.");
        }
        else {
          console.log("Failed to update bed transaction detail.");
          console.log(res.ErrorMessage);
        }
      });
  }

  PostBillingTransaction() {
    this.MapBillingTransaction();
    this.billingBLService.PostIpBillingTransaction(this.billingTransaction)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.billingTxnId = this.billingTransaction.BillingTransactionId = res.Results.BillingTransactionId;
          this.DischargePatient();
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to complete billing transaction."]);
          console.log(res.ErrorMessage);
          this.loading = false;
        }
      });
  }

  CancelDischarge() {
    this.showDischargePopUpBox = false;
    this.dischargeDetail.Remarks = "";
    this.loading = false;
  }

  DischargePatient() {
    this.dischargeDetail.BillStatus = this.billingTransaction.BillStatus;
    this.dischargeDetail.BillingTransactionId = this.billingTxnId;
    this.dischargeDetail.PatientId = this.patientId;
    this.dischargeDetail.ProcedureType = this.admissionInfo.ProcedureType;
    this.billingBLService.DischargePatient(this.dischargeDetail)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.showDischargeBill = true;
          this.loading = false;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["BILLING TRANSACTION completed but DISCHARGE PATIENT failed."]);
          console.log(res.ErrorMessage);
          this.loading = false;
        }
      });
  }


  MapBillingTransaction() {
    this.billingTransaction = new BillingTransaction;
    this.billingTransaction.BillingTransactionItems = this.filteredPendingItems;
    this.billingTransaction.PatientId = this.patientId;
    this.billingTransaction.PatientVisitId = this.ipVisitId;
    this.billingTransaction.PaymentMode = this.model.PayType;
    this.billingTransaction.PaymentDetails = this.model.PaymentDetails;
    this.billingTransaction.BillStatus = this.model.PayType.toLocaleLowerCase() != "credit" ? "paid" : "unpaid";
    this.billingTransaction.Remarks = this.model.Remarks;
    this.billingTransaction.SubTotal = this.model.SubTotal;
    //for exchange rate
    if (this.exchangeRate == 0) {
      this.billingTransaction.ExchangeRate = null;
    } else {
      this.billingTransaction.ExchangeRate = this.exchangeRate;
    }

    this.billingTransaction.DiscountAmount = this.model.TotalDiscount;
    this.billingTransaction.TotalAmount = this.model.TotalAmount;
    this.billingTransaction.OrganizationId = this.model.OrganizationId;
    if (this.model.OrganizationId) {
      let org = this.organizationList.find(a => a.OrganizationId == this.model.OrganizationId);
      this.billingTransaction.OrganizationName = org.OrganizationName
    }

    if (this.estimatedDiscountPercent)
      this.billingTransaction.DiscountPercent = this.estimatedDiscountPercent;
    else
      this.billingTransaction.DiscountPercent = CommonFunctions.parseAmount(this.billingTransaction.DiscountAmount * 100 / (this.model.SubTotal));
    this.billingTransaction.TaxId = this.billingService.taxId;
    this.billingTransaction.PaidAmount = this.billingTransaction.BillStatus == "paid" ? this.model.ToBePaid : 0;
    this.billingTransaction.Tender = this.billingTransaction.PaidAmount;
    if (this.billingTransaction.PaymentMode != "credit") {
      this.billingTransaction.DepositReturnAmount = (this.model.ToBePaid > 0) ? this.model.DepositBalance : this.model.TotalAmount; //this is deposit deduction amount. It will be deducted against the transaction.
      this.billingTransaction.DepositBalance = this.model.ToBeRefund > 0 ? this.model.ToBeRefund : 0; // this is deposit return amount.

    }
    else {
      this.billingTransaction.DepositReturnAmount = 0;
      this.billingTransaction.DepositBalance = this.model.DepositBalance;
    }

    this.billingTransaction.PaidCounterId = this.billingTransaction.BillStatus == "paid" ? this.securityService.getLoggedInCounter().CounterId : null;
    this.billingTransaction.CounterId = this.securityService.getLoggedInCounter().CounterId;
    this.filteredPendingItems.forEach(item => {
      if (item.IsTaxApplicable) {
        this.billingTransaction.TaxableAmount += item.TaxableAmount;
      }
      else {
        this.billingTransaction.NonTaxableAmount += item.NonTaxableAmount;
      }
      item.PaidCounterId = this.billingTransaction.PaidCounterId;
      this.billingTransaction.TotalQuantity += item.Quantity;
      this.billingTransaction.BillStatus = this.billingTransaction.BillStatus;
    });
    this.billingTransaction.TransactionType = "inpatient";
    this.estimatedDiscountPercent = 0;
  }

  //convert nepali date to english date and assign to english calendar
  NepCalendarOnDateChange() {
    let engDate = this.npCalendarService.ConvertNepToEngDate(this.dischargeDetail.DischargeDateNepali);
    this.dischargeDetail.DischargeDate = engDate;
  }
  //this method fire when english calendar date changed
  //convert english date to nepali date and assign to nepali calendar
  EngCalendarOnDateChange() {
    if (this.dischargeDetail.DischargeDate) {
      let nepDate = this.npCalendarService.ConvertEngToNepDate(this.dischargeDetail.DischargeDate);
      this.dischargeDetail.DischargeDateNepali = nepDate;
    }
  }
  public calculateAdmittedDays() {
    this.bedDurationDetails = [];
    this.estimatedDischargeDate = this.dischargeDetail.DischargeDate;
    if (moment(this.admissionInfo.AdmittedOn).diff(this.dischargeDetail.DischargeDate) > 0) {
      this.validDischargeDate = false;
    }
    else {
      this.validDischargeDate = true;
    }
    //let checkouttimeparameter = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "CheckoutTime").ParameterValue;
    this.checkouttimeparameter = moment(this.admissionInfo.AdmittedOn).format("HH:mm");
    var duration = CommonFunctions.calculateADTBedDuration(moment(this.admissionInfo.AdmittedOn).format("YYYY-MM-DD HH:mm"), moment(this.dischargeDetail.DischargeDate).format("YYYY-MM-DD HH:mm"), this.checkouttimeparameter);
    if (duration.days > 0 && duration.hours)
      this.dischargeDetail.AdmittedDays = duration.days + ' + ' + duration.hours + ' hour';
    else if (duration.days && !duration.hours)
      this.dischargeDetail.AdmittedDays = duration.days.toString();
    else if (!duration.days && duration.hours)
      this.dischargeDetail.AdmittedDays = duration.hours + ' hour';
    else
      this.dischargeDetail.AdmittedDays = String(0);
    this.totalAdmittedDays = CommonFunctions.parseAmount(duration.days);
    this.UpdateAdtItemQuantity(this.totalAdmittedDays);
    this.calculateAndUpdateBedQuantity();
    this.UpdateBedDuration();
    this.CalculationForAll();
    this.ChangeTenderAmount();
  }

  public calculateAndUpdateBedQuantity() {

    if (this.bedDetails) {
      this.bedDetails.forEach(bed => {
        bed.IsQuantityUpdated = false;
      })
      this.bedDetails.forEach(bed => {
        //group and update quantity of similar bed details
        if (!bed.IsQuantityUpdated) {
          let totalBedDuration: number = 0;
          let allSimilarBeds = this.bedDetails.filter(a => a.BedFeatureId == bed.BedFeatureId);
          if (allSimilarBeds) {
            allSimilarBeds.forEach(sBed => {
              let bedEndDate = sBed.EndDate ? sBed.EndDate : this.dischargeDetail.DischargeDate;
              let duration = CommonFunctions.calculateADTBedDuration(sBed.StartDate, bedEndDate, this.checkouttimeparameter);
              if (duration.days > 0 && duration.hours)
                sBed.Days = duration.days + ' + ' + duration.hours + ' hour';
              else if (duration.days && !duration.hours)
                sBed.Days = duration.days.toString();
              else if (!duration.days && duration.hours)
                sBed.Days = duration.hours + ' hour';
              totalBedDuration += CommonFunctions.parseAmount(duration.days);
              sBed.IsQuantityUpdated = true;
            });
          }
          this.UpdateBedQuantity(totalBedDuration, bed.BedFeatureId);
        }
      });
    }
  }

  public UpdateAdtItemQuantity(quantity: number) {
    let adtItem = this.filteredPendingItems.find(a => a.ItemIntegrationName == "Medical and Resident officer/Nursing Charges");
    if (adtItem) {
      adtItem.Quantity = quantity > 1 ? quantity : 1;
      adtItem.SubTotal = adtItem.Quantity * adtItem.Price;
      adtItem.TotalAmount = adtItem.SubTotal - adtItem.DiscountAmount;
    }
    this.filteredPendingItems = this.filteredPendingItems.slice();
  }
  public UpdateBedQuantity(quantity: number, bedFeatureId: number) {
    let bedItem = this.filteredPendingItems.find(a => a.SrvDeptIntegrationName == "Bed Charges" && a.ItemId == bedFeatureId);
    if (bedItem) {
      let bed = new BedDurationTxnDetailsVM();
      bed.TotalDays = this.totalAdmittedDays;
      bed.BedFeatureId = bedFeatureId;
      bed.PatientVisitId = this.ipVisitId;
      if (bedItem.IsLastBed) {
        bed.Days = bedItem.Quantity = quantity > 1 ? quantity : 1;
      }
      bed.Days = bedItem.Quantity = bedItem.Quantity > 1 ? bedItem.Quantity : 1;
      bed.SubTotal = bedItem.SubTotal = bedItem.Quantity * bedItem.Price;
      if (bedItem.IsTaxApplicable) {
        bed.TaxableAmount = bed.SubTotal;
      }
      else {
        bed.NonTaxableAmount = bed.SubTotal;
      }
      bedItem.TotalAmount = bedItem.SubTotal - bedItem.DiscountAmount;
      this.bedDurationDetails.push(bed);
    }
  }
  //Hom 17 Jan '19
  CloseUpdatePricePopup($event) {
    if ($event && $event.modifiedItems) {
      let items = $event.modifiedItems
      this.patAllPendingItems
        .forEach(patItem => {
          for (let item of items) {
            if (item.ServiceDepartmentName == "Bed Charges") {
              this.LoadPatientBillingSummary(this.patientId, this.ipVisitId);
            }
            else {
              if (item.BillingTransactionItemId == patItem.BillingTransactionItemId) {
                patItem = Object.assign(patItem, item);
                items.splice(items.findIndex(a => a.BillingTransactionItemId == item.BillingTransactionItemId), 1)
                break;
              }
            }

          }


        });
      this.patAllPendingItems = this.patAllPendingItems.slice();
    }
    this.showUpdatePricePopup = false;
    this.CalculationForAll();
  }
  //1st August:  Dinesh Adding tender and change field
  ChangeTenderAmount() {
    if (this.model.ToBePaid) {
    this.model.Change = CommonFunctions.parseAmount(this.model.Tender - this.model.ToBePaid);
  }
  else
  this.model.Tender=0;
  }


}
