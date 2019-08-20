import { Component } from "@angular/core";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { InventoryService } from "../shared/inventory.service";
import { Router } from "@angular/router";
import { WriteOffItems } from "../shared/write-off-items.model";

@Component({
    templateUrl: "./write-off-items-list.component.html"
})

export class WriteOffItemsListComponent {

    public writeOffItemList: Array<WriteOffItems> = new Array<WriteOffItems>();
    public writeOffItemColumn: Array<any> = null;
    constructor(
        public inventoryBLService: InventoryBLService,
        public messageBoxService: MessageboxService,
    ) {
        this.writeOffItemColumn = GridColumnSettings.writeOffItemColumn;
        this.GetWriteOffItemList();
    }

    GetWriteOffItemList() {
        this.inventoryBLService.GetWriteOffItemList().
            subscribe(res => {
                if (res.Status == "OK") {
                    this.writeOffItemList = res.Results;
                }
                else {
                    this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
                }
            });
    }
}