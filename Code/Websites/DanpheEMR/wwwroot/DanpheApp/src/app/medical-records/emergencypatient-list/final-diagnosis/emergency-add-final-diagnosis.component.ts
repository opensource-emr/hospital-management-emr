import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ICD10 } from '../../../clinical/shared/icd10.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { ICDEmergencyDiseaseGroup, ICDEmergencyReportingGroup } from '../../shared/emer-disease-and-reporting-group-VM';
import { MedicalRecordService } from '../../shared/medical-record.service';
import { MR_BLService } from '../../shared/mr.bl.service';
import { EmergencyFinalDiagnosisModel } from '../emergency-final-diagnosis.model';

@Component({
  selector: 'app-emergency-add-final-diagnosis',
  templateUrl: './emergency-add-final-diagnosis.component.html',
  styleUrls: ['./emergency-add-final-diagnosis.component.css']
})
export class EmergencyAddFinalDiagnosisComponent implements OnInit {

  @Input("SelectedPatient")
  selectedPatientDetails: any;


  @Input("AllIcdDiseaseGroup")
  allIcdDiseaseGroupList: Array<ICDEmergencyDiseaseGroup> = [];

  @Input("AllIcdReportingGroup")
  allIcdReportingGroupList: Array<ICDEmergencyReportingGroup> = [];
  @Input("IcdVersionDisplayName")
  IcdVersionDisplayName: string = null
  @Output("CallBack")
  public emitter: EventEmitter<object> = new EventEmitter<object>();

  public masterICDList: Array<ICD10> = new Array<ICD10>();
  public diagnosis: any
  public icdDiagnosisFilteredList: Array<ICDEmergencyDiseaseGroup> = [];
  public selectedReportingGroupId: number = 0;
  public isPatientReferred: boolean = false;
  public isEditMode: boolean = false;
  public isDuplicateICD: boolean = false;
  public loading: boolean = false;
  public referredBy: string = null;
  public selectedICDList: Array<ICDEmergencyDiseaseGroup> = new Array<ICDEmergencyDiseaseGroup>();
  public referredTo: string = null;
  public finalDiagnosisList: Array<EmergencyFinalDiagnosisModel> = new Array<EmergencyFinalDiagnosisModel>();

  constructor(public mrService: MedicalRecordService, public msgService: MessageboxService, public mrBLService: MR_BLService) {
    this.GetMasterICDList();
  }

  ngOnInit() {
    this.icdDiagnosisFilteredList = this.allIcdDiseaseGroupList;
    if (this.selectedPatientDetails.FinalDiagnosisCount > 0) {
      this.LoadExistingDiagnosis();
      this.isEditMode = true;
    }
  }

