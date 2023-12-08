import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';

import { VisitService } from '../../appointments/shared/visit.service';
import { PatientService } from '../../patients/shared/patient.service';
import { SecurityService } from '../../security/shared/security.service';
import { CallbackService } from '../../shared/callback.service';
import { RouteFromService } from '../../shared/routefrom.service';
import { BillingService } from '../shared/billing.service';

import { BillingTransactionItem } from "../shared/billing-transaction-item.model";
import { BillingBLService } from '../shared/billing.bl.service';

import * as _ from 'lodash';
import * as moment from 'moment/moment';
import { CurrentVisitContextVM } from '../../appointments/shared/current-visit-context.model';
import { PatientLatestVisitContext_DTO } from '../../appointments/shared/dto/patient-lastvisit-context.dto';
import { MedicareMemberVsMedicareBalanceVM } from '../../appointments/shared/medicare-model';
import { CoreService } from "../../core/shared/core.service";
import { OrdersBLService } from "../../orders/shared/orders.bl.service";
import { MembershipType } from '../../patients/shared/membership-type.model';
import { CreditOrganization } from '../../settings-new/shared/creditOrganization.model';
import { PriceCategory } from '../../settings-new/shared/price.category.model';
import { SettingsBLService } from '../../settings-new/shared/settings.bl.service';
import { ServiceDepartmentVM } from '../../shared/common-masters.model';
import { DanpheHTTPResponse } from "../../shared/common-models";
import { CommonValidators } from '../../shared/common-validator';
import { CommonFunctions } from '../../shared/common.functions';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_BillingStatus, ENUM_BillingType, ENUM_BillPaymentMode, ENUM_CurrentBillingFlow, ENUM_DanpheHTTPResponses, ENUM_DanpheHTTPResponseText, ENUM_InvoiceType, ENUM_LabTypes, ENUM_MembershipTypeName, ENUM_MessageBox_Status, ENUM_OrderStatus, ENUM_PriceCategory, ENUM_ServiceBillingContext, ENUM_ValidatorTypes } from '../../shared/shared-enums';
import { BillingMasterBlService } from '../shared/billing-master.bl.service';
import { BillingTransaction, EmployeeCashTransaction } from '../shared/billing-transaction.model';
import { SchemePriceCategory_DTO } from '../shared/dto/scheme-pricecategory.dto';
import { ServiceItemDetails_DTO } from '../shared/dto/service-item-details.dto';
import { ServiceItemSchemeSetting_DTO } from '../shared/dto/service-item-scheme-setting.dto';
import { PatientBillingContextVM } from '../shared/patient-billing-context-vm';
import { PatientScheme } from '../shared/patient-map-scheme';

@Component({
  templateUrl: "./billing-transaction.html", //"/BillingView/BillingTransaction"
  host: { '(window:keydown)': 'hotkeys($event)' }
})

export class BillingTransactionComponent {

  public model: BillingTransaction = new BillingTransaction();
  public itemList: Array<any> = [];
  public isItemLoaded: boolean = false;
  public disableTextBox: boolean = false;
  //declare boolean loading variable for disable the double click event of button
  public loading: boolean = false;
  public allServiceDepts: Array<ServiceDepartmentVM> = null;
  public creditOrganizationsList: Array<CreditOrganization> = new Array<CreditOrganization>();

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
  public isEHS: boolean = false;
  public showDepositPopUp: boolean = false;
  public showIpBillingWarningBox: boolean = false;
  public searchByItemCode: boolean = true;
  public BillingRequestDisplaySettings: any = null;

  public currBillingContext: PatientBillingContextVM = new PatientBillingContextVM();
  public currPatVisitContext: CurrentVisitContextVM = new CurrentVisitContextVM();
  public currentVisitType: string = "";
  public earlierInvoiceItems: Array<BillingTransactionItem>;
  public isProvisionalBilling: boolean = false;
  public isCopyFromInvoice: boolean = false;
  public insuranceApplicableFlag: boolean = false; //Yubraj 31st May '19
  //sud: 13May'18--to display patient bill summary
  public PriceCategorySelectedToChangePrice: PriceCategory = new PriceCategory();

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
  //public ShowDuplicateItemComfirmation: boolean = false;
  public DuplicateItem: any = { IsDuplicate: false, Item: [] };
  public IsDublicateItem: boolean = false;

  public showPastBillHistory: boolean = true;
  public DiscountApplicable: boolean = true;
  //public MembershipTypeList: Array<MembershipType> = new Array<MembershipType>();

  //public DiscountScheme: any = null;
  public memTypeSchemeId: number = null;
  public currMemDiscountPercent: number = 0;
  public DiscountPercentSchemeValid: boolean = true;

  public discountApplicable: boolean = true;
  public isPriceCatogoryLoaded: boolean = false;
  // public CreditOrganizationMandatory: boolean = false;

  public Invoice_Label: string = "INVOICE";//sud:19Nov'19--we're getting this value from Parameter since different hospital needed it differently.
  public allPriceCategories: Array<any> = []; // Vikas: 27th Dec 2019

  //public LabType: Array<any> = [{ Name: 'OP-Lab', Value: 'op-lab' }, { Name: 'ER-Lab', Value: 'er-lab' }];
  public LabTypeName: string = 'op-lab';
  public bedNo: string = null;
  public wardName: string = null;
  public timerId: any = null;

  public showInvoicePrintPage: boolean = false;//sud:16May'21--to print from same page.
  public hasMultipleLabType: boolean = false;

  //sud:9Sep'21--- renewed implementation to get visit context of a patient..
  public patLastVisitContext: PatientLatestVisitContext_DTO = new PatientLatestVisitContext_DTO();
  public ShowItemLevelDiscount: boolean = false;
  public provReceiptInputs = { PatientId: 0, ProvFiscalYrId: 0, ProvReceiptNo: 0, visitType: null };
  public MstPaymentModes: any = [];
  public empCashTxn: EmployeeCashTransaction = new EmployeeCashTransaction();
  public PaymentPages: any[];
  public IsRemarksMandatory: boolean = false;
  public EnableDiscountAmountField: boolean = false; //Krishna, 27th,March'22 , To enable Discount Amount filed on invoice level as well as item level
  public priceCategory: string = ENUM_PriceCategory.Normal;
  public PriceCategoryId: number = null;
  public selectedCreditOrganization: CreditOrganization;
  public selectedPriceCategoryObj: PriceCategory = new PriceCategory();
  public BilcfgItemsVsPriceCategoryMap: Array<any> = new Array<any>();
  public CurrentPatientPriceCategoryMap: PatientScheme = new PatientScheme();
  public EnableInvoiceLevelDiscountAmountField: boolean = false;

  public IsMedicareMemberEligibleForBilling: boolean = false; //* Krishna, 8th-Jan'23, This variable handles the billing eligibility of Medicare Members only.
  public IsMedicarePatientBilling: boolean = false; //* Krishna, 8th-Jan'23, This variable handles the the medicare Billing.

