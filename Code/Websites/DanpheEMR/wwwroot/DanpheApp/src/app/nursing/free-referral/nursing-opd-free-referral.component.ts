import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ADT_DLService } from '../../adt/shared/adt.dl.service';
import { VisitBLService } from '../../appointments/shared/visit.bl.service';
import { Visit } from '../../appointments/shared/visit.model';
import { VisitService } from '../../appointments/shared/visit.service';
import { ICD10 } from '../../clinical/shared/icd10.model';
import { PatientClinicalInfoModel } from '../../clinical/shared/patient-clinical-info.model';
import { CoreService } from '../../core/shared/core.service';
import { FinalDiagnosisModel } from '../../medical-records/outpatient-list/final-diagnosis/final-diagnosis.model';
import { MR_BLService } from '../../medical-records/shared/mr.bl.service';
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { ENUM_AppointmentType, ENUM_BillingStatus, ENUM_DanpheHTTPResponses, ENUM_DateTimeFormat, ENUM_MessageBox_Status, ENUM_VisitStatus, ENUM_VisitType } from '../../shared/shared-enums';
import { NursingOPDFreeReferral_DTO } from '../shared/dto/nursing-opd-free-referral.dto';
import { NewReferalDepartment_DTO as NewReferralDepartment_DTO } from '../shared/dto/nursing-opd-referal-department.dto';
import { PerformerDetails_DTO } from '../shared/dto/performer-details.dto';
import { NursingBLService } from "../shared/nursing.bl.service";

@Component({
  selector: 'nursing-opd-free-referral',
  templateUrl: './nursing-opd-free-referral.component.html',
  styleUrls: ['./nursing-opd-free-referral.component.css']
})
export class NursingOpdFreeReferralComponent implements OnInit {
  @Input('is-ChangeDoctor-Form')
  public showChangeDoctor: boolean = false;
  @Input('selected-visit')
  public selectedVisit: Visit;
  @Input("visit")
  public visit: Visit = new Visit();
  @Output() discardInput: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('nursing-opd-refer-callback)')
  NursingOpdReferCallback = new EventEmitter<object>();
  public selectedDiagnosis: ICD10[] = [];
  public chiefComplaints: Array<PatientClinicalInfoModel> = [];
  public FinalDiagnosisList: FinalDiagnosisModel[] = [];
  public showValidationMessage: boolean = false;
  public visitDate: string = '';
  public doctorList: Array<PerformerDetails_DTO> = [];

  public selectedDoctor: PerformerDetails_DTO = null;
  public filteredDocList: Array<PerformerDetails_DTO>;
  // public selectedDepartment: NewReferralDepartment_DTO = null;
  public selectedDepartment: any;// = { DepartmentId: 0, DepartmentName: "" };
  public departmentList: Array<NewReferralDepartment_DTO> = [];
  public departmentId: number;
  public referDoctorDepartment: NursingOPDFreeReferral_DTO = new NursingOPDFreeReferral_DTO();
  public selectedDoctorToRefer: NursingOPDFreeReferral_DTO = new NursingOPDFreeReferral_DTO();

  public providerList: PerformerDetails_DTO[] = [];
  public ICD10MainList: ICD10[] = [];
  public selectedDiagnosisSubscription = new Subscription();
  public enableDepartmentLevelAppointment: boolean;
  public showDocMandatory: boolean = false; //this is used to show either doctor is mandatory or not// it is used only in case of EHS price selection --Yubraj 23rd 2019
  public freeReferValidator: FormGroup = null;
  public fromDate: string = '';
  public toDate: string = '';
  public opdList: Array<Visit> = new Array<Visit>();
  public opdListZero: Array<Visit> = new Array<Visit>();
  public opdListOne: Array<Visit> = new Array<Visit>();

  public opdFilteredList: Array<Visit> = new Array<Visit>();



  constructor(
    public admissionDLService: ADT_DLService,
    public msgBoxServ: MessageboxService,
    public mrBLService: MR_BLService,
    public coreService: CoreService,
    public visitService: VisitService,
    public visitBLService: VisitBLService,
    public nursingBLService: NursingBLService
  ) {
    this.GetDepartments();
    this.GetICDList();
    this.GetProviderList();
    this.OnSelectedDiagnosisListChanged();
    let paramValue = this.coreService.EnableDepartmentLevelAppointment();
    if (paramValue) {
      this.enableDepartmentLevelAppointment = false;
      this.showDocMandatory = false;
    }
    else {
      this.enableDepartmentLevelAppointment = true;
      this.showDocMandatory = true;
    }
    var _formBuilder = new FormBuilder();

    this.freeReferValidator = _formBuilder.group({
      'ReferredDepartment': [, Validators.required],
      'ReferredDoctor': [, Validators.required]
    });
  }

  ngOnInit(): void {
    this.referDoctorDepartment.PatientId = this.selectedVisit.PatientId;
    this.referDoctorDepartment.PatientVisitId = this.selectedVisit.PatientVisitId;
    // this.referDoctorDepartment.PerformerId = this.selectedVisit.PerformerId;
    // this.referDoctorDepartment.PerformerName = this.selectedVisit.PerformerName;
    this.visitDate = moment(this.selectedVisit.VisitDate).format(ENUM_DateTimeFormat.Year_Month_Day);

  }

