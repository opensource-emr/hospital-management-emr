/*
Pending Changes in this Component:
1. ECHS-Sticker Display Logic

*/


import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { SettingsBLService } from '../../../app/settings-new/shared/settings.bl.service';
import { BillingTransaction } from '../../billing/shared/billing-transaction.model';
import { BillingBLService } from '../../billing/shared/billing.bl.service';
import { BillingService } from '../../billing/shared/billing.service';
import { PatientScheme_DTO } from '../../billing/shared/dto/patient-scheme.dto';
import { RegistrationScheme_DTO } from '../../billing/shared/dto/registration-scheme.dto';
import { PatientScheme } from '../../billing/shared/patient-map-scheme';
import { CoreService } from '../../core/shared/core.service';
import { SsfPatient_DTO } from '../../insurance/ssf/shared/service/ssf.service';
import { Patient } from '../../patients/shared/patient.model';
import { PatientService } from '../../patients/shared/patient.service';
import { SecurityService } from '../../security/shared/security.service';
import { CallbackService } from '../../shared/callback.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { CommonFunctions } from "../../shared/common.functions";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../shared/routefrom.service';
import { ENUM_AppointmentType, ENUM_BillPaymentMode, ENUM_BillingType, ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_InvoiceType, ENUM_MessageBox_Status, ENUM_OrderStatus, ENUM_Scheme_ApiIntegrationNames, ENUM_ServiceBillingContext, ENUM_VisitType } from '../../shared/shared-enums';
import { AppointmentService } from '../shared/appointment.service';
import { CurrentVisitContextVM } from '../shared/current-visit-context.model';
import { PatientLatestVisitContext_DTO } from '../shared/dto/patient-lastvisit-context.dto';
import { QuickVisitVM } from '../shared/quick-visit-view.model';
import { VisitBLService } from '../shared/visit.bl.service';
import { Visit } from '../shared/visit.model';
import { VisitService } from '../shared/visit.service';

@Component({
  selector: "visit-main",
  templateUrl: "./visit-main.html",
  styleUrls: ['./visit-common.css'],
  host: { '(window:keydown)': 'hotkeys($event)' }

})
export class VisitMainComponent {

  public quickVisit: QuickVisitVM = new QuickVisitVM();
  public showExstingPatientListPage: boolean = false;
  public matchedPatientList: any;
  public loading: boolean = false;
  public prevVisitList: Array<Visit> = new Array<Visit>();
  public previousVisitBillingTxn: BillingTransaction = null;
  public disableTextBox: boolean = false;
  public membershipDiscountPercent: number = 0;
  public totalAmount: number = 0;
  public subTotal: number = 0;
  public discountAmount: number = 0;
  public taxableAmount: number = 0;
  public taxTotal: number = 0;
  public totalQuantity: number = 0;
  public tender: number = 0;
  public nonTaxableAmount: number = 0;
  public discountPercent: number = 0;
  public patientCountryId: number = 0;
  public DepartmentLevelAppointment: boolean;
  public SchemePriCeCategoryFromVisit: SchemePriceCategoryCustomType = { SchemeId: 0, PriceCategoryId: 0 };

  public RegistrationEventSubscriptions: Subscription = new Subscription();

  //public doctorChangedSubscription: Subscription;
  public isValidSchemeSelected: boolean;
  // public CreditOrganizationMandatory: boolean = false;
  public isPhoneMandatory: boolean = true;
  public restrictApptOnDepartmentLevel: boolean;
  public allBillItms: Array<any> = [];//pratik: 16March;21
  //public showInvoicePrintPage: boolean = false;//sud:16May'21--to print from same page.

  public selectedVisit: Visit = new Visit();

  //sud:19May'21-- We now have 3 variables to manage the printing.
  //below is the structure..
  //<printPopup><billingreceipt/><opdSticker/></printPopup>
  public showPrintingPopup: boolean = false;
  public showbillingReceipt: boolean = false;
  public showOpdSticker: boolean = false;
  public showEchsSticker: boolean = false;

  public showSticker: boolean = false;
  public showInvoice: boolean = false;
  public printInvoice: boolean = false;
  public teleMedicineConfiguration: any;
  SameDependentIdApplicableCount: number = 0;
  public IsAPFIntegrationEnabled: boolean = false;
  public MembershipTypeName: string = null;
  public RegistrationSchemeDetail = new RegistrationScheme_DTO();
  public CreditLimit: number = 0;
  public serviceBillingContext: string = ENUM_ServiceBillingContext.OpBilling;
  public SchemePriCeCategoryFromVisitTemp: SchemePriceCategoryCustomType = { SchemeId: 0, PriceCategoryId: 0 };
  public confirmationTitle: string = "Confirm !";
  public confirmationMessage: string = "Are you sure you want to Print Invoice ?";
  public patLastVisitContext: PatientLatestVisitContext_DTO = new PatientLatestVisitContext_DTO();
  public currPatVisitContext: CurrentVisitContextVM = new CurrentVisitContextVM();
  public IsReferred: boolean = false;
  public IsPatientEligibleForService: boolean = true;
  public tenderValue: any;
  constructor(public patientService: PatientService,
    public securityService: SecurityService,
    public callBackService: CallbackService,
    public visitBLService: VisitBLService,
    public router: Router,
    public msgBoxServ: MessageboxService,
    public routeFromService: RouteFromService,
    public billingService: BillingService,
    public appointmentService: AppointmentService,
    public billingBLService: BillingBLService,
    public visitService: VisitService,
    public changeDetRef: ChangeDetectorRef,
    public coreService: CoreService,
    public settingsBLService: SettingsBLService) {
    this.CheckAndSetCounter();
    this.Initialize();
    let TeleMedicineConfig = this.coreService.Parameters.find(p => p.ParameterGroupName == "TeleMedicine" && p.ParameterName == "DanpheConfigurationForTeleMedicine").ParameterValue;
    this.teleMedicineConfiguration = JSON.parse(TeleMedicineConfig);
    this.restrictApptOnDepartmentLevel = this.coreService.EnableDepartmentLevelAppointment();
    // this.CreditOrganizationMandatory = this.coreService.LoadCreditOrganizationMandatory();

    this.isPhoneMandatory = this.coreService.GetIsPhoneNumberMandatory();
    this.allBillItms = this.visitService.allBillItemsPriceList;
  }


