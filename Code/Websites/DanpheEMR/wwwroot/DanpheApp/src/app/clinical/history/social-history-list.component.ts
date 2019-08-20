import { Component, ChangeDetectorRef } from "@angular/core";
import { PatientService } from "../../patients/shared/patient.service";
import { HistoryBLService } from '../shared/history.bl.service';
import { SocialHistory } from "../shared/social-history.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';

@Component({
    templateUrl: "../../view/clinical-view/SocialHistoryList.html" // "/ClinicalView/SocialHistoryList"
})

export class SocialHistoryListComponent {
    public socialHistoryList: Array<SocialHistory> = new Array<SocialHistory>();
    public SelectedSocialHistory: SocialHistory = null; //@input
    public showSocialAddBox: boolean = false; //@input
    public selectedIndex: number = null;
    public loading: boolean = false;

    constructor(public patientServ: PatientService,
        public historyBLService: HistoryBLService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        this.GetSocialHistoryList();
    }

    //get list of social history of the selected patient
    GetSocialHistoryList(): void {
        var patientId: number = this.patientServ.getGlobal().PatientId;
        this.historyBLService.GetSocialHistoryList(patientId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.socialHistoryList = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("failed", ['Failed. please check log for details.'], res.ErrorMessage);

                }
            });
    }
    public Edit(selectedSocialHistory: SocialHistory, selIndex: number) {
        this.ResetVariables();
        this.selectedIndex = selIndex;
        this.SelectedSocialHistory = selectedSocialHistory;
        this.showSocialAddBox = true;
    }

    CallBackAddSocialHistory($event) {
        if ($event && $event.socialHistory) {
            //update case
            if (this.selectedIndex != null) {
                this.socialHistoryList.splice(this.selectedIndex, 1, $event.socialHistory);
                this.socialHistoryList.slice();// sends fresh copy of array so that angular detects changes;
            }
            //add case
            else {
                this.socialHistoryList.push($event.socialHistory);
            }
        }
        this.ResetVariables();
    }

    //enables the update button and assigns the selected social history to the current social history
    public showSocialHistoryBox() {
        this.ResetVariables();
        this.showSocialAddBox = true;
    }

    public ResetVariables() {
        this.selectedIndex = null;
        this.SelectedSocialHistory = null;
        this.showSocialAddBox = false;
        this.changeDetector.detectChanges();
    }
}