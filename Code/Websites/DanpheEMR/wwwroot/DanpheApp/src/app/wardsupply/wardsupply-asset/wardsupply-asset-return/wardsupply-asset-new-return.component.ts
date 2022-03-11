import { Component, ChangeDetectorRef, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityService } from '../../../security/shared/security.service';
import { InventoryBLService } from "../../../inventory/shared/inventory.bl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { CoreBLService } from "../../../core/shared/core.bl.service";
import { CoreService } from '../../../core/shared/core.service';
import { WardSupplyBLService } from '../../shared/wardsupply.bl.service';
import * as moment from 'moment/moment';
import { WardSupplyAssetReturnItemsModel } from '../../shared/wardsupply-asset-returnItems.model';
import { WardSupplyAssetReturnModel } from '../../shared/wardsupply-asset-return.model';
import { PHRMStoreModel } from "../../../pharmacy/shared/phrm-store.model";
import { wardsupplyService } from "../../shared/wardsupply.service";
@Component({
    selector: 'wardsupply-asset-new-return',
    templateUrl: "./wardsupply-asset-new-return.component.html"

})
  //swapnil-2-april-2021
export class WardSupplyAssetReturnComponent {
    public activeSubstoreId: number = 0;
    ////binding logic
    public currentRequItem: WardSupplyAssetReturnItemsModel = new WardSupplyAssetReturnItemsModel();
    public return: WardSupplyAssetReturnModel = new WardSupplyAssetReturnModel();
    public returnFinalObj: WardSupplyAssetReturnModel = new WardSupplyAssetReturnModel();
    public returnFinalItemsObj: WardSupplyAssetReturnItemsModel = new WardSupplyAssetReturnItemsModel();
    public returnFinalItemsArrayObj: Array<any> = new Array<any>();
    ////this Item is used for search button(means auto complete button)...
    public ItemList: any;
    public AllItemList: any;
    public sameItemList: any;
    public CommonList:any=[];
    public barCodeNumberList: any = [];
    ////this is to add or delete the number of row in ui
    public rowCount: number = 0;
    public checkIsItemPresent: boolean = false;
    public checkIsItem: boolean = false;

