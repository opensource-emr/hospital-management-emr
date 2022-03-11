import { Component, Input, Output, EventEmitter, ChangeDetectorRef, Renderer2 } from "@angular/core";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { BanksModel } from "../../shared/banks.model";

@Component({
  selector: "add-banks",
  templateUrl: "./add-banks.html"
})

export class AddBanksComponent {

  @Input('bank-to-edit')
  selBankToEdit: BanksModel = null;

  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();


  public Bank: BanksModel = new BanksModel();
  public isAddNewBank: boolean = true;

  public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
  constructor(public settingsServ: SettingsService,
    public settingsBlService: SettingsBLService,
    public msgBoxServ: MessageboxService,
    public renderer: Renderer2) {
      this.SetFocusById('BankName');
      this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
        if (e.keyCode == this.ESCAPE_KEYCODE) {
          this.close();
        }
      });   
    }
    globalListenFunc: Function;


  ngOnInit() {
    //this is case for edit.
    if (this.selBankToEdit && this.selBankToEdit.BankId) {

      this.Bank = Object.assign(new BanksModel(), this.selBankToEdit);
      this.isAddNewBank = false;
    }
    else {
      this.isAddNewBank = true;
    }
  }


  AddBank() {

    for (var i in this.Bank.BanksValidator.controls) {
      this.Bank.BanksValidator.controls[i].markAsDirty();
      this.Bank.BanksValidator.controls[i].updateValueAndValidity();
      this.SetFocusById('BankName');
    }

    if (this.Bank.IsValidCheck(undefined, undefined)) {

      this.settingsBlService.AddBank(this.Bank)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.callbackAdd.emit({ action: "add", data: res.Results });
            this.Bank = new BanksModel();
            this.msgBoxServ.showMessage("Sucess", ["Updated."]);
          }
          else {
            this.msgBoxServ.showMessage("failed", ["failed get DialysisCode. please check log for details."]);
            this.SetFocusById('BankName');
          }
        });
    }
    else {
      this.msgBoxServ.showMessage("failed", ["some data are invalid."]);
    }

  }

  UpdateBank() {

    for (var i in this.Bank.BanksValidator.controls) {
      this.Bank.BanksValidator.controls[i].markAsDirty();
      this.Bank.BanksValidator.controls[i].updateValueAndValidity();
    }

    if (this.Bank.IsValidCheck(undefined, undefined)) {

      this.settingsBlService.UpdateBank(this.Bank)
        .subscribe((res: DanpheHTTPResponse) => {

          if (res.Status == "OK") {
            this.callbackAdd.emit({ action: "edit", data: res.Results });
            this.Bank = new BanksModel();
            this.msgBoxServ.showMessage("Sucess", ["Updated."]);
          }
          else {
            this.msgBoxServ.showMessage("failed", ["failed get DialysisCode. please check log for details."]);
            this.SetFocusById('BankName');
          }
        });

    }
    else {
      alert("some data are invalid");
    }


  }

  
  close() {
    this.Bank = new BanksModel();
    this.callbackAdd.emit({ action: "close", data: null });
  }

  public SetFocusById(id: string) {
    window.setTimeout(function () {
        let elementToBeFocused = document.getElementById(id);
        if (elementToBeFocused) {
            elementToBeFocused.focus();
        }
    }, 600);
}
}
