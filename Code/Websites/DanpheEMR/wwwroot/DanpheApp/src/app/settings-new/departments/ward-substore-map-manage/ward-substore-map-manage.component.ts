import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import * as _ from 'lodash';
import { Ward } from "../../../adt/shared/ward.model";
import { PHRMStoreModel } from "../../../pharmacy/shared/phrm-store.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { NursingWardSubStoresMapModel } from "../../shared/nur-ward-substore-map.model";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";
@Component({
    selector: 'ward-substore-map-manage-add',
    templateUrl: "./ward-substore-map-manage.html"
})
export class WardSubstoreMapManageAddComponent {
    public wardList: Array<Ward> = new Array<Ward>();
    public selectedWard: Ward = null;
    public subStoreList: Array<PHRMStoreModel> = new Array<PHRMStoreModel>();
    public selectedStore: PHRMStoreModel = null;
    public wardStoreMap: NursingWardSubStoresMapModel = new NursingWardSubStoresMapModel();
    public wardStoreMapData: Array<NursingWardSubStoresMapModel> = new Array<NursingWardSubStoresMapModel>();
    public wardId: number = 0;
    public storeId: number = 0;
    @Input("wardStoreMapDataList")
    public wardStoreMapDataList: Array<NursingWardSubStoresMapModel> = new Array<NursingWardSubStoresMapModel>();

    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    isWardSelected: boolean = false;
    constructor(public settingsBLService: SettingsBLService,
        public settingsServ: SettingsService,
        public changeDetector: ChangeDetectorRef,
        public msgBox: MessageboxService,) {
        this.getWardList();
        this.GetActiveSubStore();

    }

    public getWardList() {
        this.settingsBLService.GetWardList()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.wardList = res.Results;
                }
                else {
                    this.msgBox.showMessage(ENUM_MessageBox_Status.Notice, ["No data"]);
                }
            });
    }
    GetActiveSubStore() {
        this.settingsBLService.GetActiveStoreList()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.subStoreList = res.Results;
                }
            });
    }
    wardListFormatter(data: any): string {
        let html = data["WardName"];
        return html;
    }
    storeListFormatter(data: any): string {
        let html = data["Name"];
        return html;
    }
    OnWardChange() {
        if (this.selectedWard) {
            this.wardStoreMap.WardId = this.selectedWard.WardId;
            this.wardStoreMap.WardName = this.selectedWard.WardName;
            this.isWardSelected = true;
        }
    }
    OnStoreChange() {
        if (this.selectedStore) {
            this.wardStoreMap.StoreId = this.selectedStore.StoreId;
            this.wardStoreMap.StoreName = this.selectedStore.Name;
        }
    }
    Close() {
        this.wardStoreMap = null;
        this.callbackAdd.emit({ action: "close" });
    }

    Save() {
        const isAvailable: boolean = this.wardStoreMapData.some(c => c.StoreId !== null && c.WardId !== null);
        if (!isAvailable) {
            return this.msgBox.showMessage(ENUM_MessageBox_Status.Error, ["Please select Ward and store"]);
        }

        const isPresentInDb = this.wardStoreMapDataList.length > 0 ? this.wardStoreMapDataList.find(r => r.WardId === this.selectedWard.WardId) : undefined;
        const IsDefaultCount = this.wardStoreMapData.reduce((count, obj) => count + (obj.IsDefault ? 1 : 0), 0);


        if (!isPresentInDb) {
            if (IsDefaultCount > 1) {
                return this.msgBox.showMessage(ENUM_MessageBox_Status.Error, ["Not allowed to make multiple substore as default"]);
            }
            if (IsDefaultCount === 0) {
                return this.msgBox.showMessage(ENUM_MessageBox_Status.Error, ["One of the substore need to be default"]);
            }
        }
        else {
            if (IsDefaultCount) {
                return this.msgBox.showMessage(ENUM_MessageBox_Status.Error, ["This ward already has a default substore, Please uncheck the IsDefault checkbox"]);
            }
        }


        this.settingsBLService.PostNursingWardSupplyMap(this.wardStoreMapData)
            .subscribe(
                (res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length > 0) {
                        this.msgBox.showMessage(ENUM_MessageBox_Status.Success, ["Successfully Added"]);
                        this.wardStoreMap = new NursingWardSubStoresMapModel();
                        this.wardStoreMapData = [];
                        this.Close();
                    }
                    else {
                        this.msgBox.showMessage(ENUM_MessageBox_Status.Failed, [`${res.ErrorMessage}`]);
                    }
                },
                err => {
                    this.msgBox.showMessage(ENUM_MessageBox_Status.Failed, err.ErrorMessage);
                });
    }

    Add() {
        if (!this.selectedStore && !this.selectedWard && !this.selectedStore.StoreId && !this.selectedWard.WardId) {
            return this.msgBox.showMessage(ENUM_MessageBox_Status.Error, ["Please select Ward and store"]);
        }

        const isPresent = this.wardStoreMapData.find(r => r.StoreId === this.selectedStore.StoreId && r.WardId === this.selectedWard.WardId);
        if (isPresent) {
            return this.msgBox.showMessage(ENUM_MessageBox_Status.Notice, ["This ward and substore are already in below list"]);
        }
        const isPresentInDb = this.wardStoreMapDataList.length > 0 ? this.wardStoreMapDataList.find(r => r.StoreId === this.selectedStore.StoreId && r.WardId === this.selectedWard.WardId) : undefined;

        if (isPresentInDb) {
            return this.msgBox.showMessage(ENUM_MessageBox_Status.Notice, ["This ward and substore are already mapped"]);
        }

        const wardStore = _.cloneDeep(this.wardStoreMap);
        this.wardStoreMapData.push(wardStore);

        if (this.wardStoreMapData.length > 0) {
            this.wardId = this.selectedWard.WardId;
            this.storeId = this.selectedStore.StoreId;
            this.selectedStore = null;
        }

    }


    DeleteRow(index) {
        this.wardStoreMapData.splice(index, 1);
    }
    onToggleRow(index) {
        let wardStoreMap = this.wardStoreMapData[index];
        if (this.wardStoreMapData.some((n) => n.IsDefault === true)) {
            this.wardStoreMapData.forEach(row => {
                if (row.WardId !== wardStoreMap.WardId && row.StoreId !== wardStoreMap.StoreId) {
                    row.IsDefault = false;
                }
            });
        }
    }
    Discard() {
        this.isWardSelected = false;
        this.selectedStore = null;
        this.selectedWard = null;
        this.wardStoreMapData = [];
    }
}