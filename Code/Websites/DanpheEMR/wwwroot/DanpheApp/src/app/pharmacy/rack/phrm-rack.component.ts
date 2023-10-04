import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { FormGroup, FormControl } from '@angular/forms'
import { RouterOutlet, RouterModule } from '@angular/router'
import { PhrmRackService } from "../shared/rack/phrm-rack.service"
import PHRMGridColumns from "../shared/phrm-grid-columns"
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../shared/routefrom.service";
import { PhrmRackModel } from '../shared/rack/phrm-rack.model';
import { ENUM_DanpheHTTPResponses, ENUM_StockLocations } from '../../shared/shared-enums'
import { PharmacyBLService } from '../shared/pharmacy.bl.service'
import { DanpheHTTPResponse } from '../../shared/common-models'
import * as moment from 'moment'

@Component({
    templateUrl: "./phrm-rack.html",
})
export class PhrmRackComponent {

    public rackList: Array<PhrmRackModel> = new Array<PhrmRackModel>();
    public rackListFiltered: Array<PhrmRackModel> = new Array<PhrmRackModel>();
    public rackGridColumns: Array<any>;
    public showAddPage: boolean = false;
    public showDrugListPage: boolean = false;
    public drugList: any = [];
    public rackName: string = null;
    public StoreList: Array<Store> = new Array<Store>();
    public selectedStore: Store = new Store();
    public rack: PhrmRackModel = new PhrmRackModel();
    public selIndex: number = null;
    public ParentRackList: Array<PhrmRackModel> = new Array<PhrmRackModel>();
    constructor(public phrmRackService: PhrmRackService, public routeFromService: RouteFromService,
        public messageboxService: MessageboxService, public changeDetector: ChangeDetectorRef,
        public pharmacyBLService: PharmacyBLService) {

        this.rackGridColumns = PHRMGridColumns.PHRMRackList;
        this.GetLocationList();
        this.GetParentList();
    }
    public GetLocationList(): void {
        this.pharmacyBLService.GetAllPharmacyStore().subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                let StoreList = []
                StoreList = res.Results;
                // StoreList.unshift({ StoreId: null, StoreName: 'All' });
                 this.StoreList = StoreList;
            }
        })
    }
    ngOnInit() {
        this.getRack();
    }

    pushToList($event): void {
        const newRack = $event.newRack
        newRack.StoreName = this.StoreList.find(s => s.StoreId === newRack.StoreId).StoreName;
        if (this.selIndex != null) {
            this.ParentRackList[this.selIndex] = newRack;
            this.rackList[this.selIndex] = newRack;
        }
        else {
            this.ParentRackList.unshift(newRack);
            this.rackList.unshift(newRack);
            this.showAddPage = false;
        }
        this.ParentRackList = this.ParentRackList.slice();
        this.rackList = this.rackList.slice();
        this.FilterRackBasedOnLocation();
    }

    getRack(): void {
        try {
            this.phrmRackService.GetRackList()
                .subscribe(res => {
                    this.rackList = res;
                    this.rackListFiltered = this.rackList;
                });
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    RackGridActions($event: GridEmitModel): void {
        var action = $event.Action;
        switch (action) {
            case 'view': {
                this.showDrugListPage = false;
                this.changeDetector.detectChanges();
                this.rackName = $event.Data.RackNo;
                this.getDrugList($event.Data.RackId, $event.Data.StoreId);
                this.showDrugListPage = true;
                break;
            }
            case 'edit': {
                this.rack = null;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.selIndex = $event.RowIndex;
                this.rack = $event.Data;
                this.showAddPage = true;
                break;
            }
        }
    }

    getDrugList(rackId, StoreId): void {
        try {
            this.phrmRackService.GetDrugList(rackId, StoreId)
                .subscribe(res => {
                    this.drugList = [];
                    let response = JSON.parse(res)
                    if (response.Status == ENUM_DanpheHTTPResponses.OK) {
                        this.drugList = response.Results;
                    }
                });
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    ShowCatchErrMessage(exception): void {
        if (exception) {
            let ex: Error = exception;
            this.routeFromService.RouteFrom = null;
            this.messageboxService.showMessage("error", ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }

    AddRack(): void {
        this.selIndex = null;
        this.showAddPage = false;
        this.rack = new PhrmRackModel();
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }
    FilterRackBasedOnLocation(): void {
        if (this.selectedStore && this.selectedStore.StoreId) {
            this.rackListFiltered = this.rackList.filter(rack => rack.StoreId === this.selectedStore.StoreId)
        }
        else {
            this.rackListFiltered = this.rackList;
        }
    }
    GetParentList(): void {
        this.phrmRackService.GetAllRackList()
            .subscribe(res => {
                let ParentRackList = [];
                ParentRackList = res;
                ParentRackList.unshift({ RackId: null, RackNo: 'None', StoreId: null });
                this.ParentRackList = ParentRackList;
                this.ParentRackList = this.ParentRackList.slice();
            });
    }
    gridExportOptions = {
        fileName: 'Rack_Report' + moment().format('YYYY-MM-DD') + '.xls',
    };
}
export class Store {
    StoreId: number = null;
    StoreName: string = null;
}
