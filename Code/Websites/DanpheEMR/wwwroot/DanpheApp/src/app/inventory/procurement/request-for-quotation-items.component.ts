import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityService } from '../../security/shared/security.service';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { InventoryService } from '../shared/inventory.service';
import { RequestForQuotationModel } from '../shared/request-for-quotaion.model';
import { RequestForQuotationItemsModel } from '../shared/request-for-quotation-item.model';
import { ItemMaster } from '../shared/item-master.model';
import * as moment from 'moment/moment';
import { GoodsReceiptItems } from "../shared/goods-receipt-item.model";
import { GoodsReceipt } from '../shared/goods-receipt.model';
@Component({
  templateUrl: "../../view/inventory-view/RequestForQuotationItems.html"  // "/InventoryView/PurchaseOrderItems"
})
export class RequestForQuotationItemsComponent {

  public goodsReceipt: GoodsReceipt = new GoodsReceipt();
  public ReqForQuotation: RequestForQuotationModel = new RequestForQuotationModel();
  public ReqForQuotationList: RequestForQuotationItemsModel = new RequestForQuotationItemsModel();
  public ItemList: any[];
  public rowCount: number = 0;
  public checkIsItemPresent: boolean = false;
  public ShowVendorDetails: boolean = false;
  public index: number = 0;
  public showAddItemPopUp: boolean = false;

  constructor(public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public changeDetectorRef: ChangeDetectorRef,
    public messageBoxService: MessageboxService,
    public securityService: SecurityService,
    public router: Router) {
    this.ShowVendorDetails = false;
    this.LoadItemsList();
    this.AddRowRequest();
    this.ReqForQuotation.RequestedOn = moment().format('YYYY-MM-DD');
    this.ReqForQuotation.RequestedCloseOn = moment().format('YYYY-MM-DD');
  }

  ngAfterViewChecked() {
    this.changeDetectorRef.detectChanges();
  }

