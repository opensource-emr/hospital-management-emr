import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ADT_DLService } from '../../adt/shared/adt.dl.service';
import { VisitBLService } from '../../appointments/shared/visit.bl.service';
import { Visit } from '../../appointments/shared/visit.model';
import { VisitService } from '../../appointments/shared/visit.service';
import { ICD10 } from '../../clinical/shared/icd10.model';
import { CoreService } from '../../core/shared/core.service';
import { FinalDiagnosisModel } from '../../medical-records/outpatient-list/final-diagnosis/final-diagnosis.model';
import { MR_BLService } from '../../medical-records/shared/mr.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_DateTimeFormat, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { NursingOpdCheckOut_DTO } from '../shared/dto/nursing-opd-checkout.dto';
import { NewReferalDepartment_DTO } from '../shared/dto/nursing-opd-referal-department.dto';
import { NursingBLService } from '../shared/nursing.bl.service';

@Component({
  selector: 'nursing-opd-chekout',
  templateUrl: './nursing-opd-chekout.component.html',
  styleUrls: ['./nursing-opd-chekout.component.css']
})
export class NursingOpdChekoutComponent implements OnInit {

  @Input('is-NursingCheckout-Form')
  public showNursingCheckout: boolean = false;
  @Input('selected-visit')
  public selectedVisit: Visit;
  @Input("visit")
  public visit: Visit = new Visit();
  @Output() discardInput: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('nursing-opd-refer-callback)')
  NursingOpdReferCallback = new EventEmitter<object>();
  public selectedDiagnosis: ICD10[] = [];
  public FinalDiagnosisList: FinalDiagnosisModel[] = [];
  public showValidationMessage: boolean = false;
  public visitDate: string = '';
  public followUpDays: number = 0;
  public concludedNote: string = '';

  public departmentList: Array<NewReferalDepartment_DTO> = [];
  public ICD10MainList: ICD10[] = [];
  public selectedDiagnosisSubscription = new Subscription();
  public enableDepartmentLevelAppointment: boolean;
  public showDocMandatory: boolean = false; //this is used to show either doctor is mandatory or not// it is used only in case of EHS price selection --Yubraj 23rd 2019
  public fromDate: string = '';
  public toDate: string = '';
  public opdList: Array<Visit> = new Array<Visit>();
  public opdListZero: Array<Visit> = new Array<Visit>();
  public opdListOne: Array<Visit> = new Array<Visit>();

  public opdFilteredList: Array<Visit> = new Array<Visit>();
  // nursingOpdCheckout: { DiagnosisList: FinalDiagnosisModel[]; PatientId: number; PatientVisitId: number; ReferredDoctorId: number; ReferredDepartmentId: any; ReferredDepartment: any; ReferredDoctor: string; VisitType: string; VisitStatus: ENUM_VisitStatus; AppointmentType: ENUM_AppointmentType; BillingStatus: ENUM_BillingStatus; };

  public nursingOpdCheckout: NursingOpdCheckOut_DTO = new NursingOpdCheckOut_DTO();

  constructor(
    public admissionDLService: ADT_DLService,
    public msgBoxServ: MessageboxService,
    public mrBLService: MR_BLService,
    public coreService: CoreService,
    public visitService: VisitService,
    public visitBLService: VisitBLService,
    public nursingBLService: NursingBLService
  ) {
    // this.GetDepartments();
    this.GetICDList();
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
  }