  ngOnInit() {

    let val = this.coreService.Parameters.find(p => p.ParameterGroupName == 'Appointment' && p.ParameterName == 'VisitPrintSettings').ParameterValue;
    let param = JSON.parse(val);
    if (param) {
      this.showSticker = param.ShowStickerPrint;
      this.showInvoice = param.ShowInvoicePrint;
      if (param.DefaultFocus.toLowerCase() == "invoice") {
        this.printInvoice = true;
      }

    }
    let apfPatientParam = this.coreService.Parameters.find(a => a.ParameterGroupName === 'Appointment' && a.ParameterName === 'APFUrlForPatientDetail');
    if (apfPatientParam) {
      let obj = JSON.parse(apfPatientParam.ParameterValue);
      this.IsAPFIntegrationEnabled = JSON.parse(obj.EnableAPFPatientRegistrtion);
    }
  }

  ngOnDestroy() {
    this.routeFromService.RouteFrom = "";
    //Need to destroy all observable subscriptions on component destroy. To Avoid Memory Leaks.
    this.RegistrationEventSubscriptions.unsubscribe();
  }

  CheckAndSetCounter() {
    if (!this.securityService.getLoggedInCounter().CounterId) {
      this.callBackService.CallbackRoute = '/Appointment/PatientSearch';
    }
  }


  //set's patientIdfrom patientService and  appointment type from visitService.
  Initialize() {

    this.quickVisit.Visit = this.visitService.CreateNewGlobal();//sud:26June'19--We'll be working with global visit object here after.

    if (this.routeFromService && this.routeFromService.RouteFrom && this.routeFromService.RouteFrom == "billing-qr-scan") {

      this.AssignPatInfoFromApptServiceToPatService();
      this.routeFromService.RouteFrom = "";
    }


    this.quickVisit.Patient = this.patientService.getGlobal();


    this.quickVisit.Patient.PatientId =
      this.quickVisit.Visit.PatientId =
      this.quickVisit.BillingTransaction.PatientId =
      this.patientService.getGlobal().PatientId;

    this.quickVisit.Visit.AppointmentType = this.visitService.appointmentType;
    if (this.quickVisit.Visit.AppointmentType.toLowerCase() === ENUM_AppointmentType.referral.toLowerCase()) {
      this.IsReferred = true;
      //!fetch priceCategory and scheme from the global service.
      this.SchemePriCeCategoryFromVisit.PriceCategoryId = this.patientService.getGlobal().PriceCategoryId;
      this.SchemePriCeCategoryFromVisit.SchemeId = this.patientService.getGlobal().SchemeId;
    }
    this.quickVisit.Visit.VisitType = ENUM_VisitType.outpatient;// "outpatient";
    this.quickVisit.BillingTransaction.IsInsuranceBilling = this.billingService.isInsuranceBilling;

    //sud:13Jul'19--get patient's today's visit (not Returned) and check for DuplicateVisit in client side itself.
    this.LoadPatientsTodaysVisitListIntoService(this.patientService.getGlobal().PatientId);
    if (this.routeFromService && this.routeFromService.RouteFrom && this.routeFromService.RouteFrom == "onlineappointment") {
      this.quickVisit.Visit.VisitDate = this.appointmentService.getGlobal().AppointmentDate;
      this.quickVisit.Visit.VisitTime = this.appointmentService.getGlobal().AppointmentTime;
    }

  }

  //this was done for Billing-QR-Scan -> New Appointment. we may be able to re-use this if required/feasible.
  AssignPatInfoFromApptServiceToPatService() {
    let ipData: Patient = this.appointmentService.GlobalAppointmentPatient;
    var globalPat = this.patientService.getGlobal();
    //mapping to prefill in Appointment Form
    globalPat.PatientId = ipData.PatientId;

    //this.LoadMembershipTypePatient(globalPat.PatientId);

    globalPat.PatientCode = ipData.PatientCode;
    globalPat.FirstName = ipData.FirstName;
    globalPat.LastName = ipData.LastName;
    globalPat.MiddleName = ipData.MiddleName;
    globalPat.PhoneNumber = ipData.PhoneNumber;
    globalPat.Gender = ipData.Gender;
    globalPat.ShortName = ipData.ShortName;
    globalPat.DateOfBirth = ipData.DateOfBirth;
    globalPat.Age = ipData.Age;
    globalPat.Address = ipData.Address;
    globalPat.CountrySubDivisionName = ipData.CountrySubDivisionName;
    globalPat.CountryId = ipData.CountryId;
    globalPat.CountrySubDivisionId = ipData.CountrySubDivisionId;
    //globalPat.MembershipTypeId = ipData.MembershipTypeId;
    globalPat.PANNumber = ipData.PANNumber;
    globalPat.Admissions = ipData.Admissions;
    globalPat.CareTaker = ipData.CareTaker;
    globalPat.PolicyNo = ipData.PolicyNo;

  }

