import { Component, ChangeDetectorRef, ViewChild, Input } from "@angular/core";
import { Router, RouterOutlet, RouterModule } from "@angular/router";
import { PHRMPurchaseOrderItems } from "../../shared/phrm-purchase-order-items.model";
import * as moment from "moment/moment";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { PharmacyService } from "../../shared/pharmacy.service";
import { PHRMGoodsReceiptItemsModel } from "../../shared/phrm-goods-receipt-items.model";
import { PHRMGoodsReceiptModel } from "../../shared/phrm-goods-receipt.model";
import { PHRMSupplierModel } from "../../shared/phrm-supplier.model";
import { PHRMCompanyModel } from "../../shared/phrm-company.model";
import { PHRMItemMasterModel } from "../../shared/phrm-item-master.model";
import { CommonFunctions } from "../../../shared/common.functions";
import { SecurityService } from "../../../security/shared/security.service";
import { PHRMGoodsReceiptViewModel } from "../../shared/phrm-goods-receipt-vm.model";
import { CallbackService } from '../../../shared/callback.service';
import { PHRMStoreModel } from '../../shared/phrm-store.model';
import { CoreService } from '../../../core/shared/core.service';
import { PHRMPackingTypeModel } from '../../../pharmacy/shared/phrm-packing-type.model';
import * as _ from 'lodash';
import { PHRMGoodsReceiptItemComponent } from "../phrm-gr-item/phrm-gr-item.component";
//import { phrmitemaddComponent } from '../common/phrmitem-add.component';
@Component({
  templateUrl: "./phrm-goods-receipt.html"
})
export class PHRMGoodsReceiptComponent {
  @ViewChild('grItemPop')
  phrmGoodReceiptItemComponent: PHRMGoodsReceiptItemComponent;

  ///view model for binding
  public goodsReceiptVM: PHRMGoodsReceiptViewModel = new PHRMGoodsReceiptViewModel();
  public tempgoodsReceiptVM: PHRMGoodsReceiptViewModel = new PHRMGoodsReceiptViewModel();
  public goodReceiptItems: PHRMGoodsReceiptItemsModel = new PHRMGoodsReceiptItemsModel();
  ///local list variable to get list of PO data and Push into GRList
  public grItemList: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
  ///local varible to bind supplier data
  public currentSupplier: PHRMSupplierModel = new PHRMSupplierModel();
  public supplierList: Array<PHRMSupplierModel> = new Array<PHRMSupplierModel>();

  ///local varible to bind company data
  public currentCompany: Array<PHRMCompanyModel> = new Array<PHRMCompanyModel>();
  public purchaseOrderId: number = 0;
  public SupplierName: string = null;
  //declare boolean loading variable for disable the double click event of button
  loading: boolean = false;
  //for Item Popup purpose
  public index: number = 0;
  public showAddItemPopUp: boolean = false;
  //for Supplier Popup purpose
  public showAddSupplierPopUp: boolean;
  //flag for disable or enable some text boxes order
  IsPOorder: boolean = false;
  IsGRedit: boolean = false;
  showAddGRPage: boolean = false;
  showUpdateGRPage: boolean = false;
  update: boolean = false;
  public goodreceipt: PHRMGoodsReceiptModel;
  //for editing gr and checking duplication
  public oldSupplierId: any;
  public oldInvoiceNo: any;
  public duplicateInvoice: boolean = false;
  //get all is active item list for create new gr
  public itemList: Array<PHRMItemMasterModel> = new Array<PHRMItemMasterModel>();
  public taxList: Array<any>;
  public taxData: Array<any> = [];
  public currentCounter: number = null;
  public itemLst: Array<any> = [];
  public goodsReceiptList: Array<PHRMGoodsReceiptModel> = new Array<PHRMGoodsReceiptModel>();
  //@ViewChild('addItems')
  //addItems: phrmitemaddComponent;
  public storeList: PHRMStoreModel;
  public currentStore: any;
  public tempStore: any;
  //for show and hide packing features
  IsPkgitem: boolean = false;
  //for show and hide item level discount features
  IsitemlevlDis: boolean = false;
  //Show and hide Dispensary Option
  public ShowDispensary: boolean = false;
  public pcktypeList: any;
  public packingtypeList: Array<PHRMPackingTypeModel> = new Array<PHRMPackingTypeModel>();
  public idList: Array<any> = [];
  public IsGReditAfterModification: boolean = false;
  public dispensaryList: Array<any> = [];
  public selectedDispensary: any = null;
  public goodReceiptHistory: Array<any> = [];
  public CheckIsValid: boolean = true;
  public isExpiryNotApplicable: boolean = false;
  public ExpiryAfter: number = 0;
  //for keep/change cccharge value at edite gritem.
  public itemid: number = 0;
  public IsStripRateEdit: boolean = false;
  public fiscalYearList: Array<any> = new Array<any>();
  constructor(
    public pharmacyService: PharmacyService,
    public coreService: CoreService,
    public pharmacyBLService: PharmacyBLService,
    public securityService: SecurityService,
    public msgserv: MessageboxService,
    public router: Router,
    public callBackService: CallbackService,
    public changeDetectorRef: ChangeDetectorRef
  ) {
    this.currentCounter = this.securityService.getPHRMLoggedInCounter().CounterId;

    if (this.currentCounter < 1) {
      this.callBackService.CallbackRoute = "/Pharmacy/Order/GoodsReceiptItems";
      this.router.navigate(["/Pharmacy/ActivateCounter"]);
    }
    else {
      this.GetAllFiscalYears();
      this.supplierList = new Array<PHRMSupplierModel>(); //make empty supllier
      this.currentSupplier = new PHRMSupplierModel();
      this.itemList = new Array<PHRMItemMasterModel>();
      this.GetAllItemData();
      this.GetSupplierList();
      this.goodsReceiptVM.goodReceipt.GoodReceiptDate = moment().format("YYYY-MM-DD");


      this.getGoodsReceiptList();
      this.getMainStore();
      this.GetDispensaryList();
      this.LoadGoodReceiptHistory();
      this.GetPackingTypeList();
      this.showitemlvldiscount();
      this.ShowDispensaryoption();
      this.showpacking();
    }
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

  //this fuction load all item master data
  GetAllItemData() {
    try {
      this.pharmacyBLService.GetItemList().finally(() => {
        this.CheckForPoOrGrEditMode();
      })
        .subscribe(
          (res) => {
            if (res.Status == "OK") {
              this.itemList = res.Results;
              this.itemLst = this.itemList;
            } else {
              console.log(res.ErrorMessage);
              this.msgserv.showMessage("failed", [
                "Failed to get item list, see detail in console log",
              ]);
            }
          },
          (err) => {
            console.log(err.ErrorMessage);
            this.msgserv.showMessage("error", [
              "Failed to get item list., see detail in console log",
            ]);
          }
        );
    } catch (exception) {
      console.log(exception);
      this.msgserv.showMessage("error", ["error details see in console log"]);
    }
  }

  AddGRItemPopUp(i) {
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
      this.SetFocusById('btn_AddNew');
    }

  }
  Close() {
    this.showAddGRPage = false;
  }

