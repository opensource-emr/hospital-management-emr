import { Component, ChangeDetectorRef } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router'

import { RouteFromService } from "../../shared/routefrom.service";
import { InventoryBLService } from "../shared/inventory.bl.service";
import { SecurityService } from '../../security/shared/security.service';
import { InventoryService } from '../shared/inventory.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';

import { DispatchItems } from "../shared/dispatch-items.model";
import { StockTransaction } from "../shared/stock-transaction.model";
import { RequisitionsStockVMModel } from "../shared/requisitions-stock-vm.model";
import { RequisitionItems } from "../shared/requisition-items.model";
import { Requisition } from "../shared/requisition.model";
import { StockModel } from "../shared/stock.model";

@Component({
    templateUrl: "../../view/inventory-view/DispatchAll.html"  //"/InventoryView/DispatchAll"
})
export class DispatchAllComponent {
    //item dispatch component - dispatch for particular item
    public itemId: number = 0;
    public itemName: string = "";
    public requItemStockVM: RequisitionsStockVMModel = new RequisitionsStockVMModel();
    public model: Array<DispatchItems> = new Array<DispatchItems>();
    public stkList: Array<StockModel> = new Array<StockModel>();
    public rStatus: Array<number> = [];
    public reqDept: Array<any> = null;
    public loading: boolean = false;
    public curAvailQty: number = 0;
    public clonecurAvailQty: number = 0;

    constructor(
        public InventoryBLService: InventoryBLService,
        public changeDetectorRef: ChangeDetectorRef,
        public messageBoxService: MessageboxService,
        public inventoryService: InventoryService,
        public securityService: SecurityService,
        public routeFrom: RouteFromService,
        public router: Router) {
        this.Load(this.inventoryService.Id);
    }

    //GET : requisition and requisition items ItemId
    Load(ItemId: number) {
        if (ItemId != null && ItemId != 0) {
            this.itemId = ItemId;
            this.itemName = this.inventoryService.Name;
            this.InventoryBLService.GetRequisitionItemsbyItemId(ItemId)
                .subscribe(res => this.LoadRequisitionDataForDispatch(res));
        }
    }

    //LOAD : loading requisition items as dispatch items
    LoadRequisitionDataForDispatch(res) {
        if (res.Status == "OK") {
            this.reqDept = res.Results.reqDeptList;
            this.stkList = res.Results.stocks;
            this.filter();
            this.curAvailQty = this.CalculateAvailQty();
            for (var i = 0; i < this.reqDept.length; i++) {
                var curDispatchItem = new DispatchItems();
                curDispatchItem.ItemId = this.itemId;
                curDispatchItem.DepartmentId = this.reqDept[i].req.DepartmentId;
                curDispatchItem.DepartmentName = this.reqDept[i].dept.DepartmentName;
                curDispatchItem.RequisitionItemId = this.reqDept[i].req.RequisitionItems[0].RequisitionItemId;
                curDispatchItem.RequiredQuantity = this.reqDept[i].req.RequisitionItems[0].Quantity - this.reqDept[i].req.RequisitionItems[0].ReceivedQuantity;
                curDispatchItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                this.model.push(curDispatchItem);
            }
        }
        else {
            this.messageBoxService.showMessage("notice-message", ["Requisition is not Authorized or Created !"]);
        }
    }
    //FILTER : filtering requisition and requisition items only with our requested ITEMID
    filter() {
        for (var i = 0; i < this.reqDept.length; i++) {
            let status = false;
            for (var j = 0; j < this.reqDept[i].req.RequisitionItems.length; j++) {
                if (this.reqDept[i].req.RequisitionItems[j].ItemId != this.itemId) {
                    this.reqDept[i].req.RequisitionItems.splice(j, 1);
                    status = true;
                    j--;
                }
            }
            if (this.reqDept[i].req.RequisitionItems.length == 0) {
                this.reqDept.splice(i, 1);
                status = false;
                i--;
            }
            //rStatus will help to modify the RequisitionStatus of table 'INV_TXN_Requisition'
            if (status) {
                this.rStatus.push(i);
            }
        }
    }
    //CALCULATE : calculate total available quantity of Item in stock from stocklist
    CalculateAvailQty() {
        let availableQty = 0;
        for (var k = 0; k < this.stkList.length; k++) {
            availableQty = availableQty + this.stkList[k].AvailableQuantity;
        }
        this.clonecurAvailQty = availableQty;
        return availableQty;
    }
    //DISPLAY : this function will display updated Item Available Quantity in Stock
    UpdatingAvailQty() {
        let curQty = this.curAvailQty
        let dispatchQty = 0;
        for (var x = 0; x < this.model.length; x++) {
            dispatchQty = dispatchQty + this.model[x].DispatchedQuantity;
        }
        this.clonecurAvailQty = curQty - dispatchQty;
    }

