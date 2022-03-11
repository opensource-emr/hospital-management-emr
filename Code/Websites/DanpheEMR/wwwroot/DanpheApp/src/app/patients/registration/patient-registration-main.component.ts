import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';



import { CallbackService } from '../../shared/callback.service';
import { AppointmentService } from '../../appointments/shared/appointment.service';
import { PatientService } from '../shared/patient.service';
import { PatientsBLService } from '../shared/patients.bl.service';

import * as _ from 'lodash';

import { Guarantor } from "../shared/guarantor.model";
import { Appointment } from "../../appointments/shared/appointment.model";
import { Patient } from "../shared/patient.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../shared/common.functions';
import { SecurityService } from '../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { PatientFilesModel } from '../shared/patient-files.model';
import { CoreService } from '../../core/shared/core.service';

@Component({
  templateUrl: "./patient-registration-main.html"
})

// App Component class
export class PatientRegistrationMainComponent {

  public Patient: Patient;
  public patientService: PatientService;
  public appointmentService: AppointmentService;
  //flag for Show exsting patient list with some details
  public showExstingPatientListPage: boolean = false;
  public matchedPatResult: Array<Patient> = new Array<Patient>();
  //Matching Patient List
  public matchedPatientList: Array<Patient> = new Array<Patient>();

  callbackserv: CallbackService = null;

  public currPatient: Patient = null;
  public isPhoneMandatory: boolean = false;



  //loading varible for double click enable-disabled 
  loading: boolean = false;
  editButton: boolean = false;
  validRoutes: any;

  constructor(
    _serv: PatientService,
    public router: Router,
    _appointmentService: AppointmentService,
    _callBackServ: CallbackService,
    public patientBLService: PatientsBLService,
    public msgBoxServ: MessageboxService,
    public securityService: SecurityService,
    public coreService: CoreService
  ) {
    //get the chld routes of Patient registration main from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Patient/RegisterPatient");
    this.patientService = _serv;
    this.Patient = _serv.getGlobal();
    this.appointmentService = _appointmentService;

    this.callbackserv = _callBackServ;
    this.SeperateAgeAndUnit();
    //checks if the call is made from appointment. 
    //if made from appointment, then navigates to visit after creating patient
    //if so, we'll pre-fill new patient with available fields from appointment.

    if (this.callbackserv.CallbackRoute == '/Appointment/Visit')
      this.UpdateFromAppointment();
    else
      this.appointmentService.CreateNewGlobal();

      this.isPhoneMandatory = this.coreService.GetIsPhoneNumberMandatory();
  }

  UpdateFromAppointment(): void {
    var appointment = this.appointmentService.getGlobal();
    //need Review
    //clearing the exising patient model and assigning only those values from appointment service
    this.Patient = this.patientService.CreateNewGlobal();
    this.Patient.FirstName = appointment.FirstName;
    this.Patient.LastName = appointment.LastName;
    this.Patient.PhoneNumber = appointment.ContactNumber;
    this.Patient.Gender = appointment.Gender;
  }

  Update(): void {

    if (this.Patient.IsValidCheck(undefined, undefined) == false) {
      for (var i in this.Patient.PatientValidator.controls) {
        this.Patient.PatientValidator.controls[i].markAsDirty();
        this.Patient.PatientValidator.controls[i].updateValueAndValidity();
      }

      //alert("One or more fields are invalid, please correct them and submit again.");
      this.msgBoxServ.showMessage("notice-message", ["One or more fields are invalid. please correct them and submit again."]);
      this.router.navigate(['/Patient/RegisterPatient/BasicInfo']);
    }
    else if (!this.Patient.IsValidMembershipTypeName) {
      this.msgBoxServ.showMessage("error", ["Please Enter Valid Membership Type"]);
      this.router.navigate(['/Patient/RegisterPatient/BasicInfo']);
      return;
    }
    else {
      var midName = this.Patient.MiddleName;
      if (midName) {
        midName = this.Patient.MiddleName.trim() + " ";
      } else {
        midName = "";
      }
      //removing extra spaces typed by the users
      this.Patient.FirstName = this.Patient.FirstName.trim();
      this.Patient.MiddleName = this.Patient.MiddleName ? this.Patient.MiddleName.trim() : null;
      this.Patient.LastName = this.Patient.LastName.trim();
      this.Patient.ShortName = this.Patient.FirstName + " " + midName + this.Patient.LastName;
      this.loading = true;
      this.Patient.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.ConcatinateAgeAndUnit();
      this.updatePatient();

    }
  }

