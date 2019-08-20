import { Injectable, Directive } from '@angular/core';
import { SettingsGridColumnSettings } from "../../shared/danphe-grid/settings-grid-column-settings";
import { CoreService } from "../../core/shared/core.service";
@Injectable()
export class SettingsService {
    public settingsGridCols: SettingsGridColumnSettings;

    constructor(public coreService: CoreService) {
        this.settingsGridCols = new SettingsGridColumnSettings(this.coreService.taxLabel)
    }
    

}