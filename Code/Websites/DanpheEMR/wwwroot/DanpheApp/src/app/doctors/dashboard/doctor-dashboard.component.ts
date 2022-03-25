import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { CoreService } from '../../core/shared/core.service';
import * as moment from 'moment/moment';
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';

import { PatientService } from "../../patients/shared/patient.service";
import { VisitService } from '../../appointments/shared/visit.service';
import { CallbackService } from '../../shared/callback.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DoctorsBLService } from '../shared/doctors.bl.service';
import { RouteFromService } from '../../shared/routefrom.service';

import { Visit } from "../../appointments/shared/visit.model";
import { Patient } from '../../patients/shared/patient.model';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { SecurityService } from '../../security/shared/security.service';
import { DanpheCache, MasterType } from '../../shared/danphe-cache-service-utility/cache-services';
import { Employee } from '../../employee/shared/employee.model';
@Component({
  templateUrl: "./doctor-dashboard.html" // "/DoctorsView/DoctorDashboard"
})

export class DoctorDashboardComponent implements OnDestroy {
  public _patientservice: PatientService = null;
  currentVisit: Visit = new Visit();
  public visitList: Array<Visit> = new Array<Visit>();
  public DeptVisitList: Array<Visit> = new Array<Visit>();
  public filtertodaysVisitList: Array<any> = new Array<any>();
  public _visitService: VisitService = null;
  public _callbackService: CallbackService = null;
  public enablePreview: boolean = false;
  public currentPatient: Patient = null;
  //used to pass value to rangeType in custom-date
  public dateRange: string = null;
  public fromDate: string = null;
  public toDate: string = null;
  public todaysVisitList: Array<any> = new Array<any>();
  public today: string = null;
  public DateValidator: FormGroup = null;
  public docAppointmentGridColumns: Array<any> = null;
  public docDeptAppointmentGridColumns: Array<any> = null;
  public index: number;
  public ShowMessage: boolean = false;
  public selectedVisit: Visit = new Visit();
  public DepartMentName: string = null;
  public deptProviderList: any;
  public VisitTypeList: any[];
  selectedVisitType: any;
  public employeeId: number = 0;
  public validDate: boolean = false;
  public showAssignToOther = false;
  public addTreatmentType = false;
  public currSelectedPatient: any;
  public newAssignee: any;
  public patientVisitType: string = "all";
  private appointmentList: any;
  public  Timer: any = null;
  public showExamination :boolean = false;
  constructor(
    _patientService: PatientService,
    _visitServ: VisitService,
    _callbackService: CallbackService,
    public router: Router,
      public msgBoxServ: MessageboxService,
      //public coreService: CoreService,
    public doctorsBLService: DoctorsBLService,
    public routeFromService: RouteFromService,
    public changeDetector: ChangeDetectorRef,
    public securityService: SecurityService) {
    this._patientservice = _patientService;
    this._visitService = _visitServ;
    this._callbackService = _callbackService;
    var _formBuilder = new FormBuilder();
    this.docAppointmentGridColumns = GridColumnSettings.DoctorAppointmentList;
    this.docDeptAppointmentGridColumns = GridColumnSettings.DoctorDepartmentAppointmentList;
    //validation 
    this.DateValidator = _formBuilder.group({
      'fromDate': [this.fromDate, Validators.compose([Validators.required, this.dateValidators])],
      'toDate': [this.toDate, Validators.compose([Validators.required, this.dateValidators])],
    });
    this.dateRange = "lastWeek";
    this.today = moment().format('YYYY-MM-DD');
    this.GetICDList();
    this.GetDepartMent();
    this.LoadTodaysVisitList();
    //this.GetMessageOfTheDay();
    this.Timer = setInterval(() => {
      this.LoadTodaysVisitList();
      this.LoadPreviousVisitList()
    },60000);
  }
  ngOnDestroy() {
    clearInterval(this.Timer);
  }