    //Pre-requisite Dispatch Transaction
    DispatchTransaction() {
        //function will update requisitionitems -> received,pending quantities and its RequisitionItemStatus
        //will update requisition -> RequisitionStatus
        //will push dispatch,requisition,stockTXN and stock data in VM object for single post
        for (var i = 0; i < this.reqDept.length; i++) {
            this.reqDept[i].req.RequisitionItems[0].ReceivedQuantity = this.reqDept[i].req.RequisitionItems[0].ReceivedQuantity + this.model[i].DispatchedQuantity;
            let pendngQty = this.reqDept[i].req.RequisitionItems[0].Quantity - this.reqDept[i].req.RequisitionItems[0].ReceivedQuantity;
            this.reqDept[i].req.RequisitionItems[0].PendingQuantity = pendngQty;
        }
        for (var i = 0; i < this.reqDept.length; i++) {

            // start uncomment it if we need partial in requisition
                //let chechRStatus = true;
                //if (this.reqDept[i].req.RequisitionItems[0].ReceivedQuantity > 0 && this.reqDept[i].req.RequisitionItems[0].PendingQuantity == 0) {
                //    this.reqDept[i].req.RequisitionItems[0].RequisitionItemStatus = 'complete';
                //}
                //else {
                //    this.reqDept[i].req.RequisitionItems[0].RequisitionItemStatus = 'partial';
                //    chechRStatus = false;
                //}
                       
                //for (var j = 0; j < this.rStatus.length; j++) {
                //    if (this.rStatus[j] == i) {
                //        chechRStatus = false;
                //    }
                //}
                //if (chechRStatus) {
                //    this.reqDept[i].req.RequisitionStatus = 'complete';
                //}
                //else {
                //    this.reqDept[i].req.RequisitionStatus = 'partial';
                //}
            // end uncomment it if we need partial in requisition

            // start comment it if we need partial in requisition 
                this.reqDept[i].req.RequisitionItems[0].RequisitionItemStatus = 'complete';
                this.reqDept[i].req.RequisitionStatus = 'complete';
            // end comment it if we need partial in requisition 

        }
        for (var index = 0; index < this.model.length; index++) {
            this.requItemStockVM.dispatchItems.push(this.model[index]);
        }
        this.splice();
        for (var index = 0; index < this.reqDept.length; index++) {
            this.requItemStockVM.requisitions.push(this.reqDept[index].req);
        }
        for (var index = 0; index < this.stkList.length; index++) {
            this.requItemStockVM.stocks.push(this.stkList[index]);
        }
        let dispatchQty = 0;
        for (var i = 0; i < this.requItemStockVM.dispatchItems.length; i++) {
            dispatchQty = this.requItemStockVM.dispatchItems[i].DispatchedQuantity;
            for (var j = 0; j < this.stkList.length; j++) {
                let curDispatchQty = 0;
                if (dispatchQty > 0 && this.stkList[j].AvailableQuantity > 0) {
                    var curStkTransaction: StockTransaction = new StockTransaction();
                    if (dispatchQty <= this.stkList[j].AvailableQuantity) {
                        curDispatchQty = dispatchQty;
                    }
                    else if (dispatchQty > this.stkList[j].AvailableQuantity) {
                        curDispatchQty = this.stkList[j].AvailableQuantity;
                    }
                    if (curDispatchQty > 0) {
                        dispatchQty = dispatchQty - curDispatchQty;
                        this.stkList[j].AvailableQuantity = this.stkList[j].AvailableQuantity - curDispatchQty;
                        curStkTransaction.Quantity = curDispatchQty;
                        curStkTransaction.StockId = this.stkList[j].StockId;
                        curStkTransaction.InOut = "out"
                        curStkTransaction.TransactionType = "dispatch"
                        curStkTransaction.requisitionItemId = this.requItemStockVM.dispatchItems[i].RequisitionItemId;
                        curStkTransaction.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                        this.requItemStockVM.stockTransactions.push(curStkTransaction);
                    }
                }
            }
        }
    }
    //REMOVE : dispatch and its requisition with '0' Dispatched Quantities
    splice() {
        for (var i = 0; i < this.requItemStockVM.dispatchItems.length; i++) {
            if (this.requItemStockVM.dispatchItems[i].DispatchedQuantity == 0) {
                this.requItemStockVM.dispatchItems.splice(i, 1);
                this.reqDept.splice(i, 1);
                i--;
            }
        }
    }

