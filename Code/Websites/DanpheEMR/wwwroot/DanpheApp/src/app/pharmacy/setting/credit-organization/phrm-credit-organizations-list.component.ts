import { Component, ChangeDetectorRef } from "@angular/core";
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import { PharmacyService } from '../../shared/pharmacy.service';
import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { CreditOrganization } from "../../shared/pharmacy-credit-organizations.model";

import * as moment from 'moment/moment';
@Component({
    selector: 'credit-organization-list',
    templateUrl: "./phrm-credit-organizations-list.html"
})
export class CreditOrganizationListComponent {
    public creditOrganizationList: Array<CreditOrganization> = new Array<CreditOrganization>();
    public CurrentCreditOrganization: CreditOrganization = new CreditOrganization();
    public showGrid: boolean = false;
    public creditOrganizationGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedItem: CreditOrganization;
    //   public index: number;
    public selectedID: null;

    constructor(public pharmacyBLService: PharmacyBLService,
        public pharmacyServ: PharmacyService,
        public changeDetector: ChangeDetectorRef) {
        this.creditOrganizationGridColumns = PHRMGridColumns.creditOrganizationList;
        this.getCreditOrganizationList();
    }
    public getCreditOrganizationList() {
        this.pharmacyBLService.GetCreditOrganizationList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.creditOrganizationList = res.Results;
                    this.showGrid = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }
    CreditOrganizationGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                this.selectedItem = null;
                // this.index = $event.RowIndex;
                this.selectedID = $event.Data.OrganizationId;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedItem = $event.Data;
                this.showAddPage = true;
            }
            default:
                break;
        }
    }
    AddCreditOrganization() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        this.creditOrganizationList.push($event.creditOrganization);
        if (this.selectedID != null) {
            let i = this.creditOrganizationList.findIndex(a => a.OrganizationId == this.selectedID);
            this.creditOrganizationList.splice(i, 1);
        }
        this.creditOrganizationList = this.creditOrganizationList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedItem = null;
        //  this.index = null;
        this.selectedID = null;

    }
}
