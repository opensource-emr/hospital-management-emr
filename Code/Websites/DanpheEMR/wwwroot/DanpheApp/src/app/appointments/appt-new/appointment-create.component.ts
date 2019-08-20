import { Component } from "@angular/core";
import { RouterModule, Router } from '@angular/router';

import { AppointmentService } from '../shared/appointment.service';
import { AppointmentBLService } from '../shared/appointment.bl.service';

import { SecurityService } from '../../security/shared/security.service';
import { NepaliDate } from '../../shared/calendar/np/nepali-dates';
import { NepaliCalendarService } from '../../shared/calendar/np/nepali-calendar.service';
import { CommonFunctions } from '../../shared/common.functions';

import { Appointment } from "../shared/appointment.model";
import { QuickAppointmentView } from "../shared/quick-appointment-view.model";

//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { PatientService } from "../../patients/shared/patient.service";
import { CallbackService } from '../../shared/callback.service';
import { RouteFromService } from '../../shared/routefrom.service';
import { Patient } from "../../patients/shared/patient.model";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { CoreBLService } from "../../core/shared/core.bl.service";
import { DanpheCache, MasterType } from "../../shared/danphe-cache-service-utility/cache-services";
import { APIsByType } from "../../shared/search.service";
@Component({
  templateUrl: "./create-appointment.html" //"/AppointmentView/CreateAppointment" 
})
export class AppointmentCreateComponent {
  public CurrentAppointment: Appointment = new Appointment();

  patients: Array<Patient> = new Array<Patient>();
  AppointmentpatientGridColumns: Array<any> = null;
  public showApptPanel: boolean = false;

  public selProvider: any;
  public departmentId: number = 0;
  public doctorList: any;
  public enablePreview: boolean = false;
  public aptList: Array<Appointment> = new Array<Appointment>();


  //declare boolean loading variable for disable the double click event of button
  loading: boolean = false;
  ///this is used to check provider
  public checkProvider: boolean = false;

  department: Array<any> = new Array<any>();
 public patGirdDataApi:string="";
  constructor(public appointmentBLService: AppointmentBLService,
    public appointmentService: AppointmentService,
    public callbackservice: CallbackService,
    public securityService: SecurityService,
    public router: Router,
    public msgBoxServ: MessageboxService,
    public patientService: PatientService,
    public routeFromService: RouteFromService,
    public coreBlService: CoreBLService) {
    //if counter is not loaded, then go to counter activation part.
    //if (this.securityService.getLoggedInCounter().CounterId) {


    ////this.CurrentAppointment = appointmentService.CreateNewGlobal();
    //if (this.patientService.globalPatient.PatientId) {
    //    this.AssignPatientPropertiesToCurrAppt();
    //}

    //this.CurrentAppointment.AppointmentDate = moment().format('YYYY-MM-DD');
    //this.CurrentAppointment.AppointmentTime = moment().format('HH:mm');
    //rounds off to nearest 10 minutes
    //this.CurrentAppointment.AppointmentTime = moment().add((10 - moment().minute() % 10), 'minutes').format('HH:mm');
    this.LoadPatients();
    //this.GenerateDoctorList();
    // this.GetDepartment();
    //}
    //else {
    // this.callbackservice.CallbackRoute = '/Appointment/CreateAppointment'
    //this.router.navigate(['/Billing/CounterActivate']);
    //}

    this.AppointmentpatientGridColumns = GridColumnSettings.AppointmentAllPatientSearch;
    this.patGirdDataApi=APIsByType.PatByName;
  }

