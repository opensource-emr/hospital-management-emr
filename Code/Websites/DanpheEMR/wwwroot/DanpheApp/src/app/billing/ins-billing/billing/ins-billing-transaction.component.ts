import { Component, OnChanges, SimpleChanges, DoCheck, Input, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { PatientService } from '../../../patients/shared/patient.service';
import { VisitService } from '../../../appointments/shared/visit.service';
import { CallbackService } from '../../../shared/callback.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { SecurityService } from '../../../security/shared/security.service';
import { BillingService } from '../../shared/billing.service';

import { BillingTransactionItem } from "../../shared/billing-transaction-item.model";
import { BillingBLService } from '../../shared/billing.bl.service';

import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { BillItemRequisition } from '../../shared/bill-item-requisition.model';
import { BillingTransaction } from '../../shared/billing-transaction.model';
import { ServiceDepartmentVM } from '../../../shared/common-masters.model';
import { CommonFunctions } from '../../../shared/common.functions';
import * as moment from 'moment/moment';
import { OrdersBLService } from "../../../orders/shared/orders.bl.service";
import { CoreService } from "../../../core/shared/core.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { Patient } from '../../../patients/shared/patient.model';
import { PatientBillingContextVM } from '../../shared/patient-billing-context-vm';
import { BillingReceiptModel } from '../../shared/billing-receipt.model';
import { CurrentVisitContextVM } from '../../../appointments/shared/current-visit-context.model';
import { BillingPackage } from '../../shared/billing-package.model';
import { CreditOrganization } from '../../../settings-new/shared/creditOrganization.model';
import { ENUM_BillingStatus, ENUM_BillPaymentMode, ENUM_VisitType, ENUM_PriceCategory } from '../../../shared/shared-enums';

@Component({
  templateUrl: "./ins-billing-transaction.html", //"/BillingView/BillingTransaction"
  host: { '(window:keydown)': 'hotkeys($event)' }
})

export class INSBillingTransactionComponent {

  public model: BillingTransaction = new BillingTransaction();
  //public this.model.BillingTransactionItems: Array<BillingTransactionItem> = null;  //initialize the array of object to add the row 
  //public currentBilTxnItem: BillingTransactionItem = null;
  //public currencyUnit: string = null;
  public itemList: Array<any> = [];
  public isItemLoaded: boolean = false;
  public disableTextBox: boolean = false;
  //declare boolean loading variable for disable the double click event of button
  loading: boolean = false;
  public allServiceDepts: Array<ServiceDepartmentVM> = null;
  public organizationList: Array<CreditOrganization> = new Array<CreditOrganization>();

  public selectedItems: Array<any> = [];
  public selectedAssignedToDr: Array<any> = [];
  //public selectedRequestedByDr: Array<any> = [];//sud: 5Mar'19-- not required as we've moved requesting doctor to invoice level.
  public doctorsList: Array<any> = [];
  public visitList: Array<any> = [];
  public currentCounter: number = null;
  public reqDoctorsList: Array<any> = [];
  public defaultServiceDepartmentId: number = null;

  public showSelectPage: boolean = false;
  public disablePkgSelection: boolean = false;
  public taxPercent: number = 0;
  public taxId: number = 0;
  public selectedServDepts: Array<any> = [];
  public serviceDeptList: Array<ServiceDepartmentVM> = null;
  public currentBillingFlow: string;
  public showTxnCopySelPage: boolean = false;
  public disablePrevTxnSelection: boolean = false;
  public patientId: number;
  public billingType: string = "";//to separate inpatient billing, outpatient billing, etc..


  public isInitialWarning: boolean = true;

  public currBillingContext: PatientBillingContextVM = new PatientBillingContextVM;
  public currPatVisitContext: CurrentVisitContextVM;
  public currentVisitType: string = "outpatient";
  public earlierInvoiceItems: Array<BillingTransactionItem>;
  public isProvisionalBilling: boolean = false;
  public isCopyFromInvoice: boolean = false;
  public insuranceApplicableFlag: boolean = false; //Yubraj 31st May '19
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

  //sud: 10Sept'18--for billing packages modifications
  public isPackageBilling: boolean = false;
  public ActivePackageInfo = { BillingPackageId: 0, BillingPackageName: null, PackageCode: null };

  //ashim: 24Dec2018
  //modifications to remove billingTransactionItem page.
  public deductDeposit: boolean = false;
  public newDepositBalance: number = 0;
  public depositDeductAmount: number = 0;

  public param_allowAdditionalDiscOnProvisional: boolean = false;//sud:12Mar'19
  public showInsBalanceUpdate: boolean = false;
  public insurancePackageList: Array<BillingPackage>;
  public ShowDuplicateItemComfirmation: boolean = false;
  public DuplicateItem: any = { IsDuplicate: false, Item: [] };
  public IsDublicateItem: boolean = false;

  public showPastBillHistory: boolean = false;
  public RemainingInsuranceBalance: number = 0;//Yubraj : 8th July '19

  constructor(
    public patientService: PatientService,
    public billingService: BillingService,
    public router: Router,
    public callbackService: CallbackService,
    public routeFromService: RouteFromService,
    public patientVisitService: VisitService,
    public BillingBLService: BillingBLService,
    public changeDetectorRef: ChangeDetectorRef,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public ordersBlService: OrdersBLService,
    public coreService: CoreService) {
    this.currentCounter = this.securityService.getLoggedInCounter().CounterId;
    this.taxPercent = this.billingService.taxPercent;
    this.taxId = this.billingService.taxId;
    this.currentBillingFlow = this.routeFromService.RouteFrom;
    this.routeFromService.RouteFrom = "";
    if (this.currentCounter < 1) {
      this.callbackService.CallbackRoute = '/Billing/InsuranceMain/PatientList'
      this.router.navigate(['/Billing/CounterActivate']);
    }
    else {
      this.billingType = this.billingService.BillingType;
      //this.currentVisitType = this.patientService.globalPatient.LatestVisitType;
      //this.RefreshPage();
      this.Initialize();
      this.LoadParameterForProvisional();//sud:12Mar'19

      //this.LoadPatientPastBillSummary(this.patientService.getGlobal().PatientId);
      //new way: get servicedepts list from core-service-- sud/17Dec'17'
      this.allServiceDepts = this.coreService.Masters.ServiceDepartments;
      this.serviceDeptList = this.allServiceDepts;
      //sud:19June'19--SrvDepts with OPD consultation charge has Integration Name as OPD
      //if nothing is found in integration name then its fine, else check that it's not opd.
      this.serviceDeptList = this.allServiceDepts.filter(a => !a.IntegrationName || a.IntegrationName.toLowerCase() != "opd");
      this.GetBillingItems();
      //this.ShowHidePriceCategories();//sud:27Feb'19--for EHS, Foreigner, etc..
      // this.GetOrganizationList();//Yubraj: 22nd April '19 for credit organization.
      //this.LoadMembershipTypePatient();
    }
  }



  public RefreshPage() {
    this.model = new BillingTransaction();
  }

  public Initialize() {
    //added: ashim: 10Sep2018 : To initialize packagedetails
    this.isPackageBilling = false;
    this.ActivePackageInfo = { BillingPackageId: 0, BillingPackageName: null, PackageCode: null };
    //this.selectedRequestedByDr = [];
    this.selectedItems = [];
    this.selectedServDepts = [];
    this.selectedAssignedToDr = [];
    this.model = this.billingService.getGlobalBillingTransaction();

    //assign current counterid to the model..
    this.model.CounterId = this.currentCounter;
    this.model.PatientId = this.patientService.getGlobal().PatientId;

    //createdby will always be employeeid--sudarshan:7may'17
    this.model.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

    if (!this.model.BillingTransactionItems.length)
      this.AddNewBillTxnItemRow();
    if (this.model.IsCopyReceipt || this.isCopyFromInvoice) {
      for (let i = 0; i < this.model.BillingTransactionItems.length; i++) {
        this.model.BillingTransactionItems[i].UpdateValidator("off", "RequestedBy", null);
      }
    }

    this.LoadPatientBillingContext();

  }

  NewBillingTransactionItem(): BillingTransactionItem {
    let billTxnItem = new BillingTransactionItem();
    billTxnItem.PatientId = this.patientService.getGlobal().PatientId;
    billTxnItem.VisitType = this.currentVisitType;
    billTxnItem.Quantity = 1;
    //newReq.BillStatus = "unpaid";--commented sud: 4May'18
    ////by default item will be in provisional status
    billTxnItem.BillStatus = ENUM_BillingStatus.provisional;// "provisional";

    //we don't need validation on RequestedBy field, we're adding this value from other part of code..
    billTxnItem.UpdateValidator("off", "RequestedBy", "required");//sud:5Mar'19

    return billTxnItem;
  }

  AddNewBillTxnItemRow(index = null) {    //method to add the row
    if (!this.isPackageBilling) {
      //let srvDptId = this.BillingTransactionItems[index].ServiceDepartmentId;
      let item = this.NewBillingTransactionItem();



      item.ItemList = this.itemList;
      this.model.BillingTransactionItems.push(item);

      if (index != null) {
        //item.RequestedBy = this.model.BillingTransactionItems[index].RequestedBy;
        let new_index = this.model.BillingTransactionItems.length - 1;
        //this.selectedRequestedByDr[new_index] = this.model.BillingTransactionItems[index].RequestedByName;
        this.AssignRequestedByDoctor(new_index);
      }
      if (index != null) {

        let new_index = index + 1
        window.setTimeout(function () {
          let itmNameBox = document.getElementById('items-box' + new_index);
          if (itmNameBox) {
            itmNameBox.focus();
          }
        }, 500);
      }
    }
  }

  deleteRow(index: number) {

    //yubraj--28th sept 2018--
    let itemId = this.model.BillingTransactionItems[index].ItemId;
    let srvDeptId = this.model.BillingTransactionItems[index].ServiceDepartmentId;

    this.model.BillingTransactionItems.splice(index, 1);
    this.selectedItems.splice(index, 1);
    this.selectedAssignedToDr.splice(index, 1);
    this.selectedServDepts.splice(index, 1);

    //finding duplicate item || yubraj --28th sept 2018
    let dupItem = this.model.BillingTransactionItems.find(item => item.ServiceDepartmentId == srvDeptId && item.ItemId == itemId);
    if (dupItem) {
      dupItem.IsDuplicateItem = false;
    }

    if (index == 0 && this.model.BillingTransactionItems.length == 0) {
      this.AddNewBillTxnItemRow();
      this.changeDetectorRef.detectChanges();
    }
    //else
    //    this.currentBilTxnItem.Quantity = 1;
    this.ReCalculateInvoiceAmounts();//sud:10Mar'19
    //this.Calculationforall();//sud:10Mar'19----this method is replaced by above.

    //this.changeDetectorRef.detectChanges();
  }

  public GetDoctorsList() {
    this.BillingBLService.GetDoctorsList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.doctorsList = res.Results;
            this.reqDoctorsList = res.Results;
            let Obj = new Object();
            Obj["EmployeeId"] = null; //change by Yub -- 23rd Aug '18
            Obj["FullName"] = "SELF";
            this.reqDoctorsList.push(Obj);

            //due to asynchronous call consulting doctor was not updated all the time. so moving this get call here.
            this.GetPatientVisitList(this.patientService.getGlobal().PatientId);

            if (this.currentBillingFlow == "Orders" || this.currentBillingFlow == "BillReturn") {

              this.AssignLocalTxnFromGlobalTxn();
            }
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

  public GetPatientVisitList(patientId: number) {
    this.BillingBLService.GetPatientVisitsProviderWise(patientId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.visitList = res.Results;
            //Default Value for RequestedBy: Assign provider from latest visit
            if (this.model.BillingTransactionItems.length) {
              //ashim: 24Sep2018 : Do not assign Duty Doctor by default to Requested By Dr.
              //this.selectedRequestedByDr[0] = this.visitList[0].ProviderName == "Duty Doctor" ? "SELF" : this.visitList[0].ProviderName;

              //sud:26Feb'19-- to use one doctor for RequestedBy Doctor field..
              this.currentRequestedByDoctor = this.visitList[0].ProviderName == "Duty Doctor" ? "SELF" : this.visitList[0].ProviderName;

              this.AssignRequestedByDoctor(0);
            }
            this.GetVisitContext(patientId, this.visitList[0].PatientVisitId);
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

  public GetBillingItems() {

    this.GetInsurancePackages();
    //get insurance items
    this.BillingBLService.GetInsuranceBillingItems()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.GetDoctorsList();
            let itemList = res.Results;

            if (this.billingService.BillingFlow == "insurance-package") {
              itemList = itemList.filter(a => a.IsInsurancePackage != true);
            }
            this.CallBackGetBillingItems(itemList);
            this.GetDistinctServiceDepartments(itemList);
            this.isItemLoaded = true;
            this.FilterBillItems(0);
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


    //if (this.billingService.BillingFlow == "insurance" || this.billingService.BillingFlow == "insurance-package") {

    //}
    ////get all items
    //else {
    //  this.BillingBLService.GetBillItemList()
    //    .subscribe(res => {
    //      if (res.Status == 'OK' && res.Results.length) {
    //        this.CallBackGetBillingItems(res.Results);
    //        this.GetDoctorsList();
    //        this.FilterBillItems(0);
    //      }
    //      else {
    //        this.msgBoxServ.showMessage('Failed', ["Unable to Billing Items.Check log for more detail."]);
    //        console.log(res.ErrorMessage);
    //      }
    //    });
    //}
  }

  public CallBackGetBillingItems(result) {
    this.GetPatientVisitList(this.patientService.getGlobal().PatientId);
    this.itemList = result;
    this.isItemLoaded = true;
    this.FilterBillItems(0);
  }

  //get insurance packages
  public GetInsurancePackages() {
    this.BillingBLService.GetInsurancePackages()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.insurancePackageList = res.Results;
        }

      });
  }

  ////getting credit organization_list yubraj --22nd April '19
  //public GetOrganizationList() {
  //  this.BillingBLService.GetOrganizationList()
  //    .subscribe(res => {
  //      if (res.Status == 'OK') {
  //        if (res.Results.length) {
  //          this.organizationList = res.Results;
  //        }
  //      }
  //      else {
  //        this.msgBoxServ.showMessage("failed", ['Failed to get Organization List.' + res.ErrorMessage]);
  //      }
  //    },
  //      err => {
  //        this.msgBoxServ.showMessage("error", ['Failed to get Organization List.' + err.ErrorMessage]);
  //      });
  //}

  public CopyFromEarlierInvoice() {
    this.currentBillingFlow = "BillReturn";
    this.isCopyFromInvoice = true;
    this.Initialize();
    this.AssignLocalTxnFromGlobalTxn();
  }

  public AssignLocalTxnFromGlobalTxn() {
    if (this.model && this.model.BillingTransactionItems) {
      this.earlierInvoiceItems = this.model.BillingTransactionItems.slice();
      if (this.model.PackageId) {
        this.isPackageBilling = true;
      }
      if (this.model.DiscountPercent > 0) {
        this.InvoiceDiscountOnChange();
      }
      this.billingService.BillingType = this.billingType = this.model.TransactionType;
      if (this.model.BillingTransactionItems && this.model.BillingTransactionItems.length) {
        this.currentVisitType = this.model.BillingTransactionItems[0].VisitType;
        this.currBillingContext = new PatientBillingContextVM();
        this.currBillingContext.PatientVisitId = this.model.PatientVisitId;
        this.currBillingContext.BillingType = this.billingType;
      }
      for (let i = 0; i < this.model.BillingTransactionItems.length; i++) {
        let billItem = this.model.BillingTransactionItems[i];
        billItem.BillStatus = ENUM_BillingStatus.provisional;// "provisional";
        //billItem.Quantity = 1; //change by yub--23rd Aug '18
        billItem.EnableControl("ItemName", false);
        billItem.EnableControl("ServiceDepartmentId", false);
        this.selectedServDepts[i] = billItem.ServiceDepartmentName;

        //getting assign to doctor list
        let assignedToDr = this.doctorsList.find(d => d.EmployeeId == billItem.ProviderId);
        if (assignedToDr)
          this.selectedAssignedToDr[i] = assignedToDr.FullName;

        //Requested By Doctor was not displayed so this code was added to get the list.-- 22nd August--Yubraj.
        //let requestedByDr = this.reqDoctorsList.find(d => d.EmployeeId == billItem.RequestedBy);
        //if (requestedByDr)
        //    this.selectedRequestedByDr[i] = requestedByDr.FullName;

        billItem.RequestedBy = billItem.RequestedBy ? billItem.RequestedBy : 0;
        billItem.VisitType = this.currentVisitType;
        this.selectedItems[i] = billItem.ItemName;
        billItem.UpdateValidator("off", "RequestedBy", null);
        this.FilterBillItems(i);
        this.AssignSelectedItem(i);
        this.AssignSelectedDoctor(i);
        this.AssignRequestedByDoctor(i);
      }
    }


  }

  //LoadMembershipTypePatient(): void {
  //  let PatientId = this.model.PatientId;
  //  this.BillingBLService.GetPatientMembershipInfo(PatientId)
  //    .subscribe(res => {
  //      if (res.Status == "OK") {
  //        this.model.DiscountPercent = res.Results.DiscountPercent;
  //      }
  //      else {
  //        this.msgBoxServ.showMessage("failed", ["Failed to load Membership type"]);
  //      }
  //    });
  //}

  CheckItemProviderValidation(index: number) {
    //let srvDeptId = this.model.BillingTransactionItems[index].ServiceDepartmentId;
    //let servDeptName = this.GetServiceDeptNameById(srvDeptId);
    //if (this.IsDoctorMandatory(servDeptName, this.model.BillingTransactionItems[index].ItemName)) {
    // checking directly from list of database yubraj-- 8th Oct 2018
    if (this.selectedItems[index] && this.selectedItems[index].IsDoctorMandatory) {
      this.model.BillingTransactionItems[index].UpdateValidator("on", "ProviderId", "required");
    }
    else {
      this.model.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);
    }
  }

  CheckForDuplication(): boolean {
    var allowOnDuplicatedItems: boolean = false;

    //Check for duplicate items in the ItemList ordered
    this.DuplicateItem = { IsDuplicate: false, Item: [] };

    const map = new Map();
    for (const item of this.model.BillingTransactionItems) {
      var itemIdsDetail = item.ItemId + '-' + item.ServiceDepartmentId;
      if (map.has(itemIdsDetail)) {
        let itemDetail = { ItemName: null, Quantity: null, Price: null, RepeatedTimes: null, ItemId: null, ServiceDepartmentId: null };

        itemDetail.ItemName = item.ItemName;
        itemDetail.Price = item.Price;
        itemDetail.Quantity = item.Quantity;
        itemDetail.ItemId = item.ItemId;
        itemDetail.ServiceDepartmentId = item.ServiceDepartmentId;

        var dup = this.DuplicateItem.Item.find(itm => itm.ItemName == itemDetail.ItemName);
        if (dup) {
          ++this.DuplicateItem.Item.find(itm => itm.ItemName == itemDetail.ItemName).RepeatedTimes;
        } else {
          itemDetail.RepeatedTimes = 2;
          this.DuplicateItem.Item.push(itemDetail);
        }
        this.DuplicateItem.IsDuplicate = true;
      } else {
        map.set(itemIdsDetail, true);    // set any value to Map
      }
    }
    return true;
  }

  //abhishek/sud:14July'19-- remove empty rows while submitting the invoice.
  DeleteEmptyRows() {
    //to delete row having no item name - Don't delete if there's only one Empty row left.
    this.model.BillingTransactionItems.forEach(txnItm => {
      //check for the length of BillingTransactionItem everytime..
      if (txnItm.ItemName == null && this.model.BillingTransactionItems.length > 1) {
        this.model.BillingTransactionItems.splice(this.model.BillingTransactionItems.indexOf(txnItm), 1);
      }
    });


  }

  CheckAndSubmitBillingTransaction(billingFlow: string = null) {

    this.DeleteEmptyRows();

    // at the time of submission, this is not initial warning.
    this.isInitialWarning = false;
    if (this.billingService.BillingFlow == 'insurance') {
      this.model.BillingTransactionItems.forEach(itm => {
        itm.IsInsurance = true;
      })
    }
    if (billingFlow == "provisional") {
      if (this.model.BillingTransactionItems) {
        this.model.BillingTransactionItems.forEach(txnItm => {
          txnItm.BillStatus = ENUM_BillingStatus.provisional;// "provisional";
        });
      }
    }
    else {
      this.OnPaymentModeChange();
    }

    if (this.model.DiscountPercent < 0 || this.model.DiscountPercent > 100) {
      this.msgBoxServ.showMessage("failed", ["Additional Discount Percent is invalid. It must be between 0 and 100."]);
      this.loading = false;
      return;
    }

    //Checking from parameter, allow/restrict Additional Discount for Provisional bills 
    if (billingFlow == "provisional" && (!this.param_allowAdditionalDiscOnProvisional) && this.model.DiscountPercent && this.model.DiscountPercent > 0) {

      this.msgBoxServ.showMessage("failed", ["Additional Discount is not applicable for Provisional Bills"]);
      this.loading = false;
      return;
    }
    //If discount is applied for Final Bill (not provisional) then remarks is mandatory
    if (billingFlow != "provisional" && this.model.DiscountAmount && this.model.DiscountAmount > 0 && !this.model.Remarks) {

      this.msgBoxServ.showMessage("failed", ["Remarks is mandatory for Discounts."]);
      this.loading = false;
      return;
    }


    if (this.CheckSelectionFromAutoComplete() && this.CheckBillingValidations() && this.CheckForDuplication()) {
      this.isProvisionalBilling = billingFlow == "provisional";
      if (this.DuplicateItem.IsDuplicate) {//this is only used while showing Confirmation Pop Up for dublicate item.
        this.ShowDuplicateItemComfirmation = true; //In case of Dublicate item entry POP Up is shown to re-check the item entered.
      }
      else {
        this.SubmitBillingTransaction();
      }
      //this.ShowDuplicateItemComfirmation = false;
    }
    else {
      this.loading = false;
    }
    //this.loading = false;
  }

  CheckBillingValidations(): boolean {
    let isFormValid = true;
    for (var j = 0; j < this.model.BillingTransactionItems.length; j++) {
      if (this.model.BillingTransactionItems[j].Price <= 0) {
        this.msgBoxServ.showMessage("error", ["The price of some items is zero "]);
        this.loading = false;
        break;
      }
      if (this.model.BillingTransactionItems) {
        for (var i = 0; i < this.model.BillingTransactionItems.length; i++) {
          let currTxnItm = this.model.BillingTransactionItems[i];
          for (var valCtrls in currTxnItm.BillingTransactionItemValidator.controls) {
            currTxnItm.BillingTransactionItemValidator.controls[valCtrls].markAsDirty();
            currTxnItm.BillingTransactionItemValidator.controls[valCtrls].updateValueAndValidity();
          }
        }
        for (var i = 0; i < this.model.BillingTransactionItems.length; i++) {
          let currTxnItm_1 = this.model.BillingTransactionItems[i];
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
    if (this.model.PaymentMode == "credit" && !this.model.Remarks) {
      isFormValid = false;
      this.msgBoxServ.showMessage("failed", ["Remarks is mandatory for credit bill"]);
    }
    return isFormValid;
  }

  AssignBillTxnItemsValuesForSubmit() {
    for (var j = 0; j < this.model.BillingTransactionItems.length; j++) {
      this.model.BillingTransactionItems[j].CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
      this.model.BillingTransactionItems[j].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

      this.model.BillingTransactionItems[j].CounterId = this.securityService.getLoggedInCounter().CounterId;
      //Move counterday to server once CounterFeature is added change--sudarshan:25July 
      this.model.BillingTransactionItems[j].CounterDay = moment().format("YYYY-MM-DD");

      //ashim: 24Sep2018 : assign Duty Doctor as default doctor if doctor is not selected in case of emergency registration
      if (this.model.BillingTransactionItems[j].ItemName == "EMERGENCY REGISTRATION" && this.model.BillingTransactionItems[j].ProviderId == null) {
        let doc = this.doctorsList.find(d => d.FirstName == "Duty" && d.LastName == "Doctor");
        if (doc) {
          this.model.BillingTransactionItems[j].ProviderId = doc.EmployeeId;
          this.model.BillingTransactionItems[j].ProviderName = doc.FirstName + " " + doc.LastName;
        }
      }
      //incase of emergency do not assign other visit details by default.
      else {
        let visit = this.visitList.find(a => a.ProviderId == this.model.BillingTransactionItems[j].RequestedBy)
        if (visit)
          this.model.BillingTransactionItems[j].PatientVisitId = visit.PatientVisitId;
      }
    }
    this.model.TaxId = this.taxId;
    this.AssignReqDeptNBillingType(this.model.BillingTransactionItems);
  }

  AssignValuesToBillTxn() {

    let totTaxableAmt: number = 0, totNonTaxableAmt: number = 0;
    this.model.BillingTransactionItems.forEach(bil => {
      totTaxableAmt += bil.TaxableAmount;
      totNonTaxableAmt += bil.NonTaxableAmount;
    });
    this.model.TaxableAmount = totTaxableAmt;
    this.model.NonTaxableAmount = totNonTaxableAmt;

    this.model.DepositBalance = this.newDepositBalance;
    this.model.DepositReturnAmount = this.depositDeductAmount;
    this.model.PatientVisitId = this.currBillingContext.PatientVisitId;
    this.model.TransactionType = this.billingType;
    this.OnPaymentModeChange();
  }

  SubmitBillingTransaction(): void {
    if (this.loading) {
      this.loading = true;

      let isFormValid = true;
      this.UpdatePriceValidty();
      if (isFormValid && this.CheckInsuranceTxnApplicable()) {
        this.AssignBillTxnItemsValuesForSubmit();
        //doesn't post to Departments Requisition Table in case billing is done for doctor's order
        //since in Doctor's order case, it already posts to department.
        if (this.currentBillingFlow == "Orders") {
          this.PostBilling(this.model.BillingTransactionItems);
        }
        ///below function will first post the transactionitems to departments, then only to the billingtransactionitems.
        else {
          //ashim: 29Sep2018;
          //if emergencyvisitItem exist then first post to visit and then update VisitId and VisitType of remaining item and then post to Dept/BillTxn respectively.
          let emergencyItem = this.model.BillingTransactionItems.find(item => item.ItemName.toLowerCase() == "emergency registration");
          if (emergencyItem) {
            this.PostEmergencyVisitItem(emergencyItem);
          }
          else {
            this.PostToDepartmentRequisition(this.model.BillingTransactionItems);
          }
        }
      }
      else {
        this.loading = false;
      }
    }

  }


  UpdatePriceValidty() {
    if (this.billingService.BillingFlow == "insurance-package") {
      this.model.BillingTransactionItems.forEach(billItem => {
        billItem.UpdateValidator("off", "Price", null);
      });
    }
  }

  //posts to Departments Requisition Table
  PostToDepartmentRequisition(billTxnItems: Array<BillingTransactionItem>, emergencyItem = null) {

    billTxnItems.forEach(a => a.BillingType = "outpatient"); //Yubraj-18th July '19 //temporary solution for generating Credit Insurance Invoice

    //check if user has deleted and added the same item in copy from earlier invoice flow
    if (this.currentBillingFlow == "BillReturn") {
      billTxnItems.forEach(item => {
        let earlierItem = this.earlierInvoiceItems.find(a => a.RequisitionId == null
          && a.ServiceDepartmentId == item.ServiceDepartmentId
          && a.ItemId == item.ItemId
          && a.RequisitionId != null);
        if (earlierItem) {
          item.RequisitionId = earlierItem.RequisitionId;
          item.RequisitionDate = earlierItem.RequisitionDate;
        }
      });
    }
    //orderstatus="active" and billingStatus="provisional" when sent from billingpage.
    this.BillingBLService.PostDepartmentOrders(billTxnItems, "active", "provisional", this.insuranceApplicableFlag, this.currPatVisitContext)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length) {
          //here this.loading should still be true, otherwise it'll post multiple time to the PostToBillingTransaction'
          //if (this.isPackageBilling && !this.isProvisionalBilling)
          //    this.PostPackageBillingTransaction();
          //else {
          //ashim: 29Sep2018
          if (emergencyItem) {
            res.Results.push(emergencyItem);
          }
          this.PostBilling(res.Results);
          //}

        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to add department requisitions"]);
          this.isProvisionalBilling = false;
          console.log(res.ErrorMessage);
          this.loading = false;
        }
      }, err => {
        this.loading = false;
      });
  }
  //posts to BillingTransactionItems table
  PostBilling(billTxnItems: Array<BillingTransactionItem>) {
    //added: ashim: 20Aug2018
    if (this.isProvisionalBilling)
      this.PostBillingTransactionItems(billTxnItems);
    else {
      this.PostBillingTransaction(billTxnItems);
    }
  }

  //posts to BillingTransactionItems table
  PostBillingTransaction(billTxnItems: Array<BillingTransactionItem>) {
    //added: ashim: 20Aug2018
    this.model.BillingTransactionItems = new Array<BillingTransactionItem>();
    for (let i = 0; i < billTxnItems.length; i++) {
      this.model.BillingTransactionItems.push(new BillingTransactionItem());
      this.model.BillingTransactionItems[i] = Object.assign(this.model.BillingTransactionItems[i], billTxnItems[i]);
    }
    this.AssignValuesToBillTxn();
    //this.BillingBLService.PostBillingTransactionItems(billTxnItems)

    if ((this.billingService.BillingFlow == "insurance" || this.billingService.BillingFlow == "insurance-package") && this.currBillingContext.Insurance) {
      this.model.IsInsuranceBilling = true;
      this.model.InsuranceProviderId = this.currBillingContext.Insurance.InsuranceProviderId;
      this.CheckAndSubmitInsuranceItems();
      //this.model.UpdatedInsuranceBalance = this.billingService.Insurance.CurrentBalance - this.model.TotalAmount;
    }

    this.model.TransactionType = "outpatient";//temporary solution for generating Credit Insurance Invoice

    //Hom 7th Dec '18
    if (this.currentBillingFlow == "BillReturn" && this.model.TransactionType == "inpatient") {
      this.PostIpBillingTransaction();
    }
    else {
      this.PostOpBillingTransaction();
    }
  }

  //Hom 7th Dec '18
  PostIpBillingTransaction() {

    if (this.patBillHistory.DepositBalance && this.model.TotalAmount > this.patBillHistory.DepositBalance && this.deductDeposit) {
      this.model.ReturnedAmount = this.model.DepositBalance;
      this.model.DepositBalance = 0;
    }
    else if (this.patBillHistory.DepositBalance && this.model.TotalAmount < this.patBillHistory.DepositBalance && this.deductDeposit) {
      this.model.Tender = this.model.TotalAmount;
      this.model.DepositBalance = this.patBillHistory.DepositBalance - this.model.TotalAmount;
    }

    this.BillingBLService.PostIpBillingTransaction(this.model)
      .subscribe(
        res => {
          if (res.Status == "OK" && res.Results) {
            this.CallBackPostBilling(res.Results);
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            this.loading = false;
          }
        });
    //}
  }


  PostOpBillingTransaction() {
    this.BillingBLService.PostBillingTransaction(this.model)
      .subscribe(
        res => {
          if (res.Status == "OK" && res.Results) {
            this.CallBackPostBilling(res.Results);
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            this.loading = false;
          }
        });
  }


  CallBackPostBilling(result: any) {
    //  this.UpdateRequisitionBillStatus(result.BillingTransactionItems);
    this.RouteToReceipt(result);
    this.loading = false;
  }
  //ashim: 10Sep2018: Package Billing


  PostPackageBillingTransaction() {
    this.AssignValuesToBillTxn();

    this.BillingBLService.PostPackageBillingTransaction(this.model)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            this.RouteToReceipt(res.Results);
            this.loading = false;
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            this.loading = false;
          }
        });
  }
  //ashim: 10Sep2018 : for package billing

  //ashim: 29Sep2018 
  PostEmergencyVisitItem(emergencyItem: BillingTransactionItem) {
    let items = Array<BillingTransactionItem>();

    //getting emergency name from the parameterized data
    let erdeptnameparam = this.coreService.Parameters.find(p => p.ParameterGroupName.toLowerCase() == "common" && p.ParameterName.toLowerCase() == "erdepartmentname");
    if (erdeptnameparam) {
      let erdeptname = erdeptnameparam.ParameterValue.toLowerCase();
      //Get DepartmentId of ER using Parameters and Coreservice.Masters..
      let dep = this.coreService.Masters.Departments.find(a => a.DepartmentName.toLowerCase() == erdeptname);
      emergencyItem.RequestingDeptId = dep.DepartmentId;
    }
    items.push(emergencyItem);
    // 4th Dec '18: YUbraj :: now send "provisional" instead of paid"
    this.BillingBLService.PostDepartmentOrders(items, "active", "provisional", this.insuranceApplicableFlag)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length) {
          let erItem = res.Results[0];
          let otherItems = this.model.BillingTransactionItems.filter(item => item.ItemName.toLowerCase() != "emergency registration");
          erItem.VisitType = "emergency";
          erItem.PatientVisitId = erItem.PatientVisitId;
          erItem.RequisitionId = erItem.PatientVisitId;
          items[0] = erItem;
          otherItems.forEach(item => {
            item.VisitType = ENUM_VisitType.emergency;// "emergency";
            item.PatientVisitId = erItem.PatientVisitId;
          });
          this.routeFromService.RouteFrom = "ER-Sticker";
          if (otherItems.length) {
            this.PostToDepartmentRequisition(otherItems, erItem);
          }
          else {
            this.PostBilling(items);
          }
          this.loading = false;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to add emergency visit"]);
          console.log(res.ErrorMessage);
          this.isProvisionalBilling = false;
          this.loading = false;
        }
      }, err => {
        this.loading = false;
      });
  }

  CheckAndSubmitInsuranceItems() {
    this.model.PaymentMode = ENUM_BillPaymentMode.credit;// "credit";
    this.model.BillStatus = ENUM_BillingStatus.unpaid;// "unpaid";
    this.model.BillingTransactionItems.forEach(item => {
      item.BillStatus = ENUM_BillingStatus.unpaid;// "unpaid";
    });
    this.model.PaymentDetails = "InsuranceName: " + this.billingService.Insurance.InsuranceProviderName
      + "/" + "InsuranceNumber:" + this.billingService.Insurance.InsuranceNumber;
  }


  PostBillingTransactionItems(billTxnItems: Array<BillingTransactionItem>) {
    this.BillingBLService.PostBillingTransactionItems(billTxnItems)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            // this.UpdateRequisitionBillStatus(res.Results);
            //this.RouteToReceipt(this.model);
            var result = res.Results;
            console.log("Provisional Result:", result);
            console.log("Model Result:", this.model);
            this.model.FiscalYear = result[0].ProvFiscalYear;
            this.model.InvoiceNo = result[0].ProvisionalReceiptNo;
            this.model.singleReceiptBool = true;//YUbraj: this flag is used in provisional slip to hide date and receipt no from the item list invoice
            this.model.BillingTransactionItems = result;
            this.RouteToReceipt(this.model);
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Unable to complete transaction."]);
            console.log(res.ErrorMessage)
            this.loading = false;
          }
        });
  }

  UpdateRequisitionBillStatus(billTxnItems: Array<BillingTransactionItem>) {
    if (this.currentBillingFlow && (this.currentBillingFlow == "Orders" || this.currentBillingFlow == "BillReturn")) {///for multiple servicedepartments
      let deptsDistinct = new Array<string>();
      billTxnItems.forEach(a => {
        //add only if current servdeptname isn't present in servdept's list.
        if (deptsDistinct.indexOf(a.ServiceDepartmentName) < 0) {
          deptsDistinct.push(a.ServiceDepartmentName);
        }
      });

      deptsDistinct.forEach(srvdptname => {
        //get only billtxnitems those are in current service department. 
        let srvDeptItems = billTxnItems.filter(b => {
          //b.ServiceDepartmentName == srvdptname;

          if (b.ServiceDepartmentName == srvdptname) {
            return b;
          }
        });
        this.BillingBLService.UpdateRequisitionsBillingStatus(srvDeptItems, srvdptname)
          .subscribe(res => {
            console.log("updated requisition billing status sucessfully");
          });
      });
    }
  }

  RouteToReceipt(billTxn: BillingTransaction) {
    let txnReceipt = BillingReceiptModel.GetReceiptForTransaction(billTxn);
    txnReceipt.IsInsuranceBilling = this.billingService.BillingFlow == "insurance" ? true : false;
    txnReceipt.Patient = Object.create(this.patientService.globalPatient);
    txnReceipt.IsValid = true;
    let ProvBillingUser = this.securityService.GetLoggedInUser().UserName; //Yubraj 28th June '19
    txnReceipt.BillingUser = this.isProvisionalBilling ? ProvBillingUser : billTxn.BillingUserName;
    txnReceipt.Remarks = this.model.Remarks;


    txnReceipt.BillingDate = txnReceipt.BillingDate ? txnReceipt.BillingDate : moment().format("YYYY-MM-DD HH:mm:ss");
    txnReceipt.ReceiptType = this.isProvisionalBilling ? "provisional" : txnReceipt.ReceiptType;
    txnReceipt.singleReceiptBool = this.model.singleReceiptBool;
    txnReceipt.DepositBalance = this.isProvisionalBilling ? CommonFunctions.parseAmount(this.patBillHistory.DepositBalance) : txnReceipt.DepositBalance;

    if (billTxn.TransactionType && billTxn.TransactionType.toLowerCase() == "inpatient") {
      txnReceipt.ReceiptType = "ip-receipt";
    }
    this.billingService.globalBillingReceipt = txnReceipt;
    this.loading = false;//enables the submit button once all the calls are completed

    this.router.navigate(['Billing/ReceiptPrint']);

  }

  ////-------------- implementing individual discount from the total discount percentahe----------
  //Calculationforall() {
  //    if (this.model.BillingTransactionItems.length) {

  //        let DP: number = 0; //discountPercent for the model (aggregate total) 
  //        let Dp: number = 0; // discountPercent for individual item
  //        let totalTax: number = 0;
  //        let loopTax: number = 0;
  //        let SubTotal: number = 0;
  //        let totalAmount: number = 0;
  //        let totalAmountAgg: number = 0;
  //        let totalQuantity: number = 0;
  //        let subtotal: number = 0;
  //        let calsubtotal: number = 0;
  //        let subtotalfordiscountamount: number = 0;
  //        DP = this.model.DiscountPercent;
  //        let successiveDiscount: number = 0;
  //        let totalAmountforDiscountAmount: number = 0;
  //        let DiscountAgg: number = 0;
  //        //-------------------------------------------------------------------------------------------------------------------------------
  //        for (var i = 0; i < this.model.BillingTransactionItems.length; i++) {
  //            let curRow = this.model.BillingTransactionItems[i];
  //            Dp = curRow.DiscountPercent;
  //            curRow.DiscountPercentAgg = Dp;
  //            curRow.Price = CommonFunctions.parseAmount(curRow.Price);
  //            subtotal = (curRow.Quantity * curRow.Price); //100
  //            curRow.SubTotal = CommonFunctions.parseAmount(subtotal);
  //            let DiscountedAmountItem = (subtotal - (Dp / 100) * subtotal) //Discounted Amount for individual Item 
  //            let DiscountedAmountTotal = (DiscountedAmountItem - DP * DiscountedAmountItem / 100); // Discounted Amount From the Total Discount

  //            let tax = (curRow.TaxPercent / 100 * (DiscountedAmountTotal));
  //            curRow.Tax = CommonFunctions.parseAmount(tax);
  //            if (DP) {
  //                successiveDiscount = ((100 - Dp) / 100 * (100 - DP) / 100 * subtotal);
  //                let successiveDiscountAmount = successiveDiscount + curRow.TaxPercent / 100 * successiveDiscount;

  //                DiscountAgg = ((subtotal - successiveDiscountAmount) + curRow.Tax) * 100 / subtotal;
  //                //curRow.DiscountPercentAgg = (Math.round(DiscountAgg * 100) / 100);
  //                curRow.DiscountAmount = CommonFunctions.parseAmount(curRow.DiscountPercentAgg * subtotal / 100);
  //                curRow.DiscountPercentAgg = CommonFunctions.parseAmount(DiscountAgg);
  //            }

  //            loopTax = (curRow.TaxPercent * (subtotal / 100));
  //            //calsubtotal = calsubtotal + subtotal + loopTax;
  //            calsubtotal = calsubtotal + subtotal;
  //            totalTax = totalTax + loopTax;
  //            let DiscountedAmountTotalAgg = (DiscountedAmountItem - DP * DiscountedAmountItem / 100);
  //            totalAmountAgg = DiscountedAmountTotalAgg + curRow.Tax;
  //            totalAmount = DiscountedAmountTotal + curRow.Tax;
  //            curRow.TotalAmount = CommonFunctions.parseAmount(totalAmount);
  //            totalAmountforDiscountAmount = totalAmountforDiscountAmount + curRow.TotalAmount;
  //            SubTotal = SubTotal + totalAmountAgg;
  //            let CurQuantity = curRow.Quantity;
  //            totalQuantity = Number(totalQuantity) + Number(CurQuantity);
  //            subtotalfordiscountamount = subtotalfordiscountamount + subtotal;
  //            curRow.DiscountAmount = CommonFunctions.parseAmount(subtotal - DiscountedAmountTotal);
  //            //if tax not applicable then taxable amount will be zero. else: taxable amount = total-discount. 
  //            //opposite logic for NonTaxableAmount
  //            curRow.TaxableAmount = curRow.IsTaxApplicable ? (curRow.SubTotal - curRow.DiscountAmount) : 0;//added: sud: 29May'18
  //            curRow.NonTaxableAmount = curRow.IsTaxApplicable ? 0 : (curRow.SubTotal - curRow.DiscountAmount);//added: sud: 29May'18
  //        }
  //        this.model.SubTotal = CommonFunctions.parseAmount(calsubtotal);
  //        this.model.TotalQuantity = CommonFunctions.parseAmount(totalQuantity);
  //        this.model.DiscountAmount = CommonFunctions.parseAmount(DiscountAgg * (this.model.SubTotal) / 100);
  //        //this.model.DiscountAmount = Math.round(((this.model.SubTotal - totalAmountforDiscountAmount) * 100) / 100);
  //        //this.model.DiscountPercent = this.model.SubTotal != 0 ? Math.round(((this.model.DiscountAmount * 100) / this.model.SubTotal) * 1) / 1 : this.model.DiscountPercent;
  //        this.model.TotalAmount = CommonFunctions.parseAmount(SubTotal);
  //        this.model.TaxTotal = CommonFunctions.parseAmount(totalTax);
  //        this.model.Tender = this.model.TotalAmount;
  //    }
  //    else {
  //        this.model.SubTotal = 0;
  //        this.model.TotalAmount = 0;
  //        this.model.DiscountAmount = 0;
  //        this.model.DiscountPercent = 0;
  //        this.model.TotalQuantity = 0;
  //        this.model.Tender = 0;
  //    }
  //    this.CalculateDepositBalance();
  //}


  GetServiceDeptNameById(servDeptId: number): string {
    if (this.allServiceDepts)
      return this.allServiceDepts.filter(a => a.ServiceDepartmentId == servDeptId)[0].ServiceDepartmentName;
  }

  ///sudarshan/dinesh: 28June2017-- for Dynamic validation according to current service department and their items

  LoadAllServiceDepts() {
    //this.allServiceDepts =

    //call service-department get, 
    //for which, add function in dl and blservice both.
    //on success, assign this.allServDepts=res.Results.

    this.BillingBLService.GetServiceDepartments()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allServiceDepts = res.Results;
          this.GetBillingItems();
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessaage], res.ErrorMessaage);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", [err.ErrorMessaage], err.ErrorMessaage);
        }
      );
  }

  public FilterBillItems(index) {
    //ramavtar:13may18: at start if no default service department is set .. we need to skip the filtering of item list.
    if (this.model.BillingTransactionItems[index].ServiceDepartmentId) {
      if (this.model.BillingTransactionItems.length && this.isItemLoaded) {
        let srvDeptId = this.model.BillingTransactionItems[index].ServiceDepartmentId;
        //initalAssign: FilterBillItems was called after assinging all the values(used in ngModelChange in SelectDepartment)
        // and was assigning ItemId=null.So avoiding assignment null value to ItemId during inital assign.
        if (this.model.BillingTransactionItems[index].ItemId == null)
          this.ClearSelectedItem(index);
        this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.ServiceDepartmentId == srvDeptId);

        let servDeptName = this.GetServiceDeptNameById(srvDeptId);
        //if (this.IsDoctorMandatory(servDeptName, null)) 

        // checking directly from list of database yubraj-- 8th Oct 2018
        if (this.selectedItems[index] && this.selectedItems[index].IsDoctorMandatory) {
          this.model.BillingTransactionItems[index].UpdateValidator("on", "ProviderId", "required");
        }
        else {
          this.model.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);
        }
      }
    }
    else {
      //create a new array (using filter) and assign to bill items. 
      // comparison with same id will always give true, hence all items will be returned. 
      //let billItems = this.itemList.slice();//.filter(a => a.ServiceDepartmentId == a.ServiceDepartmentId);;
      let billItems = this.itemList.filter(a => a.ServiceDepartmentName != "OPD");
      this.model.BillingTransactionItems[index].ItemList = billItems;
    }
  }

  ShowPackage() {
    if (this.billingService.BillingFlow != "normal"
      && this.currBillingContext.Insurance
      && this.currBillingContext.Insurance.PatientInsurancePkgTxn) {
      this.msgBoxServ.showMessage("failed", ["Close current Insurance Package to start new one."]);
    }
    else {
      this.showSelectPage = false;
      this.changeDetectorRef.detectChanges();
      this.showSelectPage = true;
    }
  }

  ShowCopyFromEarlierInvoice() {
    this.patientId = null;
    this.showTxnCopySelPage = false;
    this.changeDetectorRef.detectChanges();
    this.patientId = this.patientService.getGlobal().PatientId;
    this.showTxnCopySelPage = true;
  }

  SelectFromPackage($event) {
    this.currentBillingFlow = "packageBilling";//needed this so that it'll reset ReturnFlow of billing which was causing issue.

    this.disableTextBox = true;
    this.model = this.billingService.CreateNewGlobalBillingTransaction();
    this.model.CounterId = this.currentCounter;
    this.model.PatientId = this.patientService.getGlobal().PatientId;
    //createdby will always be employeeid--sudarshan:7may'17
    this.model.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    this.showSelectPage = false;
    //this.selectedRequestedByDr = [];
    this.selectedItems = [];
    this.selectedAssignedToDr = [];
    var items = $event.pkg.BillingItemsXML.Items;

    //sud: 10sept'18-- for 

    this.ActivePackageInfo.BillingPackageId = $event.pkg.BillingPackageId;
    this.ActivePackageInfo.BillingPackageName = $event.pkg.BillingPackageName;
    this.isPackageBilling = true;//need to set this to false somewhere..

    //ashim: 10Sep2018
    this.model.PackageId = this.ActivePackageInfo.BillingPackageId;
    this.model.PackageName = this.ActivePackageInfo.BillingPackageName;
    this.model.Remarks = this.ActivePackageInfo.BillingPackageName;
    this.model.DiscountPercent = $event.pkg.DiscountPercent;
    for (var i = 0; i < items.length; i++) {
      let item = this.itemList.find(a => a.ItemId == items[i].ItemId && a.ServiceDepartmentId == items[i].ServiceDeptId);
      if (item) {
        let billItem = this.NewBillingTransactionItem();
        this.model.BillingTransactionItems.push(billItem);
        this.model.BillingTransactionItems[i].ItemId = items[i].ItemId;
        this.model.BillingTransactionItems[i].ItemName = item.ItemName;
        this.selectedItems[i] = item;
        this.model.BillingTransactionItems[i].ServiceDepartmentId = items[i].ServiceDeptId;
        this.model.BillingTransactionItems[i].ServiceDepartmentName = this.GetServiceDeptNameById(items[i].ServiceDeptId);
        this.selectedServDepts[i] = this.model.BillingTransactionItems[i].ServiceDepartmentName;
        this.model.BillingTransactionItems[i].Quantity = items[i].Quantity;
        this.model.BillingTransactionItems[i].IsTaxApplicable = items[i].TaxApplicable;//added: sud: 29May'18--chcek for the field name. 
        this.model.BillingTransactionItems[i].BillingPackageId = $event.pkg.BillingPackageId;
        if (this.model.BillingTransactionItems[i].ServiceDepartmentName == "OPD") {
          let doctor = this.doctorsList.find(a => a.EmployeeId == this.model.BillingTransactionItems[i].ItemId);
          if (doctor) {
            this.selectedAssignedToDr[i] = doctor;
            this.AssignSelectedDoctor(i);
            this.model.BillingTransactionItems[i].EnableControl("ProviderId", false);
          }
        }
        else {
          this.model.BillingTransactionItems[i].EnableControl("ItemName", false);
        }
        this.model.BillingTransactionItems[i].EnableControl("RequestedBy", false);
        this.model.BillingTransactionItems[i].EnableControl("Quantity", false);
        this.model.BillingTransactionItems[i].EnableControl("ServiceDepartmentId", false);
        this.FilterBillItems(i);
        this.AssignSelectedItem(i);
        //ashim: 10Sep2018 : By default RequestBy for package will be self.
        let visit = this.visitList.find(a => a.ProviderName.toLowerCase() == "self")
        if (visit) {
          //this.selectedRequestedByDr[i] = visit.ProviderName;
          this.AssignRequestedByDoctor(i);
        }

      }
      else {
        this.msgBoxServ.showMessage("failed", ["Unable to assign item from package."]);
      }

    }
  }

  //Modified: Ashim 15July2017: After implementing ng autocomplete. 
  //Changes made since ng autocomplete binds the selected object instead of a single selected property.
  public AssignSelectedItem(index) {
    let item = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selectedItems[index]) {
      if (typeof (this.selectedItems[index]) == 'string' && this.model.BillingTransactionItems[index].ItemList.length) {
        item = this.model.BillingTransactionItems[index].ItemList.find(a => a.ItemName.toLowerCase() == this.selectedItems[index].toLowerCase());
        //item = this.itemList.filter(a => a.ItemName.toLowerCase() == this.selectedItems[index].toLowerCase())[0];   //for billing order.                
      }
      else if (typeof (this.selectedItems[index]) == 'object')
        item = this.selectedItems[index];
      if (item) {
        //allow duplicates in case of Inpatient or in Package billing: sud: 10Sept'18
        if (this.billingType && this.billingType.toLowerCase() != "inpatient" && !this.isPackageBilling) {
          let extItem = this.model.BillingTransactionItems.find(a => a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId);
          let extItemIndex = this.model.BillingTransactionItems.findIndex(a => a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId);

          //Check for allowing duplicate inserting or not from the Parameterized value.
          let paramDupItm = this.coreService.AllowDuplicateItem();
          if (!paramDupItm) {
            if (extItem && index != extItemIndex) {
              this.msgBoxServ.showMessage("failed", [item.ItemName + " is already entered."]);
              this.changeDetectorRef.detectChanges();
              this.model.BillingTransactionItems[index].IsDuplicateItem = true;
            }
            else {
              this.model.BillingTransactionItems[index].IsDuplicateItem = false;
            }
          }
          if (extItem && index != extItemIndex) {
            // {ItemName: null,Quantity: null, Price: null}
            var itmeDetail = { ItemName: extItem.ItemName, Quantity: extItem.Quantity, Price: extItem.Price };
            this.DuplicateItem.Item.push(itmeDetail);
          }
        }
        this.model.BillingTransactionItems[index].ItemId = item.ItemId;
        this.model.BillingTransactionItems[index].ItemName = item.ItemName;
        this.model.BillingTransactionItems[index].TaxPercent = item.TaxApplicable ? this.taxPercent : 0;
        this.model.BillingTransactionItems[index].IsTaxApplicable = item.TaxApplicable;
        //this.model.BillingTransactionItems[index].TaxableAmount = item.TaxApplicable ? item.Price : 0;
        this.model.BillingTransactionItems[index].Price = item.Price;
        this.model.BillingTransactionItems[index].PriceCategory = this.priceCategory;//Sud:25Feb'19--For EHS, Foreigner etc..
        this.model.BillingTransactionItems[index].ProcedureCode = item.ProcedureCode;
        //add also the servicedepartmentname property of the item; needed since most of the filtering happens on this value

        this.model.BillingTransactionItems[index].ServiceDepartmentName = this.GetServiceDeptNameById(item.ServiceDepartmentId);
        this.model.BillingTransactionItems[index].ServiceDepartmentId = item.ServiceDepartmentId;
        this.AssignRequestedByDoctor(index);
        this.selectedServDepts[index] = this.model.BillingTransactionItems[index].ServiceDepartmentName;
        this.model.BillingTransactionItems[index].IsValidSelDepartment = true;
        this.model.BillingTransactionItems[index].IsValidSelItemName = true;

        //insurance
        if (this.billingService.BillingFlow == "insurance" && item.IsInsurancePackage) {
          if (this.currBillingContext.Insurance.PatientInsurancePkgTxn) {
            this.msgBoxServ.showMessage("failed", ["Close current Insurance Package to start new one."]);
            this.ResetSelectedRow(index);
            return;
          }
          else {
            this.model.BillingTransactionItems[index].IsInsurancePackage = item.IsInsurancePackage;
            let insurancePackage = this.insurancePackageList.find(pkg => pkg.BillingPackageName == item.ItemName);
            this.model.BillingTransactionItems[index].BillingPackageId = insurancePackage ? insurancePackage.BillingPackageId : null;
          }

        }

        //insurance
        if (this.billingService.BillingFlow == "insurance-package") {
          this.UpdateInsurancePkgItemPrice(index);
        }

        this.FilterBillItems(index);
        this.CheckItemProviderValidation(index);

        this.ReCalculateInvoiceAmounts();//sud:10Mar'19
        //this.Calculationforall();//sud:10Mar'19--this method is replaced by above.
        //ashim: 10Sep2018
        if (this.isPackageBilling && this.model.BillingTransactionItems[index].ServiceDepartmentName == "OPD") {
          let doctor = this.doctorsList.find(a => a.EmployeeId == this.model.BillingTransactionItems[index].ItemId);
          if (doctor) {
            this.selectedAssignedToDr[index] = doctor.FullName;
            this.AssignSelectedDoctor(index);
          }
        }
      }
      else {
        if (this.currentBillingFlow != "Orders")
          this.model.BillingTransactionItems[index].IsValidSelItemName = false;
      }

      if (!item && !this.selectedServDepts[index]) {
        this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.ServiceDepartmentName != "OPD");;
      }
    }


  }

  public AssignRequestedByDoctor(index) {
    let doctor = null;
    if (this.currentRequestedByDoctor) {
      if (typeof (this.currentRequestedByDoctor) == 'string' && this.reqDoctorsList.length) {
        doctor = this.reqDoctorsList.find(a => a.FullName.toLowerCase() == this.currentRequestedByDoctor.toLowerCase());
      }
      else if (typeof (this.currentRequestedByDoctor) == 'object')
        doctor = this.currentRequestedByDoctor;
      if (doctor) {

        this.model.BillingTransactionItems[index].RequestedBy = doctor.EmployeeId;
        //this.model.BillingTransactionItems[index].BillingTransactionItemValidator.controls["RequestedBy"].setValue(doctor.EmployeeId);
        this.model.BillingTransactionItems[index].RequestedByName = doctor.FullName;
        this.model.BillingTransactionItems[index].IsValidSelRequestedByDr = true;
      }
      else
        this.model.BillingTransactionItems[index].IsValidSelRequestedByDr = false;
    }
    else
      this.model.BillingTransactionItems[index].IsValidSelRequestedByDr = true;
  }


  //sud:26Feb'19--for common requestedByDoctor in whole receipt level.
  public RequestedByDrOnChange() {
    let doctor = null;
    console.log(this.currentRequestedByDoctor);

    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.currentRequestedByDoctor) {
      if (typeof (this.currentRequestedByDoctor) == 'string' && this.reqDoctorsList.length) {
        doctor = this.reqDoctorsList.find(a => a.FullName.toLowerCase() == this.currentRequestedByDoctor.toLowerCase());
      }
      else if (typeof (this.currentRequestedByDoctor) == 'object')
        doctor = this.currentRequestedByDoctor;
      if (doctor) {

        if (this.model.BillingTransactionItems) {
          this.model.BillingTransactionItems.forEach(billTxnItem => {
            billTxnItem.RequestedBy = this.currentRequestedByDoctor.EmployeeId;
            billTxnItem.RequestedByName = this.currentRequestedByDoctor.FullName;
            billTxnItem.IsValidSelRequestedByDr = true;
          });
        }
      }

    }

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
        this.model.BillingTransactionItems[index].ProviderId = doctor.EmployeeId;
        this.model.BillingTransactionItems[index].ProviderName = doctor.FullName;
        this.model.BillingTransactionItems[index].IsValidSelAssignedToDr = true;
      }
      else
        this.model.BillingTransactionItems[index].IsValidSelAssignedToDr = false;
    }
    else {
      this.model.BillingTransactionItems[index].ProviderId = null;
      this.model.BillingTransactionItems[index].ProviderName = null;
      this.model.BillingTransactionItems[index].IsValidSelAssignedToDr = true;
    }
  }

  public CheckSelectionFromAutoComplete(): boolean {
    if (this.model.BillingTransactionItems.length) {
      for (let itm of this.model.BillingTransactionItems) {
        if (!itm.IsValidSelDepartment) {
          this.msgBoxServ.showMessage("failed", ["Invalid Department. Please select Department from the list."]);
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

  ClearSelectedItem(index) {
    this.selectedItems[index] = null;
    this.model.BillingTransactionItems[index].Price = null;
    this.model.BillingTransactionItems[index].ProcedureCode = null;  //Item Id is for procedureId of the Items at BillItem
    this.model.BillingTransactionItems[index].ItemId = null;
    this.ReCalculateInvoiceAmounts();//sud:10Mar'19
    //this.Calculationforall();//sud:10Mar'19--this method is replaced by above.
  }

  MapSelectedItem(index) {
    var item = this.itemList.find(a => a.ItemId == this.model.BillingTransactionItems[index].ItemId);
    //this.model.BillingTransactionItems[index].Price = item.Price;
    if (item) {

      this.model.BillingTransactionItems[index].TaxPercent = item.TaxApplicable ? this.taxPercent : 0;
      this.model.BillingTransactionItems[index].ItemName = item.ItemName;
      this.selectedItems[index] = item;
      this.AssignSelectedItem(index);
    }
  }


  ItemsListFormatter(data: any): string {

    let html: string = "";
    if (data.ServiceDepartmentName != "OPD") {
      html = data["ServiceDepartmentShortName"] + "-" + data["BillItemPriceId"] + "&nbsp;&nbsp;" + data["ItemName"] + "&nbsp;&nbsp;";
      html += "(<i>" + data["ServiceDepartmentName"] + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + data["Price"];
    }
    else {
      let docName = data.Doctor ? data.Doctor.DoctorName : "";
      html = data["ServiceDepartmentShortName"] + "-" + data["BillItemPriceId"] + "&nbsp;&nbsp;" + data["ItemName"] + "&nbsp;&nbsp;";
      html += "(<i>" + docName + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit+" "+ data["Price"];
    }
    //else {
    //    html = data["ItemName"]+
    //}


    return html;
  }

  AssignedToDocListFormatter(data: any): string {
    return data["FullName"];
  }
  ServiceDeptListFormatter(data: any): string {
    return data["ServiceDepartmentName"];
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
      if (srvDeptObj.ServiceDepartmentId != this.model.BillingTransactionItems[index].ServiceDepartmentId) {
        this.ResetSelectedRow(index);
        this.model.BillingTransactionItems[index].ServiceDepartmentId = srvDeptObj.ServiceDepartmentId;
      }
      this.FilterBillItems(index);
      this.model.BillingTransactionItems[index].IsValidSelDepartment = true;
    }
    //else raise an invalid flag
    else {
      this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.ServiceDepartmentName != "OPD");;
      this.model.BillingTransactionItems[index].IsValidSelDepartment = false;
    }
  }
  //reset Item Selected on service department change
  ResetSelectedRow(index) {
    this.selectedItems[index] = null;
    this.selectedAssignedToDr[index] = null;
    this.model.BillingTransactionItems[index] = this.NewBillingTransactionItem();
    this.model.BillingTransactionItems[index].RequestedBy = this.model.BillingTransactionItems[index].RequestedBy;
    this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.ServiceDepartmentName != "OPD");;
    this.model.BillingTransactionItems[index].RequestedBy = index > 0 ? this.model.BillingTransactionItems[index - 1].RequestedBy : (this.visitList[0].ProviderName == "Duty Doctor" ? null : this.visitList[0].ProviderId);
    this.ReCalculateInvoiceAmounts();//sud:10Mar'19
    //this.Calculationforall();//sud:10Mar'19--this method is replaced by above.

  }

  //loads default service department from parameters
  loadDefaultServDeptId() {
    let defSrvDpt = this.coreService.Parameters.filter(p => p.ParameterGroupName == "Billing" && p.ParameterName == "DefaultServiceDepartment");

    if (defSrvDpt.length > 0) {
      this.defaultServiceDepartmentId = defSrvDpt[0].ParameterValue;
    }
  }




  ShowUpdateInsurance() {
    this.showInsBalanceUpdate = false;
    this.changeDetectorRef.detectChanges();
    this.showInsBalanceUpdate = true;
  }

  CloseInsBalancePopup($event) {
    if ($event.action == "balance-updated") {
      this.currBillingContext.Insurance.CurrentBalance = $event.UpdatedBalance;
    }
    console.log("ins popup closed");
    console.log($event);
    this.showInsBalanceUpdate = false;

    this.CalculateInsuranceAmounts();
    //this.currBillingContext.Insurance.CurrentBalance = $event.currentBalance;
  }




  //sud: 20Jun'18
  LoadPatientBillingContext() {
    //we get billing context from earlier invoice incase of copy from earlier invoice.
    if (this.currentBillingFlow != "BillReturn" && this.currentVisitType != "inpatient") {
      this.BillingBLService.GetPatientBillingContext(this.patientService.globalPatient.PatientId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.currBillingContext = res.Results;

            this.billingService.BillingType = this.currBillingContext.BillingType;

            this.billingType = this.currBillingContext.BillingType;
            if (this.billingService.BillingFlow == "insurance") {
              this.billingService.Insurance = this.currBillingContext.Insurance;
              this.CalculateInsuranceAmounts();
            }
          }
        });
    }
  }

  //sud:19Jun'18
  AssignReqDeptNBillingType(billTxnItems: Array<BillingTransactionItem>) {
    let currPat = this.patientService.getGlobal();
    let requestingDeptId: number = null;
    requestingDeptId = this.currBillingContext.RequestingDeptId;
    if (billTxnItems && billTxnItems.length > 0) {
      billTxnItems.forEach(itm => {
        itm.RequestingDeptId = requestingDeptId;
        itm.BillingType = this.billingType;
      });
    }
  }

  GetVisitContext(patientId: number, visitId: number) {
    if (patientId && visitId) {
      this.BillingBLService.GetDataOfInPatient(patientId, visitId)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results) {
            this.currPatVisitContext = res.Results;

          }
          else {
            console.log("failed", ["Problem! Cannot get the Current Visit Context ! "])
          }
        },
          err => { console.log(err.ErrorMessage); });
    }

  }




  //ashim: 24Dec2018
  //modifications to remove billingTransactionItem page.

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
      this.model.Tender = this.model.Tender ? this.model.Tender : this.model.TotalAmount;
      this.model.PaidAmount = this.model.Tender - this.model.Change;
      this.model.BillStatus = ENUM_BillingStatus.paid;// "paid";
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
  ChangeTenderAmount() {
    if (this.deductDeposit) {
      this.model.Change = CommonFunctions.parseAmount(this.model.Tender + this.depositDeductAmount - this.model.TotalAmount);
    }
    else {
      this.model.Change = CommonFunctions.parseAmount(this.model.Tender - (this.model.TotalAmount));
    }
  }




  CheckInsuranceTxnApplicable(): boolean {
    if (this.billingService.BillingFlow == "insurance") {
      this.insuranceApplicableFlag = true;
      //if (!this.isProvisionalBilling) {
      if (this.currBillingContext.Insurance.CurrentBalance) {
        if (this.currBillingContext.Insurance.CurrentBalance - (this.currBillingContext.Insurance.InsuranceProvisionalAmount + this.model.TotalAmount) < 0) {
          this.msgBoxServ.showMessage("failed", ["Insufficient Insurance billing, please remove some items and proceed"]);
          return false;
        }
      }
      else {
        this.msgBoxServ.showMessage("failed", ["Insufficient Insurance billing, please remove some items and proceed"]);
        return false;
      }
      //}
    }
    return true;
  }

  //start: insurance billing changes

  //public GetDistinctServiceDepartments(items) {
  //    if (items && items.length) {
  //        let distinctSrvDept = new Array<ServiceDepartmentVM>();
  //        distinctSrvDept.push(this.serviceDeptList.find(srv => srv.ServiceDepartmentName == items[0].ServiceDepartmentName));

  //        items.forEach(itm => {
  //            //push only if current type isn't already added.
  //            if (!distinctSrvDept.find(dst => dst.ServiceDepartmentName == itm.ServiceDepartmentName)) {
  //                let srvDept = this.serviceDeptList.find(srv => srv.ServiceDepartmentName == itm.ServiceDepartmentName);
  //                if (srvDept)
  //                    distinctSrvDept.push(srvDept);
  //            }
  //        });
  //        this.serviceDeptList = distinctSrvDept;
  //    }
  //}

  public GetDistinctServiceDepartments(items) {
    if (items && items.length) {
      let distinctSrvDept = new Array<ServiceDepartmentVM>();
      distinctSrvDept.push(this.serviceDeptList.find(srv => srv.ServiceDepartmentName == items[0].ServiceDepartmentName));
      items.forEach(itm => {
        //push only if current type isn't already added.
        if (!distinctSrvDept.find(dst => dst.ServiceDepartmentName == itm.ServiceDepartmentName)) {
          distinctSrvDept.push(this.serviceDeptList.find(srv => srv.ServiceDepartmentName == itm.ServiceDepartmentName));
        }
      });
      this.serviceDeptList = distinctSrvDept;
    }
  }


  //billing transaction against insurace package.
  UpdateInsurancePkgItemPrice(index) {
    let billItem = this.model.BillingTransactionItems[index];
    billItem.Price = 0;
    billItem.PatientInsurancePackageId = this.currBillingContext.Insurance.PatientInsurancePkgTxn.PatientInsurancePackageId;

    this.ReCalculateBillItemAmounts(billItem);
  }
  //end: insurance billing changes


  //Start: Sud: 25Feb'19++ for Billing Price Category: eg: PayClinic. Common Requesting Doctor.

  public priceCategory: string = "Normal";
  //public priceCategoryShortName: string = "(N)";
  OnPriceCategoryChange() {
    if (this.priceCategory == "EHS") {
      //this.priceCategoryShortName = "(E)";
      // alert("Ehs selected");
      if (this.itemList != null && this.itemList.length > 0) {
        this.itemList.forEach(itm => {
          itm.Price = itm.EHSPrice;
        });
      }
      if (this.model.BillingTransactionItems && this.model.BillingTransactionItems.length > 0) {
        this.model.BillingTransactionItems.forEach(txnItm => {
          let currBillItem = this.itemList.find(billItem => billItem.ItemId == txnItm.ItemId && billItem.ServiceDepartmentId == txnItm.ServiceDepartmentId);
          if (currBillItem) {
            txnItm.Price = currBillItem.EHSPrice;
            txnItm.PriceCategory = ENUM_PriceCategory.EHS;// "EHS";
          }
        });
      }
    }
    else if (this.priceCategory == "Foreigner") {
      //this.priceCategoryShortName = "(F)";
      //alert("Foreigner selected");
      if (this.itemList != null && this.itemList.length > 0) {
        this.itemList.forEach(itm => {
          itm.Price = itm.ForeignerPrice;
        });
      }

      if (this.model.BillingTransactionItems && this.model.BillingTransactionItems.length > 0) {
        this.model.BillingTransactionItems.forEach(txnItm => {
          let currBillItem = this.itemList.find(billItem => billItem.ItemId == txnItm.ItemId && billItem.ServiceDepartmentId == txnItm.ServiceDepartmentId);
          if (currBillItem) {
            txnItm.Price = currBillItem.ForeignerPrice;
            txnItm.PriceCategory = ENUM_PriceCategory.Foreigner;//"Foreigner";
          }
        });
      }
    }
    else if (this.priceCategory == ENUM_PriceCategory.SAARCCitizen) {//"SAARCCitizen"; default is: 'Normal'
      //this.priceCategoryShortName = "(S)";
      //alert("Normal selected");
      if (this.itemList != null && this.itemList.length > 0) {
        this.itemList.forEach(itm => {
          itm.Price = itm.SAARCCitizenPrice;
        });
      }

      if (this.model.BillingTransactionItems && this.model.BillingTransactionItems.length > 0) {
        this.model.BillingTransactionItems.forEach(txnItm => {
          let currBillItem = this.itemList.find(billItem => billItem.ItemId == txnItm.ItemId && billItem.ServiceDepartmentId == txnItm.ServiceDepartmentId);
          if (currBillItem) {
            txnItm.Price = currBillItem.SAARCCitizenPrice;
            txnItm.PriceCategory = ENUM_PriceCategory.SAARCCitizen;// "SAARCCitizen";
          }
        });
      }
    }
    else {//default is: 'Normal'
      //this.priceCategoryShortName = "(N)";
      //alert("Normal selected");
      if (this.itemList != null && this.itemList.length > 0) {
        this.itemList.forEach(itm => {
          itm.Price = itm.NormalPrice;
        });
      }

      if (this.model.BillingTransactionItems && this.model.BillingTransactionItems.length > 0) {
        this.model.BillingTransactionItems.forEach(txnItm => {
          let currBillItem = this.itemList.find(billItem => billItem.ItemId == txnItm.ItemId && billItem.ServiceDepartmentId == txnItm.ServiceDepartmentId);
          if (currBillItem) {
            txnItm.Price = currBillItem.NormalPrice;
            txnItm.PriceCategory = ENUM_PriceCategory.Normal;// "Normal";
          }
        });
      }
    }
  }

  currentRequestedByDoctor: any = null; // sud:26Feb'19--we're moving RequestedbyDoctor to Receipt level.

  //public enabledPriceCategories = { Normal: true, EHS: false, SAARCCitizen: false, Foreigner: false, GovtInsurance: false };


  public showItemEditPanel: boolean = false;
  public txnItemToEdit: BillingTransactionItem = null;
  public indexOfEditItem: number = 0;

  public OpenItemEditPanel(index) {

    this.txnItemToEdit = this.model.BillingTransactionItems[index];
    if (this.txnItemToEdit.ItemId != 0 && this.txnItemToEdit.ItemName) {
      this.indexOfEditItem = index;
      this.showItemEditPanel = true;
    }

  }

  public OnPriceCategoryOrReqDocUpdated($event, index) {

    this.txnItemToEdit.PriceCategory = $event.PriceCategory;
    let pricCatName = $event.PriceCategory;
    this.txnItemToEdit.Price = $event.Price;
    this.txnItemToEdit.RequestedBy = $event.RequestedBy;
    this.txnItemToEdit.RequestedByName = $event.RequestedByName;

    // console.log(this.model.BillingTransactionItems[this.indexOfEditItem]);

    this.showItemEditPanel = false;

  }

  CloseItemUpdatePanel() {
    this.showItemEditPanel = false;
  }

  //end: Sud: 25Feb'19++ for Billing Price Category: eg: PayClinic. Common Requesting Doctor.




  //IMPORTANT: Tax is not applied in any of below calculation, need to revise it soon..! : sud:11Mar'19

  ReCalculateBillItemAmounts(index) {
    let currItem = this.model.BillingTransactionItems[index];
    currItem.SubTotal = currItem.Price * currItem.Quantity;

    this.CalculateAggregateDiscountsOfItems(currItem);
    //We need to calculate Bill's total amount (subtotal, discount, total..) whenever any one of the item is changed..
    this.ReCalculateInvoiceAmounts();
  }

  //sud:11Mar'19--to calculate Subtotal, DiscountAmount, totalAmount of Invoice Level.
  ReCalculateInvoiceAmounts() {
    //reduce function usage: acc -> accumulator, initial value=0, itm -> loop variable (BillingTransactionItem in below case).
    let overallSubTot = this.model.BillingTransactionItems.reduce(function (acc, itm) { return acc + itm.SubTotal; }, 0);
    let overallDiscAmt = this.model.BillingTransactionItems.reduce(function (acc, itm) { return acc + itm.DiscountAmount; }, 0);

    this.model.SubTotal = CommonFunctions.parseAmount(overallSubTot);
    this.model.DiscountAmount = CommonFunctions.parseAmount(overallDiscAmt);

    this.model.TotalAmount = CommonFunctions.parseAmount(overallSubTot - overallDiscAmt);
    this.model.Tender = this.model.TotalAmount;
    this.ChangeTenderAmount();
    this.CalculateInsuranceAmounts();
  }

  //Yurbaj : 9th July '19 //this is only for insurance amount calculation
  CalculateInsuranceAmounts() {
    if (this.billingService.BillingFlow == "insurance") {
      let amount = this.model.TotalAmount
      let currInsBalance = this.currBillingContext.Insurance.CurrentBalance;
      let provisionalInsAmount = this.currBillingContext.Insurance.InsuranceProvisionalAmount;
      this.RemainingInsuranceBalance = currInsBalance - (amount + provisionalInsAmount);
    }
  }

  InvoiceDiscountOnChange() {
    //Need to re-calculate aggregatediscounts of each item and Invoice amounts when Invoice Discount is changed.
    this.model.BillingTransactionItems.forEach(itm => {
      this.CalculateAggregateDiscountsOfItems(itm);
    });

    this.ReCalculateInvoiceAmounts();
  }

  //Aggregate/AdditionalDiscount Discount: Discount on Total amount of Invoice after one or many Item already has discount on it..
  //eg Item's Subtotal=100, Discount=10% (i.e: 10) then: TotalAmount = 90/-
  // if: AdditionalDiscount = 10%  then it'll be 10% of above Total Amount i.e: 9..
  //therefore AggregateDiscountAmount will be: 10+9 = 19/-  and AggregateDiscountPercent =  (AggDiscountAmt/ItemSubtotal) *100% ... 19% in above case.
  CalculateAggregateDiscountsOfItems(itm: BillingTransactionItem) {
    let invoiceDiscPercent = this.model.DiscountPercent ? this.model.DiscountPercent : 0;
    let itmDiscPercent = itm.DiscountPercent ? itm.DiscountPercent : 0;
    //Important: Tax is not applied below.. revise it soon.. sud:11Mar'19
    let itmDiscAmount = itm.SubTotal * itm.DiscountPercent / 100;
    let itmTotAmt = itm.SubTotal - (itmDiscAmount != 0 ? itmDiscAmount : 0);
    let additionalDiscountAmt = itmTotAmt * invoiceDiscPercent / 100;
    let totalDiscountAmount = itmDiscAmount + additionalDiscountAmt;

    //below formula also work's fine.. but didn't use it because of it's complexity in understanding..
    //let totalDiscountAmount = itm.SubTotal - ((100 - itmDiscPercent) / 100 * (100 - invoiceDiscPercent) / 100 * itm.SubTotal);

    let aggDiscPercent = (totalDiscountAmount) / itm.SubTotal * 100;
    itm.DiscountPercentAgg = CommonFunctions.parseAmount(aggDiscPercent);
    itm.DiscountAmount = CommonFunctions.parseAmount(totalDiscountAmount);
    itm.TotalAmount = CommonFunctions.parseAmount(itm.SubTotal - totalDiscountAmount);

  }



  LoadParameterForProvisional() {
    let param = this.coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "AllowAdditionalDiscOnProvisionalInvoice");
    if (param) {
      let paramValue = param.ParameterValue;
      if (paramValue != null && paramValue != '' && (paramValue == 'true' || paramValue == 1)) {
        this.param_allowAdditionalDiscOnProvisional = true;
      }
      else {
        this.param_allowAdditionalDiscOnProvisional = false;
      }

    }
  }

  ShowPastBillHistory() {
    if (this.showPastBillHistory) {

    }
  }

  public hotkeys(event) {
    if (event.keyCode == 27) {//key->ESC
      this.ShowDuplicateItemComfirmation = false
    }
  }


}
