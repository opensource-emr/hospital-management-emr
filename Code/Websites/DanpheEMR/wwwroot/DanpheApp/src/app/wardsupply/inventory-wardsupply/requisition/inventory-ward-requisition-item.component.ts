import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityService } from '../../../security/shared/security.service';
import { InventoryBLService } from "../../../inventory/shared/inventory.bl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { Requisition } from "../../../inventory/shared/requisition.model";
import { RequisitionItems } from "../../../inventory/shared/requisition-items.model";
import { ItemMaster } from "../../../inventory/shared/item-master.model";
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { CoreBLService } from "../../../core/shared/core.bl.service";
import { CoreService } from '../../../core/shared/core.service';
import { WardSupplyBLService } from '../../shared/wardsupply.bl.service';
import * as moment from 'moment/moment';
@Component({ templateUrl: "./inventory-ward-requisition-item.html" })
export class InventoryWardRequisitionItemComponent implements OnDestroy {
    public CurrentStoreId: number = 0;
    ////binding logic
    public currentRequItem: RequisitionItems = new RequisitionItems();
    public requisition: Requisition = new Requisition();
    ////this Item is used for search button(means auto complete button)...
    public ItemList: any[] = [];
    public filteredItemList: any[] = [];
    ////this is to add or delete the number of row in ui
    public rowCount: number = 0;
    public checkIsItemPresent: boolean = false;

    //For Add Item --Yubraj 2nd April 2019
    public index: number = 0;
    public showAddItemPopUp: boolean = false;
    public isEditMode: boolean;
    public isRecreateMode: boolean = false;
    inventoryList: any;
    selectedInventory: any;
    ReqDisGroupId: number;

