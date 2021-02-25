import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { SecurityService } from '../../security/shared/security.service';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";

import { PurchaseOrderItems } from "../shared/purchase-order-items.model";
import { PurchaseOrder, POVerifier } from "../shared/purchase-order.model";
import { ItemMaster } from "../shared/item-master.model";
import { VendorMaster } from "../shared/vendor-master.model";
import { InventoryService } from '../shared/inventory.service';
import { TermsConditionsMasterModel } from '../shared/terms-conditions-master.model';
import { CommonFunctions } from '../../shared/common.functions';
import { CoreService } from '../../core/shared/core.service';
import { PurchaseRequestItemModel } from '../shared/purchase-request-item.model';
import { ENUM_TermsApplication } from '../../shared/shared-enums';
import * as moment from 'moment';

@Component({
  templateUrl: "../../view/inventory-view/PurchaseOrderItems.html"  // "/InventoryView/PurchaseOrderItems"
})
export class PurchaseOrderItemsComponent {
  //binding logic
  public currentPOItem: PurchaseOrderItems = new PurchaseOrderItems();
  public currentPO: PurchaseOrder = new PurchaseOrder();
  //for showing the vendor details
  //public SelectedVendor: VendorMaster = new VendorMaster();
  public selectedVndr: any;
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
  public RecreatePO: boolean = false;
  public EditPOforValidators: boolean = false;
  public loading: boolean = false;
  public VerifierList: POVerifier[] = [];
  //this controls whether to show verification part or not. controlled by core cfg settings.
  public IsVerificationActivated: boolean = true;

  constructor(
    public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService, public coreService: CoreService,
    public changeDetectorRef: ChangeDetectorRef,
    public messageBoxService: MessageboxService,
    public securityService: SecurityService,
    public router: Router) {
    //display vendor on certain condition only
    this.ShowVendorDetails = false;
    this.LoadTermsList();
    this.LoadVerifiersForPO();
    //vendor and items are loaded at last, because in case of edit, we might need inactive vendors as well.
    this.GetVendorList();
    this.LoadItemList();

  }
  public LoadVerifiersForPO() {
    this.inventoryBLService.GetAllPOVerifiers().finally(() => { this.CheckForEditRecreateMode(); })
      .subscribe(res => {
        if (res.Status == "OK") {
          this.VerifierList = res.Results;
        }
        else {
          console.log("Verifiers Not Found.");
        }
      }, err => {
        this.messageBoxService.showMessage("Failed", ["err.error.ErrorMessage"]);
      })
  }
  public CheckForEditRecreateMode() {
    if (this.inventoryService.POId > 0) {
      this.EditPOforValidators = true;
      this.EditPO = true;
      this.LoadReceiptToEdit(this.inventoryService.POId);
    }
    else if (this.inventoryService.POIdforCopy > 0) {
      this.EditPOforValidators = true;
      this.RecreatePO = true;
      this.LoadReceiptToEdit(this.inventoryService.POIdforCopy);
    }
    else if (this.inventoryService.PurchaseRequestId > 0) {
      this.inventoryBLService.GetPurchaseRequestById(this.inventoryService.PurchaseRequestId)
        .subscribe(res => {
          if (res.Status == "OK") {
            var VendorId = res.Results.PurchaseRequest.VendorId;
            var RequisitionItemArray: Array<PurchaseRequestItemModel> = res.Results.RequestedItemList;
            this.currentPO.RequisitionId = this.inventoryService.PurchaseRequestId;
            for (var i = 0; i < RequisitionItemArray.length; i++) {
              if (RequisitionItemArray[i].IsActive == true) {
                var PoItem: PurchaseOrderItems = new PurchaseOrderItems();
                PoItem.Quantity = RequisitionItemArray[i].RequestedQuantity;
                PoItem.SelectedItem = this.ItemList.find(item => item.ItemId == RequisitionItemArray[i].ItemId);
                PoItem.PurchaseOrderItemValidator.controls['ItemId'].setValue(RequisitionItemArray[i].ItemId);
                this.currentPO.PurchaseOrderItems.push(PoItem);
                this.currentPOItem = PoItem;
                this.CalculationForPOItem();
              }
            }
            let vndr = this.VendorList.find(a => a.VendorId == VendorId);
            if (vndr != undefined && VendorId != null) { this.SetVendorToSearchInput(vndr); }
            else if (vndr == undefined && VendorId != null) {
              this.messageBoxService.showMessage("Notice-Message", ["This vendor is inactive.", "Please select another vendor."]);
            }
          }
        });
    }
    else {
      //pushing currentPOItem for the first Row in UI
      this.currentPO.PurchaseOrderItems.push(this.currentPOItem);
      this.currentPOItem.Quantity = 1;
      this.rowCount++;
      this.SetDefaultVerifier();
    }
  }

