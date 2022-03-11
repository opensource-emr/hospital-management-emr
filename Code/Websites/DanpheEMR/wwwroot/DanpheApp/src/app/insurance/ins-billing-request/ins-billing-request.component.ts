import { ChangeDetectorRef, Component } from "@angular/core";
import { Router } from "@angular/router";

import { CreditOrganization } from "../../settings-new/shared/creditOrganization.model";
import { BillingTransaction } from "../../billing/shared/billing-transaction.model";
import { ServiceDepartmentVM } from "../../shared/common-masters.model";
import { PatientBillingContextVM } from "../../billing/shared/patient-billing-context-vm";
import { CurrentVisitContextVM } from "../../appointments/shared/current-visit-context.model";
import { BillingTransactionItem } from "../../billing/shared/billing-transaction-item.model";
import { BillingPackage } from "../../billing/shared/billing-package.model";
import { BillingService } from "../../billing/shared/billing.service";
import { PatientService } from "../../patients/shared/patient.service";
import { CallbackService } from "../../shared/callback.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { VisitService } from "../../appointments/shared/visit.service";
import { SecurityService } from "../../security/shared/security.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { OrdersBLService } from "../../orders/shared/orders.bl.service";
import { CoreService } from "../../core/shared/core.service";
import { BillingBLService } from "../../billing/shared/billing.bl.service";
import { ENUM_BillingStatus, ENUM_InvoiceType } from "../../shared/shared-enums";
import { ENUM_VisitType } from "../../shared/shared-enums";
import { ENUM_BillPaymentMode } from "../../shared/shared-enums";
import { BillingReceiptModel } from "../../billing/shared/billing-receipt.model";
import { CommonFunctions } from "../../shared/common.functions";
import * as moment from "moment";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { ENUM_PriceCategory } from "../../shared/shared-enums";
import { InsuranceService } from "../shared/ins-service";
import { InsuranceBlService } from "../shared/insurance.bl.service";
@Component({
  templateUrl: "./ins-billing-Request.component.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
})

export class InsBillingRequestComponent {
  public latestVisitClaimCode: number = null;//sud:1-oct'21: Changed datatype from String to Number in all places
  public model: BillingTransaction = new BillingTransaction();
  //public currencyUnit: string = null;
  public itemList: Array<any> = [];
  public isItemLoaded: boolean = false;
  public disableTextBox: boolean = false;
  loading: boolean = false;
  public allServiceDepts: Array<ServiceDepartmentVM> = null;
  public organizationList: Array<CreditOrganization> = new Array<CreditOrganization>();
  public selectedItems: Array<any> = [];
  public selectedAssignedToDr: Array<any> = [];
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
  public billingType: string = "";
  public isInitialWarning: boolean = true;
  public isBillItemPriceEditable: boolean;
  public currBillingContext: PatientBillingContextVM = new PatientBillingContextVM;
  public currPatVisitContext: CurrentVisitContextVM;
  public currentVisitType: string = "";
  public earlierInvoiceItems: Array<BillingTransactionItem>;
  public isProvisionalBilling: boolean = false;
  public isCopyFromInvoice: boolean = false;
  public insuranceApplicableFlag: boolean = false;

  public LabType: Array<any> = [{ Name: 'OP-Lab', Value: 'op-lab' }, { Name: 'ER-Lab', Value: 'er-lab' }];
  public LabTypeName: string = 'op-lab';

  public patBillHistory = {
    IsLoaded: false,
    PatientId: null,
    CreditAmount: null,
    ProvisionalAmt: null,
    TotalDue: null,
    DepositBalance: null,
    BalanceAmount: null
  };

  public isPackageBilling: boolean = false;
  public ActivePackageInfo = { BillingPackageId: 0, BillingPackageName: null, PackageCode: null };
  public deductDeposit: boolean = false;
  public newDepositBalance: number = 0;
  public depositDeductAmount: number = 0;

  public param_allowAdditionalDiscOnProvisional: boolean = false;
  public showInsBalanceUpdate: boolean = false;
  // public insurancePackageList: Array<BillingPackage>;
  public ShowDuplicateItemComfirmation: boolean = false;
  public DuplicateItem: any = { IsDuplicate: false, Item: [] };
  public IsDublicateItem: boolean = false;

  public showPastBillHistory: boolean = true;
  public RemainingInsuranceBalance: number = 0;
  public showbillingReceipt: boolean = false;

  public BillRequestDoubleEntryWarningTimeHrs: number = 0;
  public PastTestList: any = [];
  public PastTestList_ForDuplicate: any = [];
  public defDiscountSchemeId: number = null;//sud:10-Oct'21--To assign Default Membership Type for Insurance Visit. 
  public provReceiptInputs = { PatientId: 0, ProvFiscalYrId: 0, ProvReceiptNo: 0, visitType: null };


  constructor(
    public patientService: PatientService,
    public billingService: BillingService,
    public router: Router,
    public callbackService: CallbackService,
    public routeFromService: RouteFromService,
    public patientVisitService: VisitService,
    public billingBLService: BillingBLService,
    public changeDetectorRef: ChangeDetectorRef,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public ordersBlService: OrdersBLService,
    public coreService: CoreService,
    public insuranceService: InsuranceService, public insuranceBLService: InsuranceBlService) {
    this.model = new BillingTransaction();
    this.billingService.CreateNewGlobalBillingTransaction();
    this.currentCounter = this.securityService.getLoggedInCounter().CounterId;
    this.taxPercent = this.billingService.taxPercent;
    this.taxId = this.billingService.taxId;
    this.currentBillingFlow = this.routeFromService.RouteFrom;
    this.routeFromService.RouteFrom = "";
    this.billingReceipt = new BillingReceiptModel();
    if (this.currentCounter < 1) {
      this.callbackService.CallbackRoute = '/Insurance/Patient'
      this.router.navigate(['/Billing/CounterActivate']);
    }
    else {
      this.isBillItemPriceEditable = this.coreService.GetInsBillRequestDisplaySettings().InsuranceBilling.BillItemPriceEditable;
      this.billingType = this.insuranceService.BillingType;
      this.currentVisitType = this.patientService.getGlobal().LatestVisitType;
      this.allServiceDepts = this.coreService.Masters.ServiceDepartments;
      this.serviceDeptList = this.allServiceDepts;
      this.serviceDeptList = this.allServiceDepts.filter(a => !a.IntegrationName || a.IntegrationName.toLowerCase() != "opd");
      this.LoadDefaultDiscountScheme();
      this.GetBillingItems();
      this.Initialize();
      this.LoadParameterForProvisional();


      this.BillRequestDoubleEntryWarningTimeHrs = this.coreService.LoadInsBillRequestDoubleEntryWarningTimeHrs();
    }
  }

