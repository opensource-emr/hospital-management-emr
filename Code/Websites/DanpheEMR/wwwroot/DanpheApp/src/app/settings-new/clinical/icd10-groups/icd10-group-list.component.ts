import { Component, ChangeDetectorRef } from "@angular/core";
import { Reaction } from "../../shared/reaction.model";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

@Component({
    selector: "icd10-group-list",
    templateUrl: "./icd10-group-list.html"
})

export class ICD10GroupListComponent {
    public showAllList: boolean = false;
    public icdGroupColumns: Array<any> = null;
    public icdGroupList: Array<any> = new Array<any>();
    // public selectedID: null;

    constructor(public settingsServ: SettingsService, public settingBlServ: SettingsBLService, public changeDetector: ChangeDetectorRef) {
        this.icdGroupColumns = this.settingsServ.settingsGridCols.ICD10GroupList;
        this.GetICDGroupList();
    }



    GetICDGroupList() {
        this.settingBlServ.GetICDGroups()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.icdGroupList = res.Results;
                }
            });
        this.showAllList = true;
    }

    GridActionsCall($event: GridEmitModel) {

        switch ($event.Action) {
            // case "edit": {

            // }
            default:
                break;
        }
    }
}