  public SetDefaultVerifier() {
    var ProcurementVerificationSetting = this.coreService.Parameters.find(param => param.ParameterGroupName == "Inventory" && param.ParameterName == "ProcurementVerificationSettings").ParameterValue;
    var ProcurementVerificationSettingParsed = JSON.parse(ProcurementVerificationSetting);
    if (ProcurementVerificationSettingParsed != null) {
      if (ProcurementVerificationSettingParsed.EnableVerification == true) {
        this.currentPO.IsVerificationEnabled = true;
        this.SetVerifiersFromVerifierIdsObj(ProcurementVerificationSettingParsed.VerifierIds);
      }
      else {
        this.IsVerificationActivated = false;
      }
    }
  }

  private SetVendorToSearchInput(vendorObj: VendorMaster) {
    if (vendorObj) {
      this.currentPO.VendorId = vendorObj.VendorId;
      this.currentPO.PurchaseOrderValidator.controls['VendorId'].setValue(vendorObj.VendorId);
      this.selectedVndr = vendorObj;
      this.ShowVendorDetails = true;
    }
    else {
      this.currentPO.VendorId = null;
      this.currentPO.PurchaseOrderValidator.controls['VendorId'].reset(null);
    }
    console.log(this.selectedVndr);
  }

  ngAfterViewChecked() {
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.inventoryService.RequisitionId = 0;
  }
  LoadVendors(): void {
    this.inventoryBLService.GetVendorList()
      .subscribe(res => this.VendorList = res.Results);
  }