  public Close() {
    // if (this.SelectedICD10List.length > 0) {
    //     if (confirm("Do you want to discard added final diagnosis?")) {
    //         this.SelectedICD10List = [];
    //         this.emitter.emit({ Close: true, Add: false, Edit: false });
    //     }
    //     // else do nothing
    // } else {
    // this.FinalDiagnosisList = [];
    this.emitter.emit({ Close: true, Add: false, Edit: false });
    // }
  }
  public GetMasterICDList() {
    if (this.mrService.icd10List && this.mrService.icd10List.length > 0) {
      this.masterICDList = this.mrService.icd10List;
      // this.icd10List = this.MrService.icd10List;
    }
    else {
      this.msgService.showMessage(ENUM_MessageBox_Status.Error, ['Unable to get ICD Code List']);
    }
  }
  public OnReportingGroupChange($event) {
    this.icdDiagnosisFilteredList = []
    // this.selecte
    if (this.selectedReportingGroupId == 0) {
      this.icdDiagnosisFilteredList = this.allIcdDiseaseGroupList;
    }
    else {
      this.allIcdDiseaseGroupList.forEach(a => {
        if (a.EMER_ReportingGroupId == this.selectedReportingGroupId) {
          this.icdDiagnosisFilteredList.push(a);
        }
      });
    }
  }
  MakeDiagnosisList() {
    this.isDuplicateICD = false;
    if (this.diagnosis != undefined && typeof (this.diagnosis) != "string") {
      if (this.selectedICDList.length > 0) {
        let tempData = this.selectedICDList;
        if (tempData.some(d => d.EMER_DiseaseGroupId == this.diagnosis.EMER_DiseaseGroupId)) {
          this.isDuplicateICD = true;
          alert(this.diagnosis.EMER_DiseaseGroupName + "is already added !!");
        }
        else {
          this.selectedICDList.push(this.diagnosis);
        }
        this.diagnosis = undefined;
      }
      else {
        this.selectedICDList.push(this.diagnosis);
        this.diagnosis = undefined;
      }
    }
    else if (typeof (this.diagnosis) == 'string') {
      this.loading = false;
      alert("Enter Valid ICD Code !");
    }
  }
  RemoveDiagnosis(i: number) {
    this.selectedICDList.splice(i, 1);
  }
  PatientReferredChange() {
    if (this.isPatientReferred == false) {
      this.referredBy = null;
      this.referredTo = null;
    }
  }
  public LoadExistingDiagnosis() {
    this.mrBLService.GetEmergencyPatientDiagnosisByVisitId(this.selectedPatientDetails.PatientId, this.selectedPatientDetails.PatientVisitId).subscribe(res => {
      if (res.Status = "OK") {
        if (res.Results && res.Results.length > 0) {
          this.selectedICDList = res.Results;
          this.isEditMode = true;
          this.isPatientReferred = this.selectedICDList[0].IsPatientReferred;
          this.referredBy = this.selectedICDList[0].ReferredBy;
          this.referredTo = this.selectedICDList[0].ReferredTo;
        }
      }
    })
  }
  public AssignData() {
    if (this.selectedICDList.length > 0) {
      this.finalDiagnosisList = [];
      this.selectedICDList.forEach(a => {
        let temp = this.allIcdDiseaseGroupList.find(b => b.ICDCode == a.ICDCode && a.EMER_DiseaseGroupId == b.EMER_DiseaseGroupId);
        if (temp) {
          let finalDiagnosis: EmergencyFinalDiagnosisModel = new EmergencyFinalDiagnosisModel();
          finalDiagnosis.PatientId = this.selectedPatientDetails.PatientId;
          finalDiagnosis.PatientVisitId = this.selectedPatientDetails.PatientVisitId;
          finalDiagnosis.EMER_DiseaseGroupId = temp.EMER_DiseaseGroupId;
          finalDiagnosis.IsPatientReferred = this.isPatientReferred;
          finalDiagnosis.ReferredBy = this.referredBy;
          finalDiagnosis.ReferredTo = this.referredTo;
          this.finalDiagnosisList.push(finalDiagnosis);
        }
      });
    }

  }

  public PostFinalDiagnosis() {

    this.mrBLService.PostFinalDiagnosisForEmergencyPatient(this.finalDiagnosisList).subscribe(res => {
      if (res.Status == "OK") {
        let msg: string = "Final Diagnosis";
        if (!this.isEditMode) msg = " Added Sucessfully";
        else msg = msg + " Updated Sucessfully";

        this.msgService.showMessage(ENUM_MessageBox_Status.Success, [msg]);

        this.emitter.emit({ Close: false, Add: true, Edit: false });
      }
      this.loading = false;
    });
  }
  Submit() {
    this.loading = true;
    this.AssignData();
    if (this.finalDiagnosisList.length == this.selectedICDList.length) {
      this.PostFinalDiagnosis();
    }
    else {
      this.msgService.showMessage(ENUM_MessageBox_Status.Failed, ['Unable to Post Final Diagnosis. Please Check Console Error.']);
      console.log("ICD Code Mismatch between Master ICD and Disease Group.")
    }
    this.loading = false;
  }
  DignosisFormatter(data): string {
    let html = data["ICDCode"] + " | " + data["EMER_DiseaseGroupName"];
    return html;
  }
}
