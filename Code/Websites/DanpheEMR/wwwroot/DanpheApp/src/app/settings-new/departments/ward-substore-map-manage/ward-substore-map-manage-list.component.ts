import { Component } from "@angular/core";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses } from "../../../shared/shared-enums";
import { NursingWardSubStoresMapModel } from "../../shared/nur-ward-substore-map.model";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";

@Component({
    selector: 'ward-substore-map-manage-list',
    templateUrl: "./ward-substore-map-manage-list.html"
})
export class WardSubstoreMapManageListComponent {
    showAddPopup: boolean = false;
    substoreWardMapGridColumns: Array<any> = null;
    showUpdatePopup: boolean = false;
    mappedDetail: NursingWardSubStoresMapModel = new NursingWardSubStoresMapModel();
    substoreWardMapList: Array<NursingWardSubStoresMapModel> = new Array<NursingWardSubStoresMapModel>();
    constructor(public settingsBLService: SettingsBLService, public settingsServ: SettingsService, public msgBox: MessageboxService) {
        this.substoreWardMapGridColumns = this.settingsServ.settingsGridCols.SubstoreWardMapListCols;
        this.getSubstoreWardMapList();
    }

    AddWardSubstoreMap() {
        this.showAddPopup = true;
    }
    CallBackAdd($event) {
        this.showAddPopup = false;
        this.showUpdatePopup = false;
        this.getSubstoreWardMapList();
    }
    StoreWardGridActions($event) {
        switch ($event.Action) {
            case "edit": {
                this.showUpdatePopup = true;
                this.mappedDetail = $event.Data;
            }
        }
    }
    public getSubstoreWardMapList() {
        this.settingsBLService.GetSubstoreWardMap()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.substoreWardMapList = res.Results;
                }
                else {
                    this.msgBox.showMessage(ENUM_DanpheHTTPResponses.Failed, ["No data"]);
                }
            });
    }
}