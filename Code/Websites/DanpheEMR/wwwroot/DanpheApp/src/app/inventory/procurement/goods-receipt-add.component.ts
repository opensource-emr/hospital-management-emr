import { Component, ChangeDetectorRef, OnInit, OnDestroy } from "@angular/core";
import { Router } from '@angular/router';
import { GoodsReceipt } from "../shared/goods-receipt.model"
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
import { GoodReceiptService } from "../shared/good-receipt/good-receipt.service";
import { GoodsReceiptItems } from "../shared/goods-receipt-item.model";
import { RouteFromService } from "../../shared/routefrom.service";
import { SecurityService } from "../../security/shared/security.service";
import * as moment from 'moment/moment';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { ItemMaster } from "../shared/item-master.model";
import { InventoryService } from "../shared/inventory.service";
import { VendorMaster } from "../shared/vendor-master.model";
import { toArray } from "rxjs/operator/toArray";
import { CommonFunctions } from "../../shared/common.functions";
import { CoreService } from "../../core/shared/core.service";
import { ItemModel } from "../settings/shared/item.model";
import { ENUM_GRCategory } from "../../shared/shared-enums";
import { POVerifier } from "../shared/purchase-order.model";
@Component({
  templateUrl: "./goods-receipt-add.html",
})
export class GoodsReceiptAddComponent implements OnInit, OnDestroy {

  public goodsReceipt: GoodsReceipt = new GoodsReceipt();
  //public model: Array<GoodsReceiptItems> = new Array<GoodsReceiptItems>();
  public purchaseOrderId: number = 0;

  public selectedVendor: any = null;
  public disableButton: boolean = false;
  public disableTextBox: boolean = false;
  public loading: boolean = false;
  public ItemList: any[] = [];
  public VendorList: any[];
  public receivedqty: number;
  public rowCount: number = 0;
  public checkIsItemPresent: boolean = false;
  public index: number = 0;
  public showAddItemPopUp: boolean = false;
  public showAddVendorPopUp: boolean = false;
  public purchaseOrder: any;
  public isGrFromPOMode: boolean = false;
  public TDSApplicable: boolean = false;
  public editGR: boolean = false;
  public editPO: boolean = false;
  public GRCategories: string[] = [];
  public ItemListFiltered: any[] = [];
  public vendorBillHistoryList: any[] = [];
  public duplicateVendorGRBillList: any[] = [];
  //this controls whether to show verification part or not. controlled by core cfg settings.
  public IsVerificationActivated: boolean = true;
  public canUserEnterDate: boolean = false;
  public VerifierList: POVerifier[] = [];

  constructor(public routeFrom: RouteFromService,
    public goodReceiptService: GoodReceiptService,
    public securityService: SecurityService,
    public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public changeDetectorRef: ChangeDetectorRef,
    public messageBoxService: MessageboxService,
    public coreService: CoreService,
    public router: Router) {

    this.disableTextBox = true;
    this.disableButton = true;
    this.LoadGRCategory();
  }
  private checkIfDateEntryAllowed(decidingFactorForEditMode = true) {
    //in normal scenario, if user has permission, s/he can adjusts date
    //in edit mode, no other txns should exists for that particular gr, or else date adjustment is not possible
    this.canUserEnterDate = this.securityService.HasPermission('inventory-gr-backdate-entry-button') && decidingFactorForEditMode;
  }

