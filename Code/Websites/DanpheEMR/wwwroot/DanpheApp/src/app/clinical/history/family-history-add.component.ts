import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { PatientService } from "../../patients/shared/patient.service";
import { HistoryBLService } from '../shared/history.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { FamilyHistory } from "../shared/family-history.model";
import { DanpheCache, MasterType } from "../../shared/danphe-cache-service-utility/cache-services";
@Component({
    selector: "family-history-add",
    templateUrl: "./family-history-add.html"
})

export class FamilyHistoryAddComponent {
    @Input("selected-familyHistory")
    public CurrentFamilyHistory: FamilyHistory = new FamilyHistory();

    public showFamilyHistoryAddBox: boolean = false;

    @Output("callback-addupdate")
    public callbackAddUpdate: EventEmitter<Object> = new EventEmitter<Object>();

    public ICD10List = [];
    public icd10Selected: { ICD10Code, ICD10Description };
    public selectedIndex: number = null;
    public loading: boolean = false;

    constructor(public patientService: PatientService,
        public historyBLService: HistoryBLService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService) {
        this.GetICDList();
    }

    @Input("show-familyHistory-add")
    public set ViewPage(_viewPage: boolean) {
        //edit
        if (_viewPage) {
            if (this.CurrentFamilyHistory && this.CurrentFamilyHistory.FamilyProblemId) {
                var familyHistory = new FamilyHistory();
                familyHistory = Object.assign(familyHistory, this.CurrentFamilyHistory);
                this.Initialize();
                this.CurrentFamilyHistory = familyHistory;
                this.MapSelectedICD();
            }
            //add
            else {
                this.Initialize();
            }
        }
        this.showFamilyHistoryAddBox = _viewPage;
    }

    Initialize() {
        this.icd10Selected = null;
        this.CurrentFamilyHistory = new FamilyHistory();
        this.CurrentFamilyHistory.PatientId = this.patientService.getGlobal().PatientId;
        //this.CurrentFamilyHistory.LastTaken = moment().format("YYYY-MM-DD");
    }

    public MapSelectedICD() {
        let icd = this.ICD10List.find(a => a.ICD10Code == this.CurrentFamilyHistory.ICD10Code);
        if (icd)
            this.icd10Selected = icd;
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

    public validationCheck(): boolean {
        if (this.icd10Selected) {
            this.CurrentFamilyHistory.ICD10Code = this.icd10Selected.ICD10Code;
            this.CurrentFamilyHistory.ICD10Description = this.icd10Selected.ICD10Description;
        }

        for (var i in this.CurrentFamilyHistory.FamilyHistoryValidator.controls) {
            this.CurrentFamilyHistory.FamilyHistoryValidator.controls[i].markAsDirty();
            this.CurrentFamilyHistory.FamilyHistoryValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentFamilyHistory.IsValidCheck(undefined, undefined) == true
            && this.CheckICDSelected()) {
            return true;
        }
        else
            return false;
    }

    SaveFamilyHistory() {
        if (!this.loading && this.validationCheck()) {
            this.loading = true;

            if (this.CurrentFamilyHistory.FamilyProblemId) {
                this.Update();
            }
            else {
                this.AddFamilyHistory();
            }
        }
    }

    //post new family history
    AddFamilyHistory(): void {
        this.CurrentFamilyHistory.PatientId = this.patientService.getGlobal().PatientId;
        this.loading = false;
        this.historyBLService.PostFamilyHistory(this.CurrentFamilyHistory)
            .subscribe(
                res => {
                    if (res.Status == "OK") {
                        if (res.Results) {
                            this.CurrentFamilyHistory.FamilyProblemId = res.Results.FamilyProblemId;
                            this.CurrentFamilyHistory.CreatedOn = res.Results.CreatedOn;
                            this.CloseAddUpdateFamilyHistoryBox(this.CurrentFamilyHistory);
                            this.msgBoxServ.showMessage("success", ["Added successfully"]);
                        }
                        else {
                            this.msgBoxServ.showMessage("failed", ['Unable to Add.']);
                        }
                    }
                });
    }

    Update() {
        this.historyBLService.PutFamilyHistory(this.CurrentFamilyHistory)
            .subscribe(
                res => {
                    this.loading = false;
                    if (res.Status == "OK") {
                        this.CloseAddUpdateFamilyHistoryBox(res.Results);
                        //                        this.CurrentFamilyHistory = new FamilyHistory();
                        this.msgBoxServ.showMessage("success", ["updated successfully"]);
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ['Failed. please recheck details.']);
                    }
                });
    }

    //callback function of post family history.
    CloseAddUpdateFamilyHistoryBox(_selectedFamilyHistory) {
        //this.CurrentFamilyHistory = new FamilyHistory();
        this.showFamilyHistoryAddBox = false;
        this.callbackAddUpdate.emit({ "familyHistory": _selectedFamilyHistory });
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
            this.CurrentFamilyHistory.ICD10Code = this.icd10Selected.ICD10Code;
            this.CurrentFamilyHistory.ICD10Description = this.icd10Selected.ICD10Description;
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