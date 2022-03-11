import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from "@angular/core";
import { LabsBLService } from "../shared/labs.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { Patient } from "../../patients/shared/patient.model";
import { BillingTransaction } from "../../billing/shared/billing-transaction.model";
import { BillingTransactionItem } from "../../billing/shared/billing-transaction-item.model";
import { CommonFunctions } from '../../shared/common.functions';
import * as moment from 'moment/moment';
import { SecurityService } from "../../security/shared/security.service";
import { BillingBLService } from "../../billing/shared/billing.bl.service";
import { BillingService } from "../../billing/shared/billing.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { PatientBillingContextVM } from "../../billing/shared/patient-billing-context-vm";
import { InPatientVM } from "../shared/InPatientVM";
import { LabRequestsListComponent } from "../lab-requests/lab-request-list"
import { CurrentVisitContextVM } from "../../appointments/shared/current-visit-context.model";
import { ADT_BLService } from "../../adt/shared/adt.bl.service";
import { DanpheCache, MasterType } from "../../shared/danphe-cache-service-utility/cache-services";
import { ENUM_BillingStatus, ENUM_VisitType, ENUM_BillingType } from "../../shared/shared-enums";
import { CoreService } from "../../core/shared/core.service";
@Component({
  selector: 'lab-requests',
  templateUrl: './lab-requests.html'
})
export class LabRequestsComponent implements OnInit {
  public showLabRequestsPage: boolean = true;
  public labBillItems: Array<any>;
  public inpatientList: Array<InPatientVM>;
  public billingTransaction: BillingTransaction;
  public showpatientsearch: boolean = false;
  @Input("selecteditems")
  public selectedPatient: any;
  public selectedItems = [];
  public visitList: Array<any>;
  public billingType = "inpatient";
  public loading = false;
  public isInitialWarning: boolean = true;
  public showIpBillingWarningBox: boolean = false;
  public taxId: number = 0;
  public currBillingContext: PatientBillingContextVM = null;
  public currPatVisitContext: CurrentVisitContextVM = null;
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

  public billingCounterId: number = 0;//sud: 13Sept'18

  @Output("callback-request-labitem")
  public callBackRequestLabItem: EventEmitter<Object> = new EventEmitter<Object>();

  constructor(public labBLService: LabsBLService,
    public msgBoxServ: MessageboxService,
    public securityService: SecurityService,
    public changeDetectorRef: ChangeDetectorRef,
    public billingBLService: BillingBLService,
    public billingService: BillingService, public admissionBLService: ADT_BLService, public coreService: CoreService) {
    this.GetInpatientlist();
    this.GetLabItems();
    this.GetBillingCounterForLab();//sud: 13Sept'18
  }

  GetBillingCounterForLab() {
    let allBilCntrs: Array<any>;
    allBilCntrs = DanpheCache.GetData(MasterType.BillingCounter, null);
    let labCntr = allBilCntrs.filter(cnt => cnt.CounterType == "LAB");
    if (labCntr) {
      this.billingCounterId = labCntr.find(cntr => cntr.CounterId).CounterId;
    }
    // this.billingBLService.GetAllBillingCounters()
    //     .subscribe((res: DanpheHTTPResponse) => {
    //         if (res.Status == "OK") {
    //             let allBilCntrs: Array<any> = res.Results;
    //             let labCntr = allBilCntrs.find(cnt => cnt.CounterType == "LAB");
    //             if (labCntr) {
    //                 this.billingCounterId = labCntr.CounterId;
    //                 //if (this.billingTransaction && this.billingTransaction.BillingTransactionItems && this.billingTransaction.BillingTransactionItems.length > 0) {
    //                 //    this.billingTransaction.BillingTransactionItems.forEach(itm => {
    //                 //        itm.CounterId = this.billingCounterId;
    //                 //    });
    //                 //}
    //             }
    //         }

    //     },
    //         err => {
    //             this.msgBoxServ.showMessage("error", ["Some error occured, please try again later."]);
    //             console.log(err.ErrorMessage);
    //         });


  }