    //POST : save to database
    SaveDispatch() {
        if (this.requItemStockVM.dispatchItems != null) {
            //Validation part
            let CheckIsValid = true;
            for (var i = 0; i < this.requItemStockVM.dispatchItems.length; i++) {
                for (var x in this.requItemStockVM.dispatchItems[i].DispatchItemValidator.controls) {
                    this.requItemStockVM.dispatchItems[i].DispatchItemValidator.controls[x].markAsDirty();
                    this.requItemStockVM.dispatchItems[i].DispatchItemValidator.controls[x].updateValueAndValidity();
                }
                if (this.requItemStockVM.dispatchItems[i].IsValidCheck(undefined, undefined) == false) {
                    CheckIsValid = false;
                }
                if (this.requItemStockVM.dispatchItems[i].RequiredQuantity < this.requItemStockVM.dispatchItems[i].DispatchedQuantity) {
                    this.messageBoxService.showMessage("notice-message", ["Dispatch Quantity must less than Required Quantity!"]);
                    this.requItemStockVM.dispatchItems[i].IsDisQtyValid = false;
                    CheckIsValid = false;
                }
            }
            if (this.clonecurAvailQty < 0) {
                CheckIsValid = false;
            }
            if (CheckIsValid) {
                this.DispatchTransaction();
            }
            //Validation Pass then Dispatch and Save
            if (CheckIsValid && (this.requItemStockVM.dispatchItems.length > 0)) {
                this.loading = true;
                this.InventoryBLService.PostToDispatch(this.requItemStockVM)
                    .subscribe(
                        res => {
                            this.CallBackSaveDispatchItems(res);
                            this.loading = false;
                        },
                        err => {
                            this.loading = false;
                            this.logError(err);
                        });
            }
            else {
                this.messageBoxService.showMessage("notice-message", ['Enter Valid Dispatch Quantity']);
            }
        }
        else {
            this.messageBoxService.showMessage("notice-message", ["Add Item ...Before Requesting"]);
        }

    }
    CallBackSaveDispatchItems(res) {
        if (res.Status == "OK") {
            this.messageBoxService.showMessage("success", ["Dispatch Items detail Saved."]);
            this.Cancel();
        }
        else {
            err => {
                this.messageBoxService.showMessage("failed", ["failed to add result.. please check log for details."]);
                this.logError(err.ErrorMessage);
            }
        }
    }
    //Cancel dispatching material and navigate to Requisition list page
    Cancel() {
        this.model = new Array<DispatchItems>();
        this.requItemStockVM = new RequisitionsStockVMModel();
        this.router.navigate(['/Inventory/InternalMain/RequisitionList']);
    }
    logError(err: any) {
        console.log(err);
    }
}