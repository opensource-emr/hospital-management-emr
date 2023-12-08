import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { RegistrationScheme_DTO } from "../../billing/shared/dto/registration-scheme.dto";
import { CoreService } from "../../core/shared/core.service";
import { PatientService } from "../../patients/shared/patient.service";
import { Department } from "../../settings-new/shared/department.model";
import { SettingsBLService } from "../../settings-new/shared/settings.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { ENUM_AppointmentType, ENUM_VisitType } from "../../shared/shared-enums";
import { AppointmentService } from "../shared/appointment.service";
import { FreeVisitSettings_DTO } from "../shared/dto/free-visit-settings.dto";
import { VisitBLService } from "../shared/visit.bl.service";
import { Visit } from "../shared/visit.model";
import { VisitService } from "../shared/visit.service";

@Component({
  selector: "visit-info",
  templateUrl: "./visit-info.html",
  styleUrls: ['./visit-common.css']
})
export class VisitInfoComponent implements OnInit {
  @Input("visit")
  public visit: Visit = new Visit();
  public doctorList: Array<{ DepartmentId: number, DepartmentName: string, PerformerId: number, PerformerName: string, ItemName: string, Price: number, IsTaxApplicable: boolean, SAARCCitizenPrice: number, ForeignerPrice: number }> = [];
  public filteredDocList: Array<{ DepartmentId: number, DepartmentName: string, PerformerId: number, PerformerName: string, ItemName: string, Price: number, IsTaxApplicable: boolean, SAARCCitizenPrice: number, ForeignerPrice: number }>;
  public selectedDoctor = { DepartmentId: 0, DepartmentName: "", PerformerId: 0, PerformerName: "", ItemName: "", Price: 0, IsTaxApplicable: false, DepartmentLevelAppointment: false };
  public selectedDepartment = { DepartmentId: 0, DepartmentName: "" };

  public departmentList: Array<Department> = [];
  public departmentId: number;
  public providerId: number;

  enableDepartmentLevelAppointment: boolean;
  //public priceCategoryChanged: Subscription;
  public showDocMandatory: boolean = false; //this is used to show either doctor is mandatory or not// it is used only in case of EHS price selection --Yubraj 23rd 2019

  public visitTimeDiff: number = null;
  public visitInterval: any;
  public ExtRefSettings = { EnableExternal: true, DefaultExternal: true };
  public SchemeChangedSubscription = new Subscription();
  public AppointmentApplicableDepartments: any;
  public EnableFreeVisit: boolean = false;
  public ShowEnableFreeVisitCheckbox: boolean = false;
  public FreeVisitSettings = new FreeVisitSettings_DTO();

  constructor(public visitBLService: VisitBLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public appointmentService: AppointmentService,
    public visitService: VisitService,
    public settingsBlService: SettingsBLService,
    public patientService: PatientService,
    public routeFromService: RouteFromService,
    public changeDetector: ChangeDetectorRef) {
    this.GetVisitDoctors();
    this.GetDepartments();
    this.InitializeSubscription();
    this.LoadReferrerSettings();
    this.LoadFreeVisitSettings();

    let paramValue = this.coreService.EnableDepartmentLevelAppointment();
    if (paramValue) {
      this.enableDepartmentLevelAppointment = false;
      this.showDocMandatory = false;
      //var EHSFlag = this.enableDepartmentLevelAppointment;
    }
    else {
      this.enableDepartmentLevelAppointment = true;
      this.showDocMandatory = true;
      this.FreeVisitSettings.EnableDoctorLevelAppointment = true;
      this.FreeVisitSettings.EnableDepartmentLevelAppointment = false;
      this.FreeVisitSettings.InitialSubscriptionFromVisitInfo = true;
    }

    this.visitTimeDiff = this.coreService.Parameters.find(p => p.ParameterGroupName == "Appointment" && p.ParameterName == "VisitTimeDifferenceMinutes").ParameterValue;
    this.visit.VisitTime = moment().add(this.visitTimeDiff, 'minutes').format('HH:mm');
    this.visitInterval = setInterval(() => {
      if (this.visit.VisitTime)
        this.visit.VisitTime = moment().add(this.visitTimeDiff, 'minutes').format('HH:mm');;
    }, 1000);
    if (this.routeFromService && this.routeFromService.RouteFrom == "onlineappointment") {
      clearInterval(this.visitInterval);
    }
  }

