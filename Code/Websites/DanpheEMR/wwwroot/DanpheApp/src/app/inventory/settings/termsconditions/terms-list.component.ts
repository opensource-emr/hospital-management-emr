import { Component, ChangeDetectorRef } from '@angular/core';
import { TermsConditionsMasterModel } from '../../shared/terms-conditions-master.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

@Component({
    selector: 'terms-list',
    templateUrl: './terms-list.html',
})

export class TermsListComponent {

    public TermsGridColumns: Array<any> = null;
    public showTermsList: boolean = true;
    public index: number;
    public showAddPage: boolean = false;
    public allTermsLists: Array<TermsConditionsMasterModel> = new Array<TermsConditionsMasterModel>();
    public selTermslist: Array<TermsConditionsMasterModel> = new Array<TermsConditionsMasterModel>();

    constructor(public invSettingBL: InventorySettingBLService,
        public changeDetector: ChangeDetectorRef) {
        this.TermsGridColumns = GridColumnSettings.TermsConditionsList
        this.getTermsList();
    }



    public getTermsList() {
        this.invSettingBL.GetTermsConditions()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.allTermsLists = res.Results;
                    this.showTermsList = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }

    showAddTerms() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }


    TermsGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                this.selTermslist = null;
                this.index = $event.RowIndex;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.selTermslist = $event.Data;
                this.showAddPage = true;
            }
            default:
                break;
        }
    }

    CallBackAdd($event) {        
        if (this.index != null) {
            this.allTermsLists.splice(this.index, 1, $event.terms);
      
        }
        else {
            this.allTermsLists.push($event.terms);
        }
        this.allTermsLists = this.allTermsLists.slice();
        this.showAddPage = false;
        this.selTermslist = null;
        this.index = null;
    }

}