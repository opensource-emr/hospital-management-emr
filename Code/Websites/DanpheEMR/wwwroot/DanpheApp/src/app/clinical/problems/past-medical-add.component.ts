import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';
import { ProblemsBLService } from '../shared/problems.bl.service';
import { PatientService } from "../../patients/shared/patient.service";
import { CallbackService } from '../../shared/callback.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ActiveMedical } from "../shared/active-medical.model";
import { ICD10 } from '../shared/icd10.model';
import * as moment from 'moment/moment';
import { PastMedical } from "../shared/past-medical.model";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { DanpheCache, MasterType } from "../../shared/danphe-cache-service-utility/cache-services";

@Component({
    selector: "past-medical-add",
    templateUrl: "./past-medical-add.html"
})

export class PastMedicalAddComponent {
    public ICD10List = [];
    public icd10Selected: { ICD10Code, ICD10Description };
    public selectedIndex: number = null;
    public loading: boolean = false;

    public addPastProblemBox: boolean = false; //add box

    @Input("selected-past-medical")
    public CurrentPastProblem: PastMedical = new PastMedical();

    @Output("callback-addupdate")
    public callbackAddUpdate: EventEmitter<Object> = new EventEmitter<Object>();

    public PastProblems: Array<PastMedical> = new Array<PastMedical>();

    constructor(public patientService: PatientService,
        public callbackService: CallbackService,
        public router: Router,
        public problemsBLService: ProblemsBLService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService) {
        this.GetICDList();
        this.Initialize();
    }

    @Input("show-past-medical-add")
    public set ViewPage(_viewPage: boolean) {
        //edit
        if (_viewPage && this.CurrentPastProblem) {
            if (this.CurrentPastProblem && this.CurrentPastProblem.PatientProblemId) {
                var pastMedicine = new PastMedical();
                pastMedicine = Object.assign(pastMedicine, this.CurrentPastProblem);
                this.Initialize();
                this.CurrentPastProblem = pastMedicine;
                this.CurrentPastProblem.OnSetDate = moment(this.CurrentPastProblem.OnSetDate).format('YYYY-MM-DD');
                this.MapSelectedICD();
            }
            //add
            else {
                this.Initialize();
            }
            this.addPastProblemBox = true;
        }
        else {
            this.addPastProblemBox = false;
        }
    }
    Initialize() {
        this.icd10Selected = null;
        this.CurrentPastProblem = new PastMedical();
        this.CurrentPastProblem.PatientId = this.patientService.getGlobal().PatientId;

        this.CurrentPastProblem.OnSetDate = moment(new Date()).format('YYYY-MM-DD');
        this.CurrentPastProblem.ResolvedDate = moment(new Date()).format('YYYY-MM-DD');
    }
    public MapSelectedICD() {
        let icd = this.ICD10List.find(a => a.ICD10Code == this.CurrentPastProblem.ICD10Code);
        if (icd)
            this.icd10Selected = icd;
    }


    //getting ICD list
    public GetICDList() {
		this.ICD10List = DanpheCache.GetData(MasterType.ICD,null);
        // this.problemsBLService.GetICDList()
            // .subscribe(res => {
                // if (res.Status == "OK") {
                    // this.ICD10List = res.Results;
                // }
                // else {
                    // this.msgBoxServ.showMessage("failed", ["Failed ! "], res.ErrorMessage);

                // }
            // });
    }

    public ValidationCheck(): boolean {
        //marking every fields as dirty and checking validity
        for (var i in this.CurrentPastProblem.PastMedicalValidator.controls) {
            this.CurrentPastProblem.PastMedicalValidator.controls[i].markAsDirty();
            this.CurrentPastProblem.PastMedicalValidator.controls[i].updateValueAndValidity();
        }
        //if valid then call the BL service to do put request.
        if (this.CurrentPastProblem.IsValidCheck(undefined, undefined) == true && this.CheckICDSelected()) {
            return true;
        }
        else
            return false;

    }
    //post past medical.
    AddPastMedical(): void {
        if (!this.loading && this.ValidationCheck()) {
            this.loading = true;
            this.problemsBLService.PostPastMedical(this.CurrentPastProblem)
                .subscribe(
                    res => {
                        this.loading = false;
                        if (res.Status == "OK") {
                            if (res.Results) {
                                this.CurrentPastProblem.CreatedOn = res.Results.CreatedOn;
                                this.CurrentPastProblem.PatientProblemId = res.Results.PatientProblemId;
                                this.ClosePastMedicalBox(this.CurrentPastProblem);
                                this.msgBoxServ.showMessage("success", ["Added successfully"]);
                            }
                            else {
                                this.msgBoxServ.showMessage("failed", ['Unable to Add.']);
                            }
                        }
                    });
        }
    }

    ClosePastMedicalBox(_selectedPastProblem = null) {
        this.callbackAddUpdate.emit({ "pastMedical": _selectedPastProblem });
        this.addPastProblemBox = false;

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
            this.CurrentPastProblem.ICD10Code = this.icd10Selected.ICD10Code;
            this.CurrentPastProblem.ICD10Description = this.icd10Selected.ICD10Description;
        }
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
}