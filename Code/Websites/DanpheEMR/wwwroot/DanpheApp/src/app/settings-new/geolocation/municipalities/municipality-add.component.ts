import { Component, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SettingsService } from '../../shared/settings-service';
import { CountrySubdivision, Municipality } from '../../shared/country-subdivision.model';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { CoreService } from '../../../core/shared/core.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

@Component({
    selector: 'municipality-add',
    templateUrl: './municipality-add.html'
})

export class MunicipalityAddComponent {
    @Input("selectedMunicipality") selectedMunicipality: any;
    @Output("callback-Add") callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    public countryList: Array<any>;
    public allSubDivisionListMaster: Array<any>;

    public countrySubDivisionList: Array<any>;
    public update: boolean;

    public model: Municipality = new Municipality();


    constructor(public settingsBLService: SettingsBLService, public msgBoxServ: MessageboxService,
        public settingServ: SettingsService, public coreService: CoreService,
        public changeDetector: ChangeDetectorRef) {
        this.GetCountryList();
        this.GetCountrySubdivisionList();
    }

    ngOnInit() {
        this.coreService.FocusInputById("ddlCountry");
        if (this.selectedMunicipality && this.selectedMunicipality.MunicipalityId) {
            let newMun = new Municipality();
            this.model = Object.assign(newMun, this.selectedMunicipality);
            this.CountryChanged(false);
            this.update = true;
        }
    }

    GetCountryList() {
        this.countryList = DanpheCache.GetData(MasterType.Country, null);
    }

    GetCountrySubdivisionList() {
        this.allSubDivisionListMaster = DanpheCache.GetData(MasterType.SubDivision, null);
    }

    CountryChanged(changeSubDivId = true) {
        if (this.model.CountryId > 0) {
            this.countrySubDivisionList = this.allSubDivisionListMaster.filter(d => d.CountryId == this.model.CountryId);
            this.coreService.FocusInputById("ddlCountrySubDivision");
        }
        if (changeSubDivId) {
            this.model.CountrySubDivisionId = null;
        }
    }

    SaveMunicipality() {
        this.coreService.loading = true;
        for (var i in this.model.MunicipalityValidator.controls) {
            this.model.MunicipalityValidator.controls[i].markAsDirty();
            this.model.MunicipalityValidator.controls[i].updateValueAndValidity();
        }

        if (this.model.IsValidCheck(undefined, undefined)) {
            this.settingsBLService.AddUpdateMunicipality(this.model)
                .subscribe(
                    res => {
                        if (this.model.MunicipalityId) {
                            this.msgBoxServ.showMessage("success", ["Municipality Added"]);
                        } else {
                            this.msgBoxServ.showMessage("success", ["Municipality Updated"]);
                        }
                        this.callbackAdd.emit({ close: true, data: this.model });
                        this.coreService.loading = false;
                    },
                    err => {
                        console.log(err);
                        this.coreService.loading = false;
                    });
        } else {
            this.coreService.loading = false;
        }
    }

    hotkeys(event) {
        if (event.keyCode == 27) {
            this.callbackAdd.emit({ close: true, data: null })
        }
    }
}
