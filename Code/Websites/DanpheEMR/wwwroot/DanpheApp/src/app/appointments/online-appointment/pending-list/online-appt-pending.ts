import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from '../../../core/shared/core.service';
import { LoginToTelemed } from '../../../labs/shared/labMasterData.model';
import { LabsBLService } from '../../../labs/shared/labs.bl.service';
import { Patient } from '../../../patients/shared/patient.model';
import { PatientService } from '../../../patients/shared/patient.service';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { AppointmentBLService } from '../../shared/appointment.bl.service';
import { AppointmentService } from '../../shared/appointment.service';
import { VisitService } from '../../shared/visit.service';
@Component({
  templateUrl: "./online-appt-pending.html"
})
export class OnlineAppointmentPendingListComponent {
  public fromDate: any;
  public toDate: any;
  public paymentStatus: string = "all";
  public onlineAppointmentList: any;
  public teleMedicineConfiguration: any;
  public Login = new LoginToTelemed();
  public isTeleMedicineEnabled: boolean = false;
  public interval: any;
  public onlineAppointmentGridColumns: any;
  public totalInitaitedVisitCount: number = 0;
  onlineAppointmentListFiltered: any;
  public showDoctor: boolean = false;
  public doctorList: any;
  public selectedDoctor: any;
  public selectedDepartment: any;
  public departmentList: any;
  public initialLoad: boolean = true;
  public loading: boolean = false;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(public coreService: CoreService, public labBlService: LabsBLService, public appointmentBLService: AppointmentBLService,
    public msgBoxService: MessageboxService, public router: Router,
    public patientService: PatientService, public appointmentService: AppointmentService,
    public routeFromService: RouteFromService, public visitService: VisitService) {
    this.onlineAppointmentGridColumns = GridColumnSettings.OnlineAppointmentList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("VisitDate", true));
    this.getParameterAndLogin();
    this.showDoctor = !this.coreService.EnableDepartmentLevelAppointment();
    this.departmentList = this.coreService.Masters.Departments;
    this.doctorList = this.visitService.ApptApplicableDoctorsList;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  gridExportOptions = {
    fileName:
      "OnlineAppointmentPendingList" + moment().format("YYYY-MM-DD") + ".xls",
  };

  getParameterAndLogin() {
    let TeleMedicineConfig = this.coreService.Parameters.find(p => p.ParameterGroupName == "TeleMedicine" && p.ParameterName == "DanpheConfigurationForTeleMedicine").ParameterValue;
    this.teleMedicineConfiguration = JSON.parse(TeleMedicineConfig);
    this.Login.PhoneNumber = this.teleMedicineConfiguration.PhoneNumber;
    this.Login.Password = this.teleMedicineConfiguration.Password;
    this.isTeleMedicineEnabled = JSON.parse(this.teleMedicineConfiguration.IsTeleMedicineEnabled);
    if (this.isTeleMedicineEnabled) {
      this.TeleMedLogin();
      this.interval = setInterval(() => {
        this.TeleMedLogin();
      }, this.teleMedicineConfiguration.TokenExpiryTimeInMS)
    }
  }

  public TeleMedLogin() {
    if (sessionStorage.getItem('TELEMED_Token') == null) {
      this.labBlService.TeleMedLogin(this.teleMedicineConfiguration.TeleMedicineBaseUrl, this.Login).subscribe(res => {
        var token = res.token;
        sessionStorage.removeItem('TELEMED_Token');
        sessionStorage.setItem('TELEMED_Token', token);
        token && this.getOnlineAppointmentData();
      },
        err => {
          console.log(err.ErrorMessage);
        }
      );
    }
  }

  getOnlineAppointmentData() {
    this.initialLoad = false;
    this.onlineAppointmentList = [];
    this.totalInitaitedVisitCount = 0;
    this.onlineAppointmentListFiltered = [];
    this.appointmentBLService.getOnlineAppointmentData(this.teleMedicineConfiguration.TeleMedicineBaseUrl, this.fromDate, this.toDate).subscribe(res => {
      if (res.length > 0) {
        this.onlineAppointmentList = res;
        this.filterData();
      }
      else {
        this.onlineAppointmentList = [];
        this.totalInitaitedVisitCount = 0;
        this.onlineAppointmentListFiltered = [];
      }
    },
      err => {
        this.msgBoxService.showMessage("error", ["Unable to fetch online appointment data."]);
      },
      () => {
        this.loading = false;
      });
  }

  OnFromToDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.initialLoad && sessionStorage.getItem('TELEMED_Token') != null)
      this.getOnlineAppointmentData();
  }

  filterData() {
    if (this.onlineAppointmentList && this.onlineAppointmentList.length > 0) {
      var list = this.onlineAppointmentList.filter(a => a.Status == "initiated");
      this.totalInitaitedVisitCount = list.length;
      if (this.selectedDepartment && typeof (this.selectedDepartment) == 'object') {
        list = list.filter(a => a.DepartmentName.replace(/\s+/g, '').toLocaleLowerCase() == this.selectedDepartment.DepartmentName.replace(/\s+/g, '').toLocaleLowerCase());
      }
      if (this.selectedDoctor && typeof (this.selectedDoctor) == 'object') {
        list = list.filter(a => a.DoctorName.replace(/\s+/g, '').toLocaleLowerCase() == this.selectedDoctor.PerformerName.replace(/\s+/g, '').substring(3).toLocaleLowerCase());
      }
      if (this.paymentStatus == 'all')
        this.onlineAppointmentListFiltered = list;
      else
        this.onlineAppointmentListFiltered = list.filter(a => a.PaymentStatus == this.paymentStatus);
    }
  }
  OnlineAppointmentGridActions($event) {
    switch ($event.Action) {
      case "checkin":
        let visit = $event.Data;
        var pat = this.patientService.CreateNewGlobal();
        var appt = this.appointmentService.CreateNewGlobal();
        this.appointmentService.GlobalTelemedPatientVisitID = visit.VisitId;
        this.patientService.Telmed_Payment_Status = visit.PaymentStatus;
        this.appointmentBLService.GetPatientByGUID(visit.PatientId)
          .subscribe(res => {
            if (res.Status == "OK" && res.Results) {

              let retPatient: Patient = res.Results;
              pat.PatientId = retPatient.PatientId;
              pat.PatientCode = retPatient.PatientCode;
              pat.FirstName = retPatient.FirstName;
              pat.LastName = retPatient.LastName;
              pat.MiddleName = retPatient.MiddleName;
              pat.DateOfBirth = moment(retPatient.DateOfBirth).format('YYYY-MM-DD');
              pat.CountrySubDivisionId = retPatient.CountrySubDivision.CountrySubDivisionId;
              pat.CountrySubDivisionName = retPatient.CountrySubDivision.CountrySubDivisionName;
              pat.Gender = retPatient.Gender;
              pat.Age = retPatient.Age;
              pat.Email = retPatient.Email;
              pat.PhoneNumber = retPatient.PhoneNumber;
              pat.ShortName = retPatient.ShortName;
              pat.Salutation = retPatient.Salutation;
              pat.CountryId = retPatient.CountryId;
              pat.IsDobVerified = retPatient.IsDobVerified;
              //pat.MembershipTypeId = retPatient.MembershipTypeId;
              pat.Address = retPatient.Address;
              pat.Telmed_Patient_GUID = retPatient.Telmed_Patient_GUID;
            }
            else {
              pat.PatientId = 0;
              let fullname = visit.PatientName.trim().split(" ");
              pat.FirstName = fullname[0];
              pat.MiddleName = fullname[1];
              pat.LastName = fullname[1] != "" ? fullname[2] : fullname[fullname.length - 1];
              pat.Telmed_Patient_GUID = visit.PatientId;
              pat.DateOfBirth = moment(visit.DateOfBirth).format('YYYY-MM-DD');
              pat.Gender = visit.Gender;
              pat.Age = this.getAgeFromDateOfBirth(visit.DateOfBirth);
              pat.PhoneNumber = visit.ContactNumber;
              pat.ShortName = visit.PatientName;
            }
            this.routeFromService.RouteFrom = "onlineappointment";
            this.router.navigate(['/Appointment/Visit']);
          }
            ,
            err => {
              this.msgBoxService.showMessage("error", ["failed to get selected patient"]);
            },
          );
        appt.AppointmentDate = visit.VisitDate ? moment(visit.VisitDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
        var time = visit.BookingTime ? visit.BookingTime.split('-')[0].trim() : moment().format("HH:mm A");
        appt.AppointmentTime = moment(time, 'HH:mm A').format('HH:mm');
        appt.AppointmentType = "New";

        let dept = this.coreService.Masters.Departments.filter(a => a.DepartmentName.replace(/\s+/g, '').toLocaleLowerCase() == $event.Data.DepartmentName.replace(/\s+/g, '').toLocaleLowerCase());
        if (dept.length > 0)
          appt.DepartmentId = dept[0].DepartmentId;

        let doc = this.visitService.ApptApplicableDoctorsList.filter(a => a.PerformerName.replace(/\s+/g, '').substring(3).toLocaleLowerCase() == $event.Data.DoctorName.replace(/\s+/g, '').toLocaleLowerCase());
        if (doc.length > 0 && this.showDoctor) {
          appt.PerformerName = doc[0].PerformerName;
          appt.PerformerId = doc[0].PerformerId;
        }
    }
  }
  getAgeFromDateOfBirth(dateofbirth: any) {
    var today = new Date();
    var birthDate = new Date(dateofbirth);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  }

  myDepartmentListFormatter(data: any): string {
    let html = data["DepartmentName"];
    return html;
  }

  DocListFormatter(data: any): string {
    let html = data["PerformerName"];
    return html;
  }
}
