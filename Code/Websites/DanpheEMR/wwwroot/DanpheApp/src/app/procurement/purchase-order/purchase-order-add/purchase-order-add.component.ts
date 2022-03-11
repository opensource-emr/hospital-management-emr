import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { InventorySettingBLService } from '../../../inventory/settings/shared/inventory-settings.bl.service';
import { CoreService } from '../../../core/shared/core.service';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { ItemMaster } from '../../../inventory/shared/item-master.model';
import { PurchaseRequestItemModel } from '../../../inventory/shared/purchase-request-item.model';
import { TermsConditionsMasterModel } from '../../../inventory/shared/terms-conditions-master.model';
import { VendorMaster } from '../../../inventory/shared/vendor-master.model';
import { SecurityService } from '../../../security/shared/security.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_TermsApplication } from '../../../shared/shared-enums';
import { ProcurementBLService } from '../../shared/procurement.bl.service';
import { PurchaseOrderItems } from '../purchase-order-items.model';
import { POVerifier, PurchaseOrder } from '../purchase-order.model';
import { CurrencyModel } from '../../../inventory/settings/shared/currency.model';
import { ENUM_GRItemCategory } from '../../../shared/shared-enums';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';

@Component({
  selector: 'app-purchase-order-add',
  templateUrl: './purchase-order-add.component.html',
  styles: []
})
export class PurchaseOrderAddComponent implements AfterViewInit {
  public currentPO: PurchaseOrder = new PurchaseOrder();
  //for showing the vendor details
  public selectedVndr: any;
  public VendorList: Array<VendorMaster> = new Array<VendorMaster>();
  public TermsList: Array<TermsConditionsMasterModel> = new Array<TermsConditionsMasterModel>();
  //this Item is used for search button(means auto complete button)...
  public ItemList: any[] = [];
  public currencyCodeList: Array<CurrencyModel> = new Array<CurrencyModel>();
  public selectedCurrencyCode: CurrencyModel;
  public checkIsItemPresent: boolean = false;
  public index: number = 0;
  public showAddItemPopUp: boolean = false;
  public showAddVendorPopUp: boolean = false;
  public showAddTermsPopUp: boolean = false;
  public EditPO: boolean = false;
  public RecreatePO: boolean = false;
  public isPOFromQuotation: boolean = false;
  public loading: boolean = false;
  public VerifierList: POVerifier[] = [];
  //this controls whether to show verification part or not. controlled by core cfg settings.
  public IsVerificationActivated: boolean = true;

  public POCategories: string[] = [];
  public poFormParameterValue: any;


  constructor(public procurementBLService: ProcurementBLService, public inventoryService: InventoryService, public coreService: CoreService, public changeDetectorRef: ChangeDetectorRef, public messageBoxService: MessageboxService, public securityService: SecurityService, public invSettingBL: InventorySettingBLService, public router: Router, public route: ActivatedRoute, private _activateInventoryService: ActivateInventoryService) {
    this.LoadTermsList();
    this.LoadVerifiersForPO();
    //vendor and items are loaded at last, because in case of edit, we might need inactive vendors as well.
    this.GetVendorList();
    this.LoadItemList();
    this.GetCurrencyCode();
    this.LoadPOCategory();
    this.GetPOFormCustomizationParameter();
  }

