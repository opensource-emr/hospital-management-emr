import { Component, ChangeDetectorRef } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router'
import WARDGridColumns from './shared/ward-grid-cloumns';
import { GridEmitModel } from '../shared/danphe-grid/grid-emit.model';
import { WardInternalConsumption } from './shared/ward-internal-consumption.model';
import { MessageboxService } from '../shared/messagebox/messagebox.service';
import { WardSupplyBLService } from './shared/wardsupply.bl.service';
import { WardInternalConsumptionItems } from './shared/ward-internal-consumption-items.model';
import { SecurityService } from '../security/shared/security.service';





@Component({
    templateUrl: "./internal-consumption-list.html"
})

export class InternalConsumptionListComponent {
    public consumptioninternalColumns: Array<any> = [];
    public showConsumptionItemList: boolean = false;
    public consumptionLists: Array<WardInternalConsumption> = [];
    public consumptionItemLists: Array<WardInternalConsumptionItems> = [];
    public selectedConsumptionBy: string = "";
    public ConsumptionId: number = 0;
    public CurrentStoreId: number = 0;

    constructor(
        public router: Router,
        public wardSupplyBLService: WardSupplyBLService,
        public msgBoxServ: MessageboxService,
        public securityService: SecurityService,
        public messageboxService: MessageboxService
    ) {

        this.consumptioninternalColumns = WARDGridColumns.ShowInternalConsumptionList;

        try {
            this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
            if (!this.CurrentStoreId) {
                this.LoadSubStoreSelectionPage();
            }
            else {
                this.GetInternalConsumptionList();
            }
        }
        catch (ex) {
            this.messageboxService.showMessage("Error", [ex]);
        }
    }

    LoadSubStoreSelectionPage() {
        this.router.navigate(['/WardSupply']);
    }
    GetInternalConsumptionList() {
        this.wardSupplyBLService.GetInternalConsumptionList(this.CurrentStoreId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.consumptionLists = res.Results;
                }
            })
    }

    AddInternalConsumption() {
        this.router.navigate(["/WardSupply/Pharmacy/InternalConsumption"]);
    }

    ConsumptionListGridAction($event: GridEmitModel) {
        switch ($event.Action) {
            case "view":
                {
                    var data = $event.Data;
                    this.showConsumptionItemList = true;
                    //this.GetConsumptionItems(data);
                    this.ConsumptionId = $event.Data.ConsumptionId;
                }
                break;
            default:
                break;
        }
    }

    GetConsumptionItems(data) {
        this.selectedConsumptionBy = data.ConsumedBy;
        let consumptionId = data.ConsumptionId;
        this.wardSupplyBLService.GetInternalConsumptionItemList(consumptionId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.consumptionItemLists = res.Results;
                } else {
                    this.msgBoxServ.showMessage("failed", ['Failed to get List.' + res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to get List.' + err.ErrorMessage]);
                }
            )

    }

    ShowPatientConsumption() {
        this.router.navigate(["/WardSupply/Pharmacy/Consumption"]);
    }
    Close() {
        this.showConsumptionItemList = false;
        this.selectedConsumptionBy = "";
        this.consumptionItemLists = new Array<WardInternalConsumptionItems>();
    }
}