  updatePatient() {
    this.capitalizeFirstLetter('FirstName');
    this.capitalizeFirstLetter('MiddleName');
    this.capitalizeFirstLetter('LastName');
    this.capitalizeFirstLetter('Address');

    this.patientBLService.PutPatient(this.Patient)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            //we've to check res.Status here and decide if it was updated
            //alert('patient information updated successfully');
            this.msgBoxServ.showMessage("success", ["patient information updated successfully"]);
            this.loading = false;
            this.router.navigate(['/Patient/SearchPatient']);
          }
          else {
            this.msgBoxServ.showMessage("error", ["failed to update. please check log for details."]);
            console.log(res.ErrorMessage);
          }
        });
    this.Patient = this.patientService.CreateNewGlobal();
  }

  //Register function call
  Add(): void {
    if (this.Patient.IsValidCheck(undefined, undefined) == false) {
      for (var i in this.Patient.PatientValidator.controls) {
        this.Patient.PatientValidator.controls[i].markAsDirty();
        this.Patient.PatientValidator.controls[i].updateValueAndValidity();
      }

      //alert("One or more fields are invalid, please correct them and submit again.");
      this.msgBoxServ.showMessage("notice-message", ["One or more fields are invalid. please correct them and submit again."]);
      this.router.navigate(['/Patient/RegisterPatient/BasicInfo']);
    }
    else {
      //either dob or age has to be filled. alert if they're not.
      //change it to dynamic validation later on --sudarshan:6May'17
      if (this.Patient.IsDobVerified) {
        if (!this.Patient.DateOfBirth) {
          //alert("Please fill the Patient's Date of Birth");
          this.msgBoxServ.showMessage("error", ["Please fill the Patient's Date of Birth"]);
          this.router.navigate(['/Patient/RegisterPatient/BasicInfo']);
          return;
        }
      }
      else {
        if (!this.Patient.Age) {
          //alert("Please fill the Patient' Age");
          this.msgBoxServ.showMessage("error", ["Please fill the Patient' Age"]);
          this.router.navigate(['/Patient/RegisterPatient/BasicInfo']);
          return;
        }
      }

      if (!this.Patient.IsValidMembershipTypeName) {
        this.msgBoxServ.showMessage("error", ["Please Enter Valid Membership Type"]);
        this.router.navigate(['/Patient/RegisterPatient/BasicInfo']);
        return;
      }

      //loading varible is now true
      this.loading = true;

      //Check This is check in request or new visit creation                
      if (this.Patient.PatientId == 0) {
        //Get existing patient list by FirstName, LastName, Mobile Number
        this.GetExistedMatchingPatientList(this.Patient);
      }
    }
  }

  capitalizeFirstLetter(controlName) {
    let cntrl = this.Patient.PatientValidator.controls[controlName];
    if (cntrl) {
      let str: string = cntrl.value;
      let returnStr: string = CommonFunctions.CapitalizeFirstLetter(str);
      cntrl.setValue(returnStr);
    }
  }

  GetExistedMatchingPatientList(Patient) {

    if (this.Patient.Age && this.Patient.AgeUnit) {
      this.Patient.Age = this.Patient.Age;
    }
    else {
      if (this.Patient.DateOfBirth) {
        var age = CommonFunctions.GetFormattedAge(this.Patient.DateOfBirth);
        var splitted = age.split(" ", 2);
        this.Patient.AgeUnit = splitted[1];
        this.Patient.Age = splitted[0];
      }
    }
    let actualAge = this.Patient.Age + this.Patient.AgeUnit;
    this.patientBLService.GetExistedMatchingPatientList(this.Patient.FirstName, this.Patient.LastName,
      this.Patient.PhoneNumber, actualAge, this.Patient.Gender)
      .subscribe(
        res => {
          if (res.Status == "OK" && res.Results.length > 0) {
            this.loading = false;
            this.matchedPatResult = res.Results;
            this.showExstingPatientListPage = true;
          }
          else {
            this.RegisterFreshAndNewPatient();
          }

        },
        err => {
          this.loading = false;
          this.msgBoxServ.showMessage("Please, Try again . Error in Getting Existed Match patient list", [err.ErrorMessage]);
        });
  }

  RegisterFreshAndNewPatient() {

    if (this.Patient.IsValid) {
      this.capitalizeFirstLetter('FirstName');
      this.capitalizeFirstLetter('MiddleName');
      this.capitalizeFirstLetter('LastName');
      this.capitalizeFirstLetter('Address');

      //check if middlename exists or not to append to Shortname 
      var midName = this.Patient.MiddleName;
      if (midName) {
        midName = this.Patient.MiddleName.trim() + " ";
      } else {
        midName = "";
      }

      //removing extra spaces typed by the users
      this.Patient.FirstName = this.Patient.FirstName.trim();
      this.Patient.MiddleName = this.Patient.MiddleName ? this.Patient.MiddleName.trim() : null;
      this.Patient.LastName = this.Patient.LastName.trim();
      this.Patient.ShortName = this.Patient.FirstName + " " + midName + this.Patient.LastName;
      this.Patient.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.ConcatinateAgeAndUnit();

      //if (this.Patient.HasFile) {
      //    //
      //    this.PatientFile(fileBase64String);
      //}


      this.patientBLService.PostPatient(this.Patient)
        .subscribe(
          res => {

            this.CallBackAddPatient(res),
              this.loading = false;

          },
          err => {
            //alert('failed to add patient. please check log for details.');
            this.msgBoxServ.showMessage("error", ["failed to add patient. please check log for details."]);
            this.loading = false;

          });
    }
  }

  //This method call if End User wants New registration with same information
  ProceedAnyway() {
    this.showExstingPatientListPage = false;
    this.Patient.PatientId = 0;
    this.RegisterFreshAndNewPatient();
  }

  UpdateAnyway() {
    this.showExstingPatientListPage = false;
    this.updatePatient();
  }


  UseExistingPatientDetails(PatientId) {
    /// var pat = this.patientService.getGlobal();
    var pat = PatientId;
    this.patientBLService.GetPatientById(PatientId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          //patient Service has Common SetPatient method For Setting Pattient Deatils 
          //this common method is for Code reusability
          this.loading = false;
          this.patientService.setGlobal(res.Results),

            //this showExstingPatientList is false because popup window should be closed after navigate to /Patient/RegisterPatient/BasicInfo in set patient method of Patient service
            this.showExstingPatientListPage = false;

          //go to route if all the value are mapped with the patient service
          this.router.navigate(['/Patient/RegisterPatient/BasicInfo']);
        }
        else {
          // alert(res.ErrorMessage);
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);

        }
      },


        err => {
          this.msgBoxServ.showMessage("error", ["failed to get selected patient"]);
          //alert('failed to get selected patient');

        });


  }


  //This close existing patient list model box
  Close() {
    this.loading = false;
    this.showExstingPatientListPage = false;
  }



  //since we're storing in the format '25M' in database we need to concatinate age and ageUnit
  ConcatinateAgeAndUnit() {
    if (this.Patient.Age && this.Patient.AgeUnit)
      this.Patient.Age = this.Patient.Age + this.Patient.AgeUnit;
  }

  //age is stored in the format '25M', so separation is needed to map with the client object.
  SeperateAgeAndUnit() {
    try {
      if (this.Patient.Age) {
        var length: number = this.Patient.Age.length;
        if (length > 0) {
          this.Patient.AgeUnit = this.Patient.Age.slice(length - 1, length);
          this.Patient.Age = this.Patient.Age.slice(0, length - 1);
        }
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  CallBackAddPatient(res) {
    if (res.Status == 'OK') {

      this.msgBoxServ.showMessage("success", ["Patient Added successfully.HospitalNo. is  " + res.Results.PatientCode]);
      ////needs review for updating appointment
      //checking if create patient is navigated from visit
      if (this.callbackserv.CallbackRoute == '/Appointment/Visit') {

        // Since navigating to visit. PatientId is used in Visit.
        let currentAppt: Appointment = this.appointmentService.getGlobal();
        currentAppt.PatientId = res.Results.PatientId;

        //updates the patient in the appointment table

        this.patientBLService.PutAppointmentPatientId(currentAppt.AppointmentId, res.Results.PatientId)
          .subscribe(res => {
            //don't show any message here, since it's an internal logic to update patientId if it has come from appointment.
          });

        //routes to visit page
        let _routeName = this.callbackserv.CallbackRoute;
        this.callbackserv.CallbackRoute = "";
        this.router.navigate([_routeName]);
      }

      //create patient is not initiated from appointment
      else {
        this.Patient = this.patientService.CreateNewGlobal();
        this.router.navigate(['/Patient/SearchPatient']);
      }
    }
    else {
      this.msgBoxServ.showMessage("error", [res.ErrorMessage]);

    }
  }
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }

  emitCloseAction($event) {
    var action = $event.action;
    var data = $event.data;

    if (action == "use-existing") {
      let patientId = data;
      this.UseExistingPatientDetails(patientId);
    }
    else if (action == "add-new") {
      this.ProceedAnyway();
    }
    else if (action == "update-patient") {
      this.UpdateAnyway();
    }
    else if (action == "close") {
      this.showExstingPatientListPage = false;
    }
    this.loading = false;
  }
}