  ngOnInit() {
    this.ItemsListFormatter = this.ItemsListFormatter.bind(this);//to use global variable in list formatter auto-complete
    this.SetLabTypeNameInLocalStorage();
  }

  public RefreshPage() {
    this.model = new BillingTransaction();
  }

  public Initialize() {
    this.isPackageBilling = false;
    this.ActivePackageInfo = { BillingPackageId: 0, BillingPackageName: null, PackageCode: null };
    this.selectedItems = [];
    this.selectedServDepts = [];
    this.selectedAssignedToDr = [];
    this.model = this.billingService.getGlobalBillingTransaction();
    this.model.LabTypeName = this.LabTypeName;
    this.model.CounterId = this.currentCounter;
    this.model.PatientId = this.patientService.getGlobal().PatientId;
    this.GetLatestVisitClaimCode();
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
  GetLatestVisitClaimCode() {
    this.insuranceBLService.GetLatestVisitClaimCode(this.patientService.getGlobal().PatientId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results) {
            this.latestVisitClaimCode = null;
            this.latestVisitClaimCode = res.Results;
            this.model.ClaimCode = this.latestVisitClaimCode;
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
  NewBillingTransactionItem(): BillingTransactionItem {
    let billTxnItem = new BillingTransactionItem();
    billTxnItem.PatientId = this.patientService.getGlobal().PatientId;
    billTxnItem.VisitType = this.currentVisitType;
    billTxnItem.Quantity = 1;
    billTxnItem.BillStatus = ENUM_BillingStatus.provisional;
    billTxnItem.UpdateValidator("off", "RequestedBy", "required");
    return billTxnItem;
  }

  AddNewBillTxnItemRow(index = null) {
    if (!this.isPackageBilling) {
      let item = this.NewBillingTransactionItem();
      item.IsInsurance = true;//since we're inside Insurance Billing this will be true.
      item.DiscountSchemeId = this.defDiscountSchemeId;//insurance uses default scheme.. 
      //item.ItemList = this.itemList;
      item.ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD");//sud:13-Oct'19
      if (this.LabTypeName == 'er-lab') {
        item.ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
      }
      this.model.BillingTransactionItems.push(item);

      if (index != null) {
        let new_index = this.model.BillingTransactionItems.length - 1;
        this.AssignRequestedByDoctor(new_index);
      }
      //if (index != null) {
      //  let new_index = index + 1
      //  window.setTimeout(function () {
      //    let itmNameBox = document.getElementById('items-box' + new_index);
      //    if (itmNameBox) {
      //      itmNameBox.focus();
      //    }
      //  }, 500);
      //}
      let new_index;
      if (index == null) {
        new_index = this.model.BillingTransactionItems.length - 1;
      }
      else {
        new_index = index + 1
      }
      window.setTimeout(function () {
        let itmNameBox = document.getElementById('items-box' + new_index);
        if (itmNameBox) {
          itmNameBox.focus();
        }
      }, 500);
      this.model.BillingTransactionItems[new_index].UpdateValidator("on", "Quantity", "invalidNumber");
    }
  }

  deleteRow(index: number) {
    let itemId = this.model.BillingTransactionItems[index].ItemId;
    let srvDeptId = this.model.BillingTransactionItems[index].ServiceDepartmentId;

    this.model.BillingTransactionItems.splice(index, 1);
    this.selectedItems.splice(index, 1);
    this.selectedAssignedToDr.splice(index, 1);
    this.selectedServDepts.splice(index, 1);
    let dupItem = this.model.BillingTransactionItems.find(item => item.ServiceDepartmentId == srvDeptId && item.ItemId == itemId);
    if (dupItem) {
      dupItem.IsDuplicateItem = false;
    }

    if (index == 0 && this.model.BillingTransactionItems.length == 0) {
      this.AddNewBillTxnItemRow();
      this.changeDetectorRef.detectChanges();
    }
    this.ReCalculateInvoiceAmounts();
    this.CheckForDoubleEntry();
  }

  public GetDoctorsList() {
    //For gov insurnace not needed doctor list self bydefault
    let Obj = new Object();
    Obj["EmployeeId"] = null;
    Obj["FullName"] = "SELF";
    this.reqDoctorsList.push(Obj);
    this.doctorsList.push(Obj);
    this.GetPatientVisitList(this.patientService.getGlobal().PatientId);


  }
  public GetPatientVisitList(patientId: number) {
    this.insuranceBLService.GetPatientVisitsProviderWise(patientId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.visitList = res.Results;
            if (this.model.BillingTransactionItems.length) {
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
    this.itemList = this.insuranceService.allBillItemsPriceList;
    this.GetPatientVisitList(this.patientService.getGlobal().PatientId);
    //this.GetDistinctServiceDepartments(this.itemList);
    //this.FilterBillItems(0);
    this.isItemLoaded = true;

    // this.GetInsurancePackages();

    // this.insuranceBLService.GetInsuranceBillingItems()
    //   .subscribe(res => {
    //     if (res.Status == 'OK') {
    //       if (res.Results.length) {
    //         this.GetDoctorsList();
    //         let itemList = res.Results;
    //         if (this.insuranceService.BillingFlow == "insurance-package") {
    //           itemList = itemList.filter(a => a.IsInsurancePackage != true);
    //         }
    //         this.CallBackGetBillingItems(itemList);
    //         this.GetDistinctServiceDepartments(itemList);
    //         this.isItemLoaded = true;
    //         this.FilterBillItems(0);
    //       }
    //       else {
    //         this.msgBoxServ.showMessage('Failed', ["Item not found for insurance bililng."]);
    //         console.log(res.ErrorMessage);
    //       }
    //     }
    //     else {
    //       this.msgBoxServ.showMessage('Failed', ["unable to get items for searchbox.. check logs for more details."]);
    //       console.log(res.ErrorMessage);
    //     }
    //   },
    //     err => {
    //       console.log(err.ErrorMessage);

    //     });
  }

  public CallBackGetBillingItems(result) {
    this.GetPatientVisitList(this.patientService.getGlobal().PatientId);
    this.itemList = result;
    this.isItemLoaded = true;
    this.FilterBillItems(0);
  }



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
      this.insuranceService.BillingType = this.billingType = this.model.TransactionType;
      if (this.model.BillingTransactionItems && this.model.BillingTransactionItems.length) {
        this.currentVisitType = this.model.BillingTransactionItems[0].VisitType;
        this.currBillingContext = new PatientBillingContextVM();
        this.currBillingContext.PatientVisitId = this.model.PatientVisitId;
        this.currBillingContext.BillingType = this.billingType;
      }
      for (let i = 0; i < this.model.BillingTransactionItems.length; i++) {
        let billItem = this.model.BillingTransactionItems[i];
        billItem.BillStatus = ENUM_BillingStatus.provisional;
        billItem.EnableControl("ItemName", false);
        billItem.EnableControl("ServiceDepartmentId", false);
        this.selectedServDepts[i] = billItem.ServiceDepartmentName;
        let assignedToDr = this.doctorsList.find(d => d.EmployeeId == billItem.ProviderId);
        if (assignedToDr)
          this.selectedAssignedToDr[i] = assignedToDr.FullName;
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

  CheckItemProviderValidation(index: number) {
    if ((this.selectedItems[index] && this.selectedItems[index].IsDoctorMandatory) && this.insuranceService.BillingFlow != 'insurance') {
      this.model.BillingTransactionItems[index].UpdateValidator("on", "ProviderId", "required");
    }
    else {
      this.model.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);
    }
  }

  CheckForDuplication(): boolean {
    var allowOnDuplicatedItems: boolean = false;
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
        map.set(itemIdsDetail, true);
      }
    }
    return true;
  }

  DeleteEmptyRows() {
    this.model.BillingTransactionItems.forEach(txnItm => {
      if (!txnItm.ItemName && this.model.BillingTransactionItems.length > 1) {
        this.model.BillingTransactionItems.splice(this.model.BillingTransactionItems.indexOf(txnItm), 1);
      }
    });
  }

  CheckAndSubmitBillingTransaction(billingFlow: string = null) {
    this.DeleteEmptyRows();
    this.isInitialWarning = false;
    if (this.insuranceService.BillingFlow == 'insurance') {
      this.model.BillingTransactionItems.forEach(itm => {
        itm.IsInsurance = true;
      })
    }
    if (billingFlow == "provisional") {
      if (this.model.BillingTransactionItems) {
        this.model.BillingTransactionItems.forEach(txnItm => {
          txnItm.BillStatus = ENUM_BillingStatus.provisional;
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


    if (this.CheckSelectionFromAutoComplete() && this.CheckBillingValidations() && this.CheckForDuplication()) {
      this.isProvisionalBilling = billingFlow == "provisional";
      if (this.DuplicateItem.IsDuplicate) {//this is only used while showing Confirmation Pop Up for dublicate item.
        this.ShowDuplicateItemComfirmation = true; //In case of Dublicate item entry POP Up is shown to re-check the item entered.
      }
      else {
        this.SubmitBillingTransaction();
      }
    }
    else {
      this.loading = false;
    }
  }

  CheckBillingValidations(): boolean {
    let isFormValid = true;
    for (var j = 0; j < this.model.BillingTransactionItems.length; j++) {

      this.model.BillingTransactionItems.forEach(element => {
        if (element.IsZeroPriceAllowed == false || element.IsZeroPriceAllowed == null) {
          if (!(element.Price != null && element.Price > 0)) {
            this.msgBoxServ.showMessage("error", ["Price of Item cannot be zero (0)"]);
          }
        }
      });
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

      ////Asigning LabTypeName while posting lab items
      let integrationName = this.coreService.GetServiceIntegrationName(this.model.BillingTransactionItems[j].ServiceDepartmentName);
      if (integrationName == "LAB") {
        this.model.BillingTransactionItems[j].LabTypeName = this.LabTypeName;
      }

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
      if (!this.model.ClaimCode) {
        isFormValid = false;
        this.msgBoxServ.showMessage("error", ['Claim code required. Please create visit first.'])
      }
      this.UpdatePriceValidty();
      if (isFormValid && this.CheckInsuranceTxnApplicable()) {
        this.AssignBillTxnItemsValuesForSubmit();
        this.PostToDepartmentRequisition(this.model.BillingTransactionItems);

      }
      else {
        this.loading = false;
      }
    }

  }


  UpdatePriceValidty() {
    if (this.insuranceService.BillingFlow == "insurance-package") {
      this.model.BillingTransactionItems.forEach(billItem => {
        billItem.UpdateValidator("off", "Price", null);
      });
    }
  }

  //posts to Departments Requisition Table
  PostToDepartmentRequisition(billTxnItems: Array<BillingTransactionItem>, emergencyItem = null) {

    //billTxnItems.forEach(a => a.BillingType = "outpatient"); //Yubraj-18th July '19 //temporary solution for generating Credit Insurance Invoice

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
    this.PostBilling(billTxnItems);
    /* //orderstatus="active" and billingStatus="provisional" when sent from billingpage.
    this.billingBLService.PostDepartmentOrders(billTxnItems, "active", "provisional", this.insuranceApplicableFlag, this.currPatVisitContext)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length) {
          if (emergencyItem) {
            res.Results.push(emergencyItem);
          }
          this.PostBilling(res.Results);
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to add department requisitions"]);
          this.isProvisionalBilling = false;
          console.log(res.ErrorMessage);
          this.loading = false;
        }
      }, err => {
        this.loading = false;
      }); */
  }
  //posts to BillingTransactionItems table
  PostBilling(billTxnItems: Array<BillingTransactionItem>) {
    if (this.isProvisionalBilling)
      this.PostBillingTransactionItems(billTxnItems);
    else {
      this.PostBillingTransaction(billTxnItems);
    }
  }

  //posts to BillingTransactionItems table
  PostBillingTransaction(billTxnItems: Array<BillingTransactionItem>) {
    this.isProvisionalBilling = false;
    this.model.BillingTransactionItems = new Array<BillingTransactionItem>();
    for (let i = 0; i < billTxnItems.length; i++) {
      this.model.BillingTransactionItems.push(new BillingTransactionItem());
      this.model.BillingTransactionItems[i] = Object.assign(this.model.BillingTransactionItems[i], billTxnItems[i]);
    }
    this.AssignValuesToBillTxn();
    if ((this.insuranceService.BillingFlow == "insurance" || this.insuranceService.BillingFlow == "insurance-package") && this.currBillingContext.Insurance) {
      this.model.IsInsuranceBilling = true;
      this.model.Tender = 0;
      this.model.InsuranceProviderId = this.currBillingContext.Insurance.InsuranceProviderId;
      this.CheckAndSubmitInsuranceItems();
    }

    //this.model.TransactionType = "outpatient";
    if (this.currentBillingFlow == "BillReturn" && this.model.TransactionType == "inpatient") {
      this.PostIpBillingTransaction(billTxnItems);
    }
    else {
      this.PostOpBillingTransaction(billTxnItems);
    }
  }

  PostIpBillingTransaction(billTxnItems: Array<BillingTransactionItem> ) {

    if (this.patBillHistory.DepositBalance && this.model.TotalAmount > this.patBillHistory.DepositBalance && this.deductDeposit) {
      this.model.ReturnedAmount = this.model.DepositBalance;
      this.model.DepositBalance = 0;
    }
    else if (this.patBillHistory.DepositBalance && this.model.TotalAmount < this.patBillHistory.DepositBalance && this.deductDeposit) {
      this.model.Tender = this.model.TotalAmount;
      this.model.DepositBalance = this.patBillHistory.DepositBalance - this.model.TotalAmount;
    }
    
    this.billingBLService.PostIpBillingTransaction(this.model)
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


  PostOpBillingTransaction(billTxnItems: Array<BillingTransactionItem>) {
    if (this.model.BillingTransactionItems.some(a => a.SrvDeptIntegrationName == "LAB")) {
      this.model.LabTypeName = this.LabTypeName;
    }
    if (this.model.TransactionType == "inpatient") {
      this.model.InvoiceType = ENUM_InvoiceType.inpatientPartial;
    }
    else {
      this.model.InvoiceType = ENUM_InvoiceType.outpatient;
    }

    this.insuranceBLService.ProceedToOpInsuranceBilling(this.model,billTxnItems,"active", "provisional", this.insuranceApplicableFlag, this.currPatVisitContext).subscribe(res =>{
      if (res.Status == "OK" && res.Results) {
        this.CallBackPostBilling(res.Results);
      }
      else {
        this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        this.loading = false;
      }
    });
    /* this.insuranceBLService.PostBillingTransaction(this.model)
      .subscribe(
        res => {
          if (res.Status == "OK" && res.Results) {
            this.CallBackPostBilling(res.Results);
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            this.loading = false;
          }
        }); */
  }


  //sud:19May'21--needed to print invoice.
  public bil_InvoiceNo: number = 0;
  public bil_FiscalYrId: number = 0;
  public bil_BilTxnId: number = null;

  CallBackPostBilling(billTxn: BillingTransaction) {
    this.bil_FiscalYrId = billTxn.FiscalYearId;
    this.bil_InvoiceNo = billTxn.InvoiceNo;
    this.bil_BilTxnId = billTxn.BillingTransactionId;

    this.loading = false;
    this.showbillingReceipt = true;

    this.loading = false;
  }

  PostPackageBillingTransaction() {
    this.AssignValuesToBillTxn();
    this.billingBLService.PostPackageBillingTransaction(this.model)
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
  PostEmergencyVisitItem(emergencyItem: BillingTransactionItem) {
    let items = Array<BillingTransactionItem>();
    let erdeptnameparam = this.coreService.Parameters.find(p => p.ParameterGroupName.toLowerCase() == "common" && p.ParameterName.toLowerCase() == "erdepartmentname");
    if (erdeptnameparam) {
      let erdeptname = erdeptnameparam.ParameterValue.toLowerCase();
      let dep = this.coreService.Masters.Departments.find(a => a.DepartmentName.toLowerCase() == erdeptname);
      emergencyItem.RequestingDeptId = dep.DepartmentId;
    }
    items.push(emergencyItem);
    this.billingBLService.PostDepartmentOrders(items, "active", "provisional", this.insuranceApplicableFlag)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length) {
          let erItem = res.Results[0];
          let otherItems = this.model.BillingTransactionItems.filter(item => item.ItemName.toLowerCase() != "emergency registration");
          erItem.VisitType = "emergency";
          erItem.PatientVisitId = erItem.PatientVisitId;
          erItem.RequisitionId = erItem.PatientVisitId;
          items[0] = erItem;
          otherItems.forEach(item => {
            item.VisitType = ENUM_VisitType.emergency;
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
    this.model.PaymentMode = ENUM_BillPaymentMode.credit;
    this.model.BillStatus = ENUM_BillingStatus.unpaid;
    this.model.BillingTransactionItems.forEach(item => {
      item.BillStatus = ENUM_BillingStatus.unpaid;
    });
    this.model.PaymentDetails = "InsuranceName: " + this.billingService.Insurance.InsuranceProviderName
      + "/" + "InsuranceNumber:" + this.billingService.Insurance.InsuranceNumber;
  }

  PostBillingTransactionItems(billTxnItems: Array<BillingTransactionItem>) {
    
     /*this.billingBLService.PostBillingTransactionItems(billTxnItems)
      .subscribe(
        res => {
          if (res.Status == "OK") {
             var result = res.Results;
            console.log("Provisional Result:", result);
            console.log("Model Result:", this.model);
            this.model.FiscalYear = result[0].ProvFiscalYear;
            this.model.InvoiceNo = result[0].ProvisionalReceiptNo;
            this.model.singleReceiptBool = true;

            this.model.BillingTransactionItems = new Array<BillingTransactionItem>();
            for (let i = 0; i < result.length; i++) {
              this.model.BillingTransactionItems.push(new BillingTransactionItem());
              this.model.BillingTransactionItems[i] = Object.assign(this.model.BillingTransactionItems[i], result[i]);
            } 

            // this.model.BillingTransactionItems = result;
            this.RouteToReceipt(this.model); 
          let result = res.Results;
          this.provReceiptInputs.PatientId = this.model.PatientId;
          this.provReceiptInputs.ProvFiscalYrId = result[0].ProvisionalFiscalYearId;
          this.provReceiptInputs.ProvReceiptNo = result[0].ProvisionalReceiptNo;
          this.provReceiptInputs.visitType = null;//sending null from here for now.. Check this later..

          this.showbillingReceipt = true;

          }
          else {
            this.msgBoxServ.showMessage("failed", ["Unable to complete transaction."]);
            console.log(res.ErrorMessage)
            this.loading = false;
          }
        }); */

        this.insuranceBLService.ProceedToOpInsuranceBilling(this.model,billTxnItems,"active", "provisional", this.insuranceApplicableFlag, this.currPatVisitContext).subscribe(
          res =>{
            if (res.Status == "OK") {
              let result = res.Results;
              this.provReceiptInputs.PatientId = this.model.PatientId;
              this.provReceiptInputs.ProvFiscalYrId = result[0].ProvisionalFiscalYearId;
              this.provReceiptInputs.ProvReceiptNo = result[0].ProvisionalReceiptNo;
              this.provReceiptInputs.visitType = null;//sending null from here for now.. Check this later..
    
              this.showbillingReceipt = true;
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
        if (deptsDistinct.indexOf(a.ServiceDepartmentName) < 0) {
          deptsDistinct.push(a.ServiceDepartmentName);
        }
      });

      deptsDistinct.forEach(srvdptname => {
        let srvDeptItems = billTxnItems.filter(b => {
          if (b.ServiceDepartmentName == srvdptname) {
            return b;
          }
        });
        this.billingBLService.UpdateRequisitionsBillingStatus(srvDeptItems, srvdptname)
          .subscribe(res => {
            console.log("updated requisition billing status sucessfully");
          });
      });
    }
  }


  public billingReceipt: BillingReceiptModel = new BillingReceiptModel();
  RouteToReceipt(billTxn: BillingTransaction) {


    this.billingReceipt = new BillingReceiptModel();
    let txnReceipt = BillingReceiptModel.GetReceiptForTransaction(billTxn);
    txnReceipt.IsInsuranceBilling = this.insuranceService.BillingFlow == "insurance" ? true : false;
    txnReceipt.Patient = Object.create(this.patientService.globalPatient);
    txnReceipt.IsValid = true;
    let ProvBillingUser = this.securityService.GetLoggedInUser().UserName; //Yubraj 28th June '19
    txnReceipt.BillingUser = this.isProvisionalBilling ? ProvBillingUser : billTxn.BillingUserName;
    txnReceipt.Remarks = this.model.Remarks;
    txnReceipt.Ins_NshiNumber = this.patientService.getGlobal().NSHI;
    txnReceipt.ClaimCode = billTxn.ClaimCode;

    txnReceipt.BillingDate = txnReceipt.BillingDate ? txnReceipt.BillingDate : moment().format("YYYY-MM-DD HH:mm:ss");
    txnReceipt.ReceiptType = this.isProvisionalBilling ? "provisional" : txnReceipt.ReceiptType;
    txnReceipt.singleReceiptBool = this.model.singleReceiptBool;
    txnReceipt.DepositBalance = this.isProvisionalBilling ? CommonFunctions.parseAmount(this.patBillHistory.DepositBalance) : txnReceipt.DepositBalance;

    if (billTxn.TransactionType && billTxn.TransactionType.toLowerCase() == "inpatient" && billTxn.InvoiceType != ENUM_InvoiceType.inpatientPartial) {
      txnReceipt.ReceiptType = "ip-receipt";
    }
    this.insuranceService.globalBillingReceipt = txnReceipt;
    this.billingReceipt = this.insuranceService.globalBillingReceipt;



    this.loading = false;
    this.showbillingReceipt = true;

  }


  GetServiceDeptNameById(servDeptId: number): string {
    if (this.allServiceDepts) {
      let serDept = this.allServiceDepts.filter(a => a.ServiceDepartmentId == servDeptId);
      return (serDept.length > 0) ? serDept[0].ServiceDepartmentName : null;
    } else {
      return null;
    }
  }
  LoadAllServiceDepts() {
    this.billingBLService.GetServiceDepartments()
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
    if (this.model.BillingTransactionItems[index].ServiceDepartmentId) {
      if (this.model.BillingTransactionItems.length && this.isItemLoaded) {
        let srvDeptId = this.model.BillingTransactionItems[index].ServiceDepartmentId;
        if (this.model.BillingTransactionItems[index].ItemId == null)
          this.ClearSelectedItem(index);
        this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.ServiceDepartmentId == srvDeptId);
        if (this.LabTypeName == 'er-lab') {
          this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
        }
        let servDeptName = this.GetServiceDeptNameById(srvDeptId);
        //NageshBB: for gov insurance doctor not required so we are going to off validation
        this.model.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);
        //  if (this.selectedItems[index] && this.selectedItems[index].IsDoctorMandatory) {
        //     this.model.BillingTransactionItems[index].UpdateValidator("on", "ProviderId", "required");
        //   }
        //   else {
        //     this.model.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);
        //   }
      }
    }
    else {
      let billItems = this.itemList.filter(a => a.ServiceDepartmentName != "OPD");
      this.model.BillingTransactionItems[index].ItemList = billItems;
      if (this.LabTypeName == 'er-lab') {
        this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
      }
    }
  }

  // ShowPackage() {
  //   if (this.insuranceService.BillingFlow != "normal"
  //     && this.currBillingContext.Insurance
  //     && this.currBillingContext.Insurance.PatientInsurancePkgTxn) {
  //     this.msgBoxServ.showMessage("failed", ["Close current Insurance Package to start new one."]);
  //   }
  //   else {
  //     this.showSelectPage = false;
  //     this.changeDetectorRef.detectChanges();
  //     this.showSelectPage = true;
  //   }
  // }

  // ShowCopyFromEarlierInvoice() {
  //   this.patientId = null;
  //   this.showTxnCopySelPage = false;
  //   this.changeDetectorRef.detectChanges();
  //   this.patientId = this.patientService.getGlobal().PatientId;
  //   this.showTxnCopySelPage = true;
  // }

  SelectFromPackage($event) {
    this.currentBillingFlow = "packageBilling";//needed this so that it'll reset ReturnFlow of billing which was causing issue.

    this.disableTextBox = true;
    this.model = this.billingService.CreateNewGlobalBillingTransaction();
    this.model.CounterId = this.currentCounter;
    this.model.PatientId = this.patientService.getGlobal().PatientId;
    this.model.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    this.showSelectPage = false;
    this.selectedItems = [];
    this.selectedAssignedToDr = [];
    var items = $event.pkg.BillingItemsXML.Items;
    this.ActivePackageInfo.BillingPackageId = $event.pkg.BillingPackageId;
    this.ActivePackageInfo.BillingPackageName = $event.pkg.BillingPackageName;
    this.isPackageBilling = true;//need to set this to false somewhere..
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
        let visit = this.visitList.find(a => a.ProviderName.toLowerCase() == "self")
        if (visit) {
          this.AssignRequestedByDoctor(i);
        }

      }
      else {
        this.msgBoxServ.showMessage("failed", ["Unable to assign item from package."]);
      }

    }
  }

  public AssignSelectedItem(index) {
    let item = null;
    if (this.selectedItems[index]) {
      if (typeof (this.selectedItems[index]) == 'string' && this.model.BillingTransactionItems[index].ItemList.length) {
        item = this.model.BillingTransactionItems[index].ItemList.find(a => a.ItemName.toLowerCase() == this.selectedItems[index].toLowerCase());
      }
      else if (typeof (this.selectedItems[index]) == 'object')
        item = this.selectedItems[index];
      if (item) {
        if (this.billingType && this.billingType.toLowerCase() != "inpatient" && !this.isPackageBilling) {
          let extItem = this.model.BillingTransactionItems.find(a => a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId);
          let extItemIndex = this.model.BillingTransactionItems.findIndex(a => a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId);
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
            var itmeDetail = { ItemName: extItem.ItemName, Quantity: extItem.Quantity, Price: extItem.Price };
            this.DuplicateItem.Item.push(itmeDetail);
          }
        }
        this.model.BillingTransactionItems[index].ItemId = item.ItemId;
        this.model.BillingTransactionItems[index].ItemName = item.ItemName;
        this.model.BillingTransactionItems[index].TaxPercent = item.TaxApplicable ? this.taxPercent : 0;
        this.model.BillingTransactionItems[index].IsTaxApplicable = item.TaxApplicable;
        this.model.BillingTransactionItems[index].Price = item.Price;
        this.model.BillingTransactionItems[index].IsZeroPriceAllowed = item.IsZeroPriceAllowed;
        this.model.BillingTransactionItems[index].PriceCategory = this.priceCategory;
        this.model.BillingTransactionItems[index].ProcedureCode = item.ProcedureCode;
        this.model.BillingTransactionItems[index].ServiceDepartmentName = this.GetServiceDeptNameById(item.ServiceDepartmentId);
        this.model.BillingTransactionItems[index].ServiceDepartmentId = item.ServiceDepartmentId;
        this.AssignRequestedByDoctor(index);
        this.selectedServDepts[index] = this.model.BillingTransactionItems[index].ServiceDepartmentName;
        this.model.BillingTransactionItems[index].IsValidSelDepartment = true;
        this.model.BillingTransactionItems[index].IsValidSelItemName = true;
        this.model.BillingTransactionItems[index].InsBillItemPriceEditable = (item.Price == 0 || item.Price == null) ? true : (this.isBillItemPriceEditable == true) ? true : false;

        //insurance
        if (this.insuranceService.BillingFlow == "insurance" && item.IsInsurancePackage) {
          if (this.currBillingContext.Insurance.PatientInsurancePkgTxn) {
            this.msgBoxServ.showMessage("failed", ["Close current Insurance Package to start new one."]);
            this.ResetSelectedRow(index);
            return;
          }
          else {
            this.model.BillingTransactionItems[index].IsInsurancePackage = item.IsInsurancePackage;
            // let insurancePackage = this.insurancePackageList.find(pkg => pkg.BillingPackageName == item.ItemName);
            // this.model.BillingTransactionItems[index].BillingPackageId = insurancePackage ? insurancePackage.BillingPackageId : null;
          }

        }

        //insurance
        if (this.insuranceService.BillingFlow == "insurance-package") {
          this.UpdateInsurancePkgItemPrice(index);
        }

        this.FilterBillItems(index);
        this.CheckItemProviderValidation(index);

        this.ReCalculateInvoiceAmounts();
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
        this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.ServiceDepartmentName != "OPD");
        if (this.LabTypeName == 'er-lab') {
          this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
        }
      }
      this.CheckForDoubleEntry();
    }
    else {
      // Vikas: 17th Jan 2020: If item name cleared from row then their properties also clear
      // like service deparatment name, item quantity, item price etc.
      this.model.BillingTransactionItems[index].ItemId = 0;
      this.model.BillingTransactionItems[index].ItemName = "";
      this.model.BillingTransactionItems[index].TaxPercent = 0;
      this.model.BillingTransactionItems[index].IsTaxApplicable = true;
      this.model.BillingTransactionItems[index].AllowMultipleQty = true;
      this.model.BillingTransactionItems[index].Price = 0;
      this.model.BillingTransactionItems[index].PriceCategory = "";
      this.model.BillingTransactionItems[index].ProcedureCode = "";
      this.model.BillingTransactionItems[index].ServiceDepartmentId = 0;
      this.selectedServDepts[index] = "";
      this.model.BillingTransactionItems[index].IsValidSelDepartment = true;
      this.model.BillingTransactionItems[index].IsValidSelItemName = true;
      this.selectedAssignedToDr[index] = null;
      this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD");
      if (this.LabTypeName == 'er-lab') {
        this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
      }
      this.model.BillingTransactionItems[index].IsDoubleEntry_Now = false;
      this.model.BillingTransactionItems[index].IsDoubleEntry_Past = false;

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
        this.model.BillingTransactionItems[index].RequestedByName = doctor.FullName;
        this.model.BillingTransactionItems[index].IsValidSelRequestedByDr = true;
      }
      else
        this.model.BillingTransactionItems[index].IsValidSelRequestedByDr = false;
    }
    else
      this.model.BillingTransactionItems[index].IsValidSelRequestedByDr = true;
  }


  public RequestedByDrOnChange() {
    let doctor = null;
    console.log(this.currentRequestedByDoctor);
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
    this.model.BillingTransactionItems[index].ProcedureCode = null;
    this.model.BillingTransactionItems[index].ItemId = null;
    this.ReCalculateInvoiceAmounts();
  }

  MapSelectedItem(index) {
    var item = this.itemList.find(a => a.ItemId == this.model.BillingTransactionItems[index].ItemId);
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
      html += "(<i>" + data["ServiceDepartmentName"] + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + " " + data["Price"];
    }
    else {
      let docName = data.Doctor ? data.Doctor.DoctorName : "";
      html = data["ServiceDepartmentShortName"] + "-" + data["BillItemPriceId"] + "&nbsp;&nbsp;" + data["ItemName"] + "&nbsp;&nbsp;";
      html += "(<i>" + docName + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + " " + data["Price"];
    }
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
    if (typeof (this.selectedServDepts[index]) == 'string') {
      if (this.serviceDeptList.length && this.selectedServDepts[index])
        srvDeptObj = this.serviceDeptList.find(a => a.ServiceDepartmentName.toLowerCase() == this.selectedServDepts[index].toLowerCase());
    }
    else if (typeof (this.selectedServDepts[index]) == 'object')
      srvDeptObj = this.selectedServDepts[index];
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
      this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.ServiceDepartmentName != "OPD");
      if (this.LabTypeName == 'er-lab') {
        this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
      }
      this.model.BillingTransactionItems[index].IsValidSelDepartment = false;
    }
  }
  //reset Item Selected on service department change
  ResetSelectedRow(index) {
    this.selectedItems[index] = null;
    this.selectedAssignedToDr[index] = null;
    this.model.BillingTransactionItems[index] = this.NewBillingTransactionItem();
    this.model.BillingTransactionItems[index].RequestedBy = this.model.BillingTransactionItems[index].RequestedBy;
    this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.ServiceDepartmentName != "OPD");
    if (this.LabTypeName == 'er-lab') {
      this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
    }
    this.model.BillingTransactionItems[index].RequestedBy = index > 0 ? this.model.BillingTransactionItems[index - 1].RequestedBy : (this.visitList[0].ProviderName == "Duty Doctor" ? null : this.visitList[0].ProviderId);
    this.ReCalculateInvoiceAmounts();

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
      this.currBillingContext.Insurance.Ins_InsuranceBalance = $event.UpdatedBalance;
    }
    console.log("ins popup closed");
    console.log($event);
    this.showInsBalanceUpdate = false;
    this.CalculateInsuranceAmounts();
  }



  LoadPatientBillingContext() {
    //we get billing context from earlier invoice incase of copy from earlier invoice.
    if (this.currentBillingFlow != "BillReturn") {
      this.insuranceBLService.GetPatientBillingContext(this.patientService.globalPatient.PatientId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.currBillingContext = res.Results;

            this.insuranceService.BillingType = this.currBillingContext.BillingType;
            this.billingType = this.currBillingContext.BillingType;
            if (this.insuranceService.BillingFlow == "insurance") {
              this.billingService.Insurance = this.currBillingContext.Insurance;
              this.CalculateInsuranceAmounts();
            }
            this.GetVisitContext(this.currBillingContext.PatientId, this.currBillingContext.PatientVisitId);
          }
        });
    }
  }

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
      this.insuranceBLService.GetDataOfInPatient(patientId, visitId)
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

  OnPaymentModeChange() {
    if (this.model.PaymentMode == "credit") {
      this.model.PaidAmount = 0;
      this.model.BillStatus = "unpaid";
      this.model.PaidDate = null;
      this.model.PaidCounterId = null;
      this.model.Tender = 0;
      if (this.model.BillingTransactionItems) {
        this.model.BillingTransactionItems.forEach(txnItm => {
          txnItm.BillStatus = ENUM_BillingStatus.unpaid;
          txnItm.PaidDate = null;
        });
      }
    }
    else {
      this.model.Tender = this.model.Tender ? this.model.Tender : this.model.TotalAmount;
      this.model.PaidAmount = this.model.Tender - this.model.Change;
      this.model.BillStatus = ENUM_BillingStatus.paid;
      this.model.PaidDate = moment().format("YYYY-MM-DD HH:mm:ss");
      this.model.PaidCounterId = this.securityService.getLoggedInCounter().CounterId;
      if (this.model.BillingTransactionItems) {
        this.model.BillingTransactionItems.forEach(txnItm => {
          txnItm.BillStatus = ENUM_BillingStatus.paid;
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
    if (this.insuranceService.BillingFlow == "insurance") {
      this.insuranceApplicableFlag = true;
      if (this.currBillingContext.Insurance.Ins_InsuranceBalance) {
        if (this.currBillingContext.Insurance.Ins_InsuranceBalance - (this.currBillingContext.Insurance.InsuranceProvisionalAmount + this.model.TotalAmount) < 0) {
          this.msgBoxServ.showMessage("failed", ["Insufficient Insurance Balance, please remove some items and proceed"]);
          return false;
        }
      }
      else {
        this.msgBoxServ.showMessage("failed", ["Insufficient Insurance Balance, please remove some items and proceed"]);
        return false;
      }
    }
    return true;
  }



  public GetDistinctServiceDepartments(items) {
    if (items && items.length) {
      let distinctSrvDept = new Array<ServiceDepartmentVM>();
      let matchedServDept = this.serviceDeptList.find(srv => srv.ServiceDepartmentName == items[0].ServiceDepartmentName);
      if (matchedServDept) {
        distinctSrvDept.push(this.serviceDeptList.find(srv => srv.ServiceDepartmentName == items[0].ServiceDepartmentName));
        items.forEach(itm => {
          if (!distinctSrvDept.find(dst => dst.ServiceDepartmentName == itm.ServiceDepartmentName)) {
            distinctSrvDept.push(this.serviceDeptList.find(srv => srv.ServiceDepartmentName == itm.ServiceDepartmentName));
          }
        });
        this.serviceDeptList = distinctSrvDept;
      }
    }
  }


  //billing transaction against insurace package.
  UpdateInsurancePkgItemPrice(index) {
    let billItem = this.model.BillingTransactionItems[index];
    billItem.Price = 0;
    billItem.PatientInsurancePackageId = this.currBillingContext.Insurance.PatientInsurancePkgTxn.PatientInsurancePackageId;

    this.ReCalculateBillItemAmounts(billItem);
  }

  public priceCategory: string = "Normal";
  OnPriceCategoryChange() {
    if (this.priceCategory == "EHS") {
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
            txnItm.PriceCategory = ENUM_PriceCategory.EHS;
          }
        });
      }
    }
    else if (this.priceCategory == "Foreigner") {
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
            txnItm.PriceCategory = ENUM_PriceCategory.Foreigner;
          }
        });
      }
    }
    else if (this.priceCategory == ENUM_PriceCategory.SAARCCitizen) {
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
            txnItm.PriceCategory = ENUM_PriceCategory.SAARCCitizen;
          }
        });
      }
    }
    else {
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

  currentRequestedByDoctor: any = null;
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
    this.showItemEditPanel = false;
  }

  CloseItemUpdatePanel() {
    this.showItemEditPanel = false;
  }


  ReCalculateBillItemAmounts(index) {
    let currItem = this.model.BillingTransactionItems[index];
    currItem.SubTotal = currItem.Price * currItem.Quantity;

    this.CalculateAggregateDiscountsOfItems(currItem);
    this.ReCalculateInvoiceAmounts();
  }

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

  //this is only for insurance amount calculation
  CalculateInsuranceAmounts() {
    if (this.insuranceService.BillingFlow == "insurance") {
      let amount = this.model.TotalAmount
      let ins_InsuranceBalance = this.currBillingContext.Insurance.Ins_InsuranceBalance;
      let provisionalInsAmount = this.currBillingContext.Insurance.InsuranceProvisionalAmount;
      this.RemainingInsuranceBalance = ins_InsuranceBalance - (amount + provisionalInsAmount);
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
  public OnLabTypeChange() {
    console.log(this.LabTypeName);
    this.model.LabTypeName = this.LabTypeName;
    this.FilterBillItems(0);

    if (this.LabTypeName) {
      if (localStorage.getItem('InsBillingSelectedLabTypeName')) {
        localStorage.removeItem('InsBillingSelectedLabTypeName');
      }
      localStorage.setItem('InsBillingSelectedLabTypeName', this.LabTypeName);
    } else {
      this.msgBoxServ.showMessage('error', ["Please select Lab Type Name."]);
    }
  }

  HasDoubleEntryInPast() {
    if (this.PastTestList && this.PastTestList.length > 0) {
      var currDate = moment().format("YYYY-MM-DD HH:mm:ss");
      if (this.BillRequestDoubleEntryWarningTimeHrs && this.BillRequestDoubleEntryWarningTimeHrs != 0) {
        this.PastTestList.forEach(a => {
          //var diff = moment.duration(a.CreatedOn.diff(currDate));
          if (this.DateDifference(currDate, a.CreatedOn) < this.BillRequestDoubleEntryWarningTimeHrs) {
            this.PastTestList_ForDuplicate.push(a);
          }
        });
      }
    }
  }

  public DateDifference(currDate, startDate): number {
    var diffHrs = moment(currDate, "YYYY/MM/DD HH:mm:ss").diff(moment(startDate, "YYYY/MM/DD HH:mm:ss"), 'hours');
    return diffHrs;
  }

  CheckForDoubleEntry() {
    this.model.BillingTransactionItems.forEach(itm => {

      if (this.model.BillingTransactionItems.filter(a => a.ServiceDepartmentId == itm.ServiceDepartmentId && a.ItemId == itm.ItemId).length > 1) {
        itm.IsDoubleEntry_Now = true;
        //this.msgBoxServ.showMessage('warning', ["This item is already entered"]);
      }
      else {
        itm.IsDoubleEntry_Now = false;
      }
      this.HasDoubleEntryInPast();
      if (this.PastTestList_ForDuplicate && this.PastTestList_ForDuplicate.find(a => a.ServiceDepartmentId == itm.ServiceDepartmentId && a.ItemId == itm.ItemId)) {
        itm.IsDoubleEntry_Past = true;
        //this.msgBoxServ.showMessage('warning', ["This item is already entered"]);
      }
      else {
        itm.IsDoubleEntry_Past = false;
      }
    });
  }

  PastTest($event) {
    this.PastTestList = $event;
  }

  public AddTxnItemRowOnClick(index) {
    if (index != -1) {
      if (this.model.BillingTransactionItems[index].ItemId == 0) {
        this.setFocusById('remarks');
      } else {
        //this.AddNewBillTxnItemRow(index);
        this.setFocusOnQtyById(index);
      }
    } else {
      //this.AddNewBillTxnItemRow(index);
      this.setFocusOnQtyById(index);
    }
  }


  setFocusOnQtyById(index) {
    let targetId = 'quantity_' + index;
    let htmlObject = document.getElementById(targetId);
    if (htmlObject) {
      htmlObject.focus();
    }
  }

  //common function to set focus on  given Element. 
  setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    var timer = window.setTimeout(function () {
      let htmlObject = document.getElementById(targetId);
      if (htmlObject) {
        htmlObject.focus();
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
  }

  SetFocusOnButton(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
    }
  }

  public hotkeys(event) {
    if (event.altKey) {
      switch (event.keyCode) {
        case 13: {//=> ALT+enter comes here
          this.setFocusById('remarks');
          break;
        }
        case 80: {// => ALT+P comes here
          //this.SetFocusOnButton('btn_printInvoice2');
          this.loading = true;
          this.CheckAndSubmitBillingTransaction();
          break;
        }
        default:
          break;
      }
    }
  }

  SetLabTypeNameInLocalStorage() {
    let labtypeInStorage = localStorage.getItem('InsBillingSelectedLabTypeName');
    if (labtypeInStorage) {
      //let val = this.LabType.find(p => p.DisplayName == labtypeInStorage);
      this.LabTypeName = labtypeInStorage
    } else {
      localStorage.setItem('InsBillingSelectedLabTypeName', this.LabTypeName);
    }
  }


  //sud:16May'21--Moving Invoice Printing as Popup
  public CloseInvoicePrint() {
    this.showbillingReceipt = false;
    this.router.navigate(["/Insurance/Patient"]);
  }

  LoadDefaultDiscountScheme() {
    this.defDiscountSchemeId = null;

    if (this.coreService.AllMembershipTypes && this.coreService.AllMembershipTypes.length > 0) {
      //Change this to IsDefault after that field is implemented in membership tables. .
      let genScheme = this.coreService.AllMembershipTypes.find(m => m.MembershipTypeName == "General");
      if (genScheme) {
        this.defDiscountSchemeId = genScheme.MembershipTypeId;
      }
    }
  }

}
