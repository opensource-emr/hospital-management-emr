import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { TermsConditionsMasterModel } from '../../shared/terms-conditions-master.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { ENUM_TermsApplication } from '../../../shared/shared-enums';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

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

    public TermsApplicationId: number = ENUM_TermsApplication.Inventory; 

    constructor(public changeDetector: ChangeDetectorRef,
        public messageBoxService: MessageboxService,
        private _route: ActivatedRoute,
        private _http: HttpClient) {
        this.TermsGridColumns = GridColumnSettings.TermsConditionsList
    }
    ngOnInit() {
            this.getTermsList();
    }

    /*sanjit: 18May'20 : this component is used in both inventory and pharmacy and there is no service that is shared by these two module,
    hence, I have written the api call directly here.*/
    public getTermsList() {
        this._http.get<any>("/api/InventorySettings/GetTermsListByTermsApplicationId/"+ this.TermsApplicationId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.allTermsLists = res.Results;
                    this.showTermsList = true;
                }
                else {
                    console.log("Failed ! " + res.ErrorMessage);
                }

            },err =>{
                this.messageBoxService.showMessage("Failed",[err.error.ErrorMessage])
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
        if ($event != null) {
            //find the index of currently added/updated terms in the list of all items (grid)
            let index = this.allTermsLists.findIndex(a => a.TermsId == $event.terms.TermsId);
            //index will be -1 when this terms is currently added. 
            if (index < 0) {
                this.allTermsLists.splice(0, 0, $event.terms);//this will add this terms to 0th index.
            }
            else {
                this.allTermsLists.splice(index, 1, $event.terms);//this will replace one terms at particular index. 
            }
        }
        this.allTermsLists = this.allTermsLists.slice();
        this.showAddPage = false;
        this.selTermslist = null;
        this.index = null;
    }

}