  InitializeSubscription() {
    this.SchemeChangedSubscription = this.visitService.ObserveSchemeChangedEvent().subscribe((scheme: RegistrationScheme_DTO) => {
      if (scheme && scheme.SchemeId) {
        const params = this.coreService.Parameters.find(a => a.ParameterGroupName === "Appointment" && a.ParameterName === "AllowedDepartmentsForScheme");
        if (params) {
          const paramValue = JSON.parse(params.ParameterValue);
          if (paramValue && paramValue.SchemeId === scheme.SchemeId && this.departmentList && this.departmentList.length) {
            this.departmentList = this.AppointmentApplicableDepartments.filter(a => paramValue.AvailableDepts.some(b => b.DepartmentId === a.DepartmentId));
          } else {
            this.departmentList = this.AppointmentApplicableDepartments;
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this.EnableFreeVisit = false;
    this.SchemeChangedSubscription.unsubscribe();
  }

  ngOnInit() {
    this.visitService.TriggerFreeVisitCheckboxChangeEvent(this.FreeVisitSettings);
    if (this.visitService.appointmentType.toLowerCase() == "transfer") {
      this.visit.ParentVisitId = this.visitService.ParentVisitInfo.PatientVisitId;
      this.visit.PrescriberId = this.visitService.ParentVisitInfo.PerformerId;
    }
    else if (this.visitService.appointmentType.toLowerCase() == "referral") {
      this.visit.ParentVisitId = this.visitService.ParentVisitInfo.PatientVisitId;
      this.visit.ReferredById = this.visitService.ParentVisitInfo.PerformerId;
    }
    else if (this.visitService.appointmentType.toLowerCase() == "followup") {
      //sud:26June'19-- for Followup - By default assign Past Department and Past provider to current One. User will change it if required.
      this.visit.ParentVisitId = this.visitService.ParentVisitInfo.PatientVisitId;

      this.selectedDepartment.DepartmentName = this.visitService.ParentVisitInfo.DepartmentName;
      this.selectedDepartment.DepartmentId = this.visitService.ParentVisitInfo.DepartmentId;

      this.visit.DepartmentId = this.visitService.ParentVisitInfo.DepartmentId;
      this.visit.DepartmentName = this.visitService.ParentVisitInfo.DepartmentName;

      this.visit.PerformerId = this.visitService.ParentVisitInfo.PerformerId;

      //if Parent visit has DepartmentID, then load only doctors of that department at the beginning.
      if (this.visitService.ParentVisitInfo.DepartmentId) {
        this.departmentId = this.visitService.ParentVisitInfo.DepartmentId;
        this.FilterDoctorList();
      }
      //If earlier appointment was made for a Doctor (DoctorId Not Null)  then Set that doctor by default for followup.
      //user can change the doctor or Department if required.
      if (this.visitService.ParentVisitInfo.PerformerId) {
        this.selectedDoctor.PerformerName = this.visitService.ParentVisitInfo.PerformerName;
        this.selectedDoctor.PerformerId = this.visitService.ParentVisitInfo.PerformerId;
      }
    }

    this.enableDepartmentLevelAppointment = this.coreService.EnableDepartmentLevelAppointment();

    //if departmentlevel appointment is allowed then we don't need to validate providerid field.
    if (this.enableDepartmentLevelAppointment) {
      this.visit.UpdateValidator("off", "Doctor", null);
    }
    else {
      this.visit.UpdateValidator("on", "Doctor", "required");
    }

    this.AssignAppointmentDetails();
  }

  ngAfterViewInit() {
    if (this.departmentList && this.departmentList.length)
      this.SetFocusById('txtDepartment');
    if (this.selectedDepartment && this.selectedDepartment.DepartmentId > 0) {
      this.visitService.TriggerBillChangedEvent({ ChangeType: "Department", SelectedDepartment: this.selectedDepartment });
    }
    if (this.selectedDoctor && this.selectedDoctor.PerformerId > 0 && !this.enableDepartmentLevelAppointment) {
      this.visitService.TriggerBillChangedEvent({ ChangeType: "Doctor", SelectedDoctor: this.selectedDoctor });
    }
  }

  AssignAppointmentDetails() {
    if (this.appointmentService.getGlobal().AppointmentId || this.patientService.getGlobal().Telmed_Patient_GUID) {
      let appointment = this.appointmentService.getGlobal();

      //assign values if the property of appointment and visit are same.
      Object.keys(appointment).forEach(property => {
        if (property in this.visit) {
          this.visit[property] = appointment[property];
        }
      });

      //assign provider and department information if it was filled during appointment.
      if (this.visit.PerformerName) {
        this.selectedDoctor.PerformerName = this.visit.PerformerName;
        this.selectedDoctor.PerformerId = this.visit.PerformerId;
      }
      else {
        this.selectedDoctor = null;
      }
      if (this.visit.DepartmentId) {
        this.selectedDepartment.DepartmentId = this.visit.DepartmentId;
        let dep = this.coreService.Masters.Departments.find(a => a.DepartmentId == this.visit.DepartmentId);
        if (dep) {
          this.selectedDepartment.DepartmentName = dep.DepartmentName;
          this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == dep.DepartmentId);
        }
      }
    }
  }

  GetDepartments() {
    this.visitBLService.GetDepartment()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.departmentList = res.Results;
          this.AppointmentApplicableDepartments = this.departmentList;
        }
        if (!this.visit.DepartmentId)
          this.SetFocusById('txtDepartment');
        else {
          this.SetFocusById('tender');
        }
      },
        error => {
          this.msgBoxServ.showMessage('error', ['No Departments found']);
        });
  }

  GetVisitDoctors() {
    //sud:25June'19--get the list from pre-loaded functions.
    this.filteredDocList = this.doctorList = this.visitService.ApptApplicableDoctorsList;
    this.AssignSelectedDoctor();
  }

  FilterDoctorList() {
    if (this.selectedDoctor != null) {
      if (typeof (this.selectedDoctor) == 'object') {
        this.selectedDoctor.PerformerName = "";
        this.selectedDoctor.PerformerId = 0;
      }
    }
    if (this.departmentId && Number(this.departmentId) != 0) {
      this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);

    }
    else {
      this.filteredDocList = this.doctorList;
    }
  }

