/*
 Description:
    - It is the visit main component.
    - While creating a visit. - Assign patient properties to global patient, 
                              - Assign appointment properties to global appointment,
                              - By default AppointmentType="New" (visit.service), update AppointmentType in visit.service while creating visit.
                              - AppointmentType could be 1. New, 2. Transfer, 3. Referral, 4. Followup (Followup is handled by different component. Need to make the flow same for all type.)
    
    - It uses 3 other reusable components: visit-patient-info.component, visit-info.component,visit-billing-info.component.
    - It checks counter and navigates to activate counter if not activated.
    - It gets Doctor as event from visit-info.component and passes it as @Input to visit-billing-info.component as billing item.
    - It gets Membership Discount Percent as event from patient-info.component and passes it as @Input to visit-billing-info.component as discount percent.
    - It checks validations, checks exsiting patient if any and posts visit. 
    - While posting visit in the controller side. If PatientId=0, it registers the patient as well.
    - After posting it maps the billingtransaction-info to receipt model and navigates to receipt print component.
    - It also updates appointment status after posting visit if the flow is from appointment.
    
    TYPES OF VISITS:
        - New Visit: Creates a new visit with AppointmentType="New", IsVisitContinued=false and creates a new billing transaction.
        - Transfer: Creates a new visit with AppointmentType=Transfer.
                    Returns last visit's BillingTransaction and make last visit's IsActive=false
                    If last visit's billingtransaction contains health-card, by default check and add health card to billingTransaciton of this transfer visit.
                    Updates IsContineuedVisit= true to last visit and TransferredProviderId=last visit's ProviderId for current visit
                    ParentVisitId = last visit's VisitId
                    Only today's visit and visit with IsContinued = false can be transferred.
        - Referral: Creates a new visit with AppointmentType="Referral", ReferralProviderId = last visit's providerId
                    ParentVisitId = last visit's VisitId
                    Creates a new visit and new billing transaction.
        
 -------------------------------------------------------------------
 change history:
 -------------------------------------------------------------------
 S.No     UpdatedBy/Date             description           remarks
 -------------------------------------------------------------------
 1.       ashim/ 23rd Aug 2018           created            
                                                     
 -------------------------------------------------------------------
 */

import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { QuickVisitVM, VisitBillItemVM } from '../shared/quick-visit-view.model';
import { PatientService } from '../../patients/shared/patient.service';
import { SecurityService } from '../../security/shared/security.service';
import { CallbackService } from '../../shared/callback.service';
import { CommonFunctions } from "../../shared/common.functions";
import { Router } from '@angular/router';
import { BillingTransactionItem } from "../../billing/shared/billing-transaction-item.model";
import { VisitBLService } from '../shared/visit.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillingReceiptModel } from '../../billing/shared/billing-receipt.model';
import { RouteFromService } from '../../shared/routefrom.service';
import { BillingService } from '../../billing/shared/billing.service';
import { AppointmentService } from '../shared/appointment.service';
import { Visit } from '../shared/visit.model';

import { BillingBLService } from '../../billing/shared/billing.bl.service';
import { BillingTransaction } from '../../billing/shared/billing-transaction.model';
import { VisitService } from '../shared/visit.service';
import { NumericDictionary } from 'lodash';
import { isEmpty } from 'rxjs/operator/isEmpty';
import { Patient } from '../../patients/shared/patient.model';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { Subscription } from 'rxjs';
import { ENUM_VisitType, ENUM_OrderStatus } from '../../shared/shared-enums';
import { CoreService } from '../../core/shared/core.service';

