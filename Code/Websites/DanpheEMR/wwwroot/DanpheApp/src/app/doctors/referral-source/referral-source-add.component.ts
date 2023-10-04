import { Input, Output, EventEmitter, Component, ChangeDetectorRef } from "@angular/core";
import { PatientService } from "../../patients/shared/patient.service";
import { HistoryBLService } from '../../clinical/shared/history.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ReferralSource } from "./referral-source.model";
@Component({
  selector: "referral-source-add",
  templateUrl: "./referral-source-add.html"
})
export class ReferralSourceAddComponent {

  @Input("selected-referralsource")
  public CurrentReferralSource: ReferralSource = new ReferralSource();

  public selectedIndex: number = null;
  public showReferralSourceBox: boolean = false;
  public loading: boolean = false;

  constructor(public patientServ: PatientService,
    public historyBLService: HistoryBLService,
    public ChangeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService) {
  }

  @Output("callback-referralsourceupdate")
  public callbackReferralSourceUpdate: EventEmitter<Object> = new EventEmitter<Object>();

  @Input("showReferralAddBox")
  public set ViewPage(_viewpage: boolean) {
    // assign data from list page to instance of HomeMedicationn class (Since list page object don't have validator property.)
    if (_viewpage) {
      if (this.CurrentReferralSource && this.CurrentReferralSource.ReferralSourceId) {
        var referralSource = new ReferralSource();
        referralSource = Object.assign(referralSource, this.CurrentReferralSource);
        this.Initialize();
        this.CurrentReferralSource = referralSource;
      }
      else {
        this.Initialize();
      }
    }
    this.showReferralSourceBox = _viewpage;
  }

  public ValidationCheck(): boolean {
    //atleast one SocialHistory should be selected.
    if (this.CurrentReferralSource.Others || this.CurrentReferralSource.Newspaper || this.CurrentReferralSource.Magazine || this.CurrentReferralSource.FriendAndFamily || this.CurrentReferralSource.Staff || this.CurrentReferralSource.TV || this.CurrentReferralSource.WebPage || this.CurrentReferralSource.Unknown || this.CurrentReferralSource.Radio) {
      //marking every fields as dirty and checking validity
      for (var i in this.CurrentReferralSource.ReferralSourceValidator.controls) {
        this.CurrentReferralSource.ReferralSourceValidator.controls[i].markAsDirty();
        this.CurrentReferralSource.ReferralSourceValidator.controls[i].updateValueAndValidity();
      }

      //if valid then call the BL service to do post request.
      if (this.CurrentReferralSource.IsValidCheck(undefined, undefined) == true) {
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

  SaveReferralSource() {
    if (!this.loading && this.ValidationCheck() ) {
      this.loading = true;
      if (this.CurrentReferralSource.ReferralSourceId) {
        this.UpdateReferralSource();
      }
      else {
        this.AddReferralSource();
      }
    }
  }


  AddReferralSource(): void {
    this.CurrentReferralSource.PatientId = this.patientServ.getGlobal().PatientId;
    this.loading = false;
    this.historyBLService.PostReferralSource(this.CurrentReferralSource)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            if (res.Results) {
              this.CurrentReferralSource.ReferralSourceId = res.Results.ReferralSourceId;
              this.CurrentReferralSource.CreatedOn = res.Results.CreatedOn;
              this.CloseReferralSourceBox(1,this.CurrentReferralSource);
              this.msgBoxServ.showMessage("success", ["Added Successfully"]);
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Failed: please check log for details."]);
            }
          }
        }, err => { this.msgBoxServ.showMessage("error", [err]); });
  }

  public UpdateReferralSource() {
    this.historyBLService.PutReferralSource(this.CurrentReferralSource)
      .subscribe(
        res => {
          this.loading = false;
          if (res.Status == "OK") {
            this.CloseReferralSourceBox(2,res.Results);
            this.msgBoxServ.showMessage("success", ["Updated Successfully"]);
          } else {
            this.msgBoxServ.showMessage("failed", ['Failed. Please recheck detail.']);
          }
        });
  }

  CloseReferralSourceBox(status:number,_referralSource = null) {
    this.showReferralSourceBox = false;
    if (status == 1) {
      this.callbackReferralSourceUpdate.emit({ "status": "add", "referralSource": _referralSource });
    }
    else if (status == 2) {
      this.callbackReferralSourceUpdate.emit({ "status": "update", "referralSource": _referralSource });
    }
    else {
      this.callbackReferralSourceUpdate.emit({ "status":"close" });
    }
    
  }

  public Initialize() {
    this.CurrentReferralSource = new ReferralSource();
    this.CurrentReferralSource.PatientId = this.patientServ.getGlobal().PatientId;
  }
}






