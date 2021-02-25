import { Component, ChangeDetectorRef } from "@angular/core";
import { Patient } from "../../../patients/shared/patient.model";
import { QrService } from "../qr-service";
import { PatientService } from "../../../patients/shared/patient.service";
import { Router } from '@angular/router';
import { BillingService } from "../../../billing/shared/billing.service";
import { RouteFromService } from "../../routefrom.service";
import { AppointmentService } from "../../../appointments/shared/appointment.service";
import { SecurityService } from "../../../security/shared/security.service";
import { CallbackService } from "../../callback.service";

@Component({
  //selector: 'danphe-qr-billing',
  templateUrl: "./qr-billing.html",
})
export class QrBillingComponent {

  public selPatient: Patient = new Patient();
  public showPatientPanel: boolean = false;
  public showBillingPanel: boolean = false;
  public currentCounterId: number = 0;


  constructor(public qrService: QrService,
    public patientService: PatientService,
    public billingService: BillingService,
    public router: Router, public changeDetector: ChangeDetectorRef,
    public routeFromService: RouteFromService,
    public appointmentService: AppointmentService,
    public securityService: SecurityService,
    public callbackService: CallbackService) {

    this.currentCounterId = this.securityService.getLoggedInCounter().CounterId;
    if (this.currentCounterId < 1) {
      this.callbackService.CallbackRoute = '/Billing/QrBilling'
      this.router.navigate(['/Billing/CounterActivate']);
    } 
    else {
      this.qrService.show = true;
    }

  }


  Close() {
    this.qrService.showBilling = false;
  }

  OnQrReadSuccess($event) {
    this.showBillingPanel = false;

    this.changeDetector.detectChanges();

    this.selPatient = $event;
    this.showPatientPanel = true;

    this.showBillingPanel = true;
  }

  NewBillingRequest() {
    this.qrService.show = false;
    this.qrService.showBilling = false;
    this.AssignPatientGlobalValues_PatientService(this.selPatient);
    this.billingService.CreateNewGlobalBillingTransaction();
    this.billingService.BillingType = "outpatient";//change this later on: sud-1July'18
    this.router.navigate(["/Billing/BillingTransaction"]);
  }

  NewDeposit() {
    this.qrService.show = false;
    this.qrService.showBilling = false;
    this.AssignPatientGlobalValues_PatientService(this.selPatient);
    this.router.navigate(["/Billing/BillingDeposit"]);
  }

  Appointment() {
    this.qrService.show = false;
    this.qrService.showBilling = false;
    //this.AssignPatientGlobalValues_PatientService(this.selPatient);
    this.AssignPatientGlobalValues_AppointmentService(this.selPatient);
    this.routeFromService.RouteFrom = "billing-qr-scan";
    this.router.navigate(["/Appointment/Visit"]);
  }


  BillHistory() {

  }

  Settlements() {

  }

  ProvisionalItems() {

  }

  AssignPatientGlobalValues_PatientService(ipData: Patient) {
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


  AssignPatientGlobalValues_AppointmentService(ipData: Patient) {
    var apptPatient = this.appointmentService.GlobalAppointmentPatient;
    apptPatient.PatientId = ipData.PatientId;

    apptPatient.PatientCode = ipData.PatientCode;
    apptPatient.FirstName = ipData.FirstName;
    apptPatient.LastName = ipData.LastName;
    apptPatient.MiddleName = ipData.MiddleName;
    apptPatient.PhoneNumber = ipData.PhoneNumber;
    apptPatient.Gender = ipData.Gender;
    apptPatient.ShortName = ipData.ShortName;
    apptPatient.DateOfBirth = ipData.DateOfBirth;
    apptPatient.Age = ipData.Age;
    apptPatient.Address = ipData.Address;
    apptPatient.CountrySubDivisionName = ipData.CountrySubDivisionName;
    apptPatient.CountryId = ipData.CountryId;
    apptPatient.CountrySubDivisionId = ipData.CountrySubDivisionId;
    apptPatient.MembershipTypeId = ipData.MembershipTypeId;
    apptPatient.PANNumber = ipData.PANNumber;
    apptPatient.Admissions = ipData.Admissions;
  }


  //public loadBillHistory: boolean = false;
  //ChkBillHistoryOnChange() {
  //  if (this.loadBillHistory) {

  //  }

  //}

}
