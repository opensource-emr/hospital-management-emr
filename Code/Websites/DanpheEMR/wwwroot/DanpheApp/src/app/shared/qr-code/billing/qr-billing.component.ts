import { Component, ChangeDetectorRef } from "@angular/core";
import { Patient } from "../../../patients/shared/patient.model";
import { QrService } from "../qr-service";
import { PatientService } from "../../../patients/shared/patient.service";
import { Router } from '@angular/router';
import { BillingService } from "../../../billing/shared/billing.service";

@Component({
    selector: 'danphe-qr-billing',
    templateUrl: "./qr-billing.html",
})
export class QrBillingComponent {

    public selPatient: Patient = new Patient();
    public showPatientPanel: boolean = false;
    public showBillingPanel: boolean = false;

    constructor(public qrService: QrService,
        public patientService: PatientService,
        public billingService: BillingService,
        public router: Router, public changeDetector:ChangeDetectorRef) {
        this.qrService.show = true;
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
        this.AssignPatientGlobalValues(this.selPatient);
        this.billingService.CreateNewGlobalBillingTransaction();
        //this.billingService.BillingType = data.IsAdmitted ? "Inpatient" : "Outpatient";
        this.billingService.BillingType =  "outpatient";//change this later on: sud-1July'18
        this.router.navigate(["/Billing/BillingTransaction"]);
    }

    NewDeposit() {
        this.qrService.show = false;
        this.qrService.showBilling = false;
        this.AssignPatientGlobalValues(this.selPatient);
        this.router.navigate(["/Billing/BillingDeposit"]);

    }
    DoctorOrders() {

    }

    BillHistory() {

    }
    Settlements() {

    }

    ProvisionalItems() {

    }

    AssignPatientGlobalValues(ipData: Patient) {
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
        globalPat.Address = ipData.Address;
        globalPat.CountrySubDivisionName = ipData.CountrySubDivisionName;
        globalPat.PANNumber = ipData.PANNumber;
        globalPat.Admissions = ipData.Admissions;

    }

}