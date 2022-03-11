import { Component, ChangeDetectorRef } from '@angular/core';
import { QuickVisitVM } from '../../../appointments/shared/quick-visit-view.model';
import { PatientService } from '../../../patients/shared/patient.service';
import { SecurityService } from '../../../security/shared/security.service';
import { CallbackService } from '../../../shared/callback.service';
import { CommonFunctions } from "../../../shared/common.functions";
import { Router } from '@angular/router';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { BillingReceiptModel } from '../../../billing/shared/billing-receipt.model';
import { RouteFromService } from '../../../shared/routefrom.service';
import { Visit } from '../../../appointments/shared/visit.model';
import { BillingTransaction } from '../../../billing/shared/billing-transaction.model';
import { Patient } from '../../../patients/shared/patient.model';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { Subscription } from 'rxjs';
import { ENUM_VisitType, ENUM_OrderStatus, ENUM_InvoiceType } from '../../../shared/shared-enums';
import { CoreService } from '../../../core/shared/core.service';
import { InsuranceService } from '../../shared/ins-service';
import { InsuranceBlService } from '../../shared/insurance.bl.service';

@Component({
  selector: "ins-new-visit-main",
  templateUrl: "./ins-new-visit-main.html",
  host: { '(window:keydown)': 'hotkeys($event)' }

})
export class InsuranceVisitMainComponent {

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
  public isPhoneMandatory: boolean = true;

  public selectedVisit: Visit = new Visit();


  //sud:19May'21-- We now have 3 variables to manage the printing.
  //below is the structure..
  //<printPopup><billingreceipt/><opdSticker/></printPopup>
  public showPrintingPopup: boolean = false;
  public showbillingReceipt: boolean = false;
  public showOpdSticker: boolean = false;

  constructor(public coreService: CoreService,
    public insuranceService: InsuranceService,
    public insuranceBLService: InsuranceBlService,
    public securityService: SecurityService,
    public callBackService: CallbackService,
    public router: Router,
    public msgBoxServ: MessageboxService,
    public routeFromService: RouteFromService,
    public changeDetRef: ChangeDetectorRef,
    public patientService: PatientService
  ) {
    this.CheckAndSetCounter();
    this.Initialize();
    this.Loadparameters();
    this.CreditOrganizationMandatory = this.coreService.LoadCreditOrganizationMandatory();
    this.doctorChangedSubscription = insuranceService.ObserveBillChanged.subscribe(
      newBill => {
        if (newBill.ChangeType == "Doctor") {
          this.DepartmentLevelAppointment = newBill.enableDepartmentLevelAppointment;
        }
        if (newBill.ChangeType == "MembershipTypeValid") {
          this.MembershipTypeValid = newBill.MembershipTypeValid;
        }
      });

    this.isPhoneMandatory = this.coreService.GetIsPhoneNumberMandatory();
  }