  ngAfterViewInit() {
    this.currentPO.DeliveryDate = moment().add(7, 'days').format('YYYY-MM-DD');
  }
  GetPOFormCustomizationParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'POFormCustomization').ParameterValue;
    if (paramValue)
      this.poFormParameterValue = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage("error", ["Failed to get POFormCustomization value."]);
  }
  public LoadVerifiersForPO() {
    this.procurementBLService.GetAllPOVerifiers().finally(() => { this.CheckForEditRecreateMode(); })
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
      this.EditPO = true;
      this.LoadReceiptToEdit(this.inventoryService.POId);
    }
    else if (this.inventoryService.POIdforCopy > 0) {
      this.RecreatePO = true;
      this.LoadReceiptToEdit(this.inventoryService.POIdforCopy);
    }
    else if (this.inventoryService.ReqForQuotationId > 0) {
      this.isPOFromQuotation = true;
      this.loadQuotationForPO(this.inventoryService.ReqForQuotationId);
      this.inventoryService.ReqForQuotationId = 0
    }
    else if (this.inventoryService.PurchaseRequestId > 0) {
      this.procurementBLService.GetPurchaseRequestById(this.inventoryService.PurchaseRequestId)
        .subscribe(res => {
          if (res.Status == "OK") {
            var VendorId = res.Results.PurchaseRequest.VendorId;
            var RequisitionItemArray: Array<PurchaseRequestItemModel> = res.Results.RequestedItemList;
            this.currentPO.RequisitionId = this.inventoryService.PurchaseRequestId;
            this.currentPO.POCategory = res.Results.PurchaseRequest.POCategory;
            for (var i = 0; i < RequisitionItemArray.length; i++) {
              if (RequisitionItemArray[i].IsActive == true) {
                var PoItem: PurchaseOrderItems = new PurchaseOrderItems();
                PoItem.ItemCategory = RequisitionItemArray[i].ItemCategory;
                PoItem.Code = RequisitionItemArray[i].Code;
                PoItem.UOMName = RequisitionItemArray[i].UOMName;
                PoItem.Quantity = RequisitionItemArray[i].RequestedQuantity;
                PoItem.ItemId = RequisitionItemArray[i].ItemId;
                PoItem.SelectedItem = this.ItemList.find(item => item.ItemId == RequisitionItemArray[i].ItemId);
                PoItem.PurchaseOrderItemValidator.controls['ItemId'].setValue(RequisitionItemArray[i].ItemId);
                PoItem.MSSNO = RequisitionItemArray[i].MSSNO;
                PoItem.HSNCODE = RequisitionItemArray[i].HSNCODE;
                this.currentPO.PurchaseOrderItems.push(PoItem);
              }
            }
            this.currentPO.updateItemDuplicationStatus();
            this.currentPO.calculateAndUpdateAmounts();
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
      var newPOItem = new PurchaseOrderItems();
      newPOItem.ItemCategory = ENUM_GRItemCategory.Consumables;//sud:18Sep'21 : By default category=consumables.
      newPOItem.filteredItemList = this.GetItemListByItemCategory(newPOItem.ItemCategory);//load item list for 1st row based on itemcategory.
      newPOItem.Quantity = 1;
      this.currentPO.PurchaseOrderItems.push(newPOItem);
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
      this.selectedVndr = vendorObj;
      this.currentPO.PurchaseOrderValidator.controls['VendorId'].setValue(vendorObj.VendorName);
      //assign the default currency id of vendor to the current po
      if (vendorObj.DefaultCurrencyId != null) {
        this.currentPO.CurrencyId = vendorObj.DefaultCurrencyId;
        this.selectedCurrencyCode = this.currencyCodeList.find(c => c.CurrencyID == this.currentPO.CurrencyId);
        this.currentPO.PurchaseOrderValidator.get("CurrencyCode").setValue(this.selectedCurrencyCode.CurrencyCode);
      }
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
  public LoadPOCategory() {
    this.POCategories = Object.values(ENUM_GRItemCategory).filter(p => isNaN(p as any));
  }

  public get getValidItemCount() {
    return this.currentPO.PurchaseOrderItems.filter(a => a.ItemId > 0).length;
  }

  //to load the item in the start
  LoadItemList(): void {
    let itemList = this.inventoryService.allItemList;
    if (itemList == undefined || itemList.length == 0) {
      this.messageBoxService.showMessage("failed", ["failed to get Item.. please check log for details."]);
    } else {
      this.ItemList = this.inventoryService.allItemList;
      if (this.EditPO == false) {
        this.ItemList = this.ItemList.filter(item => item.IsActive == true);
      }
    }
  }
  //to load the terms in the start
  LoadTermsList(): void {
    this.procurementBLService.GetTermsList(ENUM_TermsApplication.Inventory)
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

  OnItemCategoryChanged(indx: number) {
    var selPoItem = this.currentPO.PurchaseOrderItems[indx];
    selPoItem.filteredItemList = this.GetItemListByItemCategory(selPoItem.ItemCategory);
    selPoItem.filteredItemList = selPoItem.filteredItemList.slice();
    selPoItem.SelectedItem = new ItemMaster();
    selPoItem.PurchaseOrderItemValidator.get("ItemId").setValue("");
    this.GoToNextInput("poItemName" + indx, 100);
  }


  GetItemListByItemCategory(itmCategory: string) {
    let retItemList = this.ItemList.filter(item => item.ItemType === itmCategory);
    return retItemList;
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
        window.setTimeout(function () {
          let itmNameBox = document.getElementById("VendorName");
          if (itmNameBox) {
            itmNameBox.focus();
          }
        }, 600);
      }
    } catch (ex) {
      this.messageBoxService.showMessage("Failed", ["Something went wrong while loading vendor list."]);
    }
  }
  //getting vendor details  selectedVndr.VendorId

  GetVendorDetails() {
    if (this.selectedVndr && typeof (this.selectedVndr) == "string") {
      var selectedVndr = this.VendorList.find(a => a.VendorName == this.selectedVndr);
      if (selectedVndr && selectedVndr.VendorId) {
        this.selectedVndr = selectedVndr;
      }
    }
    if (this.selectedVndr && typeof (this.selectedVndr) == 'object') {
      var selVndr = this.VendorList.find(a => a.VendorId == this.selectedVndr.VendorId);
      if (selVndr && selVndr.VendorId) {
        this.currentPO.VendorId = this.selectedVndr.VendorId;
        //this.currentPO.PurchaseOrderValidator.get("VendorId").setValue(selVndr.VendorName);
        //assign the default currency id of vendor to the current po
        if (this.selectedVndr.DefaultCurrencyId != null) {
          this.currentPO.CurrencyId = this.selectedVndr.DefaultCurrencyId;
          this.selectedCurrencyCode = this.currencyCodeList.find(c => c.CurrencyID == this.currentPO.CurrencyId);
          this.currentPO.PurchaseOrderValidator.get("CurrencyCode").setValue(this.selectedCurrencyCode.CurrencyCode);
        }
      }
    }
    else {
      this.currentPO.VendorId = null;
    }
  }


  GetCurrencyCode() {
    this.invSettingBL.GetCurrencyCode()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.currencyCodeList = res.Results.filter(a => a.IsActive == true);
          //this.CurrentVendor.DefaultCurrencyId = 1;
        } else {
          this.messageBoxService.showMessage("error", [res.ErrorMessage]);
        }

      });
  }
  //add a new row
  AddRowRequest(index: number = this.currentPO.PurchaseOrderItems.length) {
    //checking the validation
    for (var i = 0; i < this.currentPO.PurchaseOrderItems.length; i++) {
      // for loop is used to show PurchaseOrderItemValidator message ..if required  field is not filled
      for (var a in this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls) {
        this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].markAsDirty();
        this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].updateValueAndValidity();
      }
    }
    ////row can be added if only if the item is selected is last row
    var newPoItem = new PurchaseOrderItems();
    newPoItem.Quantity = 1;
    newPoItem.ItemCategory = ENUM_GRItemCategory.Consumables;//by default set to Consumables..
    newPoItem.filteredItemList = this.GetItemListByItemCategory(newPoItem.ItemCategory);

    this.currentPO.PurchaseOrderItems.splice(index, 0, newPoItem);
    window.setTimeout(function () {
      let itmNameBox = document.getElementById("poItemName" + index);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);

  }

  //to delete the row
  DeleteRow(index) {
    //this will remove the data from the array
    this.currentPO.PurchaseOrderItems.splice(index, 1);
    // if there is no item in the list, then add new item.
    if (this.currentPO.PurchaseOrderItems.length == 0) {
      this.AddRowRequest(0);
    }
    this.currentPO.updateItemDuplicationStatus();
    this.currentPO.calculateAndUpdateAmounts();
  }


  SelectItemFromSearchBox(Item: ItemMaster, index) {
    //if proper item is selected then the below code runs ..othewise it goes out side the function
    if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
      this.currentPO.updateItemDuplicationStatus();

      for (var a = 0; a < this.currentPO.PurchaseOrderItems.length; a++) {
        // Assiging the value StandardRate,VatPercentage and ItemId in the particular index ..
        //it helps for changing item after adding the item and also in adding in new item
        if (a == index) {
          const selectedItem = this.currentPO.PurchaseOrderItems[index];
          if (Item.StandardRate != 0) {
            selectedItem.StandardRate = Item.StandardRate;
          }
          if (selectedItem.VatPercentage == null || selectedItem.VatPercentage == 0) {
            selectedItem.VatPercentage = Item.VAT ? Item.VAT : 0;
          }
          selectedItem.ItemId = Item.ItemId;
          selectedItem.Code = Item.Code;
          selectedItem.UOMName = Item.UOMName;
          selectedItem.MSSNO = Item.MSSNO;
          selectedItem.HSNCODE = Item.HSNCODE;
          selectedItem.itemPriceHistory = this.inventoryService.allItemPriceList
            .filter((item) => item.ItemId == Item.ItemId)
            .filter((u, i) => i < 3); //taking top 3

          this.currentPO.calculateAndUpdateAmounts();
        }
      }
    }

  }
  //Load the Receipt To Edit
  LoadReceiptToEdit(id: number) {
    if (id != null) {
      this.procurementBLService.GetPOItemsByPOId(id)
        .subscribe(res => this.ShowPurchaseOrderDetails(res));
    }
    else {
      this.messageBoxService.showMessage("notice-message", ['Please, Select PurchaseOrder for Details.']);
      this.purchaseorderList();
    }
  }
  loadQuotationForPO(reqForquotId: number) {
    this.procurementBLService.getQuotationDetailsToAddPO(reqForquotId)
      .subscribe(res => {
        if (res.Status == "OK") {
          var po = new QuotationToPODto(res.Results.PurchaseOrder)
          this.currentPO = po.getPurchaseOrder()
          // populate vendor in form
          this.selectedVndr = this.VendorList.find(a => a.VendorId == this.currentPO.VendorId)
          this.GetVendorDetails()
          // populate item in form for each purchase order item
          this.currentPO.PurchaseOrderItems.forEach((item, index) => {
            var itemMaster = item.SelectedItem = this.ItemList.find(a => a.ItemId == item.ItemId)
            item.Code = itemMaster.Code
            item.UOMName = itemMaster.UOMName
            item.MSSNO = itemMaster.MSSNO
            item.ItemCategory = itemMaster.ItemType
            item.itemPriceHistory = this.inventoryService.allItemPriceList
              .filter((item) => item.ItemId == itemMaster.ItemId)
              .filter((u, i) => i < 3); //taking top 3
          })
          this.currentPO.calculateAndUpdateAmounts()
        }
        else {
          this.messageBoxService.showMessage("notice-message", ["There is no PurchaseOrder details !"]);
          this.purchaseorderList();
        }
      });
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

      //this.changeDetectorRef.detectChanges();

      for (let i = 0; i < ItemList.length; i++) {
        var newItem = new PurchaseOrderItems();
        var ItemName = ItemList[i].ItemName;
        var VATAmount = ItemList[i].VATAmount;
        var Quantity = ItemList[i].Quantity;
        var StandardRate = ItemList[i].StandardRate;
        var SubTotal = Quantity * StandardRate;
        newItem.ItemId = this.ItemList.find(a => a.ItemName == ItemName).ItemId;//sud:20Sept'21--Need to check for category as well. since itemname is not unique anymore.
        newItem.PurchaseOrderId = (this.RecreatePO == false) ? ItemList[i].PurchaseOrderId : 0;
        newItem.PurchaseOrderItemId = (this.RecreatePO == false) ? ItemList[i].PurchaseOrderItemId : 0;
        newItem.Quantity = ItemList[i].Quantity;
        newItem.ReceivedQuantity = ItemList[i].ReceivedQuantity;
        newItem.POItemStatus = ItemList[i].POItemStatus;
        newItem.POItemSpecification = ItemList[i].POItemSpecification;
        newItem.StandardRate = ItemList[i].StandardRate;
        newItem.TotalAmount = ItemList[i].ItemTotalAmount;
        newItem.Remark = ItemList[i].Remark;
        newItem.DeliveryDays = ItemList[i].DeliveryDays;
        newItem.AuthorizedBy = ItemList[i].AuthorizedBy;
        newItem.SelectedItem = this.ItemList.find(a => a.ItemName == ItemName);//sud:20Sept'21--Need to check for category as well. since itemname is not unique anymore.
        newItem.VatPercentage = ItemList[i].VatPercentage;
        newItem.Code = ItemList[i].Code;
        newItem.UOMName = ItemList[i].UOMName;
        newItem.ItemCategory = ItemList[i].ItemCategory;
        newItem.VendorItemCode = ItemList[i].VendorItemCode;
        newItem.HSNCODE = ItemList[i].HSNCODE;
        newItem.MSSNO = ItemList[i].MSSNO;
        newItem.filteredItemList = this.GetItemListByItemCategory(newItem.ItemCategory);
        //sud"20Sep'21--We need to assign value directly to validator>control level else it will reset to zero after change-detection
        //it's still not working after change detector.. :((
        newItem.PurchaseOrderItemValidator.get("StandardRate").setValue(ItemList[i].StandardRate);
        this.currentPO.PurchaseOrderItems.push(newItem);
      }
      this.currentPO.calculateAndUpdateAmounts();
      this.currentPO.updateItemDuplicationStatus();

      this.inventoryService.POId = 0;
      this.changeDetectorRef.detectChanges();///sud:20Sep'21--Standard Rate is resetting to Zero after this line executed.
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
    this.router.navigate(['/ProcurementMain/PurchaseOrder/PurchaseOrderList']);
  }
  //used to format display item in ng-autocomplete
  myListFormatter(data: any): string {
    let html = data["ItemName"] + " (" + data["ItemType"] + ")";
    return html;
  }

  myVendorListFormatter(data: any): string {
    let html = data["VendorName"];
    return html;
  }
  VerifierListFormatter(data: any): string {
    return `${data["Name"]} (${data["Type"]})`;
  }

  myCurrencyCodeListFormatter(data: any): string {
    let html = data["CurrencyCode"];
    return html;
  }

  //posting to db
  AddPurchaseOrder() {
    var CheckIsValid = true;
    var errorMessages: string[] = [];
    if (!this.currentPO.PurchaseOrderItems.some(a => a.ItemId != null && a.ItemId != 0)) {
      CheckIsValid = false;
      this.messageBoxService.showMessage("Failed", ['Please add at least one Valid item.']);
      return;
    }
    this.currentPO.calculateAndUpdateAmounts();
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
      // if the last item row is blank then, bypass the validators.
      if (i == this.currentPO.PurchaseOrderItems.length - 1) {
        if (!(this.currentPO.PurchaseOrderItems[i].ItemId > 0) && this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.get("ItemId").value == "") {
          // do nothing...
        }
      }
      else {
        if (this.currentPO.PurchaseOrderItems[i].IsValidCheck(undefined, undefined) == false) {
          // for loop is used to show PurchaseOrderItemValidator message ..if required  field is not filled
          for (var a in this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls) {
            this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].markAsDirty();
            this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].updateValueAndValidity();
            if (this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].status == "INVALID") {
              errorMessages.push(`${a} is invalid in item ${i + 1}.`);
            }
          }
          CheckIsValid = false;
        }
      }
    }

    CheckIsValid = (CheckIsValid && this.CheckIfVerifierSelected(errorMessages));

    if (this.currentPO.PurchaseOrderItems.length == 0) {
      errorMessages.push("Please Add Item ...Before Requesting");
    }

    if (CheckIsValid == true && this.currentPO.PurchaseOrderItems != null) {
      this.loading = true;
      //Updating the Status
      this.currentPO.POStatus = this.currentPO.IsVerificationEnabled ? "pending" : "active";
      this.currentPO.PoDate = moment(this.currentPO.PoDate).format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss.SSS');

      for (let poItem of this.currentPO.PurchaseOrderItems) {
        poItem.POItemStatus = "active";
        poItem.AuthorizedBy = this.securityService.GetLoggedInUser().EmployeeId;
      }
      if (!this._activateInventoryService.activeInventory.StoreId) {
        this.messageBoxService.showMessage("Alert!", ["Cannot find StoreId. Please select Inventory First"])
        return;
      } else {
        this.currentPO.StoreId = this._activateInventoryService.activeInventory.StoreId;
        this.currentPO.POGroupId = this._activateInventoryService.activeInventory.INV_POGroupId;
      }

      // filtering our the last item if left blank is done in blservice.
      this.procurementBLService.PostToPurchaseOrder(this.currentPO).
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

            this.inventoryService.POId = res.Results;//sud:3Mar'20-Property Rename in InventoryService
            this.router.navigate(['/ProcurementMain/PurchaseOrder/PurchaseOrderView']);
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
    //
    this.currentPO.calculateAndUpdateAmounts();
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

      // if the last item row is blank then, bypass the validators.
      if (i == this.currentPO.PurchaseOrderItems.length - 1) {
        if (!(this.currentPO.PurchaseOrderItems[i].ItemId > 0) && this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.get("ItemId").value == "") {
          // do nothing...
        }
      }
      else {
        if (this.currentPO.PurchaseOrderItems[i].IsValidCheck(undefined, undefined) == false) {
          // for loop is used to show PurchaseOrderItemValidator message ..if required  field is not filled
          for (var a in this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls) {
            this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].markAsDirty();
            this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].updateValueAndValidity();
            if (this.currentPO.PurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].status == "INVALID") {
              errorMessages.push(`${a} is invalid in item ${i + 1}.`);
            }
          }
          CheckIsValid = false;
        }
      }
    }

    CheckIsValid = (CheckIsValid && this.CheckIfVerifierSelected(errorMessages));

    if (this.currentPO.PurchaseOrderItems.length == 0) {
      errorMessages.push("Please Add Item ...Before Requesting");
    }

    if (CheckIsValid == true && this.currentPO.PurchaseOrderItems != null) {

      this.currentPO.ModifiedOn = new Date();
      this.currentPO.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.currentPO.PurchaseOrderItems.map(a => {
        a.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
        a.ModifiedOn = new Date();
        a.CreatedOn = (a.CreatedOn) ? new Date() : a.CreatedOn;
        a.PurchaseOrderId = this.currentPO.PurchaseOrderId;
      });
      if (!this._activateInventoryService.activeInventory.StoreId) {
        this.messageBoxService.showMessage("Alert!", ["Cannot find StoreId. Please select Inventory First"])
        return;
      } else {
        this.currentPO.StoreId = this._activateInventoryService.activeInventory.StoreId;
        this.currentPO.POGroupId = this._activateInventoryService.activeInventory.INV_POGroupId;
      }
      // filtering our the last item if left blank is done in blservice.
      this.procurementBLService.UpdatePurchaseOrder(this.currentPO).
        subscribe(res => {
          if (res.Status == 'OK') {
            this.messageBoxService.showMessage("success", ["Purchase Order is Updated."]);
            //this.router.navigate(['/Inventory/ExternalMain/PurchaseOrderList']);
            this.changeDetectorRef.detectChanges();
            //deleting all creating new PO..after successully adding to db
            this.currentPO.PurchaseOrderItems = new Array<PurchaseOrderItems>();
            this.currentPO = new PurchaseOrder();
            this.selectedVndr = '';


            this.inventoryService.POId = res.Results;//sud:3Mar'20-Property Rename in InventoryService
            this.router.navigate(['/ProcurementMain/PurchaseOrder/PurchaseOrderView']);
            this.loading = false;

          }
          else {

            this.messageBoxService.showMessage("failed", ['failed to add Purchase Order.. please check log for details.']);
            this.logError(res.ErrorMessage);
            this.loading = false;

          }
        });
    }
  }
  //update PO requisition
  UpdatePORequisition() {
    this.procurementBLService.UpdatePORequisitionAfterPOCreation(this.inventoryService.PurchaseRequestId)
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
    this.router.navigate(['ProcurementMain/PurchaseOrder/PurchaseOrderList']);
  }

  logError(err: any) {
    console.log(err);
  }
  //loads items from requisition for PO
  LoadRequisitionOrder() {
    this.currentPO.PurchaseOrderItems = new Array<PurchaseOrderItems>();
    if (this.selectedVndr.DefaultItem.length == 0) {
      this.AddRowRequest();
    }
    else {
      for (var i = 0; i < this.selectedVndr.DefaultItem.length; i++) {
        var newItem = this.ItemList.find(a => a.ItemId == this.selectedVndr.DefaultItem[i]);
        this.currentPO.PurchaseOrderItems.push(new PurchaseOrderItems());
        this.currentPO.PurchaseOrderItems[this.currentPO.PurchaseOrderItems.length - 1].SelectedItem = newItem;
        this.currentPO.PurchaseOrderItems[this.currentPO.PurchaseOrderItems.length - 1].Quantity = newItem.ReOrderQuantity;
      }
      this.currentPO.calculateAndUpdateAmounts();
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
      "ItemId": item.ItemId, "ItemName": item.ItemName, StandardRate: item.StandardRate, VAT: item.VAT, ItemType: item.ItemType, Code: item.Code, UOMName: item.UOMName
    });
    var newPOItem = new PurchaseOrderItems();
    newPOItem.Quantity = 1;
    newPOItem.ItemCategory = item.ItemType
    newPOItem.filteredItemList = this.GetItemListByItemCategory(item.ItemType);
    newPOItem.filteredItemList = newPOItem.filteredItemList.slice();//update the source-array of Searchbox.
    newPOItem.ItemId = item.ItemId;
    newPOItem.Code = item.Code;
    newPOItem.UOMName = item.UOMName;
    newPOItem.SelectedItem = item;
    newPOItem.PurchaseOrderItemValidator.get("ItemId").setValue(item);
    this.currentPO.PurchaseOrderItems.splice(this.index, 1, newPOItem);
    this.GoToNextInput("poItemName" + this.index, 100);
  }
  //for supplier add popup
  AddSupplierPopUp() {
    this.showAddVendorPopUp = false;
    this.changeDetectorRef.detectChanges();
    this.showAddVendorPopUp = true;
  }
  OnNewVendorAdded($event) {
    this.showAddVendorPopUp = false;
    var supplier = $event.vendor;
    this.VendorList.push(supplier);
    console.log("vendor count-top:" + this.VendorList.length);
    this.VendorList.slice();
    this.selectedVndr = supplier.VendorName;
    this.currentPO.PurchaseOrderValidator.get("VendorId").setValue(this.selectedVndr);
    this.selectedCurrencyCode = this.currencyCodeList.find(c => c.CurrencyID == supplier.DefaultCurrencyId);
    this.currentPO.PurchaseOrderValidator.get("CurrencyCode").setValue(this.selectedCurrencyCode.CurrencyCode);
    this.currentPO.VendorId = supplier.VendorId;
    this.currentPO.CurrencyId = supplier.DefaultCurrencyId;
    this.inventoryService.allVendorList.push(supplier);
    console.log("vendor count-bottom:" + this.VendorList.length);
    this.GoToNextInput(`poItemName0`);

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
  GoToNextInput(id: string, focusDelayInMs: number = 0) {
    var Timer = setTimeout(() => {
      if (document.getElementById(id)) {
        let nextEl = <HTMLInputElement>document.getElementById(id);
        nextEl.focus();
        nextEl.select();
        clearTimeout(Timer);
      }
    }, focusDelayInMs)
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
    return this.currentPO.VerifierList.some(V => V.Id == undefined) || this.currentPO.VerifierList.length >= 2;
  }
  CheckIfDeleteVerifierAllowed() {
    return this.currentPO.VerifierList.length <= 1;
  }

  public CallBackInvoiceHeader(data) {
    if (data) {
      this.currentPO.InvoiceHeaderId = data;
    }
  }


  SelectCurrencyCodeFromSearchBox() {
    let selCurrencyCodeObj: CurrencyModel = null;
    if (typeof (this.selectedCurrencyCode) == 'string' && this.currencyCodeList.length) {
      selCurrencyCodeObj = this.currencyCodeList.find(c => c.CurrencyID == this.selectedCurrencyCode.CurrencyID);
    }
    else if (typeof (this.selectedCurrencyCode) == 'object') {
      selCurrencyCodeObj = this.selectedCurrencyCode;
    }

    if (selCurrencyCodeObj) {
      this.currentPO.CurrencyId = selCurrencyCodeObj.CurrencyID;

    }

  }
  onChangeEditorData(data) {
    this.currentPO.TermsConditions = data;
  }

  onPressedEnterKeyInItemField(index: number) {
    if (this.currentPO.PurchaseOrderItems[index].ItemId > 0) {
      if (this.poFormParameterValue.showVendorItemCode == true) {
        this.GoToNextInput('vendorCode' + index, 200);
      }
      else {
        this.GoToNextInput('ipqty' + index, 200);
      }
    }
    else {
      this.GoToNextInput("PurchaseOrderbtn");
    }
  }

  onPressedEnterKeyInRateField(index: number) {
    // if the item is not valid, do nothing.
    if (this.currentPO.PurchaseOrderItems[index].PurchaseOrderItemValidator.invalid) return;
    if (index == (this.currentPO.PurchaseOrderItems.length - 1)) {
      this.AddRowRequest();
    }
    else {
      this.GoToNextInput('poItemName' + (index + 1))
    }
  }
}





