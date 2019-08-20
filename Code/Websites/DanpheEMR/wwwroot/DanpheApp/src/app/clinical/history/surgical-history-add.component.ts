import { Input, Output, EventEmitter, Component, ChangeDetectorRef } from "@angular/core";
import { PatientService } from "../../patients/shared/patient.service";
import { HistoryBLService } from '../shared/history.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SurgicalHistory } from "../shared/surgical-history.model";
import { ICD10 } from '../shared/icd10.model';
import * as moment from 'moment/moment';
import { DanpheCache, MasterType } from "../../shared/danphe-cache-service-utility/cache-services";

@Component({
    selector: "surgical-history-add",
    templateUrl: "./surgical-history-add.html"
})
export class SurgicalHistoryAddComponent {

    public surgicalHistory: Array<SurgicalHistory> = new Array<SurgicalHistory>();
    //ng2-autocomplete binds the selected ICD10 to icd10Selected.
    public icd10Selected: { ICD10Code, ICD10Description };
    public ICD10List = [];
    public selectedIndex: number = null;
    public showSurgicalAddBox: boolean = false;
    public loading: boolean = false;

    @Output("callBack-AddUpdate")
    public callBackAddUpdate: EventEmitter<Object> = new EventEmitter<Object>();

    @Input("selected-surgical-history")
    public CurrentSurgicalHistory: SurgicalHistory = new SurgicalHistory();

    @Input("show-Surgical-AddBox")
    public set ViewPage(_viewpage: boolean) {
        if (_viewpage) {
            //edit
            if (this.CurrentSurgicalHistory && this.CurrentSurgicalHistory.SurgicalHistoryId) {
                var surgicalHistory = new SurgicalHistory();
                surgicalHistory = Object.assign(surgicalHistory, this.CurrentSurgicalHistory);
                this.CurrentSurgicalHistory = surgicalHistory;
                this.CurrentSurgicalHistory.SurgeryDate = moment(this.CurrentSurgicalHistory.SurgeryDate).format('YYYY-MM-DD');
                this.MapSelectedICD();
            }
            else {
                //add
                this.Initialize();
            }
        }
        this.showSurgicalAddBox = _viewpage;
    }

    constructor(public patientServ: PatientService,
        public historyBLService: HistoryBLService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService) {
        this.Initialize();
        this.GetICDList();
    }

    public MapSelectedICD() {
        let icd = this.ICD10List.find(a => a.ICD10Code == this.CurrentSurgicalHistory.ICD10Code);
        if (icd)
            this.icd10Selected = icd;
    }

    public Initialize() {
        this.icd10Selected = null;
        this.CurrentSurgicalHistory = new SurgicalHistory();
        this.CurrentSurgicalHistory.PatientId = this.patientServ.getGlobal().PatientId;
        this.CurrentSurgicalHistory.SurgeryDate = moment(new Date()).format('YYYY-MM-DD');
    }

    public GetICDList() {
		this.ICD10List = DanpheCache.GetData(MasterType.ICD,null);
        // this.historyBLService.GetICDList()
            // .subscribe(res => {
                // if (res.Status == "OK") {
                    // this.ICD10List = res.Results;;
                // }
                // else {
                    // this.msgBoxServ.showMessage("failed", ["Failed ! "], res.ErrorMessage);
                // }
            // });
    }

    public ValidationCheck(): boolean {
        if (this.icd10Selected) {
            this.CurrentSurgicalHistory.ICD10Code = this.icd10Selected.ICD10Code;
            this.CurrentSurgicalHistory.ICD10Description = this.icd10Selected.ICD10Description;
        }
        //marking every fields as dirty and checking validity
        for (var i in this.CurrentSurgicalHistory.SurgicalHistoryValidator.controls) {
            this.CurrentSurgicalHistory.SurgicalHistoryValidator.controls[i].markAsDirty();
            this.CurrentSurgicalHistory.SurgicalHistoryValidator.controls[i].updateValueAndValidity();
        }
        //if valid then call the BL service to do post request.
        if (this.CurrentSurgicalHistory.IsValidCheck(undefined, undefined) && this.CheckICDSelected()) {
            return true;
        }
        else
            return false;
    }

    SaveSurgicalHistory() {
        if (!this.loading && this.ValidationCheck()) {
            this.loading = true;
            if (this.CurrentSurgicalHistory.SurgicalHistoryId) {
                this.Update();
            }
            else {
                this.AddSurgicalHistory();
            }
        }
        else
            this.msgBoxServ.showMessage("error", ["please fill the form!"]);
    }

    //post surgical history
    AddSurgicalHistory(): void {
        this.CurrentSurgicalHistory.PatientId = this.patientServ.getGlobal().PatientId;
        this.loading = false;
        this.historyBLService.PostSurgicalHistory(this.CurrentSurgicalHistory)
            .subscribe(res => {
                if (res.Status == "OK") {
                    if (res.Results) {
                        this.CurrentSurgicalHistory.SurgicalHistoryId = res.Results.SurgicalHistoryId;
                        this.CurrentSurgicalHistory.CreatedOn = res.Results.CreatedOn;
                        this.CurrentSurgicalHistory.SurgeryDate = moment(new Date()).format('YYYY-MM-DD');
                        this.CloseSurgicalHistoryBox(this.CurrentSurgicalHistory);
                        this.msgBoxServ.showMessage("success", ["Added Successfully"]);
                       // this.Initialize();
                    }
                }
            },
                err => { this.msgBoxServ.showMessage("error", [err.ErrorMessage]); });
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

    public Update() {
        this.historyBLService.PutSurgicalHistory(this.CurrentSurgicalHistory)
            .subscribe(
                res => {
                    this.loading = false;
                    if (res.Status == "OK") {
                        this.CurrentSurgicalHistory.SurgeryDate = moment(new Date()).format('YYYY-MM-DD');
                        this.CloseSurgicalHistoryBox(res.Results);
                        this.msgBoxServ.showMessage("success", ["updated successfully"]);
                        //this.Initialize();
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ['Failed. please check log for details.'], res.ErrorMessage);
                    }
                });
    }

    ////call back funciton of post surigical history.
    public CloseSurgicalHistoryBox(_selectedSurgicalHistory) {
        this.showSurgicalAddBox = false;
        this.callBackAddUpdate.emit({ "surgicalHistory": _selectedSurgicalHistory });
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
            this.CurrentSurgicalHistory.ICD10Code = this.icd10Selected.ICD10Code;
            this.CurrentSurgicalHistory.ICD10Description = this.icd10Selected.ICD10Description;
        }
    }
}