import { Component, Input } from "@angular/core";
import { ICD10 } from "../../../clinical/shared/icd10.model";
import { CoreService } from "../../../core/shared/core.service";
import { MR_BLService } from "../../../medical-records/shared/mr.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses } from "../../../shared/shared-enums";
import { DiseaseGroup_DTO } from "../dto/disease-group.dto";
import { ReportingGroup_DTO } from "../dto/reporting-group.dto";
import { NursingBLService } from "../nursing.bl.service";


@Component({
  selector: 'nursing-add-diagnosis',
  templateUrl: './nursing-add-diagnosis.component.html'
})
export class NursingAddDiagnosisComponent {

  @Input('add-diagnosis')
  public selectedReportingGroupId: number = null;
  @Input("patient-id")
  public patientId: number = 0;
  @Input("patient-visit-id")
  public patientVisitId: number = 0;
  public selectedDiagnosisICDCode: string = '';
  IcdVersionDisplayName: string = "";
  public ICD10ReportingGroupList: Array<ReportingGroup_DTO> = Array<ReportingGroup_DTO>();
  public SelectedReportingGroupId: number = 0;
  public icd10List: Array<{ ICD10Code: string, ICD10Description: string }> = Array<{ ICD10Code: string, ICD10Description: string }>();
  public ICD10DiseaseGroupList: Array<DiseaseGroup_DTO> = Array<DiseaseGroup_DTO>();
  public SelectedICD10List: Array<ICD10> = new Array<ICD10>();
  public diagnosis: ICD10;
  public IsEditMode: boolean = false;
  public IsPatientReferred: boolean = false;
  public ReferredBy: string;
  public loading: boolean = false;

  constructor(
    public messageBoxService: MessageboxService,
    public mrBLService: MR_BLService,
    private nursingBlService: NursingBLService,
    private coreService: CoreService,
  ) {

    this.GetICD10ReportingGroup();
    this.GetICD10DiseaseGroup();
  }
  ngOnInit() {

    if (this.patientId && this.patientVisitId) {
      this.LoadExistingDiagnosis();
      this.IcdVersionDisplayName = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "IcdVersionDisplayName").ParameterValue;
    }
  }

  public GetICD10ReportingGroup() {
    this.mrBLService.GetICD10ReportingGroup().subscribe(res => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.ICD10ReportingGroupList = res.Results;
      }
    });
  }
  public GetICD10DiseaseGroup() {
    this.mrBLService.GetICD10DiseaseGroup().subscribe(res => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.ICD10DiseaseGroupList = res.Results;
        this.ICD10DiseaseGroupList.forEach
          (a => this.icd10List.push({ ICD10Code: a.ICDCode, ICD10Description: a.DiseaseGroupName }));
      }
    })
  }
  public OnReportingGroupChange(reportingGrpId: number) {

    if (reportingGrpId && reportingGrpId == 0) {
      this.icd10List = [];
      this.ICD10DiseaseGroupList.forEach(a =>
        this.icd10List.push({ ICD10Code: a.ICDCode, ICD10Description: a.DiseaseGroupName }));
    }
    else if (reportingGrpId && reportingGrpId > 0 && this.ICD10DiseaseGroupList && this.ICD10DiseaseGroupList.length > 0) {
      this.icd10List = [];

      this.ICD10DiseaseGroupList.forEach(a => {
        if (a.ReportingGroupId == reportingGrpId) {
          this.icd10List.push({ ICD10Code: a.ICDCode, ICD10Description: a.DiseaseGroupName });
        }
      });
    }
  }

  public LoadExistingDiagnosis() {
    this.mrBLService.GetOutpatientDiagnosisByVisitId(this.patientId, this.patientVisitId).subscribe(res => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {

        if (res.Results && res.Results.length > 0) {
          this.SelectedICD10List = res.Results;
          this.IsEditMode = true;
          this.IsPatientReferred = this.SelectedICD10List[0].IsPatientReferred;
          this.ReferredBy = this.SelectedICD10List[0].ReferredBy;
        }
      }
    })
  }
  DiagnosisFormatter(data: any): string {
    let html = data["ICD10Code"] + " | " + data["ICD10Description"];
    return html;
  }

  MakeDiagnosisList() {
    if (this.diagnosis !== undefined && typeof (this.diagnosis) != "string") {
      if (this.SelectedICD10List.length > 0) {
        let temp: Array<any> = this.SelectedICD10List;
        let isICDDuplicate: boolean = false;

        if (temp.some(d => d.ICD10Code === this.diagnosis.ICD10Code)) {
          isICDDuplicate = true;
          alert(`${this.diagnosis.ICD10Description} Already Added !`);

        }
        if (isICDDuplicate === false) {
          {
            this.SelectedICD10List.push(this.diagnosis);
            this.nursingBlService.AddDiagnosisSelectedList(this.SelectedICD10List);
          }
        }
      } else {
        this.SelectedICD10List.push(this.diagnosis);
        this.nursingBlService.AddDiagnosisSelectedList(this.SelectedICD10List);
      }
      this.diagnosis = undefined;
    } else if (typeof (this.diagnosis) === 'string') {
      this.loading = false;
      alert("Enter Valid ICD10 !");
    }
  }
  RemoveDiagnosis(i) {
    let temp: Array<ICD10> = this.SelectedICD10List;
    this.SelectedICD10List = [];
    this.SelectedICD10List = temp.filter((d, index) => index != i)
    this.nursingBlService.AddDiagnosisSelectedList(this.SelectedICD10List);
  }

  discardAddDiagnosisInput(discardInput) {
    if (discardInput && discardInput === true) {
      this.SelectedReportingGroupId = 0;
      this.icd10List = [];
    }

  }
}
