
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Subscription } from 'rxjs';
import { BillingMasterBlService } from "../../billing/shared/billing-master.bl.service";
import { BillingTransactionItem } from "../../billing/shared/billing-transaction-item.model";
import { BillingTransaction, EmployeeCashTransaction } from "../../billing/shared/billing-transaction.model";
import { BillingBLService } from '../../billing/shared/billing.bl.service';
import { BillingService } from "../../billing/shared/billing.service";
import { BillingAdditionalServiceItem_DTO } from "../../billing/shared/dto/bill-additional-service-item.dto";
import { OpdServiceItemPrice_DTO } from "../../billing/shared/dto/opd-serviceitem-price.dto";
import { RegistrationScheme_DTO } from "../../billing/shared/dto/registration-scheme.dto";
import { ServiceItemSchemeSetting_DTO } from "../../billing/shared/dto/service-item-scheme-setting.dto";
import { CoreService } from '../../core/shared/core.service';
import { PatientService } from "../../patients/shared/patient.service";
import { SecurityService } from "../../security/shared/security.service";
import { CreditOrganization } from "../../settings-new/shared/creditOrganization.model";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { CommonFunctions } from "../../shared/common.functions";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { ENUM_AdditionalServiceItemGroups, ENUM_AppointmentType, ENUM_BillPaymentMode, ENUM_BillingStatus, ENUM_BillingType, ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status, ENUM_PriceCategory, ENUM_ServiceBillingContext, ENUM_VisitType } from "../../shared/shared-enums";
import { AppointmentService } from "../shared/appointment.service";
import { VisitBLService } from "../shared/visit.bl.service";
import { VisitService } from "../shared/visit.service";


@Component({
  selector: "visit-billing-info",
  templateUrl: "./visit-billing-info.html",
  styleUrls: ['./visit-common.css']
})
export class VisitBillingInfoComponent implements OnInit {

  public visitBillInfoSubscriptions: Subscription = new Subscription();

  @Input("billing-transaction")
  public billingTransaction: BillingTransaction;

  public visitBillItem: OpdServiceItemPrice_DTO;

  public allBillItems: Array<any> = [];//pratik: 13july2020

  public opdBillTxnItem: BillingTransactionItem = new BillingTransactionItem();

  public allowAdditionalBillItems: boolean = false;
  //public disableAddHealthCard: boolean = false;
  public priceCategory: string = ENUM_PriceCategory.Normal;
  public showBillSummaryPanel: boolean = true;//sud:26June'19--incase of followup we may not have to show billSummary panel.

  public AdditionalBilItems: Array<AdditionalBillItemVMModel> = [];
  public AdditionBillItemList: Array<AdditionalBillItemVMModel> = [];
  public NotAdditionalBillItem = { ServiceItemId: 0, ItemName: null };
  public showAdditionalBillItemPanel: boolean = false;
  PaymentPages: any[];
  MstPaymentModes: any[];

  public docOpdPriceItems: Array<OpdServiceItemPrice_DTO> = [];
  public docFollowupPrices: Array<OpdServiceItemPrice_DTO> = [];
  public docOpdOldPatientPriceItems: Array<OpdServiceItemPrice_DTO> = [];
  public docOpdReferralPriceItems: Array<OpdServiceItemPrice_DTO> = [];

  public deptOpdPriceItems = [];
  public deptFollowupPrices = [];
  public deptOpdOldPatientPriceItems = [];

  public isOldPatientOpd: boolean = false;
  public DisableDiscountPercent: boolean = false;
  public MembershipTypeName: string = null;
  public selectedMembershipTypeId: number = 0;
  public temp_CreditOrgObj_ChangeToId: CreditOrganization = new CreditOrganization();
  public registrationSchemeDto: RegistrationScheme_DTO = new RegistrationScheme_DTO();
  public DisablePaymentModeDropDown: boolean = false;
  public selectedDepartmentId: number = null;
  public selectedPerformerId: number = null;
  public ServiceItemSchemeSettings: Array<ServiceItemSchemeSetting_DTO> = new Array<ServiceItemSchemeSetting_DTO>();
  public visitAdditionalServiceItems: Array<BillingAdditionalServiceItem_DTO> = new Array<BillingAdditionalServiceItem_DTO>();
  public filteredVisitAdditionalServiceItems: Array<BillingAdditionalServiceItem_DTO> = new Array<BillingAdditionalServiceItem_DTO>();
  public AdditionalVisitBilItems: Array<BillingAdditionalServiceItem_DTO> = [];
  public currentPriceCategoryId: number = 0;
  constructor(public billingService: BillingService,
    public securityService: SecurityService,
    public visitService: VisitService,
    public visitBLService: VisitBLService,
    public coreService: CoreService,
    public messageBoxService: MessageboxService,
    public BillingBLService: BillingBLService,
    public routeFromService: RouteFromService,
    public appointmentService: AppointmentService,
    public changeDetectorRef: ChangeDetectorRef,
    public patientService: PatientService,
    public billingMasterBlService: BillingMasterBlService) {

    this.InitializeSubscriptions();
    this.PatientAgeSubscription();
    this.GetShowAdditionalBillItemParameter();

    this.GetBillingItems();
    this.GetVisitAdditionalServiceItems();
  }

