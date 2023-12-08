import { ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Observable, Subscription } from 'rxjs';
import { BillingFiscalYear } from '../../../../billing/shared/billing-fiscalyear.model';
import { CoreBLService } from '../../../../core/shared/core.bl.service';
import { CoreService } from '../../../../core/shared/core.service';
import { Patient } from '../../../../patients/shared/patient.model';
import { PatientService } from '../../../../patients/shared/patient.service';
import { PharmacyProvisionalReceipt_DTO } from '../../../../pharmacy/receipt/pharmacy-provisional-invoice-print/pharmacy-provisional-receipt.dto';
import { PharmacySchemePriceCategory_DTO } from '../../../../pharmacy/shared/dtos/pharmacy-scheme-pricecategory.dto';
import { PHRMEmployeeCashTransaction } from '../../../../pharmacy/shared/pharmacy-employee-cash-transaction';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../../../pharmacy/shared/pharmacy.service';
import { PHRMInvoiceItemsModel } from '../../../../pharmacy/shared/phrm-invoice-items.model';
import { PHRMInvoiceModel } from '../../../../pharmacy/shared/phrm-invoice.model';
import { PHRMItemTypeModel } from '../../../../pharmacy/shared/phrm-item-type.model';
import { PHRMNarcoticRecordModel } from '../../../../pharmacy/shared/phrm-narcotic-record';
import { PHRMPatient } from '../../../../pharmacy/shared/phrm-patient.model';
import { PHRMStoreModel } from '../../../../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../../../../security/shared/security.service';
import { SelectReferrerComponent } from '../../../../settings-new/ext-referral/select-referrer/select-referrer.component';
import { CreditOrganization } from '../../../../settings-new/shared/creditOrganization.model';
import { PriceCategory } from '../../../../settings-new/shared/price.category.model';
import { GeneralFieldLabels } from "../../../../shared/DTOs/general-field-label.dto";
import { CallbackService } from '../../../../shared/callback.service';
import { DanpheHTTPResponse } from '../../../../shared/common-models';
import { CommonFunctions } from '../../../../shared/common.functions';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../../shared/routefrom.service';
import { ENUM_BillPaymentMode, ENUM_BillingStatus, ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status, ENUM_ModuleName, ENUM_PriceCategory, ENUM_ServiceBillingContext } from '../../../../shared/shared-enums';
import { DispensaryAvailableStockDetail_DTO } from '../../../shared/DTOs/dispensary-available-stock-detail.dto';
import { DispensaryService } from '../../../shared/dispensary.service';