  ngOnInit() {
    this.goodsReceipt.GoodsReceiptDate = moment().format('YYYY-MM-DD');
    this.LoadItemList();
    this.LoadVerifiersForGR();
    //this.isRecreateOrEditMode(); put inside LoadVerifiersForPO method because of its dependency
    this.goodsReceipt.PaymentMode = "Credit";
    this.LoadVendorList(); //vendor must be loaded at last, because, in edit GR case, we may need inactive vendors as well.
  }
  private CheckForEditRecreateMode() {
    if (this.inventoryService.POId > 0) { //this comes from PO LIst -> Add GR. 
      this.LoadPo(this.inventoryService.POId);
      this.isGrFromPOMode = true;
      this.inventoryService.POId = 0;
      this.checkIfDateEntryAllowed();
    }
    else if (this.inventoryService.GoodsReceiptId > 0) { //this comes from GR-Edit Page. (Changed: sud-19Feb'20- inventoryService.id was wrongly implemented.)
      this.LoadGoodsReceiptDetails(this.inventoryService.GoodsReceiptId);
      this.editGR = true;
      this.inventoryService.GoodsReceiptId = 0;
    }
    else {
      this.AddRowRequest();
      this.isGrFromPOMode = false;
      this.editGR = false;
      this.SetDefaultVerifier();
      this.checkIfDateEntryAllowed();
    }
  }

