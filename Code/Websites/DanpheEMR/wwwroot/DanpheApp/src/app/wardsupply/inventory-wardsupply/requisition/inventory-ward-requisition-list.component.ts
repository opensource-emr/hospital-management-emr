import { Component } from "@angular/core";
import { Router } from '@angular/router';

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { Requisition } from "../../../inventory/shared/requisition.model";
import { RequisitionItems } from "../../../inventory/shared/requisition-items.model";
import { InventoryBLService } from "../../../inventory/shared/inventory.bl.service"
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';

@Component({
    templateUrl: "./inventory-ward-requisition-list.html" // "/InventoryView/RequisitionList"
})
export class InventoryRequisitionListComponent {
    public deptRequisitionList: Array<Requisition> = null;
    public deptwiseGridColumns: Array<any> = null;
    public itemRequisitionList: Array<any> = null;
    public itemwiseGridColumns: Array<any> = null;

    public itemchecked: boolean = true;
    public showItemwise: boolean = false;
    public index: number = 0;
    public itemId: number = 0;
    public itemName: string = null;

    constructor(
        public InventoryBLService: InventoryBLService,
        public inventoryService: InventoryService,
        public router: Router,
        public routeFrom: RouteFromService,
        public messageBoxService: MessageboxService) {
        this.deptwiseGridColumns = GridColumnSettings.DepartmentwiseRequisitionList;
        this.itemwiseGridColumns = GridColumnSettings.ItemwiseRequisitionList;
        //if (this.routeFrom.RouteFrom == "RequisitionDetails") {
        //    this.routeFrom.RouteFrom = null;
        //    this.itemchecked = false;
        //    this.LoadDeptwiseList("pending");
        //}
        //else
            this.LoadDeptwiseList("all");
    }
    //loading item wise requisition list
    LoadItemwiseList(): void {
        this.showItemwise = true;
        this.InventoryBLService.GetItemwiseRequistionList().
            subscribe(res => {
                if (res.Status == 'OK') {
                    this.itemRequisitionList = res.Results;
                }
                else {
                    this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
                }
            },
            err => {
                this.messageBoxService.showMessage("failed", ['failed to get Requisitions.....please check log for details.']);
            });
    }
    //grid actions for item-wise requisition list
    ItemGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "itemDispatch":
                {
                    // this.ItemDispatch($event.Data);
                    break;
                }
            default:
                break;
        }
    }

    BackToGrid() {
        this.showItemwise = false;
        this.LoadDeptwiseList("pending");
    }

    LoadDeptwiseList(status): void {
        this.showItemwise = false;
        //
        var Status = "";
        if (status == "pending") {
            Status = "active,partial";
        }
        else if (status == "complete") {
            Status = "complete";
        }
        else if (status == "all") {
            Status = "active,partial,complete,initiated";
        }
        else {
            Status = "initiated"
        }
        this.InventoryBLService.GetDeptwiseRequisitionList(Status)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.deptRequisitionList = res.Results
                }
                else {
                    this.messageBoxService.showMessage("failed", ['failed to get Requisitions.....please check log for details.']);
                    ;
                    console.log(res.ErrorMessage);
                }
            });
    }

    DeptGridAction($event: GridEmitModel) {
        switch ($event.Action) {
            case "requisitionDispatch":
                {
                    var data = $event.Data;
                    // this.RouteToDispatch(data);
                    break;
                }
            case "view":
                {
                    var data = $event.Data;
                    this.RouteToViewDetail(data);
                    break;
                }
            default:
                break;
        }
    }

    // RouteToDispatch(data) {
    //     //Pass the RequistionId and DepartmentName to Next page for getting DispatchItems using inventoryService
    //     this.inventoryService.Id = data.RequistionId;
    //     this.inventoryService.Name = data.DepartmentName;
    //     this.router.navigate(['/Inventory/InternalMain/Dispatch']);
    // }
    // //route to dispatch all by Item
    // ItemDispatch(item) {
    //     //Pass the ItemId and ItemName to Next page for getting DispatchAllItems using inventoryService
    //     this.inventoryService.Id = item.ItemId;
    //     this.inventoryService.Name = item.ItemName;
    //     this.router.navigate(['/Inventory/InternalMain/DispatchAll']);
    // }
    RouteToViewDetail(data) {
        //pass the Requisition Id to RequisitionView page for List of Details about requisition
        this.inventoryService.Id = data.RequistionId;
        this.inventoryService.Name = data.DepartmentName;
        this.router.navigate(['/WardSupply/Inventory/InventoryRequisitionDetails']);
    }
    //route to create Requisition page
    CreateRequisition() {
        this.router.navigate(['/WardSupply/Inventory/InventoryRequisitionItem']);
    }
}
