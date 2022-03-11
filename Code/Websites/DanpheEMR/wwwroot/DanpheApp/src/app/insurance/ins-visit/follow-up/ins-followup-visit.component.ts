import { Component, Directive, ViewChild, Renderer2 } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core"
import { Visit } from '../../../appointments/shared/visit.model'
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { BillingTransaction } from '../../../billing/shared/billing-transaction.model';
import { VisitService } from '../../../appointments/shared/visit.service';
import { Router } from '@angular/router';
import { PatientService } from '../../../patients/shared/patient.service';
import { Subscription } from 'rxjs';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { QuickVisitVM, ListVisitsVM } from '../../../appointments/shared/quick-visit-view.model';
import * as moment from 'moment/moment';
import { BillingReceiptModel } from '../../../billing/shared/billing-receipt.model';
import { SecurityService } from '../../../security/shared/security.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { BillingService } from '../../../billing/shared/billing.service';
import { PatientsDLService } from '../../../patients/shared/patients.dl.service';
import { ENUM_AppointmentType, ENUM_BillingStatus, ENUM_VisitType, ENUM_OrderStatus } from '../../../shared/shared-enums';
import { InsuranceBlService } from '../../shared/insurance.bl.service';
import { InsuranceService } from '../../shared/ins-service';
import { CoreService } from '../../../core/shared/core.service';

@Component({
  selector: "ins-danphe-followup-visit",
  templateUrl: "./ins-followup-visit.html"
})
export class InsFollowUpVisitComponent {
  public showFollowupPage: boolean = false;
  public prevVisitList: Array<Visit> = new Array<Visit>();
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
  @Input("popup-action")
  popupAction: string = "add";//add or edit.. logic will change accordingly.

  public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
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

  constructor(public insuranceBLservice: InsuranceBlService,
    public msgBoxServ: MessageboxService,
    public insuranceService: InsuranceService,
    public router: Router,
    public patientService: PatientService,
    public securityService: SecurityService,
    public routeFromService: RouteFromService,
    public billingService: BillingService,
    public patientDl: PatientsDLService,
    public coreService: CoreService,
    public renderer: Renderer2,) {

  }

  newVisitForChangeDoctor: Visit = new Visit();
  newBillTxn: BillingTransaction = new BillingTransaction();