  ngOnDestroy(): void {
    if (this.editGR == true) {
      this.inventoryService.GoodsReceiptId = 0;
    }
    if (this.isGrFromPOMode == true) {
      this.inventoryService.POId = 0;
    }
  }
  public SetDefaultVerifier() {
    var ProcurementVerificationSetting = this.coreService.Parameters.find(param => param.ParameterGroupName == "Inventory" && param.ParameterName == "ProcurementVerificationSettings").ParameterValue;
    var ProcurementVerificationSettingParsed = JSON.parse(ProcurementVerificationSetting);
    if (ProcurementVerificationSettingParsed != null) {
      if (ProcurementVerificationSettingParsed.EnableVerification == true) {
        this.goodsReceipt.IsVerificationEnabled = true;
        this.SetVerifiersFromVerifierIdsObj(ProcurementVerificationSettingParsed.VerifierIds);
      }
      else {
        this.IsVerificationActivated = false;
      }
    }
  }
  private SetVerifiersFromVerifierIdsObj(VerifierIds: any) {
    if (this.goodsReceipt.IsVerificationEnabled == true && this.VerifierList != null) {
      this.goodsReceipt.VerifierList = [];
      var VerifierIdsParsed: any[] = (typeof (VerifierIds) == "string") ? JSON.parse(VerifierIds) : VerifierIds;
      if (VerifierIdsParsed == null || VerifierIdsParsed.length == 0) {
        this.AddVerifier();
      }
      else {
        //if more than three verifiers are selected, it will take only first three.
        VerifierIdsParsed = VerifierIdsParsed.slice(0, 2);
        VerifierIdsParsed.forEach(a => this.goodsReceipt.VerifierList.push(this.VerifierList.find(v => v.Id == a.Id && v.Type == a.Type)));
      }
    }
  }
  public LoadVerifiersForGR() {
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
  LoadGoodsReceiptDetails(goodsReceiptId: number) {

    if (goodsReceiptId) {
      //this.goodsreceiptID = id;
      this.inventoryBLService.GetGRItemsByGRId(goodsReceiptId)
        .subscribe(res => this.ShowGoodsReceiptDetails(res));
    }
    else {
      this.messageBoxService.showMessage("notice-message", ['Please, Select GoodsReceipt for Details.']);
      this.goodsreceiptList();
    }
  }


  ShowGoodsReceiptDetails(res) {
    if (res.Status == "OK") {
      //for date change option
      this.checkIfDateEntryAllowed(res.Results.canUserEditDate);
      //for the edit options
      //to add the good receipt details 

      let goodsReceiptDetail: GoodsReceipt = res.Results.grDetails;
      this.changeDetectorRef.detectChanges();
      this.goodsReceipt = Object.assign(this.goodsReceipt, goodsReceiptDetail);
      //to check for previous verifiers from edit mode
      this.SetVerifiersFromVerifierIdsObj(this.goodsReceipt.VerifierIds);

      let currVendor = this.VendorList.find(s => s.VendorName == goodsReceiptDetail.VendorName);
      if (currVendor != undefined) {
        this.selectedVendor = currVendor.VendorName;
        this.goodsReceipt.VendorId = currVendor.VendorId;
      }
      else {
        this.messageBoxService.showMessage("Notice-message", ["This vendor is inactive now. Please select another vendor."])
      }


      //to add the goods receipt item since the validators are not passed from the controller
      var goodsReceiptItems: Array<any> = res.Results.grItems;
      this.changeDetectorRef.detectChanges();
      for (let i = 0; i < goodsReceiptItems.length; i++) {
        this.changeDetectorRef.detectChanges();
        var currGRItem: GoodsReceiptItems = new GoodsReceiptItems();
        const grItemFromServer = goodsReceiptItems[i];
        currGRItem.ItemId = grItemFromServer.ItemId;
        //does not trigger the validators for itemid
        currGRItem.GoodsReceiptItemValidator.get("ItemId").disable();
        currGRItem.ItemName = grItemFromServer.ItemName;
        currGRItem.BatchNO = grItemFromServer.BatchNo;
        currGRItem.ReceivedQuantity = grItemFromServer.ReveivedQuantity;
        currGRItem.ExpiryDate = grItemFromServer.ExpiryDate;
        currGRItem.FreeQuantity = grItemFromServer.FreeQuantity;
        currGRItem.ItemRate = grItemFromServer.GRItemRate;
        currGRItem.VATAmount = grItemFromServer.VATAmount;
        currGRItem.CcAmount = grItemFromServer.CcAmount;
        currGRItem.DiscountAmount = grItemFromServer.DiscountAmount;
        currGRItem.TotalAmount = grItemFromServer.ItemTotalAmount;
        //calculate vat percentage from vatamount
        const totalAmountBeforeVAT = grItemFromServer.ItemTotalAmount - grItemFromServer.VATAmount;
        currGRItem.VAT = CommonFunctions.parseAmount((grItemFromServer.VATAmount / totalAmountBeforeVAT) * 100);
        currGRItem.OtherCharge = grItemFromServer.OtherCharge;
        currGRItem.GoodsReceiptItemId = grItemFromServer.GoodsReceiptItemId;
        currGRItem.GoodsReceiptId = grItemFromServer.GoodsReceiptId;
        //var currItem = this.ItemList.find(i => i.ItemName == currGRItem.ItemName);
        // if(currItem != undefined){
        //   currGRItem.SelectedItem = currItem;
        // }
        // else{
        //   currGRItem.SelectedItem = new Item()
        // }
        this.goodsReceipt.GoodsReceiptItem.push(currGRItem);
        this.goodsReceipt.GoodsReceiptItem = this.goodsReceipt.GoodsReceiptItem.slice();
      }


      if (this.goodsReceipt.GoodsReceiptItem.length > 0) {
        this.goodsReceipt.GoodsReceiptItem.forEach(itm => {
          if (itm.ExpiryDate != null)
            itm.ExpiryDate = moment(itm.ExpiryDate).format('DD-MM-YYYY');
        });
        this.goodsReceipt.GoodsReceiptDate = moment(this.goodsReceipt.GoodsReceiptDate).format('YYYY-MM-DD');
        this.goodsReceipt.ReceivedDate = moment(this.goodsReceipt.ReceivedDate).format('YYYY-MM-DD');
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.messageBoxService.showMessage("notice-message", ["Selected GoodsReceipt is without Items"]);
        this.goodsreceiptList();
      }
    }
    else {
      this.messageBoxService.showMessage("notice-message", ["There is no GoodsReceipt details !"]);
      this.goodsreceiptList();
    }
  }

  //route to goods receipt list page
  goodsreceiptList() {
    this.router.navigate(['/Inventory/ProcurementMain/GoodsReceiptList']);
  }
  //for cancel button
  Cancel() {
    this.TDSApplicable = false;
    this.inventoryService.GoodsReceiptId = 0;
    this.inventoryService.POId = 0;
    this.isGrFromPOMode = false;
    this.editGR = false;
    this.goodsreceiptList();
  }
  //get all PO,POItems, vendor and Item data against PurchaseOrderId for Goods Receipt
  LoadPo(purchaseOrderId: number) {
    this.inventoryBLService.GetPurchaseOrderItemsByPOId(Number(purchaseOrderId))
      .subscribe(res => this.LoadPurchaseItemsForGoodsReceipt(res));
  }
  //Load Purchase Order Items as Goods Receipt Items
  LoadPurchaseItemsForGoodsReceipt(res) {
    this.purchaseOrder = res.Results;
    this.changeDetectorRef.detectChanges();
    this.purchaseOrderId = this.purchaseOrder.PurchaseOrderId;
    let vendorName = this.purchaseOrder.Vendor.VendorName;
    this.TDSApplicable = this.purchaseOrder.Vendor.IsTDSApplicable;
    this.goodsReceipt.VendorId = this.purchaseOrder.VendorId;
    this.goodsReceipt.PurchaseOrderId = this.purchaseOrder.PurchaseOrderId;
    let currVendor = this.VendorList.find(s => s.VendorId == this.goodsReceipt.VendorId);
    if (currVendor != undefined) {
      this.selectedVendor = currVendor.VendorName;
      this.goodsReceipt.VendorId = currVendor.VendorId;
    }
    else {
      this.messageBoxService.showMessage("Notice-message", ["This vendor is inactive now. Please select another vendor."])
    }
    //load verifiers
    this.goodsReceipt.IsVerificationEnabled = this.purchaseOrder.IsVerificationEnabled;
    this.SetVerifiersFromVerifierIdsObj(this.purchaseOrder.VerifierIds);
    this.GetGrItemsFromPoItems();
  }
  //Metho  for transform POItems to GRItems
  GetGrItemsFromPoItems() {
    for (var i = 0; i < this.purchaseOrder.PurchaseOrderItems.length; i++) {

      this.changeDetectorRef.detectChanges();
      var currGRItem: GoodsReceiptItems = new GoodsReceiptItems();
      currGRItem.ItemId = this.purchaseOrder.PurchaseOrderItems[i].ItemId;
      currGRItem.ItemName = this.purchaseOrder.PurchaseOrderItems[i].Item.ItemName;
      currGRItem.VAT = this.purchaseOrder.PurchaseOrderItems[i].Item.VAT;
      currGRItem.ItemRate = this.purchaseOrder.PurchaseOrderItems[i].StandardRate;
      currGRItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      currGRItem.Quantity = this.purchaseOrder.PurchaseOrderItems[i].PendingQuantity;

      currGRItem.SelectedItem = this.ItemList.find(i => i.ItemId == currGRItem.ItemId);

      this.goodsReceipt.GoodsReceiptItem.push(currGRItem);

    }
  }

  //used to format display item in ng-autocomplete
  itemListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }

