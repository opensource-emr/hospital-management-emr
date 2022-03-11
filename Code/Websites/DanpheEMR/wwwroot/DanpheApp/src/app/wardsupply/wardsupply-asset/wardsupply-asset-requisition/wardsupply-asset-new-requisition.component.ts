import { Component, ChangeDetectorRef, OnDestroy, Output, EventEmitter } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { SecurityService } from '../../../security/shared/security.service';
import { InventoryBLService } from "../../../inventory/shared/inventory.bl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ItemMaster } from "../../../inventory/shared/item-master.model";
import { InventoryService } from '../../../inventory/shared/inventory.service';
//import { VendorMaster } from "../shared/vendor-master.model";
import { CoreBLService } from "../../../core/shared/core.bl.service";
import { CoreService } from '../../../core/shared/core.service';
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { WardSupplyBLService } from '../../shared/wardsupply.bl.service';
import * as moment from 'moment/moment';
import { WardSupplyAssetRequisitionItemsModel } from '../../shared/wardsupply-asset-requisitionItems.model';
import { WardSupplyAssetRequisitionModel } from '../../shared/wardsupply-asset-requisition.model';
import { PHRMStoreModel } from "../../../pharmacy/shared/phrm-store.model";
import { wardsupplyService } from "../../shared/wardsupply.service";
import { Item } from 'angular2-multiselect-dropdown';
@Component({
    selector: 'wardsupply-asset-new-requisition',
    templateUrl: "./wardsupply-asset-new-requisition.component.html" 

})
export class WardSupplyAssetRequisitionComponent {    
    public activeSubstoreId: number = 0;
    ////binding logic
    public currentRequItem: WardSupplyAssetRequisitionItemsModel = new WardSupplyAssetRequisitionItemsModel();
    public requisition: WardSupplyAssetRequisitionModel = new WardSupplyAssetRequisitionModel();
    ////this Item is used for search button(means auto complete button)...
    public ItemList: any;
    ////this is to add or delete the number of row in ui
    public rowCount: number = 0;
    public checkIsItemPresent: boolean = false;
   
    public index: number = 0;
    public showAddItemPopUp: boolean = false;
    public isEditMode: boolean;
    public inventoryList:Array<PHRMStoreModel> = new Array<PHRMStoreModel>();
    public selectedInventory:number=0;
    public disableButton:boolean = false;
    constructor(
        public changeDetectorRef: ChangeDetectorRef,
        public inventoryBLService: InventoryBLService,
        public inventoryService: InventoryService,
        public wardsupplyBLService: WardSupplyBLService,
        public securityService: SecurityService,
        public router: Router,
        public messageBoxService: MessageboxService,
        public coreBLService: CoreBLService,
        public coreService: CoreService,public wardsupplyService:wardsupplyService) {
        //whatever you need to write in constructor, write inside CheckForSubstoreActivation()
        this.CheckForSubstoreActivation();
        this.GetInventoryList();
        this.SetFocusById('selectInventory');       
    }

