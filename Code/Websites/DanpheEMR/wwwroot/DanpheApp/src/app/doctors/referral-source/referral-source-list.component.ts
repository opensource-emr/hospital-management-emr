import { Component, ChangeDetectorRef } from "@angular/core";
import { HistoryBLService } from '../../clinical/shared/history.bl.service';
import { PatientService } from "../../patients/shared/patient.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ReferralSource } from "./referral-source.model";

@Component({
  templateUrl: "./referral-source-list.html" // "/ClinicalView/SocialHistoryList"
})

export class ReferralSourceListComponent {
  public referralSourcelist: Array<ReferralSource> = new Array<ReferralSource>();
  public SelectedReferralSource: ReferralSource = null;
  public showReferralAddBox: boolean = false; //@input
  public selectedIndex: number = null;
  public loading: boolean = false;

  constructor(public patientServ: PatientService,
    public msgBoxServ: MessageboxService,
    public historyBLService: HistoryBLService,
    public changeDetector: ChangeDetectorRef) {
    this.GetReferralsourceList();
  }

  GetReferralsourceList(): void {
    var patientId: number = this.patientServ.getGlobal().PatientId;
    this.historyBLService.GetReferralSourceList(patientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.referralSourcelist = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", ['Failed. please check log for details.'], res.ErrorMessage);

        }
      });
  }


  public Edit(selectedReferral: ReferralSource, selIndex: number) {
    this.ResetVariables();
    this.selectedIndex = selIndex;
    this.SelectedReferralSource = selectedReferral;
    this.showReferralAddBox = true;
  }
  public ResetVariables() {
    this.selectedIndex = null;
    this.SelectedReferralSource = null;
    this.showReferralAddBox = false;
    this.changeDetector.detectChanges();
  }

  public showReferralSourceBox() {
    this.ResetVariables();
    this.showReferralAddBox = true;
  }

  CallBackAddReferralSource($event) {
    if ($event && $event.status) {
      //update case
      if ($event.status == "update") {
        this.referralSourcelist.splice(this.selectedIndex, 1, $event.referralSource);
        this.referralSourcelist = this.referralSourcelist.slice();// sends fresh copy of array so that angular detects changes;
      }
      //add case
      else if($event.status == "add") {
        this.referralSourcelist.splice(0, 0, $event.referralSource);
      }
    }
    this.ResetVariables();
  }


  }
  