  LoadItemsList() {
    this.inventoryBLService.GetItemList()
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length > 0) {
          this.ItemList = res.Results;
        }
        else {
          this.messageBoxService.showMessage("notice-message", ["No Items Avaliable for this ItemType"]);
        }
      });
  }


  AddRowRequest() {
    if (this.ReqForQuotation.ReqForQuotationItems.length == 0) {
      this.ReqForQuotation.ReqForQuotationItems.push(this.ReqForQuotationList);
    }
    else {
      //checking the validation
      for (var i = 0; i < this.ReqForQuotation.ReqForQuotationItems.length; i++) {
        for (var a in this.ReqForQuotation.ReqForQuotationItems[i].ReqForQuotationItemValidator.controls) {
          this.ReqForQuotation.ReqForQuotationItems[i].ReqForQuotationItemValidator.controls[a].markAsDirty();
          this.ReqForQuotation.ReqForQuotationItems[i].ReqForQuotationItemValidator.controls[a].updateValueAndValidity();
        }
      }
      this.rowCount++;
      this.ReqForQuotationList = new RequestForQuotationItemsModel();
      this.ReqForQuotation.ReqForQuotationItems.push(this.ReqForQuotationList);
    }
  }

  DeleteRow(index) {
    this.ReqForQuotation.ReqForQuotationItems.splice(index, 1);
    if (index == 0) {
      this.ReqForQuotationList = new RequestForQuotationItemsModel();
      this.ReqForQuotation.ReqForQuotationItems.push(this.ReqForQuotationList);
      this.changeDetectorRef.detectChanges();
    }
    else {
      this.changeDetectorRef.detectChanges();
    }
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
      let currentGRItem = new GoodsReceiptItems();
      currentGRItem.ReceivedQuantity = 1;
      this.goodsReceipt.GoodsReceiptItem.splice(this.index, 1, currentGRItem);
      this.goodsReceipt.GoodsReceiptItem[this.index].ItemId = item.ItemId;
      this.goodsReceipt.GoodsReceiptItem[this.index].ItemName = item.ItemName;
  }
  //used to format display item in ng-autocomplete
  myListFormatter(data: any): string {
    return data["ItemName"];
   
  }
 
  SelectItemFromSearchBox(Item: ItemMaster, index) {
    if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
      //this for loop with if conditon is to check whether the  item is already present in the array or not 
      //means to avoid duplication of item
      for (var i = 0; i < this.ReqForQuotation.ReqForQuotationItems.length; i++) {
        if (this.ReqForQuotation.ReqForQuotationItems[i].ItemId == Item.ItemId) {
          this.checkIsItemPresent = true;
        }
      }

      if (this.checkIsItemPresent == true) {
        this.messageBoxService.showMessage("notice-message", [Item.ItemName + " is already add..Please Check!!!"]);
        this.checkIsItemPresent = false;
        this.changeDetectorRef.detectChanges();
        this.ReqForQuotation.ReqForQuotationItems.splice(index, 1);
        this.ReqForQuotationList = new RequestForQuotationItemsModel();
        this.ReqForQuotation.ReqForQuotationItems.push(this.ReqForQuotationList);
      }
      else {
        for (var a = 0; a < this.ReqForQuotation.ReqForQuotationItems.length; a++) {
          if (a == index) {
            this.ReqForQuotation.ReqForQuotationItems[index].ItemId = Item.ItemId;
            this.ReqForQuotation.ReqForQuotationItems[index].ItemName = Item.ItemName;
            this.ReqForQuotation.ItemId = Item.ItemId;
          }
        }
      }
    }
  }

  AddRequestForQuotaion() {
    var CheckIsValid = true;
    if (this.ReqForQuotation.IsValidCheck(undefined, undefined) == false) {
      // for loop is used to show PurchaseOrderValidator message ..if required  field is not filled
      for (var b in this.ReqForQuotation.ReqForQuotationValidator.controls) {
        this.ReqForQuotation.ReqForQuotationValidator.controls[b].markAsDirty();
        this.ReqForQuotation.ReqForQuotationValidator.controls[b].updateValueAndValidity();
        CheckIsValid = false;
      }
    }

    for (var i = 0; i < this.ReqForQuotation.ReqForQuotationItems.length; i++) {
      if (this.ReqForQuotation.ReqForQuotationItems[i].IsValidCheck(undefined, undefined) == false) {
        // for loop is used to show PurchaseOrderItemValidator message ..if required  field is not filled
        for (var a in this.ReqForQuotation.ReqForQuotationItems[i].ReqForQuotationItemValidator.controls) {
          this.ReqForQuotation.ReqForQuotationItems[i].ReqForQuotationItemValidator.controls[a].markAsDirty();
          this.ReqForQuotation.ReqForQuotationItems[i].ReqForQuotationItemValidator.controls[a].updateValueAndValidity();
        }
        CheckIsValid = false;
      }
    }


    if (this.ReqForQuotation.ReqForQuotationItems.length == 0) {
      this.messageBoxService.showMessage("notice-message", ["Please Add Item ...Before Requesting"]);
    }

    if (CheckIsValid == true && this.ReqForQuotation.ReqForQuotationItems != null) {
      //Updating the Status
      this.ReqForQuotation.Status = "active";
      this.ReqForQuotation.RequestedBy = this.securityService.GetLoggedInUser().UserName;
      for (var i = 0; i < this.ReqForQuotation.ReqForQuotationItems.length; i++) {
        this.ReqForQuotation.ReqForQuotationItems[i].ItemStatus = "active";
        this.ReqForQuotation.ReqForQuotationItems[i].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.ReqForQuotation.ApprovedBy = this.securityService.GetLoggedInUser().EmployeeId;
      }

      this.inventoryBLService.PostToReqForQuotation(this.ReqForQuotation).
        subscribe(res => {
          if (res.Status == 'OK') {
            this.messageBoxService.showMessage("success", ["Request For Quotation is Generated and Saved"]);
            this.changeDetectorRef.detectChanges();
            this.ReqForQuotation.ReqForQuotationItems = new Array<RequestForQuotationItemsModel>();
            this.ReqForQuotationList = new RequestForQuotationItemsModel();
            this.ReqForQuotation = new RequestForQuotationModel();
            this.ReqForQuotation.ReqForQuotationItems.push(this.ReqForQuotationList);
            this.router.navigate(['/Inventory/ProcurementMain/RequestForQuotation']);
          }
          else {
            this.messageBoxService.showMessage("failed", ['failed to Request For Quotation.. please check log for details.']);
            this.logError(res.ErrorMessage);
          }
        });
    } else {
      this.messageBoxService.showMessage("error",['You have missed Something..... Please fill that..'])
    }
  }

  Cancel() {
    this.ReqForQuotationList = new RequestForQuotationItemsModel();
    this.ReqForQuotation.ReqForQuotationItems.push(this.ReqForQuotationList);
    this.router.navigate(['Inventory/ProcurementMain/RequestForQuotation']);
  }

  logError(err: any) {
    console.log(err);
  }
}
