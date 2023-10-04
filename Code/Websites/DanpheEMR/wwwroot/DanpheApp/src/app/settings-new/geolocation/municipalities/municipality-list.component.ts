import { Component, ChangeDetectorRef } from '@angular/core';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SettingsService } from '../../shared/settings-service';
import { CountrySubdivision } from '../../shared/country-subdivision.model';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { CoreService } from '../../../core/shared/core.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

@Component({
    templateUrl: './municipality-list.html',
    styles: ['.bg-red{background: red;}']
})

export class MunicipalityListComponent {
    public municipalityList: Array<any> = new Array<any>();
    public showAddPage: boolean = false;
    public showDisableAlert: boolean = false;
    public municipalityGridColumns: any;

    public selectedMunicipality: any;
    public selectedIdToEnableDisable: number = 0;


    constructor(public settingsBLService: SettingsBLService, public coreService: CoreService,
        public settingServ: SettingsService, public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        this.municipalityGridColumns = this.settingServ.settingsGridCols.MunicipalityList;
        this.GetAllMunicipalities();
    }

    public GetAllMunicipalities() {
        this.coreService.loading = true;
        this.settingsBLService.GetMunicipalities()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.municipalityList = res.Results;
                    this.coreService.loading = false;
                }
            }, (err) => { console.log(err); this.coreService.loading = false; });
    }

    AddMunicipality() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    MunicipalityGridActions($event: GridEmitModel) {
        this.selectedIdToEnableDisable = 0;
        switch ($event.Action) {
            case "edit": {
                this.selectedMunicipality = $event.Data;
                this.changeDetector.detectChanges();
                this.showAddPage = true;
                break;
            }
            case "disable": {
                this.selectedIdToEnableDisable = $event.Data.MunicipalityId;
                this.showDisableAlert = true;
                break;
            }
            case "enable": {
                this.selectedIdToEnableDisable = $event.Data.MunicipalityId;
                this.DisabeleEnableMunicipality();
                break;
            }
            default:
                break;
        }
    }


    CloseAddUpdatePopUp($event) {
        this.showAddPage = false;
        this.showDisableAlert = false;
        if ($event && $event.data) {
            this.GetAllMunicipalities();
        }
        this.selectedMunicipality = "";
    }

    DisabeleEnableMunicipality() {
        this.coreService.loading = true;
        if (this.selectedIdToEnableDisable > 0) {
            this.settingsBLService.UpdateMunicipalityStatus(this.selectedIdToEnableDisable)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.selectedIdToEnableDisable = 0;
                        this.coreService.loading = false;
                        this.showDisableAlert = false;
                        this.msgBoxServ.showMessage("success", ["Status successfyllu updated"]);
                        this.GetAllMunicipalities();
                    }
                }, err => {
                    console.log(err);
                    this.selectedIdToEnableDisable = 0;
                    this.coreService.loading = false;
                });
        }
    }
}
