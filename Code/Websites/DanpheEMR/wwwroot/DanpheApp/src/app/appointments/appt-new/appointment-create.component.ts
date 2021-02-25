import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { AppointmentService } from '../shared/appointment.service';
import { AppointmentBLService } from '../shared/appointment.bl.service';
import { SecurityService } from '../../security/shared/security.service';
import { Appointment } from "../shared/appointment.model";
import * as moment from 'moment/moment';//Parse, validate, manipulate, and display dates and times in JS.
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { PatientService } from "../../patients/shared/patient.service";
import { CallbackService } from '../../shared/callback.service';
import { RouteFromService } from '../../shared/routefrom.service';
import { Patient } from "../../patients/shared/patient.model";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { CoreBLService } from "../../core/shared/core.bl.service";
import { APIsByType } from "../../shared/search.service";
import { VisitService } from "../shared/visit.service";
import { VisitBLService } from "../shared/visit.bl.service";
import { Department } from "../../settings-new/shared/department.model";
import { CoreService } from "../../core/shared/core.service";

@Component({
  templateUrl: "./create-appointment.html" //"/AppointmentView/CreateAppointment" 
})

export class AppointmentCreateComponent {
  public CurrentAppointment: Appointment = new Appointment();
  patients: Array<Patient> = new Array<Patient>();
  AppointmentpatientGridColumns: Array<any> = null;
  public showApptPanel: boolean = false;
  public Update: boolean = false;
  public departmentId: number = 0;
  public doctorList: Array<{ DepartmentId: number, DepartmentName: string, ProviderId: number, ProviderName: string, ItemName: string, Price: number, IsTaxApplicable: boolean, SAARCCitizenPrice: number, ForeignerPrice: number }> = [];
  public filteredDocList: Array<{ DepartmentId: number, DepartmentName: string, ProviderId: number, ProviderName: string, ItemName: string, Price: number, IsTaxApplicable: boolean, SAARCCitizenPrice: number, ForeignerPrice: number }>;
  public departmentList: Array<Department>;
  public selectedDepartment: any = null;
  public selectedDoctor: any = null;
  public enablePreview: boolean = false;
  public aptList: Array<Appointment> = new Array<Appointment>();
  public aptListafterTime: Array<any> = null;
  public aptListbeforeTime: Array<any> = null;
  public Patient: Patient;
  //declare boolean loading variable for disable the double click event of button
  loading: boolean = false;
  ///this is used to check provider
  public checkProvider: boolean = false;

