import { Component, Input, Output, EventEmitter, ChangeDetectorRef, Renderer2 } from "@angular/core";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { PrinterSettingsModel } from "../printer-settings.model";
import { CoreService } from "../../../core/shared/core.service";

@Component({
  selector: "printer-setting-add",
  templateUrl: "./add-printer-setting.html"
})

export class AddPrinterSettingsComponent {

  @Input('printer-to-edit')
  selPrinterToEdit: PrinterSettingsModel = null;

  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

  public PrinterSettings: PrinterSettingsModel = new PrinterSettingsModel();
  public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.

  globalListenFunc: Function;
  public isAddNewPrinterSetting: boolean = true;

  constructor(public settingsServ: SettingsService,
    public settingsBlService: SettingsBLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public renderer: Renderer2) {

    this.coreService.FocusInputById('groupName');
    this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
      if (e.keyCode == this.ESCAPE_KEYCODE) {
        this.close();
      }
    });
  }


  ngOnInit() {

    //this is case for edit.
    if (this.selPrinterToEdit && this.selPrinterToEdit.PrinterSettingId) {
      this.PrinterSettings = Object.assign(new PrinterSettingsModel(), this.selPrinterToEdit);
      this.isAddNewPrinterSetting = false;
    }
    else {
      this.PrinterSettings = new PrinterSettingsModel();
      this.isAddNewPrinterSetting = true;
    }
  }


  AddPrinterSetting() {
    for (var i in this.PrinterSettings.PrinterSettingsValidator.controls) {
      this.PrinterSettings.PrinterSettingsValidator.controls[i].markAsDirty();
      this.PrinterSettings.PrinterSettingsValidator.controls[i].updateValueAndValidity();
    }

    if (this.PrinterSettings.IsValidCheck(undefined, undefined)) {
      // if (this.PrinterSettings.PrintingType == 'dotmatrix' && !this.PrinterSettings.PrinterName) {
      //   this.msgBoxServ.showMessage("failed", ["Printer Name Mandatory for dotmatrix printer."]);
      //   return;
      // }
      // if (this.PrinterSettings.PrintingType == 'dotmatrix' && !this.PrinterSettings.ModelName) {
      //   this.msgBoxServ.showMessage("failed", ["Model Name Mandatory for dotmatrix printer."]);
      //   return;
      // }

      //this.CheckValidation();
      if (this.CheckValidation()) {
        this.settingsBlService.AddPrinterSetting(this.PrinterSettings)
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status == "OK") {
              this.callbackAdd.emit({ action: "add", data: res.Results });
              this.PrinterSettings = new PrinterSettingsModel();
              this.msgBoxServ.showMessage("Sucess", ["Printer Added sucessfully."]);
            }
            else {
              console.log(res.ErrorMessage);
              this.msgBoxServ.showMessage("failed", [" please check log for details."]);
              this.SetFocusById('referrerName');
            }
          });
      }
    }

  }

  UpdatePrinterSetting() {
    for (var i in this.PrinterSettings.PrinterSettingsValidator.controls) {
      this.PrinterSettings.PrinterSettingsValidator.controls[i].markAsDirty();
      this.PrinterSettings.PrinterSettingsValidator.controls[i].updateValueAndValidity();
    }

    if (this.PrinterSettings.IsValidCheck(undefined, undefined)) {
      // if (this.PrinterSettings.PrintingType == 'dotmatrix' && !this.PrinterSettings.PrinterName) {
      //   this.msgBoxServ.showMessage("failed", ["Printer Name Mandatory for dotmatrix printer."]);
      //   return;
      // }
      // if (this.PrinterSettings.PrintingType == 'dotmatrix' && !this.PrinterSettings.ModelName) {
      //   this.msgBoxServ.showMessage("failed", ["Model Name Mandatory for dotmatrix printer."]);
      //   return;
      // }
      //this.CheckValidation();
      if (this.CheckValidation()) {
        this.settingsBlService.UpdatePrinterSetting(this.PrinterSettings)
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status == "OK") {
              this.callbackAdd.emit({ action: "edit", data: res.Results });
              this.PrinterSettings = new PrinterSettingsModel();
              this.msgBoxServ.showMessage("Sucess", ["Updated."]);
            }
            else {
              console.log(res.ErrorMessage);
              this.msgBoxServ.showMessage("failed", ["please check log for details."]);
              this.SetFocusById('referrerName');
            }
          });
      }
    }
  }


  close() {
    this.PrinterSettings = new PrinterSettingsModel();
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

  CheckValidation(): boolean {
    if (this.PrinterSettings.PrintingType == 'dotmatrix' && !this.PrinterSettings.PrinterName && !this.PrinterSettings.ModelName &&
      !this.PrinterSettings.Width_Lines && !this.PrinterSettings.Height_Lines && !this.PrinterSettings.mh && !this.PrinterSettings.ml) {
      this.msgBoxServ.showMessage("failed", ["Check Mandatory field."]);
      return false;
    }

    if (this.PrinterSettings.PrintingType == 'server' && !this.PrinterSettings.ServerFolderPath) {
      this.msgBoxServ.showMessage("failed", ["ServerFolderPath is Mandotory for Server printer."]);
      return false;
    }
    return true;
  }
}
