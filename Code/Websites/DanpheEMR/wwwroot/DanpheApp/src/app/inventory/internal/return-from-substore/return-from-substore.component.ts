import { Component, OnInit } from "@angular/core";
import * as moment from "moment";
import { PHRMStoreModel } from "../../../pharmacy/shared/phrm-store.model";
import { ActivateInventoryService } from "../../../shared/activate-inventory/activate-inventory.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { ReturnItem } from "./return-item.model";


@Component({
    selector: 'return-from-substore',
    templateUrl: './return-from-substore.component.html',
    styles: []
})
export class ReturnFromSubstoreComponent implements OnInit {
    public ReturnFromSubstoreColumn: Array<any> = null;
    public fromDate: string = moment().format('YYYY-MM-DD');
    public toDate: string = moment().format('YYYY-MM-DD');
    public dateRange: string = null;
    private currentActiveInventory: PHRMStoreModel;
    public substores: Array<Substore> = new Array<Substore>();
    public selectedStore: Substore = new Substore();
    public returnedItemList: Array<ReturnItem> = new Array<ReturnItem>();
    public sourceSubstoreId: number = null;
    public returnedItem: ReturnItem = new ReturnItem();
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    showReceiveStockPopUp: boolean = false;
    showViewPopUp: boolean = false;
    returnId: number = 0;
    public isReceived: boolean;
    public Status: string = "";
    selecteditems: ReturnItem = new ReturnItem();
    constructor(public messageBoxService: MessageboxService, public _activeInvService: ActivateInventoryService, public inventoryBLService: InventoryBLService,
    ) {
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreatedOn', false), new NepaliDateInGridColumnDetail('ReceivedOn', false));
        this.ReturnFromSubstoreColumn = GridColumnSettings.ReturnFromSubstore;
        this.currentActiveInventory = _activeInvService.activeInventory;

        this.GetAllSubstores();
    }

    ngOnInit(): void {
    }
    OnDateRangeChange($event) {
        this.fromDate = $event ? $event.fromDate : this.fromDate;
        this.toDate = $event ? $event.toDate : this.toDate;
        if (this.fromDate != null && this.toDate != null) {
            if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
                this.GetReturnItems(this.fromDate, this.toDate, this.currentActiveInventory.StoreId, this.sourceSubstoreId);
            } else {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Please enter valid From date and To date"]);
            }

        }
    }
    ShowReturnData() {
        if (this.fromDate != null && this.toDate != null) {
            if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
                this.GetReturnItems(this.fromDate, this.toDate, this.currentActiveInventory.StoreId, this.sourceSubstoreId);
            } else {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Please enter valid From date and To date"]);
            }

        }
    }
    Close() {
        this.showViewPopUp = false;
        this.showReceiveStockPopUp = false;
    }
    gridExportOptions = {
        fileName: 'Returnfromsubstore' + moment().format('YYYY-MM-DD') + '.xls',
    };
    GetReturnItems(fromDate: string, toDate: string, storeid: number, sourceSubstoreId: number) {
        this.returnedItemList = [];
        this.inventoryBLService.GetReturnItemsFromSubstore(fromDate, toDate, storeid, sourceSubstoreId)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == ENUM_DanpheHTTPResponseText.OK && res.Results.length > 0) {
                    this.returnedItemList = res.Results;
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["There is no Returned Items available"]);
                }
            })
    }
    GetAllSubstores() {
        this.inventoryBLService.GetAllSubStores()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == ENUM_DanpheHTTPResponseText.OK && res.Results.length > 0) {
                    this.substores = res.Results;
                    this.substores.unshift({ StoreId: null, StoreName: 'All' });
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["There is no requisition available"]);
                }
            })
    }
    AssignSelectedSubstore($event) {
        this.sourceSubstoreId = $event.StoreId;
    }
    ReturnListFormatter(data: any): string {
        return data["StoreName"];
    }
    SubstoreReturnActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "Receive": {
                this.showReceiveStockPopUp = true;
                this.selecteditems = $event.Data;
                break;
            }
            case "view": {
                this.selecteditems = null;
                this.showViewPopUp = true;
                this.selecteditems = $event.Data;
                break;
            }
            default:
                break;
        }
    }
    GetReturnId($event) {
        this.returnId = $event.data;
        this.GetReturnItems(this.fromDate, this.toDate, this.currentActiveInventory.StoreId, this.sourceSubstoreId);

    }
}

export class Substore {
    StoreId: number = null;
    StoreName: string = "";
}
