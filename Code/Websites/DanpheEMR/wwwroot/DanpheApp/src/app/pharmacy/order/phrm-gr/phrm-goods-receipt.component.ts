import { ChangeDetectorRef, Component, EventEmitter, Output, ViewChild, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import * as _ from 'lodash';
import * as moment from "moment/moment";
import { CoreService } from '../../../core/shared/core.service';
import { DispensaryService } from "../../../dispensary/shared/dispensary.service";
import { PHRMPackingTypeModel } from '../../../pharmacy/shared/phrm-packing-type.model';
import { SecurityService } from "../../../security/shared/security.service";
import { CallbackService } from '../../../shared/callback.service';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_BillPaymentMode, ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { PharmacyItem_DTO } from "../../shared/dtos/pharmacy-item.dto";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { PharmacyService } from "../../shared/pharmacy.service";
import { PHRMCompanyModel } from "../../shared/phrm-company.model";
import { PHRMGenericModel } from "../../shared/phrm-generic.model";
import { PHRMGoodsReceiptItemsModel } from "../../shared/phrm-goods-receipt-items.model";
import { PHRMGoodsReceiptViewModel } from "../../shared/phrm-goods-receipt-vm.model";
import { PHRMGoodsReceiptModel } from "../../shared/phrm-goods-receipt.model";
import { PHRMPurchaseOrderItems } from "../../shared/phrm-purchase-order-items.model";
import { PHRMStoreModel } from '../../shared/phrm-store.model';
import { PHRMSupplierModel } from "../../shared/phrm-supplier.model";
import { PHRMGoodsReceiptItemComponent, updateCalculationsForGrItem } from "../phrm-gr-item/phrm-gr-item.component";

@Component({
  selector: "phrm-goods-receipt",
  templateUrl: "./phrm-goods-receipt.html",
  styleUrls: ["./phrm-goods-receipt.css"],
  encapsulation: ViewEncapsulation.None,
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PHRMGoodsReceiptComponent {
  @ViewChild('grItemPop')
  phrmGoodReceiptItemComponent: PHRMGoodsReceiptItemComponent;

  ///view model for binding
  goodsReceiptVM: PHRMGoodsReceiptViewModel = new PHRMGoodsReceiptViewModel();
  tempgoodsReceiptVM: PHRMGoodsReceiptViewModel = new PHRMGoodsReceiptViewModel();
  goodReceiptItems: PHRMGoodsReceiptItemsModel = new PHRMGoodsReceiptItemsModel();
  ///local list variable to get list of PO data and Push into GRList
  grItemList: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
  ///local varible to bind supplier data
  currentSupplier: PHRMSupplierModel = new PHRMSupplierModel();
  supplierList: Array<PHRMSupplierModel> = new Array<PHRMSupplierModel>();

  ///local varible to bind company data
  currentCompany: Array<PHRMCompanyModel> = new Array<PHRMCompanyModel>();
  PurchaseOrderNo: number = 0;
  SupplierName: string = null;
  //declare boolean loading variable for disable the double click event of button
  loading: boolean = false;
  //for Item Popup purpose
  index: number = 0;
  showAddItemPopUp: boolean = false;
  //for Supplier Popup purpose
  showAddSupplierPopUp: boolean;
  //flag for disable or enable some text boxes order
  IsPOorder: boolean = false;
  IsGRedit: boolean = false;
  showAddGRPage: boolean = false;
  showUpdateGRPage: boolean = false;
  update: boolean = false;
  goodreceipt: PHRMGoodsReceiptModel;
  //for editing gr and checking duplication
  oldSupplierId: any;
  oldInvoiceNo: any;
  duplicateInvoice: boolean = false;
  //get all is active item list for create new gr
  itemList: Array<PharmacyItem_DTO> = new Array<PharmacyItem_DTO>();
  taxList: Array<any>;
  taxData: Array<any> = [];
  currentCounter: number = null;
  itemLst: Array<any> = [];
  goodsReceiptList: Array<PHRMGoodsReceiptModel> = new Array<PHRMGoodsReceiptModel>();
  //@ViewChild('addItems')
  //addItems: phrmitemaddComponent;
  storeList: PHRMStoreModel;
  currentStore: any;
  tempStore: any;
  //for show and hide packing features
  IsPkgitem: boolean = false;
  //for show and hide item level discount features
  isItemLevelDiscountApplicable: boolean = false;
  //Show and hide Dispensary Option
  ShowDispensary: boolean = false;
  pcktypeList: any;
  packingtypeList: Array<PHRMPackingTypeModel> = new Array<PHRMPackingTypeModel>();
  idList: Array<any> = [];
  IsGReditAfterModification: boolean = false;
  dispensaryList: Array<any> = [];
  selectedDispensary: any = null;
  goodReceiptHistory: Array<any> = [];
  CheckIsValid: boolean = true;
  isExpiryNotApplicable: boolean = false;
  ExpiryAfter: number = 0;
  //for keep/change cccharge value at edite gritem.
  itemid: number = 0;
  IsStripRateEdit: boolean = false;
  fiscalYearList: Array<any> = new Array<any>();
  showFreeQty: boolean = false;
  showCCCharge: boolean = false;
  showNepaliReceipt: boolean;
  goodsReceiptIdForPrint: number;
  showGRReceipt: boolean;
  isMainDiscountApplicable: boolean;
  checkCreditPeriod: boolean = false;
  genericList: PHRMGenericModel[] = [];
  @Output('call-back-popup-close') callBackPopupClose: EventEmitter<Object> = new EventEmitter<Object>();
  constructor(public dispensaryService: DispensaryService,
    public pharmacyService: PharmacyService,
    public coreService: CoreService,
    public pharmacyBLService: PharmacyBLService,
    public securityService: SecurityService,
    public msgserv: MessageboxService,
    public router: Router,
    public callBackService: CallbackService,
    public changeDetectorRef: ChangeDetectorRef
  ) {
    //this.currentCounter = this.securityService.getPHRMLoggedInCounter().CounterId;
    this.GetAllFiscalYears();
    this.supplierList = new Array<PHRMSupplierModel>(); //make empty supllier
    this.currentSupplier = new PHRMSupplierModel();
    this.itemList = new Array<PharmacyItem_DTO>();
    this.GetAllItemData();
    this.getGenericList();
    this.GetSupplierList();
    this.goodsReceiptVM.goodReceipt.GoodReceiptDate = moment().format("YYYY-MM-DD");


    this.getGoodsReceiptList();
    this.getMainStore();
    this.GetDispensaryList();
    this.LoadGoodReceiptHistory();
    this.GetPackingTypeList();
    this.showitemlvldiscount();
    this.showpacking();
    this.checkGRCustomization();
  }


  ngOnInit() {
  }
  // for show and hide packing feature
  showpacking() {
    this.IsPkgitem = true;
    let pkg = this.coreService.Parameters.find((p) => p.ParameterName == "PharmacyGRpacking" && p.ParameterGroupName == "Pharmacy").ParameterValue;
    if (pkg == "true") {
      this.IsPkgitem = true;
    } else {
      this.IsPkgitem = false;
      //this.goodReceiptItem.GoodReceiptItemValidator.controls["PackingQuantity"].disable();
    }
  }
  // for Free Qty and CC Charge Paramaters.
  checkGRCustomization() {
    let GRParameterStr = this.coreService.Parameters.find(p => p.ParameterName == "GRFormCustomization" && p.ParameterGroupName == "Pharmacy");
    if (GRParameterStr != null) {
      let GRParameter = JSON.parse(GRParameterStr.ParameterValue);
      if (GRParameter.showFreeQuantity == true) {
        this.showFreeQty = true;
      }
      if (GRParameter.showCCCharge == true) {
        this.showCCCharge = true;
      }
    }
    //check for english or nepali receipt style
    let receipt = this.coreService.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
    this.showNepaliReceipt = (receipt == "true");
  }

  private CheckForPoOrGrEditMode() {
    if (this.pharmacyService.Id > 0) {
      this.Load(this.pharmacyService.Id);
    }
    else if (this.pharmacyService.GRId > 0) {
      this.IsGRedit = true;
      this.IsPOorder = false;
      this.LoadGR(this.pharmacyService.GRId);
      this.pharmacyService.GRId = null;
    }
    else {
      this.IsPOorder = false;
      this.IsGRedit = false;
    }
  }

  ngOnDestroy() {
    this.pharmacyService.Id = null;
  }

  //this function load all packing type  list
  public GetPackingTypeList() {
    this.pharmacyBLService.GetPackingTypeList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.packingtypeList = res.Results;

        }
        else {
          alert("Failed ! " + res.ErrorMessage);
          console.log(res.ErrorMessage)
        }
      });
  }

  //this fuction load all item for GR
  GetAllItemData() {
    try {
      this.pharmacyBLService.GetPharmacyItems().finally(() => {
        this.CheckForPoOrGrEditMode();
      })
        .subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.itemList = res.Results;
              this.itemLst = this.itemList;
            } else {
              console.log(res.ErrorMessage);
              this.msgserv.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to get item list, see detail in console log"]);
            }
          },
          (err) => {
            console.log(err.ErrorMessage);
            this.msgserv.showMessage(ENUM_MessageBox_Status.Error, ["Failed to get item list., see detail in console log"]);
          }
        );
    } catch (exception) {
      console.log(exception);
      this.msgserv.showMessage(ENUM_MessageBox_Status.Error, ["error details see in console log"]);
    }
  }

  AddGRItemPopUp(i?) {
    this.showAddGRPage = false;
    this.index = i;
    this.update = false;
    this.changeDetectorRef.detectChanges();
    this.showAddGRPage = true;
  }
  OnPopupClose($event) {
    if ($event == true) {
      this.showUpdateGRPage = false;
      this.showAddGRPage = false;
      let newIndex = this.phrmGoodReceiptItemComponent.goodReceiptItem.IndexOnEdit + 1;
      if (this.IsPOorder && newIndex < this.grItemList.length)
        this.SetFocusById("editButton" + newIndex);
      else
        this.SetFocusById('btn_AddNew');
    }

  }
  Close() {
    this.showAddGRPage = false;
  }

  EditRow(i: number) {
    //ramesh: 24thOct :disable the Edit btn if the Stock ie Item is already altered ie transfered, dispatched or post to accounting.
    if (this.goodsReceiptVM.goodReceipt.IsTransferredToACC == true || this.grItemList[i].IsItemAltered == true) {
      this.update = false;
      this.showUpdateGRPage = false;
      this.msgserv.showMessage("notice-message", ["Can not edit the record as this Stock is already altered or post to accounting."])
    }
    else {
      this.update = true;
      this.showUpdateGRPage = true;
      this.changeDetectorRef.detectChanges();
      this.phrmGoodReceiptItemComponent.IsPOorder = this.IsPOorder;
      if (this.IsPOorder || (this.IsGRedit && this.goodsReceiptVM.goodReceipt.PurchaseOrderId != null)) {
        this.phrmGoodReceiptItemComponent.showPendingQty = true;
      }
      this.phrmGoodReceiptItemComponent.goodReceiptItem = _.cloneDeep(this.grItemList[i]);
      this.phrmGoodReceiptItemComponent.goodReceiptItem.IndexOnEdit = i;
      this.phrmGoodReceiptItemComponent.selectedGeneneric = this.genericList.find(a => a.GenericId === this.grItemList[i].GenericId);
      this.phrmGoodReceiptItemComponent.GRItemPrice = this.grItemList[i].GRItemPrice;
      this.phrmGoodReceiptItemComponent.VATPercentage = this.grItemList[i].VATPercentage;
      this.phrmGoodReceiptItemComponent.ItemQty = this.grItemList[i].ItemQTy;
      this.phrmGoodReceiptItemComponent.goodReceiptItem.ItemQTy = this.grItemList[i].ItemQTy;
      this.phrmGoodReceiptItemComponent.goodReceiptItem.FreeQuantity = this.grItemList[i].FreeQuantity;
      this.phrmGoodReceiptItemComponent.goodReceiptItem.Packing = this.grItemList[i].Packing;
      this.phrmGoodReceiptItemComponent.goodReceiptItem.CCCharge = this.grItemList[i].CCCharge;
      this.phrmGoodReceiptItemComponent.goodReceiptItem.CCAmount = this.grItemList[i].CCAmount;
      this.phrmGoodReceiptItemComponent.goodReceiptItem.SalePrice = this.grItemList[i].SalePrice;
      this.phrmGoodReceiptItemComponent.goodReceiptItem.PendingQuantity = this.grItemList[i].PendingQuantity;

      this.phrmGoodReceiptItemComponent.goodReceiptItem.MRP = this.grItemList[i].MRP;
      if (!this.IsPOorder) {
        this.phrmGoodReceiptItemComponent.goodReceiptItem.SelectedItem = this.itemList.find(a => a.ItemId === this.grItemList[i].ItemId).ItemName;
      }
      else {
        this.phrmGoodReceiptItemComponent.goodReceiptItem.GoodReceiptItemValidator.get("ItemName").setErrors(null);
        this.phrmGoodReceiptItemComponent.goodReceiptItem.SelectedItem = this.itemList.find(a => a.ItemId === this.grItemList[i].ItemId).ItemName;
      }
      this.phrmGoodReceiptItemComponent.goodReceiptItem.GoodReceiptItemValidator.get("ItemName").setValue(this.grItemList[i].ItemName);
      this.phrmGoodReceiptItemComponent.goodReceiptItem.GoodReceiptItemValidator.get("ExpiryDate").setValue((moment().add(1, 'years')).format("YYYY-MM")); //By default expiry date will be 1 year from now.
      this.phrmGoodReceiptItemComponent.goodReceiptItem.GoodReceiptItemValidator.get("ItemQTy").setValue(this.grItemList[i].ItemQTy);
      this.phrmGoodReceiptItemComponent.goodReceiptItem.GoodReceiptItemValidator.get("AdjustedMargin").setValue(this.grItemList[i].AdjustedMargin);
      this.phrmGoodReceiptItemComponent.goodReceiptItem.GoodReceiptItemValidator.get("FreeQuantity").setValue(this.grItemList[i].FreeQuantity);
      this.phrmGoodReceiptItemComponent.goodReceiptItem.GoodReceiptItemValidator.get("CCCharge").setValue(this.grItemList[i].CCCharge);
      this.phrmGoodReceiptItemComponent.goodReceiptItem.GoodReceiptItemValidator.get("CCCharge").setValue(this.grItemList[i].CCCharge);
      this.phrmGoodReceiptItemComponent.goodReceiptItem.GoodReceiptItemValidator.get("DiscountPercentage").setValue(this.grItemList[i].DiscountPercentage);
      this.phrmGoodReceiptItemComponent.goodReceiptItem.GoodReceiptItemValidator.get("VATPercentage").setValue(this.grItemList[i].VATPercentage);
      this.phrmGoodReceiptItemComponent.update = true;
      this.changeDetectorRef.detectChanges();
      this.phrmGoodReceiptItemComponent.ngOnInit();
    }
  }
  //this function load all suppliers details
  GetSupplierList() {
    this.loading = true;
    try {
      this.pharmacyBLService.GetSupplierList().finally(() => { this.loading = false; }).subscribe(
        (res) => {
          if (res.Status == "OK") {
            this.supplierList = res.Results;
            this.SetFocusById("SupplierName");
          } else {
            this.msgserv.showMessage("failed", [
              "Failed to get supplier list." + res.ErrorMessage,
            ]);
          }
        },
        (err) => {
          this.msgserv.showMessage("error", [
            "Failed to get supplier list." + err.ErrorMessage,
          ]);
        }
      );
    } catch (exception) {
      this.loading = false;
      console.log(exception);
      this.msgserv.showMessage("error", ["error details see in console log"]);
    }
  }

  CallBackUpdateGRItem(grItemToUpdate: PHRMGoodsReceiptItemsModel) {
    //let grItemToupdateInList = this.grItemList.find(x => x.ItemId === grItemToUpdate.ItemId);
    this.grItemList = this.grItemList.map((x, index) => {
      if (index === grItemToUpdate.IndexOnEdit) {
        x = grItemToUpdate;
      }
      return x;
    });

    this.CalculationForPHRMGoodsReceipt(null);
  }
  ///function to load all PO Items By passing purchaseOrderId
  Load(PurchaseOrderId) {
    if (PurchaseOrderId == null) {
      this.IsPOorder = false;
    } else {
      this.pharmacyBLService.GetPHRMPOItemsForGR(PurchaseOrderId).subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results !== null) {
            this.IsPOorder = true;
            this.SetFocusById("InvoiceId");
            this.goodsReceiptVM.purchaseOrder = res.Results.OrderForGR;
            this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems = res.Results.OrderItemsForGr;
            // this.goodsReceiptVM.goodReceipt = Object.assign(new PHRMGoodsReceiptModel(), res.Results.OrderForGR);
            //this.goodsReceiptVM.goodReceipt.TransactionType = ENUM_BillPaymentMode.credit
            this.currentSupplier = this.supplierList.find(r => r.SupplierId === res.Results.OrderForGR.SupplierId);
            this.PurchaseOrderNo = res.Results.OrderForGR.PurchaseOrderNo;
            this.grItemList = res.Results.OrderItemsForGr.map((item) => {
              let orderItem = Object.assign(new PHRMGoodsReceiptItemsModel(), item);
              orderItem.SalePrice = item.SalePrice;
              orderItem.GRItemPrice = item.SalePrice;
              orderItem.ExpiryDate = (moment().add(1, 'years')).format("YYYY-MM") //By default expiry date will be 1 year from now.
              orderItem.MRP = item.SalePrice;
              orderItem.AdjustedMargin = 0;
              orderItem.SellingPrice = 0;
              orderItem.ReceivedQuantity = item.ReceivedQuantity;
              orderItem.PendingQuantity = orderItem.ReceivedQuantity > 0 ? orderItem.Quantity - orderItem.ReceivedQuantity : orderItem.PendingQuantity;
              orderItem.ItemQTy = item.PendingQuantity;
              orderItem.FreeQuantity = item.PendingFreeQuantity;
              orderItem.CCCharge = item.CCChargePercentage;
              orderItem.FreeGoodsAmount = CommonFunctions.parseAmount(orderItem.FreeQuantity * item.SalePrice, 4);
              orderItem.SubTotal = CommonFunctions.parseAmount(orderItem.PendingQuantity * item.SalePrice, 4);
              orderItem.DiscountPercentage = item.DiscountPercentage;
              orderItem.DiscountAmount = CommonFunctions.parseAmount(orderItem.SubTotal * orderItem.DiscountPercentage / 100, 4);
              orderItem.VATPercentage = item.VATPercentage;
              orderItem.VATAmount = CommonFunctions.parseAmount((orderItem.SubTotal - orderItem.DiscountAmount) * orderItem.VATPercentage / 100, 4);
              orderItem.CCAmount = CommonFunctions.parseAmount(orderItem.FreeGoodsAmount * orderItem.CCCharge / 100, 4);
              orderItem.TotalAmount = CommonFunctions.parseAmount(orderItem.SubTotal - orderItem.DiscountAmount + orderItem.VATAmount + orderItem.CCAmount, 4);
              return orderItem;
            });
            this.goodsReceiptVM.goodReceipt.TransactionType = ENUM_BillPaymentMode.credit;
            this.goodsReceiptVM.goodReceipt.PurchaseOrderId = res.Results.OrderForGR.PurchaseOrderId;
            this.goodsReceiptVM.goodReceipt.SubTotal = CommonFunctions.parseAmount(this.grItemList.reduce((a, b) => a + b.SubTotal, 0), 4);
            this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parseAmount(this.grItemList.reduce((a, b) => a + b.DiscountAmount, 0), 4);
            this.goodsReceiptVM.goodReceipt.DiscountPercentage = CommonFunctions.parseAmount((this.goodsReceiptVM.goodReceipt.DiscountAmount / this.goodsReceiptVM.goodReceipt.SubTotal) * 100, 4);
            this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parseAmount(this.grItemList.reduce((a, b) => a + b.VATAmount, 0), 4);
            this.goodsReceiptVM.goodReceipt.VATPercentage = CommonFunctions.parseAmount(this.goodsReceiptVM.goodReceipt.VATAmount / (this.goodsReceiptVM.goodReceipt.SubTotal - this.goodsReceiptVM.goodReceipt.DiscountAmount), 4);
            this.goodsReceiptVM.goodReceipt.CCAmount = CommonFunctions.parseAmount(this.grItemList.reduce((a, b) => a + b.CCAmount, 0), 4);
            this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parseAmount(this.goodsReceiptVM.goodReceipt.SubTotal - this.goodsReceiptVM.goodReceipt.DiscountAmount + this.goodsReceiptVM.goodReceipt.VATAmount + this.goodsReceiptVM.goodReceipt.CCAmount, 4);


          } else {
            this.msgserv.showMessage("failed", [
              "Failed to get OrderList." + res.ErrorMessage,
            ]);
          }
        },
        (err) => {
          this.msgserv.showMessage("error", [
            "Failed to get OrderList." + err.ErrorMessage,
          ]);
        }
      );
    }
  }
  private UpdatePackingSettingForItem(grItemToUpdate: PHRMGoodsReceiptItemsModel) {
    if (this.packingtypeList != null && this.packingtypeList.length > 0 && grItemToUpdate.SelectedItem.PackingTypeId != null) {
      var selectedItemPackingType = this.packingtypeList.find(a => a.PackingTypeId == grItemToUpdate.SelectedItem.PackingTypeId);
      if (selectedItemPackingType != null) {
        grItemToUpdate.PackingName = selectedItemPackingType.PackingName + "\n" + "(" + selectedItemPackingType.PackingQuantity + ")";
        grItemToUpdate.PackingQty = selectedItemPackingType.PackingQuantity;
        grItemToUpdate.ItemQTy = grItemToUpdate.ReceivedQuantity / grItemToUpdate.PackingQty;

      }
    }
    else {
      grItemToUpdate.PackingName = "N/A";
      //grItemToUpdate.ItemQTy = grItemToUpdate.ReceivedQuantity;
      grItemToUpdate.GoodReceiptItemValidator.updateValueAndValidity();
    }
  }

  LoadGR(GoodReceiptId) {
    if (GoodReceiptId == null) {
      this.IsGRedit = true;
    } else {
      this.pharmacyBLService
        .GetGRItemsForEdit(GoodReceiptId)
        .subscribe((res) => {
          if (res.Status == "OK" && res.Results) {
            this.IsGRedit = true;
            this.goodsReceiptVM.goodReceipt.GoodReceiptId = res.Results.GoodReceiptId;
            this.goodsReceiptVM.goodReceipt.GoodReceiptPrintId = res.Results.GoodReceiptPrintId;
            this.goodsReceiptVM.goodReceipt.PurchaseOrderId = res.Results.PurchaseOrderId;
            this.goodsReceiptVM.goodReceipt.InvoiceNo = res.Results.InvoiceNo;
            this.goodsReceiptVM.goodReceipt.GoodReceiptDate = moment(res.Results.GoodReceiptDate).format('MM-DD-YYYY');
            this.goodsReceiptVM.goodReceipt.SupplierId = res.Results.SupplierId;
            this.oldInvoiceNo = res.Results.InvoiceNo;
            this.oldSupplierId = res.Results.SupplierId; //for duplication check
            this.currentSupplier = this.supplierList.find((a) => a.SupplierId == res.Results.SupplierId);
            this.goodsReceiptVM.goodReceipt.SubTotal = res.Results.SubTotal;
            this.goodsReceiptVM.goodReceipt.DiscountPercentage = res.Results.DiscountPercentage;
            this.goodsReceiptVM.goodReceipt.DiscountAmount = res.Results.DiscountAmount;
            this.goodsReceiptVM.goodReceipt.TotalAmount = res.Results.TotalAmount;
            this.goodsReceiptVM.goodReceipt.TaxableSubTotal = this.goodsReceiptVM.goodReceipt.SubTotal - this.goodsReceiptVM.goodReceipt.DiscountAmount;
            this.goodsReceiptVM.goodReceipt.NonTaxableSubTotal = this.goodsReceiptVM.goodReceipt.DiscountAmount;
            this.goodsReceiptVM.goodReceipt.Remarks = res.Results.Remarks;
            //this.goodsReceiptVM.goodReceipt.Adjustment = res.Results.Adjustment;
            this.goodsReceiptVM.goodReceipt.CreatedBy = res.Results.CreatedBy;
            this.goodsReceiptVM.goodReceipt.CreatedOn = res.Results.CreatedOn;
            this.goodsReceiptVM.goodReceipt.VATAmount = res.Results.VATAmount;
            this.goodsReceiptVM.goodReceipt.VATPercentage = res.Results.VATPercentage;
            this.goodsReceiptVM.goodReceipt.CCAmount = res.Results.CCAmount;
            this.goodsReceiptVM.goodReceipt.IsCancel = res.Results.IsCancel;
            this.goodsReceiptVM.goodReceipt.IsTransferredToACC = res.Results.IsTransferredToACC;
            this.goodsReceiptVM.goodReceipt.TransactionType = res.Results.TransactionType;
            this.goodsReceiptVM.goodReceipt.StoreId = res.Results.StoreId;
            this.goodsReceiptVM.goodReceipt.CreditPeriod = res.Results.CreditPeriod;
            this.goodsReceiptVM.goodReceipt.StoreName = res.Results.StoreName;
            this.goodsReceiptVM.goodReceipt.IsPacking = res.Results.IsPacking;
            this.goodsReceiptVM.goodReceipt.IsItemDiscountApplicable = res.Results.IsItemDiscountApplicable;
            this.tempStore = this.storeList;
            this.AssignStore();
            var goodsReceiptItems: Array<any> = res.Results.GoodReceiptItem;
            //this.changeDetectorRef.detectChanges();
            for (let i = 0; i < goodsReceiptItems.length; i++) {
              //this.changeDetectorRef.detectChanges();
              var currGRItem: PHRMGoodsReceiptItemsModel = new PHRMGoodsReceiptItemsModel();
              currGRItem.GoodReceiptItemId = goodsReceiptItems[i].GoodReceiptItemId;
              currGRItem.GoodReceiptId = goodsReceiptItems[i].GoodReceiptId;
              currGRItem.CompanyName = goodsReceiptItems[i].CompanyName;
              currGRItem.SupplierName = goodsReceiptItems[i].SupplierName;
              currGRItem.ItemName = goodsReceiptItems[i].ItemName;
              currGRItem.ItemId = goodsReceiptItems[i].ItemId;
              currGRItem.ItemName = goodsReceiptItems[i].ItemName;
              this.itemid = currGRItem.ItemId;                                ///set itemid for if item change then chabge cccharge value else keep old value.
              currGRItem.SelectedItem = this.itemList.find((a) => a.ItemId == currGRItem.ItemId);
              currGRItem.StockId = goodsReceiptItems[i].StockId;
              currGRItem.StoreStockId = goodsReceiptItems[i].StoreStockId;
              currGRItem.BatchNo = goodsReceiptItems[i].BatchNo;
              currGRItem.ExpiryDate = goodsReceiptItems[i].ExpiryDate;
              if (currGRItem.ExpiryDate != null) {
                currGRItem.ExpiryDate = moment(currGRItem.ExpiryDate).format("YYYY-MM");
              }
              currGRItem.ReceivedQuantity = goodsReceiptItems[i].ReceivedQuantity;
              if (goodsReceiptItems[i].PackingTypeId != null) {
                var packing = this.packingtypeList.find(x => x.PackingTypeId == goodsReceiptItems[i].PackingTypeId);
                currGRItem.PackingQty = goodsReceiptItems[i].PackingQty;
                currGRItem.ItemQTy = goodsReceiptItems[i].ReceivedQuantity / currGRItem.PackingQty;
                currGRItem.PackingName = packing.PackingName + "\n" + "(" + packing.PackingQuantity + ")";
                currGRItem.Packing = packing;
              }
              else {
                currGRItem.ItemQTy = goodsReceiptItems[i].ReceivedQuantity;
              }
              currGRItem.GenericName = goodsReceiptItems[i].GenericName;
              currGRItem.GenericId = goodsReceiptItems[i].GenericId;
              currGRItem.StripRate = goodsReceiptItems[i].StripRate;
              currGRItem.StripMRP = goodsReceiptItems[i].StripMRP;
              currGRItem.StripQty = goodsReceiptItems[i].PackingQty;
              currGRItem.PackingTypeId = goodsReceiptItems[i].PackingTypeId;
              currGRItem.FreeQuantity = goodsReceiptItems[i].FreeQuantity;
              currGRItem.RejectedQuantity = goodsReceiptItems[i].RejectedQuantity;
              currGRItem.UOMName = goodsReceiptItems[i].UOMName;
              currGRItem.SellingPrice = goodsReceiptItems[i].SellingPrice;
              currGRItem.GRItemPrice = goodsReceiptItems[i].GRItemPrice;
              currGRItem.SubTotal = goodsReceiptItems[i].SubTotal;
              currGRItem.VATPercentage = goodsReceiptItems[i].VATPercentage;
              currGRItem.IsPacking = goodsReceiptItems[i].IsPacking;
              currGRItem.MRP = goodsReceiptItems[i].MRP;
              currGRItem.IsItemDiscountApplicable = goodsReceiptItems[i].IsItemDiscountApplicable;
              if (goodsReceiptItems[i].CCCharge == null) {
                currGRItem.CCCharge = 0;
              }
              else {
                currGRItem.CCCharge = goodsReceiptItems[i].CCCharge;
                currGRItem.CCAmount = goodsReceiptItems[i].CCAmount;

              }
              currGRItem.DiscountPercentage = goodsReceiptItems[i].DiscountPercentage;
              currGRItem.DiscountAmount = goodsReceiptItems[i].GrPerItemDisAmt;
              currGRItem.VATAmount = goodsReceiptItems[i].GrPerItemVATAmt;
              if (currGRItem.VATAmount) {
                this.goodsReceiptVM.goodReceipt.TaxableSubTotal += goodsReceiptItems[i].SubTotal - goodsReceiptItems[i].DiscountAmount;
              }
              else {
                this.goodsReceiptVM.goodReceipt.NonTaxableSubTotal += goodsReceiptItems[i].DiscountAmount;
              }
              currGRItem.TotalAmount = goodsReceiptItems[i].TotalAmount;
              currGRItem.CreatedBy = goodsReceiptItems[i].CreatedBy;
              currGRItem.CreatedOn = goodsReceiptItems[i].CreatedOn;
              currGRItem.SalePrice = goodsReceiptItems[i].SalePrice;
              currGRItem.AvailableQuantity = goodsReceiptItems[i].AvailableQuantity;
              currGRItem.QtyDiffCount = goodsReceiptItems[i].QtyDiffCount;
              currGRItem.StkManageInOut = goodsReceiptItems[i].StkManageInOut;
              currGRItem.IsItemAltered = goodsReceiptItems[i].IsItemAltered;
              if (currGRItem.PackingTypeId != null) {
                currGRItem.Margin = CommonFunctions.parseAmount(((currGRItem.StripMRP - currGRItem.StripRate) / currGRItem.StripRate) * 100)
              }
              else {
                currGRItem.Margin = CommonFunctions.parseAmount(((currGRItem.SalePrice - currGRItem.GRItemPrice) / currGRItem.GRItemPrice) * 100)
              }
              this.grItemList.push(currGRItem);
              //this.UpdatePackingSettingForItem(currGRItem); //ramesh: this is updating the item wise packing; need discussion
            }
            this.changeDetectorRef.detectChanges();
            //sanjit: set focus by default to invoice no, as focusing to supplier brings out issues. will be solved later.
            this.SetFocusById("InvoiceId")

            if (res.Results.IsGRModified) {
              this.IsGReditAfterModification = true;
            }
          } else {
            //this.msgserv.showMessage("Error", ["Failed to load GR.", res.Results + " has been modified or transfered"]);
            //this.logError(res.ErrorMessage);
            this.msgserv.showMessage("Error", ["Failed to load GR."]);
            this.logError(res.ErrorMessage);
          }
        }),
        (err) => {
          this.msgserv.showMessage("Error", [
            "Failed to load GR.",
            err.ErrorMessage,
          ]);
        };
    }
  }


  EditGR() {
    if (this.grItemList != null) {
      let CheckIsValid = true;
      if (this.currentSupplier.SupplierId <= 0) {
        //this.msgserv.showMessage("error", ['Please select supplier']);
        alert("Please select supplier");
        CheckIsValid = false;
      }
      if (this.goodsReceiptVM.goodReceipt.InvoiceNo == null) {
        alert("Please enter Invoice no.");
        CheckIsValid = false;
      }
      if (this.currentStore == null || this.currentStore.StoreId == 0) {
        alert("Please select store");
        CheckIsValid = false;
      }
      let invoiceNo = this.goodsReceiptVM.goodReceipt.InvoiceNo;
      let SupplierId = this.currentSupplier.SupplierId;
      if (this.oldInvoiceNo != invoiceNo || this.oldSupplierId != SupplierId) {
        for (let i = 0; i < this.goodsReceiptList.length; i++) {
          let InvNum = this.goodsReceiptList[i].InvoiceNo;
          let SuppNum = this.goodsReceiptList[i].SupplierId;
          if (invoiceNo == InvNum && SupplierId == SuppNum) {
            this.duplicateInvoice = true;
            CheckIsValid = false;
          }

        }
      }
      // for loop is used to show GoodsReceiptValidator message ..if required  field is not filled
      for (var a in this.goodsReceiptVM.goodReceipt.GoodReceiptValidator.controls) {
        this.goodsReceiptVM.goodReceipt.GoodReceiptValidator.controls[a].markAsDirty();
        this.goodsReceiptVM.goodReceipt.GoodReceiptValidator.controls[a].updateValueAndValidity();
        if (this.goodsReceiptVM.goodReceipt.IsValidCheck(undefined, undefined) == false) {
          CheckIsValid = false;
        }
      }
      //If Below 'X' one Validaiton checking working then remove It
      // for loop 'N'
      for (var b in this.goodReceiptItems.GoodReceiptItemValidator.controls) {
        this.goodReceiptItems.GoodReceiptItemValidator.controls[b].markAsDirty();
        this.goodReceiptItems.GoodReceiptItemValidator.controls[b].updateValueAndValidity();
      }
      for (var c = 0; c < this.grItemList.length; c++) {
        for (var ctrl in this.grItemList[c].GoodReceiptItemValidator.controls) {
          this.grItemList[c].GoodReceiptItemValidator.controls[ctrl].markAsDirty();
          this.grItemList[c].GoodReceiptItemValidator.controls[ctrl].updateValueAndValidity();
          //this.grItemList[c].CounterId = this.currentCounter;

        }
        if ((this.grItemList[c].FreeQuantity != 0) && (this.grItemList[c].ItemQTy == 0 || this.grItemList[c].ReceivedQuantity == 0)) {
          this.grItemList[c].GoodReceiptItemValidator.controls["ItemQTy"].disable();
          this.grItemList[c].GoodReceiptItemValidator.controls["ReceivedQuantity"].disable();
        }
        // if (this.grItemList[c].IsValidCheck(undefined, undefined) == false) {
        //   CheckIsValid = false;

        // }
      }
      if (CheckIsValid) {
        /////assigning GRList To GoodsReceipt View Model
        for (let k = 0; k < this.grItemList.length; k++) {
          this.goodsReceiptVM.goodReceipt.GoodReceiptItem[k] = this.grItemList[k];
        }
        //////this function checking GrItems whose received quantity is not equal to zero we can pass those item to server call
        for (let c = 0; c < this.goodsReceiptVM.goodReceipt.GoodReceiptItem.length; c++) {
          if (this.goodsReceiptVM.goodReceipt.GoodReceiptItem[c].ReceivedQuantity != 0 || this.goodsReceiptVM.goodReceipt.GoodReceiptItem[c].FreeQuantity != 0) {
            /////assign GrItem whose received qty is not equal to zero then push to Temp local varible of view model
            this.tempgoodsReceiptVM.goodReceipt.GoodReceiptItem.push(this.goodsReceiptVM.goodReceipt.GoodReceiptItem[c]);
          }
        }
        //////null all original GrItems because and assign those item to this view model whose received qty is greater then zero
        this.goodsReceiptVM.goodReceipt.GoodReceiptItem = [];
        for (let e = 0; e < this.tempgoodsReceiptVM.goodReceipt.GoodReceiptItem.length; e++) {
          /////push temporary stored GrItems to Original GrItems Array
          this.goodsReceiptVM.goodReceipt.GoodReceiptItem.push(this.tempgoodsReceiptVM.goodReceipt.GoodReceiptItem[e]);
        }

        if (this.goodsReceiptVM.goodReceipt.GoodReceiptItem.length > 0) {
          this.loading = true;
          this.goodsReceiptVM.goodReceipt.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
          this.goodsReceiptVM.goodReceipt.SupplierId = this.currentSupplier.SupplierId;
          this.goodsReceiptVM.goodReceipt.StoreId = this.currentStore.StoreId;
          this.goodsReceiptVM.goodReceipt.StoreName = this.currentStore.Name;
          this.goodsReceiptVM.goodReceipt.CreatedOn = moment().format("YYYY-MM-DD");
          this.goodsReceiptVM.goodReceipt.GoodReceiptItem.forEach(
            t => {
              t.CreatedBy = this.goodsReceiptVM.goodReceipt.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
              t.CreatedOn = moment().format("YYYY-MM-DD");
            }
          );
          this.goodsReceiptVM.purchaseOrder.SupplierId = this.currentSupplier.SupplierId;
          this.goodsReceiptVM.purchaseOrder.SupplierName = this.currentSupplier.SupplierName;
          if (!this.IsPOorder) {
            // this.MakePoWithPOItemsForPost(this.goodsReceiptVM);
          } else {
            this.ChangePOAndPOItemsStatus();
          }
          this.pharmacyBLService.UpdateGoodsReceipt(this.goodsReceiptVM.goodReceipt).subscribe(
            (res) => {
              if (res.Status == "OK") {
                this.msgserv.showMessage("success", ["Goods Receipt is Updated and Saved.",]);
                this.pharmacyService.CreateNew();
                this.IsPOorder = false;
                this.IsGRedit = false;
                this.itemid = 0;
                //navigate to GRLIST Page
                this.router.navigate(["/Pharmacy/Order/GoodsReceiptList"]);
              } else {
                this.msgserv.showMessage("failed", [res.Results, " has been transfered or modified",]);
                this.logError(res.ErrorMessage);
              }
              this.loading = false;
            },
            (err) => {
              (this.loading = false), this.logError(err);
            }
          );
        } else {
          this.msgserv.showMessage("notice-message", ["Received Qty of All Items is Zero",]);
        }
      } else {
        this.msgserv.showMessage("notice-message", ["missing value, please fill it",]);
      }
    }

  }
  //Method for transforming POItems to GRItems
  GetGrItemsFromPoItems() {
    for (var i = 0; i < this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems.length; i++
    ) {
      var currGRItem: PHRMGoodsReceiptItemsModel = new PHRMGoodsReceiptItemsModel();
      currGRItem.ItemId = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].ItemId;
      currGRItem.ItemName = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].ItemName;
      currGRItem.SellingPrice = 0;
      currGRItem.VATPercentage = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].VATPercentage;
      currGRItem.ExpiryDate = moment().format("YYYY-MM-DD");
      currGRItem.GRItemPrice = 0; // need to refacor again
      currGRItem.DiscountPercentage = 0;
      currGRItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      currGRItem.SupplierName = this.currentSupplier.SupplierName;
      currGRItem.CompanyName = this.currentCompany[i].CompanyName;
      currGRItem.SelectedItem = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PHRMItemMaster;
      currGRItem.GRItemPrice = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].StandardRate;
      if (this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].ReceivedQuantity == 0) {
        ///if pending qty is zero then replace it with original Purchase Oty
        currGRItem.PendingQuantity = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].Quantity;
      } else {
        currGRItem.PendingQuantity = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PendingQuantity;
      }
      currGRItem.ItemQTy = currGRItem.PendingQuantity;
      if (this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PHRMItemMaster.CCCharge == null) {
        currGRItem.CCCharge = 0;
      }
      else {
        currGRItem.CCCharge = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PHRMItemMaster.CCCharge;
      }

      if (this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PHRMItemMaster.PackingTypeId == null) {
        currGRItem.PackingName = "N/A";
      }
      ///push  local variable GrData to GrList Variable
      this.grItemList.push(currGRItem);
      this.UpdatePackingSettingForItem(currGRItem);
    }
  }

  public getGoodsReceiptList() {
    this.pharmacyBLService.GetGoodsReceiptList().subscribe((res) => {
      if (res.Status == "OK") {
        this.goodsReceiptList = res.Results;
      }
    });
  }

  public GetAllFiscalYears() {
    this.pharmacyBLService.GetAllFiscalYears().subscribe((res) => {
      if (res.Status == "OK") {
        this.fiscalYearList = res.Results;
      }
    });
  }
  //get Store List
  public getMainStore() {
    this.pharmacyBLService.GetMainStore().subscribe((res) => {
      if (res.Status == "OK") {
        this.storeList = res.Results;

        if (this.storeList && this.storeList.StoreId) {
          this.currentStore = this.storeList;
        }

      }
    });
  }

  //Save data to database
  SaveGoodsReceipt() {
    if (this.grItemList != null) {
      var isValid = this.CheckGoodReceiptValidity();

      var goSigal: boolean = false;
      if (this.CheckIsValid && isValid && this.grItemList.length > 0)
        goSigal = this.CheckGRItemHistory();

      if (goSigal) {
        let gr = this.goodsReceiptVM.goodReceipt;
        if (this.CheckIsValid && isValid) {
          for (let k = 0; k < this.grItemList.length; k++) {
            this.goodsReceiptVM.goodReceipt.GoodReceiptItem[k] = this.grItemList[k];
            this.goodsReceiptVM.goodReceipt.GoodReceiptItem[k].FreeQuantity = this.grItemList[k].FreeQuantity != null ? this.grItemList[k].FreeQuantity : 0;
            this.goodsReceiptVM.goodReceipt.IsPacking = this.grItemList[k].IsPacking == true ? true : false
            this.goodsReceiptVM.goodReceipt.IsItemDiscountApplicable = this.grItemList[k].DiscountAmount ? true : false;
            this.goodsReceiptVM.goodReceipt.GoodReceiptItem[k].ReceivedQuantity = this.grItemList[k].ItemQTy;
          }
          gr.GoodReceiptDate = moment(gr.GoodReceiptDate).format("YYYY-MM-DD") + ' ' + moment().format('HH:mm:ss.SSS');
          //////this function checking GrItems whose received quantity is not equal to zero we can pass those item to server call
          gr.GoodReceiptItem = gr.GoodReceiptItem.filter(a => a.ReceivedQuantity > 0 || a.FreeQuantity > 0);

          if (gr.GoodReceiptItem.length > 0) {
            this.loading = true;
            gr.GoodReceiptItem.forEach(
              r => {
                r.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                r.CreatedOn = moment().format("YYYY-MM-DD");
              }
            );
            gr.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            gr.SupplierId = this.currentSupplier.SupplierId;
            gr.CreatedOn = moment().format("YYYY-MM-DD");
            gr.StoreId = this.currentStore.StoreId;
            gr.StoreName = this.currentStore.Name;
            gr.PaymentStatus = "pending";
            this.goodsReceiptVM.purchaseOrder.SubTotal = this.goodsReceiptVM.goodReceipt.SubTotal;
            this.goodsReceiptVM.purchaseOrder.TotalAmount = this.goodsReceiptVM.goodReceipt.TotalAmount;
            this.goodsReceiptVM.purchaseOrder.DiscountAmount = this.goodsReceiptVM.goodReceipt.DiscountAmount;
            this.goodsReceiptVM.purchaseOrder.DiscountPercentage = this.goodsReceiptVM.goodReceipt.DiscountPercentage;
            this.goodsReceiptVM.purchaseOrder.VATAmount = this.goodsReceiptVM.goodReceipt.VATAmount;
            this.goodsReceiptVM.purchaseOrder.SupplierId = this.currentSupplier.SupplierId;
            this.goodsReceiptVM.purchaseOrder.SupplierName = this.currentSupplier.SupplierName;
            this.goodsReceiptVM.goodReceipt.CreditPeriod = this.goodsReceiptVM.goodReceipt.CreditPeriod == null ? 0 : this.goodsReceiptVM.goodReceipt.CreditPeriod;
            this.goodsReceiptVM.purchaseOrder.CCChargeAmount = this.goodsReceiptVM.goodReceipt.CCAmount;
            if (this.checkCreditPeriod) {
              this.msgserv.showMessage('Notice', ['Credit Period should be positive and whole number']);
              return;
            }

            if (!this.IsPOorder) {
              // this.MakePoWithPOItemsForPost(goodReceiptVM);
            } else {
              this.ChangePOAndPOItemsStatus();
            }

            this.pharmacyBLService.PostGoodReceipt(this.goodsReceiptVM, this.IsPOorder).subscribe(
              (res) => {
                this.goodsReceiptVM = new PHRMGoodsReceiptViewModel();
                this.CallBackAddGoodsReceipt(res);
                this.loading = false;
              },
              (err) => {
                this.loading = false;
                this.logError(err);
              }
            );
          } else {
            this.msgserv.showMessage("notice-message", ["Received Qty of All Items is Zero",]);
          }
        } else {
          this.msgserv.showMessage("notice-message", ["Missing or Invalid value ! !",]);
        }
      }
      else {
        this.msgserv.showMessage(ENUM_MessageBox_Status.Notice, ["Please, Insert Valid Data",]);
      }
    }
  }

  invalidDiscountPercentage: boolean = false;
  invalidDiscountAmount: boolean = false;
  invalidVATPercentage: boolean = false;
  invalidVATAmount: boolean = false;
  public CheckGoodReceiptValidity(): boolean {
    var CheckIsValid = true;
    if (!this.currentSupplier || this.currentSupplier.SupplierId == undefined || this.currentSupplier.SupplierId <= 0) {
      //this.msgserv.showMessage("error", ['Please select supplier']);
      alert("Please select supplier");
      CheckIsValid = false;
    }
    if (this.goodsReceiptVM.goodReceipt.InvoiceNo == null || this.goodsReceiptVM.goodReceipt.InvoiceNo == "") {
      alert("Please enter Invoice no.");
      CheckIsValid = false;
    }
    if (this.goodsReceiptVM.goodReceipt.CreditPeriod < 0) {
      alert("Credit Period must be positive");
      CheckIsValid = false;
    }
    if (this.currentStore == null || this.currentStore.StoreId == 0) {
      alert("Please select store");
      CheckIsValid = false;
    }

    if ((this.goodsReceiptVM.goodReceipt.DiscountPercentage < 0 || this.goodsReceiptVM.goodReceipt.DiscountPercentage > 100) || this.goodsReceiptVM.goodReceipt.DiscountAmount < 0) {
      this.invalidDiscountPercentage = true;
      this.invalidDiscountAmount = true;
      CheckIsValid = false;
    }
    else {
      this.invalidDiscountPercentage = false;
      this.invalidDiscountAmount = false;
    }

    if ((this.goodsReceiptVM.goodReceipt.VATPercentage < 0 || this.goodsReceiptVM.goodReceipt.VATPercentage > 100) || this.goodsReceiptVM.goodReceipt.VATAmount < 0) {
      this.invalidVATPercentage = true;
      this.invalidVATAmount = true;
      CheckIsValid = false;
    }
    else {
      this.invalidVATPercentage = false;
      this.invalidVATAmount = false;
    }


    // for loop is used to show GoodsReceiptValidator message ..if required  field is not filled
    for (var a in this.goodsReceiptVM.goodReceipt.GoodReceiptValidator.controls) {

      this.goodsReceiptVM.goodReceipt.GoodReceiptValidator.controls[a].markAsDirty();
      this.goodsReceiptVM.goodReceipt.GoodReceiptValidator.controls[a].updateValueAndValidity();

      if (this.goodsReceiptVM.goodReceipt.IsValidCheck(undefined, undefined) == false) {
        CheckIsValid = false;
      }
    }

    if (this.IsPOorder) {
      this.goodReceiptItems.GoodReceiptItemValidator.controls['ItemName'].setErrors(null);
    }
    for (var b in this.goodReceiptItems.GoodReceiptItemValidator.controls) {
      this.goodReceiptItems.GoodReceiptItemValidator.controls[b].markAsDirty();
      this.goodReceiptItems.GoodReceiptItemValidator.controls[b].updateValueAndValidity();
    }

    for (let grItem of this.grItemList) {

      for (var ctrl in grItem.GoodReceiptItemValidator.controls) {

        if ((grItem.FreeQuantity != 0) && (grItem.ItemQTy == 0 || grItem.ReceivedQuantity == 0)) {
          if (grItem.GoodReceiptItemValidator.status != "VALID") {
            grItem.GoodReceiptItemValidator.controls["ItemQTy"].disable();
            //grItem.GoodReceiptItemValidator.controls["ReceivedQuantity"].disable();
          }
        }
        if (this.isExpiryNotApplicable && grItem.GoodReceiptItemValidator.controls["ExpiryDate"] == grItem.GoodReceiptItemValidator.controls[ctrl]) {
          grItem.GoodReceiptItemValidator.controls["ExpiryDate"].disable();
          grItem.GoodReceiptItemValidator.updateValueAndValidity();

        } else {
          grItem.GoodReceiptItemValidator.controls[ctrl].markAsDirty();
          grItem.GoodReceiptItemValidator.controls[ctrl].updateValueAndValidity();
        }
        if (this.IsPOorder) {
          grItem.GoodReceiptItemValidator.controls['ItemName'].setErrors(null);
        }
      }
      if (grItem.IsValidCheck(undefined, undefined) == false) {
        CheckIsValid = false;
      }

    }


    return CheckIsValid;
  }

  //call after Goods Receipt saved
  CallBackAddGoodsReceipt(res) {
    if (res.Status == "OK") {
      this.msgserv.showMessage("success", ["Goods Receipt is Generated and Saved.",]);
      this.pharmacyService.CreateNew();
      this.loadItemRateHistory();
      this.loadMRPHistory();
      this.IsPOorder = false;
      this.PurchaseOrderNo = 0;
      this.goodsReceiptIdForPrint = res.Results as number;
      this.showGRReceipt = true;
      this.ClearAllFields();
      this.getGoodsReceiptList();
    } else {
      this.msgserv.showMessage("failed", ["failed to add result.. please check log for details.",]);
      this.logError(res.ErrorMessage);

    }
  }
  loadItemRateHistory() {
    this.pharmacyBLService.getItemRateHistory()
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length > 0) {
          this.pharmacyService.setItemRateHistory(res.Results);
        }
      }, err => {
        console.log(err.error.ErrorMessage);
      })
  }
  loadMRPHistory() {
    this.pharmacyBLService.getMRPHistory()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results.length > 0) {
          this.pharmacyService.setMRPHistory(res.Results);
        }
      }, err => {
        console.log(err.error.ErrorMessage);
      })
  }

  public getGenericList() {
    if (this.update != true) {
      this.pharmacyBLService.GetGenericList()
        .subscribe(res => {
          if (res.Status == "OK") {
            this.genericList = res.Results;
          }
        });
    }
  }
  ClearAllFields() {
    this.goodsReceiptVM = new PHRMGoodsReceiptViewModel();
    this.grItemList = new Array<PHRMGoodsReceiptItemsModel>();
    this.tempgoodsReceiptVM = new PHRMGoodsReceiptViewModel();
    this.goodReceiptItems = new PHRMGoodsReceiptItemsModel();
    this.goodsReceiptList = new Array<PHRMGoodsReceiptModel>();
    this.goodsReceiptVM.goodReceipt.GoodReceiptDate = moment().format("YYYY-MM-DD");
    this.PurchaseOrderNo = null;
    this.currentSupplier = null;
  }

  OnGRViewPopUpClose() {
    this.showGRReceipt = false;
    this.SetFocusById("SupplierName");
  }

  logError(err: any) {
    this.PurchaseOrderNo = 0;
    this.pharmacyService.CreateNew();
    this.IsPOorder = false;
    console.log(err);
  }

  SetFocusById(IdToBeFocused: string) {
    window.setTimeout(function () {
      let elemToFocus = document.getElementById(IdToBeFocused);
      if (elemToFocus != null && elemToFocus != undefined) {
        elemToFocus.focus();
      }
    }, 0);
  }
  // Calculation for Goods Receipt Item

  OnNewGRItemAdded(grItemToAdded: PHRMGoodsReceiptItemsModel) {
    var Gritem = grItemToAdded;

    if (!this.grItemList || this.grItemList.length == 0) {
      this.grItemList = [];
    }
    this.grItemList.push(Gritem);

    // if (this.grItemList[0].ItemId === 0) {
    //   // remove the default item
    //   this.grItemList.splice(0, 1);
    // }
    // this.grItemList.unshift(Gritem);
    this.CalculationForPHRMGoodsReceipt();
    this.changeDetectorRef.detectChanges();
    this.goodReceiptItems = new PHRMGoodsReceiptItemsModel();
    this.SetFocusById("btn_AddNew");
  }

  public throwError: boolean = false;
  // CalculationForPHRMGoodsReceipt(changeType: string = null) {

  //   if (changeType == "disc-amount") {
  //     let discAmt = this.goodsReceiptVM.goodReceipt.DiscountAmount;
  //     if (!discAmt) {
  //       discAmt = 0;
  //     }
  //     let totalCCAmt = this.grItemList.reduce((a, b) => {
  //       let ccAmount = b.FreeQuantity * b.GRItemPrice * b.CCCharge / 100;
  //       return a + ccAmount;
  //     }, 0)
  //     let subTotalwithoutCC = this.goodsReceiptVM.goodReceipt.SubTotal - totalCCAmt;

  //     let discPercent = discAmt * 100 / subTotalwithoutCC;

  //     this.goodsReceiptVM.goodReceipt.DiscountAmount = discAmt;
  //     this.goodsReceiptVM.goodReceipt.DiscountPercentage = (discPercent);
  //   }

  //   else if (changeType == "disc-percent") {
  //     let discPercent = this.goodsReceiptVM.goodReceipt.DiscountPercentage;
  //     if (!discPercent) {
  //       discPercent = 0;
  //     }
  //     let totalCCAmt = this.grItemList.reduce((a, b) => {
  //       let ccAmount = b.FreeQuantity * b.GRItemPrice * b.CCCharge / 100;
  //       return a + ccAmount;
  //     }, 0);
  //     let subTotalwithoutCC = this.goodsReceiptVM.goodReceipt.SubTotal - totalCCAmt;

  //     let discAmt = subTotalwithoutCC * discPercent / 100;
  //     this.goodsReceiptVM.goodReceipt.DiscountAmount = discAmt;

  //   }
  //   if (["disc-amount", "disc-percent"].includes(changeType)) {
  //     this.grItemList.forEach(a => {
  //       a.DiscountPercentage = this.goodsReceiptVM.goodReceipt.DiscountPercentage;
  //       updateCalculationsForGrItem(a);
  //     });
  //   }
  //   //To validate the discount percentage: Rohit
  //   if (this.goodsReceiptVM.goodReceipt.DiscountAmount > this.goodsReceiptVM.goodReceipt.SubTotal) {
  //     this.throwError = true;
  //     this.loading = true;
  //   }
  //   else {
  //     this.loading = false;
  //     this.throwError = false;
  //   }
  //   let aggregateResult = this.grItemList.reduce((aggregatedObject, currentItem) => {
  //     if (currentItem.VATAmount) {
  //       aggregatedObject.taxableSubTotal += currentItem.SubTotal;
  //     }
  //     else {
  //       aggregatedObject.nontaxableSubtotal += currentItem.SubTotal;
  //     }
  //     aggregatedObject.discountTotal += currentItem.DiscountAmount;
  //     aggregatedObject.vatTotal += currentItem.VATAmount;
  //     aggregatedObject.totalAmount += currentItem.TotalAmount;
  //     aggregatedObject.ccTotal += currentItem.FreeQuantity * currentItem.GRItemPrice * currentItem.CCCharge / 100
  //     return aggregatedObject;
  //   }, { taxableSubTotal: 0, nontaxableSubtotal: 0, discountTotal: 0, vatTotal: 0, ccTotal: 0, totalAmount: 0 });



  //   this.goodsReceiptVM.goodReceipt.TaxableSubTotal = CommonFunctions.parsePhrmAmount(aggregateResult.taxableSubTotal);
  //   this.goodsReceiptVM.goodReceipt.NonTaxableSubTotal = CommonFunctions.parsePhrmAmount(aggregateResult.nontaxableSubtotal);
  //   this.goodsReceiptVM.goodReceipt.SubTotal = CommonFunctions.parsePhrmAmount(this.goodsReceiptVM.goodReceipt.TaxableSubTotal + this.goodsReceiptVM.goodReceipt.NonTaxableSubTotal);
  //   this.goodsReceiptVM.goodReceipt.TotalAmount = aggregateResult.totalAmount;
  //   this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parsePhrmAmount(aggregateResult.discountTotal);
  //   if (this.goodsReceiptVM.goodReceipt.SubTotal - aggregateResult.ccTotal > 0)
  //     this.goodsReceiptVM.goodReceipt.DiscountPercentage = CommonFunctions.parsePhrmAmount(this.goodsReceiptVM.goodReceipt.DiscountAmount * 100 / (this.goodsReceiptVM.goodReceipt.SubTotal - aggregateResult.ccTotal));
  //   this.goodsReceiptVM.goodReceipt.VATAmount = aggregateResult.vatTotal;
  //   this.goodsReceiptVM.goodReceipt.CCAmount = aggregateResult.ccTotal;
  //   // if (this.goodsReceiptVM.goodReceipt.DiscountAmount == 0) {
  //   //   this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parsePhrmAmount(this.goodsReceiptVM.goodReceipt.TotalAmount - this.goodsReceiptVM.goodReceipt.SubTotal);
  //   // }
  //   // this.goodsReceiptVM.goodReceipt.Adjustment = CommonFunctions.parseFinalAmount(this.goodsReceiptVM.goodReceipt.TotalAmount) - this.goodsReceiptVM.goodReceipt.TotalAmount;
  //   // this.goodsReceiptVM.goodReceipt.Adjustment = CommonFunctions.parsePhrmAmount(this.goodsReceiptVM.goodReceipt.Adjustment);
  //   this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parsePhrmAmount(this.goodsReceiptVM.goodReceipt.TotalAmount);

  // }

  CalculationForPHRMGoodsReceipt(discPer?: number, discAmt?: number) {
    let SubTotal = 0;
    let DiscountAmount = 0;
    let DiscountPercentage = 0;
    let VATAmount = 0;
    let VATPercentage = 0;
    let TotalAmount = 0;
    let CCAmount = 0;

    if ((discPer < 0 || discPer > 100) || discAmt < 0) {
      this.invalidDiscountPercentage = true;
      this.invalidDiscountAmount = true;
      this.msgserv.showMessage(ENUM_MessageBox_Status.Warning, ['Enter a valid discount']);
      return;
    }
    else {
      this.invalidDiscountPercentage = false;
      this.invalidDiscountAmount = false;
    }

    this.grItemList.forEach(itm => {
      if (discPer > 0 && discAmt === 0) {
        itm.DiscountPercentage = discPer;
        itm.DiscountAmount = (itm.SubTotal * itm.DiscountPercentage) / 100;
      }
      if (discPer == 0 && discAmt > 0) {
        let DiscountPercentage = 0;
        let subTotal = this.grItemList.reduce((a, b) => a + b.SubTotal, 0);
        DiscountPercentage = (discAmt / subTotal) * 100;
        itm.DiscountPercentage = DiscountPercentage;
        itm.DiscountAmount = (itm.SubTotal * itm.DiscountPercentage) / 100;
      }
      if (discPer === 0 && discAmt === 0) {
        itm.DiscountPercentage = 0;
        itm.GrTotalDisAmt = 0;
        itm.DiscountAmount = 0;
      }
      itm.VATAmount = (itm.SubTotal - itm.DiscountAmount) * itm.VATPercentage / 100;
      itm.TotalAmount = itm.SubTotal - itm.DiscountAmount + itm.VATAmount + itm.CCAmount;
    });

    SubTotal = this.grItemList.reduce((a, b) => a + b.SubTotal, 0);
    DiscountAmount = this.grItemList.reduce((a, b) => a + b.DiscountAmount, 0);
    DiscountPercentage = (DiscountAmount / SubTotal) * 100;
    VATAmount = this.grItemList.reduce((a, b) => a + b.VATAmount, 0);
    CCAmount = this.grItemList.reduce((a, b) => a + b.CCAmount, 0);
    VATPercentage = ((VATAmount / (SubTotal - DiscountAmount)) * 100);

    if (this.isMainDiscountApplicable) {
      discAmt = discAmt ? discAmt : 0;
      discPer = discPer ? discPer : 0;

      if (discPer == 0 && discAmt > 0) {
        DiscountAmount = discAmt;
        discPer = (discAmt / SubTotal) * 100;
        DiscountPercentage = discPer;
      }
      if (discPer > 0 && discAmt == 0) {
        discAmt = (SubTotal * discPer) / 100;
        DiscountAmount = discAmt;
        DiscountPercentage = discPer;
      }
    }


    TotalAmount = SubTotal - DiscountAmount + VATAmount + CCAmount;

    this.goodsReceiptVM.goodReceipt.TaxableSubTotal = CommonFunctions.parseAmount(SubTotal - DiscountAmount, 4);
    this.goodsReceiptVM.goodReceipt.NonTaxableSubTotal = CommonFunctions.parseAmount(DiscountAmount, 4);
    this.goodsReceiptVM.goodReceipt.SubTotal = CommonFunctions.parseAmount(SubTotal, 4);
    this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parseAmount(DiscountAmount, 4);
    this.goodsReceiptVM.goodReceipt.DiscountPercentage = CommonFunctions.parseAmount(DiscountPercentage, 4);
    this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parseAmount(VATAmount, 4);
    this.goodsReceiptVM.goodReceipt.VATPercentage = CommonFunctions.parseAmount(VATPercentage, 4);
    this.goodsReceiptVM.goodReceipt.CCAmount = CommonFunctions.parseAmount(CCAmount, 4);
    this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parseAmount(TotalAmount, 4);


    if (this.goodsReceiptVM.goodReceipt.DiscountAmount > this.goodsReceiptVM.goodReceipt.SubTotal) {
      this.throwError = true;
      this.loading = true;
    }
    else {
      this.loading = false;
      this.throwError = false;
    }

    if ((this.goodsReceiptVM.goodReceipt.DiscountPercentage < 0 || this.goodsReceiptVM.goodReceipt.DiscountPercentage > 100) || this.goodsReceiptVM.goodReceipt.DiscountAmount < 0) {
      this.invalidDiscountPercentage = true;
      this.invalidDiscountAmount = true;
      this.throwError = true;
    }
    else {
      this.invalidDiscountPercentage = false;
      this.invalidDiscountAmount = false;
      this.throwError = false;
    }

    if ((this.goodsReceiptVM.goodReceipt.VATPercentage < 0 || this.goodsReceiptVM.goodReceipt.VATPercentage > 100) || this.goodsReceiptVM.goodReceipt.VATAmount < 0) {
      this.invalidVATPercentage = true;
      this.invalidVATAmount = true;
      this.throwError = true;
    }
    else {
      this.invalidVATPercentage = false;
      this.invalidVATAmount = false;
      this.throwError = false;
    }
  }

  OnVATChange(vatPer?: number, vatAmt?: number) {

    if ((vatPer < 0 || vatPer > 100) || vatAmt < 0) {
      this.invalidVATPercentage = true;
      this.invalidVATAmount = true;
      this.msgserv.showMessage(ENUM_MessageBox_Status.Warning, ['Enter a valid VAT']);
      return;
    }
    else {
      this.invalidVATPercentage = false;
      this.invalidVATAmount = false;
    }

    this.grItemList.forEach(itm => {
      if (vatPer > 0 && vatAmt === 0) {
        itm.VATPercentage = vatPer;
        itm.VATAmount = (itm.SubTotal - itm.DiscountAmount) * itm.VATPercentage / 100;
      }

      if (vatPer === 0 && vatAmt > 0) {
        let VATPercentage = 0;
        VATPercentage = (vatAmt / (itm.SubTotal - itm.DiscountAmount) * 100);
        itm.VATPercentage = VATPercentage;
        itm.VATAmount = (itm.SubTotal - itm.DiscountAmount) * itm.VATPercentage / 100;
      }
      if (vatPer === 0 && vatAmt === 0) {
        itm.VATPercentage = 0;
        itm.VATAmount = 0;
      }
    });
    this.CalculationForPHRMGoodsReceipt();
  }



  Old_CalculationForPHRMGoodsReceipt(discAmt?: number, discPer?: number, vatAmt?: number) {
    let STotal: number = 0;

    let TAmount: number = 0;
    let VAmount: number = 0;
    let DAmount: number = 0;
    let TotalitemlevDisPer: number = 0;
    let TotalitemlevDisAmt: number = 0;
    let Subtotalofitm: number = 0;

    let aggregateResult = this.grItemList.reduce((aggregatedObject, currentItem) => {
      aggregatedObject.subTotal += currentItem.SubTotal;
      aggregatedObject.discountTotal += currentItem.DiscountAmount;
      aggregatedObject.vatTotal += currentItem.VATAmount;
      aggregatedObject.totalAmount += currentItem.TotalAmount;
      return aggregatedObject;
    }, { subTotal: 0, discountTotal: 0, vatTotal: 0, totalAmount: 0 });

    TAmount = aggregateResult.totalAmount;
    VAmount = aggregateResult.vatTotal;
    TotalitemlevDisAmt = aggregateResult.discountTotal;
    Subtotalofitm = aggregateResult.subTotal;


    //for bulk discount calculation and conversion of percentage into amount and vice versa
    if (this.isItemLevelDiscountApplicable == false) {
      if (discPer == 0 && discAmt > 0) {
        this.goodsReceiptVM.goodReceipt.TotalAmount =
          CommonFunctions.parsePhrmAmount(STotal) - discAmt;
        this.goodsReceiptVM.goodReceipt.DiscountAmount = discAmt;
        discPer = (discAmt / CommonFunctions.parsePhrmAmount(STotal)) * 100;
        this.goodsReceiptVM.goodReceipt.DiscountPercentage = CommonFunctions.parsePhrmAmount(
          discPer
        );
      }
      if (discPer > 0 && discAmt == 0) {
        discAmt = CommonFunctions.parsePhrmAmount((TAmount * discPer) / 100);
        this.goodsReceiptVM.goodReceipt.TotalAmount =
          CommonFunctions.parsePhrmAmount(STotal) - discAmt;
        this.goodsReceiptVM.goodReceipt.DiscountAmount = discAmt;
        this.goodsReceiptVM.goodReceipt.DiscountPercentage = discPer;
      }
      if (discPer == 0 && discAmt == 0 && vatAmt == 0) {
        this.goodsReceiptVM.goodReceipt.SubTotal = CommonFunctions.parsePhrmAmount(STotal);
        this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parsePhrmAmount(TAmount
        );
        //this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parsePhrmAmount(DAmount);
        this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parsePhrmAmount(
          VAmount
        );
        this.goodsReceiptVM.goodReceipt.DiscountAmount = 0;
        this.goodsReceiptVM.goodReceipt.DiscountPercentage = 0;
      }
      if (vatAmt >= 0) {
        this.goodsReceiptVM.goodReceipt.VATAmount = vatAmt;
        this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parseAmount(
          this.goodsReceiptVM.goodReceipt.SubTotal -
          this.goodsReceiptVM.goodReceipt.DiscountAmount +
          vatAmt
        );
      } else {
        this.goodsReceiptVM.goodReceipt.SubTotal = CommonFunctions.parsePhrmAmount(
          STotal
        );
        this.goodsReceiptVM.goodReceipt.TotalAmount =
          CommonFunctions.parsePhrmAmount(TAmount) -
          this.goodsReceiptVM.goodReceipt.DiscountAmount;
        //this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parsePhrmAmount(DAmount);
        this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parsePhrmAmount(
          VAmount
        );
      }
    }
    else {                                                                             //this cal for total item level discount
      this.goodsReceiptVM.goodReceipt.SubTotal = CommonFunctions.parsePhrmAmount(
        Subtotalofitm
      );
      this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parsePhrmAmount(
        TotalitemlevDisAmt
      );
      let totaldisper = (this.goodsReceiptVM.goodReceipt.DiscountAmount / this.goodsReceiptVM.goodReceipt.SubTotal) * 100;
      this.goodsReceiptVM.goodReceipt.DiscountPercentage = CommonFunctions.parsePhrmAmount(
        totaldisper
      );
      this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parsePhrmAmount(
        TAmount
      );
      this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parsePhrmAmount(
        VAmount
      );
      if (vatAmt > 0) {
        this.goodsReceiptVM.goodReceipt.VATAmount = vatAmt;
        this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parsePhrmAmount(
          this.goodsReceiptVM.goodReceipt.SubTotal -
          this.goodsReceiptVM.goodReceipt.DiscountAmount +
          vatAmt
        );
      }
    }


    // this.goodsReceiptVM.goodReceipt.Adjustment =
    //   CommonFunctions.parseFinalAmount(
    //     this.goodsReceiptVM.goodReceipt.TotalAmount
    //   ) - this.goodsReceiptVM.goodReceipt.TotalAmount;
    // this.goodsReceiptVM.goodReceipt.Adjustment = CommonFunctions.parseAmount(
    //   this.goodsReceiptVM.goodReceipt.Adjustment
    // );

    this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parseAmount(
      this.goodsReceiptVM.goodReceipt.TotalAmount
    );
  }

  //to delete the row
  DeleteGrItemRow(index) {
    //Don't allow to remove the item if the stock is already dispatched to dispensary. //sud:8July'2022
    if (this.goodsReceiptVM.goodReceipt.IsTransferredToACC == true || this.grItemList[index].IsItemAltered == true) {
      this.msgserv.showMessage("notice-message", ["Can not remove this item since this Stock is already altered or post to accounting."]);
      return;
    }

    // if (this.IsGRedit) {
    //   this.msgserv.showMessage("Failed", [
    //     "Can not delete any items in edit mode",
    //   ]);
    //   return;
    // }
    // if the index is 0 then ..  currentPOItem is pushhed in POItems to show the textboxes
    if (this.grItemList.length > 0) {
      //this will remove the data from the array

      this.grItemList.splice(index, 1);


    }

    if (index == 0 && this.grItemList.length == 0) {
      // let tempGRItemObj = new PHRMGoodsReceiptItemsModel();
      // this.grItemList.push(tempGRItemObj);
      this.CalculationForPHRMGoodsReceipt();
      this.changeDetectorRef.detectChanges();
    } else {
      this.CalculationForPHRMGoodsReceipt();
      this.changeDetectorRef.detectChanges();
    }
  }

  //After Goods Receipt Generation Updating The Pending and Received Qty of PO Item and also PO
  ChangePOAndPOItemsStatus() {
    var poItemList = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems;
    //Set the Received and Pending Quantity for Each Purchaser Order Item
    for (var i = 0; i < poItemList.length; i++) {
      var grItemEquivalentOfPoItem = this.grItemList.find(a => a.ItemId == poItemList[i].ItemId)
      if (grItemEquivalentOfPoItem != null) {
        poItemList[i].ReceivedQuantity = poItemList[i].ReceivedQuantity + grItemEquivalentOfPoItem.ItemQTy; //- poItemList[i].ReceivedQuantity;
        let pending = poItemList[i].Quantity - poItemList[i].ReceivedQuantity;
        poItemList[i].PendingQuantity = pending > 0 ? pending : 0;
        let pendingFreeQuantity = grItemEquivalentOfPoItem.FreeQuantity - poItemList[i].PendingFreeQuantity;
        poItemList[i].PendingFreeQuantity = pendingFreeQuantity > 0 ? pendingFreeQuantity : 0;
      }
    }
  }

  //method for make PO with Po items when user need to create goods receipt without purchase order
  //here we are creating purchase order by using goods receipt data and first posting po and then gr
  MakePoWithPOItemsForPost(goodsReceiptVM: PHRMGoodsReceiptViewModel) {
    goodsReceiptVM.purchaseOrder.PurchaseOrderId = 0;
    goodsReceiptVM.purchaseOrder.SupplierId = this.currentSupplier.SupplierId;
    // goodsReceiptVM.purchaseOrder.PODate = moment().format("YYYY-MM-DD HH:mm:sss");
    goodsReceiptVM.purchaseOrder.POStatus = "complete";
    goodsReceiptVM.purchaseOrder.SubTotal = goodsReceiptVM.goodReceipt.SubTotal;
    goodsReceiptVM.purchaseOrder.VATAmount = goodsReceiptVM.goodReceipt.VATAmount;
    goodsReceiptVM.purchaseOrder.TotalAmount = goodsReceiptVM.goodReceipt.TotalAmount;
    goodsReceiptVM.purchaseOrder.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    for (var x = 0; x < goodsReceiptVM.goodReceipt.GoodReceiptItem.length; x++) {
      let tempPOItem = new PHRMPurchaseOrderItems();
      tempPOItem.PurchaseOrderId = 0;
      tempPOItem.PurchaseOrderItemId = 0;
      tempPOItem.ItemId = goodsReceiptVM.goodReceipt.GoodReceiptItem[x].SelectedItem.ItemId;
      tempPOItem.Quantity = goodsReceiptVM.goodReceipt.GoodReceiptItem[x].ReceivedQuantity;
      tempPOItem.StandardRate = goodsReceiptVM.goodReceipt.GoodReceiptItem[x].SelectedItem.StandardPrice;
      tempPOItem.ReceivedQuantity = tempPOItem.Quantity;
      tempPOItem.PendingQuantity = 0;
      tempPOItem.SubTotal = goodsReceiptVM.goodReceipt.GoodReceiptItem[x].SubTotal;
      tempPOItem.VATAmount = CommonFunctions.parsePhrmAmount(goodsReceiptVM.goodReceipt.GoodReceiptItem[x].TotalAmount - tempPOItem.SubTotal);
      tempPOItem.TotalAmount = goodsReceiptVM.goodReceipt.GoodReceiptItem[x].TotalAmount;
      tempPOItem.DeliveryDays = 1;
      tempPOItem.POItemStatus = "complete";
      tempPOItem.AuthorizedBy = this.securityService.GetLoggedInUser().EmployeeId;
      //tempPOItem.AuthorizedOn = moment().format("YYYY-MM-DD HH:mm:sss");
      tempPOItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      // tempPOItem.CreatedOn = moment().format("YYYY-MM-DD HH:mm:sss");
      goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems.push(tempPOItem);
    }
    return goodsReceiptVM.purchaseOrder;
  }





  public AssignStore() {
    try {
      if (this.tempStore) {
        if (this.tempStore.StoreId != 0 && this.tempStore != null) {
          this.currentStore = this.tempStore;
        } else {
          this.currentStore = null;
        }
      } else {
        this.currentStore = null;
      }
    } catch (ex) {
      this.msgserv.showMessage("error", [
        "Failed to get Store." + ex.ErrorMessage,
      ]);
    }
  }


  //used to format display item in ng-autocomplete
  supplierListFormatter(data: any): string {
    let html = data["SupplierName"];
    return html;
  }


  dispensaryListFormatter(data: any): string {
    let html = data["Name"];
    return html;
  }

  //Discard button
  DiscardGoodsReceipt() {
    this.pharmacyService.CreateNew();
    this.PurchaseOrderNo = 0;
    this.IsPOorder = false;
    this.itemid = 0;
    //navigate to GRLIST Page
    this.router.navigate(["/Pharmacy/Order/GoodsReceiptList"]);
  }

  //for item add popup page to turn on

  AddItemPopUp(i) {
    this.showAddItemPopUp = false;
    this.index = i;
    this.changeDetectorRef.detectChanges();
    this.showAddItemPopUp = true;
  }


  //for supplier add popup page to turn on
  AddSupplierPopUp() {
    this.showAddSupplierPopUp = false;
    // this.index = i;
    this.changeDetectorRef.detectChanges();
    this.showAddSupplierPopUp = true;
  }

  OnNewSupplierAdded($event) {
    this.showAddSupplierPopUp = false;
    var supplier = $event.supplier;
    this.supplierList.unshift(supplier);
    this.supplierList = this.supplierList.slice();
    this.currentSupplier = supplier;
    this.goodReceiptItems = new PHRMGoodsReceiptItemsModel();
  }



  //show or hide GR item level discount
  showitemlvldiscount() {
    this.isItemLevelDiscountApplicable = true;
    this.isMainDiscountApplicable = true;
    let discountParameter = this.coreService.Parameters.find((p) => p.ParameterName == "PharmacyDiscountCustomization" && p.ParameterGroupName == "Pharmacy").ParameterValue;
    discountParameter = JSON.parse(discountParameter);
    this.isItemLevelDiscountApplicable = (discountParameter.EnableItemLevelDiscount == true);
    this.isMainDiscountApplicable = (discountParameter.EnableMainDiscount == true);
  }
  // Get Dispensary List
  GetDispensaryList() {
    this.dispensaryService.GetAllDispensaryList().subscribe(
      (res) => {
        if (res.Status == "OK" && res.Results && res.Results.length > 0) {
          this.dispensaryList = res.Results;
        } else {
          this.msgserv.showMessage("failed", ["Failed to get Dispensary List"]);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  public LoadGoodReceiptHistory() { // of 1 months
    try {
      this.goodReceiptHistory = [];
      this.pharmacyBLService.GetGoodReceiptHistory().subscribe(res => {
        if (res.Status == "OK" && res.Results && res.Results.length > 0) {
          this.goodReceiptHistory = res.Results;
        }
      });

    } catch (err) {
      console.log(err);
    }
  }


  public CheckGRItemHistory(): boolean {
    var NoOfcurrentGRItems = this.grItemList.length;

    if (this.goodReceiptHistory && this.goodReceiptHistory.length > 0) {

      var filteredGRHistory: Array<any> = [];
      // filtering GR-history by supplier Id and no of GR-items that matches with current GR
      filteredGRHistory = this.goodReceiptHistory.filter(a => {
        if (a.SupplierId == this.currentSupplier.SupplierId && NoOfcurrentGRItems == a.items.length) {
          return a;
        }
      });

      var duplicatePastGR: Array<any> = [];
      var invoiceString: string = "";
      if (filteredGRHistory && filteredGRHistory.length) {
        //One block of GR history
        filteredGRHistory.forEach(b => {  // b is One GR history block

          var duplicatePastGRItems: Array<any> = [];
          this.grItemList.forEach(a => {

            var di = b.items.filter(i => i.ItemId == a.ItemId && i.ReceivedQuantity == a.ReceivedQuantity
              && i.GRItemPrice == a.GRItemPrice && i.SubTotal == a.SubTotal);

            if (di && di.length > 0) {
              di.forEach(c => {
                duplicatePastGRItems.push(c); // storing duplicate item
              });
            }

          });
          if (duplicatePastGRItems && duplicatePastGRItems.length == NoOfcurrentGRItems) {
            duplicatePastGR.push(b);
            invoiceString = invoiceString + "\n Invoice No.: " + b.InvoiceNo;
          }
        });


      }
    }
    // if (duplicatePastGR && duplicatePastGR.length > 0) {
    //   var confirmIt = confirm(`Similar GR found with these Invoices: ${invoiceString}\n Want to continue?`);
    //   if (!confirmIt) {
    //     return false;
    //   }
    // }
    return true;
  }

  OnInvoiceChange() {
    this.duplicateInvoice = false;
    this.CheckIsValid = true;
    let invoiceNo = this.goodsReceiptVM.goodReceipt.InvoiceNo;
    let SupplierId = this.currentSupplier.SupplierId;
    let selectedDate = this.goodsReceiptVM.goodReceipt.GoodReceiptDate;
    let isGRCancelled = true;
    let fiscalyearName = (this.fiscalYearList.length > 0) ? this.fiscalYearList.filter(f => moment(f.StartYear).format('YYYY-MM-DD') <= moment(selectedDate).format('YYYY-MM-DD') && moment(f.EndYear).format('YYYY-MM-DD') >= moment(selectedDate).format('YYYY-MM-DD'))[0].FiscalYearName : "";


    if (invoiceNo && SupplierId > 0 && fiscalyearName != "") {
      for (let row of this.goodsReceiptList) {
        if (invoiceNo == row.InvoiceNo && SupplierId == row.SupplierId && fiscalyearName == row.CurrentFiscalYear && isGRCancelled != row.IsCancel) {
          this.duplicateInvoice = true;
          this.CheckIsValid = false;
        }
      }
    }
  }

  HasDuplicateItems(ItemId, i) {

    let seen = new Set();
    var hasDuplicates = this.grItemList.some(obj => {
      return seen.size == seen
        .add(obj.ItemId).size && obj.ItemId != 0 && (obj.ItemId == ItemId || ItemId == null);
    });
    if (hasDuplicates) {
      if (this.grItemList[i].BatchNo && this.grItemList[i].ExpiryDate && this.grItemList[i].GRItemPrice) {

        var hasDuplicates = this.grItemList.some(obj => {

          var myBool1 = seen.size == seen.add(obj.BatchNo).size && obj.BatchNo != "" && (obj.BatchNo == this.grItemList[i].BatchNo);
          var myBool2 = seen.size == seen.add(obj.ExpiryDate).size && obj.ExpiryDate != null && (obj.ExpiryDate == this.grItemList[i].ExpiryDate);
          var myBool3 = seen.size == seen.add(obj.GRItemPrice).size && obj.GRItemPrice != 0 && (obj.GRItemPrice == this.grItemList[i].GRItemPrice);
          if (myBool1 && myBool2 && myBool3) {
            this.CheckIsValid = false;
            return true;
          } else {
            return false;
          }
        });
        return hasDuplicates;

      } else {
        hasDuplicates = true;
      }

    }

    return hasDuplicates;
  }
  public hotkeys(event) {
    if (event.altKey) {
      console.log(event.keyCode);
      switch (event.keyCode) {
        case 80: {// => ALT+P comes here
          if (this.IsGRedit == true) this.EditGR();
          else this.SaveGoodsReceipt();
          break;
        }
        default:
          break;
      }
    }
  }
  setFocusById(id: string, waitingTimeInms = 0) {
    var Timer = setTimeout(() => {
      if (document.getElementById(id)) {
        let nextEl = <HTMLInputElement>document.getElementById(id);
        nextEl.focus();
        nextEl.select();
        clearTimeout(Timer);
      }
    }, waitingTimeInms)
  }
  setFocusToBtnById(id: string, waitingTimeInms = 0) {
    var Timer = setTimeout(() => {
      if (document.getElementById(id)) {
        let nextEl = <HTMLInputElement>document.getElementById(id);
        nextEl.focus();
        clearTimeout(Timer);
      }
    }, waitingTimeInms)
  }
  //Credit Period Validation
  OnCreditPeriodChange() {
    this.checkCreditPeriod = false;
    if (this.goodsReceiptVM.goodReceipt.CreditPeriod < 0 || !Number.isInteger(this.goodsReceiptVM.goodReceipt.CreditPeriod)) {
      this.checkCreditPeriod = true;
    }
  }
}
