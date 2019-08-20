import { Component, ChangeDetectorRef } from "@angular/core";
import { PatientService } from "../../patients/shared/patient.service";
import { HistoryBLService } from '../shared/history.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { FamilyHistory } from "../shared/family-history.model";

//import { ICD10 } from '../shared/icd10.model';
@Component({
    templateUrl: "../../view/clinical-view/FamilyHistoryList.html" //"/ClinicalView/FamilyHistory"
})
export class FamilyHistoryListComponent {

    public familyHistory: Array<FamilyHistory> = new Array<FamilyHistory>();
    public selectedIndex: number = null;
    public loading: boolean = false;

    public selectedFamilyHistory; //@input
    public showFamilyHistoryBox: boolean = false; //@input

    constructor(public patientServ: PatientService,
        public historyBLService: HistoryBLService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService) {
        this.GetFamilyHistoryList();
    }

    //get list of family history of the selected patient
    GetFamilyHistoryList(): void {
        let patientId = this.patientServ.getGlobal().PatientId;
        this.historyBLService.GetFamilyHistoryList(patientId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.familyHistory = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("failed", ['Failed. please check log for details.'], res.ErrorMessage);
                }
            });
    }

    ShowFamilyHistoryBox() {
        this.ResetVariables();
        this.showFamilyHistoryBox = true;
    }

    //enables the update button and assigns the selected social history to the current social history
    public Edit(_selectedFamilyHistory: FamilyHistory, selIndex: number) {
        this.ResetVariables();
        this.selectedIndex = selIndex;
        this.selectedFamilyHistory = _selectedFamilyHistory;
        this.showFamilyHistoryBox = true;
    }

    public ResetVariables() {
        this.selectedFamilyHistory = null;
        this.selectedIndex = null
        this.showFamilyHistoryBox = false;
        this.changeDetector.detectChanges(); //setting this to null because it was not detecting changes and hence was not able to map to the exact field.
    }

    CallBackAddUpdate($event) {
        if ($event && $event.familyHistory) {
            //update case
            if (this.selectedIndex != null) {
                this.familyHistory.splice(this.selectedIndex, 1, $event.familyHistory);
                this.familyHistory.slice(); // sends fresh copy of array so that angular detects changes;
            }
            //add case
            else {
                this.familyHistory.push($event.familyHistory);
            }
        }
        this.ResetVariables();
    }
}