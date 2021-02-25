import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { ExternalReferralModel } from "../../shared/external-referral.model";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";

@Component({
  selector: "ext-referral-add",
  templateUrl: "./add-ext-referral.html"
})

export class AddExternalReferralComponent {

  @Input('ref-to-edit')
  selRefToEdit: ExternalReferralModel = null;

  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();


  public completeExternalRefList: Array<ExternalReferralModel> = new Array<ExternalReferralModel>();
  public externalRefList: Array<ExternalReferralModel> = new Array<ExternalReferralModel>();
  public externalRef: ExternalReferralModel = new ExternalReferralModel();


  constructor(public settingsServ: SettingsService, public settingsBlService: SettingsBLService,
    public msgBoxServ: MessageboxService) {
    let abc = 0;
  }




  public isAddNewRef: boolean = true;

  ngOnInit() {

    //this is case for edit.
    if (this.selRefToEdit && this.selRefToEdit.ExternalReferrerId) {

      this.externalRef = Object.assign(new ExternalReferralModel(), this.selRefToEdit);
      this.isAddNewRef = false;
    }
    else {
      this.isAddNewRef = true;
    }
  }


  AddReferral() {

    for (var i in this.externalRef.ExternalRefValidator.controls) {
      this.externalRef.ExternalRefValidator.controls[i].markAsDirty();
      this.externalRef.ExternalRefValidator.controls[i].updateValueAndValidity();
    }

    if (this.externalRef.IsValidCheck(undefined, undefined)) {

      this.settingsBlService.AddExtReferrer(this.externalRef)
        .subscribe((res: DanpheHTTPResponse) => {

          if (res.Status == "OK") {
            this.callbackAdd.emit({ action: "add", data: res.Results });
            this.externalRef = new ExternalReferralModel();
            this.msgBoxServ.showMessage("Sucess", ["Updated."]);
          }
          else {
            this.msgBoxServ.showMessage("failed", ["failed get DialysisCode. please check log for details."]);
          }


        });
    }
    else {
      this.msgBoxServ.showMessage("failed", ["some data are invalid."]);
    }

  }

  UpdateReferral() {

    for (var i in this.externalRef.ExternalRefValidator.controls) {
      this.externalRef.ExternalRefValidator.controls[i].markAsDirty();
      this.externalRef.ExternalRefValidator.controls[i].updateValueAndValidity();
    }

    if (this.externalRef.IsValidCheck(undefined, undefined)) {

      this.settingsBlService.UpdateExtReferrer(this.externalRef)
        .subscribe((res: DanpheHTTPResponse) => {

          if (res.Status == "OK") {
            this.callbackAdd.emit({ action: "edit", data: res.Results });
            this.externalRef = new ExternalReferralModel();
            this.msgBoxServ.showMessage("Sucess", ["Updated."]);
          }
          else {
            this.msgBoxServ.showMessage("failed", ["failed get DialysisCode. please check log for details."]);
          }


        });

    }
    else {
      alert("some data are invalid");
    }


  }


  close() {
    this.externalRef = new ExternalReferralModel();
    this.callbackAdd.emit({ action: "close", data: null });
  }


}
