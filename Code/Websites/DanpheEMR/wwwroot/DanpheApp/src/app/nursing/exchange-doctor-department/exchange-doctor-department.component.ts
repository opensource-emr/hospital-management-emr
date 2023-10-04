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
import { ENUM_DanpheHTTPResponses, ENUM_DateTimeFormat, ENUM_MessageBox_Status, ENUM_VisitType } from '../../shared/shared-enums';
import { NursingDepartment_DTO } from '../shared/dto/nursing-department.dto';
import { NursingOPDExchangedDoctorDepartment_DTO } from '../shared/dto/nursing-opd-exchanged-doctor-department.dto';
import { PerformerDetails_DTO } from '../shared/dto/performer-details.dto';
import { NursingBLService } from "../shared/nursing.bl.service";

@Component({
  selector: 'exchange-doctor-department',
  templateUrl: './exchange-doctor-department.component.html'
})
export class ExchangeDoctorDepartmentComponent implements OnInit {

  @Input('is-exchange-doctor-form')
  public showChangeDoctor: boolean = false;
  @Input('selected-visit')
  public selectedVisit: Visit;
  @Input("visit")
  public visit: Visit = new Visit();
  @Output()
  public discardInput: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('nursing-opd-exchange-callback)')
  NursingOpdExchangeCallback = new EventEmitter<object>();
  public selectedDiagnosis: ICD10[] = [];
  public chiefComplaints: Array<PatientClinicalInfoModel> = [];
  public FinalDiagnosisList: FinalDiagnosisModel[] = [];
  public showValidationMessage: boolean = false;
  public visitDate: string = '';
  public doctorList: Array<PerformerDetails_DTO> = [];
  public selectedDoctor: PerformerDetails_DTO = null;
  public filteredDocList: Array<PerformerDetails_DTO>;
  public selectedDepartment: any;
  public departmentList: Array<NursingDepartment_DTO> = [];
  public departmentId: number;
  public exchangedDoctorDepartment: NursingOPDExchangedDoctorDepartment_DTO = new NursingOPDExchangedDoctorDepartment_DTO();
  public selectedDoctorToExchange: NursingOPDExchangedDoctorDepartment_DTO = new NursingOPDExchangedDoctorDepartment_DTO();
  public providerList: PerformerDetails_DTO[] = [];
  public ICD10MainList: ICD10[] = [];
  public selectedDiagnosisSubscription = new Subscription();
  public enableDepartmentLevelAppointment: boolean;
  public showDocMandatory: boolean = false;
  public ExchangedValidator: FormGroup = null;
  public fromDate: string = '';
  public toDate: string = '';
  public opdList: Array<Visit> = new Array<Visit>();
  public opdListZero: Array<Visit> = new Array<Visit>();
  public opdListOne: Array<Visit> = new Array<Visit>();
  public opdFilteredList: Array<Visit> = new Array<Visit>();
  public isAssignFinalDiagnosisDone: boolean = false;

  constructor(
    public admissionDLService: ADT_DLService,
    public messageBoxService: MessageboxService,
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

    this.ExchangedValidator = _formBuilder.group({
      'ExchangedDepartment': [, Validators.required],
      'ExchangedDoctor': [, Validators.required]
    });
  }

