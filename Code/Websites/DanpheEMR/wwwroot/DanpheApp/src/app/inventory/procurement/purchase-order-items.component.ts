import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { SecurityService } from '../../security/shared/security.service';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";

import { PurchaseOrderItems } from "../shared/purchase-order-items.model";
import { PurchaseOrder } from "../shared/purchase-order.model";
import { ItemMaster } from "../shared/item-master.model";
import { VendorMaster } from "../shared/vendor-master.model";
import { InventoryService } from '../shared/inventory.service';
import { TermsConditionsMasterModel } from '../shared/terms-conditions-master.model'
import { FormBuilder, Validators } from '@angular/forms';
import { CommonValidators } from '../../shared/common-validator';

@Component({
  templateUrl: "../../view/inventory-view/PurchaseOrderItems.html"  // "/InventoryView/PurchaseOrderItems"
})
export class PurchaseOrderItemsComponent {
  //binding logic
  public currentPOItem: PurchaseOrderItems = new PurchaseOrderItems();
  public currentPO: PurchaseOrder = new PurchaseOrder();
  //for showing the vendor details
  public SelectedVendor: VendorMaster = new VendorMaster();
  public VendorList: Array<VendorMaster> = new Array<VendorMaster>();
  public TermsList: Array<TermsConditionsMasterModel> = new Array<TermsConditionsMasterModel>();
  //to multiple POItems
  public POItems: Array<PurchaseOrderItems> = new Array<PurchaseOrderItems>();
  //this Item is used for search button(means auto complete button)...
  public ItemList: any;
  //this is to add or delete the number of row in ui
  public rowCount: number = 0;
  public checkIsItemPresent: boolean = false;
  //display vendor on certain condition only
  public ShowVendorDetails: boolean = false;
  public index: number = 0;
  public showAddItemPopUp: boolean = false;
  public showAddVendorPopUp: boolean = false;
  public showAddTermsPopUp: boolean = false;
  public EditPO: boolean = false;
  public EditPOforValidators: boolean = false;

  constructor(
    public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public changeDetectorRef: ChangeDetectorRef,
    public messageBoxService: MessageboxService,
    public securityService: SecurityService,
    public router: Router) {

    //display vendor on certain condition only
    this.ShowVendorDetails = false;
    this.getVendorList();
    this.LoadItemList();
    this.LoadVendors();
    this.LoadTermsList();
    if (this.inventoryService.POId > 0) {
      this.EditPOforValidators = true;
      this.EditPO = true;
      this.LoadReceiptToEdit(this.inventoryService.POId);
    }
    else {
      //pushing currentPOItem for the first Row in UI 
      this.currentPO.PurchaseOrderItems.push(this.currentPOItem);
      this.currentPOItem.Quantity = 1;
    }
  }
  ngAfterViewChecked() {
    this.changeDetectorRef.detectChanges();
  }

  LoadVendors(): void {
    this.inventoryBLService.GetVendorList()
      .subscribe(res => this.VendorList = res.Results);
  }

  //to load the item in the start
  LoadItemList(): void {
    this.inventoryBLService.GetItemList()
      .subscribe(res => this.CallBackGetItemList(res));
  }
  //to load the terms in the start
  LoadTermsList(): void {
    this.inventoryBLService.GetTermsList()
      .subscribe(res => this.TermsList = res.Results);
  }

  CallBackGetItemList(res) {
    if (res.Status == 'OK') {
      this.ItemList = [];
      if (res && res.Results) {
        res.Results.forEach(a => {
          this.ItemList.push({
            "ItemId": a.ItemId, "ItemName": a.ItemName, StandardRate: a.StandardRate, VAT: a.VAT
          });
        });
      }
    }
    else {
      err => {
        this.messageBoxService.showMessage("failed", ['failed to get Item.. please check log for details.']);
        this.logError(err.ErrorMessage);
      }
    }
  }