  //sud:13Jul'19--get patient's today's visit (not Returned) and check for DuplicateVisit in client side itself.
  LoadPatientsTodaysVisitListIntoService(patientId: number) {

    this.visitService.PatientTodaysVisitList = [];
    var followup: boolean = true;
    this.visitBLService.GetPatientVisits_Today(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.visitService.PatientTodaysVisitList = res.Results;
        }
        else {
          this.visitService.PatientTodaysVisitList = [];
        }
      });


  }



  ngAfterViewChecked() {
    this.changeDetRef.detectChanges();
  }

  //start: Post Visit
  //if patientId=0, check if there is existing patient with similar properties.
  CheckExistingPatientsAndSubmit() {
    if (this.loading) {
      this.visitBLService.GetApptForDeptOnSelectedDate(this.quickVisit.Visit.DepartmentId, this.quickVisit.Visit.PerformerId, this.quickVisit.Visit.VisitDate, this.quickVisit.Patient.PatientId)
        .subscribe(res => {
          if ((res.Status === ENUM_DanpheHTTPResponseText.OK) && res.Results && this.restrictApptOnDepartmentLevel) {
            this.msgBoxServ.showMessage("failed", ['Patient has already appointment for this department on selected date.']);
            this.loading = false;
          } else {
            this.ValidatePatientVisitData();
            //this.loading = false;
          }
        });
    }
  }

  ValidatePatientVisitData() {
    let valSummary = this.CheckValidations();
    if (valSummary.isValid) {
      //check if middlename exists or not to append to Shortname
      var midName = this.quickVisit.Patient.MiddleName;
      if (midName) {
        midName = this.quickVisit.Patient.MiddleName.trim() + " ";
      } else {
        midName = "";
      }
      //removing extra spaces typed by the users
      this.quickVisit.Patient.FirstName = this.quickVisit.Patient.FirstName.trim();
      this.quickVisit.Patient.MiddleName = this.quickVisit.Patient.MiddleName ? this.quickVisit.Patient.MiddleName.trim() : null;
      this.quickVisit.Patient.LastName = this.quickVisit.Patient.LastName.trim();
      this.quickVisit.Patient.ShortName = this.quickVisit.Patient.FirstName + " " + midName + this.quickVisit.Patient.LastName;
      this.submitVisitDetails();
    }
    else {
      this.msgBoxServ.showMessage("failed", valSummary.message);
      this.loading = false;
      //this.msgBoxServ.showMessage("failed", ["Please check all mandatory fields again."]);
    }
  }

  public submitVisitDetails() {
    //This is for New Patient which doesn't have PatientId
    if (!this.quickVisit.Patient.PatientId) {
      let age = this.quickVisit.Patient.Age + this.quickVisit.Patient.AgeUnit;
      this.visitBLService.GetExistedMatchingPatientList(this.quickVisit.Patient.FirstName, this.quickVisit.Patient.LastName, this.quickVisit.Patient.PhoneNumber, age, this.quickVisit.Patient.Gender)
        .subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results.length) {
            this.matchedPatientList = res.Results;
            this.showExstingPatientListPage = true;//re-enable the button if there are duplicate patients..
            this.loading = false;
          }
          else {
            this.CheckAppointmentTypeAndCreateVisit();
          }
        });
    }
    else {
      this.CheckAppointmentTypeAndCreateVisit();
    }
  }
  //if the user selects any patient from the matched list of patient. assign it to current patient instead of creating a new patient.
  AssignMatchedPatientAndProceed(patientId) {

    let patientInfo = this.matchedPatientList.find(a => a.PatientId == patientId);

    this.showExstingPatientListPage = false;
    this.quickVisit.Patient = Object.assign(this.quickVisit.Patient, patientInfo);
    this.quickVisit.Visit.PatientId = this.quickVisit.BillingTransaction.PatientId = this.quickVisit.Patient.PatientId;
    this.CreateVisit();
  }
  //it is the centralized function to check validations.
  //if any of the validation fails then isValid=false, error messages are pushed for each validations.
  CheckValidations(): { isValid: boolean, message: Array<string> } {
    console.log(this.quickVisit.Patient)
    if (this.quickVisit.Patient.AgeUnit == null) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Please select, Patient Age Unit"]);
      return;
    }
    if (!this.quickVisit.BillingTransaction.IsInsuranceBilling) {
      this.quickVisit.Visit.UpdateValidator("off", "ClaimCode", null);
    }
    let validationSummary = { isValid: true, message: [] };


    for (let i in this.quickVisit.Patient.PatientValidator.controls) {
      this.quickVisit.Patient.PatientValidator.controls[i].markAsDirty();
      this.quickVisit.Patient.PatientValidator.controls[i].updateValueAndValidity();
    }
    for (let i in this.quickVisit.Visit.VisitValidator.controls) {
      this.quickVisit.Visit.VisitValidator.controls[i].markAsDirty();
      this.quickVisit.Visit.VisitValidator.controls[i].updateValueAndValidity();
    }
    // const allPriceCategories = this.coreService.Masters.PriceCategories;
    // const selectedPriceCategory = allPriceCategories.find(c => c.PriceCategoryId === this.quickVisit.BillingTransaction.BillingTransactionItems[0].PriceCategoryId);

    if (!this.quickVisit.Patient.EthnicGroup) {
      validationSummary.isValid = false;
      validationSummary.message.push("Ethnic group is mandatory");
    }
    if (!this.IsPatientEligibleForService) {
      validationSummary.isValid = false;
      validationSummary.message.push(`Patient is not eligible for ${this.RegistrationSchemeDetail.SchemeName} Scheme`);
    }

    if (this.RegistrationSchemeDetail.IsMemberNumberCompulsory && !this.quickVisit.Patient.PatientScheme.PolicyNo) {
      validationSummary.isValid = false;
      validationSummary.message.push(`MemberNo is required to Register ${this.RegistrationSchemeDetail.SchemeName} Scheme's Patient!`);
    }

    if ((!this.quickVisit.Patient.PatientId && !this.quickVisit.Patient.IsValidCheck(undefined, undefined))
      || !this.quickVisit.Visit.IsValidCheck(undefined, undefined) || (this.RegistrationSchemeDetail && this.RegistrationSchemeDetail.IsCoPayment && !this.quickVisit.Patient.PatientScheme.IsValidCheck(undefined, undefined)) || !this.quickVisit.Visit.IsValidSelProvider) {
      validationSummary.isValid = false;
      validationSummary.message.push("Check all mandatory fields");
    }
    if (this.quickVisit.Patient.CountrySubDivisionId === null || this.quickVisit.Patient.CountrySubDivisionId === undefined) {
      validationSummary.isValid = false;
      validationSummary.message.push("please select valid district");
    }
    // if (this.quickVisit.BillingTransaction.IsCoPayment) {
    //   this.CheckCreditLimits(validationSummary);
    // }

    if (this.quickVisit.BillingTransaction.ReceivedAmount > this.quickVisit.BillingTransaction.TotalAmount) {
      validationSummary.isValid = false;
      validationSummary.message.push("Cash Cannot exceed Total Amount");
    }

    if (this.quickVisit.BillingTransaction.IsInsuranceBilling
      && this.billingService.Insurance
      && this.billingService.Insurance.CurrentBalance < this.quickVisit.BillingTransaction.TotalAmount) {
      // this.msgBoxServ.showMessage("failed", ["Insurance Balance not sufficient."]);
      validationSummary.isValid = false;
      validationSummary.message.push("Insurance Balance not sufficient.");
    }
    if (this.quickVisit.BillingTransaction.DiscountAmount > 0
      && (!this.quickVisit.BillingTransaction.Remarks
        || (this.quickVisit.BillingTransaction.Remarks
          && !this.quickVisit.BillingTransaction.Remarks.length))) {

      validationSummary.isValid = false;
      validationSummary.message.push("Remarks is Mandatory for discount");
    }
    //Yubraj--2nd July '19 for credit payment mode.
    if (this.quickVisit.BillingTransaction.PaymentMode === ENUM_BillPaymentMode.credit) {
      if (this.quickVisit.BillingTransaction.Remarks == null || !this.quickVisit.BillingTransaction.Remarks.length) {
        validationSummary.isValid = false;
        validationSummary.message.push("Remarks is Mandatory for Credit Payment Mode.");
      } else if (!this.quickVisit.BillingTransaction.OrganizationId || this.quickVisit.BillingTransaction.OrganizationId == 0) {
        validationSummary.isValid = false;
        validationSummary.message.push("Credit Organization is mandatory for Credit Payment mode")
      }
    }

    for (let j = 0; j < this.quickVisit.BillingTransaction.BillingTransactionItems.length; j++) {
      let itm = this.allBillItms.find(b => this.quickVisit.BillingTransaction.BillingTransactionItems[j].IntegrationItemId == b.IntegrationItemId && this.quickVisit.BillingTransaction.BillingTransactionItems[j].ServiceDepartmentId == b.ServiceDepartmentId);
      if (itm) {
        this.quickVisit.BillingTransaction.BillingTransactionItems[j].IsZeroPriceAllowed = itm.IsZeroPriceAllowed;
        if (itm.IsZeroPriceAllowed) {
          this.quickVisit.BillingTransaction.BillingTransactionItems[j].UpdateValidator("off", "Price", "positiveNumberValdiator");
        }
      }

      if (!this.quickVisit.BillingTransaction.BillingTransactionItems[j] || (this.quickVisit.BillingTransaction.BillingTransactionItems[j].Price <= 0 && !this.quickVisit.BillingTransaction.BillingTransactionItems[j].IsZeroPriceAllowed)) {
        validationSummary.isValid = false;
        validationSummary.message.push("Price of Item cannot be zero (0)");
      }
    }
    // if (!(this.quickVisit.BillingTransaction.BillingTransactionItems.every(a => a.Price != null && a.Price > 0))) {
    //   validationSummary.isValid = false;
    //   validationSummary.message.push("Price of Item cannot be zero (0)");
    // }
    // //    }

    if (this.quickVisit.BillingTransaction.DiscountPercent > 100 || this.quickVisit.BillingTransaction.DiscountPercent < 0) {
      validationSummary.isValid = false;
      validationSummary.message.push("Discount percent should be between 0 and 100.");

    }

    const isPhoneMandatory = this.coreService.GetIsPhoneNumberMandatory();
    if (isPhoneMandatory && (!this.quickVisit.Patient.PhoneNumber || !(/^\d+$/.test(this.quickVisit.Patient.PhoneNumber)))) {
      validationSummary.isValid = false;
      validationSummary.message.push("Proper Contact Number is mandatory.");
    }
    //start: sud:13Jul'19--Check if this patient already has visit with same Doctor/Department on today.
    //We should restrict to create duplicate visit. This logic was used only in server side till now.
    let patId = this.quickVisit.Patient.PatientId;
    let deptId = this.quickVisit.Visit.DepartmentId;
    let doctId = this.quickVisit.Visit.PerformerId;

    if (this.visitService.HasDuplicateVisitToday(patId, deptId, doctId, this.visitService.PatientTodaysVisitList)) {
      validationSummary.isValid = false;
      validationSummary.message.push("Patient already has appointment with same Doctor today.");
    }
    //end: sud:13Jul'19--Check if this patient already has visit with same Doctor/Department on today.

    if (!this.isValidSchemeSelected) {
      validationSummary.isValid = false;
      validationSummary.message.push("Select Membership Type from the list.");
    }

    if (this.quickVisit.BillingTransaction.Change < 0) {
      validationSummary.isValid = false;
      validationSummary.message.push("Change/Return cannot be less than zero");
    }

    if (this.IsAPFIntegrationEnabled && !(this.quickVisit.Patient.listOfPatientIdsUsingSameDependentId.some(a => a == this.quickVisit.Patient.PatientId)) && this.quickVisit.Patient.APFPatientDependentIdCount >= this.SameDependentIdApplicableCount) {
      validationSummary.isValid = false;
      validationSummary.message.push("Sorry, This DependentId Is Already Used " + this.quickVisit.Patient.APFPatientDependentIdCount + " Times.");
    }

    if (this.quickVisit.Patient.PatientScheme.RegistrationSubCase == "work related" && this.quickVisit.Patient.PatientScheme.PolicyHolderEmployerID == "") {
      validationSummary.isValid = false;
      validationSummary.message.push("Employer Detail is mandatory for work related RegistrationSubCase.");
    }

    return validationSummary;



  }
  // private CheckCreditLimits(validationSummary: { isValid: boolean; message: any[]; }): void {
  //   const unlimitedCreditLimitIdentifier = -1;
  //   if (!this.quickVisit.Patient.IsMedicarePatient && this.quickVisit.Patient.PatientScheme.PolicyNo && (this.quickVisit.Patient.PatientScheme.OpCreditLimit !== unlimitedCreditLimitIdentifier && (this.quickVisit.Patient.PatientScheme.OpCreditLimit === 0 || this.quickVisit.Patient.PatientScheme.OpCreditLimit < this.quickVisit.BillingTransaction.CoPaymentCreditAmount))) {
  //     validationSummary.isValid = false;
  //     validationSummary.message.push("Credit Limit must be greater than zero");
  //   }
  //   if (this.quickVisit.Patient.IsMedicarePatient && !this.CheckMedicarePatientBillingValidations()) {
  //     validationSummary.isValid = false;
  //     validationSummary.message.push("Credit Amount cannot exceed Credit limit.");
  //   }
  // }

  //handles appointment type differently.
  //in case of transfer, first return last visit's billing info, make the last visit's IsActive=false.
  CheckAppointmentTypeAndCreateVisit() {
    if (this.quickVisit.Visit.AppointmentType.toLowerCase() === "transfer" && this.visitService.ParentVisitInvoiceDetail) {
      this.previousVisitBillingTxn = this.visitService.ParentVisitInvoiceDetail;

      //sud:26June'19-- For transfer visit, we've to add Last visit's Id as ParentVisitId.
      this.quickVisit.Visit.ParentVisitId = this.visitService.ParentVisitInfo.PatientVisitId;
      this.quickVisit.Visit.PrescriberId = this.visitService.ParentVisitInfo.PerformerId;//this is provider id of last visit.

      this.ReturnPreviousVisitBillingTxnAndCreateVisit();
    }
    else if (this.quickVisit.Visit.AppointmentType.toLowerCase() === "referral") {
      this.quickVisit.Visit.ParentVisitId = this.visitService.ParentVisitInfo.PatientVisitId;
      this.quickVisit.Visit.ReferredById = this.visitService.ParentVisitInfo.PerformerId;//this is provider id of last visit.
      this.CreateVisit();
    }
    else {
      this.CreateVisit();
    }
  }
  //Hom 28 Jan'19 Incase of transfer with package billing assigning the values of returned package items to generate a new invoice
  public AssignValuesToBillTxn() {
    this.quickVisit.BillingTransaction.DiscountAmount = 0;
    this.quickVisit.BillingTransaction.TaxTotal = 0;
    this.quickVisit.BillingTransaction.TaxableAmount = 0;
    this.quickVisit.BillingTransaction.NonTaxableAmount = 0;
    this.quickVisit.BillingTransaction.SubTotal = 0;
    this.quickVisit.BillingTransaction.TotalAmount = 0;
    //this.quickVisit.BillingTransaction.Tender = 0;
    this.quickVisit.BillingTransaction.TotalQuantity = 0;
    //sud:22Jul'19--If there's any item in previous visit (transfer case) we've to remove the OPD and add current OPD price in it..

    if (this.previousVisitBillingTxn) {

      if (this.previousVisitBillingTxn.BillingTransactionItems.length > 0) {
        //itemid should be that of previous provider id, rather than current providerid.
        console.log(this.visitService.ParentVisitInfo);
        //get both Doctor and Department of Parent Visit, so that we can remove either of them based on condition.
        let parentVisitDeptId = this.visitService.ParentVisitInfo.DepartmentId;
        let parentVisitDocId = this.visitService.ParentVisitInfo.PerformerId;

        //Priority for searching is : 1-Serch for doctor bill Item, if not found then only search for DepartmentBillItem.
        //If doctor was selected in parent visit, then find the doctor's bill item and remove it.
        if (parentVisitDocId) {

          //we have two servicedepartments for Doctor OPD, one for Old and another for new patient.
          //ServiceDepartmentName of Doctor is HardCoded: -- make sure it remains the same, else it won't work.
          var index = this.previousVisitBillingTxn.BillingTransactionItems.findIndex(i =>
            (i.ServiceDepartmentName === "OPD" || i.ServiceDepartmentName === "Doctor OPD Old Patient")
            && i.ItemId == parentVisitDocId);

          //if item is found then it's index will be 0 or above, it'll be -1 if not found.
          if (index != null && index > -1) {
            this.previousVisitBillingTxn.BillingTransactionItems.splice(index, 1);
          }
        }
        else if (parentVisitDeptId) {
          //Else there should always be a department. so find the department's bill item and remove it.

          //let deptOpdItemsOfPrevBill = this.previousVisitBillingTxn.BillingTransactionItems
          //  .filter(a => a.ServiceDepartmentName == "Department OPD"
          //    || a.ServiceDepartmentName == "Department OPD Old Patient");

          //we have two servicedepartments for Department OPD, one for Old and another for new patient.
          //ServiceDepartmentName of Department is HardCoded: 'Department OPD'  -- make sure it remains the same, else it won't work.
          var index = this.previousVisitBillingTxn.BillingTransactionItems.findIndex(i =>
            (i.ServiceDepartmentName == "Department OPD" || i.ServiceDepartmentName == "Department OPD Old Patient")
            && i.ItemId == parentVisitDeptId);

          //if item is found then it's index will be 0 or above, it'll be -1 if not found.
          if (index != null && index > -1) {
            this.previousVisitBillingTxn.BillingTransactionItems.splice(index, 1);
          }

        }




        this.previousVisitBillingTxn.BillingTransactionItems.forEach(item => {
          this.quickVisit.BillingTransaction.BillingTransactionItems.push(item);
        });
      }
      if (this.previousVisitBillingTxn.PackageId != null && this.previousVisitBillingTxn.PackageName != null) {
        this.quickVisit.BillingTransaction.PackageId = this.previousVisitBillingTxn.PackageId;
        this.quickVisit.BillingTransaction.PackageName = this.previousVisitBillingTxn.PackageName;
      }
    }
    this.quickVisit.BillingTransaction.BillingTransactionItems.forEach(i => {
      this.totalAmount = i.TotalAmount + this.totalAmount;
      this.subTotal = i.SubTotal + this.subTotal;
      this.discountAmount = i.DiscountAmount + this.discountAmount;
      this.taxableAmount = i.TaxableAmount + this.taxableAmount;
      this.taxTotal = i.Tax + this.taxTotal;
      this.totalQuantity = i.Quantity + this.totalQuantity;
      this.nonTaxableAmount = i.NonTaxableAmount + this.nonTaxableAmount;
      this.discountPercent = i.DiscountPercent + i.DiscountPercentAgg;

    });
    this.quickVisit.BillingTransaction.TotalQuantity = CommonFunctions.parseAmount(this.totalQuantity);
    this.quickVisit.BillingTransaction.TotalAmount = CommonFunctions.parseAmount(this.totalAmount);
    this.quickVisit.BillingTransaction.SubTotal = CommonFunctions.parseAmount(this.subTotal);
    this.quickVisit.BillingTransaction.DiscountAmount = CommonFunctions.parseAmount(this.discountAmount);
    this.quickVisit.BillingTransaction.TaxableAmount = CommonFunctions.parseAmount(this.taxableAmount);
    this.quickVisit.BillingTransaction.TaxTotal = CommonFunctions.parseAmount(this.taxTotal);
    //this.quickVisit.BillingTransaction.Tender = CommonFunctions.parseAmount(this.totalAmount);
    this.quickVisit.BillingTransaction.Tender = CommonFunctions.parseAmount(this.quickVisit.BillingTransaction.Tender);
    this.quickVisit.BillingTransaction.NonTaxableAmount = CommonFunctions.parseAmount(this.nonTaxableAmount);
    this.quickVisit.BillingTransaction.DiscountPercent = CommonFunctions.parseAmount(this.discountPercent);
  }

  //in case of transfer, first return last visit's billing info,
  ReturnPreviousVisitBillingTxnAndCreateVisit() {
    this.visitBLService.PostReturnTransaction(this.previousVisitBillingTxn, "transfer-visit")
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {

          this.AssignValuesToBillTxn();
          this.CreateVisit();

        }
        else {
          this.loading = false;
          this.msgBoxServ.showMessage("failed", ["Unable to return previous visit billing transaction."]);
          console.log(res.ErrorMessage);
        }

      });
  }
  CreateVisit() {
    this.loading = true;
    if (this.loading) {
      this.quickVisit.CareTaker = this.quickVisit.Patient.CareTaker;
      this.SanitizePatientDataForSubmission();

      this.quickVisit.BillingTransaction.BillingTransactionItems.forEach(a => {
        a.OrderStatus = ENUM_OrderStatus.Active;
      });
      this.quickVisit.BillingTransaction.InvoiceType = ENUM_InvoiceType.outpatient;

      //!Krishna, 5thApril'23, Below code is to add Ticket Charge in Visit.
      const ticketCharge = this.quickVisit.BillingTransaction.BillingTransactionItems.reduce((acc, curr) => acc + curr.TotalAmount, 0);
      const decimalPrecisionValue = 4;
      this.quickVisit.Visit.TicketCharge = CommonFunctions.parseAmount(ticketCharge, decimalPrecisionValue);
      this.quickVisit.BillingTransaction.BillingTransactionItems.forEach(a => a.BillingType = ENUM_BillingType.outpatient);
      if (this.quickVisit.BillingTransaction.PaymentMode.toLowerCase() !== ENUM_BillPaymentMode.credit.toLowerCase()) {
        this.quickVisit.BillingTransaction.OrganizationId = null;
        this.quickVisit.BillingTransaction.OrganizationName = null;
      }

      //! Krishna, 16thMay'23, Add A logic to validate the limit and avoid visit creation if limit is exceeding, Only allow to create visit if TotalBillAmount is not exceeding limit.
      if ((this.RegistrationSchemeDetail.IsCreditLimited || this.RegistrationSchemeDetail.IsGeneralCreditLimited) && !this.CheckCreditLimitsAndHandleCreditLimits()) {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Credit Limit exceeded, Cannot Proceed"]);
        this.loading = false;
        return;
      }
      this.quickVisit.Visit.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
      this.quickVisit.Visit.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.visitBLService.PostVisitToDB(this.quickVisit)
        .subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
              this.CallBackCreateVisit(res);
            }
            else {
              this.loading = false;
              this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            }
          },
          err => {
            this.loading = false;
            this.msgBoxServ.showMessage("failed", ["Unable to create visit"]);

          });
    }
  }

  CheckCreditLimitsAndHandleCreditLimits(): boolean {
    let isValid = false;
    //* Here we will compare limit with total bill amount as we reduce limit with Total Bill Amount(not only credit amount in case of CoPayment);
    const totalBillAmount = this.quickVisit.BillingTransaction.TotalAmount;
    let creditLimit = 0;
    if (this.RegistrationSchemeDetail.IsGeneralCreditLimited) {
      creditLimit = this.quickVisit.Patient.PatientScheme.GeneralCreditLimit;
    }
    if (this.RegistrationSchemeDetail.IsCreditLimited) {
      creditLimit = this.quickVisit.Patient.PatientScheme.OpCreditLimit;
    }
    if (creditLimit >= totalBillAmount) {
      isValid = true;
    }
    return isValid;
  }

  /**
   During call back,
   Map current BillingTransaction to BillingReceiptModel and navigate to Billing>ReceiptPrint
   Update Appointment Status if the flow is from appointment.
   */


  //sud:18May'21--To display Invoice from here
  public bil_InvoiceNo: number = 0;
  public bil_FiscalYrId: number = 0;
  public bil_BilTxnId: number = null;//sud:15Sept--For BillingInvoice Print Correction

  CallBackCreateVisit(res) {
    if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
      let bilTxn = res.Results.BillingTransaction;
      this.bil_InvoiceNo = bilTxn.InvoiceNo;
      this.bil_FiscalYrId = bilTxn.FiscalYearId;
      this.bil_BilTxnId = bilTxn.BillingTransactionId;
      this.showbillingReceipt = true;
      this.UpdateAppointmentStatus();
      if (this.routeFromService && this.routeFromService.RouteFrom === "onlineappointment") {
        this.updateVisitStatusInTelemedicine(this.appointmentService.GlobalTelemedPatientVisitID);
        this.updatePaymentStatus(this.appointmentService.GlobalTelemedPatientVisitID);
      }
      this.selectedVisit = res.Results.Visit;
      if (!this.quickVisit.Visit.IsFreeVisit) {
        this.showSticker = true;
        this.showOpdSticker = true;
      }
      this.showPrintingPopup = true;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
      console.log(res.ErrorMessage)

    }
  }

  updateVisitStatusInTelemedicine(visitId) {
    visitId && this.visitBLService.updateVisitStatusInTelemedicine(this.teleMedicineConfiguration.TeleMedicineBaseUrl, visitId, "completed").subscribe(res => {

    },
      err => {
        this.msgBoxServ.showMessage("error", ["Unable to Update visitStatus in Telemedicine"]);
      })
  }

  updatePaymentStatus(visitId) {
    visitId && this.visitBLService.updatePaymentStatusInTelMed(this.teleMedicineConfiguration.TeleMedicineBaseUrl, visitId).subscribe(res => {

    },
      err => {
        this.msgBoxServ.showMessage("error", ["Unable to Update paymentStatus in Telemedicine"]);
      })
  }


  UpdateAppointmentStatus() {
    let appointment = this.appointmentService.getGlobal();
    let PerformerId = this.quickVisit.Visit.PerformerId;
    let PerformerName = this.quickVisit.Visit.PerformerName;
    if (appointment.AppointmentId) {
      try {
        this.visitBLService.UpdateAppointmentStatus(appointment.AppointmentId, "checkedin", PerformerId, PerformerName)
          .subscribe(res => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
              console.log("appointment status of apptId:" + appointment.AppointmentId + " updated successfully. ");
            }
            else {
              console.log("couldn't update status of appointment id: " + appointment.AppointmentId);
            }
          });


      } catch (ex) {
        console.log("couldn't update status of appointment id: " + appointment.AppointmentId);
        //do nothing here..
      }
    }
  }

  //End: Post Visit



  //we're storing Age and Age unit in a single column.
  SanitizePatientDataForSubmission() {
    //do concatenation only if Age is there in NUMBER format
    if (this.quickVisit.Patient.Age && this.quickVisit.Patient.AgeUnit && !isNaN(+this.quickVisit.Patient.Age)) {
      this.quickVisit.Patient.Age = this.quickVisit.Patient.Age + this.quickVisit.Patient.AgeUnit;
    }

    //Trim Spaces from Patient FirstName, MiddleName and LastName
    if (this.quickVisit.Patient && this.quickVisit.Patient.FirstName) {
      this.quickVisit.Patient.FirstName = this.quickVisit.Patient.FirstName.trim();
    }
    if (this.quickVisit.Patient && this.quickVisit.Patient.MiddleName) {
      this.quickVisit.Patient.MiddleName = this.quickVisit.Patient.MiddleName.trim();
    }
    if (this.quickVisit.Patient && this.quickVisit.Patient.LastName) {
      this.quickVisit.Patient.LastName = this.quickVisit.Patient.LastName.trim();
    }
  }



  PatientDuplicateWarningBoxOnClose($event) {
    var action = $event.action;
    var data = $event.data;

    if (action === "use-existing") {
      let patientId = data;
      this.AssignMatchedPatientAndProceed(patientId); //Match Existing Patient and process
      //this.CheckAppointmentTypeAndCreateVisit();
    }
    else if (action === "add-new") {
      this.CheckAppointmentTypeAndCreateVisit();
    }
    else if (action === "close") {
      this.showExstingPatientListPage = false;
    }
    this.loading = false;
  }

  //this function is hotkeys when pressed by user
  hotkeys(event) {
    if (event.keyCode === 27) {
      this.router.navigate(["/Appointment/PatientSearch"]);
      this.showPrintingPopup = false;
      this.router.navigate(["/Appointment/PatientSearch"]);
    }

    if (event.altKey) {
      switch (event.keyCode) {
        case 80: {// => ALT+P comes here
          if (!this.loading) {
            this.loading = true;
            this.CheckExistingPatientsAndSubmit();
          }
          break;
        }
        default:
          break;
      }
    }
  }


  //sud:16May'21--Moving Invoice Printing as Popup
  public CloseInvoicePrint() {
    this.showPrintingPopup = false;
    this.router.navigate(["/Appointment/PatientSearch"]);
  }

  // CheckMedicarePatientBillingValidations(): boolean {
  //   let isValid = false;
  //   if (this.quickVisit.Patient.IsMedicareMemberEligibleForRegistration) {
  //     isValid = true;
  //   }
  //   if (this.quickVisit.Patient.PatientScheme.OpCreditLimit >= this.quickVisit.BillingTransaction.CoPaymentCreditAmount) {
  //     isValid = true;
  //   } else {
  //     isValid = false;
  //   }
  //   return isValid;
  // }




  public schemeId_old: number = 0;
  public schemeObj_old: RegistrationScheme_DTO = new RegistrationScheme_DTO();
  OnRegistrationSchemeChanged(scheme: RegistrationScheme_DTO) {
    console.log("RegistrationSchemeChange called from Visit-Main.component");
    console.log(scheme);
    this.RegistrationSchemeDetail = scheme;
    this.IsPatientEligibleForService = this.RegistrationSchemeDetail.IsPatientEligibleForService;
    const newSchemeObj = _.cloneDeep(scheme);
    if (newSchemeObj && newSchemeObj.SchemeId) {
      this.isValidSchemeSelected = true;
      if (_.isEqual(newSchemeObj, this.schemeObj_old)) {
        return;
      } else {
        // this.quickVisit.Patient.MembershipTypeId = newSchemeObj.SchemeId;
        newSchemeObj.PatientScheme.LatestClaimCode = newSchemeObj.ClaimCode;
        newSchemeObj.PatientScheme.PolicyNo = newSchemeObj.MemberNo;
        newSchemeObj.PatientScheme.SubSchemeId = newSchemeObj.SubSchemeId;
        if (newSchemeObj.SchemeApiIntegrationName === ENUM_Scheme_ApiIntegrationNames.SSF && newSchemeObj.ssfPatientDetail && newSchemeObj.ssfPatientDetail.FirstName && !this.quickVisit.Patient.PatientId) {
          const patient = this.GetPatientMappedFromRegistrationSchemeDto(newSchemeObj.ssfPatientDetail); //! Krishna, 26thMarch'23 We need this logic for SSF, Medicare, etc
          this.quickVisit.Patient.FirstName = patient.FirstName
          this.quickVisit.Patient.LastName = patient.LastName
          this.quickVisit.Patient.MiddleName = patient.MiddleName
          this.quickVisit.Patient.Address = patient.Address
          this.quickVisit.Patient.DateOfBirth = patient.DateOfBirth
          this.quickVisit.Patient.Gender = patient.Gender
          this.quickVisit.Patient.Age = patient.Age
        }
        this.quickVisit.Patient.PatientScheme = this.GetPatientSchemeMappedFromRegistrationSchemeDto(newSchemeObj.PatientScheme);
        this.quickVisit.Patient.PatientScheme.LatestClaimCode = newSchemeObj.ClaimCode;
        this.quickVisit.Visit.SchemeId = newSchemeObj.SchemeId;
        this.quickVisit.Visit.ClaimCode = newSchemeObj.ClaimCode;
        this.quickVisit.BillingTransaction.ClaimCode = newSchemeObj.ClaimCode;
        this.quickVisit.BillingTransaction.SchemeId = newSchemeObj.SchemeId;
        this.quickVisit.Visit.ClaimCode = newSchemeObj.ClaimCode;
        this.quickVisit.Visit.PriceCategoryId = newSchemeObj.PriceCategoryId;
        this.quickVisit.BillingTransaction.MemberNo = newSchemeObj.MemberNo;
        this.quickVisit.BillingTransaction.ClaimCode = newSchemeObj.ClaimCode;
        this.schemeObj_old = newSchemeObj;
        this.visitService.TriggerSchemeChangeEvent(newSchemeObj);

      }

      // if (this.RegistrationSchemeDetail.IsCreditLimited) {
      //   this.GetPatientCreditLimitsByScheme(this.RegistrationSchemeDetail.SchemeId, this.quickVisit.Patient.PatientId, ENUM_ServiceBillingContext.OpBilling);
      // }

    }
    else {
      this.isValidSchemeSelected = false;
    }

  }

  GetPatientSchemeMappedFromRegistrationSchemeDto(patientSchemeObj: PatientScheme_DTO): PatientScheme {
    const patientScheme = new PatientScheme();

    patientScheme.PatientId = patientSchemeObj.PatientId !== null ? patientSchemeObj.PatientId : 0;
    patientScheme.PatientCode = patientSchemeObj.PatientCode !== null ? patientSchemeObj.PatientCode : null;
    patientScheme.SchemeId = patientSchemeObj.SchemeId;
    patientScheme.PolicyNo = patientSchemeObj.PolicyNo;
    patientScheme.PatientSchemeValidator.get("PolicyNo").setValue(patientScheme.PolicyNo);
    patientScheme.PolicyHolderUID = patientSchemeObj.PolicyHolderUID;
    patientScheme.OpCreditLimit = patientSchemeObj.OpCreditLimit;
    patientScheme.IpCreditLimit = patientSchemeObj.IpCreditLimit;
    patientScheme.GeneralCreditLimit = patientSchemeObj.GeneralCreditLimit;
    patientScheme.PolicyHolderEmployerName = patientSchemeObj.PolicyHolderEmployerName;
    patientScheme.LatestClaimCode = patientSchemeObj.LatestClaimCode;
    patientScheme.OtherInfo = patientSchemeObj.OtherInfo;
    patientScheme.PolicyHolderEmployerID = patientSchemeObj.PolicyHolderEmployerID;
    patientScheme.SubSchemeId = patientSchemeObj.SubSchemeId;
    patientScheme.RegistrationCase = patientSchemeObj.RegistrationCase;

    return patientScheme;
  }
  GetPatientMappedFromRegistrationSchemeDto(ssfPatientDetail: SsfPatient_DTO): Patient {
    const patient = new Patient();
    patient.FirstName = ssfPatientDetail.FirstName;
    patient.LastName = ssfPatientDetail.LastName;
    patient.MiddleName = "";
    patient.Address = ssfPatientDetail.Address;
    patient.DateOfBirth = ssfPatientDetail.DateOfBirth;
    patient.Gender = ssfPatientDetail.Gender;
    patient.Age = this.CalculateAge(ssfPatientDetail.DateOfBirth);
    return patient;
  }

  CalculateAge(dateOfBirth) {
    let dobYear: number = Number(moment(dateOfBirth).format("YYYY"));
    if (dobYear > 1920) {
      return String(Number(moment().format("YYYY")) - Number(moment(dateOfBirth).format("YYYY")));
    }
  }
  // GetPatientCreditLimitsByScheme(schemeId: number, patientId: number, serviceBillingContext: string) {
  //   this.CreditLimit = 0;
  //   this.visitBLService.GetPatientCreditLimitsByScheme(schemeId, patientId, serviceBillingContext).subscribe((res: DanpheHTTPResponse) => {
  //     if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
  //       this.CreditLimit = res.Results;
  //     } else {
  //       this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to get Credit Limit"]);
  //     }
  //   });
  // }

  handleConfirm() {
    this.loading = true;
    this.CheckExistingPatientsAndSubmit();
  }

  handleCancel() {
    this.loading = false;
  }
}
