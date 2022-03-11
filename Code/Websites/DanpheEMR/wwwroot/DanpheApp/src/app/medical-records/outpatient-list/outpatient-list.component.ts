import { Component, ChangeDetectorRef } from '@angular/core'
import { Router } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../../security/shared/security.service";
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { MR_BLService } from '../shared/mr.bl.service';
import { CoreService } from '../../core/shared/core.service';
import { HttpClient } from '@angular/common/http';
import MRGridColumnSettings from '../shared/Mr-gridcol.settings';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { ADT_DLService } from '../../adt/shared/adt.dl.service';
import { MedicalRecordService } from '../shared/medical-record.service';
import { FinalDiagnosisModel } from './final-diagnosis/final-diagnosis.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../shared/danphe-grid/NepaliColGridSettingsModel";




@Component({
  templateUrl: "./outpatient-list.html"
})

// App Component class
export class MROutpatientListComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public gridColumns: Array<any> = null;
  public dateRange: string = null;
  public ICDCode: string = null;
  public DepartmentList: any;
  public showFinalDiagnosis: boolean = false;
  public OutpatientList: Array<any> = new Array<any>();
  public filteredOutpatientList: Array<any> = new Array<any>();
  public finalFilteredOutpatientList: Array<any> = new Array<any>();
  public OutpatientFilterOutList: Array<any> = null;
  public icd10DiagnosisList: Array<any> = new Array<any>();
  public icd10DiagnosisFilteredList: Array<any> = Array<any>();
  public tempFilterList: Array<any> = Array<any>();
  public allDiagnosisList: Array<any> = Array<any>();
  public SelectedDepartmentId: any;
  public SelectedDoctorId: number = null;
  public selectedPatient: any = null;
  public providerList: any;
  public ICD10ReportingGroupList: any;
  public ICD10DiseaseGroupList: any;
  public SelectedDoctor: any;
  public selectedICD10Code: any;
  public diagnosisStatus: string = 'all';
  // public selectedDiagnosisICD10Code: any =null;
  public selectedDiagnosisICD10Code: any;
  public selectedReportingGroupId: number = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  constructor(
    public router: Router, public http: HttpClient,
    public medicalRecordsBLService: MR_BLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public admissionBLService: ADT_DLService,
    public coreService: CoreService,
    public mrBLService: MR_BLService,
    public mrService: MedicalRecordService) {
    this.gridColumns = MRGridColumnSettings.OutpatientList;
    this.dateRange = "last3Months";

    this.GetDepartmentList();
    this.GetProviderList();
    this.GetICD10ReportingGroup();
    this.GetICDDiseaseGroup();
    this.GetICDList();
    this.OnReportingGroupChange();
    this.GetAllOutpatientList();
    //  this.FilterList('departId');

    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('VisitDate', false));

  }


  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;

    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetAllOutpatientList();

      } else {
        this.msgBoxServ.showMessage("failed", ['Please enter valid From date and To date']);
      }

    }
  }

  public GetAllOutpatientList() {
    //clear the old  data
    this.OutpatientList = [];
    this.filteredOutpatientList = [];
    this.finalFilteredOutpatientList = [];
    this.medicalRecordsBLService.GetOutpatientList(this.fromDate, this.toDate).subscribe(res => {
      if (res.Status == 'OK') {
        this.OutpatientList = res.Results;
        // this.finalFilteredOutpatientList = this.OutpatientList;
        this.filteredOutpatientList = this.OutpatientList;
        // this.FilterDiagnosisList();
        this.FilterList();
      } else {
        this.msgBoxServ.showMessage("Failed", ['Error Occured while getting Outpatinet List. Please Try again Later']);
      }
    });
  }

  GetDepartmentList() {
    this.admissionBLService.GetDepartments().subscribe(
      (res) => {
        if (res.Status == "OK") {
          this.DepartmentList = res.Results;
        } else {
          this.msgBoxServ.showMessage("Error", [res.ErrorMessage]);
        }
      },
      (err) => {
        this.msgBoxServ.showMessage("Error", [err.ErrorMessage]);
      }
    );
  }
  GetProviderList() {
    this.admissionBLService.GetProviderList().subscribe(
      res => {
        if (res.Status == "OK") {
          this.providerList = res.Results;

        }
        else {
          this.msgBoxServ.showMessage("Error", [res.ErrorMessage]);

        }
      },
      (err) => {
        this.msgBoxServ.showMessage("Error", [err.ErrorMessage]);

      }
    );
  }

  GetICD10ReportingGroup() {
    this.mrBLService.GetICD10ReportingGroup().subscribe(
      res => {
        if (res.Status == "OK") {
          this.ICD10ReportingGroupList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("Error", [res.ErrorMessage]);

        }
      },
      err => {
        this.msgBoxServ.showMessage("Error", [err.ErrorMessage]);
      }
    );
  }

  GetICDDiseaseGroup() {
    this.mrBLService.GetICD10DiseaseGroup().subscribe(
      res => {
        if (res.Status == "OK") {
          this.ICD10DiseaseGroupList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("Eror", [res.ErrorMessage]);
        }
      },
      err => {
        this.msgBoxServ.showMessage("Error", [err.ErrorMessage]);
      }
    );

  }

  public GetICDList() {

    if (this.mrService.icd10List && this.mrService.icd10List.length > 0) {

      this.icd10DiagnosisList = this.mrService.icd10List;
      this.icd10DiagnosisFilteredList = this.icd10DiagnosisList
    }
  }

  public OnReportingGroupChange() {
    this.icd10DiagnosisFilteredList = []
    if (this.selectedReportingGroupId == null) {
      this.icd10DiagnosisFilteredList = this.icd10DiagnosisList;
    }
    else {
      var filteredDiseaseGroupList: Array<any> = this.ICD10DiseaseGroupList.filter(diseaseGroup => diseaseGroup.ReportingGroupId == this.selectedReportingGroupId);

      var icd10CodeList: string[] = filteredDiseaseGroupList.map(diseaseGroup => diseaseGroup.ICDCode);
      this.icd10DiagnosisFilteredList = this.icd10DiagnosisList.filter(icd10Diagnosis => icd10CodeList.includes(icd10Diagnosis.ICD10Code));
    }
  }

  GridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "add-diagnosis":
        {
          this.selectedPatient = $event.Data;
          this.showFinalDiagnosis = true;
        }
        break;
      default:
        break;
    }
  }


  CallBack(data) {
    if (data && data.Close) {
      this.showFinalDiagnosis = false;
    } else if (data && (data.Add || data.Edit)) {
      this.showFinalDiagnosis = false;
      this.GetAllOutpatientList();
    }
  }

  FilterList(departId: number = null, drId: number = null) {

    drId = this.SelectedDoctor != null ? this.SelectedDoctor.EmployeeId : null;
    departId = this.SelectedDepartmentId != null ? this.SelectedDepartmentId : null;
    // Case1: Both are not Null
    if (departId && drId) {
      // this.FilterDiagnosisList('');
      this.filteredOutpatientList = this.OutpatientList.filter(a =>
        a.DepartmentId == departId && a.ProviderId == drId
      );
      this.finalFilteredOutpatientList = this.filteredOutpatientList;
    }
    //Case 2: Depatment Id is null and dr id is not null
    else if ((!departId || departId == null) && drId) {
      // this.FilterDiagnosisList('');
      this.filteredOutpatientList = this.OutpatientList.filter(a =>
        a.ProviderId == drId
      );
      this.finalFilteredOutpatientList = this.filteredOutpatientList;
    }
    //case 3: Department id is not null and dr id is null
    else if (departId && !drId) {
      // this.FilterDiagnosisList('');
      this.filteredOutpatientList = this.OutpatientList.filter(a =>
        a.DepartmentId == departId
      );
      this.filteredOutpatientList = this.filteredOutpatientList;
    }
    //Case Both are  null
    else {
      this.filteredOutpatientList = this.OutpatientList;
    }

    this.FilterDiagnosisList();

  }
  FilterDiagnosisList() {
    //Case 1: If Diagnosis is complete 
    if (this.diagnosisStatus == 'complete') {
      this.tempFilterList = this.filteredOutpatientList.filter(a =>
        a.FinalDiagnosisCount != 0)
      if (this.tempFilterList.length == 0) {
        this.finalFilteredOutpatientList = this.tempFilterList;
      }

    }
    else if (this.diagnosisStatus == 'pending') {
      this.tempFilterList = this.filteredOutpatientList.filter(a =>
        a.FinalDiagnosisCount == 0)
      if (this.tempFilterList.length == 0) {
        this.finalFilteredOutpatientList = this.tempFilterList;
      }
    }

    else {
      this.tempFilterList = this.filteredOutpatientList;
    }
    this.FilterDiagnosisPatientsList()
  }
  providerListFormatter(data: any): string {
    let html = `${data["FullName"]}`;
    return html;

  }

  DignosisFormatter(data: any): string {
    let html1 = data["ICD10Code"] + " | " + data["ICD10Description"];
    return html1;
  }
  FilterDiagnosisPatientsList() {

    if (this.tempFilterList.length > 0) {
      if (!this.selectedDiagnosisICD10Code || this.selectedDiagnosisICD10Code == null) {
        this.finalFilteredOutpatientList = this.tempFilterList;

      }
      else {
        // 
        this.OnReportingGroupChange();
        this.finalFilteredOutpatientList = this.tempFilterList.filter(
          oplist => {
            let hasCode: boolean = false;
            if (oplist.FinalDiagnosis && oplist.FinalDiagnosis.length > 0) {
              oplist.FinalDiagnosis.forEach(fd => {

                if (fd.ICD10Code == this.selectedDiagnosisICD10Code.ICD10Code) {
                  hasCode = true;
                }

              });
              if (hasCode) {
                return oplist;

              }
            }

          }
        );
      }
    }

  }

}

