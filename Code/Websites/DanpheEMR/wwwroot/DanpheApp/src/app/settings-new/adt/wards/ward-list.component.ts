
import { Component, ChangeDetectorRef } from "@angular/core";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { Ward } from '../../../adt/shared/ward.model';


@Component({
    selector: 'ward-list',
    templateUrl: './ward-list.html',
})
export class WardListComponent {
    public wardList: Array<Ward> = new Array<Ward>();
    public showGrid: boolean = false;
    public wardGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedItem: Ward;
    public selectedID: null;

    constructor(public settingsBLService: SettingsBLService,
        public settingsServ: SettingsService,
        public changeDetector: ChangeDetectorRef) {
        this.wardGridColumns = this.settingsServ.settingsGridCols.WardList;
        this.getWardList();
    }
    public getWardList() {
        this.settingsBLService.GetWardList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.wardList = res.Results;
                    this.showGrid = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }
    WardGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                this.selectedItem = null;
                this.selectedID = $event.Data.WardId;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedItem = $event.Data;
                this.showAddPage = true;
            }
            default:
                break;
        }
    }
    AddWard() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        let i = this.wardList.findIndex(a => a.WardId == this.selectedID);
        if (i >= 0) {
            this.wardList.splice(i, 1,$event.ward);
        }
        else{
            this.wardList.splice(0,0,$event.ward);
        }
        this.wardList = this.wardList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedItem = null;
        this.selectedID = null;
    }
}