  //to load the item in the start
  LoadItemList(): void {

    this.CallBackGetItemList(this.inventoryService.allItemList);
  }
  //to load the terms in the start
  LoadTermsList(): void {
    this.inventoryBLService.GetTermsList(ENUM_TermsApplication.Inventory)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.TermsList = res.Results.filter(a => a.IsActive == true);
        }
        else {
          console.log(res.ErrorMessage)
        }
      }, err => {
        console.log(err.error.ErrorMessage);
      });
  }

  CallBackGetItemList(itemList) {

    if (itemList == undefined || itemList.length == 0) {

      this.messageBoxService.showMessage("failed", [
        "failed to get Item.. please check log for details."
      ]);
    } else {
      this.ItemList = this.inventoryService.allItemList;
      if (this.EditPO == false) {
        this.ItemList = this.ItemList.filter(item => item.IsActive == true);
      }
    }
  }

  GetVendorList() {
    try {
      this.VendorList = this.inventoryService.allVendorList;

      if (this.VendorList.length <= 0) {
        this.messageBoxService.showMessage("Failed", ["Failed to load the vendor list."]);
      }
      else {
        if (this.EditPO == false)
          this.VendorList = this.VendorList.filter(vendor => vendor.IsActive == true);
      }
    } catch (ex) {
      this.messageBoxService.showMessage("Failed", ["Something went wrong while loading vendor list."]);
    }
  }
  //getting vendor details  selectedVndr.VendorId
  GetVendorDetails() {
    if (this.selectedVndr && typeof (this.selectedVndr) == 'object') {
      var selVndr = this.VendorList.find(a => a.VendorId == this.selectedVndr.VendorId);
      if (selVndr && selVndr.VendorId) {
        this.currentPO.VendorId = this.selectedVndr.VendorId;
        this.currentPO.PurchaseOrderValidator.controls['VendorId'].setValue(this.selectedVndr.VendorId);
      }
      this.ShowVendorDetails = true;
    }
    else {
      this.currentPO.VendorId = null;
      this.currentPO.PurchaseOrderValidator.controls['VendorId'].reset(null);
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
    let len = this.currentPO.PurchaseOrderItems.length - 1;
    window.setTimeout(function () {
      let itmNameBox = document.getElementById("poItemName" + len);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);

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
    if (index == 0 && this.rowCount == 0) {
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
            this.currentPO.PurchaseOrderItems[index].Code = Item.Code;
            this.currentPO.PurchaseOrderItems[index].UOMName = Item.UOMName;
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
      this.currentPO = Object.assign(this.currentPO, res.Results.poDetails);
      if (this.RecreatePO == true) { this.currentPO.PurchaseOrderId = 0 }; //sanjit 15Apr'20, in case of copying requisition, we need it as 0.
      this.currentPO.CreatedBy = res.Results.poDetails.CreatedbyId;
      this.currentPO.VAT = res.Results.poDetails.VATAmount;
      this.currentPO.TermsConditions = res.Results.poDetails.Terms;
      this.SetVerifiersFromVerifierIdsObj(this.currentPO.VerifierIds);
      let vndr = this.VendorList.find(a => a.VendorName == res.Results.poDetails.VendorName);
      if (vndr != undefined) { this.SetVendorToSearchInput(vndr); }
      else {
        this.messageBoxService.showMessage("Notice-Message", ["This vendor is inactive.", "Please select another vendor."])
      }
      //to add the items for editing
      var ItemList: Array<any> = res.Results.poItems;
      //var vatPercent = CommonFunctions.parseAmount(this.currentPO.VAT * 100) / this.currentPO.SubTotal;

      // this.changeDetectorRef.detectChanges();
      for (let i = 0; i < ItemList.length; i++) {
        var newItem = new PurchaseOrderItems();
        var ItemName = ItemList[i].ItemName;
        var VATAmount = ItemList[i].VATAmount;
        var Quantity = ItemList[i].Quantity;
        var StandardRate = ItemList[i].StandardRate;
        var SubTotal = Quantity * StandardRate;
        var vatPercent = (Math.round(VATAmount * 100) / SubTotal);
        newItem.ItemId = this.ItemList.find(a => a.ItemName == ItemName).ItemId;
        newItem.PurchaseOrderId = (this.RecreatePO == false) ? ItemList[i].PurchaseOrderId : 0;
        newItem.PurchaseOrderItemId = (this.RecreatePO == false) ? ItemList[i].PurchaseOrderItemId : 0;
        newItem.Quantity = ItemList[i].Quantity;
        newItem.ReceivedQuantity = ItemList[i].ReceivedQuantity;
        newItem.POItemStatus = ItemList[i].POItemStatus;
        newItem.StandardRate = ItemList[i].StandardRate;
        newItem.TotalAmount = ItemList[i].ItemTotalAmount;
        newItem.Remark = ItemList[i].ItemRemark;
        newItem.DeliveryDays = ItemList[i].DeliveryDays;
        newItem.AuthorizedBy = ItemList[i].AuthorizedBy;
        newItem.SelectedItem = this.ItemList.find(a => a.ItemName == ItemName);
        newItem.VatPercentage = vatPercent;
        newItem.Code = ItemList[i].Code;
        newItem.UOMName = ItemList[i].UOMName;
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
  private SetVerifiersFromVerifierIdsObj(VerifierIds: any) {
    if (this.currentPO.IsVerificationEnabled == true && this.VerifierList != null) {
      this.currentPO.VerifierList = [];
      var VerifierIdsParsed: any[] = (typeof (VerifierIds) == "string") ? JSON.parse(VerifierIds) : VerifierIds;
      if (VerifierIdsParsed == null || VerifierIdsParsed.length == 0) {
        this.AddVerifier();
      }
      else {
        //if more than three verifiers are selected, it will take only first three.
        VerifierIdsParsed = VerifierIdsParsed.slice(0, 2);
        VerifierIdsParsed.forEach(a => this.currentPO.VerifierList.push(this.VerifierList.find(v => v.Id == a.Id && v.Type == a.Type)));
      }
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

  myVendorListFormatter(data: any): string {
    let html = data["VendorName"];
    return html;
  }
  VerifierListFormatter(data: any): string {
    return `${data["Name"]} (${data["Type"]})`;
  }

  // to do Calculation of POItem
  CalculationForPOItem() {

    if (this.currentPOItem.StandardRate != null && this.currentPOItem.Quantity != null && this.currentPOItem.VatPercentage != null) {
      //this Vat is the coversion of vatpercentage
      let Vat = this.currentPOItem.VatPercentage / 100;
      let vatAmount = (this.currentPOItem.StandardRate * this.currentPOItem.Quantity) * Vat;
      ///this.currentPOItem.TotalAmount =(this.currentPOItem.StandardRate * this.currentPOItem.Quantity) + vatAmount;
      this.currentPOItem.VATAmount = CommonFunctions.parseAmount(vatAmount);
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
      this.currentPO.SubTotal = CommonFunctions.parseAmount(this.currentPO.SubTotal + (this.currentPO.PurchaseOrderItems[i].StandardRate * this.currentPO.PurchaseOrderItems[i].Quantity));
      let Vat = this.currentPO.PurchaseOrderItems[i].VatPercentage / 100;
      //let vatAmount1 = this.currentPOItem.VATAmt;
      this.currentPO.PurchaseOrderItems[i].VATAmount = (Math.round(this.currentPO.PurchaseOrderItems[i].StandardRate * this.currentPO.PurchaseOrderItems[i].Quantity) * Vat);
      //this.currentPO.VAT = (Math.round((this.currentPO.VAT + vatAmount1) * 100) / 100);
      this.currentPO.VAT += CommonFunctions.parseAmount(this.currentPO.PurchaseOrderItems[i].VATAmount);
      this.currentPO.PurchaseOrderItems[i].TotalAmount = CommonFunctions.parseAmount((this.currentPO.PurchaseOrderItems[i].StandardRate * this.currentPO.PurchaseOrderItems[i].Quantity + this.currentPO.PurchaseOrderItems[i].VATAmount));
      this.currentPO.TotalAmount = (Math.round((this.currentPO.TotalAmount + this.currentPO.PurchaseOrderItems[i].TotalAmount) * 100) / 100);
    }
  }

  //posting to db
  AddPurchaseOrder() {
    // this CheckIsValid varibale is used to check whether all the validation are proper or not ..
    //if the CheckIsValid == true the validation is proper else no
    var CheckIsValid = true;
    var errorMessages: string[] = [];
    if (this.currentPO.IsValidCheck(undefined, undefined) == false) {
      // for loop is used to show PurchaseOrderValidator message ..if required  field is not filled
      for (var b in this.currentPO.PurchaseOrderValidator.controls) {
        this.currentPO.PurchaseOrderValidator.controls[b].markAsDirty();
        this.currentPO.PurchaseOrderValidator.controls[b].updateValueAndValidity();
        if (this.currentPO.PurchaseOrderValidator.controls[b].status == "INVALID") {
          errorMessages.push(`${b} is invalid.`);
        }
        CheckIsValid = false;
      }
    }


    for (var i = 0; i < this.currentPO.PurchaseOrderItems.length; i++) {
      if (this.currentPO.PurchaseOrderItems[i].IsValidCheck(undefined, undefined) == false) {
        // for loop is used to show PurchaseOrderItemValidator message ..if required  field is not filled
        for (var a in this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls) {
          this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].markAsDirty();
          this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].updateValueAndValidity();
          if (this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].status == "INVALID") {
            errorMessages.push(`${a} is invalid in item ${i+1}.`);
          }
        }
        CheckIsValid = false;
      }
    }

    CheckIsValid = CheckIsValid && this.CheckIfVerifierSelected(errorMessages);

    if (this.currentPO.PurchaseOrderItems.length == 0) {
      errorMessages.push("Please Add Item ...Before Requesting");
    }

    if (CheckIsValid == true && this.currentPO.PurchaseOrderItems != null) {
      this.loading = true;
      //Updating the Status
      this.currentPO.POStatus = this.currentPO.IsVerificationEnabled ? "pending" : "active";
      this.currentPO.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.currentPO.PoDate = moment(this.currentPO.PoDate).format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss');

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
            //if PO was created from requisition, the requisition must be updated
            if (this.inventoryService.PurchaseRequestId > 0) {
              this.UpdatePORequisition();
            }
            //deleting all creating new PO..after successully adding to db
            this.currentPO.PurchaseOrderItems = new Array<PurchaseOrderItems>();
            this.currentPO = new PurchaseOrder();
            this.selectedVndr = '';
            this.ShowVendorDetails = false;
            this.currentPOItem = new PurchaseOrderItems();
            this.currentPOItem.Quantity = 1;
            this.currentPO.PurchaseOrderItems.push(this.currentPOItem);


            this.inventoryService.POId = res.Results;//sud:3Mar'20-Property Rename in InventoryService
            this.router.navigate(['/Inventory/ProcurementMain/PurchaseOrderDetails']);
            this.loading = false;

          }
          else {

            this.messageBoxService.showMessage("failed", ['failed to add Purchase Order.. please check log for details.']);
            this.logError(res.ErrorMessage);
            this.loading = false;

          }
        });

    }
    else {
      this.messageBoxService.showMessage('Notice-messages', errorMessages);
    }

    //pass the purchaseorderID to purchaseorderDetails page

    //this.router.navigate(['Inventory/ExternalMain/PurchaseOrderList']);
  }
  private CheckIfVerifierSelected(errorMessages: string[]): boolean {
    if (this.currentPO.IsVerificationEnabled == true && this.currentPO.VerifierList.some(v => v.Id == undefined)) {
      errorMessages.push("Please select proper verifier.");
      return false;
    }
    return true;
  }

  UpdatePurchaseOrder() {
    // this CheckIsValid varibale is used to check whether all the validation are proper or not ..
    //if the CheckIsValid == true the validation is proper else no
    var CheckIsValid = true;
    var errorMessages = [];
    if (this.currentPO.IsValidCheck(undefined, undefined) == false) {
      this.loading = true;
      // for loop is used to show PurchaseOrderValidator message ..if required  field is not filled
      for (var b in this.currentPO.PurchaseOrderValidator.controls) {
        this.currentPO.PurchaseOrderValidator.controls[b].markAsDirty();
        this.currentPO.PurchaseOrderValidator.controls[b].updateValueAndValidity();
        if (this.currentPO.PurchaseOrderValidator.controls[b].status == "INVALID") {
          errorMessages.push(`${b} is invalid.`);
        }
        CheckIsValid = false;
      }
    }


    for (var i = 0; i < this.currentPO.PurchaseOrderItems.length; i++) {
      if (this.currentPO.PurchaseOrderItems[i].IsValidCheck(undefined, undefined) == false) {
        // for loop is used to show PurchaseOrderItemValidator message ..if required  field is not filled
        for (var a in this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls) {
          this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].markAsDirty();
          this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].updateValueAndValidity();
          if (this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].status == "INVALID") {
            errorMessages.push(`${a} is invalid in item ${i+1}.`);
          }
        }
        CheckIsValid = false;
      }
    }

    CheckIsValid = CheckIsValid && this.CheckIfVerifierSelected(errorMessages);

    if (this.currentPO.PurchaseOrderItems.length == 0) {
      errorMessages.push("Please Add Item ...Before Requesting");
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
            this.selectedVndr = '';
            this.ShowVendorDetails = false;
            this.currentPOItem = new PurchaseOrderItems();
            this.currentPOItem.Quantity = 1;
            this.currentPO.PurchaseOrderItems.push(this.currentPOItem);


            this.inventoryService.POId = res.Results;//sud:3Mar'20-Property Rename in InventoryService
            this.router.navigate(['/Inventory/ProcurementMain/PurchaseOrderDetails']);
            this.loading = false;

          }
          else {

            this.messageBoxService.showMessage("failed", ['failed to add Purchase Order.. please check log for details.']);
            this.logError(res.ErrorMessage);
            this.loading = false;

          }
        });
    }
    else {
      this.messageBoxService.showMessage("Notice-Message", errorMessages);
    }
  }
  //update PO requisition
  UpdatePORequisition() {
    this.inventoryBLService.UpdatePORequisitionAfterPOCreation(this.inventoryService.PurchaseRequestId)
      .subscribe(res => {
        if (res.Status == "Failed") {
          this.messageBoxService.showMessage("Failed", ["PO Requisition update failed."]);
        }
      })
  }
  //this is to cancel the whole PO at one go and adding new PO
  Cancel() {
    this.currentPO.PurchaseOrderItems = new Array<PurchaseOrderItems>();
    this.currentPO = new PurchaseOrder();
    this.selectedVndr = '';
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
    //this.inventoryBLService.GetRequisitionforPO().subscribe(res => {
    //  if (res.Status == 'OK') {
    //    //filter
    //    var tempList = res.Results.filter(x => x.Quantity > 0);
    //    if (tempList.length > 0) {
    //      for (var ind = 0; ind < tempList.length; ind++) {
    //        if (this.currentPO.PurchaseOrderItems[this.rowCount].SelectedItem == null) {
    //          this.currentPO.PurchaseOrderItems.splice(this.rowCount, 1);
    //        }
    //        else {
    //          this.rowCount++;
    //        }
    //        this.currentPOItem = new PurchaseOrderItems();
    //        this.currentPOItem.Quantity = tempList[ind].Quantity;
    //        this.currentPO.PurchaseOrderItems.push(this.currentPOItem);
    //        this.currentPO.PurchaseOrderItems[this.rowCount].SelectedItem = tempList[ind];
    //      }
    //    }
    //    else {
    //      this.messageBoxService.showMessage("notice", ['no requisition item to load for purchase order.']);
    //    }
    //  }
    //});
    this.currentPO.PurchaseOrderItems = new Array<PurchaseOrderItems>();
    for (var i = 0; i < this.selectedVndr.DefaultItem.length; i++) {
      var newItem = this.ItemList.find(a => a.ItemId == this.selectedVndr.DefaultItem[i]);
      //if (this.currentPO.PurchaseOrderItems[this.currentPO.PurchaseOrderItems.length - 1].SelectedItem == null) {
      //  this.currentPO.PurchaseOrderItems.pop();
      //}
      this.currentPO.PurchaseOrderItems.push(new PurchaseOrderItems());
      this.rowCount++;
      this.currentPO.PurchaseOrderItems[this.currentPO.PurchaseOrderItems.length - 1].SelectedItem = newItem;
      this.currentPO.PurchaseOrderItems[this.currentPO.PurchaseOrderItems.length - 1].Quantity = newItem.ReOrderQuantity;
    }
    this.CalculationForPOItem();
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

  GoToNextInput(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
      nextEl.select();
    }
  }
  ShowVerifiers() {
    if (this.currentPO.IsVerificationEnabled == true) {
      this.AddVerifier();
    }
    else {
      this.currentPO.VerifierList = [];
    }
  }
  AddVerifier() {
    this.currentPO.VerifierList.push(new POVerifier())
  }
  DeleteVerifier(index: number) {
    this.currentPO.VerifierList.splice(index, 1);
  }
  AssignVerifier($event, index) {
    if (typeof $event == "object") {
      this.currentPO.VerifierList[index] = $event;
    }
  }
  CheckIfAddVerifierAllowed() {
    return this.currentPO.VerifierList.some(V => V.Id == undefined) || this.currentPO.VerifierList.length >= 3;
  }
  CheckIfDeleteVerifierAllowed() {
    return this.currentPO.VerifierList.length <= 1;
  }

  public CallBackInvoiceHeader(data) {
    if (data) {
      this.currentPO.InvoiceHeaderId = data;
    }
  }

}
