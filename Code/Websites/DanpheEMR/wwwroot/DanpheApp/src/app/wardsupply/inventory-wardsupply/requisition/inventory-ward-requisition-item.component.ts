import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment/moment';
import { CoreBLService } from "../../../core/shared/core.bl.service";
import { CoreService } from '../../../core/shared/core.service';
import { InventoryBLService } from "../../../inventory/shared/inventory.bl.service";
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { ItemMaster } from "../../../inventory/shared/item-master.model";
import { RequisitionItems } from "../../../inventory/shared/requisition-items.model";
import { Requisition } from "../../../inventory/shared/requisition.model";
import { SecurityService } from '../../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_GRItemCategory, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { WardSupplyBLService } from '../../shared/wardsupply.bl.service';
import { InventoryWardRequisitionVerifier_DTO } from './shared/inventory-ward-requisition-verifier.dto';
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
    ItemCategories: ENUM_GRItemCategory[];
    loading: boolean;
    CurrentItemId: number = 0;
    ItemByStoreId: Item = new Item();

    public IsVerificationActivated: boolean = true;
    public VerifierList: InventoryWardRequisitionVerifier_DTO[] = [];
    showInventoryRequisitionDetails: boolean = false;

    constructor(public changeDetectorRef: ChangeDetectorRef, public inventoryBLService: InventoryBLService, public inventoryService: InventoryService, public wardsupplyBLService: WardSupplyBLService, public securityService: SecurityService, public router: Router, public messageBoxService: MessageboxService, public coreBLService: CoreBLService, public coreService: CoreService) {
        this.GetInventoryList();
        this.LoadItemCategory();
        this.LoadVerifiersForRequisition();
        this.GetSigningPanelConfiguration();

    }

    ngOnInit() {
        this.CheckForSubstoreActivation();
    }
    ngAfterViewInit() {
        this.SetFocusById('activeInventory');

    }
    GetInventoryList() {
        this.inventoryBLService.GetActiveInventoryList()
            .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.inventoryList = res.Results;
                }
            })
    }
    public LoadItemCategory() {
        this.ItemCategories = Object.values(ENUM_GRItemCategory).filter(p => isNaN(p as any));
    }
    OnItemCategoryChange(indx) {
        var ReqItem = this.requisition.RequisitionItems[indx];
        ReqItem.filteredItemList = this.GetItemListByItemCategory(ReqItem.ItemCategory);
        ReqItem.filteredItemList = ReqItem.filteredItemList.slice();
        ReqItem.SelectedItem = new ItemMaster();
        ReqItem.RequisitionItemValidator.get("ItemId").setValue("");
        window.setTimeout(function () {
            let itmNameBox = document.getElementById("itemName" + indx);
            if (itmNameBox) {
                itmNameBox.focus();
            }
        }, 600);
    }
    GetItemListByItemCategory(itmCategory: string) {
        let retItemList = this.filteredItemList.filter(item => item.ItemType === itmCategory);
        return retItemList;
    }
    ngOnDestroy(): void {
        this.inventoryService.PurchaseRequestId = 0;
        this.inventoryService.isRecreateMode = false;
    }

    LoadRequisition(requisitionId) {
        this.inventoryBLService.GetToRequistion(requisitionId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    let Requisition = res.Results;
                    this.SetVerifiersFromVerifierIdsObj(Requisition.VerifierIds);

                    this.requisition.RequestFromStoreId = Requisition.RequestFromStoreId;

                    this.requisition.RequisitionStatus = Requisition.RequisitionStatus;
                    if (this.isRecreateMode == false) {
                        this.requisition.RequisitionId = this.inventoryService.RequisitionId;
                        this.requisition.RequisitionNo = Requisition.RequisitionNo;
                        this.requisition.IssueNo = Requisition.IssueNo;
                        this.requisition.RequisitionDate = moment(Requisition.RequisitionDate).format("YYYY-MM-DD");
                    }
                    if (this.isEditMode == true) {
                        let inventory = null;
                        inventory = this.inventoryList.find(a => a.StoreId == Requisition.RequestToStoreId);
                        if (inventory) {
                            this.requisition.RequestToStoreId = inventory.StoreId;
                            this.requisition.RequisitionValidator.get("RequestToStoreId").setValue(inventory.StoreId);
                            this.selectedInventory = inventory.Name;
                        }
                    }
                    for (let i = 0; i < Requisition.RequisitionItems.length; i++) {
                        if (Requisition.RequisitionStatus == "cancelled" || Requisition.RequisitionStatus == "withdrawn" || Requisition.RequisitionItems[i].IsActive == true) {
                            let newItem = new RequisitionItems();
                            newItem.Quantity = Requisition.RequisitionItems[i].Quantity;
                            newItem.PendingQuantity = Requisition.RequisitionItems[i].PendingQuantity;
                            newItem.ItemName = Requisition.RequisitionItems[i].ItemName;
                            newItem.Code = Requisition.RequisitionItems[i].Code;
                            newItem.AuthorizedBy = Requisition.RequisitionItems[i].AuthorizedBy;
                            //newItem.RequisitionDate= this.requisition.RequisitionDate;
                            newItem.UOMName = Requisition.RequisitionItems[i].UOMName;
                            newItem.ItemCategory = Requisition.RequisitionItems[i].ItemCategory;
                            newItem.SelectedItem = this.ItemList.find(item => item.ItemId == Requisition.RequisitionItems[i].ItemId);
                            newItem.IsActive = Requisition.RequisitionItems[i].IsActive;
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
                this.router.navigate(['/WardSupply']);
            }
            else {
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
            this.requisition.RequisitionItems.push(this.currentRequItem);
            this.requisition.RequestFromStoreId = this.CurrentStoreId;
            this.currentRequItem.Quantity = 1;
            this.SetFocusById('activeInventory');
        }
    }

    ////to load the item in the start
    LoadItemList(): void {
        this.ItemList = this.inventoryService.LoadInventoryWardItemList();
        if (this.ItemList.length) {
            if (this.inventoryService.RequisitionId > 0) {
                this.filterItemsBasedOnInventory();
            }
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Items not found']);
        }
    }
    private filterItemsBasedOnInventory() {
        this.InitializeRequisitionItems();
        this.filteredItemList = this.ItemList.filter(item => item.StoreId == this.requisition.RequestToStoreId);
    }

    AddRowRequest() {
        for (let i = 0; i < this.requisition.RequisitionItems.length; i++) {
            for (let a in this.requisition.RequisitionItems[i].RequisitionItemValidator.controls) {
                this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].markAsDirty();
                this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].updateValueAndValidity();
            }
        }
        this.rowCount++;
        this.currentRequItem = new RequisitionItems();
        this.currentRequItem.ItemCategory = ENUM_GRItemCategory.Consumables;
        this.currentRequItem.filteredItemList = this.GetItemListByItemCategory(this.currentRequItem.ItemCategory);//load item list for 1st row based on itemcategory.
        this.currentRequItem.filteredItemList = this.currentRequItem.filteredItemList.slice();
        this.currentRequItem.Quantity = 1;
        this.requisition.RequisitionItems.push(this.currentRequItem);

        let nextInputIndex = this.requisition.RequisitionItems.length - 1;
    }
    public SetFocusOnItemName(index: number) {
        let elementToBeFocused = 'itemName' + index;
        this.SetFocusById(elementToBeFocused);
    }
    OnPressedEnterKeyInQuantityField(index) {
        let isinputvalid = this.requisition.RequisitionItems.every(item => item.Quantity > 0)
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
    GoToSpecification(index: number) {
        this.SetFocusById(`qtyip${index}`);
    }
    public SetFocusById(id: string) {
        window.setTimeout(function () {
            let elementToBeFocused = document.getElementById(id);
            if (elementToBeFocused) {
                elementToBeFocused.focus();
            }
        }, 300);
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
            this.requisition.RequisitionItems = [];
            this.filterItemsBasedOnInventory();
            if (this.requisition.RequisitionItems.length) {
                this.requisition.RequisitionItems[0].ItemCategory = ENUM_GRItemCategory.Consumables;
                this.requisition.RequisitionItems[0].filteredItemList = this.GetItemListByItemCategory(this.requisition.RequisitionItems[0].ItemCategory);
                this.requisition.RequisitionItems[0].filteredItemList = this.requisition.RequisitionItems[0].filteredItemList.slice();

            }
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
            this.CurrentItemId = Item.ItemId;
            this.GetAvailableQuantityByItemIdAndStoreId(this.CurrentItemId, this.requisition.RequestToStoreId, index);
            //this for loop with if conditon is to check whether the  item is already present in the array or not
            //means to avoid duplication of item
            for (var i = 0; i < this.requisition.RequisitionItems.length; i++) {

                if (this.requisition.RequisitionItems[i].ItemId == Item.ItemId && this.requisition.RequisitionItems.indexOf(this.requisition.RequisitionItems[i]) != index) {
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
                // this.currentRequItem.Quantity = 1;
                this.currentRequItem.ItemCategory = ENUM_GRItemCategory.Consumables;
                this.currentRequItem.filteredItemList = this.GetItemListByItemCategory(this.currentRequItem.ItemCategory);
                // this.currentRequItem.UOMName = Item.UOMName;
                // this.currentRequItem.Code = Item.Code;
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
        html += (data["Description"] == null || data["Description"] == "" ? "" : "|" + data["Description"]);

        return html;
    }
    ////posting to db
    AddRequisition() {
        let CheckIsValid = true;
        this.requisition.RequestFromStoreId = this.CurrentStoreId;
        this.requisition.ReqDisGroupId = this.ReqDisGroupId;
        this.requisition.RequisitionValidator.get("RequestFromStoreId").setValue(this.CurrentStoreId);

        if (this.requisition.IsValidCheck(undefined, undefined) == false) {
            for (let a in this.requisition.RequisitionValidator.controls) {
                this.requisition.RequisitionValidator.controls[a].markAsDirty();
                this.requisition.RequisitionValidator.controls[a].updateValueAndValidity();
            }
            CheckIsValid = false;
        }
        for (let i = 0; i < this.requisition.RequisitionItems.length; i++) {
            if (this.requisition.RequisitionItems[i].IsValidCheck(undefined, undefined) == false) {
                for (var a in this.requisition.RequisitionItems[i].RequisitionItemValidator.controls) {
                    this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].markAsDirty();
                    this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].updateValueAndValidity();
                }
                CheckIsValid = false;
            }
        }
        if (CheckIsValid == true && this.requisition.RequisitionItems != null) {
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
            this.loading = true;
            this.inventoryBLService.PostToRequisition(this.requisition).finally(() => { this.loading = false })
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Requisition is Generated and Saved"]);
                        this.requisition.RequisitionItems = new Array<RequisitionItems>();
                        this.requisition = new Requisition();
                        this.currentRequItem = new RequisitionItems();
                        this.currentRequItem.Quantity = 1;
                        this.requisition.RequisitionItems.push(this.currentRequItem);
                        this.inventoryService.RequisitionId = res.Results;
                        this.inventoryService.isModificationAllowed = true;
                        this.showInventoryRequisitionDetails = true;
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

    UpdateRequisition() {
        let CheckIsValid = true;
        this.requisition.RequestFromStoreId = this.CurrentStoreId;
        this.requisition.RequisitionValidator.get("RequestFromStoreId").setValue(this.CurrentStoreId);
        if (this.requisition.IsValidCheck(undefined, undefined) == false) {
            for (let b in this.requisition.RequisitionValidator.controls) {
                this.requisition.RequisitionValidator.controls[b].markAsDirty();
                this.requisition.RequisitionValidator.controls[b].updateValueAndValidity();
                CheckIsValid = false;
            }
        }


        for (let i = 0; i < this.requisition.RequisitionItems.length; i++) {
            if (this.requisition.RequisitionItems[i].IsValidCheck(undefined, undefined) == false) {
                for (var a in this.requisition.RequisitionItems[i].RequisitionItemValidator.controls) {
                    this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].markAsDirty();
                    this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].updateValueAndValidity();
                }
                CheckIsValid = false;
            }
            if (this.requisition.RequisitionItems[i].IsActive == false && this.requisition.RequisitionItems[i].CancelRemarks.length == 0) {
                CheckIsValid = false;
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Please write withdraw remarks for item ", this.requisition.RequisitionItems[i].ItemName]);
                break;
            }
        }


        if (this.requisition.RequisitionItems.length == 0 || this.requisition.RequisitionItems.every(a => a.IsActive == false)) {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Please Add Item ...Before Requesting"]);
            CheckIsValid = false;
        }

        if (CheckIsValid == true && this.requisition.RequisitionItems != null) {
            this.requisition.ModifiedOn = new Date();
            this.requisition.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.requisition.RequisitionItems.map(a => {
                a.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
                a.RequisitionId = this.requisition.RequisitionId;
                a.IssueNo = this.requisition.IssueNo;
            })
            this.loading = true;
            this.wardsupplyBLService.PutUpdateRequisition(this.requisition).finally(() => { this.loading = false })
                .subscribe(res => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.changeDetectorRef.detectChanges();
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Requisition is Updated."]);

                        this.requisition.RequisitionItems = new Array<RequisitionItems>();
                        this.requisition = new Requisition();
                        this.currentRequItem = new RequisitionItems();
                        this.currentRequItem.Quantity = 1;
                        this.requisition.RequisitionItems.push(this.currentRequItem);
                        this.inventoryService.RequisitionId = res.Results;
                        this.showInventoryRequisitionDetails = true;
                    }
                    else {

                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['failed to add Requisition.. please check log for details.']);
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
        this.router.navigate(['/WardSupply/Inventory/InventoryRequisitionList']);
    }
    logError(err: any) {
        console.log(err);
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

    GoToNextInput(idToSelect: string, t: number) {
        window.setTimeout(function () {
            if (document.getElementById(idToSelect)) {
                let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
                nextEl.focus();
                nextEl.select();
            }
        }, t)


    }
    public get IsReqDateValid() {
        return this.inventoryService.allFiscalYearList.some(fy => (fy.IsClosed == null || fy.IsClosed == false) && moment(this.requisition.RequisitionDate).isBetween(fy.StartDate, fy.EndDate)) as Boolean;
    }

    GetAvailableQuantityByItemIdAndStoreId(CurrentItemId: number, CurrentStoreId: number, index: number) {
        this.inventoryBLService.GetAvailableQuantityByItemIdAndStoreId(CurrentItemId, CurrentStoreId)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    if (res.Results != null)
                        this.requisition.RequisitionItems[index].AvailableQuantity = res.Results.AvailableQuantity;
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Unable to get Items."]);

                }
            })
    }
    VerifierListFormatter(data: any): string {
        return `${data["Name"]} (${data["Type"]})`;
    }

    ShowVerifiers() {
        if (this.requisition.IsVerificationEnabled == true) {
            this.AddVerifier();
        }
        else {
            this.requisition.VerifierList = [];
        }
    }
    DeleteVerifier(index: number) {
        this.requisition.VerifierList.splice(index, 1);
    }

    AddVerifier() {
        this.requisition.VerifierList.push(new InventoryWardRequisitionVerifier_DTO())
    }

    AssignVerifier($event, index) {
        if (typeof $event == "object") {
            this.requisition.VerifierList[index] = $event;
        }
    }

    CheckIfDeleteVerifierAllowed() {
        return this.requisition.VerifierList.length <= 1;
    }
    CheckIfAddVerifierAllowed() {
        return this.requisition.VerifierList.some(V => V.Id == undefined) || this.requisition.VerifierList.length >= this.VerificationLevel;
    }


    public SetDefaultVerifier() {
        let SubStoreRequisitionVerificationSetting = this.coreService.Parameters.find(param => param.ParameterGroupName == "Inventory" && param.ParameterName == "SubStoreRequisitionVerificationSetting").ParameterValue;
        let SubStoreRequisitionVerificationSettingParsed = JSON.parse(SubStoreRequisitionVerificationSetting);
        if (SubStoreRequisitionVerificationSettingParsed != null) {
            if (SubStoreRequisitionVerificationSettingParsed.EnableVerification == true) {
                this.requisition.IsVerificationEnabled = true;
                this.SetVerifiersFromVerifierIdsObj(SubStoreRequisitionVerificationSettingParsed.VerifierIds);
            }
            else {
                this.IsVerificationActivated = false;
            }
        }
    }

    private SetVerifiersFromVerifierIdsObj(VerifierIds: any) {
        if (this.requisition.IsVerificationEnabled == true && this.VerifierList != null) {
            this.requisition.VerifierList = [];
            var VerifierIdsParsed: any[] = (typeof (VerifierIds) == "string") ? JSON.parse(VerifierIds) : VerifierIds;
            if (VerifierIdsParsed == null || VerifierIdsParsed.length == 0) {
                this.AddVerifier();
            }
            else {
                VerifierIdsParsed.forEach(a => this.requisition.VerifierList.push(this.VerifierList.find(v => v.Id == a.Id && v.Type == a.Type)));
            }
        }
    }

    public LoadVerifiersForRequisition() {
        this.wardsupplyBLService.GetVerifiers()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.VerifierList = res.Results;
                    this.SetDefaultVerifier();
                }
            }, err => {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [err.error.ErrorMessage]);
            })
    }

    CloseInventoryRequisitionDetailsPopup() {
        this.showInventoryRequisitionDetails = false;
        this.router.navigate(['/WardSupply/Inventory/InventoryRequisitionList']);
    }

    GetSignatoryName(index: number): string {
        if (this.VerifierSignatories && this.VerifierSignatories.length) {
            return this.VerifierSignatories[index];
        }
    }

    public VerifierSignatories: [] = [];
    public VerificationLevel: number = 0;
    GetSigningPanelConfiguration() {
        this.VerifierSignatories = [];
        var signingPanelConfigurationParameter = this.coreService.Parameters.find(param => param.ParameterGroupName === 'Inventory' && param.ParameterName == "SigningPanelConfiguration")
        if (signingPanelConfigurationParameter) {
            let signingPanelConfigurationParameterValue = JSON.parse(signingPanelConfigurationParameter.ParameterValue);
            this.VerifierSignatories = signingPanelConfigurationParameterValue.VerifierSignatories;
            this.VerificationLevel = signingPanelConfigurationParameterValue.VerificationLevel;
        }
    }
}
export class Item {
    ItemId: number = null;
    StoreId: number = null;
    AvailableQuantity: number = 0;
}
