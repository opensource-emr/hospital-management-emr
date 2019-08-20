import { Component, ChangeDetectorRef } from "@angular/core";

import { PatientService } from "../../patients/shared/patient.service";
import { ProblemsBLService } from '../shared/problems.bl.service';

import { MessageboxService } from '../../shared/messagebox/messagebox.service';

import { PastMedical } from "../shared/past-medical.model";
import { ICD10 } from '../shared/icd10.model';
import * as moment from 'moment/moment';
import { DanpheCache, MasterType } from "../../shared/danphe-cache-service-utility/cache-services";

@Component({
    templateUrl: "../../view/clinical-view/PastMedical.html" // "/ClinicalView/PastMedical"
})
export class PastMedicalComponent {
    public pastMedicals: Array<PastMedical> = new Array<PastMedical>();
    public PastMedical: PastMedical = new PastMedical();
    icd10Selected: ICD10;
    public updateButton: boolean = false;
    public selectedIndex: number = null;
    public loading: boolean = false;
    public ICD10List = [];
    constructor(public patientServ: PatientService,
        public problemsBLService: ProblemsBLService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService) {
        this.GetPatientPastMedicalList();
        this.GetICDList();
    }
    public Initialize() {
        this.PastMedical = new PastMedical();
        this.PastMedical.OnSetDate = moment(new Date()).format('YYYY-MM-DD');
        this.PastMedical.ResolvedDate = moment(new Date()).format('YYYY-MM-DD');
    }

    public GetICDList() {
		this.ICD10List = DanpheCache.GetData(MasterType.ICD,null);
        // this.problemsBLService.GetICDList()
            // .subscribe(res => {
                // if (res.Status == "OK") {
                    // this.ICD10List = res.Results;;
                // }
                // else {
                    // this.msgBoxServ.showMessage("failed", ["Failed ! "], res.ErrorMessage);

                // }
            // });
    }

    GetPatientPastMedicalList(): void {
        let patientId = this.patientServ.getGlobal().PatientId;
        this.problemsBLService.GetPatientPastMedicalList(patientId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.pastMedicals = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("failed", ['Failed'], res.ErrorMessage);
                   
                }
            });
    }


    SetAsActive(_past: PastMedical) {
        this.problemsBLService.SetAsActive(_past)
            .subscribe(res => {
                this.msgBoxServ.showMessage("success", ["Problem added to the active list"]);
            });
    }

    //post past medical.
    AddPastMedical(): void {
        if (!this.loading) {
            //marking every fields as dirty and checking validity
            for (var i in this.PastMedical.PastMedicalValidator.controls) {
                this.PastMedical.PastMedicalValidator.controls[i].markAsDirty();
                this.PastMedical.PastMedicalValidator.controls[i].updateValueAndValidity();
            }
            //if valid then call the BL service to do put request.
            if (this.PastMedical.IsValidCheck(undefined, undefined) && this.CheckICDSelected()) {
                this.loading = true;
                this.PastMedical.PatientId = this.patientServ.getGlobal().PatientId;

                this.problemsBLService.PostPastMedical(this.PastMedical)
                    .subscribe(res => this.CallBackAddPastMedical(res),
                    err => { this.msgBoxServ.showMessage("error", [err.ErrorMessage]); });
            }
        }
        
    }
    //call back function for post past medical
    CallBackAddPastMedical(res) {
        this.loading = false;
        this.PastMedical.PatientProblemId = res.Results.PatientProblemId;
        this.pastMedicals.push(this.PastMedical);
        this.icd10Selected = null;
        this.PastMedical = new PastMedical();
        this.Initialize();
    }

    //used to format display of item in ng-autocomplete.
    // it will be ICD10Code ICD10Description
    ICDListFormatter(data: any): string {
        let html;
        //if the ICD is not valid for coding then it will be displayed as bold.
        //needs to disable the field that are not valid for coding as well.
        if (!data.ValidForCoding) {
            html = "<b>" + data["ICD10Code"] + "  " + data["ICD10Description"] + "</b>";
        }
        else
            html = data["ICD10Code"] + "  " + data["ICD10Description"];

        return html;
    }

    //enables the update button and assigns the selected pastMedical to the PastMedical.
    public Edit(selPastMedical, selIndex: number) {
        this.selectedIndex = selIndex;
        //setting this to null because it was it was not detecting changes and hence was not able to map to the view.
        this.icd10Selected = null;
        this.PastMedical.OnSetDate = null;
        this.PastMedical.ResolvedDate = null;
        this.changeDetector.detectChanges();
        selPastMedical.OnSetDate = moment(selPastMedical.OnSetDate).format('YYYY-MM-DD');
        selPastMedical.ResolvedDate = moment(selPastMedical.ResolvedDate).format('YYYY-MM-DD');
        this.PastMedical = Object.assign(this.PastMedical, selPastMedical);
        this.MapSelectedICD();
        this.updateButton = true;
    }

    public Update() {
        if (!this.loading) {
           
            for (var i in this.PastMedical.PastMedicalValidator.controls) {
                this.PastMedical.PastMedicalValidator.controls[i].markAsDirty();
                this.PastMedical.PastMedicalValidator.controls[i].updateValueAndValidity();
            }
            //if valid then call the BL service to do put request.
            if (this.PastMedical.IsValidCheck(undefined, undefined)) {
                this.loading = true;
                this.problemsBLService.PutPastMedical(this.PastMedical)
                    .subscribe(
                    res => {
                        this.loading = false;
                        if (res.Status == "OK") {
                            //replacing the selected object with the updated one.
                            this.pastMedicals[this.selectedIndex] = res.Results;
                            this.Initialize();
                            this.updateButton = false;
                            this.msgBoxServ.showMessage("success", ["Updated successfully"]);

                        }
                        else {
                            this.msgBoxServ.showMessage("failed", ['failed to update. please check log for details.'], res.ErrorMessage);

                        }
                    });
            }
        }
        
    }

    public CheckICDSelected(): boolean {
        if (typeof (this.icd10Selected) != 'object') {
            this.icd10Selected = undefined;
            this.msgBoxServ.showMessage("failed", ["Invalid ICD10. Please select from the list."]);
            return false;
        }
        return true;
    }
    public AssignSelectedICD() {
        if (typeof (this.icd10Selected) == 'object') {
            this.PastMedical.ICD10Code = this.icd10Selected.ICD10Code;
            this.PastMedical.ICD10Description = this.icd10Selected.ICD10Description;
        }
    }
    public MapSelectedICD() {
        let icd = this.ICD10List.find(a => a.ICD10Code == this.PastMedical.ICD10Code);
        if (icd)
            this.icd10Selected = icd;
    }

}