  ngOnInit() {
    this.Initialize();
  }

  @Input("showlabrequisition")
  public set ShowLabRequisition(value: boolean) {
    this.showLabRequestsPage = value;
    if (this.showLabRequestsPage) {
      this.Initialize();
    }
  }

  Initialize() {
    // console.log(this.selectedPatient);
    //Needs some review and discussion on it
    if (this.selectedPatient) {
      this.labBLService.GetDataOfInPatient(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results.Current_WardBed) {
            this.currPatVisitContext = res.Results;
            this.InitAllData();
          } else {
            this.msgBoxServ.showMessage("failed", ["Problem! Cannot get the Current Visit Context ! "])
          }
        },
          err => { console.log(err.ErrorMessage); });

    }




  }


  public InitAllData() {
    this.patBillHistory = null;
    this.selectedItems = [];
    this.visitList = [];
    this.isInitialWarning = true;
    this.showIpBillingWarningBox = false;
    this.billingTransaction = new BillingTransaction();
    this.AddNewBillTxnItemRow();
    this.taxId = this.billingService.taxId;
    if (this.selectedPatient) {
      this.PatientChanged();
    }
  }

  Makerequests() {

    this.selectedItems = [];
    this.billingTransaction = new BillingTransaction();
    this.AddNewBillTxnItemRow();

  }
  AddNewBillTxnItemRow(index = null) {    //method to add the row

    let item = new BillingTransactionItem();
    item.EnableControl("Price", false);
    item.Quantity = 1;
    item.BillStatus = ENUM_BillingStatus.provisional;// "provisional";
    item.BillingType = ENUM_BillingType.inpatient;// "inpatient"; // please remove this hardcode
    item.VisitType = ENUM_VisitType.inpatient;// "inpatient";//hard-coded since this is only used for Inpatient.. need to change if we enable this for Outpatient as well.
    this.billingTransaction.BillingTransactionItems.push(item);
    if (index != null) {

      let new_index = index + 1
      window.setTimeout(function () {
        document.getElementById('items-box' + new_index).focus();
      }, 0);
    }
  }
  deleteRow(index: number) {
    this.billingTransaction.BillingTransactionItems.splice(index, 1);
    this.selectedItems.splice(index, 1);
    if (index == 0 && this.billingTransaction.BillingTransactionItems.length == 0) {
      this.AddNewBillTxnItemRow();
      this.changeDetectorRef.detectChanges();
    }
    this.Calculationforall();
  }

  public AssignSelectedItem(index) {
    let item = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selectedItems[index]) {
      if (typeof (this.selectedItems[index]) == 'string' && this.labBillItems.length) {
        item = this.labBillItems.find(a => a.ItemName.toLowerCase() == this.selectedItems[index].toLowerCase());
      }
      else if (typeof (this.selectedItems[index]) == 'object')
        item = this.selectedItems[index];
      if (item) {
        if (this.billingType.toLowerCase() != "inpatient") {
          let extItem = this.labBillItems.find(a => a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId);
          let extItemIndex = this.labBillItems.findIndex(a => a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId);
          if (extItem && index != extItemIndex) {
            this.msgBoxServ.showMessage("failed", [item.ItemName + " is already entered."]);
            this.changeDetectorRef.detectChanges();
            this.billingTransaction.BillingTransactionItems[index].IsDuplicateItem = true;
          }
          else
            this.billingTransaction.BillingTransactionItems[index].IsDuplicateItem = false;
        }
        this.billingTransaction.BillingTransactionItems[index].ItemId = item.ItemId;
        this.billingTransaction.BillingTransactionItems[index].ItemName = item.ItemName;
        this.billingTransaction.BillingTransactionItems[index].TaxPercent = 0;
        this.billingTransaction.BillingTransactionItems[index].IsTaxApplicable = item.TaxApplicable;
        //this.model.BillingTransactionItems[index].TaxableAmount = item.TaxApplicable ? item.Price : 0;
        this.billingTransaction.BillingTransactionItems[index].Price = item.Price;
        this.billingTransaction.BillingTransactionItems[index].ProcedureCode = item.ProcedureCode;
        //add also the servicedepartmentname property of the item; needed since most of the filtering happens on this value

        this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentName = item.ServiceDepartmentName;
        this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId = item.ServiceDepartmentId;
        this.billingTransaction.BillingTransactionItems[index].BillingTransactionItemValidator.controls['ServiceDepartmentId'].setValue(item.ServiceDepartmentId);
        this.billingTransaction.BillingTransactionItems[index].IsValidSelDepartment = true;
        this.billingTransaction.BillingTransactionItems[index].IsValidSelItemName = true;
        this.billingTransaction.BillingTransactionItems[index].VisitType = "inpatient";//this is hardcoded since it is IP billing.
        this.Calculationforall();
      }
      else
        this.billingTransaction.BillingTransactionItems[index].IsValidSelItemName = false;
    }


  }


  //-------------- implementing individual discount from the total discount percentahe----------
  Calculationforall() {
    if (this.billingTransaction.BillingTransactionItems.length) {

      let DP: number = 0; //discountPercent for the model (aggregate total) 
      let Dp: number = 0; // discountPercent for individual item
      let totalTax: number = 0;
      let loopTax: number = 0;
      let SubTotal: number = 0;
      let totalAmount: number = 0;
      let totalAmountAgg: number = 0;
      let totalQuantity: number = 0;
      let subtotal: number = 0;
      let calsubtotal: number = 0;
      let subtotalfordiscountamount: number = 0;
      DP = this.billingTransaction.DiscountPercent;
      let successiveDiscount: number = 0;
      let totalAmountforDiscountAmount: number = 0;
      let DiscountAgg: number = 0;
      //-------------------------------------------------------------------------------------------------------------------------------
      for (var i = 0; i < this.billingTransaction.BillingTransactionItems.length; i++) {
        let curRow = this.billingTransaction.BillingTransactionItems[i];
        Dp = curRow.DiscountPercent;
        curRow.DiscountPercentAgg = Dp;
        curRow.Price = CommonFunctions.parseAmount(curRow.Price);
        subtotal = (curRow.Quantity * curRow.Price); //100
        curRow.SubTotal = CommonFunctions.parseAmount(subtotal);
        let DiscountedAmountItem = (subtotal - (Dp / 100) * subtotal) //Discounted Amount for individual Item 
        let DiscountedAmountTotal = (DiscountedAmountItem - DP * DiscountedAmountItem / 100); // Discounted Amount From the Total Discount

        let tax = (curRow.TaxPercent / 100 * (DiscountedAmountTotal));
        curRow.Tax = CommonFunctions.parseAmount(tax);
        if (DP) {
          successiveDiscount = ((100 - Dp) / 100 * (100 - DP) / 100 * subtotal);
          let successiveDiscountAmount = successiveDiscount + curRow.TaxPercent / 100 * successiveDiscount;

          DiscountAgg = ((subtotal - successiveDiscountAmount) + curRow.Tax) * 100 / subtotal;
          //curRow.DiscountPercentAgg = (Math.round(DiscountAgg * 100) / 100);
          curRow.DiscountAmount = CommonFunctions.parseAmount(curRow.DiscountPercentAgg * subtotal / 100);
          curRow.DiscountPercentAgg = CommonFunctions.parseAmount(DiscountAgg);
        }

        loopTax = (curRow.TaxPercent * (subtotal / 100));
        //calsubtotal = calsubtotal + subtotal + loopTax;
        calsubtotal = calsubtotal + subtotal;
        totalTax = totalTax + loopTax;
        let DiscountedAmountTotalAgg = (DiscountedAmountItem - DP * DiscountedAmountItem / 100);
        totalAmountAgg = DiscountedAmountTotalAgg + curRow.Tax;
        totalAmount = DiscountedAmountTotal + curRow.Tax;
        curRow.TotalAmount = CommonFunctions.parseAmount(totalAmount);
        totalAmountforDiscountAmount = totalAmountforDiscountAmount + curRow.TotalAmount;
        SubTotal = SubTotal + totalAmountAgg;
        let CurQuantity = curRow.Quantity;
        totalQuantity = Number(totalQuantity) + Number(CurQuantity);
        subtotalfordiscountamount = subtotalfordiscountamount + subtotal;
        curRow.DiscountAmount = CommonFunctions.parseAmount(subtotal - DiscountedAmountTotal);
        //if tax not applicable then taxable amount will be zero. else: taxable amount = total-discount. 
        //opposite logic for NonTaxableAmount
        curRow.TaxableAmount = curRow.IsTaxApplicable ? (curRow.SubTotal - curRow.DiscountAmount) : 0;//added: sud: 29May'18
        curRow.NonTaxableAmount = curRow.IsTaxApplicable ? 0 : (curRow.SubTotal - curRow.DiscountAmount);//added: sud: 29May'18
      }
      this.billingTransaction.SubTotal = CommonFunctions.parseAmount(calsubtotal);
      this.billingTransaction.TotalQuantity = CommonFunctions.parseAmount(totalQuantity);
      this.billingTransaction.DiscountAmount = CommonFunctions.parseAmount(DiscountAgg * (this.billingTransaction.SubTotal) / 100);
      //this.model.DiscountAmount = Math.round(((this.model.SubTotal - totalAmountforDiscountAmount) * 100) / 100);
      //this.model.DiscountPercent = this.model.SubTotal != 0 ? Math.round(((this.model.DiscountAmount * 100) / this.model.SubTotal) * 1) / 1 : this.model.DiscountPercent;
      this.billingTransaction.TotalAmount = CommonFunctions.parseAmount(SubTotal);
      this.billingTransaction.TaxTotal = CommonFunctions.parseAmount(totalTax);
    }
    else {
      this.billingTransaction.SubTotal = 0;
      this.billingTransaction.TotalAmount = 0;
      this.billingTransaction.DiscountAmount = 0;
      this.billingTransaction.DiscountPercent = 0;
      this.billingTransaction.TotalQuantity = 0;
    }
  }
  //-------------- implementing individual discount from the total discount percentage----------

  GetLabItems() {
    this.labBLService.GetLabBillingItems()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.labBillItems = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get lab items."]);
        }
      });
  }

  GetInpatientlist() {
    this.admissionBLService.GetAdmittedPatients()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.inpatientList = res.Results;
          this.inpatientList = this.inpatientList.slice();
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
        });
  }

  public PatientChanged() {
    this.patBillHistory = null;
    if (this.selectedPatient && this.selectedPatient.PatientId) {
      this.LoadPatientPastBillSummary(this.selectedPatient.PatientId);
      this.GetPatientVisitList(this.selectedPatient.PatientId);
      this.LoadPatientBillingContext(this.selectedPatient.PatientId);
    }
    else {
      this.msgBoxServ.showMessage("notice-message", ["Please select patient from the list"]);
    }
  }
  public GetPatientVisitList(patientId) {
    this.labBLService.GetPatientVisitsProviderWise(patientId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.visitList = res.Results;
          }
          else {
            console.log(res.ErrorMessage);
          }
        }
      },
        err => {
          this.msgBoxServ.showMessage('Failed', ["unable to get PatientVisit list.. check log for more details."]);
          console.log(err.ErrorMessage);

        });
  }

  ItemsListFormatter(data: any): string {
    let html: string = data["ServiceDepartmentShortName"] + "-" + data["BillItemPriceId"] + "&nbsp;&nbsp;" + data["ItemName"] + "&nbsp;&nbsp;";
    html += "(<i>" + data["ServiceDepartmentName"] + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + " " + data["Price"];
    return html;
  }
  CloseLabRequestsPage() {
    this.showLabRequestsPage = false;
  }
  //used to format display of item in ng-autocomplete
  patientListFormatter(data: any): string {
    let html = data["ShortName"] + ' [ ' + data['PatientCode'] + ' ]';
    return html;
  }
  SetVisitDetailToTransaction() {
    if (this.visitList && this.visitList.length) {
      this.billingTransaction.BillingTransactionItems.forEach(billItem => {
        billItem.PatientVisitId = this.visitList[0].PatientVisitId;
        billItem.BillingTransactionItemValidator.controls['RequestedBy'].setValue(this.visitList[0].ProviderId);
        billItem.RequestedBy = this.visitList[0].ProviderId;
        billItem.PatientId = this.selectedPatient.PatientId;
        billItem.PatientVisitId = this.selectedPatient.PatientVisitId;
      });
    }
  }
  SubmitBillingTransaction(): void {
    //this.loading is set to true from the HTML. to handle double-Click.
    //check if there's other better alternative. till then let it be.. --sud:23Jan'18
    if (this.loading) {
      //set loading=true so that the butotn will be disabled to avoid Double-Click 
      ///Its COMPULSORY to disable : DON'T CHANGE THIS -- sud: 21Jan2018
      this.loading = true;

      //console.log("-----Submit Clicked----");
      let isFormValid = true;
      this.SetVisitDetailToTransaction();
      for (var j = 0; j < this.billingTransaction.BillingTransactionItems.length; j++) {
        if (this.billingTransaction.BillingTransactionItems[j].Price < 0) {
          this.msgBoxServ.showMessage("error", ["The price of some items is less than zero "]);
          this.loading = false;
          break;
        }
        if (this.billingTransaction.BillingTransactionItems) {
          for (var i = 0; i < this.billingTransaction.BillingTransactionItems.length; i++) {
            let currTxnItm = this.billingTransaction.BillingTransactionItems[i];
            currTxnItm.EnableControl("Price", false);
            for (var valCtrls in currTxnItm.BillingTransactionItemValidator.controls) {
              currTxnItm.BillingTransactionItemValidator.controls[valCtrls].markAsDirty();
              currTxnItm.BillingTransactionItemValidator.controls[valCtrls].updateValueAndValidity();
            }
          }

          for (var i = 0; i < this.billingTransaction.BillingTransactionItems.length; i++) {
            let currTxnItm_1 = this.billingTransaction.BillingTransactionItems[i];
            //break loop if even a single txn item is invalid.
            if (!currTxnItm_1.IsValidCheck(undefined, undefined)) {
              isFormValid = false;
              break;
            }
          }
        }
        else {
          isFormValid = false;
        }
        if (isFormValid) {
          for (var j = 0; j < this.billingTransaction.BillingTransactionItems.length; j++) {
            this.billingTransaction.BillingTransactionItems[j].CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
            this.billingTransaction.BillingTransactionItems[j].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

            //here default counter for lab will be set..
            //need to change if we have to activate counters for labs as well..
            this.billingTransaction.BillingTransactionItems[j].CounterId = this.billingCounterId;
            //this.billingTransaction.BillingTransactionItems[j].CounterId = this.securityService.getLoggedInCounter().CounterId;
            //Move counterday to server once CounterFeature is added change--sudarshan:25July 
            this.billingTransaction.BillingTransactionItems[j].CounterDay = moment().format("YYYY-MM-DD");

            let visit = this.visitList.find(a => a.ProviderId == this.billingTransaction.BillingTransactionItems[j].RequestedBy)
            if (visit)
              this.billingTransaction.BillingTransactionItems[j].PatientVisitId = visit.PatientVisitId;

          }
          this.billingTransaction.TaxId = this.taxId;
          this.PostToDepartmentRequisition(this.billingTransaction.BillingTransactionItems);

        }
        else {
          this.loading = false;
        }
      }
    }
  }



  //posts to Departments Requisition Table
  PostToDepartmentRequisition(billTxnItems: Array<BillingTransactionItem>) {
    //orderstatus="active" and billingStatus="paid" when sent from billingpage.
    this.billingBLService.PostDepartmentOrders(billTxnItems, "active", "provisional", false, this.currPatVisitContext)
      .subscribe(res => {

        if (res.Status == "OK") {
          this.PostToBillingTransaction(res.Results);
        }
        else {
          this.loading = false;
          this.msgBoxServ.showMessage("failed", ["Unable to do lab request.Please try again later"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  PostToBillingTransaction(billTxnItems: Array<BillingTransactionItem>) {
    this.AssignReqDeptNBillingType(billTxnItems);
    this.billingBLService.PostBillingTransactionItems(billTxnItems)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            this.Makerequests();
            this.callBackRequestLabItem.emit();
            this.msgBoxServ.showMessage("success", ["Lab IP request added successfully!"]);
            this.loading = false;
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            this.loading = false;
          }
        });
  }

  CheckAndSubmitBillingTransaction() {
    // at the time of submission, this is not initial warning.
    this.isInitialWarning = false;
    if (this.CheckSelectionFromAutoComplete() && this.CheckIsValidIpBilling()) {
      this.SubmitBillingTransaction();
    }
  }

  public CheckSelectionFromAutoComplete(): boolean {
    if (this.billingTransaction.BillingTransactionItems.length) {
      for (let itm of this.billingTransaction.BillingTransactionItems) {
        if (!itm.IsValidSelDepartment) {
          this.msgBoxServ.showMessage("failed", ["Invalid Department. Please select Department from the list."]);
          this.loading = false;
          return false;
        }
        if (!this.selectedPatient || !this.selectedPatient.PatientId) {
          this.msgBoxServ.showMessage("failed", ["Invalid Patient. Please select Patient from the list."]);
          this.loading = false;
          return false;
        }
      }
      return true;
    }
  }
  CheckIsValidIpBilling(): boolean {
    let isValid = true;
    if (this.billingType.toLowerCase() == "inpatient") {
      if (this.isInitialWarning && this.patBillHistory.BalanceAmount <= 0) {
        isValid = false;
        this.showIpBillingWarningBox = true;
      }
      else if (this.patBillHistory.BalanceAmount < this.billingTransaction.TotalAmount) {
        isValid = false;
        this.showIpBillingWarningBox = true;
      }
    }
    return isValid;
  }
  CloseIpWarningPopUp() {
    if (this.isInitialWarning)
      this.showLabRequestsPage = false;
    else {
      this.showIpBillingWarningBox = false;
      this.loading = false;
    }
  }
  ProceedWithoutDeposit() {
    this.showIpBillingWarningBox = false;
    //if this is not initial warning, we've to prceed to submit billing transaction.
    if (!this.isInitialWarning) {
      this.SubmitBillingTransaction();
    }

  }

  AssignReqDeptNBillingType(billTxnItems: Array<BillingTransactionItem>) {
    let requestingDeptId: number = null;
    requestingDeptId = this.currBillingContext.RequestingDeptId;
    if (billTxnItems && billTxnItems.length > 0) {
      billTxnItems.forEach(itm => {
        itm.RequestingDeptId = requestingDeptId;
        itm.BillingType = this.billingService.BillingType;
      });
    }
  }
  LoadPatientBillingContext(patientId) {
    this.billingBLService.GetPatientBillingContext(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.currBillingContext = res.Results;
          this.billingService.BillingType = this.currBillingContext.BillingType;
          this.billingType = this.currBillingContext.BillingType;


        }
      });
  }


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

          // at the time of submission, this is not initial warning.
          this.isInitialWarning = true;
          this.CheckIsValidIpBilling();

        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          this.loading = false;
        }
      });
  }


}