  GetICDList() {
    var icd = DanpheCache.GetData(MasterType.ICD, null);
  }

  GetDepartMent() {
    this.employeeId = this.securityService.GetLoggedInUser().EmployeeId;
    this.doctorsBLService.GetDepartMent(this.employeeId).subscribe(res => {
      if (res.Status == "OK") {
        var data = res.Results;
        this.DepartMentName = data.DepartmentName;
        this.deptProviderList = data.Providers;
      }
      else {
        this.msgBoxServ.showMessage("failed", ["Invalid Employee"]);
      }
    });
  }
  LoadTodaysVisitList() {
    if (this.today >= moment().format('YYYY-MM-DD')) {
      this.doctorsBLService.GetTodaysVisitsList(this.today)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.todaysVisitList = [];
          //  this.changeDetector.detectChanges();
            this.appointmentList = res.Results;
            
            this.OnVisitTypeChange();
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          }
        });
    }
    else {
      this.msgBoxServ.showMessage("", ["Select Present or future date."]);
    }
  }

  LoadPreviousVisitList() {
    if (this.fromDate <= this.toDate) {
      if (this.fromDate >= moment().format('YYYY-MM-DD') || this.toDate >= moment().format('YYYY-MM-DD')) {
        this.validDate = true;
        this.doctorsBLService.GetPastVisits(this.fromDate, this.toDate)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.visitList = [];
             // this.changeDetector.detectChanges();
              this.visitList = this.GetFormattedVisits(res.Results);
            }
            else {
              this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            }
          });
      }
      else {
        this.msgBoxServ.showMessage("", ["Future Dates are not allowed."]);
      }
    }
    else {
      this.validDate = false;
      this.visitList = [];
      this.msgBoxServ.showMessage("", ["Select proper dates."]);
    }
  }
  GetFormattedVisits(visitList: Array<Visit>): Array<Visit> {
    //adding a property Age into each visit's Patient object. 
    //try and make the logic global if needed.. 
    let formattedVisits = visitList.map(function (vis) {
      //let dateOfBirth = vis.Patient.DateOfBirth;
      //let currentDate = moment().format('YYYY-MM-DD');
      //vis.Patient.Age = moment(currentDate).diff(moment(dateOfBirth).format('YYYY-MM-DD'), 'years');
      vis.VisitDate = moment(vis.VisitDate).format('YYYY-MM-DD');
      vis.VisitTime = moment(vis.VisitTime, "hhmm").format('hh:mm A');
      vis.VisitType = vis.VisitType.toUpperCase();
      vis.Patient.Gender = vis.Patient.Gender.charAt(0).toUpperCase();
      return vis;
    });
    return formattedVisits;
  }

  RouteToOrders(selectedVisit: Visit, routeTo: string) {
    this.SelectVisit(selectedVisit);
    this.routeFromService.RouteFrom = routeTo;
    this.router.navigate(['/Doctors/PatientOverviewMain/Orders']);
  }
  RouteToPatientOverview(selectedVisit: Visit) {
    this.SelectVisit(selectedVisit);
    this.router.navigate(['/Doctors/PatientOverviewMain/PatientOverview']);
  }

  //check the assignment logic below properly... 
  SelectVisit(selectedVisit: Visit) {
    let currPatient = this._patientservice.getGlobal();
    let visitGlobal = this._visitService.getGlobal();
    currPatient.PatientId = selectedVisit.PatientId; //patient needed in problems part
    currPatient.PatientCode = selectedVisit.Patient.PatientCode;
    currPatient.Address = selectedVisit.Patient.Address;
    currPatient.PhoneNumber = selectedVisit.Patient.PhoneNumber;
    visitGlobal.PatientId = selectedVisit.PatientId;
    visitGlobal.PatientVisitId = selectedVisit.PatientVisitId;
    currPatient.FirstName = selectedVisit.Patient.FirstName;
    currPatient.LastName = selectedVisit.Patient.LastName;
    currPatient.Gender = selectedVisit.Patient.Gender;
    currPatient.DateOfBirth = selectedVisit.Patient.DateOfBirth;
    currPatient.Age = selectedVisit.Patient.Age;
    currPatient.ShortName = selectedVisit.Patient.ShortName;
    visitGlobal.ProviderId = selectedVisit.ProviderId;
    visitGlobal.ProviderName = selectedVisit.ProviderName;
    visitGlobal.VisitDate = selectedVisit.VisitDate;
    visitGlobal.VisitType = selectedVisit.VisitType;
    visitGlobal.ProviderName = selectedVisit.ProviderName;
    visitGlobal.ConcludeDate = selectedVisit.ConcludeDate;
    visitGlobal.VisitCode=selectedVisit.VisitCode;
    visitGlobal.DepartmentName=selectedVisit.DepartmentName;
    visitGlobal.VisitType=selectedVisit.VisitType;
    this.currentVisit = visitGlobal;
  }

  //to check whether the the textbox is dirty or not ....
  public IsDirty(fieldname): boolean {
    if (fieldname == undefined) {
      return this.DateValidator.dirty;
    }
    else {
      return this.DateValidator.controls[fieldname].dirty;
    }
  }
  //to check it whether the value of the textbox is valid or not ...
  public IsValidCheck(fieldname, validator): boolean {
    // this is used to check for patient form is valid or not 
    if (!this.DateValidator.dirty) {
      return true;
    }
    if (fieldname == undefined) {
      return this.DateValidator.valid;
    }
    else {
      return !(this.DateValidator.hasError(validator, fieldname));
    }
  }

  LoadTreatmentTypeByStatus(value: number) {
    this.filtertodaysVisitList = new Array<any>();
    if (value == 1) {
      if (this.todaysVisitList.length) {
        this.filtertodaysVisitList = JSON.parse(JSON.stringify(this.todaysVisitList));//deepcopy
        this.filtertodaysVisitList.forEach(a => {a.visit = a.visit.filter(a => a.Comments == "Surgery") });
        this.filtertodaysVisitList = this.filtertodaysVisitList.filter(a => a.visit.length != 0);
      }
    }
    if (value == 2) {
      this.filtertodaysVisitList = JSON.parse(JSON.stringify(this.todaysVisitList));//deepcopy
      this.filtertodaysVisitList.forEach(a => { a.visit = a.visit.filter(a => a.Comments == "Normal Checkup") });
      this.filtertodaysVisitList = this.filtertodaysVisitList.filter(a => a.visit.length != 0);
    }
    if (value == 0) {
      this.filtertodaysVisitList = this.todaysVisitList;
    }
  }

  dateValidators(control: FormControl): { [key: string]: boolean } {
    //get current date, month and time
    var currDate = moment().format('YYYY-MM-DD 23:59');

    //if positive then selected date is of future else it of the past
    if ((moment(control.value).diff(currDate) > 0) ||
      (moment(control.value).diff(currDate, 'years') < -10)) // this will not allow the age diff more than 10 is past
      return { 'wrongDate': true };
  }

  //event onDateChange
  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    this.DateValidator.controls["fromDate"].setValue(this.fromDate);
    this.DateValidator.controls["toDate"].setValue(this.toDate);
    this.DateValidator.updateValueAndValidity();
    this.validDate = false;
    this.LoadPreviousVisitList();
  }

  onDateChangeDept($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    this.DateValidator.controls["fromDate"].setValue(this.fromDate);
    this.DateValidator.controls["toDate"].setValue(this.toDate);
    this.DateValidator.updateValueAndValidity();
    this.loadDocDeptVisitList();
  }

  DocAppointmentGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "preview":
        {
          this.RouteToPatientOverview($event.Data);
        }
        break;
      case "labs":
        {
          this.RouteToOrders($event.Data, 'labs');
        }
        break;
      case "imaging":
        {
          this.RouteToOrders($event.Data, 'imaging');
        }
        break;
      case "notes":
        {

        }
        break;
      case "medication":
        {

        }
        break;
        case "Examination":
        {
          this.Examination($event.Data);
         //this.showExamination= true;
        }
        break;
      default:
        break;
    }
  }
  Examination(selectedVisit: Visit) {
     this.SelectVisit(selectedVisit);
     this.showExamination = true;
  }
  CallBackExamination($event){
    this.showExamination = false;
    
  }
  loadDocDeptVisitList() {
    for (var i in this.DateValidator.controls) {
      this.DateValidator.controls[i].markAsDirty();
      this.DateValidator.controls[i].updateValueAndValidity();
    }
    if (this.IsValidCheck(undefined, undefined)) {
      this.doctorsBLService.GetDocDeptVisits(this.fromDate, this.toDate)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.DeptVisitList = [];
          //  this.changeDetector.detectChanges();
            this.DeptVisitList = this.GetFormattedVisits(res.Results);
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          }
        });
    }
  }

  ClosePopUp() {
    this.currentVisit = new Visit();
    this.showAssignToOther = false;
  }

  OnVisitTypeChange() {
    if (this.patientVisitType == "all") {
      this.todaysVisitList = this.appointmentList;
     
      this.filtertodaysVisitList = new Array<any>();
      this.filtertodaysVisitList = JSON.parse(JSON.stringify(this.todaysVisitList));
      return;
    }
    this.todaysVisitList = new Array<any>();
    let vl = new Array<Visit>();
    this.appointmentList.forEach(a => {
      a.visit.forEach(b => {
        if (b.VisitType == this.patientVisitType) {
          vl.push(b);
        }
      });
      this.todaysVisitList.push({ ProviderName: a.ProviderName, visit: vl })
    });

  }
  onChangeToday() {
    this.LoadTodaysVisitList();
  }

  //Close() {
  //  this.ShowMessage = false;
  //}

  ShowAssignToOther(visitdata) {
    var data = {
      PatientName: visitdata.Patient.ShortName,
      AgeSex: visitdata.Patient.Age + "/" + visitdata.Patient.Gender,
      ProviderId: visitdata.ProviderId,
      ProviderName: visitdata.ProviderName,
      VisitId: visitdata.PatientVisitId,
      Remark: ""
    };
    this.newAssignee = visitdata.ProviderId;
    this.currSelectedPatient = data;
    this.showAssignToOther = true;
  }

  ngOnInit() {
    //this.ShowMessage = true;
  }

  AssignToOther() {
    var newProviderId = parseInt(this.newAssignee);
    if (this.currSelectedPatient.ProviderId == newProviderId) {
      this.msgBoxServ.showMessage("Error", ["Choose different provider!"])
      return;
    }
    if (this.currSelectedPatient.Remark == "") {
      this.msgBoxServ.showMessage("Error", ["Remark is mandetory!"])
      return;
    }
    var datatosend = {
      PatientVisitId: this.currSelectedPatient.VisitId,
      ProviderId: newProviderId,
      Remarks: this.currSelectedPatient.Remark,
      ModifiedBy: this.employeeId
    }
    this.doctorsBLService.ChangeProvider(datatosend)
      .subscribe(res => {
        if (res.Status == "OK") {
          var data = res.Results;
          this.msgBoxServ.showMessage("Success", ["Assigned to " + data]);
          this.LoadTodaysVisitList();
        } else {
          this.msgBoxServ.showMessage("Error", ["Data not updated please try again!"]);
        }
      });
    this.showAssignToOther = false;
    }



    //public messageDetail: any;

    //GetMessageOfTheDay() {
    //    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Information/Message').ParameterValue;
    //    if (paramValue)
    //        this.messageDetail = paramValue;
    //    else
    //        this.msgBoxServ.showMessage("error", ["Please enter parameter values for Information or Message"]);
    //}
}
