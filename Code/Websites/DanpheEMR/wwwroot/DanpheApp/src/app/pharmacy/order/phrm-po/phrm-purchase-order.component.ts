import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from '../../../core/shared/core.service';
import { TermsConditionsMasterModel } from '../../../inventory/shared/terms-conditions-master.model';
import { DanpheRoute } from '../../../security/shared/danphe-route.model';
import { SecurityService } from "../../../security/shared/security.service";
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { CommonFunctions } from '../../../shared/common.functions';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status, ENUM_PHRMPurchaseOrderStatus, ENUM_TermsApplication } from '../../../shared/shared-enums';
import { PharmacyPOVerifier } from '../../shared/pharmacy-po-verifier.model';
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { PharmacyService } from '../../shared/pharmacy.service';
import { PHRMGenericModel } from '../../shared/phrm-generic.model';
import { PHRMItemMasterModel } from "../../shared/phrm-item-master.model";
import { PHRMPurchaseOrderItems } from "../../shared/phrm-purchase-order-items.model";
import { PHRMPurchaseOrder } from "../../shared/phrm-purchase-order.model";
import { PHRMSupplierModel } from "../../shared/phrm-supplier.model";
import { PharmacyPOService } from '../pharmacy-po.service';
@Component({
    selector: 'phrm-purchase-order',
    templateUrl: "./phrm-purchase-order.html",
    styleUrls: ["./phrm-purchase-order.css"],
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PHRMPurchaseOrderComponent {
    public currentPOItem: PHRMPurchaseOrderItems = new PHRMPurchaseOrderItems();
    public currentPO: PHRMPurchaseOrder = new PHRMPurchaseOrder();
    public tempcurrentPO: PHRMPurchaseOrder = new PHRMPurchaseOrder();
    public GenericList: PHRMGenericModel[] = [];
    public FilteredGenericList: PHRMGenericModel[] = [];
    public SelectedSupplier: PHRMSupplierModel | string = null;
    public supplierList: Array<PHRMSupplierModel> = new Array<PHRMSupplierModel>();
    public termsList: Array<TermsConditionsMasterModel> = [];
    public taxList: Array<any>;
    public ItemList: Array<PHRMItemMasterModel> = new Array<PHRMItemMasterModel>();
    public showAddItemPopUp: boolean = false;
    public index: number = 0;
    public checkIsItemPresent: boolean = false;
    loading: boolean = false;
    validRoutes: DanpheRoute[] = [];
    editPO: boolean = false;
    selectedPO: PHRMPurchaseOrder;
    IsVerificationActivated: boolean = false;
    VerifierList: PharmacyPOVerifier[] = [];
    showAddTermsPopUp: boolean;
    FilteredItemList = new Array<PHRMItemMasterModel>();
    @Output('call-back-close-popup') callBackClosePopup: EventEmitter<object> = new EventEmitter<object>();
    @Output('discard-changes-popup-close')
    callBackClosePopupDiscardChanges: EventEmitter<object> = new EventEmitter<object>();
    currentPOItems: PHRMPurchaseOrderItems[] = [];
    public ItemRateHistory: ItemRateHistory[] = [];
    public purchaseOrderItem: PHRMPurchaseOrderItems = new PHRMPurchaseOrderItems();
    public SelectedItem: PHRMItemMasterModel = new PHRMItemMasterModel();
    public SelectedGeneric: PHRMGenericModel;
    public confirmationTitle: string = "Confirm !";
    public confirmationMessage: string = "Are you sure you want to Print Order ?";

    constructor(public pharmacyPOService: PharmacyPOService,
        public securityService: SecurityService,
        public changeDetectorRef: ChangeDetectorRef,
        public pharmacyBLService: PharmacyBLService,
        public router: Router,
        public msgserv: MessageboxService,
        public coreService: CoreService,
        public pharmacyService: PharmacyService) {
        this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/Order");
        this.ItemList = new Array<PHRMItemMasterModel>();
        this.GetSupplierList();
        this.LoadGenerics();
        //this.AddRowRequest();
        this.LoadAllItems();
        this.GetTaxList();
        this.GetPharmacyTermsList();
        this.GetVerifiers();
        this.GetSigningPanelConfiguration();
    }
    ngOnInit() {
        this.LoadForEditPO();
    }
    ngOnDestroy() {
        this.pharmacyPOService.PurchaseOrderId = 0;
        this.editPO = false;
    }
    LoadForEditPO() {
        if (this.pharmacyPOService.PurchaseOrderId > 0) {
            setTimeout(() => {
                this.findPurchaseOrder(this.pharmacyPOService.PurchaseOrderId);
            }, 1000);
            this.editPO = true;
        }
    }
    findPurchaseOrder(PurchaseOrderId: number) {
        this.pharmacyBLService.GetPHRMPOItemsByPOId(PurchaseOrderId).subscribe({
            next: (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.currentPO = Object.assign(new PHRMPurchaseOrder(), res.Results.Order);
                    this.SelectedSupplier = this.currentPO.SupplierName;
                    this.currentPO.PurchaseOrderValidator.controls['DeliveryDays'].setValue(this.currentPO.DeliveryDays);
                    this.currentPO.PODate = moment(new Date(this.currentPO.PODate)).format("YYYY-MM-DD");
                    this.currentPO.DeliveryDate = moment(new Date(this.currentPO.DeliveryDate)).format("YYYY-MM-DD");
                    this.currentPOItems = res.Results.OrderItems.map((item) => {
                        const orderItem = Object.assign(new PHRMPurchaseOrderItems(), item);
                        orderItem.SelectedItem = this.ItemList.find(a => a.ItemId === item.ItemId);
                        orderItem.PurchaseOrderItemValidator.controls['ItemId'].setValue(orderItem.SelectedItem);
                        orderItem.PurchaseOrderItemValidator.controls['FreeQuantity'].setValue(item.FreeQuantity);
                        orderItem.PurchaseOrderItemValidator.controls['StandardRate'].setValue(item.StandardRate);
                        orderItem.PurchaseOrderItemValidator.controls['Quantity'].setValue(item.Quantity);
                        orderItem.PurchaseOrderItemValidator.controls['CCChargePercentage'].setValue(item.CCChargePercentage);
                        orderItem.PurchaseOrderItemValidator.controls['DiscountPercentage'].setValue(item.DiscountPercentage);
                        orderItem.PurchaseOrderItemValidator.controls['VATPercentage'].setValue(item.VATPercentage);
                        orderItem.VATAmount = item.VATAmount;
                        orderItem.DiscountAmount = item.DiscountAmount;
                        setTimeout(() => {
                            orderItem.SelectedGeneric = this.GenericList.find(g => g.GenericId === item.GenericId);
                        }, 500);
                        return orderItem;
                    });
                    this.currentPO.PHRMPurchaseOrderItems = this.currentPOItems;
                    this.SetVerifiersFromVerifierIdsObj(this.currentPO.VerifierIds);
                } else {
                    this.msgserv.showMessage(ENUM_MessageBox_Status.Failed, [`Failed to get Purchase Order Details. ${res.ErrorMessage}`]);
                }
            },
            error: (err) => {
                this.msgserv.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get Purchase Order Details. See console for more details']);
                console.log(err.errorMessages);
            }
        });
    }

    ngAfterViewChecked() {
        this.changeDetectorRef.detectChanges();
    }

    GetSupplierList() {
        this.pharmacyBLService.GetSupplierList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.supplierList = res.Results;
                    ///displaying only those supplier in Dropdownlist whose status is Active Now.
                    this.supplierList = this.supplierList.filter(suplr => suplr.IsActive == true);
                    if (!this.editPO)
                        this.SetFocusById("SupplierName");
                }
                else {
                    this.msgserv.showMessage("failed", ['Failed to get SupplierList.' + res.ErrorMessage]);
                }
            },
                err => {
                    this.msgserv.showMessage("error", ['Failed to get SupplierList.' + err.ErrorMessage]);
                }
            )
    }
    OnSupplierChanged() {
        let supplier = null;
        if (!this.SelectedSupplier) {
            this.currentPO.SupplierId = null;
        }
        else if (typeof (this.SelectedSupplier) == 'string') {
            supplier = this.supplierList.find(a => a.SupplierName.toLowerCase() == this.SelectedSupplier.toString().toLowerCase());
        }
        else if (typeof (this.SelectedSupplier) == "object") {
            supplier = this.SelectedSupplier;
        }
        if (supplier) {
            this.currentPO.SupplierId = supplier.SupplierId;
            this.currentPO.SupplierName = supplier.SupplierName;
        }
        else {
            this.currentPO.SupplierId = null;
            this.currentPO.SupplierName = "";
        }
    }
    GetPharmacyTermsList() {
        this.pharmacyBLService.GetTermsList(ENUM_TermsApplication.Pharmacy)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.termsList = res.Results;
                }
                else {
                    console.log(res.ErrorMessage);
                }

            }, err => {
                console.log(err.error.ErrorMessage);
            });
    }
    LoadAllItems() {
        this.pharmacyPOService.GetItemsForPO()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.ItemList = res.Results.ItemList;
                    this.FilteredItemList = res.Results.ItemList;
                }
                else {
                    this.msgserv.showMessage("notice-message", ["No Items Avaliable for this ItemType"]);
                }
            });
    }

    LoadGenerics() {
        this.pharmacyBLService.GetGenericList()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.GenericList = res.Results;
                    this.FilteredGenericList = res.Results;
                }
            });
    }

    GetTaxList() {
        try {
            this.pharmacyBLService.GetTAXList().subscribe(
                (res) => {
                    if (res.Status == "OK") {
                        this.taxList = res.Results;
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
    OnItemSelected() {
        if (this.SelectedItem) {
            this.purchaseOrderItem.PurchaseOrderItemValidator.controls['ItemId'].setValue(this.SelectedItem.ItemId);
            this.purchaseOrderItem.ItemId = this.SelectedItem.ItemId;
            this.purchaseOrderItem.ItemName = this.SelectedItem.ItemName;
            this.purchaseOrderItem.GenericId = this.SelectedItem.GenericId;
            this.purchaseOrderItem.StandardRate = this.SelectedItem.PurchaseRate;
            this.purchaseOrderItem.CCChargePercentage = this.SelectedItem.CCCharge;
            this.purchaseOrderItem.DiscountPercentage = this.SelectedItem.PurchaseDiscount;
            this.purchaseOrderItem.VATPercentage = (this.SelectedItem.IsVATApplicable == true) ? this.taxList[0].TAXPercentage : 0;
            this.SelectedGeneric = this.GenericList.find(g => g.GenericId == this.SelectedItem.GenericId);
            this.purchaseOrderItem.GenericName = this.SelectedGeneric ? this.SelectedGeneric.GenericName : null;
            this.ItemRateHistory = [];
            this.ItemRateHistory = this.pharmacyService.allItemRateList.filter(i => i.ItemId == this.SelectedItem.ItemId).filter((x, y) => y < 3)
        }
        else {
            this.purchaseOrderItem.ItemId = null;
            this.purchaseOrderItem.GenericId = null;
            this.purchaseOrderItem.StandardRate = 0;
            this.purchaseOrderItem.CCChargePercentage = 0;
            this.purchaseOrderItem.DiscountPercentage = 0;
            this.purchaseOrderItem.VATPercentage = 0;
            this.purchaseOrderItem.FreeQuantity = 0;
            this.SelectedGeneric = null;
            this.ItemRateHistory = [];
        }
    }
    OnGenericNameChange() {
        if (this.SelectedGeneric) {
            this.purchaseOrderItem.GenericId = this.SelectedGeneric.GenericId;
            this.purchaseOrderItem.GenericName = this.SelectedGeneric.GenericName;
            this.FilteredItemList = this.ItemList.filter(i => i.GenericId === this.SelectedGeneric.GenericId);
        }
        else {
            this.purchaseOrderItem.GenericId = null;
        }
    }

    AddItemPopUp(i) {
        this.showAddItemPopUp = false;
        this.index = i;
        this.changeDetectorRef.detectChanges();
        this.showAddItemPopUp = true;
    }

    DeleteRow(index) {
        this.currentPO.PHRMPurchaseOrderItems.splice(index, 1);
        if (index == 0) {
            this.currentPOItem = new PHRMPurchaseOrderItems();
            this.currentPO.PHRMPurchaseOrderItems.push(this.currentPOItem);
            this.CalculationForPO();
            this.changeDetectorRef.detectChanges();
        }
        else {
            this.CalculationForPO();
            this.changeDetectorRef.detectChanges();
        }
    }
    ItemListFormatter(data: any): string {
        let html = data["ItemName"];
        return html;
    }
    GenericListFormatter(data: any): string {
        let html = data["GenericName"];
        return html;
    }
    SupplierListFormatter(data: any): string {
        let html = data["SupplierName"];
        return html;
    }
    CalculationForPOItem() {
        this.purchaseOrderItem.TotalQuantity = this.purchaseOrderItem.Quantity + this.purchaseOrderItem.FreeQuantity;

        if (this.purchaseOrderItem.ItemId && this.purchaseOrderItem.TotalQuantity && this.purchaseOrderItem.StandardRate) {
            this.purchaseOrderItem.SubTotal = CommonFunctions.parsePhrmAmount(this.purchaseOrderItem.Quantity * this.purchaseOrderItem.StandardRate);
            if (this.purchaseOrderItem.DiscountPercentage > 0) {
                this.purchaseOrderItem.DiscountAmount = CommonFunctions.parsePhrmAmount(((this.purchaseOrderItem.Quantity * this.purchaseOrderItem.StandardRate) * this.purchaseOrderItem.DiscountPercentage) / 100);
            }
            if (this.purchaseOrderItem.VATPercentage > 0) {
                this.purchaseOrderItem.VATAmount = CommonFunctions.parsePhrmAmount(((this.purchaseOrderItem.SubTotal - this.purchaseOrderItem.DiscountAmount) * this.purchaseOrderItem.VATPercentage) / 100);
            }
            if (this.purchaseOrderItem.FreeQuantity > 0 && this.purchaseOrderItem.CCChargePercentage > 0) {
                this.purchaseOrderItem.CCChargeAmount = CommonFunctions.parsePhrmAmount((this.purchaseOrderItem.FreeQuantity * this.purchaseOrderItem.StandardRate) * this.purchaseOrderItem.CCChargePercentage / 100);
            }
            this.purchaseOrderItem.TotalAmount = CommonFunctions.parsePhrmAmount(this.purchaseOrderItem.SubTotal - this.purchaseOrderItem.DiscountAmount + this.purchaseOrderItem.VATAmount + this.purchaseOrderItem.CCChargeAmount);
            this.CalculationForPO();
        }
    }
    CalculationForPO(discountPer?: number, discountAmt?: number) {
        let DiscountPer = discountPer ? discountPer : 0;
        let DiscountAmt = discountAmt ? discountAmt : 0;
        let SubTotal = 0;
        let DiscountAmount = 0;
        let VATAmount = 0;
        let CCChargeAmount = 0;
        let TotalAmount = 0;

        this.currentPO.PHRMPurchaseOrderItems.forEach(item => {
            if (item.IsCancel !== true) {
                SubTotal += item.SubTotal;
                DiscountAmount += item.DiscountAmount;
                VATAmount += item.VATAmount;
                CCChargeAmount += item.CCChargeAmount;
                TotalAmount += item.TotalAmount;
            }
        });


        this.currentPO.SubTotal = CommonFunctions.parseAmount(SubTotal, 4);
        this.currentPO.DiscountAmount = DiscountAmt > 0 ? DiscountAmt : CommonFunctions.parseAmount(DiscountAmount, 4);
        this.currentPO.DiscountPercentage = DiscountPer > 0 ? DiscountPer : CommonFunctions.parseAmount((DiscountAmount / SubTotal) * 100, 4);
        this.currentPO.TaxableAmount = CommonFunctions.parseAmount(SubTotal - DiscountAmount, 4);
        this.currentPO.NonTaxableAmount = CommonFunctions.parseAmount(DiscountAmount, 4);
        this.currentPO.VATAmount = CommonFunctions.parseAmount(VATAmount, 4);
        this.currentPO.CCChargeAmount = CommonFunctions.parseAmount(CCChargeAmount, 4);
        this.currentPO.TotalAmount = CommonFunctions.parseAmount(TotalAmount, 4);
    }
    OnDiscountChange(DiscountPercentage: number, DiscountAmount: number) {
        if (DiscountPercentage > 0 && DiscountAmount === 0) {
            let DiscountAmount = CommonFunctions.parseAmount((this.currentPO.SubTotal * DiscountPercentage) / 100, 4);
            this.currentPO.DiscountAmount = DiscountAmount;
            for (let i = 0; i < this.currentPO.PHRMPurchaseOrderItems.length; i++) {
                this.currentPO.PHRMPurchaseOrderItems[i].DiscountPercentage = DiscountPercentage;
                this.CalculatePOItemsCalculationForEdit();
            }
        }
        if (DiscountPercentage === 0 && DiscountAmount > 0) {
            let DiscountPercentage = CommonFunctions.parseAmount((DiscountAmount / this.currentPO.SubTotal) * 100, 4);
            this.currentPO.DiscountPercentage = DiscountPercentage;
            for (let i = 0; i < this.currentPO.PHRMPurchaseOrderItems.length; i++) {
                this.currentPO.PHRMPurchaseOrderItems[i].DiscountPercentage = DiscountPercentage;
                this.CalculatePOItemsCalculationForEdit();
            }
        }
    }

    CalculatePOItemsCalculationForEdit() {
        this.currentPO.PHRMPurchaseOrderItems.forEach(item => item.DiscountAmount = CommonFunctions.parseAmount(item.SubTotal * item.DiscountPercentage / 100, 4));
        this.CalculationForPO();
    }
    AddPurchaseOrder() {
        let checkIsValid = true;
        const errorMessages: string[] = [];

        if (!this.currentPO.IsValidCheck(undefined, undefined)) {
            checkIsValid = false;
            Object.keys(this.currentPO.PurchaseOrderValidator.controls).forEach(key => {
                const control = this.currentPO.PurchaseOrderValidator.controls[key];
                control.markAsDirty();
                control.updateValueAndValidity();
                if (control.invalid) {
                    errorMessages.push(`${key} is not valid.`);
                }
            });
        }

        this.currentPO.PHRMPurchaseOrderItems.forEach((item, i) => {
            if (!item.IsValidCheck(undefined, undefined)) {
                checkIsValid = false;
                Object.keys(item.PurchaseOrderItemValidator.controls).forEach(key => {
                    const control = item.PurchaseOrderItemValidator.controls[key];
                    control.markAsDirty();
                    control.updateValueAndValidity();
                    if (control.invalid) {
                        errorMessages.push(`${key} is not valid for item ${i + 1}.`);
                    }
                });
            }

            if (!item.ItemId) {
                this.msgserv.showMessage('Failed', [`Please select valid Item for item - ${i}`]);
                return;
            }
        });

        if (!this.currentPO.PHRMPurchaseOrderItems || this.currentPO.PHRMPurchaseOrderItems.length === 0) {
            checkIsValid = false;
            errorMessages.push("Please Add Item ...Before Requesting");
            return;
        }

        if (checkIsValid) {
            if (this.currentPO.PHRMPurchaseOrderItems.length) {
                this.loading = true;
                this.pharmacyBLService.PostToPurchaseOrder(this.currentPO)
                    .finally(() => this.loading = false)
                    .subscribe(
                        res => {
                            if (res.Status === 'OK') {
                                this.msgserv.showMessage("success", ["Purchase Order is Generated and Saved"]);
                                this.callBackClosePopup.emit(res.Results);
                            } else {
                                err => {
                                    this.msgserv.showMessage("failed", ['failed to add Purchase Order.. please check log for details.']);
                                    this.logError(err.ErrorMessage);
                                }
                            }
                        },
                        error => {
                            this.msgserv.showMessage("failed", ['failed to add Purchase Order.. please check log for details.']);
                            this.logError(error);
                        }
                    );
            } else {
                this.currentPOItem = new PHRMPurchaseOrderItems();
                this.currentPO.PHRMPurchaseOrderItems.push(this.currentPOItem);
                this.msgserv.showMessage("notice-message", ['All Selected Purchase Items Quantity is zero']);
                this.router.navigate(['/Pharmacy/Order/PurchaseOrderItems']);
            }
        } else {
            this.msgserv.showMessage("Failed", errorMessages);
        }
    }

    UpdatePurchaseOrder() {
        var CheckIsValid = true;
        var errorMessages = [];
        if (this.currentPO.IsValidCheck(undefined, undefined) == false) {
            this.loading = true;
            for (var b in this.currentPO.PurchaseOrderValidator.controls) {
                this.currentPO.PurchaseOrderValidator.controls[b].markAsDirty();
                this.currentPO.PurchaseOrderValidator.controls[b].updateValueAndValidity();
                if (this.currentPO.PurchaseOrderValidator.controls[b].status == "INVALID") {
                    errorMessages.push(`${b} is invalid.`);
                }
                CheckIsValid = false;
            }
        }

        for (var i = 0; i < this.currentPO.PHRMPurchaseOrderItems.length; i++) {
            if (this.currentPO.PHRMPurchaseOrderItems[i].IsValidCheck(undefined, undefined) == false) {
                for (var a in this.currentPO.PHRMPurchaseOrderItems[i].PurchaseOrderItemValidator.controls) {
                    this.currentPO.PHRMPurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].markAsDirty();
                    this.currentPO.PHRMPurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].updateValueAndValidity();
                    if (this.currentPO.PHRMPurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].status == "INVALID") {
                        errorMessages.push(`${a} is invalid in item ${i + 1}.`);
                    }
                }
                CheckIsValid = false;
            }
        }

        if (this.currentPO.PHRMPurchaseOrderItems.length == 0) {
            errorMessages.push("Please Add Item ...Before Requesting");
        }

        if (CheckIsValid == true && this.currentPO.PHRMPurchaseOrderItems != null) {
            this.currentPO.PHRMPurchaseOrderItems.forEach(item => item.CreatedOn = moment().format('YYYY-MM-DD')); // Since CreatedOn is not null in Model.

            this.pharmacyBLService.UpdatePurchaseOrder(this.currentPO).
                subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.msgserv.showMessage("success", ["Purchase Order Updated Successfully!"]);
                        this.callBackClosePopup.emit(res.Results);
                    }
                    else {
                        this.msgserv.showMessage("failed", ['failed to add Purchase Order.. please check log for details.']);
                        this.logError(res.ErrorMessage);
                        this.loading = false;

                    }
                });
        }
        else {
            this.msgserv.showMessage("Notice-Message", errorMessages);
        }
    }
    OnPressedEnterKeyInItemField(index: number) {
        if (this.currentPO.PHRMPurchaseOrderItems[index].ItemId > 0) {
            this.SetFocusById('QuantityAt' + index);
        }
        else {
            if (this.currentPO.PHRMPurchaseOrderItems.length > 1) {
                this.currentPO.PHRMPurchaseOrderItems.pop();
            }
            else {
                this.SetFocusById('ItemName' + index)
            }
            //this.currentPO.PHRMPurchaseOrderItems.pop();
            let isDataValid = this.currentPO.PHRMPurchaseOrderItems.every(a => a.PurchaseOrderItemValidator.valid == true);
            if (isDataValid) {
                this.SetFocusById("PrintButton");
            }
        }
    }
    OnPressedEnterKeyInRemarks(index: number) {
        let isDataValid = this.currentPO.PHRMPurchaseOrderItems.every(a => a.PurchaseOrderItemValidator.valid == true);
        if (isDataValid) {
            this.changeDetectorRef.detectChanges();
            this.SetFocusById(`ItemName${index + 1}`);
        }
    }
    logError(err: any) {
        console.log(err);
    }
    hotkeys(event) {
        if (event.altKey) {
            switch (event.keyCode) {
                case 80: {// => ALT+P comes here
                    if (!this.editPO) {
                        this.AddPurchaseOrder();
                    }
                    else {
                        this.UpdatePurchaseOrder();
                    }
                    break;
                }
                default:
                    break;
            }
        }
    }
    DiscardPurchaseOrder() {

        //navigate to POLIST Page
        // this.router.navigate(["/Pharmacy/Order/PurchaseOrderList"]);
        this.callBackClosePopupDiscardChanges.emit();
    }
    SetFocusById(IdToBeFocused) {
        window.setTimeout(function () {
            var element = <HTMLInputElement>document.getElementById(IdToBeFocused);
            element.focus();
            //element.select();
        }, 20);
    }
    OnPODateChange(event) {
        if (event !== null) {
            this.currentPO.PODate = event;
        }
    }
    OnDeliveryDateChange(event) {
        if (event !== null) {
            this.currentPO.DeliveryDate = event;
            this.GetDeliveryDaysCount();
        }
    }
    GetVerifiers() {
        this.pharmacyBLService.GetVerifiers().subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.VerifierList = res.Results;
                this.SetDefaultVerifier();
            }
        })
    }
    VerifierListFormatter(data: any): string {
        return `${data["Name"]} (${data["Type"]})`;
    }
    AddTermsPopUp() {
        this.showAddTermsPopUp = true;
    }
    OnNewTermsAdded($event) {
        this.showAddTermsPopUp = false;
        var terms = $event.terms;
        this.termsList.push(terms);
        this.termsList.slice();
    }
    onChangeEditorData(data) {
        this.currentPO.TermsConditions = data;
    }
    ShowVerifiers() {
        if (this.currentPO.IsVerificationEnabled == true) {
            this.AddVerifier();
        }
        else {
            this.currentPO.VerifierList = [];
        }
    }
    DeleteVerifier(index: number) {
        this.currentPO.VerifierList.splice(index, 1);
    }
    CheckIfDeleteVerifierAllowed() {
        return this.currentPO.VerifierList.length <= 1;
    }
    CheckIfAddVerifierAllowed() {
        return this.currentPO.VerifierList.some(V => V.Id === 0) || this.currentPO.VerifierList.length >= this.VerificationLevel;
    }
    AddVerifier() {
        this.currentPO.VerifierList.push(new PharmacyPOVerifier())
    }
    AssignVerifier($event, index) {
        if (typeof $event == "object") {
            this.currentPO.VerifierList[index] = $event;
        }
    }
    SetDefaultVerifier() {
        var PharmacyVerificationSetting = this.coreService.Parameters.find(param => param.ParameterGroupName === 'Pharmacy' && param.ParameterName == "PharmacyVerificationSettings")
        if (PharmacyVerificationSetting) {
            var PharmacyVerificationSettingParsed = JSON.parse(PharmacyVerificationSetting.ParameterValue);
            if (PharmacyVerificationSettingParsed != null) {
                if (PharmacyVerificationSettingParsed.EnableVerification == true) {
                    this.IsVerificationActivated = true;
                    this.currentPO.IsVerificationEnabled = true;
                    this.SetVerifiersFromVerifierIdsObj(PharmacyVerificationSettingParsed.VerifierIds);
                }
                else {
                    this.IsVerificationActivated = false;
                }
            }
        }
        ;

    }
    SetVerifiersFromVerifierIdsObj(VerifierIds: any) {
        if (this.currentPO.IsVerificationEnabled == true && this.VerifierList != null) {
            this.currentPO.VerifierList = [];
            var VerifierIdsParsed: any[] = (typeof (VerifierIds) == "string") ? JSON.parse(VerifierIds) : VerifierIds;
            if (VerifierIdsParsed == null || VerifierIdsParsed.length == 0) {
                this.AddVerifier();
            }
            else {
                //if more than three verifiers are selected, it will take only first three.
                //VerifierIdsParsed = VerifierIdsParsed.slice(0, 2);
                VerifierIdsParsed.forEach(a => this.currentPO.VerifierList.push(this.VerifierList.find(v => v.Id == a.Id && v.Type == a.Type)));
            }
        }
    }
    OnDeliveryDaysChange() {
        if (this.currentPO.DeliveryDays > 0) {
            let millisecondsInDay = 24 * 60 * 60 * 1000;
            let currentDate = new Date();
            let futureDate = new Date(currentDate.getTime() + (this.currentPO.DeliveryDays * millisecondsInDay));
            this.currentPO.DeliveryDate = moment(futureDate).format('YYYY-MM-DD');
        }
    }
    GetDeliveryDaysCount() {
        const currentDate = moment().format('YYYY-MM-DD');
        const deliveryDate = moment(this.currentPO.DeliveryDate).format('YYYY-MM-DD');
        let diffDays = (moment.duration(moment(deliveryDate).diff(moment(currentDate))).asDays());
        this.currentPO.DeliveryDays = diffDays;
    }

    GetSignatoryName(index: number): string {
        if (this.VerifierSignatories && this.VerifierSignatories.length) {
            return this.VerifierSignatories[index];
        }
    }
    RemovePOItem(index: number) {
        this.currentPO.PHRMPurchaseOrderItems.splice(index, 1);
        this.CalculationForPO();
    }
    EditPOItem(index: number) {
        const purchaseOrderItem = this.currentPO.PHRMPurchaseOrderItems[index];
        this.purchaseOrderItem.SelectedItem = this.ItemList.find(i => i.ItemId === purchaseOrderItem.ItemId);
        this.SelectedItem = this.purchaseOrderItem.SelectedItem;
        this.SelectedGeneric = this.GenericList.find(g => g.GenericId == purchaseOrderItem.GenericId);
        this.purchaseOrderItem.ItemName = purchaseOrderItem.ItemName;
        this.purchaseOrderItem.ItemId = purchaseOrderItem.ItemId;
        this.purchaseOrderItem.GenericName = purchaseOrderItem.GenericName;
        this.purchaseOrderItem.GenericId = purchaseOrderItem.GenericId;
        this.purchaseOrderItem.PurchaseOrderItemId = purchaseOrderItem.PurchaseOrderItemId;
        this.purchaseOrderItem.PurchaseOrderId = purchaseOrderItem.PurchaseOrderId;
        this.purchaseOrderItem.PurchaseOrderItemValidator.controls['ItemId'].setValue(this.SelectedItem.ItemId);
        this.purchaseOrderItem.PurchaseOrderItemValidator.controls['FreeQuantity'].setValue(purchaseOrderItem.FreeQuantity);
        this.purchaseOrderItem.PurchaseOrderItemValidator.controls['StandardRate'].setValue(purchaseOrderItem.StandardRate);
        this.purchaseOrderItem.PurchaseOrderItemValidator.controls['Quantity'].setValue(purchaseOrderItem.Quantity);
        this.purchaseOrderItem.PurchaseOrderItemValidator.controls['CCChargePercentage'].setValue(purchaseOrderItem.CCChargePercentage);
        this.purchaseOrderItem.PurchaseOrderItemValidator.controls['DiscountPercentage'].setValue(purchaseOrderItem.DiscountPercentage);
        this.purchaseOrderItem.PurchaseOrderItemValidator.controls['VATPercentage'].setValue(purchaseOrderItem.VATPercentage);
        this.purchaseOrderItem.SubTotal = purchaseOrderItem.SubTotal;
        this.purchaseOrderItem.VATAmount = purchaseOrderItem.VATAmount;
        this.purchaseOrderItem.DiscountAmount = purchaseOrderItem.DiscountAmount;
        this.purchaseOrderItem.CCChargeAmount = purchaseOrderItem.CCChargeAmount;
        this.purchaseOrderItem.TotalAmount = purchaseOrderItem.TotalAmount;
        this.purchaseOrderItem.Remarks = purchaseOrderItem.Remarks;
        this.purchaseOrderItem.POItemStatus = purchaseOrderItem.POItemStatus;
    }
    AddPO() {
        const errorMessages: Array<string> = [];
        let check: boolean = true;

        for (let i in this.purchaseOrderItem.PurchaseOrderItemValidator.controls) {
            this.purchaseOrderItem.PurchaseOrderItemValidator.controls[i].markAsDirty();
            this.purchaseOrderItem.PurchaseOrderItemValidator.controls[i].updateValueAndValidity();
        }

        if (!this.purchaseOrderItem.IsValidCheck(undefined, undefined)) {
            check = false;
        }
        if (check) {
            if (this.currentPO.PHRMPurchaseOrderItems.some(i => i.ItemId === this.purchaseOrderItem.ItemId) && !this.editPO) {
                errorMessages.push('Duplicate item cannot be added ');
                this.msgserv.showMessage(ENUM_MessageBox_Status.Notice, ['Duplicate item cannot be added ']);
                return;
            }
            else {
                if (!this.editPO) {
                    this.currentPO.PHRMPurchaseOrderItems.push(this.purchaseOrderItem);
                }
                else {
                    let index = this.currentPO.PHRMPurchaseOrderItems.findIndex(i => i.PurchaseOrderItemId === this.purchaseOrderItem.PurchaseOrderItemId);
                    if (index >= 0) {
                        this.currentPO.PHRMPurchaseOrderItems[index] = this.purchaseOrderItem;
                    }
                    else {
                        this.currentPO.PHRMPurchaseOrderItems.push(this.purchaseOrderItem);
                    }
                }
                this.CalculationForPO();
                this.purchaseOrderItem = new PHRMPurchaseOrderItems();
                this.FilteredItemList = this.ItemList;
                this.SelectedItem = null;
                this.SelectedGeneric = null;
            }
        }
    }
    CancelItem(index: number) {
        const purchaseOrderItems = this.currentPO.PHRMPurchaseOrderItems[index];
        purchaseOrderItems.POItemStatus = ENUM_PHRMPurchaseOrderStatus.Cancel;
        purchaseOrderItems.IsCancel = true;
        this.CalculationForPO();
    }
    UndoCancelItem(index: number) {
        const purchaseOrderItems = this.currentPO.PHRMPurchaseOrderItems[index];
        purchaseOrderItems.POItemStatus = ENUM_PHRMPurchaseOrderStatus.Active;
        purchaseOrderItems.IsCancel = null;
        this.CalculationForPO();

    }
    handleConfirm() {
        if (!this.editPO) {
            this.AddPurchaseOrder();
        }
        else {
            this.UpdatePurchaseOrder();
        }
    }

    handleCancel() {
        this.loading = false;
    }

    public VerifierSignatories: string[] = [];
    public VerificationLevel: number = 0;
    GetSigningPanelConfiguration() {
        var signingPanelConfigurationParameter = this.coreService.Parameters.find(param => param.ParameterGroupName === 'Pharmacy' && param.ParameterName == "SigningPanelConfiguration")
        if (signingPanelConfigurationParameter) {
            let signingPanelConfigurationParameterValue = JSON.parse(signingPanelConfigurationParameter.ParameterValue);
            let signatoriesWithColSpan = signingPanelConfigurationParameterValue.VerifierSignatories_ColSpan;

            for (const item of signatoriesWithColSpan) {
                const [signatory, colSpanStr] = item.split('_');
                this.VerifierSignatories.push(signatory);
            }
            this.VerificationLevel = signingPanelConfigurationParameterValue.VerificationLevel;
        }


    }


}

class ItemRateHistory {
    ItemId: number = 0;
    ItemName: string = '';
    SupplierName: string = '';
    GRItemPrice: number = 0;
    GoodReceiptDate: string = '';
}