  //used to format display vendor in ng-autocomplete
  myVendorListFormatter(data: any): string {
    let html = data["VendorName"];
    return html;
  }
  public LoadGRCategory() {
    this.GRCategories = Object.values(ENUM_GRCategory).filter(p => isNaN(p as any));
  }
  LoadItemList(): void {
    try {
      this.ItemList = this.inventoryService.allItemList;
      if (this.editGR == false) {
        this.ItemList = this.ItemList.filter(item => item.IsActive == true);
        this.FilterItemByGRCategory();
      }
      if (!this.ItemList || this.ItemList.length == 0) {

        this.messageBoxService.showMessage("warning", ['ItemList not available. Plese add some item and try again.']);
      }

    } catch (ex) {
      this.messageBoxService.showMessage("failed", ['failed to get Item.. please check log for details.']);
    }
  }
  FilterItemByGRCategory() {
    this.ItemListFiltered = this.ItemList.filter(item => item.ItemType === this.goodsReceipt.GRCategory);
    this.ItemListFiltered = this.ItemListFiltered.slice();
  }
  LoadVendorList(): void {
    try {
      this.VendorList = this.inventoryService.allVendorList;
      if (this.editGR == false) {
        this.VendorList = this.VendorList.filter(vendor => vendor.IsActive == true);
      }
    } catch (ex) {
      this.messageBoxService.showMessage("failed", ['failed to get vendor List.. please check log for details.']);
    }
  }


