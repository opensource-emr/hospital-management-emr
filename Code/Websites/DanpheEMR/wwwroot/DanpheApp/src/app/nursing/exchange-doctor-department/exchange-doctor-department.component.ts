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
import { Department } from '../../settings-new/shared/department.model';
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_DateTimeFormat, ENUM_MessageBox_Status, ENUM_VisitType } from '../../shared/shared-enums';
import { NursingOPDExchangedDoctorDepartment_DTO } from '../shared/dto/nursing-opd-exchanged-doctor-department.dto';
import { PerformerDetails_DTO } from '../shared/dto/performer-details.dto';
import { NursingBLService } from "../shared/nursing.bl.service";

@Component({
  selector: 'exchange-doctor-department',
  templateUrl: './exchange-doctor-department.component.html'
})
export class ExchangeDoctorDepartmentComponent implements OnInit {

  @Input('is-exchange-doctor-form')
  public ShowChangeDoctor: boolean = false;
  @Input('selected-visit')
  public SelectedVisit = new Visit();
  @Input("visit")
  public Visit = new Visit();
  @Output()
  public DiscardInput: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('nursing-opd-exchange-callback')
  NursingOpdExchangeCallback = new EventEmitter<object>();
  public SelectedDiagnosis: ICD10[] = [];
  public ChiefComplaints: Array<PatientClinicalInfoModel> = [];
  public FinalDiagnosisList: FinalDiagnosisModel[] = [];
  public ShowValidationMessage: boolean = false;
  public VisitDate: string = '';
  public DoctorList: Array<PerformerDetails_DTO> = [];
  public SelectedDoctor: any;
  public FilteredDocList: Array<PerformerDetails_DTO> = [];
  public SelectedDepartment: any;
  public DepartmentList: Array<Department> = [];
  public DepartmentId: number;
  public ExchangedDoctorDepartment = new NursingOPDExchangedDoctorDepartment_DTO();
  public ICD10MainList: ICD10[] = [];
  public SelectedDiagnosisSubscription = new Subscription();
  public EnableDepartmentLevelAppointment: boolean;
  public ShowDocMandatory: boolean = false;
  public ExchangedValidator: FormGroup = null;

  constructor(
    private _admissionDLService: ADT_DLService,
    private _messageBoxService: MessageboxService,
    private _mrBLService: MR_BLService,
    private _coreService: CoreService,
    private _visitService: VisitService,
    private _visitBLService: VisitBLService,
    private nursingBLService: NursingBLService
  ) {
    this.FilteredDocList = [];
    this.GetDepartments();
    this.GetICDList();
    this.GetProviderList();
    this.OnSelectedDiagnosisListChanged();
    let paramValue = this._coreService.EnableDepartmentLevelAppointment();
    if (paramValue) {
      this.EnableDepartmentLevelAppointment = false;
      this.ShowDocMandatory = false;
    }
    else {
      this.EnableDepartmentLevelAppointment = true;
      this.ShowDocMandatory = true;
    }
    let _formBuilder = new FormBuilder();

    this.ExchangedValidator = _formBuilder.group({
      'ExchangedDepartment': [, Validators.required],
      'ExchangedDoctor': [, Validators.required]
    });
  }

