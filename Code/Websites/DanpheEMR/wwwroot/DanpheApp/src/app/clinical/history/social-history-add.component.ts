import { Input, Output, EventEmitter, Component, ChangeDetectorRef } from "@angular/core";
import { PatientService } from "../../patients/shared/patient.service";
import { HistoryBLService } from '../shared/history.bl.service';
import { SocialHistory } from "../shared/social-history.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
@Component({
    selector: "social-history-add",
    templateUrl: "./social-history-add.html"
})
export class SocialHistoryAddComponent {

    @Input("selected-socialhistory")
    public CurrentSocialHistory: SocialHistory = new SocialHistory();

    public selectedIndex: number = null;
    public showSocialHistoryBox: boolean = false;
    public loading: boolean = false;

    constructor(public patientServ: PatientService,
        public historyBLService: HistoryBLService,
        public ChangeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService) {
    }

    @Output("callback-socialupdate")
    public callbackSocialUpdate: EventEmitter<Object> = new EventEmitter<Object>();

    @Input("showSocialAddBox")
    public set ViewPage(_viewpage: boolean) {
        // assign data from list page to instance of HomeMedicationn class (Since list page object don't have validator property.)
        if (_viewpage) {
            if (this.CurrentSocialHistory && this.CurrentSocialHistory.SocialHistoryId) {
                var socialHistory = new SocialHistory();
                socialHistory = Object.assign(socialHistory, this.CurrentSocialHistory);
                this.Initialize();
                this.CurrentSocialHistory = socialHistory;
            }
            else {
                this.Initialize();
            }
        }
        this.showSocialHistoryBox = _viewpage;
    }

    public ValidationCheck(): boolean {
        //atleast one SocialHistory should be selected.
        if (this.CurrentSocialHistory.AlcoholHistory || this.CurrentSocialHistory.SmokingHistory || this.CurrentSocialHistory.DrugHistory) {
            //marking every fields as dirty and checking validity
            for (var i in this.CurrentSocialHistory.SocialHistoryValidator.controls) {
                this.CurrentSocialHistory.SocialHistoryValidator.controls[i].markAsDirty();
                this.CurrentSocialHistory.SocialHistoryValidator.controls[i].updateValueAndValidity();
            }

            //if valid then call the BL service to do post request.
            if (this.CurrentSocialHistory.IsValidCheck(undefined, undefined) == true) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            this.msgBoxServ.showMessage("error", ["please fill the form!"]);
        }
    }

    SaveSocialHistory() {
        if (!this.loading && this.ValidationCheck()) {
            this.loading = true;
            if (this.CurrentSocialHistory.SocialHistoryId) {
                this.UpdateSocialHistory();
            }
            else {
                this.AddSocialHistory();
            }
        }
    }


    AddSocialHistory(): void {
        this.CurrentSocialHistory.PatientId = this.patientServ.getGlobal().PatientId;
        this.loading = false;
        this.historyBLService.PostSocialHistory(this.CurrentSocialHistory)
            .subscribe(
                res => {
                    if (res.Status == "OK") {
                        if (res.Results) {
                            this.CurrentSocialHistory.SocialHistoryId = res.Results.SocialHistoryId;
                            this.CurrentSocialHistory.CreatedOn = res.Results.CreatedOn;
                            this.CloseSocialHistoryBox(this.CurrentSocialHistory);
                            this.msgBoxServ.showMessage("success", ["Added Successfully"]);
                        }
                        else {
                            this.msgBoxServ.showMessage("failed", ["Failed: please check log for details."]);
                        }
                    }
                }, err => { this.msgBoxServ.showMessage("error", [err]); });
    }

    public UpdateSocialHistory() {
        this.historyBLService.PutSocialHistory(this.CurrentSocialHistory)
            .subscribe(
                res => {
                    this.loading = false;
                    if (res.Status == "OK") {
                        this.CloseSocialHistoryBox(res.Results);
                        this.msgBoxServ.showMessage("success", ["Updated Successfully"]);
                    } else {
                        this.msgBoxServ.showMessage("failed", ['Failed. Please recheck detail.']);
                    }
                });
    }

    CloseSocialHistoryBox(_socialHistory = null) {
        this.showSocialHistoryBox = false;
        this.callbackSocialUpdate.emit({ "socialHistory": _socialHistory });
    }

    public Initialize() {
        this.CurrentSocialHistory = new SocialHistory();
        this.CurrentSocialHistory.PatientId = this.patientServ.getGlobal().PatientId;
    }
}