  SelectItemFromSearchBox(Item: ItemMaster, index) {
    if (this.goodsReceipt.GoodsReceiptItem.length > 0) {
      this.goodsReceipt.GoodsReceiptItem[index].ItemId = Item.ItemId;
      if (this.goodsReceipt.GoodsReceiptItem[index].ItemRate == 0)
        this.goodsReceipt.GoodsReceiptItem[index].ItemRate = Item.StandardRate;
      if (this.goodsReceipt.GoodsReceiptItem[index].VAT == 0)
        this.goodsReceipt.GoodsReceiptItem[index].VAT = Item.VAT;
      this.goodsReceipt.GoodsReceiptItem[index].itemPriceHistory = this.inventoryService.allItemPriceList
        .filter((item) => item.ItemId == Item.ItemId)
        .filter((u, i) => i < 3); //taking top 3
    }
  }
  SelectVendorFromSearchBox() {

    let selVendorObj: VendorMaster = null;
    if (typeof (this.selectedVendor) == 'string' && this.VendorList.length) {
      selVendorObj = this.VendorList.find(v => v.VendorName.toLowerCase() == this.selectedVendor.toLowerCase());
      //item = this.itemList.filter(a => a.ItemName.toLowerCase() == this.selectedItems[index].toLowerCase())[0];   //for billing order.                
    }
    else if (typeof (this.selectedVendor) == 'object') {
      selVendorObj = this.selectedVendor;
    }

    if (selVendorObj) {
      this.goodsReceipt.VendorId = selVendorObj.VendorId;
      this.goodsReceipt.VendorName = selVendorObj.VendorName;
      this.goodsReceipt.CreditPeriod = selVendorObj.CreditPeriod;
      this.TDSApplicable = selVendorObj.IsTDSApplicable;

      //Bikash:23June'20 - for getting selected vendor's bill history
      this.GetVendorBillHistory();
    }
  }

  Calculations() {
    this.goodsReceipt.VATTotal = 0;
    this.goodsReceipt.SubTotal = 0;
    this.goodsReceipt.TDSAmount = 0;
    this.goodsReceipt.TotalAmount = 0;
    this.goodsReceipt.TotalWithTDS = 0;
    this.goodsReceipt.CcCharge = 0;
    this.goodsReceipt.Discount = 0;
    this.goodsReceipt.DiscountAmount = 0;
    this.goodsReceipt.GoodsReceiptItem.forEach(item => {

      let qty = item.ReceivedQuantity;

      let itemRate = item.ItemRate;
      let subtotal = qty * itemRate;

      let Discount = item.Discount / 100;
      let DiscountAmount = CommonFunctions.parseAmount(Discount * subtotal);

      item.DiscountAmount = DiscountAmount;

      let totalAmount = subtotal - DiscountAmount;

      if (this.TDSApplicable) {
        let totalwithTDS = subtotal - DiscountAmount;
        let TDSAmount = CommonFunctions.parseAmount(totalAmount * (this.goodsReceipt.TDSRate / 100));
        totalwithTDS = CommonFunctions.parseAmount(totalwithTDS - TDSAmount);

        let Vat1 = item.VAT / 100;
        let vatAmount1 = CommonFunctions.parseAmount(totalAmount * Vat1);
        totalwithTDS = CommonFunctions.parseAmount(totalwithTDS + vatAmount1);

        this.goodsReceipt.TotalWithTDS += totalwithTDS;
        this.goodsReceipt.TDSAmount += TDSAmount;
      }

      let CcCharge = item.CcCharge / 100;
      let CcAmount = CommonFunctions.parseAmount(totalAmount * CcCharge);

      item.CcAmount = CcAmount;

      totalAmount = totalAmount + CcAmount;

      let Vat = item.VAT / 100;
      let vatAmount = CommonFunctions.parseAmount(totalAmount * Vat);

      item.VATAmount = vatAmount;

      item.SubTotal = subtotal;

      totalAmount = CommonFunctions.parseAmount(totalAmount + vatAmount);


      item.TotalAmount = totalAmount;

      this.goodsReceipt.VATTotal += vatAmount;
      this.goodsReceipt.CcCharge += CcAmount;
      this.goodsReceipt.SubTotal += subtotal;
      this.goodsReceipt.DiscountAmount += DiscountAmount;
      this.goodsReceipt.TotalAmount += totalAmount;
    });
    this.goodsReceipt.OtherCharges = this.goodsReceipt.InsuranceCharge + this.goodsReceipt.CarriageFreightCharge + this.goodsReceipt.PackingCharge + this.goodsReceipt.TransportCourierCharge + this.goodsReceipt.OtherCharge;
    this.goodsReceipt.TotalAmount += this.goodsReceipt.OtherCharges;
  }

