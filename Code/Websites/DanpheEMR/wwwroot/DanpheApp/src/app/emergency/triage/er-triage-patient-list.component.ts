import { Component, ChangeDetectorRef } from '@angular/core';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from '../../core/shared/core.service';
import { EmergencyPatientModel } from '../shared/emergency-patient.model';
import EmergencyGridColumnSettings from '../shared/emergency-gridcol-settings';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { EmergencyBLService } from '../shared/emergency.bl.service';
import { Patient } from '../../patients/shared/patient.model';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { Router } from '@angular/router';
import { PatientService } from '../../patients/shared/patient.service';
import { VisitService } from '../../appointments/shared/visit.service';
import * as moment from 'moment';


@Component({
  selector: 'triage-patient-list',
  templateUrl: './er-triage-patient-list.html',
  styleUrls: ['./triage-pat-list.css']
})


export class ERTriagePatientListComponent {
  public showOrderPopUp: boolean = false;
  public showlamaPopUp: boolean = false;
  public showAdmitPopUp: boolean = false;
  public showERPatRegistration: boolean = false;
  public showAssignDoctor: boolean = false;
  public showAddVitals: boolean = false;
  public showVitalsList: boolean = true;
  public visitId: number = null;

  public doctorsList: Array<any> = [];
  public TriagedERPatients: Array<EmergencyPatientModel> = new Array<EmergencyPatientModel>();
  public TriagedERPatientGridCol: Array<any> = null;
  public selectedTriagedPatientForOrder: EmergencyPatientModel = new EmergencyPatientModel();
  public selectedPatient: EmergencyPatientModel = new EmergencyPatientModel();
  public selectedERPatientToEdit: EmergencyPatientModel = new EmergencyPatientModel();
  public index: number = 0;
  public action: string = "";
  public searchString: string = null;
  public currentDepartmentName: string = null;
  public globalVisit: any;
  public globalPatient: any;
  public caseIdList: Array<number> = new Array<number>();
  public casesList = [];
  public allKeys: Array<string>;
  public showUploadConsent = {
    "upload_files": false,
    "remove": false,
  };
  public filteredData: any;

  constructor(public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService, public router: Router,
    public emergencyBLService: EmergencyBLService, public coreService: CoreService, public patientService: PatientService,
    public visitService: VisitService) {
    this.TriagedERPatientGridCol = EmergencyGridColumnSettings.TriagedERPatientList;
    //this.GetERTriagedPatientList();
    this.GetDoctorsList();
  }

  ngOnInit() {
    this.currentDepartmentName = this.coreService.GetERDepartmentName();
    this.allKeys = Object.keys(this.showUploadConsent);
  }


