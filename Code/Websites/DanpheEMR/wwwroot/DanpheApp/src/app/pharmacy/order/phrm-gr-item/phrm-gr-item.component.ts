import { ChangeDetectorRef, Component, EventEmitter, Input, Output, Renderer2 } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment/moment";
import { CoreService } from '../../../core/shared/core.service';
import { SecurityService } from "../../../security/shared/security.service";
import { CallbackService } from '../../../shared/callback.service';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses } from "../../../shared/shared-enums";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { PharmacyService } from "../../shared/pharmacy.service";
import { PHRMCompanyModel } from "../../shared/phrm-company.model";
import { PHRMGoodsReceiptItemsModel } from "../../shared/phrm-goods-receipt-items.model";
import { PHRMGoodsReceiptViewModel } from "../../shared/phrm-goods-receipt-vm.model";
import { PHRMGoodsReceiptModel } from "../../shared/phrm-goods-receipt.model";
import { PHRMItemMasterModel } from "../../shared/phrm-item-master.model";
import { PHRMPackingTypeModel } from '../../shared/phrm-packing-type.model';
import { PHRMStoreModel } from '../../shared/phrm-store.model';
import { PHRMSupplierModel } from "../../shared/phrm-supplier.model";
//import { EventEmitter } from "events";
//import { phrmitemaddComponent } from '../common/phrmitem-add.component';
@Component({
    selector: "phrm-add-goods-receipt-item",
    templateUrl: "./phrm-gr-item.html"
})
export class PHRMGoodsReceiptItemComponent {
    ///view model for binding
    public goodsReceiptVM: PHRMGoodsReceiptViewModel = new PHRMGoodsReceiptViewModel();
    public tempgoodsReceiptVM: PHRMGoodsReceiptViewModel = new PHRMGoodsReceiptViewModel();
    public goodReceiptItem: PHRMGoodsReceiptItemsModel = new PHRMGoodsReceiptItemsModel();
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
    public margin: number = 0;
    public showAddItemPopUp: boolean = false;
    //for Supplier Popup purpose
    public showAddSupplierPopUp: boolean;
    //flag for disable or enable some text boxes order
    IsPOorder: boolean = false;
    IsGRedit: boolean = false;
    update: boolean = false;
    public selectedItem: PHRMItemMasterModel = null;
    //for editing gr and checking duplication
    public oldSupplierId: any;
    public oldInvoiceNo: any;
    public duplicateInvoice: boolean = false;
    //get all is active item list for create new gr
    public itemList: Array<PHRMItemMasterModel> = new Array<PHRMItemMasterModel>();
    public taxList: Array<any>;
    public taxData: Array<any> = [];
    public currentCounter: number = null;
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

    public idList: Array<any> = [];
    public IsGReditAfterModification: boolean = false;
    public dispensaryList: Array<any> = [];
    public selectedDispensary: any = null;
    public goodReceiptHistory: Array<any> = [];
    public CheckIsValid: boolean = true;
    public isExpiryNotApplicable: boolean = false;
    public ExpiryAfterYear: number = 0;
    //for keep/change cccharge value at edite gritem.
    public itemid: number = 0;
    public IsStripRateEdit: boolean = false;
    public fiscalYearList: Array<any> = new Array<any>();
    @Output("callback-update")
    callBackUpdate: EventEmitter<Object> = new EventEmitter<Object>();
    @Output("callback-add")
    callBackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    @Output("popup-close")
    popUpClose: EventEmitter<boolean> = new EventEmitter<boolean>();

    public packingtypeList: Array<PHRMPackingTypeModel> = new Array<PHRMPackingTypeModel>();

    @Input("PackingList")
    packingListInput: Array<any> = [];

    @Input("all-items-list")
    itemListInput: Array<PHRMItemMasterModel> = new Array<PHRMItemMasterModel>();
    public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
    globalListenFunc: Function;
    showFreeQty: boolean = false;
    showCCCharge: boolean = false;
    VATPercentage: number;
    GRItemPrice: number;
    ItemQty: number;
    showPendingQty: boolean = false;
    public genericList: Array<any>;
    public selectedGeneneric: any;
    public ItemListFiltered: Array<any> = new Array<any>();

