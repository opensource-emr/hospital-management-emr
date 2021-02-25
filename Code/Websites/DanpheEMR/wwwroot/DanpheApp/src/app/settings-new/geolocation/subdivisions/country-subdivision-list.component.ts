import { Component, ChangeDetectorRef } from '@angular/core';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SettingsService } from '../../shared/settings-service';
import { CountrySubdivision } from '../../shared/country-subdivision.model';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';

@Component({
    selector: 'country-subdivision-list',
    templateUrl: './country-subdivision-list.html'
})

export class CountrySubdivisionListComponent {
    public subDivisionList: Array<CountrySubdivision> = new Array<CountrySubdivision>();
    public showSubDivisionList: boolean = true;
    public subDivisionGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public update: boolean = false;
    public subDivisionSelected: CountrySubdivision;
    //  public index: number;
    public selectedID: null;


    constructor(public settingsBLService: SettingsBLService,
        public settingServ: SettingsService,
        public changeDetector: ChangeDetectorRef) {
        this.subDivisionGridColumns = this.settingServ.settingsGridCols.SubDivisionList;
        this.getSubDivisionList();
    }

    public getSubDivisionList() {
        
        // this.settingsBLService.GetSubDivisions()
        //     .subscribe(res => {
        //         if (res.Status == "OK") {
        //             this.subDivisionList = res.Results;
        //         }

        //     });
        this.subDivisionList=DanpheCache.GetData(MasterType.SubDivision,null);
         this.showSubDivisionList = true;

    }

    AddSubdivision() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.update = false;
        this.showAddPage = true;
    }

    SubdivisionGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.subDivisionSelected = null;
                //  this.index = $event.RowIndex;
                this.selectedID = $event.Data.CountrySubDivisionId;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.subDivisionSelected = $event.Data;
                this.showAddPage = true;
                this.update = true;
            }
            default:
                break;
        }
    }


    CallBackAdd($event) {


        this.subDivisionList.push($event.subdivision);

        if (this.selectedID != null) {
            let i = this.subDivisionList.findIndex(a => a.CountrySubDivisionId == this.selectedID);
            this.subDivisionList.splice(i, 1);
        }

        this.subDivisionList = this.subDivisionList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.subDivisionSelected = null;
        // this.index = null;
        this.selectedID = null;

    }
}
