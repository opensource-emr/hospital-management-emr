import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Router } from "@angular/router";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { NursingWardSubStoresMapModel } from "../../shared/nur-ward-substore-map.model";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";

@Component({
    selector: 'ward-substore-map-manage-edit',
    templateUrl: "./ward-substore-map-manage-edit.html"
})
export class WardSubstoreMapManageEditComponent {

    @Input("mapped-detail")
    mappedDetail: NursingWardSubStoresMapModel = new NursingWardSubStoresMapModel();
    mappedSubstoreWardDetails: Array<NursingWardSubStoresMapModel> = new Array<NursingWardSubStoresMapModel>();
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public settingsBLService: SettingsBLService, public settingsServ: SettingsService, public msgBox: MessageboxService, public router: Router,) {
    }
    ngOnInit() {
        if (this.mappedDetail.WardId > 0)
            this.GetSubstoreWardMapByWardId(this.mappedDetail.WardId);
    }
    Update() {
        this.settingsBLService.UpdateSubstoreMapData(this.mappedSubstoreWardDetails)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length > 0) {
                    this.Close();
                    this.msgBox.showMessage(ENUM_MessageBox_Status.Success, ["successfully Updated"]);
                }
                else {
                    this.msgBox.showMessage(ENUM_DanpheHTTPResponses.Failed, ["No data"]);
                }
            });
    }

    public GetSubstoreWardMapByWardId(WardId: number) {
        this.settingsBLService.GetSubstoreWardMapByWardId(WardId)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.mappedSubstoreWardDetails = res.Results;
                }
                else {
                    this.msgBox.showMessage(ENUM_DanpheHTTPResponses.Failed, ["No data"]);
                }
            });
    }
    onToggleRow(index) {
        let wardStoreMap = this.mappedSubstoreWardDetails[index];
        if (this.mappedSubstoreWardDetails.some((n) => n.IsDefault === true)) {
            this.mappedSubstoreWardDetails.forEach(row => {
                if (row.StoreId !== wardStoreMap.StoreId)
                    row.IsDefault = false;
            });
        }
    }
    Close() {
        this.mappedSubstoreWardDetails = [];
        this.callbackAdd.emit({ action: "close" });
    }
}