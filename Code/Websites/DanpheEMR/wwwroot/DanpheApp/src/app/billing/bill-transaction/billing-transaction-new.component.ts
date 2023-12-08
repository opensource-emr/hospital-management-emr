import { ChangeDetectorRef, Component } from "@angular/core";
import { FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import * as _ from "lodash";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { CurrentVisitContextVM } from "../../appointments/shared/current-visit-context.model";
import { PatientLatestVisitContext_DTO } from "../../appointments/shared/dto/patient-lastvisit-context.dto";
import { CoreService } from "../../core/shared/core.service";
import { PatientService } from "../../patients/shared/patient.service";
import { SecurityService } from "../../security/shared/security.service";
import { CreditOrganization } from "../../settings-new/shared/creditOrganization.model";
import { Department } from "../../settings-new/shared/department.model";
import { CallbackService } from "../../shared/callback.service";
import { ServiceDepartmentVM } from "../../shared/common-masters.model";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { CommonFunctions } from "../../shared/common.functions";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { ENUM_AdditionalServiceItemGroups, ENUM_BillPaymentMode, ENUM_BillingStatus, ENUM_BillingType, ENUM_CurrentBillingFlow, ENUM_DanpheHTTPResponses, ENUM_InvoiceType, ENUM_MessageBox_Status, ENUM_OrderStatus, ENUM_ServiceBillingContext } from "../../shared/shared-enums";
import { BillingInvoiceBlService } from "../shared/billing-invoice.bl.service";
import { BillingMasterBlService } from "../shared/billing-master.bl.service";
import { BillingTransactionItem } from "../shared/billing-transaction-item.model";
import { BillingTransaction, EmployeeCashTransaction } from "../shared/billing-transaction.model";
import { BillingBLService } from "../shared/billing.bl.service";
import { BillingService } from "../shared/billing.service";
import { BillingAdditionalServiceItem_DTO } from "../shared/dto/bill-additional-service-item.dto";
import { InvoiceItem_DTO } from "../shared/dto/billing-invoiceitem.dto";
import { BillingPackages_DTO } from "../shared/dto/billing-packages.dto";
import { SchemePriceCategory_DTO } from "../shared/dto/scheme-pricecategory.dto";
import { ServiceItemDetails_DTO } from "../shared/dto/service-item-details.dto";
import { ServiceItemSchemeSetting_DTO } from "../shared/dto/service-item-scheme-setting.dto";
import { PatientBillingContextVM } from "../shared/patient-billing-context-vm";
import { PatientScheme } from "../shared/patient-map-scheme";
@Component({
  templateUrl: "./billing-transaction-new.component.html",
  styleUrls: ['./billing-transaction-new.component.css'],
  host: { '(window:keydown)': 'hotkeys($event)' }
})


export class BillingTransactionComponent_New {
  public billingType: string = 'OutPatient';//to separate inpatient billing, outpatient billing, etc..
  public wardName: string = '';
  public bedNo: string = '';
  public BillingRequestDisplaySettings: any = null; //! Krishna, 19thMarch'23 Need to give a type
  public disablePrevTxnSelection: boolean = false;
  public disablePkgSelection: boolean = false;
  public showDepositPopUp: boolean = false;
  public showSelectPage: boolean = false;
  public model: BillingTransaction = new BillingTransaction();
  public SchemePriceCategory: SchemePriceCategory_DTO = new SchemePriceCategory_DTO();
  public old_priceCategory: number = 0;
  public new_priceCategory: number = 0;
  public ServiceItems: Array<ServiceItemDetails_DTO> = new Array<ServiceItemDetails_DTO>();
  public ServiceItemSchemeSettings: Array<ServiceItemSchemeSetting_DTO> = new Array<ServiceItemSchemeSetting_DTO>();
  public hasMultipleLabType: boolean = false;
  public LabTypeName: string = 'op-lab';
  public isPackageBilling: boolean = false;
  public isEHS: boolean = false;
  public selectedItems: Array<any> = []; //! Krishna, 19thMarch'23 Need to give it a type
  public isItemLoaded: boolean = false;
  public itemList: Array<any> = []; //! Krishna, 19thMarch'23 Need to give it a type
  public deductDeposit: boolean = false;
  public depositDeductAmount: number = 0;
  public IsDuplicateItem: boolean[] = [];
  public isReferrerLoaded: boolean = false;
  public selectedPrescriberId: number = null;
  public SelectedPrescriber: any; //! Krishna, 19thMarch'23 Need to give it a type
  public selectedRefId: number = null;
  public ShowItemLevelDiscount: boolean = false;
  public EnableDiscountField: boolean = false; //Krishna, 27th,March'22 , To enable Discount Amount filed on invoice level as well as item level
  public EnableInvoiceLevelDiscountAmountField: boolean = false;
  public currentCounter: number = null;
  public taxPercent: number = 0;
  public taxId: number = 0;
  public SelectedServiceItemFromPackage = new InvoiceItem_DTO();
  public IsPackageServiceItemEditMode: boolean = false;
  public currentBillingFlow: string;
  public param_allowAdditionalDiscOnProvisional: boolean = false;//sud:12Mar'19
  public patBillHistory = {
    IsLoaded: false,
    PatientId: null,
    CreditAmount: null,
    ProvisionalAmt: null,
    TotalDue: null,
    DepositBalance: null,
    BalanceAmount: null
  };
  public allServiceDepts: Array<ServiceDepartmentVM> = null;
  public serviceDeptList: Array<ServiceDepartmentVM> = null;
  public newDepositBalance: number = 0;
  public loading: boolean = false;
  public creditOrganizationsList: Array<CreditOrganization> = new Array<CreditOrganization>();
  public BillRequestDoubleEntryWarningTimeHrs: number = 0;
  public ExtRefSettings = { EnableExternal: true, DefaultExternal: false };
  public searchByItemCode: boolean = true;
  public MstPaymentModes: any = [];//! Krishna, 19thMarch'23 Need to give it a type
  public PaymentPages: any[];//! Krishna, 19thMarch'23 Need to give it a type
  public MembershipTypeName: string = null;
  public showInvoicePrintPage: boolean = false;//sud:16May'21--to print from same page.
  public visitList: Array<any> = [];//! Krishna, 19thMarch'23 Need to give it a type
  public patLastVisitContext: PatientLatestVisitContext_DTO = new PatientLatestVisitContext_DTO();
  public currPatVisitContext: CurrentVisitContextVM = new CurrentVisitContextVM();
  public showChangeVisitTypePopup: boolean = false;
  public isClaimSuccessful = false;
  public IsRemarksMandatory: boolean = false;
  public TempEmployeeCashTransaction: Array<EmployeeCashTransaction> = new Array<EmployeeCashTransaction>();
  public empCashTxn: EmployeeCashTransaction = new EmployeeCashTransaction();
  public Invoice_Label: string = "INVOICE";//sud:19Nov'19--we're getting this value from Parameter since different hospital needed it differently.
  public InvoiceItemDto: InvoiceItem_DTO = new InvoiceItem_DTO();
  public InvoiceItemsDto = new Array<InvoiceItem_DTO>();
  public showPastBillHistory: boolean = true;
  public PastTestList: any = []; //! Krishna, 19thMarch'23, Need to give it a type
  public InvoiceItemFormGroup: FormGroup;
  public selectedInvoiceItem: InvoiceItem_DTO = new InvoiceItem_DTO();
  public selectedInvoiceItemCode: ServiceItemDetails_DTO = new ServiceItemDetails_DTO();
  public doctorsList: Array<any> = [];//! Krishna, 19thMarch'23, Need to give it a type
  public reqDoctorsList: Array<any> = [];//! Krishna, 19thMarch'23, Need to give it a type
  public SelectedPerformer: any; //! Krishna, 19thMarch'23, Need to give it a type
  public bil_InvoiceNo: number = 0;
  public bil_FiscalYrId: number = 0;
  public bil_BilTxnId: number = null;
  public provReceiptInputs = { PatientId: 0, ProvFiscalYrId: 0, ProvReceiptNo: 0, visitType: null };
  public isProvisionalBilling: boolean = false;
  public insuranceApplicableFlag: boolean = false; //Yubraj 31st May '19
  public currBillingContext: PatientBillingContextVM = new PatientBillingContextVM();
  public CurrentPatientSchemeMap: PatientScheme = new PatientScheme();
  public currentVisitType: string = "";
  public SchemePriCeCategoryFromVisit: SchemePriceCategoryCustomType = { SchemeId: 0, PriceCategoryId: 0 };
  public SchemePriCeCategoryFromVisitTemp: SchemePriceCategoryCustomType = { SchemeId: 0, PriceCategoryId: 0 };
  public DisableItemLevelDiscAmount: boolean = true;
  public DisableItemLevelDiscPercent: boolean = true;
  public ShowItemLevelDiscountAmountField: boolean = false;
  public DisablePaymentModeDropDown: boolean = false;
  public DisableInvoiceDiscountPercent: boolean = false;
  public DisableInvoiceDiscountAmount: boolean = true;
  public creditPaymentMode: string = ENUM_BillPaymentMode.credit;
  public BillingAdditionalServiceItems = new Array<BillingAdditionalServiceItem_DTO>();
  public HasAdditionalServiceItem: boolean = false;
  public InvoiceItemWithAdditionalItem = new Array<InvoiceItem_DTO>();
  public AdditionalInvoiceItem = new InvoiceItem_DTO();
  public HasAdditionalServiceItemSelected: boolean = false;
  public SelectedAdditionalInvoiceItem = new ServiceItemDetails_DTO();
  public SelectedAdditionalItem = new BillingAdditionalServiceItem_DTO();
  public PastTestList_ForDuplicate: any = [];
  public index: number = 0;
  public dupItem: boolean = false;
  public param_allowDuplicateItemsEntryInBillingTransaction: boolean = false;
  public ServiceItemsSubscription = new Subscription();
  public serviceBillingContext: string = "";
  public confirmationTitle: string = "Confirm !";
  public confirmationMessage: string = "Are you sure you want to Print Invoice ?";
  public ConfirmationMessageForProvisional: string = "Are you sure you want to Print Provisional Slip ?";
  public DisplaySystemDefaultSchemePriceCategory: boolean = false;
  public billTxnItems: any;
  public loadingScreen: boolean = false;
  public DepartmentList = new Array<Department>();
  public selectedDepartment = { DepartmentId: 0, DepartmentName: "" };
  public DisplayPrintProvisionalButton: boolean = false;
  public AllowProvisionalBilling: boolean = false;
  public ServicePackages = new Array<BillingPackages_DTO>();
  public SelectedPackage = new BillingPackages_DTO();
  public EnableShowOtherCurrency: boolean = false;
  public ShowOtherCurrency: boolean = false;
  public DisplayOtherCurrencyDetail: boolean = false;
  public IsPackageServiceItemDiscountChanged: boolean = false;

  constructor(
    public billingService: BillingService,
    public changeDetectorRef: ChangeDetectorRef,
    public billingMasterBlService: BillingMasterBlService,
    public coreService: CoreService,
    public msgBoxService: MessageboxService,
    public securityService: SecurityService,
    public router: Router,
    public callbackService: CallbackService,
    public routeFromService: RouteFromService,
    public patientService: PatientService,
    public billingBlService: BillingBLService,
    public billingInvoiceBlService: BillingInvoiceBlService
  ) {
    this.InvoiceItemFormGroup = this.billingInvoiceBlService.CreateFormGroupForInvoiceItems();
    this.currentCounter = this.securityService.getLoggedInCounter().CounterId;
    this.taxPercent = this.billingService.taxPercent;
    this.taxId = this.billingService.taxId;
    this.currentBillingFlow = this.routeFromService.RouteFrom;
    this.routeFromService.RouteFrom = "";
    this.model.PatientId = this.patientService.getGlobal().PatientId;
    this.GetServiceItemsForCurrentSchemeAndPriceCategory();
    if (this.currentCounter < 1) {
      this.callbackService.CallbackRoute = '/Billing/SearchPatient';
    } else {
      this.patLastVisitContext = this.billingService.PatLastVisitContext;
      //Krishna/Sud:29Mar'23--Moved from GetVisitList to here..
      this.GetVisitContext(this.patientService.getGlobal().PatientId, this.patLastVisitContext.PatientVisitId);
      this.currentVisitType = this.patientService.getGlobal().LatestVisitType;
      this.BillingRequestDisplaySettings = this.billingInvoiceBlService.GetParam_BillingRequestDisplaySettings();
      this.Invoice_Label = this.billingInvoiceBlService.GetParam_InvoiceLabelName();
      this.bedNo = this.patientService.getGlobal().BedCode;
      this.wardName = this.patientService.getGlobal().WardName;
      this.Initialize();
      this.LoadParameterForDuplicateItemsEntry();//'Bibek 15May'23
      this.param_allowAdditionalDiscOnProvisional = this.billingInvoiceBlService.GetParam_IsAdditionalDiscOnProvisional();
      this.LoadPatientPastBillSummary(this.patientService.getGlobal().PatientId);
      //new way: get servicedepts list from core-service-- sud/17Dec'17'
      this.allServiceDepts = this.coreService.Masters.ServiceDepartments;
      this.serviceDeptList = this.allServiceDepts;
      this.serviceDeptList = this.allServiceDepts.filter(a => !a.IntegrationName || a.IntegrationName.toLowerCase() != "opd");
      const departmentList = this.coreService.Masters.Departments;
      this.DepartmentList = (departmentList && departmentList.length > 0) ? departmentList.filter(a => a.IsActive && a.IsAppointmentApplicable) : new Array<Department>();
      this.creditOrganizationsList = this.billingService.AllCreditOrganizationsList;//sud:2May'20--Code Optimization..
      this.ExtRefSettings = this.billingInvoiceBlService.GetParam_BillingExternalReferrerSettings();
      this.BillRequestDoubleEntryWarningTimeHrs = this.coreService.LoadOPBillRequestDoubleEntryWarningTimeHrs();

      if (this.coreService.labTypes.length > 1) {
        this.hasMultipleLabType = true;
      } else {
        this.hasMultipleLabType = false;
        this.LabTypeName = this.coreService.labTypes[0].LabTypeName;
      }

      if (this.billingService.BillingType === ENUM_BillingType.outpatient) {
        this.serviceBillingContext = ENUM_ServiceBillingContext.OpBilling;
      }
      else if (this.billingService.BillingType === ENUM_BillingType.inpatient) {
        this.serviceBillingContext = ENUM_ServiceBillingContext.IpBilling;
      }

      this.GetParameterToShowHideOtherCurrencyOption();
    }
  }

  get InvoiceItemFormControls() {
    return this.InvoiceItemFormGroup.controls;
  }
  get InvoiceItemFormValue() {
    return this.InvoiceItemFormGroup.value;
  }

  GetServiceItemsForCurrentSchemeAndPriceCategory() {
    this.ServiceItems = this.billingMasterBlService.ServiceItems;
    const systemDefaultPriceCategory = this.coreService.Masters.PriceCategories.find(a => a.IsDefault);
    if (systemDefaultPriceCategory && !this.billingMasterBlService.PriceCategoryId) {
      this.old_priceCategory = systemDefaultPriceCategory.PriceCategoryId;
    }
    else {
      this.old_priceCategory = this.billingMasterBlService.PriceCategoryId;
    }
  }

  GetParameterToShowHideOtherCurrencyOption(): void {
    const params = this.coreService.Parameters.find(a => a.ParameterGroupName === "Billing" && a.ParameterName === "ShowOtherCurrency");
    if (params) {
      this.EnableShowOtherCurrency = params.ParameterValue === "true" ? true : false;;
    } else {
      this.EnableShowOtherCurrency = false;
    }
  }

  ngOnDestroy() {
    this.ServiceItemsSubscription.unsubscribe();
  }
  ngOnInit(): void {
    this.model.EmployeeCashTransaction = [];
    //to use global variable in list formatter auto-complete
    this.BillingAdditionalServiceItems = this.billingMasterBlService.AdditionalServiceItems;
    this.billingInvoiceBlService.ItemsListFormatter = this.billingInvoiceBlService.ItemsListFormatter.bind(this);
    this.billingInvoiceBlService.DepartmentListFormatter = this.billingInvoiceBlService.DepartmentListFormatter.bind(this);
    this.MstPaymentModes = this.coreService.masterPaymentModes;
    this.PaymentPages = this.coreService.paymentPages;
    if (this.ServiceItems && this.ServiceItems.length > 0) {
      this.coreService.FocusInputById('id_billing_serviceItemName', 1000);
    }
  }

  public SelectedInvoiceItemForAdditionalItemCalculation = new InvoiceItem_DTO();
  public EnablePrice: boolean = false;
  public IsPackageSelectedAsItem: boolean = false;
  public PackageDiscountAmount: number = 0;
  AssignSelectedInvoiceItem(): void {
    if (this.selectedInvoiceItem && typeof (this.selectedInvoiceItem) === 'object') {
      this.SelectedInvoiceItemForAdditionalItemCalculation = this.selectedInvoiceItem; //! Krishna, 4thApril, Using this variable only while calculating the Price of Additional Item (Incase selected Invoice Item has Additional Items)
      let DiscountPercent = 0;
      if (this.selectedInvoiceItem.IsPackageBilling) {
        DiscountPercent = this.selectedInvoiceItem.DiscountPercent;
        this.PackageDiscountAmount = this.selectedInvoiceItem.DiscountAmount;
      } else {
        if (this.SchemePriceCategory.IsDiscountApplicable) {
          DiscountPercent = this.SchemePriceCategory.DiscountPercent;
          if (this.selectedInvoiceItem.IsDiscountApplicable && (this.selectedInvoiceItem.DiscountPercent > 0)) {
            DiscountPercent = this.selectedInvoiceItem.DiscountPercent;
          }
        }
        if (!this.selectedInvoiceItem.IsDiscountApplicable) {
          DiscountPercent = 0;
        }
      }
      this.doctorsList = this.billingService.GetDoctorsListForBilling();

      if (this.selectedInvoiceItem.IsDoctorMandatory) {
        this.AssignPerformer();

      }

      this.HasAdditionalServiceItem = this.HasAdditionalServiceItemSelected = this.selectedInvoiceItem.HasAdditionalBillingItems;
      const startingQuantity = 1; //! Krishna, 2ndApril'23, This is for initial item selection hence hard coded 1
      this.EnablePrice = this.selectedInvoiceItem.IsPriceChangeAllowed;
      this.IsPackageSelectedAsItem = this.selectedInvoiceItem.IsPackageBilling;
      if (this.SelectedPackage && this.SelectedPackage.BillingPackageName && this.IsPackageSelectedAsItem) {
        this.msgBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`${this.SelectedPackage.BillingPackageName} is already selected, Cannot add another in a single billing instance`]);
        return;
      }
      this.InvoiceItemFormGroup.patchValue({
        ItemCode: this.selectedInvoiceItem.ItemCode,
        ServiceItemId: this.selectedInvoiceItem.ServiceItemId,
        ItemName: this.selectedInvoiceItem.ItemName,
        Price: this.selectedInvoiceItem.Price,
        Quantity: startingQuantity, //! Krishna, 2ndApril'23, This is for initial item selection hence hard coded 1
        DiscountPercent: DiscountPercent,
        IsCoPayment: this.selectedInvoiceItem.IsCoPayment,
        CoPaymentCashPercent: this.selectedInvoiceItem.CoPayCashPercent,
        CoPaymentCreditPercent: this.selectedInvoiceItem.CoPayCreditPercent,
        ServiceDepartmentId: this.selectedInvoiceItem.ServiceDepartmentId,
        ServiceDepartmentName: this.selectedInvoiceItem.ServiceDepartmentName,
        IntegrationItemId: this.selectedInvoiceItem.IntegrationItemId
      });
      this.SetInvoiceItemTotalAmountIncludingDiscountAmount();
    }
  }

  private AssignPerformer(): void {
    /*
             !Step 1: First update validation for Performer to required it Doctor is Mandatory for the selected item.
             !Step 2: Check if the DoctorList of that item is null. If Doctor List is not empty, Parse the string DoctorList to local variable in the form of array of numbers.
             !Step 3: If the DoctorList contains single doctor, Find that doctor from all AppointmentApplicable DoctorList & assign that doctor as performer of that service item.
             !Step 4: Else if the DoctorList contains multiple doctors,
                       !- Assign selected default to one variable, say defaultDoctors by filtering from the main DoctorList.
                       !- Assign other remaining doctors to one variable, say otherDoctors by filtering from the main DoctorList and excluding defaultDoctors.
                       !- Then combine defaultDoctors and otherDoctors to AssignedDoctorList in order that defaultDoctors comes first and then otherDoctors on the dropDown Menu.
     */
    //!Step 1:
    this.InvoiceItemFormGroup.get('PerformerId').setValidators(this.selectedInvoiceItem.IsDoctorMandatory ? Validators.required : null);
    this.InvoiceItemFormGroup.get('PerformerId').updateValueAndValidity();

    //!Step 2:
    if (this.selectedInvoiceItem.DefaultDoctorList !== null) {
      let defaultDoctorsIdsList = JSON.parse(this.selectedInvoiceItem.DefaultDoctorList);

      //!Step 3:
      if (defaultDoctorsIdsList.length === 1) {
        let doctor = this.doctorsList.find(d => d.EmployeeId === defaultDoctorsIdsList[0]);
        if (doctor) {
          this.SelectedPerformer = doctor;
          this.AssignSelectedPerformer();
        }
      }

      //!Step 4:
      else if (defaultDoctorsIdsList.length > 1) {
        let defaultDoctors = [];
        defaultDoctorsIdsList.forEach(doctorId => {
          let matchingDoctor = this.doctorsList.find(d => d.EmployeeId === doctorId);
          if (matchingDoctor) {
            defaultDoctors.push(matchingDoctor);
          }
        });
        let otherDoctors = this.doctorsList.filter(doctor => !defaultDoctorsIdsList.includes(doctor.EmployeeId));
        this.doctorsList = [...defaultDoctors, ...otherDoctors];
      }
    }
  }

  //* Krishna, 4thApril'23, Below method is responsible for, assigning and calculating the remaining properties that are needed to an InvoiceItem.
  private AssignAdditionalInvoiceItemToInvoiceItemsArray() {
    if (this.AdditionalInvoiceItem) {
      const invoiceItemDto = new InvoiceItem_DTO();
      invoiceItemDto.ServiceItemId = this.AdditionalInvoiceItem.ServiceItemId;
      invoiceItemDto.ItemCode = this.AdditionalInvoiceItem.ItemCode;
      invoiceItemDto.ItemName = this.AdditionalInvoiceItem.ItemName;;
      invoiceItemDto.Quantity = this.AdditionalInvoiceItem.Quantity;
      invoiceItemDto.Price = this.AdditionalInvoiceItem.Price;
      invoiceItemDto.SubTotal = invoiceItemDto.Price * invoiceItemDto.Quantity;
      invoiceItemDto.DiscountPercent = this.AdditionalInvoiceItem.DiscountPercent;
      invoiceItemDto.DiscountAmount = this.billingInvoiceBlService.CalculateAmountFromPercentage(invoiceItemDto.DiscountPercent, invoiceItemDto.SubTotal);
      invoiceItemDto.TotalAmount = invoiceItemDto.SubTotal - invoiceItemDto.DiscountAmount;
      invoiceItemDto.ServiceDepartmentId = this.AdditionalInvoiceItem.ServiceDepartmentId;
      invoiceItemDto.ServiceDepartmentName = this.AdditionalInvoiceItem.ServiceDepartmentName;

      if (this.SchemePriceCategory.IsCoPayment) {
        this.AdditionalInvoiceItem.IsCoPayment = true;
        let CoPaymentCashAmount = this.billingInvoiceBlService.CalculateAmountFromPercentage(this.AdditionalInvoiceItem.CoPayCashPercent, this.AdditionalInvoiceItem.TotalAmount);
        let CoPaymentCreditAmount = this.billingInvoiceBlService.CalculateAmountFromPercentage(this.AdditionalInvoiceItem.CoPayCreditPercent, this.AdditionalInvoiceItem.TotalAmount);
        this.AdditionalInvoiceItem.CoPaymentCashAmount = CoPaymentCashAmount;
        this.AdditionalInvoiceItem.CoPaymentCreditAmount = CoPaymentCreditAmount;
      } else {
        this.AdditionalInvoiceItem.CoPaymentCashAmount = 0;
        this.AdditionalInvoiceItem.CoPaymentCreditAmount = 0;
      }

      invoiceItemDto.IsCoPayment = this.AdditionalInvoiceItem.IsCoPayment;
      invoiceItemDto.CoPaymentCashAmount = this.AdditionalInvoiceItem.CoPaymentCashAmount;
      invoiceItemDto.CoPaymentCreditAmount = this.AdditionalInvoiceItem.CoPaymentCreditAmount;
      invoiceItemDto.PerformerId = this.AdditionalInvoiceItem.PerformerId;
      invoiceItemDto.PerformerName = this.AdditionalInvoiceItem.PerformerName;
      invoiceItemDto.PrescriberId = this.selectedPrescriberId;
      invoiceItemDto.IntegrationItemId = this.AdditionalInvoiceItem.IntegrationItemId;
      this.InvoiceItemWithAdditionalItem.push(invoiceItemDto);
    }
  }

  AssignSelectedPerformer(): void {
    if (this.SelectedPerformer && typeof (this.SelectedPerformer) === 'object') {
      this.InvoiceItemFormGroup.patchValue({
        PerformerId: this.SelectedPerformer.EmployeeId,
        PerformerName: this.SelectedPerformer.FullName
      });
    }
    else {
      this.InvoiceItemFormGroup.patchValue({
        PerformerId: null,
        PerformerName: null
      });
    }
  }

  CalculateAfterPriceChanged(): void {
    this.SetInvoiceItemTotalAmountIncludingDiscountAmount();
  }

  OnEmptyItemNameField(): void {
    if (!this.selectedInvoiceItem) {
      this.InvoiceItemFormGroup.patchValue({
        ItemCode: '',
        ServiceItemId: null,
        ItemName: '',
        Price: 0,
        Quantity: 1,
        DiscountPercent: 0
      });
      this.SetInvoiceItemTotalAmountIncludingDiscountAmount();
    }
  }

  OnItemQuantityChanged(): void {
    this.SetInvoiceItemTotalAmountIncludingDiscountAmount();
  }
  OnItemDiscountPercentChanged(): void {
    if (this.IsPackageServiceItemEditMode) {
      this.IsPackageServiceItemDiscountChanged = true;
    }
    this.SetInvoiceItemTotalAmountIncludingDiscountAmount();
  }
  OnItemDiscountAmountChanged(): void {
    this.SetInvoiceItemTotalAmountIncludingDiscountPercent();
  }
  CalculateInvoiceTotals(): void {
    if (this.InvoiceItemsDto && this.InvoiceItemsDto.length) {
      if (!this.SchemePriceCategory.IsCoPayment) {
        this.model.SubTotal = this.InvoiceItemsDto.reduce((acc, curr) => curr.SubTotal + acc, 0);
        if (!this.IsPackageSelectedAsItem && !this.isPackageBilling) {
          this.model.DiscountAmount = this.InvoiceItemsDto.reduce((acc, curr) => curr.DiscountAmount + acc, 0);
          this.model.DiscountPercent = this.billingInvoiceBlService.CalculatePercentage(this.model.DiscountAmount, this.model.SubTotal);
        }
        else if (this.IsPackageServiceItemEditMode && this.IsPackageServiceItemDiscountChanged) {
          this.model.DiscountAmount = this.InvoiceItemsDto.reduce((acc, curr) => curr.DiscountAmount + acc, 0);
          this.model.DiscountPercent = Math.round(this.billingInvoiceBlService.CalculatePercentage(this.model.DiscountAmount, this.model.SubTotal));
        }
        else {
          this.model.DiscountAmount = this.PackageDiscountAmount;
          this.model.DiscountPercent = this.billingInvoiceBlService.CalculatePercentage(this.model.DiscountAmount, this.model.SubTotal);
        }
        this.model.TotalAmount = this.model.SubTotal - this.model.DiscountAmount;
        this.model.SubTotal = CommonFunctions.parseAmount(this.model.SubTotal, 4);
        this.model.DiscountAmount = CommonFunctions.parseAmount(this.model.DiscountAmount, 4);

        this.model.DiscountPercent = CommonFunctions.parseAmount(this.model.DiscountPercent, 4);
        this.model.TotalAmount = CommonFunctions.parseAmount(this.model.TotalAmount, 4);
        this.model.ReceivedAmount = this.model.TotalAmount;
        this.model.CoPaymentCreditAmount = 0;
        this.model.Tender = this.model.ReceivedAmount;
      } else {
        this.model.SubTotal = this.InvoiceItemsDto.reduce((acc, curr) => curr.SubTotal + acc, 0);
        if (this.IsPackageSelectedAsItem && this.isPackageBilling) {
          this.model.DiscountAmount = this.PackageDiscountAmount;
        } else {
          this.model.DiscountAmount = this.InvoiceItemsDto.reduce((acc, curr) => curr.DiscountAmount + acc, 0);
        }
        this.model.DiscountPercent = this.billingInvoiceBlService.CalculatePercentage(this.model.DiscountAmount, this.model.SubTotal);
        this.model.TotalAmount = this.model.SubTotal - this.model.DiscountAmount;
        this.model.ReceivedAmount = this.InvoiceItemsDto.reduce((acc, curr) => curr.CoPaymentCashAmount + acc, 0);
        this.model.CoPaymentCreditAmount = this.model.TotalAmount - this.model.ReceivedAmount;

        this.model.SubTotal = CommonFunctions.parseAmount(this.model.SubTotal, 4);
        this.model.DiscountAmount = CommonFunctions.parseAmount(this.model.DiscountAmount, 4);
        this.model.DiscountPercent = CommonFunctions.parseAmount(this.model.DiscountPercent, 4);
        this.model.TotalAmount = CommonFunctions.parseAmount(this.model.TotalAmount, 4);
        this.model.ReceivedAmount = CommonFunctions.parseAmount(this.model.ReceivedAmount, 4);
        this.model.CoPaymentCreditAmount = CommonFunctions.parseAmount(this.model.CoPaymentCreditAmount, 4);
        this.model.Tender = this.model.ReceivedAmount;
      }
    } else {
      this.ResetInvoiceTotals();
    }
    this.ChangeTenderAmount();
  }

  SetInvoiceItemTotalAmountIncludingDiscountAmountForAdditionalItem(): void {
    this.AdditionalInvoiceItem.SubTotal = (this.AdditionalInvoiceItem.Quantity * this.AdditionalInvoiceItem.Price);
    const DiscountAmount = this.billingInvoiceBlService.CalculateAmountFromPercentage(this.AdditionalInvoiceItem.DiscountPercent, this.AdditionalInvoiceItem.SubTotal);
    this.AdditionalInvoiceItem.DiscountAmount = DiscountAmount;
    this.AdditionalInvoiceItem.TotalAmount = (this.AdditionalInvoiceItem.SubTotal - this.AdditionalInvoiceItem.DiscountAmount);
  }

  SetInvoiceItemTotalAmountIncludingDiscountAmount(): void {
    this.InvoiceItemFormControls.SubTotal.setValue(this.InvoiceItemFormValue.Quantity * this.InvoiceItemFormValue.Price);
    let discountAmount = 0;
    if (this.IsPackageSelectedAsItem && this.isPackageBilling) {
      discountAmount = Math.round(this.billingInvoiceBlService.CalculateAmountFromPercentage(this.InvoiceItemFormValue.DiscountPercent, this.InvoiceItemFormValue.SubTotal));
    } else {
      discountAmount = this.billingInvoiceBlService.CalculateAmountFromPercentage(this.InvoiceItemFormValue.DiscountPercent, this.InvoiceItemFormValue.SubTotal);
    }
    this.InvoiceItemFormControls.DiscountAmount.setValue(discountAmount);
    this.InvoiceItemFormControls.TotalAmount.setValue(this.InvoiceItemFormValue.SubTotal - this.InvoiceItemFormValue.DiscountAmount);
  }

  SetInvoiceItemTotalAmountIncludingDiscountPercent(): void {
    this.InvoiceItemFormControls.SubTotal.setValue(this.InvoiceItemFormValue.Quantity * this.InvoiceItemFormValue.Price);
    const DiscountPercent = this.billingInvoiceBlService.CalculatePercentage(this.InvoiceItemFormValue.DiscountAmount, this.InvoiceItemFormValue.SubTotal);
    this.InvoiceItemFormControls.DiscountPercent.setValue(DiscountPercent);
    this.InvoiceItemFormControls.TotalAmount.setValue(this.InvoiceItemFormValue.SubTotal - this.InvoiceItemFormValue.DiscountAmount);
  }

  Initialize(): void {
    this.SetDoctorsList();
    this.LoadPatientBillingContext();
    //this.LoadAdditionalServiceItems();
  }

  LoadAdditionalServiceItems(priceCategoryId: number): void {
    this.billingMasterBlService.GetAdditionalServiceItems(ENUM_AdditionalServiceItemGroups.Anaesthesia, priceCategoryId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
          this.BillingAdditionalServiceItems = res.Results;
        }
      }, err => {
        this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Could not load Additional ServiceItems"]);
      })
  }
  AddInvoiceItems(): void {
    if (this.InvoiceItemFormValue && this.InvoiceItemFormGroup.valid) {
      if (!this.IsPackageSelectedAsItem) {
        this.InvoiceItemDto.ServiceItemId = this.InvoiceItemFormValue.ServiceItemId;
        this.InvoiceItemDto.ItemCode = this.InvoiceItemFormValue.ItemCode;
        this.InvoiceItemDto.ItemName = this.InvoiceItemFormValue.ItemName;;
        this.InvoiceItemDto.Quantity = this.InvoiceItemFormValue.Quantity;
        this.InvoiceItemDto.Price = this.InvoiceItemFormValue.Price;
        this.InvoiceItemDto.SubTotal = this.InvoiceItemDto.Price * this.InvoiceItemDto.Quantity;
        this.InvoiceItemDto.DiscountPercent = this.InvoiceItemFormValue.DiscountPercent;
        this.InvoiceItemDto.DiscountAmount = this.billingInvoiceBlService.CalculateAmountFromPercentage(this.InvoiceItemDto.DiscountPercent, this.InvoiceItemDto.SubTotal);
        this.InvoiceItemDto.TotalAmount = this.InvoiceItemDto.SubTotal - this.InvoiceItemDto.DiscountAmount;
        this.InvoiceItemDto.ServiceDepartmentId = this.InvoiceItemFormValue.ServiceDepartmentId;
        this.InvoiceItemDto.ServiceDepartmentName = this.InvoiceItemFormValue.ServiceDepartmentName;

        if (this.SchemePriceCategory.IsCoPayment) {
          this.InvoiceItemFormControls.IsCoPayment.setValue(true);
          let CoPaymentCashAmount = this.billingInvoiceBlService.CalculateAmountFromPercentage(this.InvoiceItemFormValue.CoPaymentCashPercent, this.InvoiceItemFormValue.TotalAmount);
          let CoPaymentCreditAmount = this.billingInvoiceBlService.CalculateAmountFromPercentage(this.InvoiceItemFormValue.CoPaymentCreditPercent, this.InvoiceItemFormValue.TotalAmount);
          this.InvoiceItemFormControls.CoPaymentCashAmount.setValue(CoPaymentCashAmount);
          this.InvoiceItemFormControls.CoPaymentCreditAmount.setValue(CoPaymentCreditAmount);
        } else {
          this.InvoiceItemFormControls.CoPaymentCashAmount.setValue(0);
          this.InvoiceItemFormControls.CoPaymentCreditAmount.setValue(0);
        }

        this.InvoiceItemDto.IsCoPayment = this.InvoiceItemFormValue.IsCoPayment;
        this.InvoiceItemDto.CoPaymentCashAmount = this.InvoiceItemFormValue.CoPaymentCashAmount;
        this.InvoiceItemDto.CoPaymentCreditAmount = this.InvoiceItemFormValue.CoPaymentCreditAmount;
        this.InvoiceItemDto.PerformerId = this.InvoiceItemFormValue.PerformerId;
        this.InvoiceItemDto.PerformerName = this.InvoiceItemFormValue.PerformerName;
        this.InvoiceItemDto.PrescriberId = this.selectedPrescriberId;
        this.InvoiceItemDto.IntegrationItemId = this.InvoiceItemFormValue.IntegrationItemId;



        // this.CheckForDoubleEntry();

        //!Krishna, If Selected Invoice Item has any additional Item With it below logic will work
        if (this.HasAdditionalServiceItemSelected) {
          this.InvoiceItemWithAdditionalItem.unshift(this.InvoiceItemDto);
          this.AddInvoiceItemWithAdditionalItem();
        } else {
          this.InvoiceItemsDto.push(this.InvoiceItemDto);
          this.CheckForDoubleEntry();

        }

        this.ResetAddedInvoiceItemObj();
        this.CalculateInvoiceTotals();
        this.coreService.FocusInputById('id_billing_serviceItemName', 500);
      } else {
        this.AssignItemsOfSelectedPackage();
      }
      this.InvoiceItemFormGroup.get('PerformerId').setValidators(null);
      this.InvoiceItemFormGroup.get('PerformerId').updateValueAndValidity();
    } else {
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Validation Error"]);
    }

  }
  public CheckForDoubleEntry() {
    this.InvoiceItemsDto.forEach(itm => {
      if (this.InvoiceItemsDto.filter(item => item.ServiceItemId === this.InvoiceItemDto.ServiceItemId).length > 1) {
        if (!itm.IsDoubleEntry_Now && itm.ServiceItemId === this.InvoiceItemDto.ServiceItemId) {
          itm.IsDoubleEntry_Now = true;
        }
      }
      else {
        if (!itm.IsDoubleEntry_Now)
          itm.IsDoubleEntry_Now = false;
      }
      this.HasDoubleEntryInPast();
      if (this.PastTestList_ForDuplicate && this.PastTestList_ForDuplicate.find(item => item.ServiceItemId == this.InvoiceItemDto.ServiceItemId)) {
        if (itm.ServiceItemId === this.InvoiceItemDto.ServiceItemId)
          itm.IsDoubleEntry_Past = true;
      }
      else {
        if (!itm.IsDoubleEntry_Past)
          itm.IsDoubleEntry_Past = false;
      }
    });

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


  //* Krishna, 4thApril'23, Below Method is responsible to add InvoiceItemWithAdditionalItem to InvoiceItems list.
  AddInvoiceItemWithAdditionalItem(): void {
    if (this.InvoiceItemWithAdditionalItem && this.InvoiceItemWithAdditionalItem.length) {
      this.SelectedAdditionalItem = new BillingAdditionalServiceItem_DTO();
      this.InvoiceItemsDto = [... this.InvoiceItemsDto, ... this.InvoiceItemWithAdditionalItem];
      this.HasAdditionalServiceItemSelected = false;
      this.InvoiceItemWithAdditionalItem = new Array<InvoiceItem_DTO>();
    }
  }

  AssignInvoiceItemsToBillingTransactionItems(): void {
    if (this.InvoiceItemsDto && this.InvoiceItemsDto.length) {
      this.model.BillingTransactionItems = new Array<BillingTransactionItem>();
      this.InvoiceItemsDto.forEach((itm) => {
        const billingTransactionItem = new BillingTransactionItem();
        billingTransactionItem.ServiceItemId = itm.ServiceItemId;
        billingTransactionItem.ServiceDepartmentId = itm.ServiceDepartmentId;
        billingTransactionItem.ServiceDepartmentName = itm.ServiceDepartmentName;
        billingTransactionItem.ItemCode = itm.ItemCode;
        billingTransactionItem.ItemName = itm.ItemName;
        billingTransactionItem.Price = itm.Price;
        billingTransactionItem.Quantity = itm.Quantity;
        billingTransactionItem.SubTotal = itm.SubTotal;
        billingTransactionItem.DiscountPercent = itm.DiscountPercent;
        billingTransactionItem.DiscountAmount = itm.DiscountAmount;
        billingTransactionItem.TotalAmount = itm.TotalAmount;
        billingTransactionItem.PerformerId = itm.PerformerId;
        billingTransactionItem.PerformerName = itm.PerformerName;
        billingTransactionItem.PrescriberId = itm.PrescriberId;
        if (this.SelectedPrescriber) {
          billingTransactionItem.PrescriberName = this.SelectedPrescriber.ReferrerName;//! This logic needs a revision later
        } else {
          let doc = this.doctorsList.find(a => a.EmployeeId === itm.PrescriberId);//sud:27Mar'23--Null Handling done
          billingTransactionItem.PrescriberName = doc ? doc.FullName : null; //! This logic is risky here need to revise it
        }
        billingTransactionItem.DiscountSchemeId = this.SchemePriceCategory.SchemeId;
        billingTransactionItem.PriceCategoryId = this.SchemePriceCategory.PriceCategoryId;
        billingTransactionItem.PatientId = this.model.PatientId;
        billingTransactionItem.BillStatus = this.model.BillStatus;
        billingTransactionItem.BillingType = this.billingType;
        billingTransactionItem.IsCoPayment = this.SchemePriceCategory.IsCoPayment;
        billingTransactionItem.CoPaymentCashAmount = itm.CoPaymentCashAmount;
        billingTransactionItem.CoPaymentCreditAmount = itm.CoPaymentCreditAmount;
        billingTransactionItem.IntegrationItemId = itm.IntegrationItemId;
        billingTransactionItem.VisitType = this.currentVisitType;
        billingTransactionItem.PatientVisitId = this.currPatVisitContext.PatientVisitId;
        billingTransactionItem.BillingPackageId = itm.BillingPackageId;

        billingTransactionItem.BillingTransactionItemValidator.get('ItemName').setValue(billingTransactionItem.ItemName);
        billingTransactionItem.BillingTransactionItemValidator.get('PerformerId').setValue(billingTransactionItem.PerformerId);
        const prescriberId = billingTransactionItem.PrescriberId ? billingTransactionItem.PrescriberId : null;
        billingTransactionItem.BillingTransactionItemValidator.get('PrescriberId').setValue(prescriberId);
        billingTransactionItem.BillingTransactionItemValidator.get('Price').setValue(billingTransactionItem.Price);
        billingTransactionItem.BillingTransactionItemValidator.get('Quantity').setValue(billingTransactionItem.Quantity);
        billingTransactionItem.BillingTransactionItemValidator.get('ServiceDepartmentId').setValue(billingTransactionItem.ServiceDepartmentId);
        billingTransactionItem.BillingTransactionItemValidator.get('DiscountPercent').setValue(billingTransactionItem.DiscountPercent);
        billingTransactionItem.BillingTransactionItemValidator.get('DiscountAmount').setValue(billingTransactionItem.DiscountAmount);

        this.model.BillingTransactionItems.push(billingTransactionItem);
      });
    }
  }

  RemoveInvoiceItem(index: number) {
    if (index >= 0) {
      const removedItem = this.InvoiceItemsDto[index];
      this.InvoiceItemsDto.splice(index, 1);
      //!Bibek, 14thMay'23, Adding this logic here to handle Duplicate Item Entry removal.
      this.InvoiceItemsDto.forEach(itm => {
        if (itm.ServiceItemId === removedItem.ServiceItemId) {
          itm.IsDoubleEntry_Now = false;
        }
      });
      this.CalculateInvoiceTotals();
    }
  }

  ResetAddedInvoiceItemObj() {
    this.InvoiceItemDto = new InvoiceItem_DTO();
    this.model.BillingTransactionItems = new Array<BillingTransactionItem>();
    this.InvoiceItemFormGroup.reset();
    this.InvoiceItemFormControls.ServiceItemId.setErrors(null);
    if (this.selectedPrescriberId) {
      this.InvoiceItemFormControls.PrescriberId.setValue(this.selectedPrescriberId);
    }
    this.EnablePrice = false;
  }

  LoadPatientPastBillSummary(patientId: number) {
    this.billingBlService.GetPatientPastBillSummary(patientId)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {

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
          this.msgBoxService.showMessage(ENUM_DanpheHTTPResponses.Failed, [res.ErrorMessage]);
          this.loading = false;
        }
      });
  }
  public SetDoctorsList() {
    //set doctorsList and reqDoctorslist separately so that both has their own copy of the objects.
    this.doctorsList = this.billingService.GetDoctorsListForBilling();
    this.reqDoctorsList = this.billingService.GetDoctorsListForBilling();

    let Obj = new Object();
    Obj["EmployeeId"] = null;
    Obj["FullName"] = "SELF";
    this.reqDoctorsList.push(Obj);
    //due to asynchronous call consulting doctor was not updated all the time. so moving this get call here.
    this.GetPatientVisitList(this.patientService.getGlobal().PatientId);
  }

  LoadPatientBillingContext() {
    //we get billing context from earlier invoice incase of copy from earlier invoice.
    if (this.currentBillingFlow !== ENUM_CurrentBillingFlow.BillReturn) {//&& this.currentVisitType != "inpatient"
      this.billingBlService.GetPatientBillingContext(this.patientService.globalPatient.PatientId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            if (res.Results) {
              this.currBillingContext = res.Results;
              const currentPatientSchemeMap = this.currBillingContext.PatientSchemeMap;
              this.CurrentPatientSchemeMap = currentPatientSchemeMap;
              this.currentVisitType = this.currBillingContext.BillingType;
              this.billingService.BillingType = this.currBillingContext.BillingType;
              this.billingType = this.currBillingContext.BillingType;
            }
          }
        });
    }
  }

  public GetPatientVisitList(patientId: number) {
    this.billingBlService.GetPatientVisitsProviderWise(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results && res.Results.length) {
            this.visitList = res.Results;
            //Default Value for RequestedBy: Assign provider from latest visit
            this.selectedPrescriberId = this.visitList[0].PerformerName == "Duty Doctor" ? 0 : this.visitList[0].PerformerId;
            this.selectedRefId = this.visitList[0].PerformerName == "Duty Doctor" ? 0 : this.visitList[0].ReferredById;

            this.AssignSelectedPrescriber();
            //sud:9Sep'21---Check if below is needed or not..
            //we may need to refactor this whole page soon..

          }
        }
        else {
          console.log(res.ErrorMessage);
        }

        this.isReferrerLoaded = true;
      },
        err => {
          this.msgBoxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ["unable to get PatientVisit list.. check log for more details."]);
          console.log(err.ErrorMessage);

        });
  }
  public RequestingDepartmentId: number = null;
  GetVisitContext(patientId: number, visitId: number) {
    if (patientId && visitId) {
      this.billingBlService.GetDataOfInPatient(patientId, visitId)
        .subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
            this.currPatVisitContext = res.Results;
            this.RequestingDepartmentId = this.currPatVisitContext.RequestingDepartmentId;
            this.selectedDepartment = this.DepartmentList.find(a => a.DepartmentId === this.RequestingDepartmentId);
            this.model.PatientVisitId = this.currPatVisitContext.PatientVisitId;
            this.SchemePriCeCategoryFromVisit.SchemeId = this.currPatVisitContext.SchemeId;
            this.SchemePriCeCategoryFromVisit.PriceCategoryId = this.currPatVisitContext.PriceCategoryId;

            this.SchemePriCeCategoryFromVisitTemp = _.cloneDeep(this.SchemePriCeCategoryFromVisit);

            if (this.currPatVisitContext.ClaimCode) {
              this.isClaimed(this.currPatVisitContext.ClaimCode, this.currPatVisitContext.PatientId);
            }
            //sud:15Mar'19--to change VisitContext for ER patients-- moved from SearchPatient to here..
            this.ShowHideChangeVisitPopup(this.currPatVisitContext);

          }
          else {
            this.DisplaySystemDefaultSchemePriceCategory = true;
            console.log(ENUM_DanpheHTTPResponses.Failed, ["Problem! Cannot get the Current Visit Context ! "]);
          }
        },
          err => { console.log(err.ErrorMessage); });
    } else {
      this.DisplaySystemDefaultSchemePriceCategory = true;
    }

  }

  // sud:15Mar'19--for er patients we have to give popup to either continue with ER or OP billing on next day..
  // moved from SearchPatient to this page.. needed for SearchPatientOptimization.
  ShowHideChangeVisitPopup(visContext) {
    if (visContext.VisitType && visContext.VisitType.toLowerCase() === "emergency") {
      let lastErDay = moment().diff(moment(visContext.VisitDate), 'days');
      if (lastErDay > 0) {
        this.showChangeVisitTypePopup = true;
      }
    }
    else {
      this.patientService.globalPatient.LatestVisitType = this.billingService.BillingType;
    }
  }

  public AssignSelectedPrescriber() {
    if (this.selectedPrescriberId || this.selectedRefId) {
      this.InvoiceItemFormControls.PrescriberId.setValue(this.selectedPrescriberId);
    }
  }

  isClaimed(LatestClaimCode: number, PatientId: number): void {
    this.billingBlService.IsClaimed(LatestClaimCode, PatientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results === true) {
            this.isClaimSuccessful = true;
          }
        }
      },
        (err: DanpheHTTPResponse) => {
          this.msgBoxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ["Unable to check for pending claims"]);
        }
      );
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
        this.msgBoxService.showMessage("failed", ["Deposit balance is zero, Please add deposit to use this feature."]);
        this.deductDeposit = !this.deductDeposit;
      }
    }
    else {
      //reset all required properties..
      if (this.SchemePriceCategory && this.SchemePriceCategory.IsCoPayment) {
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
  ShowDepositPopUp() {
    this.showDepositPopUp = true;
  }
  ShowPackage() {
    this.showSelectPage = false;
    this.changeDetectorRef.detectChanges();
    this.showSelectPage = true;
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
      this.msgBoxService.showMessage('error', ["Please select Lab Type Name."]);
    }
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

  ClearSelectedItem(index) {
    this.selectedItems[index] = null;
    this.model.BillingTransactionItems[index].Price = null;
    this.model.BillingTransactionItems[index].ProcedureCode = null;  //Item Id is for procedureId of the Items at BillItem
    this.model.BillingTransactionItems[index].ItemId = null;
    this.ReCalculateInvoiceAmounts();//sud:10Mar'19
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

    // if (this.selectedPriceCategoryObj && this.selectedPriceCategoryObj.IsCoPayment) {
    //     this.model.BillingTransactionItems.forEach(ele => {
    //         if (ele.IsCoPayment) {
    //             ele.CoPaymentCashAmount = (ele.CoPaymentCashPercent * ele.TotalAmount) / 100;
    //             ele.CoPaymentCreditAmount = (ele.CoPaymentCreditPercent * ele.TotalAmount) / 100;
    //         }
    //     });

    //     this.model.ReceivedAmount = this.model.BillingTransactionItems.reduce((acc, item) => acc + item.CoPaymentCashAmount, 0);
    //     this.model.CoPaymentCreditAmount = this.model.BillingTransactionItems.reduce((acc, item) => acc + item.CoPaymentCreditAmount, 0);

    //     this.model.ReceivedAmount = CommonFunctions.parseAmount(this.model.ReceivedAmount, 3);
    //     this.model.CoPaymentCreditAmount = CommonFunctions.parseAmount(this.model.CoPaymentCreditAmount, 3);
    // } else {

    //     this.model.ReceivedAmount = this.model.TotalAmount;

    // }
    this.model.Tender = this.model.ReceivedAmount;
    this.ChangeTenderAmount();
  }

  OnInvoiceDiscountAmountChanged() {
    this.model.DiscountPercent = this.billingInvoiceBlService.CalculatePercentage(this.model.DiscountAmount, this.model.SubTotal);
    this.InvoiceItemsDto.forEach(itm => {
      itm.DiscountPercent = this.model.DiscountPercent ? this.model.DiscountPercent : 0;
      itm.DiscountAmount = this.billingInvoiceBlService.CalculateAmountFromPercentage(itm.DiscountPercent, itm.SubTotal);
      itm.TotalAmount = itm.SubTotal - itm.DiscountAmount;
    });
    this.CalculateInvoiceTotals();
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
      this.msgBoxService.showMessage("Error", ["Cash cannot be less than 0!"]);
    }
    if (CommonFunctions.parseAmount(ReceivedAmount, 1) > CommonFunctions.parseAmount(this.model.TotalAmount, 1)) {
      isValidAmount = false;
      this.msgBoxService.showMessage("Error", ["Cash cannot be more than TotalAmount!"]);
    }
    if (this.SchemePriceCategory.IsCoPayment) {
      let CoPaymentCashAmount = this.model.BillingTransactionItems.reduce((acc, itm) => acc + itm.CoPaymentCashAmount, 0);
      if (CommonFunctions.parseAmount(ReceivedAmount, 1) < CommonFunctions.parseAmount(CoPaymentCashAmount, 1)) {
        isValidAmount = false;
        this.msgBoxService.showMessage("Error", ["Cash cannot be less than CoPaymentCash Amount!"]);
      }
    }
    return isValidAmount;
  }
  ChangeTenderAmount() {
    if (this.deductDeposit) {
      this.model.Change = CommonFunctions.parseAmount(this.model.Tender + this.depositDeductAmount - this.model.TotalAmount, 3);
    }
    else {
      this.model.Change = CommonFunctions.parseAmount(this.model.Tender - (this.model.ReceivedAmount), 3);
    }
  }

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
    this.selectedPrescriberId = $event.ReferrerId; //! need to change this logic
    this.SelectedPrescriber = $event;
  }
  public ItemLevelDiscountChkBoxOnChange() {
    if (this.SchemePriceCategory.IsDiscountApplicable && this.SchemePriceCategory.IsDiscountEditable) {
      if (this.ShowItemLevelDiscount && this.EnableDiscountField) {
        this.ShowItemLevelDiscountAmountField = true;
        this.DisableItemLevelDiscPercent = true;
        this.DisableItemLevelDiscAmount = false;
        this.DisableInvoiceDiscountAmount = true;
        this.DisableInvoiceDiscountPercent = true;
      } else if (this.ShowItemLevelDiscount) {
        this.ShowItemLevelDiscountAmountField = false;
        this.DisableItemLevelDiscPercent = false;
        this.DisableItemLevelDiscAmount = true;
        this.DisableInvoiceDiscountAmount = true;
        this.DisableInvoiceDiscountPercent = true;
      } else if (this.EnableDiscountField) {
        this.ShowItemLevelDiscountAmountField = false;
        this.DisableItemLevelDiscPercent = true;
        this.DisableItemLevelDiscAmount = true;
        this.DisableInvoiceDiscountAmount = false;
        this.DisableInvoiceDiscountPercent = true;
      } else {
        this.ShowItemLevelDiscountAmountField = false;
        this.DisableItemLevelDiscPercent = true;
        this.DisableItemLevelDiscAmount = true;
        this.DisableInvoiceDiscountAmount = true;
        this.DisableInvoiceDiscountPercent = false;
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  // * This handles the Enable Discount Amount checkbox actions.. Krishna,27th'March'22
  EnableDiscountAmount() {
    if (this.SchemePriceCategory.IsDiscountApplicable && this.SchemePriceCategory.IsDiscountEditable) {
      if (this.EnableDiscountField && this.ShowItemLevelDiscount) {
        this.ShowItemLevelDiscountAmountField = true;
        this.DisableItemLevelDiscPercent = true;
        this.DisableItemLevelDiscAmount = false;
        this.DisableInvoiceDiscountAmount = true;
        this.DisableInvoiceDiscountPercent = true;
      } else if (this.EnableDiscountField) {
        this.ShowItemLevelDiscountAmountField = false;
        this.DisableItemLevelDiscPercent = true;
        this.DisableItemLevelDiscAmount = true;
        this.DisableInvoiceDiscountAmount = false;
        this.DisableInvoiceDiscountPercent = true;
      } else if (this.ShowItemLevelDiscount) {
        this.ShowItemLevelDiscountAmountField = false;
        this.DisableItemLevelDiscPercent = false;
        this.DisableItemLevelDiscAmount = true;
        this.DisableInvoiceDiscountAmount = true;
        this.DisableInvoiceDiscountPercent = true;
      } else {
        this.ShowItemLevelDiscountAmountField = false;
        this.DisableItemLevelDiscPercent = true;
        this.DisableItemLevelDiscAmount = true;
        this.DisableInvoiceDiscountAmount = true;
        this.DisableInvoiceDiscountPercent = false;
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  OnInvoiceDiscountPercentChanged() {
    this.InvoiceItemsDto.forEach(itm => {
      itm.DiscountPercent = this.model.DiscountPercent ? this.model.DiscountPercent : 0;
      itm.DiscountAmount = this.billingInvoiceBlService.CalculateAmountFromPercentage(itm.DiscountPercent, itm.SubTotal);
      itm.TotalAmount = itm.SubTotal - itm.DiscountAmount;
    });
    this.CalculateInvoiceTotals();
  }


  //this function is hotkeys when pressed by user
  public hotkeys(event) {
    if (!this.HasAdditionalServiceItem && event.keyCode == 27) { //ESC
      this.CloseInvoicePrint();
    }

    if (this.HasAdditionalServiceItem && event.keyCode === 27) {
      this.CloseAdditionalServiceItem();
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
            if (this.isProvisionalBilling) {
              this.PostProvisionalBilling();
            } else {
              this.PostInvoice();
            }
          }
          break;
        }
        default:
          break;
      }
    }
    //! Press F1, to enable package billing
    if (event.keyCode === 112) {
      event.preventDefault();
      this.isPackageBilling = !this.isPackageBilling;
      this.SelectedPackage = new BillingPackages_DTO();
      this.HandlePackageBillingChange();
    }
    //! Press F2, to open Add Deposit Popup if not opened and Close if opened already
    if (event.keyCode === 113) {
      event.preventDefault();
      if (this.showDepositPopUp) {
        this.CloseDepositPopUp();
      } else {
        this.ShowDepositPopUp();
      }
    }
  }
  //sud:16May'21--Moving Invoice Printing as Popup
  public CloseInvoicePrint() {
    this.showInvoicePrintPage = false;
    this.model = this.billingService.getGlobalBillingTransaction();
    this.router.navigate(["/Billing/SearchPatient"]);
  }

  public CloseAdditionalServiceItem() {
    this.HasAdditionalServiceItem = false;
    this.GoToQuantityOrOtherElement('id_billing_serviceItemName', 'id_billing_serviceItemQty', 'id_billing_credit_remarks'); //! After the Additional ServiceItem Popup closes it should focus on either of these two elements.
    this.changeDetectorRef.detectChanges();
  }

  PaymentModeChanges($event) {
    this.model.PaymentMode = $event.PaymentMode.toLowerCase();
    this.model.PaymentDetails = $event.PaymentDetails;
    this.IsRemarksMandatory = $event.IsRemarksMandatory;
    this.OnPaymentModeChange();
  }

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

      if (!this.SchemePriceCategory.IsCoPayment && this.model.CoPayment_PaymentMode.toLowerCase() !== ENUM_BillPaymentMode.credit.toLowerCase()) {
        this.model.OrganizationId = null;
        this.model.OrganizationName = null;
      }

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

  DepositDeductCheckBoxChanged() {
    //toggle Checked-Unchecked of 'Deduct From Deposit Checkbox'
    this.CalculateDepositBalance();
  }

  CreditOrganizationChanges($event) {
    // if (this.model.OrganizationId != $event.OrganizationId) {
    //     this.coreService.FocusInputById('id_billing_credit_remarks');
    // }
    this.model.OrganizationId = $event.OrganizationId;
    this.model.OrganizationName = $event.OrganizationName;
    //this.coreService.FocusInputById('id_billing_credit_remarks');
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

  CheckDuplicateItemEntryBeforeSubmission(): boolean {
    const duplicateItems = this.InvoiceItemsDto.some(a => a.IsDoubleEntry_Now === true);
    if (!this.param_allowDuplicateItemsEntryInBillingTransaction && duplicateItems) {

      return true;
    }
    return false;
  }
  PostInvoice() {

    if (this.CheckDuplicateItemEntryBeforeSubmission()) {
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Duplicate Items Entry is not allowed"]);
      this.loading = false;
      return;
    }

    //this.loading = false;
    this.OnPaymentModeChange();
    this.AssignInvoiceItemsToBillingTransactionItems();

    this.SetLabTypeName();
    //sud:9Sep'21---to set PatientVisitId in the billing..
    this.SetVisitContextBeforeBillSubmit();

    this.CheckAndSubmitBillingTransaction();

  }

  CheckCreditLimit(): boolean {
    let isValid = false;
    let creditLimit = 0;
    creditLimit = this.SchemePriceCategory.IsCreditLimited ? this.CurrentPatientSchemeMap.OpCreditLimit : this.CurrentPatientSchemeMap.GeneralCreditLimit;
    if (creditLimit >= this.model.TotalAmount) {
      isValid = true;
    }
    return isValid;
  }

  SetLabTypeName() {
    this.model.BillingTransactionItems.forEach(a => {
      a.DiscountSchemeId = this.SchemePriceCategory.SchemeId;

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

  public SetVisitContextBeforeBillSubmit() {
    this.model.PatientVisitId = this.patLastVisitContext.PatientVisitId;
    this.model.BillingTransactionItems.forEach(itm => {
      itm.PatientVisitId = this.patLastVisitContext.PatientVisitId;
    });
  }

  CheckAndSubmitBillingTransaction() {
    //! Krishna, 17thApril'23, We need to add a validation logic before submitting the Invoice to the Server, There is a separate Method for Validation logics but for now skipping it, need to use it later...
    //!Krishna, 18thMay'23, If PatientScheme is CreditLimited Scheme, We need to add some Validation logic.
    if ((this.SchemePriceCategory.IsCreditLimited || this.SchemePriceCategory.IsGeneralCreditLimited) && !this.CheckCreditLimit()) {
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Total Amount is greater than CreditLimit available."]);
      return;
    }

    //this can move to common validation function
    if (this.model.DiscountPercent < 0 || this.model.DiscountPercent > 100) {
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["DiscountAmount is not valid"]);
      this.loading = false;
      return;
    }

    //If discount is applied for Final Bill (not provisional) then remarks is mandatory
    if (this.model.DiscountAmount && this.model.DiscountAmount > 0 && !this.model.Remarks) {
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Remarks is mandatory for Discounts"]);
      this.loading = false;
      return;
    }

    if (this.isClaimSuccessful) {
      this.msgBoxService.showMessage(ENUM_DanpheHTTPResponses.Failed, ["This Visit context is claimed, create a new visit"]);
    }

    if (this.model && this.model.BillingTransactionItems.length) {
      //! Krishna, 27thMarch'23 Need to add all the validations here
      this.SubmitBillingTransaction();
    } else {
      this.loading = false;
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["No Items Added To Print Invoice"]);
    }
  }

  SubmitBillingTransaction() {
    if (this.SchemePriceCategory.IsCoPayment && this.model.CoPayment_PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit.toLowerCase()) {
      this.model.PaymentMode = this.model.CoPayment_PaymentMode; //credit
    }

    if (this.model.PaymentMode.toLowerCase() !== ENUM_BillPaymentMode.credit.toLowerCase()) {
      this.model.PaymentMode = ENUM_BillPaymentMode.cash;//"cash";
      this.model.ReceivedAmount = this.model.TotalAmount;
    }
    else {
      this.model.PaymentMode = ENUM_BillPaymentMode.credit;//"credit";
    }
    if (this.model.BillingTransactionItems.some(a => a.SrvDeptIntegrationName !== "LAB")) {
      this.model.LabTypeName = null;
    }

    if (this.isPackageBilling) {
      this.model.PackageId = this.SelectedPackage.BillingPackageId;
      this.model.PackageName = this.SelectedPackage.BillingPackageName;
    }

    if (this.loading) {
      if (this.model.PaymentMode === ENUM_BillPaymentMode.credit && !this.model.PatientVisitId) {
        this.loading = false;
        this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Cannot do Credit Billing without visit"]);
        return;
      }
      //this.AssignBillTxnItemsValuesForSubmit();
      this.PostBillingTransaction(this.model.BillingTransactionItems);
    }
  }
  PostBillingTransaction(billTxnItems: Array<BillingTransactionItem>, emergencyItem = null) {
    if (this.isProvisionalBilling === true) {
      if (this.model.PatientVisitId) {
        this.billingBlService.ProceedToBillingTransaction(this.model, billTxnItems, "active", "provisional", this.insuranceApplicableFlag, this.currPatVisitContext).subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            let result = res.Results;
            this.provReceiptInputs.PatientId = this.model.PatientId;
            this.provReceiptInputs.ProvFiscalYrId = result[0].ProvisionalFiscalYearId;
            this.provReceiptInputs.ProvReceiptNo = result[0].ProvisionalReceiptNo;
            this.provReceiptInputs.visitType = null;//sending null from here for now.. Check this later..

            this.showInvoicePrintPage = true;
          }
          else {
            this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Unable to complete transaction."]);
            console.log(res.ErrorMessage)
            this.loading = false;
          }
        });
      } else {
        this.msgBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Cannot do Provisional Billing Without Visit"]);
        this.loading = false;
      }

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
      this.billingBlService.ProceedToBillingTransaction(this.model, billTxnItems, "active", "provisional", this.insuranceApplicableFlag, this.currPatVisitContext).subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.bil_FiscalYrId = res.Results.FiscalYearId;
          this.bil_BilTxnId = res.Results.BillingTransactionId;
          this.bil_InvoiceNo = res.Results.InvoiceNo;
          this.showInvoicePrintPage = true;

        }
        else {
          if (res.ErrorMessage.match(/Invalid Deposit Amount/g)) {
            this.msgBoxService.showMessage("failed", [res.ErrorMessage.substring(0, 35)]);
            this.router.navigate(['/Billing/SearchPatient']);
          }
          else
            this.msgBoxService.showMessage("failed", [res.ErrorMessage]);
          this.loading = false;
        }
      });

    }
  }
  AssignValuesToBillTxn() {
    this.model.CounterId = this.currentCounter;
    this.model.MemberNo = this.currPatVisitContext.MemberNo;
    if (this.SchemePriceCategory.IsCreditApplicable) {
      const creditOrganization = this.billingService.AllCreditOrganizationsList.find(a => a.OrganizationId === this.model.OrganizationId);
      this.model.ClaimCode = (creditOrganization && creditOrganization.IsClaimCodeCompulsory) ? this.currPatVisitContext.ClaimCode : null;
    }
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
    this.model.SchemeId = this.SchemePriceCategory.SchemeId;
    this.OnPaymentModeChange();
  }
  PostProvisionalBilling() {
    if (this.CheckDuplicateItemEntryBeforeSubmission()) {
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Duplicate Items Entry is not allowed"]);
      this.loading = false;
      return;
    }

    this.AssignInvoiceItemsToBillingTransactionItems();
    if (this.model.BillingTransactionItems) {
      this.model.SchemeId = this.SchemePriceCategory.SchemeId;
      this.model.BillingTransactionItems.forEach(txnItm => {
        txnItm.CounterId = this.securityService.getLoggedInCounter().CounterId;
        txnItm.BillStatus = ENUM_BillingStatus.provisional;// "provisional";
        txnItm.PaidDate = null;
        txnItm.DiscountSchemeId = this.SchemePriceCategory.SchemeId;
        txnItm.PriceCategoryId = this.SchemePriceCategory.PriceCategoryId;
        txnItm.PriceCategory = this.SchemePriceCategory.PriceCategoryName;
        txnItm.Remarks = this.model.Remarks;
      });
    }

    //Checking from parameter, allow/restrict Additional Discount for Provisional bills
    if ((!this.param_allowAdditionalDiscOnProvisional) && this.model.DiscountPercent && this.model.DiscountPercent > 0) {
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Additional Discount is not applicable for Provisional Bills"]);
      this.loading = false;
      return;
    }


    //this can move to common validation function
    if (this.model.DiscountPercent < 0 || this.model.DiscountPercent > 100) {
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["DiscountAmount cannot be more than SubTotal."]);
      this.loading = false;
      return;
    }

    this.SetLabTypeName();
    this.isProvisionalBilling = true;
    this.CheckAndSubmitBillingTransaction();//find a way to avoid confusions..
    //Checking from parameter, allow duplicate items entry in billing transaction

  }
  OnProvisionalAmountClick() {
    this.routeFromService.RouteFrom = "BillingTransactionProvisional";
    this.router.navigate(['/Billing/ProvisionalClearance']);
  }

  ShowPastBillHistory(): void {
    if (this.showPastBillHistory) {

    }
  }
  PastTest($event): void {
    this.PastTestList = $event;
  }

  GoToNextElement(id: string): void {
    if (id) {
      this.coreService.FocusInputById(id, 100);
    }
  }

  GoToNext(nextField: HTMLInputElement) {
    nextField.focus();
    nextField.select();
  }

  GoToQuantityOrOtherElement(currentElement: string, nextElement: string, secondNextelement: string): void {
    if (this.AllowProvisionalBilling && this.DisplayPrintProvisionalButton) {
      const value = (<HTMLInputElement>document.getElementById('id_billing_credit_remarks')).value;
      if (value) {
        this.coreService.FocusInputById('id_billing_credit_remarks', 100);
      } else {
        this.coreService.FocusButtonById('id_btn_print_provisional');
      }
    }
    if (this.model.PaymentMode === ENUM_BillPaymentMode.credit) {
      if (!this.HasAdditionalServiceItem) {
        if (currentElement && nextElement && secondNextelement) {
          const value = (<HTMLInputElement>document.getElementById(currentElement)).value;
          if (value) {
            this.coreService.FocusInputById(nextElement, 100);
          } else {
            this.coreService.FocusInputById(secondNextelement, 100);
          }
        }
      }
    } else {
      if (!this.HasAdditionalServiceItem) {
        if (currentElement && nextElement && secondNextelement) {
          const value = (<HTMLInputElement>document.getElementById(currentElement)).value;
          if (value) {
            let next = (<HTMLInputElement>document.getElementById(nextElement));
            if (next) {
              this.coreService.FocusInputById(nextElement, 100);
            } else {
              this.coreService.FocusButtonById('id_btn_add_serviceItem');
            }
          } else {
            this.coreService.FocusInputById('tenderAmount', 100);
          }
        }
      }
    }
  }

  GoToNextElementFromRemarks(printInvoiceButtonId: string, printProvisionalButtonId: string) {
    if (this.AllowProvisionalBilling && this.DisplayPrintProvisionalButton) {
      this.coreService.FocusButtonById(printProvisionalButtonId);
    } else {
      this.coreService.FocusButtonById(printInvoiceButtonId);
    }
  }

  OnSchemePriceCategoryChanged(schemePriceObj: SchemePriceCategory_DTO): void {
    if (schemePriceObj.SchemeId && schemePriceObj.PriceCategoryId) {
      console.info("SchemePriceCategory Changed -- Captured From billing-transaction Component");
      console.info(schemePriceObj);
      this.SchemePriceCategory = schemePriceObj;
      this.model.Remarks = this.SchemePriceCategory.SchemeName;
      //! This will clear the added invoice Items in the grid
      this.InvoiceItemsDto = new Array<InvoiceItem_DTO>();

      //! This will clear the InvoiceItemDto Obj only
      this.ResetAddedInvoiceItemObj();
      this.ResetInvoiceTotals();

      if (this.SchemePriceCategory.IsCreditOnlyScheme && !this.SchemePriceCategory.IsCoPayment) {
        this.DisablePaymentModeDropDown = true;
      } else {
        this.DisablePaymentModeDropDown = false;
      }
      if (this.SchemePriceCategory.IsDiscountApplicable) {
        this.model.DiscountPercent = this.SchemePriceCategory.DiscountPercent;
      } else {
        this.model.DiscountPercent = 0;
      }
      this.model.IsCoPayment = this.SchemePriceCategory.IsCoPayment;
      if (this.SchemePriceCategory.IsCoPayment) {
        this.model.PaymentMode = ENUM_BillPaymentMode.credit;
        this.model.CoPayment_PaymentMode = ENUM_BillPaymentMode.credit;
      }
      if (this.SchemePriceCategory.AllowProvisionalBilling) {
        this.AllowProvisionalBilling = true;
      } else {
        this.AllowProvisionalBilling = false;
      }
      this.DisableInvoiceDiscountPercent = (this.SchemePriceCategory.IsDiscountApplicable && this.SchemePriceCategory.IsDiscountEditable) ? false : true;
      this.changeDetectorRef.detectChanges();

      if (this.SchemePriCeCategoryFromVisitTemp.SchemeId && this.SchemePriCeCategoryFromVisitTemp.PriceCategoryId) {
        //For Visits
        if (this.SchemePriceCategory.SchemeId && this.SchemePriceCategory.PriceCategoryId) {
          if (this.SchemePriCeCategoryFromVisitTemp.SchemeId !== this.SchemePriceCategory.SchemeId || this.SchemePriCeCategoryFromVisitTemp.PriceCategoryId !== this.SchemePriceCategory.PriceCategoryId) {
            if (this.old_priceCategory === schemePriceObj.PriceCategoryId) {
              this.GetServiceItemSchemeSetting(this.serviceBillingContext, schemePriceObj.SchemeId, schemePriceObj.PriceCategoryId);
            }
            else {
              this.old_priceCategory = schemePriceObj.PriceCategoryId;
              this.GetServiceItems(this.serviceBillingContext, schemePriceObj.SchemeId, schemePriceObj.PriceCategoryId);
              this.LoadAdditionalServiceItems(schemePriceObj.PriceCategoryId);

            }
          } else {
            this.ServiceItems = this.billingMasterBlService.ServiceItems;
          }
        }
      }
      else {
        if (this.SchemePriceCategory.SchemeId && this.SchemePriceCategory.PriceCategoryId) {
          if (this.old_priceCategory === schemePriceObj.PriceCategoryId) {
            this.GetServiceItemSchemeSetting(this.serviceBillingContext, schemePriceObj.SchemeId, schemePriceObj.PriceCategoryId);
          }
          else {
            this.old_priceCategory = schemePriceObj.PriceCategoryId;
            this.GetServiceItems(this.serviceBillingContext, schemePriceObj.SchemeId, schemePriceObj.PriceCategoryId);
            this.LoadAdditionalServiceItems(schemePriceObj.PriceCategoryId);
          }
        }
      }
      this.GetServicePackages(schemePriceObj.SchemeId, schemePriceObj.PriceCategoryId);
    }
  }

  GetServicePackages(schemeId: number, priceCategoryId: number): void {
    if (schemeId && priceCategoryId) {

      this.billingMasterBlService.GetServicePackages(schemeId, priceCategoryId).subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
          this.ServicePackages = res.Results;
        } else {
          console.log(res);
        }
      });
    }
  }

  public TempServiceItemDetails = new Array<ServiceItemDetails_DTO>();
  HandlePackageBillingChange(): void {
    this.SelectedPackage = new BillingPackages_DTO();
    this.IsPackageSelectedAsItem = false;
    //! This will reset the PackageServiceItemEditMode
    this.IsPackageServiceItemEditMode = false;
    this.coreService.FocusInputById('id_input_do_package_billing');
    if (this.isPackageBilling) {
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Package Billing Enabled"]);
      //! This will clear the added invoice Items in the grid
      this.InvoiceItemsDto = new Array<InvoiceItem_DTO>();

      //! This will clear the InvoiceItemDto Obj only
      this.ResetAddedInvoiceItemObj();
      this.ResetInvoiceTotals();
      this.TempServiceItemDetails = _.cloneDeep(this.ServiceItems);
      this.ServiceItems = new Array<ServiceItemDetails_DTO>();
      this.ServiceItems = this.AssignPackagesAsServiceItems();
    } else {
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Package Billing Disabled"]);
      //! This will clear the added invoice Items in the grid
      this.InvoiceItemsDto = new Array<InvoiceItem_DTO>();

      //! This will clear the InvoiceItemDto Obj only
      this.ResetAddedInvoiceItemObj();
      this.ResetInvoiceTotals();
      this.ServiceItems = new Array<ServiceItemDetails_DTO>();
      this.ServiceItems = _.cloneDeep(this.TempServiceItemDetails);
      this.TempServiceItemDetails = new Array<ServiceItemDetails_DTO>();
    }
    this.changeDetectorRef.detectChanges();
    this.coreService.FocusInputById('id_billing_serviceItemName');

  }

  AssignPackagesAsServiceItems(): Array<ServiceItemDetails_DTO> {
    let serviceItems = new Array<ServiceItemDetails_DTO>();
    this.ServicePackages.forEach(p => {
      let serviceItem = new ServiceItemDetails_DTO();
      serviceItem.ServiceItemId = p.BillingPackageId;
      serviceItem.ItemName = p.BillingPackageName;
      serviceItem.ItemCode = p.PackageCode;
      serviceItem.SchemeId = p.SchemeId;
      serviceItem.PriceCategoryId = p.PriceCategoryId;
      serviceItem.Price = p.TotalPrice;
      serviceItem.DiscountPercent = p.DiscountPercent;
      serviceItem.DiscountAmount = Math.round(this.billingInvoiceBlService.CalculateAmountFromPercentage(serviceItem.DiscountPercent, serviceItem.Price)); //! Krishna, 15thOct'23, Rounding is used here because Package Billing Settings uses the same mechanism to calculate DiscountAmount in Settings.
      serviceItem.IsPackageBilling = true;

      serviceItems.push(serviceItem);
    });
    //this.ServiceItems = [...this.ServiceItems, ...serviceItems]; //!Krishna, 2ndAug'23, Merge Package with ServiceItems so that We could search both in ItemSearch
    return serviceItems;
  }

  AssignItemsOfSelectedPackage(): void {
    this.InvoiceItemDto.ServiceItemId = this.InvoiceItemFormValue.ServiceItemId;
    this.SelectedPackage = this.ServicePackages.find(p => p.BillingPackageId === this.InvoiceItemDto.ServiceItemId);
    if (this.SelectedPackage) {
      this.SelectedPackage.BillingPackageServiceItemList.forEach(pkg => {
        // let serviceItem = this.ServiceItems.find(s => s.ServiceItemId === pkg.ServiceItemId);
        let serviceItem = this.TempServiceItemDetails.find(s => s.ServiceItemId === pkg.ServiceItemId);
        if (serviceItem) {
          serviceItem.DiscountPercent = pkg.DiscountPercent;
          this.InvoiceItemDto.ServiceItemId = serviceItem.ServiceItemId;
          this.InvoiceItemDto.ItemCode = serviceItem.ItemCode;
          this.InvoiceItemDto.ItemName = serviceItem.ItemName;;
          this.InvoiceItemDto.Quantity = pkg.Quantity;
          this.InvoiceItemDto.Price = serviceItem.Price;
          this.InvoiceItemDto.SubTotal = this.InvoiceItemDto.Price * this.InvoiceItemDto.Quantity;
          this.InvoiceItemDto.DiscountPercent = pkg.DiscountPercent;
          this.InvoiceItemDto.DiscountAmount = this.billingInvoiceBlService.CalculateAmountFromPercentage(this.InvoiceItemDto.DiscountPercent, this.InvoiceItemDto.SubTotal);
          this.InvoiceItemDto.TotalAmount = this.InvoiceItemDto.SubTotal - this.InvoiceItemDto.DiscountAmount;
          this.InvoiceItemDto.ServiceDepartmentId = serviceItem.ServiceDepartmentId;
          this.InvoiceItemDto.ServiceDepartmentName = serviceItem.ServiceDepartmentName;

          this.InvoiceItemDto.IsCoPayment = false;
          this.InvoiceItemDto.CoPaymentCashAmount = 0;
          this.InvoiceItemDto.CoPaymentCreditAmount = 0;
          if (pkg.PerformerId) {
            this.InvoiceItemDto.PerformerId = pkg.PerformerId;
            let performer = this.doctorsList.find(p => p.EmployeeId === this.InvoiceItemDto.PerformerId);
            this.InvoiceItemDto.PerformerName = performer ? performer.FullName : null;
          }
          this.InvoiceItemDto.PrescriberId = this.selectedPrescriberId;
          this.InvoiceItemDto.IntegrationItemId = serviceItem.IntegrationItemId;
          this.InvoiceItemDto.BillingPackageId = this.SelectedPackage.BillingPackageId;

          this.InvoiceItemsDto.push(this.InvoiceItemDto);
          this.ResetAddedInvoiceItemObj();
        }
      });
      this.CalculateInvoiceTotals();
      this.coreService.FocusInputById('id_billing_serviceItemName', 500);
    }
  }

  ResetInvoiceTotals() {
    this.model.SubTotal = 0;
    this.model.DiscountPercent = 0;
    this.model.DiscountAmount = 0;
    this.model.TotalAmount = 0;
    this.model.ReceivedAmount = 0;
    this.model.CoPaymentCreditAmount = 0;
    this.model.Tender = 0;
    this.model.Change = 0;
    this.model.BillingTransactionItems = new Array<BillingTransactionItem>();
  }

  //* Krishna, 17thMarch'23 This will make a call to API to fetch all the Items and Its related settings with it.
  GetServiceItems(serviceBillingContext: string, schemeId: number, priceCategoryId: number): void {
    this.ServiceItems = new Array<ServiceItemDetails_DTO>();
    this.loadingScreen = true;
    this.billingMasterBlService.GetServiceItems(serviceBillingContext, schemeId, priceCategoryId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length > 0) {
          this.ServiceItems = res.Results;
          if (this.ServiceItems && this.ServiceItems.length > 0) {
            this.coreService.FocusInputById('id_billing_serviceItemName', 1000);
            this.loadingScreen = false;
          }
        } else {
          this.loadingScreen = false;
          this.ServiceItems = new Array<ServiceItemDetails_DTO>();
          console.log("This priceCategory does not have Service Items mapped.");
        }
      },
        err => {
          this.loadingScreen = false;
          console.log(err);
        }
      );
  }

  //* Krishna, 17thMarch'23 This will make a call to API to fetch only serviceItemSchemeSetting not the item iteself.
  GetServiceItemSchemeSetting(serviceBillingContext: string, schemeId: number, priceCategoryId: number): void {
    this.loadingScreen = true;
    this.billingMasterBlService.GetServiceItemSchemeSetting(serviceBillingContext, schemeId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length > 0) {
          this.ServiceItemSchemeSettings = res.Results;
          this.MapServiceItemSchemeSettingsToServiceItems(this.ServiceItemSchemeSettings);
        } else {
          this.loadingScreen = false;
          console.log("This scheme and context does not have Settings mapped");
        }
      },
        err => {
          console.log(err);
        }
      );
  }
  MapServiceItemSchemeSettingsToServiceItems(serviceItemSchemeSetting: Array<ServiceItemSchemeSetting_DTO>): void {
    if (serviceItemSchemeSetting && serviceItemSchemeSetting.length) {
      this.ServiceItems.forEach((item) => {
        const matchedServiceItem = serviceItemSchemeSetting.find(a => a.ServiceItemId === item.ServiceItemId);
        if (matchedServiceItem) {
          item.SchemeId = matchedServiceItem.SchemeId;
          item.DiscountPercent = matchedServiceItem.DiscountPercent;
          item.IsCoPayment = matchedServiceItem.IsCoPayment;
          item.CoPayCashPercent = matchedServiceItem.CoPaymentCashPercent;
          item.CoPayCreditPercent = matchedServiceItem.CoPaymentCreditPercent;
        }
      });
      this.ServiceItems = this.ServiceItems.slice();
      this.coreService.FocusInputById('id_billing_serviceItemName', 500);
      this.loadingScreen = false;
    }
  }

  //* Krishna, 4thApril'23, Below method is triggered on the change of Additional Item Selection on the Popup
  OnAdditionalServiceItemCallBack($event: Array<BillingAdditionalServiceItem_DTO>): void {
    if ($event && $event.length > 0) {
      $event.forEach((itm) => {
        this.SelectedAdditionalItem = itm;
        if (this.SelectedAdditionalItem) {
          const selectedInvoiceItem = this.ServiceItems.find(a => a.ServiceItemId === this.SelectedAdditionalItem.ServiceItemId && a.PriceCategoryId === this.SelectedAdditionalItem.PriceCategoryId);
          if (selectedInvoiceItem && selectedInvoiceItem.ServiceItemId) {
            this.SelectedAdditionalInvoiceItem = selectedInvoiceItem;
          } else {
            this.msgBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Selected Additional Item is not active for selected PriceCategory"]);
          }
          this.AddAdditionalInvoiceItemAsDraft();
        }
      });
      this.CloseAdditionalServiceItem();
    }
  }

  //* Krishna, 4thApril'23,, Below method is triggered after Ok button is clicked from the additional Item popup, Basically it adds the selected Additional Item to an Object that can be further used.
  AddAdditionalInvoiceItemAsDraft(): void {
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

          const serviceDepartment = this.serviceDeptList.find(a => a.ServiceDepartmentId === this.SelectedInvoiceItemForAdditionalItemCalculation.ServiceDepartmentId);
          let price = 0;
          if (serviceDepartment && this.RequestingDepartmentId === serviceDepartment.DepartmentId) {
            price = this.billingInvoiceBlService.CalculateAmountFromPercentage(this.SelectedAdditionalItem.PercentageOfParentItemForSameDept, this.SelectedInvoiceItemForAdditionalItemCalculation.Price);
          } else {
            price = this.billingInvoiceBlService.CalculateAmountFromPercentage(this.SelectedAdditionalItem.PercentageOfParentItemForDiffDept, this.SelectedInvoiceItemForAdditionalItemCalculation.Price);
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
      this.AssignAdditionalInvoiceItemToInvoiceItemsArray();
    }
  }

  CloseDepositPopUp($event = null): void {
    if ($event) {
      this.patBillHistory.DepositBalance = $event.depositBalance;
      this.patBillHistory.BalanceAmount = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance - this.patBillHistory.TotalDue, 3);
    }
    this.showDepositPopUp = false;
    this.loading = false;
  }
  SelectFromPackage($event): void {
    //!Krishna, 5thMay'23, Need to add logic for this, added for reference only for now
  }


  LoadParameterForDuplicateItemsEntry() {
    let param = this.coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "AllowDuplicateItemsEntryInBillingTransaction");
    if (param) {
      let paramValue = param.ParameterValue;
      if (paramValue != null && paramValue != '' && (paramValue == 'true' || paramValue == 1)) {
        this.param_allowDuplicateItemsEntryInBillingTransaction = true;
      }
      else {
        this.param_allowDuplicateItemsEntryInBillingTransaction = false;
      }

    }
  }

  RequestingDepartmentChanged($event): void {
    if ($event) {
      this.RequestingDepartmentId = $event.DepartmentId;
    }
  }
  handleConfirm() {
    this.loading = true;
    this.PostInvoice();
  }

  handleProvisionalConfirmation() {
    this.loading = true;
    this.PostProvisionalBilling();
  }
  handleCancel() {
    this.loading = false;
  }

  ShowOtherCurrencyCheckBoxChanged(): void {
    if (this.ShowOtherCurrency) {
      this.DisplayOtherCurrencyDetail = true;
    } else {
      this.DisplayOtherCurrencyDetail = false;
      this.model.OtherCurrencyDetail = null;
    }
  }
  public OtherCurrencyDetail: OtherCurrencyDetail;
  OtherCurrencyCalculationCallback($event): void {
    if ($event && $event.ExchangeRate > 0) {
      this.OtherCurrencyDetail = $event;
    } else {
      this.OtherCurrencyDetail = null;
    }
    this.model.OtherCurrencyDetail = JSON.stringify(this.OtherCurrencyDetail);
  }

  EditPackageInvoiceServiceItem(item: InvoiceItem_DTO): void {
    this.SelectedServiceItemFromPackage = item;
    this.IsPackageServiceItemEditMode = true;
    this.InvoiceItemFormControls.Quantity.setValue(this.SelectedServiceItemFromPackage.Quantity);
    this.InvoiceItemFormControls.ItemName.setValue(this.SelectedServiceItemFromPackage.ItemName);
    this.InvoiceItemFormControls.Price.setValue(this.SelectedServiceItemFromPackage.Price);
    this.InvoiceItemFormControls.DiscountPercent.setValue(this.SelectedServiceItemFromPackage.DiscountPercent);
    this.InvoiceItemFormControls.DiscountAmount.setValue(this.SelectedServiceItemFromPackage.DiscountAmount);
    this.InvoiceItemFormControls.SubTotal.setValue(this.SelectedServiceItemFromPackage.SubTotal);
    this.InvoiceItemFormControls.TotalAmount.setValue(this.SelectedServiceItemFromPackage.TotalAmount);
    this.InvoiceItemFormControls.PerformerName.setValue(this.SelectedServiceItemFromPackage.PerformerName ? this.SelectedServiceItemFromPackage.PerformerName : null);
  }

  UpdatePackageServiceItemInInvoice(serviceItemId: number): void {
    this.SelectedServiceItemFromPackage.Price = this.InvoiceItemFormControls.Price.value;
    this.SelectedServiceItemFromPackage.DiscountPercent = this.InvoiceItemFormControls.DiscountPercent.value;
    this.SelectedServiceItemFromPackage.DiscountAmount = this.InvoiceItemFormControls.DiscountAmount.value;
    this.SelectedServiceItemFromPackage.SubTotal = this.InvoiceItemFormControls.SubTotal.value;
    this.SelectedServiceItemFromPackage.TotalAmount = this.InvoiceItemFormControls.TotalAmount.value;
    this.SelectedServiceItemFromPackage.PerformerId = this.InvoiceItemFormControls.PerformerId.value;
    this.SelectedServiceItemFromPackage.PerformerName = this.InvoiceItemFormControls.PerformerName.value;
    let indexOfSelectedInvoiceItem = this.InvoiceItemsDto.findIndex(item => item.ServiceItemId === serviceItemId);
    if (indexOfSelectedInvoiceItem >= 0) {
      this.InvoiceItemsDto[indexOfSelectedInvoiceItem] = this.SelectedServiceItemFromPackage;
    }
    if (this.IsPackageServiceItemDiscountChanged) {
      this.CalculateInvoiceTotals();
    }
    this.ResetSelectedBillingPackageItem();
  }

  ResetSelectedBillingPackageItem(): void {
    this.SelectedServiceItemFromPackage = null;
    this.IsPackageServiceItemEditMode = false;
    this.InvoiceItemFormControls.Quantity.setValue(null);
    this.InvoiceItemFormControls.ItemName.setValue(null);
    this.InvoiceItemFormControls.Price.setValue(null);
    this.InvoiceItemFormControls.DiscountPercent.setValue(null);
    this.InvoiceItemFormControls.DiscountAmount.setValue(null);
    this.InvoiceItemFormControls.SubTotal.setValue(null);
    this.InvoiceItemFormControls.TotalAmount.setValue(null);
    this.InvoiceItemFormControls.PerformerName.setValue(null);
    this.SelectedPerformer = null;
  }

  AllowProvisionalBillingChange($event): void {
    if ($event) {
      this.isProvisionalBilling = this.DisplayPrintProvisionalButton;
    }
  }
}