  CheckAndSetCounter() {
    if (!this.securityService.getLoggedInCounter().CounterId) {
      this.callBackService.CallbackRoute = '/Appointment/PatientSearch'
      this.router.navigate(['/Billing/CounterActivate']);
    }
  }
  CheckPreviousClaimCodeandSubmit() {
    this.insuranceBLService.GetVisitList(this.quickVisit.Visit.ClaimCode, this.quickVisit.Visit.PatientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.prevVisitList = res.Results;
          if (this.prevVisitList && this.prevVisitList.length != 0) {
            this.msgBoxServ.showMessage('Failed', ["Claim code cannot be duplicate"]);
            this.msgBoxServ.showMessage('Failed', ["Please use another claim code"]);
            this.loading = false;
            return;
          }
          else {
            this.submitVisitDetails();
          }
        }
        else {
          this.msgBoxServ.showMessage('Failed', [res.ErrorMessage]);
          this.loading = false;
          return;
        }
      });
  }
  //set's patientIdfrom patientService and  appointment type from visitService.
  Initialize() {

    this.quickVisit.Visit = this.insuranceService.CreateNewVisitGlobal();
    if (this.routeFromService && this.routeFromService.RouteFrom && this.routeFromService.RouteFrom == "billing-qr-scan") {

      this.AssignPatInfoFromApptServiceToPatService();
      this.routeFromService.RouteFrom = "";
    }

    this.quickVisit.Patient = this.patientService.getGlobal();

    this.quickVisit.Patient.PatientId =
      this.quickVisit.Visit.PatientId =
      this.quickVisit.BillingTransaction.PatientId =
      this.patientService.getGlobal().PatientId;

    this.quickVisit.Visit.AppointmentType = this.insuranceService.appointmentType;

    this.quickVisit.Visit.VisitType = ENUM_VisitType.outpatient;// "outpatient";
    this.quickVisit.BillingTransaction.IsInsuranceBilling = this.insuranceService.isInsuranceBilling;

    //sud:13Jul'19--get patient's today's visit (not Returned) and check for DuplicateVisit in client side itself.
    this.LoadPatientsTodaysVisitListIntoService(this.patientService.getGlobal().PatientId);

  }


  //this was done for Billing-QR-Scan -> New Appointment. we may be able to re-use this if required/feasible.
  AssignPatInfoFromApptServiceToPatService() {
    let ipData: Patient = this.insuranceService.GlobalAppointmentPatient;
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

    this.insuranceService.PatientTodaysVisitList = [];
    var followup: boolean = true;
    this.insuranceBLService.GetPatientVisits_Today(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.insuranceService.PatientTodaysVisitList = res.Results;
        }
        else {
          this.insuranceService.PatientTodaysVisitList = [];
        }
      });


  }
  public EnableAutoGenerate: boolean = false;
  public ShowDoctor: boolean = false;
  Loadparameters() {
    let Parameter = this.coreService.Parameters;

    //EnableAutoGenerate
    let enableclaimcode = Parameter.filter(parms => parms.ParameterGroupName == 'Insurance' && parms.ParameterName == "ClaimCodeAutoGenerateSettings");
    let claimparmObj = JSON.parse(enableclaimcode[0].ParameterValue);
    this.EnableAutoGenerate = claimparmObj.EnableAutoGenerate;
    let displayfieldsParameter = Parameter.filter(parms => parms.ParameterGroupName == 'Insurance' && parms.ParameterName == "InsNewVisitDisplaySettings");
    let parmObj = JSON.parse(displayfieldsParameter[0].ParameterValue);
    this.ShowDoctor = parmObj.ShowDoctor;
    if (this.EnableAutoGenerate) {
      this.getClaimCode();
      this.quickVisit.Visit.EnableControl("ClaimCode", false);
    }
    else {
      this.quickVisit.Visit.ClaimCode = null;
      this.quickVisit.Visit.EnableControl("ClaimCode", true);
    }

  }

  getClaimCode() {
    try {
      this.insuranceBLService.GetClaimCode()
        .subscribe(res => {
          if (res.Status == "OK")
            this.quickVisit.Visit.ClaimCode = res.Results;
        });
    }
    catch (ex) {

    }
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

      //this.CheckPreviousClaimCodeandSubmit();
      this.submitVisitDetails();
    }
    else {
      this.loading = false;//re-enable the print-invoice button if validation
      this.msgBoxServ.showMessage("failed", valSummary.message);
      //this.msgBoxServ.showMessage("failed", ["Please check all mandatory fields again."]);
    }
  }

  public submitVisitDetails() {
    //Check for duplicates for new patient. 
    if (!this.quickVisit.Patient.PatientId) {
      let age = this.quickVisit.Patient.Age + this.quickVisit.Patient.AgeUnit;
      this.insuranceBLService.GetExistedMatchingPatientList(this.quickVisit.Patient.FirstName, this.quickVisit.Patient.LastName, this.quickVisit.Patient.PhoneNumber, age, this.quickVisit.Patient.Gender)
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

    if (!this.ShowDoctor) {
      this.quickVisit.Visit.UpdateValidator("off", "Doctor", null);
    }
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

    if (this.quickVisit.BillingTransaction.BillingTransactionItems.length > 0) {
      this.quickVisit.BillingTransaction.BillingTransactionItems.forEach(itm => {
        if (itm.ItemName == '' || itm.ItemName == undefined || itm.ItemName == null) {
          validationSummary.isValid = false;
          validationSummary.message.push("Item Name Required");
        }
      })
    }
    if (this.quickVisit.BillingTransaction.IsInsuranceBilling
      && this.insuranceService.Insurance
      && this.insuranceService.Insurance.Ins_InsuranceBalance < this.quickVisit.BillingTransaction.TotalAmount) {
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
      // if (this.quickVisit.BillingTransaction.Remarks == null) {
      //   validationSummary.isValid = false;
      //   validationSummary.message.push("Remarks is Mandatory for Credit Payment Mode.");
      // } 
      if (this.CreditOrganizationMandatory && this.quickVisit.BillingTransaction.OrganizationId == 0) {
        validationSummary.isValid = false;
        validationSummary.message.push("Credit Orgainzation is mandatory for Credit Payment mode")
      }
    }
    //if (!val) {
    // if (!(this.quickVisit.BillingTransaction.BillingTransactionItems.every(a => a.GovtInsurancePrice != null && a.GovtInsurancePrice > 0))) {
    //   validationSummary.isValid = false;
    //   validationSummary.message.push("Price of Item cannot be zero (0)");
    // }
    //    }

    this.quickVisit.BillingTransaction.BillingTransactionItems.forEach(element => {
      if (element.IsZeroPriceAllowed == false || element.IsZeroPriceAllowed == null) {
        if (!(element.GovtInsurancePrice != null && element.GovtInsurancePrice > 0)) {
          validationSummary.isValid = false;
          validationSummary.message.push("Price of Item cannot be zero (0)");
        }
      }
    });

    if (this.quickVisit.BillingTransaction.DiscountPercent > 100 || this.quickVisit.BillingTransaction.DiscountPercent < 0) {
      validationSummary.isValid = false;
      validationSummary.message.push("Discount percent should be between 0 and 100.");

    }

    //start: sud:13Jul'19--Check if this patient already has visit with same Doctor/Department on today.
    //We should restrict to create duplicate visit. This logic was used only in server side till now.
    let patId = this.quickVisit.Patient.PatientId;
    let deptId = this.quickVisit.Visit.DepartmentId;
    let doctId = this.quickVisit.Visit.ProviderId;

    if (this.insuranceService.HasDuplicateVisitToday(patId, deptId, doctId, this.insuranceService.PatientTodaysVisitList)) {
      validationSummary.isValid = false;
      validationSummary.message.push("Patient already has appointment with same Department today.");

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
    if (this.quickVisit.Visit.AppointmentType.toLowerCase() == "transfer" && this.insuranceService.ParentVisitInvoiceDetail) {
      this.previousVisitBillingTxn = this.insuranceService.ParentVisitInvoiceDetail;

      //sud:26June'19-- For transfer visit, we've to add Last visit's Id as ParentVisitId.
      this.quickVisit.Visit.ParentVisitId = this.insuranceService.ParentVisitInfo.PatientVisitId;
      this.quickVisit.Visit.TransferredProviderId = this.insuranceService.ParentVisitInfo.ProviderId;//this is provider id of last visit.

      this.ReturnPreviousVisitBillingTxnAndCreateVisit();
    }
    else if (this.quickVisit.Visit.AppointmentType.toLowerCase() == "referral") {
      this.quickVisit.Visit.ParentVisitId = this.insuranceService.ParentVisitInfo.PatientVisitId;
      this.quickVisit.Visit.ReferredByProviderId = this.insuranceService.ParentVisitInfo.ProviderId;//this is provider id of last visit.
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
        console.log(this.insuranceService.ParentVisitInfo);
        //get both Doctor and Department of Parent Visit, so that we can remove either of them based on condition.
        let parentVisitDeptId = this.insuranceService.ParentVisitInfo.DepartmentId;
        let parentVisitDocId = this.insuranceService.ParentVisitInfo.ProviderId;

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
    this.insuranceBLService.PostReturnTransaction(this.previousVisitBillingTxn, "transfer-visit")
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
      a.Price = a.GovtInsurancePrice;
      a.IsInsurance = true;//sud:1-Oct'21-- setting isinsurance in item level as well..
    });
    this.quickVisit.BillingTransaction.InvoiceType = ENUM_InvoiceType.outpatient;
    this.insuranceBLService.PostVisitToDB(this.quickVisit)
      .subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {

            //this.CallBackCreateVisit(res);

            let bilTxn = res.Results.BillingTransaction;
            this.bil_FiscalYrId = bilTxn.FiscalYearId;
            this.bil_BilTxnId = bilTxn.BillingTransactionId;
            this.bil_InvoiceNo = bilTxn.InvoiceNo;
            this.showbillingReceipt = true;

            this.selectedVisit = res.Results.Visit;
            this.showOpdSticker = true;

            this.showPrintingPopup = true;

            this.loading = false;
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
   Map current BillingTransaction to BillingReceiptModel and navigate to Billing>ReceiptPrint
   Update Appointment Status if the flow is from appointment.
   */

  //sud:19May'21-- No need of redirect to receipt print page, we're now managing thatr from reusable component.
  // public billingReceipt: BillingReceiptModel = new BillingReceiptModel();
  // CallBackCreateVisit(res) {
  //   if (res.Status == "OK" && res.Results) {

  //     let opdReceipt = BillingReceiptModel.GetReceiptForTransaction(bilTxn);
  //     opdReceipt.IsValid = true;
  //     opdReceipt.Patient = res.Results.Patient;
  //     opdReceipt.VisitId = res.Results.Visit.PatientVisitId;
  //     opdReceipt.QueueNo = res.Results.Visit.QueueNo;
  //     opdReceipt.Remarks = res.Results.BillingTransaction.Remarks;
  //     opdReceipt.CurrentFinYear = res.Results.BillingTransaction.FiscalYear;//this comes from server side.  
  //     opdReceipt.BillingUser = res.Results.BillingTransaction.BillingUserName; //Yubraj 28th June '19
  //     opdReceipt.BillingType = "opd-billing";
  //     let visitType = res.Results.Visit.VisitType;
  //     this.routeFromService.RouteFrom = (visitType == "emergency" ? "ER-Sticker" : "OPD");
  //     opdReceipt.OrganizationId = res.Results.BillingTransaction.OrganizationId;
  //     opdReceipt.OrganizationName = this.quickVisit.BillingTransaction.OrganizationName;
  //     opdReceipt.AppointmentType = this.quickVisit.Visit.AppointmentType;
  //     opdReceipt.DeptRoomNumber = this.quickVisit.Visit.DeptRoomNumber;
  //     opdReceipt.Ins_NshiNumber = res.Results.Patient.Ins_NshiNumber;
  //     opdReceipt.ClaimCode = res.Results.Visit.ClaimCode;
  //     if (opdReceipt.IsInsuranceBilling) {
  //       opdReceipt.IMISCode = this.insuranceService.Insurance.IMISCode;
  //     }

  //     this.insuranceService.globalBillingReceipt = opdReceipt;
  //     this.insuranceService.ClaimCode = this.quickVisit.Visit.ClaimCode;
  //     this.UpdateAppointmentStatus();
  //     this.billingReceipt = this.insuranceService.globalBillingReceipt;
  //     this.showbillingReceipt = true;
  //     this.selectedVisit = res.Results.Visit;
  //     this.showOpdSticker = true;
  //   }
  //   else {
  //     this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
  //     console.log(res.ErrorMessage)

  //   }
  // }


  UpdateAppointmentStatus() {

    let appointment = this.insuranceService.GetInsAppointment();
    let providerId = this.quickVisit.Visit.ProviderId;
    let providerName = this.quickVisit.Visit.ProviderName;
    if (appointment.AppointmentId) {
      try {
        this.insuranceBLService.UpdateAppointmentStatus(appointment.AppointmentId, "checkedin", providerId, providerName)
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

  //this function is hotkeys when pressed by user
  hotkeys(event) {
    if (event.altKey) {
      switch (event.keyCode) {
        case 80: {// => ALT+P (Print Invoice Shortcut) comes here
          this.CheckExistingPatientsAndSubmit();
          break;
        }
        default:
          break;
      }
    }

    if (event.keyCode == 27) {
      this.CloseInvoicePrint();
    }

  }

  AfterPrintAction($event) {
    this.showOpdSticker = $event.showOpdSticker;
  }


  //sud:19May'21--needed to print invoice.
  public bil_InvoiceNo: number = 0;
  public bil_FiscalYrId: number = 0;
  public bil_BilTxnId: number = null;

  //sud:19May'21--Moving Invoice Printing as Popup
  public CloseInvoicePrint() {
    this.showPrintingPopup = false;
    this.router.navigate(["/Insurance/Patient"]);
  }
}
