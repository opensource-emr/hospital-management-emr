
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Subscription } from 'rxjs';
import { BillingMasterBlService } from "../../billing/shared/billing-master.bl.service";
import { BillingTransactionItem } from "../../billing/shared/billing-transaction-item.model";
import { BillingTransaction, EmployeeCashTransaction } from "../../billing/shared/billing-transaction.model";
import { BillingService } from "../../billing/shared/billing.service";
import { BillingAdditionalServiceItem_DTO } from "../../billing/shared/dto/bill-additional-service-item.dto";
import { OpdServiceItemPrice_DTO } from "../../billing/shared/dto/opd-serviceitem-price.dto";
import { RegistrationScheme_DTO } from "../../billing/shared/dto/registration-scheme.dto";
import { ServiceItemSchemeSetting_DTO } from "../../billing/shared/dto/service-item-scheme-setting.dto";
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from "../../security/shared/security.service";
import { CreditOrganization } from "../../settings-new/shared/creditOrganization.model";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { CommonFunctions } from "../../shared/common.functions";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { ENUM_AdditionalServiceItemGroups, ENUM_AppointmentType, ENUM_BillPaymentMode, ENUM_BillingStatus, ENUM_BillingType, ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status, ENUM_PriceCategory, ENUM_ServiceBillingContext, ENUM_VisitType } from "../../shared/shared-enums";
import { AppointmentService } from "../shared/appointment.service";
import { FreeVisitSettings_DTO } from "../shared/dto/free-visit-settings.dto";
import { VisitBLService } from "../shared/visit.bl.service";
import { VisitService } from "../shared/visit.service";


@Component({
  selector: "visit-billing-info",
  templateUrl: "./visit-billing-info.html",
  styleUrls: ['./visit-common.css']
})
export class VisitBillingInfoComponent implements OnInit {

  public VisitBillInfoSubscriptions: Subscription = new Subscription();
  @Input("billing-transaction")
  public BillingTransaction: BillingTransaction;
  @Output() TenderChanged = new EventEmitter<any>();
  public VisitBillItem: OpdServiceItemPrice_DTO;
  public AllBillItems: Array<any> = [];//pratik: 13july2020
  public OpdBillTxnItem: BillingTransactionItem = new BillingTransactionItem();
  public AllowAdditionalBillItems: boolean = false;
  //public disableAddHealthCard: boolean = false;
  public PriceCategory: string = ENUM_PriceCategory.Normal;
  public ShowBillSummaryPanel: boolean = true;//sud:26June'19--incase of followup we may not have to show billSummary panel.
  public AdditionalBilItems: Array<AdditionalBillItemVMModel> = [];
  public AdditionBillItemList: Array<AdditionalBillItemVMModel> = [];
  public NotAdditionalBillItem = { ServiceItemId: 0, ItemName: null };
  public ShowAdditionalBillItemPanel: boolean = false;
  public PaymentPages: any[];
  public MstPaymentModes: any[];
  public DoctorOpdPriceItems: Array<OpdServiceItemPrice_DTO> = [];
  public DoctorFollowupPrices: Array<OpdServiceItemPrice_DTO> = [];
  public DoctorOpdOldPatientPriceItems: Array<OpdServiceItemPrice_DTO> = [];
  public DoctorOpdReferralPriceItems: Array<OpdServiceItemPrice_DTO> = [];
  public DepartmentOpdPriceItems = [];
  public DepartmentFollowupPrices = [];
  public DepartmentOpdOldPatientPriceItems = [];
  public IsOldPatientOpd: boolean = false;
  public DisableDiscountPercent: boolean = false;
  public MembershipTypeName: string = null;
  public SelectedMembershipTypeId: number = 0;
  public Temp_CreditOrgObj_ChangeToId: CreditOrganization = new CreditOrganization();
  public RegistrationSchemeDto: RegistrationScheme_DTO = new RegistrationScheme_DTO();
  public DisablePaymentModeDropDown: boolean = false;
  public SelectedDepartmentId: number = null;
  public SelectedPerformerId: number = null;
  public ServiceItemSchemeSettings: Array<ServiceItemSchemeSetting_DTO> = new Array<ServiceItemSchemeSetting_DTO>();
  public VisitAdditionalServiceItems: Array<BillingAdditionalServiceItem_DTO> = new Array<BillingAdditionalServiceItem_DTO>();
  public FilteredVisitAdditionalServiceItems: Array<BillingAdditionalServiceItem_DTO> = new Array<BillingAdditionalServiceItem_DTO>();
  public AdditionalVisitBilItems: Array<BillingAdditionalServiceItem_DTO> = [];
  public CurrentPriceCategoryId: number = 0;
  public TotalDiscountAmount: number = 0;
  public EnableDiscountAmount: boolean = false;
  public ItemLevelDiscount: boolean = false;
  public IsItemLevelDiscountChanged: boolean = false;
  public FreeVisitSettings = new FreeVisitSettings_DTO();

  constructor(
    private _billingService: BillingService,
    private _securityService: SecurityService,
    private _visitService: VisitService,
    private _visitBLService: VisitBLService,
    public coreService: CoreService,
    private _messageBoxService: MessageboxService,
    private _routeFromService: RouteFromService,
    private _appointmentService: AppointmentService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _billingMasterBlService: BillingMasterBlService
  ) {

    this.InitializeSubscriptions();
    this.PatientAgeSubscription();
    this.FreeVisitSubscription();
    this.GetShowAdditionalBillItemParameter();
    this.GetBillingItems();
    this.GetVisitAdditionalServiceItems();
  }

  PatientAgeSubscription() {
    this.VisitBillInfoSubscriptions.add(this._visitService.ObservePatientAgeChangeEvent().subscribe(age => {
      if (age > 0) {
        //this.HandleAdditionalServiceItemCheckUncheck();
        const param = this.coreService.Parameters.find(a => a.ParameterGroupName === 'Appointment' && a.ParameterName === 'AutoAddServiceItemForChild');
        if (param) {
          const paramValue = JSON.parse(param.ParameterValue);
          if (this.VisitAdditionalServiceItems && this.VisitAdditionalServiceItems.length) {
            const serviceItem = this.VisitAdditionalServiceItems.find(a => a.ServiceItemId === +paramValue.ServiceItemId);
            if (age <= +paramValue.Age) {
              if (serviceItem) {
                serviceItem.IsSelected = true;
                this.FilteredVisitAdditionalServiceItems.forEach(a => {
                  if (a.ServiceItemId === serviceItem.ServiceItemId) {
                    a.IsSelected = true;
                  }
                });
              }
              this.HandleAdditionalServiceItemCheckUncheck(serviceItem);
            } else {
              if (serviceItem) {
                serviceItem.IsSelected = false;
                this.FilteredVisitAdditionalServiceItems.forEach(a => {
                  if (a.ServiceItemId === serviceItem.ServiceItemId) {
                    a.IsSelected = false;
                  }
                });
              }
              this.HandleAdditionalServiceItemCheckUncheck(serviceItem);
            }
          }
        }
        console.log("select Bluebook automatically if age <= 2, Here age is:" + age);
      }
    }));
  }