  EditRow(i: number) {
    this.update = true;
    this.showUpdateGRPage = true;
    this.changeDetectorRef.detectChanges();
    //this.phrmGoodReceiptItemComponent.goodReceiptItem = this.grItemList[i];
    //this.phrmGoodReceiptItemComponent.goodReceiptItem = JSON.parse(JSON.stringify(this.grItemList[i]));
    this.phrmGoodReceiptItemComponent.goodReceiptItem = _.cloneDeep(this.grItemList[i]);
    this.phrmGoodReceiptItemComponent.goodReceiptItem.IndexOnEdit = i;
    //this.phrmGoodReceiptItemComponent.item = JSON.parse(JSON.stringify( this.grItemList[i].SelectedItem));
    this.phrmGoodReceiptItemComponent.item = _.cloneDeep(this.grItemList[i].SelectedItem);
    this.phrmGoodReceiptItemComponent.update = true;
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
    ////for fixing the issue of Null error in client side during refresh
    if (PurchaseOrderId == null) {
      // this.msgserv.showMessage("notice-message", ["Please Select Proper Goods Receipt"]);
      this.IsPOorder = false;
    } else {
      this.pharmacyBLService.GetPHRMPOItemsForGR(PurchaseOrderId).subscribe(
        (res) => {
          if (res.Status == "OK") {
            this.IsPOorder = true;
            ////this is the final data and we have stored in goodsReceiptVM because we have to display data in View
            this.goodsReceiptVM.purchaseOrder = res.Results[0].PHRMPurchaseOrder;
            this.purchaseOrderId = res.Results[0].PHRMPurchaseOrder.PurchaseOrderId;
            this.currentSupplier = res.Results[0].PHRMSupplier;
            this.currentCompany = res.Results;
            this.goodsReceiptVM.goodReceipt.PurchaseOrderId = this.purchaseOrderId;
            ///function to get PoItems And Set in PoItems
            this.GetGrItemsFromPoItems();
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
            this.goodsReceiptVM.goodReceipt.DiscountAmount = res.Results.DiscountAmount;
            this.goodsReceiptVM.goodReceipt.TotalAmount = res.Results.TotalAmount;
            this.goodsReceiptVM.goodReceipt.Remarks = res.Results.Remarks;
            this.goodsReceiptVM.goodReceipt.Adjustment = res.Results.Adjustment;
            this.goodsReceiptVM.goodReceipt.CreatedBy = res.Results.CreatedBy;
            this.goodsReceiptVM.goodReceipt.CreatedOn = res.Results.CreatedOn;
            this.goodsReceiptVM.goodReceipt.VATAmount = res.Results.VATAmount;
            this.goodsReceiptVM.goodReceipt.IsCancel = res.Results.IsCancel;
            this.goodsReceiptVM.goodReceipt.IsTransferredToACC = res.Results.IsTransferredToACC;
            this.goodsReceiptVM.goodReceipt.TransactionType = res.Results.TransactionType;
            this.goodsReceiptVM.goodReceipt.StoreId = res.Results.StoreId;
            this.goodsReceiptVM.goodReceipt.CreditPeriod = res.Results.CreditPeriod;
            this.goodsReceiptVM.goodReceipt.StoreName = res.Results.StoreName;
            this.tempStore = this.storeList;
            this.AssignStore();
            var goodsReceiptItems: Array<any> = res.Results.GoodReceiptItem;
            this.changeDetectorRef.detectChanges();
            for (let i = 0; i < goodsReceiptItems.length; i++) {
              this.changeDetectorRef.detectChanges();
              var currGRItem: PHRMGoodsReceiptItemsModel = new PHRMGoodsReceiptItemsModel();
              this.CheckForPackingQtyValidation(currGRItem);
              currGRItem.GoodReceiptItemId = goodsReceiptItems[i].GoodReceiptItemId;
              currGRItem.GoodReceiptId = goodsReceiptItems[i].GoodReceiptId;
              currGRItem.CompanyName = goodsReceiptItems[i].CompanyName;
              currGRItem.SupplierName = goodsReceiptItems[i].SupplierName;
              currGRItem.ItemId = goodsReceiptItems[i].ItemId;
              this.itemid = currGRItem.ItemId;                                ///set itemid for if item change then chabge cccharge value else keep old value. 
              currGRItem.SelectedItem = this.itemList.find((a) => a.ItemId == currGRItem.ItemId);
              currGRItem.BatchNo = goodsReceiptItems[i].BatchNo;
              currGRItem.ExpiryDate = goodsReceiptItems[i].ExpiryDate;
              if (currGRItem.ExpiryDate != null) {
                currGRItem.ExpiryDate = moment(currGRItem.ExpiryDate).format("YYYY-MM");
              }
              currGRItem.ReceivedQuantity = goodsReceiptItems[i].ReceivedQuantity;
              var packQty;
              //this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PHRMItemMaster.PackingTypeId == null
              var itemData: Array<any> = [];
              itemData = this.itemList.filter(a => a.ItemId == goodsReceiptItems[i].ItemId);

              if (itemData[0].PackingTypeId != null) {
                packQty = this.packingtypeList.find(a => a.PackingTypeId == itemData[0].PackingTypeId);
                currGRItem.PackingQty = packQty.PackingQuantity;
                currGRItem.ItemQTy = goodsReceiptItems[i].ReceivedQuantity / currGRItem.PackingQty;
              }
              else {
                currGRItem.ItemQTy = goodsReceiptItems[i].ReceivedQuantity;
              }
              currGRItem.StripRate = goodsReceiptItems[i].StripRate;
              currGRItem.FreeQuantity = goodsReceiptItems[i].FreeQuantity;
              currGRItem.RejectedQuantity = goodsReceiptItems[i].RejectedQuantity;
              currGRItem.UOMName = goodsReceiptItems[i].UOMName;
              currGRItem.SellingPrice = goodsReceiptItems[i].SellingPrice;
              currGRItem.GRItemPrice = goodsReceiptItems[i].GRItemPrice;
              currGRItem.SubTotal = goodsReceiptItems[i].SubTotal;
              currGRItem.VATPercentage = goodsReceiptItems[i].VATPercentage;
              if (goodsReceiptItems[i].CCCharge == null) {
                currGRItem.CCCharge = 0;
              }
              else {
                currGRItem.CCCharge = goodsReceiptItems[i].CCCharge;
              }
              currGRItem.DiscountPercentage = goodsReceiptItems[i].DiscountPercentage;
              currGRItem.DiscountAmount = goodsReceiptItems[i].DiscountAmount;
              currGRItem.TotalAmount = goodsReceiptItems[i].TotalAmount;
              currGRItem.CreatedBy = goodsReceiptItems[i].CreatedBy;
              currGRItem.CreatedOn = goodsReceiptItems[i].CreatedOn;
              currGRItem.MRP = goodsReceiptItems[i].MRP;
              currGRItem.CounterId = goodsReceiptItems[i].CounterId;
              currGRItem.AvailableQuantity = goodsReceiptItems[i].AvailableQuantity;
              currGRItem.QtyDiffCount = goodsReceiptItems[i].QtyDiffCount;
              currGRItem.StkManageInOut = goodsReceiptItems[i].StkManageInOut;
              this.grItemList.push(currGRItem);
              this.UpdatePackingSettingForItem(currGRItem);
            }
            this.changeDetectorRef.detectChanges();

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
      for (var a in this.goodsReceiptVM.goodReceipt.GoodReceiptValidator
        .controls) {
        this.goodsReceiptVM.goodReceipt.GoodReceiptValidator.controls[
          a
        ].markAsDirty();
        this.goodsReceiptVM.goodReceipt.GoodReceiptValidator.controls[
          a
        ].updateValueAndValidity();
        if (
          this.goodsReceiptVM.goodReceipt.IsValidCheck(undefined, undefined) ==
          false
        ) {
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
          this.grItemList[c].CounterId = this.currentCounter;

        }
        if ((this.grItemList[c].FreeQuantity != 0) && (this.grItemList[c].ItemQTy == 0 || this.grItemList[c].ReceivedQuantity == 0)) {
          this.grItemList[c].GoodReceiptItemValidator.controls["ItemQTy"].disable();
          this.grItemList[c].GoodReceiptItemValidator.controls["ReceivedQuantity"].disable();
        }
        if (this.grItemList[c].IsValidCheck(undefined, undefined) == false) {
          CheckIsValid = false;

        }
      }
      if (CheckIsValid) {
        /////assigning GRList To GoodsReceipt View Model
        for (let k = 0; k < this.grItemList.length; k++) {
          this.goodsReceiptVM.goodReceipt.GoodReceiptItem[k] = this.grItemList[
            k
          ];
        }
        //////this function checking GrItems whose received quantity is not equal to zero we can pass those item to server call
        for (let c = 0; c < this.goodsReceiptVM.goodReceipt.GoodReceiptItem.length; c++) {
          if (
            this.goodsReceiptVM.goodReceipt.GoodReceiptItem[c].ReceivedQuantity != 0 ||
            this.goodsReceiptVM.goodReceipt.GoodReceiptItem[c].FreeQuantity != 0
          ) {
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

          this.goodsReceiptVM.purchaseOrder.SupplierId = this.currentSupplier.SupplierId;
          this.goodsReceiptVM.purchaseOrder.SupplierName = this.currentSupplier.SupplierName;
          if (!this.IsPOorder) {
            this.MakePoWithPOItemsForPost(this.goodsReceiptVM);
          } else {
            this.ChangePOAndPOItemsStatus();
          }
          this.pharmacyBLService
            .UpdateGoodsReceipt(this.goodsReceiptVM.goodReceipt)
            .subscribe(
              (res) => {
                if (res.Status == "OK") {
                  this.msgserv.showMessage("success", [
                    "Goods Receipt is Updated and Saved.",
                  ]);
                  this.pharmacyService.CreateNew();
                  this.IsPOorder = false;
                  this.IsGRedit = false;
                  this.itemid = 0;
                  //navigate to GRLIST Page
                  this.router.navigate(["/Pharmacy/Order/GoodsReceiptList"]);
                } else {
                  this.msgserv.showMessage("failed", [
                    res.Results,
                    " has been transfered or modified",
                  ]);
                  this.logError(res.ErrorMessage);
                }
                this.loading = false;
              },
              (err) => {
                (this.loading = false), this.logError(err);
              }
            );
        } else {
          this.msgserv.showMessage("notice-message", [
            "Received Qty of All Items is Zero",
          ]);
        }
      } else {
        this.msgserv.showMessage("notice-message", [
          "missing value, please fill it",
        ]);
      }
    }
  }
  //Method for transforming POItems to GRItems
  GetGrItemsFromPoItems() {
    for (var i = 0; i < this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems.length; i++
    ) {
      var currGRItem: PHRMGoodsReceiptItemsModel = new PHRMGoodsReceiptItemsModel();
      this.CheckForPackingQtyValidation(currGRItem);
      currGRItem.ItemId = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].ItemId;
      currGRItem.ItemName = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PHRMItemMaster.ItemName;
      currGRItem.SellingPrice = 0;
      currGRItem.VATPercentage = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PHRMItemMaster.VATPercentage;
      currGRItem.ExpiryDate = moment().format("YYYY-MM-DD");
      //currGRItem.ManufactureDate = moment().format('YYYY-MM-DD');
      currGRItem.GRItemPrice = 0; // need to refacor again
      currGRItem.DiscountPercentage = 0;
      currGRItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      currGRItem.SupplierName = this.currentSupplier.SupplierName;
      currGRItem.CompanyName = this.currentCompany[i].CompanyName;
      currGRItem.SelectedItem = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PHRMItemMaster;
      currGRItem.CounterId = this.currentCounter;
      //currGRItem.UOMName = itm.UOMName;
      if (
        this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].ReceivedQuantity == 0
      ) {
        ///if pending qty is zero then replace it with original Purchase Oty
        currGRItem.PendingQuantity = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].Quantity;
      } else {
        currGRItem.PendingQuantity = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PendingQuantity;
      }
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
      var isValid = true;
      var isValid = this.CheckGoodReceiptValidity();

      var goSigal: boolean;
      if (this.CheckIsValid && isValid && this.grItemList.length > 0) {
        goSigal = this.CheckGRItemHistory();
      }
      if (goSigal) {
        if (this.CheckIsValid && isValid) {
          /////assigning GRList To GoodsReceipt View Model
          for (let k = 0; k < this.grItemList.length; k++) {
            this.goodsReceiptVM.goodReceipt.GoodReceiptItem[k] = this.grItemList[k];
            this.goodsReceiptVM.goodReceipt.IsPacking = this.grItemList[k].IsPacking == true ? true : false
            this.goodsReceiptVM.goodReceipt.IsItemDiscountApplicable = this.grItemList[k].DiscountAmount ? true : false;

          }
          //////this function checking GrItems whose received quantity is not equal to zero we can pass those item to server call
          for (let c = 0; c < this.goodsReceiptVM.goodReceipt.GoodReceiptItem.length; c++) {
            if (
              this.goodsReceiptVM.goodReceipt.GoodReceiptItem[c]
                .ReceivedQuantity != 0 ||
              this.goodsReceiptVM.goodReceipt.GoodReceiptItem[c].FreeQuantity != 0
            ) {
              /////assign GrItem whose received qty is not equal to zero then push to Temp local varible of view model
              this.tempgoodsReceiptVM.goodReceipt.GoodReceiptItem.push(
                this.goodsReceiptVM.goodReceipt.GoodReceiptItem[c]
              );
            }
          }
          //////null all original GrItems because and assign those item to this view model whose received qty is greater then zero
          this.goodsReceiptVM.goodReceipt.GoodReceiptItem = [];
          for (let e = 0; e < this.tempgoodsReceiptVM.goodReceipt.GoodReceiptItem.length; e++) {
            /////push temporary stored GrItems to Original GrItems Array
            this.goodsReceiptVM.goodReceipt.GoodReceiptItem.push(
              this.tempgoodsReceiptVM.goodReceipt.GoodReceiptItem[e]
            );
          }

          if (this.goodsReceiptVM.goodReceipt.GoodReceiptItem.length > 0) {
            this.loading = true;
            this.goodsReceiptVM.goodReceipt.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.goodsReceiptVM.goodReceipt.SupplierId = this.currentSupplier.SupplierId;
            this.goodsReceiptVM.goodReceipt.StoreId = this.currentStore.StoreId;
            this.goodsReceiptVM.goodReceipt.StoreName = this.currentStore.Name;

            this.goodsReceiptVM.purchaseOrder.SupplierId = this.currentSupplier.SupplierId;
            this.goodsReceiptVM.purchaseOrder.SupplierName = this.currentSupplier.SupplierName;
            if (!this.IsPOorder) {
              this.MakePoWithPOItemsForPost(this.goodsReceiptVM);
            } else {
              this.ChangePOAndPOItemsStatus();
            }
            this.pharmacyBLService
              .PostGoodReceipt(this.goodsReceiptVM, this.IsPOorder)
              .subscribe(
                (res) => {
                  this.CallBackAddGoodsReceipt(res);
                  this.loading = false;
                },
                (err) => {
                  (this.loading = false), this.logError(err);
                }
              );
          } else {
            this.msgserv.showMessage("notice-message", [
              "Received Qty of All Items is Zero",
            ]);
          }

        } else {
          this.msgserv.showMessage("notice-message", [
            "Missing or Invalid value ! !",
          ]);
        }
      }

    }
  }

  public CheckGoodReceiptValidity(): boolean {
    var CheckIsValid = true;
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
    if (
      this.goodsReceiptVM.goodReceipt.SendDirectToDispensary &&
      !this.goodsReceiptVM.goodReceipt.SelectedDispensaryId
    ) {
      alert(
        "Please select Dispensary or untick 'Send Directly to Despencery' button! "
      );
      CheckIsValid = false;
    }

    // for loop is used to show GoodsReceiptValidator message ..if required  field is not filled
    for (var a in this.goodsReceiptVM.goodReceipt.GoodReceiptValidator.controls) {

      this.goodsReceiptVM.goodReceipt.GoodReceiptValidator.controls[a].markAsDirty();
      this.goodsReceiptVM.goodReceipt.GoodReceiptValidator.controls[a].updateValueAndValidity();

      if (this.goodsReceiptVM.goodReceipt.IsValidCheck(undefined, undefined) == false) {
        CheckIsValid = false;
      }
    }

    for (var b in this.goodReceiptItems.GoodReceiptItemValidator.controls) {
      this.goodReceiptItems.GoodReceiptItemValidator.controls[b].markAsDirty();
      this.goodReceiptItems.GoodReceiptItemValidator.controls[b].updateValueAndValidity();
    }

    for (var c = 0; c < this.grItemList.length; c++) {

      for (var ctrl in this.grItemList[c].GoodReceiptItemValidator.controls) {

        if ((this.grItemList[c].FreeQuantity != 0) && (this.grItemList[c].ItemQTy == 0 || this.grItemList[c].ReceivedQuantity == 0)) {
          if (this.grItemList[c].GoodReceiptItemValidator.status != "VALID") {
            this.grItemList[c].GoodReceiptItemValidator.controls["ItemQTy"].disable();
            this.grItemList[c].GoodReceiptItemValidator.controls["ReceivedQuantity"].disable();
          }
        }
        if (this.isExpiryNotApplicable && this.grItemList[c].GoodReceiptItemValidator.controls["ExpiryDate"] == this.grItemList[c].GoodReceiptItemValidator.controls[ctrl]) {
          this.grItemList[c].GoodReceiptItemValidator.controls["ExpiryDate"].disable();
          this.grItemList[c].GoodReceiptItemValidator.updateValueAndValidity();

        } else {
          this.grItemList[c].GoodReceiptItemValidator.controls[
            ctrl
          ].markAsDirty();
          this.grItemList[c].GoodReceiptItemValidator.controls[
            ctrl
          ].updateValueAndValidity();
          this.grItemList[c].CounterId = this.currentCounter;
        }
      }
      if (this.grItemList[c].IsValidCheck(undefined, undefined) == false) {
        CheckIsValid = false;
      }
    }


    return CheckIsValid;
  }

  //call after Goods Receipt saved
  CallBackAddGoodsReceipt(res) {
    if (res.Status == "OK") {
      this.msgserv.showMessage("success", [
        "Goods Receipt is Generated and Saved.",
      ]);
      this.pharmacyService.CreateNew();
      this.IsPOorder = false;
      this.purchaseOrderId = 0;
      //navigate to GRLIST Page
      this.router.navigate(["/Pharmacy/Order/GoodsReceiptList"]);
    } else {
      this.msgserv.showMessage("failed", [
        "failed to add result.. please check log for details.",
      ]);
      this.logError(res.ErrorMessage);
    }
  }

  logError(err: any) {
    this.purchaseOrderId = 0;
    this.pharmacyService.CreateNew();
    this.IsPOorder = false;
    //this.router.navigate(["/Pharmacy/Order/GoodsReceiptList"]);
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


  CalculationForPHRMGoodsReceipt(changeType: string = null) {

    let aggregateResult = this.grItemList.reduce((aggregatedObject, currentItem) => {
      aggregatedObject.subTotal += currentItem.SubTotal;
      aggregatedObject.discountTotal += currentItem.DiscountAmount;
      aggregatedObject.vatTotal += currentItem.VATAmount;
      aggregatedObject.totalAmount += currentItem.TotalAmount;
      return aggregatedObject;
    }, { subTotal: 0, discountTotal: 0, vatTotal: 0, totalAmount: 0 });



    this.goodsReceiptVM.goodReceipt.SubTotal = CommonFunctions.parsePhrmAmount(aggregateResult.subTotal);
    this.goodsReceiptVM.goodReceipt.TotalAmount = aggregateResult.totalAmount;
    if (this.goodsReceiptVM.goodReceipt.DiscountAmount == 0) {
      this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parsePhrmAmount(this.goodsReceiptVM.goodReceipt.TotalAmount - this.goodsReceiptVM.goodReceipt.SubTotal);
    }
    this.goodsReceiptVM.goodReceipt.Adjustment = CommonFunctions.parseFinalAmount(this.goodsReceiptVM.goodReceipt.TotalAmount) - this.goodsReceiptVM.goodReceipt.TotalAmount;
    this.goodsReceiptVM.goodReceipt.Adjustment = CommonFunctions.parsePhrmAmount(this.goodsReceiptVM.goodReceipt.Adjustment);
    this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parseFinalAmount(this.goodsReceiptVM.goodReceipt.TotalAmount);


    if (changeType == "disc-percent") {
      let discPercent = this.goodsReceiptVM.goodReceipt.DiscountPercent;
      if (!discPercent) {
        discPercent = 0;
      }
      let subTotal = this.goodsReceiptVM.goodReceipt.SubTotal;
      let discAmt = subTotal * discPercent / 100;

      this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parsePhrmAmount(discAmt);
      this.goodsReceiptVM.goodReceipt.TotalAmount = subTotal - discAmt;
      this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parsePhrmAmount(this.goodsReceiptVM.goodReceipt.TotalAmount)

    }
    else if (changeType == "disc-amount") {
      let discAmt = this.goodsReceiptVM.goodReceipt.DiscountAmount;
      if (!discAmt) {
        discAmt = 0;
      }
      let subTotal = this.goodsReceiptVM.goodReceipt.SubTotal;

      let discPercent = discAmt * 100 / subTotal;

      this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parsePhrmAmount(discAmt);
      this.goodsReceiptVM.goodReceipt.DiscountPercent = CommonFunctions.parsePhrmAmount(discPercent);
      this.goodsReceiptVM.goodReceipt.TotalAmount = subTotal - discAmt;

    }
    else {
      this.goodsReceiptVM.goodReceipt.DiscountAmount = aggregateResult.discountTotal;

    }


    // let STotal: number = 0;

    // let TAmount: number = 0;
    // let VAmount: number = 0;
    // let DAmount: number = 0;
    // let TotalitemlevDisPer: number = 0;
    // let TotalitemlevDisAmt: number = 0;
    // let Subtotalofitm: number = 0;

    // let aggregateResult = this.grItemList.reduce((aggregatedObject, currentItem) => {
    //   aggregatedObject.subTotal += currentItem.SubTotal;
    //   aggregatedObject.discountTotal += currentItem.DiscountAmount;
    //   aggregatedObject.vatTotal += currentItem.VATAmount;
    //   aggregatedObject.totalAmount += currentItem.TotalAmount;
    //   return aggregatedObject;
    // }, { subTotal: 0, discountTotal: 0, vatTotal: 0, totalAmount: 0 });

    // TAmount = aggregateResult.totalAmount;
    // VAmount = aggregateResult.vatTotal;
    // TotalitemlevDisAmt = aggregateResult.discountTotal;
    // Subtotalofitm = aggregateResult.subTotal;


    // //for bulk discount calculation and conversion of percentage into amount and vice versa
    // if (this.IsitemlevlDis == false) {
    //   if (discPer == 0 && discAmt > 0) {
    //     this.goodsReceiptVM.goodReceipt.TotalAmount =
    //       CommonFunctions.parsePhrmAmount(STotal) - discAmt;
    //     this.goodsReceiptVM.goodReceipt.DiscountAmount = discAmt;
    //     discPer = (discAmt / CommonFunctions.parsePhrmAmount(STotal)) * 100;
    //     this.goodsReceiptVM.goodReceipt.DiscountPercent = CommonFunctions.parseAmount(
    //       discPer
    //     );
    //   }
    //   if (discPer > 0 && discAmt == 0) {
    //     discAmt = CommonFunctions.parseAmount((TAmount * discPer) / 100);
    //     this.goodsReceiptVM.goodReceipt.TotalAmount =
    //       CommonFunctions.parsePhrmAmount(STotal) - discAmt;
    //     this.goodsReceiptVM.goodReceipt.DiscountAmount = discAmt;
    //     this.goodsReceiptVM.goodReceipt.DiscountPercent = discPer;
    //   }
    //   if (discPer == 0 && discAmt == 0 && vatAmt == 0) {
    //     this.goodsReceiptVM.goodReceipt.SubTotal = CommonFunctions.parsePhrmAmount(STotal);
    //     this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parsePhrmAmount(TAmount
    //     );
    //     //this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parsePhrmAmount(DAmount);
    //     this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parsePhrmAmount(
    //       VAmount
    //     );
    //     this.goodsReceiptVM.goodReceipt.DiscountAmount = 0;
    //     this.goodsReceiptVM.goodReceipt.DiscountPercent = 0;
    //   }
    //   if (vatAmt >= 0) {
    //     this.goodsReceiptVM.goodReceipt.VATAmount = vatAmt;
    //     this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parseAmount(
    //       this.goodsReceiptVM.goodReceipt.SubTotal -
    //       this.goodsReceiptVM.goodReceipt.DiscountAmount +
    //       vatAmt
    //     );
    //   } else {
    //     this.goodsReceiptVM.goodReceipt.SubTotal = CommonFunctions.parsePhrmAmount(
    //       STotal
    //     );
    //     this.goodsReceiptVM.goodReceipt.TotalAmount =
    //       CommonFunctions.parsePhrmAmount(TAmount) -
    //       this.goodsReceiptVM.goodReceipt.DiscountAmount;
    //     //this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parsePhrmAmount(DAmount);
    //     this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parsePhrmAmount(
    //       VAmount
    //     );
    //   }
    // }
    // else {                                                                             //this cal for total item level discount
    //   this.goodsReceiptVM.goodReceipt.SubTotal = CommonFunctions.parsePhrmAmount(
    //     Subtotalofitm
    //   );
    //   this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parsePhrmAmount(
    //     TotalitemlevDisAmt
    //   );
    //   let totaldisper = (this.goodsReceiptVM.goodReceipt.DiscountAmount / this.goodsReceiptVM.goodReceipt.SubTotal) * 100;
    //   this.goodsReceiptVM.goodReceipt.DiscountPercent = CommonFunctions.parseAmount(
    //     totaldisper
    //   );
    //   this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parsePhrmAmount(
    //     TAmount
    //   );
    //   this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parsePhrmAmount(
    //     VAmount
    //   );
    //   if (vatAmt > 0) {
    //     this.goodsReceiptVM.goodReceipt.VATAmount = vatAmt;
    //     this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parseAmount(
    //       this.goodsReceiptVM.goodReceipt.SubTotal -
    //       this.goodsReceiptVM.goodReceipt.DiscountAmount +
    //       vatAmt
    //     );
    //   }
    // }


    // this.goodsReceiptVM.goodReceipt.Adjustment =
    //   CommonFunctions.parseFinalAmount(
    //     this.goodsReceiptVM.goodReceipt.TotalAmount
    //   ) - this.goodsReceiptVM.goodReceipt.TotalAmount;
    // this.goodsReceiptVM.goodReceipt.Adjustment = CommonFunctions.parseAmount(
    //   this.goodsReceiptVM.goodReceipt.Adjustment
    // );
    // this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parseFinalAmount(
    //   this.goodsReceiptVM.goodReceipt.TotalAmount
    // );

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
    if (this.IsitemlevlDis == false) {
      if (discPer == 0 && discAmt > 0) {
        this.goodsReceiptVM.goodReceipt.TotalAmount =
          CommonFunctions.parsePhrmAmount(STotal) - discAmt;
        this.goodsReceiptVM.goodReceipt.DiscountAmount = discAmt;
        discPer = (discAmt / CommonFunctions.parsePhrmAmount(STotal)) * 100;
        this.goodsReceiptVM.goodReceipt.DiscountPercent = CommonFunctions.parseAmount(
          discPer
        );
      }
      if (discPer > 0 && discAmt == 0) {
        discAmt = CommonFunctions.parseAmount((TAmount * discPer) / 100);
        this.goodsReceiptVM.goodReceipt.TotalAmount =
          CommonFunctions.parsePhrmAmount(STotal) - discAmt;
        this.goodsReceiptVM.goodReceipt.DiscountAmount = discAmt;
        this.goodsReceiptVM.goodReceipt.DiscountPercent = discPer;
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
        this.goodsReceiptVM.goodReceipt.DiscountPercent = 0;
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
      this.goodsReceiptVM.goodReceipt.DiscountPercent = CommonFunctions.parseAmount(
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
        this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parseAmount(
          this.goodsReceiptVM.goodReceipt.SubTotal -
          this.goodsReceiptVM.goodReceipt.DiscountAmount +
          vatAmt
        );
      }
    }


    this.goodsReceiptVM.goodReceipt.Adjustment =
      CommonFunctions.parseFinalAmount(
        this.goodsReceiptVM.goodReceipt.TotalAmount
      ) - this.goodsReceiptVM.goodReceipt.TotalAmount;
    this.goodsReceiptVM.goodReceipt.Adjustment = CommonFunctions.parseAmount(
      this.goodsReceiptVM.goodReceipt.Adjustment
    );
    this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parseFinalAmount(
      this.goodsReceiptVM.goodReceipt.TotalAmount
    );
  }


  private CheckForPackingQtyValidation(temp: PHRMGoodsReceiptItemsModel) {
    if (this.IsPkgitem == false) {
      temp.GoodReceiptItemValidator.controls["PackingQuantity"].disable();
      temp.GoodReceiptItemValidator.controls["ItemQTy"].disable();
    }
  }

  //to delete the row
  DeleteGrItemRow(index) {
    if (this.IsGRedit) {
      this.msgserv.showMessage("Failed", [
        "Can not delete any items in edit mode",
      ]);
      return;
    }
    // if the index is 0 then ..  currentPOItem is pushhed in POItems to show the textboxes
    if (this.grItemList.length > 0) {
      //this will remove the data from the array
      this.grItemList.splice(index, 1);
    }
    if (index == 0 && this.grItemList.length == 0) {
      let tempGRItemObj = new PHRMGoodsReceiptItemsModel();
      this.grItemList.push(tempGRItemObj);
      //this.CalculationForPHRMGoodsReceiptItem(this.grItemList[0], 0);
      this.changeDetectorRef.detectChanges();
    } else {
      this.CalculationForPHRMGoodsReceipt();
      this.changeDetectorRef.detectChanges();
    }
  }

  //After Goods Receipt Generation Updating The Pending and Received Qty of PO Item and also PO
  ChangePOAndPOItemsStatus() {
    //Set the Received and Pending Quantity for Each Purchaser Order Item
    for (
      var i = 0;
      i < this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems.length;
      i++
    ) {
      this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[
        i
      ].ReceivedQuantity =
        this.grItemList[i].ReceivedQuantity -
        this.grItemList[i].FreeQuantity +
        this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i]
          .ReceivedQuantity;
      let pending =
        this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].Quantity - this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].ReceivedQuantity;
      if (pending > 0) {
        this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PendingQuantity = pending;
      } else {
        this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PendingQuantity = 0;
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
      tempPOItem.StandaredPrice = goodsReceiptVM.goodReceipt.GoodReceiptItem[x].SelectedItem.StandardPrice;
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
      grItemToUpdate.GoodReceiptItemValidator.controls["PackingQuantity"].setValue("N/A");
      grItemToUpdate.PackingName = "N/A";
      //grItemToUpdate.ReceivedQuantity = grItemToUpdate.ItemQTy;
      grItemToUpdate.ItemQTy = grItemToUpdate.ReceivedQuantity;
      grItemToUpdate.GoodReceiptItemValidator.updateValueAndValidity();
    }
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
    this.purchaseOrderId = 0;
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
    this.goodReceiptItems = new PHRMGoodsReceiptItemsModel();
  }



  //show or hide GR item level discount
  showitemlvldiscount() {
    this.IsitemlevlDis = true;
    let itmdis = this.coreService.Parameters.find(
      (p) =>
        p.ParameterName == "PharmacyItemlvlDiscount" &&
        p.ParameterGroupName == "Pharmacy"
    ).ParameterValue;
    if (itmdis == "true") {
      this.IsitemlevlDis = true;
    } else {
      this.IsitemlevlDis = false;
    }
  }
  // Get Dispensary List
  GetDispensaryList() {
    this.pharmacyBLService.GetDispensaryList().subscribe(
      (res) => {
        if (res.Status == "OK" && res.Results && res.Results.length > 0) {
          this.dispensaryList = res.Results;
          this.selectedDispensary = this.dispensaryList[0];
          this.goodsReceiptVM.goodReceipt.SelectedDispensaryId = this.selectedDispensary.DispensaryId;
        } else {
          this.msgserv.showMessage("failed", ["Failed to get Dispensary List"]);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  SetSelectedDispensary() {
    if (this.selectedDispensary && this.selectedDispensary.DispensaryId) {
      this.goodsReceiptVM.goodReceipt.SelectedDispensaryId = this.selectedDispensary.DispensaryId;
    } else {
      this.goodsReceiptVM.goodReceipt.SelectedDispensaryId = null;
    }
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
    if (duplicatePastGR && duplicatePastGR.length > 0) {
      var confirmIt = confirm(`Similar GR found with these Invoices: ${invoiceString}\n Want to continue?`);
      if (!confirmIt) {
        return false;
      }
    }
    return true;
  }

  OnInvoiceChange() {
    this.duplicateInvoice = false;
    this.CheckIsValid = true;
    let invoiceNo = this.goodsReceiptVM.goodReceipt.InvoiceNo;
    let SupplierId = this.currentSupplier.SupplierId;
    let selectedDate = this.goodsReceiptVM.goodReceipt.GoodReceiptDate;
    let fiscalyearName = (this.fiscalYearList.length > 0) ? this.fiscalYearList.filter(f => f.StartYear <= selectedDate && f.EndYear >= selectedDate)[0].FiscalYearName : "";
    if (invoiceNo && SupplierId > 0 && fiscalyearName != "") {
      for (let i = 0; i < this.goodsReceiptList.length; i++) {
        if (invoiceNo == this.goodsReceiptList[i].InvoiceNo && SupplierId == this.goodsReceiptList[i].SupplierId &&
          fiscalyearName == this.goodsReceiptList[i].CurrentFiscalYear) {
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




  //show or hide  Send Directly to Dispensary option
  ShowDispensaryoption() {
    this.ShowDispensary = true;
    let showdisp = this.coreService.Parameters.find(
      (p) =>
        p.ParameterName == "ShowDispensaryOption" &&
        p.ParameterGroupName == "Pharmacy"
    ).ParameterValue;
    if (showdisp == "true") {
      this.ShowDispensary = true;
      this.goodsReceiptVM.goodReceipt.SendDirectToDispensary = true;
      this.goodsReceiptVM.goodReceipt.SelectedDispensaryId = 1;
    } else {
      this.ShowDispensary = false;
      this.goodsReceiptVM.goodReceipt.SendDirectToDispensary = false;
      this.goodsReceiptVM.goodReceipt.SelectedDispensaryId = 0;
    }
  }



}
