import { Component, Input, Output, EventEmitter, ChangeDetectorRef, Renderer2 } from "@angular/core";
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
  public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.

  constructor(public settingsServ: SettingsService, public settingsBlService: SettingsBLService,
    public msgBoxServ: MessageboxService, public renderer: Renderer2) {
    let abc = 0;
    this.SetFocusById('referrerName');
    this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
      if (e.keyCode == this.ESCAPE_KEYCODE) {
        this.close();
      }
    });
  }
  globalListenFunc: Function;
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
            this.SetFocusById('referrerName');
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
            this.SetFocusById('referrerName');
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
  public SetFocusById(id: string) {
    window.setTimeout(function () {
      let elementToBeFocused = document.getElementById(id);
      if (elementToBeFocused) {
        elementToBeFocused.focus();
      }
    }, 100);
  }

}