    public index: number = 0;
    public showAddItemPopUp: boolean = false;
    public inventoryList: Array<PHRMStoreModel> = new Array<PHRMStoreModel>();
    public selectedInventory: number = 0;
    public disableReturnButton:boolean=false;
    constructor(
        public changeDetectorRef: ChangeDetectorRef,
        public inventoryBLService: InventoryBLService,
        public inventoryService: InventoryService,
        public wardsupplyBLService: WardSupplyBLService,
        public securityService: SecurityService,
        public router: Router,
        public messageBoxService: MessageboxService,
        public coreBLService: CoreBLService,
        public coreService: CoreService, public wardsupplyService: wardsupplyService) {
        //whatever you need to write in constructor, write inside CheckForSubstoreActivation()
        this.CheckForSubstoreActivation();
        this.GetInventoryList();
        this.SetFocusById('selectInventory');   
    }
    GetInventoryList() {
        this.inventoryList = this.wardsupplyService.inventoryList;
    }
    LoadReturn(returnId) {
        this.inventoryBLService.GetToRequistion(returnId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    var Return = res.Results;
                    this.return.StoreId = Return.StoreId;
                    this.return.ReturnStatus = Return.ReturnStatus;

                    for (var i = 0; i < Return.ReturnItems.length; i++) {
                        if (Return.ReturnItems[i].IsActive == true) {
                            var newItem = new WardSupplyAssetReturnItemsModel();
                            newItem.Code = Return.ReturnItems[i].Code;
                            newItem.UOMName = Return.ReturnItems[i].UOMName;
                            newItem.SelectedItem = this.ItemList.find(item => item.ItemId == Return.ReturnItems[i].ItemId);
                            this.return.ReturnItemsList.push(newItem);
                            this.return.ReturnItemsList[this.return.ReturnItemsList.length - 1].ReturnItemValidator.controls["ItemId"].setValue(newItem.ItemId);
                            this.currentRequItem = newItem;
                        }

                    }
                    if (this.return.ReturnItemsList.length == 0) {
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
        this.wardsupplyBLService.GetFixedAssetStockBySubStoreId(this.wardsupplyService.activeSubstoreId)
            .subscribe(res => this.CallBackGetItemList(res));
    }
    CallBackGetItemList(res) {
        if (res.Status == 'OK') {
            this.ItemList = [];
            this.AllItemList = [];
            if (res && res.Results) {
                res.Results.forEach(a => {
                    this.ItemList.push({
                        "FixedAssetStockId": a.FixedAssetStockId,
                        "ItemId": a.ItemId, "ItemName": a.ItemName, "VendorName": a.VendorName,
                        "Code": a.ItemCode, "BatchNo": a.BatchNo, "SerialNo": a.SerialNo,
                        "BarCodeNumber": a.BarCodeNumber, "IsActive": a.IsActive, "Remark": "",
                        "StoreId":a.StoreId
                    });
                });
                this.ItemList.forEach(function (item, index) {
                    item.Id = index;
                });

            }
            this.ItemList = this.ItemList.filter(item => item.IsActive == true);
            this.AllItemList = this.ItemList;
            this.CommonList=this.ItemList;
            this.FilterDistinctItem(this.ItemList);
            this.wardsupplyService.ReturnId = 0;
            this.InitializeReturnItems();
        }
        else {
            err => {
                this.messageBoxService.showMessage("failed", ['failed to get Item.. please check log for details.']);
                this.logError(err.ErrorMessage);
            }
        }
    }
    public FilterDistinctItem(items) {
        if (items && items.length) {
            let distinctItem = new Array<any>();
            distinctItem.push(this.ItemList.find(srv => srv.ItemName == items[0].ItemName));
            items.forEach(itm => {
                //push only if current type isn't already added.
                if (!distinctItem.find(dst => dst.ItemName == itm.ItemName)) {
                    distinctItem.push(this.ItemList.find(srv => srv.ItemName == itm.ItemName));
                }
            });
            this.ItemList = distinctItem;
        }
    }
    private InitializeReturnItems() {
        if (this.wardsupplyService.ReturnId > 0) {
            this.LoadReturn(this.wardsupplyService.ReturnId);
        }
        else {
            //pushing currentPOItem for the first Row in UI
            this.return.ReturnItemsList.push(this.currentRequItem);
            //this.SetFocusOnItemName(0);
            this.return.StoreId = this.selectedInventory;
            this.return.SubStoreId = this.activeSubstoreId;
            this.SetFocusById('selectInventory');   
        }
    }
    ////add a new row
    AddRowRequest() {
        for (var i = 0; i < this.return.ReturnItemsList.length; i++) {
            // for loop is used to show ReturnItemValidator message ..if required  field is not filled
            for (var a in this.return.ReturnItemsList[i].ReturnItemValidator.controls) {
                this.return.ReturnItemsList[i].ReturnItemValidator.controls[a].markAsDirty();
                this.return.ReturnItemsList[i].ReturnItemValidator.controls[a].updateValueAndValidity();
            }
        }
        this.rowCount++;
        this.currentRequItem = new WardSupplyAssetReturnItemsModel();
        this.return.ReturnItemsList.push(this.currentRequItem);
        let nextInputIndex = this.return.ReturnItemsList.length - 1;
        //this.SetFocusOnItemName(nextInputIndex);
    }
    public SetFocusOnItemName(index: number) {
        let elementToBeFocused = 'itemName' + index;
        this.SetFocusById(elementToBeFocused);
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
        var reqItem = this.return.ReturnItemsList[index];
        this.DeleteRow(index);
    }
    ////to delete the row
    DeleteRow(index) {
        try {
            this.return.ReturnItemsList.splice(index, 1);
            this.returnFinalItemsArrayObj.splice(index, 1);
            if (this.return.ReturnItemsList.length == 0) {
                this.AddRowRequest();
            }
        }
        catch (exception) {
            this.messageBoxService.showMessage("Error", [exception]);
        }
    }

    SelectItemFromSearchBox(Item: any, index) {
        //if proper item is selected then the below code runs ..othewise it goes out side the function
        if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
            this.return.ReturnItemsList[index].BarCodeNumberList=[];
            this.return.ReturnItemsList[index].BarCodeNumberList= this.AllItemList.filter(i => i.ItemId == Item.ItemId);
            if (Item.ItemId > 0) {
                this.return.ReturnItemsList[index].Id = Item.Id;
                this.return.ReturnItemsList[index].ItemId = Item.ItemId;
                this.return.ReturnItemsList[index].ItemName = Item.ItemName;
                this.return.ReturnItemsList[index].VendorName = Item.VendorName;
                this.return.ReturnItemsList[index].Code = Item.Code;               
            }
          
        }
    }
    SelectItem(Item: any, index) {
        //if proper item is selected then the below code runs ..othewise it goes out side the function
        if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {

            for (var i = 0; i < this.return.ReturnItemsList.length; i++) {
                if (this.return.ReturnItemsList[i].BarCodeNumber == Item.BarCodeNumber) {
                    this.checkIsItem = true;
                }
            }
            //id item is present the it show alert otherwise it assign the value
            if (this.checkIsItem == true) {
                this.messageBoxService.showMessage("notice-message", ["BarCodeNumber is already added Please Check!!!"]);
                this.DeleteRow(index);
                this.checkIsItem = false;
                this.changeDetectorRef.detectChanges();
            }
            else {               
                this.return.ReturnItemsList[index].FixedAssetStockId = Item.FixedAssetStockId;
                this.return.ReturnItemsList[index].BarCodeNumber = Item.BarCodeNumber;             
                this.return.ReturnItemsList[index].BatchNo = Item.BatchNo;
                this.return.ReturnItemsList[index].SerialNo = Item.SerialNo;
                
            }
        }
    }
    ////used to format display item in ng-autocomplete
    myListFormatter(data: any): string {
        let html = data["ItemName"];
        return html;
    }
    ListFormatter(data: any): string {
        let html = data["BarCodeNumber"];
        return html;
    }
    ////posting to db
    AddReturn() {
        var CheckIsValid = true;      
        if (!this.selectedInventory || this.selectedInventory == 0) {
            this.messageBoxService.showMessage("error", ['Please select inventory for return']);
            return;
        }
        if (this.return.ReturnItemsList.length >0) {
            //Updating the Status
            this.return.ReturnStatus = "active";                    
            //Comment by Nagesh on 11-Jun-17 Employee Id not getting so, now passing static id
            for (var i = 0; i < this.return.ReturnItemsList.length; i++) {             
                this.return.ReturnItemsList[i].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            }
            for (var i = 0; i <   this.return.ReturnItemsList.length; i++) {
               if(!this.return.ReturnItemsList[i].ItemName){
                this.messageBoxService.showMessage("error", ['Please select Item name for return']);
                return;
               }
               if(!this.return.ReturnItemsList[i].BarCodeNumber){
                this.messageBoxService.showMessage("error", ['Please Select BarCodeNumber for return']);
                return;
               }
            }
            this.disableReturnButton=true;
            if (this.return.IsValidCheck(undefined, undefined) == false) {
                // for loop is used to show ReturnValidator message ..if required  field is not filled
                for (var a in this.return.ReturnValidator.controls) {
                    this.return.ReturnValidator.controls[a].markAsDirty();
                    this.return.ReturnValidator.controls[a].updateValueAndValidity();
                }
                CheckIsValid = false;
                this.disableReturnButton = false;
            }
            for (var i = 0; i < this.return.ReturnItemsList.length; i++) {
                if (this.return.ReturnItemsList[i].IsValidCheck(undefined, undefined) == false) {
    
                    // for loop is used to show ReturnItemValidator message ..if required  field is not filled
                    for (var a in this.return.ReturnItemsList[i].ReturnItemValidator.controls) {
                        this.return.ReturnItemsList[i].ReturnItemValidator.controls[a].markAsDirty();
                        this.return.ReturnItemsList[i].ReturnItemValidator.controls[a].updateValueAndValidity();
                    }
                    CheckIsValid = false;
                    this.disableReturnButton = false;
                }
            }
            if(CheckIsValid==false){
                this.messageBoxService.showMessage("error", ['Please fix values and try again.']);
                return;                
            }
            this.wardsupplyBLService.PostToAssetReturn(this.return)
            .subscribe(
                res => {
                    if (res.Status == 'OK') {
                        this.disableReturnButton=false
                        this.messageBoxService.showMessage("success", ["Return is Generated and Saved"]);
                        this.changeDetectorRef.detectChanges();
                        ////deleting all creating new return..after successully adding to db
                        this.return.ReturnItemsList = new Array<WardSupplyAssetReturnItemsModel>();
                        this.return = new WardSupplyAssetReturnModel();
                        this.currentRequItem = new WardSupplyAssetReturnItemsModel();                        
                        this.return.ReturnItemsList.push(this.currentRequItem);
                        //route back to return list
                        this.RouteToViewDetail(res.Results);
                    }
                    else {
                        err => {
                            this.disableReturnButton=false
                            this.messageBoxService.showMessage("failed", ['failed to add Return.. please check log for details.']);
                            this.logError(err.ErrorMessage);
                            //route back to return list
                            this.returnList();
                        }
                    }
                },
                err => {
                    this.disableReturnButton=false
                    this.messageBoxService.showMessage("failed", ['failed to add Return.. please check log for details.']);
                    this.logError(err.ErrorMessage);
                    //route back to return list
                    this.returnList();
                });              
        }
    }


    ////this is to cancel the whole PO at one go and adding new PO

    Cancel() {
        this.return.ReturnItemsList = new Array<WardSupplyAssetReturnItemsModel>();
        this.return = new WardSupplyAssetReturnModel();
        this.currentRequItem = new WardSupplyAssetReturnItemsModel()
        this.return.ReturnItemsList.push(this.currentRequItem);
        //route back to return list
        this.returnList();
    }
    logError(err: any) {
        console.log(err);
    }

    RouteToViewDetail(reqId: number) {
        //pass the Return Id to ReturnView page for List of Details about return
        this.wardsupplyService.ReturnId = reqId;
        this.wardsupplyService.isModificationAllowed = true;
        this.returnList();
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
        this.currentRequItem = new WardSupplyAssetReturnItemsModel();
        this.return.ReturnItemsList.splice(this.index, 1, this.currentRequItem);
        this.return.ReturnItemsList[this.index].SelectedItem = item;
    }

    GoToNextInput(idToSelect: string,Item?:any,index?:number) {
        if (document.getElementById(idToSelect)) {
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
        return this.inventoryService.allFiscalYearList.some(fy => (fy.IsClosed == null || fy.IsClosed == false) && moment(this.return.ReturnDate).isBetween(fy.StartDate, fy.EndDate)) as Boolean;
    }
    @Output("callback-new-req")
    callbackNewReq: EventEmitter<Object> = new EventEmitter<Object>();

    returnList() {
        this.wardsupplyService.ReturnId = 0;
        this.callbackNewReq.emit({ showNewReq: false });
    }
    OnInventoryChange() {
        let inventory = null;
        if (!this.selectedInventory) {
            this.return.StoreId = null;
        }
        else if  (this.selectedInventory) {
            inventory = this.inventoryList.find(a => a.StoreId == this.selectedInventory);
        }
        if (inventory) {
            this.return.StoreId = inventory.StoreId;
            this.AllItemList=this.CommonList.filter(i=>i.StoreId==this.selectedInventory);
                this.ItemList=this.AllItemList;
                this.FilterDistinctItem(this.AllItemList);
                this.ItemList=this.ItemList.filter(i=>i.StoreId==this.selectedInventory);
            this.SetFocusOnItemName(0);

        }
        else {
            this.return.StoreId = null;
        }
    }
    OnPressedEnterKeyInItemField(index) {
        if (this.return.ReturnItemsList[index].SelectedItem != null && this.return.ReturnItemsList[index].ItemId != null) {
           
            this.SetFocusById(`barCodeNumber${index}`);
        }
        else {
            this.return.ReturnItemsList.splice(index, 1);
            this.SetFocusById('remarks');
           

        }
    }
}