  public medicareMemberVsBalanceVm = new MedicareMemberVsMedicareBalanceVM(); //* Krishna, 8th-Jan'23
  public SSFMembershipTypeName: string = ENUM_MembershipTypeName.SSF;
  public ECHSMembershipTypeName: string = ENUM_MembershipTypeName.ECHS;
  //sud:19May'21--needed to print invoice.
  public bil_InvoiceNo: number = 0;
  public bil_FiscalYrId: number = 0;
  public bil_BilTxnId: number = null;
  public showItemEditPanel: boolean = false;
  public txnItemToEdit: BillingTransactionItem = null;
  public indexOfEditItem: number = 0;
  public defaultExtRef: boolean = false;
  public selectedRefId: number = null;
  public selectedPrescriberId: number = null;
  public isReferrerLoaded: boolean = false;
  public ExtRefSettings = { EnableExternal: true, DefaultExternal: false };
  public membershipSchemeParam = { ShowCommunity: false, IsMandatory: true };
  public MembershipTypeName: string = null;
  public tempMembershipTypeId: number = null;
  public BillRequestDoubleEntryWarningTimeHrs: number = 0;
  public PastTestList: any = [];
  public PastTestList_ForDuplicate: any = [];
  public TempEmployeeCashTransaction: Array<EmployeeCashTransaction> = new Array<EmployeeCashTransaction>();
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
    public messageBoxService: MessageboxService,
    public ordersBlService: OrdersBLService,
    public coreService: CoreService,
    public settingsBlService: SettingsBLService,
    public visitService: VisitService,
    public billingMasterBlService: BillingMasterBlService
  ) {
    this.currentCounter = this.securityService.getLoggedInCounter().CounterId;
    this.taxPercent = this.billingService.taxPercent;
    this.taxId = this.billingService.taxId;
    this.currentBillingFlow = this.routeFromService.RouteFrom;
    this.routeFromService.RouteFrom = "";
    if (this.currentCounter < 1) {
      this.callbackService.CallbackRoute = '/Billing/SearchPatient';
    }
    else {
      //assign last visitcontext to local variable and use that in the whole page..
      this.patLastVisitContext = this.billingService.PatLastVisitContext;

      this.searchByItemCode = this.coreService.UseItemCodeItemSearch();
      //this.BillingRequestDisplaySettings = this.coreService.GetBillingRequestDisplaySettings();
      this.GetBillingRequestDisplaySettings();

      this.SetInvoiceLabelNameFromParam();
      this.billingType = this.billingService.BillingType;
      this.currentVisitType = this.patientService.getGlobal().LatestVisitType;
      //this.currPatVisitContext.VisitType = this.patientService.getGlobal().LatestVisitType;
      //this.currPatVisitContext.Current_WardBed = this.patientService.getGlobal().WardName;
      this.bedNo = this.patientService.getGlobal().BedCode;
      this.wardName = this.patientService.getGlobal().WardName;
      this.LoadMembershipSettings();

      this.Initialize();
      this.LoadParameterForProvisional();//sud:12Mar'19
      this.LoadPatientPastBillSummary(this.patientService.getGlobal().PatientId);
      //new way: get servicedepts list from core-service-- sud/17Dec'17'
      this.allServiceDepts = this.coreService.Masters.ServiceDepartments;
      this.serviceDeptList = this.allServiceDepts;
      //sud:19June'19--SrvDepts with OPD consultation charge has Integration Name as OPD
      //if nothing is found in integration name then its fine, else check that it's not opd.
      this.serviceDeptList = this.allServiceDepts.filter(a => !a.IntegrationName || a.IntegrationName.toLowerCase() != "opd");
      this.GetPriceCategory();
      //!this.GetBillingItems();
      //this.ShowHidePriceCategories();//sud:27Feb'19--for EHS, Foreigner, etc..

      this.creditOrganizationsList = this.billingService.AllCreditOrganizationsList;//sud:2May'20--Code Optimization..

      this.LoadReferrerSettings();

      // this.CreditOrganizationMandatory = this.coreService.LoadCreditOrganizationMandatory();//pratik: 26feb'20 --Credit Organization compulsoryor not while Payment Mode is credit

      this.BillRequestDoubleEntryWarningTimeHrs = this.coreService.LoadOPBillRequestDoubleEntryWarningTimeHrs();

      if (this.coreService.labTypes.length > 1) {
        this.hasMultipleLabType = true;
      } else {
        this.hasMultipleLabType = false;
        this.LabTypeName = this.coreService.labTypes[0].LabTypeName;
      }
    }
  }

  ngOnInit() {
    this.model.EmployeeCashTransaction = [];
    this.ItemsListFormatter = this.ItemsListFormatter.bind(this);//to use global variable in list formatter auto-complete
    this.SetLabTypeNameInLocalStorage();
    this.MstPaymentModes = this.coreService.masterPaymentModes;
    this.PaymentPages = this.coreService.paymentPages;
  }
  //sud: 20Nov'19--need to get label name from parameter.
  //it'll use: INVOICE if not found.
  public SetInvoiceLabelNameFromParam() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName === "Billing" && a.ParameterName === "BillingInvoiceDisplayLabel");
    if (currParam && currParam.ParameterValue) {
      this.Invoice_Label = currParam.ParameterValue;
    }
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
    this.model.LabTypeName = this.LabTypeName;
    this.model.CounterId = this.currentCounter;
    this.model.PatientId = this.patientService.getGlobal().PatientId;
    //this.memTypeSchemeId = this.patientService.getGlobal().MembershipTypeId;

    //console.log("membershiptype id in billingtxn page:" + this.memTypeSchemeId);

    //createdby will always be employeeid--sudarshan:7may'17
    this.model.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

    if (!this.model.BillingTransactionItems.length)
      this.AddNewBillTxnItemRow();
    if (this.model.IsCopyReceipt || this.isCopyFromInvoice) {
      for (let i = 0; i < this.model.BillingTransactionItems.length; i++) {
        this.model.BillingTransactionItems[i].UpdateValidator("off", "PrescriberId", null);
      }
    }
    //fetching MembershipType of a patient
    //this.memTypeSchemeId = this.patientService.getGlobal().MembershipTypeId;
    this.tempMembershipTypeId = this.memTypeSchemeId; // setting this as a temporary to avoid multiple callbacks with General membershipType

    this.LoadPatientBillingContext();

  }

  NewBillingTransactionItem(): BillingTransactionItem {
    let billTxnItem = new BillingTransactionItem();
    billTxnItem.PatientId = this.patientService.getGlobal().PatientId;
    billTxnItem.VisitType = this.currentVisitType;
    billTxnItem.Quantity = 1;
    billTxnItem.DiscountPercent = this.currMemDiscountPercent;
    //newReq.BillStatus = "unpaid";--commented sud: 4May'18
    ////by default item will be in provisional status
    billTxnItem.BillStatus = ENUM_BillingStatus.provisional;// "provisional";

    //we don't need validation on RequestedBy field, we're adding this value from other part of code..
    billTxnItem.UpdateValidator("off", "PrescriberId", "required");//sud:5Mar'19

    return billTxnItem;
  }

  //in some cases we don't want to showw item dropdown on new item added. so made it conditional.
  AddNewBillTxnItemRow(index = null, showItemDdlOnLoad: boolean = true) {    //method to add the row
    console.log("index=", index);
    if (!this.isPackageBilling) {
      let item = this.NewBillingTransactionItem();
      item.ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName !== "OPD");//sud:13-Oct'19
      if (this.LabTypeName == 'er-lab') {
        item.ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
      }
      this.model.BillingTransactionItems.push(item);
      item.AssignedDoctorList = this.doctorsList;

      if (index != null) {
        //item.RequestedBy = this.model.BillingTransactionItems[index].RequestedBy;
        let new_index = this.model.BillingTransactionItems.length - 1;
        //this.selectedRequestedByDr[new_index] = this.model.BillingTransactionItems[index].RequestedByName;
        this.AssignRequestedByDoctor(new_index);
      }

      if (showItemDdlOnLoad) {
        let new_index;
        if (index == null) {
          new_index = this.model.BillingTransactionItems.length - 1;
          //we need to set a delay of 500ms for first time since items are not yet loaded that time.
          // if (this.BillingRequestDisplaySettings.AssignedToDr) {
          //   this.coreService.FocusInputById('srchbx_Assigned_To_Dr_' + new_index, 500);
          // } else {
          this.coreService.FocusInputById('srchbx_ItemName_' + new_index, 500);
          // }
        }
        else {
          new_index = index + 1
          this.coreService.FocusInputById('srchbx_ItemName_' + new_index);
        }
        //console.log(document.getElementById('srchbx_ItemName_' + new_index));
      }
    }
    this.EnableDicountAmount();
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

    this.CheckForDoubleEntry();
  }

  public SetDoctorsList() {
    //set doctorsList and reqDoctorslist separately so that both has their own copy of the objects.
    if (this.model.BillingTransactionItems && this.model.BillingTransactionItems.length > 0) {
      this.doctorsList = this.billingService.GetDoctorsListForBilling();
      this.reqDoctorsList = this.billingService.GetDoctorsListForBilling();

      let Obj = new Object();
      Obj["EmployeeId"] = null; //change by Yub -- 23rd Aug '18
      Obj["FullName"] = "SELF";
      this.reqDoctorsList.push(Obj);

      this.model.BillingTransactionItems[0].AssignedDoctorList = this.doctorsList;

      //due to asynchronous call consulting doctor was not updated all the time. so moving this get call here.
      this.GetPatientVisitList(this.patientService.getGlobal().PatientId);

      if (this.currentBillingFlow === ENUM_CurrentBillingFlow.Orders || this.currentBillingFlow === ENUM_CurrentBillingFlow.BillReturn) {
        this.AssignLocalTxnFromGlobalTxn();
      }
    }
  }



  public GetPatientVisitList(patientId: number) {
    this.BillingBLService.GetPatientVisitsProviderWise(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          if (res.Results && res.Results.length) {
            this.visitList = res.Results;
            //Default Value for RequestedBy: Assign provider from latest visit
            if (this.model.BillingTransactionItems.length) {

              this.selectedPrescriberId = this.visitList[0].PerformerName == "Duty Doctor" ? 0 : this.visitList[0].PerformerId;
              this.selectedRefId = this.visitList[0].PerformerName == "Duty Doctor" ? 0 : this.visitList[0].ReferredById;

              this.AssignRequestedByDoctor(0);
            }
            //sud:9Sep'21---Check if below is needed or not..
            //we may need to refactor this whole page soon..
            this.GetVisitContext(patientId, this.patLastVisitContext.PatientVisitId);
          }
        }
        else {
          console.log(res.ErrorMessage);
        }

        this.isReferrerLoaded = true;
      },
        err => {
          this.messageBoxService.showMessage('Failed', ["unable to get PatientVisit list.. check log for more details."]);
          console.log(err.ErrorMessage);

        });
  }

  GetPriceCategory() {
    let priceCategory = this.coreService.Masters.PriceCategories;
    this.allPriceCategories = priceCategory.filter(a => a.IsActive == true);
  }
  public GetBillingItems() {
    let allBillItms = this.billingService.allBillItemsPriceList;
    this.CallBackGetBillingItems(allBillItms);
    this.SetDoctorsList();
    this.FilterBillItems(0);

  }


  public CallBackGetBillingItems(result) {
    this.GetPatientVisitList(this.patientService.getGlobal().PatientId);
    this.itemList = result;
    let defCategory = this.allPriceCategories.find(a => a.IsDefault == true);
    if (defCategory != null) {
      let defaultCat = defCategory["BillingColumnName"];//PriceCategory table stores the columnname of billing where to take the specific data from..
      if (this.itemList != null && this.itemList.length > 0) {
        this.itemList.forEach(itm => {
          itm.Price = itm[defaultCat] ? itm[defaultCat] : 0;
        });
      }
    }
    this.isItemLoaded = true;
    this.FilterBillItems(0);
  }



  public CopyFromEarlierInvoice() {
    this.currentBillingFlow = ENUM_CurrentBillingFlow.BillReturn;
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
        //sud:9Sep'21---Check if below is needed or not..
        this.currBillingContext.PatientVisitId = this.patLastVisitContext.PatientVisitId;
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
        let assignedToDr = this.doctorsList.find(d => d.EmployeeId == billItem.PerformerId);
        if (assignedToDr)
          this.selectedAssignedToDr[i] = assignedToDr.FullName;

        billItem.PrescriberId = billItem.PrescriberId ? billItem.PrescriberId : 0;
        billItem.VisitType = this.currentVisitType;
        this.selectedItems[i] = billItem.ItemName;
        billItem.UpdateValidator("off", "PrescriberId", null);
        this.FilterBillItems(i);
        this.AssignSelectedItem(i);
        this.AssignSelectedDoctor(i);
        this.AssignRequestedByDoctor(i);
      }
    }
  }


  CheckItemProviderValidation(index: number) {
    let currItm = this.model.BillingTransactionItems[index];
    if (!this.isEHS) {

      if (!this.BillingRequestDisplaySettings.AssignedToDr) {
        currItm.UpdateValidator("off", "PerformerId", null);
      }

    }

    // if(this.isEHS){
    //   currItm.UpdateValidator("on","PerformerId","required");
    // }

    //sud:18Feb'20-- using common pattern for creating/removing validators.
    CommonValidators.ComposeValidators(currItm.BillingTransactionItemValidator, "Quantity", [ENUM_ValidatorTypes.required, ENUM_ValidatorTypes.positiveNumber]);
  }

  // CheckForDuplication(): boolean {
  //   //Check for duplicate items in the ItemList ordered
  //   this.DuplicateItem = { IsDuplicate: false, Item: [] };

  //   const map = new Map();
  //   for (const item of this.model.BillingTransactionItems) {
  //     var itemIdsDetail = item.ItemId + '-' + item.ServiceDepartmentId;
  //     if (map.has(itemIdsDetail)) {
  //       let itemDetail = { ItemName: null, Quantity: null, Price: null, RepeatedTimes: null, ItemId: null, ServiceDepartmentId: null };

  //       itemDetail.ItemName = item.ItemName;
  //       itemDetail.Price = item.Price;
  //       itemDetail.Quantity = item.Quantity;
  //       itemDetail.ItemId = item.ItemId;
  //       itemDetail.ServiceDepartmentId = item.ServiceDepartmentId;

  //       var dup = this.DuplicateItem.Item.find(itm => itm.ItemName == itemDetail.ItemName);
  //       if (dup) {
  //         ++this.DuplicateItem.Item.find(itm => itm.ItemName == itemDetail.ItemName).RepeatedTimes;
  //       } else {
  //         itemDetail.RepeatedTimes = 2;
  //         this.DuplicateItem.Item.push(itemDetail);
  //       }
  //       this.DuplicateItem.IsDuplicate = true;
  //     } else {
  //       map.set(itemIdsDetail, true);    // set any value to Map
  //     }
  //   }
  //   return true;
  // }

  //abhishek/sud:14July'19-- remove empty rows while submitting the invoice.
  DeleteEmptyRows() {
    //to delete row having no item name - Don't delete if there's only one Empty row left.
    this.model.BillingTransactionItems.forEach(txnItm => {
      //check for the length of BillingTransactionItem everytime..
      if (!txnItm.ItemName && this.model.BillingTransactionItems.length > 1) {
        this.model.BillingTransactionItems.splice(this.model.BillingTransactionItems.indexOf(txnItm), 1);
      }
    });
    this.model.TotalQuantity = this.model.BillingTransactionItems.length; //Krishna,25th,July'22 ,Adding TotalQuantity for BIL_TXN_BillingTransaction table,

  }

  PostProvisionalBilling() {
    this.DeleteEmptyRows();
    if (this.model.BillingTransactionItems) {
      this.model.BillingTransactionItems.forEach(txnItm => {
        txnItm.BillStatus = ENUM_BillingStatus.provisional;// "provisional";
        txnItm.PaidDate = null;
        txnItm.Remarks = this.model.Remarks; //narayan: since billing txn is not posted in database, we put remark in billtxnitm. 11-13-19
      });
    }

    //Checking from parameter, allow/restrict Additional Discount for Provisional bills
    if ((!this.param_allowAdditionalDiscOnProvisional) && this.model.DiscountPercent && this.model.DiscountPercent > 0) {
      this.messageBoxService.showMessage("failed", ["Additional Discount is not applicable for Provisional Bills"]);
      this.loading = false;
      return;
    }

    //this can move to common validation function
    if (this.model.DiscountPercent < 0 || this.model.DiscountPercent > 100) {
      this.messageBoxService.showMessage("failed", ["DiscountAmount cannot be more than SubTotal."]);
      this.loading = false;
      return;
    }

    this.SetLabTypeName();
    this.isProvisionalBilling = true;
    this.CheckAndSubmitBillingTransaction();//find a way to avoid confusions..

  }


  PostInvoice() {
    this.DeleteEmptyRows();
    this.OnPaymentModeChange();
    this.isProvisionalBilling = false;

    //check tender amount is >= total amount not application if payment mode is credit
    // if (!this.deductDeposit && this.model.Tender < this.model.TotalAmount && this.model.PaymentMode != "credit") {
    //   this.msgBoxServ.showMessage("failed", ["Tender  must be greater or equal to Paid Amount"]);
    //   this.loading = false;
    //   return;
    // }
    if (!this.deductDeposit && (this.model.PaymentMode.toLowerCase() != ENUM_BillPaymentMode.credit.toLowerCase() && this.model.Tender < this.model.ReceivedAmount) && (this.model.PaymentMode != "credit" || this.model.CoPayment_PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit.toLowerCase())) {
      this.messageBoxService.showMessage("failed", ["Tender  must be greater or equal to Paid Amount"]);
      this.loading = false;
      return;
    }

    //this can move to common validation function
    if (this.model.DiscountPercent < 0 || this.model.DiscountPercent > 100) {
      this.messageBoxService.showMessage("failed", ["DiscountAmount cannot be more than SubTotal."]);
      this.loading = false;
      return;
    }

    //If discount is applied for Final Bill (not provisional) then remarks is mandatory
    if (this.model.DiscountAmount && this.model.DiscountAmount > 0 && !this.model.Remarks) {
      this.messageBoxService.showMessage("failed", ["Remarks is mandatory for Discounts."]);
      this.loading = false;
      return;
    }

    this.SetLabTypeName();
    //sud:9Sep'21---to set PatientVisitId in the billing..
    this.SetVisitContextBeforeBillSubmit();

    this.CheckAndSubmitBillingTransaction();

  }


  SetLabTypeName() {
    this.model.BillingTransactionItems.forEach(a => {
      //Asigning DiscountSchemeID while post...memTypeSchemaId
      a.DiscountSchemeId = this.memTypeSchemeId;// this.DiscountScheme.MembershipTypeId != null ? this.DiscountScheme.MembershipTypeId : this.memTypeSchemeId

      //Asigning LabTypeName while posting lab items
      let integrationName = this.coreService.GetServiceIntegrationName(a.ServiceDepartmentName);
      a.SrvDeptIntegrationName = integrationName;
      if (integrationName) {
        if (integrationName.toLowerCase() == "lab") {
          a.LabTypeName = this.LabTypeName;
          a.OrderStatus = ENUM_OrderStatus.Active;
        }
        else if (integrationName.toLowerCase() == 'radiology') {
          a.LabTypeName = null;
          a.OrderStatus = ENUM_OrderStatus.Active;
        } else {
          a.LabTypeName = null;
        }
      } else {
        a.LabTypeName = null;
      }

    });
  }


  CheckAndSubmitBillingTransaction() {

    if (this.CheckSelectionFromAutoComplete() && this.CheckBillingValidations()) {

      this.SubmitBillingTransaction();
    }
    else {
      this.loading = false;
    }
  }

  SubmitBillingTransaction() {
    if (this.model.PaymentMode.toLocaleLowerCase() != ENUM_BillPaymentMode.credit.toLocaleLowerCase()) {
      this.model.PaymentMode = ENUM_BillPaymentMode.cash;//"cash";
    }
    else {
      this.model.PaymentMode = ENUM_BillPaymentMode.credit;//"credit";
    }
    if (this.model.BillingTransactionItems.some(a => a.SrvDeptIntegrationName != "LAB")) {
      this.model.LabTypeName = null;
    }

    if (this.selectedPriceCategoryObj.IsCoPayment && this.model.CoPayment_PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit.toLowerCase()) {
      this.model.PaymentMode = this.model.CoPayment_PaymentMode; //credit
    }

    if (this.loading) {
      this.AssignBillTxnItemsValuesForSubmit();
      this.BillingTransactions(this.model.BillingTransactionItems);
    }
  }

  CheckBillingValidations(): boolean {
    let isFormValid = true;
    for (let j = 0; j < this.model.BillingTransactionItems.length; j++) {
      var itm = this.itemList.find(b => this.model.BillingTransactionItems[j].ItemId == b.ItemId && this.model.BillingTransactionItems[j].ServiceDepartmentId == b.ServiceDepartmentId);
      if (itm) {
        this.model.BillingTransactionItems[j].IsZeroPriceAllowed = itm.IsZeroPriceAllowed;
        if (itm.IsZeroPriceAllowed) {
          this.model.BillingTransactionItems[j].UpdateValidator("off", "Price", "positiveNumberValdiator");
        }
      }
      if (!this.model.BillingTransactionItems[j] || this.model.BillingTransactionItems[j].Price == null || this.model.BillingTransactionItems[j].Price < 0 || (this.model.BillingTransactionItems[j].Price == 0 && !this.model.BillingTransactionItems[j].IsZeroPriceAllowed)) {
        this.messageBoxService.showMessage("error", ["Price of Some items are invalid.!"]);
        this.loading = false;
        isFormValid = false;
        break;
      }
      if (!this.model.BillingTransactionItems[j] || (this.model.BillingTransactionItems[j].Quantity <= 0)) {
        this.messageBoxService.showMessage("error", ["Quantity of Some items are invalid.!"]);
        this.loading = false;
        isFormValid = false;
        break;
      }
      if (this.model.BillingTransactionItems) {
        for (let i = 0; i < this.model.BillingTransactionItems.length; i++) {
          let currTxnItm = this.model.BillingTransactionItems[i];

          for (let valCtrls in currTxnItm.BillingTransactionItemValidator.controls) {
            currTxnItm.BillingTransactionItemValidator.controls[valCtrls].markAsDirty();
            currTxnItm.BillingTransactionItemValidator.controls[valCtrls].updateValueAndValidity();
          }
        }
        for (let i = 0; i < this.model.BillingTransactionItems.length; i++) {
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

    if (!this.DiscountPercentSchemeValid) {
      isFormValid = false;
      this.messageBoxService.showMessage(ENUM_DanpheHTTPResponseText.Failed, ["Discount scheme is mandatory. Default is: General(0%)"]);
    }


    if (this.model.PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit.toLowerCase() || (this.selectedPriceCategoryObj.IsCoPayment && this.model.CoPayment_PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit.toLowerCase())) {
      if (!this.model.OrganizationId || this.model.OrganizationId == 0) {
        isFormValid = false;
        this.messageBoxService.showMessage(ENUM_DanpheHTTPResponseText.Failed, ["Credit Organization is mandatory for credit bill"]);
      }
    }
    if (this.IsRemarksMandatory && !this.model.Remarks) {
      isFormValid = false;
      this.messageBoxService.showMessage(ENUM_DanpheHTTPResponseText.Failed, ["Remarks is mandatory for this payment mode"]);
    }

    if (this.model.BillingTransactionItems.some(a => a.DiscountAmount > a.SubTotal)) {
      isFormValid = false;
      this.messageBoxService.showMessage(ENUM_DanpheHTTPResponseText.Failed, ["Item Level Discount is not valid."]);
    }

    if (this.IsMedicarePatientBilling && !this.CheckMedicarePatientBillingValidations()) {
      isFormValid = false;
      this.messageBoxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ["Credit Amount cannot exceed Credit limit."]);
    }
    //Below logic throws warning Message if CreditAmount exceeds more than the OP Credit limit.
    const OPCreditLimit = this.CurrentPatientPriceCategoryMap ? this.CurrentPatientPriceCategoryMap.OpCreditLimit : 0;
    if (!this.IsMedicarePatientBilling && this.selectedPriceCategoryObj.IsCoPayment && OPCreditLimit !== -1 && this.model.CoPaymentCreditAmount > OPCreditLimit) {
      isFormValid = false;
      this.messageBoxService.showMessage("Warning", ["Credit Amount cannot exceed OP Credit limit."]);
    }

    if (!this.checkValidationForReceivedAmount()) {
      isFormValid = false;
    }
    if (this.isClaimSuccessful) {
      isFormValid = false;
      this.messageBoxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ["This Visit context is claimed, create a new visit"]);

    }
    return isFormValid;
  }

  AssignBillTxnItemsValuesForSubmit() {
    for (var j = 0; j < this.model.BillingTransactionItems.length; j++) {
      this.model.BillingTransactionItems[j].CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
      this.model.BillingTransactionItems[j].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.model.BillingTransactionItems[j].PatientVisitId = this.patLastVisitContext.PatientVisitId;


      this.model.BillingTransactionItems[j].CounterId = this.securityService.getLoggedInCounter().CounterId;
      //Move counterday to server once CounterFeature is added change--sudarshan:25July
      this.model.BillingTransactionItems[j].CounterDay = moment().format("YYYY-MM-DD");

      //ashim: 24Sep2018 : assign Duty Doctor as default doctor if doctor is not selected in case of emergency registration
      if (this.model.BillingTransactionItems[j].ItemName == "EMERGENCY REGISTRATION" && this.model.BillingTransactionItems[j].PerformerId == null) {
        let doc = this.doctorsList.find(d => d.FirstName == "Duty" && d.LastName == "Doctor");
        if (doc) {
          this.model.BillingTransactionItems[j].PerformerId = doc.EmployeeId;
          this.model.BillingTransactionItems[j].PerformerName = doc.FirstName + " " + doc.LastName;
        }
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
    this.model.DepositReturnAmount = 0;
    this.model.PatientVisitId = this.patLastVisitContext.PatientVisitId;
    this.model.TransactionType = this.billingType;
    this.model.ClaimCode = this.CurrentPatientPriceCategoryMap ? this.CurrentPatientPriceCategoryMap.LatestClaimCode : null; // Assigning ClaimCode to the invoice if ClaimCode available in PatientPriceCategoryMapping, Krishna, 14thSept'22
    this.model.PatientMapPriceCategoryId = this.CurrentPatientPriceCategoryMap ? this.CurrentPatientPriceCategoryMap.PatientSchemeId : null;
    this.OnPaymentModeChange();
  }




  //posts to Departments Requisition Table
  BillingTransactions(billTxnItems: Array<BillingTransactionItem>, emergencyItem = null) {
    if (this.isProvisionalBilling == true) {
      this.BillingBLService.ProceedToBillingTransaction(this.model, billTxnItems, "active", "provisional", this.insuranceApplicableFlag, this.currPatVisitContext).subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          let result = res.Results;
          this.provReceiptInputs.PatientId = this.model.PatientId;
          this.provReceiptInputs.ProvFiscalYrId = result[0].ProvisionalFiscalYearId;
          this.provReceiptInputs.ProvReceiptNo = result[0].ProvisionalReceiptNo;
          this.provReceiptInputs.visitType = result[0].VisitType;//sending null from here for now.. Check this later..

          this.showInvoicePrintPage = true;
        }
        else {
          this.messageBoxService.showMessage("failed", ["Unable to complete transaction."]);
          console.log(res.ErrorMessage)
          this.loading = false;
        }
      });
    } else {
      this.AssignValuesToBillTxn();
      if (this.model.BillingTransactionItems.some(a => a.SrvDeptIntegrationName == "LAB")) {
        this.model.LabTypeName = this.LabTypeName;
      }
      //invoice type could be different depending on the current tranactiontype (eg: op-normal or ip-partial)
      if (this.model.TransactionType == "inpatient") {
        this.model.InvoiceType = ENUM_InvoiceType.inpatientPartial;
      }
      else {
        this.model.InvoiceType = ENUM_InvoiceType.outpatient;
      }
      this.BillingBLService.ProceedToBillingTransaction(this.model, billTxnItems, "active", "provisional", this.insuranceApplicableFlag, this.currPatVisitContext).subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.bil_FiscalYrId = res.Results.FiscalYearId;
          this.bil_BilTxnId = res.Results.BillingTransactionId;
          this.bil_InvoiceNo = res.Results.InvoiceNo;
          this.showInvoicePrintPage = true;

        }
        else {
          if (res.ErrorMessage.match(/Invalid Deposit Amount/g)) {
            this.messageBoxService.showMessage("failed", [res.ErrorMessage.substring(0, 35)]);
            this.router.navigate(['/Billing/SearchPatient']);
          }
          else
            this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
          this.loading = false;
        }
      });
    }
  }

  //posts to BillingTransactionItems table
  // PostBilling(billTxnItems: Array<BillingTransactionItem>) {
  //   //added: ashim: 20Aug2018
  //   if (this.isProvisionalBilling)
  //     this.PostBillingTransactionItems(billTxnItems);
  //   else {
  //     this.PostBillingTransaction(billTxnItems);
  //   }
  // }

  //posts to BillingTransactionItems table
  // PostBillingTransaction(billTxnItems: Array<BillingTransactionItem>) {
  //   //added: ashim: 20Aug2018
  //   this.model.BillingTransactionItems = new Array<BillingTransactionItem>();
  //   for (let i = 0; i < billTxnItems.length; i++) {
  //     this.model.BillingTransactionItems.push(new BillingTransactionItem());
  //     this.model.BillingTransactionItems[i] = Object.assign(this.model.BillingTransactionItems[i], billTxnItems[i]);
  //   }
  //   this.AssignValuesToBillTxn();


  //   if (this.model.BillingTransactionItems.some(a => a.SrvDeptIntegrationName == "LAB")) {
  //     this.model.LabTypeName = this.LabTypeName;
  //   }
  //   //invoice type could be different depending on the current tranactiontype (eg: op-normal or ip-partial)
  //   if (this.model.TransactionType == "inpatient") {
  //     this.model.InvoiceType = ENUM_InvoiceType.inpatientPartial;
  //   }
  //   else {
  //     this.model.InvoiceType = ENUM_InvoiceType.outpatient;
  //   }

  //   this.BillingBLService.PostBillingTransaction(this.model)
  //     .subscribe(
  //       res => {
  //         if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
  //           console.log(this.model);
  //           ////this.loading = false;//we redirect to some other page on both InvoicePrintedCase or ESC/Close case, so no need to enable the print button for this invoice again.
  //           this.bil_FiscalYrId = res.Results.FiscalYearId;
  //           this.bil_BilTxnId = res.Results.BillingTransactionId;
  //           this.bil_InvoiceNo = res.Results.InvoiceNo;
  //           this.showInvoicePrintPage = true;//sud:16May'21--to print invoice from same page.
  //         }
  //         else {
  //           if (res.ErrorMessage.match(/Unique constraint error/g)) {
  //             this.msgBoxServ.showMessage("Notice", ["Something went wrong, Please submit again."]);
  //           } else {
  //             this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
  //           }
  //           //this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
  //           this.loading = false;
  //         }
  //       });
  // }





  // PostBillingTransactionItems(billTxnItems: Array<BillingTransactionItem>) {
  //   this.BillingBLService.PostBillingTransactionItems(billTxnItems)
  //     .subscribe(
  //       res => {
  //         if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
  //           let result = res.Results;
  //           this.provReceiptInputs.PatientId = this.model.PatientId;
  //           this.provReceiptInputs.ProvFiscalYrId = result[0].ProvisionalFiscalYearId;
  //           this.provReceiptInputs.ProvReceiptNo = result[0].ProvisionalReceiptNo;
  //           this.provReceiptInputs.visitType = null;//sending null from here for now.. Check this later..

  //           this.showInvoicePrintPage = true;
  //         }
  //         else {
  //           this.msgBoxServ.showMessage("failed", ["Unable to complete transaction."]);
  //           console.log(res.ErrorMessage)
  //           this.loading = false;
  //         }
  //       });
  // }



  GetServiceDeptNameById(servDeptId: number): string {
    if (this.allServiceDepts)
      return this.allServiceDepts.filter(a => a.ServiceDepartmentId == servDeptId)[0].ServiceDepartmentName;
  }

  public FilterBillItems(index) {
    //ramavtar:13may18: at start if no default service department is set .. we need to skip the filtering of item list.
    if (this.model.BillingTransactionItems[index]) {
      if (this.model.BillingTransactionItems[index].ServiceDepartmentId) {
        if (this.model.BillingTransactionItems.length && this.isItemLoaded) {
          let srvDeptId = this.model.BillingTransactionItems[index].ServiceDepartmentId;
          //initalAssign: FilterBillItems was called after assinging all the values(used in ngModelChange in SelectDepartment)
          // and was assigning ItemId=null.So avoiding assignment null value to ItemId during inital assign.
          if (this.model.BillingTransactionItems[index].ItemId == null)
            this.ClearSelectedItem(index);

          this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.ServiceDepartmentId == srvDeptId);
          if (this.LabTypeName == 'er-lab') {
            this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
          }

          // checking directly from list of database yubraj-- 8th Oct 2018
          if (this.selectedItems[index] && this.selectedItems[index].IsDoctorMandatory) {
            this.model.BillingTransactionItems[index].UpdateValidator("on", "PerformerId", "required");
          }
          else {
            this.model.BillingTransactionItems[index].UpdateValidator("off", "PerformerId", null);
          }
        }
      }
      else {
        //create a new array (using filter) and assign to bill items.
        // comparison with same id will always give true, hence all items will be returned.
        //let billItems = this.itemList.slice();//.filter(a => a.ServiceDepartmentId == a.ServiceDepartmentId);;
        let billItems = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD");
        this.model.BillingTransactionItems[index].ItemList = billItems;
        if (this.LabTypeName == 'er-lab') {
          this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
        }
      }
    }
  }

  ShowPackage() {
    this.showSelectPage = false;
    this.changeDetectorRef.detectChanges();
    this.showSelectPage = true;
  }

  ShowCopyFromEarlierInvoice() {
    this.patientId = null;
    this.showTxnCopySelPage = false;
    this.changeDetectorRef.detectChanges();
    this.patientId = this.patientService.getGlobal().PatientId;
    this.showTxnCopySelPage = true;
  }

  enableInvoiceLevelDiscountAmountFieldCharakOnly() {
    this.EnableDiscountAmountField = true;
    this.EnableInvoiceLevelDiscountAmountField = true;
    this.ShowItemLevelDiscount = true;
  }

  SelectFromPackage($event) {
    let items = $event.pkg.BillingItemsXML.Items;
    //! below method is to enable invoice level Discount Amount for Charak Specific Only.
    this.enableInvoiceLevelDiscountAmountFieldCharakOnly();
    /*Checking whether any items in the package items list are inactive or their service department is inactive */ // Krishna, 2ndMay'22
    for (let i = 0; i < items.length; i++) {
      let item = this.itemList.find(a => a.ItemId == items[i].ItemId && a.ServiceDepartmentId == items[i].ServiceDeptId);
      if (!item || item == undefined) {
        this.showSelectPage = false;
        this.messageBoxService.showMessage("failed", ["Unable to assign item from package."]);
        return;
      }
    }
    /*End*/
    this.currentBillingFlow = ENUM_CurrentBillingFlow.PackageBilling;//needed this so that it'll reset ReturnFlow of billing which was causing issue.
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
    //var items = $event.pkg.BillingItemsXML.Items;

    //sud: 10sept'18-- for

    this.ActivePackageInfo.BillingPackageId = $event.pkg.BillingPackageId;
    this.ActivePackageInfo.BillingPackageName = $event.pkg.BillingPackageName;
    this.isPackageBilling = true;//need to set this to false somewhere..

    this.LabTypeName = $event.pkg.LabTypeName;
    //ashim: 10Sep2018
    this.model.PackageId = this.ActivePackageInfo.BillingPackageId;
    this.model.PackageName = this.ActivePackageInfo.BillingPackageName;
    this.model.Remarks = this.ActivePackageInfo.BillingPackageName;
    //this.model.DiscountPercent = CommonFunctions.parseAmount($event.pkg.DiscountPercent, 3);
    this.model.DiscountPercent = $event.pkg.DiscountPercent;

    for (let i = 0; i < items.length; i++) {
      let item = this.itemList.find(a => a.ItemId == items[i].ItemId && a.ServiceDepartmentId == items[i].ServiceDeptId);
      console.log(item);
      if (item) {
        let billItem = this.NewBillingTransactionItem();
        this.model.BillingTransactionItems.push(billItem);
        this.model.BillingTransactionItems[i].ItemId = items[i].ItemId;
        this.model.BillingTransactionItems[i].ItemName = item.ItemName;
        // this.model.BillingTransactionItems[i].DiscountPercent = $event.pkg.DiscountPercent;
        this.selectedItems[i] = item;
        this.model.BillingTransactionItems[i].ServiceDepartmentId = items[i].ServiceDeptId;
        this.model.BillingTransactionItems[i].ServiceDepartmentName = this.GetServiceDeptNameById(items[i].ServiceDeptId);
        this.selectedServDepts[i] = this.model.BillingTransactionItems[i].ServiceDepartmentName;
        this.model.BillingTransactionItems[i].Quantity = items[i].Quantity;
        this.model.BillingTransactionItems[i].IsTaxApplicable = items[i].TaxApplicable;//added: sud: 29May'18--chcek for the field name.
        this.model.BillingTransactionItems[i].BillingPackageId = $event.pkg.BillingPackageId;

        this.model.BillingTransactionItems[i].SubTotal = item.Price;
        if (items[i].IsItemLevelDiscount) {
          this.model.BillingTransactionItems[i].DiscountPercent = +items[i].DiscountPercent;
          this.model.BillingTransactionItems[i].DiscountAmount = (this.model.BillingTransactionItems[i].DiscountPercent * this.model.BillingTransactionItems[i].SubTotal) / 100;

        } else {
          this.model.BillingTransactionItems[i].DiscountPercent = this.model.DiscountPercent;
          this.model.BillingTransactionItems[i].DiscountAmount = (this.model.DiscountPercent * this.model.BillingTransactionItems[i].SubTotal) / 100;

        }
        this.model.BillingTransactionItems[i].TotalAmount = this.model.BillingTransactionItems[i].SubTotal - this.model.BillingTransactionItems[i].DiscountAmount;

        //sud:1oct'19--we've to put conditional validator for OPD items.
        if (this.model.BillingTransactionItems[i].ServiceDepartmentName == "OPD") {
          let doctor = this.doctorsList.find(a => a.EmployeeId == this.model.BillingTransactionItems[i].ItemId);
          //if doctor is found, then disable the PerformerId control, so that user can't change it from AssignedToDr. autocomplete.
          if (doctor) {
            this.selectedAssignedToDr[i] = doctor;
            this.AssignSelectedDoctor(i);
            this.model.BillingTransactionItems[i].EnableControl("PerformerId", false);
          }
          else {
            //if doctor is not found, then we've to disable using attr.disabled.
            //since If we disable PerformerId then the validation won't work.
            this.model.BillingTransactionItems[i].DisableAssignedDrField = true;
          }
        }
        else {

          this.model.BillingTransactionItems[i].EnableControl("ItemName", false);
        }
        let doc = this.doctorsList.find(a => a.EmployeeId == items[i].EmployeeId)
        if (doc) {
          this.selectedAssignedToDr[i] = doc;
          this.AssignSelectedDoctor(i);
        }
        this.model.BillingTransactionItems[i].EnableControl("PrescriberId", false);
        this.model.BillingTransactionItems[i].EnableControl("Quantity", false);
        this.model.BillingTransactionItems[i].EnableControl("ServiceDepartmentId", false);
        this.model.BillingTransactionItems[i].EnableControl("Price", false);
        this.model.BillingTransactionItems[i].EnableControl("DiscountPercent", false);
        this.model.BillingTransactionItems[i].EnableControl("DiscountAmount", false);
        this.model.BillingTransactionItems[i].EnableControl("TotalAmount", false);
        this.FilterBillItems(i);
        this.AssignSelectedItem(i);
        //ashim: 10Sep2018 : By default RequestBy for package will be self.
        let visit = this.visitList.find(a => a.PerformerName && a.PerformerName.toLowerCase() == "self")
        if (visit) {
          //this.selectedRequestedByDr[i] = visit.PerformerName;
          this.AssignRequestedByDoctor(i);
        }

      }
      else {
        this.messageBoxService.showMessage("failed", ["Unable to assign item from package."]);
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

          let matchedItem = this.BilcfgItemsVsPriceCategoryMap.find(a => a.ServiceDepartmentId === item.ServiceDepartmentId && a.ItemId === item.ItemId);
          if (matchedItem) {
            if (matchedItem.DiscountApplicable) {
              this.model.BillingTransactionItems[index].DiscountPercent = matchedItem.Discount;
              this.model.BillingTransactionItems[index].EnableControl("DiscountPercent", false);
            }
          } else {
            this.model.BillingTransactionItems[index].DiscountPercent = this.currMemDiscountPercent;
          }
          //Yubraj 29th July -- Disable discount TextBox in case of DiscableApplicable is false
          this.DiscountApplicable = item.DiscountApplicable;
          if (!this.DiscountApplicable) {
            this.model.BillingTransactionItems[index].EnableControl("DiscountPercent", false); //disable Discount TextBox
          }

          //Check for allowing duplicate inserting or not from the Parameterized value.
          //let paramDupItm = this.coreService.AllowDuplicateItem();
          // if (!paramDupItm) {
          if (extItem && index != extItemIndex) {

            //sud:15Apr'21--Removing the warning, it's coming multiple times. We're anyway showing this as error if DuplicateItems are restricted from Parameter.
            //this.msgBoxServ.showMessage("warning", [item.ItemName + " is already entered."]);
            this.changeDetectorRef.detectChanges();
            this.model.BillingTransactionItems[index].IsDuplicateItem = true;
          }
          else {
            this.model.BillingTransactionItems[index].IsDuplicateItem = false;
          }
          //}
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
        this.model.BillingTransactionItems[index].IsDoctorMandatory = item.IsDoctorMandatory;

        this.model.BillingTransactionItems[index].AllowMultipleQty = item.AllowMultipleQty;
        //this.model.BillingTransactionItems[index].TaxableAmount = item.TaxApplicable ? item.Price : 0;
        this.model.BillingTransactionItems[index].Price = item.Price;
        if (!this.DiscountApplicable) {
          this.model.BillingTransactionItems[index].DiscountPercent = 0;
        }
        this.model.BillingTransactionItems[index].IsCoPayment = item.IsCoPayment;
        this.model.BillingTransactionItems[index].CoPaymentCashPercent = item.CoPaymentCashPercent;
        this.model.BillingTransactionItems[index].CoPaymentCreditPercent = item.CoPaymentCreditPercent;
        // else {
        //    if(this.model.BillingTransactionItems[index].AllowMultipleQty)
        //   this.model.BillingTransactionItems[index].DiscountPercent = this.model.DiscountPercent;
        // }
        this.model.BillingTransactionItems[index].DiscountSchemeId = this.memTypeSchemeId;
        this.model.BillingTransactionItems[index].PriceCategory = this.priceCategory;//Sud:25Feb'19--For EHS, Foreigner etc..
        this.model.BillingTransactionItems[index].ProcedureCode = item.ProcedureCode;
        this.model.BillingTransactionItems[index].IsZeroPriceAllowed = item.IsZeroPriceAllowed;
        //add also the servicedepartmentname property of the item; needed since most of the filtering happens on this value

        //this.model.BillingTransactionItems[index].ServiceDepartmentName = this.GetServiceDeptNameById(item.ServiceDepartmentId);
        this.model.BillingTransactionItems[index].ServiceDepartmentName = item.ServiceDepartmentName;
        this.model.BillingTransactionItems[index].ServiceDepartmentId = item.ServiceDepartmentId;
        this.AssignRequestedByDoctor(index);
        this.selectedServDepts[index] = this.model.BillingTransactionItems[index].ServiceDepartmentName;
        this.model.BillingTransactionItems[index].IsValidSelDepartment = true;
        this.model.BillingTransactionItems[index].IsValidSelItemName = true;
        if (!item.IsZeroPriceAllowed && item.Price <= 0) {
          this.model.BillingTransactionItems[index].IsPriceValid = false;
        }
        else {
          this.model.BillingTransactionItems[index].IsPriceValid = true;
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

        if (!this.selectedAssignedToDr[index]) {
          this.ResetDoctorListOnItemChange(item, index);//sundeep: to reset assigned doctor array.
        }

      }
      else {
        if (this.currentBillingFlow !== ENUM_CurrentBillingFlow.Orders)
          this.model.BillingTransactionItems[index].IsValidSelItemName = false;
      }

      if (!item && !this.selectedServDepts[index]) {
        this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD");
        if (this.LabTypeName == 'er-lab') {
          this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
        }
      }
      this.CheckForDoubleEntry();
      if (item) {
        // this.model.BillingTransactionItems[index].BillingTransactionItemValidator.controls['Price'].enable();
        if (item.IsPriceChangeAllowed && item.IsZeroPriceAllowed) {
          this.model.BillingTransactionItems[index].BillingTransactionItemValidator.controls['Price'].enable();
        }
        else if (item.IsPriceChangeAllowed && !item.IsZeroPriceAllowed) {
          this.model.BillingTransactionItems[index].BillingTransactionItemValidator.controls['Price'].enable();
        }
        else if (!item.IsPriceChangeAllowed && item.IsZeroPriceAllowed) {
          this.model.BillingTransactionItems[index].BillingTransactionItemValidator.controls['Price'].disable();
        }
        else if (item.IsPriceChangeAllowed) {
          this.model.BillingTransactionItems[index].BillingTransactionItemValidator.controls['Price'].enable();
        }
        else if (!item.IsPriceChangeAllowed && !item.IsZeroPriceAllowed) {
          this.model.BillingTransactionItems[index].BillingTransactionItemValidator.controls['Price'].disable();
        }
      }
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
      this.model.BillingTransactionItems[index].BillingTransactionItemValidator.controls['Price'].disable();
      this.model.BillingTransactionItems[index].PriceCategory = "";
      this.model.BillingTransactionItems[index].ProcedureCode = "";

      this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName !== "OPD");
      if (this.LabTypeName.toLowerCase() === ENUM_LabTypes.ErLab.toLowerCase()) {
        this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName !== "OPD" && (a.IsErLabApplicable === true || a.SrvDeptIntegrationName !== 'LAB'));
      }

      //* This is done here because This method is executed once when ServiceDepartment is selected, hence in order to maintain the filter of items as per ServiceDepartment, this is needed here, Krishna, 19thOct'22
      if (this.model.BillingTransactionItems[index].ServiceDepartmentId > 0) {
        this.model.BillingTransactionItems[index].ItemList = this.model.BillingTransactionItems[index].ItemList.filter(itm => itm.ServiceDepartmentId === this.model.BillingTransactionItems[index].ServiceDepartmentId)
      }

      this.model.BillingTransactionItems[index].ServiceDepartmentId = 0;
      // this.selectedServDepts[index] = "";
      this.model.BillingTransactionItems[index].IsValidSelDepartment = true;
      this.model.BillingTransactionItems[index].IsValidSelItemName = true;
      this.selectedAssignedToDr[index] = null;

      this.model.BillingTransactionItems[index].IsDoubleEntry_Now = false;
      this.model.BillingTransactionItems[index].IsDoubleEntry_Past = false;

    }
  }

  public AssignRequestedByDoctor(index) {
    if (this.selectedRefId || this.selectedPrescriberId) {
      this.model.BillingTransactionItems[index].PrescriberId = this.selectedPrescriberId;
      this.model.BillingTransactionItems[index].ReferredById = this.selectedRefId;
      this.model.BillingTransactionItems[index].IsValidSelPrescriberDr = true;
    }
    else {
      this.model.BillingTransactionItems[index].PrescriberId = this.selectedPrescriberId;
      this.model.BillingTransactionItems[index].ReferredById = this.selectedRefId;
      this.model.BillingTransactionItems[index].IsValidSelPrescriberDr = false;
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
      else if (typeof (this.selectedAssignedToDr[index]) == 'object') {
        doctor = this.selectedAssignedToDr[index];
      }
      if (doctor) {
        this.model.BillingTransactionItems[index].PerformerId = doctor.EmployeeId;
        this.model.BillingTransactionItems[index].PerformerName = doctor.FullName;
        this.model.BillingTransactionItems[index].IsvalidSelPerformerDr = true;
      }
      else
        this.model.BillingTransactionItems[index].IsvalidSelPerformerDr = false;
    }
    else {
      this.model.BillingTransactionItems[index].PerformerId = null;
      this.model.BillingTransactionItems[index].PerformerName = null;
      if (this.model.BillingTransactionItems[index].IsDoctorMandatory) {
        this.model.BillingTransactionItems[index].IsvalidSelPerformerDr = false;
      } else {
        this.model.BillingTransactionItems[index].IsvalidSelPerformerDr = true;
      }
    }
  }

  public CheckSelectionFromAutoComplete(): boolean {
    if (this.model.BillingTransactionItems.length) {

      //* Krishna, 3rdFeb'23, This isadded here inorder to show error message on every item row and not let user to proceed further...
      for (let i = 0; i < this.model.BillingTransactionItems.length; i++) {
        if (this.model.BillingTransactionItems[i].IsDoctorMandatory && !this.model.BillingTransactionItems[i].PerformerId) {
          this.model.BillingTransactionItems[i].UpdateValidator("on", "PerformerId", "required");
        }
      }

      //for (let itm of this.model.BillingTransactionItems) {
      for (let i = 0; i < this.model.BillingTransactionItems.length; i++) {
        if (!this.model.BillingTransactionItems[i].IsValidSelDepartment) {
          this.messageBoxService.showMessage(ENUM_DanpheHTTPResponseText.Failed, ["Invalid Department. Please select Department from the list."]);
          this.loading = false;
          return false;
        }
        if (this.model.BillingTransactionItems[i].IsDoctorMandatory && !this.model.BillingTransactionItems[i].PerformerId) {
          this.messageBoxService.showMessage(ENUM_DanpheHTTPResponseText.Failed, ["Performer is mandatory for some items"]);
          this.loading = false;
          return false;
        }
        if (!this.model.BillingTransactionItems[i].IsvalidSelPerformerDr) {
          this.messageBoxService.showMessage(ENUM_DanpheHTTPResponseText.Failed, ["Invalid Assigned To Dr. Name. Please select doctor from the list."]);
          this.loading = false;
          return false;
        }
        if (!this.model.BillingTransactionItems[i].IsValidSelItemName) {
          this.messageBoxService.showMessage(ENUM_DanpheHTTPResponseText.Failed, ["Invalid Item Name. Please select Item from the list."]);
          this.loading = false;
          return false;
        }

        let integrationName = this.coreService.GetServiceIntegrationName(this.model.BillingTransactionItems[i].ServiceDepartmentName);
        if (integrationName == "LAB" && this.LabTypeName == 'er-lab') {
          var aaa = this.model.BillingTransactionItems[i].ItemList.find(a => a.ItemId == this.selectedItems[i].ItemId && a.ServiceDepartmentId == this.selectedItems[i].ServiceDepartmentId)
          if (!aaa || !aaa.IsErLabApplicable) {
            this.messageBoxService.showMessage(ENUM_DanpheHTTPResponseText.Failed, ["Some items are not found in " + this.LabTypeName + ". "]);
            this.loading = false;
            return false;
          }
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

  // MapSelectedItem(index) {
  //   var item = this.itemList.find(a => a.ItemId == this.model.BillingTransactionItems[index].ItemId);
  //   //this.model.BillingTransactionItems[index].Price = item.Price;
  //   if (item) {

  //     this.model.BillingTransactionItems[index].TaxPercent = item.TaxApplicable ? this.taxPercent : 0;
  //     this.model.BillingTransactionItems[index].ItemName = item.ItemName;
  //     this.selectedItems[index] = item;
  //     this.AssignSelectedItem(index);
  //   }
  // }


  ItemsListFormatter(data: any): string {
    let html: string = "";
    if (data.SrvDeptIntegrationName != "OPD") {
      if (this.searchByItemCode) {
        html = data["ServiceDepartmentShortName"] + "-" + data["ItemCode"] + "&nbsp;&nbsp;" + "<font color='blue'; size=03 >" + data["ItemName"].toUpperCase() + "</font>" + "&nbsp;&nbsp;";
      }
      else {
        html = data["ServiceDepartmentShortName"] + "-" + data["BillItemPriceId"] + "&nbsp;&nbsp;" + "<font color='blue'; size=03 >" + data["ItemName"].toUpperCase() + "</font>" + "&nbsp;&nbsp;";
      }
      html += "(<i>" + data["ServiceDepartmentName"] + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + "<b>" + data["Price"] + "</b>";
    }
    else {
      let docName = data.Doctor ? data.Doctor.DoctorName : "";
      html = data["ServiceDepartmentShortName"] + "-" + data["BillItemPriceId"] + "&nbsp;&nbsp;" + data["ItemName"].toUpperCase() + "&nbsp;&nbsp;";
      html += "(<i>" + docName + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + data["Price"];
    }
    return html;
  }

  AssignedToDocListFormatter(data: any): string {
    return data["FullName"];
  }
  ServiceDeptListFormatter(data: any): string {
    return data["ServiceDepartmentName"];
  }
  MembershipTypeListFormatter(data: any): string {
    return data["MembershipTypeName"];
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
    this.model.BillingTransactionItems[index].PrescriberId = this.model.BillingTransactionItems[index].PrescriberId;
    this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.ServiceDepartmentName != "OPD");
    this.model.BillingTransactionItems[index].AssignedDoctorList = this.doctorsList;
    if (this.LabTypeName == 'er-lab') {
      this.model.BillingTransactionItems[index].ItemList = this.itemList.filter(a => a.SrvDeptIntegrationName != "OPD" && (a.IsErLabApplicable == true || a.SrvDeptIntegrationName != 'LAB'));
    }

    if (index > 0) {
      this.model.BillingTransactionItems[index].PrescriberId = this.model.BillingTransactionItems[index - 1].PrescriberId;
    } else {
      if (this.visitList[0] != null) {
        if (this.visitList[0].PerformerName == "Duty Doctor") {
          this.model.BillingTransactionItems[index].PrescriberId = null;
        } else {
          this.model.BillingTransactionItems[index].PrescriberId = this.visitList[0].PerformerId;
        }
      } else {
        this.model.BillingTransactionItems[index].PrescriberId = null;
      }
    }
    this.ReCalculateInvoiceAmounts();
  }

  //loads default service department from parameters
  // loadDefaultServDeptId() {
  //   let defSrvDpt = this.coreService.Parameters.filter(p => p.ParameterGroupName == "Billing" && p.ParameterName == "DefaultServiceDepartment");

  //   if (defSrvDpt.length > 0) {
  //     this.defaultServiceDepartmentId = defSrvDpt[0].ParameterValue;
  //   }
  // }

  //sud: 13May'18--to display patient's bill history
  //LoadPatientPastBillSummary(patientId: number)
  LoadPatientPastBillSummary(patientId: number) {
    this.BillingBLService.GetPatientPastBillSummary(patientId)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {

          this.patBillHistory = res.Results;
          this.patBillHistory.ProvisionalAmt = CommonFunctions.parseAmount(this.patBillHistory.ProvisionalAmt, 3);
          this.patBillHistory.BalanceAmount = CommonFunctions.parseAmount(this.patBillHistory.BalanceAmount, 3);
          this.patBillHistory.DepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance, 3);
          this.patBillHistory.CreditAmount = CommonFunctions.parseAmount(this.patBillHistory.CreditAmount, 3);
          this.patBillHistory.TotalDue = CommonFunctions.parseAmount(this.patBillHistory.TotalDue, 3);
          this.patBillHistory.IsLoaded = true;
          this.CalculateDepositBalance();
          this.MarkDepositFromDeduct();
        }
        else {
          this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
          this.loading = false;
        }
      });
  }

  MarkDepositFromDeduct() {
    if (this.model && this.patBillHistory.DepositBalance) {
      if (this.currentBillingFlow === ENUM_CurrentBillingFlow.BillReturn && this.model.TransactionType.toLowerCase() === "inpatient" && this.patBillHistory.DepositBalance > 0) {
        this.deductDeposit = true;
        this.CalculateDepositBalance();
      }
      else {
        this.deductDeposit = false;
      }
    }
  }


  CloseDepositPopUp($event = null) {
    if ($event) {
      this.patBillHistory.DepositBalance = $event.depositBalance;
      this.patBillHistory.BalanceAmount = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance - this.patBillHistory.TotalDue, 3);
    }
    this.showDepositPopUp = false;
    this.loading = false;
  }
  ShowDepositPopUp() {
    //this.showIpBillingWarningBox = false;
    this.showDepositPopUp = true;
  }




  //sud: 20Jun'18
  LoadPatientBillingContext() {
    //we get billing context from earlier invoice incase of copy from earlier invoice.
    if (this.currentBillingFlow !== ENUM_CurrentBillingFlow.BillReturn) {//&& this.currentVisitType != "inpatient"
      this.BillingBLService.GetPatientBillingContext(this.patientService.globalPatient.PatientId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
            if (res.Results) {
              this.currBillingContext = res.Results;
              const currentPatientPriceCategoryMap = this.currBillingContext.PatientSchemeMap;
              this.CurrentPatientPriceCategoryMap = currentPatientPriceCategoryMap;
              if (currentPatientPriceCategoryMap) {
                this.selectedPriceCategoryObj = this.allPriceCategories.find(a => a.PriceCategoryId === currentPatientPriceCategoryMap.PriceCategoryId);
                if (this.selectedPriceCategoryObj) {
                  let creditOrgList = _.cloneDeep(this.creditOrganizationsList);

                  let defaultOrg = creditOrgList.find(a => a.OrganizationId === this.selectedPriceCategoryObj.DefaultCreditOrganizationId);
                  if (defaultOrg) {
                    this.selectedCreditOrganization = defaultOrg;
                  }
                }
              } else {
                this.selectedPriceCategoryObj = this.allPriceCategories.find(a => a.PriceCategoryName.toLowerCase() === ENUM_PriceCategory.Normal.toLowerCase());
              }
              this.currentVisitType = this.currBillingContext.BillingType;
              this.billingService.BillingType = this.currBillingContext.BillingType;
              this.billingType = this.currBillingContext.BillingType;
              this.GetVisitContext(this.currBillingContext.PatientId, this.patLastVisitContext.PatientVisitId);
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
          if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results) {
            this.currPatVisitContext = res.Results;
            if (this.currPatVisitContext.ClaimCode) {
              this.isClaimed(this.currPatVisitContext.ClaimCode, this.currPatVisitContext.PatientId);
            }
            //sud:15Mar'19--to change VisitContext for ER patients-- moved from SearchPatient to here..
            this.ShowHideChangeVisitPopup(this.currPatVisitContext);

          }
          else {
            console.log("failed", ["Problem! Cannot get the Current Visit Context ! "])
          }
        },
          err => { console.log(err.ErrorMessage); });
    }

  }

  isClaimSuccessful = false;
  isClaimed(LatestClaimCode: number, PatientId: number): void {
    this.BillingBLService.IsClaimed(LatestClaimCode, PatientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results === true) {
            this.isClaimSuccessful = true;
          }
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ["Unable to check for pending claims"]);
        }
      );
  }

  //ashim: 24Dec2018
  //modifications to remove billingTransactionItem page.

  //we need to set certain properties acc. to current payment mode.
  OnPaymentModeChange() {
    if (this.model.PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit.toLowerCase() && !this.model.IsCoPayment) {
      this.model.PaidAmount = 0;
      this.model.BillStatus = ENUM_BillingStatus.unpaid;
      this.model.PaidDate = null;
      this.model.PaidCounterId = null;//sud:29May'18
      this.model.Tender = 0;//tender is zero and is disabled in when credit
      if (this.model.BillingTransactionItems) {
        this.model.BillingTransactionItems.forEach(txnItm => {
          txnItm.BillStatus = ENUM_BillingStatus.unpaid;// "unpaid";
          txnItm.PaidDate = null;
        });
      }

      this.deductDeposit = false;
      this.DepositDeductCheckBoxChanged();

    }
    else {
      //this.model.Tender = this.model.Tender ? this.model.Tender : this.model.TotalAmount;
      this.model.PaidAmount = this.model.Tender - this.model.Change;
      this.model.BillStatus = ENUM_BillingStatus.paid;
      this.model.PaidDate = moment().format("YYYY-MM-DD HH:mm:ss");//default paiddate.
      this.model.PaidCounterId = this.securityService.getLoggedInCounter().CounterId;//sud:29May'18
      // this.model.OrganizationId = null;
      // this.model.OrganizationName = null;
      if (!this.selectedPriceCategoryObj.IsCoPayment && this.model.CoPayment_PaymentMode.toLowerCase() !== ENUM_BillPaymentMode.credit.toLowerCase()) {
        this.model.OrganizationId = null;
        this.model.OrganizationName = null;
      }
      // if(this.model.EmployeeCashTransaction && this.model.EmployeeCashTransaction.length && this.model.EmployeeCashTransaction[0].InAmount == 0){
      //   this.model.EmployeeCashTransaction[0].InAmount = this.model.TotalAmount;
      // }
      if (this.TempEmployeeCashTransaction && !this.TempEmployeeCashTransaction.length && !this.deductDeposit) {
        let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() == this.model.PaymentMode.toLocaleLowerCase());
        let empCashTxnObj = new EmployeeCashTransaction();
        empCashTxnObj.InAmount = this.model.TotalAmount;
        empCashTxnObj.OutAmount = 0;
        empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
        empCashTxnObj.ModuleName = "Billing";
        this.TempEmployeeCashTransaction.push(empCashTxnObj);
      }
      if (this.TempEmployeeCashTransaction && !this.TempEmployeeCashTransaction.length && this.deductDeposit) {
        let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() == this.model.PaymentMode.toLocaleLowerCase());
        let empCashTxnObj = new EmployeeCashTransaction();
        empCashTxnObj.InAmount = this.model.DepositUsed;
        empCashTxnObj.OutAmount = 0;
        empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
        empCashTxnObj.ModuleName = "Billing";
        this.TempEmployeeCashTransaction.push(empCashTxnObj);

        if ((this.model.TotalAmount - this.model.DepositUsed) > 0) {
          let empCashTxnObj = new EmployeeCashTransaction();
          let obj = this.MstPaymentModes[0];
          empCashTxnObj.InAmount = this.model.TotalAmount - this.model.DepositUsed;
          empCashTxnObj.OutAmount = 0;
          empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
          empCashTxnObj.ModuleName = "Billing";
          this.TempEmployeeCashTransaction.push(empCashTxnObj);
        }
      }

      if (this.model.BillingTransactionItems) {
        this.model.BillingTransactionItems.forEach(txnItm => {
          txnItm.BillStatus = ENUM_BillingStatus.paid;// "paid";
          txnItm.PaidDate = moment().format("YYYY-MM-DD HH:mm:ss");
        });
      }
      this.model.EmployeeCashTransaction = this.TempEmployeeCashTransaction;
    }
  }
  ChangeTenderAmount() {
    if (this.deductDeposit) {
      this.model.Change = CommonFunctions.parseAmount(this.model.Tender + this.depositDeductAmount - this.model.TotalAmount, 3);
    }
    else {
      this.model.Change = CommonFunctions.parseAmount(this.model.Tender - (this.model.ReceivedAmount), 3);
    }
  }

  //Change the Checkbox value and call Calculation logic from here.
  DepositDeductCheckBoxChanged() {
    //toggle Checked-Unchecked of 'Deduct From Deposit Checkbox'
    this.CalculateDepositBalance();
  }
  CalculateDepositBalance() {
    var currentDepositBalance = this.patBillHistory.DepositBalance;
    if (this.deductDeposit) {
      if (currentDepositBalance > 0) {
        let patientId = this.model.PatientId;
        this.newDepositBalance = currentDepositBalance - this.model.TotalAmount;
        this.newDepositBalance = CommonFunctions.parseAmount(this.newDepositBalance, 3);
        this.model.DepositAvailable = currentDepositBalance;
        if (this.newDepositBalance >= 0) {
          // this.depositDeductAmount = this.model.TotalAmount;
          this.depositDeductAmount = this.model.ReceivedAmount; // krishna, 24th,Aug'22, ReceivedAmount is the cash to receive so Total Amount and received amount are same except for copayment.
          this.model.Tender = null;
          this.changeDetectorRef.detectChanges();
          this.model.Tender = 0;
          this.model.Change = 0;
          this.model.DepositReturnAmount = 0;
          // this.model.DepositUsed = this.model.TotalAmount;
          this.model.DepositUsed = this.model.ReceivedAmount; // krishna, 24th,Aug'22, ReceivedAmount is the cash to receive so Total Amount and received amount are same except for copayment.
        }
        //newDepositBalance will be in negative if it comes to else.
        else {
          //Tender is set to positive value of newDepositBalance. //checke resetTender param: sud-6Feb 2020
          this.model.Tender = -(this.newDepositBalance);
          this.depositDeductAmount = currentDepositBalance;//all deposit has been returned.
          this.newDepositBalance = 0;//reset newDepositBalance since it's all Used NOW.
          this.model.Change = 0;//Reset Change since we've reset Tender above.
          this.model.DepositReturnAmount = 0
          this.model.DepositUsed = currentDepositBalance;
        }
        //this.routeFromService.RouteFrom = "DepositDeductpart";        //ramavtar: 24Oct'18
      }
      else {
        this.model.DepositReturnAmount = 0
        this.model.DepositUsed = 0;
        this.model.DepositAvailable = 0;
        this.model.DepositBalance = 0;
        this.messageBoxService.showMessage("failed", ["Deposit balance is zero, Please add deposit to use this feature."]);
        this.deductDeposit = !this.deductDeposit;
      }
    }
    else {
      //reset all required properties..
      if (this.selectedPriceCategoryObj && this.selectedPriceCategoryObj.IsCoPayment) {
        this.model.Tender = this.model.ReceivedAmount;
      } else {
        if (this.model.PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit.toLowerCase()) {
          this.model.Tender = 0;
        } else {
          this.model.Tender = this.model.TotalAmount;//sud:6Feb'20--for CMH
        }
      }
      // this.model.Tender = this.model.TotalAmount;//sud:6Feb'20--for CMH
      this.newDepositBalance = 0;
      this.depositDeductAmount = 0;
      this.model.DepositReturnAmount = 0;
      this.model.Change = 0;
      this.routeFromService.RouteFrom = ""; // while clicking the checkbox route from "DepositDeductpart" is assigning which must be initialize again to control the data to inserrt on the deposit table
      this.model.DepositUsed = 0;
    }
  }



  // public GetDistinctServiceDepartments(items) {
  //   if (items && items.length) {
  //     let distinctSrvDept = new Array<ServiceDepartmentVM>();
  //     distinctSrvDept.push(this.serviceDeptList.find(srv => srv.ServiceDepartmentName == items[0].ServiceDepartmentName));
  //     items.forEach(itm => {
  //       //push only if current type isn't already added.
  //       if (!distinctSrvDept.find(dst => dst.ServiceDepartmentName == itm.ServiceDepartmentName)) {
  //         distinctSrvDept.push(this.serviceDeptList.find(srv => srv.ServiceDepartmentName == itm.ServiceDepartmentName));
  //       }
  //     });
  //     this.serviceDeptList = distinctSrvDept;
  //   }
  // }


  //billing transaction against insurace package.

  //end: insurance billing changes


  //Start: Sud: 25Feb'19++ for Billing Price Category: eg: PayClinic. Common Requesting Doctor.

  OnPriceCategoryChange($event) {
    this.isPriceCatogoryLoaded = true;
    this.priceCategory = $event.categoryName;
    this.PriceCategoryId = $event.PriceCategoryId;
    this.visitService.PriceCategory = $event.categoryName;
    this.selectedPriceCategoryObj = new PriceCategory();
    this.selectedCreditOrganization = new CreditOrganization();
    this.selectedPriceCategoryObj = this.allPriceCategories.find(a => a.PriceCategoryId === $event.PriceCategoryId);
    let allPriceCategories = this.coreService.Masters.PriceCategories.filter(a => a.IsActive == true);
    this.PriceCategorySelectedToChangePrice = allPriceCategories.find(a => a.PriceCategoryId == this.PriceCategoryId);
    this.model.IsCoPayment = this.selectedPriceCategoryObj.IsCoPayment;
    if (this.selectedPriceCategoryObj.IsCoPayment) {
      this.model.CoPayment_PaymentMode = ENUM_BillPaymentMode.credit;
    }
    let allCreditOrganizations = this.billingService.AllCreditOrganizationsList;
    if ((this.PriceCategorySelectedToChangePrice && this.selectedPriceCategoryObj.IsCoPayment) || this.MembershipTypeName === ENUM_MembershipTypeName.ECHS) {
      let creditOrgList = _.cloneDeep(allCreditOrganizations);
      let defaultOrg = creditOrgList.find(a => a.OrganizationId === this.PriceCategorySelectedToChangePrice.DefaultCreditOrganizationId);
      if (defaultOrg) {
        this.selectedCreditOrganization = defaultOrg;
      }
    }
    if (this.currentBillingFlow !== ENUM_CurrentBillingFlow.PackageBilling) {
      this.LoadItemsPriceByPriceCategoryAndFilter($event.PriceCategoryId);
    }
    if (this.selectedPriceCategoryObj.IsCoPayment && this.selectedPriceCategoryObj.PriceCategoryName.toLowerCase() === ENUM_PriceCategory.Medicare.toLowerCase()) {
      this.GetMedicareMemberDetail(this.patientService.getGlobal().PatientId);
    }

    if (this.priceCategory) {
      this.visitService.TriggerBillChangedEvent({ ChangeType: "PriceCategoryToChangePriceInternally", PriceCategory: this.priceCategory, selectedPriceCategory: this.PriceCategorySelectedToChangePrice });
    }
  }

  LoadItemsPriceByPriceCategoryAndFilter(selectedPriceCategoryId: number) {
    if (selectedPriceCategoryId) {
      let selectedPriceCategoryObj = this.allPriceCategories.find(a => a.PriceCategoryId == selectedPriceCategoryId);
      if (selectedPriceCategoryObj.IsRateDifferent) {
        //! Need initial data
        this.GetBillingItems();
        //! Reset the BillTxnItms rows
        for (let index = 0; index < this.model.BillingTransactionItems.length; index++) {
          if (this.model.BillingTransactionItems) {
            this.model.BillingTransactionItems = [];
            this.selectedItems = [];
            this.selectedAssignedToDr = [];
            this.selectedServDepts = [];
            if (this.model.BillingTransactionItems.length == 0) {
              this.AddNewBillTxnItemRow();
              this.changeDetectorRef.detectChanges();
            }
            this.ReCalculateInvoiceAmounts();
          }
        }
        //* fetch from mapping table

        this.BillingBLService.LoadItemsPriceByPriceCategory(selectedPriceCategoryId).subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
              this.BilcfgItemsVsPriceCategoryMap = res.Results;
              this.FilterItemsByPriceCategoryAndAssignPrice(this.priceCategory);
            }
          },
          err => {
            console.log(err);
          }
        );

      } else {
        //* fetch from normal items table;
        for (let index = 0; index < this.model.BillingTransactionItems.length; index++) {
          if (this.model.BillingTransactionItems) {
            this.model.BillingTransactionItems = [];
            this.selectedItems = [];
            this.selectedAssignedToDr = [];
            this.selectedServDepts = [];
            if (this.model.BillingTransactionItems.length == 0) {
              this.AddNewBillTxnItemRow();
              this.changeDetectorRef.detectChanges();
            }
            this.ReCalculateInvoiceAmounts();
          }
        }
        this.GetBillingItems();
      }
    }
  }

  FilterItemsByPriceCategoryAndAssignPrice(selectedPriceCategory) {
    if (this.BilcfgItemsVsPriceCategoryMap && this.BilcfgItemsVsPriceCategoryMap.length) {

      this.itemList = this.itemList.filter(ele => this.BilcfgItemsVsPriceCategoryMap.some(elem => ele.ServiceDepartmentId === elem.ServiceDepartmentId && ele.ItemId === elem.ItemId));
      this.itemList.map(a => {
        let matchedData = this.BilcfgItemsVsPriceCategoryMap.find(b => b.ServiceDepartmentId == a.ServiceDepartmentId && b.ItemId == a.ItemId);
        if (matchedData) {
          a.Price = matchedData.Price;
          a.DiscountPercent = matchedData.Discount;
          a.IsCoPayment = matchedData.IsCoPayment;
          a.CoPaymentCashPercent = matchedData.CoPaymentCashPercent;
          a.CoPaymentCreditPercent = matchedData.CoPaymentCreditPercent;
        }
      });
      if (this.model.BillingTransactionItems) {

        this.model.BillingTransactionItems = [];
        this.selectedItems = [];
        this.selectedAssignedToDr = [];
        this.selectedServDepts = [];
        if (this.model.BillingTransactionItems.length == 0) {
          this.AddNewBillTxnItemRow();
          this.changeDetectorRef.detectChanges();
        }
        this.ReCalculateInvoiceAmounts();
      }

    }
    else {
      this.itemList = new Array<BillingTransactionItem>();
      if (this.model.BillingTransactionItems) {

        this.model.BillingTransactionItems = [];
        this.selectedItems = [];
        this.selectedAssignedToDr = [];
        this.selectedServDepts = [];
        if (this.model.BillingTransactionItems.length == 0) {
          this.AddNewBillTxnItemRow();
          this.changeDetectorRef.detectChanges();
        }
        this.ReCalculateInvoiceAmounts();
      }
    }
  }

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
    this.txnItemToEdit.PrescriberId = $event.PrescriberId;
    this.txnItemToEdit.PrescriberName = $event.PrescriberName;
    this.txnItemToEdit.ReferredById = $event.ReferredById;
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
    this.CalculateDepositBalance();
    if (currItem.Price != null) {
      if (currItem.ItemId != 0 && (!currItem.IsZeroPriceAllowed && currItem.Price == 0) || currItem.Price < 0) {
        this.model.BillingTransactionItems[index].IsPriceValid = false;
      }
      else {
        this.model.BillingTransactionItems[index].IsPriceValid = true;
      }
    }
    else {
      this.model.BillingTransactionItems[index].IsPriceValid = false;
    }

  }

  ReCalculateInvoiceAmounts() {
    if (!this.isPackageBilling) {
      //sud:11Mar'19--to calculate Subtotal, DiscountAmount, totalAmount of Invoice Level.
      //reduce function usage: acc -> accumulator, initial value=0, itm -> loop variable (BillingTransactionItem in below case).
      let overallSubTot = this.model.BillingTransactionItems.reduce(function (acc, itm) { return acc + itm.SubTotal; }, 0);
      let overallDiscAmt = this.model.BillingTransactionItems.reduce(function (acc, itm) { return acc + itm.DiscountAmount; }, 0);

      this.model.SubTotal = CommonFunctions.parseAmount(overallSubTot, 3);
      this.model.DiscountAmount = CommonFunctions.parseAmount(overallDiscAmt, 3);
      this.model.TotalAmount = CommonFunctions.parseAmount(overallSubTot - overallDiscAmt, 3);
      if (overallSubTot > this.model.TotalAmount) {
        this.model.DiscountPercent = Number((((overallSubTot - this.model.TotalAmount) / overallSubTot) * 100).toFixed(4));
      }
      else if (overallSubTot == this.model.TotalAmount) {
        this.model.DiscountPercent = 0;
      }
      //this.model.Tender = this.model.TotalAmount;
    }
    else {
      let overallSubTot = this.model.BillingTransactionItems.reduce(function (acc, itm) { return acc + itm.SubTotal; }, 0);

      this.model.SubTotal = CommonFunctions.parseAmount(overallSubTot);
      this.model.DiscountAmount = CommonFunctions.parseAmount((Number(this.model.SubTotal) * Number(this.model.DiscountPercent)) / 100);
      this.model.TotalAmount = CommonFunctions.parseAmount(overallSubTot - this.model.DiscountAmount);
      // this.model.Tender = this.model.TotalAmount;
    }

    if (this.selectedPriceCategoryObj && this.selectedPriceCategoryObj.IsCoPayment) {
      this.model.BillingTransactionItems.forEach(ele => {
        if (ele.IsCoPayment) {
          ele.CoPaymentCashAmount = (ele.CoPaymentCashPercent * ele.TotalAmount) / 100;
          ele.CoPaymentCreditAmount = (ele.CoPaymentCreditPercent * ele.TotalAmount) / 100;
        }
      });

      this.model.ReceivedAmount = this.model.BillingTransactionItems.reduce((acc, item) => acc + item.CoPaymentCashAmount, 0);
      this.model.CoPaymentCreditAmount = this.model.BillingTransactionItems.reduce((acc, item) => acc + item.CoPaymentCreditAmount, 0);

      this.model.ReceivedAmount = CommonFunctions.parseAmount(this.model.ReceivedAmount, 3);
      this.model.CoPaymentCreditAmount = CommonFunctions.parseAmount(this.model.CoPaymentCreditAmount, 3);
    } else {

      this.model.ReceivedAmount = this.model.TotalAmount;

    }
    this.model.Tender = this.model.ReceivedAmount;
    this.ChangeTenderAmount();
  }



  //Pratik:2Feb'21--This logic was changed for LPH, Please make it parameterized and handle if required for other hospitals after merging.
  InvoiceDiscountOnChange() {
    //Need to re-calculate aggregatediscounts of each item and Invoice amounts when Invoice Discount is changed.
    this.model.BillingTransactionItems.forEach(itm => {
      //itm.DiscountPercent = this.model.DiscountPercent ? this.model.DiscountPercent : 0;

      // if(this.selectedPriceCategoryObj.IsCoPayment){
      //   let matchedItem = this.BilcfgItemsVsPriceCategoryMap.find(b => b.ServiceDepartmentId === itm.ServiceDepartmentId && b.ItemId === itm.ItemId);
      //   itm.DiscountSchemeId = this.memTypeSchemeId;
      //   if(matchedItem){
      //     if(matchedItem.DiscountApplicable){
      //       itm.DiscountPercent = matchedItem.Discount;
      //       itm.DiscountAmount = (itm.DiscountPercent * itm.SubTotal) / 100;
      //       itm.DiscountApplicable = matchedItem.DiscountApplicable;
      //     }else{
      //       itm.DiscountPercent = this.currMemDiscountPercent;
      //       itm.DiscountAmount = (itm.DiscountPercent * itm.SubTotal) / 100;
      //     }
      //   }else{
      //     itm.DiscountPercent = this.currMemDiscountPercent;
      //     itm.DiscountAmount = (itm.DiscountPercent * itm.SubTotal) / 100;
      //   }
      // }else{
      itm.DiscountPercentAgg = this.model.DiscountPercent ? this.model.DiscountPercent : 0;
      itm.DiscountPercent = this.model.DiscountPercent ? this.model.DiscountPercent : 0;
      itm.DiscountAmount = itm.SubTotal * itm.DiscountPercentAgg / 100;
      itm.TotalAmount = itm.SubTotal - itm.DiscountAmount;
      //}
      //this.CalculateAggregateDiscountsOfItems(itm);
    });

    this.ReCalculateInvoiceAmounts();
  }


  ItemLevelDiscountChange(index) {
    if (this.model.BillingTransactionItems[index].DiscountPercent == null) {
      this.model.BillingTransactionItems[index].DiscountPercent = 0;
      this.model.BillingTransactionItems[index].DiscountAmount = 0;
    }

    this.model.BillingTransactionItems[index].DiscountAmount = this.model.BillingTransactionItems[index].SubTotal * this.model.BillingTransactionItems[index].DiscountPercent / 100;
    this.model.BillingTransactionItems[index].TotalAmount = this.model.BillingTransactionItems[index].SubTotal - this.model.BillingTransactionItems[index].DiscountAmount;

    //reduce function usage: acc -> accumulator, initial value=0, itm -> loop variable (BillingTransactionItem in below case).
    let overallSubTot = this.model.BillingTransactionItems.reduce(function (acc, itm) { return acc + itm.SubTotal; }, 0);
    let overallTotal = this.model.BillingTransactionItems.reduce(function (acc, itm) { return acc + itm.TotalAmount; }, 0);
    if (overallSubTot > overallTotal)
      this.model.DiscountPercent = ((overallSubTot - overallTotal) / overallSubTot) * 100;
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
    let additionalDiscountAmt = 0;// itmTotAmt * invoiceDiscPercent / 100;
    let totalDiscountAmount = itmDiscAmount;// + additionalDiscountAmt;

    //below formula also work's fine.. but didn't use it because of it's complexity in understanding..
    //let totalDiscountAmount = itm.SubTotal - ((100 - itmDiscPercent) / 100 * (100 - invoiceDiscPercent) / 100 * itm.SubTotal);

    let aggDiscPercent = (totalDiscountAmount) / itm.SubTotal * 100;
    itm.DiscountPercentAgg = CommonFunctions.parseAmount(aggDiscPercent, 3);
    itm.DiscountPercent = CommonFunctions.parseAmount(itm.DiscountPercent, 3);
    itm.DiscountAmount = CommonFunctions.parseAmount(totalDiscountAmount, 3);
    itm.TotalAmount = CommonFunctions.parseAmount(itm.SubTotal - totalDiscountAmount, 3);

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



  //start: sud:14Mar'19--to change VisitType incase of ER (optional)
  public showChangeVisitTypePopup: boolean = false;
  //Change LatestVisitType to OPD if user chooses so..
  public OnChangeVisitPopupClosed($event) {

    //If popup is closed without any action, then LatestVisitType should be emergency.
    if ($event && $event.EventName == "close") {
      this.showChangeVisitTypePopup = false;
      this.patientService.globalPatient.LatestVisitType = "emergency";
    }
    else {
      //if visittype changed to OPD then latestvisittype should be opd..
      if ($event && $event.EventName == "changeToOPD") {
        this.patientService.globalPatient.LatestVisitType = "outpatient";
      }
      else {
        this.patientService.globalPatient.LatestVisitType = "emergency";
      }
    }

    this.currentVisitType = this.patientService.globalPatient.LatestVisitType;
    this.UpdateVisitTypeOfExistingItems();
    this.showChangeVisitTypePopup = false;
  }
  // sud:15Mar'19--for er patients we have to give popup to either continue with ER or OP billing on next day..
  // moved from SearchPatient to this page.. needed for SearchPatientOptimization.
  ShowHideChangeVisitPopup(visContext) {
    if (visContext.VisitType && visContext.VisitType.toLowerCase() == "emergency") {
      let lastErDay = moment().diff(moment(visContext.VisitDate), 'days');
      if (lastErDay > 0) {
        this.showChangeVisitTypePopup = true;
      }
    }
    else {
      this.patientService.globalPatient.LatestVisitType = this.billingService.BillingType;
    }
  }


  UpdateVisitTypeOfExistingItems() {
    let visitType = this.currentVisitType;
    if (this.model && this.model.BillingTransactionItems) {
      this.model.BillingTransactionItems.forEach(itm => {
        itm.VisitType = visitType;

      });
    }
  }

  //end: sud:14Mar'19--to change VisitType incase of ER (optional)

  ShowPastBillHistory() {
    if (this.showPastBillHistory) {

    }
  }

  //start: Pratik: 12Sept'19--For External Referrals
  OnReferrerChanged($event) {

    this.selectedRefId = $event.ReferrerId;//EmployeeId comes as ReferrerId from select referrer component.

    if (this.model.BillingTransactionItems) {
      this.model.BillingTransactionItems.forEach(billTxnItem => {
        billTxnItem.ReferredById = this.selectedRefId;
        billTxnItem.IsValidSelPrescriberDr = true;
      });
    }
  }

  OnPrescriberChanged($event) {
    this.selectedPrescriberId = $event.ReferrerId;//EmployeeId comes as ReferrerId from select referrer component.

    if (this.model.BillingTransactionItems) {
      this.model.BillingTransactionItems.forEach(billTxnItem => {
        billTxnItem.PrescriberId = this.selectedPrescriberId;
        billTxnItem.IsValidSelPrescriberDr = true;
      });
    }
  }

  public LoadReferrerSettings() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "ExternalReferralSettings");
    if (currParam && currParam.ParameterValue) {
      this.ExtRefSettings = JSON.parse(currParam.ParameterValue);
    }
  }


  //end: Pratik: 12Sept'19--For External Referrals



  // AddMultipleQtyItems(itmRow: BillingTransactionItem, itmIndex: number) {
  //   if (itmRow && itmRow.Quantity > 1) {

  //     let itmQty = itmRow.Quantity;

  //     itmRow.Quantity = 1;

  //     //this.ReCalculateBillItemAmounts(itmIndex);
  //     let extraRowsToCreate = itmQty - 1;

  //     for (let i = 0; i < extraRowsToCreate; i++) {

  //       this.AddNewBillTxnItemRow(this.model.BillingTransactionItems.length, false);
  //       let newIndex = this.model.BillingTransactionItems.length - 1;
  //       this.selectedItems[newIndex] = itmRow;
  //       this.AssignSelectedItem(newIndex);


  //       this.model.BillingTransactionItems[newIndex].PerformerId = itmRow.PerformerId;
  //       this.model.BillingTransactionItems[newIndex].PerformerName = itmRow.PerformerName;
  //       this.model.BillingTransactionItems[newIndex].DiscountSchemeId = itmRow.DiscountSchemeId;
  //       this.model.BillingTransactionItems[newIndex].DiscountAmount = itmRow.DiscountAmount;
  //       this.model.BillingTransactionItems[newIndex].DiscountPercentAgg = itmRow.DiscountPercentAgg;
  //       this.model.BillingTransactionItems[newIndex].DiscountPercent = itmRow.DiscountPercent;
  //       this.model.BillingTransactionItems[newIndex].TotalAmount = itmRow.TotalAmount;

  //     }
  //     this.ReCalculateBillItemAmounts(itmIndex);
  //   }
  // }

  //start: sundeep:14NOv'19--for membership scheme/community
  public LoadMembershipSettings() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "MembershipSchemeSettings");
    if (currParam && currParam.ParameterValue) {
      this.membershipSchemeParam = JSON.parse(currParam.ParameterValue);
    }
  }

  //On MembershipType change
  OnMembershipTypeChanged($event: MembershipType) {

    if (!$event) {
      this.DiscountPercentSchemeValid = false;
      this.memTypeSchemeId = this.tempMembershipTypeId ? this.tempMembershipTypeId : null;
      this.currMemDiscountPercent = 0;
      this.model.Remarks = null;//sud:29Aug'19-we've to set remarks as that of discount percent
      //return;
    }
    else {
      this.memTypeSchemeId = $event.MembershipTypeId;
      this.DiscountPercentSchemeValid = true;
      this.currMemDiscountPercent = $event.DiscountPercent;
      this.MembershipTypeName = $event.MembershipTypeName;
      this.model.DiscountPercent = this.currMemDiscountPercent;

      //This function maps membershipType wit PriceCategory
      // this.MapPriceCategoryAccordingToMembershipChange($event.DefaultPriceCategoryId);
    }
    //sud:29Aug'19-we've to set remarks as that of discount percent
    if (this.currMemDiscountPercent && this.currMemDiscountPercent != 0) {
      this.model.Remarks = $event ? $event.MembershipTypeName : null;
      // this.model.DiscountPercent = this.currMemDiscountPercent;
    }
    else {
      this.model.Remarks = null;
    }
    this.InvoiceDiscountOnChange();
  }
  //end: sundeep:14NOv'19--for membership scheme/community


  MapPriceCategoryAccordingToMembershipChange(defaultPriceCategoryId: number) {
    if (defaultPriceCategoryId) {

      let defaultPriceCategory = this.allPriceCategories.find(a => a.PriceCategoryId === defaultPriceCategoryId);
      if (defaultPriceCategory) {

        if (this.currBillingContext.PatientSchemeMap && this.currBillingContext.PatientSchemeMap.PriceCategoryId === defaultPriceCategoryId) {
          const currentPatientPriceCategoryMap = this.currBillingContext.PatientSchemeMap;
          this.selectedPriceCategoryObj = this.allPriceCategories.find(a => a.PriceCategoryId === currentPatientPriceCategoryMap.PriceCategoryId);
          this.priceCategory = this.selectedPriceCategoryObj.PriceCategoryName;
        } else {
          let normalPriceCategory = this.allPriceCategories.find(a => a.PriceCategoryName.toLowerCase() === ENUM_PriceCategory.Normal.toLowerCase());
          this.selectedPriceCategoryObj = normalPriceCategory;
          this.priceCategory = this.selectedPriceCategoryObj.PriceCategoryName;
        }

        if (this.selectedPriceCategoryObj) {
          let creditOrgList = _.cloneDeep(this.creditOrganizationsList);

          let defaultOrg = creditOrgList.find(a => a.OrganizationId === this.selectedPriceCategoryObj.DefaultCreditOrganizationId);
          if (defaultOrg) {
            this.selectedCreditOrganization = defaultOrg;
          }
        }
      }
    } else {
      let normalPriceCategory = this.allPriceCategories.find(a => a.PriceCategoryName.toLowerCase() === ENUM_PriceCategory.Normal.toLowerCase());
      if (this.currBillingContext.PatientSchemeMap && this.currBillingContext.PatientSchemeMap.PriceCategoryId === defaultPriceCategoryId) {
        const currentPatientPriceCategoryMap = this.currBillingContext.PatientSchemeMap;
        this.selectedPriceCategoryObj = this.allPriceCategories.find(a => a.PriceCategoryId === currentPatientPriceCategoryMap.PriceCategoryId);
        this.priceCategory = this.selectedPriceCategoryObj.PriceCategoryName;
      } else {
        this.selectedPriceCategoryObj = normalPriceCategory;
        this.priceCategory = this.selectedPriceCategoryObj.PriceCategoryName;
      }
      if (this.selectedPriceCategoryObj) {
        let creditOrgList = _.cloneDeep(this.creditOrganizationsList);

        let defaultOrg = creditOrgList.find(a => a.OrganizationId === this.selectedPriceCategoryObj.DefaultCreditOrganizationId);
        if (defaultOrg) {
          this.selectedCreditOrganization = defaultOrg;
        }
      }
    }
  }

  //start: sundeep: for doctor list filter on item change--

  ResetDoctorListOnItemChange(item, index) {
    if (item) {
      let docArray = null;
      let currItemPriceCFG = this.itemList.find(a => a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId);
      if (currItemPriceCFG) {
        let docJsonStr = currItemPriceCFG.DefaultDoctorList;
        if (docJsonStr) {
          docArray = JSON.parse(docJsonStr);
        }

      }
      if (docArray && docArray.length > 1) {
        this.model.BillingTransactionItems[index].AssignedDoctorList = [];

        docArray.forEach(docId => {
          let currDoc = this.doctorsList.find(d => d.EmployeeId == docId);
          if (currDoc) {
            this.selectedAssignedToDr[index] = null;
            this.model.BillingTransactionItems[index].AssignedDoctorList.push(currDoc);
          }
        });

      }
      else if (docArray && docArray.length == 1) {

        let currDoc = this.doctorsList.find(d => d.EmployeeId == docArray[0]);
        if (currDoc) {
          this.selectedAssignedToDr[index] = currDoc.FullName;
          this.AssignSelectedDoctor(index);
        }

      }
      else {
        this.selectedAssignedToDr[index] = null;
        this.model.BillingTransactionItems[index].AssignedDoctorList = this.doctorsList;
      }

    }

  }

  //end: sundeep: for doctor list filter on item change--

  PastTest($event) {
    this.PastTestList = $event;
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

  public DateDifference(currDate, startDate): number {
    var diffHrs = moment(currDate, "YYYY/MM/DD HH:mm:ss").diff(moment(startDate, "YYYY/MM/DD HH:mm:ss"), 'hours');
    return diffHrs;
  }

  PaymentModeChanges($event) {
    this.model.PaymentMode = $event.PaymentMode.toLowerCase();
    this.model.PaymentDetails = $event.PaymentDetails;
    this.IsRemarksMandatory = $event.IsRemarksMandatory;
    this.OnPaymentModeChange();
  }

  CreditOrganizationChanges($event) {
    if (this.model.OrganizationId != $event.OrganizationId) {
      this.coreService.FocusInputById('id_billing_credit_remarks');
    }
    this.model.OrganizationId = $event.OrganizationId;
    this.model.OrganizationName = $event.OrganizationName;
    //this.coreService.FocusInputById('id_billing_credit_remarks');
  }


  //this function is hotkeys when pressed by user
  public hotkeys(event) {
    if (event.keyCode == 27) {
      this.CloseInvoicePrint();
    }

    if (event.altKey) {
      switch (event.keyCode) {
        case 13: {//=> ALT+enter comes here
          if (!this.MembershipTypeName || this.MembershipTypeName == 'General') {
            this.coreService.FocusInputById('tenderAmount');
          }
          else {
            this.coreService.FocusInputById('discountPercentage');
          }
          break;
        }
        case 80: {// => ALT+P comes here
          if (!this.loading) {
            this.loading = true;
            this.PostInvoice();
          }
          break;
        }
        default:
          break;
      }
    }
  }

  public OnLabTypeChange() {
    this.model.LabTypeName = this.LabTypeName;
    this.FilterBillItems(0);

    if (this.LabTypeName) {
      if (localStorage.getItem('BillingSelectedLabTypeName')) {
        localStorage.removeItem('BillingSelectedLabTypeName');
      }
      localStorage.setItem('BillingSelectedLabTypeName', this.LabTypeName);
      let ptr = this.coreService.labTypes.find(p => p.LabTypeName == this.LabTypeName);

    } else {
      this.messageBoxService.showMessage('error', ["Please select Lab Type Name."]);
    }
  }

  public AddTxnItemRowOnClick(index) {
    if (index != -1) {
      if (this.model.BillingTransactionItems[index].ItemId == 0) {
        if (!this.MembershipTypeName || this.MembershipTypeName == 'General') {
          this.coreService.FocusInputById("tenderAmount");
        }
        else {
          this.EnableDiscountAmountField ? this.coreService.FocusInputById("id_inp_discountAmt") : this.coreService.FocusInputById("discountPercentage");
        }
      } else {
        this.coreService.FocusInputById("txtQuantity_" + index);
      }
    }
  }

  SetLabTypeNameInLocalStorage() {
    let labtypeInStorage = localStorage.getItem('BillingSelectedLabTypeName');
    if (this.coreService.labTypes.length == 1) {
      localStorage.setItem("BillingSelectedLabTypeName", this.coreService.labTypes[0].LabTypeName);
      return;
    } else if (this.coreService.labTypes.length == 0) {
      localStorage.setItem("NursingSelectedLabTypeName", 'op-lab');
      return;
    }
    if (labtypeInStorage) {
      let selectedLabType = this.coreService.labTypes.find(
        (val) => val.LabTypeName == labtypeInStorage
      );
      if (selectedLabType) {
        this.LabTypeName = labtypeInStorage;
      } else {
        localStorage.removeItem("BillingSelectedLabTypeName");
        let defaultLabType = this.coreService.labTypes.find(
          (type) => type.IsDefault == true
        );
        if (!defaultLabType) {
          this.LabTypeName = this.coreService.labTypes[0].LabTypeName;
        } else {
          this.LabTypeName = defaultLabType.LabTypeName;
        }
        localStorage.setItem("BillingSelectedLabTypeName", this.LabTypeName);
      }
    } else {
      let defaultLabType = this.coreService.labTypes.find(
        (type) => type.IsDefault == true
      );
      if (!defaultLabType && this.coreService.singleLabType) {
        this.LabTypeName = this.coreService.labTypes[0].LabTypeName;
      } else {
        this.LabTypeName = defaultLabType ? defaultLabType.LabTypeName : this.coreService.labTypes[0].LabTypeName;
      }
    }
  }

  //sud:16May'21--Moving Invoice Printing as Popup
  public CloseInvoicePrint() {
    this.showInvoicePrintPage = false;
    this.model = this.billingService.getGlobalBillingTransaction();
    this.router.navigate(["/Billing/SearchPatient"]);
  }

  public MoveToItemName(indx: number) {
    this.coreService.FocusInputById("srchbx_ItemName_" + indx);
  }

  //sud:23May'21--If price is valid then add new row, else focus on price field.
  public EnterPressed_Quantity(indx: number) {
    if (this.model.BillingTransactionItems[indx].IsPriceValid) {
      this.AddNewBillTxnItemRow(indx);
    }
    else {
      this.coreService.FocusInputById("txtPrice_" + indx);
    }
  }

  //sud:23May'21--If price is valid then add new row, else stay on the same place.
  public EnterPressed_Price(indx: number) {
    if (this.model.BillingTransactionItems[indx].IsPriceValid) {
      this.AddNewBillTxnItemRow(indx);
    }
    else {
      return;
    }
  }

  OnProvisionalAmountClick() {
    this.routeFromService.RouteFrom = "BillingTransactionProvisional";
    this.router.navigate(['/Billing/ProvisionalClearance']);
  }

  public GetBillingRequestDisplaySettings() {
    var StrParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "OPBillingRequestDisplaySettings");
    if (StrParam && StrParam.ParameterValue) {
      let currParam = JSON.parse(StrParam.ParameterValue);
      this.BillingRequestDisplaySettings = currParam;
    }
  }

  //sud:9Sep'21-- set patient's visitid as per last visit context of patient..
  //we need to change emergency popup based on same logic..
  public SetVisitContextBeforeBillSubmit() {
    this.model.PatientVisitId = this.patLastVisitContext.PatientVisitId;
    this.model.BillingTransactionItems.forEach(itm => {
      itm.PatientVisitId = this.patLastVisitContext.PatientVisitId;
    });
  }
  public ItemLevelDiscountChkBoxOnChange() {
    if (this.EnableDiscountAmountField) {
      this.model.BillingTransactionItems.forEach(a => {
        a.BillingTransactionItemValidator.controls["DiscountPercent"].disable();

      });
    } else {
      this.model.BillingTransactionItems.forEach(a => {
        a.BillingTransactionItemValidator.controls["DiscountPercent"].enable();
        a.BillingTransactionItemValidator.controls["DiscountAmount"].disable();

      });
    }
    if (!this.ShowItemLevelDiscount) {
    }
    //if (!this.ShowItemLevelDiscount) {
    this.model.DiscountPercent = this.currMemDiscountPercent;
    this.model.BillingTransactionItems.forEach(a => {

      let matchedItem = this.BilcfgItemsVsPriceCategoryMap.find(b => b.ServiceDepartmentId === a.ServiceDepartmentId && b.ItemId === a.ItemId);
      if (matchedItem) {
        if (matchedItem.DiscountApplicable) {
          a.DiscountPercent = matchedItem.Discount;
          a.DiscountApplicable = matchedItem.DiscountApplicable;
          a.DiscountAmount = (a.DiscountPercent * a.SubTotal) / 100;
        } else {
          a.DiscountPercent = this.currMemDiscountPercent;
          a.DiscountAmount = (a.DiscountPercent * a.SubTotal) / 100;
        }
      } else {
        a.DiscountPercent = this.currMemDiscountPercent;
        a.DiscountAmount = (a.DiscountPercent * a.SubTotal) / 100;
      }

    });

    let overalDiscountAmount = this.model.BillingTransactionItems.reduce((acc, curr) => acc + curr.DiscountAmount, 0);
    let overalSubTotal = this.model.BillingTransactionItems.reduce((acc, curr) => acc + curr.SubTotal, 0);

    this.model.SubTotal = CommonFunctions.parseAmount(overalSubTotal, 3);
    this.model.DiscountAmount = CommonFunctions.parseAmount(overalDiscountAmount, 3);
    this.model.TotalAmount = CommonFunctions.parseAmount(overalSubTotal - overalDiscountAmount, 3);
    if (overalSubTotal > this.model.TotalAmount) {
      this.model.DiscountPercent = Number((((overalSubTotal - this.model.TotalAmount) / overalSubTotal) * 100).toFixed(4));
    }
    else if (overalSubTotal == this.model.TotalAmount) {
      this.model.DiscountPercent = 0;
    }
    this.model.Tender = this.model.TotalAmount;

    this.InvoiceDiscountOnChange();
  }

  public GoToSettlementPage() {
    if (this.patBillHistory.CreditAmount > 0) {
      this.routeFromService._routefrom = "/Billing/BillingTransaction";
      this.routeFromService.routeData = { Action: 'ShowSettlement', PatientId: this.patientService.getGlobal().PatientId }
      this.router.navigate(['/Billing/Settlements/BillSettlements']);
    }
  }

  public MultiplePaymentCallBack($event: any) {
    if ($event && $event.MultiPaymentDetail) {
      this.TempEmployeeCashTransaction = new Array<EmployeeCashTransaction>();
      if ((this.empCashTxn != null || this.empCashTxn != undefined) && this.empCashTxn.PaymentModeSubCategoryId > 0) {
        this.TempEmployeeCashTransaction = $event.MultiPaymentDetail;
        this.TempEmployeeCashTransaction.push(this.empCashTxn);
      } else {
        this.TempEmployeeCashTransaction = $event.MultiPaymentDetail;
      }
      var isDepositUsed = this.TempEmployeeCashTransaction.find(a => a.PaymentSubCategoryName.toLocaleLowerCase() === 'deposit');
      if (isDepositUsed) {
        this.deductDeposit = true;
        this.CalculateDepositBalance();
      }
      else {
        this.deductDeposit = false;
        this.CalculateDepositBalance();
      }
    }
    this.model.PaymentDetails = $event.PaymentDetail;
  }

  // * This handles the Enable Discount Amount checkbox actions.. Krishna,27th'March'22
  EnableDicountAmount() {
    if (this.EnableDiscountAmountField) {
      this.model.BillingTransactionItems.forEach(a => {
        a.BillingTransactionItemValidator.controls["DiscountPercent"].disable();
        a.BillingTransactionItemValidator.controls["DiscountAmount"].enable();

      });
      this.EnableInvoiceLevelDiscountAmountField = true;
    } else {
      this.model.BillingTransactionItems.forEach(a => {
        a.BillingTransactionItemValidator.controls["DiscountPercent"].enable();
        a.BillingTransactionItemValidator.controls["DiscountAmount"].disable();

      });
      this.EnableInvoiceLevelDiscountAmountField = false;
    }
  }

  // * This handles the calculations of Discounts at Invoice Level if Discount Amount is changed, Krishna,27th'March'22
  RecalculateDiscounts() {
    this.model.DiscountPercent = (this.model.DiscountAmount / this.model.SubTotal) * 100;
    //Need to re-calculate aggregatediscounts of each item and Invoice amounts when Invoice Discount is changed.
    this.model.BillingTransactionItems.forEach(itm => {
      itm.DiscountPercentAgg = this.model.DiscountPercent ? this.model.DiscountPercent : 0;
      itm.DiscountPercent = this.model.DiscountPercent ? this.model.DiscountPercent : 0;
      itm.DiscountAmount = itm.SubTotal * itm.DiscountPercentAgg / 100;
      itm.TotalAmount = itm.SubTotal - itm.DiscountAmount;
    });
    this.ReCalculateInvoiceAmounts();
  }

  // * This handles the calculations of Discounts at Item Level if Discount Amount is changed, Krishna,27th'March'22
  ItemLevelDiscountAmountChange(index: number) {
    if (this.model.BillingTransactionItems[index].DiscountAmount == null || this.model.BillingTransactionItems[index].DiscountPercent == null) {
      this.model.BillingTransactionItems[index].DiscountAmount = 0;
      this.model.BillingTransactionItems[index].DiscountPercent = 0;
    }
    this.model.BillingTransactionItems[index].DiscountPercent = Number(((this.model.BillingTransactionItems[index].DiscountAmount / this.model.BillingTransactionItems[index].SubTotal) * 100).toFixed(4));
    this.model.BillingTransactionItems[index].TotalAmount = this.model.BillingTransactionItems[index].SubTotal - this.model.BillingTransactionItems[index].DiscountAmount;

    if (isNaN(this.model.BillingTransactionItems[index].DiscountPercent)) {
      this.model.BillingTransactionItems[index].DiscountPercent = 0;
      this.model.BillingTransactionItems[index].DiscountAmount = 0;
    }
    //reduce function usage: acc -> accumulator, initial value=0, itm -> loop variable (BillingTransactionItem in below case).
    let overallSubTot = this.model.BillingTransactionItems.reduce(function (acc, itm) { return acc + itm.SubTotal; }, 0);
    let overallTotal = this.model.BillingTransactionItems.reduce(function (acc, itm) { return acc + itm.TotalAmount; }, 0);
    if (overallSubTot > overallTotal)
      this.model.DiscountPercent = ((overallSubTot - overallTotal) / overallSubTot) * 100;
    this.ReCalculateInvoiceAmounts();
  }

  // * This handle the calculation of Invoice Amounts when Cash Field in Changed from the UI i.e. ReceivedAmount is changed...
  ReceivedAmountChange() {
    if (this.checkValidationForReceivedAmount()) {
      this.model.CoPaymentCreditAmount = this.model.TotalAmount - this.model.ReceivedAmount;
      this.model.CoPaymentCreditAmount = CommonFunctions.parseAmount(this.model.CoPaymentCreditAmount, 3);
    }
  }

  checkValidationForReceivedAmount() {
    let isValidAmount = true;
    let ReceivedAmount = this.model.ReceivedAmount;
    if (ReceivedAmount < 0) {
      isValidAmount = false;
      this.messageBoxService.showMessage("Error", ["Cash cannot be less than 0!"]);
    }
    if (CommonFunctions.parseAmount(ReceivedAmount, 1) > CommonFunctions.parseAmount(this.model.TotalAmount, 1)) {
      isValidAmount = false;
      this.messageBoxService.showMessage("Error", ["Cash cannot be more than TotalAmount!"]);
    }
    if (this.selectedPriceCategoryObj.IsCoPayment) {
      let CoPaymentCashAmount = this.model.BillingTransactionItems.reduce((acc, itm) => acc + itm.CoPaymentCashAmount, 0);
      if (CommonFunctions.parseAmount(ReceivedAmount, 1) < CommonFunctions.parseAmount(CoPaymentCashAmount, 1)) {
        isValidAmount = false;
        this.messageBoxService.showMessage("Error", ["Cash cannot be less than CoPaymentCash Amount!"]);
      }
    }
    return isValidAmount;
  }

  //* This method is responsible to fetch the MedicareMemberDetail
  GetMedicareMemberDetail(patientId: number): void {
    this.BillingBLService.GetMedicareMemberDetail(patientId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        const medicareMemberDetail = res.Results;
        if (medicareMemberDetail && medicareMemberDetail.MedicareMemberId) {
          this.IsMedicarePatientBilling = true;
          this.model.IsMedicarePatientBilling = this.IsMedicarePatientBilling;
          this.medicareMemberVsBalanceVm = medicareMemberDetail;
          this.CheckEligibilityOfMedicareMember(medicareMemberDetail);
        }
      }
    }, err => {
      this.messageBoxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ["Could not fetch medicare member detail"]);
    });
  }

  //* This method is responsible to check whether the medicare member is eligible for Billing or not, Krishna 8th-Jan'23
  CheckEligibilityOfMedicareMember(medicareMemberDetail: MedicareMemberVsMedicareBalanceVM): void {
    if (!medicareMemberDetail || !medicareMemberDetail.MedicareMemberId) {
      return;
    }
    switch (this.billingType.toLowerCase()) {
      case ENUM_BillingType.outpatient.toLowerCase(): {
        const IsOpLimitExceed = medicareMemberDetail.IsOpLimitExceeded;
        if (IsOpLimitExceed) {
          const OpBalance = medicareMemberDetail.OpBalance;
          this.IsMedicareMemberEligibleForBilling = OpBalance > 0 ? true : false;
          !this.IsMedicareMemberEligibleForBilling && this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Patient is not eligible for Billing in this Price Category"]);
        } else {
          this.IsMedicareMemberEligibleForBilling = true;
        }
        break;
      }

      case ENUM_BillingType.inpatient.toLowerCase(): {
        const IsIpLimitExceed = medicareMemberDetail.IsIpLimitExceeded;
        if (IsIpLimitExceed) {
          const IpBalance = medicareMemberDetail.IpBalance;
          if (IpBalance > 0) {
            this.IsMedicareMemberEligibleForBilling = IpBalance > 0 ? true : false;
            !this.IsMedicareMemberEligibleForBilling && this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Patient is not eligible for Billing in this Price Category"]);
          } else {
            this.IsMedicareMemberEligibleForBilling = true;
          }
        }
        break;
      }
    }
  }

  CheckMedicarePatientBillingValidations(): boolean {
    let isValid = false;
    if (this.IsMedicareMemberEligibleForBilling) {
      isValid = true;
    }
    switch (this.billingType.toLowerCase()) {
      case ENUM_BillingType.outpatient.toLowerCase(): {
        if (this.medicareMemberVsBalanceVm.OpBalance >= this.model.CoPaymentCreditAmount) {
          isValid = true;
        } else {
          isValid = false;
        }
        break;
      }
      case ENUM_BillingType.inpatient.toLowerCase(): {
        if (this.medicareMemberVsBalanceVm.IpBalance >= this.model.CoPaymentCreditAmount) {
          isValid = true;
        } else {
          isValid = false;
        }
        break;
      }
    }
    return isValid;
  }

  public SchemePriceCategory: SchemePriceCategory_DTO = new SchemePriceCategory_DTO();
  public old_priceCategory: number = 0;
  public new_priceCategory: number = 0;
  public ServiceItems: Array<ServiceItemDetails_DTO> = new Array<ServiceItemDetails_DTO>();
  public ServiceItemSchemeSettings: Array<ServiceItemSchemeSetting_DTO> = new Array<ServiceItemSchemeSetting_DTO>();
  OnSchemePriceCategoryChanged(schemePriceObj: SchemePriceCategory_DTO) {
    console.log("SchemePriceCategory Changed-- Captured From billing-transaction Component");
    console.log(schemePriceObj);
    this.SchemePriceCategory = schemePriceObj;
    if (this.old_priceCategory === schemePriceObj.PriceCategoryId) {
      this.GetServiceItemSchemeSetting(ENUM_ServiceBillingContext.OpBilling, schemePriceObj.SchemeId, schemePriceObj.PriceCategoryId);
    } else {
      this.old_priceCategory = schemePriceObj.PriceCategoryId;
      this.GetServiceItems(ENUM_ServiceBillingContext.OpBilling, schemePriceObj.SchemeId, schemePriceObj.PriceCategoryId);
    }
  }

  //* Krishna, 17thMarch'23 This will make a call to API to fetch all the Items and Its related settings with it.
  GetServiceItems(serviceBillingContext: string, schemeId: number, priceCategoryId: number) {
    this.billingMasterBlService.GetServiceItems(serviceBillingContext, schemeId, priceCategoryId)
      .finally(() => console.log("ServiceItem API responded."))
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length > 0) {
          this.ServiceItems = res.Results;
          this.AssignServiceItemsToBillingTransactionItemList(this.ServiceItems);
        } else {
          console.log("This priceCategory does not have Service Items mapped.");
        }
      },
        err => {
          console.log(err);
        }
      );
  }

  //* Krishna, 17thMarch'23 This will make a call to API to fetch only serviceItemSchemeSetting not the item iteself.
  GetServiceItemSchemeSetting(serviceBillingContext: string, schemeId: number, priceCategoryId: number) {
    this.billingMasterBlService.GetServiceItemSchemeSetting(serviceBillingContext, schemeId)
      .finally(() => console.log("ServiceItemsSchemeSetting API responded."))
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results.length > 0) {
          this.ServiceItemSchemeSettings = res.Results;
        } else {
          console.log("This scheme and context does not have Settings mapped");
        }
      },
        err => {
          console.log(err);
        }
      );
  }

  //! We need to change this logic as per new UI changes(this change is dependent on new UI changes).
  AssignServiceItemsToBillingTransactionItemList(serviceItems: Array<ServiceItemDetails_DTO>) {
    if (serviceItems && serviceItems.length) {
      // serviceItems.forEach((item, index) => {
      //   this.model.BillingTransactionItems[0].ItemList[index].ServiceItemId = item.ServiceItemId;
      //   this.model.BillingTransactionItems[0].ItemList[index].ItemName = item.ItemName;
      //   this.model.BillingTransactionItems[0].ItemList[index].ItemCode = item.ItemCode;
      //   this.model.BillingTransactionItems[0].ItemList[index].Price = item.Price;
      //   this.model.BillingTransactionItems[0].ItemList[index].ServiceDepartmentId = item.ServiceDepartmentId;
      //   this.model.BillingTransactionItems[0].ItemList[index].ServiceDepartmentName = item.ServiceDepartmentName;
      //   this.model.BillingTransactionItems[0].ItemList[index].IsDoctorMandatory = item.IsDoctorMandatory;
      //   this.model.BillingTransactionItems[0].ItemList[index].DiscountApplicable = item.IsDiscountApplicable;
      //   this.model.BillingTransactionItems[0].ItemList[index].DiscountPercent = item.DiscountPercent;
      //   this.model.BillingTransactionItems[0].ItemList[index].IsZeroPriceAllowed = item.IsZeroPriceAllowed;
      //   this.model.BillingTransactionItems[0].ItemList[index].IsPriceChangeAllowed = item.IsPriceChangeAllowed;
      //   this.model.BillingTransactionItems[0].ItemList[index].IsCoPayment = item.IsCoPayment;
      //   this.model.BillingTransactionItems[0].ItemList[index].CoPaymentCashPercent = item.CoPayCashPercent;
      //   this.model.BillingTransactionItems[0].ItemList[index].CoPaymentCreditPercent = item.CoPayCreditPercent;
      // });
    }
  }

  MapBillingTransactionItemListWithServiceItemSetting(serviceItemSchemeSetting: Array<ServiceItemSchemeSetting_DTO>) {
    if (serviceItemSchemeSetting && serviceItemSchemeSetting.length) {
      this.ServiceItems.forEach((item) => {
        const matchedServiceItem = serviceItemSchemeSetting.find(a => a.ServiceItemId === item.ServiceItemId);
        if (matchedServiceItem) {
          item.DiscountPercent = matchedServiceItem.DiscountPercent;
          item.IsCoPayment = matchedServiceItem.IsCoPayment;
        }
      });
      //! We need a logic to somehow add ItemList to each row;
      if (this.model.BillingTransactionItems && this.model.BillingTransactionItems.length) {
        this.model.BillingTransactionItems.forEach((item) => {
          const alreadyAddedMatchedItem = serviceItemSchemeSetting.find(a => a.ServiceItemId === item.ServiceItemId);
          if (item) {
            item.DiscountPercent = alreadyAddedMatchedItem.DiscountPercent;
            item.IsCoPayment = alreadyAddedMatchedItem.IsCoPayment;
            item.CoPaymentCashPercent = alreadyAddedMatchedItem.CoPaymentCashPercent;
            item.CoPaymentCreditPercent = alreadyAddedMatchedItem.CoPaymentCreditPercent;
          }
        });

      } else {

      }
    }
  }

}