  getVendorList() {
    this.inventoryBLService.GetVendorDetails()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.VendorList = res.Results;
        }
        else {
          err => {
            this.messageBoxService.showMessage("falied", ['failed to get vendor.. please check log for details.']);
            this.logError(err.ErrorMessage);
          }
        }
      });
  }

  //getting vendor details
  GetVendorDetails(VendorId) {
    if (VendorId != null && VendorId != 0) {

      this.SelectedVendor = this.VendorList.find(a => a.VendorId == VendorId);
      this.ShowVendorDetails = true;
    }
    else {
      err => {
        this.messageBoxService.showMessage("falied", ['failed to get vendor.. please check log for details.']);
        this.logError(err.ErrorMessage);
      }
    }
  }

  //add a new row 
  AddRowRequest() {
    //checking the validation
    for (var i = 0; i < this.currentPO.PurchaseOrderItems.length; i++) {
      // for loop is used to show PurchaseOrderItemValidator message ..if required  field is not filled
      for (var a in this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls) {
        this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].markAsDirty();
        this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].updateValueAndValidity();
      }
    }
    ////row can be added if only if the item is selected is last row
    //if (this.currentPOItem.ItemId != 0 && this.currentPOItem.ItemId != null) {
    this.rowCount++;
    this.currentPOItem = new PurchaseOrderItems();
    this.currentPOItem.Quantity = 1;
    this.currentPO.PurchaseOrderItems.push(this.currentPOItem);
    this.EditPOforValidators = false; //to recheck if the item has been repeated  in the edit
    //}
    //else {
    //    alert("Please select an item before adding a new row ");
    //}
  }

  //to delete the row
  DeleteRow(index) {
    //to stop rowCount value going negative
    if (this.rowCount > 0) {
      this.rowCount--;
    }

    //this will remove the data from the array
    this.currentPO.PurchaseOrderItems.splice(index, 1);
    // if the index is 0 then ..  currentPOItem is pushhed in POItems to show the textboxes
    if (index == 0) {
      this.currentPOItem = new PurchaseOrderItems();
      this.currentPO.PurchaseOrderItems.push(this.currentPOItem);
      this.currentPOItem.Quantity = 1;
      //this.Calculationforall(this.BillingTransactionItems[index]);
      this.CalculationForPO();
      this.changeDetectorRef.detectChanges();

    }
    else {
      this.CalculationForPO();
      this.changeDetectorRef.detectChanges();
    }
  }


  SelectItemFromSearchBox(Item: ItemMaster, index) {
    //if proper item is selected then the below code runs ..othewise it goes out side the function
    if (typeof Item === "object" && !Array.isArray(Item) && Item !== null && this.EditPOforValidators == false) {
      //for the first time edit must be true. to avoid the duplicate pushing of data in array we check for editPO here.
      //this for loop with if conditon is to check whether the  item is already present in the array or not 
      //means to avoid duplication of item
      for (var i = 0; i < this.currentPO.PurchaseOrderItems.length; i++) {
        if (this.currentPO.PurchaseOrderItems[i].ItemId == Item.ItemId) {
          this.checkIsItemPresent = true;
        }
      }
      //id item is present the it show alert otherwise it assign the value
      if (this.checkIsItemPresent == true) {
        this.messageBoxService.showMessage("notice-message", [Item.ItemName + " is already add..Please Check!!!"]);
        this.checkIsItemPresent = false;
        this.changeDetectorRef.detectChanges();
        this.currentPO.PurchaseOrderItems.splice(index, 1);
        this.currentPOItem = new PurchaseOrderItems();
        this.currentPOItem.Quantity = 1;
        this.currentPO.PurchaseOrderItems.push(this.currentPOItem);

      }
      else {
        for (var a = 0; a < this.currentPO.PurchaseOrderItems.length; a++) {
          // Assiging the value StandardRate,VatPercentage and ItemId in the particular index ..
          //it helps for changing item after adding the item and also in adding in new item
          if (a == index) {
            this.currentPO.PurchaseOrderItems[index].StandardRate = Item.StandardRate;
            this.currentPO.PurchaseOrderItems[index].VatPercentage = Item.VAT;
            this.currentPO.PurchaseOrderItems[index].ItemId = Item.ItemId;
            //calculation of POItem
            this.CalculationForPOItem();
          }
        }
      }
    }
  }
  //Load the Receipt To Edit
  LoadReceiptToEdit(id: number) {
    if (id != null) {
      this.inventoryBLService.GetPOItemsByPOId(id)
        .subscribe(res => this.ShowPurchaseOrderDetails(res));
    }
    else {
      this.messageBoxService.showMessage("notice-message", ['Please, Select PurchaseOrder for Details.']);
      this.purchaseorderList();
    }
  }
  ShowPurchaseOrderDetails(res) {

    if (res.Status == "OK") {
      //to add the po detials for editing
      this.currentPO = Object.assign(this.currentPO,res.Results.poDetails);
      //this.currentPO.VendorName = res.Results.poDetails.VendorName;
      //this.currentPO.VendorNo = res.Results.poDetails.VendorNo;
      //this.currentPO.VendorAddress = res.Results.poDetails.VendorAddress;
      //this.currentPO.PoDate = res.Results.poDetails.PoDate;
      //this.currentPO.POStatus = res.Results.poDetails.POStatus;
      //this.currentPO.SubTotal = res.Results.poDetails.SubTotal;
      //this.currentPO.VATAmount = res.Results.poDetails.VATAmount;
      //this.currentPO.TotalAmount = res.Results.poDetails.TotalAmount;
      //this.currentPO.PORemark = res.Results.poDetails.PORemark;
      this.currentPO.CreatedBy = res.Results.poDetails.CreatedbyId;
      this.currentPO.TermsConditions = res.Results.poDetails.Terms;
      this.SelectedVendor = this.VendorList.find(a => a.VendorName == res.Results.poDetails.VendorName);
      this.currentPO.VendorId = this.SelectedVendor.VendorId;
      
      //to add the items for editing
      var ItemList: Array<any> = res.Results.poItems;
     // this.changeDetectorRef.detectChanges();
      for (let i = 0; i < ItemList.length; i++) {
        var newItem = new PurchaseOrderItems();
        var ItemName = ItemList[i].ItemName;
        newItem.ItemId = this.ItemList.find(a => a.ItemName == ItemName).ItemId;
        newItem.PurchaseOrderId = ItemList[i].PurchaseOrderId;
        newItem.PurchaseOrderItemId = ItemList[i].PurchaseOrderItemId;
        newItem.Quantity = ItemList[i].Quantity;
        newItem.ReceivedQuantity = ItemList[i].ReceivedQuantity;
        newItem.POItemStatus = ItemList[i].POItemStatus;
        newItem.StandardRate = ItemList[i].StandardRate;
        newItem.TotalAmount = ItemList[i].ItemTotalAmount;
        newItem.Remark = ItemList[i].ItemRemark;
        newItem.DeliveryDays = ItemList[i].DeliveryDays;
        newItem.AuthorizedBy = ItemList[i].AuthorizedBy;
        newItem.SelectedItem = this.ItemList.find(a => a.ItemName == ItemName);
        this.currentPO.PurchaseOrderItems.push(newItem);
        this.currentPOItem = newItem;
      }
      
      this.inventoryService.POId = 0;
      this.changeDetectorRef.detectChanges();
    }
    else {
      this.messageBoxService.showMessage("notice-message", ["There is no PurchaseOrder details !"]);
      this.purchaseorderList();
    }
  }
  //route to purchase order list page
  purchaseorderList() {
    this.router.navigate(['/Inventory/ProcurementMain/PurchaseOrderList']);
  }
  //used to format display item in ng-autocomplete
  myListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }
  // to do Calculation of POItem
  CalculationForPOItem() {

    if (this.currentPOItem.StandardRate != null && this.currentPOItem.Quantity != null && this.currentPOItem.VatPercentage != null) {
      //this Vat is the coversion of vatpercentage
      let Vat = this.currentPOItem.VatPercentage / 100;
      let vatAmount = (this.currentPOItem.StandardRate * this.currentPOItem.Quantity) * Vat;
      //this.currentPOItem.TotalAmount = (this.currentPOItem.Amount * this.currentPOItem.Quantity) + vatAmount;
      this.CalculationForPO();
    }
  }

  //this calculation is for the whole PO
  CalculationForPO() {
    this.currentPO.SubTotal = 0;
    this.currentPO.VAT = 0;
    this.currentPO.TotalAmount = 0;

    for (var i = 0; i < this.currentPO.PurchaseOrderItems.length; i++) {
      this.currentPO.SubTotal = this.currentPO.SubTotal + (this.currentPO.PurchaseOrderItems[i].StandardRate * this.currentPO.PurchaseOrderItems[i].Quantity);
      let Vat = this.currentPO.PurchaseOrderItems[i].VatPercentage / 100;
      let vatAmount1 = (this.currentPO.PurchaseOrderItems[i].StandardRate * this.currentPO.PurchaseOrderItems[i].Quantity) * Vat;
      this.currentPO.VAT = (Math.round((this.currentPO.VAT + vatAmount1) * 100) / 100);
      this.currentPO.PurchaseOrderItems[i].TotalAmount = (this.currentPO.PurchaseOrderItems[i].StandardRate * this.currentPO.PurchaseOrderItems[i].Quantity + vatAmount1);
      this.currentPO.TotalAmount = (Math.round((this.currentPO.TotalAmount + this.currentPO.PurchaseOrderItems[i].TotalAmount) * 100) / 100);
    }
  }

  //posting to db
  AddPurchaseOrder() {
    // this CheckIsValid varibale is used to check whether all the validation are proper or not ..
    //if the CheckIsValid == true the validation is proper else no
    var CheckIsValid = true;

    if (this.currentPO.IsValidCheck(undefined, undefined) == false) {
      // for loop is used to show PurchaseOrderValidator message ..if required  field is not filled
      for (var b in this.currentPO.PurchaseOrderValidator.controls) {
        this.currentPO.PurchaseOrderValidator.controls[b].markAsDirty();
        this.currentPO.PurchaseOrderValidator.controls[b].updateValueAndValidity();
        CheckIsValid = false;
      }
    }


    for (var i = 0; i < this.currentPO.PurchaseOrderItems.length; i++) {
      if (this.currentPO.PurchaseOrderItems[i].IsValidCheck(undefined, undefined) == false) {
        // for loop is used to show PurchaseOrderItemValidator message ..if required  field is not filled
        for (var a in this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls) {
          this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].markAsDirty();
          this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].updateValueAndValidity();
        }
        CheckIsValid = false;
      }
    }


    if (this.currentPO.PurchaseOrderItems.length == 0) {
      this.messageBoxService.showMessage("notice-message", ["Please Add Item ...Before Requesting"]);
    }

    if (CheckIsValid == true && this.currentPO.PurchaseOrderItems != null) {
      //Updating the Status
      this.currentPO.POStatus = "active";
      this.currentPO.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

      for (var i = 0; i < this.currentPO.PurchaseOrderItems.length; i++) {

        this.currentPO.PurchaseOrderItems[i].POItemStatus = "active";
        this.currentPO.PurchaseOrderItems[i].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.currentPO.PurchaseOrderItems[i].AuthorizedBy = this.securityService.GetLoggedInUser().EmployeeId;
      }


      this.inventoryBLService.PostToPurchaseOrder(this.currentPO).
        subscribe(res => {
          if (res.Status == 'OK') {
            this.messageBoxService.showMessage("success", ["Purchase Order is Generated and Saved"]);
            //this.router.navigate(['/Inventory/ExternalMain/PurchaseOrderList']);
            this.changeDetectorRef.detectChanges();
            //deleting all creating new PO..after successully adding to db
            this.currentPO.PurchaseOrderItems = new Array<PurchaseOrderItems>();
            this.currentPO = new PurchaseOrder();
            this.SelectedVendor = new VendorMaster();
            this.ShowVendorDetails = false;
            this.currentPOItem = new PurchaseOrderItems();
            this.currentPOItem.Quantity = 1;
            this.currentPO.PurchaseOrderItems.push(this.currentPOItem);


            this.inventoryService.Id = res.Results;
            this.router.navigate(['/Inventory/ProcurementMain/PurchaseOrderDetails']);

          }
          else {

            this.messageBoxService.showMessage("failed", ['failed to add Purchase Order.. please check log for details.']);
            this.logError(res.ErrorMessage);

          }
        });

    }

    //pass the purchaseorderID to purchaseorderDetails page       

    //this.router.navigate(['Inventory/ExternalMain/PurchaseOrderList']);
  }
  UpdatePurchaseOrder() {
    // this CheckIsValid varibale is used to check whether all the validation are proper or not ..
    //if the CheckIsValid == true the validation is proper else no
    var CheckIsValid = true;

    if (this.currentPO.IsValidCheck(undefined, undefined) == false) {
      // for loop is used to show PurchaseOrderValidator message ..if required  field is not filled
      for (var b in this.currentPO.PurchaseOrderValidator.controls) {
        this.currentPO.PurchaseOrderValidator.controls[b].markAsDirty();
        this.currentPO.PurchaseOrderValidator.controls[b].updateValueAndValidity();
        CheckIsValid = false;
      }
    }


    for (var i = 0; i < this.currentPO.PurchaseOrderItems.length; i++) {
      if (this.currentPO.PurchaseOrderItems[i].IsValidCheck(undefined, undefined) == false) {
        // for loop is used to show PurchaseOrderItemValidator message ..if required  field is not filled
        for (var a in this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls) {
          this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].markAsDirty();
          this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].updateValueAndValidity();
        }
        CheckIsValid = false;
      }
    }


    if (this.currentPO.PurchaseOrderItems.length == 0) {
      this.messageBoxService.showMessage("notice-message", ["Please Add Item ...Before Requesting"]);
    }

    if (CheckIsValid == true && this.currentPO.PurchaseOrderItems != null) {
      this.currentPO.ModifiedOn = new Date();
      this.currentPO.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.currentPO.PurchaseOrderItems.map(a => {
        a.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
        a.ModifiedOn = new Date();
        a.CreatedOn = new Date();
        a.PurchaseOrderId = this.currentPO.PurchaseOrderId;
      })

      this.inventoryBLService.UpdatePurchaseOrder(this.currentPO).
        subscribe(res => {
          if (res.Status == 'OK') {
            this.messageBoxService.showMessage("success", ["Purchase Order is Updated."]);
            //this.router.navigate(['/Inventory/ExternalMain/PurchaseOrderList']);
            this.changeDetectorRef.detectChanges();
            //deleting all creating new PO..after successully adding to db
            this.currentPO.PurchaseOrderItems = new Array<PurchaseOrderItems>();
            this.currentPO = new PurchaseOrder();
            this.SelectedVendor = new VendorMaster();
            this.ShowVendorDetails = false;
            this.currentPOItem = new PurchaseOrderItems();
            this.currentPOItem.Quantity = 1;
            this.currentPO.PurchaseOrderItems.push(this.currentPOItem);


            this.inventoryService.Id = res.Results;
            this.router.navigate(['/Inventory/ProcurementMain/PurchaseOrderDetails']);

          }
          else {

            this.messageBoxService.showMessage("failed", ['failed to add Purchase Order.. please check log for details.']);
            this.logError(res.ErrorMessage);

          }
        });
    }
  }
  //this is to cancel the whole PO at one go and adding new PO
  Cancel() {
    this.currentPO.PurchaseOrderItems = new Array<PurchaseOrderItems>();
    this.currentPO = new PurchaseOrder();
    this.SelectedVendor = new VendorMaster();
    this.SelectedVendor = new VendorMaster();
    this.ShowVendorDetails = false;
    this.currentPOItem = new PurchaseOrderItems()
    this.currentPOItem.Quantity = 1;
    this.currentPO.PurchaseOrderItems.push(this.currentPOItem);
    this.router.navigate(['Inventory/ProcurementMain/PurchaseOrderList']);
  }

  logError(err: any) {
    console.log(err);
  }
  //loads items from requisition for PO
  LoadRequisitionOrder() {
    this.inventoryBLService.GetRequisitionforPO().subscribe(res => {
      if (res.Status == 'OK') {
        //filter
        var tempList = res.Results.filter(x => x.Quantity > 0);
        if (tempList.length > 0) {
          for (var ind = 0; ind < tempList.length; ind++) {
            if (this.currentPO.PurchaseOrderItems[this.rowCount].SelectedItem == null) {
              this.currentPO.PurchaseOrderItems.splice(this.rowCount, 1);
            }
            else {
              this.rowCount++;
            }
            this.currentPOItem = new PurchaseOrderItems();
            this.currentPOItem.Quantity = tempList[ind].Quantity;
            this.currentPO.PurchaseOrderItems.push(this.currentPOItem);
            this.currentPO.PurchaseOrderItems[this.rowCount].SelectedItem = tempList[ind];
          }
        }
        else {
          this.messageBoxService.showMessage("notice", ['no requisition item to load for purchase order.']);
        }
      }
    });
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
    this.currentPOItem = new PurchaseOrderItems();
    this.currentPOItem.Quantity = 1;
    this.currentPO.PurchaseOrderItems.splice(this.index, 1, this.currentPOItem);
    this.currentPO.PurchaseOrderItems[this.index].SelectedItem = item;
  }
  //for supplier add popup
  AddSupplierPopUp() {
    this.showAddVendorPopUp = false;
    this.changeDetectorRef.detectChanges();
    this.showAddVendorPopUp = true;
  }
  OnNewSupplierAdded($event) {
    this.showAddVendorPopUp = false;
    var supplier = $event.vendor;
    this.VendorList.push(supplier);
    this.VendorList.slice();
  }
  //for adding terms pop up
  AddTermsPopUp() {
    this.showAddTermsPopUp = false;
    this.changeDetectorRef.detectChanges();
    this.showAddTermsPopUp = true;
  }
  OnNewTermsAdded($event) {
    this.showAddTermsPopUp = false;
    var terms = $event.terms;
    this.TermsList.push(terms);
    this.TermsList.slice();
  }
}
