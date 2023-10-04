import { Component, OnInit, OnDestroy, Input, EventEmitter, Output } from "@angular/core";
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { ReturnItem } from "./return-item.model";
@Component({
    selector: 'return-from-substore-detail',
    templateUrl: './return-from-substore-detail.component.html',
    styles: []
})
export class ReturnFromSubstoreDetailComponent implements OnInit {

    @Input('StoreId')
    StoreId: number;
    @Input('ItemId')
    ItemId: number;
    @Input('showReceiveStockPopUp')
    showReceiveStockPopUp: boolean = false;
    @Input('ReturnedItem')
    ReturnedItem: ReturnItem = new ReturnItem();
    ReturnId: number = null;
    IsReceived: boolean = false;
    @Output("callback")
    ReturnIdEmit: EventEmitter<Object> = new EventEmitter<Object>();
    @Input('showViewPopUp')
    showViewPopUp: boolean = false;
    @Output("callback-close")
    callbackClose: EventEmitter<Object> = new EventEmitter<Object>();


    ngOnInit(): void {

    }
    constructor(public messageBoxService: MessageboxService, public inventoryBLService: InventoryBLService
    ) {
    }
    ReceiveIncomingStock() {
        let ReturnId = this.ReturnedItem.ReturnId;
        let ReceivedRemarks = this.ReturnedItem.ReceivedRemarks;
        this.UpdateIncomingStock(ReturnId, ReceivedRemarks);
        this.Cancel();
    }
    Cancel() {
        this.callbackClose.emit();
    }
    UpdateIncomingStock(ReturnId: number, ReceivedRemarks: string) {
        this.inventoryBLService.ReceiveRetunedItems(ReturnId, ReceivedRemarks)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == ENUM_DanpheHTTPResponseText.OK && res.Results != null) {
                    this.ReturnId = res.Results;
                    this.IsReceived = true;
                    this.ReturnIdEmit.emit(this.ReturnId);
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Received"]);
                    this.Cancel();

                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Unable to receive item"]);
                }
            })
    }
}