  OnSelectedDiagnosisListChanged() {
    this.selectedDiagnosisSubscription = this.nursingBLService.SelectedDiagnosisList().subscribe(res => {
      if (res) {
        this.OnDiagnosisSelected(res);
      }
    })
  }

  OnDiagnosisSelected(event: any) {
    if (event)
      this.selectedDiagnosis = event;
  }
  public GetICDList() {
    this.mrBLService.GetICDList()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.ICD10MainList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get data']);
        }
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed to get ICD10.. please check log for detail.']);
        });
  }

  myDepartmentListFormatter(data: any): string {
    let html = data["DepartmentName"];
    return html;
  }

  DocListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }
  // GetVisitDoctors() {
  //   this.filteredDocList = this.doctorList = this.visitService.ApptApplicableDoctorsList;
  //   this.AssignSelectedDoctor();
  // }

  FilterDoctorList() {
    if (this.selectedDoctor != null) {
      if (typeof (this.selectedDoctor) == 'object') {
        this.selectedDoctor.PerformerName = "";
        this.selectedDoctor.PerformerId = 0;
      }
    }
    // if (this.departmentId && Number(this.departmentId) != 0) {
    //   this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);

    // }
    else {
      this.filteredDocList = this.doctorList;
    }
  }
  GetDepartments() {
    this.visitBLService.GetDepartment()
      .subscribe(res => {
        if (res.Status == "OK")
          this.departmentList = res.Results;
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

  public AssignSelectedDoctor() {
    let doctor = null;

    if (this.selectedDoctor && this.doctorList && this.doctorList.length) {
      if (typeof (this.selectedDoctor) == 'string') {
        doctor = this.doctorList.find(a => a.FullName.toLowerCase() == String(this.selectedDoctor).toLowerCase());
      }
      else if (typeof (this.selectedDoctor) == 'object' && this.selectedDoctor.EmployeeId > 0)
        doctor = this.doctorList.find(a => a.EmployeeId == this.selectedDoctor.EmployeeId);
      if (doctor) {
        //to filter doctor List after department is changed (flow: assigning department by selecting doctor).
        this.departmentId = doctor.DepartmentId;
        const department = this.departmentList.find(dept => dept.DepartmentId === this.departmentId);
        this.selectedDepartment = department && department.DepartmentName;
        this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);
        this.selectedDoctorToRefer = Object.assign(this.selectedDoctor, doctor);
        this.visit.PerformerId = doctor.EmployeeId;//this will give providerid
        this.visit.PerformerName = doctor.FullName;
        this.visit.IsValidSelProvider = true;
        this.visit.IsValidSelDepartment = true;
        if (this.selectedDepartment !== null) {
          this.AssignSelectedDepartment(this.selectedDepartment);
        }
        //this.selectedDepartment = this.departmentList.find(dept => dept.DepartmentId === this.departmentId);
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
      this.AssignSelectedDepartment(this.selectedDepartment);// If doctor is not proper then assign bill items that of Department level.
    }
  }
  GetProviderList() {
    this.admissionDLService.GetProviderList().subscribe(
      res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.doctorList = res.Results.filter(doctor => doctor.EmployeeId > 0);
          this.filteredDocList = this.doctorList;
          this.AssignSelectedDoctor();
        } else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed.']);
        }
      },
      err => {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed.']);
      }
    );
  }

  public AssignSelectedDepartment(selectedDepartment) {
    let department = null;
    if (selectedDepartment && this.departmentList && this.departmentList.length) {
      if (typeof (selectedDepartment) === 'string') {
        department = this.departmentList.find(a => a.DepartmentName.toLowerCase() === String(selectedDepartment).toLowerCase());
      }
      else if (typeof (selectedDepartment) === 'object' && selectedDepartment.DepartmentId)
        department = this.departmentList.find(a => a.DepartmentId === selectedDepartment.DepartmentId);
      if (department) {
        this.selectedDepartment = Object.assign(selectedDepartment, department);
        this.departmentId = department.DepartmentId;
        this.visit.IsValidSelDepartment = true;
        this.visit.IsValidSelProvider = true;
        this.visit.DepartmentId = department.DepartmentId;
        this.visit.DepartmentName = department.DepartmentName;
        this.visit.DeptRoomNumber = department.RoomNumber;
        this.FilterDoctorList();
        //getting emergency name from the parameterized data
        let erdeptnameparam = this.coreService.Parameters.find(p => p.ParameterGroupName.toLowerCase() == "common" && p.ParameterName.toLowerCase() == "erdepartmentname");
        if (erdeptnameparam) {
          let erdeptname = erdeptnameparam.ParameterValue.toLowerCase();
          //temporary solution for : er-visit based on departmentname.  get these from server side or from configuration for proper solution.
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


  addReferDetails() {
    this.AssignFinalDiagnosis();
    const referalRemarksElement = document.getElementById('id_referalremarks') as HTMLTextAreaElement;
    const referalRemarksValue = referalRemarksElement.value;
    const performer = this.selectedVisit.PerformerName;
    let performerId = null;
    let performerName = null;

    const remarks = referalRemarksValue;
    const referredDepartment = this.freeReferValidator.get('ReferredDepartment').value;
    const referredDoctor = this.freeReferValidator.get('ReferredDoctor').value;

    if (referredDepartment === null || referredDoctor === null) {
      this.showValidationMessage = true;
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed. Some fields are missing']);
      return;
    }

    this.referDoctorDepartment = {
      DiagnosisList: this.FinalDiagnosisList,
      PatientId: this.selectedVisit.PatientId,
      PatientVisitId: this.selectedVisit.PatientVisitId,
      ReferredDoctorId: this.selectedDoctor.EmployeeId,
      ReferredDepartmentId: this.selectedDepartment.DepartmentId,
      ReferredDepartment: this.selectedDepartment.DepartmentName,
      ReferredDoctor: this.selectedDoctor.FullName,
      ReferRemarks: remarks,
      VisitType: this.visit.VisitType,
      VisitStatus: ENUM_VisitStatus.initiated,
      AppointmentType: ENUM_AppointmentType.referral,
      BillingStatus: ENUM_BillingStatus.paid,
    }
    if (this.freeReferValidator.valid) {
      this.SaveReferal();
    } else {
      this.showValidationMessage = true;
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed. Some fields are missing']);
    }
  }
  AssignFinalDiagnosis() {
    if (this.selectedDiagnosis.length > 0) {
      this.selectedDiagnosis.forEach(a => {
        let temp = this.ICD10MainList.find(b => a.ICD10Code === b.ICD10Code);
        if (temp) {
          let finalDiagnosis: FinalDiagnosisModel = new FinalDiagnosisModel();
          finalDiagnosis.PatientId = this.selectedVisit.PatientId;
          finalDiagnosis.PatientVisitId = this.selectedVisit.PatientVisitId;
          finalDiagnosis.ICD10ID = temp.ICD10ID;
          this.FinalDiagnosisList.push(finalDiagnosis);
        }
      });
    }
  }

  Close() {
    this.selectedDiagnosis = []
    this.referDoctorDepartment = new NursingOPDFreeReferral_DTO();
    this.selectedDepartment = null;
    this.selectedDoctor = null;
    this.NursingOpdReferCallback.emit({ action: 'close' });
    this.showChangeDoctor = false;
    this.freeReferValidator.reset();
    this.freeReferValidator.updateValueAndValidity();
    this.showValidationMessage = false;

  }

  Discard() {
    this.discardInput.emit(true);
    this.selectedDiagnosis = [];
    this.referDoctorDepartment = new NursingOPDFreeReferral_DTO();
    this.showChangeDoctor = true;
    this.selectedDepartment = null;
    this.selectedDoctor = null;
    const referalRemarksElement = document.getElementById('id_referalremarks') as HTMLTextAreaElement;
    referalRemarksElement.value = '';
    this.Close();
  }

  SetFocusById(IdToBeFocused: string) {
    window.setTimeout(function () {
      let elemToFocus = document.getElementById(IdToBeFocused)
      if (elemToFocus != null && elemToFocus != undefined) {
        elemToFocus.focus();
      }
    }, 100);
  }
  SaveReferal() {
    if (!this.freeReferValidator.valid) {
      this.showValidationMessage = true;
    } else {
      this.nursingBLService.PostfreeReferalDetails(this.referDoctorDepartment)
        .subscribe((res) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.selectedDiagnosis = [];
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Referred Successfully']);
            this.freeReferValidator.reset();
            this.showValidationMessage = false;
            this.referDoctorDepartment = new NursingOPDFreeReferral_DTO();
            this.LoadVisitList();
            this.Close();
          } else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Patient already has same visit"']);
          }
        });
    }
  }

  IsDirty(fieldName): boolean {
    if (fieldName == undefined) {
      return this.freeReferValidator.dirty;
    } else {
      return this.freeReferValidator.controls[fieldName].dirty;
    }
  }

  IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.freeReferValidator.valid;
    } else {
      return !this.freeReferValidator.hasError(validator, fieldName);
    }
  }
  LoadVisitList() {
    //today's all visit or all visits with IsVisitContinued status as false
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.nursingBLService.GetOPDList(this.fromDate, this.toDate)  //this.fromDate, this.toDate
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.opdList = res.Results;
          let opdTriaged = [];
          let opdNotTriaged = [];
          for (let i = 0; i < res.Results.length; i++) {
            if (res.Results[i].IsTriaged == 0) {
              opdNotTriaged.push(res.Results[i]);
            } else if (res.Results[i].IsTriaged == 1) {
              opdTriaged.push(res.Results[i]);
            }
          }
          this.opdListZero = opdNotTriaged;

          this.opdListOne = opdTriaged;
          // this.onChangeDepartment();
          this.opdFilteredList = this.opdList;
          //this.opdFilteredList.forEach(a => a.IsSelected = false);
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed To Load Data']);
        }

      });
  }
}