  //add a new row 
  AddRowRequest() {
    if (this.editGR) {
      this.messageBoxService.showMessage("Failed", ["Cannot add items in edit mode."]);
    }
    else {
      var goodItem = new GoodsReceiptItems();
      this.goodsReceipt.GoodsReceiptItem.push(goodItem);
      let len = this.goodsReceipt.GoodsReceiptItem.length - 1;

      window.setTimeout(function () {
        let itmNameBox = document.getElementById("itemName" + len);
        if (itmNameBox) {
          itmNameBox.focus();
        }
      }, 600);

    }
  }

  //to delete the row
  DeleteRow(index) {
    if (this.editGR) {
      this.messageBoxService.showMessage("Failed", ["Cannot delete items in edit mode."]);
    }
    else {
      //to stop rowCount value going negative
      if (this.rowCount > 0) {
        this.rowCount--;
      }

      //this will remove the data from the array
      this.goodsReceipt.GoodsReceiptItem.splice(index, 1);

      if (index == 0 && this.goodsReceipt.GoodsReceiptItem.length == 0) {
        this.goodsReceipt.GoodsReceiptItem.push(new GoodsReceiptItems());

        //this.Calculationforall(this.BillingTransactionItems[index]);
        this.Calculations();
        this.changeDetectorRef.detectChanges();

      }
      else {
        this.Calculations();
        this.changeDetectorRef.detectChanges();
      }
    }
  }
  //Save data to database
  SaveGoodsReceipt() {
    if (this.editGR) { this.isGrFromPOMode = false };
    if (this.goodsReceipt != null) {
      let validationObj = this.CheckValidation();
      this.goodsReceipt.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.goodsReceipt.GRStatus = this.goodsReceipt.IsVerificationEnabled ? "pending" : "active";
      this.goodsReceipt.GoodsReceiptDate = moment(this.goodsReceipt.GoodsReceiptDate).format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss.SSS');
      if (validationObj.isValid) {

        for (let index = 0; index < this.goodsReceipt.GoodsReceiptItem.length; index++) {
          if (this.goodsReceipt.GoodsReceiptItem[index].ReceivedQuantity == 0) {
            this.goodsReceipt.GoodsReceiptItem.splice(index, 1);
            index--;
          }
          else {
            this.goodsReceipt.GoodsReceiptItem[index].OtherCharge = (this.goodsReceipt.GoodsReceiptItem[index].TotalAmount * this.goodsReceipt.OtherCharges) / (this.goodsReceipt.SubTotal);
          }
        }

        if (this.editGR) {
          this.UpdateGoodsReceipt();
        }
        else {
          this.goodReceiptService.AddGoodReceipt(this.goodsReceipt)
            .finally(() => {
              this.loading = false;
            })
            .subscribe(
              res => {
                if (res.Status == 'OK') {
                  this.messageBoxService.showMessage("success", ["Goods Receipt Created Successfully."]);
                  //this function for navigate to POList page
                  this.RouteToViewDetails(res.Results);
                }
                else {
                  this.messageBoxService.showMessage("failed", ["failed to add result.. please check log for details."]);
                  console.log(res.ErrorMessage);
                }
              },
              err => {
                console.log(err.error.ErrorMessage);
              });
        }
      }
      else {
        this.loading = false;
        this.messageBoxService.showMessage("warning", validationObj.messageArr);
      }
    }
    else {
      this.loading = false;
      this.messageBoxService.showMessage("notice-message", ["Add Item ...Before Requesting"]);
    }
  }