  PatientAgeSubscription() {
    this.visitBillInfoSubscriptions.add(this.visitService.ObservePatientAgeChangeEvent().subscribe(age => {
      if (age > 0) {
        //this.HandleAdditionalServiceItemCheckUncheck();
        const param = this.coreService.Parameters.find(a => a.ParameterGroupName === 'Appointment' && a.ParameterName === 'AutoAddServiceItemForChild');
        if (param) {
          const paramValue = JSON.parse(param.ParameterValue);
          if (this.visitAdditionalServiceItems && this.visitAdditionalServiceItems.length) {
            const serviceItem = this.visitAdditionalServiceItems.find(a => a.ServiceItemId === +paramValue.ServiceItemId);
            if (age <= +paramValue.Age) {
              if (serviceItem) {
                serviceItem.IsSelected = true;
                this.filteredVisitAdditionalServiceItems.forEach(a => {
                  if (a.ServiceItemId === serviceItem.ServiceItemId) {
                    a.IsSelected = true;
                  }
                });
              }
              this.HandleAdditionalServiceItemCheckUncheck(serviceItem);
            } else {
              if (serviceItem) {
                serviceItem.IsSelected = false;
                this.filteredVisitAdditionalServiceItems.forEach(a => {
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
    }))
  }

  public InitializeSubscriptions(): void {
    //Billing component is subscribing to NeedBillRecalculation event of Visit Service,
    //Patient and Doctor selection will trigger that event.
    this.visitBillInfoSubscriptions.add(

      this.visitService.ObserveBillChanged.subscribe(
        newBill => {

          if (this.visitService.appointmentType.toLowerCase() === ENUM_AppointmentType.followup) {
            this.HandleBillChangedForFollowUp(newBill);
          }
          else {
            if (newBill.ChangeType === "Membership") {

              if (newBill) {
                this.selectedMembershipTypeId = newBill.MembershipTypeId;
                //show membershipname as remarks when discountpercent>0
                if (newBill.DiscountPercent && newBill.DiscountPercent > 0) {
                  this.billingTransaction.Remarks = newBill.MembershipTypeName;
                  //this.MembershipTypeName = newBill.MembershipTypeName;
                  //this.billingTransaction.BillingTransactionItems.forEach(a => {
                  //  a.DiscountSchemeId = newBill.MembershipTypeId;
                  //});
                }
                else {
                  this.billingTransaction.Remarks = null;
                }

                this.MembershipTypeName = newBill.MembershipTypeName;
                this.billingTransaction.BillingTransactionItems.forEach(a => {
                  a.DiscountSchemeId = newBill.MembershipTypeId;
                });
                this.billingTransaction.DiscountPercent = newBill.DiscountPercent ? newBill.DiscountPercent : 0;
                if (!this.MembershipTypeName || this.MembershipTypeName === 'General') {
                  this.DisableDiscountPercent = true;
                }
                else {
                  this.DisableDiscountPercent = false;
                }
              }

              this.changeDetectorRef.detectChanges();
            }
            else if (newBill.ChangeType === "Doctor") {

              if (this.billingTransaction.BillingTransactionItems.length === 0) {
                this.billingTransaction.BillingTransactionItems.push(this.opdBillTxnItem);
              }

              let selDoc = newBill.SelectedDoctor;
              this.selectedPerformerId = selDoc.PerformerId;
              if (this.visitService.appointmentType.toLowerCase() === ENUM_AppointmentType.referral.toLowerCase()) {
                this.visitBillItem = this.docOpdReferralPriceItems.find(d => d.PerformerId === selDoc.PerformerId);
              } else {
                this.visitBillItem = this.docOpdPriceItems.find(d => d.PerformerId === selDoc.PerformerId);
              }

              this.ResetOpdBillTxnItem();
              if (this.visitBillItem) {
                this.AssignVisitBillItemToTxn(this.visitBillItem);
                this.NotAdditionalBillItem = { ServiceItemId: this.visitBillItem.ServiceItemId, ItemName: this.visitBillItem.ItemName };
              }

            }
            else if (newBill.ChangeType === "Department") {

              if (this.billingTransaction.BillingTransactionItems.length === 0) {
                this.billingTransaction.BillingTransactionItems.push(this.opdBillTxnItem);
              }
              let selDept = newBill.SelectedDepartment;
              this.selectedDepartmentId = selDept.DepartmentId;
              this.visitBillItem = this.deptOpdPriceItems.find(d => d.DepartmentId === selDept.DepartmentId);
              this.ResetOpdBillTxnItem();

              if (this.visitBillItem) {
                this.AssignVisitBillItemToTxn(this.visitBillItem);
                this.NotAdditionalBillItem = { ServiceItemId: this.visitBillItem.ServiceItemId, ItemName: this.visitBillItem.ItemName };
              }
            }
            else if (newBill.ChangeType === "Referral") {
              if (this.opdBillTxnItem)
                this.opdBillTxnItem.ReferredById = newBill.ReferredBy;
            }
            this.Calculation();
          }

        }));


    this.visitBillInfoSubscriptions.add(this.visitService.ObserveSchemeChangedEvent()
      .subscribe((scheme: RegistrationScheme_DTO) => {
        if (scheme && scheme.SchemeId) {
          console.log("ObserveSchemeChangedEvent captured from VisitBillingInfo.Component...");
          console.log(scheme);
          this.registrationSchemeDto = scheme;
          this.billingTransaction.Remarks = this.registrationSchemeDto.SchemeName;
          this.billingTransaction.OrganizationId = this.registrationSchemeDto.DefaultCreditOrganizationId;
          if (this.registrationSchemeDto.IsCreditOnlyScheme && !this.registrationSchemeDto.IsCoPayment) {
            this.DisablePaymentModeDropDown = true;
          } else {
            this.DisablePaymentModeDropDown = false;
          }
          this.temp_CreditOrgObj_ChangeToId = new CreditOrganization();
          this.temp_CreditOrgObj_ChangeToId.OrganizationId = scheme.DefaultCreditOrganizationId;
          this.GetServiceItemSchemeSetting(ENUM_ServiceBillingContext.Registration, this.registrationSchemeDto.SchemeId);
          this.ReloadOpdPricesItemsToCurrentPriceCategory(scheme.PriceCategoryId);
          if (this.currentPriceCategoryId !== scheme.PriceCategoryId) {
            this.FilterVisitAdditionalServiceItems(this.registrationSchemeDto.PriceCategoryId);
          }
          this.currentPriceCategoryId = scheme.PriceCategoryId;
        }
      }));
  }

  public ReloadOpdPricesItemsToCurrentPriceCategory(priceCatId: number): void {
    this.docOpdPriceItems = this.visitService.DocOpdPrices.filter(pr => pr.PriceCategoryId === priceCatId);
    this.docFollowupPrices = this.visitService.DocFollowupPrices.filter(pr => pr.PriceCategoryId === priceCatId);
    this.docOpdOldPatientPriceItems = this.visitService.DocOpdPrice_OldPatient.filter(pr => pr.PriceCategoryId === priceCatId);
    this.docOpdReferralPriceItems = this.visitService.DocOpdPrice_Referral.filter(pr => pr.PriceCategoryId === priceCatId);

    this.deptOpdPriceItems = this.visitService.DeptOpdPrices.filter(pr => pr.PriceCategoryId === priceCatId);
    this.deptFollowupPrices = this.visitService.DeptFollowupPrices.filter(pr => pr.PriceCategoryId === priceCatId);
    this.deptOpdOldPatientPriceItems = this.visitService.DeptOpdPrice_OldPatient.filter(pr => pr.PriceCategoryId === priceCatId);

    this.AssignPriceAccordingToPriceCategory();
  }


  private AssignPriceAccordingToPriceCategory(): void {
    if (this.coreService.EnableDepartmentLevelAppointment()) {
      if (this.billingTransaction.BillingTransactionItems.length === 0) {
        this.billingTransaction.BillingTransactionItems.push(this.opdBillTxnItem);
      }

      this.visitBillItem = this.deptOpdPriceItems.find(d => d.DepartmentId === this.selectedDepartmentId);
      this.ResetOpdBillTxnItem();

      if (this.visitBillItem) {
        this.AssignVisitBillItemToTxn(this.visitBillItem);
        this.NotAdditionalBillItem = { ServiceItemId: this.visitBillItem.ServiceItemId, ItemName: this.visitBillItem.ItemName };
      }
    } else {
      if (this.billingTransaction.BillingTransactionItems.length === 0) {
        this.billingTransaction.BillingTransactionItems.push(this.opdBillTxnItem);
      }

      if (this.visitService.appointmentType.toLowerCase() === ENUM_AppointmentType.referral.toLowerCase()) {
        this.visitBillItem = this.docOpdReferralPriceItems.find(d => d.PerformerId === this.selectedPerformerId);
      } else {
        this.visitBillItem = this.docOpdPriceItems.find(d => d.PerformerId === this.selectedPerformerId);
      }

      this.ResetOpdBillTxnItem();
      if (this.visitBillItem) {
        this.AssignVisitBillItemToTxn(this.visitBillItem);
        this.NotAdditionalBillItem = { ServiceItemId: this.visitBillItem.ServiceItemId, ItemName: this.visitBillItem.ItemName };
      }
    }
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.visitBillInfoSubscriptions.unsubscribe();
    this.visitService.PriceCategory = ENUM_PriceCategory.Normal;
  }

  ngOnInit() {
    this.MstPaymentModes = this.coreService.masterPaymentModes;
    this.PaymentPages = this.coreService.paymentPages;
    //this.InitializeSubscriptions();

    //set values to global variables from visit service
    this.docOpdPriceItems = this.visitService.DocOpdPrices;
    this.docFollowupPrices = this.visitService.DocFollowupPrices;
    this.docOpdOldPatientPriceItems = this.visitService.DocOpdPrice_OldPatient;
    this.docOpdReferralPriceItems = this.visitService.DocOpdPrice_Referral;

    this.deptFollowupPrices = this.visitService.DeptFollowupPrices;

    this.deptOpdPriceItems = this.visitService.DeptOpdPrices;


    this.InitializeBillingTransaction();
    if (this.visitService.appointmentType.toLowerCase() === ENUM_AppointmentType.referral) {
      this.billingTransaction.Remarks = "Referral Visit";
      this.docOpdPriceItems = this.visitService.DocOpdPrice_Referral
    }

    if (this.visitService.appointmentType.toLowerCase() === ENUM_AppointmentType.followup) {
      this.deptOpdPriceItems = this.visitService.DeptFollowupPrices;
      this.docOpdPriceItems = this.visitService.DocFollowupPrices;
      this.showBillSummaryPanel = false;
    }
    else {
      //old patient opd is applicable only when appointment type is not followup.
      let patId = this.visitService.globalVisit.PatientId;
      this.isOldPatientOpd = false;
      if (patId) {

        let oldPatOpdParam = this.coreService.Parameters.find(p => p.ParameterGroupName === "Appointment" && p.ParameterName === "OldPatientOpdPriceEnabled");
        if (oldPatOpdParam) {
          let enableOldPatOpdPrice = oldPatOpdParam.ParameterValue.toLowerCase() === "true" ? true : false;

          if (enableOldPatOpdPrice) {

            this.visitBLService.GetPatientVisitList(patId)
              .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                  let patVisitList: Array<any> = res.Results;
                  if (patVisitList && patVisitList.length) {
                    this.isOldPatientOpd = true;
                    //below two variable will be set to OldPatient Opd Prices, and other transaction will happen accordingly.
                    this.docOpdPriceItems = this.visitService.DocOpdPrice_OldPatient;
                    this.deptOpdPriceItems = this.visitService.DeptOpdPrice_OldPatient;
                  }
                }

              });
          }
        }
      }
    }

    //don't check for health card if it's followup appointment.
    if (this.visitService.appointmentType.toLowerCase() !== ENUM_AppointmentType.followup) {
      this.AdditionalBilItems = [];
      let additionalBillItem = this.coreService.Parameters.find(p => p.ParameterGroupName === "Appointment" && p.ParameterName === "AdditionalBillItem");

      if (additionalBillItem && additionalBillItem.ParameterValue) {

        var addBillItem = JSON.parse(additionalBillItem.ParameterValue);
        addBillItem.forEach(a => {
          // var billItem = this.allBillItems.find(b => b.ItemName.trim().toLowerCase() == a.ItemName.trim().toLowerCase());
          var billItem = this.allBillItems.find(b => b.ServiceDepartmentId === a.ServiceDeptId && b.ItemId === a.ItemId);
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
    if (this.routeFromService && this.routeFromService.RouteFrom && this.routeFromService.RouteFrom === "appointment") {
      this.routeFromService.RouteFrom = "";
      let appointedDoctorId: number = this.appointmentService.globalAppointment.PerformerId;
      if (appointedDoctorId) {
        this.visitService.TriggerBillChangedEvent({ ChangeType: "Doctor", SelectedDoctor: { PerformerId: appointedDoctorId } });
      }
    }

  }


  public InitializeBillingTransaction(): void {
    this.billingTransaction.CounterId = this.securityService.getLoggedInCounter().CounterId;
    this.billingTransaction.TaxId = this.billingService.taxId;
    this.billingTransaction.TransactionType = "outpatient";
    this.billingTransaction.BillStatus = ENUM_BillingStatus.paid;
  }

  public AssignVisitBillItemToTxn(visBilItm: OpdServiceItemPrice_DTO): void {

    if (!visBilItm) {
      return;
    }
    this.opdBillTxnItem.ItemName = visBilItm.ItemName;
    this.opdBillTxnItem.ItemId = visBilItm.ServiceItemId;//Sud:17Mar'23--This is for Temporary purpose
    this.opdBillTxnItem.ServiceItemId = visBilItm.ServiceItemId;
    this.opdBillTxnItem.ItemCode = visBilItm.ItemCode;
    this.opdBillTxnItem.PriceCategoryId = this.registrationSchemeDto.PriceCategoryId;
    this.opdBillTxnItem.ServiceDepartmentId = visBilItm.ServiceDepartmentId;
    this.opdBillTxnItem.ServiceDepartmentName = visBilItm.ServiceDepartmentName;
    this.opdBillTxnItem.PerformerId = visBilItm.PerformerId;
    this.opdBillTxnItem.PerformerName = visBilItm.PerformerName;
    this.opdBillTxnItem.PriceCategory = this.registrationSchemeDto.PriceCategoryName;
    this.opdBillTxnItem.Price = visBilItm.Price;
    this.opdBillTxnItem.IsPriceChangeAllowed = visBilItm.IsPriceChangeAllowed;
    this.opdBillTxnItem.IsZeroPriceAllowed = visBilItm.IsZeroPriceAllowed;//sud:7Apr'21--needed for immunization and other depts where price could be zero.
    if (this.ServiceItemSchemeSettings && this.ServiceItemSchemeSettings.length) {
      let matchedItem = this.ServiceItemSchemeSettings.find(a => a.ServiceItemId === this.opdBillTxnItem.ServiceItemId && a.SchemeId === this.registrationSchemeDto.SchemeId);
      if (matchedItem) {
        this.opdBillTxnItem.IsCoPayment = matchedItem.IsCoPayment;
        this.opdBillTxnItem.CoPaymentCashPercent = matchedItem.CoPaymentCashPercent;
        this.opdBillTxnItem.CoPaymentCreditPercent = matchedItem.CoPaymentCreditPercent;
        this.opdBillTxnItem.DiscountPercent = matchedItem.DiscountPercent;
      }
    }

    this.billingTransaction.BillingTransactionItems[0] = this.opdBillTxnItem;
    this.Calculation();
    this.opdBillTxnItem.IsTaxApplicable = visBilItm.IsTaxApplicable;
    //this.CheckAndAddAdditionalItems();
  }

  public BilcfgItemsVsPriceCategoryMap: Array<any> = new Array<any>();


  public ResetOpdBillTxnItem(): void {
    this.opdBillTxnItem.Price = 0;
    this.opdBillTxnItem.SAARCCitizenPrice = 0;
    this.opdBillTxnItem.ForeignerPrice = 0;
    this.opdBillTxnItem.ItemId = 0;
    this.opdBillTxnItem.InsForeignerPrice = 0;
  }

  public Calculation(): void {

    if (this.billingTransaction && this.billingTransaction.BillingTransactionItems && this.billingTransaction.BillingTransactionItems.length > 0) {
      this.billingTransaction.DiscountAmount = 0;
      this.billingTransaction.TaxTotal = 0;
      this.billingTransaction.TaxableAmount = 0;
      this.billingTransaction.NonTaxableAmount = 0;
      this.billingTransaction.SubTotal = 0;
      this.billingTransaction.TotalAmount = 0;
      this.billingTransaction.Tender = 0;
      this.billingTransaction.TotalQuantity = 0;

      if (this.AdditionalVisitBilItems && this.AdditionalVisitBilItems.length) {

        this.AdditionalVisitBilItems.forEach(a => {
          if (this.ServiceItemSchemeSettings && this.ServiceItemSchemeSettings.length) {
            let item = this.ServiceItemSchemeSettings.find(a => a.ServiceItemId === a.ServiceItemId && a.SchemeId === this.registrationSchemeDto.SchemeId);
            if (item) {
              a.IsCoPayment = item.IsCoPayment;
              a.CoPaymentCashPercent = item.CoPaymentCashPercent;
              a.CoPaymentCreditPercent = item.CoPaymentCreditPercent;
              a.DiscountPercent = item.DiscountPercent;
            }
          }
          if (a.IsDiscountApplicable) {
            a.DiscountAmount = (this.billingTransaction.DiscountPercent / 100) * a.Price;
          }
          else {
            a.DiscountAmount = 0;
          }
          if (this.billingTransaction.BillingTransactionItems.every(b => b.ServiceItemId !== a.ServiceItemId)) {
            this.AssignVisitAdditionalServiceItemToTransaction(a);
          }
        });
      }


      if (this.billingTransaction.DiscountPercent === null) { //to pass discount percent 0 when the input is null --yub 30th Aug '18
        this.billingTransaction.DiscountPercent = 0;
      }
      this.billingTransaction.BillingTransactionItems.forEach(billTxnItem => {
        //*Krishna, 16thMarch'23, assign SchemeId and PriceCategory to BillingTransactionItems.
        billTxnItem.DiscountSchemeId = this.registrationSchemeDto.SchemeId;
        billTxnItem.PriceCategory = this.registrationSchemeDto.PriceCategoryName;

        this.billingTransaction.TotalQuantity +=
          billTxnItem.Quantity = 1;

        //let matchedItem = this.BilcfgItemsVsPriceCategoryMap.find(a => a.ServiceDepartmentId === billTxnItem.ServiceDepartmentId && a.ItemId === billTxnItem.ItemId && a.PriceCategoryId === this.selectedPriceCategoryObj.PriceCategoryId);

        //no discount for health card and DiscountApplicable is false
        if (billTxnItem.DiscountApplicable != false) {

          this.billingTransaction.DiscountAmount +=
            billTxnItem.DiscountAmount = CommonFunctions.parseAmount(billTxnItem.Price * this.billingTransaction.DiscountPercent / 100);
          billTxnItem.DiscountPercent =
            billTxnItem.DiscountPercentAgg = CommonFunctions.parseAmount(billTxnItem.DiscountPercent);

        }

        //to avoid discount in Consultation charges
        if (!billTxnItem.DiscountApplicable) {
          billTxnItem.DiscountPercent = 0;
          billTxnItem.DiscountAmount = 0;
        }

        if (billTxnItem.IsTaxApplicable) {
          this.billingTransaction.TaxTotal +=
            billTxnItem.Tax = CommonFunctions.parseAmount(((billTxnItem.Price - billTxnItem.DiscountAmount) * billTxnItem.TaxPercent) / 100);
          this.billingTransaction.TaxableAmount +=
            billTxnItem.TaxableAmount = CommonFunctions.parseAmount(billTxnItem.Price - billTxnItem.DiscountAmount);
        }
        else {
          this.billingTransaction.NonTaxableAmount +=
            billTxnItem.NonTaxableAmount = CommonFunctions.parseAmount(billTxnItem.Price - billTxnItem.DiscountAmount);
        }
        // billTxnItem.TotalAmount = CommonFunctions.parseAmount((billTxnItem.Price * billTxnItem.Quantity) - billTxnItem.DiscountAmount);

        this.billingTransaction.SubTotal +=
          billTxnItem.SubTotal = CommonFunctions.parseAmount(billTxnItem.Price);
        this.billingTransaction.TotalAmount +=
          billTxnItem.TotalAmount = CommonFunctions.parseAmount(billTxnItem.SubTotal - billTxnItem.DiscountAmount + billTxnItem.Tax);
        //this.billingTransaction.DiscountPercent = CommonFunctions.parseAmount(this.billingTransaction.DiscountAmount/this.billingTransaction.SubTotal) * 100;

      });

      if (this.registrationSchemeDto.IsCoPayment) {
        // this.billingTransaction.ReceivedAmount = (this.PriceCategorySelectedToChangePrice.Copayment_CashPercent / 100) * this.billingTransaction.TotalAmount;
        // this.billingTransaction.CoPaymentCreditAmount = this.billingTransaction.TotalAmount - this.billingTransaction.ReceivedAmount;
        this.billingTransaction.BillingTransactionItems.forEach((item) => {
          item.CoPaymentCashAmount = (item.CoPaymentCashPercent / 100) * item.TotalAmount;
          item.CoPaymentCreditAmount = (item.CoPaymentCreditPercent / 100) * item.TotalAmount;
        });
        this.billingTransaction.ReceivedAmount = this.billingTransaction.BillingTransactionItems.reduce((acc, curr) => acc + curr.CoPaymentCashAmount, 0);
        this.billingTransaction.CoPaymentCreditAmount = this.billingTransaction.BillingTransactionItems.reduce((acc, curr) => acc + curr.CoPaymentCreditAmount, 0);
      } else {
        this.billingTransaction.ReceivedAmount = this.billingTransaction.TotalAmount;
      }

      // this.billingTransaction.Tender = CommonFunctions.parseAmount(this.billingTransaction.TotalAmount);
      this.billingTransaction.Tender = CommonFunctions.parseAmount(this.billingTransaction.ReceivedAmount);
    }
    else {
      return;
    }
  }
  @Output() tenderChanged = new EventEmitter<any>();

  public PaymentModeChanged(): void {
    this.billingTransaction.BillStatus = this.opdBillTxnItem.BillStatus = this.billingTransaction.BillStatus = this.billingTransaction.PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit.toLowerCase() ? ENUM_BillingStatus.unpaid : ENUM_BillingStatus.paid; //  "unpaid" : "paid";
    this.billingTransaction.Change = 0;
    if ((!this.registrationSchemeDto.IsCoPayment) && this.billingTransaction.PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit.toLowerCase()) {
      this.billingTransaction.Tender = 0;//tender is zero and is disabled in when credit and not CoPayment
      this.billingTransaction.Change = 0;
      this.billingTransaction.ReceivedAmount = 0;
      this.tenderChanged.emit(this.billingTransaction.PaymentMode); // Emit the value to the visit-patient-info
    }


    if (this.billingTransaction.BillStatus === ENUM_BillingStatus.paid) {
      this.billingTransaction.PaymentDetails = null;
      this.billingTransaction.BillingTransactionItems.forEach(a => {
        a.BillStatus = ENUM_BillingStatus.paid;
      });
    } else {

      this.billingTransaction.BillingTransactionItems.forEach(a => {
        a.BillStatus = ENUM_BillingStatus.unpaid;
      });
    }


    if (!this.billingTransaction.EmployeeCashTransaction.length && (this.billingTransaction.PaymentMode.toLowerCase() !== ENUM_BillPaymentMode.credit.toLowerCase() || this.registrationSchemeDto.IsCoPayment === true)) {
      this.billingTransaction.EmployeeCashTransaction = [];
      let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() == this.billingTransaction.PaymentMode.toLocaleLowerCase());
      let empCashTxnObj = new EmployeeCashTransaction();
      empCashTxnObj.InAmount = this.billingTransaction.ReceivedAmount;
      empCashTxnObj.OutAmount = 0;
      empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubCategoryId;
      empCashTxnObj.ModuleName = "Appointment";
      this.billingTransaction.EmployeeCashTransaction.push(empCashTxnObj);
    }
  }

  public HandleBillChangedForFollowUp(newBill): void {

    let oldDepartmentId = this.visitService.ParentVisitInfo.DepartmentId;
    let oldDoctorId = this.visitService.ParentVisitInfo.PerformerId;

    let newDepartmentId = this.visitService.globalVisit.DepartmentId;
    let newDoctorId = this.visitService.globalVisit.PerformerId;


    if (newDepartmentId && oldDepartmentId !== newDepartmentId) {
      this.showBillSummaryPanel = true;

      if (newDoctorId && oldDoctorId !== newDoctorId) {
        this.Followup_DoctorChanged(newDoctorId);
      }
      else {
        this.Followup_DepartmentChanged(newDepartmentId);
      }

    }
    else if (this.priceCategory !== "Normal") {
      this.showBillSummaryPanel = true;

      if (newDoctorId && oldDoctorId !== newDoctorId) {
        this.Followup_DoctorChanged(newDoctorId);
      }
      else {
        this.Followup_DepartmentChanged(newDepartmentId);
      }
    }
    else {
      this.showBillSummaryPanel = false;
    }

    this.Calculation();
  }//end of: HandleBillChangedForFollowUp

  public Followup_DoctorChanged(newDoctorId): void {
    if (this.billingTransaction && this.billingTransaction.BillingTransactionItems.length) {
      this.visitBillItem = this.docOpdPriceItems.find(d => d.PerformerId === newDoctorId);
      this.ResetOpdBillTxnItem();
      if (this.visitBillItem) {
        this.AssignVisitBillItemToTxn(this.visitBillItem);
        this.NotAdditionalBillItem = { ServiceItemId: this.visitBillItem.ServiceItemId, ItemName: this.visitBillItem.ItemName };
      }
    }

  }
  public Referral_DoctorChanged(newDoctorId): void {
    if (this.billingTransaction && this.billingTransaction.BillingTransactionItems.length) {
      this.visitBillItem = this.docOpdReferralPriceItems.find(d => d.PerformerId === newDoctorId);
      this.ResetOpdBillTxnItem();
      if (this.visitBillItem) {
        this.AssignVisitBillItemToTxn(this.visitBillItem);
        this.NotAdditionalBillItem = { ServiceItemId: this.visitBillItem.ServiceItemId, ItemName: this.visitBillItem.ItemName };
      }
    }

  }


  public Followup_DepartmentChanged(newDepartmentId): void {
    this.ResetOpdBillTxnItem();
    this.visitBillItem = this.deptOpdPriceItems.find(d => d.DepartmentId === newDepartmentId);
    if (this.visitBillItem) {
      this.AssignVisitBillItemToTxn(this.visitBillItem);
      this.NotAdditionalBillItem = { ServiceItemId: this.visitBillItem.ServiceItemId, ItemName: this.visitBillItem.ItemName };
    }
  }



  public ChangeTenderAmount(): void {

    // this.billingTransaction.Change = this.billingTransaction.Tender - (this.billingTransaction.TotalAmount ? this.billingTransaction.TotalAmount : this.totalAmount);
    this.billingTransaction.Change = this.billingTransaction.Tender - (this.billingTransaction.ReceivedAmount ? this.billingTransaction.ReceivedAmount : this.billingTransaction.ReceivedAmount);
  }

  public PaymentModeChanges($event): void {
    this.billingTransaction.PaymentMode = $event.PaymentMode.toLowerCase();
    if (this.billingTransaction.PaymentMode.toLocaleLowerCase() !== ENUM_BillPaymentMode.credit) {
      this.billingTransaction.PaymentMode = ENUM_BillPaymentMode.cash;
    }
    else {
      this.billingTransaction.PaymentMode = ENUM_BillPaymentMode.credit;
    }

    if (this.registrationSchemeDto.IsCoPayment) {
      this.billingTransaction.IsCoPayment = true;
      this.billingTransaction.PaymentMode = ENUM_BillPaymentMode.credit;
    }

    this.billingTransaction.PaymentDetails = $event.PaymentDetails;

    this.PaymentModeChanged();
  }

  public CreditOrganizationChanges($event): void {
    if ($event) {
      this.billingTransaction.OrganizationName = $event.OrganizationName;
      this.billingTransaction.OrganizationId = $event.OrganizationId;
    }
  }

  public AdditionalBillItemsCheckboxChanged(): void {
    if (this.allowAdditionalBillItems === false) {
      this.RemoveAdditionalBillItemsFromBillingTxn();
    }
    else if (this.AdditionalBilItems && this.AdditionalBilItems.length > 0) {
      this.BilcfgItemsVsPriceCategoryMap = this.billingService.BillItemsVsPriceCategoryMapping;
      if (this.registrationSchemeDto.IsCoPayment) {
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
    this.billingTransaction.BillingTransactionItems = this.billingTransaction.BillingTransactionItems
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

    let indx = this.billingTransaction.BillingTransactionItems.findIndex(a => a.ItemId === row.ItemId && a.ItemName === row.ItemName);
    if (indx > -1) {
      this.billingTransaction.BillingTransactionItems.splice(indx, 1);
    }
    this.Calculation();

    if (this.AdditionBillItemList.length < 1) {
      this.allowAdditionalBillItems = false;
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
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Unable Add more rows"]);
    }
  }

  public OnAdditionalItemPriceChanged(row): void {
    if (row.DiscountApplicable)
      row.DiscountAmount = (this.billingTransaction.DiscountPercent / 100) * row.Price;
    else
      row.DiscountAmount = 0;

    row.TotalAmount = row.Price - row.DiscountAmount;

    var itm = this.billingTransaction.BillingTransactionItems.find(a => a.ItemId === row.ItemId && a.ItemName === row.ItemName);
    itm.DiscountAmount = row.DiscountAmount;
    itm.DiscountPercent = this.billingTransaction.DiscountPercent
    itm.Price = row.Price;
    itm.SubTotal = itm.Quantity * row.Price;
    itm.TotalAmount = row.TotalAmount;


    this.Calculation();

  }
  public ItemChange(row, indx): void {
    var additionalItemObj = this.AdditionalBilItems.find(a => a.ItemId === row.ItmObj.ItemId && a.ItemName === row.ItmObj.ItemName);
    if (additionalItemObj) {
      if (this.AdditionBillItemList.some(a => a.ItemId === additionalItemObj.ItemId && a.ItemName === additionalItemObj.ItemName) ? true : false) {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Duplicate Additional bill Item"]);
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
    if (row.ItemId && row.ItemName && (this.billingTransaction.BillingTransactionItems.some(a => a.ItemId === row.ItemId && a.ItemName === row.ItemName) ? false : true)) {
      let billItem = new BillingTransactionItem();
      billItem.ServiceDepartmentId = row.ServiceDeptId;
      billItem.ServiceDepartmentName = row.ServiceDepartmentName;
      billItem.ItemName = row.ItemName;
      billItem.ItemId = row.ItemId;
      billItem.Price = row.Price;
      billItem.IsPriceChangeAllowed = row.PriceChangeEnabled;
      billItem.IsTaxApplicable = row.TaxApplicable;
      billItem.DiscountApplicable = row.DiscountApplicable;
      billItem.PatientId = this.billingTransaction.PatientId;
      billItem.CounterId = this.billingTransaction.CounterId;
      billItem.TaxPercent = this.billingService.taxPercent;
      billItem.BillingType = ENUM_BillingType.outpatient;// "outpatient";
      billItem.VisitType = ENUM_VisitType.outpatient;// "outpatient";
      billItem.BillStatus = this.billingTransaction.BillStatus;
      billItem.CoPaymentCashAmount = (row.CoPaymentCashPercent / 100) * row.TotalAmount;
      billItem.CoPaymentCreditAmount = (row.CoPaymentCreditPercent / 100) * row.TotalAmount;

      billItem.ShowProviderName = row.ShowProviderName;
      if (billItem.ShowProviderName) {
        billItem.PerformerId = this.opdBillTxnItem ? this.opdBillTxnItem.PerformerId : null;
        billItem.PerformerName = this.opdBillTxnItem ? this.opdBillTxnItem.PerformerName : null;
      }

      billItem.PrescriberId = this.opdBillTxnItem.PrescriberId;
      billItem.PrescriberName = this.opdBillTxnItem.PrescriberName;
      this.billingTransaction.BillingTransactionItems.push(billItem);
    } else {

      this.billingTransaction.BillingTransactionItems.forEach(a => {
        if (a.ShowProviderName) {
          a.PerformerId = this.opdBillTxnItem.PerformerId;
          a.PerformerName = this.opdBillTxnItem.PerformerName;
        }
      });
    }
  }

  public GetBillingItems(): void {
    this.allBillItems = this.visitService.allBillItemsPriceList;
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
        this.showAdditionalBillItemPanel = true;
      } else {
        this.showAdditionalBillItemPanel = false;
      }
    } else {
      return false;
    }
  }

  public MultiplePaymentCallBack($event): void {
    if ($event && $event.MultiPaymentDetail) {
      this.billingTransaction.EmployeeCashTransaction = [];
      this.billingTransaction.EmployeeCashTransaction = $event.MultiPaymentDetail;
      this.billingTransaction.PaymentDetails = $event.PaymentDetail
    }
  }


  public ReceivedAmountChange(): void {
    if (this.checkValidationForReceivedAmount()) {
      this.billingTransaction.CoPaymentCreditAmount = this.billingTransaction.TotalAmount - this.billingTransaction.ReceivedAmount;
      this.billingTransaction.CoPaymentCreditAmount = CommonFunctions.parseAmount(this.billingTransaction.CoPaymentCreditAmount, 3);
      this.billingTransaction.Tender = this.billingTransaction.ReceivedAmount;
    }
  }

  public checkValidationForReceivedAmount(): boolean {
    let isValidAmount = true;
    let ReceivedAmount = this.billingTransaction.ReceivedAmount;
    if (ReceivedAmount < 0) {
      isValidAmount = false;
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Cash cannot be less than 0!"]);
    }
    if (ReceivedAmount > this.billingTransaction.TotalAmount) {
      isValidAmount = false;
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Cash cannot be more than TotalAmount!"]);
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
    this.billingMasterBlService.GetServiceItemSchemeSetting(serviceBillingContext, schemeId)
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
      this.billingTransaction.BillingTransactionItems.forEach((item) => {
        const matchedServiceItem = serviceItemSchemeSetting.find(a => a.ServiceItemId === item.ServiceItemId);
        if (matchedServiceItem) {
          item.DiscountSchemeId = matchedServiceItem.SchemeId;
          item.DiscountPercent = matchedServiceItem.DiscountPercent;
          item.IsCoPayment = matchedServiceItem.IsCoPayment;
          item.CoPaymentCashPercent = matchedServiceItem.CoPaymentCashPercent;
          item.CoPaymentCreditPercent = matchedServiceItem.CoPaymentCreditPercent;
        }
      });
      this.billingTransaction.BillingTransactionItems = this.billingTransaction.BillingTransactionItems.slice();
    }
  }

  public GetVisitAdditionalServiceItems(): void {
    this.billingMasterBlService.GetVisitAdditionalServiceItems(ENUM_AdditionalServiceItemGroups.VisitAdditionalItems)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results && res.Results.length > 0) {
            this.visitAdditionalServiceItems = res.Results
            this.FilterVisitAdditionalServiceItems(this.registrationSchemeDto.PriceCategoryId);
          }
        }
      },
        (err: DanpheHTTPResponse) => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error: ${err.ErrorMessage}`]);
        }
      );
  }

  public FilterVisitAdditionalServiceItems(priceCategoryId: number): void {
    this.filteredVisitAdditionalServiceItems.forEach(item => {
      let index = this.billingTransaction.BillingTransactionItems.findIndex(a => a.ServiceItemId === item.ServiceItemId);
      if (index >= 0) {
        this.billingTransaction.BillingTransactionItems.splice(index, 1);
      }
    });
    this.AdditionalVisitBilItems = [];
    this.Calculation();
    this.filteredVisitAdditionalServiceItems = this.visitAdditionalServiceItems.filter(a => a.PriceCategoryId === priceCategoryId);
  }

  public HandleAdditionalServiceItemCheckUncheck(item: BillingAdditionalServiceItem_DTO): void {
    if (item.IsSelected) {
      // if (this.billingTransaction.BillingTransactionItems.every(a => a.ServiceItemId !== item.ServiceItemId)) {
      //   this.AssignVisitAdditionalServiceItemToTransaction(item);
      // }
      if (this.AdditionalVisitBilItems.every(a => a.ServiceItemId !== item.ServiceItemId)) {
        this.AdditionalVisitBilItems.push(item);
      }
    }
    else {
      let index = this.billingTransaction.BillingTransactionItems.findIndex(a => a.ServiceItemId === item.ServiceItemId);
      if (index >= 0) {
        this.billingTransaction.BillingTransactionItems.splice(index, 1);
      }
      let indexAdditionItem = this.AdditionalVisitBilItems.findIndex(a => a.ServiceItemId === item.ServiceItemId);
      if (indexAdditionItem >= 0) {
        this.AdditionalVisitBilItems.splice(indexAdditionItem, 1);
      }
    }
    this.Calculation();
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
    billItem.PatientId = this.billingTransaction.PatientId;
    billItem.CounterId = this.billingTransaction.CounterId;
    billItem.TaxPercent = this.billingService.taxPercent;
    billItem.BillingType = ENUM_BillingType.outpatient;
    billItem.VisitType = ENUM_VisitType.outpatient;
    billItem.BillStatus = this.billingTransaction.BillStatus;
    billItem.IsCoPayment = row.IsCoPayment;
    billItem.ItemCode = row.ItemCode;
    billItem.CoPaymentCashAmount = (row.CoPaymentCashPercent / 100) * row.Price;
    billItem.CoPaymentCreditAmount = (row.CoPaymentCreditPercent / 100) * row.Price;
    if (billItem.ShowProviderName) {
      billItem.PerformerId = this.opdBillTxnItem ? this.opdBillTxnItem.PerformerId : null;
      billItem.PerformerName = this.opdBillTxnItem ? this.opdBillTxnItem.PerformerName : null;
    }
    billItem.PrescriberId = this.opdBillTxnItem.PrescriberId;
    billItem.PrescriberName = this.opdBillTxnItem.PrescriberName;
    billItem.PriceCategoryId = this.registrationSchemeDto.PriceCategoryId;
    this.billingTransaction.BillingTransactionItems.push(billItem);
  }
  SetFocusToRemarksorButton() {
    const isRemarksMandatory = (this.billingTransaction.DiscountPercent || this.billingTransaction.IsInsuranceBilling || this.billingTransaction.PaymentMode == 'credit');
    if (isRemarksMandatory) {
      this.coreService.FocusInputById("id_billing_remarks", 100);
    } else {
      this.coreService.FocusInputById("btnPrintInvoice", 100);

    }
  }

}
