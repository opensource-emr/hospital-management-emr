import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { Validators } from "@angular/forms";
import * as _ from "lodash";
import * as moment from 'moment/moment';
import { CurrentVisitContextVM } from '../../../appointments/shared/current-visit-context.model';
import { BillingTransactionItem } from "../../../billing/shared/billing-transaction-item.model";
import { BillingTransaction } from "../../../billing/shared/billing-transaction.model";
import { BillingBLService } from "../../../billing/shared/billing.bl.service";
import { BillingService } from "../../../billing/shared/billing.service";
import { PatientBillingContextVM } from "../../../billing/shared/patient-billing-context-vm";
import { CoreService } from "../../../core/shared/core.service";
import { Patient } from "../../../patients/shared/patient.model";
import { SecurityService } from "../../../security/shared/security.service";
import { PriceCategory } from "../../../settings-new/shared/price.category.model";
import { ServiceDepartmentVM } from "../../../shared/common-masters.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from '../../../shared/common.functions';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_BillingStatus, ENUM_DanpheHTTPResponses, ENUM_LabTypes, ENUM_MessageBox_Status, ENUM_OrderStatus, ENUM_PriceCategory } from "../../../shared/shared-enums";
import { BillingInvoiceBlService } from "../../shared/billing-invoice.bl.service";
import { BillingMasterBlService } from "../../shared/billing-master.bl.service";
import { BillingAdditionalServiceItem_DTO } from "../../shared/dto/bill-additional-service-item.dto";
import { InvoiceItem_DTO } from "../../shared/dto/billing-invoiceitem.dto";
import { BillingPackages_DTO } from "../../shared/dto/billing-packages.dto";
import { SchemePriceCategory_DTO } from "../../shared/dto/scheme-pricecategory.dto";
import { ServiceItemDetails_DTO } from "../../shared/dto/service-item-details.dto";

