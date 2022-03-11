import { Component, Directive, ViewChild } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core"
import { Visit } from '../shared/visit.model';
import { VisitBLService } from '../shared/visit.bl.service';
import { Employee } from '../../employee/shared/employee.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillingTransaction } from '../../billing/shared/billing-transaction.model';
import { VisitService } from '../shared/visit.service';
import { Router } from '@angular/router';
import { PatientService } from '../../patients/shared/patient.service';
import { Subscription } from 'rxjs';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { QuickVisitVM, ListVisitsVM } from '../shared/quick-visit-view.model';
import * as moment from 'moment/moment';
import { BillingReceiptModel } from '../../billing/shared/billing-receipt.model';
import { SecurityService } from '../../security/shared/security.service';
import { RouteFromService } from '../../shared/routefrom.service';
import { BillingService } from '../../billing/shared/billing.service';
import { PatientsDLService } from '../../patients/shared/patients.dl.service';
import { ENUM_AppointmentType, ENUM_BillingStatus, ENUM_VisitType, ENUM_OrderStatus } from '../../shared/shared-enums';

@Component({
  selector: "danphe-followup-visit",
  templateUrl: "./followup-visit.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class FollowUpVisitComponent {
  public showFollowupPage: boolean = false;

  @Output("on-followup-add")
  followupCompleted: EventEmitter<Object> = new EventEmitter<Object>();
  //getting the input parameter as 'visit' and setting it to selectedVisit.
  //doing so is necessary, since we were unable to call the functions (written here) inside constructor before this value is set
  @Input("parent-visit")
  public set inputVisit(vis: Visit) {
    if (vis) {
      this.parentVisit = vis;
      //set current provider's information from Input value.
      this.currentProvider.ProviderId = vis.ProviderId;
      this.currentProvider.ProviderName = vis.ProviderName;

      //sud: 23Jun'19-- Department info is now coming from list visit itself.
      this.currentProvider.DepartmentName = this.parentVisit.DepartmentName;
      this.currentProvider.DepartmentId = this.parentVisit.DepartmentId;

      //ashim: 22Aug2018 : Previous visit could be transferred or referral visit.
      this.parentVisit.TransferredProviderId = null;
      this.parentVisit.ReferredByProviderId = null;
      //this.GetDepartmentByEmployeeId();
    }
  }

  //public providerList: Array<Employee> = new Array<Employee>();

  public currentProvider = { ProviderName: null, ProviderId: null, DepartmentId: null, DepartmentName: null };

  public newProvider: any;
  public departmentId: number = 0;
  public departmentList: any;
  public parentVisit: any = null;
  //to show-hide anchor tag : 'Change Doctor ?' and the textbox.
  public changeProvider: boolean = false;
  public loading: boolean = false;//to restrict double click


  public docOrDeptChangedSubscription: Subscription;

  constructor(public visitBLService: VisitBLService,
    public msgBoxServ: MessageboxService,
    public visitService: VisitService,
    public router: Router,
    public patientService: PatientService,
    public securityService: SecurityService,
    public routeFromService: RouteFromService,
    public billingService: BillingService,
    public patientDl: PatientsDLService) {

  }

  newVisitForChangeDoctor: Visit = new Visit();
  newBillTxn: BillingTransaction = new BillingTransaction();

  ngOnInit() {
    //assign properties of parentVisit if Doctor change is required.
    this.newVisitForChangeDoctor = this.visitService.CreateNewGlobal();
    if (this.parentVisit) {
      this.newVisitForChangeDoctor.ProviderId = this.parentVisit.ProviderId;
      this.newVisitForChangeDoctor.ProviderName = this.parentVisit.ProviderName;
      this.newVisitForChangeDoctor.DepartmentId = this.parentVisit.DepartmentId;
      this.newVisitForChangeDoctor.DepartmentName = this.parentVisit.DepartmentName;
      this.newVisitForChangeDoctor.PatientId = this.parentVisit.PatientId;

      this.GetPatientById();
      //sud:13Jul'19--needed to check Duplicate Visits (with same doctor) in client side.
      this.LoadPatientsTodaysVisitListIntoService(this.parentVisit.PatientId);

    }

  }

  GetPatientById() {
    //getpatientinformation (needed for subdivision and address..)
    let patientId = this.parentVisit.PatientId;
    this.visitBLService.GetPatientById(patientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.parentVisit.Patient = res.Results;
        }
      });
  }



  ChangeDepartmentOrDoctor() {

    this.visitService.ParentVisitInfo = this.parentVisit;
    this.visitService.appointmentType = "followup";
    //assign patient's details to global variable. so that it can be used in visit main component.
    let currPat = this.patientService.getGlobal();
    currPat = Object.assign(currPat, this.parentVisit.Patient);
    this.newBillTxn.PatientId = currPat.PatientId;//sud:29Sept'19 -- there's some calculation based on this field in billing info page.

    //this.router.navigate(['/Appointment/Visit']);
    this.changeProvider = true;
  }


  //emits the newProvider to the callbackfollowup function of visit-list.component
  FollowUp() {

    //If Doctor/Department change hasn't been clicked then Go For Free Followup Directly.
    //Else 

    if (!this.changeProvider) {
      this.PostFreeFollowup();
    }
    else {

      let oldDeptId = this.visitService.ParentVisitInfo.DepartmentId;
      let oldDoctorId = this.visitService.ParentVisitInfo.ProviderId;
      let newDeptId = this.visitService.globalVisit.DepartmentId;
      let newDoctId = this.visitService.globalVisit.ProviderId;
      let priceCategory = this.visitService.PriceCategory;
      let isPaidFollowup = false;

      //Go with Free Followup if Department or PriceCategory are not changed 
      if (newDeptId && oldDeptId != newDeptId || priceCategory != "Normal") {
        isPaidFollowup = true;
      }
      else {
        isPaidFollowup = false;
      }

      let valSummary = this.CheckValidations(isPaidFollowup);

      if (valSummary.isValid) {
        if (isPaidFollowup) {
          this.PostPaidFollowup();
        }
        else {
          this.PostFreeFollowup();
        }
      }
      else {
        this.msgBoxServ.showMessage("Failed", valSummary.message);
      }

    }

  }


  public GetFormattedForPaidFollowup(retQckVisitVm: QuickVisitVM) {
    let retVal: ListVisitsVM = new ListVisitsVM();
    let retVisit = retQckVisitVm.Visit;

    retVal.Patient = this.parentVisit.Patient;
    retVal.Patient.CountrySubDivisionName = this.parentVisit.Patient.CountrySubDivision.CountrySubDivisionName;

    retVal.PatientVisitId = retVisit.PatientVisitId;
    retVal.ParentVisitId = this.parentVisit.PatientVisitId;
    retVal.DepartmentId = retVisit.DepartmentId;
    retVal.DepartmentName = this.visitService.globalVisit.DepartmentName;
    retVal.ProviderId = retVisit.ProviderId;
    retVal.ProviderName = retVisit.ProviderName;
    retVal.CreatedOn = retVisit.CreatedOn;
    retVal.VisitDate = retVisit.VisitDate;
    retVal.VisitTime = retVisit.VisitTime;

    retVal.PatientCode = this.parentVisit.PatientCode;
    retVal.ShortName = this.parentVisit.ShortName;
    retVal.PhoneNumber = this.parentVisit.PhoneNumber;
    retVal.DateOfBirth = this.parentVisit.DateOfBirth;
    retVal.Gender = this.parentVisit.Gender;
    retVal.VisitType = this.parentVisit.VisitType;
    retVal.AppointmentType = ENUM_AppointmentType.followup;
    retVal.BillStatus = ENUM_BillingStatus.paid;//  "paid";
    retVal.Patient = this.parentVisit.Patient;
    retVal.BillingTransaction = retQckVisitVm.BillingTransaction;

    return retVal;
  }


  PostFreeFollowup() {
    this.loading = true;//disables FollowUp button
    this.visitBLService.PostFreeFollowupVisit(this.newVisitForChangeDoctor, this.parentVisit.PatientVisitId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("success", ["Followup created successfully."]);
          this.ResetVisitContext();
          this.followupCompleted.emit({ action: "free-followup", data: res.Results });
          this.loading = false;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          console.log(res.ErrorMessage);
          this.loading = false;
        }
      });
  }

  PostPaidFollowup() {
    let qckVisit_Fwup: QuickVisitVM = new QuickVisitVM();

    if (this.newBillTxn && this.newBillTxn.BillingTransactionItems) {
      this.newBillTxn.PatientId = this.parentVisit.PatientId;
      this.newBillTxn.BillingTransactionItems[0].PatientId = this.parentVisit.PatientId;
      this.newBillTxn.InvoiceType = 'op-normal';
    }

    qckVisit_Fwup.BillingTransaction = this.newBillTxn;
    qckVisit_Fwup.Visit = this.visitService.globalVisit;
    qckVisit_Fwup.Visit.AppointmentType = ENUM_AppointmentType.followup;// "followup";
    qckVisit_Fwup.Visit.VisitType = ENUM_VisitType.outpatient;// "outpatient";

    qckVisit_Fwup.BillingTransaction.BillingTransactionItems.forEach(a => {
      a.OrderStatus = ENUM_OrderStatus.Active;
    });

    this.visitBLService.PostPaidFollowupVisit(qckVisit_Fwup)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          let fwupVisit = this.GetFormattedForPaidFollowup(res.Results);
          this.PaidFollowUpInvoiceDetails(res);

          this.msgBoxServ.showMessage("success", ["Followup created successfully."]);
          this.ResetVisitContext();
          this.followupCompleted.emit({ action: "free-followup", data: fwupVisit });
          this.loading = false;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          console.log(res.ErrorMessage);
          this.loading = false;
        }
      });

  }

  PaidFollowUpInvoiceDetails(res) {

    let opdReceipt = BillingReceiptModel.GetReceiptForTransaction(res.Results.BillingTransaction);
    opdReceipt.IsValid = true;
    opdReceipt.Patient = this.parentVisit.Patient;
    opdReceipt.VisitId = res.Results.Visit.PatientVisitId;
    opdReceipt.Remarks = res.Results.BillingTransaction.Remarks;
    opdReceipt.CurrentFinYear = res.Results.BillingTransaction.FiscalYear;//this comes from server side. 
    //opdReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
    opdReceipt.BillingUser = res.Results.BillingTransaction.BillingUserName; //Yubraj 28th June '19
    opdReceipt.BillingType = "opd-billing";
    let visitType = res.Results.Visit.VisitType;
    this.routeFromService.RouteFrom = (visitType == "emergency" ? "ER-Sticker" : "OPD");
    this.billingService.globalBillingReceipt = opdReceipt;
    // this.router.navigate(['/Billing/ReceiptPrint']);
  }

  Close() {
    this.ResetVisitContext();
    this.followupCompleted.emit({ action: "close" });
  }

  //used to format the display of item in ng-autocomplete.
  ProviderListFormatter(data: any): string {
    let html = data["FullName"];//FullName is a property in the Employee Model.
    //let html = data["Salutation"] + "." + data["FirstName"] + "  " + data["LastName"];
    return html;
  }

  ResetVisitContext() {
    this.visitService.appointmentType = "New";
    this.visitService.CreateNewGlobal();
    this.visitService.PriceCategory = "Normal";

  }

  //it is the centralized function to check validations.
  //if any of the validation fails then isValid=false, error messages are pushed for each validations. 
  CheckValidations(isPaidFollowup: boolean): { isValid: boolean, message: Array<string> } {
    if (!this.newBillTxn.IsInsuranceBilling) {
      this.newVisitForChangeDoctor.UpdateValidator("off", "ClaimCode", null);
    }
    let validationSummary = { isValid: true, message: [] };

    for (var i in this.newVisitForChangeDoctor.VisitValidator.controls) {
      this.newVisitForChangeDoctor.VisitValidator.controls[i].markAsDirty();
      this.newVisitForChangeDoctor.VisitValidator.controls[i].updateValueAndValidity();
    }

    if (!this.newVisitForChangeDoctor.IsValidCheck(undefined, undefined) || !this.newVisitForChangeDoctor.IsValidSelProvider) {
      validationSummary.isValid = false;
      validationSummary.message.push("Check all mandatory fields");
    }

    //start: sud:13Jul'19--Check if this patient already has visit with same Doctor/Department on today.
    //We should restrict to create duplicate visit. This logic was used only in server side till now.
    let patId = this.newVisitForChangeDoctor.PatientId;
    let deptId = this.newVisitForChangeDoctor.DepartmentId;
    let doctId = this.newVisitForChangeDoctor.ProviderId;

    if (this.visitService.HasDuplicateVisitToday(patId, deptId, doctId, this.visitService.PatientTodaysVisitList)) {
      validationSummary.isValid = false;
      validationSummary.message.push("Patient already has appointment with same Doctor today.");
    }
    //end: sud:13Jul'19--Check if this patient already has visit with same Doctor/Department on today.


    //No need to check below validations for Free Followups: sud:28June'19
    if (isPaidFollowup) {

      if (this.newBillTxn.DiscountAmount > 0
        && (!this.newBillTxn.Remarks
          || (this.newBillTxn.Remarks
            && !this.newBillTxn.Remarks.length))) {

        validationSummary.isValid = false;
        validationSummary.message.push("Remarks is Mandatory for discount");
      }


      if (!(this.newBillTxn.BillingTransactionItems.every(a => a.Price != null && a.Price > 0))) {
        validationSummary.isValid = false;
        validationSummary.message.push("Price of Item cannot be zero (0)");
      }

      if (this.newBillTxn.DiscountPercent > 100 || this.newBillTxn.DiscountPercent < 0) {
        validationSummary.isValid = false;
        validationSummary.message.push("Discount percent should be between 0 and 100.");

      }

    }


    return validationSummary;
  }


  //sud:13Jul'19--get patient's today's visit (not Returned) and check for DuplicateVisit in client side itself.
  LoadPatientsTodaysVisitListIntoService(patientId: number) {

    this.visitService.PatientTodaysVisitList = [];

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

  public hotkeys(event) {
    if (event.keyCode == 27) {
      this.followupCompleted.emit("Close");
    }
  }
}