  ngOnInit(): void {
    this.ExchangedDoctorDepartment.PatientVisitId = this.SelectedVisit.PatientVisitId;
    this.VisitDate = moment(this.SelectedVisit.VisitDate).format(ENUM_DateTimeFormat.Year_Month_Day);
    this.SetFocusById('txt_ExchangedDepartment');
  }
  OnSelectedDiagnosisListChanged(): void {
    this.SelectedDiagnosisSubscription = this.nursingBLService.SelectedDiagnosisList().subscribe(res => {
      if (res) {
        this.OnDiagnosisSelected(res);
      }
    })
  }
  OnDiagnosisSelected(event: any): void {
    if (event)
      this.SelectedDiagnosis = event;
  }
  GetICDList(): void {
    this._mrBLService.GetICDList()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.ICD10MainList = res.Results;
        }
        else {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get data']);
        }
      },
        err => {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed to get ICD10.. please check log for detail.']);
        });
  }

  DepartmentListFormatter(data: any): string {
    let html = data["DepartmentName"];
    return html;
  }

  DocListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  FilterDoctorList(): void {
    if (this.Visit.DepartmentId) {
      this.FilteredDocList = this.DoctorList.filter(a => a.DepartmentId === this.Visit.DepartmentId);
    }
    else {
      this.FilteredDocList = this.DoctorList;
    }
  }
  GetDepartments(): void {
    this._visitBLService.GetDepartment()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK)
          this.DepartmentList = res.Results;
      },
        error => {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['No Departments found']);
        });
  }

  AssignSelectedDoctor(): void {
    let doctor = null;
    if (this.SelectedDoctor && this.DoctorList && this.DoctorList.length) {
      if (typeof (this.SelectedDoctor) === 'string') {
        doctor = this.DoctorList.find(a => a.FullName.toLowerCase() == String(this.SelectedDoctor).toLowerCase());
      }
      else if (typeof (this.SelectedDoctor) === 'object' && this.SelectedDoctor.EmployeeId > 0)
        doctor = this.DoctorList.find(a => a.EmployeeId === this.SelectedDoctor.EmployeeId);
      if (doctor) {
        this.DepartmentId = doctor.DepartmentId;
        this.SelectedDepartment = this.DepartmentList.find(dept => dept.DepartmentId === this.DepartmentId);
        this.FilteredDocList = this.DoctorList.filter(doc => doc.DepartmentId === this.DepartmentId);
        this.Visit.PerformerId = doctor.EmployeeId;
        this.Visit.PerformerName = doctor.FullName;
        this.Visit.IsValidSelProvider = true;
        this.Visit.IsValidSelDepartment = true;
        if (this.SelectedDepartment !== null) {
          this.AssignSelectedDepartment(this.SelectedDepartment);
        }
        this._visitService.TriggerBillChangedEvent({ ChangeType: "Doctor", SelectedDoctor: this.SelectedDoctor });
      }
      else {
        this.Visit.PerformerId = null;
        this.Visit.PerformerName = null;
        this.Visit.IsValidSelProvider = false;
      }
    }
    else {
      this.Visit.PerformerId = null;
      this.Visit.PerformerName = null;
      this.AssignSelectedDepartment(this.SelectedDepartment);
    }
  }

  GetProviderList(): void {
    this._admissionDLService.GetProviderList().subscribe(
      res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.DoctorList = res.Results.filter(doctor => doctor.EmployeeId > 0);
          this.FilteredDocList = this.DoctorList;
          this.AssignSelectedDoctor();
        } else {
          this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed.']);
        }
      },
      err => {
        this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed.']);
      }
    );
  }

  AssignSelectedDepartment(selectedDepartment): void {
    let department = null;
    if (selectedDepartment && this.DepartmentList && this.DepartmentList.length) {
      if (typeof (selectedDepartment) === 'string') {
        department = this.DepartmentList.find(a => a.DepartmentName.toLowerCase() === String(selectedDepartment).toLowerCase());
      }
      else if (typeof (selectedDepartment) === 'object' && selectedDepartment.DepartmentId)
        department = this.DepartmentList.find(a => a.DepartmentId === selectedDepartment.DepartmentId);
      if (department) {
        this.SelectedDepartment = department.DepartmentName;
        this.DepartmentId = department.DepartmentId;
        this.Visit.IsValidSelDepartment = true;
        this.Visit.IsValidSelProvider = true;
        this.Visit.DepartmentId = department.DepartmentId;
        this.Visit.DepartmentName = department.DepartmentName;
        this.Visit.DeptRoomNumber = department.RoomNumber;
        if (this.SelectedDoctor && this.SelectedDoctor.DepartmentId !== department.DepartmentId) {
          this.SelectedDoctor = null;
        }
        let erDeptNameParam = this._coreService.Parameters.find(p => p.ParameterGroupName.toLowerCase() === "common" && p.ParameterName.toLowerCase() === "erdepartmentname");
        if (erDeptNameParam) {
          let erDeptName = erDeptNameParam.ParameterValue.toLowerCase();
          if (department.DepartmentName.toLowerCase() == erDeptName) {
            this.Visit.VisitType = ENUM_VisitType.emergency;// "emergency";
          }
          else {
            this.Visit.VisitType = ENUM_VisitType.outpatient;// "outpatient";
          }
        }
        this._visitService.TriggerBillChangedEvent({ ChangeType: "Department", SelectedDepartment: this.SelectedDepartment });
      }
      else {
        this.Visit.IsValidSelDepartment = false;
        this.Visit.IsValidSelProvider = false;
      }
    }
    else {
      this.DepartmentId = 0;
      this.Visit.DepartmentId = 0;
      this.Visit.DepartmentName = null;
      this.FilteredDocList = this.DoctorList;
      this._visitService.TriggerBillChangedEvent({ ChangeType: "Department", SelectedDepartment: this.SelectedDepartment });
    }
    this.FilterDoctorList();
  }

  AddExchangedDoctorDepartmentDetails(): void {
    this.AssignFinalDiagnosis();
    const exchangeRemarksElement = document.getElementById('id_exchange_remarks') as HTMLTextAreaElement;
    const exchangeRemarksValue = exchangeRemarksElement.value;
    const remarks = exchangeRemarksValue;
    const ExchangedDepartment = this.ExchangedValidator.get('ExchangedDepartment').value;
    const ExchangedDoctor = this.ExchangedValidator.get('ExchangedDoctor').value;
    if (ExchangedDepartment === null || ExchangedDoctor === null) {
      this.ShowValidationMessage = true;
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed. Some fields are missing']);
      return;
    }
    this.ExchangedDoctorDepartment = {
      DiagnosisList: this.FinalDiagnosisList,
      PatientVisitId: this.SelectedVisit.PatientVisitId,
      ExchangedDoctorId: this.SelectedDoctor.EmployeeId,
      ExchangedDepartmentId: this.Visit.DepartmentId,
      ExchangedDoctorName: this.SelectedDoctor.FullName,
      ExchangedRemarks: remarks,
    }
    if (this.ExchangedValidator.valid) {
      const currentDepartmentId = this.SelectedVisit.DepartmentId;
      const currentDoctorId = this.SelectedVisit.PerformerId;
      const exchangedDepartmentId = this.Visit.DepartmentId;
      const exchangedDoctorId = this.SelectedDoctor.EmployeeId;
      if (currentDepartmentId === exchangedDepartmentId && currentDoctorId === exchangedDoctorId) {
        this._messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Select another doctor.']);
      }
      else {
        this.SaveExchangedDoctorDepartmentDetails();
      }
    }
    else {
      this.ShowValidationMessage = true;
      this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed. Some fields are missing']);
    }
  }

  AssignFinalDiagnosis(): void {
    if (this.SelectedDiagnosis.length > 0) {
      this.FinalDiagnosisList = [];
      this.SelectedDiagnosis.forEach(a => {
        let temp = this.ICD10MainList.find(b => a.ICD10Code === b.ICD10Code);
        if (temp) {
          let finalDiagnosis: FinalDiagnosisModel = new FinalDiagnosisModel();
          finalDiagnosis.PatientId = this.SelectedVisit.PatientId;
          finalDiagnosis.PatientVisitId = this.SelectedVisit.PatientVisitId;
          finalDiagnosis.ICD10ID = temp.ICD10ID;
          this.FinalDiagnosisList.push(finalDiagnosis);
        }
      });
    }
  }

  CloseExchangeDoctorDepartmentPopUp(): void {
    this.SelectedDiagnosis = []
    this.ExchangedDoctorDepartment = new NursingOPDExchangedDoctorDepartment_DTO();
    this.SelectedDepartment = null;
    this.SelectedDoctor = null;
    this.ShowChangeDoctor = false;
    this.ExchangedValidator.reset();
    this.ExchangedValidator.updateValueAndValidity();
    this.ShowValidationMessage = false;
    this.NursingOpdExchangeCallback.emit({ action: 'close' });

  }

  Discard(): void {
    this.DiscardInput.emit(true);
    this.SelectedDiagnosis = [];
    this.ExchangedDoctorDepartment = new NursingOPDExchangedDoctorDepartment_DTO();
    this.ShowChangeDoctor = false;
    this.SelectedDepartment = null;
    this.SelectedDoctor = null;
    const exchangedRemarksElement = document.getElementById('id_exchange_remarks') as HTMLTextAreaElement;
    exchangedRemarksElement.value = '';
    this.CloseExchangeDoctorDepartmentPopUp();
  }

  SetFocusById(IdToBeFocused: string): void {
    window.setTimeout(function () {
      let elemToFocus = document.getElementById(IdToBeFocused)
      if (elemToFocus !== null && elemToFocus !== undefined) {
        elemToFocus.focus();
      }
    }, 100);
  }

  SaveExchangedDoctorDepartmentDetails(): void {
    if (!this.ExchangedValidator.valid) {
      this.ShowValidationMessage = true;
    } else {
      this.nursingBLService.UpdateExchangedDoctorDepartmentDetails(this.ExchangedDoctorDepartment)
        .subscribe((res) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.SelectedDiagnosis = [];
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Exchanged Successfully']);
            this.ExchangedValidator.reset();
            this.ShowValidationMessage = false;
            this.ExchangedDoctorDepartment = new NursingOPDExchangedDoctorDepartment_DTO();
            this.CloseExchangeDoctorDepartmentPopUp();
          }
          else {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Patient already has same visit"']);
          }
        });
    }
  }

  IsDirty(fieldName): boolean {
    if (fieldName === undefined) {
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
}
