import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from '../../../core/shared/core.service';
import { GoodReceiptService } from '../good-receipt.service';
import { GoodsReceipt } from '../goods-receipt.model';
import { GoodsReceiptItems } from '../goods-receipt-item.model';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { ItemMaster } from '../../../inventory/shared/item-master.model';
import { VendorMaster } from '../../../inventory/shared/vendor-master.model';
import { SecurityService } from '../../../security/shared/security.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { ENUM_GRItemCategory } from '../../../shared/shared-enums';
import { POVerifier } from '../../purchase-order/purchase-order.model';
import { ProcurementBLService } from '../../shared/procurement.bl.service';
import { FixedAssetDonationModel } from '../../../fixed-asset/shared/fixed-asset-donation-model';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-goods-receipt-add',
  templateUrl: './goods-receipt-add.component.html',
  styles: []
})
export class GoodsReceiptAddComponent implements OnInit {

  public goodsReceipt: GoodsReceipt = new GoodsReceipt();
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
  public GRItemCategories: string[] = [];
  public ItemListFiltered: any[] = [];
  public vendorBillHistoryList: any[] = [];
  public duplicateVendorGRBillList: any[] = [];
  //this controls whether to show verification part or not. controlled by core cfg settings.
  public IsVerificationActivated: boolean = true;
  public canUserEnterDate: boolean = false;
  public VerifierList: POVerifier[] = [];
  public assetDonation: Array<FixedAssetDonationModel> = new Array<FixedAssetDonationModel>();
  public IsVerificattionDonationActivated: boolean = true;
  public IsDonationMode: boolean = false;
  public selectedDonation: FixedAssetDonationModel | string;
  public showFreeQty: boolean = false;
  public showCCCharge: boolean = false;
  public showDiscount: boolean = false;
  constructor(public routeFrom: RouteFromService, public goodReceiptService: GoodReceiptService, public securityService: SecurityService, public procurementBLService: ProcurementBLService, public inventoryService: InventoryService, public changeDetectorRef: ChangeDetectorRef, public messageBoxService: MessageboxService, public coreService: CoreService, public router: Router, private _activateInventoryService: ActivateInventoryService) {

    this.disableTextBox = true;
    this.disableButton = true;
    this.LoadGRCategory();
    this.Getfixedassetldonation();
    this.SetDefaultDonationVerifier();
    this.LoadVerifiersForGR();
    this.checkGRCustomization();
  }
  private checkIfDateEntryAllowed(decidingFactorForEditMode = true) {
    //in normal scenario, if user has permission, s/he can adjusts date
    //in edit mode, no other txns should exists for that particular gr, or else date adjustment is not possible
    this.canUserEnterDate = this.securityService.HasPermission('inventory-gr-backdate-entry-button') && decidingFactorForEditMode;
  }

