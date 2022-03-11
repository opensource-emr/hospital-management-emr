import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { ItemMaster } from '../../../inventory/shared/item-master.model';
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { QuotationBLService } from '../quotation.bl.service';
import { GoodsReceipt } from '../../goods-receipt/goods-receipt.model';
import { GoodsReceiptItems } from '../../goods-receipt/goods-receipt-item.model';
import { RequestForQuotationModel } from '../request-for-quotaion.model';
import { RequestForQuotationItemsModel } from '../request-for-quotation-item.model';
import { ProcurementBLService } from '../../shared/procurement.bl.service';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
import { VendorMaster } from '../../../inventory/shared/vendor-master.model';
import { RequestForQuotationVendorModel } from '../request-for-quotation-vendor.model';

@Component({
  selector: 'app-request-for-quotation-add',
  templateUrl: './request-for-quotation-add.component.html',
  styles: []
})
export class RequestForQuotationAddComponent implements OnInit {

  public goodsReceipt: GoodsReceipt = new GoodsReceipt();
  public ReqForQuotation: RequestForQuotationModel = new RequestForQuotationModel();
  public ReqForQuotationList: RequestForQuotationItemsModel = new RequestForQuotationItemsModel();
  public ItemList: any[];
  public rowCount: number = 0;
  public checkIsItemPresent: boolean = false;
  public ShowVendorDetails: boolean = false;
  public index: number = 0;
  public showAddItemPopUp: boolean = false;
  public vendorList: Array<any> = new Array<any>();
  public selectedVendorData: Array<any> = new Array<any>();
  public checkSelectedVendor = false;
  ReqForQuotationVendors: RequestForQuotationVendorModel = new RequestForQuotationVendorModel();

