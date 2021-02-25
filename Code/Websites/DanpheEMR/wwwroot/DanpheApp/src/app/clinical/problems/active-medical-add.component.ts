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
    selector: "active-medical-add",
    templateUrl: "./active-medical-add.html"
})

export class ActiveMedicalAddComponent {
    public ICD10List = [];
    public icd10Selected: { ICD10Code, ICD10Description };
    public selectedIndex: number = null;
    public loading: boolean = false;
    public addActiveProblemBox: boolean = false;

    @Input("selected-active-medical")
    public CurrentProblem: ActiveMedical = new ActiveMedical();

    @Output("callback-addupdate")
    public callbackAddUpdate: EventEmitter<Object> = new EventEmitter<Object>();

    public problems: Array<ActiveMedical> = new Array<ActiveMedical>();
    public icd10Edited: ICD10 = null;

    constructor(public patientService: PatientService,
        public callbackService: CallbackService,
        public router: Router,
        public problemsBLService: ProblemsBLService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService) {
        this.CurrentProblem.OffNoteValidator("Note");    
        this.GetICDList();
        this.Initialize();
    }

    @Input("show-active-medical-add")
    public set ViewPage(_viewPage: boolean) {
        //edit
        if (_viewPage && this.CurrentProblem) {
            if (this.CurrentProblem.PatientProblemId) {
                var activeMedicine = new ActiveMedical();
                activeMedicine = Object.assign(activeMedicine, this.CurrentProblem);
                this.CurrentProblem = activeMedicine;
                this.CurrentProblem.OnSetDate = moment(this.CurrentProblem.OnSetDate).format('YYYY-MM-DD');
                this.MapSelectedICD();
            }
            //add
            else {
                this.Initialize();
            }
            this.addActiveProblemBox = true;
        }
        else {
            this.addActiveProblemBox = false;
        }
    }
    Initialize() {
        this.icd10Selected = null;
        this.CurrentProblem.PatientId = this.patientService.getGlobal().PatientId;
        this.CurrentProblem.OnSetDate = moment(new Date()).format('YYYY-MM-DD');
    }
    public MapSelectedICD() {
        this.icd10Selected = null;
        this.changeDetector.detectChanges();
        let icd = this.ICD10List.find(a => a.ICD10Code == this.CurrentProblem.ICD10Code);
        if (icd)
            this.icd10Selected = icd;
    }
 
    public GetICDList() {
		 this.ICD10List = DanpheCache.GetData(MasterType.ICD,null);
        // this.problemsBLService.GetICDList()
        //     .subscribe(res => {
        //         if (res.Status == "OK") {
        //             this.ICD10List = res.Results;
        //         }
        //         else {
        //             this.msgBoxServ.showMessage("failed", ["Failed ! "], res.ErrorMessage);

        //         }
        //     });
    }

    //for saving and adding
    SaveActiveMedical() {
        if (!this.loading) {
            //getting Medicine code and medicine description
            if (this.icd10Selected) {
                this.CurrentProblem.ICD10Code = this.icd10Selected.ICD10Code;
                this.CurrentProblem.ICD10Description = this.icd10Selected.ICD10Description;
            }
            //checking validation
            for (var i in this.CurrentProblem.ActiveMedicalValidator.controls) {
                this.CurrentProblem.ActiveMedicalValidator.controls[i].markAsDirty();
                this.CurrentProblem.ActiveMedicalValidator.controls[i].updateValueAndValidity();
            }

            if (this.CurrentProblem.IsValidCheck(undefined, undefined) == true && this.CheckICDSelected()) {
                this.loading = true;
                if (this.CurrentProblem.PatientProblemId) {
                    this.Update();
                }
                else {
                    this.AddActiveMedical();
                }
            }
        }
    }

    //post new active medical
    AddActiveMedical(): void {
        this.CurrentProblem.PatientId = this.patientService.getGlobal().PatientId;
        this.loading = false;

        this.problemsBLService.PostActiveMedical(this.CurrentProblem)
            .subscribe(
                res => {
                    if (res.Status == "OK") {
                        if (res.Results) {
                            this.CurrentProblem.CreatedOn = res.Results.CreatedOn;
                            this.CurrentProblem.PatientProblemId = res.Results.PatientProblemId;
                            this.CallBackAddUpdateProblem(this.CurrentProblem);
                            this.msgBoxServ.showMessage("success", ["Added successfully"]);
                            this.Initialize();
                        }
                        else {
                            this.msgBoxServ.showMessage("failed", ['Unable to Add.']);
                        }
                    }
                });
    }

    public Update() {
        this.problemsBLService.PutActiveMedical(this.CurrentProblem)
            .subscribe(
                res => {
                    this.loading = false;
                    if (res.Status == "OK") {
                        this.CallBackAddUpdateProblem(res.Results);
                        this.CurrentProblem = new ActiveMedical();
                        this.msgBoxServ.showMessage("success", ["updated successfully"]);
                           this.Initialize();
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ['Failed. please recheck details.']);
                    }
                });

    }

    CallBackAddUpdateProblem(_selectedActiveProblem) {
        this.CurrentProblem = new ActiveMedical();
        this.icd10Selected = null;
        this.callbackAddUpdate.emit({ "activeMedical": _selectedActiveProblem });
    }

    //-----duplicate-----//
    //CallBackAddUpdateProblem(res) {
    //    this.loading = false;
    //    if (res.Status == "OK") {
    //        this.CurrentProblem.PatientProblemId = res.Results.PatientProblemId;
    //        this.problems.push(this.CurrentProblem);
    //        this.Initialize();
    //        this.CurrentProblem.ActiveMedicalValidator.controls["OnSetDate"].setValue[moment().format('YYYY-MM-DD')];
    //        this.changeDetector.detectChanges();
    //        this.msgBoxServ.showMessage("Success", ["New Problem is successfully Added"]);
    //        if (this.callbackService.CallbackRoute != "") {
    //            var _routeName = this.callbackService.CallbackRoute;
    //            this.callbackService.CallbackRoute = "";
    //            this.router.navigate([_routeName]);
    //        }
    //    }
    //    else {
    //        this.msgBoxServ.showMessage("failed", ['Failed. please check log for details.'], res.ErrorMessage);
    //    }
    //}

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
            this.CurrentProblem.ICD10Code = this.icd10Selected.ICD10Code;
            this.CurrentProblem.ICD10Description = this.icd10Selected.ICD10Description;
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