@Component({
  selector: 'ip-bill-item-request',
  templateUrl: './ip-bill-item-request.html',
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class IpBillItemRequest implements OnInit {

  @Input("patientInfo")
  public PatientInfo: Patient;
  @Input("patientId")
  public PatientId: number;
  @Input("visitId")
  public VisitId: number;
  @Output("emit-billItemReq")
  public EmitBillItemRequest: EventEmitter<Object> = new EventEmitter<Object>();
  @Input("department")
  public Department: string = null;
  @Input("past-tests")
  public PastTests: Array<any> = [];
  @Input("selected-price-category")
  public DefaultPriceCategory: any;
  @Input("discount-scheme-id")
  public DiscountSchemaId: number = null;
  @Input("scheme-price-category")
  public SchemePriceCategoryObj: SchemePriceCategoryCustomType = { SchemeId: 0, PriceCategoryId: 0 };
  //master data
  public BillItems: Array<any>;
  public BillItemsComplete: Array<any>;
  public ServiceDepartmentList: Array<ServiceDepartmentVM>;
  public DoctorsList: Array<any> = [];
  public ShowIpBillRequestSlip: Boolean = false;
  public BillingTransaction: BillingTransaction = new BillingTransaction();;
  //seleted items
  public SelectedItems = [];
  public SelectedServiceDepartments: Array<any> = [];
  public SelectedAssignedToDoctor: Array<any> = [];
  public SelectedRequestedByDoctor: Array<any> = [];
  public VisitList: Array<any>;
  public BillingType = "inpatient";
  public loading = false;
  public TaxDetail = { taxPercent: 0, taxId: 0 };
  public CurrentBillingContext: PatientBillingContextVM = null;
  public GroupDiscountPercent: number = 0;
  public CurrentPatientVisitContext: CurrentVisitContextVM;
  public PostSuccessBool: boolean = false;
  public DiscountPercentSchemeValid: boolean = true;
  public SearchByItemCode: boolean = true; //for items search
  public AllRequestedData: any = null;
  public BillingRequestDisplaySettings: any = null;
  public LabTypeName: string = ENUM_LabTypes.OpLab.toLowerCase();
  public HasMultipleLabType: boolean = false;
  public SelectedPriceCategoryObj: PriceCategory = new PriceCategory();
  public AllPriceCategories: Array<any> = [];
  public SchemePriceCategory: SchemePriceCategory_DTO = new SchemePriceCategory_DTO();
  public ConfirmationTitle: string = "Confirm!";
  public ConfirmationMessage: string = "Are you sure you want to Proceed?";
  public AdditionalServiceItems = new Array<BillingAdditionalServiceItem_DTO>();
  public HasAdditionalServiceItem: boolean = false;
  public HasAdditionalServiceItemSelected: boolean = false;
  public SelectedAdditionalInvoiceItem = new ServiceItemDetails_DTO();
  public AdditionalInvoiceItem = new InvoiceItem_DTO();
  public SelectedInvoiceItemForAdditionalItemCalculation = new InvoiceItem_DTO();
  public SelectedAdditionalItem = new BillingAdditionalServiceItem_DTO();
  public CallBackFromAdditionalItemsSelection: boolean = false;
  public IsPackageBilling: boolean = false;
  public SelectedPackage = new BillingPackages_DTO();
  public ServicePackages = new Array<BillingPackages_DTO>();
  public PreviouslySelectedPackage = new BillingPackages_DTO();
  public PreviouslySelectedPackageServiceItem = [];
  public ProvisionalReceiptInputs = { PatientId: 0, ProvFiscalYrId: 0, ProvReceiptNo: 0, visitType: null };
  public RequestingDepartmentId: number = null;
  public NextIndex: number = 0;
  public PriceCategory: string = ENUM_PriceCategory.Normal;
  public BillRequestDoubleEntryWarningTimeHrs: number = 0;
  public PastTestList: any = [];
  public PastTestList_ForDuplicate: any = [];
  public TotalAdditionalServiceItems: number = 0;
  constructor(
    private _messageBoxService: MessageboxService,
    private _securityService: SecurityService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _billingBLService: BillingBLService,
    public billingService: BillingService,
    public coreService: CoreService,
    private _billingInvoiceBlService: BillingInvoiceBlService,
    private _billingMasterBlService: BillingMasterBlService
  ) {
    this.SearchByItemCode = this.coreService.UseItemCodeItemSearch();
    this.SetBillingItemsNPrices();
    this.BillRequestDoubleEntryWarningTimeHrs = this.coreService.LoadIPBillRequestDoubleEntryWarningTimeHrs();
    this.GetBillingRequestDisplaySettings();
    if (this.coreService.labTypes.length > 1) {
      this.HasMultipleLabType = true;
    } else {
      this.HasMultipleLabType = false;
      this.LabTypeName = this.coreService.labTypes[0].LabTypeName;
    }
    this.GetPriceCategory();
  }

  ngOnChanges() {
    if (this.DefaultPriceCategory) {
      this.SelectedPriceCategoryObj = this.DefaultPriceCategory;
    }
  }

  ngOnInit() {
    this.ResetVariables();
    //sud:2May'20: moving doctorsList-Set after ResetVariables is called since this function later uses page variable and which should be loaded first.
    this.SetDoctorsList();
    this.ServiceDepartmentList = this.coreService.Masters.ServiceDepartments;
    this.ServiceDepartmentList = this.ServiceDepartmentList.filter(a => a.ServiceDepartmentName !== "OPD");
    if (this.PatientId) {
      this.GetPatientVisitList(this.PatientId);
      this.LoadPatientBillingContext(this.PatientId);
      this.GetVisitContext(this.PatientId, this.VisitId);
    }
    this.ItemsListFormatter = this.ItemsListFormatter.bind(this);//to use global variable in list formatter auto-complete
    this.PastTest(this.PastTests);
    this.SetLabTypeNameInLocalStorage();
    this.SelectedPriceCategoryObj = this.DefaultPriceCategory;
  }

  hotkeys(event): void {
    if (!this.HasAdditionalServiceItem && event.keyCode === 27) { //ESC
      this.CloseThisPage();
    }
    //! Press F1, to enable package billing
    if (event.keyCode === 112) {
      event.preventDefault();
      this.IsPackageBilling = !this.IsPackageBilling;
      this.SelectedPackage = new BillingPackages_DTO();
      this.HandlePackageBillingChange();
    }
  }

  HandlePackageBillingChange(): void {
    if (this.IsPackageBilling) {
      this.ResetVariables();
      this.GetServicePackages();
    }
    else {
      this.ResetVariables();
    }
  }

  ServicePackagesListFormatter(data: any): string {
    return data["BillingPackageName"];
  }

  OnServicePackageSelection(): void {
    if (this.SelectedPackage && this.SelectedPackage.BillingPackageId === this.PreviouslySelectedPackage.BillingPackageId) {
      return;
    }
    if (this.PreviouslySelectedPackageServiceItem.length > 0) {
      this.BillingTransaction = this.billingService.CreateNewGlobalBillingTransaction();
      this.BillingTransaction.SchemeId = this.SchemePriceCategoryObj.SchemeId;
      let billItem = this.NewBillingTransactionItem();
      this.BillingTransaction.BillingTransactionItems.push(billItem);
    }
    if (this.SelectedPackage.BillingPackageId) {
      const filteredItems = this.BillItems.filter(billingItem =>
        this.SelectedPackage.BillingPackageServiceItemList.find(selectedItem =>
          selectedItem.ServiceItemId === billingItem.ServiceItemId
        )
      );
      filteredItems.forEach((element, index) => {
        this.SelectedItems[index] = element;
        this.AssignSelectedItem(index);
        if (index < filteredItems.length - 1) {
          this.AddTxnItemRowOnClick(index);
        }
      });
      this.PreviouslySelectedPackage = this.SelectedPackage;
      this.PreviouslySelectedPackageServiceItem = this.SelectedItems;
      this.setFocusById('btn_billRequestAndPrint');
    }
  }

  GetServicePackages(): void {
    this._billingMasterBlService.GetServicePackages(this.SchemePriceCategoryObj.SchemeId, this.SchemePriceCategoryObj.PriceCategoryId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length > 0) {
            this.ServicePackages = res.Results;
            this.setFocusById('search_packages');
          }
        }
        else {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Unable to fetch ServicePackages"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  GetPriceCategory(): void {
    let priceCategory = this.coreService.Masters.PriceCategories;
    this.AllPriceCategories = priceCategory.filter(a => a.IsActive);
  }

  SetLabTypeNameInLocalStorage(): void {
    let labTypeInStorage = localStorage.getItem('BillingSelectedLabTypeName');
    if (this.coreService.labTypes.length === 1) {
      this.LabTypeName = this.coreService.labTypes[0].LabTypeName;
      localStorage.setItem('BillingSelectedLabTypeName', this.LabTypeName);
    }
    else {
      if (labTypeInStorage) {
        this.LabTypeName = labTypeInStorage;
      }
    }
  }


  ResetVariables(): void {
    this.SelectedItems = [];
    this.SelectedAssignedToDoctor = [];
    this.SelectedServiceDepartments = [];
    this.SelectedRequestedByDoctor = [];
    this.VisitList = [];
    this.BillingTransaction = new BillingTransaction();
    this.BillingTransaction.SchemeId = this.SchemePriceCategoryObj.SchemeId;
    this.AddNewBillTxnItemRow();
    this.TaxDetail.taxId = this.billingService.taxId;
    this.TaxDetail.taxPercent = this.billingService.taxPercent;
    this.GroupDiscountPercent = 0;
    this.SelectedPackage = new BillingPackages_DTO();
  }

  ItemGroupDiscount(): void {
    this.BillingTransaction.BillingTransactionItems.forEach(item => {
      item.DiscountPercent = this.GroupDiscountPercent;
    });
    this.CalculationForAll();
  }

  //-------------- implementing individual discount from the total discount percentahe----------
  CalculationForAll(): void {
    if (this.BillingTransaction.BillingTransactionItems.length) {
      let DP: number = 0; //discountPercent for the model (aggregate total)
      let Dp: number = 0; // discountPercent for individual item
      let totalTax: number = 0;
      let loopTax: number = 0;
      let SubTotal: number = 0;
      let totalAmount: number = 0;
      let totalAmountAgg: number = 0;
      let totalQuantity: number = 0;
      let subtotal: number = 0;
      let calSubTotal: number = 0;
      let subTotalForDiscountAmount: number = 0;
      DP = this.BillingTransaction.DiscountPercent;
      let successiveDiscount: number = 0;
      let totalAmountForDiscountAmount: number = 0;
      let DiscountAgg: number = 0;
      //-------------------------------------------------------------------------------------------------------------------------------
      for (let i = 0; i < this.BillingTransaction.BillingTransactionItems.length; i++) {
        let curRow = this.BillingTransaction.BillingTransactionItems[i];
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
        calSubTotal = calSubTotal + subtotal;
        totalTax = totalTax + loopTax;
        let DiscountedAmountTotalAgg = (DiscountedAmountItem - DP * DiscountedAmountItem / 100);
        totalAmountAgg = DiscountedAmountTotalAgg + curRow.Tax;
        totalAmount = DiscountedAmountTotal + curRow.Tax;
        curRow.TotalAmount = CommonFunctions.parseAmount(totalAmount);
        totalAmountForDiscountAmount = totalAmountForDiscountAmount + curRow.TotalAmount;
        SubTotal = SubTotal + totalAmountAgg;
        let CurQuantity = curRow.Quantity;
        totalQuantity = Number(totalQuantity) + Number(CurQuantity);
        subTotalForDiscountAmount = subTotalForDiscountAmount + subtotal;
        curRow.DiscountAmount = CommonFunctions.parseAmount(subtotal - DiscountedAmountTotal);
        //if tax not applicable then taxable amount will be zero. else: taxable amount = total-discount.
        //opposite logic for NonTaxableAmount
        curRow.TaxableAmount = curRow.IsTaxApplicable ? (curRow.SubTotal - curRow.DiscountAmount) : 0;//added: sud: 29May'18
        curRow.NonTaxableAmount = curRow.IsTaxApplicable ? 0 : (curRow.SubTotal - curRow.DiscountAmount);//added: sud: 29May'18
      }
      this.BillingTransaction.SubTotal = CommonFunctions.parseAmount(calSubTotal);
      this.BillingTransaction.TotalQuantity = CommonFunctions.parseAmount(totalQuantity);
      this.BillingTransaction.DiscountAmount = CommonFunctions.parseAmount(DiscountAgg * (this.BillingTransaction.SubTotal) / 100);
      //this.model.DiscountAmount = Math.round(((this.model.SubTotal - totalAmountforDiscountAmount) * 100) / 100);
      //this.model.DiscountPercent = this.model.SubTotal != 0 ? Math.round(((this.model.DiscountAmount * 100) / this.model.SubTotal) * 1) / 1 : this.model.DiscountPercent;
      this.BillingTransaction.TotalAmount = CommonFunctions.parseAmount(SubTotal);
      this.BillingTransaction.TaxTotal = CommonFunctions.parseAmount(totalTax);
    }
    else {
      this.BillingTransaction.SubTotal = 0;
      this.BillingTransaction.TotalAmount = 0;
      this.BillingTransaction.DiscountAmount = 0;
      this.BillingTransaction.DiscountPercent = 0;
      this.BillingTransaction.TotalQuantity = 0;
    }
  }
  //-------------- implementing individual discount from the total discount percentage----------

  //----------start: post billing transaction--------------------------------

  SubmitBillingTransaction(): void {
    //this.loading is set to true from the HTML. to handle double-Click.
    //check if there's other better alternative. till then let it be.. --sud:23Jan'18
    if (this.loading) {
      //set loading=true so that the butotn will be disabled to avoid Double-Click
      ///Its COMPULSORY to disable : DON'T CHANGE THIS -- sud: 21Jan2018
      this.loading = true;
      //to delete row having no item name
      this.BillingTransaction.BillingTransactionItems.forEach(txnItm => {
        if (txnItm.ItemName === null && this.BillingTransaction.BillingTransactionItems.length > 1) {
          this.BillingTransaction.BillingTransactionItems.splice(this.BillingTransaction.BillingTransactionItems.indexOf(txnItm), 1);
        }
      });
      this.SetBillingTxnDetails();
      if (this.CheckValidations()) {
        // this.PostToDepartmentRequisition();
        this.PostProvisionalDepartmentRequisition();
      }
      else {
        this.loading = false;
      }
    }
  }

  PostProvisionalDepartmentRequisition(): void {
    const billingTransaction = _.cloneDeep(this.BillingTransaction);
    const billingTransactionItems = _.cloneDeep(this.BillingTransaction.BillingTransactionItems);
    this._billingBLService.ProceedToBillingTransaction(billingTransaction, billingTransactionItems, "active", "provisional", false, this.CurrentPatientVisitContext)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
          this.AllRequestedData = res.Results;
          this.loading = false;
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Item added successfully"]);
          if (this.PostSuccessBool) {
            this.ProvisionalReceiptInputs.PatientId = this.PatientId;
            this.ProvisionalReceiptInputs.ProvFiscalYrId = this.AllRequestedData[0].ProvisionalFiscalYearId;
            this.ProvisionalReceiptInputs.ProvReceiptNo = this.AllRequestedData[0].ProvisionalReceiptNo;
            this.ProvisionalReceiptInputs.visitType = null;//sending null from here for now.. Check this later..
            this.ShowIpBillRequestSlip = true;
          } else {
            this.EmitBillItemRequest.emit({ newItems: this.AllRequestedData });
          }
        }
        else {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Unable to complete transaction."]);
          console.log(res.ErrorMessage)
          this.loading = false;
        }
      });
  }

  PrintBillRequestSlip(): void {
    if (this.CheckValidations()) {
      this.SubmitBillingTransaction();
    }
    else {
      this.loading = false;
    }
  }

  SetBillingTxnDetails(): void {
    let currentVisit = this.VisitList.find(visit => visit.PatientVisitId === this.VisitId);
    this.BillingTransaction.TaxId = this.TaxDetail.taxId;
    this.BillingTransaction.BillingTransactionItems.forEach(txnItem => {
      txnItem.PatientVisitId = this.VisitId;
      txnItem.PatientId = this.PatientId;
      if (txnItem.SrvDeptIntegrationName && (txnItem.SrvDeptIntegrationName.toLowerCase() !== "lab")) {
        txnItem.LabTypeName = null;
      } else {
        txnItem.LabTypeName = this.LabTypeName;
      }
      txnItem.BillingPackageId = this.SelectedPackage.BillingPackageId ? this.SelectedPackage.BillingPackageId : null;
      txnItem.RequestingDeptId = this.CurrentBillingContext ? this.CurrentBillingContext.RequestingDeptId : null;
      txnItem.BillingType = this.billingService.BillingType;
      txnItem.VisitType = this.billingService.BillingType.toLowerCase();
      txnItem.BillStatus = ENUM_BillingStatus.provisional;// "provisional";
      txnItem.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
      txnItem.CreatedBy = this._securityService.GetLoggedInUser().EmployeeId;
      txnItem.CounterId = this._securityService.getLoggedInCounter().CounterId;
      txnItem.CounterDay = moment().format("YYYY-MM-DD");
      txnItem.DiscountSchemeId = this.SchemePriceCategoryObj.SchemeId;
      const coPaymentCashAmount = this._billingInvoiceBlService.CalculateAmountFromPercentage(txnItem.CoPaymentCashPercent, txnItem.TotalAmount);
      const coPaymentCreditAmount = this._billingInvoiceBlService.CalculateAmountFromPercentage(txnItem.CoPaymentCreditPercent, txnItem.TotalAmount);
      txnItem.CoPaymentCashAmount = coPaymentCashAmount ? coPaymentCashAmount : 0;
      txnItem.CoPaymentCreditAmount = coPaymentCreditAmount ? coPaymentCreditAmount : 0;
      txnItem.OrderStatus = ENUM_OrderStatus.Active;//'active'
    });
  }

  CheckValidations(): boolean {
    let isFormValid = true;
    if (this.PatientId && this.VisitId) {
      if (this.CheckSelectionFromAutoComplete() && this.BillingTransaction.BillingTransactionItems.length) {
        for (var i = 0; i < this.BillingTransaction.BillingTransactionItems.length; i++) {
          let currTxnItm = this.BillingTransaction.BillingTransactionItems[i];
          //for IsZeroPriceAlowed case...
          var item = currTxnItm.ItemList.find(a => a.ServiceItemId === currTxnItm.ServiceItemId && a.ServiceDepartmentId === currTxnItm.ServiceDepartmentId);
          if (item && item.IsZeroPriceAllowed) {
            currTxnItm.UpdateValidator("off", "Price", "positiveNumberValdiator");
          }
          for (var valCtrls in currTxnItm.BillingTransactionItemValidator.controls) {
            currTxnItm.BillingTransactionItemValidator.controls[valCtrls].markAsDirty();
            currTxnItm.BillingTransactionItemValidator.controls[valCtrls].updateValueAndValidity();
          }
        }
        for (var i = 0; i < this.BillingTransaction.BillingTransactionItems.length; i++) {
          let currTxnItm_1 = this.BillingTransaction.BillingTransactionItems[i];
          //break loop if even a single txn item is invalid.
          if (!currTxnItm_1.IsValidCheck(undefined, undefined)) {
            isFormValid = false;
            break;
          }
        }
        if (!this.DiscountPercentSchemeValid) {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Check Discount Schema (%)."]);
          isFormValid = false;
        }
      }
      else {
        isFormValid = false;
      }
    }
    else {
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Invalid Patient/Visit Id."]);
      isFormValid = false;
    }
    return isFormValid;
  }

  CheckSelectionFromAutoComplete(): boolean {
    if (this.BillingTransaction.BillingTransactionItems.length) {
      for (let itm of this.BillingTransaction.BillingTransactionItems) {
        if (!itm.IsValidSelDepartment) {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Select item from list."]);
          this.loading = false;
          return false;
        }
      }
      return true;
    }
  }

  //posts to Departments Requisition Table
  PostToDepartmentRequisition(): void {
    //orderstatus="active" and billingStatus="provisional" when sent from billingpage.
    this._billingBLService.PostDepartmentOrders(this.BillingTransaction.BillingTransactionItems, "active", "provisional", false, this.CurrentPatientVisitContext)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.PostToBillingTransaction();
        }
        else {
          this.loading = false;
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Unable to do lab request.Please try again later"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  PostToBillingTransaction(): void {
    this.BillingTransaction.BillingTransactionItems.forEach(a => a.PatientVisitId = this.VisitId);
    this._billingBLService.PostBillingTransactionItems(this.BillingTransaction.BillingTransactionItems)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.AllRequestedData = res.Results;
          this.loading = false;
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Item added successfully"]);
          console.log(this.PostSuccessBool);
          if (this.PostSuccessBool) {
            this.ProvisionalReceiptInputs.PatientId = this.PatientId;
            this.ProvisionalReceiptInputs.ProvFiscalYrId = this.AllRequestedData[0].ProvisionalFiscalYearId;
            this.ProvisionalReceiptInputs.ProvReceiptNo = this.AllRequestedData[0].ProvisionalReceiptNo;
            this.ProvisionalReceiptInputs.visitType = null;//sending null from here for now.. Check this later..
            this.ShowIpBillRequestSlip = true;
          } else {
            this.EmitBillItemRequest.emit({ newItems: this.AllRequestedData });
          }
        }
        else {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
          this.loading = false;
        }
      });
  }

  //----------end: post billing transaction-----------------------------------



  //start: get: master and patient data
  LoadPatientBillingContext(patientId): void {
    this._billingBLService.GetPatientBillingContext(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.CurrentBillingContext = res.Results;
          this.billingService.BillingType = this.CurrentBillingContext.BillingType;
          this.BillingType = this.CurrentBillingContext.BillingType;
        }
      });
  }

  SetBillingItemsNPrices(): void {
    // this.billItemsComplete = this.billingService.allBillItemsPriceList;
    // this.billItems = this.billItemsComplete.filter(item => item.ServiceDepartmentName != "OPD");
    this.BillItemsComplete = this._billingMasterBlService.ServiceItemsForIp;
    this.AdditionalServiceItems = this._billingMasterBlService.AdditionalServiceItems;
    this.BillItems = this.BillItemsComplete.filter(item => item.ServiceDepartmentName !== "OPD");
    if (this.BillingTransaction.BillingTransactionItems && this.BillingTransaction.BillingTransactionItems.length > 0
      && (!this.BillingTransaction.BillingTransactionItems[0].ItemList)) {
      this.BillingTransaction.BillingTransactionItems[0].ItemList = this.BillItems;
    }
  }

  GetPatientVisitList(patientId): void {
    this._billingBLService.GetPatientVisitsProviderWise(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length) {
          this.VisitList = res.Results;
          this.AssignDoctorsToFirstBillItem();
          this.GetVisitContext(this.PatientId, this.VisitList[0].PatientVisitId);
        }
        else {
          console.log(res.ErrorMessage);
        }
      },
        err => {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["unable to get PatientVisit list.. check log for more details."]);
          console.log(err.ErrorMessage);
        });
  }


  AssignDoctorsToFirstBillItem(): void {
    if (this.DoctorsList && this.DoctorsList.length > 0 && this.VisitList && this.VisitList.length > 0) {
      let doc = this.DoctorsList.find(a => a.EmployeeId === this.VisitList[0].PerformerId);
      if (doc) {
        this.SelectedRequestedByDoctor[0] = doc.FullName;
        this.AssignRequestedByDoctor(0);
      }
    }
  }

  GetVisitContext(patientId: number, visitId: number): void {
    if (patientId && visitId) {
      this._billingBLService.GetDataOfInPatient(patientId, visitId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.Current_WardBed) {
            this.CurrentPatientVisitContext = res.Results;
            this.RequestingDepartmentId = this.CurrentPatientVisitContext.RequestingDepartmentId;
            // this.SchemePriceCategoryObj.SchemeId = this.currPatVisitContext.SchemeId;
            // this.SchemePriceCategoryObj.PriceCategoryId = this.currPatVisitContext.PriceCategoryId;
          }
          else {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Problem! Cannot get the Current Visit Context ! "])
          }
        },
          err => {
            console.log(err.ErrorMessage);
          });
    }
  }

  SetDoctorsList(): void {
    //reuse the doctor's list coming from billing service to avoid server calls.//sud:2May'20
    this.DoctorsList = this.billingService.GetDoctorsListForBilling();

    let Obj = new Object();
    Obj["EmployeeId"] = null; //change by Yub -- 23rd Aug '18
    Obj["FullName"] = "SELF";
    this.DoctorsList.push(Obj);
    if (this.BillingTransaction && this.BillingTransaction.BillingTransactionItems && this.BillingTransaction.BillingTransactionItems.length > 0) {
      this.BillingTransaction.BillingTransactionItems[0].AssignedDoctorList = this.DoctorsList;
      this.AssignDoctorsToFirstBillItem();
    }
  }

  GetServiceDeptNameById(servDeptId: number): string {
    if (this.ServiceDepartmentList) {
      let srvDept = this.ServiceDepartmentList.find(a => a.ServiceDepartmentId === servDeptId);
      return srvDept ? srvDept.ServiceDepartmentName : null;
    }
  }
  //end: get: master and patient data

  //start: autocomplete assign functions and item filter logic
  AssignSelectedItem(index): void {
    let item = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.SelectedItems[index]) {
      if (typeof (this.SelectedItems[index]) === 'string' && this.BillingTransaction.BillingTransactionItems[index].ItemList.length) {
        item = this.BillingTransaction.BillingTransactionItems[index].ItemList.find(a => a.ItemName.toLowerCase() === this.SelectedItems[index].toLowerCase());
      }
      else if (typeof (this.SelectedItems[index]) === 'object')
        item = this.SelectedItems[index];
      if (item) {
        this.SelectedInvoiceItemForAdditionalItemCalculation = item;
        let discountApplicable = item.IsDiscountApplicable;
        if (this.BillingType.toLowerCase() !== "inpatient") {
          let extItem = this.BillingTransaction.BillingTransactionItems.find(a => a.ServiceItemId === item.ServiceItemId && a.ServiceDepartmentId === item.ServiceDepartmentId);
          let extItemIndex = this.BillingTransaction.BillingTransactionItems.findIndex(a => a.ServiceItemId === item.ServiceItemId && a.ServiceDepartmentId === item.ServiceDepartmentId);
          if (extItem && index != extItemIndex) {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [item.ItemName + " is already entered."]);
            this._changeDetectorRef.detectChanges();
            this.BillingTransaction.BillingTransactionItems[index].IsDuplicateItem = true;
          }
          else
            this.BillingTransaction.BillingTransactionItems[index].IsDuplicateItem = false;
        }
        this.BillingTransaction.BillingTransactionItems[index].IntegrationItemId = item.IntegrationItemId;
        this.BillingTransaction.BillingTransactionItems[index].ItemId = item.ItemId;
        this.BillingTransaction.BillingTransactionItems[index].ItemCode = item.ItemCode;
        this.BillingTransaction.BillingTransactionItems[index].ItemName = item.ItemName;
        this.SelectedItems[index] = this.BillingTransaction.BillingTransactionItems[index].ItemName;
        this.BillingTransaction.BillingTransactionItems[index].TaxPercent = item.TaxApplicable ? this.TaxDetail.taxPercent : 0;
        this.BillingTransaction.BillingTransactionItems[index].IsTaxApplicable = item.TaxApplicable;
        //this.billingTransaction.BillingTransactionItems[index].TaxableAmount = item.TaxApplicable ? item.Price : 0;
        this.BillingTransaction.BillingTransactionItems[index].DiscountSchemeId = this.SchemePriceCategory.SchemeId;
        this.BillingTransaction.BillingTransactionItems[index].Price = item.Price;
        this.BillingTransaction.BillingTransactionItems[index].PriceCategory = null;
        this.BillingTransaction.BillingTransactionItems[index].PriceCategoryId = this.SchemePriceCategory.PriceCategoryId;
        this.BillingTransaction.BillingTransactionItems[index].ServiceItemId = item.ServiceItemId;
        this.BillingTransaction.BillingTransactionItems[index].IsCoPayment = item.IsCoPayment;
        this.BillingTransaction.BillingTransactionItems[index].CoPaymentCashPercent = item.CoPayCashPercent;
        this.BillingTransaction.BillingTransactionItems[index].CoPaymentCreditPercent = item.CoPayCreditPercent;
        this.BillingTransaction.BillingTransactionItems[index].IsDoctorMandatory = item.IsDoctorMandatory;
        if (!discountApplicable) {
          //Yubraj 29th July -- Disable discount TextBox in case of DiscountApplicable is false
          //If item is not DiscountApplicable, Discunt percentshould be '0' (zero) and textBox is disable
          this.BillingTransaction.BillingTransactionItems[index].EnableControl("DiscountPercent", false);
          this.BillingTransaction.BillingTransactionItems[index].DiscountPercent = 0;
          this.BillingTransaction.BillingTransactionItems[index].DiscountApplicable = false;
        }
        else {
          this.BillingTransaction.BillingTransactionItems[index].DiscountPercent = item.DiscountPercent;
          this.BillingTransaction.BillingTransactionItems[index].DiscountApplicable = true;
        }
        //this.billingTransaction.BillingTransactionItems[index].DiscountPercent = this.groupDiscountPercent;
        this.BillingTransaction.BillingTransactionItems[index].ProcedureCode = item.ProcedureCode;
        //add also the servicedepartmentname property of the item; needed since most of the filtering happens on this value
        this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentName = this.GetServiceDeptNameById(item.ServiceDepartmentId);
        this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentId = item.ServiceDepartmentId;
        this.SelectedServiceDepartments[index] = this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentName;
        this.BillingTransaction.BillingTransactionItems[index].IsValidSelDepartment = true;
        this.BillingTransaction.BillingTransactionItems[index].IsValidSelItemName = true;
        this.FilterBillItems(index);
        this.CheckItemProviderValidation(index);
        this.CalculationForAll();
        this.ResetDoctorListOnItemChange(item, index);
        this.HasAdditionalServiceItem = this.HasAdditionalServiceItemSelected = item.HasAdditionalBillingItems;
        this.NextIndex = index + 1;

        if (item.IsDoctorMandatory) {
          this.AssignPerformer(index, item);
        }
      }
      else
        this.BillingTransaction.BillingTransactionItems[index].IsValidSelItemName = false;
      if (!item && !this.SelectedServiceDepartments[index]) {
        this.BillingTransaction.BillingTransactionItems[index].ItemList = this.BillItems;
        if (this.LabTypeName === 'er-lab') {
          this.BillingTransaction.BillingTransactionItems[index].ItemList = this.BillItems.filter(a => a.SrvDeptIntegrationName !== "OPD" && (a.IsErLabApplicable === true || a.SrvDeptIntegrationName !== 'LAB'));
        }
      }
      this.CheckForDoubleEntry();
      if (item) {
        // this.model.BillingTransactionItems[index].BillingTransactionItemValidator.controls['Price'].enable();
        if (item.IsPriceChangeAllowed && item.IsZeroPriceAllowed) {
          this.BillingTransaction.BillingTransactionItems[index].BillingTransactionItemValidator.controls['Price'].enable();
        }
        else if (item.IsPriceChangeAllowed && !item.IsZeroPriceAllowed) {
          this.BillingTransaction.BillingTransactionItems[index].BillingTransactionItemValidator.controls['Price'].enable();
        }
        else if (!item.IsPriceChangeAllowed && item.IsZeroPriceAllowed) {
          this.BillingTransaction.BillingTransactionItems[index].BillingTransactionItemValidator.controls['Price'].disable();
        }
        else if (item.IsPriceChangeAllowed) {
          this.BillingTransaction.BillingTransactionItems[index].BillingTransactionItemValidator.controls['Price'].enable();
        }
        else if (!item.IsPriceChangeAllowed && !item.IsZeroPriceAllowed) {
          this.BillingTransaction.BillingTransactionItems[index].BillingTransactionItemValidator.controls['Price'].disable();
        }
      }
    } else {
      this.BillingTransaction.BillingTransactionItems[index].IsDoubleEntry_Past = false;
      this.BillingTransaction.BillingTransactionItems[index].IsDoubleEntry_Now = false;
    }
  }

  private AssignPerformer(index: number, item: any): void {
    /*
              !Step 1: First update validation for Performer to required it Doctor is Mandatory for the selected item.
              !Step 2: Check if the DoctorList of that item is null. If Doctor List is not empty, Parse the string DoctorList to local variable in the form of array of numbers.
              !Step 3: If the DoctorList contains single doctor, Find that doctor from all AppointmentApplicable DoctorList & assign that doctor as performer of that service item.
              !Step 4: Else if the DoctorList contains multiple doctors, 
                        !- Assign selected default to one variable, say defaultDoctors by filtering from the main DoctorList.
                        !- Assign other remaining doctors to one variable, say otherDoctors by filtering from the main DoctorList and excluding defaultDoctors.
                        !- Then combine defaultDoctors and otherDoctors to AssignedDoctorList in order that defaultDoctors comes first and then otherDoctors on the dropDown Menu.     
      */
    //! Step 1:
    this.BillingTransaction.BillingTransactionItems[index].BillingTransactionItemValidator.get('PerformerId').setValidators(item.IsDoctorMandatory ? Validators.required : null);
    this.BillingTransaction.BillingTransactionItems[index].BillingTransactionItemValidator.get('PerformerId').updateValueAndValidity();

    //! Step 2:
    if (item.DefaultDoctorList !== null) {
      let defaultDoctorsIdsList = JSON.parse(item.DefaultDoctorList);

      //! Step 3:
      if (defaultDoctorsIdsList.length === 1) {
        let doctor = this.DoctorsList.find(d => d.EmployeeId === defaultDoctorsIdsList[0]);
        if (doctor) {
          this.SelectedAssignedToDoctor[index] = doctor;
          this.AssignSelectedDoctor(index);
          this.SelectedAssignedToDoctor[index] = doctor.FullName;
        }
      }

      //!Step 4:
      else if (defaultDoctorsIdsList.length > 1) {
        let defaultDoctors = [];
        defaultDoctorsIdsList.forEach(doctorId => {
          let matchingDoctor = this.DoctorsList.find(d => d.EmployeeId === doctorId);
          if (matchingDoctor) {
            defaultDoctors.push(matchingDoctor);
          }
        });

        let otherDoctors = this.DoctorsList.filter(doctor => !defaultDoctorsIdsList.includes(doctor.EmployeeId));
        this.BillingTransaction.BillingTransactionItems[index].AssignedDoctorList = [...defaultDoctors, ...otherDoctors];
      }
    }
  }

  AssignSelectedDoctor(index): void {
    let doctor = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.SelectedAssignedToDoctor[index]) {
      if (typeof (this.SelectedAssignedToDoctor[index]) === 'string' && this.DoctorsList.length) {
        doctor = this.DoctorsList.find(a => a.FullName.toLowerCase() === this.SelectedAssignedToDoctor[index].toLowerCase());
      }
      else if (typeof (this.SelectedAssignedToDoctor[index]) === 'object')
        doctor = this.SelectedAssignedToDoctor[index];
      if (doctor) {
        this.BillingTransaction.BillingTransactionItems[index].PerformerId = doctor.EmployeeId;
        this.BillingTransaction.BillingTransactionItems[index].PerformerName = doctor.FullName;
        this.BillingTransaction.BillingTransactionItems[index].IsvalidSelPerformerDr = true;
      }
      else
        this.BillingTransaction.BillingTransactionItems[index].IsvalidSelPerformerDr = false;
    }
    else
      this.BillingTransaction.BillingTransactionItems[index].IsvalidSelPerformerDr = false;
  }

  AssignRequestedByDoctor(index): void {
    let doctor = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.SelectedRequestedByDoctor[index]) {
      if (typeof (this.SelectedRequestedByDoctor[index]) === 'string' && this.DoctorsList.length) {
        doctor = this.DoctorsList.find(a => a.FullName.toLowerCase() === this.SelectedRequestedByDoctor[index].toLowerCase());
      }
      else if (typeof (this.SelectedRequestedByDoctor[index]) === 'object')
        doctor = this.SelectedRequestedByDoctor[index];
      if (doctor) {
        this.BillingTransaction.BillingTransactionItems[index].PrescriberId = doctor.EmployeeId;
        this.SelectedRequestedByDoctor[index] = doctor.FullName;
        this.BillingTransaction.BillingTransactionItems[index].PrescriberName = doctor.FullName;
        this.BillingTransaction.BillingTransactionItems[index].IsValidSelPrescriberDr = true;
      }
      else
        this.BillingTransaction.BillingTransactionItems[index].IsValidSelPrescriberDr = false;
    }
    else
      this.BillingTransaction.BillingTransactionItems[index].IsValidSelPrescriberDr = true;
  }

  //assigns service department id and filters item list
  ServiceDeptOnChange(index): void {
    let srvDeptObj = null;
    // check if user has given proper input string for department name
    //or has selected object properly from the dropdown list.
    if (typeof (this.SelectedServiceDepartments[index]) === 'string') {
      if (this.ServiceDepartmentList.length && this.SelectedServiceDepartments[index])
        srvDeptObj = this.ServiceDepartmentList.find(a => a.ServiceDepartmentName.toLowerCase() === this.SelectedServiceDepartments[index].toLowerCase());
    }
    else if (typeof (this.SelectedServiceDepartments[index]) === 'object')
      srvDeptObj = this.SelectedServiceDepartments[index];
    //if selection of department from string or selecting object from the list is true
    //then assign proper department name
    if (srvDeptObj) {
      if (srvDeptObj.ServiceDepartmentId != this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentId) {
        this.ResetSelectedRow(index);
        this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentId = srvDeptObj.ServiceDepartmentId;
      }
      this.FilterBillItems(index);
      this.BillingTransaction.BillingTransactionItems[index].IsValidSelDepartment = true;
    }
    //else raise an invalid flag
    else {
      this.BillingTransaction.BillingTransactionItems[index].ItemList = this.BillItems;
      if (this.LabTypeName === 'er-lab') {
        this.BillingTransaction.BillingTransactionItems[index].ItemList = this.BillItems.filter(a => a.SrvDeptIntegrationName !== "OPD" && (a.IsErLabApplicable || a.SrvDeptIntegrationName !== 'LAB'));
      }
      this.BillingTransaction.BillingTransactionItems[index].IsValidSelDepartment = false;
    }
  }

  FilterBillItems(index): void {
    //ramavtar:13may18: at start if no default service department is set .. we need to skip the filtering of item list.
    if (this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentId) {
      if (this.BillingTransaction.BillingTransactionItems.length && this.BillItems.length) {
        let srvDeptId = this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentId;
        //initalAssign: FilterBillItems was called after assinging all the values(used in ngModelChange in SelectDepartment)
        // and was assigning ItemId=null.So avoiding assignment null value to ItemId during inital assign.
        if (this.BillingTransaction.BillingTransactionItems[index].ServiceItemId === null)
          this.ResetSelectedRow(index);
        this.BillingTransaction.BillingTransactionItems[index].ItemList = this.BillItems.filter(a => a.ServiceDepartmentId === srvDeptId);
        if (this.LabTypeName === 'er-lab') {
          this.BillingTransaction.BillingTransactionItems[index].ItemList = this.BillItems.filter(a => a.SrvDeptIntegrationName !== "OPD" && (a.IsErLabApplicable || a.SrvDeptIntegrationName !== 'LAB'));
        }

        if (this.SelectedItems[index] && this.SelectedItems[index].IsDoctorMandatory) {
          this.BillingTransaction.BillingTransactionItems[index].UpdateValidator("on", "PerformerId", "required");
        }
        else {
          //this.billingTransaction.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);
        }
        // this.billingTransaction.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);//pratik: 1March,21--- for LPH
        this.BillingTransaction.BillingTransactionItems[index].UpdateValidator("off", "PrescriberId", null);//pratik: 1March,21--- for LPH
      }
    }
    else {
      let billItems = this.BillItems.filter(a => a.ServiceDepartmentName !== "OPD");
      this.BillingTransaction.BillingTransactionItems[index].ItemList = billItems;
      if (this.LabTypeName === 'er-lab') {
        this.BillingTransaction.BillingTransactionItems[index].ItemList = this.BillItems.filter(a => a.SrvDeptIntegrationName !== "OPD" && (a.IsErLabApplicable || a.SrvDeptIntegrationName !== 'LAB'));
      }
    }
  }
  //end: autocomplete assign functions  and item filter logic

  CloseThisPage(): void {
    this.EmitBillItemRequest.emit({ action: "close", newItems: this.AllRequestedData });
  }

  //----start: add/delete rows-----
  ResetSelectedRow(index): void {
    this.SelectedItems[index] = null;
    this.SelectedAssignedToDoctor[index] = null;
    this.BillingTransaction.BillingTransactionItems[index] = this.NewBillingTransactionItem();
    this.CalculationForAll();
  }

  AddNewBillTxnItemRow(index = null): void {    //method to add the row
    let billItem = this.NewBillingTransactionItem();
    let isPerformerValid: boolean;
    if (this.BillingTransaction.BillingTransactionItems && this.BillingTransaction.BillingTransactionItems.length > 0) {
      isPerformerValid = this.BillingTransaction.BillingTransactionItems[this.BillingTransaction.BillingTransactionItems.length - 1].IsValidCheck('PerformerId', 'required')
    }
    if (isPerformerValid === false) {
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Performer is mandatory."]);
      return;
    }
    else {
      this.BillingTransaction.BillingTransactionItems.push(billItem);
      billItem.AssignedDoctorList = this.DoctorsList;
      let new_index;
      if (index === null) {
        new_index = this.BillingTransaction.BillingTransactionItems.length - 1;
      }
      else {
        new_index = index + 1;
        // if (this.BillingTransaction.BillingTransactionItems[new_index].IsValidCheck('PerformerId', 'required')) {
        //   this._messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Performer is mandatory."]);
        //   return;
        // }
        this.BillingTransaction.BillingTransactionItems[index].BillingTransactionItemValidator.get('PerformerId').setValidators(null);
        this.BillingTransaction.BillingTransactionItems[index].BillingTransactionItemValidator.get('PerformerId').updateValueAndValidity();
      }
      if (this.SelectedRequestedByDoctor[index]) {
        this.SelectedRequestedByDoctor[new_index] = this.SelectedRequestedByDoctor[index];
      }
      this.AssignRequestedByDoctor(new_index);
      window.setTimeout(function () {
        let itmNameBox = document.getElementById('items-box' + new_index);
        if (itmNameBox) {
          itmNameBox.focus();
        }
      }, 0);
    }
  }

  NewBillingTransactionItem(index = null): BillingTransactionItem {
    let billItem = new BillingTransactionItem();
    billItem.Quantity = 1;
    billItem.ItemList = this.BillItems;
    return billItem;
  }

  deleteRow(index: number): void {
    this.BillingTransaction.BillingTransactionItems.splice(index, 1);
    this.SelectedItems.splice(index, 1);
    this.SelectedAssignedToDoctor.splice(index, 1);
    this.SelectedServiceDepartments.splice(index, 1);
    if (index === 0 && this.BillingTransaction.BillingTransactionItems.length === 0) {
      this.AddNewBillTxnItemRow();
      this.SelectedAdditionalInvoiceItem = new ServiceItemDetails_DTO();
      this.SelectedAdditionalItem = new BillingAdditionalServiceItem_DTO();
      this.AdditionalInvoiceItem = new InvoiceItem_DTO();
      this._changeDetectorRef.detectChanges();
    }
    this.CalculationForAll();
    this.CheckForDoubleEntry();
  }
  //----end: add/delete rows-----


  CheckItemProviderValidation(index: number): void {
    //let srvDeptId = this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId;
    //let servDeptName = this.GetServiceDeptNameById(srvDeptId);
    //if (this.IsDoctorMandatory(servDeptName, this.billingTransaction.BillingTransactionItems[index].ItemName)) {
    //    this.billingTransaction.BillingTransactionItems[index].UpdateValidator("on", "ProviderId", "required");
    //}
    if (this.SelectedItems[index] && this.SelectedItems[index].IsDoctorMandatory) {
      this.BillingTransaction.BillingTransactionItems[index].UpdateValidator("on", "PerformerId", "required");
    }
    else {
      //this.billingTransaction.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);
    }
    let currItm = this.BillingTransaction.BillingTransactionItems[index];
    if (!this.BillingRequestDisplaySettings.Performer) {
      currItm.UpdateValidator("off", "PerformerId", null);
    }
    // this.billingTransaction.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);//pratik: 1March,21--- for LPH
    this.BillingTransaction.BillingTransactionItems[index].UpdateValidator("off", "PrescriberId", null);//pratik: 1March,21--- for LPH
  }
  //end: mandatory doctor validations

  //start: list formatters
  ItemsListFormatter(data: any): string {
    let html: string = "";
    if (data.SrvDeptIntegrationName !== "OPD") {
      //html = data["ServiceDepartmentName"] + "-" + data["ItemCode"] + "&nbsp;&nbsp;" + "<font color='blue'; size=03 >" + data["ItemName"].toUpperCase() + "</font>" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + "<b>" + data["Price"] + "</b>";
      if (this.SearchByItemCode) {
        html = data["ServiceDepartmentName"] + "-" + data["ItemCode"] + "&nbsp;&nbsp;" + "<font color='blue'; size=03 >" + data["ItemName"].toUpperCase() + "</font>" + "&nbsp;&nbsp;";
      }
      else {
        html = data["ServiceDepartmentName"] + "-" + data["BillItemPriceId"] + "&nbsp;&nbsp;" + "<font color='blue'; size=03 >" + data["ItemName"].toUpperCase() + "</font>" + "&nbsp;&nbsp;";
      }
      html += "(<i>" + data["ServiceDepartmentName"] + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + "<b>" + data["Price"] + "</b>";
    }
    else {
      let docName = data.Doctor ? data.Doctor.DoctorName : "";
      html = data["ServiceDepartmentName"] + "-" + data["ItemCode"] + "&nbsp;&nbsp;" + data["ItemName"].toUpperCase() + "&nbsp;&nbsp;";
      html += "(<i>" + docName + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + " " + data["Price"];
    }
    return html;
  }


  DoctorListFormatter(data: any): string {
    return data["FullName"];
  }

  ServiceDeptListFormatter(data: any): string {
    return data["ServiceDepartmentName"];
  }

  patientListFormatter(data: any): string {
    let html = data["ShortName"] + ' [ ' + data['PatientCode'] + ' ]';
    return html;
  }

  CloseIpBillRequestSlip($event): void {
    this.ShowIpBillRequestSlip = false;
    this.loading = false;
    this.CloseThisPage();
  }

  OnPriceCategoryChange($event): void {
    this.SelectedPriceCategoryObj = this.AllPriceCategories.find(a => a.PriceCategoryId === $event.PriceCategoryId);
    this.PriceCategory = $event.categoryName;
    this.BillingTransaction.IsCoPayment = this.SelectedPriceCategoryObj.IsCoPayment
    if (this.SelectedPriceCategoryObj.IsCoPayment) {
      //this.model.CoPayment_PaymentMode = ENUM_BillPaymentMode.credit;
    }

    //this.LoadItemsPriceByPriceCategoryAndFilter($event.PriceCategoryId);
  }

  //! Krishna, 18thJune, Below code is deprecated, hence commenting for now, Will remove it in later versions.
  // public BilcfgItemsVsPriceCategoryMap: Array<any> = new Array<any>();
  // LoadItemsPriceByPriceCategoryAndFilter(selectedPriceCategoryId: number) {
  //   if (selectedPriceCategoryId) {
  //     let selectedPriceCategoryObj = this.allPriceCategories.find(a => a.PriceCategoryId == selectedPriceCategoryId);
  //     //if (selectedPriceCategoryObj.IsRateDifferent) {
  //     //! Need initial data
  //     this.SetBillingItemsNPrices();
  //     //! Reset the BillTxnItms rows
  //     for (let index = 0; index < this.billingTransaction.BillingTransactionItems.length; index++) {
  //       if (this.billingTransaction.BillingTransactionItems) {
  //         this.billingTransaction.BillingTransactionItems = [];
  //         this.selectedItems = [];
  //         this.selectedAssignedToDr = [];
  //         this.selectedServDepts = [];
  //         if (this.billingTransaction.BillingTransactionItems.length == 0) {
  //           this.AddNewBillTxnItemRow();
  //           this.changeDetectorRef.detectChanges();
  //         }
  //         this.Calculationforall();
  //       }
  //     }
  //     //* fetch from mapping table
  //     if (this.SchemePriceCategory.SchemeId && this.SchemePriceCategory.PriceCategoryId) {
  //       this.billingMasterBlService.GetServiceItems(ENUM_ServiceBillingContext.IpBilling, this.SchemePriceCategory.SchemeId, this.SchemePriceCategory.PriceCategoryId)
  //         .subscribe((res: DanpheHTTPResponse) => {
  //           if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
  //             this.BilcfgItemsVsPriceCategoryMap = res.Results;
  //             this.FilterItemsByPriceCategoryAndAssignPrice(this.priceCategory);
  //           }
  //         },
  //           err => {
  //             console.log(err);
  //           });
  //     }
  //   }
  // }

  // FilterItemsByPriceCategoryAndAssignPrice(selectedPriceCategory) {
  //   if (this.BilcfgItemsVsPriceCategoryMap && this.BilcfgItemsVsPriceCategoryMap.length) {

  //     //! Krishna, 29thMarch'23 below logic needs to changed as soon as possible, it is just a temporary solution, Here Item may come duplicate and in large number, hence we are filtering it with priceCategoryId
  //     //this.billItems = this.billItems.filter(ele => this.BilcfgItemsVsPriceCategoryMap.some(elem => ele.ServiceDepartmentId === elem.ServiceDepartmentId && ele.ItemId === elem.ItemId && ele.PriceCategoryId === this.SchemePriceCategory.PriceCategoryId));
  //     this.billItems = this.billItems.filter(ele => this.BilcfgItemsVsPriceCategoryMap.some(elem => ele.ServiceItemId === elem.ServiceItemId && ele.PriceCategoryId === this.SchemePriceCategory.PriceCategoryId));
  //     this.billItems.map(a => {
  //       let matchedData = this.BilcfgItemsVsPriceCategoryMap.find(b => b.ServiceDepartmentId === a.ServiceDepartmentId && b.IntegrationItemId === a.IntegrationItemId);
  //       if (matchedData) {
  //         a.ItemCode = matchedData.ItemCode;
  //         a.Price = matchedData.Price;
  //         a.DiscountApplicable = matchedData.IsDiscountApplicable;
  //         a.DiscountPercent = matchedData.DiscountPercent;
  //         a.IsCoPayment = matchedData.IsCoPayment;
  //         a.CoPaymentCashPercent = matchedData.CoPayCashPercent;
  //         a.CoPaymentCreditPercent = matchedData.CoPayCreditPercent;
  //       }
  //     });
  //     if (this.billingTransaction.BillingTransactionItems) {

  //       this.billingTransaction.BillingTransactionItems = [];
  //       this.selectedItems = [];
  //       this.selectedAssignedToDr = [];
  //       this.selectedServDepts = [];
  //       if (this.billingTransaction.BillingTransactionItems.length == 0) {
  //         this.AddNewBillTxnItemRow();
  //         this.changeDetectorRef.detectChanges();
  //       }
  //       this.Calculationforall();
  //     }

  //   }
  //   else {
  //     this.billItems = new Array<BillingTransactionItem>();
  //     if (this.billingTransaction.BillingTransactionItems) {

  //       this.billingTransaction.BillingTransactionItems = [];
  //       this.selectedItems = [];
  //       this.selectedAssignedToDr = [];
  //       this.selectedServDepts = [];
  //       if (this.billingTransaction.BillingTransactionItems.length == 0) {
  //         this.AddNewBillTxnItemRow();
  //         this.changeDetectorRef.detectChanges();
  //       }
  //       this.Calculationforall();
  //     }
  //   }
  // }
  ResetDoctorListOnItemChange(item, index): void {
    if (item) {
      let docArray = null;
      let currItemPriceCFG = this.BillItemsComplete.find(a => a.ServiceItemId === item.ServiceItemId && a.ServiceDepartmentId === item.ServiceDepartmentId);
      if (currItemPriceCFG) {
        let docJsonStr = currItemPriceCFG.DefaultDoctorList;
        if (docJsonStr) {
          docArray = JSON.parse(docJsonStr);
        }
      }
      if (docArray && docArray.length > 1) {
        this.BillingTransaction.BillingTransactionItems[index].AssignedDoctorList = [];
        this.SelectedAssignedToDoctor[index] = null;
        docArray.forEach(docId => {
          let currDoc = this.DoctorsList.find(d => d.EmployeeId === docId);
          if (currDoc) {
            this.BillingTransaction.BillingTransactionItems[index].AssignedDoctorList.push(currDoc);
          }
        });
      }
      else if (docArray && docArray.length === 1) {
        let currDoc = this.DoctorsList.find(d => d.EmployeeId === docArray[0]);
        if (currDoc) {
          this.SelectedAssignedToDoctor[index] = currDoc.FullName;
          this.AssignSelectedDoctor(index);
        }
      }
      else {
        this.SelectedAssignedToDoctor[index] = null;
        this.BillingTransaction.BillingTransactionItems[index].AssignedDoctorList = this.DoctorsList;
      }
    }
  }

  PastTest($event): void {
    this.PastTestList = $event;
  }

  HasDoubleEntryInPast(): void {
    if (this.PastTestList && this.PastTestList.length > 0) {
      var currDate = moment().format("YYYY-MM-DD HH:mm:ss");
      if (this.BillRequestDoubleEntryWarningTimeHrs && this.BillRequestDoubleEntryWarningTimeHrs !== 0) {
        this.PastTestList.forEach(a => {
          //var diff = moment.duration(a.CreatedOn.diff(currDate));
          if (this.DateDifference(currDate, a.CreatedOn) < this.BillRequestDoubleEntryWarningTimeHrs) {
            this.PastTestList_ForDuplicate.push(a);
          }
        });
      }
    }
  }

  CheckForDoubleEntry(): void {
    this.BillingTransaction.BillingTransactionItems.forEach(itm => {
      if (this.BillingTransaction.BillingTransactionItems.filter(a => a.ServiceDepartmentId === itm.ServiceDepartmentId && a.ServiceItemId === itm.ServiceItemId).length > 1) {
        itm.IsDoubleEntry_Now = true;
        //this.msgBoxServ.showMessage('warning', ["This item is already entered"]);
      }
      else {
        itm.IsDoubleEntry_Now = false;
      }
      this.HasDoubleEntryInPast();
      if (this.PastTestList_ForDuplicate && this.PastTestList_ForDuplicate.find(a => a.ServiceDepartmentId === itm.ServiceDepartmentId && a.ServiceItemId === itm.ServiceItemId)) {
        itm.IsDoubleEntry_Past = true;
        //this.msgBoxServ.showMessage('warning', ["This item is already entered"]);
      }
      else {
        itm.IsDoubleEntry_Past = false;
      }
    });
  }

  DateDifference(currDate, startDate): number {
    var diffHrs = moment(currDate, "YYYY/MM/DD HH:mm:ss").diff(moment(startDate, "YYYY/MM/DD HH:mm:ss"), 'hours');
    return diffHrs;
  }

  AddTxnItemRowOnClick(index): void {
    if (index !== -1) {
      if (this.BillingTransaction.BillingTransactionItems[index].ServiceItemId === 0) {
        if (!this.CallBackFromAdditionalItemsSelection) {
          // this.setFocusById('billRequest');
          this.setFocusById('btn_billRequestAndPrint');
        } else {
          this.CallBackFromAdditionalItemsSelection = false;
        }
      } else {
        this.AddNewBillTxnItemRow(index);
      }
    } else {
      this.AddNewBillTxnItemRow(index);
    }
  }

  //common function to set focus on  given Element.
  setFocusById(targetId: string, waitingTimeinMS: number = 10): void {
    var timer = window.setTimeout(function () {
      let htmlObject = document.getElementById(targetId);
      if (htmlObject) {
        htmlObject.focus();
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
  }

  GetBillingRequestDisplaySettings(): void {
    var StrParam = this.coreService.Parameters.find(a => a.ParameterGroupName === "Billing" && a.ParameterName === "IPBillingRequestDisplaySettings");
    if (StrParam && StrParam.ParameterValue) {
      let currParam = JSON.parse(StrParam.ParameterValue);
      this.BillingRequestDisplaySettings = currParam;
    }
  }

  OnLabTypeChange(): void {
    this.BillingTransaction.LabTypeName = this.LabTypeName;
    this.FilterBillItems(0);
    if (this.LabTypeName) {
      if (localStorage.getItem('BillingSelectedLabTypeName')) {
        localStorage.removeItem('BillingSelectedLabTypeName');
      }
      localStorage.setItem('BillingSelectedLabTypeName', this.LabTypeName);
    } else {
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Please select Lab Type Name."]);
    }
  }

  OnSchemePriceCategoryChanged(schemePriceObj: SchemePriceCategory_DTO): void {
    if (schemePriceObj && schemePriceObj.SchemeId) {
      //this.LoadItemsPriceByPriceCategoryAndFilter(schemePriceObj.PriceCategoryId);
      this.BillingTransaction.SchemeId = schemePriceObj.SchemeId;
      this.SchemePriceCategory = schemePriceObj;
      this.BillingTransaction.BillingTransactionItems.forEach(item => {
        item.DiscountSchemeId = this.SchemePriceCategory.SchemeId;
        item.PriceCategoryId = this.SchemePriceCategory.PriceCategoryId;
      });
    }
  }

  HandlePrintSlipConfirm(): void {
    this.loading = true;
    this.PostSuccessBool = true;
    this.SubmitBillingTransaction();
  }

  HandleRequestConfirm(): void {
    this.loading = true;
    this.PostSuccessBool = false;
    this.SubmitBillingTransaction();
  }

  HandleCancel(): void {
    this.loading = false;
  }

  CloseAdditionalServiceItem(): void {
    this.HasAdditionalServiceItem = false;
    //this.GoToQuantityOrOtherElement('id_billing_serviceItemName', 'id_billing_serviceItemQty', 'id_billing_credit_remarks'); //! After the Additional ServiceItem Popup closes it should focus on either of these two elements.
    this._changeDetectorRef.detectChanges();
  }

  //* Krishna, 18thJune'23, Below method is triggered on the change of Additional Item Selection on the Popup

  OnAdditionalServiceItemCallBack($event: Array<BillingAdditionalServiceItem_DTO>): void {
    if ($event && $event.length > 0) {
      this.CallBackFromAdditionalItemsSelection = true;
      this.TotalAdditionalServiceItems = $event.length;
      $event.forEach((itm, index) => {
        if (index > 0) {
          this.NextIndex++;
        }
        this.TotalAdditionalServiceItems--
        this.SelectedAdditionalItem = itm;
        if (this.SelectedAdditionalItem) {
          const selectedInvoiceItem = this.BillItems.find(a => a.ServiceItemId === this.SelectedAdditionalItem.ServiceItemId && a.PriceCategoryId === this.SelectedAdditionalItem.PriceCategoryId);
          if (selectedInvoiceItem) {
            this.SelectedAdditionalInvoiceItem = selectedInvoiceItem;
          } else {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Selected Additional Item is not active for selected PriceCategory"]);
          }
          this.AddAdditionalInvoiceItemAsDraft();
        }
      });
    }
  }

  //* Krishna, 18thJune'23,, Below method is triggered after Ok button is clicked from the additional Item popup, Basically it adds the selected Additional Item to an Object that can be further used.
  private AddAdditionalInvoiceItemAsDraft(): void {
    if (this.SelectedAdditionalInvoiceItem && typeof (this.SelectedAdditionalInvoiceItem) === 'object') {
      let DiscountPercent = 0;
      if (this.SchemePriceCategory.IsDiscountApplicable && this.SelectedAdditionalInvoiceItem.IsDiscountApplicable) {
        DiscountPercent = this.SelectedAdditionalInvoiceItem.DiscountPercent;
      }
      if (!this.SelectedAdditionalInvoiceItem.IsDiscountApplicable) {
        DiscountPercent = 0;
      }
      const startingQuantity = 1; //! Krishna, 2ndApril'23, This is for initial item selection hence hard coded 1
      this.AdditionalInvoiceItem.ItemCode = this.SelectedAdditionalInvoiceItem.ItemCode;
      this.AdditionalInvoiceItem.ServiceItemId = this.SelectedAdditionalInvoiceItem.ServiceItemId;
      this.AdditionalInvoiceItem.ItemName = this.SelectedAdditionalInvoiceItem.ItemName;
      if (this.SelectedInvoiceItemForAdditionalItemCalculation && this.SelectedAdditionalItem) {
        if (this.SelectedAdditionalItem.UseItemSelfPrice) {
          this.AdditionalInvoiceItem.Price = this.SelectedAdditionalInvoiceItem.Price;
        } else {
          const serviceDepartment = this.ServiceDepartmentList.find(a => a.ServiceDepartmentId === this.SelectedInvoiceItemForAdditionalItemCalculation.ServiceDepartmentId);
          let price = 0;
          if (serviceDepartment && this.RequestingDepartmentId === serviceDepartment.DepartmentId) {
            price = this._billingInvoiceBlService.CalculateAmountFromPercentage(this.SelectedAdditionalItem.PercentageOfParentItemForSameDept, this.SelectedInvoiceItemForAdditionalItemCalculation.Price);
          } else {
            price = this._billingInvoiceBlService.CalculateAmountFromPercentage(this.SelectedAdditionalItem.PercentageOfParentItemForDiffDept, this.SelectedInvoiceItemForAdditionalItemCalculation.Price);
          }
          this.AdditionalInvoiceItem.Price = price < this.SelectedAdditionalItem.MinimumChargeAmount ? this.SelectedAdditionalItem.MinimumChargeAmount : price;
        }
      }
      this.AdditionalInvoiceItem.Quantity = startingQuantity; //! Krishna; 2ndApril'23; This is for initial item selection hence hard coded 1
      this.AdditionalInvoiceItem.DiscountPercent = DiscountPercent;
      this.AdditionalInvoiceItem.IsCoPayment = this.SelectedAdditionalInvoiceItem.IsCoPayment;
      this.AdditionalInvoiceItem.CoPayCashPercent = this.SelectedAdditionalInvoiceItem.CoPayCashPercent;
      this.AdditionalInvoiceItem.CoPayCreditPercent = this.SelectedAdditionalInvoiceItem.CoPayCreditPercent;
      this.AdditionalInvoiceItem.ServiceDepartmentId = this.SelectedAdditionalInvoiceItem.ServiceDepartmentId;
      this.AdditionalInvoiceItem.ServiceDepartmentName = this.SelectedAdditionalInvoiceItem.ServiceDepartmentName;
      this.AdditionalInvoiceItem.IntegrationItemId = this.SelectedAdditionalInvoiceItem.IntegrationItemId
      this.SetInvoiceItemTotalAmountIncludingDiscountAmountForAdditionalItem();
      if (this.TotalAdditionalServiceItems === 0) {
        this.CloseAdditionalServiceItem();
      }
      this.AssignAdditionalInvoiceItemToInvoiceItemsArray();
    }
  }

  private SetInvoiceItemTotalAmountIncludingDiscountAmountForAdditionalItem(): void {
    this.AdditionalInvoiceItem.SubTotal = (this.AdditionalInvoiceItem.Quantity * this.AdditionalInvoiceItem.Price);
    const DiscountAmount = this._billingInvoiceBlService.CalculateAmountFromPercentage(this.AdditionalInvoiceItem.DiscountPercent, this.AdditionalInvoiceItem.SubTotal);
    this.AdditionalInvoiceItem.DiscountAmount = DiscountAmount;
    this.AdditionalInvoiceItem.TotalAmount = (this.AdditionalInvoiceItem.SubTotal - this.AdditionalInvoiceItem.DiscountAmount);
  }

  //* Krishna, 4thApril'23, Below method is responsible for, assigning and calculating the remaining properties that are needed to an InvoiceItem.
  private AssignAdditionalInvoiceItemToInvoiceItemsArray(): void {
    if (this.AdditionalInvoiceItem) {
      const index = this.NextIndex;
      // this.selectedItems[index] = this.AdditionalInvoiceItem;
      this.SelectedItems[index] = this.AdditionalInvoiceItem.ItemName;
      this.BillingTransaction.BillingTransactionItems[index].IntegrationItemId = this.AdditionalInvoiceItem.IntegrationItemId;
      this.BillingTransaction.BillingTransactionItems[index].ItemCode = this.AdditionalInvoiceItem.ItemCode;
      this.BillingTransaction.BillingTransactionItems[index].ItemName = this.AdditionalInvoiceItem.ItemName;
      this.BillingTransaction.BillingTransactionItems[index].DiscountSchemeId = this.SchemePriceCategory.SchemeId;
      this.BillingTransaction.BillingTransactionItems[index].Price = this.AdditionalInvoiceItem.Price;
      this.BillingTransaction.BillingTransactionItems[index].Quantity = this.AdditionalInvoiceItem.Quantity;
      this.BillingTransaction.BillingTransactionItems[index].SubTotal = this.AdditionalInvoiceItem.SubTotal;
      this.BillingTransaction.BillingTransactionItems[index].TotalAmount = this.AdditionalInvoiceItem.TotalAmount;
      this.BillingTransaction.BillingTransactionItems[index].PriceCategory = null;
      this.BillingTransaction.BillingTransactionItems[index].PriceCategoryId = this.SchemePriceCategory.PriceCategoryId;
      this.BillingTransaction.BillingTransactionItems[index].ServiceItemId = this.AdditionalInvoiceItem.ServiceItemId;
      this.BillingTransaction.BillingTransactionItems[index].IsCoPayment = this.AdditionalInvoiceItem.IsCoPayment;
      this.BillingTransaction.BillingTransactionItems[index].CoPaymentCashPercent = this.AdditionalInvoiceItem.CoPayCashPercent;
      this.BillingTransaction.BillingTransactionItems[index].CoPaymentCreditPercent = this.AdditionalInvoiceItem.CoPayCreditPercent;
      this.BillingTransaction.BillingTransactionItems[index].DiscountPercent = this.AdditionalInvoiceItem.DiscountPercent;
      this.BillingTransaction.BillingTransactionItems[index].PrescriberId = this.AdditionalInvoiceItem.PrescriberId;
      this.BillingTransaction.BillingTransactionItems[index].PrescriberName = this.AdditionalInvoiceItem.PrescriberName;
      this.BillingTransaction.BillingTransactionItems[index].PerformerId = this.AdditionalInvoiceItem.PerformerId;
      this.BillingTransaction.BillingTransactionItems[index].PerformerName = this.AdditionalInvoiceItem.PerformerName;
      // this.billingTransaction.BillingTransactionItems[index].ProcedureCode =  this.AdditionalInvoiceItem.ProcedureCode;
      //add also the servicedepartmentname property of the item; needed since most of the filtering happens on this value
      this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentName = this.GetServiceDeptNameById(this.AdditionalInvoiceItem.ServiceDepartmentId);
      this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentId = this.AdditionalInvoiceItem.ServiceDepartmentId;
      this.SelectedServiceDepartments[index] = this.BillingTransaction.BillingTransactionItems[index].ServiceDepartmentName;
      this.BillingTransaction.BillingTransactionItems[index].IsValidSelDepartment = true;
      this.BillingTransaction.BillingTransactionItems[index].IsValidSelItemName = true;
      this.FilterBillItems(index);
      this.CheckItemProviderValidation(index);
      this.CalculationForAll();
      this.ResetDoctorListOnItemChange(this.AdditionalInvoiceItem, index);
      this.AddTxnItemRowOnClick(index);
    }
  }
}