  //check for the validation in current fraction entries.
  //returns a object with True/False  and Error messages if False.
  CheckValidation(): any {

    let validationObj = { isValid: true, messageArr: [] };


    //Start: Validation before saving-- move it to separate function if required.. 
    //validation-1: save without adding anything.. 
    if (!this.goodsReceipt.GoodsReceiptItem || this.goodsReceipt.GoodsReceiptItem.length == 0) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Please add at-least one item..");

      return validationObj;
    }

    //validation-2: Check Type, AssignedTo, IncentivePercent
    if (!this.goodsReceipt.VendorId) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Invalid Vendor..");
    }
    if (this.IsGoodsReceiptDateValid == false) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Invalid Fiscal Year Vendor Bill Date..");
    }
    if (!this.goodsReceipt.BillNo) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Invalid Bill No.");
    }
    //validation 3 -- check for all the form controls.
    for (var a in this.goodsReceipt.GoodsReceiptValidator.controls) {
      this.goodsReceipt.GoodsReceiptValidator.controls[a].markAsDirty();
      this.goodsReceipt.GoodsReceiptValidator.controls[a].updateValueAndValidity();
    }
    if (this.goodsReceipt.IsValidCheck(undefined, undefined) == false) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Please check all the required fields.");
    }
    this.loading = true;
    this.goodsReceipt.GoodsReceiptItem.forEach(item => {
      item.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      for (var b in item.GoodsReceiptItemValidator.controls) {
        item.GoodsReceiptItemValidator.controls[b].markAsDirty();
        item.GoodsReceiptItemValidator.controls[b].updateValueAndValidity();
      }
      if (item.IsValidCheck(undefined, undefined) == false) {
        validationObj.isValid = false;
        validationObj.messageArr.push("Please fill required item fields.");
      }
    });

    //Validation:4 -- Duplicate Consultant Validation -- Can't have one employee in more than one place..
    //loop on each item and try to find if there's more than one object of same employee. 

    if (this.HasDuplicateItems()) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Duplicate items are not allowed.");
    }

    return validationObj;
  }

  UpdateGoodsReceipt() {
    this.goodsReceipt.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
    this.goodsReceipt.ModifiedOn = new Date();
    this.goodsReceipt.GoodsReceiptItem.map(a => {
      a.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      a.ModifiedOn = new Date();
    });
    this.goodReceiptService.UpdateGoodReceipt(this.goodsReceipt)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.editGR = false;
          this.inventoryService.GoodsReceiptId = 0;//sud:3Mar'20-Property Rename in InventoryService
          this.messageBoxService.showMessage("success", ["Good Receipt has been saved."]);
          this.goodsreceiptList();
        }
        else {
          this.messageBoxService.showMessage("Failed", [res.ErrorMessage]);
          this.loading = false;
        }
      });
  }
  HasDuplicateItems(itemId?: number) {
    let seen = new Set();
    var hasDuplicates = this.goodsReceipt.GoodsReceiptItem.some(currentObject => {
      return seen.size == seen.add(currentObject.ItemId).size && currentObject.ItemId != 0 && (currentObject.ItemId == itemId || itemId == null);
    });
    return hasDuplicates;
  }
  RouteToViewDetails(grId: number) {
    this.inventoryService.GoodsReceiptId = grId;//sud:3Mar'20-Property Rename in InventoryService
    this.inventoryService.POId = null;
    this.isGrFromPOMode = false;
    this.router.navigate(['/Inventory/ProcurementMain/GoodsReceiptDetails']);
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
      "ItemId": item.ItemId, "ItemName": item.ItemName, StandardRate: item.StandardRate, VAT: item.VAT,
      Code: item.Code, ItemType: item.ItemType, UOMName: item.UOMName
    });
    this.ItemList = this.ItemList.slice();
    this.FilterItemByGRCategory();
    // let currentGRItem = new GoodsReceiptItems();
    // currentGRItem.ReceivedQuantity = 1;
    // this.goodsReceipt.GoodsReceiptItem.splice(this.index, 1, currentGRItem);
    // this.goodsReceipt.GoodsReceiptItem[this.index].ItemId = item.ItemId;
    // this.goodsReceipt.GoodsReceiptItem[this.index].ItemName = item.ItemName;
  }
  //for vendor add popup
  AddVendorPopUp() {
    this.showAddVendorPopUp = false;
    this.changeDetectorRef.detectChanges();
    this.showAddVendorPopUp = true;
  }
  OnNewVendorAdded($event) {
    this.showAddVendorPopUp = false;
    var newVendor = $event.vendor;
    this.VendorList.push(newVendor);
    this.VendorList.slice();
  }

  GoToNextInput(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
      nextEl.select();
    }
  }

  public GetVendorBillHistory() {
    this.vendorBillHistoryList = [];
    if (this.inventoryService.allGRBillingList && this.inventoryService.allGRBillingList.length > 0) {
      this.vendorBillHistoryList = this.inventoryService.allGRBillingList.filter(a => a.VendorId == this.goodsReceipt.VendorId);
      if (this.goodsReceipt.BillNo) { // if user writes bill no. before selecting vendor, then checking duplicate bills of that vendor
        this.CheckDuplicateBill();
      }
    }
  }

  public CheckDuplicateBill() {
    this.duplicateVendorGRBillList = [];
    if (this.goodsReceipt.BillNo && this.vendorBillHistoryList.length > 0) {
      this.vendorBillHistoryList.forEach(a => {
        if (a.BillNo == this.goodsReceipt.BillNo) {
          this.duplicateVendorGRBillList.push(a);
        }
      });
    }
  }
  public FocusOutBillNo() {
    this.CheckDuplicateBill()
  }
  VerifierListFormatter(data: any): string {
    return `${data["Name"]} (${data["Type"]})`;
  }
  ShowVerifiers() {
    if (this.goodsReceipt.IsVerificationEnabled == true) {
      this.AddVerifier();
    }
    else {
      this.goodsReceipt.VerifierList = [];
    }
  }
  AddVerifier() {
    this.goodsReceipt.VerifierList.push(new POVerifier())
  }
  DeleteVerifier(index: number) {
    this.goodsReceipt.VerifierList.splice(index, 1);
  }
  AssignVerifier($event, index) {
    if (typeof $event == "object") {
      this.goodsReceipt.VerifierList[index] = $event;
    }
  }
  CheckIfAddVerifierAllowed() {
    return this.goodsReceipt.VerifierList.some(V => V.Id == undefined) || this.goodsReceipt.VerifierList.length >= 3 || this.editGR ? true : false;
  }
  CheckIfDeleteVerifierAllowed() {
    return this.goodsReceipt.VerifierList.length <= 1 || this.editGR ? true : false;
  }

  public get IsGoodsReceiptDateValid() {
    return this.inventoryService.allFiscalYearList.some(fy => (fy.IsClosed == null || fy.IsClosed == false) && moment(this.goodsReceipt.GoodsReceiptDate).isBetween(fy.StartDate, fy.EndDate)) as Boolean;
  }
}