  public AssignSelectedDoctor() {
    let doctor = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    //        this.emitDoctorDetail.emit({ "selectedDoctor": null });
    if (this.selectedDoctor && this.doctorList && this.doctorList.length) {
      if (typeof (this.selectedDoctor) == 'string') {
        doctor = this.doctorList.find(a => a.PerformerName.toLowerCase() == String(this.selectedDoctor).toLowerCase());
      }
      else if (typeof (this.selectedDoctor) == 'object' && this.selectedDoctor.PerformerId)
        doctor = this.doctorList.find(a => a.PerformerId == this.selectedDoctor.PerformerId);
      if (doctor) {
        //to filter doctor List after department is changed (flow: assigning department by selecting doctor).
        this.departmentId = doctor.DepartmentId;
        this.selectedDepartment = doctor.DepartmentName;
        this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);
        this.selectedDoctor = Object.assign(this.selectedDoctor, doctor);
        this.visit.PerformerId = doctor.PerformerId;//this will give providerid
        this.visit.PerformerName = doctor.PerformerName;
        this.visit.IsValidSelProvider = true;
        this.visit.IsValidSelDepartment = true;
        this.visit.DepartmentId = doctor.DepartmentId;
        if (this.selectedDepartment != null) {
          this.AssignSelectedDepartment();
        }
        this.visitService.TriggerBillChangedEvent({ ChangeType: "Doctor", SelectedDoctor: this.selectedDoctor });
      }
      else {
        this.visit.PerformerId = null;
        this.visit.PerformerName = null;
        this.visit.IsValidSelProvider = false;
      }
    }
    else {
      this.visit.PerformerId = null;
      this.visit.PerformerName = null;
      this.AssignSelectedDepartment();//sud:19June'19-- If doctor is not proper then assign bill items that of Department level.
    }
  }

  public AssignSelectedDepartment() {
    let department = null;
    //        this.emitDepartmentDetail.emit({ "selectedDepartment": null });
    if (this.selectedDepartment && this.departmentList && this.departmentList.length) {
      if (typeof (this.selectedDepartment) == 'string') {
        department = this.departmentList.find(a => a.DepartmentName.toLowerCase() == String(this.selectedDepartment).toLowerCase());
      }
      else if (typeof (this.selectedDepartment) == 'object' && this.selectedDepartment.DepartmentId)
        department = this.departmentList.find(a => a.DepartmentId == this.selectedDepartment.DepartmentId);
      if (department) {
        this.selectedDepartment = Object.assign(this.selectedDepartment, department);
        this.departmentId = department.DepartmentId;
        this.visit.IsValidSelDepartment = true;
        this.visit.IsValidSelProvider = true;
        this.visit.DepartmentId = department.DepartmentId;
        this.visit.DepartmentName = department.DepartmentName;
        this.visit.DeptRoomNumber = department.RoomNumber;
        if (this.selectedDoctor.DepartmentId == 0) {
          this.FilterDoctorList();
        }
        //getting emergency name from the parameterized data
        let erdeptnameparam = this.coreService.Parameters.find(p => p.ParameterGroupName.toLowerCase() == "common" && p.ParameterName.toLowerCase() == "erdepartmentname");
        if (erdeptnameparam) {
          let erdeptname = erdeptnameparam.ParameterValue.toLowerCase();
          //temporary solution for : er-visit based on departmentname. yubaraj:20june'19-- get these from server side or from configuration for proper solution.
          if (department.DepartmentName.toLowerCase() == erdeptname) {
            this.visit.VisitType = ENUM_VisitType.emergency;// "emergency";
          }
          else {
            this.visit.VisitType = ENUM_VisitType.outpatient;// "outpatient";
          }
        }
        this.visitService.TriggerBillChangedEvent({ ChangeType: "Department", SelectedDepartment: this.selectedDepartment });
        //this.visitService.TriggerBillChangedEvent({ ChangeType: "Doctor", SelectedDoctor: this.selectedDoctor });
      }
      else {
        this.visit.IsValidSelDepartment = false;
        this.visit.IsValidSelProvider = false;
      }
    }
    else {
      this.departmentId = 0;
      this.visit.DepartmentId = 0;
      this.visit.DepartmentName = null;
      this.filteredDocList = this.doctorList;
      this.visitService.TriggerBillChangedEvent({ ChangeType: "Department", SelectedDepartment: this.selectedDepartment }); //Removes paticulars from 'Additional Bill Item?' when Department is kept empty
    }
  }

  myDepartmentListFormatter(data: any): string {
    let html = data["DepartmentName"];
    return html;
  }

  DocListFormatter(data: any): string {
    let html = data["PerformerName"];
    return html;
  }


  //prat: 13sep2019 for internal and external referrer
  public defaultExtRef: boolean = true;
  selectedRefId: number = null;

  OnReferrerChanged($event) {
    this.selectedRefId = $event.ReferrerId; //EmployeeId comes as ReferrerId from select referrer component.
    if (this.selectedRefId) {
      //assign referredByProviderId if any one is selecteed from Referred By Dropdown.
      this.visit.ReferredById = this.selectedRefId;
      this.visitService.TriggerBillChangedEvent({ ChangeType: "Referral", ReferredBy: this.selectedRefId });
    }
    else {
      this.visitService.TriggerBillChangedEvent({ ChangeType: "Referral", ReferredBy: null });
    }
  }

  public LoadReferrerSettings() {
    let currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Appointment" && a.ParameterName == "ExternalReferralSettings");
    if (currParam && currParam.ParameterValue) {
      this.ExtRefSettings = JSON.parse(currParam.ParameterValue);
    }
  }

  //end: Pratik: 12Sept'19--For External Referrals

  LoadFreeVisitSettings() {
    let currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Appointment" && a.ParameterName == "AllowFreeVisit");
    if (currParam && currParam.ParameterValue) {
      this.ShowEnableFreeVisitCheckbox = JSON.parse(currParam.ParameterValue);
    }
  }

  SetFocusById(IdToBeFocused: string) {
    window.setTimeout(function () {
      let elemToFocus = document.getElementById(IdToBeFocused)
      if (elemToFocus != null && elemToFocus != undefined) {
        elemToFocus.focus();
      }
    }, 100);
  }

  EnterKeyFromDepartment() {
    this.AssignSelectedDepartment();
    if (!this.visit.PatientId && this.showDocMandatory == false) {

      this.SetFocusById('aptPatFirstName');

    } else if (!this.visit.PatientId && this.showDocMandatory == true) {
      this.SetFocusById('doctorName');

    } else if (this.visit.PatientId && this.showDocMandatory == true) {
      this.SetFocusById('doctorName');
    }
    else {
      this.SetFocusById('tender');
    }
  }
  EnterKeyFromDoctor() {
    if (!this.visit.PatientId) {
      this.SetFocusById('aptPatFirstName');
    } else if (this.visit.AppointmentType && this.visit.AppointmentType.toLowerCase() === ENUM_AppointmentType.referral.toLowerCase()) {
      this.SetFocusById('id_billing_remarks');
    } else {
      this.SetFocusById('tender');
    }
  }

  OnFreeVisitCheckboxChanged(): void {
    if (this.enableDepartmentLevelAppointment) {
      if (this.EnableFreeVisit) {
        this.visit.VisitValidator.reset();
      } else {
        // this.visit.VisitValidator.get('Department').setValue(null);
        this.visit.VisitValidator.reset();
      }
    } else {
      if (this.EnableFreeVisit) {
        this.showDocMandatory = false;
      } else {
        this.showDocMandatory = true;
      }
    }
    // this.visit.VisitValidator.reset();
    this.visit.IsFreeVisit = this.EnableFreeVisit;
    this.FreeVisitSettings = new FreeVisitSettings_DTO();
    this.FreeVisitSettings.EnableFreeVisit = this.EnableFreeVisit;
    this.FreeVisitSettings.EnableDepartmentLevelAppointment = this.enableDepartmentLevelAppointment;
    this.FreeVisitSettings.EnableDoctorLevelAppointment = !this.enableDepartmentLevelAppointment;
    this.FreeVisitSettings.InitialSubscriptionFromVisitInfo = false;
    this.visitService.TriggerFreeVisitCheckboxChangeEvent(this.FreeVisitSettings);
    this.changeDetector.detectChanges();
  }
}
