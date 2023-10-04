import { Component, ChangeDetectorRef } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";
import { PrinterSettingsModel } from "../printer-settings.model";


@Component({
  templateUrl: './list-printer-settings.html',
})
export class ListPrinterSettingsComponent {

  public PrinterSettingDetails: Array<PrinterSettingsModel> = new Array<PrinterSettingsModel>();
  public PrinterSettingGridColumns: Array<any> = null;
  public showAddNewPrinter: boolean = false;

  public selectedPrintersetting: PrinterSettingsModel = new PrinterSettingsModel();
  public receivedChildData: any;

  constructor(public settingsServ: SettingsService,
    public settingsBlService: SettingsBLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,) {

    this.PrinterSettingGridColumns = this.settingsServ.settingsGridCols.PrinterSettingGridColumns;
    this.LoadPrinterSettingList();

  }


  ngOnInit() {
    //this.PrinterSettingDetails = this.coreService.AllPrinterSettings;
  }

  public LoadPrinterSettingList() {
    this.settingsBlService.GetPrinterSettingList()
      .subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.PrinterSettingDetails = res.Results;
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          }
        },
        err => {
          this.msgBoxServ.showMessage("", [err.ErrorMessage])
        }
      );
  }

  PrinterSettingGridActions($event) {
    switch ($event.Action) {
      case "edit": {
        console.log($event);
        this.selectedPrintersetting = $event.Data;
        this.showAddNewPrinter = true;
        break;
      }
      case "deactivatePrinterSetting": {
        let proceed: boolean = true;
        proceed = window.confirm("This setting will not be seen to user. Are you Sure ?")
        if (proceed) {
          this.selectedPrintersetting = $event.Data;
          this.selectedPrintersetting.IsActive = false;
          this.UpdatePrinterSetting();
        }
        break;
      }
      case "activatePrinterSetting": {
        this.selectedPrintersetting = $event.Data;
        this.selectedPrintersetting.IsActive = true;
        this.UpdatePrinterSetting();
        break;
      }
      default:
        break;
    }
  }

  GetDataFromAdd($event) {
    console.log($event);
    this.LoadPrinterSettingList();
    this.showAddNewPrinter = false;
  }

  ShowAddNewPrinter() {
    this.selectedPrintersetting = null;
    this.showAddNewPrinter = true;
  }

  UpdatePrinterSetting() {
    this.settingsBlService.UpdatePrinterSetting(this.selectedPrintersetting)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.selectedPrintersetting = new PrinterSettingsModel();
          this.LoadPrinterSettingList();
          this.msgBoxServ.showMessage("Sucess", ["Updated."]);
        }
        else {
          console.log(res.ErrorMessage);
          this.msgBoxServ.showMessage("failed", ["please check log for details."]);
        }
      });
  }
}