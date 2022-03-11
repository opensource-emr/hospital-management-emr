import { Component, Output, EventEmitter, Input, OnInit } from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ICD10 } from "../../../clinical/shared/icd10.model";
import { MR_BLService } from "../../shared/mr.bl.service";
import { FinalDiagnosisModel } from "./final-diagnosis.model";
import { MedicalRecordService } from "../../shared/medical-record.service";

@Component({
    selector: "add-final-diagnosis",
    templateUrl: "./add-final-diagnosis.component.html"
})
export class AddFinalDiagnosisComponent implements OnInit {

    @Input("SelectedPatient")
    public SelectedPatient: any;

    public FinalDiagnosisList: Array<FinalDiagnosisModel> = new Array<FinalDiagnosisModel>();

    @Output("CallBack")
    public emitter: EventEmitter<object> = new EventEmitter<object>();

    public IsEditMode: boolean = false;
    public loading: boolean = false;
    public SelectedICD10List: Array<ICD10> = new Array<ICD10>();
    public ICD10ReportingGroupList: Array<any> = Array<any>();
    public ICD10DiseaseGroupList: Array<any> = Array<any>();
    public diagnosis: any;
    public SelectedReportingGroupId: number = 0;
    public icd10List: Array<any> = Array<any>();
    public ICD10MainList: Array<any> = Array<any>();
    // public diagnosis: ICD10 = new ICD10();
    constructor(public mrBLService: MR_BLService,
        public msgBoxServ: MessageboxService,
        public MrService: MedicalRecordService) {
        this.GetICD10ReportingGroup();
        this.GetICD10DiseaseGroup();
        this.GetICDList();
    }

    ngOnInit() {

        if (this.SelectedPatient && this.SelectedPatient.PatientId && this.SelectedPatient.PatientVisitId) {
            this.LoadExistingDiagnosis();
        }
    }


    public LoadExistingDiagnosis() {
        this.mrBLService.GetOutpatientDiagnosisByVisitId(this.SelectedPatient.PatientId, this.SelectedPatient.PatientVisitId).subscribe(res => {
            if (res.Status = "OK") {
                // var tempData: Array<FinalDiagnosisModel> = new Array<FinalDiagnosisModel>();
                // tempData = res.Results;
                if (res.Results && res.Results.length > 0) {
                    this.SelectedICD10List = res.Results;
                    this.IsEditMode = true;
                }
            }
        })
    }
    public Submit() {
        this.loading = true;
        if (this.ICD10MainList && this.ICD10MainList.length > 0) { // we need ICD10CodeId from Master List, therefore we cannot make any post without it.
            this.AssignData();
            this.PostFinalDiagnosis();
        }else{
            this.msgBoxServ.showMessage("Warning",["No ICD10 Master Data found!"]);
            this.loading = false;
        }
    }

    public AssignData() {
        if (this.SelectedICD10List.length > 0) {
            this.SelectedICD10List.forEach(a => {
                let temp = this.ICD10MainList.find(b => a.ICD10Code == b.ICD10Code);
                if (temp) {
                    let finalDiagnosis: FinalDiagnosisModel = new FinalDiagnosisModel();
                    finalDiagnosis.PatientId = this.SelectedPatient.PatientId;
                    finalDiagnosis.PatientVisitId = this.SelectedPatient.PatientVisitId;
                    finalDiagnosis.ICD10ID = temp.ICD10ID;
                    this.FinalDiagnosisList.push(finalDiagnosis);
                }
            });
        }
    }

    public PostFinalDiagnosis() {

        this.mrBLService.PostFinalDiagnosis(this.FinalDiagnosisList).subscribe(res => {
            if (res.Status == "OK") {
                this.loading = false;
                let msg: string = "Final Diagnosis";
                if (!this.IsEditMode) msg = " Added Sucessfully";
                else msg = msg + " Updated Sucessfully";

                this.msgBoxServ.showMessage("Success", [msg]);

                this.emitter.emit({ Close: false, Add: true, Edit: false });
            } else {
                this.loading = false;
            }
        })
    }
    public Close() {
        // let hasAddedCertificate : boolean = false;

        if (this.SelectedICD10List.length > 0) {
            if (confirm("Do you want to discard added final diagnosis?")) {
                this.SelectedICD10List = [];
                this.emitter.emit({ Close: true, Add: false, Edit: false });
            }
            // else do nothing
        } else {
            this.FinalDiagnosisList = [];
            this.emitter.emit({ Close: true, Add: false, Edit: false });
        }
    }

    public GetICD10ReportingGroup() {
        this.mrBLService.GetICD10ReportingGroup().subscribe(res => {
            if (res.Status == "OK") {
                this.ICD10ReportingGroupList = res.Results;
            }
        });
    }

    public GetICD10DiseaseGroup() {
        this.mrBLService.GetICD10DiseaseGroup().subscribe(res => {
            if (res.Status == "OK") {
                this.ICD10DiseaseGroupList = res.Results;
            }
        })
    }

    RemoveDiagnosis(i) {
        let temp: Array<any> = this.SelectedICD10List;
        this.SelectedICD10List = [];
        this.SelectedICD10List = temp.filter((d, index) => index != i)
    }

    public MakeDiagnosisList() {
        if (this.diagnosis != undefined && typeof (this.diagnosis) != "string") {
            if (this.SelectedICD10List.length > 0) {
                let temp: Array<any> = this.SelectedICD10List;
                let isICDDuplicate: boolean = false;


                if (temp.some(d => d.ICD10Code == this.diagnosis.ICD10Code)) {
                    isICDDuplicate = true;
                    alert(`${this.diagnosis.ICD10Description} Already Added !`);
                    this.diagnosis = undefined;

                }
                if (isICDDuplicate == false) {
                    {
                        this.SelectedICD10List.push(this.diagnosis);
                        this.diagnosis = undefined;
                    }
                }
            } else {
                this.SelectedICD10List.push(this.diagnosis);
                this.diagnosis = undefined;
            }
        } else if (typeof (this.diagnosis) == 'string') {
            this.loading = false;
            alert("Enter Valid ICD10 !");
        }


    }

    // loadICDs() {
    //     // this.CurrentDischargeSummary.Diagnosis = this.diagnosis ? this.diagnosis.icd10Description : null;
    // }

    DignosisFormatter(data: any): string {
        let html = data["ICD10Code"] + " | " + data["ICD10Description"];
        return html;
    }

    public GetICDList() {
        if (this.MrService.icd10List && this.MrService.icd10List.length > 0) {
            this.ICD10MainList = this.MrService.icd10List;
            this.icd10List = this.MrService.icd10List;
        }
    }

    public OnReportingGroupChange(reportingGrpId: number) {
        // let reportingGrpId: number = this.SelectedReportingGroupId;

        if (reportingGrpId && reportingGrpId == 0) {
            this.icd10List = [];
            this.icd10List = this.ICD10MainList;
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

}