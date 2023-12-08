import { ChangeDetectorRef, Component } from '@angular/core';
import { CoreService } from '../../../core/shared/core.service';
import { GeneralFieldLabels } from '../../../shared/DTOs/general-field-label.dto';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SettingsService } from '../../shared/settings-service';
import { SettingsBLService } from '../../shared/settings.bl.service';

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
    public GeneralFieldLabel = new GeneralFieldLabels();



    constructor(public settingsBLService: SettingsBLService, public coreService: CoreService,
        public settingServ: SettingsService, public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef) {

        this.GeneralFieldLabel = coreService.GetFieldLabelParameter();

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
