import { Component, ChangeDetectorRef } from "@angular/core";
import { PatientService } from "../../patients/shared/patient.service";
import { HistoryBLService } from '../shared/history.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SurgicalHistory } from "../shared/surgical-history.model";
import { ICD10 } from '../shared/icd10.model';
import * as moment from 'moment/moment';
@Component({
    templateUrl: "../../view/clinical-view/SurgicalHistoryList.html" //"/ClinicalView/SurgicalHistoryList"
})
export class SurgicalHistoryListComponent {

    public surgicalHistoryList: Array<SurgicalHistory> = new Array<SurgicalHistory>();

    //ng2-autocomplete binds the selected ICD10 to icd10Selected.
    public icd10Selected: ICD10;
    public ICD10List = [];
    public selectedIndex: number = null;
    public loading: boolean = false;
    public showSurgicalAddBox: boolean = false; //@input
    public SelectedSurgicalHistory: SurgicalHistory = null; //@input

    constructor(public patientServ: PatientService,
        public historyBLService: HistoryBLService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
        this.GetSurgicalHistoryList();
    }

    public GetSurgicalHistoryList(): void {
        let patientId = this.patientServ.getGlobal().PatientId;
        this.historyBLService.GetSurgicalHistoryList(patientId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.surgicalHistoryList = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("failed", ['Failed. please check log for details.'], res.ErrorMessage);

                }
            });
    }


    public Edit(selSurgicalHistory: SurgicalHistory, selIndex: number) {
        this.ResetVariables();
        this.selectedIndex = selIndex;
        //this.icd10Selected = null;
        this.SelectedSurgicalHistory = selSurgicalHistory;
        //selSurgicalHistory.SurgeryDate = moment(selSurgicalHistory.SurgeryDate).format('YYYY-MM-DD');
        this.showSurgicalAddBox = true;
    }

    public showSurgicalBox() {
        this.ResetVariables();
        this.showSurgicalAddBox = true;
    }

    public ResetVariables() {
        this.SelectedSurgicalHistory = null;
        this.selectedIndex = null;
        this.showSurgicalAddBox = false;
        this.changeDetector.detectChanges();   //setting this to null because it was not detecting changes and hence was not able to map to the view.
    }
    public callBackAddUpdate($event) {
        if ($event.surgicalHistory) {
            //update case
            if (this.selectedIndex != null) {
                this.surgicalHistoryList.splice(this.selectedIndex, 1, $event.surgicalHistory);
                this.surgicalHistoryList.slice();// sends fresh copy of array so that angular detects changes;
            }
            //add case
            else {
                this.surgicalHistoryList.push($event.surgicalHistory);
            }
        }
        this.ResetVariables();
    }

}