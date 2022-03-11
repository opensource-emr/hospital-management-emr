import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from "@angular/core";
import { Patient } from "../../../patients/shared/patient.model";
import { BillingService } from "../../shared/billing.service";
import { BillingTransaction } from "../../shared/billing-transaction.model";
import { ServiceDepartmentVM } from "../../../shared/common-masters.model";
import { CoreService } from "../../../core/shared/core.service";
import { BillingBLService } from "../../shared/billing.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { PatientBillingContextVM } from "../../shared/patient-billing-context-vm";
import { BillingTransactionItem } from "../../shared/billing-transaction-item.model";
import { CommonFunctions } from "../../../shared/common.functions";
import * as moment from 'moment/moment';
import { SecurityService } from "../../../security/shared/security.service";
import { CurrentVisitContextVM } from "../../../appointments/shared/current-visit-context.model";
import { BillingReceiptModel } from "../../shared/billing-receipt.model";
import { PatientService } from "../../../patients/shared/patient.service";
import { CreditOrganization } from "../../../settings-new/shared/creditOrganization.model";
import { Router } from "@angular/router";
import { ENUM_BillingStatus, ENUM_VisitType, ENUM_BillingType } from "../../../shared/shared-enums";

@Component({
  selector: 'insurance-bill-item-request',
  templateUrl: './insurance-bill-item-request.html',
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class InsuranceBillItemRequest {

  //public showInsuranceBillRequest: boolean = true;

  @Input("patientId")
  public patientId: number;
  //@Input("visitId")
  public visitId: number;
  @Input("patientInfo")
  public patientInfo: Patient;

  @Input("patInsuranceBillHistory")
  public patInsuranceBillHistory: any;

  @Output("emit-billItemReq")
  public emitBillItemReq: EventEmitter<Object> = new EventEmitter<Object>();

  //@Input("showInsuranceBillRequestPage")
  //public set ShowLabRequisition(value: boolean) {
  //  this.showInsuranceBillRequest = value;
  //  if (this.showInsuranceBillRequest && this.patientId) {
  //    this.ResetVariables();
  //    this.GetPatientVisitList(this.patientId);
  //    this.LoadPatientBillingContext(this.patientId);
  //    //      this.GetVisitContext(this.patientId, this.visitId);
  //  }
  //}

  public billingTransaction: BillingTransaction;
  public selectedServDepts: Array<any> = [];
  public serviceDeptList: Array<ServiceDepartmentVM>;
  public selectedRequestedByDr: Array<any> = [];
  public doctorsList: Array<any> = [];
  public selectedAssignedToDr: Array<any> = [];
  public selectedItems = [];
  //public taxDetail = { taxPercent: 0, taxId: 0 }; //Not required while insurance billing
  //public groupDiscountPercent: number = 0; //Not required while insurance billing
  public currBillingContext: PatientBillingContextVM = null;
  public billingType = "outpatient";
  public billItems: Array<any>;
  public billItemsComplete: Array<any>;
  public visitList: Array<any>;
  public showInsuranceBillRequestSlip: Boolean = false;
  public InsuranceBillRequestDetails: BillingReceiptModel;

  constructor(public changeDetector: ChangeDetectorRef,
    public billingService: BillingService,
    public coreService: CoreService,
    public billingBLService: BillingBLService,
    public msgBoxServ: MessageboxService,
    public securityService: SecurityService,
    public patientService: PatientService,
    public router: Router) {
    this.GetBillingItems();
    this.GetDoctorsList();
  }

  ngOnInit() {
    this.patientInfo;
    this.ResetVariables();

    if (this.patientId) {
      this.GetPatientVisitList(this.patientId);
      this.LoadPatientBillingContext(this.patientId);
    }

    this.serviceDeptList = this.coreService.Masters.ServiceDepartments;
    this.serviceDeptList = this.serviceDeptList.filter(a => a.ServiceDepartmentName != "OPD");
  }

  ResetVariables() {
    this.selectedItems = [];
    this.selectedAssignedToDr = [];
    this.selectedServDepts = [];
    this.selectedRequestedByDr = [];
    //  this.visitList = [];
    this.billingTransaction = new BillingTransaction();
    //this.AddNewBillTxnItemRow();
    //this.taxDetail.taxId = this.billingService.taxId;
    //this.taxDetail.taxPercent = this.billingService.taxPercent;
    //this.groupDiscountPercent = 0;
  }

  public GetPatientVisitList(patientId) {
    this.billingBLService.GetPatientVisitsProviderWise(patientId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.visitList = res.Results;
            this.visitId = this.visitList[0].PatientVisitId;
            let doc = this.doctorsList.find(a => a.EmployeeId == this.visitList[0].ProviderId);
            if (doc) {
              this.selectedRequestedByDr[0] = doc.FullName;
              this.AssignRequestedByDoctor(0);
            }
            //this.GetVisitContext(this.patientId, this.visitList[0].PatientVisitId);
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
  //start: get: master and patient data
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

  public GetBillingItems() {
    this.billingBLService.GetInsuranceBillingItems()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.billItemsComplete = res.Results;
            this.billItems = this.billItemsComplete.filter(item => item.ServiceDepartmentName != "OPD");

            this.AddNewBillTxnItemRow();
          }
          else {
            this.msgBoxServ.showMessage('Failed', ["unable to get items for searchbox.. check logs for more details."]);
            console.log(res.ErrorMessage);
          }
        }
      },
        err => {
          console.log(err.ErrorMessage);

        });
  }
  public GetDoctorsList() {
    this.billingBLService.GetDoctorsList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.doctorsList = res.Results;
            let Obj = new Object();
            Obj["EmployeeId"] = null; //change by Yub -- 23rd Aug '18
            Obj["FullName"] = "SELF";
            this.doctorsList.push(Obj);
          }
          else {
            console.log(res.ErrorMessage);
          }
        }
      },
        err => {
          this.msgBoxServ.showMessage('Failed', ["unable to get Doctors list.. check log for more details."]);
          console.log(err.ErrorMessage);
        });
  }

  AddNewBillTxnItemRow(index = null) {    //method to add the row
    let billItem = this.NewBillingTransactionItem();
    this.billingTransaction.BillingTransactionItems.push(billItem);
    if (index != null) {
      let new_index = this.billingTransaction.BillingTransactionItems.length - 1;
      this.selectedRequestedByDr[new_index] = this.selectedRequestedByDr[index];
      this.AssignRequestedByDoctor(new_index);
      window.setTimeout(function () {
        document.getElementById('items-box' + new_index).focus();
      }, 0);
    }
  }

  NewBillingTransactionItem(index = null): BillingTransactionItem {
    let billItem = new BillingTransactionItem();
    billItem.Quantity = 1;
    billItem.ItemList = this.billItems;

    return billItem;
  }

  deleteRow(index: number) {
    this.billingTransaction.BillingTransactionItems.splice(index, 1);
    this.selectedItems.splice(index, 1);
    this.selectedAssignedToDr.splice(index, 1);
    this.selectedServDepts.splice(index, 1);
    if (index == 0 && this.billingTransaction.BillingTransactionItems.length == 0) {
      this.AddNewBillTxnItemRow();
      this.changeDetector.detectChanges();
    }
    this.Calculationforall();
  }

  ServiceDeptListFormatter(data: any): string {
    return data["ServiceDepartmentName"];
  }

  DoctorListFormatter(data: any): string {
    return data["FullName"];
  }

  ItemsListFormatter(data: any): string {
    let html: string = data["ServiceDepartmentShortName"] + "-" + data["BillItemPriceId"] + "&nbsp;&nbsp;" + data["ItemName"] + "&nbsp;&nbsp;";
    html += "(<i>" + data["ServiceDepartmentName"] + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + data["Price"];
    return html;
  }

  CloseInsuranceRequestsPage() {
    this.emitBillItemReq.emit({ action: "close", data: null });
  }

  //assigns service department id and filters item list
  ServiceDeptOnChange(index) {
    let srvDeptObj = null;
    // check if user has given proper input string for department name 
    //or has selected object properly from the dropdown list.
    if (typeof (this.selectedServDepts[index]) == 'string') {
      if (this.serviceDeptList.length && this.selectedServDepts[index])
        srvDeptObj = this.serviceDeptList.find(a => a.ServiceDepartmentName.toLowerCase() == this.selectedServDepts[index].toLowerCase());
    }
    else if (typeof (this.selectedServDepts[index]) == 'object')
      srvDeptObj = this.selectedServDepts[index];
    //if selection of department from string or selecting object from the list is true
    //then assign proper department name
    if (srvDeptObj) {
      if (srvDeptObj.ServiceDepartmentId != this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId) {
        this.ResetSelectedRow(index);
        this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId = srvDeptObj.ServiceDepartmentId;
      }
      this.FilterBillItems(index);
      this.billingTransaction.BillingTransactionItems[index].IsValidSelDepartment = true;
    }
    //else raise an invalid flag
    else {
      this.billingTransaction.BillingTransactionItems[index].ItemList = this.billItems;
      this.billingTransaction.BillingTransactionItems[index].IsValidSelDepartment = false;
    }
  }

  public FilterBillItems(index) {
    //ramavtar:13may18: at start if no default service department is set .. we need to skip the filtering of item list.
    if (this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId) {
      if (this.billingTransaction.BillingTransactionItems.length && this.billItems.length) {
        let srvDeptId = this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId;
        //initalAssign: FilterBillItems was called after assinging all the values(used in ngModelChange in SelectDepartment)
        // and was assigning ItemId=null.So avoiding assignment null value to ItemId during inital assign.
        if (this.billingTransaction.BillingTransactionItems[index].ItemId == null)
          this.ResetSelectedRow(index);
        this.billingTransaction.BillingTransactionItems[index].ItemList = this.billItems.filter(a => a.ServiceDepartmentId == srvDeptId);

        //// checking directly from list of database yubraj-- 24th Oct 2018
        if (this.selectedItems[index] && this.selectedItems[index].IsDoctorMandatory) {
          this.billingTransaction.BillingTransactionItems[index].UpdateValidator("on", "ProviderId", "required");
        }
        else {
          this.billingTransaction.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);
        }
      }
    }
    else {
      let billItems = this.billItems.filter(a => a.ServiceDepartmentName != "OPD");
      this.billingTransaction.BillingTransactionItems[index].ItemList = billItems;
    }
  }
  //----start: add/delete rows-----
  ResetSelectedRow(index) {
    this.selectedItems[index] = null;
    this.selectedAssignedToDr[index] = null;
    this.billingTransaction.BillingTransactionItems[index] = this.NewBillingTransactionItem();
    this.Calculationforall();
  }

  public AssignRequestedByDoctor(index) {
    let doctor = null;
    if (this.billingTransaction.BillingTransactionItems.length == 0) {
      return;
    }
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selectedRequestedByDr[index]) {
      if (typeof (this.selectedRequestedByDr[index]) == 'string' && this.doctorsList.length) {
        doctor = this.doctorsList.find(a => a.FullName.toLowerCase() == this.selectedRequestedByDr[index].toLowerCase());
      }
      else if (typeof (this.selectedRequestedByDr[index]) == 'object')
        doctor = this.selectedRequestedByDr[index];
      if (doctor) {
        this.billingTransaction.BillingTransactionItems[index].RequestedBy = doctor.EmployeeId;
        this.billingTransaction.BillingTransactionItems[index].RequestedByName = doctor.FullName;
        this.billingTransaction.BillingTransactionItems[index].IsValidSelRequestedByDr = true;
      }
      else
        this.billingTransaction.BillingTransactionItems[index].IsValidSelRequestedByDr = false;
    }
    else
      this.billingTransaction.BillingTransactionItems[index].IsValidSelRequestedByDr = true;
  }

  public AssignSelectedDoctor(index) {
    let doctor = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selectedAssignedToDr[index]) {
      if (typeof (this.selectedAssignedToDr[index]) == 'string' && this.doctorsList.length) {
        doctor = this.doctorsList.find(a => a.FullName.toLowerCase() == this.selectedAssignedToDr[index].toLowerCase());
      }
      else if (typeof (this.selectedAssignedToDr[index]) == 'object')
        doctor = this.selectedAssignedToDr[index];
      if (doctor) {
        this.billingTransaction.BillingTransactionItems[index].ProviderId = doctor.EmployeeId;
        this.billingTransaction.BillingTransactionItems[index].ProviderName = doctor.FullName;
        this.billingTransaction.BillingTransactionItems[index].IsValidSelAssignedToDr = true;
      }
      else
        this.billingTransaction.BillingTransactionItems[index].IsValidSelAssignedToDr = false;
    }
    else
      this.billingTransaction.BillingTransactionItems[index].IsValidSelAssignedToDr = true;
  }


  //start: autocomplete assign functions and item filter logic
  public AssignSelectedItem(index) {
    let item = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selectedItems[index]) {
      if (typeof (this.selectedItems[index]) == 'string' && this.billingTransaction.BillingTransactionItems[index].ItemList.length) {
        item = this.billingTransaction.BillingTransactionItems[index].ItemList.find(a => a.ItemName.toLowerCase() == this.selectedItems[index].toLowerCase());
      }
      else if (typeof (this.selectedItems[index]) == 'object')
        item = this.selectedItems[index];
      if (item) {
        //if (this.billingType.toLowerCase() != "inpatient") {
        //let extItem = this.billingTransaction.BillingTransactionItems.find(a => a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId);
        //let extItemIndex = this.billingTransaction.BillingTransactionItems.findIndex(a => a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId);
        //if (extItem && index != extItemIndex) {
        //  this.msgBoxServ.showMessage("failed", [item.ItemName + " is already entered."]);
        //  this.changeDetector.detectChanges();
        //  this.billingTransaction.BillingTransactionItems[index].IsDuplicateItem = true;
        //}
        //else
        //  this.billingTransaction.BillingTransactionItems[index].IsDuplicateItem = false;
        //}
        this.billingTransaction.BillingTransactionItems[index].ItemId = item.ItemId;
        this.billingTransaction.BillingTransactionItems[index].ItemName = item.ItemName;
        //this.billingTransaction.BillingTransactionItems[index].TaxPercent = item.TaxApplicable ? this.taxDetail.taxPercent : 0;
        this.billingTransaction.BillingTransactionItems[index].IsTaxApplicable = item.TaxApplicable;
        //this.billingTransaction.BillingTransactionItems[index].TaxableAmount = item.TaxApplicable ? item.Price : 0;
        this.billingTransaction.BillingTransactionItems[index].Price = item.Price;
        this.billingTransaction.BillingTransactionItems[index].ProcedureCode = item.ProcedureCode;
        //add also the servicedepartmentname property of the item; needed since most of the filtering happens on this value

        this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentName = this.GetServiceDeptNameById(item.ServiceDepartmentId);
        this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId = item.ServiceDepartmentId;
        this.selectedServDepts[index] = this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentName;
        this.billingTransaction.BillingTransactionItems[index].IsValidSelDepartment = true;
        this.billingTransaction.BillingTransactionItems[index].IsValidSelItemName = true;

        this.FilterBillItems(index);
        this.CheckItemProviderValidation(index);
        this.Calculationforall();
      }
      else
        this.billingTransaction.BillingTransactionItems[index].IsValidSelItemName = false;
      if (!item && !this.selectedServDepts[index]) {
        this.billingTransaction.BillingTransactionItems[index].ItemList = this.billItems;
      }
    }
  }

  GetServiceDeptNameById(servDeptId: number): string {
    if (this.serviceDeptList) {
      let srvDept = this.serviceDeptList.find(a => a.ServiceDepartmentId == servDeptId);
      return srvDept ? srvDept.ServiceDepartmentName : null;
    }
  }

  CheckItemProviderValidation(index: number) {
    if (this.selectedItems[index] && this.selectedItems[index].IsDoctorMandatory) {
      this.billingTransaction.BillingTransactionItems[index].UpdateValidator("on", "ProviderId", "required");
    }
    else {
      this.billingTransaction.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);
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
  }

  public loading = false;
  public PostSuccessBool: boolean = false;
  public currPatVisitContext: CurrentVisitContextVM;
  public organizationList: Array<CreditOrganization> = new Array<CreditOrganization>();

  SubmitBillingTransaction(): void {
    console.log(this.billingTransaction);
    //this.loading is set to true from the HTML. to handle double-Click.
    //check if there's other better alternative. till then let it be.. --sud:23Jan'18
    if (this.loading) {
      //set loading=true so that the butotn will be disabled to avoid Double-Click 
      ///Its COMPULSORY to disable : DON'T CHANGE THIS -- sud: 
      this.SetBillingTxnDetails();
      if (this.CheckInsuranceBalance() && this.CheckValidations()) {
        this.PostToDepartmentRequisition();
      }
      else {
        this.loading = false;
      }
    }
  }

  CheckInsuranceBalance(): boolean {
    let sumBalance = this.patInsuranceBillHistory.ProvisionalAmt + this.billingTransaction.TotalAmount;
    if (this.patInsuranceBillHistory.DepositBalance < sumBalance) {
      this.msgBoxServ.showMessage("failed", ["Insufficient Insurance billing, please remove some items and proceed"]);
      return false;
    }
    return true;
  }

  SetBillingTxnDetails() {
    let currentVisit = this.visitList.find(visit => visit.PatientVisitId == this.visitId);

    this.billingTransaction.BillingTransactionItems.forEach(txnItem => {
      txnItem.PatientVisitId = this.visitId;
      txnItem.PatientId = this.patientId;

      txnItem.RequestingDeptId = this.currBillingContext ? this.currBillingContext.RequestingDeptId : null;
      txnItem.BillingType = this.billingService.BillingType;
      txnItem.VisitType = this.billingService.BillingType.toLowerCase();
      txnItem.BillStatus = ENUM_BillingStatus.provisional;// "provisional";
      txnItem.IsInsurance = true;

      txnItem.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
      txnItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

      txnItem.CounterId = this.securityService.getLoggedInCounter().CounterId;
      txnItem.CounterDay = moment().format("YYYY-MM-DD");

    });
  }

  CheckValidations(): boolean {
    let isFormValid = true;
    if (this.patientId) {
      if (this.CheckSelectionFromAutoComplete() && this.billingTransaction.BillingTransactionItems.length) {
        for (var i = 0; i < this.billingTransaction.BillingTransactionItems.length; i++) {
          let currTxnItm = this.billingTransaction.BillingTransactionItems[i];
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
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Invalid Patient/Visit Id."]);
      isFormValid = false;
    }

    return isFormValid;
  }

  public CheckSelectionFromAutoComplete(): boolean {
    if (this.billingTransaction.BillingTransactionItems.length) {
      for (let itm of this.billingTransaction.BillingTransactionItems) {
        if (!itm.IsValidSelDepartment) {
          this.msgBoxServ.showMessage("failed", ["Invalid Department. Please select Department from the list."]);
          this.loading = false;
          return false;
        }
        if (!itm.RequestedBy) {
          this.msgBoxServ.showMessage("failed", ["Invalid Requested By Dr. Name. Please select doctor from the list."]);
          this.loading = false;
          return false;
        }
        if (!itm.IsValidSelAssignedToDr) {
          this.msgBoxServ.showMessage("failed", ["Invalid Assigned To Dr. Name. Please select doctor from the list."]);
          this.loading = false;
          return false;
        }
        if (!itm.IsValidSelItemName) {
          this.msgBoxServ.showMessage("failed", ["Invalid Item Name. Please select Item from the list."]);
          this.loading = false;
          return false;
        }
        if (itm.IsDuplicateItem) {
          this.msgBoxServ.showMessage("failed", ["Duplicate Item now allowed." + itm.ItemName + " is entered more than once"]);
          this.loading = false;
          return false;
        }
      }
      return true;
    }
  }

  //posts to Departments Requisition Table
  PostToDepartmentRequisition() {
    //orderstatus="active" and billingStatus="provisional" when sent from billingpage.
    let insuranceApplicable = true;
    this.billingBLService.PostDepartmentOrders(this.billingTransaction.BillingTransactionItems, "active", "provisional", insuranceApplicable, this.currPatVisitContext)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.PostToBillingTransaction();
        }
        else {
          this.loading = false;
          this.msgBoxServ.showMessage("failed", ["Unable to do lab request.Please try again later"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  PostToBillingTransaction() {
    this.billingTransaction.BillingTransactionItems.forEach(a => {
      a.PatientVisitId = this.visitId;
      a.BillingType = ENUM_BillingType.outpatient;// "outpatient";
      a.VisitType = ENUM_VisitType.outpatient;// "outpatient";
    });
    this.billingBLService.PostBillingTransactionItems(this.billingTransaction.BillingTransactionItems)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            /// this.CloseInsuranceRequestsPage();
            this.loading = false;
            if (this.PostSuccessBool) {
              //this.printInvoice();
              this.CallBackPostBilling(res.Results);
            }
            this.emitBillItemReq.emit({ action: "items-added", newItems: res.Results });
            this.msgBoxServ.showMessage("success", ["Item added successfully"]);
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            this.loading = false;
          }
        });
  }

  GetVisitContext(patientId: number, visitId: number) {
    if (patientId && visitId) {
      this.billingBLService.GetDataOfInPatient(patientId, visitId)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results.Current_WardBed) {
            this.currPatVisitContext = res.Results;
          }
          else {
            console.log("failed", ["Problem! Cannot get the Current Visit Context ! "])
          }
        },
          err => { console.log(err.ErrorMessage); });
    }
  }

  CallBackPostBilling(billTxnItems: Array<any>) {
    this.loading = false;
    this.billingTransaction.BillingTransactionItems = billTxnItems;
    this.billingTransaction.FiscalYear = billTxnItems[0].ProvFiscalYear;
    this.billingTransaction.InvoiceNo = billTxnItems[0].ProvisionalReceiptNo;

    let txnReceipt = BillingReceiptModel.GetReceiptForTransaction(this.billingTransaction);
    txnReceipt.IsInsuranceBilling = true;
    txnReceipt.Patient = Object.create(this.patientService.globalPatient);
    txnReceipt.IsValid = true;
    let ProvBillingUser = this.securityService.GetLoggedInUser().UserName; //Yubraj 28th June '19
    txnReceipt.BillingUser = ProvBillingUser;
    txnReceipt.Remarks = this.billingTransaction.Remarks;
    txnReceipt.OrganizationId = this.billingTransaction.OrganizationId;
    if (this.billingTransaction.OrganizationId) {
      let org = this.organizationList.find(a => a.OrganizationId == this.billingTransaction.OrganizationId);
      txnReceipt.OrganizationName = org.OrganizationName
    }
    txnReceipt.BillingDate = txnReceipt.BillingDate ? txnReceipt.BillingDate : moment().format("YYYY-MM-DD HH:mm:ss");
    txnReceipt.ReceiptType = "provisional";
    txnReceipt.singleReceiptBool = true; //This for single transaction of Provisional InvoiceNo 
    //txnReceipt.DepositBalance = this.isProvisionalBilling ? CommonFunctions.parseAmount(this.patBillHistory.DepositBalance) : txnReceipt.DepositBalance;

    //if (billTxn.TransactionType && billTxn.TransactionType.toLowerCase() == "inpatient") {
    //  txnReceipt.ReceiptType = "ip-receipt";
    //}

    this.InsuranceBillRequestDetails = txnReceipt;
    this.loading = false;//enables the submit button once all the calls are completed


    this.showInsuranceBillRequestSlip = false;
    this.changeDetector.detectChanges;
    this.showInsuranceBillRequestSlip = true;

    this.emitBillItemReq.emit({ action: "items-added", newItems: billTxnItems });

  }

  //getting credit organization_list yubraj
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

  public hotkeys(event) {
    if (event.keyCode == 27) {//key->ESC
      this.CloseInsuranceRequestsPage();
    }
  }
}
