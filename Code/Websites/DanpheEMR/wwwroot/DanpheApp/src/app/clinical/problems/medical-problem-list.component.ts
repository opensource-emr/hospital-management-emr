import { Component, ChangeDetectorRef } from "@angular/core";
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

@Component({
    templateUrl: "../../view/clinical-view/MedicalProblemList.html"  //"/ClinicalView/ActiveMedical"
})

export class MedicalProblemListComponent {
    //---------For Active medical----------// 
    public problems: Array<ActiveMedical> = new Array<ActiveMedical>();
    public selectedIndex: number = null;
    public loading: boolean = false;

    public selectedActiveMedical; //@input Active
    public addActiveProblemBox: boolean = false; //@input Active

    //---------For Past medical----------// 
    public pastMedicals: Array<PastMedical> = new Array<PastMedical>();

    public selectedPastMedical; //@input Past
    public addPastProblemBox: boolean = false;  //@input Past
    
    //ng2-autocomplete binds the selected ICD10 to icd10Selected.
    icd10Selected: ICD10 = null;
    public icd10Edited: ICD10 = null;

    public ICD10List = [];
    // public updateButton: boolean = false;
    //CurrentProblem: ActiveMedical = new ActiveMedical();

    constructor(public patientService: PatientService,
        public callbackService: CallbackService,
        public router: Router,
        public problemsBLService: ProblemsBLService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
        //prefilling the OnSetDate as today's date.
        // this.Initialize();
        this.GetPatientPastMedicalList();
        this.GetPatientActiveMedicalList();
    }

    //public Initialize() {
    //    this.selectedActiveMedical = new ActiveMedical();
    //    this.selectedActiveMedical.OnSetDate = moment().format('YYYY-MM-DD');
    //    this.CurrentProblem = new ActiveMedical();
    //    this.CurrentProblem.OnSetDate = moment().format('YYYY-MM-DD');
    //    //this.changeDetector.detectChanges();
    //    this.icd10Selected = null;
    //}

    //public InitializePast() {
    //    this.PastMedical = new PastMedical();
    //    this.PastMedical.OnSetDate = moment(new Date()).format('YYYY-MM-DD');
    //    this.PastMedical.ResolvedDate = moment(new Date()).format('YYYY-MM-DD');
    //}

    public btnActiveProblem() {
        this.selectedIndex = null;
        this.addPastProblemBox = false;
        this.addActiveProblemBox = false; //input add box
        this.changeDetector.detectChanges();
        this.selectedActiveMedical = new ActiveMedical; //refresh for activeProblemBox
        this.addActiveProblemBox = true;
    }

    public ShowPastProblemBox() {
        this.selectedIndex = null;
        this.addPastProblemBox = false;
        this.addActiveProblemBox = false; //input add box
        this.changeDetector.detectChanges();
        this.selectedPastMedical = new PastMedical();
        this.addPastProblemBox = true;
    }

    //get the list of active medical of the selected patient.
    GetPatientActiveMedicalList(): void {
        let patientId = this.patientService.getGlobal().PatientId;
        this.problemsBLService.GetPatientActiveMedicalList(patientId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.problems = res.Results;
                    //this.InitializeView();
                }
                else {
                    this.msgBoxServ.showMessage("failed", ["Failed ! "], res.ErrorMessage);
                }
            });
    }

    GetPatientPastMedicalList(): void {
        let patientId = this.patientService.getGlobal().PatientId;
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

    //enables the update button and assigns the selected active medical to the CurrentProblem
    public Edit(_selectedActiveMedical, selIndex: number) {
        this.ResetVariables();
        this.selectedIndex = selIndex;
        this.selectedActiveMedical = _selectedActiveMedical;
        this.addActiveProblemBox = true;
    }

    public ResetVariables() {
        this.selectedIndex = null;
        this.selectedActiveMedical = null;
        this.addActiveProblemBox = false;
        this.changeDetector.detectChanges(); //setting this to null because it was not detecting changes and hence was not able to map to the exact field.
    }

    //@Output
    CallBackAddActiveUpdate($event) {

        //update case
        if (this.selectedIndex != null) {
            this.problems[this.selectedIndex] = $event.activeMedical;
            this.problems = this.problems.slice(); // sends fresh copy of array so that angular detects changes;
        }
        //add case
        else {
            this.problems.push($event.activeMedical);
        }
        if (this.callbackService.CallbackRoute != "") {
            var _routeName = this.callbackService.CallbackRoute;
            this.callbackService.CallbackRoute = "";
            this.router.navigate([_routeName]);
        }
    }

    CallBackAddPastUpdate($event) {
        if ($event && $event.pastMedical) {
            //update
            if (this.selectedIndex != null) {
                this.pastMedicals.splice(this.selectedIndex, 1, $event.allergy);
                this.pastMedicals.slice();
            }
            //add
            else {
                if ($event) {
                    this.pastMedicals.push($event.pastMedical);
                }
                this.changeDetector.detectChanges();
            }
        }
    }

    Resolved(_active: ActiveMedical, index) {
        var resMedical = new PastMedical();
        resMedical.ICD10Code = _active.ICD10Code;
        resMedical.ICD10Description = _active.ICD10Description;
        resMedical.CurrentStatus = _active.CurrentStatus;
        resMedical.OnSetDate = _active.OnSetDate;
        resMedical.ResolvedDate = moment().format('YYYY-MM-DD');
        resMedical.Note = _active.Note;
        resMedical.PatientId = _active.PatientId;
        resMedical.PrincipleProblem = _active.PrincipleProblem;
        this.addActiveProblemBox = false;
        //this.Initialize();
        this.problemsBLService.Resolved(_active)
            .subscribe(() => {
                this.problems.splice(index, 1);
                this.pastMedicals.push(resMedical);
                this.msgBoxServ.showMessage("success", ["Resolved Successfully!!"]);
            });
    }

    //for past medical
    SetAsActive(_past: PastMedical) {
        let existingProblem = this.problems.find(past => past.ICD10Code == _past.ICD10Code && past.ICD10Description == _past.ICD10Description);

        if (existingProblem) {
            this.msgBoxServ.showMessage("failed", ["This Problem is Already Added !!"]);
        }
        else {
            var currentProblem = new ActiveMedical();
            currentProblem.ICD10Code = _past.ICD10Code;
            currentProblem.ICD10Description = _past.ICD10Description;
            currentProblem.CurrentStatus = _past.CurrentStatus;
            currentProblem.CreatedBy = _past.CreatedBy;
            currentProblem.CreatedOn = _past.CreatedOn;
            currentProblem.OnSetDate = moment().format('YYYY-MM-DD');
            currentProblem.Note = _past.Note;
            currentProblem.PatientId = _past.PatientId;
            this.problemsBLService.SetAsActive(_past)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status == "OK") {
                        currentProblem.IsResolved = res.Results.IsResolved;
                        currentProblem.PatientProblemId = res.Results.PatientProblemId;

                        this.problems.push(currentProblem);
                        this.problems.slice();
                        this.msgBoxServ.showMessage("success", ["Activated!"]);
                        //this.Initialize();
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ["Unable to set as active"]);
                        console.log(res.ErrorMessage);
                    }
                });
        }
    }
}
