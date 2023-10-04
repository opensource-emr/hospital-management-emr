import { Component, ChangeDetectorRef } from '@angular/core';
import { Country } from '../../shared/country.model';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { DanpheCache, MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";
@Component({
    selector: 'country-list',
    templateUrl: './country-list.html'
})

export class CountryListComponent {
    public countryList: Array<Country> = new Array<Country>();
    public showCountryList: boolean = true;
    public countryGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedCountry: Country;
   // public index: number;
    public selectedID: null;

    constructor(public settingsBLService: SettingsBLService,
        public settingsServ: SettingsService,
        public changeDetector: ChangeDetectorRef) {

        this.countryGridColumns = this.settingsServ.settingsGridCols.CountryList;
        this.getCountryList();

    }

    public getCountryList() {
		this.countryList = DanpheCache.GetData(MasterType.Country,null);
		
        // this.settingsBLService.GetCountries()
            // .subscribe(res => {
                // if (res.Status = "OK") {
                    // this.countryList = res.Results;
                // }

            // });
        this.showCountryList = true;
    }

    AddCountry() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CountryGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                this.selectedCountry = null;
                //  this.index = $event.RowIndex;
                this.selectedID = $event.Data.CountryId;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedCountry = $event.Data;
                this.showAddPage = true;
            }
            default:
                break;
        }
    }

    CallBackAdd($event) {
        this.countryList.push($event.country);
        if (this.selectedID != null) {
            let i = this.countryList.findIndex(a => a.CountryId == this.selectedID);
            this.countryList.splice(i, 1);
        }
        this.countryList = this.countryList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedCountry = null;
        //  this.index = null;
        this.selectedID = null;
    }

}
