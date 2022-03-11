import { Component, Input, Output, EventEmitter, ChangeDetectorRef, Renderer2 } from "@angular/core";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { PrintExportConfigurationModel } from "../../shared/print-export-config.model";

@Component({
  selector: "add-print-export-config",
  templateUrl: "./add-new-configuration.html"
})

export class AddPrintExportConfigurationComponent {

  @Input('config-to-edit')
  configToEdit: PrintExportConfigurationModel = null;

  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();


  public configuration: PrintExportConfigurationModel = new PrintExportConfigurationModel();
  public isAddNewConfiguration: boolean = true;

  public ESCAPE_KEYCODE = 27;
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
    if (this.configToEdit && this.configToEdit.PrintExportSettingsId) {
      this.configuration = Object.assign(new PrintExportConfigurationModel(), this.configToEdit);
      this.isAddNewConfiguration = false;
      this.configuration.ConfigurationValidator.controls["SettingName"].disable();
    }
    else {
      this.isAddNewConfiguration = true;
    }
  }


  AddConfiguration() {
    for (var i in this.configuration.ConfigurationValidator.controls) {
      this.configuration.ConfigurationValidator.controls[i].markAsDirty();
      this.configuration.ConfigurationValidator.controls[i].updateValueAndValidity();
      this.SetFocusById('SettingName');
    }

    if (this.configuration.IsValidCheck(undefined, undefined)) {

      this.settingsBlService.AddPrintExportConfiguration(this.configuration)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.configuration = new PrintExportConfigurationModel();
            this.callbackAdd.emit({ action: "add", data: res.Results });
            this.msgBoxServ.showMessage("Success", ["New Configuration is Successfully Added."]);
          }
          else {
            this.msgBoxServ.showMessage("failed", ["failed. please check log for details."]);
            this.SetFocusById('SettingName');
          }
        });
    }
    else {
      this.msgBoxServ.showMessage("failed", ["some data are invalid."]);
    }

  }

  UpdateConfiguration() {
    for (var i in this.configuration.ConfigurationValidator.controls) {
      this.configuration.ConfigurationValidator.controls[i].markAsDirty();
      this.configuration.ConfigurationValidator.controls[i].updateValueAndValidity();
    }

    if (this.configuration.IsValidCheck(undefined, undefined)) {

      this.settingsBlService.UpdatePrintExportConfiguration(this.configuration)
        .subscribe((res: DanpheHTTPResponse) => {

          if (res.Status == "OK") {
            this.configuration = new PrintExportConfigurationModel();
            this.callbackAdd.emit({ action: "edit", data: res.Results });
            this.msgBoxServ.showMessage("Success", ["Selected Configuration is Successfully Updated."]);
          }
          else {
            this.msgBoxServ.showMessage("failed", ["failed. please check log for details."]);
            this.SetFocusById('SettingName');
          }
        });

    }
    else {
      alert("some data are invalid");
    }


  }

  
  close() {
    this.configuration = new PrintExportConfigurationModel();
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