  constructor(public quotationBLService: QuotationBLService,
    public procurementBLService: ProcurementBLService,
    public inventoryService: InventoryService,
    public changeDetectorRef: ChangeDetectorRef,
    public messageBoxService: MessageboxService,
    public securityService: SecurityService,
    public router: Router,
    private _activateInventoryService: ActivateInventoryService) {
    this.ShowVendorDetails = false;
    this.LoadItemsList();
    this.AddRowRequest();
    this.ReqForQuotation.RequestedOn = moment().format('YYYY-MM-DD');
    this.ReqForQuotation.RequestedCloseOn = moment().format('YYYY-MM-DD');
    this.setautofocus();
    this.getSupplierList();
  }
  ngOnInit() {
    this.ReqForQuotationVendors = new RequestForQuotationVendorModel();
    this.ReqForQuotation.ReqForQuotationVendors.push(this.ReqForQuotationVendors);
  }
  getSupplierList() {
    this.vendorList = this.inventoryService.allVendorList;
  }
  ////function call when User Click on Vendor Field;
  onChange($event) {
    this.selectedVendorData = $event;
    this.ReqForQuotation.ReqForQuotationVendors = this.selectedVendorData;
    // for (var k = 0; k < this.selectedVendorData.length; k++) {
    //   this.ReqForQuotation.ReqForQuotationVendors[k].VendorId = this.selectedVendorData[k].VendorId;
    //   this.ReqForQuotation.ReqForQuotationVendors[k].VendorName = this.selectedVendorData[k].VendorName;
    // }
  }
  setautofocus() {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById("Subject");
      if (itmNameBox) {
        itmNameBox.focus();
      }
    });
  }
  ngAfterViewChecked() {
    this.changeDetectorRef.detectChanges();
  }

  LoadItemsList() {
    this.procurementBLService.GetItemList(this._activateInventoryService.activeInventory.StoreId)
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
    let len = this.ReqForQuotation.ReqForQuotationItems.length - 1;
    window.setTimeout(function () {
      let itmNameBox = document.getElementById("itemName" + len);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    });

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
      "ItemId": item.ItemId, "ItemName": item.ItemName, StandardRate: item.StandardRate, VAT: item.VAT, "Code": item.Code, "UOMName": item.UOMName
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
            this.ReqForQuotation.ReqForQuotationItems[index].Code = Item.Code;
            this.ReqForQuotation.ReqForQuotationItems[index].UOMName = Item.UOMName;
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
      if (this.ReqForQuotation.ReqForQuotationItems[i].ItemId != null) {
        CheckIsValid = true;
      }
      else {
        CheckIsValid = false;
        this.messageBoxService.showMessage("notice", ["Please select Item of " + (i + 1).toString() + " rows"]);
        return;
      }
    }
    //check if vendor is selected or not: if not show error messasge.
    if (this.selectedVendorData.length == 0) {
      this.checkSelectedVendor = true;
    }
    else {
      this.checkSelectedVendor = false;
    }
    if (this.ReqForQuotation.ReqForQuotationVendors.length == 0) {
      CheckIsValid = false;
    }
    //check if the Item is selected or not;
    // this.ReqForQuotation.ReqForQuotationItems = this.ReqForQuotation.ReqForQuotationItems.filter(a => a.ItemId != null || a.ItemId > 0);
    // if (this.ReqForQuotation.ReqForQuotationItems.length == 0) {
    //   this.AddRowRequest();
    //   this.messageBoxService.showMessage("notice-message", ["No item selected. Please select some item."]);
    //   CheckIsValid = false;
    // }

    if (CheckIsValid == true && this.ReqForQuotation.ReqForQuotationItems != null && this.ReqForQuotation.ReqForQuotationVendors != null) {
      //Updating the Status
      this.ReqForQuotation.Status = "active";
      this.ReqForQuotation.RequestedBy = this.securityService.GetLoggedInUser().UserName;
      for (var i = 0; i < this.ReqForQuotation.ReqForQuotationItems.length; i++) {
        this.ReqForQuotation.ReqForQuotationItems[i].ItemStatus = "active";
        this.ReqForQuotation.ReqForQuotationItems[i].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.ReqForQuotation.ApprovedBy = this.securityService.GetLoggedInUser().EmployeeId;
      }

      if (!this._activateInventoryService.activeInventory.StoreId) {
        this.messageBoxService.showMessage("Alert!", ["Cannot find StoreId. Please select Inventory First!"])
        return;
      } else {
        this.ReqForQuotation.StoreId = this._activateInventoryService.activeInventory.StoreId;
        this.ReqForQuotation.RFQGroupId = this._activateInventoryService.activeInventory.INV_RFQGroupId;
      }

      this.quotationBLService.PostToReqForQuotation(this.ReqForQuotation).
        subscribe(res => {
          if (res.Status == 'OK') {
            this.messageBoxService.showMessage("success", ["Request For Quotation is Generated and Saved"]);
            this.changeDetectorRef.detectChanges();
            this.ReqForQuotation.ReqForQuotationItems = new Array<RequestForQuotationItemsModel>();
            this.ReqForQuotationList = new RequestForQuotationItemsModel();
            this.ReqForQuotation = new RequestForQuotationModel();
            this.ReqForQuotation.ReqForQuotationItems.push(this.ReqForQuotationList);
            this.router.navigate(['/ProcurementMain/Quotation/RequestForQuotationList']);
          }
          else {
            this.messageBoxService.showMessage("failed", ['failed to Request For Quotation.. please check log for details.']);
            this.logError(res.ErrorMessage);
          }
        });
    } else {
      this.messageBoxService.showMessage("error", ['You have missed Something..... Please fill that..'])
    }
  }

  Cancel() {
    this.ReqForQuotationList = new RequestForQuotationItemsModel();
    this.ReqForQuotation.ReqForQuotationItems.push(this.ReqForQuotationList);
    this.router.navigate(['ProcurementMain/Quotation/RequestForQuotationList']);
  }

  logError(err: any) {
    console.log(err);
  }

  GoToNextInput(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
      nextEl.select();
    }
  }

  OnPressedEnterKeyInItemField(index: number) {
    if (this.ReqForQuotation.ReqForQuotationItems[index].ItemId > 0) {
      this.GoToNextInput('qtyip' + index);
    }
    else {
      if (this.ReqForQuotation.ReqForQuotationItems.length > 1) {
        this.ReqForQuotation.ReqForQuotationItems.pop();
      }
      else {
        this.GoToNextInput('itemName' + index)
      }
      //this.currentPO.PHRMPurchaseOrderItems.pop();
      let isDataValid = this.ReqForQuotation.ReqForQuotationItems.every(a => a.ReqForQuotationItemValidator.valid == true);
      if (isDataValid) {
        this.GoToNextInput("RequestButton");
      }
    }
  }

}