  public FreeVisitSubscription(): void {
    this.VisitBillInfoSubscriptions.add(this._visitService.ObserveFreeVisitCheckboxChangedEvent()
      .subscribe((res: FreeVisitSettings_DTO) => {
        this.FreeVisitSettings = res;
        if (!this.FreeVisitSettings.EnableFreeVisit && !this.FreeVisitSettings.InitialSubscriptionFromVisitInfo) {
          if (this.BillingTransaction.BillingTransactionItems && this.BillingTransaction.BillingTransactionItems.length) {
            let billTxnItm = this.NewBillingTransactionItem();
            this.BillingTransaction.BillingTransactionItems = new Array<BillingTransactionItem>();
            this.BillingTransaction.BillingTransactionItems.push(billTxnItm);
          }
        }
      }));
  }

  public InitializeSubscriptions(): void {
    //Billing component is subscribing to NeedBillRecalculation event of Visit Service,
    //Patient and Doctor selection will trigger that event.
    this.VisitBillInfoSubscriptions.add(

      this._visitService.ObserveBillChanged.subscribe(
        newBill => {

          if (this._visitService.appointmentType.toLowerCase() === ENUM_AppointmentType.followup) {
            this.HandleBillChangedForFollowUp(newBill);
          }
          else {
            if (newBill.ChangeType === "Membership") {

              if (newBill) {
                this.SelectedMembershipTypeId = newBill.MembershipTypeId;
                //show membershipname as remarks when discountpercent>0
                if (newBill.DiscountPercent && newBill.DiscountPercent > 0) {
                  this.BillingTransaction.Remarks = newBill.MembershipTypeName;
                  //this.MembershipTypeName = newBill.MembershipTypeName;
                  //this.billingTransaction.BillingTransactionItems.forEach(a => {
                  //  a.DiscountSchemeId = newBill.MembershipTypeId;
                  //});
                }
                else {
                  this.BillingTransaction.Remarks = null;
                }

                this.MembershipTypeName = newBill.MembershipTypeName;
                this.BillingTransaction.BillingTransactionItems.forEach(a => {
                  a.DiscountSchemeId = newBill.MembershipTypeId;
                });
                this.BillingTransaction.DiscountPercent = newBill.DiscountPercent ? newBill.DiscountPercent : 0;
                if (!this.MembershipTypeName || this.MembershipTypeName === 'General') {
                  this.DisableDiscountPercent = true;
                  //this.EnableDiscountAmount = false;
                }
                else {
                  this.DisableDiscountPercent = false;
                  //this.EnableDiscountAmount = false;
                }
                this.EnableDiscountAmount = false;
              }

              this._changeDetectorRef.detectChanges();
            }
            else if (newBill.ChangeType === "Doctor") {

              if (this.BillingTransaction.BillingTransactionItems.length === 0) {
                this.BillingTransaction.BillingTransactionItems.push(this.OpdBillTxnItem);
              }

              let selDoc = newBill.SelectedDoctor;
              this.SelectedPerformerId = selDoc.PerformerId;
              if (this._visitService.appointmentType.toLowerCase() === ENUM_AppointmentType.referral.toLowerCase()) {
                this.VisitBillItem = this.DoctorOpdReferralPriceItems.find(d => d.PerformerId === selDoc.PerformerId);
              } else {
                this.VisitBillItem = this.DoctorOpdPriceItems.find(d => d.PerformerId === selDoc.PerformerId);
              }

              this.ResetOpdBillTxnItem();
              if (this.VisitBillItem) {
                this.AssignVisitBillItemToTxn(this.VisitBillItem);
                this.NotAdditionalBillItem = { ServiceItemId: this.VisitBillItem.ServiceItemId, ItemName: this.VisitBillItem.ItemName };
              }

            }
            else if (newBill.ChangeType === "Department") {

              if (this.BillingTransaction.BillingTransactionItems.length === 0) {
                this.BillingTransaction.BillingTransactionItems.push(this.OpdBillTxnItem);
              }
              let selDept = newBill.SelectedDepartment;
              this.SelectedDepartmentId = selDept.DepartmentId;
              this.VisitBillItem = this.DepartmentOpdPriceItems.find(d => d.DepartmentId === selDept.DepartmentId);
              this.ResetOpdBillTxnItem();

              if (this.VisitBillItem) {
                this.AssignVisitBillItemToTxn(this.VisitBillItem);
                this.NotAdditionalBillItem = { ServiceItemId: this.VisitBillItem.ServiceItemId, ItemName: this.VisitBillItem.ItemName };
              }
            }
            else if (newBill.ChangeType === "Referral") {
              if (this.OpdBillTxnItem)
                this.OpdBillTxnItem.ReferredById = newBill.ReferredBy;
            }
            this.Calculation();
          }

        }));


    this.VisitBillInfoSubscriptions.add(this._visitService.ObserveSchemeChangedEvent()
      .subscribe((scheme: RegistrationScheme_DTO) => {
        if (scheme && scheme.SchemeId) {
          console.log("ObserveSchemeChangedEvent captured from VisitBillingInfo.Component...");
          console.log(scheme);
          this.RegistrationSchemeDto = scheme;
          this.BillingTransaction.Remarks = this.RegistrationSchemeDto.SchemeName;
          this.BillingTransaction.OrganizationId = this.RegistrationSchemeDto.DefaultCreditOrganizationId;
          if (this.RegistrationSchemeDto.IsCreditOnlyScheme && !this.RegistrationSchemeDto.IsCoPayment) {
            this.DisablePaymentModeDropDown = true;
          } else {
            this.DisablePaymentModeDropDown = false;
          }
          this.Temp_CreditOrgObj_ChangeToId = new CreditOrganization();
          this.Temp_CreditOrgObj_ChangeToId.OrganizationId = scheme.DefaultCreditOrganizationId;
          this.GetServiceItemSchemeSetting(ENUM_ServiceBillingContext.Registration, this.RegistrationSchemeDto.SchemeId);
          this.ReloadOpdPricesItemsToCurrentPriceCategory(scheme.PriceCategoryId);
          if (this.CurrentPriceCategoryId !== scheme.PriceCategoryId) {
            this.FilterVisitAdditionalServiceItems(this.RegistrationSchemeDto.PriceCategoryId);
          }
          this.CurrentPriceCategoryId = scheme.PriceCategoryId;
        }
      }));
  }

  NewBillingTransactionItem(): BillingTransactionItem {
    let billTxnItem = new BillingTransactionItem();
    billTxnItem.PatientId = this._visitService.globalVisit.PatientId;
    billTxnItem.VisitType = ENUM_VisitType.outpatient;
    billTxnItem.Quantity = 1;
    billTxnItem.BillStatus = ENUM_BillingStatus.provisional;
    return billTxnItem;
  }
  public ReloadOpdPricesItemsToCurrentPriceCategory(priceCatId: number): void {
    this.DoctorOpdPriceItems = this._visitService.DocOpdPrices.filter(pr => pr.PriceCategoryId === priceCatId);
    this.DoctorFollowupPrices = this._visitService.DocFollowupPrices.filter(pr => pr.PriceCategoryId === priceCatId);
    this.DoctorOpdOldPatientPriceItems = this._visitService.DocOpdPrice_OldPatient.filter(pr => pr.PriceCategoryId === priceCatId);
    this.DoctorOpdReferralPriceItems = this._visitService.DocOpdPrice_Referral.filter(pr => pr.PriceCategoryId === priceCatId);

    this.DepartmentOpdPriceItems = this._visitService.DeptOpdPrices.filter(pr => pr.PriceCategoryId === priceCatId);
    this.DepartmentFollowupPrices = this._visitService.DeptFollowupPrices.filter(pr => pr.PriceCategoryId === priceCatId);
    this.DepartmentOpdOldPatientPriceItems = this._visitService.DeptOpdPrice_OldPatient.filter(pr => pr.PriceCategoryId === priceCatId);

    this.AssignPriceAccordingToPriceCategory();
  }