@Component({
  selector: "visit-main",
  templateUrl: "./visit-main.html"
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
  public doctorChangedSubscription: Subscription;
  public MembershipTypeValid: boolean;
  public CreditOrganizationMandatory: boolean = false;

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
    public coreService: CoreService) {
    this.CheckAndSetCounter();
    this.Initialize();
    
    this.CreditOrganizationMandatory = this.coreService.LoadCreditOrganizationMandatory();
    this.doctorChangedSubscription = visitService.ObserveBillChanged.subscribe(
      newBill => {
        if (newBill.ChangeType == "Doctor") {
          this.DepartmentLevelAppointment = newBill.enableDepartmentLevelAppointment;
        }
        if (newBill.ChangeType == "MembershipTypeValid") {
          this.MembershipTypeValid = newBill.MembershipTypeValid;
        }
      });
  }

  CheckAndSetCounter() {
    if (!this.securityService.getLoggedInCounter().CounterId) {
      this.callBackService.CallbackRoute = '/Appointment/PatientSearch'
      this.router.navigate(['/Billing/CounterActivate']);
    }
  }
  CheckPreviousClaimCodeandSubmit() {
    this.visitBLService.GetVisitList(this.quickVisit.Visit.ClaimCode)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.prevVisitList = res.Results;
          if (this.prevVisitList && this.prevVisitList.length != 0) {
            this.msgBoxServ.showMessage('Failed', ["Claim code cannot be duplicate"]);
            this.loading = false;
            return;
          }
          else {
            this.submitVisitDetails();
          }
        }
        else {
          this.msgBoxServ.showMessage('Failed', [res.ErrorMessage]);
        }
      });
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

    this.quickVisit.Visit.VisitType = ENUM_VisitType.outpatient;// "outpatient";
    this.quickVisit.BillingTransaction.IsInsuranceBilling = this.billingService.isInsuranceBilling;

    //sud:13Jul'19--get patient's today's visit (not Returned) and check for DuplicateVisit in client side itself.
    this.LoadPatientsTodaysVisitListIntoService(this.patientService.getGlobal().PatientId);

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
    globalPat.MembershipTypeId = ipData.MembershipTypeId;
    globalPat.PANNumber = ipData.PANNumber;
    globalPat.Admissions = ipData.Admissions;
  }

  //sud:13Jul'19--get patient's today's visit (not Returned) and check for DuplicateVisit in client side itself.
  LoadPatientsTodaysVisitListIntoService(patientId: number) {

    this.visitService.PatientTodaysVisitList = [];
    var followup: boolean = true;
    this.visitBLService.GetPatientVisits_Today(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
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

      this.loading = false;
      if (!this.loading) {
        this.loading = true;
        if (this.quickVisit.BillingTransaction.IsInsuranceBilling) {
          this.CheckPreviousClaimCodeandSubmit();
        }
        else {
          this.submitVisitDetails();
        }
      }
    }
    else {
      this.msgBoxServ.showMessage("failed", valSummary.message);
      //this.msgBoxServ.showMessage("failed", ["Please check all mandatory fields again."]);
    }
  }

  public submitVisitDetails() {
    if (!this.quickVisit.Patient.PatientId) {
      this.visitBLService.GetExistedMatchingPatientList(this.quickVisit.Patient.FirstName, this.quickVisit.Patient.LastName, this.quickVisit.Patient.PhoneNumber, this.quickVisit.Patient.Age, this.quickVisit.Patient.Gender)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results.length) {
            this.matchedPatientList = res.Results;
            this.showExstingPatientListPage = true;
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
    this.quickVisit.Visit.PatientId =
      this.quickVisit.BillingTransaction.PatientId = this.quickVisit.Patient.PatientId;
    this.CreateVisit();
  }
  //it is the centralized function to check validations.
  //if any of the validation fails then isValid=false, error messages are pushed for each validations. 
  CheckValidations(): { isValid: boolean, message: Array<string> } {
    if (!this.quickVisit.BillingTransaction.IsInsuranceBilling) {
      this.quickVisit.Visit.UpdateValidator("off", "ClaimCode", null);
    }
    let validationSummary = { isValid: true, message: [] };

    //var val = this.DepartmentLevelAppointment;// ? this.DepartmentLevelAppointment: false;
    ////checking if DepartmentLevelAppointment is true then validation for Doctor should be disabled/
    //if (!val) {
    //  this.quickVisit.Visit.UpdateValidator("off", "Doctor", null);
    //}

    for (var i in this.quickVisit.Patient.PatientValidator.controls) {
      this.quickVisit.Patient.PatientValidator.controls[i].markAsDirty();
      this.quickVisit.Patient.PatientValidator.controls[i].updateValueAndValidity();
    }
    for (var i in this.quickVisit.Visit.VisitValidator.controls) {
      this.quickVisit.Visit.VisitValidator.controls[i].markAsDirty();
      this.quickVisit.Visit.VisitValidator.controls[i].updateValueAndValidity();
    }

    if ((!this.quickVisit.Patient.PatientId && !this.quickVisit.Patient.IsValidCheck(undefined, undefined))
      || !this.quickVisit.Visit.IsValidCheck(undefined, undefined) || !this.quickVisit.Visit.IsValidSelProvider) {
      validationSummary.isValid = false;
      validationSummary.message.push("Check all mandatory fields");
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
    if (this.quickVisit.BillingTransaction.PaymentMode == "credit") {
      if (this.quickVisit.BillingTransaction.Remarks == null) {
        validationSummary.isValid = false;
        validationSummary.message.push("Remarks is Mandatory for Credit Payment Mode.");
      }else if(this.CreditOrganizationMandatory && this.quickVisit.BillingTransaction.OrganizationId == 0) {
        validationSummary.isValid = false;
        validationSummary.message.push("Credit Orgainzation is mandatory for Credit Payment mode")
      }
    }
    //if (!val) {
    if (!(this.quickVisit.BillingTransaction.BillingTransactionItems.every(a => a.Price != null && a.Price > 0))) {
      validationSummary.isValid = false;
      validationSummary.message.push("Price of Item cannot be zero (0)");
    }
    //    }

    if (this.quickVisit.BillingTransaction.DiscountPercent > 100 || this.quickVisit.BillingTransaction.DiscountPercent < 0) {
      validationSummary.isValid = false;
      validationSummary.message.push("Discount percent should be between 0 and 100.");

    }

    //start: sud:13Jul'19--Check if this patient already has visit with same Doctor/Department on today.
    //We should restrict to create duplicate visit. This logic was used only in server side till now.
    let patId = this.quickVisit.Patient.PatientId;
    let deptId = this.quickVisit.Visit.DepartmentId;
    let doctId = this.quickVisit.Visit.ProviderId;

    if (this.visitService.HasDuplicateVisitToday(patId, deptId, doctId, this.visitService.PatientTodaysVisitList)) {
      validationSummary.isValid = false;
      validationSummary.message.push("Patient already has appointment with same Doctor today.");

    }
    //end: sud:13Jul'19--Check if this patient already has visit with same Doctor/Department on today.

    if (!this.MembershipTypeValid) {
      validationSummary.isValid = false;
      validationSummary.message.push("Select Membership Type from the list.");
    }

    if (this.quickVisit.BillingTransaction.Change < 0) {
      validationSummary.isValid = false;
      validationSummary.message.push("Change/Return cannot be less than zero");
    }

    //this.quickVisit.BillingTransaction.BillingTransactionItems.reduce((acc, obj) => {
    //  var existItem = acc.find(item => item.ItemId === obj.ItemId && item.ItemName === obj.ItemName);
    //  if (existItem) {
    //    validationSummary.isValid = false;
    //    validationSummary.message.push("Dublicate Additional bill Item");
    //  }
    //});

    //this.quickVisit.BillingTransaction.BillingTransactionItems.forEach(a => {
    //  var aa = this.quickVisit.BillingTransaction.BillingTransactionItems.find(b => b.ItemId === a.ItemId && b.ItemName === a.ItemName)
    //  console.log(aa);
    //});

    //if (this.quickVisit.BillingTransaction.BillingTransactionItems) {
    //  validationSummary.isValid = false;
    //  validationSummary.message.push("Dublicate Additional bill Item");
    //}

    return validationSummary;
  }
  //handles appointment type differently.
  //in case of transfer, first return last visit's billing info, make the last visit's IsActive=false.
  CheckAppointmentTypeAndCreateVisit() {
    if (this.quickVisit.Visit.AppointmentType.toLowerCase() == "transfer" && this.visitService.ParentVisitInvoiceDetail) {
      this.previousVisitBillingTxn = this.visitService.ParentVisitInvoiceDetail;

      //sud:26June'19-- For transfer visit, we've to add Last visit's Id as ParentVisitId.
      this.quickVisit.Visit.ParentVisitId = this.visitService.ParentVisitInfo.PatientVisitId;
      this.quickVisit.Visit.TransferredProviderId = this.visitService.ParentVisitInfo.ProviderId;//this is provider id of last visit.

      this.ReturnPreviousVisitBillingTxnAndCreateVisit();
    }
    else if (this.quickVisit.Visit.AppointmentType.toLowerCase() == "referral") {
      this.quickVisit.Visit.ParentVisitId = this.visitService.ParentVisitInfo.PatientVisitId;
      this.quickVisit.Visit.ReferredByProviderId = this.visitService.ParentVisitInfo.ProviderId;//this is provider id of last visit.
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
        let parentVisitDocId = this.visitService.ParentVisitInfo.ProviderId;

        //Priority for searching is : 1-Serch for doctor bill Item, if not found then only search for DepartmentBillItem.
        //If doctor was selected in parent visit, then find the doctor's bill item and remove it.
        if (parentVisitDocId) {

          //we have two servicedepartments for Doctor OPD, one for Old and another for new patient.
          //ServiceDepartmentName of Doctor is HardCoded: -- make sure it remains the same, else it won't work.
          var index = this.previousVisitBillingTxn.BillingTransactionItems.findIndex(i =>
            (i.ServiceDepartmentName == "OPD" || i.ServiceDepartmentName == "Doctor OPD Old Patient")
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
        if (res.Status == "OK") {

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
    this.ConcatinateAgeAndUnit();
    this.AssignInsuranceBillingRemarksToVisit();//need to check here.. sud: 13Jul'19
    this.quickVisit.BillingTransaction.BillingTransactionItems.forEach(a => {
      a.OrderStatus = ENUM_OrderStatus.Active;
    });
    
    this.visitBLService.PostVisitToDB(this.quickVisit)
      .subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.loading = false;
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
  AssignInsuranceBillingRemarksToVisit() {
    if (this.quickVisit.BillingTransaction.IsInsuranceBilling) {
      this.quickVisit.Visit.Remarks = this.quickVisit.BillingTransaction.Remarks;
    }
  }
  /**
   During call back, 
   Map current BillingTransaction to BillingReceiptModel and navigate to Billing/ReceiptPrint
   Update Appointment Status if the flow is from appointment.
   */
  CallBackCreateVisit(res) {
    if (res.Status == "OK" && res.Results) {

      let bilTxn = res.Results.BillingTransaction;
      let opdReceipt = BillingReceiptModel.GetReceiptForTransaction(bilTxn);
      opdReceipt.IsValid = true;
      opdReceipt.Patient = res.Results.Patient;
      opdReceipt.VisitId = res.Results.Visit.PatientVisitId;
      opdReceipt.QueueNo = res.Results.Visit.QueueNo;
      opdReceipt.Remarks = res.Results.BillingTransaction.Remarks;
      opdReceipt.CurrentFinYear = res.Results.BillingTransaction.FiscalYear;//this comes from server side. 
      //opdReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
      opdReceipt.BillingUser = res.Results.BillingTransaction.BillingUserName; //Yubraj 28th June '19
      opdReceipt.BillingType = "opd-billing";
      let visitType = res.Results.Visit.VisitType;
      this.routeFromService.RouteFrom = (visitType == "emergency" ? "ER-Sticker" : "OPD");
      opdReceipt.OrganizationId = res.Results.BillingTransaction.OrganizationId;
      opdReceipt.OrganizationName = this.quickVisit.BillingTransaction.OrganizationName;
      opdReceipt.AppointmentType = this.quickVisit.Visit.AppointmentType;
      if (opdReceipt.IsInsuranceBilling) {
        opdReceipt.IMISCode = this.billingService.Insurance.IMISCode;
      }

      this.billingService.globalBillingReceipt = opdReceipt;
      this.visitService.ClaimCode = this.quickVisit.Visit.ClaimCode;
      this.UpdateAppointmentStatus();
      this.router.navigate(['/Billing/ReceiptPrint']);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
      console.log(res.ErrorMessage)

    }
  }
  UpdateAppointmentStatus() {
    let appointment = this.appointmentService.getGlobal();
    let providerId = this.quickVisit.Visit.ProviderId;
    let providerName = this.quickVisit.Visit.ProviderName;
    if (appointment.AppointmentId) {
      try {
        this.visitBLService.UpdateAppointmentStatus(appointment.AppointmentId, "checkedin", providerId, providerName)
          .subscribe(res => {
            if (res.Status == "OK") {
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



  //incase of transfer we need to return previous billing transaction.
  //AssignPreviousVisitBillingTxn($event) {
  //  this.previousVisitBillingTxn = $event.previousVisitBillingTxn;
  //}


  //Gets doctor from visit-patient-info.component and updates the discount percent to visit-billing-info.component
  //below event also has: patient information. Propertyname=PatientInfo
  UpdateMembershipDiscountToBilling($event) {
    if ($event) {
      this.changeDetRef.detectChanges();
      this.membershipDiscountPercent = $event.DiscountPercent;
      this.patientCountryId = $event.CountryId;
    }
  }
  //we're storing Age and Age unit in a single column.
  ConcatinateAgeAndUnit() {
    if (this.quickVisit.Patient.Age && this.quickVisit.Patient.AgeUnit)
      this.quickVisit.Patient.Age = this.quickVisit.Patient.Age + this.quickVisit.Patient.AgeUnit;
  }

  //CloseExistingPatientWindow() {
  //  this.loading = false;
  //  this.showExstingPatientListPage = false;
  //}

  emitCloseAction($event) {
    var action = $event.action;
    var data = $event.data;

    if (action == "use-existing") {
      let patientId = data;
      this.AssignMatchedPatientAndProceed(patientId); //Match Existing Patient and process
      //this.CheckAppointmentTypeAndCreateVisit();
    }
    else if (action == "add-new") {
      this.CheckAppointmentTypeAndCreateVisit();
    }
    //else if (action == "update-patient") {
    //  this.UpdateAnyway();
    //}
    else if (action == "close") {
      this.showExstingPatientListPage = false;
    }
    this.loading = false;
  }
}