    GetInventoryList()
    { 
      this.inventoryList = this.wardsupplyService.inventoryList;
    }
    InventoryListFormatter(data: any): string {
        return data["Name"];
    }
    OnInventoryChange() {
        let inventory = null;
        if (!this.selectedInventory) {
            this.requisition.StoreId = null;
        }
        else if  (this.selectedInventory) {
            inventory = this.inventoryList.find(a => a.StoreId == this.selectedInventory);
        }
        else if (typeof (this.selectedInventory) == "object") {
            inventory = this.selectedInventory;
        }
        if (inventory) {
            this.requisition.StoreId = inventory.StoreId;
            this.SetFocusOnItemName(0);

        }
        else {
            this.requisition.StoreId = null;
        }
    }
    LoadRequisition(requisitionId) {
        this.inventoryBLService.GetToRequistion(requisitionId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    var Requisition = res.Results;                   
                    this.requisition.StoreId = Requisition.StoreId;
                    this.requisition.RequisitionStatus = Requisition.RequisitionStatus;
                    for (var i = 0; i < Requisition.RequisitionItems.length; i++) {
                        if (Requisition.RequisitionItems[i].IsActive == true) {
                            var newItem = new WardSupplyAssetRequisitionItemsModel();
                            newItem.Quantity = Requisition.RequisitionItems[i].Quantity;
                            newItem.PendingQuantity = Requisition.RequisitionItems[i].PendingQuantity;
                            newItem.ItemName = Requisition.RequisitionItems[i].ItemName;
                             newItem.Code = Requisition.RequisitionItems[i].Code;                           
                            newItem.UOMName = Requisition.RequisitionItems[i].UOMName;
                            newItem.SelectedItem = this.ItemList.find(item => item.ItemId == Requisition.RequisitionItems[i].ItemId);
                            this.requisition.RequisitionItemsList.push(newItem);
                            this.requisition.RequisitionItemsList[this.requisition.RequisitionItemsList.length - 1].RequisitionItemValidator.controls["ItemId"].setValue(newItem.ItemId);
                            this.requisition.RequisitionItemsList[this.requisition.RequisitionItemsList.length - 1].RequisitionItemValidator.controls["Quantity"].setValue(newItem.Quantity);
                            this.currentRequItem = newItem;
                        }

                    }
                    if (this.requisition.RequisitionItemsList.length == 0) {
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
        this.activeSubstoreId = this.wardsupplyService.activeSubstoreId;
        try {
            if (!this.activeSubstoreId) {
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
 

    ////to load the item in the start
    LoadItemList(): void {
        this.wardsupplyBLService.GetCapitalGoodsItemList()
            .subscribe(res => this.CallBackGetItemList(res));
    }
    CallBackGetItemList(res) {
        if (res.Status == 'OK') {
            this.ItemList = [];
            if (res && res.Results) {
                res.Results.forEach(a => {
                    this.ItemList.push({
                        "ItemId": a.ItemId, "ItemName": a.ItemName, "UOMName": a.UOMName, "Code": a.Code, "IsActive": a.IsActive, "ItemType": a.ItemType 
                    });
                });
            }
            this.ItemList = this.ItemList.filter(item => item.IsActive == true); /* changes*/
            //NBB-Now we are only focusing on create requisition edit is not done
            //so we will make requisitionid=0 for every time
            this.wardsupplyService.RequisitionId=0;
            this.InitializeRequisitionItems();
        }
        else {
            err => {
                this.messageBoxService.showMessage("failed", ['failed to get Item.. please check log for details.']);
                this.logError(err.ErrorMessage);
            }
        }
    }
    private InitializeRequisitionItems() {        
        if (this.wardsupplyService.RequisitionId > 0) {
            this.LoadRequisition(this.wardsupplyService.RequisitionId);
        }
        else {
            ////pushing currentPOItem for the first Row in UI
            this.requisition.RequisitionItemsList.push(this.currentRequItem);
            //this.SetFocusOnItemName(0);
            this.requisition.StoreId = this.selectedInventory;
            this.requisition.SubStoreId=this.activeSubstoreId;
            this.currentRequItem.Quantity = 1;
            this.SetFocusById('selectInventory');  
        }   
      }
    ////add a new row
    AddRowRequest() {
        for (var i = 0; i < this.requisition.RequisitionItemsList.length; i++) {
            // for loop is used to show RequisitionItemValidator message ..if required  field is not filled
            for (var a in this.requisition.RequisitionItemsList[i].RequisitionItemValidator.controls) {
                this.requisition.RequisitionItemsList[i].RequisitionItemValidator.controls[a].markAsDirty();
                this.requisition.RequisitionItemsList[i].RequisitionItemValidator.controls[a].updateValueAndValidity();
            }
        }
        this.rowCount++;
        this.currentRequItem = new WardSupplyAssetRequisitionItemsModel();
        this.currentRequItem.Quantity = 1;
        this.requisition.RequisitionItemsList.push(this.currentRequItem);

        let nextInputIndex = this.requisition.RequisitionItemsList.length - 1;
        //this.SetFocusOnItemName(nextInputIndex);
    }
    public SetFocusOnItemName(index: number) {
        let elementToBeFocused = 'itemName' + index;
        this.SetFocusById(elementToBeFocused);
    }
    OnPressedEnterKeyInQuantityField(index) {
        var isinputvalid = this.requisition.RequisitionItemsList.every(item => item.Quantity > 0)
        if (isinputvalid == true) {
            //If index is last element of array, then create new row
            if (index == (this.requisition.RequisitionItemsList.length - 1)) {
                this.AddRowRequest();
            }
            this.SetFocusOnItemName(index + 1);
        }
    }
    OnPressedEnterKeyInItemField(index) {
        if (this.requisition.RequisitionItemsList[index].SelectedItem != null && this.requisition.RequisitionItemsList[index].ItemId != null) {
            this.SetFocusById(`qtyip${index}`);
        }
        else {
            if (this.requisition.RequisitionItemsList.length == 1) {
                this.SetFocusOnItemName(index)
            }
            else {
                this.requisition.RequisitionItemsList.splice(index, 1);
                this.SetFocusById('remarks');
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

    DeleteAction(index) {
        var reqItem = this.requisition.RequisitionItemsList[index];
        this.DeleteRow(index);       
    }
    ////to delete the row
    DeleteRow(index) {
        try {
            this.requisition.RequisitionItemsList.splice(index, 1);
            if (this.requisition.RequisitionItemsList.length == 0) {
                this.AddRowRequest();
            }
        }
        catch (exception) {
            this.messageBoxService.showMessage("Error", [exception]);
        }
    }
   
    SelectItemFromSearchBox(Item: ItemMaster, index) {
        //if proper item is selected then the below code runs ..othewise it goes out side the function
        if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
            //this for loop with if conditon is to check whether the  item is already present in the array or not
            //means to avoid duplication of item
            for (var i = 0; i < this.requisition.RequisitionItemsList.length; i++) {
                if (this.requisition.RequisitionItemsList[i].ItemId == Item.ItemId) {
                    this.checkIsItemPresent = true;
                }
            }
            //id item is present the it show alert otherwise it assign the value
            if (this.checkIsItemPresent == true) {
                this.messageBoxService.showMessage("notice-message", [Item.ItemName + " is already add..Please Check!!!"]);
                this.checkIsItemPresent = false;
                this.changeDetectorRef.detectChanges();
                this.requisition.RequisitionItemsList.splice(index, 1);
                this.currentRequItem = new WardSupplyAssetRequisitionItemsModel();
                this.currentRequItem.Quantity = 1;
                this.currentRequItem.UOMName = Item.UOMName;
                this.currentRequItem.Code = Item.Code;
                this.requisition.RequisitionItemsList.push(this.currentRequItem);
            }
            else {
                for (var a = 0; a < this.requisition.RequisitionItemsList.length; a++) {
                    // Assiging the value StandardRate,VatPercentage and ItemId in the particular index ..
                    //it helps for changing item after adding the item and also in adding in new item
                    if (a == index) {
                        this.requisition.RequisitionItemsList[index].ItemId = Item.ItemId;
                        this.requisition.RequisitionItemsList[index].UOMName = Item.UOMName;
                        this.requisition.RequisitionItemsList[index].Code = Item.Code;
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
        this.disableButton = true;
        var CheckIsValid = true;
        this.requisition.StoreId =this.selectedInventory;
        this.requisition.SubStoreId= this.activeSubstoreId;
        if(!this.selectedInventory || this.selectedInventory==0){
            this.messageBoxService.showMessage("error",['Please select inventory for requisition']);
            this.disableButton = false;
            return;
        }
        if (this.requisition.IsValidCheck(undefined, undefined) == false) {
            // for loop is used to show RequisitionValidator message ..if required  field is not filled
            for (var a in this.requisition.RequisitionValidator.controls) {
                this.requisition.RequisitionValidator.controls[a].markAsDirty();
                this.requisition.RequisitionValidator.controls[a].updateValueAndValidity();
            }
            CheckIsValid = false;
            this.disableButton = false;
        }
        for (var i = 0; i < this.requisition.RequisitionItemsList.length; i++) {
            if (this.requisition.RequisitionItemsList[i].IsValidCheck(undefined, undefined) == false) {

                // for loop is used to show RequisitionItemValidator message ..if required  field is not filled
                for (var a in this.requisition.RequisitionItemsList[i].RequisitionItemValidator.controls) {
                    this.requisition.RequisitionItemsList[i].RequisitionItemValidator.controls[a].markAsDirty();
                    this.requisition.RequisitionItemsList[i].RequisitionItemValidator.controls[a].updateValueAndValidity();
                }
                CheckIsValid = false;
                this.disableButton = false;
            }
        }
        for(var i = 0;i<this.requisition.RequisitionItemsList.length;i++){
            for(var j = 0;j<this.ItemList.length;j++){
                if(this.ItemList[j].ItemName == this.requisition.RequisitionItemsList[i].RequisitionItemValidator.value.ItemId.ItemName){
                    break;
                }
                else{
                    if(j==this.ItemList.length-1){
                        this.messageBoxService.showMessage("failed", ["Invalid Item Name. Please select Item from the list."]);
                        this.disableButton = false;
                        return;
                    }
                    continue;
                }
            } 
        }             
        if (CheckIsValid == true && this.requisition.RequisitionItemsList != null) {
            //Updating the Status
            this.requisition.RequisitionStatus = "active";
            //Comment by Nagesh on 11-Jun-17 Employee Id not getting so, now passing static id
            //this.requisition.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            for (var i = 0; i < this.requisition.RequisitionItemsList.length; i++) {
                this.requisition.RequisitionItemsList[i].RequisitionItemStatus = "active";
                this.requisition.RequisitionItemsList[i].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                //this.requisition.RequisitionItemsList[i].AuthorizedBy = this.securityService.GetLoggedInUser().EmployeeId;
                //Comment on 02-July'17 By-Nagesh-No need to send Item Object with requisitionItems only Need ItemId
                this.requisition.RequisitionItemsList[i].ItemId = this.requisition.RequisitionItemsList[i].ItemId;
                //this.requisition.RequisitionItemsList[i].Item = null;
            }
            this.wardsupplyBLService.PostToAssetRequisition(this.requisition).
                subscribe(res => {
                    if (res.Status == 'OK') {
                        this.messageBoxService.showMessage("success", ["Requisition is Generated and Saved"]);                        
                        this.changeDetectorRef.detectChanges();
                        ////deleting all creating new requisition..after successully adding to db
                        this.requisition.RequisitionItemsList = new Array<WardSupplyAssetRequisitionItemsModel>();
                        this.requisition = new WardSupplyAssetRequisitionModel();
                        this.currentRequItem = new WardSupplyAssetRequisitionItemsModel();
                        this.currentRequItem.Quantity = 1;
                        this.requisition.RequisitionItemsList.push(this.currentRequItem);
                        //route back to requisition list
                        this.RouteToViewDetail(res.Results);                       
                    }
                    else {
                        err => {
                            this.messageBoxService.showMessage("failed", ['failed to add Requisition.. please check log for details.']);
                            this.logError(err.ErrorMessage);
                            //route back to requisition list
                            this.requisitionList();
                        }
                    }
                });
        }
    }

 
    ////this is to cancel the whole PO at one go and adding new PO
    
    Cancel() {
        this.requisition.RequisitionItemsList = new Array<WardSupplyAssetRequisitionItemsModel>();
        this.requisition = new WardSupplyAssetRequisitionModel();
        this.currentRequItem = new WardSupplyAssetRequisitionItemsModel()
        this.currentRequItem.Quantity = 1;
        this.requisition.RequisitionItemsList.push(this.currentRequItem);
        //route back to requisition list
        this.requisitionList();
    }
    logError(err: any) {
        console.log(err);
    }

    RouteToViewDetail(reqId: number) {
        //pass the Requisition Id to RequisitionView page for List of Details about requisition
        this.wardsupplyService.RequisitionId = reqId;
        this.wardsupplyService.isModificationAllowed = true;      
        this.requisitionList();
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
            "ItemId": item.ItemId, "ItemName": item.ItemName, StandardRate: item.StandardRate, VAT: item.VAT
        });
        this.currentRequItem = new WardSupplyAssetRequisitionItemsModel();
        this.currentRequItem.Quantity = 1;
        this.requisition.RequisitionItemsList.splice(this.index, 1, this.currentRequItem);
        this.requisition.RequisitionItemsList[this.index].SelectedItem = item;
    }

    GoToNextInput(idToSelect: string,Item?:any,index?:number) {
        if (document.getElementById(idToSelect)&& Item) {
            let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
            nextEl.focus();
            nextEl.select();
        }
        else{
            this.DeleteRow(index)
            idToSelect='remarks';
            if (document.getElementById(idToSelect)) {
              let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
              nextEl.focus();
              nextEl.select();
            }
          }
    }
    public get IsReqDateValid() {
        return this.inventoryService.allFiscalYearList.some(fy => (fy.IsClosed == null || fy.IsClosed == false) && moment(this.requisition.RequisitionDate).isBetween(fy.StartDate, fy.EndDate)) as Boolean;
    }
    @Output("callback-new-req")
    callbackNewReq: EventEmitter<Object> = new EventEmitter<Object>();
  
    requisitionList() {         
      this.wardsupplyService.RequisitionId=0;    
      this.callbackNewReq.emit({showNewReq: false });
    }
}