@Component({
  selector: 'app-new-sales',
  templateUrl: './new-sales.component.html',
  styleUrls: ['./new-sales.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class NewSalesComponent implements OnInit, OnDestroy {
  @ViewChild('selectReferrer') selectReferrerComponent: SelectReferrerComponent;
  public currentCounterId: number = 0;
  public currentCounterName: string = "";
  public currentActiveDispensary: PHRMStoreModel;
  public IsCurrentDispensaryInsurace: boolean = false;
  public searchPatient: any;
  public creditOrganizationsList: Array<CreditOrganization> = new Array<CreditOrganization>();
  public visitType: string = '';
  public deductDeposit: boolean = false;
  public checkDeductfromDeposit: boolean = false;
  public allFiscalYrs: Array<BillingFiscalYear> = new Array<BillingFiscalYear>();
  //for show and hide item level discount features
  IsitemlevlDis: boolean = false;
  public showAddNewOpPopUp: boolean = false;
  public selectedRefId: number = null;
  public isReferrerLoaded: boolean = false;
  public ExtRefSettings = { EnableExternal: true, DefaultExternal: false };
  public patSummary = { IsLoaded: false, PatientId: 0, CreditAmount: 0, ProvisionalAmt: 0, TotalDue: 0, DepositBalance: 0, BalanceAmount: 0, GeneralCreditLimit: 0, IpCreditLimit: 0, OpCreditLimit: 0, OpBalance: 0, IpBalance: 0 };
  public isNarcoticSale: boolean;
  public showSaleInvoice: boolean = false;//All variable declaration for Patient Registration
  public currentPatient: PHRMPatient = new PHRMPatient();
  public newOutPatient: PHRMPatient = new PHRMPatient();
  public matchingPatientList: Array<PHRMPatient> = new Array<PHRMPatient>();
  public narcoticsRecord: PHRMNarcoticRecordModel = new PHRMNarcoticRecordModel();
  public showExstingPatientList: boolean = false;
  public divDisable: boolean = false;
  public loading: boolean = false;
  public isReturn: boolean = false;
  public currSale: PHRMInvoiceModel = new PHRMInvoiceModel();
  totalItemCount: number = 0; //counts total number of items in currSale
  public currSaleItems: PHRMInvoiceItemsModel[] = [];
  public ItemTypeListWithItems: PHRMItemTypeModel[] = [];
  public ItemListFiltered: DispensaryAvailableStockDetail_DTO[] = [];
  public ItemListWithCategoryFiltered: DispensaryAvailableStockDetail_DTO[] = [];
  public ItemList: DispensaryAvailableStockDetail_DTO[] = [];
  public patientList: Array<PHRMPatient> = new Array<PHRMPatient>();
  public showSupplierAddPage: boolean = false;
  public showInfo: boolean = true;
  public showStockDetails: boolean = false;
  public showNewPatRegistration: boolean = false;
  public GenericList: Array<any>;
  invalid: boolean = false;
  public isMainDiscountAvailable: boolean;
  isItemLevelVATApplicable: boolean;
  isMainVATApplicable: boolean;
  isRemarksMandatory: boolean = false;
  public MstPaymentModes: any = [];
  public phrmEmpCashTxn: PHRMEmployeeCashTransaction = new PHRMEmployeeCashTransaction();
  ShowDepositAdd: boolean = false;
  public GeneralFieldLabel = new GeneralFieldLabels();


  discountOnPhrmSaleEnable: boolean = false;
  InvoiceDefaultDiscPercent: number = 0;//this is set from Parameter.
  public MedicalCertificateNo: number = null;
  public NMCNoAddPopup: boolean = false;
  public EmployeeDetails: any = null;
  public refererListReload: boolean = false;
  public allowAnonymousPatient: boolean = false;
  public PriceCategoryId: number = null;


  public FilteredGenericList: Array<any>;
  public allPriceCategories: Array<PriceCategory> = new Array<PriceCategory>();
  public defaultlPriceCategoryObject: PriceCategory = new PriceCategory();
  pharmacyDefaultCreditOrganization: CreditOrganization = new CreditOrganization();
  itemTypeListApiSubscription: Subscription;
  isItemLoaded: boolean = false;
  IsAllAmountPaidByPatient: boolean = false;
  PatientSearchMinCharacterCount: number = 0;
  membershipSchemeParam = { ShowCommunity: false, IsMandatory: true };
  IsPatientDetailLoaded: boolean = false;
  MembershipTypeId: number = null;
  showCommunityName: boolean = false;
  showMembershipTypeName: boolean = false;
  showPosting: boolean = false;
  showRank: boolean = false;

  invoiceItem: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
  public SchemePriceCategoryFromVisit: PharmacySchemePriceCategoryCustomType = { SchemeId: 0, PriceCategoryId: 0 };
  DisablePaymentModeDropDown: boolean;
  public SchemePriceCategory: PharmacySchemePriceCategory_DTO = new PharmacySchemePriceCategory_DTO();
  public serviceBillingContext: string = ENUM_ServiceBillingContext.OpPharmacy;
  oldPriceCategoryId: number = null;

  public confirmationTitle: string = "Confirm !";
  public confirmationMessage: string = "Are you sure you want to Print Invoice ?";
  public confirmationMessageForProvisional: string = "Are you sure you want to Print Provisional Slip ?";
  public DisplaySchemePriceCategorySelection: boolean = false;
  systemDefaultPriceCategory: number = 0;
  IsProvisionalAllowed: boolean = false;
  showProvisionalInvoice: boolean = false;
  ProvisionalInvoice: PharmacyProvisionalReceipt_DTO = new PharmacyProvisionalReceipt_DTO();

  constructor(private _dispensaryService: DispensaryService,
    public pharmacyBLService: PharmacyBLService,
    public pharmacyService: PharmacyService,
    public changeDetectorRef: ChangeDetectorRef,
    public router: Router,
    public patientService: PatientService,
    public securityService: SecurityService,
    public routeFromService: RouteFromService,
    public messageboxService: MessageboxService,
    public callBackService: CallbackService,
    public coreService: CoreService,
    public renderer2: Renderer2,
    public coreBlService: CoreBLService
  ) {
    this.GeneralFieldLabel = coreService.GetFieldLabelParameter();

    this.MstPaymentModes = this.coreService.masterPaymentModes;
    try {
      this.visitType = "outpatient";
      this.currentCounterId = this.securityService.getPHRMLoggedInCounter().CounterId;
      this.currentCounterName = this.securityService.getPHRMLoggedInCounter().CounterName;

      this.currentActiveDispensary = this._dispensaryService.activeDispensary;
      this.IsCurrentDispensaryInsurace = this._dispensaryService.isInsuranceDispensarySelected;
      this.currSale.PaymentMode = this.currentActiveDispensary.DefaultPaymentMode;
      this.isRemarksMandatory = this.currentActiveDispensary.AvailablePaymentModes.find(a => a.PaymentModeName == this.currSale.PaymentMode).IsRemarksMandatory;

      if (this.currentCounterId < 1) {
        this.callBackService.CallbackRoute = '/Dispensary/Sale/New'
        this.router.navigate(['/Dispensary/ActivateCounter']);
      }
      else {
        this.LoadGlobalPatient(this.patientService.getGlobal());
        this.GetAllFiscalYrs();
        this.GetCreditOrganizations();
        this.LoadReferrerSettings();
        this.GetGenericList();
        this.checkSalesCustomization();
        this.IsAnonymousPatientEnable();
        this.GetPriceCategories();
        this.GetPatientSearchMinCharacterCountParameter();
        this.GetPriceCategory();
      }


    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  ngOnDestroy() {
    this.patientService.CreateNewGlobal();
    this.loading = false;//this enables the button again..
    this.oldPriceCategoryId = null;
    if (this.itemTypeListApiSubscription) {
      this.itemTypeListApiSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.isReferrerLoaded = true;

    if (this.IsCurrentDispensaryInsurace == false && !this.isReturn) {
      this.SetAnonymous();
      this.coreService.FocusInputById(`patient-search`);
    }
    else {
      this.currSale.PaymentMode = ENUM_BillPaymentMode.credit;
      this.coreService.FocusInputById(`patient-search`);
      this.visitType = 'inpatient';
      this.currSale.InvoiceValidator.get("VisitType").setValue("inpatient");
    }
  }

  public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {

    return this.pharmacyBLService.GetPatients(keyword, this.IsCurrentDispensaryInsurace);

  }



  private LoadGlobalPatient(Patient: Patient) {
    if (Patient.PatientId > 0) {
      this.currentPatient.PatientCode = Patient.PatientCode;
      this.currentPatient.ShortName = Patient.ShortName;
      this.searchPatient = Patient.ShortName;
      this.currentPatient.Address = Patient.Address;
      this.currentPatient.Age = Patient.Age;
      this.currentPatient.Gender = Patient.Gender;
      this.currentPatient.PhoneNumber = Patient.PhoneNumber;
      this.currentPatient.PatientId = Patient.PatientId;
      this.currentPatient.LatestClaimCode = Patient.ClaimCode;
      this.currentPatient.NSHINumber = Patient.Ins_NshiNumber;
      this.currentPatient.RemainingBalance = Patient.Ins_InsuranceBalance;
      this.onClickPatient(this.currentPatient);
    }
  }
  //to show popup in-case of narcotic drug sales
  AddNarcotics(index) {
    this.narcoticsRecord.NarcoticRecordId = index;
  }
  // to save narcotics record in currentitems array
  SaveNarcotics() {
    let index = this.narcoticsRecord.NarcoticRecordId;
    if (this.narcoticsRecord.BuyerName == null || this.narcoticsRecord.DoctorName == null || this.narcoticsRecord.NMCNumber == null) {
      this.messageboxService.showMessage("error", ["Please Fill the required information."]);
    }
    else {
      this.currSaleItems[index].NarcoticsRecord.BuyerName = this.narcoticsRecord.BuyerName;
      this.currSaleItems[index].NarcoticsRecord.DoctorName = this.narcoticsRecord.DoctorName;
      this.currSaleItems[index].NarcoticsRecord.EmployeId = this.narcoticsRecord.EmployeId;
      this.currSaleItems[index].NarcoticsRecord.Refill = this.narcoticsRecord.Refill;
      this.currSaleItems[index].NarcoticsRecord.NMCNumber = this.narcoticsRecord.NMCNumber;
      this.showSupplierAddPage = false;
      this.narcoticsRecord.BuyerName = null;
      this.narcoticsRecord.DoctorName = null;
      this.narcoticsRecord.EmployeId = null;
      this.narcoticsRecord.Refill = null;
      this.narcoticsRecord.NMCNumber = null;
    }

  }

  LoadItemTypeList(DispensaryId: number, PriceCategoryId?: number): void {
    try {
      this.itemTypeListApiSubscription = this.pharmacyBLService.GetDispensaryAvailableStock(DispensaryId, PriceCategoryId)
        .subscribe(res => this.CallBackGetItemTypeList(res));
    }

    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  public GetGenericList() {
    this.pharmacyBLService.GetGenericList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.GenericList = res.Results;
          this.FilteredGenericList = res.Results;
        }
      });
  }

  CallBackGetItemTypeList(res: DanpheHTTPResponse) {
    try {
      if (res.Status == ENUM_DanpheHTTPResponses.OK) {
        if (res.Results) {
          this.ItemList = [];
          this.ItemList = res.Results;
          this.ItemListFiltered = [];
          this.ItemListFiltered = res.Results;
          this.ItemListWithCategoryFiltered = [];
          this.ItemListWithCategoryFiltered = res.Results;

          this.ItemTypeListWithItems = new Array<PHRMItemTypeModel>();
          this.ItemTypeListWithItems = res.Results;
          this.ItemTypeListWithItems = this.ItemTypeListWithItems.filter(itmtype => itmtype.IsActive == true);
          this.isItemLoaded = true;
          this.FilterGenericAndItemByPriceCategory(this.SchemePriceCategory.PriceCategoryId);
        }
      }
      else {
        this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, ['failed to get ItemTypeList.  ' + res.ErrorMessage]);
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  public AssignSelectedGenName(row) {
    try {
      if (row.selectedGeneneric) {
        if (this.currentPatient.PriceCategoryId) {
          this.FilterGenericAndItemByPriceCategory(this.currentPatient.PriceCategoryId, row.selectedGeneneric.GenericId);
        }
      }
      else {
        this.ItemListFiltered = this.ItemList;
        row.ItemFieldMinChars = 1;
        row.selectedItem = null;
        row.Quantity = 0;
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  onItemSelect($event) {
    if ($event) {
      let currentDate = moment().format('YYYY-MM-DD');
      if ($event.ExpiryDate <= currentDate) {
        this.messageboxService.showMessage(ENUM_MessageBox_Status.Error, [`The selected Item ${$event.ItemName} is Expired. Cann't perform Sale Operation`]);
        return;
      }
      if ($event.GenericId > 0) {
        this.invoiceItem.GenericId = $event.GenericId;
        this.invoiceItem.GenericName = $event.GenericName;
      }
      if ($event.ItemId > 0) {
        this.invoiceItem.selectedItem = Object.assign(this.invoiceItem.selectedItem, $event);
        this.invoiceItem.selectedItem.SellingPrice = $event.SalePrice;
        this.invoiceItem.ItemTypeId = $event.ItemTypeId;
        this.invoiceItem.StockId = $event.StockId;
        this.invoiceItem.TotalQty = $event.AvailableQuantity;
        this.invoiceItem.Quantity = 0;
        this.invoiceItem.StockId = $event.StockId;
        this.invoiceItem.BatchNo = $event.BatchNo;
        this.invoiceItem.GenericName = $event.GenericName;
        this.invoiceItem.selectedGeneneric = $event.GenericName;
        this.invoiceItem.GenericId = $event.GenericId;
        this.invoiceItem.SalePrice = this.IsCurrentDispensaryInsurace ? $event.InsuranceMRP : $event.SalePrice;
        this.invoiceItem.NormalSalePrice = $event.NormalSalePrice;
        this.invoiceItem.Price = $event.CostPrice;
        this.invoiceItem.ExpiryDate = $event.ExpiryDate;
        this.invoiceItem.VATPercentage = $event.IsVATApplicable == true ? $event.SalesVATPercentage : 0;
        this.invoiceItem.RackNo = $event.RackNo;
        this.invoiceItem.Quantity = ($event.Quantity == null || $event.Quantity == undefined) ? this.invoiceItem.Quantity : 0;
        this.invoiceItem.GoodReceiptItemId = $event.GoodReceiptItemId;
        this.invoiceItem.PrescriptionItemId = $event.PrescriptionItemId;
        this.invoiceItem.CounterId = this.currentCounterId;
        this.invoiceItem.IsDuplicate = false;
        this.invoiceItem.ItemId = $event.ItemId;
        this.invoiceItem.ItemName = $event.ItemName;
        this.invoiceItem.CompanyId = $event.CompanyId;
      }
    }
  }


  OnValueChanged() {
    if (this.invoiceItem.Quantity > this.invoiceItem.TotalQty) {
      this.invoiceItem.IsDirty('Quantity');
    }

    const subtotal = this.invoiceItem.Quantity * this.invoiceItem.SalePrice;
    const discountPercentage = this.invoiceItem.DiscountPercentage || 0;
    const discountAmount = subtotal * discountPercentage / 100;
    const vatPercentage = this.invoiceItem.VATPercentage || 0;
    const vatAmount = (subtotal - discountAmount) * vatPercentage / 100;

    this.invoiceItem.SubTotal = CommonFunctions.parseAmount(subtotal, 4);
    this.invoiceItem.TotalDisAmt = CommonFunctions.parseAmount(discountAmount, 4);
    this.invoiceItem.VATAmount = CommonFunctions.parseAmount(vatAmount, 4);
    this.invoiceItem.TotalAmount = CommonFunctions.parseAmount(this.invoiceItem.SubTotal - this.invoiceItem.TotalDisAmt + this.invoiceItem.VATAmount, 4);

    this.invoiceItem.SchemeId = this.SchemePriceCategory.SchemeId;
    if (this.SchemePriceCategory.IsCoPayment && this.SchemePriceCategory.CoPaymentCashPercent) {
      this.invoiceItem.IsCoPayment = this.SchemePriceCategory.IsCoPayment;
      let ItemCoPaymentCashAmount = this.invoiceItem.TotalAmount * this.SchemePriceCategory.CoPaymentCashPercent / 100;
      this.invoiceItem.CoPaymentCashAmount = CommonFunctions.parseAmount(ItemCoPaymentCashAmount, 4);
      this.invoiceItem.CoPaymentCreditAmount = CommonFunctions.parseAmount(this.invoiceItem.TotalAmount - this.invoiceItem.CoPaymentCashAmount, 4);
    }
  }

  AddSaleItem() {
    const errorMessages: Array<string> = [];
    let check: boolean = true;

    for (let i in this.invoiceItem.InvoiceItemsValidator.controls) {
      this.invoiceItem.InvoiceItemsValidator.controls['Price'].disable();
      this.invoiceItem.InvoiceItemsValidator.controls[i].markAsDirty();
      this.invoiceItem.InvoiceItemsValidator.controls[i].updateValueAndValidity();
    }

    if (!this.invoiceItem.IsValidCheck(undefined, undefined)) {
      check = false;
    }
    if (check) {
      if (this.currSaleItems.some(i => i.ItemId === this.invoiceItem.ItemId)) {
        errorMessages.push('Duplicate item cannot be added ');
        this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ['Duplicate item cannot be added ']);
        return;
      }
      else {
        this.currSaleItems.push(this.invoiceItem);
        this.MainLevelCalculation();
        this.invoiceItem = new PHRMInvoiceItemsModel();
        if (this.currSale.SchemeDiscountPercentage) {
          this.invoiceItem.DiscountPercentage = this.currSale.SchemeDiscountPercentage;
        }
        this.FilterGenericAndItemByPriceCategory(this.currentPatient.PriceCategoryId);
      }
    }

  }

  MainLevelCalculation(discountPercentage?, discountAmount?) {
    this.ClearMainLevelAmount();
    if (this.currSaleItems.length > 0) {
      let SubTotal = 0;
      let DiscountAmount = 0;
      let DiscountPercentage = 0;
      let VATAmount = 0;
      let VATPercentage = 0;
      let TotalAmount = 0;

      this.currSaleItems.forEach(item => {
        if (this.currSale.SchemeDiscountPercentage) {
          item.DiscountPercentage = this.currSale.SchemeDiscountPercentage;
          item.TotalDisAmt = (item.SubTotal * item.DiscountPercentage) / 100;
        }
        else {
          if (discountPercentage > 0 && discountAmount === 0) {
            item.DiscountPercentage = discountPercentage;
            item.TotalDisAmt = (item.SubTotal * item.DiscountPercentage) / 100;
          }
          if (discountPercentage === 0 && discountAmount > 0) {
            let DiscountPercentage = 0;
            let subTotal = this.currSaleItems.reduce((a, b) => a + b.SubTotal, 0);
            DiscountPercentage = (discountAmount / subTotal) * 100;
            item.DiscountPercentage = DiscountPercentage;
            item.TotalDisAmt = (item.SubTotal * item.DiscountPercentage) / 100;
          }
          if (discountPercentage === 0 && discountAmount === 0) {
            item.DiscountPercentage = 0;
            item.TotalDisAmt = 0;
          }
        }

        item.VATAmount = (item.SubTotal - item.TotalDisAmt) * item.VATPercentage;
        item.TotalAmount = (item.SubTotal - item.TotalDisAmt + item.VATAmount);
      });

      SubTotal = this.currSaleItems.reduce((a, b) => a + b.SubTotal, 0);
      DiscountAmount = this.currSaleItems.reduce((a, b) => a + b.TotalDisAmt, 0);
      DiscountPercentage = (DiscountAmount / SubTotal) * 100;
      VATAmount = this.currSaleItems.reduce((a, b) => a + b.VATAmount, 0);
      VATPercentage = ((VATAmount / (SubTotal - DiscountAmount)) * 100);

      if (this.isMainDiscountAvailable && !this.currSale.SchemeDiscountPercentage) {
        discountAmount = discountAmount ? discountAmount : 0;
        discountPercentage = discountPercentage ? discountPercentage : 0;

        if (discountPercentage == 0 && discountAmount > 0) {
          DiscountAmount = discountAmount;
          discountPercentage = (discountAmount / SubTotal) * 100;
          DiscountPercentage = discountPercentage;
        }
        if (discountPercentage > 0 && discountAmount == 0) {
          discountAmount = (SubTotal * discountPercentage) / 100;
          DiscountAmount = discountAmount;
          DiscountPercentage = discountPercentage;
        }
      }
      TotalAmount = SubTotal - DiscountAmount + VATAmount;


      this.currSale.SubTotal = CommonFunctions.parseAmount(SubTotal, 4);
      this.currSale.DiscountPer = CommonFunctions.parseAmount(DiscountPercentage, 4);
      this.currSale.DiscountAmount = CommonFunctions.parseAmount(DiscountAmount, 4);
      this.currSale.VATPercentage = CommonFunctions.parseAmount(VATPercentage, 4);
      this.currSale.VATAmount = CommonFunctions.parseAmount(VATAmount, 4);
      this.currSale.TotalAmount = CommonFunctions.parseAmount(TotalAmount, 4);

      if (this.currSale.IsCoPayment && this.currSale.Copayment_CashPercent > 0) {
        this.COPaymentAmountCalculation();
      }
      else {
        this.currSale.ReceivedAmount = this.currSale.TotalAmount;
      }

      this.currSale.PaidAmount = CommonFunctions.parseAmount(this.currSale.ReceivedAmount, 4);
      this.currSale.Tender = CommonFunctions.parseAmount(this.currSale.PaidAmount, 4);
      this.currSale.Change = CommonFunctions.parseAmount(this.currSale.Tender - this.currSale.ReceivedAmount, 4);
    }
  }

  private ClearMainLevelAmount() {
    this.currSale.SubTotal = 0;
    this.currSale.TotalAmount = 0;
    this.currSale.VATAmount = 0;
    this.currSale.DiscountAmount = 0;
    this.currSale.PaidAmount = 0;
    this.currSale.Tender = 0;
    this.currSale.Change = 0;
    this.currSale.TotalAmount = 0;
    this.currSale.ReceivedAmount = 0;
    this.currSale.DiscountPer = 0;
  }
  COPaymentAmountCalculation() {
    this.currSale.CoPaymentCashAmount = CommonFunctions.parseAmount(((this.currSale.TotalAmount * this.currSale.Copayment_CashPercent) / 100), 4);
    this.currSale.ReceivedAmount = this.currSale.CoPaymentCashAmount;
    this.currSale.CoPaymentCreditAmount = CommonFunctions.parseAmount((this.currSale.TotalAmount - this.currSale.CoPaymentCashAmount), 4);


  }
  ChangeTenderAmount() {
    if (this.deductDeposit) {
      this.currSale.Change = CommonFunctions.parseAmount(this.currSale.Tender + this.patSummary.DepositBalance - this.currSale.PaidAmount);
    }
    else {
      this.currSale.Change = CommonFunctions.parseAmount(this.currSale.Tender - this.currSale.PaidAmount);
    }
  }

  Save(): void {

    this.loading = true;//this disables the print button and double click issues, don't change this pls..
    try {
      var errorMessages: Array<string> = [];
      let check: boolean = true;
      this.currSaleItems = this.currSaleItems.filter(a => a.ItemId != null || a.ItemId > 0);
      if (this.currSaleItems.length == 0) {
        errorMessages.push("No item selected. Please select some item.");
        check = false;
      }
      for (var j = 0; j < this.currSaleItems.length; j++) {
        let date = new Date();
        let datenow = date.setMonth(date.getMonth() + 0);
        let expiryDate = this.currSaleItems[j].ExpiryDate;
        let expiryDate1 = new Date(expiryDate);
        let expDate = expiryDate1.setMonth(expiryDate1.getMonth() + 0);
        if (expDate < datenow) {
          errorMessages.push('Expired item-' + (j + 1) + ' cannot be sale ');
          check = false;
        }
        if (this.currSaleItems[j].ExpiryDate)
          if (!this.currSaleItems[j].Quantity) {
            errorMessages.push('Qty is required for item ' + (j + 1));
            check = false;
          }
          else {
            if (this.currSaleItems[j].Quantity > this.currSaleItems[j].TotalQty) {
              errorMessages.push('Qty is greater than Stock for item ' + (j + 1));
              check = false;
            }
          }
      }
      if ((this.isRemarksMandatory == true || this.currSale.PaymentMode === ENUM_BillPaymentMode.credit) && this.currSale.Remark.trim().length == 0) {
        errorMessages.push(`Remark is mandatory with selected Payment Mode (${this.currSale.PaymentMode}).`);
        check = false;
      }
      if ((this.currSale.PaymentMode == "credit" || this.currSale.CoPaymentMode === ENUM_BillPaymentMode.credit) && (this.currSale.OrganizationId == null)) {
        errorMessages.push(`Credit Organization is mandatory with selected Payment Mode (${this.currSale.PaymentMode == ENUM_BillPaymentMode.credit ? this.currSale.PaymentMode : this.currSale.CoPaymentMode}).`);
        check = false;
      }
      if (this.currSale.PaymentMode == "credit" && this.currSale.selectedPatient.FirstName == "Anonymous") {
        errorMessages.push(`Patient is mandatory for selected Payment Mode i.e. ${this.currSale.PaymentMode}`);
        check = false;
      }
      if (this.IsCurrentDispensaryInsurace == true && this.currSale.selectedPatient.LatestClaimCode == null) {
        errorMessages.push("No claim code found. Please check.")
        check = false;
      }
      if (this.IsCurrentDispensaryInsurace == true && this.currSale.selectedPatient.RemainingBalance < this.currSale.TotalAmount) {
        errorMessages.push("Not enough balance. Total Amount is greater than Balance.");
        check = false;
      }
      if (!this.allowAnonymousPatient) {
        if (this.currSale.selectedPatient.PatientId == 0) {
          errorMessages.push('Patient is mandatory.');
          check = false;
        }
      }
      if (this.currSale.ReceivedAmount < 0) {
        errorMessages.push('Received Amount cannot be less than 0!');
        check = false;
      }
      if (this.currSale.ReceivedAmount > this.currSale.TotalAmount) {
        errorMessages.push('Received Amount cannot be more than TotalAmount!');
        check = false;
      }
      if (this.currSale.IsCoPayment) {
        this.currSale.PaymentMode = this.currSale.CoPaymentMode;
      }
      else {
        if (this.currSale.PaymentMode == ENUM_BillPaymentMode.credit) {
          this.currSale.ReceivedAmount = 0;
        }
      }
      //check if narcotic item is sold
      this.isNarcoticSale = this.currSaleItems.some(i => i.selectedItem && i.selectedItem.IsNarcotic == true);
      if (this.isNarcoticSale) {
        if (this.currSale.PrescriberId < 1) {
          errorMessages.push('Doctor is mandatory for Narcotic sales');
          check = false;
        }
        if (this.currSale.MedicalCertificateNo == null) {
          errorMessages.push('For Narcotic sale Doctor Medical Certificate Number is required. ', 'Please Add NMC No')
          check = false;
        }
        if (this.currSale.selectedPatient.PatientId < 0) {
          errorMessages.push('Patient is mandatory for Narcotic sales');
          check = false;
        }
      }

      for (var j = 0; j < this.currSaleItems.length; j++) {
        this.currSaleItems[j].CounterId = this.currentCounterId;
        this.currSaleItems[j].StoreId = this._dispensaryService.activeDispensary.StoreId;
        this.currSaleItems[j].PrescriberId = this.currSale.PrescriberId;

        for (var i in this.currSaleItems[j].InvoiceItemsValidator.controls) {
          this.currSaleItems[j].InvoiceItemsValidator.controls['Price'].disable();
          this.currSaleItems[j].InvoiceItemsValidator.controls[i].markAsDirty();
          this.currSaleItems[j].InvoiceItemsValidator.controls[i].updateValueAndValidity();
        }

        if (!this.currSaleItems[j].IsValidCheck(undefined, undefined)) {
          check = false;
          errorMessages.push('Check values for item ' + (j + 1));
        }
      }
      for (var i in this.currSale.InvoiceValidator.controls) {
        this.currSale.InvoiceValidator.controls[i].markAsDirty();
        this.currSale.InvoiceValidator.controls[i].updateValueAndValidity();
      }

      if (!this.currSale.IsValidCheck(undefined, undefined)) {
        check = false;
        errorMessages.push('All * fields are mandatory');
      }

      if (this.currSale.Tender < this.currSale.PaidAmount && this.checkDeductfromDeposit == true) {
        errorMessages.push('Tender Amount can not be less than total amount.');
        check = false;
      }

      //Check False means we will not post this data to server. so we can make loading=false in that case.
      //when check is true, then buttons should still be disbled (i.e: Loading=True)
      this.loading = check;

      if (check) {
        this.AssignAllValues();
        this.currSale.InvoiceItems = this.currSaleItems;
        this.currSale.InvoiceItems.forEach(itm => {
          itm.PriceCategoryId = this.currentPatient.PriceCategoryId;
          itm.CreatedOn = moment().format('YYYY-MM-DD');
          itm.VisitType = this.currentPatient.VisitType;
        })
        this.currSale.CounterId = this.currentCounterId;
        this.currSale.StoreId = this._dispensaryService.activeDispensary.StoreId;
        this.currSale.PrescriberId = this.selectedRefId;//sud:28Jan'20
        this.currSale.ClaimCode = this.IsCurrentDispensaryInsurace ? this.currSale.selectedPatient.LatestClaimCode : this.currentPatient.ClaimCode;
        this.currSale.IsInsurancePatient = this.IsCurrentDispensaryInsurace;
        this.currSale.VisitType = this.currentPatient.VisitType;
        this.currSale.PatientVisitId = this.currentPatient.PatientVisitId;
        this.currentPatient = new PHRMPatient();
        if ((this.currSale.PaymentMode == ENUM_BillPaymentMode.cash && this.currSale.selectedPatient.FirstName == "Anonymous") || (this.currSale.PaymentMode == ENUM_BillPaymentMode.credit && this.currSale.selectedPatient.FirstName != "Anonymous") || (this.currSale.PaymentMode == 'cash' && this.currSale.selectedPatient.FirstName != "Anonymous")) {

          this.pharmacyBLService.postInvoiceData(this.currSale)
            .finally(() => this.loading = false)
            .subscribe(res => {
              if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results != null) {
                this.CallBackSaveSale(res);
              }
              else if (res.Status == ENUM_DanpheHTTPResponses.Failed) {
                this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, ['There is problem, please try again', res.ErrorMessage.split('exception')[0]]);
                var itemWithLessAvQtyArray = res.ErrorMessage.split(' ');
                for (var j = 0; j < this.currSaleItems.length; j++) {
                  if (this.currSaleItems[j].BatchNo == itemWithLessAvQtyArray[9]) {
                    this.currSaleItems[j].TotalQty = itemWithLessAvQtyArray[itemWithLessAvQtyArray.length - 1];
                  }
                }
              }
            },
              err => {
                this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, [err.ErrorMessage]);
              });
        }
        else {
          this.messageboxService.showMessage(ENUM_MessageBox_Status.Error, ['Please Change PAYMENT MODE !! CREDIT payment mode not is allowed to Anonymous Patient']);
          this.currSale.PaymentMode = ENUM_BillPaymentMode.cash;
          this.loading = false;
        }

      }
      else {
        this.messageboxService.showMessage(ENUM_MessageBox_Status.Error, errorMessages);
      }
    } catch (exception) {
      this.loading = false;
      this.ShowCatchErrMessage(exception);
    }

  }
  GetAllFiscalYrs() {
    this.pharmacyBLService.GetAllFiscalYears()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allFiscalYrs = res.Results;
        }
      });
  }
  GetCreditOrganizations() {
    this.pharmacyBLService.GetCreditOrganization()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.creditOrganizationsList = res.Results;
          this._dispensaryService.SetAllCreditOrgList(res.Results);
        }
      });
  }
  //after invoice is succesfully added this function is called.
  CallBackSaveSale(res) {
    try {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.currSale.InvoiceId = res.Results;
        this.messageboxService.showMessage(ENUM_MessageBox_Status.Success, ["Invoice saved Succesfully. "]);
        this.DeductStockQuantityLocally();
        this.DeductPatientBalanceLocally();
        this.showSaleInvoice = true;
        this.searchPatient = '';
        this.invoiceItem = new PHRMInvoiceItemsModel();
      }
      else {
        this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
        this.loading = false;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  private DeductStockQuantityLocally() {
    this.currSale.InvoiceItems.forEach(soldStock => {
      let item = this.ItemList.find(i => i.ItemId == soldStock.ItemId && i.BatchNo == soldStock.BatchNo && i.ExpiryDate == soldStock.ExpiryDate && i.SalePrice == soldStock.SalePrice && i.CostPrice == soldStock.Price);
      if (item != null) item.AvailableQuantity -= soldStock.Quantity;
    });
    this.ItemListFiltered = this.ItemList.filter(x => x.AvailableQuantity > 0);
  }

  private DeductPatientBalanceLocally() {
    if (this.IsCurrentDispensaryInsurace == true) {
      let selectedPatient = this.searchPatient;
      selectedPatient.RemainingBalance -= this.currSale.TotalAmount;
    }
  }

  changeTotalItems(saleItems: Array<PHRMInvoiceItemsModel>) {
    let i: number;
    this.totalItemCount = 0;
    for (i = 0; i < saleItems.length; i++) {
      if (saleItems[i].selectedItem) {
        this.totalItemCount += 1;
      }
    }
  }

  AssignAllValues() {
    try {
      this.currSale.BilStatus = (this.currSale.TotalAmount == this.currSale.PaidAmount) ? "paid" : (this.currSale.PaidAmount > 0) ? "partial" : "unpaid";
      this.currSale.BilStatus = (this.currSale.PaymentMode == "credit") ? "unpaid" : "paid";
      this.currSale.CreditAmount = this.currSale.IsCoPayment ? CommonFunctions.parseAmount((this.currSale.TotalAmount - this.currSale.ReceivedAmount), 4) : CommonFunctions.parseAmount((this.currSale.TotalAmount - this.currSale.PaidAmount), 4);
      this.currSale.IsOutdoorPat = this.currSale.selectedPatient.IsOutdoorPat;
      this.currSale.PatientId = this.currSale.selectedPatient.PatientId;
      this.currSale.DepositDeductAmount = this.depositDeductAmount;
      this.currSale.DepositAmount = this.depositDeductAmount;
      this.currSale.DepositBalance = this.newdepositBalance;
      this.currSale.CounterId = this.currentCounterId;
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  // Set Anonymous Patient and Clear all the Patient Summary
  public SetAnonymous() {
    try {
      if (this.allowAnonymousPatient) {
        this.currSale.selectedPatient.PatientId = -1;
        this.currSale.selectedPatient.Gender = 'N/A';
        this.currSale.selectedPatient.IsOutdoorPat = false;
        this.currSale.selectedPatient.PhoneNumber = 'N/A';
        this.currSale.selectedPatient.FirstName = 'Anonymous';
        this.currSale.selectedPatient.MiddleName = null;
        this.currSale.selectedPatient.LastName = 'Anonymous';
        this.currSale.selectedPatient.Age = 'N/A';
        this.currSale.selectedPatient.Address = 'Anonymous';
        this.currSale.selectedPatient.ShortName = 'Anonymous';
        this.currSale.selectedPatient.NSHINumber = '';
        this.currSale.selectedPatient.LatestClaimCode = null;
        this.currSale.selectedPatient.RemainingBalance = null;
        this.currSale.selectedPatient.ClaimCode = null;
        this.currentPatient = this.currSale.selectedPatient;
        this.searchPatient = '';
        this.currSale.selectedPatient.PatientCode = '';
        var patient = this.patientService.getGlobal();
        patient.ShortName = 'Anonymous';
        patient.PatientCode = '';
        patient.DateOfBirth = '';
        patient.PANNumber = 'N/A';
        patient.Gender = '';
        patient.PhoneNumber = 'N/A';
        patient.ClaimCode = null;
        this.patSummary.CreditAmount = this.patSummary.ProvisionalAmt = this.patSummary.BalanceAmount =
          this.patSummary.DepositBalance = this.patSummary.TotalDue =
          this.patSummary.IpCreditLimit =
          this.patSummary.OpCreditLimit = 0
        this.divDisable = true;
        this.showInfo = true;

        this.isReferrerLoaded = false;
        this.selectedRefId = -1; //-1 is value for Anonymous Doctor.
        this.visitType = "outpatient";
        this.currSale.InvoiceValidator.get("VisitType").setValue("outpatient");
        this.currentPatient.VisitType = this.visitType;
        this.changeDetectorRef.detectChanges();
        this.isReferrerLoaded = true;
        this.LoadDefaultScheme();
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  ShowStockDetails() {
    this.showStockDetails = true;
  }
  Close() {
    this.showStockDetails = false;
  }

  SaveSaleWithPatient() {
    this.isReturn = false;
    if (this.currSale.Change < 0 && this.currSale.PaymentMode !== ENUM_BillPaymentMode.credit) {
      this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ["Tender amount isn't Sufficient"]);
      return;
    }
    if (this.currSale.PaymentMode.toLowerCase() !== ENUM_BillPaymentMode.credit) {
      this.currSale.PaymentMode = ENUM_BillPaymentMode.cash;
    } else {
      this.currSale.PaymentMode = ENUM_BillPaymentMode.credit;
    }
    if (this.currSale.selectedPatient.PatientId === -1 && this.currSale.PaymentMode === 'credit') {
      this.messageboxService.showMessage(ENUM_MessageBox_Status.Error, ["For Anonymous patient Credit Payment Not Allowed"]);
      return;
    }
    this.Save();
  }

  Cancel() {
    this.currSale = new PHRMInvoiceModel();
    this.currSaleItems = [];
    this.SetAnonymous();
  }

  public ShowOpPatAddPopUp() {
    if (this.currentPatient.PatientId == 0) {
      this.showAddNewOpPopUp = true;
    }
    else if (this.currentPatient.PatientId == -1) {
      this.showAddNewOpPopUp = true;
    }
    else {
      this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ["Cannot edit this patient."])
    }
  }


  //used to format display of item in ng-autocomplete
  phrmItemListFormatter(data: any): string {
    let html = "";
    let date = new Date();
    let datenow = date.setMonth(date.getMonth() + 0);
    let datethreemonth = date.setMonth(date.getMonth() + 3);
    if (data["ItemId"]) {
      let expiryDate = new Date(data["ExpiryDate"]);
      let expDate = expiryDate.setMonth(expiryDate.getMonth() + 0);
      if (expDate < datenow) {
        html = `<font color='crimson'; size=03 >${data["ItemName"]}</font> <b>|Unit|${data["Unit"]}</b> |E:${moment(data["ExpiryDate"]).format('YYYY-MM-DD')} |B.No.|${data["BatchNo"]} |Qty|${data["AvailableQuantity"]} |SalePrice|${data["SalePrice"]}`;
      }
      if (expDate < datethreemonth && expDate > datenow) {

        html = `<font  color='#FFBF00'; size=03 >${data["ItemName"]}</font><b>|Unit|${data["Unit"]}</b> |E:${moment(data["ExpiryDate"]).format('YYYY-MM-DD')} |B.No.|${data["BatchNo"]} |Qty|${data["AvailableQuantity"]} |SalePrice|${data["SalePrice"]}`;
      }
      if (expDate > datethreemonth) {
        html = `<font color='blue'; size=03 >${data["ItemName"]}</font><b>|Unit|${data["Unit"]}</b> |E:${moment(data["ExpiryDate"]).format('YYYY-MM-DD')} |B.No.|${data["BatchNo"]} |Qty|${data["AvailableQuantity"]} |SalePrice|${data["SalePrice"]}`;
      }
    }
    else {
      html = data["ItemName"];
    }
    return html;
  }
  //for insurance Item format as Insurance Item SalePrice is different then normal Item SalePrice ie Ins Item SalePrice is Govt.Insurance Price;
  insuranceItemListFormatter(data: any): string {
    let html = "";
    let date = new Date();
    date.setMonth(date.getMonth() + 3);
    if (data["ItemId"]) {
      let expiryDate = new Date(data["ExpiryDate"]);
      if (expiryDate < date) {
        html = `<font color='crimson'; size=03 >${data["ItemName"]}</font> |E:${moment(data["ExpiryDate"]).format('YYYY-MM-DD')} |B.No.|${data["BatchNo"]} |Qty|${data["AvailableQuantity"]} |M.R.P|${data["InsuranceMRP"]}`;
      }
      else {
        html = `<font color='blue'; size=03 >${data["ItemName"]}</font> |E:${moment(data["ExpiryDate"]).format('YYYY-MM-DD')} |B.No.|${data["BatchNo"]} |Qty|${data["AvailableQuantity"]} |M.R.P|${data["InsuranceMRP"]}`;
      }
    }
    else {
      html = data["ItemName"];
    }
    return html;
  }

  //used to format display of item in ng-autocomplete
  patientListFormatter(data: any): string {
    let html = `${data["ShortName"]} [ ${data['PatientCode']} ]`;
    return html;
  }
  insurancePatientListFormatter(data: any): string {
    let html = `[${data['PatientCode']}] | ${data["ShortName"]} | NSHI [ ${data['Ins_NshiNumber']}]`;
    return html;
  }
  //used to format display of GenericName in ng-autocomplete
  phrmGenericListFormatter(data: any): string {
    let html = "";
    if (data["GenericId"]) {
      html = `<font color='blue'; size=03 >${data["GenericName"]}</font>`;
    }
    return html;
  }
  onClickProvider($event) {
    this.selectedRefId = $event.ReferrerId;
    //default providerid is -1.
    if ($event.ReferrerId > 0 || $event.ReferrerId == -1) {
      this.currSale.PrescriberId = $event.ReferrerId;

      this.currSale.ReferrerName = $event.ReferrerName;
      this.currSale.MedicalCertificateNo = $event.MedicalCertificateNo;
      this.currSale.IsExternal = $event.IsExternal;
      this.currSale.EnableControl('Prescriber', false);
    }
    else {
      this.currSale.EnableControl('Prescriber', true);
    }
  }
  onClickPatient($event) {
    if ($event.PatientId == -1) {
      this.SetAnonymous();
      this.ResetSchemePriceCategorySelection();
      this.DisplaySchemePriceCategorySelection = true;
      return;
    }
    if ($event.PatientId > 0) {
      this.pharmacyBLService.GetPatientByPatId($event.PatientId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.currSale.selectedPatient.PatientId = res.Results.PatientId;
            this.currSale.selectedPatient.PatientCode = res.Results.PatientCode;
            this.currSale.selectedPatient.Gender = res.Results.Gender;
            this.currSale.selectedPatient.IsOutdoorPat = (res.Results.VisitType === 'inpatient') ? false : true;
            this.currSale.selectedPatient.PhoneNumber = res.Results.PhoneNumber;
            this.currSale.selectedPatient.PANNumber = res.Results.PANNumber;
            this.currSale.selectedPatient.FirstName = res.Results.FirstName;
            this.currSale.selectedPatient.MiddleName = res.Results.MiddleName;
            this.currSale.selectedPatient.LastName = res.Results.LastName;
            this.currSale.selectedPatient.Age = res.Results.Age;
            this.currSale.selectedPatient.Address = res.Results.Address;
            this.currSale.selectedPatient.ShortName = res.Results.FirstName + ((res.Results.MiddleName != null) ? (' ' + res.Results.MiddleName + ' ') : (' ')) + res.Results.LastName;
            this.currSale.selectedPatient.CountrySubDivisionName = res.Results.CountrySubDivisionName;
            this.currSale.selectedPatient.DateOfBirth = res.Results.DateOfBirth;
            this.currSale.selectedPatient.IsAdmitted = res.Results.IsAdmitted;
            this.currSale.selectedPatient.NSHINumber = this.searchPatient.Ins_NshiNumber;
            this.currSale.selectedPatient.LatestClaimCode = res.Results.LatestClaimCode;
            this.currSale.PolicyNo = res.Results.PolicyNo;
            this.currSale.selectedPatient.RemainingBalance = this.searchPatient.Ins_InsuranceBalance;
            this.currentPatient = this.currSale.selectedPatient;
            this.currentPatient.VisitDate = res.Results.VisitDate;
            this.currentPatient.VisitType = res.Results.VisitType === 'inpatient' ? 'inpatient' : 'outpatient';
            this.currentPatient.PatientVisitId = res.Results.PatientVisitId;
            this.currentPatient.ClaimCode = res.Results.ClaimCode;
            this.SetServiceBillingContext(res.Results.IsAdmitted);
            this.SchemePriceCategoryFromVisit = { SchemeId: res.Results.SchemeId, PriceCategoryId: res.Results.PriceCategoryId };
            if (!(this.SchemePriceCategoryFromVisit.SchemeId && this.SchemePriceCategoryFromVisit.PriceCategoryId)) {
              this.DisplaySchemePriceCategorySelection = true;
            } else {
              this.DisplaySchemePriceCategorySelection = false;
            }
            this.currentPatient.PriceCategoryId = res.Results.PriceCategoryId;
            this.currSale.selectedPatient.NSHINumber = res.Results.PolicyNo;
            this.IsPatientDetailLoaded = true;
            //set patient to global
            let pat = this.patientService.CreateNewGlobal();
            pat.ShortName = res.Results.FirstName + ((res.Results.MiddleName != null) ? (' ' + res.Results.MiddleName + ' ') : (' ')) + res.Results.LastName;
            pat.PatientCode = res.Results.PatientCode;
            pat.DateOfBirth = res.Results.DateOfBirth;
            pat.PANNumber = res.Results.PANNumber;
            pat.Gender = res.Results.Gender;
            pat.PatientId = res.Results.PatientId;
            pat.PhoneNumber = res.Results.PhoneNumber;
            pat.Age = res.Results.Age;
            this.LoadPatientInvoiceSummary(this.currSale.selectedPatient.PatientId, res.Results.SchemeId, res.Results.PatientVisitId)
            if (this.currentPatient.PriceCategoryId == null) {
              this.pharmacyDefaultCreditOrganization = new CreditOrganization();
              this.currSale.IsCoPayment = false;
              this.currSale.PaymentMode = ENUM_BillPaymentMode.cash;
              this.currSale.CoPaymentMode = ENUM_BillPaymentMode.cash;
              this.PriceCategoryId = null;
            }
            this.deductDeposit = false;
            this.checkDeductfromDeposit = false;
            this.showInfo = true;

            //Prefill VisitType. (default is outpatient)
            if (res.Results.IsAdmitted) {
              this.visitType = "inpatient";
            } else {
              this.visitType = "outpatient";
            }
            //Fill the Provider Details if available.
            if (res.Results.PrescriberId) {
              this.selectedRefId = res.Results.PrescriberId;
            }
            else {
              this.selectedRefId = -1;//if providerid not found for this patient, then use Anonymous.
            }

            this.currSale.PrescriberId = this.selectedRefId;
            //needed to re-initiate the referrer dropdown.
            this.isReferrerLoaded = false;
            this.changeDetectorRef.detectChanges();
            this.isReferrerLoaded = true;
          }
          else {
            this.messageboxService.showMessage("Select Patient", [res.ErrorMessage]);
            this.loading = false;
          }
        });
    }
  }
  private SetServiceBillingContext(IsAdmitted: boolean) {
    if (IsAdmitted) {
      this.serviceBillingContext = ENUM_ServiceBillingContext.IpPharmacy;
    }
    else {
      this.serviceBillingContext = ENUM_ServiceBillingContext.OpPharmacy;
    }
  }

  onPressedEnterKeyInPatientField() {
    // Check if item is selected or not.
    if (this.currSaleItems.length > 0 && this.currSaleItems.some(a => a.ItemId > 0)) {
      const isItemNarcotic = this.currSaleItems.some(a => a.selectedItem.IsNarcotic == true);
      if (isItemNarcotic == true && this.currSale.PrescriberId == -1) {

        this.selectReferrerComponent.setFocusOnReferrerForNarcoticDrug();
      }
    }
    else {
      this.coreService.FocusInputById('item-box', 500);
    }
  }
  //This function only for show catch messages
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.routeFromService.RouteFrom = null;
      this.messageboxService.showMessage(ENUM_MessageBox_Status.Error, ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
    }
  }


  //used to format display of doctors name in ng-autocomplete.
  providerListFormatter(data: any): string {
    let html = data["Value"];
    return html;
  }

  LoadPatientInvoiceSummary(patientId: number, SchemeId?: number, PatientVisitId?: number, MemberNo?: string) {
    if (patientId > 0) {
      this.pharmacyBLService.GetPatientSummary(patientId, SchemeId, PatientVisitId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.patSummary = res.Results;
            this.patSummary.CreditAmount = CommonFunctions.parseAmount(this.patSummary.CreditAmount);
            this.patSummary.ProvisionalAmt = CommonFunctions.parseAmount(this.patSummary.ProvisionalAmt);
            this.patSummary.BalanceAmount = CommonFunctions.parseAmount(this.patSummary.BalanceAmount);
            this.patSummary.DepositBalance = CommonFunctions.parseAmount(this.patSummary.DepositBalance);
            this.patSummary.TotalDue = CommonFunctions.parseAmount(this.patSummary.TotalDue);
            this.patSummary.IpCreditLimit = CommonFunctions.parseAmount(this.patSummary.IpCreditLimit);
            this.patSummary.OpCreditLimit = CommonFunctions.parseAmount(this.patSummary.OpCreditLimit);
            this.patSummary.IsLoaded = true;
          }
          else {
            this.messageboxService.showMessage("Select Patient", [res.ErrorMessage]);
            this.loading = false;
          }
        });
    }
  }


  //Change the Checkbox value and call Calculation logic from here.
  DepositDeductCheckBoxChanged() {
    this.checkDeductfromDeposit = true;
    this.CalculateDepositBalance();
  }
  public newdepositBalance: number = 0;
  public depositDeductAmount: number = 0;
  CalculateDepositBalance() {
    if (this.deductDeposit) {
      if (this.patSummary.DepositBalance > 0) {
        this.newdepositBalance = this.patSummary.DepositBalance - this.currSale.PaidAmount;
        this.newdepositBalance = CommonFunctions.parseAmount(this.newdepositBalance);
        if (this.newdepositBalance >= 0) {
          this.depositDeductAmount = this.currSale.PaidAmount;
          this.currSale.Tender = this.currSale.PaidAmount;
          this.currSale.Change = 0;
        }
        else {
          this.currSale.Tender = -(this.newdepositBalance);//Tender is set to positive value of newDepositBalance.
          this.depositDeductAmount = this.patSummary.DepositBalance;//all deposit has been returned.
          this.newdepositBalance = 0;//reset newDepositBalance since it's all Used NOW.
          this.currSale.Change = 0;//Reset Change since we've reset Tender above.
        }
      }
      else {
        this.messageboxService.showMessage("failed", ["Deposit balance is zero, Please add deposit to use this feature."]);
        this.deductDeposit = !this.deductDeposit;
      }
    }
    else {
      //reset all required properties..
      this.currSale.Tender = this.currSale.TotalAmount;
      this.newdepositBalance = this.patSummary.DepositBalance;
      this.depositDeductAmount = 0;
      this.currSale.Change = 0;
    }
  }

  public LoadReferrerSettings() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Pharmacy" && a.ParameterName == "ExternalReferralSettings");
    if (currParam && currParam.ParameterValue) {
      this.ExtRefSettings = JSON.parse(currParam.ParameterValue);
    }
  }
  RegisterNewOutDoorPatient() {
    for (var i in this.currentPatient.PHRMPatientValidator.controls) {
      this.currentPatient.PHRMPatientValidator.controls[i].markAsDirty();
      this.currentPatient.PHRMPatientValidator.controls[i].updateValueAndValidity();
    }
    if (this.currentPatient.IsValidCheck(undefined, undefined)) {
      this.showNewPatRegistration = false;
      this.newOutPatient = Object.assign(this.newOutPatient, this.currentPatient);
      this.newOutPatient.ShortName = this.newOutPatient.FirstName.concat(this.newOutPatient.MiddleName ? " " + this.newOutPatient.MiddleName + " " : " ").concat(this.newOutPatient.LastName);
      this.currSale.selectedPatient = this.newOutPatient;
    }
  }

  GoToNextButton(nextField: HTMLButtonElement) {
    nextField.focus();
  }

  //this function is hotkeys when pressed by user
  public hotkeys(event) {
    //if loading is true (i.e: when buttons are disabled), don't allow to use shortcut keys.
    if (this.loading) {
      return;
    }
    if (event.keyCode === 27) {
      //For ESC key => close the pop up
      this.OnInvoicePopUpClose();
    }
    if (event.altKey) {
      switch (event.keyCode) {
        case 65: {//65='A'  => ALT+A comes here
          this.SetAnonymous();
          let itmCount = this.currSaleItems.length;
          if (itmCount > 0) {
            let lastIndex = itmCount - 1;
            window.setTimeout(function () {
              document.getElementById('generic' + lastIndex).focus();
            }, 600);
          }
          break;
        }
        case 190: { //=> ALT+. (dot) comes here -> For Chrome browser--KEEP THIS--It's WORKING
          document.getElementById('patient-search').click();
          break;
        }
        case 46: { //=> ALT+. (dot) comes here -> ASCII table shows  46=(dot), so kept this case as well, remove later if not used
          document.getElementById('patient-search').click();
          break;
        }
        case 76: {//=> ALT+L comes here
          this.ShowStockDetails();
          break;
        }
        case 78: {// => ALT+N comes here
          this.ShowOpPatAddPopUp();
          break;
        }
        case 80: {// => ALT+P comes here -->Shortcut for Print Invoice Button
          this.SaveSaleWithPatient();
          break;
        }
        default:
          break;
      }
    }
  }

  OnAddPatientPopUpClose() {
    this.showAddNewOpPopUp = false;
  }
  OnNewPatientAdded($event) {
    this.showAddNewOpPopUp = false;
    this.currentPatient = $event.currentPatient;

    let PriceCategory = this.coreService.Masters.PriceCategories.find(pc => pc.PriceCategoryName.toLocaleLowerCase() === ENUM_PriceCategory.General.toLocaleLowerCase())
    this.currentPatient.PriceCategoryId = PriceCategory ? PriceCategory.PriceCategoryId : null;

    this.currSale.selectedPatient = this.currentPatient;
    var patient = this.patientService.getGlobal();
    patient.ShortName = this.currSale.selectedPatient.ShortName;
    patient.PatientCode = '';
    patient.DateOfBirth = this.currSale.selectedPatient.DateOfBirth;
    patient.Age = this.currSale.selectedPatient.Age;
    patient.Gender = this.currSale.selectedPatient.Gender;
    patient.PhoneNumber = this.currSale.selectedPatient.PhoneNumber;
    patient.PANNumber = this.currSale.selectedPatient.PANNumber;
    this.coreService.FocusInputById(`item-box`);
  }

  OnInvoicePopUpClose() {
    this.loading = false;
    this.selectedRefId = -1;
    this.isReferrerLoaded = true;
    this.currSale = new PHRMInvoiceModel();

    //Reset DiscountPercentage after Invoice Printed (Popup Closed)
    this.currSaleItems = new Array<PHRMInvoiceItemsModel>();
    //Reset Item Count
    this.changeTotalItems(this.currSaleItems)

    //focus on 1st row of generic after item loaded. ref: sanjit/sud
    if (this.IsCurrentDispensaryInsurace == false) {
      this.SetAnonymous();
      this.coreService.FocusInputById(`patient-search`);
    }
    else {
      this.currSale.PaymentMode = 'credit';
      this.coreService.FocusInputById(`patient-search`);
      this.visitType = 'inpatient';
      this.currSale.InvoiceValidator.get("VisitType").setValue("inpatient");
    }
    this.patientService.CreateNewGlobal();
    this.showSaleInvoice = false;
    this.showProvisionalInvoice = false;
    this.PriceCategoryId = null;
    this.MembershipTypeId = null;
    this.ResetSchemePriceCategorySelection();

  }

  ResetSchemePriceCategorySelection(): void {
    this.SchemePriceCategoryFromVisit = { SchemeId: 0, PriceCategoryId: 0 };
    this.serviceBillingContext = ENUM_ServiceBillingContext.OpPharmacy;
    this.changeDetectorRef.detectChanges();
  }

  //check the Sales Page Customization ie enable or disable Vat and Discount;
  checkSalesCustomization() {
    let salesParameterString = this.coreService.Parameters.find(p => p.ParameterName == "SalesFormCustomization" && p.ParameterGroupName == "Pharmacy");
    if (salesParameterString != null) {
      let SalesParameter = JSON.parse(salesParameterString.ParameterValue);
      this.isItemLevelVATApplicable = (SalesParameter.EnableItemLevelVAT == true);
      this.isMainVATApplicable = (SalesParameter.EnableMainVAT == true);
      this.IsitemlevlDis = (SalesParameter.EnableItemLevelDiscount == true);
      this.isMainDiscountAvailable = (SalesParameter.EnableMainDiscount == true);

    }

    let patientInfoCustomizationParameterString = this.coreService.Parameters.find(p => p.ParameterName === 'CommunityMembershipRankAndPostingCustomization' && p.ParameterGroupName === 'Pharmacy');
    if (patientInfoCustomizationParameterString) {
      let PatientInfoParameter = JSON.parse(patientInfoCustomizationParameterString.ParameterValue);
      this.showCommunityName = PatientInfoParameter.ShowCommunityName;
      this.showMembershipTypeName = PatientInfoParameter.ShowMembershipTypeName;
      this.showPosting = PatientInfoParameter.ShowPosting;
      this.showRank = PatientInfoParameter.ShowRank;
    }
  }

  // Barcode Event Handlers
  barcode: string = "";
  reading: boolean = false;
  typedBarcode: number = null;
  isBarcodeMode: boolean = false;
  // barcodeKeyPressListener($event) {
  //   //usually scanners throw an 'Enter' key at the end of read
  //   if ($event.keyCode === 13) {
  //     /// code ready to use
  //     this.onBarcodeReadingCompleted(parseInt(this.barcode));
  //     this.barcode = "";
  //   } else {
  //     this.barcode += $event.key;//while this is not an 'enter' it stores the every key
  //   }
  //   //run a timeout of 200ms at the first read and clear everything
  //   if (!this.reading) {
  //     this.reading = true;
  //     setTimeout(() => {
  //       if (this.barcode.length < 7) return;
  //       // code ready to use
  //       this.onBarcodeReadingCompleted(parseInt(this.barcode));
  //       this.barcode = "";
  //       this.reading = false;
  //     }, 300);
  //   } //300 works fine
  // }
  // onBarcodeReadingCompleted(barcodeNumber: number) {
  //   var lastSaleItemIndex = this.currSaleItems.length - 1;

  //   let item = this.ItemList.find(a => a.BarcodeNumber == barcodeNumber);
  //   if (item == undefined) return;

  //   let newSaleItem = new PHRMInvoiceItemsModel();
  //   // if last row is blank, then add to that last blank row
  //   if (this.currSaleItems[lastSaleItemIndex].ItemId == null) {
  //     this.currSaleItems[lastSaleItemIndex] = newSaleItem;
  //   }
  //   // else add new item at the last
  //   else {
  //     this.currSaleItems.push(newSaleItem);
  //     lastSaleItemIndex++;
  //   }
  //   this.currSaleItems[lastSaleItemIndex].selectedItem = item;
  //   this.currSaleItems[lastSaleItemIndex].selectedGeneneric = this.genericList.find(g => g.GenericId == item.GenericId);

  //   this.isBarcodeMode = true;
  //   this.OnPressedEnterKeyInItemField(lastSaleItemIndex);
  //   // barcode field should be refreshed
  //   this.typedBarcode = null;
  // }

  PaymentModeChanges($event: any) {

    this.currSale.PaymentMode = $event.PaymentMode.toLowerCase();
    this.currSale.PaymentDetails = $event.PaymentDetails;
    this.currSale.IsRemarksMandatory = $event.IsRemarksMandatory;
    this.isRemarksMandatory = this.currSale.IsRemarksMandatory;
    this.OnPaymentModeChange();

  }
  OnPaymentModeChange() {
    if (this.currSale.PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit) {
      this.currSale.PaidAmount = 0;
      this.currSale.BilStatus = ENUM_BillingStatus.unpaid;
      this.currSale.CreateOn = moment().format("YYYY-MM-DD HH:mm:ss");
      this.currSale.CounterId = this.securityService.getLoggedInCounter().CounterId;
      this.currSale.Tender = 0;
      if (this.currSale.InvoiceItems) {
        this.currSale.InvoiceItems.forEach(txnItm => {
          txnItm.BilItemStatus = ENUM_BillingStatus.unpaid;
          txnItm.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");;
        });
      }
      this.deductDeposit = false;
      this.DepositDeductCheckBoxChanged();
    }
    else {
      this.currSale.PaidAmount = this.currSale.Tender - this.currSale.Change;
      this.currSale.BilStatus = ENUM_BillingStatus.paid;
      this.currSale.CreateOn = moment().format("YYYY-MM-DD HH:mm:ss");//default paiddate.
      this.currSale.CounterId = this.securityService.getLoggedInCounter().CounterId;//sud:29May'18
      if (!this.pharmacyDefaultCreditOrganization) {
        this.currSale.OrganizationId = null;
        this.currSale.CreditOrganizationName = null;
      }
      if (this.TempEmployeeCashTransaction && !this.TempEmployeeCashTransaction.length && !this.deductDeposit) {
        let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() == this.currSale.PaymentMode.toLocaleLowerCase());
        let empCashTxnObj = new PHRMEmployeeCashTransaction();
        empCashTxnObj.InAmount = this.currSale.ReceivedAmount;
        empCashTxnObj.OutAmount = 0;
        empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubcategoryId;
        empCashTxnObj.ModuleName = ENUM_ModuleName.Dispensary;
        this.TempEmployeeCashTransaction.push(empCashTxnObj);
      }
      if (this.TempEmployeeCashTransaction && !this.TempEmployeeCashTransaction.length && this.deductDeposit) {
        let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() == this.currSale.PaymentMode.toLocaleLowerCase());
        let empCashTxnObj = new PHRMEmployeeCashTransaction();
        empCashTxnObj.InAmount = this.currSale.DepositUsed;
        empCashTxnObj.OutAmount = 0;
        empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubcategoryId;
        empCashTxnObj.ModuleName = ENUM_ModuleName.Dispensary;
        this.TempEmployeeCashTransaction.push(empCashTxnObj);

        if ((this.currSale.TotalAmount - this.currSale.DepositUsed) > 0) {
          let empCashTxnObj = new PHRMEmployeeCashTransaction();
          let obj = this.MstPaymentModes[0];
          empCashTxnObj.InAmount = this.currSale.ReceivedAmount - this.currSale.DepositUsed;
          empCashTxnObj.OutAmount = 0;
          empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubcategoryId;
          empCashTxnObj.ModuleName = ENUM_ModuleName.Dispensary;
          this.TempEmployeeCashTransaction.push(empCashTxnObj);
        }
      }
      if (this.currSale.InvoiceItems) {
        this.currSale.InvoiceItems.forEach(txnItm => {
          txnItm.BilItemStatus = ENUM_BillingStatus.paid;
          txnItm.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
        });
      }
      this.currSale.PHRMEmployeeCashTransactions = this.TempEmployeeCashTransaction;
    }
  }
  CreditOrganizationChanges($event: any) {
    this.currSale.OrganizationId = $event.OrganizationId;
    this.currSale.CreditOrganizationName = $event.OrganizationName;
  }
  public TempEmployeeCashTransaction: Array<PHRMEmployeeCashTransaction> = new Array<PHRMEmployeeCashTransaction>();

  MultiplePaymentCallBack($event: any) {
    if ($event && $event.MultiPaymentDetail) {
      this.TempEmployeeCashTransaction = new Array<PHRMEmployeeCashTransaction>();
      if ((this.phrmEmpCashTxn != null || this.phrmEmpCashTxn != undefined) && this.phrmEmpCashTxn.PaymentModeSubCategoryId > 0) {
        this.TempEmployeeCashTransaction = $event.MultiPaymentDetail;
        this.TempEmployeeCashTransaction.push(this.phrmEmpCashTxn);
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
    this.currSale.PaymentDetails = $event.PaymentDetail;
    this.currSale.PHRMEmployeeCashTransactions = $event.MultiPaymentDetail;
  }

  ShowPatiendAddDepositPage() {
    this.ShowDepositAdd = true;
  }
  DepositAdd() {
    this.ShowDepositAdd = false;
    //After Changes in deposit amount the patient invoice summary should be reload
    this.LoadPatientInvoiceSummary(this.currSale.selectedPatient.PatientId);
  }
  OpenAddNMCPopup() {
    this.NMCNoAddPopup = true;
  }
  CloseAddNMCPopup() {
    this.NMCNoAddPopup = false;
  }
  SaveNMCNo() {
    if (this.MedicalCertificateNo == null) {
      this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ['Please provide {{labelForNMCNo}}.']);
      return;
    }
    this.pharmacyBLService.UpdateNMCNo(this.currSale.PrescriberId, this.MedicalCertificateNo).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.NMCNoAddPopup = false;
        this.EmployeeDetails = res.Results;
        if (this.EmployeeDetails) {
          this.currSale.PrescriberId = this.EmployeeDetails.EmployeeId;
          this.currSale.MedicalCertificateNo = this.EmployeeDetails.MedCertificationNo;
          this.currSale.ReferrerName = this.EmployeeDetails.FullName;
          this.currSale.IsExternal = this.EmployeeDetails.IsExternal;
        }
        this.MedicalCertificateNo = null;
      }
    });
    this.refererListReload = true;
  }

  IsAnonymousPatientEnable() {
    let anonymousPatientEnableParameter = this.coreService.Parameters.find(p => p.ParameterName == "AllowAnonymousPatient" && p.ParameterGroupName == "Pharmacy");
    if (anonymousPatientEnableParameter != null) {
      let parameter = JSON.parse(anonymousPatientEnableParameter.ParameterValue);
      this.allowAnonymousPatient = parameter.AllowAnonymousPatient;
    }
  }

  GetPriceCategories() {
    this.pharmacyBLService.GetPriceCategories().subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.allPriceCategories = [];
        let priceCategory = res.Results;
        this.allPriceCategories = priceCategory.filter(a => a.IsActive == true)
      }
      else {
        console.log(res.ErrorMessage);
      }
    }, err => {
      console.log(err);
    })
  }
  GetPriceCategory() {
    let priceCategory = this.coreService.Masters.PriceCategories;
    this.allPriceCategories = [];
    this.allPriceCategories = priceCategory.filter(a => a.IsActive == true);
    this.systemDefaultPriceCategory = this.allPriceCategories.find(p => p.IsDefault).PriceCategoryId;
    if (!this.allPriceCategories.length) {
      this.GetPriceCategories();
    }
  }

  public GetPatientSearchMinCharacterCountParameter() {
    let param = this.coreService.Parameters.find(a => a.ParameterGroupName === 'Common' && a.ParameterName === 'PatientSearchMinCharacterCount');
    if (param) {
      let obj = JSON.parse(param.ParameterValue);
      this.PatientSearchMinCharacterCount = parseInt(obj.MinCharacterCount);
    }
  }

  ReceivedAmountChange() {
    if (this.CheckValidationForReceivedAmount()) {
      this.currSale.CoPaymentCashAmount = this.currSale.ReceivedAmount;
      this.currSale.CoPaymentCreditAmount = this.currSale.TotalAmount - this.currSale.ReceivedAmount;
      if (this.currSale.CoPaymentCreditAmount === 0) {
        this.currSale.CoPaymentMode = ENUM_BillPaymentMode.cash;
        this.IsAllAmountPaidByPatient = true;
      }
    }
  }
  ReCalculateCOPaymentAmount() {
    this.currSale.CoPaymentMode = ENUM_BillPaymentMode.credit;
    this.IsAllAmountPaidByPatient = false;
    this.COPaymentAmountCalculation();
  }
  CheckValidationForReceivedAmount() {
    let isValidAmount = true;
    let ReceivedAmount = this.currSale.ReceivedAmount;
    if (ReceivedAmount < 0) {
      isValidAmount = false;
      this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ["Cash cannot be less than 0!"]);
      return;
    }
    if (ReceivedAmount > this.currSale.TotalAmount) {
      isValidAmount = false;
      this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ["Cash cannot be more than TotalAmount!"]);
      return;
    }
    if (this.currSale.IsCoPayment) {
      let CoPaymentCashAmount = CommonFunctions.parsePhrmAmount(this.currSale.TotalAmount * this.currSale.Copayment_CashPercent / 100);
      if (ReceivedAmount < CoPaymentCashAmount) {
        isValidAmount = false;
        this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ["Cash cannot be less than CoPaymentCash Amount!"]);
        return;
      }
    }
    return isValidAmount;
  }

  ngAfterViewChecked() {
    this.changeDetectorRef.detectChanges();
  }

  RemoveInvoiceItem(index: number) {
    if (index >= 0) {
      this.currSaleItems.splice(index, 1);
      this.MainLevelCalculation();
    }

  }


  OnSchemePriceCategoryChanged(schemePriceObj: PharmacySchemePriceCategory_DTO): void {
    this.ResetCurrentSales();
    this.SchemePriceCategory = schemePriceObj;
    this.currSale.SchemeId = this.SchemePriceCategory.SchemeId;
    this.currentPatient.PriceCategoryId = this.SchemePriceCategory.PriceCategoryId;
    if (this.SchemePriceCategory.PriceCategoryId !== this.oldPriceCategoryId) {
      this.LoadItemTypeList(this.currentActiveDispensary.StoreId, this.currentPatient.PriceCategoryId)
      this.oldPriceCategoryId = this.SchemePriceCategory.PriceCategoryId;
    }
    if (this.SchemePriceCategory.IsCreditOnlyScheme && !this.SchemePriceCategory.IsCoPayment) {
      this.DisablePaymentModeDropDown = true;
    } else {
      this.DisablePaymentModeDropDown = false;
    }
    if (this.SchemePriceCategory.IsDiscountApplicable) {
      this.currSale.SchemeDiscountPercentage = this.SchemePriceCategory.DiscountPercent;
      this.currSale.DiscountPer = this.SchemePriceCategory.DiscountPercent;
      this.invoiceItem.DiscountPercentage = this.SchemePriceCategory.DiscountPercent;
    } else {
      this.currSale.SchemeDiscountPercentage = 0;
      this.invoiceItem.DiscountPercentage = 0;
    }
    this.currSale.IsCoPayment = this.SchemePriceCategory.IsCoPayment;

    if (this.SchemePriceCategory.IsCoPayment) {
      this.currSale.PaymentMode = ENUM_BillPaymentMode.credit;
      this.currSale.CoPaymentMode = ENUM_BillPaymentMode.credit;
      this.currSale.Copayment_CashPercent = this.SchemePriceCategory.CoPaymentCashPercent;
      this.currSale.Copayment_CreditPercent = this.SchemePriceCategory.CoPaymentCreditPercent;
    }
  }

  ResetCurrentSales() {
    this.currSaleItems = [];
    this.invoiceItem = new PHRMInvoiceItemsModel();
    this.currSale.DiscountPer = 0;
    this.currSale.DiscountAmount = 0;
    this.currSale.VATPercentage = 0;
    this.currSale.VATAmount = 0;
    this.currSale.SubTotal = 0;
    this.currSale.TotalAmount = 0;
    this.currSale.PaidAmount = 0;
    this.currSale.Change = 0;
  }

  FilterGenericAndItemByPriceCategory(PriceCategoryId?: number, GenericId?: number): void {
    if (PriceCategoryId) {
      let PriceCategoryObject = this.allPriceCategories.find(a => a.PriceCategoryId === PriceCategoryId);
      if (PriceCategoryObject.PriceCategoryName.toLocaleLowerCase() === ENUM_PriceCategory.General.toLocaleLowerCase()) {
        if (!GenericId) {
          this.ItemListWithCategoryFiltered = this.ItemListFiltered;
          this.FilteredGenericList = this.GenericList;
        }
        else {
          this.ItemListWithCategoryFiltered = this.ItemListFiltered.filter(p => p.GenericId == GenericId);
        }
      }
      else {
        if (!GenericId) {
          this.ItemListWithCategoryFiltered = this.ItemListFiltered;
        }
        else {
          this.ItemListWithCategoryFiltered = this.ItemListFiltered.filter(p => p.GenericId == GenericId);
        }
        this.FilteredGenericList = this.GenericList.filter(g => g.PHRM_MAP_MstItemsPriceCategories.find(p => p.PriceCategoryId == PriceCategoryId && p.IsActive == true));
      }
    }
  }

  handleConfirm() {
    this.SaveSaleWithPatient();
  }

  handleCancel() {
    this.loading = false;
  }

  LoadDefaultScheme() {
    this.pharmacyBLService.GetDefaultScheme(ENUM_ServiceBillingContext.OpPharmacy).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results && res.Results.length) {
        let scheme: PharmacySchemePriceCategory_DTO = res.Results.find(s => s.IsSystemDefault);
        if (scheme) {
          this.OnSchemePriceCategoryChanged(scheme);
        }
      }
    })
  }

  SaveProvisional(): void {
    this.loading = true;
    try {
      const errorMessages: string[] = [];
      let check = true;

      this.currSaleItems = this.currSaleItems.filter(a => a.ItemId != null || a.ItemId > 0);
      if (this.currSaleItems.length === 0) {
        errorMessages.push("No item selected. Please select some item.");
        check = false;
      }

      for (let j = 0; j < this.currSaleItems.length; j++) {
        const date = new Date();
        const datenow = date.setMonth(date.getMonth() + 0);
        const expiryDate = this.currSaleItems[j].ExpiryDate;
        const expiryDate1 = new Date(expiryDate);
        const expDate = expiryDate1.setMonth(expiryDate1.getMonth() + 0);

        if (expDate < datenow) {
          errorMessages.push(`Expired item-${j + 1} cannot be sold.`);
          check = false;
        }

        if (this.currSaleItems[j].ExpiryDate && !this.currSaleItems[j].Quantity) {
          errorMessages.push(`Qty is required for item ${j + 1}`);
          check = false;
        } else if (this.currSaleItems[j].Quantity > this.currSaleItems[j].TotalQty) {
          errorMessages.push(`Qty is greater than Stock for item ${j + 1}`);
          check = false;
        }
      }

      if (!this.allowAnonymousPatient && this.currSale.selectedPatient.PatientId === 0) {
        errorMessages.push('Patient is mandatory.');
        check = false;
      }

      this.isNarcoticSale = this.currSaleItems.some(i => i.selectedItem && i.selectedItem.IsNarcotic);
      if (this.isNarcoticSale) {
        if (this.currSale.PrescriberId < 1) {
          errorMessages.push('Doctor is mandatory for Narcotic sales');
          check = false;
        }
        if (this.currSale.MedicalCertificateNo === null) {
          errorMessages.push('For Narcotic sale Doctor Medical Certificate Number is required. Please Add NMC No');
          check = false;
        }
        if (this.currSale.selectedPatient.PatientId < 0) {
          errorMessages.push('Patient is mandatory for Narcotic sales');
          check = false;
        }
      }

      for (let j = 0; j < this.currSaleItems.length; j++) {
        this.currSaleItems[j].CounterId = this.currentCounterId;
        this.currSaleItems[j].StoreId = this._dispensaryService.activeDispensary.StoreId;
        this.currSaleItems[j].PrescriberId = this.currSale.PrescriberId;

        for (const i in this.currSaleItems[j].InvoiceItemsValidator.controls) {
          //this.currSaleItems[j].InvoiceItemsValidator.controls['Price'].disable();
          this.currSaleItems[j].InvoiceItemsValidator.controls[i].markAsDirty();
          this.currSaleItems[j].InvoiceItemsValidator.controls[i].updateValueAndValidity();
        }

        if (!this.currSaleItems[j].IsValidCheck(undefined, undefined)) {
          check = false;
          errorMessages.push(`Check values for item ${j + 1}`);
        }
      }

      for (const i in this.currSale.InvoiceValidator.controls) {
        this.currSale.InvoiceValidator.controls[i].markAsDirty();
        this.currSale.InvoiceValidator.controls[i].updateValueAndValidity();
      }

      if (!this.currSale.IsValidCheck(undefined, undefined)) {
        check = false;
        errorMessages.push('All * fields are mandatory');
      }
      this.loading = check;
      if (check) {
        this.MapInvoiceItemData();
        this.pharmacyBLService.SaveProvisional(this.currSaleItems).finally(() => this.loading = false)
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.ProvisionalInvoice = res.Results;
              this.showProvisionalInvoice = true;
              this.messageboxService.showMessage(ENUM_MessageBox_Status.Success, ['Provisional Save successfully']);
            }
            else {
              this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to save provisional']);
            }
          },
            err => {
              this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to save provisional' + err]);
            })
      }
      else {
        this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, errorMessages);
      }
    } catch (exception) {
      this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, exception);
      this.loading = false;
    }
  }
  MapInvoiceItemData() {
    this.currSaleItems.forEach(item => {
      item.PatientId = this.currSale.selectedPatient.PatientId;
      item.BilItemStatus = ENUM_BillingStatus.provisional;
      item.CreatedOn = moment().format('YYYY-MM-DD');
      item.PriceCategoryId = this.SchemePriceCategory.PriceCategoryId;
      item.PatientVisitId = this.currentPatient.PatientVisitId;
      item.VisitType = this.currentPatient.VisitType;
    });
  }

  handleProvisionalSaleConfirm() {
    this.SaveProvisional();
  }




}

export class ProviderModel {
  public Key: number = 0;
  public Value: string = null;
}