  ngOnInit(): void {
    this.nursingOpdCheckout.PatientId = this.selectedVisit.PatientId;
    this.nursingOpdCheckout.PatientVisitId = this.selectedVisit.PatientVisitId;
    // this.nursingOpdCheckout.PerformerId = this.selectedVisit.PerformerId;
    // this.nursingOpdCheckout.PerformerName = this.selectedVisit.PerformerName;
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
  // FilterDoctorList() {
  //   if (this.selectedDoctor != null) {
  //     if (typeof (this.selectedDoctor) == 'object') {
  //       this.selectedDoctor.PerformerName = "";
  //       this.selectedDoctor.PerformerId = 0;
  //     }
  //   }
  //   // if (this.departmentId && Number(this.departmentId) != 0) {
  //   //   this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);

  //   // }
  //   else {
  //     this.filteredDocList = this.doctorList;
  //   }
  // }
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

  // public AssignSelectedDoctor() {
  //   let doctor = null;

  //   if (this.selectedDoctor && this.doctorList && this.doctorList.length) {
  //     if (typeof (this.selectedDoctor) == 'string') {
  //       doctor = this.doctorList.find(a => a.FullName.toLowerCase() == String(this.selectedDoctor).toLowerCase());
  //     }
  //     else if (typeof (this.selectedDoctor) == 'object' && this.selectedDoctor.EmployeeId > 0)
  //       doctor = this.doctorList.find(a => a.EmployeeId == this.selectedDoctor.EmployeeId);
  //     if (doctor) {
  //       //to filter doctor List after department is changed (flow: assigning department by selecting doctor).
  //       this.departmentId = doctor.DepartmentId;
  //       const department = this.departmentList.find(dept => dept.DepartmentId === this.departmentId);
  //       this.selectedDepartment = department && department.DepartmentName;
  //       this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);
  //       this.selectedDoctorToRefer = Object.assign(this.selectedDoctor, doctor);
  //       this.visit.PerformerId = doctor.EmployeeId;//this will give providerid
  //       this.visit.PerformerName = doctor.FullName;
  //       this.visit.IsValidSelProvider = true;
  //       this.visit.IsValidSelDepartment = true;
  //       if (this.selectedDepartment !== null) {
  //         this.AssignSelectedDepartment(this.selectedDepartment);
  //       }
  //       //this.selectedDepartment = this.departmentList.find(dept => dept.DepartmentId === this.departmentId);
  //       this.visitService.TriggerBillChangedEvent({ ChangeType: "Doctor", SelectedDoctor: this.selectedDoctor });
  //     }
  //     else {
  //       this.visit.PerformerId = null;
  //       this.visit.PerformerName = null;
  //       this.visit.IsValidSelProvider = false;
  //     }
  //   }
  //   else {
  //     this.visit.PerformerId = null;
  //     this.visit.PerformerName = null;
  //     this.AssignSelectedDepartment(this.selectedDepartment);// If doctor is not proper then assign bill items that of Department level.
  //   }
  // }
  // GetProviderList() {
  //   this.admissionDLService.GetProviderList().subscribe(
  //     res => {
  //       if (res.Status === ENUM_DanpheHTTPResponses.OK) {
  //         this.doctorList = res.Results.filter(doctor => doctor.EmployeeId > 0);
  //         this.filteredDocList = this.doctorList;
  //         this.AssignSelectedDoctor();
  //       } else {
  //         this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed.']);
  //       }
  //     },
  //     err => {
  //       this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed.']);
  //     }
  //   );
  // }

  // public AssignSelectedDepartment(selectedDepartment) {
  //   let department = null;
  //   if (selectedDepartment && this.departmentList && this.departmentList.length) {
  //     if (typeof (selectedDepartment) === 'string') {
  //       department = this.departmentList.find(a => a.DepartmentName.toLowerCase() === String(selectedDepartment).toLowerCase());
  //     }
  //     else if (typeof (selectedDepartment) === 'object' && selectedDepartment.DepartmentId)
  //       department = this.departmentList.find(a => a.DepartmentId === selectedDepartment.DepartmentId);
  //     if (department) {
  //       this.selectedDepartment = Object.assign(selectedDepartment, department);
  //       this.departmentId = department.DepartmentId;
  //       this.visit.IsValidSelDepartment = true;
  //       this.visit.IsValidSelProvider = true;
  //       this.visit.DepartmentId = department.DepartmentId;
  //       this.visit.DepartmentName = department.DepartmentName;
  //       this.visit.DeptRoomNumber = department.RoomNumber;
  //       this.FilterDoctorList();
  //       //getting emergency name from the parameterized data
  //       let erdeptnameparam = this.coreService.Parameters.find(p => p.ParameterGroupName.toLowerCase() == "common" && p.ParameterName.toLowerCase() == "erdepartmentname");
  //       if (erdeptnameparam) {
  //         let erdeptname = erdeptnameparam.ParameterValue.toLowerCase();
  //         //temporary solution for : er-visit based on departmentname.  get these from server side or from configuration for proper solution.
  //         if (department.DepartmentName.toLowerCase() == erdeptname) {
  //           this.visit.VisitType = ENUM_VisitType.emergency;// "emergency";
  //         }
  //         else {
  //           this.visit.VisitType = ENUM_VisitType.outpatient;// "outpatient";
  //         }
  //       }
  //       this.visitService.TriggerBillChangedEvent({ ChangeType: "Department", SelectedDepartment: this.selectedDepartment });
  //       //this.visitService.TriggerBillChangedEvent({ ChangeType: "Doctor", SelectedDoctor: this.selectedDoctor });
  //     }
  //     else {
  //       this.visit.IsValidSelDepartment = false;
  //       this.visit.IsValidSelProvider = false;
  //     }
  //   }
  //   else {
  //     this.departmentId = 0;
  //     this.visit.DepartmentId = 0;
  //     this.visit.DepartmentName = null;
  //     this.filteredDocList = this.doctorList;
  //     this.visitService.TriggerBillChangedEvent({ ChangeType: "Department", SelectedDepartment: this.selectedDepartment }); //Removes paticulars from 'Additional Bill Item?' when Department is kept empty
  //   }
  // }


  addReferDetails() {
    this.AssignFinalDiagnosis();

    this.nursingOpdCheckout = {
      DiagnosisList: this.FinalDiagnosisList,
      PatientId: this.selectedVisit.PatientId,
      PatientVisitId: this.selectedVisit.PatientVisitId,
      PerformerId: this.selectedVisit.PerformerId,
      PerformerName: this.selectedVisit.PerformerName,
      DepartmentId: this.selectedVisit.DepartmentId,
      DepartmentName: this.selectedVisit.DepartmentName,
      FollowUpDay: this.followUpDays,
      ConcludedNote: this.concludedNote,
      Visit: this.selectedVisit
    }
    if (this.nursingOpdCheckout != null) {
      this.SaveReferal();
    } else {
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
    this.nursingOpdCheckout = new NursingOpdCheckOut_DTO();
    this.NursingOpdReferCallback.emit({ action: 'close' });
    this.showNursingCheckout = false;
    this.showValidationMessage = false;
    this.followUpDays = 0;
    this.concludedNote = '';

  }

  Discard() {
    this.discardInput.emit(true);
    this.selectedDiagnosis = [];
    this.followUpDays = 0;
    this.concludedNote = '';
    this.showNursingCheckout = true;
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

    this.nursingBLService.PostNursingCheckOutDetails(this.nursingOpdCheckout)
      .subscribe((res) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.selectedDiagnosis = [];
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Checkout Successfully']);
          this.showValidationMessage = false;
          this.nursingOpdCheckout = new NursingOpdCheckOut_DTO();
          this.LoadVisitList();
          this.Close();
        } else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed. please check log for now"']);
        }
      });
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