  public GetAppointmentList() {
    let providerId = this.selProvider ? this.selProvider.Key : null;
    console.log("Provider Id ", providerId);
    if (providerId) {
      this.appointmentBLService.GetAppointmentProviderList(providerId, this.CurrentAppointment.AppointmentDate)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.aptList = res.Results;
            this.CurrentAppointment.AppointmentList = res.Results;
            //console.log("Array", this.aptList.length)
          }
          else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
          });
    }
  }

  ngAfterViewInit() {
    document.getElementById('quickFilterInput').focus();
  }

  LoadPatients(): void {
    this.appointmentBLService.GetPatients()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.patients = res.Results;
          this.GenerateDoctorList();
          this.GetDepartment();
        }
        else {
          //alert(res.ErrorMessage);
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);

        }
      },
        err => {
          //alert('failed to get  patients');
          this.msgBoxServ.showMessage("error", ["failed to get  patients"]);

        });
  }

  GetDepartment(): void {
    let allMasters = DanpheCache.GetData(MasterType.AllMasters, null);
    this.department = allMasters.Departments;
    // this.coreBlService.GetMasterEntities()
    //     .subscribe(res => {
    //         if (res.Status == 'OK') {                  
    //         this.department = res.Results.Departments;
    //         }
    //         else {
    //             this.msgBoxServ.showMessage("error", [res.ErrorMessage]);

    //         }
    //     },
    //         err => {
    //             this.msgBoxServ.showMessage("error", ["failed to get  department"]);

    //         });
  }

  SwitchViews() {
    this.showApptPanel = !this.showApptPanel;
    this.aptList = new Array<Appointment>();
    if (this.showApptPanel) {
      this.CurrentAppointment = this.appointmentService.CreateNewGlobal();
      this.CurrentAppointment.AppointmentDate = moment().format('YYYY-MM-DD');
      //this.CurrentAppointment.AppointmentTime = moment().format('HH:mm');
      //rounds off to nearest 10 minutes
      this.CurrentAppointment.AppointmentTime = moment().add((10 - moment().minute() % 10), 'minutes').format('HH:mm');
      this.selProvider = null;
      this.departmentId = 0;
    }
  }

  //load doctor  list according to department.
  //does a get request in employees table using departmentId.
  GenerateDoctorList(): void {
    //erases previously selected doctor and clears respective schedule list
    this.selProvider = null;
    this.appointmentBLService.GenerateDoctorList(this.departmentId)
      .subscribe((res: DanpheHTTPResponse) => {

        if (res.Status == "OK") {
          this.doctorList = [];
          //format return list into Key:Value form, since it searches also by the property name of json.
          if (res && res.Results) {
            res.Results.forEach(a => {
              this.doctorList.push({
                "Key": a.EmployeeId, "Value": a.FullName, DeptId: a.DepartmentId
              });
            });
          }
          this.enablePreview = true;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          //alert("Failed ! " + res.ErrorMessage);
        }
      });
  }



  //used to format display of item in ng-autocomplete.
  docListFormatter(data: any): string {
    let html = data["Value"];
    return html;
  }


  ProviderChanged() {
    this.checkProvider = false;
    //show the departmentid when provider is selected.
    this.departmentId = this.selProvider ? this.selProvider.DeptId : 0;
    this.GetAppointmentList();
    this.CurrentAppointment.IsValidTime();
  }
  OnTimeChange() {
    console.log("Time change");
  }



  ////FOR Quick Appointment--needs proper revision.s
  //AssignPatientPropertiesToCurrAppt() {
  //    let currPatient = this.patientService.getGlobal();
  //    this.CurrentAppointment.PatientId = currPatient.PatientId;
  //    this.CurrentAppointment.FirstName = currPatient.FirstName;
  //    this.CurrentAppointment.LastName = currPatient.LastName;
  //    this.CurrentAppointment.Gender = currPatient.Gender;
  //    this.CurrentAppointment.ContactNumber = currPatient.PhoneNumber;
  //}

  //adding a new appointment
  AddTelephoneAppointment() {
    var repeated: boolean = false;
    //this is jugaad since provider was invalid inside validator.
    this.CurrentAppointment.ProviderId = this.selProvider ? this.selProvider.Key : 0;//this will give providerid
    this.CurrentAppointment.ProviderName = this.selProvider ? this.selProvider.Value : '';
    this.CurrentAppointment.DepartmentId = this.selProvider ? this.selProvider.DeptId : 0;



    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentAppointment.AppointmentValidator.controls) {
      this.CurrentAppointment.AppointmentValidator.controls[i].markAsDirty();
      this.CurrentAppointment.AppointmentValidator.controls[i].updateValueAndValidity();
    }

    if (this.CurrentAppointment.IsValidCheck(undefined, undefined)) {

      this.loading = true;
      this.CurrentAppointment.AppointmentType = "New";
      this.CurrentAppointment.AppointmentStatus = "Initiated"

      this.CurrentAppointment.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentAppointment.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');



      this.appointmentBLService.CheckForClashingAppointment(this.CurrentAppointment.PatientId, this.CurrentAppointment.AppointmentDate, this.CurrentAppointment.ProviderId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            let isClashingAppointment: boolean = res.Results;

            if (isClashingAppointment) {
              this.loading = false;
              this.msgBoxServ.showMessage("failed", ['This patient already has appointment / visit with ' + this.CurrentAppointment.ProviderName + ' on ' + this.CurrentAppointment.AppointmentDate]);
            }
            else {
              //this.ConcatinateAgeAndUnit();
              this.appointmentBLService.AddAppointment(this.CurrentAppointment)
                .subscribe((res: DanpheHTTPResponse) => {
                  if (res.Status == "OK") {
                    this.loading = false;
                    this.selProvider = null;
                    this.showApptPanel = false;
                    this.msgBoxServ.showMessage("success", ['Your Appointment is Created. Your AppointmentID is ' + res.Results.AppointmentId]);
                  } else { this.msgBoxServ.showMessage("failed", ['Failed!! Cannot create appointment.']); }
                },
                  err => {
                    this.loading = false;
                    this.msgBoxServ.showMessage("failes", [err.ErrorMessage]);
                  });

            }

          }
          else {
            this.appointmentBLService.AddAppointment(this.CurrentAppointment)
              .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                  this.loading = false;
                  this.showApptPanel = false;
                  this.selProvider = null;
                  this.msgBoxServ.showMessage("success", ['Your Appointment is Created. Your AppointmentID is ' + res.Results.AppointmentId]);
                } else { this.msgBoxServ.showMessage("failed", ['Failed!! Cannot create appointment.']); }
              },
                err => {
                  this.loading = false;
                  this.msgBoxServ.showMessage("failed", [err.ErrorMessage]);
                });
          }
        });




    }

  }

  IsRepeated() {
  }



  AppointmentPatientGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      //checkin is 'add visit'--for reference
      case "create":
        {
          this.CurrentAppointment = new Appointment();

          this.CurrentAppointment.PatientId = $event.Data.PatientId;
          this.CurrentAppointment.FirstName = $event.Data.FirstName;
          this.CurrentAppointment.MiddleName = $event.Data.MiddleName;
          this.CurrentAppointment.LastName = $event.Data.LastName;
          this.CurrentAppointment.Gender = $event.Data.Gender;
          this.CurrentAppointment.ContactNumber = $event.Data.PhoneNumber;
          this.CurrentAppointment.AppointmentDate = moment().format('YYYY-MM-DD');
          this.CurrentAppointment.AppointmentTime = moment().format('HH:mm:ss');
          this.selProvider = null;
          this.departmentId = 0;

          //disabling controls for registered patients
          this.CurrentAppointment.AppointmentValidator.controls['FirstName'].disable();
          this.CurrentAppointment.AppointmentValidator.controls['MiddleName'].disable();
          this.CurrentAppointment.AppointmentValidator.controls['LastName'].disable();
          this.CurrentAppointment.AppointmentValidator.controls['Gender'].disable();
          this.CurrentAppointment.AppointmentValidator.controls['ContactNumber'].disable();

          this.aptList = new Array<Appointment>();

          this.showApptPanel = true;
        }
        break;

      default:
        break;
    }
  }


}