  private AssignPriceAccordingToPriceCategory(): void {
    if (this.coreService.EnableDepartmentLevelAppointment()) {
      if (this.BillingTransaction.BillingTransactionItems.length === 0) {
        this.BillingTransaction.BillingTransactionItems.push(this.OpdBillTxnItem);
      }

      this.VisitBillItem = this.DepartmentOpdPriceItems.find(d => d.DepartmentId === this.SelectedDepartmentId);
      this.ResetOpdBillTxnItem();

      if (this.VisitBillItem) {
        this.AssignVisitBillItemToTxn(this.VisitBillItem);
        this.NotAdditionalBillItem = { ServiceItemId: this.VisitBillItem.ServiceItemId, ItemName: this.VisitBillItem.ItemName };
      }
    } else {
      if (this.BillingTransaction.BillingTransactionItems.length === 0) {
        this.BillingTransaction.BillingTransactionItems.push(this.OpdBillTxnItem);
      }

      if (this._visitService.appointmentType.toLowerCase() === ENUM_AppointmentType.referral.toLowerCase()) {
        this.VisitBillItem = this.DoctorOpdReferralPriceItems.find(d => d.PerformerId === this.SelectedPerformerId);
      } else {
        this.VisitBillItem = this.DoctorOpdPriceItems.find(d => d.PerformerId === this.SelectedPerformerId);
      }

      this.ResetOpdBillTxnItem();
      if (this.VisitBillItem) {
        this.AssignVisitBillItemToTxn(this.VisitBillItem);
        this.NotAdditionalBillItem = { ServiceItemId: this.VisitBillItem.ServiceItemId, ItemName: this.VisitBillItem.ItemName };
      }
    }
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.VisitBillInfoSubscriptions.unsubscribe();
    this._visitService.PriceCategory = ENUM_PriceCategory.Normal;
  }
  ngOnInit() {
    this.MstPaymentModes = this.coreService.masterPaymentModes;
    this.PaymentPages = this.coreService.paymentPages;
    //this.InitializeSubscriptions();

    //set values to global variables from visit service
    this.DoctorOpdPriceItems = this._visitService.DocOpdPrices;
    this.DoctorFollowupPrices = this._visitService.DocFollowupPrices;
    this.DoctorOpdOldPatientPriceItems = this._visitService.DocOpdPrice_OldPatient;
    this.DoctorOpdReferralPriceItems = this._visitService.DocOpdPrice_Referral;

    this.DepartmentFollowupPrices = this._visitService.DeptFollowupPrices;

    this.DepartmentOpdPriceItems = this._visitService.DeptOpdPrices;


    this.InitializeBillingTransaction();
    if (this._visitService.appointmentType.toLowerCase() === ENUM_AppointmentType.referral) {
      this.BillingTransaction.Remarks = "Referral Visit";
      this.DoctorOpdPriceItems = this._visitService.DocOpdPrice_Referral
    }

    if (this._visitService.appointmentType.toLowerCase() === ENUM_AppointmentType.followup) {
      this.DepartmentOpdPriceItems = this._visitService.DeptFollowupPrices;
      this.DoctorOpdPriceItems = this._visitService.DocFollowupPrices;
      this.ShowBillSummaryPanel = false;
    }
    else {
      //old patient opd is applicable only when appointment type is not followup.
      let patId = this._visitService.globalVisit.PatientId;
      this.IsOldPatientOpd = false;
      if (patId) {

        let oldPatOpdParam = this.coreService.Parameters.find(p => p.ParameterGroupName === "Appointment" && p.ParameterName === "OldPatientOpdPriceEnabled");
        if (oldPatOpdParam) {
          let enableOldPatOpdPrice = oldPatOpdParam.ParameterValue.toLowerCase() === "true" ? true : false;

          if (enableOldPatOpdPrice) {

            this._visitBLService.GetPatientVisitList(patId)
              .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                  let patVisitList: Array<any> = res.Results;
                  if (patVisitList && patVisitList.length) {
                    this.IsOldPatientOpd = true;
                    //below two variable will be set to OldPatient Opd Prices, and other transaction will happen accordingly.
                    this.DoctorOpdPriceItems = this._visitService.DocOpdPrice_OldPatient;
                    this.DepartmentOpdPriceItems = this._visitService.DeptOpdPrice_OldPatient;
                  }
                }

              });
          }
        }
      }
    }

    //don't check for health card if it's followup appointment.
    if (this._visitService.appointmentType.toLowerCase() !== ENUM_AppointmentType.followup) {
      this.AdditionalBilItems = [];
      let additionalBillItem = this.coreService.Parameters.find(p => p.ParameterGroupName === "Appointment" && p.ParameterName === "AdditionalBillItem");

      if (additionalBillItem && additionalBillItem.ParameterValue) {

        var addBillItem = JSON.parse(additionalBillItem.ParameterValue);
        addBillItem.forEach(a => {
          // var billItem = this.allBillItems.find(b => b.ItemName.trim().toLowerCase() == a.ItemName.trim().toLowerCase());
          var billItem = this.AllBillItems.find(b => b.ServiceDepartmentId === a.ServiceDeptId && b.ItemId === a.ItemId);
          if (billItem) {
            var itemObj = new AdditionalBillItemVMModel();
            itemObj.ItemName = billItem.ItemName;
            itemObj.ItemId = billItem.ItemId;
            itemObj.ServiceItemId = billItem.ServiceItemId;
            itemObj.ServiceDepartmentName = billItem.ServiceDepartmentName;
            itemObj.ServiceDeptId = billItem.ServiceDepartmentId;
            itemObj.Price = billItem.Price;
            itemObj.DiscountApplicable = a.DiscountApplicable;
            itemObj.DefaultForNewPatient = a.DefaultForNewPatient;
            itemObj.PriceChangeEnabled = a.PriceChangeEnabled;
            itemObj.TaxApplicable = a.TaxApplicable;
            itemObj.DefaultForNewPatient = a.DefaultForNewPatient;
            itemObj.ShowProviderName = a.ShowProviderName;
            itemObj.ItmObj = { ItemId: billItem.ItemId, ItemName: billItem.ItemName }
            this.AdditionalBilItems.push(itemObj);
          }
        });

      }
    }


    //by the time it reaches here, appointmentservice would already be disabled.
    if (this._routeFromService && this._routeFromService.RouteFrom && this._routeFromService.RouteFrom === "appointment") {
      this._routeFromService.RouteFrom = "";
      let appointedDoctorId: number = this._appointmentService.globalAppointment.PerformerId;
      if (appointedDoctorId) {
        this._visitService.TriggerBillChangedEvent({ ChangeType: "Doctor", SelectedDoctor: { PerformerId: appointedDoctorId } });
      }
    }

  }

  public InitializeBillingTransaction(): void {
    this.BillingTransaction.CounterId = this._securityService.getLoggedInCounter().CounterId;
    this.BillingTransaction.TaxId = this._billingService.taxId;
    this.BillingTransaction.TransactionType = "outpatient";
    this.BillingTransaction.BillStatus = ENUM_BillingStatus.paid;
  }

  public AssignVisitBillItemToTxn(visBilItm: OpdServiceItemPrice_DTO): void {
    if (this.FreeVisitSettings && (!this.FreeVisitSettings.EnableDepartmentLevelAppointment && !this.FreeVisitSettings.EnableDoctorLevelAppointment) && !this.FreeVisitSettings.EnableFreeVisit) {
      return;
    }
    if (!visBilItm) {
      return;
    }
    this.OpdBillTxnItem.ItemName = visBilItm.ItemName;
    this.OpdBillTxnItem.ItemId = visBilItm.ServiceItemId;//Sud:17Mar'23--This is for Temporary purpose
    this.OpdBillTxnItem.ServiceItemId = visBilItm.ServiceItemId;
    this.OpdBillTxnItem.ItemCode = visBilItm.ItemCode;
    this.OpdBillTxnItem.PriceCategoryId = this.RegistrationSchemeDto.PriceCategoryId;
    this.OpdBillTxnItem.ServiceDepartmentId = visBilItm.ServiceDepartmentId;
    this.OpdBillTxnItem.ServiceDepartmentName = visBilItm.ServiceDepartmentName;
    this.OpdBillTxnItem.PerformerId = visBilItm.PerformerId;
    this.OpdBillTxnItem.PerformerName = visBilItm.PerformerName;
    this.OpdBillTxnItem.PriceCategory = this.RegistrationSchemeDto.PriceCategoryName;
    if (this.FreeVisitSettings.EnableFreeVisit) {

      this.OpdBillTxnItem.Price = 0;
    } else {
      this.OpdBillTxnItem.Price = visBilItm.Price;
    }
    this.OpdBillTxnItem.IsPriceChangeAllowed = visBilItm.IsPriceChangeAllowed;
    this.OpdBillTxnItem.IsZeroPriceAllowed = visBilItm.IsZeroPriceAllowed;//sud:7Apr'21--needed for immunization and other depts where price could be zero.
    this.OpdBillTxnItem.DiscountApplicable = visBilItm.IsDiscountApplicable;
    if (this.ServiceItemSchemeSettings && this.ServiceItemSchemeSettings.length) {
      let matchedItem = this.ServiceItemSchemeSettings.find(a => a.ServiceItemId === this.OpdBillTxnItem.ServiceItemId && a.SchemeId === this.RegistrationSchemeDto.SchemeId);
      if (matchedItem) {
        this.OpdBillTxnItem.IsCoPayment = matchedItem.IsCoPayment;
        this.OpdBillTxnItem.CoPaymentCashPercent = matchedItem.CoPaymentCashPercent;
        this.OpdBillTxnItem.CoPaymentCreditPercent = matchedItem.CoPaymentCreditPercent;
        this.OpdBillTxnItem.DiscountPercent = matchedItem.DiscountPercent;
      }
    }

    this.BillingTransaction.BillingTransactionItems[0] = this.OpdBillTxnItem;
    this.Calculation();
    this.OpdBillTxnItem.IsTaxApplicable = visBilItm.IsTaxApplicable;
    //this.CheckAndAddAdditionalItems();
  }

  public BilcfgItemsVsPriceCategoryMap: Array<any> = new Array<any>();

  public ResetOpdBillTxnItem(): void {
    this.OpdBillTxnItem.Price = 0;
    this.OpdBillTxnItem.SAARCCitizenPrice = 0;
    this.OpdBillTxnItem.ForeignerPrice = 0;
    this.OpdBillTxnItem.ItemId = 0;
    this.OpdBillTxnItem.InsForeignerPrice = 0;
  }

  public Calculation(): void {
    if (this.BillingTransaction && this.BillingTransaction.BillingTransactionItems && this.BillingTransaction.BillingTransactionItems.length > 0) {
      this.BillingTransaction.DiscountAmount = 0;

      if (this.EnableDiscountAmount && !this.IsItemLevelDiscountChanged) {
        this.BillingTransaction.DiscountAmount = this.TotalDiscountAmount;
      }
      this.BillingTransaction.TaxTotal = 0;
      this.BillingTransaction.TaxableAmount = 0;
      this.BillingTransaction.NonTaxableAmount = 0;
      this.BillingTransaction.SubTotal = 0;
      this.BillingTransaction.TotalAmount = 0;
      this.BillingTransaction.Tender = 0;
      this.BillingTransaction.TotalQuantity = 0;
      if (this.AdditionalVisitBilItems && this.AdditionalVisitBilItems.length) {
        this.AdditionalVisitBilItems.forEach(a => {
          if (this.ServiceItemSchemeSettings && this.ServiceItemSchemeSettings.length) {
            let item = this.ServiceItemSchemeSettings.find(a => a.ServiceItemId === a.ServiceItemId && a.SchemeId === this.RegistrationSchemeDto.SchemeId);
            if (item) {
              a.IsCoPayment = item.IsCoPayment;
              a.CoPaymentCashPercent = item.CoPaymentCashPercent;
              a.CoPaymentCreditPercent = item.CoPaymentCreditPercent;
              a.DiscountPercent = item.DiscountPercent;
            }
          }
          if (a.IsDiscountApplicable) {
            a.DiscountAmount = (this.BillingTransaction.DiscountPercent / 100) * a.Price;
          }
          else {
            a.DiscountAmount = 0;
          }
          if (this.BillingTransaction.BillingTransactionItems.every(b => b.ServiceItemId !== a.ServiceItemId)) {
            this.AssignVisitAdditionalServiceItemToTransaction(a);
          }
        });
      }
      if (this.BillingTransaction.DiscountPercent === null) { //to pass discount percent 0 when the input is null --yub 30th Aug '18
        this.BillingTransaction.DiscountPercent = 0;
      }
      this.BillingTransaction.BillingTransactionItems.forEach(billTxnItem => {
        //*Krishna, 16thMarch'23, assign SchemeId and PriceCategory to BillingTransactionItems.
        billTxnItem.DiscountSchemeId = this.RegistrationSchemeDto.SchemeId;
        billTxnItem.PriceCategory = this.RegistrationSchemeDto.PriceCategoryName;
        this.BillingTransaction.TotalQuantity += billTxnItem.Quantity = 1;
        billTxnItem.DiscountAmount = (CommonFunctions.parseAmount((billTxnItem.Price * (billTxnItem.IsItemLevelDiscount ? billTxnItem.DiscountPercent : this.BillingTransaction.DiscountPercent) / 100)));
        this.CalculateDiscountAmount(billTxnItem);
        billTxnItem.DiscountPercent = CommonFunctions.parseAmount(((billTxnItem.DiscountAmount / billTxnItem.Price) * 100), 4);
        billTxnItem.DiscountPercentAgg = CommonFunctions.parseAmount(billTxnItem.DiscountPercent);
        if (billTxnItem.IsTaxApplicable) {
          this.BillingTransaction.TaxTotal +=
            billTxnItem.Tax = CommonFunctions.parseAmount(((billTxnItem.Price - billTxnItem.DiscountAmount) * billTxnItem.TaxPercent) / 100);
          this.BillingTransaction.TaxableAmount +=
            billTxnItem.TaxableAmount = CommonFunctions.parseAmount(billTxnItem.Price - billTxnItem.DiscountAmount);
        }
        else {
          this.BillingTransaction.NonTaxableAmount +=
            billTxnItem.NonTaxableAmount = CommonFunctions.parseAmount(billTxnItem.Price - billTxnItem.DiscountAmount);
        }
        this.BillingTransaction.SubTotal +=
          billTxnItem.SubTotal = CommonFunctions.parseAmount(billTxnItem.Price);
        this.BillingTransaction.TotalAmount +=
          billTxnItem.TotalAmount = CommonFunctions.parseAmount(billTxnItem.SubTotal - billTxnItem.DiscountAmount + billTxnItem.Tax);
        billTxnItem.IsItemLevelDiscount = false;
      });
      this.CalculateInvoiceDiscountPercent(); //* Sanjeev, 4thSept'23, This will calculate invoice Discount Percent if Discount is given from Item level or Invoice Discount Amount else this will not calculate.

      this.CalculateCoPayAndReceivedAmount();

      // this.billingTransaction.Tender = CommonFunctions.parseAmount(this.billingTransaction.TotalAmount);
      this.IsItemLevelDiscountChanged = false;
    }
    else {
      return;
    }
  }


  private CalculateInvoiceDiscountPercent(): void {
    if (!this.EnableDiscountAmount && this.IsItemLevelDiscountChanged) {
      const invoiceDiscountAmount = this.BillingTransaction.DiscountAmount;
      const invoiceSubTotal = this.BillingTransaction.SubTotal;
      const invoiceDiscountPercent = (invoiceDiscountAmount * 100) / invoiceSubTotal;
      this.BillingTransaction.DiscountPercent = CommonFunctions.parseAmount(invoiceDiscountPercent, 4);
    }

    if (this.EnableDiscountAmount) {
      const invoiceDiscountAmount = this.BillingTransaction.DiscountAmount;
      const invoiceSubTotal = this.BillingTransaction.SubTotal;
      const invoiceDiscountPercent = (invoiceDiscountAmount * 100) / invoiceSubTotal;
      this.BillingTransaction.DiscountPercent = CommonFunctions.parseAmount(invoiceDiscountPercent, 4);
    }
  }

  private CalculateCoPayAndReceivedAmount() {
    if (this.RegistrationSchemeDto.IsCoPayment) {
      // this.billingTransaction.ReceivedAmount = (this.PriceCategorySelectedToChangePrice.Copayment_CashPercent / 100) * this.billingTransaction.TotalAmount;
      // this.billingTransaction.CoPaymentCreditAmount = this.billingTransaction.TotalAmount - this.billingTransaction.ReceivedAmount;
      this.BillingTransaction.BillingTransactionItems.forEach((item) => {
        item.CoPaymentCashAmount = (item.CoPaymentCashPercent / 100) * item.TotalAmount;
        item.CoPaymentCreditAmount = (item.CoPaymentCreditPercent / 100) * item.TotalAmount;
      });
      this.BillingTransaction.ReceivedAmount = this.BillingTransaction.BillingTransactionItems.reduce((acc, curr) => acc + curr.CoPaymentCashAmount, 0);
      this.BillingTransaction.CoPaymentCreditAmount = this.BillingTransaction.BillingTransactionItems.reduce((acc, curr) => acc + curr.CoPaymentCreditAmount, 0);
    } else {
      this.BillingTransaction.ReceivedAmount = this.BillingTransaction.TotalAmount;
    }
    this.BillingTransaction.Tender = CommonFunctions.parseAmount(this.BillingTransaction.ReceivedAmount);
  }

  public CalculateDiscountAmount(billTxnItem: BillingTransactionItem): void {
    if (!this.EnableDiscountAmount || (this.EnableDiscountAmount && billTxnItem.IsItemLevelDiscount)) {
      this.BillingTransaction.DiscountAmount += billTxnItem.DiscountAmount;
      this.TotalDiscountAmount = this.BillingTransaction.DiscountAmount;
    }
  }

  public PaymentModeChanged(): void {
    this.BillingTransaction.BillStatus = this.OpdBillTxnItem.BillStatus = this.BillingTransaction.BillStatus = this.BillingTransaction.PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit.toLowerCase() ? ENUM_BillingStatus.unpaid : ENUM_BillingStatus.paid; //  "unpaid" : "paid";
    this.BillingTransaction.Change = 0;
    if ((!this.RegistrationSchemeDto.IsCoPayment) && this.BillingTransaction.PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit.toLowerCase()) {
      this.BillingTransaction.Tender = 0;//tender is zero and is disabled in when credit and not CoPayment
      this.BillingTransaction.Change = 0;
      this.BillingTransaction.ReceivedAmount = 0;
      this.TenderChanged.emit(this.BillingTransaction.PaymentMode); // Emit the value to the visit-patient-info
    }


    if (this.BillingTransaction.BillStatus === ENUM_BillingStatus.paid) {
      this.BillingTransaction.PaymentDetails = null;
      this.BillingTransaction.BillingTransactionItems.forEach(a => {
        a.BillStatus = ENUM_BillingStatus.paid;
      });
      this.CalculateCoPayAndReceivedAmount();
    } else {

      this.BillingTransaction.BillingTransactionItems.forEach(a => {
        a.BillStatus = ENUM_BillingStatus.unpaid;
      });
    }


    if (!this.BillingTransaction.EmployeeCashTransaction.length && (this.BillingTransaction.PaymentMode.toLowerCase() !== ENUM_BillPaymentMode.credit.toLowerCase() || this.RegistrationSchemeDto.IsCoPayment === true)) {
      this.BillingTransaction.EmployeeCashTransaction = [];
      let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() == this.BillingTransaction.PaymentMode.toLocaleLowerCase());
      let empCashTxnObj = new EmployeeCashTransaction();
      empCashTxnObj.InAmount = this.BillingTransaction.ReceivedAmount;
      empCashTxnObj.OutAmount = 0;
      empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
      empCashTxnObj.ModuleName = "Appointment";
      this.BillingTransaction.EmployeeCashTransaction.push(empCashTxnObj);
    }
  }

  public HandleBillChangedForFollowUp(newBill): void {

    let oldDepartmentId = this._visitService.ParentVisitInfo.DepartmentId;
    let oldDoctorId = this._visitService.ParentVisitInfo.PerformerId;

    let newDepartmentId = this._visitService.globalVisit.DepartmentId;
    let newDoctorId = this._visitService.globalVisit.PerformerId;


    if (newDepartmentId && oldDepartmentId !== newDepartmentId) {
      this.ShowBillSummaryPanel = true;

      if (newDoctorId && oldDoctorId !== newDoctorId) {
        this.Followup_DoctorChanged(newDoctorId);
      }
      else {
        this.Followup_DepartmentChanged(newDepartmentId);
      }

    }
    else if (this.PriceCategory !== "Normal") {
      this.ShowBillSummaryPanel = true;

      if (newDoctorId && oldDoctorId !== newDoctorId) {
        this.Followup_DoctorChanged(newDoctorId);
      }
      else {
        this.Followup_DepartmentChanged(newDepartmentId);
      }
    }
    else {
      this.ShowBillSummaryPanel = false;
    }

    this.Calculation();
  }//end of: HandleBillChangedForFollowUp

  public Followup_DoctorChanged(newDoctorId): void {
    if (this.BillingTransaction && this.BillingTransaction.BillingTransactionItems.length) {
      this.VisitBillItem = this.DoctorOpdPriceItems.find(d => d.PerformerId === newDoctorId);
      this.ResetOpdBillTxnItem();
      if (this.VisitBillItem) {
        this.AssignVisitBillItemToTxn(this.VisitBillItem);
        this.NotAdditionalBillItem = { ServiceItemId: this.VisitBillItem.ServiceItemId, ItemName: this.VisitBillItem.ItemName };
      }
    }

  }

  public Referral_DoctorChanged(newDoctorId): void {
    if (this.BillingTransaction && this.BillingTransaction.BillingTransactionItems.length) {
      this.VisitBillItem = this.DoctorOpdReferralPriceItems.find(d => d.PerformerId === newDoctorId);
      this.ResetOpdBillTxnItem();
      if (this.VisitBillItem) {
        this.AssignVisitBillItemToTxn(this.VisitBillItem);
        this.NotAdditionalBillItem = { ServiceItemId: this.VisitBillItem.ServiceItemId, ItemName: this.VisitBillItem.ItemName };
      }
    }

  }

  public Followup_DepartmentChanged(newDepartmentId): void {
    this.ResetOpdBillTxnItem();
    this.VisitBillItem = this.DepartmentOpdPriceItems.find(d => d.DepartmentId === newDepartmentId);
    if (this.VisitBillItem) {
      this.AssignVisitBillItemToTxn(this.VisitBillItem);
      this.NotAdditionalBillItem = { ServiceItemId: this.VisitBillItem.ServiceItemId, ItemName: this.VisitBillItem.ItemName };
    }
  }

  public ChangeTenderAmount(): void {

    // this.billingTransaction.Change = this.billingTransaction.Tender - (this.billingTransaction.TotalAmount ? this.billingTransaction.TotalAmount : this.totalAmount);
    this.BillingTransaction.Change = this.BillingTransaction.Tender - (this.BillingTransaction.ReceivedAmount ? this.BillingTransaction.ReceivedAmount : this.BillingTransaction.ReceivedAmount);
  }

  public PaymentModeChanges($event): void {
    this.BillingTransaction.PaymentMode = $event.PaymentMode.toLowerCase();
    if (this.BillingTransaction.PaymentMode.toLocaleLowerCase() !== ENUM_BillPaymentMode.credit) {
      this.BillingTransaction.PaymentMode = ENUM_BillPaymentMode.cash;
    }
    else {
      this.BillingTransaction.PaymentMode = ENUM_BillPaymentMode.credit;
    }

    if (this.RegistrationSchemeDto.IsCoPayment) {
      this.BillingTransaction.IsCoPayment = true;
      this.BillingTransaction.PaymentMode = ENUM_BillPaymentMode.credit;
    }

    this.BillingTransaction.PaymentDetails = $event.PaymentDetails;

    this.PaymentModeChanged();
  }

  public CreditOrganizationChanges($event): void {
    if ($event) {
      this.BillingTransaction.OrganizationName = $event.OrganizationName;
      this.BillingTransaction.OrganizationId = $event.OrganizationId;
    }
  }

  public AdditionalBillItemsCheckboxChanged(): void {
    if (this.AllowAdditionalBillItems === false) {
      this.RemoveAdditionalBillItemsFromBillingTxn();
    }
    else if (this.AdditionalBilItems && this.AdditionalBilItems.length > 0) {
      this.BilcfgItemsVsPriceCategoryMap = this._billingService.BillItemsVsPriceCategoryMapping;
      if (this.RegistrationSchemeDto.IsCoPayment) {
        this.AdditionalBilItems.forEach(item => {
          if (item.DefaultForNewPatient) {
            var defaultRow = new AdditionalBillItemVMModel();
            defaultRow.ServiceDeptId = item.ServiceDeptId;
            defaultRow.ServiceDepartmentName = item.ServiceDepartmentName;
            defaultRow.ItemName = item.ItemName;
            defaultRow.ItemId = item.ItemId;
            defaultRow.Price = item.Price;
            defaultRow.DefaultForNewPatient = item.DefaultForNewPatient;
            defaultRow.DiscountApplicable = item.DiscountApplicable;
            defaultRow.PriceChangeEnabled = item.PriceChangeEnabled;
            defaultRow.TaxApplicable = item.TaxApplicable;
            defaultRow.ItmObj = item.ItmObj;
            defaultRow.ShowProviderName = item.ShowProviderName;
            this.AdditionBillItemList.push(defaultRow);
            this.Calculation();
          }
          else {
            this.AddNewBillTxnItemRow();
          }

        });
      }
      else {
        this.AdditionalBilItems.forEach(item => {
          if (item.DefaultForNewPatient) {
            var defaultRow = new AdditionalBillItemVMModel();
            defaultRow.ServiceDeptId = item.ServiceDeptId;
            defaultRow.ServiceDepartmentName = item.ServiceDepartmentName;
            defaultRow.ItemName = item.ItemName;
            defaultRow.ItemId = item.ItemId;
            defaultRow.Price = item.Price;
            defaultRow.DefaultForNewPatient = item.DefaultForNewPatient;
            defaultRow.DiscountApplicable = item.DiscountApplicable;
            defaultRow.PriceChangeEnabled = item.PriceChangeEnabled;
            defaultRow.TaxApplicable = item.TaxApplicable;
            defaultRow.ItmObj = item.ItmObj;
            defaultRow.ShowProviderName = item.ShowProviderName;
            this.AdditionBillItemList.push(defaultRow);

            this.Calculation();
          }
          else {
            this.AddNewBillTxnItemRow();
          }

        });
      }
    }
  }

  public RemoveAdditionalBillItemsFromBillingTxn(): void {
    this.AdditionBillItemList = [];

    //Sud:15Mar'23--Keep only OpdBillingItems and remove other (Additional Bill Items)
    this.BillingTransaction.BillingTransactionItems = this.BillingTransaction.BillingTransactionItems
      .filter(itm =>
        itm.ItemId === this.NotAdditionalBillItem.ServiceItemId
        && itm.ItemName === this.NotAdditionalBillItem.ItemName
      );

    this.Calculation();
    return;
  }

  //used to format the display of item in ng-autocomplete.
  public AdditionalItemListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }

  public OnAdditionalItemRowRemoved(row, index): void {

    this.AdditionBillItemList.splice(index, 1);

    let indx = this.BillingTransaction.BillingTransactionItems.findIndex(a => a.ItemId === row.ItemId && a.ItemName === row.ItemName);
    if (indx > -1) {
      this.BillingTransaction.BillingTransactionItems.splice(indx, 1);
    }
    this.Calculation();

    if (this.AdditionBillItemList.length < 1) {
      this.AllowAdditionalBillItems = false;
    }
  }

  public AddNewBillTxnItemRow(): void {
    if (this.AdditionalBilItems.length > this.AdditionBillItemList.length) {
      let newRow: AdditionalBillItemVMModel = new AdditionalBillItemVMModel();
      newRow.DefaultForNewPatient = false;
      newRow.DiscountApplicable = false;
      newRow.ItemId = 0;
      newRow.ItemName = '';
      newRow.PriceChangeEnabled = false;
      newRow.ServiceDeptId = 0;
      newRow.TaxApplicable = false;
      newRow.ItmObj = null;
      this.AdditionBillItemList.push(newRow);
    }
    else {
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Unable Add more rows"]);
    }
  }

  public OnAdditionalItemPriceChanged(row): void {
    if (row.DiscountApplicable)
      row.DiscountAmount = (this.BillingTransaction.DiscountPercent / 100) * row.Price;
    else
      row.DiscountAmount = 0;

    row.TotalAmount = row.Price - row.DiscountAmount;

    var itm = this.BillingTransaction.BillingTransactionItems.find(a => a.ItemId === row.ItemId && a.ItemName === row.ItemName);
    itm.DiscountAmount = row.DiscountAmount;
    itm.DiscountPercent = this.BillingTransaction.DiscountPercent
    itm.Price = row.Price;
    itm.SubTotal = itm.Quantity * row.Price;
    itm.TotalAmount = row.TotalAmount;


    this.Calculation();

  }

  public ItemChange(row, indx): void {
    var additionalItemObj = this.AdditionalBilItems.find(a => a.ItemId === row.ItmObj.ItemId && a.ItemName === row.ItmObj.ItemName);
    if (additionalItemObj) {
      if (this.AdditionBillItemList.some(a => a.ItemId === additionalItemObj.ItemId && a.ItemName === additionalItemObj.ItemName) ? true : false) {
        this._messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Duplicate Additional bill Item"]);
      }
      else {
        row.ServiceDeptId = additionalItemObj.ServiceDeptId;
        row.ServiceDepartmentName = additionalItemObj.ServiceDepartmentName;
        row.ItemId = additionalItemObj.ItemId;
        row.ItemName = additionalItemObj.ItemName;
        row.Price = additionalItemObj.Price;
        row.DiscountApplicable = additionalItemObj.DiscountApplicable;
        row.DefaultForNewPatient = additionalItemObj.DefaultForNewPatient;
        row.PriceChangeEnabled = additionalItemObj.PriceChangeEnabled;
        row.TaxApplicable = additionalItemObj.TaxApplicable;
      }
    }
    else {
      row.ItemId = null;
      row.ItemName = null;
      row.ServiceDeptId = null;
      row.ItmObj = null;
      row.Price = 0;
      row.TotalAmount = 0;
      row.DiscountAmount = 0;


    }
    this.Calculation();
  }

  public IsPriceChangeAllowed: boolean = false;
  public AssignAdditionalBillItemToBillTxn(row: AdditionalBillItemVMModel): void {
    if (row.ItemId && row.ItemName && (this.BillingTransaction.BillingTransactionItems.some(a => a.ItemId === row.ItemId && a.ItemName === row.ItemName) ? false : true)) {
      let billItem = new BillingTransactionItem();
      billItem.ServiceDepartmentId = row.ServiceDeptId;
      billItem.ServiceDepartmentName = row.ServiceDepartmentName;
      billItem.ItemName = row.ItemName;
      billItem.ItemId = row.ItemId;
      billItem.Price = row.Price;
      billItem.IsPriceChangeAllowed = row.PriceChangeEnabled;
      billItem.IsTaxApplicable = row.TaxApplicable;
      billItem.DiscountApplicable = row.DiscountApplicable;
      billItem.PatientId = this.BillingTransaction.PatientId;
      billItem.CounterId = this.BillingTransaction.CounterId;
      billItem.TaxPercent = this._billingService.taxPercent;
      billItem.BillingType = ENUM_BillingType.outpatient;// "outpatient";
      billItem.VisitType = ENUM_VisitType.outpatient;// "outpatient";
      billItem.BillStatus = this.BillingTransaction.BillStatus;
      billItem.CoPaymentCashAmount = (row.CoPaymentCashPercent / 100) * row.TotalAmount;
      billItem.CoPaymentCreditAmount = (row.CoPaymentCreditPercent / 100) * row.TotalAmount;

      billItem.ShowProviderName = row.ShowProviderName;
      if (billItem.ShowProviderName) {
        billItem.PerformerId = this.OpdBillTxnItem ? this.OpdBillTxnItem.PerformerId : null;
        billItem.PerformerName = this.OpdBillTxnItem ? this.OpdBillTxnItem.PerformerName : null;
      }

      billItem.PrescriberId = this.OpdBillTxnItem.PrescriberId;
      billItem.PrescriberName = this.OpdBillTxnItem.PrescriberName;
      this.BillingTransaction.BillingTransactionItems.push(billItem);
    } else {

      this.BillingTransaction.BillingTransactionItems.forEach(a => {
        if (a.ShowProviderName) {
          a.PerformerId = this.OpdBillTxnItem.PerformerId;
          a.PerformerName = this.OpdBillTxnItem.PerformerName;
        }
      });
    }
  }

  public GetBillingItems(): void {
    this.AllBillItems = this._visitService.allBillItemsPriceList;
  }

  public SetFocusById(IdToBeFocused: string): void {
    window.setTimeout(function () {
      let elemToFocus = document.getElementById(IdToBeFocused)
      if (elemToFocus !== null && elemToFocus !== undefined) {
        elemToFocus.focus();
      }
    }, 100);
  }

  public GetShowAdditionalBillItemParameter(): boolean {
    var show = this.coreService.Parameters.find((val) =>
      val.ParameterName === "ShowAdditionalBillItemCheckBox" &&
      val.ParameterGroupName === "Visit"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val === "true") {
        this.ShowAdditionalBillItemPanel = true;
      } else {
        this.ShowAdditionalBillItemPanel = false;
      }
    } else {
      return false;
    }
  }

  public MultiplePaymentCallBack($event): void {
    if ($event && $event.MultiPaymentDetail) {
      this.BillingTransaction.EmployeeCashTransaction = [];
      this.BillingTransaction.EmployeeCashTransaction = $event.MultiPaymentDetail;
      this.BillingTransaction.PaymentDetails = $event.PaymentDetail
    }
  }

  public ReceivedAmountChange(): void {
    if (this.checkValidationForReceivedAmount()) {
      this.BillingTransaction.CoPaymentCreditAmount = this.BillingTransaction.TotalAmount - this.BillingTransaction.ReceivedAmount;
      this.BillingTransaction.CoPaymentCreditAmount = CommonFunctions.parseAmount(this.BillingTransaction.CoPaymentCreditAmount, 3);
      this.BillingTransaction.Tender = this.BillingTransaction.ReceivedAmount;
    }
  }

  public checkValidationForReceivedAmount(): boolean {
    let isValidAmount = true;
    let ReceivedAmount = this.BillingTransaction.ReceivedAmount;
    if (ReceivedAmount < 0) {
      isValidAmount = false;
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Cash cannot be less than 0!"]);
    }
    if (ReceivedAmount > this.BillingTransaction.TotalAmount) {
      isValidAmount = false;
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Cash cannot be more than TotalAmount!"]);
    }
    // if (this.registrationSchemeDto.IsCoPayment) {
    //   let CoPaymentCashAmount = (this.registrationSchemeDto.Copayment_CashPercent / 100) * this.billingTransaction.TotalAmount;
    //   if (ReceivedAmount < CoPaymentCashAmount) {
    //     isValidAmount = false;
    //     this.msgBoxServ.showMessage("Error", ["Cash cannot be less than CoPaymentCash Amount!"]);
    //   }
    // }
    return isValidAmount;
  }

  //* Krishna, 17thMarch'23 This will make a call to API to fetch only serviceItemSchemeSetting not the item iteself.
  public GetServiceItemSchemeSetting(serviceBillingContext: string, schemeId: number): void {
    this._billingMasterBlService.GetServiceItemSchemeSetting(serviceBillingContext, schemeId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length > 0) {
          this.ServiceItemSchemeSettings = res.Results;
          //this.MapServiceItemSchemeSettingsToServiceItems(this.ServiceItemSchemeSettings);
        } else {
          console.log("This scheme and context does not have Settings mapped");
        }
      },
        err => {
          console.log(err);
        }
      );
  }

  public MapServiceItemSchemeSettingsToServiceItems(serviceItemSchemeSetting: Array<ServiceItemSchemeSetting_DTO>): void {
    if (serviceItemSchemeSetting && serviceItemSchemeSetting.length) {
      this.BillingTransaction.BillingTransactionItems.forEach((item) => {
        const matchedServiceItem = serviceItemSchemeSetting.find(a => a.ServiceItemId === item.ServiceItemId);
        if (matchedServiceItem) {
          item.DiscountSchemeId = matchedServiceItem.SchemeId;
          item.DiscountPercent = matchedServiceItem.DiscountPercent;
          item.IsCoPayment = matchedServiceItem.IsCoPayment;
          item.CoPaymentCashPercent = matchedServiceItem.CoPaymentCashPercent;
          item.CoPaymentCreditPercent = matchedServiceItem.CoPaymentCreditPercent;
        }
      });
      this.BillingTransaction.BillingTransactionItems = this.BillingTransaction.BillingTransactionItems.slice();
    }
  }

  public GetVisitAdditionalServiceItems(): void {
    this._billingMasterBlService.GetVisitAdditionalServiceItems(ENUM_AdditionalServiceItemGroups.VisitAdditionalItems)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results && res.Results.length > 0) {
            this.VisitAdditionalServiceItems = res.Results
            this.FilterVisitAdditionalServiceItems(this.RegistrationSchemeDto.PriceCategoryId);
          }
        }
      },
        (err: DanpheHTTPResponse) => {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error: ${err.ErrorMessage}`]);
        }
      );
  }

  public FilterVisitAdditionalServiceItems(priceCategoryId: number): void {
    this.FilteredVisitAdditionalServiceItems.forEach(item => {
      let index = this.BillingTransaction.BillingTransactionItems.findIndex(a => a.ServiceItemId === item.ServiceItemId);
      if (index >= 0) {
        this.BillingTransaction.BillingTransactionItems.splice(index, 1);
      }
    });
    this.AdditionalVisitBilItems = [];
    this.Calculation();
    this.FilteredVisitAdditionalServiceItems = this.VisitAdditionalServiceItems.filter(a => a.PriceCategoryId === priceCategoryId);
  }

  public HandleAdditionalServiceItemCheckUncheck(item: BillingAdditionalServiceItem_DTO): void {
    if (item) {
      if (item.IsSelected) {
        // if (this.billingTransaction.BillingTransactionItems.every(a => a.ServiceItemId !== item.ServiceItemId)) {
        //   this.AssignVisitAdditionalServiceItemToTransaction(item);
        // }
        if (this.AdditionalVisitBilItems.every(a => a.ServiceItemId !== item.ServiceItemId)) {
          this.AdditionalVisitBilItems.push(item);
        }
      }
      else {
        let index = this.BillingTransaction.BillingTransactionItems.findIndex(a => a.ServiceItemId === item.ServiceItemId);
        if (index >= 0) {
          this.BillingTransaction.BillingTransactionItems.splice(index, 1);
        }
        let indexAdditionItem = this.AdditionalVisitBilItems.findIndex(a => a.ServiceItemId === item.ServiceItemId);
        if (indexAdditionItem >= 0) {
          this.AdditionalVisitBilItems.splice(indexAdditionItem, 1);
        }
      }
      this.Calculation();
    }
  }

  public AssignVisitAdditionalServiceItemToTransaction(row: BillingAdditionalServiceItem_DTO): void {
    let billItem = new BillingTransactionItem();
    billItem.ServiceDepartmentId = row.ServiceDepartmentId;
    billItem.ServiceDepartmentName = row.ServiceDepartmentName;
    billItem.ItemName = row.ItemName;
    billItem.ServiceItemId = row.ServiceItemId;
    billItem.Price = billItem.SubTotal = row.Price;
    billItem.IsTaxApplicable = row.IsTaxApplicable;
    billItem.DiscountApplicable = row.IsDiscountApplicable;
    billItem.DiscountAmount = row.DiscountAmount;
    billItem.TotalAmount = billItem.SubTotal - billItem.DiscountAmount;
    billItem.PatientId = this.BillingTransaction.PatientId;
    billItem.CounterId = this.BillingTransaction.CounterId;
    billItem.TaxPercent = this._billingService.taxPercent;
    billItem.BillingType = ENUM_BillingType.outpatient;
    billItem.VisitType = ENUM_VisitType.outpatient;
    billItem.BillStatus = this.BillingTransaction.BillStatus;
    billItem.IsCoPayment = row.IsCoPayment;
    billItem.ItemCode = row.ItemCode;
    billItem.CoPaymentCashAmount = (row.CoPaymentCashPercent / 100) * row.Price;
    billItem.CoPaymentCreditAmount = (row.CoPaymentCreditPercent / 100) * row.Price;
    if (billItem.ShowProviderName) {
      billItem.PerformerId = this.OpdBillTxnItem ? this.OpdBillTxnItem.PerformerId : null;
      billItem.PerformerName = this.OpdBillTxnItem ? this.OpdBillTxnItem.PerformerName : null;
    }
    billItem.PrescriberId = this.OpdBillTxnItem.PrescriberId;
    billItem.PrescriberName = this.OpdBillTxnItem.PrescriberName;
    billItem.PriceCategoryId = this.RegistrationSchemeDto.PriceCategoryId;
    this.BillingTransaction.BillingTransactionItems.push(billItem);
  }

  public SetFocusToRemarksOrButton(): void {
    const isRemarksMandatory = (this.BillingTransaction.DiscountPercent || this.BillingTransaction.IsInsuranceBilling || this.BillingTransaction.PaymentMode == 'credit');
    if (isRemarksMandatory) {
      this.coreService.FocusInputById("id_billing_remarks", 100);
    } else {
      this.coreService.FocusInputById("btnPrintInvoice", 100);

    }
  }

  public OnDiscountAmountCheckBoxChange(): void {
    if (this.EnableDiscountAmount) {
      this.DisableDiscountPercent = true;
    }
    else {
      this.DisableDiscountPercent = false;
    }
  }

  public OnItemLevelDiscountChange(billItem: BillingTransactionItem) {
    this.IsItemLevelDiscountChanged = true;
    billItem.IsItemLevelDiscount = true;
    if (this.EnableDiscountAmount) {
      billItem.DiscountPercent = CommonFunctions.parseAmount(((billItem.DiscountAmount / billItem.Price) * 100), 4);
    }
    else {
      billItem.DiscountAmount = CommonFunctions.parseAmount(((billItem.DiscountPercent / 100) * billItem.Price));
      billItem.TotalAmount = billItem.Price - billItem.DiscountAmount;
    }
    this.Calculation();

  }

  public OnInvoiceDiscountAmountChanged(): void {
    this.BillingTransaction.DiscountPercent = CommonFunctions.parseAmount(((this.TotalDiscountAmount / this.BillingTransaction.SubTotal) * 100), 4);
    this.Calculation();
  }
}