// Quotation to PO Dto
class QuotationToPOItemDto {
  QuotationItemId: number
  ItemId: number
  QuotationQuantity: number
  QuotationRate: number
  Description: string
}

class QuotationToPODto {
  QuotationId: number
  QuotationNo: number
  VendorId: number
  PurchaseOrderItems: QuotationToPOItemDto[] = []


  constructor(sameModel: QuotationToPODto) {
    this.QuotationId = sameModel.QuotationId
    this.QuotationNo = sameModel.QuotationNo
    this.VendorId = sameModel.VendorId
    this.PurchaseOrderItems = sameModel.PurchaseOrderItems
  }
  public getPurchaseOrder() {
    var purchaseOrder: PurchaseOrder = new PurchaseOrder()
    purchaseOrder.VendorId = this.VendorId
    this.PurchaseOrderItems.forEach(a => {
      var poItem = new PurchaseOrderItems()
      poItem.ItemId = a.ItemId
      poItem.Quantity = a.QuotationQuantity
      poItem.PendingQuantity = a.QuotationQuantity
      poItem.StandardRate = a.QuotationRate
      poItem.Remark = a.Description
      purchaseOrder.PurchaseOrderItems.push(poItem)
    })

    purchaseOrder.updateItemDuplicationStatus()
    return purchaseOrder
  }


}