  ngOnInit(): void {
    this.exchangedDoctorDepartment.PatientVisitId = this.selectedVisit.PatientVisitId;
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
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get data']);
        }
      },
        err => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed to get ICD10.. please check log for detail.']);
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

  FilterDoctorList() {
    if (this.selectedDoctor != null) {
      if (typeof (this.selectedDoctor) == 'object') {
        this.selectedDoctor.PerformerName = "";
        this.selectedDoctor.PerformerId = 0;
      }
    }
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
          this.messageBoxService.showMessage('error', ['No Departments found']);
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
        this.departmentId = doctor.DepartmentId;
        const department = this.departmentList.find(dept => dept.DepartmentId === this.departmentId);
        this.selectedDepartment = department && department.DepartmentName;
        this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);
        this.selectedDoctorToExchange = Object.assign(this.selectedDoctor, doctor);
        this.visit.PerformerId = doctor.EmployeeId;
        this.visit.PerformerName = doctor.FullName;
        this.visit.IsValidSelProvider = true;
        this.visit.IsValidSelDepartment = true;
        if (this.selectedDepartment !== null) {
          this.AssignSelectedDepartment(this.selectedDepartment);
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
      this.AssignSelectedDepartment(this.selectedDepartment);
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
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed.']);
        }
      },
      err => {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed.']);
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
        let erdeptnameparam = this.coreService.Parameters.find(p => p.ParameterGroupName.toLowerCase() == "common" && p.ParameterName.toLowerCase() == "erdepartmentname");
        if (erdeptnameparam) {
          let erdeptname = erdeptnameparam.ParameterValue.toLowerCase();
          if (department.DepartmentName.toLowerCase() == erdeptname) {
            this.visit.VisitType = ENUM_VisitType.emergency;// "emergency";
          }
          else {
            this.visit.VisitType = ENUM_VisitType.outpatient;// "outpatient";
          }
        }
        this.visitService.TriggerBillChangedEvent({ ChangeType: "Department", SelectedDepartment: this.selectedDepartment });
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
      this.visitService.TriggerBillChangedEvent({ ChangeType: "Department", SelectedDepartment: this.selectedDepartment });
    }
  }


  AddExchangedDoctorDepartmentDetails() {
    this.AssignFinalDiagnosis();
    const exchangeRemarksElement = document.getElementById('id_exchange_remarks') as HTMLTextAreaElement;
    const exchangeRemarksValue = exchangeRemarksElement.value;
    const remarks = exchangeRemarksValue;
    const ExchangedDepartment = this.ExchangedValidator.get('ExchangedDepartment').value;
    const ExchangedDoctor = this.ExchangedValidator.get('ExchangedDoctor').value;

    if (ExchangedDepartment === null || ExchangedDoctor === null) {
      this.showValidationMessage = true;
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed. Some fields are missing']);
      return;
    }

    this.exchangedDoctorDepartment = {
      DiagnosisList: this.FinalDiagnosisList,
      PatientVisitId: this.selectedVisit.PatientVisitId,
      ExchangedDoctorId: this.selectedDoctor.EmployeeId,
      ExchangedDepartmentId: this.selectedDepartment.DepartmentId,
      ExchangedDoctorName: this.selectedDoctor.FullName,
      ExchangedRemarks: remarks,
    }
    if (this.ExchangedValidator.valid) {
      this.SaveExchangedDoctorDepartmentDetails();
    }
    else {
      this.showValidationMessage = true;
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed. Some fields are missing']);
    }
  }

  AssignFinalDiagnosis() {
    if (this.selectedDiagnosis.length > 0) {
      this.FinalDiagnosisList = [];
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

  CloseExchangeDoctorDepartmentPopUp() {
    this.selectedDiagnosis = []
    this.exchangedDoctorDepartment = new NursingOPDExchangedDoctorDepartment_DTO();
    this.selectedDepartment = null;
    this.selectedDoctor = null;
    this.NursingOpdExchangeCallback.emit({ action: 'close' });
    this.showChangeDoctor = false;
    this.ExchangedValidator.reset();
    this.ExchangedValidator.updateValueAndValidity();
    this.showValidationMessage = false;

  }

  Discard() {
    this.discardInput.emit(true);
    this.selectedDiagnosis = [];
    this.exchangedDoctorDepartment = new NursingOPDExchangedDoctorDepartment_DTO();
    this.showChangeDoctor = true;
    this.selectedDepartment = null;
    this.selectedDoctor = null;
    const exchangedRemarksElement = document.getElementById('id_exchange_remarks') as HTMLTextAreaElement;
    exchangedRemarksElement.value = '';
    this.CloseExchangeDoctorDepartmentPopUp();
  }

  SetFocusById(IdToBeFocused: string) {
    window.setTimeout(function () {
      let elemToFocus = document.getElementById(IdToBeFocused)
      if (elemToFocus != null && elemToFocus != undefined) {
        elemToFocus.focus();
      }
    }, 100);
  }
  SaveExchangedDoctorDepartmentDetails() {
    if (!this.ExchangedValidator.valid) {
      this.showValidationMessage = true;
    } else {
      this.nursingBLService.UpdateExchangedDoctorDepartmentDetails(this.exchangedDoctorDepartment)
        .subscribe((res) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.selectedDiagnosis = [];
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Exchanged Successfully']);
            this.ExchangedValidator.reset();
            this.showValidationMessage = false;
            this.exchangedDoctorDepartment = new NursingOPDExchangedDoctorDepartment_DTO();
            this.LoadVisitList();
            this.CloseExchangeDoctorDepartmentPopUp();
          }
          else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Patient already has same visit"']);
          }
        });
    }
  }

  IsDirty(fieldName): boolean {
    if (fieldName == undefined) {
      return this.ExchangedValidator.dirty;
    } else {
      return this.ExchangedValidator.controls[fieldName].dirty;
    }
  }

  IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.ExchangedValidator.valid;
    } else {
      return !this.ExchangedValidator.hasError(validator, fieldName);
    }
  }
  LoadVisitList() {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.nursingBLService.GetOPDList(this.fromDate, this.toDate)
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
          this.opdFilteredList = this.opdList;
        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed To Load Data']);
        }
      });
  }
}