    constructor(public changeDetectorRef: ChangeDetectorRef, public inventoryBLService: InventoryBLService, public inventoryService: InventoryService, public wardsupplyBLService: WardSupplyBLService, public securityService: SecurityService, public router: Router, public messageBoxService: MessageboxService, public coreBLService: CoreBLService, public coreService: CoreService) {
        //whatever you need to write in constructor, write inside CheckForSubstoreActivation()
        this.CheckForSubstoreActivation();
        this.GetInventoryList();
        this.SetFocusById('activeInventory');
    }
    GetInventoryList() {
        this.inventoryBLService.GetActiveInventoryList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.inventoryList = res.Results;
                }
            })
    }
    ngOnDestroy(): void {
        this.inventoryService.PurchaseRequestId = 0;
        this.inventoryService.isRecreateMode = false;
    }

    LoadRequisition(requisitionId) {
        this.inventoryBLService.GetToRequistion(requisitionId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    var Requisition = res.Results;
                    //var RequisitionItemArray: Array<any> = res.Results;

                    this.requisition.RequestFromStoreId = Requisition.StoreId;

                    this.requisition.RequisitionStatus = Requisition.RequisitionStatus;
                    if (this.isRecreateMode == false) {
                        this.requisition.RequisitionId = this.inventoryService.RequisitionId;
                        this.requisition.RequisitionNo = Requisition.RequisitionNo;
                        this.requisition.IssueNo = Requisition.IssueNo;
                        this.requisition.RequisitionDate = moment(Requisition.RequisitionDate).format("YYYY-MM-DD");
                    }
                    if (this.isEditMode == true) {
                        let inventory = null;
                        inventory = this.inventoryList.find(a => a.StoreId == Requisition.TargetStoreId);
                        if (inventory) {

                            this.requisition.RequestToStoreId = inventory.StoreId;
                            this.requisition.RequisitionValidator.get("RequestToStoreId").setValue(inventory.StoreId);
                            this.selectedInventory = inventory;
                        }
                    }
                    for (var i = 0; i < Requisition.RequisitionItems.length; i++) {
                        if (Requisition.RequisitionStatus == "cancelled" || Requisition.RequisitionStatus == "withdrawn" || Requisition.RequisitionItems[i].IsActive == true) {
                            var newItem = new RequisitionItems();
                            newItem.Quantity = Requisition.RequisitionItems[i].Quantity;
                            newItem.PendingQuantity = Requisition.RequisitionItems[i].PendingQuantity;
                            newItem.ItemName = Requisition.RequisitionItems[i].ItemName;
                            newItem.Code = Requisition.RequisitionItems[i].Code;
                            newItem.AuthorizedBy = Requisition.RequisitionItems[i].AuthorizedBy;
                            //newItem.RequisitionDate= this.requisition.RequisitionDate;
                            newItem.UOMName = Requisition.RequisitionItems[i].UOMName;
                            newItem.SelectedItem = this.ItemList.find(item => item.ItemId == Requisition.RequisitionItems[i].ItemId);
                            if (this.isRecreateMode == false) {
                                newItem.RequisitionItemId = Requisition.RequisitionItems[i].RequisitionItemId;
                                newItem.ItemId = Requisition.RequisitionItems[i].ItemId;
                                newItem.RequisitionItemStatus = Requisition.RequisitionItems[i].RequisitionItemStatus;
                                newItem.RequisitionId = Requisition.RequisitionItems[i].requisitionId;
                                newItem.RequisitionNo = Requisition.RequisitionItems[i].RequisitionNo;
                                newItem.Remark = Requisition.RequisitionItems[i].Remark;
                                newItem.IssueNo = Requisition.RequisitionItems[i].IssueNo;
                                newItem.IsEditApplicable = false;
                            }
                            this.requisition.RequisitionItems.push(newItem);
                            this.requisition.RequisitionItems[this.requisition.RequisitionItems.length - 1].RequisitionItemValidator.controls["ItemId"].setValue(newItem.ItemId);
                            this.requisition.RequisitionItems[this.requisition.RequisitionItems.length - 1].RequisitionItemValidator.controls["Quantity"].setValue(newItem.Quantity);
                            this.currentRequItem = newItem;
                        }

                    }
                    if (this.requisition.RequisitionItems.length == 0) {
                        this.messageBoxService.showMessage("Failed", ["No item found."]);
                        this.Cancel();
                    }

                }
                else {
                    err => {
                        this.messageBoxService.showMessage("Error", err.ErrorMessage);
                    }
                }
            })
    }
    CheckForSubstoreActivation() {
        this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
        this.ReqDisGroupId = this.securityService.getActiveStore().INV_ReqDisGroupId;
        try {
            if (!this.CurrentStoreId) {
                //routeback to substore selection page.
                this.router.navigate(['/WardSupply']);
            }
            else {
                //write whatever is need to be initialise in constructor here.
                this.LoadItemList();
            }
        } catch (exception) {
            this.messageBoxService.showMessage("Error", [exception]);
        }
    }
    private InitializeRequisitionItems() {
        if (this.inventoryService.RequisitionId > 0) {
            if (this.inventoryService.isRecreateMode == true) {
                this.isRecreateMode = true;
            }
            else {
                this.isEditMode = true;
            }
            this.LoadRequisition(this.inventoryService.RequisitionId);
        }
        else {
            ////pushing currentPOItem for the first Row in UI
            this.requisition.RequisitionItems.push(this.currentRequItem);
            //this.SetFocusOnItemName(0);
            this.requisition.RequestFromStoreId = this.CurrentStoreId;
            this.currentRequItem.Quantity = 1;
            this.SetFocusById('activeInventory');
        }
    }

    ////to load the item in the start
    LoadItemList(): void {
        this.inventoryBLService.GetItemList()
            .subscribe(res => this.CallBackGetItemList(res));
    }
    CallBackGetItemList(res) {
        if (res.Status == 'OK') {
            this.ItemList = [];
            if (res && res.Results) {
                res.Results.forEach(a => {
                    this.ItemList.push({
                        ItemId: a.ItemId, ItemName: a.ItemName, UOMName: a.UOMName, Code: a.Code, IsActive: a.IsActive, ItemType: a.ItemType, StoreId: a.StoreId
                    });
                });
            }
            this.ItemList = this.ItemList.filter(item => item.IsActive == true && item.ItemType == 'Consumables');
            this.filterItemsBasedOnInventory();
            this.InitializeRequisitionItems();
        }
        else {
            err => {
                this.messageBoxService.showMessage("failed", ['failed to get Item.. please check log for details.']);
                this.logError(err.ErrorMessage);
            }
        }
    }
    private filterItemsBasedOnInventory() {
        // show items if their storeId matches with the selected Main Store or if the item is common (StoreId is null).
        this.filteredItemList = this.ItemList.filter(item => item.StoreId == this.requisition.RequestToStoreId || item.StoreId == null);
    }

    ////add a new row
    AddRowRequest() {
        for (var i = 0; i < this.requisition.RequisitionItems.length; i++) {
            // for loop is used to show RequisitionItemValidator message ..if required  field is not filled
            for (var a in this.requisition.RequisitionItems[i].RequisitionItemValidator.controls) {
                this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].markAsDirty();
                this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].updateValueAndValidity();
            }
        }
        this.rowCount++;
        this.currentRequItem = new RequisitionItems();
        this.currentRequItem.Quantity = 1;
        this.requisition.RequisitionItems.push(this.currentRequItem);

        let nextInputIndex = this.requisition.RequisitionItems.length - 1;
        //this.SetFocusOnItemName(nextInputIndex);
    }
    public SetFocusOnItemName(index: number) {
        let elementToBeFocused = 'itemName' + index;
        this.SetFocusById(elementToBeFocused);
    }
    OnPressedEnterKeyInQuantityField(index) {
        var isinputvalid = this.requisition.RequisitionItems.every(item => item.Quantity > 0)
        if (isinputvalid == true) {
            //If index is last element of array, then create new row
            if (index == (this.requisition.RequisitionItems.length - 1)) {
                this.AddRowRequest();
            }
            this.SetFocusOnItemName(index + 1);
        }
    }
    OnPressedEnterKeyInItemField(index) {
        if (this.requisition.RequisitionItems[index].SelectedItem != null && this.requisition.RequisitionItems[index].ItemId != null) {
            this.SetFocusById(`qtyip${index}`);
        }
        else {
            if (this.requisition.RequisitionItems.length == 1) {
                this.SetFocusOnItemName(index)
            }
            else {
                this.requisition.RequisitionItems.splice(index, 1);
                this.SetFocusById('save_requisition');
            }

        }
    }
    public SetFocusById(id: string) {
        window.setTimeout(function () {
            let elementToBeFocused = document.getElementById(id);
            if (elementToBeFocused) {
                elementToBeFocused.focus();
            }
        }, 600);
    }
    InventoryListFormatter(data: any): string {
        return data["Name"];
    }
    OnInventoryChange() {
        let inventory = null;
        if (!this.selectedInventory) {
            this.requisition.RequestToStoreId = null;
        }
        else if (typeof (this.selectedInventory) == 'string') {
            inventory = this.inventoryList.find(a => a.Name.toLowerCase() == this.selectedInventory.toLowerCase());
        }
        else if (typeof (this.selectedInventory) == "object") {
            inventory = this.selectedInventory;
        }
        if (inventory) {
            this.requisition.RequestToStoreId = inventory.StoreId;
            this.filterItemsBasedOnInventory();
            //this.requisition.RequisitionValidator.get("TargetStoreId").setValue(inventory.StoreId);
            this.SetFocusById('itemName');
            this.SetFocusOnItemName(0);
        }
        else {
            this.requisition.RequestToStoreId = null;
        }
    }

    DeleteAction(index) {
        var reqItem = this.requisition.RequisitionItems[index];
        if (reqItem.IsEditApplicable == true) {
            this.DeleteRow(index);
        }
        else if (reqItem.IsActive == true) {
            this.WithdrawRow(index);
        }
        else {//edit applicable false and is active false
            this.UndoRow(index);
        }
    }
    ////to delete the row
    DeleteRow(index) {
        try {
            this.requisition.RequisitionItems.splice(index, 1);
            if (this.requisition.RequisitionItems.length == 0) {
                this.AddRowRequest();
            }
        }
        catch (exception) {
            this.messageBoxService.showMessage("Error", [exception]);
        }
    }
    WithdrawRow(index) {
        this.requisition.RequisitionItems[index].IsActive = false;
        this.requisition.RequisitionItems[index].RequisitionItemStatus = "withdrawn";
        this.requisition.RequisitionItems[index].CancelBy = this.securityService.loggedInUser.EmployeeId;
        this.requisition.RequisitionItems[index].CancelOn = moment().format("YYYY-MM-DD hh:mm:ss");
        this.requisition.RequisitionItems[index].CancelQuantity = this.requisition.RequisitionItems[index].PendingQuantity;
        this.requisition.RequisitionItems[index].RequisitionItemValidator.controls["Quantity"].disable();
        this.SetFocusById(`withdrawRemarks${index}`);
    }
    UndoRow(index) {
        this.requisition.RequisitionItems[index].IsActive = true;
        this.requisition.RequisitionItems[index].RequisitionItemStatus = "active";
        this.requisition.RequisitionItems[index].CancelBy = null;
        this.requisition.RequisitionItems[index].CancelOn = null;
        this.requisition.RequisitionItems[index].CancelQuantity = null;
        this.requisition.RequisitionItems[index].RequisitionItemValidator.controls["Quantity"].enable();
    }
    SelectItemFromSearchBox(Item: ItemMaster, index) {
        //if proper item is selected then the below code runs ..othewise it goes out side the function
        if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
            //this for loop with if conditon is to check whether the  item is already present in the array or not
            //means to avoid duplication of item
            for (var i = 0; i < this.requisition.RequisitionItems.length; i++) {
                if (this.requisition.RequisitionItems[i].ItemId == Item.ItemId) {
                    this.checkIsItemPresent = true;
                }
            }
            //id item is present the it show alert otherwise it assign the value
            if (this.checkIsItemPresent == true) {
                this.messageBoxService.showMessage("notice-message", [Item.ItemName + " is already add..Please Check!!!"]);
                this.checkIsItemPresent = false;
                this.changeDetectorRef.detectChanges();
                this.requisition.RequisitionItems.splice(index, 1);
                this.currentRequItem = new RequisitionItems();
                this.currentRequItem.Quantity = 1;
                this.currentRequItem.UOMName = Item.UOMName;
                this.currentRequItem.Code = Item.Code;
                this.requisition.RequisitionItems.push(this.currentRequItem);
            }
            else {
                for (var a = 0; a < this.requisition.RequisitionItems.length; a++) {
                    // Assiging the value StandardRate,VatPercentage and ItemId in the particular index ..
                    //it helps for changing item after adding the item and also in adding in new item
                    if (a == index) {
                        this.requisition.RequisitionItems[index].ItemId = Item.ItemId;
                        this.requisition.RequisitionItems[index].UOMName = Item.UOMName;
                        this.requisition.RequisitionItems[index].Code = Item.Code;
                    }
                }
            }
        }
    }
    ////used to format display item in ng-autocomplete
    myListFormatter(data: any): string {
        let html = data["ItemName"];
        return html;
    }
    ////posting to db
    AddRequisition() {
        // this CheckIsValid varibale is used to check whether all the validation are proper or not ..
        //if the CheckIsValid == true the validation is proper else no
        var CheckIsValid = true;
        this.requisition.RequestFromStoreId = this.CurrentStoreId;
        this.requisition.ReqDisGroupId = this.ReqDisGroupId;
        this.requisition.RequisitionValidator.get("RequestFromStoreId").setValue(this.CurrentStoreId);

        if (this.requisition.IsValidCheck(undefined, undefined) == false) {
            // for loop is used to show RequisitionValidator message ..if required  field is not filled
            for (var a in this.requisition.RequisitionValidator.controls) {
                this.requisition.RequisitionValidator.controls[a].markAsDirty();
                this.requisition.RequisitionValidator.controls[a].updateValueAndValidity();
            }
            CheckIsValid = false;
        }
        for (var i = 0; i < this.requisition.RequisitionItems.length; i++) {
            if (this.requisition.RequisitionItems[i].IsValidCheck(undefined, undefined) == false) {

                // for loop is used to show RequisitionItemValidator message ..if required  field is not filled
                for (var a in this.requisition.RequisitionItems[i].RequisitionItemValidator.controls) {
                    this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].markAsDirty();
                    this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].updateValueAndValidity();
                }
                CheckIsValid = false;
            }
        }

        //this.requisition.RequisitionItems.forEach(function (value) {
        //    if (value.Quantity == 0) {
        //        validQuantity = false;
        //    }
        //});

        //if (this.requisition.RequisitionItems.length == 0) {
        //    this.messageBoxService.showMessage("notice-message", ["Please Add Item ...Before Requesting"]);
        //}
        if (CheckIsValid == true && this.requisition.RequisitionItems != null) {
            //Updating the Status
            this.requisition.RequisitionStatus = "active";
            //Comment by Nagesh on 11-Jun-17 Employee Id not getting so, now passing static id
            this.requisition.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            for (var i = 0; i < this.requisition.RequisitionItems.length; i++) {
                this.requisition.RequisitionItems[i].RequisitionItemStatus = "active";
                this.requisition.RequisitionItems[i].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                this.requisition.RequisitionItems[i].AuthorizedBy = this.securityService.GetLoggedInUser().EmployeeId;
                //Comment on 02-July'17 By-Nagesh-No need to send Item Object with requisitionItems only Need ItemId
                this.requisition.RequisitionItems[i].ItemId = this.requisition.RequisitionItems[i].ItemId;
                this.requisition.RequisitionItems[i].Item = null;
            }
            this.inventoryBLService.PostToRequisition(this.requisition).
                subscribe(res => {
                    if (res.Status == 'OK') {
                        this.messageBoxService.showMessage("success", ["Requisition is Generated and Saved"]);
                        ////this.router.navigate(['/Inventory/ExternalMain/PurchaseOrderList']);
                        this.changeDetectorRef.detectChanges();
                        ////deleting all creating new requisition..after successully adding to db
                        this.requisition.RequisitionItems = new Array<RequisitionItems>();
                        this.requisition = new Requisition();
                        this.currentRequItem = new RequisitionItems();
                        this.currentRequItem.Quantity = 1;
                        this.requisition.RequisitionItems.push(this.currentRequItem);
                        //route back to requisition list
                        this.RouteToViewDetail(res.Results);
                        //this.router.navigate(['/Inventory/InternalMain/RequisitionList']);
                    }
                    else {
                        err => {
                            this.messageBoxService.showMessage("failed", ['failed to add Requisition.. please check log for details.']);
                            this.logError(err.ErrorMessage);
                            //route back to requisition list
                            this.router.navigate(['/WardSupply/Inventory/RequisitionList']);
                        }
                    }
                });
        }

    }

    //this is to update requistion

    UpdateRequisition() {
        // this CheckIsValid varibale is used to check whether all the validation are proper or not ..
        //if the CheckIsValid == true the validation is proper else no
        var CheckIsValid = true;
        this.requisition.RequestFromStoreId = this.CurrentStoreId;
        this.requisition.RequisitionValidator.get("RequestFromStoreId").setValue(this.CurrentStoreId);
        if (this.requisition.IsValidCheck(undefined, undefined) == false) {
            // for loop is used to show RequisitionValidator message ..if required  field is not filled
            for (var b in this.requisition.RequisitionValidator.controls) {
                this.requisition.RequisitionValidator.controls[b].markAsDirty();
                this.requisition.RequisitionValidator.controls[b].updateValueAndValidity();
                CheckIsValid = false;
            }
        }


        for (var i = 0; i < this.requisition.RequisitionItems.length; i++) {
            if (this.requisition.RequisitionItems[i].IsValidCheck(undefined, undefined) == false) {
                // for loop is used to show RequisitionItemValidator message ..if required  field is not filled
                for (var a in this.requisition.RequisitionItems[i].RequisitionItemValidator.controls) {
                    this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].markAsDirty();
                    this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].updateValueAndValidity();
                }
                CheckIsValid = false;
            }
            if (this.requisition.RequisitionItems[i].IsActive == false && this.requisition.RequisitionItems[i].CancelRemarks.length == 0) {
                CheckIsValid = false;
                this.messageBoxService.showMessage("notice-message", ["Please write withdraw remarks for item ", this.requisition.RequisitionItems[i].ItemName]);
                break;
            }
        }


        if (this.requisition.RequisitionItems.length == 0 || this.requisition.RequisitionItems.every(a => a.IsActive == false)) {
            this.messageBoxService.showMessage("notice-message", ["Please Add Item ...Before Requesting"]);
            CheckIsValid = false;
        }

        if (CheckIsValid == true && this.requisition.RequisitionItems != null) {
            this.requisition.ModifiedOn = new Date();
            this.requisition.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.requisition.RequisitionItems.map(a => {
                a.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
                // a.ModifiedOn = new Date();
                // a.CreatedOn = new Date();
                a.RequisitionId = this.requisition.RequisitionId;
                a.IssueNo = this.requisition.IssueNo;
            })

            this.wardsupplyBLService.PutUpdateRequisition(this.requisition).
                subscribe(res => {
                    if (res.Status == 'OK') {
                        this.changeDetectorRef.detectChanges();
                        this.messageBoxService.showMessage("success", ["Requisition is Updated."]);

                        this.requisition.RequisitionItems = new Array<RequisitionItems>();
                        this.requisition = new Requisition();
                        this.currentRequItem = new RequisitionItems();
                        this.currentRequItem.Quantity = 1;
                        this.requisition.RequisitionItems.push(this.currentRequItem);


                        this.inventoryService.RequisitionId = res.Results;
                        this.router.navigate(['WardSupply/Inventory/InventoryRequisitionDetails']);

                    }
                    else {

                        this.messageBoxService.showMessage("failed", ['failed to add Requisition.. please check log for details.']);
                        this.logError(res.ErrorMessage);

                    }
                });
        }
    }
    ////this is to cancel the whole PO at one go and adding new PO
    Cancel() {
        this.requisition.RequisitionItems = new Array<RequisitionItems>();
        this.requisition = new Requisition();
        this.currentRequItem = new RequisitionItems()
        this.currentRequItem.Quantity = 1;
        this.requisition.RequisitionItems.push(this.currentRequItem);
        //route back to requisition list
        this.router.navigate(['/WardSupply/Inventory/InventoryRequisitionList']);
    }
    logError(err: any) {
        console.log(err);
    }

    RouteToViewDetail(reqId: number) {
        //pass the Requisition Id to RequisitionView page for List of Details about requisition
        this.inventoryService.RequisitionId = reqId;
        this.inventoryService.isModificationAllowed = true;
        this.router.navigate(['/WardSupply/Inventory/InventoryRequisitionDetails']);

    }
    //for item add popup
    AddItemPopUp(i) {
        this.showAddItemPopUp = false;
        this.index = i;
        this.changeDetectorRef.detectChanges();
        this.showAddItemPopUp = true;
    }

    //post item add function
    OnNewItemAdded($event) {
        this.showAddItemPopUp = false;
        var item = $event.item;
        this.ItemList.push({
            "ItemId": item.ItemId, "ItemName": item.ItemName, StandardRate: item.StandardRate, VAT: item.VAT, ItemType: item.ItemType
        });
        this.filterItemsBasedOnInventory();
        this.currentRequItem = new RequisitionItems();
        if (item.ItemType == 'Consumables') {
            this.currentRequItem.Quantity = 1;
            this.requisition.RequisitionItems.splice(this.index, 1, this.currentRequItem);
            this.requisition.RequisitionItems[this.index].SelectedItem = item;
        }
        else {
            this.messageBoxService.showMessage("Warning", [`Cannot add item with itemtype as ${item.ItemType}. Use Fixed Assets instead.`]);
        }
    }

    GoToNextInput(idToSelect: string) {
        if (document.getElementById(idToSelect)) {
            let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
            nextEl.focus();
            nextEl.select();
        }
    }
    public get IsReqDateValid() {
        return this.inventoryService.allFiscalYearList.some(fy => (fy.IsClosed == null || fy.IsClosed == false) && moment(this.requisition.RequisitionDate).isBetween(fy.StartDate, fy.EndDate)) as Boolean;
    }
}