    showAddGenericPopUp: boolean = false;
    constructor(
        public pharmacyService: PharmacyService,
        public coreService: CoreService,
        public pharmacyBLService: PharmacyBLService,
        public securityService: SecurityService,
        public msgserv: MessageboxService,
        public router: Router,
        public callBackService: CallbackService,
        public changeDetectorRef: ChangeDetectorRef, public renderer2: Renderer2
    ) {
        this.itemList = new Array<PHRMItemMasterModel>();
        this.GetTaxList();
        this.goodsReceiptVM.goodReceipt.GoodReceiptDate = moment().format("YYYY-MM-DD");
        this.MakeExpiryNotApplicable();
        this.showpacking();
        this.showitemlvldiscount();
        this.checkGRCustomization();
    }
    ngOnInit() {
        this.getGenericList();
        this.packingtypeList = [];
        if (this.packingListInput) {
            this.packingtypeList = this.packingListInput;
        }

        this.itemList = [];
        if (this.itemListInput) {
            this.itemList = this.itemListInput.filter(a => a.IsActive == true);
            this.ItemListFiltered = this.itemList;

        }
        if (this.IsPOorder || this.update == true) {
            (this.IsPkgitem == true) ? this.SetFocusById('ddl_packing', 300) : this.SetFocusById('txt_BatchNo', 300);
        }
        else {
            if (!this.update) {
                this.SetFocusById("txt_GenericName", 300);
            }
        }
        this.globalListenFunc = this.renderer2.listen('document', 'keydown', e => {
            if (e.keyCode == this.ESCAPE_KEYCODE) {
                this.Close();
            }
        });
        this.goodReceiptItem.ItemQTy = this.ItemQty;
        this.goodReceiptItem.SelectedItem = this.itemList.find(i => i.ItemName == this.goodReceiptItem.SelectedItem);

    }
    ngOnDestroy() {
        this.pharmacyService.Id = null;
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


    Close() {
        this.popUpClose.emit(true);
    }
    //this function load all master tax data
    GetTaxList() {
        try {
            this.pharmacyBLService.GetTAXList().subscribe(
                (res) => {
                    if (res.Status == "OK") {
                        this.taxList = res.Results;
                        this.taxData = this.taxList;
                    } else {
                        console.log(res.ErrorMessage);
                        this.msgserv.showMessage("failed", [
                            "Failed to get tax list, see detail in console log",
                        ]);
                    }
                },
                (err) => {
                    console.log(err.ErrorMessage);
                    this.msgserv.showMessage("error", [
                        "Failed to get tax list., see detail in console log",
                    ]);
                }
            );
        } catch (exception) {
            console.log(exception);
            this.msgserv.showMessage("error", ["error details see in console log"]);
        }
    }

    public AssignSelectedGenName() {
        try {
            if (this.selectedGeneneric != null) {
                this.ItemListFiltered = this.itemList.filter(a => a.GenericId == this.selectedGeneneric.GenericId);
                this.goodReceiptItem.GenericId = this.selectedGeneneric.GenericId;
                this.goodReceiptItem.GenericName = this.selectedGeneneric.GenericName;
            }
            else {
                this.ItemListFiltered = this.itemList;
                this.selectedItem = null;
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }


    public AssignSelectedItem() {
        try {
            if (this.selectedItem && this.selectedItem.ItemId) {
                if ((this.selectedItem.ItemId != 0) && (this.selectedItem.ItemId != null)) {
                    this.goodReceiptItem.SelectedItem = this.selectedItem;
                    this.goodReceiptItem.ItemName = this.selectedItem.ItemName;
                    this.goodReceiptItem.ItemId = this.selectedItem.ItemId;
                    // this.goodReceiptItem.CCCharge = this.selectedItem.CCCharge;
                    this.getRackNoByItemIdAndStoreId(this.selectedItem.ItemId);
                    this.goodReceiptItem.VATPercentage = (this.selectedItem.IsVATApplicable == true && !!this.selectedItem.PurchaseVATPercentage) ? this.selectedItem.PurchaseVATPercentage : 0;

                    this.goodReceiptItem.ItemRateHistory = this.pharmacyService.allItemRateList.filter(i => i.ItemId == this.selectedItem.ItemId).filter((x, y) => y < 3); //first filter the Item and take top 3 rate history;
                    // Assign default vat percentage from item-settings
                    this.goodReceiptItem.VATPercentage = (this.selectedItem.IsVATApplicable == true && !!this.selectedItem.PurchaseVATPercentage) ? this.selectedItem.PurchaseVATPercentage : 0;
                    // this.goodReceiptItem.VATPercentage = this.item.VATPercentage;
                    // this.goodReceiptItem.SelectedItem.PackingTypeId = this.item.PackingTypeId;
                    this.goodReceiptItem.ItemMRPHistory = this.pharmacyService.allMRPList.filter(i => i.ItemId == this.selectedItem.ItemId).filter((x, y) => y < 3); //first filter the Item and take top 3 SalePrice history;
                    this.goodReceiptItem.ItemFreeQuantityHistory = this.pharmacyService.allItemFreeQuantityList.filter(i => i.ItemId == this.selectedItem.ItemId).filter((x, y) => y < 5); //first filter the Item and take top 5 Free Quantity history;
                    if (!this.selectedGeneneric) {
                        this.goodReceiptItem.GenericId = this.selectedItem.GenericId;
                        this.goodReceiptItem.GenericName = this.selectedItem.GenericName;
                        this.selectedGeneneric = this.selectedItem.GenericName;
                    }
                    else {
                        this.selectedGeneneric = this.selectedItem.GenericName;
                    }
                    this.UpdatePackingSettingForItem(this.goodReceiptItem);
                }
                //by default expiry should be calculated
                //if (!this.ExpiryAfterYear) {
                this.ExpiryAfterYear = 5;//by default 5 years if it's value is not set in parameter.
                //}
                //input type=Month accepts YYYY-MM as input value
                this.goodReceiptItem.ExpiryDate = (moment().add(this.ExpiryAfterYear, 'years')).format("YYYY-MM");
            }
            else {
                if (this.update == false) {
                    this.selectedGeneneric = null;
                }
                this.ItemListFiltered = this.itemList;
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }

    }
    public ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            this.msgserv.showMessage("error", ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }
    Save() {
        if (this.goodReceiptItem.GoodReceiptItemValidator.valid === false) {
            for (let key in this.goodReceiptItem.GoodReceiptItemValidator.controls) {
                if (this.goodReceiptItem.GoodReceiptItemValidator.controls[key].valid === false) {
                    this.goodReceiptItem.GoodReceiptItemValidator.controls[key].markAsDirty();
                    this.goodReceiptItem.GoodReceiptItemValidator.controls[key].updateValueAndValidity();
                }
            }
            return;
        }
        this.goodReceiptItem.IsItemDiscountApplicable = this.goodReceiptItem.DiscountAmount ? true : false;
        this.MakeBatchNoNA(this.goodReceiptItem);
        this.callBackAdd.emit(this.goodReceiptItem);
        this.popUpClose.emit(true);
    }
    Update() {
        if (this.IsPkgitem == true) {
            //this.goodReceiptItem.PackingQty = this.packingtypeList.find(a => a.PackingTypeId == this.goodReceiptItem.Packing.PackingTypeId).PackingQuantity;
            this.goodReceiptItem.PackingQty = this.goodReceiptItem.StripQty;
            this.goodReceiptItem.GRItemPrice = CommonFunctions.parsePhrmAmount(this.goodReceiptItem.StripRate / this.goodReceiptItem.Packing.PackingQuantity);
        }
        this.goodReceiptItem.GoodReceiptItemValidator.controls['ItemName'].setErrors(null);
        if (this.goodReceiptItem.GoodReceiptItemValidator.valid === false) {
            for (let key in this.goodReceiptItem.GoodReceiptItemValidator.controls) {
                if (this.goodReceiptItem.GoodReceiptItemValidator.controls[key].valid === false) {
                    this.goodReceiptItem.GoodReceiptItemValidator.controls[key].markAsDirty();
                    this.goodReceiptItem.GoodReceiptItemValidator.controls[key].updateValueAndValidity();
                }
            }
            return;
        }
        this.goodReceiptItem.GRItemPrice = this.goodReceiptItem.GRItemPrice;
        this.goodReceiptItem.GenericId = this.goodReceiptItem.GenericId;
        this.callBackUpdate.emit(this.goodReceiptItem);
        this.popUpClose.emit(true);
    }

    AssignPackingQty() {
        if (this.goodReceiptItem && this.goodReceiptItem.Packing) {
            this.goodReceiptItem.PackingQty = this.goodReceiptItem.StripQty;
            this.goodReceiptItem.PackingName = this.goodReceiptItem.Packing.PackingName;
            this.goodReceiptItem.PackingTypeId = this.goodReceiptItem.Packing.PackingTypeId;
        }
    }

    //600 milliseconds
    SetFocusById(IdToBeFocused: string, defaultTimeInMs: number = 100) {
        window.setTimeout(function () {
            let elemToFocus = document.getElementById(IdToBeFocused)
            if (elemToFocus != null && elemToFocus != undefined) {
                elemToFocus.focus();
            }
        }, defaultTimeInMs);
    }


    logError(err: any) {
        this.purchaseOrderId = 0;
        this.pharmacyService.CreateNew();
        this.IsPOorder = false;
        this.router.navigate(["/Pharmacy/Order/GoodsReceiptList"]);
        console.log(err);
    }

    public OnStripMRPChange() {
        let stripRate = this.goodReceiptItem.StripRate;
        let stripMRP = this.goodReceiptItem.StripMRP;
        this.goodReceiptItem.AdjustedMargin = CommonFunctions.parsePhrmAmount(((stripMRP - stripRate) * 100) / stripRate);
        this.goodReceiptItem.Margin = (((stripMRP - stripRate) * 100) / stripRate);
        this.CalculationForPackingValues();
    }
    OnMRPChange() {
        let rate = this.goodReceiptItem.GRItemPrice;
        let mrp = this.goodReceiptItem.SalePrice;
        this.goodReceiptItem.AdjustedMargin = CommonFunctions.parseAmount(((mrp - rate) * 100) / rate);
        this.goodReceiptItem.Margin = ((mrp - rate) * 100) / rate;
        this.CalculationForPHRMGoodsReceiptItem();
    }

    //method fire when item value changed
    //perfect search text box with validation and all things
    private UpdatePackingSettingForItem(selectedGRItem: PHRMGoodsReceiptItemsModel) {

        if (this.packingtypeList != null && this.packingtypeList.length > 0 && selectedGRItem.SelectedItem.PackingTypeId != null) {
            var selectedItemPackingType = this.packingtypeList.find(a => a.PackingTypeId == selectedGRItem.SelectedItem.PackingTypeId);
            if (selectedItemPackingType != null) {
                this.goodReceiptItem.Packing = selectedItemPackingType;
                this.goodReceiptItem.PackingName = selectedItemPackingType.PackingName;
            }

        }
        else {
            selectedGRItem.PackingName = "N/A";
            selectedGRItem.ItemQTy = selectedGRItem.ReceivedQuantity;
            selectedGRItem.GoodReceiptItemValidator.updateValueAndValidity();
        }
    }

    public CalculationForPackingValues() {
        let stripQty = this.goodReceiptItem.StripQty;
        let stripRate = this.goodReceiptItem.StripRate;
        let margin = this.goodReceiptItem.Margin;
        if (margin == 0) {
            this.goodReceiptItem.StripMRP = this.goodReceiptItem.StripRate
        }
        let packingQty = this.goodReceiptItem.Packing ? this.goodReceiptItem.Packing.PackingQuantity : 1; //by default, if no packing selected, use packing qty as 1. (to avoid divide by zero exception)
        this.goodReceiptItem.ItemQTy = stripQty * packingQty;
        this.goodReceiptItem.StripMRP = CommonFunctions.parsePhrmAmount((stripRate + (stripRate * margin) / 100));

        this.goodReceiptItem.SalePrice = this.goodReceiptItem.StripMRP ? this.goodReceiptItem.StripMRP / packingQty : 0;
        this.goodReceiptItem.GRItemPrice = CommonFunctions.parsePhrmAmount(stripRate / packingQty);
        this.goodReceiptItem.FreeQuantity = (this.goodReceiptItem.FreeStripQuantity ? this.goodReceiptItem.FreeStripQuantity : 0) * packingQty;
        this.goodReceiptItem.IsPacking = this.goodReceiptItem.Packing ? true : false;
        this.goodReceiptItem.PackingQty = this.goodReceiptItem.StripQty;
        this.CalculationForPHRMGoodsReceiptItem();
    }

    // Calculation for Goods Receipt Item
    CalculationForPHRMGoodsReceiptItem() {
        if (this.update == true && this.IsPkgitem == true) {
            this.goodReceiptItem.SelectedItem.PackingTypeId = this.goodReceiptItem.Packing.PackingTypeId;
            this.UpdatePackingSettingForItem(this.goodReceiptItem);
        }
        //do the calculation only if item is already selected, else leave it..
        if (this.goodReceiptItem.SelectedItem) {

            updateCalculationsForGrItem(this.goodReceiptItem);

        }
    }


    DiscountAmountOnChange() {
        if (this.goodReceiptItem.SelectedItem) {
            let itmQty = this.goodReceiptItem.ReceivedQuantity ? this.goodReceiptItem.ReceivedQuantity : 0;
            let itmRate = this.goodReceiptItem.GRItemPrice ? this.goodReceiptItem.GRItemPrice : 0;
            let freeQty = this.goodReceiptItem.FreeQuantity ? this.goodReceiptItem.FreeQuantity : 0;
            let vatPercentage = this.goodReceiptItem.VATPercentage ? this.goodReceiptItem.VATPercentage : 0;
            let margin = this.goodReceiptItem.Margin ? this.goodReceiptItem.Margin : 0;
            let disAmt = this.goodReceiptItem.DiscountAmount ? this.goodReceiptItem.DiscountAmount : 0;
            let ccAmount = 0;
            if (this.goodReceiptItem.CCCharge && this.goodReceiptItem.FreeQuantity) {
                ccAmount = freeQty * itmRate * this.goodReceiptItem.CCCharge / 100;
            }
            let subTotalWithoutCC = itmQty * itmRate;
            let subTotalWithCC = subTotalWithoutCC + ccAmount;
            let subTotal = subTotalWithCC;

            let discAmount = this.goodReceiptItem.DiscountAmount;// subTotalWithoutCC * discPercent / 100;
            let vatAmount = (subTotalWithoutCC - discAmount) * vatPercentage / 100;
            let totalAmt = subTotalWithCC - discAmount + vatAmount;

            this.goodReceiptItem.SalePrice = CommonFunctions.parsePhrmAmount(itmRate + (itmRate * margin / 100));
            this.goodReceiptItem.CCAmount = CommonFunctions.parsePhrmAmount(ccAmount);
            this.goodReceiptItem.DiscountAmount = CommonFunctions.parsePhrmAmount(discAmount);
            this.goodReceiptItem.VATAmount = CommonFunctions.parsePhrmAmount(vatAmount);
            this.goodReceiptItem.SubTotal = CommonFunctions.parsePhrmAmount(subTotal);
            this.goodReceiptItem.TotalAmount = CommonFunctions.parsePhrmAmount(totalAmt);

            this.goodReceiptItem.DiscountPercentage = discAmount / subTotalWithoutCC * 100;

        }

    }

    //used to format display item in ng-autocomplete
    PackingListsFormatter(data: any): string {
        let html = data["PackingName"];
        return html;
    }
    myItemListFormatter(data: any): string {
        let html = `<font color='blue'; size=03 >${data["ItemName"]}</font> (<i>${data["GenericName"]}</i>)`;
        return html;
    }
    myGenericNameListFormatter(data: any): string {
        let html = `<font color='blue'; size=03 >${data["GenericName"]}</font>`;
        return html;
    }

    //for item add popup page to turn on
    AddItemPopUp(i) {
        this.showAddItemPopUp = false;
        this.index = i;
        this.changeDetectorRef.detectChanges();
        this.showAddItemPopUp = true;
    }
    AddGenericPopUp(i) {
        this.showAddGenericPopUp = false;
        this.index = i;
        this.changeDetectorRef.detectChanges();
        this.showAddGenericPopUp = true;
    }
    OnNewItemAdded($event) {
        this.showAddItemPopUp = false;
        if ($event) {
            var item = $event.item;
            this.itemList.unshift(item);
            this.ItemListFiltered = this.itemList;
            this.goodReceiptItem = new PHRMGoodsReceiptItemsModel();
            this.goodReceiptItem.GoodReceiptItemValidator.get("ItemName").setValue(item.ItemName);
            this.selectedItem = item.ItemName;
            this.goodReceiptItem.SelectedItem = item;
        }
        this.SetFocusById('txt_ItemName');
    }

    OnNewGenericAdded($event) {
        this.showAddItemPopUp = false;
        var generic = $event.generic;
        this.genericList.unshift(generic);
        this.goodReceiptItem = new PHRMGoodsReceiptItemsModel();
        this.selectedGeneneric = generic;
        this.SetFocusById('txt_GenericName');
    }
    public MakeExpiryNotApplicable() {
        this.isExpiryNotApplicable = false;
        let data = this.coreService.Parameters.find(
            (p) =>
                p.ParameterName == "PharmacyGRExpiryNotApplicable" &&
                p.ParameterGroupName == "Pharmacy"
        );
        if (data && data.ParameterValue) {
            let paramValue = data.ParameterValue
            let dataObj = JSON.parse(paramValue);
            this.ExpiryAfterYear = dataObj.ExpiryAfter;
            if (dataObj.ExpiryNotApplicable) {
                this.isExpiryNotApplicable = true;
            }
        }
    }

    public MakeBatchNoNA(grItem: PHRMGoodsReceiptItemsModel): boolean {
        if (this.isExpiryNotApplicable) {
            grItem.BatchNo = 'N/A';

        }
        return true;
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
    }
    // for show and hide packing feature
    showpacking() {
        this.IsPkgitem = true;
        let pkg = this.coreService.Parameters.find((p) => p.ParameterName == "PharmacyGRpacking" && p.ParameterGroupName == "Pharmacy").ParameterValue;
        if (pkg == "true") {
            this.IsPkgitem = true;
        } else {
            this.IsPkgitem = false;
        }

    }

    //show or hide GR item level discount
    showitemlvldiscount() {
        this.IsitemlevlDis = true;
        let discountParameter = this.coreService.Parameters.find((p) => p.ParameterName == "PharmacyDiscountCustomization" && p.ParameterGroupName == "Pharmacy").ParameterValue;
        discountParameter = JSON.parse(discountParameter);
        this.IsitemlevlDis = (discountParameter.EnableItemLevelDiscount == true);
    }
    public getRackNoByItemIdAndStoreId(ItemId: number): void {
        this.pharmacyBLService.GetRackNoByItemIdAndStoreId(ItemId)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.goodReceiptItem.RackNo = res.Results;
                }
            });
    }
}


export function updateCalculationsForGrItem(grItem: PHRMGoodsReceiptItemsModel) {
    let itmQty = grItem.ItemQTy;
    let itmRate = grItem.GRItemPrice ? grItem.GRItemPrice : 0;
    let freeQty = grItem.FreeQuantity ? grItem.FreeQuantity : 0;
    let totalItemQty = grItem.TotalQuantity ? grItem.TotalQuantity : 0;
    let vatPercentage = grItem.VATPercentage ? grItem.VATPercentage : 0;
    let discPercent = grItem.DiscountPercentage ? grItem.DiscountPercentage : 0;
    if (discPercent == 0) {
        grItem.DiscountAmount = 0;
    }
    let margin = grItem.Margin ? grItem.Margin : 0;
    let disAmt = grItem.DiscountAmount ? grItem.DiscountAmount : 0;
    let ccCharge = grItem.CCCharge ? grItem.CCCharge : 0;
    grItem.SalePrice = CommonFunctions.parsePhrmAmount(itmRate + (itmRate * margin / 100));

    let ccAmount = 0;
    ccAmount = freeQty * itmRate * ccCharge / 100;

    let subTotalWithoutCC = itmQty * itmRate;
    let subTotalWithCC = subTotalWithoutCC + ccAmount;
    totalItemQty = itmQty + freeQty;

    let discAmount = subTotalWithoutCC * discPercent / 100;
    let vatAmount = (subTotalWithoutCC - discAmount) * vatPercentage / 100;
    let totalAmt = subTotalWithCC - discAmount + vatAmount;

    let CostPrice = totalAmt / totalItemQty;

    grItem.CCAmount = CommonFunctions.parsePhrmAmount(ccAmount);
    grItem.DiscountAmount = CommonFunctions.parsePhrmAmount(discAmount);
    grItem.VATAmount = CommonFunctions.parsePhrmAmount(vatAmount);
    grItem.SubTotal = CommonFunctions.parsePhrmAmount(subTotalWithoutCC);
    grItem.TotalAmount = CommonFunctions.parsePhrmAmount(totalAmt);
    grItem.ReceivedQuantity = itmQty;
    grItem.TotalQuantity = totalItemQty;
    grItem.CostPrice = CommonFunctions.parsePhrmAmount(CostPrice);
    grItem.CCAmount = CommonFunctions.parsePhrmAmount(ccAmount);

    if (disAmt > 0 && discPercent == 0) {
        grItem.DiscountPercentage = 0;
    }
    if (disAmt == 0 && discPercent == 0) {
        grItem.DiscountPercentage = 0;
    }

}
