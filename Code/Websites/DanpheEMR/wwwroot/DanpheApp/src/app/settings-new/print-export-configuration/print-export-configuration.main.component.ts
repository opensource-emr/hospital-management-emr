import { Component } from "@angular/core";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { CoreService } from "../../core/shared/core.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { PrintExportConfigurationModel } from "../shared/print-export-config.model";
import { SettingsService } from "../shared/settings-service";
import { SettingsBLService } from "../shared/settings.bl.service";

@Component({
    templateUrl: './print-export-configuration.main.html',
  })
export class PrintExportConfigurationMainComponent {
    public PrintExportConfigurationColumns = null;
    public configurationList:any;
    public showAddNewPage: boolean = false;
    public configurationToEdit: PrintExportConfigurationModel = null;
    constructor(public settingsServ: SettingsService,
        public settingsBlService: SettingsBLService,
        public msgBoxServ: MessageboxService,
        public coreService: CoreService,) {
        this.PrintExportConfigurationColumns = this.settingsServ.settingsGridCols.PrintExportConfigurationColumns;
        this.configurationList = this.coreService.allPrintExportConfiguration;
    }

    ConfigurationGridActions($event: GridEmitModel) {
        switch ($event.Action) {
          case "edit": {
            this.configurationToEdit = new PrintExportConfigurationModel();
            this.configurationToEdit = Object.assign(this.configurationToEdit, $event.Data);
            this.showAddNewPage = true;
          }
          default:
            break;
        }
      }
    
      ShowAddNewPage() {
        this.configurationToEdit = null;
        this.showAddNewPage = true;
      }
    
      getDataFromAdd($event) {
        this.coreService.GetPrintExportConfiguration();
        setTimeout(() => {
          this.configurationList = this.coreService.allPrintExportConfiguration;
        }, 500);
        this.showAddNewPage=false; 
      }
      
}