  department: Array<any> = new Array<any>();
  public patGirdDataApi: string = "";
  searchText: string = '';
  public enableServerSideSearch: boolean = false;
  constructor(public appointmentBLService: AppointmentBLService,
    public appointmentService: AppointmentService,
    public callbackservice: CallbackService,
    public securityService: SecurityService,
    public router: Router,
    public msgBoxServ: MessageboxService,
    public patientService: PatientService,
    public routeFromService: RouteFromService,
    public coreBlService: CoreBLService,
    public visitService: VisitService,
    public visitBLService: VisitBLService,
    public coreService: CoreService) {

    this.visitService.ApptApplicableDoctorsList;
    this.getParamter();
    this.LoadPatients("");

    this.AppointmentpatientGridColumns = GridColumnSettings.AppointmentAllPatientSearch;
    //this.patGirdDataApi = APIsByType.PatByName;

  }
  ngOnInit() {
    this.getDepts();
    this.getDocts();
  }
  serverSearchTxt(searchTxt) {
    this.searchText = searchTxt;
    this.LoadPatients(this.searchText);
  }
  getParamter() {
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
    var data = JSON.parse(parameterData);
    this.enableServerSideSearch = data["PatientSearchPatient"];
  }
  GetDepartments() {
    //this.departmentList = this.visitService.ApptApplicableDepartmentList; 
    // to edit previous phonebook appointment 
    if (this.appointmentService.globalAppointment.AppointmentId != 0) {
      this.CurrentAppointment.AppointmentId = this.appointmentService.globalAppointment.AppointmentId;
      this.CurrentAppointment.FirstName = this.appointmentService.globalAppointment.FirstName;
      this.CurrentAppointment.LastName = this.appointmentService.globalAppointment.LastName;
      this.CurrentAppointment.MiddleName = this.appointmentService.globalAppointment.MiddleName;
      this.CurrentAppointment.Gender = this.appointmentService.globalAppointment.Gender;
      this.CurrentAppointment.AppointmentDate = moment(this.appointmentService.globalAppointment.AppointmentDate).format('YYYY-MM-DD');
      this.CurrentAppointment.AppointmentStatus = this.appointmentService.globalAppointment.AppointmentStatus;
      this.CurrentAppointment.AppointmentTime = this.appointmentService.globalAppointment.AppointmentTime;
      this.CurrentAppointment.AppointmentType = this.appointmentService.globalAppointment.AppointmentType;
      this.CurrentAppointment.ContactNumber = this.appointmentService.globalAppointment.ContactNumber;
      this.CurrentAppointment.CreatedOn = this.appointmentService.globalAppointment.CreatedOn;
      this.CurrentAppointment.AgeUnit = this.appointmentService.globalAppointment.AgeUnit;
      this.CurrentAppointment.ProviderName = this.appointmentService.globalAppointment.ProviderName;
      this.CurrentAppointment.Reason = this.appointmentService.globalAppointment.Reason;
      this.CurrentAppointment.Age = this.appointmentService.globalAppointment.Age;
      this.SwitchToUpdate();
      if (this.CurrentAppointment.ProviderId != null || this.CurrentAppointment.DepartmentId != null || this.CurrentAppointment.ProviderId != 0 || this.CurrentAppointment.DepartmentId != 0) {
        this.CurrentAppointment.ProviderId = this.appointmentService.globalAppointment.ProviderId;
        this.selectedDoctor = this.CurrentAppointment.ProviderName;
        this.CurrentAppointment.DepartmentId = this.appointmentService.globalAppointment.DepartmentId;
        this.departmentList = this.visitService.ApptApplicableDepartmentList;
        if (this.appointmentService.globalAppointment.DepartmentId != null) {
          this.doctorList = this.visitService.ApptApplicableDoctorsList;
          this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);
          this.selectedDepartment = this.departmentList.find(a => a.DepartmentId == this.CurrentAppointment.DepartmentId).DepartmentName;
        }
      }
    }
  }

  GetVisitDoctors() {
    this.enablePreview = true;
    this.filteredDocList = this.doctorList = this.visitService.ApptApplicableDoctorsList;
    //this.AssignSelectedDoctor();
  }

  public GetAppointmentList() {
    let providerId = this.selectedDoctor ? this.selectedDoctor.ProviderId : null;
    if (providerId) {
      this.appointmentBLService.GetAppointmentProviderList(providerId, this.CurrentAppointment.AppointmentDate)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.aptList = res.Results;
            this.aptListbeforeTime = this.aptList;
            var Time;
            for (var i = 0; i < this.aptListbeforeTime.length; i++) {
              let HHmmss = this.aptListbeforeTime[i].Time.split(':');
              let appTimeHHmm = "";
              if (HHmmss.length > 1) {
                //add hours and then minute to 00:00 and then format to 12hrs hh:mm AM/PM format. 
                //using 00:00:00 time so that time part won't have any impact after adding.
                appTimeHHmm = moment("2017-01-01 00:00:00").add(HHmmss[0], 'hours').add(HHmmss[1], 'minutes').format('hh:mm A');
                this.aptListbeforeTime[i].Time = appTimeHHmm;
              }
              this.aptListafterTime = this.aptListbeforeTime;
            }
            this.CurrentAppointment.AppointmentList = res.Results;
            if (this.Update && this.CurrentAppointment.AppointmentList.length > 0) {
              this.CurrentAppointment.AppointmentList = this.CurrentAppointment.AppointmentList.filter(a => a.Time != this.CurrentAppointment.AppointmentTime);
              this.aptList = this.CurrentAppointment.AppointmentList;
            }
          }
          else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
          });
    } else {
      this.aptList = new Array<Appointment>();
    }
  }

  ngAfterViewInit() {
    document.getElementById('quickFilterInput').focus();
  }

  ConditionalValidationOfAgeAndDOB() {
    if (this.CurrentAppointment.IsDobVerified == true) {
      //incase age was entered
      this.CurrentAppointment.Age = null;
      let onOff = 'off';
      let formControlName = 'Age';
      this.CurrentAppointment.UpdateValidator(onOff, formControlName);
    }
    else {
      let onOff = 'on';
      let formControlName = 'Age';
      this.CurrentAppointment.UpdateValidator(onOff, formControlName);

    }
  }
  LoadPatients(searchTxt): void {
    this.appointmentBLService.GetPatients(searchTxt)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.patients = res.Results;
          this.GetVisitDoctors();
          this.GetDepartments();
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["failed to get  patients"] + err);
        });
  }

  getDepts() {
    this.visitBLService.GetDepartment()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.visitService.ApptApplicableDepartmentList = res.Results;
          this.visitService.ApptApplicableDepartmentList = this.coreService.Masters.Departments.filter(d => d.IsAppointmentApplicable == true && d.IsActive == true).map(d => {
            return {
              DepartmentId: d.DepartmentId,
              DepartmentName: d.DepartmentName
            };
          });
        }

      });
  }

  getDocts() {
    this.visitBLService.GetVisitDoctors()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.visitService.ApptApplicableDoctorsList = res.Results;
        }
      });
  }


  SwitchViews() {
    this.showApptPanel = !this.showApptPanel;
    this.aptList = new Array<Appointment>();
    if (this.showApptPanel) {
      this.CurrentAppointment = this.appointmentService.CreateNewGlobal();
      this.CurrentAppointment.AppointmentDate = moment().format('YYYY-MM-DD');
      //rounds off to nearest 10 minutes
      this.CurrentAppointment.AppointmentTime = moment().add((10 - moment().minute() % 10), 'minutes').format('HH:mm');
      this.selectedDoctor = null;
      this.departmentId = 0;
    }
  }

  SwitchToUpdate() {
    this.Update = true;
    this.showApptPanel = !this.showApptPanel;
  }

  public AssignSelectedDepartment() {
    this.departmentList = this.visitService.ApptApplicableDepartmentList;
    let department = null;
    this.selectedDoctor = "";
    if (this.selectedDepartment == "") {
      this.CurrentAppointment.IsValidSelDepartment = true;
      this.departmentId = 0;
      this.CurrentAppointment.DepartmentId = null;
      this.CurrentAppointment.DepartmentName = "";
      this.CurrentAppointment.ProviderId = null;
      this.CurrentAppointment.ProviderName = "";
      //this.filteredDocList = this.doctorList;
      return;
    }
    if (this.selectedDepartment && this.departmentList && this.departmentList.length) {
      if (typeof (this.selectedDepartment) == 'string') {
        department = this.departmentList.find(a => a.DepartmentName.toLowerCase() == String(this.selectedDepartment).toLowerCase());

      }
      else if (typeof (this.selectedDepartment) == 'object' && this.selectedDepartment.DepartmentId)
        department = this.departmentList.find(a => a.DepartmentId == this.selectedDepartment.DepartmentId);


      if (department) {
        this.selectedDepartment = Object.assign(this.selectedDepartment, department);
        this.departmentId = department.DepartmentId;
        this.CurrentAppointment.IsValidSelDepartment = true;
        this.CurrentAppointment.DepartmentId = department.DepartmentId;
        this.CurrentAppointment.DepartmentName = department.DepartmentName;
        this.selectedDoctor = null;
        this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);
        this.FilterDoctorList();

      }
      //else if (this.CurrentAppointment.DepartmentId != 0) {
      //    this.CurrentAppointment.DepartmentId = this.appointmentService.globalAppointment.DepartmentId;
      //    this.selectedDepartment = this.departmentList.find(a => a.DepartmentId == this.CurrentAppointment.DepartmentId).DepartmentName;
      //}
      else {
        this.CurrentAppointment.IsValidSelDepartment = false;
      }
    }
    else {
      this.departmentId = 0;
      this.CurrentAppointment.DepartmentId = null;
      this.CurrentAppointment.DepartmentName = null;
      //this.filteredDocList = this.doctorList;
    }
    //this.GetAppointmentDepartmentList();
    this.CurrentAppointment.IsValidTime();
  }

  public AssignSelectedDoctor() {
    this.filteredDocList;
    let doctor = null;
    if (this.selectedDoctor == "" || this.selectedDoctor == undefined) {
      this.filteredDocList = this.doctorList = this.visitService.ApptApplicableDoctorsList;
      this.aptList = new Array<Appointment>();
      this.CurrentAppointment.IsValidSelProvider = true;

      if (this.CurrentAppointment.DepartmentId == null) {
        this.departmentList = this.visitService.ApptApplicableDepartmentList;
        this.filteredDocList = this.doctorList = this.visitService.ApptApplicableDoctorsList;
      }
      if (this.CurrentAppointment.DepartmentId != null) {
        this.filteredDocList = this.doctorList = this.visitService.ApptApplicableDoctorsList;
        this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.CurrentAppointment.DepartmentId);
      }
      this.CurrentAppointment.ProviderId = null;
      this.CurrentAppointment.ProviderName = null;

      return;
    }

    if (this.selectedDoctor && this.doctorList && this.doctorList.length) {
      if (typeof (this.selectedDoctor) == 'string') {
        doctor = this.doctorList.find(a => a.ProviderName.toLowerCase() == String(this.selectedDoctor).toLowerCase());
      }
      else if (typeof (this.selectedDoctor) == 'object' && this.selectedDoctor.ProviderId)
        doctor = this.doctorList.find(a => a.ProviderId == this.selectedDoctor.ProviderId);
      if (doctor) {
        this.departmentId = doctor.DepartmentId;
        this.selectedDepartment = doctor.DepartmentName;
        this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);
        this.selectedDoctor = Object.assign(this.selectedDoctor, doctor);
        this.CurrentAppointment.ProviderId = doctor.ProviderId;//this will give providerid
        this.CurrentAppointment.ProviderName = doctor.ProviderName;
        this.CurrentAppointment.IsValidSelProvider = true;
        this.CurrentAppointment.IsValidSelDepartment = true;
        this.CurrentAppointment.DepartmentId = doctor.DepartmentId;
      }
      else {
        this.CurrentAppointment.IsValidSelProvider = false;
      }
    }
    else {
      this.CurrentAppointment.ProviderId = null;
      this.CurrentAppointment.ProviderName = null;
      this.AssignSelectedDepartment();//sud:19June'19-- If doctor is not proper then assign bill items that of Department level.
    }
    this.GetAppointmentList();
    this.CurrentAppointment.IsValidTime();
  }

  FilterDoctorList() {

    //    if (this.selectedDoctor != null || this.selectedDoctor != 0) {
    //    if (typeof (this.selectedDoctor) == 'object' || this.selectedDoctor == 0 || this.selectedDoctor == "" ) {
    //    //this.selectedDoctor.ProviderName = null;
    //    this.selectedDoctor.ProviderId = 0;
    //  }
    //}
    if (this.departmentId && Number(this.departmentId) != 0) {
      this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);

    }
    else {
      this.filteredDocList = this.doctorList;
    }
  }

  //adding a new appointment
  AddTelephoneAppointment() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentAppointment.AppointmentValidator.controls) {
      this.CurrentAppointment.AppointmentValidator.controls[i].markAsDirty();
      this.CurrentAppointment.AppointmentValidator.controls[i].updateValueAndValidity();
    }

    if (this.CurrentAppointment.IsValidCheck(undefined, undefined)
      && this.CurrentAppointment.IsValidSelDepartment
      && this.CurrentAppointment.IsValidSelProvider) {

      //removing extra spaces typed by the users
      this.CurrentAppointment.FirstName = this.CurrentAppointment.FirstName.trim();
      this.CurrentAppointment.MiddleName = this.CurrentAppointment.MiddleName ? this.CurrentAppointment.MiddleName.trim() : null;
      this.CurrentAppointment.LastName = this.CurrentAppointment.LastName.trim();

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
              this.appointmentBLService.AddAppointment(this.CurrentAppointment)
                .subscribe((res: DanpheHTTPResponse) => {
                  if (res.Status == "OK") {
                    this.loading = false;
                    this.selectedDoctor = null;
                    this.selectedDepartment = null;
                    this.showApptPanel = false;
                    this.msgBoxServ.showMessage("success", ['Your Appointment is Created. Your AppointmentID is ' + res.Results.AppointmentId]);
                  } else { this.msgBoxServ.showMessage("failed", ['Failed!! Cannot create appointment.']); }
                },
                  err => {
                    this.msgBoxServ.showMessage("failes", [err.ErrorMessage]);
                  });
              this.loading = false;
            }

          }
          else {
            this.appointmentBLService.AddAppointment(this.CurrentAppointment)
              .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                  this.loading = false;
                  this.showApptPanel = false;
                  this.selectedDoctor = null;
                  this.selectedDepartment = null;
                  this.msgBoxServ.showMessage("success", ['Your Appointment is Created. Your AppointmentID is ' + res.Results.AppointmentId]);
                } else { this.msgBoxServ.showMessage("failed", ['Failed!! Cannot create appointment.']); }
              },
                err => {
                  this.msgBoxServ.showMessage("failed", [err.ErrorMessage]);
                });
            this.loading = false;
          }
        });
    }
    else {
      this.msgBoxServ.showMessage("failed", ['Failed!! Cannot create appointment. Check the Details Correctly.']);
    }
  }

  UpdateTelephoneAppointment() {
    for (var i in this.CurrentAppointment.AppointmentValidator.controls) {
      this.CurrentAppointment.AppointmentValidator.controls[i].markAsDirty();
      this.CurrentAppointment.AppointmentValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentAppointment.IsValidCheck(undefined, undefined)
      && this.CurrentAppointment.IsValidSelDepartment
      && this.CurrentAppointment.IsValidSelProvider) {
      this.appointmentBLService.CheckForClashingAppointment(this.CurrentAppointment.PatientId, this.CurrentAppointment.AppointmentDate, this.CurrentAppointment.ProviderId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            let isClashingAppointment: boolean = res.Results;

            if (isClashingAppointment) {
              this.loading = false;
              this.msgBoxServ.showMessage("failed", ['This patient already has appointment / visit with ' + this.CurrentAppointment.ProviderName + ' on ' + this.CurrentAppointment.AppointmentDate]);
            }
            else {
              this.appointmentBLService.PutAppointment(this.CurrentAppointment)
                .subscribe(res => {
                  if (res.Status == 'OK') {
                    this.patients = res.Results;
                    this.router.navigate(['/Appointment/ListAppointment']);
                  }
                  else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                  }
                },
                  err => {
                    this.msgBoxServ.showMessage("error", ["failed to update appointment"] + err);
                  });
              this.loading = false;
            }
          }
        });
    }
    else { this.msgBoxServ.showMessage("Failed", ["Please fill the form properly."]); }


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
          this.CurrentAppointment.Age = $event.Data.Age.slice(0, -1);
          this.CurrentAppointment.ContactNumber = $event.Data.PhoneNumber;
          this.CurrentAppointment.AppointmentDate = moment().format('YYYY-MM-DD');
          this.CurrentAppointment.AppointmentTime = moment().format('HH:mm:ss');
          this.selectedDoctor = null;
          this.departmentId = 0;

          //disabling controls for registered patients
          this.CurrentAppointment.AppointmentValidator.controls['FirstName'].disable();
          this.CurrentAppointment.AppointmentValidator.controls['MiddleName'].disable();
          this.CurrentAppointment.AppointmentValidator.controls['LastName'].disable();
          this.CurrentAppointment.AppointmentValidator.controls['Gender'].disable();
          this.aptList = new Array<Appointment>();

          this.showApptPanel = true;
        }
        break;

      default:
        break;
    }
  }

  myDepartmentListFormatter(data: any): string {
    let html = data["DepartmentName"];
    return html;
  }

  DocListFormatter(data: any): string {
    let html = data["ProviderName"];
    return html;
  }

  OnTimeChange() {
    console.log("Time change");
  }
}