  ngOnInit() {
    this.goodsReceipt.GoodsArrivalDate = moment().format('YYYY-MM-DD');
    this.LoadItemList();
    //this.isRecreateOrEditMode(); put inside LoadVerifiersForPO method because of its dependency
    this.goodsReceipt.PaymentMode = "Credit";
    this.LoadVendorList(); //vendor must be loaded at last, because, in edit GR case, we may need inactive vendors as well.
    this.setautofocus();
  }
  //fxn to get the valid Item Count only after proper valid item is selected.
  public get getValidItemCount() {
    return this.goodsReceipt.GoodsReceiptItem.filter(a => a.ItemId > 0).length;
  }
  setautofocus() {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById("SupplierName");
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 900);
  }
  private CheckForEditRecreateMode() {
    if (this.inventoryService.POId > 0) { //this comes from PO LIst -> Add GR. 
      this.LoadPo(this.inventoryService.POId);
      this.isGrFromPOMode = true;
      this.inventoryService.POId = 0;//need to reset POId to zero so that other component's won't get mistaken.
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
      this.IsDonationMode = this.inventoryService.isDonation;
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
  public SetDefaultDonationVerifier() {
    var ProcurementDonationSettings = this.coreService.Parameters.find(param => param.ParameterGroupName == "Inventory" && param.ParameterName == "ProcurementDonationSettings").ParameterValue;
    var ProcurementDonationSettingsParsed = JSON.parse(ProcurementDonationSettings);
    if (ProcurementDonationSettingsParsed == false) {
      this.IsVerificattionDonationActivated = false;
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
  LoadGoodsReceiptDetails(goodsReceiptId: number) {

    if (goodsReceiptId) {
      //this.goodsreceiptID = id;
      this.procurementBLService.GetProcurementGRView(goodsReceiptId)
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

      var goodsReceiptDetail: GoodsReceipt = res.Results.grDetails;
      this.changeDetectorRef.detectChanges();
      this.goodsReceipt = Object.assign(this.goodsReceipt, goodsReceiptDetail);
      // filter items based on gr category
      //this.FilterItemByGRCategory();
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
        currGRItem.ItemId = goodsReceiptItems[i].ItemId;
        currGRItem.ItemName = goodsReceiptItems[i].ItemName;
        currGRItem.BatchNO = goodsReceiptItems[i].BatchNo;
        currGRItem.ReceivedQuantity = goodsReceiptItems[i].ReceivedQuantity;
        currGRItem.ExpiryDate = goodsReceiptItems[i].ExpiryDate;
        currGRItem.FreeQuantity = goodsReceiptItems[i].FreeQuantity;
        currGRItem.ItemRate = goodsReceiptItems[i].GRItemRate;
        currGRItem.VATAmount = goodsReceiptItems[i].VATAmount;
        currGRItem.VAT = goodsReceiptItems[i].VATPercentage;
        currGRItem.CcAmount = goodsReceiptItems[i].CcAmount;
        currGRItem.CcCharge = goodsReceiptItems[i].CcChargePercent;
        currGRItem.DiscountAmount = goodsReceiptItems[i].DiscountAmount;
        currGRItem.DiscountPercent = goodsReceiptItems[i].DiscountPercent;
        currGRItem.TotalAmount = goodsReceiptItems[i].ItemTotalAmount;
        currGRItem.OtherCharge = goodsReceiptItems[i].OtherCharge;
        currGRItem.GoodsReceiptItemId = goodsReceiptItems[i].GoodsReceiptItemId;
        currGRItem.GoodsReceiptId = goodsReceiptItems[i].GoodsReceiptId;
        currGRItem.UOMName = goodsReceiptItems[i].UOMName;
        currGRItem.GRItemSpecification = goodsReceiptItems[i].GRItemSpecification;
        currGRItem.Remarks = goodsReceiptItems[i].Remarks;
        currGRItem.ItemCategory = goodsReceiptItems[i].ItemCategory;//sud:17Sep'21--It's name is different in the GrItemsDTO (server side)
        currGRItem.StockId = goodsReceiptItems[i].StockId;
        var currItem = this.ItemList.find(i => i.ItemName == currGRItem.ItemName);
        if (currItem != undefined) {
          currGRItem.SelectedItem = currItem;
        }
        else {
          currGRItem.SelectedItem = new ItemMaster()
        }
        this.goodsReceipt.GoodsReceiptItem.push(currGRItem);
        this.FilterItemByItemCategory(i, true);//passing isEditGr=true to maintain the selected item value.
        this.goodsReceipt.GoodsReceiptItem = this.goodsReceipt.GoodsReceiptItem.slice();


      }
      this.goodsReceipt.updateItemDuplicationStatus();


      if (this.goodsReceipt.GoodsReceiptItem.length > 0) {
        this.goodsReceipt.GoodsReceiptItem.forEach(itm => {
          if (itm.ExpiryDate != null)
            itm.ExpiryDate = moment(itm.ExpiryDate).format('DD-MM-YYYY');
        });
        this.goodsReceipt.GoodsArrivalDate = moment(this.goodsReceipt.GoodsArrivalDate).format('YYYY-MM-DD');
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
    this.router.navigate(['/ProcurementMain/GoodsReceipt/GoodsReceiptList']);
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
    this.procurementBLService.GetPurchaseOrderItemsByPOId(Number(purchaseOrderId))
      .subscribe(res => this.LoadPurchaseItemsForGoodsReceipt(res));
  }
  //Load Purchase Order Items as Goods Receipt Items
  LoadPurchaseItemsForGoodsReceipt(res) {
    this.purchaseOrder = res.Results;
    this.changeDetectorRef.detectChanges();
    this.purchaseOrderId = this.purchaseOrder.PurchaseOrderId;
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
    this.goodsReceipt.updateItemDuplicationStatus();
    //this.FilterItemByGRItemCategory();
  }
  //Metho  for transform POItems to GRItems
  GetGrItemsFromPoItems() {
    for (var i = 0; i < this.purchaseOrder.PurchaseOrderItems.length; i++) {

      this.changeDetectorRef.detectChanges();
      const poItem = this.purchaseOrder.PurchaseOrderItems[i];
      var currGRItem: GoodsReceiptItems = new GoodsReceiptItems();
      currGRItem.ItemId = poItem.ItemId;
      currGRItem.ItemName = poItem.Item.ItemName;
      currGRItem.ItemCategory = poItem.ItemCategory;//sud:18Sep'21--changed for Capital/Consumables combined.
      if (poItem.VATAmount > 0) {
        const numerator = poItem.VATAmount * 100;
        const denominator = poItem.Quantity * poItem.StandardRate;
        if (denominator == null || denominator == 0) { currGRItem.VAT = 0 }
        else { currGRItem.VAT = CommonFunctions.parsePhrmAmount((numerator) / (denominator)); }
      }
      else {
        currGRItem.VAT = poItem.Item.VAT;
      }
      currGRItem.ItemRate = poItem.StandardRate;
      currGRItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      currGRItem.Quantity = poItem.PendingQuantity;
      currGRItem.ReceivedQuantity = poItem.PendingQuantity;
      currGRItem.GRItemSpecification = poItem.POItemSpecification;
      currGRItem.PoItemId = poItem.PurchaseOrderItemId;//sud:26Sep'21--needed some validations/checks when coming from PO to GR.
      currGRItem.SelectedItem = this.ItemList.find(i => i.ItemId == currGRItem.ItemId);

      this.goodsReceipt.GoodsReceiptItem.push(currGRItem);
      this.FilterItemByItemCategory(i, true);//

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
    this.GRItemCategories = Object.values(ENUM_GRItemCategory).filter(p => isNaN(p as any));
  }
  LoadItemList(): void {
    try {
      this.ItemList = this.inventoryService.allItemList;
      if (this.editGR == false) {
        this.ItemList = this.ItemList.filter(item => item.IsActive == true);
      }
      if (!this.ItemList || this.ItemList.length == 0) {
        this.messageBoxService.showMessage("warning", ['ItemList not available. Plese add some item and try again.']);
      }
    } catch (ex) {
      this.messageBoxService.showMessage("failed", ['failed to get Item.. please check log for details.']);
    }

    console.log("Total Items found:" + this.ItemList.length);
  }

  FilterItemByItemCategory(index: number = 0, isEditGr: boolean = false) {
    var selectedGRItem = this.goodsReceipt.GoodsReceiptItem[index]
    selectedGRItem.filteredItemList = this.ItemList.filter(item => item.ItemType === selectedGRItem.ItemCategory);
    selectedGRItem.filteredItemList = selectedGRItem.filteredItemList.slice();

    //if coming from Edit Goods Receipt then we shouldn't reset the current selected Item.//Sud:17Sep'21
    if (!isEditGr) {
      selectedGRItem.SelectedItem = new ItemMaster();
      selectedGRItem.ItemId = null;
      selectedGRItem.ItemName = "";
      selectedGRItem.GoodsReceiptItemValidator.get("ItemId").setValue("");
    }
  }

  //sud:20Sept--We need Itemlist in row level now, hence making common function to get the list.
  GetItemListByItemCategory(itmCategory: string) {
    let retItemList = this.ItemList.filter(item => item.ItemType === itmCategory);
    return retItemList;
  }



  OnGRCategoryChange(index: number = 0) {
    this.FilterItemByItemCategory(index);
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
        this.goodsReceipt.GoodsReceiptItem[index].VAT = (Item.VAT) ? Item.VAT : 0;
      this.goodsReceipt.GoodsReceiptItem[index].itemPriceHistory = this.inventoryService.allItemPriceList
        .filter((item) => item.ItemId == Item.ItemId)
        .filter((u, i) => i < 3); //taking top 3
    }
    this.goodsReceipt.updateItemDuplicationStatus();
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
      this.goodsReceipt.CreditPeriod = (selVendorObj.CreditPeriod != null) ? selVendorObj.CreditPeriod : 0;
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

      let Discount = item.DiscountPercent / 100;
      let DiscountAmount = (Discount * subtotal);

      item.DiscountAmount = DiscountAmount;
      let totalAmount = subtotal - DiscountAmount;

      if (this.TDSApplicable) {
        let totalwithTDS = subtotal - DiscountAmount;
        let TDSAmount = totalAmount * (this.goodsReceipt.TDSRate / 100);
        totalwithTDS = totalwithTDS - TDSAmount;

        let Vat1 = item.VAT / 100;
        let vatAmount1 = totalAmount * Vat1;
        totalwithTDS = totalwithTDS + vatAmount1;

        this.goodsReceipt.TotalWithTDS += totalwithTDS;
        this.goodsReceipt.TDSAmount += TDSAmount;
      }

      let CcCharge = item.CcCharge / 100;
      let CcAmount = totalAmount * CcCharge;

      item.CcAmount = CcAmount;

      totalAmount = totalAmount + CcAmount;

      item.VAT = (item.VAT == null) ? 0 : item.VAT;
      let Vat = item.VAT / 100;
      let vatAmount = totalAmount * Vat;

      item.VATAmount = vatAmount;

      item.SubTotal = subtotal;

      totalAmount = totalAmount + vatAmount + item.OtherCharge;


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
    var goodItem = new GoodsReceiptItems();
    goodItem.ItemCategory = ENUM_GRItemCategory.Consumables;
    this.goodsReceipt.GoodsReceiptItem.push(goodItem);
    let len = this.goodsReceipt.GoodsReceiptItem.length - 1;
    this.FilterItemByItemCategory(len);
  }

  //to delete the row
  DeleteRow(index) {
    //to stop rowCount value going negative
    if (this.rowCount > 0) {
      this.rowCount--;
    }

    //this will remove the data from the array
    this.goodsReceipt.GoodsReceiptItem.splice(index, 1);

    if (index == 0 && this.goodsReceipt.GoodsReceiptItem.length == 0) {
      this.AddRowRequest();
      this.GoToNextInput("itemName0", 300);
      this.Calculations();
      this.changeDetectorRef.detectChanges();

    }
    else {
      this.Calculations();
      this.changeDetectorRef.detectChanges();
    }
  }
  // }
  //Save data to database
  SaveGoodsReceipt() {
    if (this.editGR) { this.isGrFromPOMode = false };
    if (this.goodsReceipt != null) {
      let validationObj = this.CheckValidation();
      this.goodsReceipt.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.goodsReceipt.CreatedOn = moment().format('YYYY-MM-DD');
      this.goodsReceipt.GRStatus = this.goodsReceipt.IsVerificationEnabled ? "pending" : "verified";
      this.goodsReceipt.VendorBillDate = moment(this.goodsReceipt.VendorBillDate).format('YYYY-MM-DD') + 'T' + moment().format('HH:mm:ss.SSS');
      this.goodsReceipt.GoodsReceiptDate = moment(this.goodsReceipt.GoodsReceiptDate).format('YYYY-MM-DD') + 'T' + moment().format('HH:mm:ss.SSS');
      this.goodsReceipt.GoodsArrivalDate = this.goodsReceipt.GoodsReceiptDate;
      this.goodsReceipt.IsDonation = this.inventoryService.isDonation;
      if (validationObj.isValid) {

        for (let index = 0; index < this.goodsReceipt.GoodsReceiptItem.length; index++) {
          this.goodsReceipt.GoodsReceiptItem[index].CreatedOn = moment().format('YYYY-MM-DD');
          if (this.goodsReceipt.GoodsReceiptItem[index].ReceivedQuantity == 0) {
            this.goodsReceipt.GoodsReceiptItem.splice(index, 1);
            index--;
          }
        }

        if (!this._activateInventoryService.activeInventory.StoreId) {
          this.messageBoxService.showMessage("Alert!", ["Cannot find StoreId. Please select Inventory First"])
          return;
        } else {
          this.goodsReceipt.StoreId = this._activateInventoryService.activeInventory.StoreId;
          this.goodsReceipt.GRGroupId = this._activateInventoryService.activeInventory.INV_GRGroupId;
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
                  this.messageBoxService.showMessage("failed", ["failed to add result.. please check log for details.", res.ErrorMessage]);
                }
              },
              err => {
                console.log(err.error.ErrorMessage);
              });
        }
      }
      else {
        this.loading = false;
        this.messageBoxService.showMessage("Failed", validationObj.messageArr);
      }
    }
    else {
      this.loading = false;
      this.messageBoxService.showMessage("Notice-message", ["Add Item ...Before Requesting"]);
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
        if (this.IsVerificattionDonationActivated == true && this.IsDonationMode == true) {
          item.GoodsReceiptItemValidator.get('ItemRate').clearValidators();

        }
        item.GoodsReceiptItemValidator.controls[b].markAsDirty();
        item.GoodsReceiptItemValidator.controls[b].updateValueAndValidity();
      }
      if (item.IsValidCheck(undefined, undefined) == false) {
        validationObj.isValid = false;
        validationObj.messageArr.push("Please fill required item fields.");
      }
    });

    return validationObj;
  }

  UpdateGoodsReceipt() {
    this.goodsReceipt.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
    this.goodsReceipt.ModifiedOn = new Date();
    this.goodsReceipt.GoodsReceiptItem.map(a => {
      a.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      a.ModifiedOn = new Date();
      a.ArrivalQuantity = a.ReceivedQuantity;
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
  RouteToViewDetails(grId: number) {
    this.inventoryService.GoodsReceiptId = grId;//sud:3Mar'20-Property Rename in InventoryService
    this.inventoryService.POId = null;
    this.isGrFromPOMode = false;
    this.router.navigate(['/ProcurementMain/GoodsReceipt/GoodsReceiptView']);
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
    //console.log("Total Items found after item added:" + this.ItemList.length);
    ///this.FilterItemByItemCategory();
    let currentGRItem = new GoodsReceiptItems();
    currentGRItem.ReceivedQuantity = 1;
    this.goodsReceipt.GoodsReceiptItem.splice(this.index, 1, currentGRItem);

    this.goodsReceipt.GoodsReceiptItem[this.index].ItemCategory = item.ItemType;
    //sud:20Sep'21---ReAssign the ItemList filtered to current GrItem object..
    this.goodsReceipt.GoodsReceiptItem[this.index].filteredItemList = this.GetItemListByItemCategory(item.ItemType);
    this.goodsReceipt.GoodsReceiptItem[this.index].filteredItemList = this.goodsReceipt.GoodsReceiptItem[this.index].filteredItemList.slice();//update the source-array of Searchbox.
    this.goodsReceipt.GoodsReceiptItem[this.index].ItemId = item.ItemId;
    this.goodsReceipt.GoodsReceiptItem[this.index].SelectedItem = item;
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
    this.selectedVendor = newVendor.VendorName;
    this.goodsReceipt.VendorId = newVendor.VendorId;
    this.goodsReceipt.VendorName = newVendor.VendorName;
    this.goodsReceipt.CreditPeriod = (newVendor.CreditPeriod != null) ? newVendor.CreditPeriod : 0;
    this.TDSApplicable = newVendor.IsTDSApplicable;
    this.GoToNextInput('BillNo')
  }

  GoToNextInput(idToSelect: string, waitingTimeinms: number = 0) {
    var timer = window.setTimeout(() => {
      if (document.getElementById(idToSelect)) {
        let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
        nextEl.focus();
        nextEl.select();
      }
      clearTimeout(timer);
    }, waitingTimeinms);
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
      // if billNo matches with previous bills, and
      // in case of edit mode, if the goodsreceiptno is different, then
      // declare the bill as duplicate bill
      this.duplicateVendorGRBillList = this.vendorBillHistoryList.filter(a => a.BillNo == this.goodsReceipt.BillNo && (this.editGR == true && a.GoodsReceiptNo != a.GoodsReceiptNo));
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

  myDonationListFormatter(data: any): string {
    let html = data["Donation"];
    return html;
  }

  Getfixedassetldonation() {
    this.procurementBLService.GetFixedAssetDonationList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.assetDonation = res.Results;


        }
        else {
          this.messageBoxService.showMessage("error", ["Failed to get FixedAsset DonationList. " + res.ErrorMessage]);
        }
      },
        err => {
          this.messageBoxService.showMessage("error", ["Failed to get FixedAsset DonationList. " + err.ErrorMessage]);
        });
  }

  SelectDonationFromSearchBox() {
    let selDonationObj: FixedAssetDonationModel = null;
    if (typeof (this.selectedDonation) == 'string' && this.assetDonation.length) {
      selDonationObj = this.assetDonation.find(d => d.Donation == this.selectedDonation);
    }
    else if (typeof (this.selectedDonation) == 'object') {
      selDonationObj = this.selectedDonation;
    }

    if (selDonationObj) {
      this.goodsReceipt.DonationId = selDonationObj.DonationId;

    }
  }

  OnPressedEnterKeyInItemField(index: number) {
    if (this.goodsReceipt.GoodsReceiptItem[index].ItemId > 0) {
      this.GoToNextInput('qtyip' + index);
    }
    else {
      if (this.goodsReceipt.GoodsReceiptItem.length > 1) {
        this.goodsReceipt.GoodsReceiptItem.pop();
      }
      else {
        this.GoToNextInput('itemName' + index)
      }
      //this.currentPO.PHRMPurchaseOrderItems.pop();
      let isDataValid = this.goodsReceipt.GoodsReceiptItem.every(a => a.GoodsReceiptItemValidator.valid == true);
      if (isDataValid) {
        this.GoToNextInput("SaveGoodsReceiptbtn");
      }
    }
  }
  onPressedEnterKeyInRateField(index: number) {
    // if enter key is pressed in the last row, then add new row and move the focus to new row's itemname
    if (index == (this.goodsReceipt.GoodsReceiptItem.length - 1)) {
      this.AddRowRequest();
    }
    this.GoToNextInput(`itemName${index + 1}`, 300);
  }
  checkGRCustomization() {
    let GRParameterStr = this.coreService.Parameters.find(p => p.ParameterName == "GRFormCustomization" && p.ParameterGroupName == "Procurement");
    if (GRParameterStr != null) {
      let GRParameter = JSON.parse(GRParameterStr.ParameterValue);
      if (GRParameter.showFreeQuantity == true) {
        this.showFreeQty = true;
      }
      if (GRParameter.showCCCharge == true) {
        this.showCCCharge = true;
      }
      if (GRParameter.showDiscount == true) {
        this.showDiscount = true;
      }
    }
  }
}