  ngOnInit() {
    //assign properties of parentVisit if Doctor change is required.
    this.newVisitForChangeDoctor = this.insuranceService.CreateNewGlobal();
    if (this.parentVisit) {
      this.newVisitForChangeDoctor.ProviderId = this.parentVisit.ProviderId;
      this.newVisitForChangeDoctor.ProviderName = this.parentVisit.ProviderName;
      this.newVisitForChangeDoctor.DepartmentId = this.parentVisit.DepartmentId;
      this.newVisitForChangeDoctor.DepartmentName = this.parentVisit.DepartmentName;
      this.newVisitForChangeDoctor.PatientId = this.parentVisit.PatientId;
      this.newVisitForChangeDoctor.ClaimCode = this.parentVisit.ClaimCode;

      this.GetPatientById();
      //sud:13Jul'19--needed to check Duplicate Visits (with same doctor) in client side.
      this.LoadPatientsTodaysVisitListIntoService(this.parentVisit.PatientId);
      this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
        if (e.keyCode == this.ESCAPE_KEYCODE) {
          //this.onClose.emit({ CloseWindow: true, EventName: "close" });
          this.Close()
        }
      });
    }

  }
  globalListenFunc: Function;
  ngOnDestroy() {
    // remove listener
    this.globalListenFunc();
  }


  GetPatientById() {
    //getpatientinformation (needed for subdivision and address..)
    let patientId = this.parentVisit.PatientId;
    this.insuranceBLservice.GetPatientById(patientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.parentVisit.Patient = res.Results;
        }
      });
  }



  ChangeDepartmentOrDoctor() {
    this.Loadparameters();
    this.insuranceService.ParentVisitInfo = this.parentVisit;
    this.insuranceService.appointmentType = "followup";
    //assign patient's details to global variable. so that it can be used in visit main component.
    let currPat = this.patientService.getGlobal();
    currPat = Object.assign(currPat, this.parentVisit.Patient);
    this.newBillTxn.PatientId = currPat.PatientId;//sud:29Sept'19 -- there's some calculation based on this field in billing info page.

    this.router.navigate(['/Insurance/Visit']);
    this.changeProvider = true;
  }


  //emits the newProvider to the callbackfollowup function of visit-list.component
  FollowUp() {

    //If Doctor/Department change hasn't been clicked then Go For Free Followup Directly.
    //Else 
    let valSummary = this.CheckValidations(true);
    if (valSummary.isValid) {
      if (!this.changeProvider) {
        this.PostFreeFollowup();
      }
      else {

        let oldDeptId = this.insuranceService.ParentVisitInfo.DepartmentId;
        let oldDoctorId = this.insuranceService.ParentVisitInfo.ProviderId;
        let newDeptId = this.insuranceService.globalVisit.DepartmentId;
        let newDoctId = this.insuranceService.globalVisit.ProviderId;
        let priceCategory = this.insuranceService.PriceCategory;
        let ClaimCode = this.insuranceService.ClaimCode;
        let isPaidFollowup = false;

        //Go with Free Followup if Department or PriceCategory are not changed 
        if (newDeptId && oldDeptId != newDeptId || priceCategory != "Normal" && ClaimCode) {
          isPaidFollowup = true;
        }
        else {
          isPaidFollowup = false;
        }

        let valSummary = this.CheckValidations(isPaidFollowup);

        if (valSummary.isValid) {
          if (this.newBillTxn.IsInsuranceBilling && isPaidFollowup) {
            this.CheckDuplicateClaimCodea();
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
    else {
      this.msgBoxServ.showMessage("Failed", valSummary.message);
    }
  }

  CheckDuplicateClaimCodea() {
    this.insuranceBLservice.GetVisitList(this.newVisitForChangeDoctor.ClaimCode, this.newVisitForChangeDoctor.PatientId)
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
            this.PostPaidFollowup();
            this.loading = true;
          }
        }
        else {
          this.msgBoxServ.showMessage('Failed', [res.ErrorMessage]);
          this.loading = false;
          return;
        }
      });
  }
  public GetFormattedForPaidFollowup(retQckVisitVm: QuickVisitVM) {
    let retVal: ListVisitsVM = new ListVisitsVM();
    let retVisit = retQckVisitVm.Visit;

    retVal.Patient = this.parentVisit.Patient;
    retVal.Patient.CountrySubDivisionName = this.parentVisit.Patient.CountrySubDivision.CountrySubDivisionName;

    retVal.PatientVisitId = retVisit.PatientVisitId;
    retVal.ParentVisitId = this.parentVisit.PatientVisitId;
    retVal.DepartmentId = retVisit.DepartmentId;
    retVal.DepartmentName = this.insuranceService.globalVisit.DepartmentName;
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

    return retVal;
  }


  PostFreeFollowup() {
    this.loading = true;//disables FollowUp button
    this.insuranceBLservice.PostFreeFollowupVisit(this.newVisitForChangeDoctor, this.parentVisit.PatientVisitId)
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
    this.loading = true;
    let qckVisit_Fwup: QuickVisitVM = new QuickVisitVM();



    if (this.newBillTxn && this.newBillTxn.BillingTransactionItems) {
      this.newBillTxn.PatientId = this.parentVisit.PatientId;
      this.newBillTxn.BillingTransactionItems[0].PatientId = this.parentVisit.PatientId;
    }

    qckVisit_Fwup.BillingTransaction = this.newBillTxn;
    qckVisit_Fwup.Visit = this.insuranceService.globalVisit;
    qckVisit_Fwup.Visit.AppointmentType = ENUM_AppointmentType.followup;// "followup";
    qckVisit_Fwup.Visit.VisitType = ENUM_VisitType.outpatient;// "outpatient";

    qckVisit_Fwup.BillingTransaction.BillingTransactionItems.forEach(a => {
      a.OrderStatus = ENUM_OrderStatus.Active;
    });

    this.insuranceBLservice.PostPaidFollowupVisit(qckVisit_Fwup)
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
      this.newVisitForChangeDoctor.EnableControl("ClaimCode", false);
    }
    else {
      this.newVisitForChangeDoctor.ClaimCode = null;
      this.newVisitForChangeDoctor.EnableControl("ClaimCode", true);
    }

  }
  getClaimCode() {
    try {
      this.insuranceBLservice.GetClaimCode()
        .subscribe(res => {
          if (res.Status == "OK")
            this.newVisitForChangeDoctor.ClaimCode = res.Results;
        });
    }
    catch (ex) {

    }
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
    this.router.navigate(['/Billing/ReceiptPrint']);
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
    this.insuranceService.appointmentType = "New";
    this.insuranceService.CreateNewGlobal();
    this.insuranceService.PriceCategory = "Normal";

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

    // if (!this.newVisitForChangeDoctor.IsValidCheck(undefined, undefined) || !this.newVisitForChangeDoctor.IsValidSelProvider) {
    //   validationSummary.isValid = false;
    //   validationSummary.message.push("Check all mandatory fields");
    // }

    //start: sud:13Jul'19--Check if this patient already has visit with same Doctor/Department on today.
    //We should restrict to create duplicate visit. This logic was used only in server side till now.
    let patId = this.newVisitForChangeDoctor.PatientId;
    let deptId = this.newVisitForChangeDoctor.DepartmentId;
    let doctId = this.newVisitForChangeDoctor.ProviderId;

    if (this.insuranceService.HasDuplicateVisitToday(patId, deptId, doctId, this.insuranceService.PatientTodaysVisitList)) {
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


      // if (!(this.newBillTxn.BillingTransactionItems.every(a => a.GovtInsurancePrice != null && a.GovtInsurancePrice > 0))) {
      //   validationSummary.isValid = false;
      //   validationSummary.message.push("Price of Item cannot be zero (0)");
      // }

      this.newBillTxn.BillingTransactionItems.forEach(element => {
        if (element.IsZeroPriceAllowed == false || element.IsZeroPriceAllowed == null) {
          if (!(element.GovtInsurancePrice != null && element.GovtInsurancePrice > 0)) {
            validationSummary.isValid = false;
            validationSummary.message.push("Price of Item cannot be zero (0)");
          }
        }
      });

      if (this.newBillTxn.DiscountPercent > 100 || this.newBillTxn.DiscountPercent < 0) {
        validationSummary.isValid = false;
        validationSummary.message.push("Discount percent should be between 0 and 100.");

      }

    }


    return validationSummary;
  }


  //sud:13Jul'19--get patient's today's visit (not Returned) and check for DuplicateVisit in client side itself.
  LoadPatientsTodaysVisitListIntoService(patientId: number) {

    this.insuranceService.PatientTodaysVisitList = [];

    this.insuranceBLservice.GetPatientVisits_Today(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.insuranceService.PatientTodaysVisitList = res.Results;
        }
        else {
          this.insuranceService.PatientTodaysVisitList = [];
        }
      });
  }
}
