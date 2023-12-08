import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ADT_DLService } from '../../adt/shared/adt.dl.service';
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from '../../security/shared/security.service';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../shared/danphe-grid/NepaliColGridSettingsModel';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import MRGridColumnSettings from '../shared/Mr-gridcol.settings';
import { ICDEmergencyDiseaseGroup, ICDEmergencyReportingGroup } from '../shared/emer-disease-and-reporting-group-VM';
import { MedicalRecordService } from '../shared/medical-record.service';
import { MR_BLService } from '../shared/mr.bl.service';

@Component({
  selector: 'app-emergency-patient-list',
  templateUrl: './emergency-patient-list.component.html',
  styleUrls: ['./emergency-patient-list.component.css']
})
export class EmergencyPatientListComponent {

  public fromDate: string = null;
  public toDate: string = null;
  public gridColumns: Array<any> = null;
  public dateRange: string = null;
  public ICDCode: string = null;
  public showFinalDiagnosis: boolean = false;
  public EmergencypatientList: Array<any> = new Array<any>();
  public filteredEmergencypatientList: Array<any> = new Array<any>();
  public finalFilteredEmergencypatientList: Array<any> = new Array<any>();
  public icdDiagnosisList: Array<ICDEmergencyDiseaseGroup> = new Array<ICDEmergencyDiseaseGroup>();
  public icdReportingGroupList: Array<ICDEmergencyReportingGroup> = new Array<ICDEmergencyReportingGroup>();
  public icdDiagnosisFilteredList: Array<ICDEmergencyDiseaseGroup> = Array<ICDEmergencyDiseaseGroup>();
  public icdDiseaseGroupList: Array<ICDEmergencyDiseaseGroup> = new Array<ICDEmergencyDiseaseGroup>();
  public tempFilterList: Array<any> = Array<any>();

  public SelectedDoctorId: number = null;
  public selectedPatient: any = null;
  public providerList: any;
  public selectedDoctor: any;
  public selectedIcdCode: any;
  public diagnosisStatus: string = 'all';
  // public selectedDiagnosisICD10Code: any =null;
  public selectedDiagnosisICDCode: any;
  public selectedReportingGroupId: number = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  IcdVersionDisplayName: string = null;
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
    this.gridColumns = MRGridColumnSettings.EmergencypatientList;
    this.dateRange = "last3Months";
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('VisitDate', false));
    this.GetProviderList();
    this.GetICDEmergencyReportingGroup();
    this.GetICDEmergencyDiseaseGroup();
    this.OnReportingGroupChange();
    if (this.fromDate != null && this.toDate != null) {
      this.GetAllEmergencypatientList();
    }
    //  this.FilterList('departId');

    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('VisitDate', false));
    this.IcdVersionDisplayName = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "IcdVersionDisplayName").ParameterValue;
  }


  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;

    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetAllEmergencypatientList();

      } else {
        this.msgBoxServ.showMessage("failed", ['Please enter valid From date and To date']);
      }

    }
  }

  public GetAllEmergencypatientList() {
    //clear the old  data
    this.EmergencypatientList = [];
    this.filteredEmergencypatientList = [];
    this.finalFilteredEmergencypatientList = [];
    this.medicalRecordsBLService.GetEmergencypatientList(this.fromDate, this.toDate).subscribe(res => {
      if (res.Status == 'OK') {
        this.EmergencypatientList = res.Results;
        // this.finalFiltered EmergencypatientList = this. EmergencypatientList;
        this.filteredEmergencypatientList = this.EmergencypatientList;
        // this.FilterDiagnosisList();
        this.FilterList();
      } else {
        this.msgBoxServ.showMessage("Failed", ['Error Occured while getting Outpatinet List. Please Try again Later']);
      }
    });
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

  GetICDEmergencyReportingGroup() {
    this.mrBLService.GetICDReportingGroupForEmergency().subscribe(
      res => {
        if (res.Status == "OK") {
          this.icdReportingGroupList = res.Results;
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

  GetICDEmergencyDiseaseGroup() {
    this.mrBLService.GetICDDiseaseGroupForEmergency().subscribe(
      res => {
        if (res.Status == "OK") {
          this.icdDiseaseGroupList = res.Results;
          this.icdDiagnosisFilteredList = this.icdDiagnosisList = this.icdDiseaseGroupList;
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


  public OnReportingGroupChange() {
    this.icdDiagnosisFilteredList = []
    if (this.selectedReportingGroupId == null) {
      this.icdDiagnosisFilteredList = this.icdDiagnosisList;
    }
    else {
      this.icdDiseaseGroupList.forEach(a => {
        if (a.EMER_ReportingGroupId == this.selectedReportingGroupId) {
          this.icdDiagnosisFilteredList.push(a);
        }
      });
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
      this.GetAllEmergencypatientList();
    }
  }

  FilterList(drId: number = null) {

    drId = this.selectedDoctor != null ? this.selectedDoctor.EmployeeId : null;

    if (drId) {
      // this.FilterDiagnosisList('');
      this.filteredEmergencypatientList = this.EmergencypatientList.filter(a =>
        a.PerformerId == drId
      );
      this.finalFilteredEmergencypatientList = this.filteredEmergencypatientList;
    }

    else {
      this.filteredEmergencypatientList = this.EmergencypatientList;
    }

    this.FilterDiagnosisList();

  }
  FilterDiagnosisList() {
    //Case 1: If Diagnosis is complete 
    if (this.diagnosisStatus == 'complete') {
      this.tempFilterList = this.filteredEmergencypatientList.filter(a =>
        a.FinalDiagnosisCount != 0)
      if (this.tempFilterList.length == 0) {
        this.finalFilteredEmergencypatientList = this.tempFilterList;
      }

    }
    else if (this.diagnosisStatus == 'pending') {
      this.tempFilterList = this.filteredEmergencypatientList.filter(a =>
        a.FinalDiagnosisCount == 0)
      if (this.tempFilterList.length == 0) {
        this.finalFilteredEmergencypatientList = this.tempFilterList;
      }
    }

    else {
      this.tempFilterList = this.filteredEmergencypatientList;
    }
    this.FilterDiagnosisPatientsList()
  }
  providerListFormatter(data: any): string {
    let html = `${data["FullName"]}`;
    return html;

  }

  DignosisFormatter(data: any): string {
    let html1 = data["ICDCode"] + " | " + data["EMER_DiseaseGroupName"];
    return html1;
  }
  FilterDiagnosisPatientsList() {

    if (this.tempFilterList.length > 0) {
      if (!this.selectedDiagnosisICDCode || this.selectedDiagnosisICDCode == null) {
        this.finalFilteredEmergencypatientList = this.tempFilterList;

      }
      else {
        // 
        this.OnReportingGroupChange();
        this.finalFilteredEmergencypatientList = this.tempFilterList.filter(
          oplist => {
            let hasCode: boolean = false;
            if (oplist.FinalDiagnosis && oplist.FinalDiagnosis.length > 0) {
              oplist.FinalDiagnosis.forEach(fd => {

                if (fd.ICDCode === this.selectedDiagnosisICDCode.ICDCode) {
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