  public GetDoctorsList() {
    this.emergencyBLService.GetDoctorsList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.doctorsList = res.Results;
          }
          else {
            console.log(res.ErrorMessage);
          }
        }
      },
        err => {
          this.msgBoxServ.showMessage('Failed', ["unable to get Doctors list.. check log for more details."]);
          console.log(err.ErrorMessage);
        });
  }


  public GetERTriagedPatientList() {
    var id = this.caseIdList ? this.caseIdList : null;
    this.emergencyBLService.GetAllTriagedPatients(id[0])
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.TriagedERPatients = res.Results;
          this.filteredData = res.Results;
          if (this.caseIdList[0] == 6) {
            this.filterNestedDetails();
          }
        } else {
          this.msgBoxServ.showMessage("Failed", ["Cannot Get Triaged Patient List !!"]);
        }
      });
  }

  //Closes the Registration PopUp if clicked Outside popup window
  public ParentOfPopUpClicked($event) {
    var currentTarget = $event.currentTarget;
    var target = $event.target;
    if (target == currentTarget) {
      this.CloseAllERPatientPopUp();
    }
  }

  //Called each time just before any PopUp Opens
  public ResetAllAndHideParentBodyScroll() {
    this.showlamaPopUp = false;
    this.showOrderPopUp = false;
    var body = document.getElementsByTagName("body")[0];
    body.style.overflow = "hidden";
  }

  //Called each time when any of the popUp needs to close or when clicked outside the parent div
  public CloseAllERPatientPopUp() {
    var body = document.getElementsByTagName("body")[0];
    body.style.overflow = "inherit";
    this.changeDetector.detectChanges();
    //Resets Order PopUp
    this.selectedTriagedPatientForOrder = new EmergencyPatientModel();
    this.selectedPatient = new EmergencyPatientModel();
    this.showOrderPopUp = false;
    this.showlamaPopUp = false;
    this.showAdmitPopUp = false;
    this.showERPatRegistration = false;
    this.showAssignDoctor = false;
    this.showAddVitals = false;
  }


  public EditPatInfo(selPat: EmergencyPatientModel) {
    this.selectedERPatientToEdit = new EmergencyPatientModel();
    this.showERPatRegistration = false;
    this.changeDetector.detectChanges();
    this.selectedERPatientToEdit = Object.assign(this.selectedERPatientToEdit, selPat);
    this.showERPatRegistration = true;
  }

  public AssignDoctor(selPat: EmergencyPatientModel) {
    this.ResetAllAndHideParentBodyScroll();
    this.selectedTriagedPatientForOrder = new EmergencyPatientModel();
    this.changeDetector.detectChanges();
    this.selectedERPatientToEdit = Object.assign(this.selectedERPatientToEdit, selPat);
    if (this.doctorsList.length) {
      this.showAssignDoctor = true;
    } else {
      this.msgBoxServ.showMessage("Failed", ["Please Try Later"]);
    }
  }


  public AdmitERPatient(selectedPat: EmergencyPatientModel) {
    this.ResetAllAndHideParentBodyScroll();
    this.selectedPatient = new EmergencyPatientModel();
    this.changeDetector.detectChanges();
    this.selectedPatient = Object.assign(this.selectedPatient, selectedPat);
    this.action = "admitted";
    this.showAdmitPopUp = true;
  }
  public DeathCaseOfERPatient(selectedPat: EmergencyPatientModel) {
    this.ResetAllAndHideParentBodyScroll();
    this.selectedPatient = new EmergencyPatientModel();
    this.changeDetector.detectChanges();
    this.selectedPatient = Object.assign(this.selectedPatient, selectedPat);
    this.action = "death";
    this.showlamaPopUp = true;
  }
  public TransferERPatient(selectedPat: EmergencyPatientModel) {
    this.ResetAllAndHideParentBodyScroll();
    this.selectedPatient = new EmergencyPatientModel();
    this.changeDetector.detectChanges();
    this.selectedPatient = Object.assign(this.selectedPatient, selectedPat);
    this.action = "transferred";
    this.showlamaPopUp = true;
  }
  public DischargeERPatient(selectedPat: EmergencyPatientModel) {
    this.ResetAllAndHideParentBodyScroll();
    this.selectedPatient = new EmergencyPatientModel();
    this.changeDetector.detectChanges();
    this.selectedPatient = Object.assign(this.selectedPatient, selectedPat);
    this.action = "discharged";
    this.showlamaPopUp = true;
  }

  public LeaveERPatOnMedicalAdvice(selectedPat: EmergencyPatientModel) {
    this.ResetAllAndHideParentBodyScroll();
    this.selectedPatient = new EmergencyPatientModel();
    this.changeDetector.detectChanges();
    this.selectedPatient = Object.assign(this.selectedPatient, selectedPat);
    this.action = "lama";
    this.showlamaPopUp = true;
  }

  public DischargeERPatientOnRequest(selectedPat: EmergencyPatientModel) {
    this.ResetAllAndHideParentBodyScroll();
    this.selectedPatient = new EmergencyPatientModel();
    this.changeDetector.detectChanges();
    this.selectedPatient = Object.assign(this.selectedPatient, selectedPat);
    this.action = "dor";
    this.showlamaPopUp = true;
  }

  public OrderForERPat(selectedPat: EmergencyPatientModel) {
    this.ResetAllAndHideParentBodyScroll();
    this.selectedTriagedPatientForOrder = new EmergencyPatientModel();
    this.changeDetector.detectChanges();
    this.selectedTriagedPatientForOrder = Object.assign(this.selectedTriagedPatientForOrder, selectedPat);
    this.showOrderPopUp = true;
  }

  public UndoTriage(selectedPat: EmergencyPatientModel) {
    this.selectedTriagedPatientForOrder = new EmergencyPatientModel();
    this.changeDetector.detectChanges();
    this.selectedTriagedPatientForOrder = Object.assign(this.selectedTriagedPatientForOrder, selectedPat);
    var undoTriage = window.confirm("Are You Sure You want to undo this triage ?");
    if (undoTriage) {
      this.emergencyBLService.UndoTriageOfERPatient(selectedPat)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            let itmIndex = this.TriagedERPatients.findIndex(tst => tst.ERPatientId == selectedPat.ERPatientId);
            this.TriagedERPatients.splice(itmIndex, 1);
            this.TriagedERPatients = this.TriagedERPatients.slice();
          } else {
            this.msgBoxServ.showMessage("Failed", ["Cannot Undo Triag code of a Patient Now."]);
          }
        });
    }
  }

  public ReturnFromOrderAndLamaAction($event) {
    this.CloseAllERPatientPopUp();
    if ($event.submit) {
      if ($event.callBackFrom == 'lama') {
        let itmIndex = this.TriagedERPatients.findIndex(tst => tst.ERPatientId == $event.ERPatient.ERPatientId);
        this.TriagedERPatients.splice(itmIndex, 1);
        this.TriagedERPatients = this.TriagedERPatients.slice();
      }
    }
  }

  public ReturnFromPatRegistrationEdit($event) {
    this.CloseAllERPatientPopUp();
    if ($event.submit) {
      let itmIndex = this.TriagedERPatients.findIndex(tst => tst.ERPatientId == $event.ERPatient.ERPatientId);
      if (itmIndex >= 0) {
        this.TriagedERPatients.splice(itmIndex, 1, $event.ERPatient);
        this.TriagedERPatients = this.TriagedERPatients.slice();
      } else {
        this.GetERTriagedPatientList();
      }
    }
  }

  public ReturnFromAssignDoctor($event) {
    this.CloseAllERPatientPopUp();
    if ($event.submit) {
      let itmIndex = this.TriagedERPatients.findIndex(tst => tst.ERPatientId == $event.ERPatient.ERPatientId);
      if (itmIndex >= 0) {
        this.TriagedERPatients[itmIndex].ProviderName = $event.ERPatient.ProviderName;
        this.TriagedERPatients = this.TriagedERPatients.slice();
      } else {
        this.GetERTriagedPatientList();
      }
    }
  }

  public ReturnFromPatBedReservation($event) {
    let patId = this.selectedPatient.PatientId;
    let visitId = this.selectedPatient.PatientVisitId;
    this.CloseAllERPatientPopUp();
    if ($event.submit) {
      let itmIndex = this.TriagedERPatients.findIndex(tst => tst.PatientId == patId && tst.PatientVisitId == visitId);
      this.TriagedERPatients.splice(itmIndex, 1);
      this.TriagedERPatients = this.TriagedERPatients.slice();
    }
  }

  public AddVitals(selPat: EmergencyPatientModel) {
    this.ResetAllAndHideParentBodyScroll();
    this.selectedERPatientToEdit = Object.assign(this.selectedERPatientToEdit, selPat);
    if (this.doctorsList.length) {
      this.showAddVitals = true;
      this.visitId = this.selectedERPatientToEdit.PatientVisitId;
    } else {
      this.msgBoxServ.showMessage("Failed", ["Please Try Later"]);
    }
  }

  public ReturnFromAllERPatientActions($event) {
    this.CloseAllERPatientPopUp();
    if ($event.submit) {
      //this.GetERTriagedPatientList();
      this.showAddVitals = false;
    }
  }

  public GoToPatientOverview(pat) {
    this.SetPatDataToGlobal(pat);
    this.router.navigate(["/Emergency/PatientOverviewMain"]);
  }

  public SetPatDataToGlobal(data): void {
    this.globalPatient = this.patientService.CreateNewGlobal();
    this.globalPatient.PatientId = data.PatientId;
    this.globalPatient.PatientCode = data.PatientCode;
    this.globalPatient.ShortName = data.Name;
    this.globalPatient.DateOfBirth = data.DateOfBirth;
    this.globalPatient.Gender = data.Gender;
    this.globalPatient.Age = data.Age;
    this.globalPatient.Address = data.Address;
    this.globalPatient.PhoneNumber = data.ContactNo;


    this.globalVisit = this.visitService.CreateNewGlobal();
    this.globalVisit.ERTabName = "triaged";
    this.globalVisit.PatientVisitId = data.PatientVisitId;
    this.globalVisit.PatientId = data.PatientId;
    this.globalVisit.ProviderId = data.ProviderId;
    this.globalVisit.VisitType = "emergency";
    this.globalVisit.ProviderName = data.ProviderName;
    this.globalVisit.VisitDate = moment(data.VisitDateTime).format("YYYY-MM-DD");
    this.globalVisit.VisitTime = moment(data.VisitDateTime).format("HH:MM");
  }

  PatientCasesOnChange($event) {
    if ($event.mainDetails && $event.mainDetails != 0) {
      this.caseIdList = [];
      this.casesList = [];
      this.caseIdList.push($event.mainDetails);
      if ($event.nestedDetails && $event.nestedDetails.length >= 1) {
        $event.nestedDetails.forEach(v => {
          this.caseIdList.push(v.Id);
          this.casesList.push(v);
        });
      }
    }else {
      this.caseIdList = [];
      this.caseIdList.push($event.mainDetails)
  }
    this.GetERTriagedPatientList();

  }

  filterNestedDetails() {
    this.caseIdList.slice(1);
    this.filteredData = this.TriagedERPatients.filter(a => this.caseIdList.includes(a.PatientCases.SubCase));
  }
  public UploadConsent(selectedPat: EmergencyPatientModel) {
    this.ResetAllAndHideParentBodyScroll();
    this.selectedPatient = new EmergencyPatientModel();
    this.changeDetector.detectChanges();
    this.selectedPatient = Object.assign(this.selectedPatient, selectedPat);
    this.action = "consent";
    this.allKeys.forEach(k => this.showUploadConsent[k] = (k != "upload_files") ? false : true);
  }
  CallBackForClose(event) {
    if (event && event.close) {
      this.allKeys.forEach(k => this.showUploadConsent[k] = false);
     
    }
  }
}
