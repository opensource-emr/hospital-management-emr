import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../../../core/shared/core.service';
import { CurrencyModel } from '../../../inventory/settings/shared/currency.model';
import { InventorySettingBLService } from '../../../inventory/settings/shared/inventory-settings.bl.service';
import { InventoryBLService } from '../../../inventory/shared/inventory.bl.service';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { ItemMaster } from '../../../inventory/shared/item-master.model';
import { VendorMaster } from '../../../inventory/shared/vendor-master.model';
import { SecurityService } from '../../../security/shared/security.service';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { InventoryFieldCustomizationService } from '../../../shared/inventory-field-customization.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_GRItemCategory, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { ProcurementBLService } from '../../shared/procurement.bl.service';
import { PurchaseOrderDraftItem } from '../purchase-order-draft-item.model';
import { PurchaseOrderDraft } from '../purchase-order-draft.model';

@Component({
    selector: 'purchase-order-draft-add',
    templateUrl: './purchase-order-draft-add.html',
    styles: []
})
export class PurchaseOrderDraftAddComponent {
    public currentPOD: PurchaseOrderDraft = new PurchaseOrderDraft();
    public selectedVndr: any;
    public VendorList: Array<VendorMaster> = new Array<VendorMaster>();
    public ItemList: any[] = [];
    public currencyCodeList: Array<CurrencyModel> = new Array<CurrencyModel>();
    public selectedCurrencyCode: CurrencyModel;
    filteredItemList: Array<ItemMaster> = new Array<ItemMaster>();
    public index: number = 0;
    public showAddItemPopUp: boolean = false;
    public showAddVendorPopUp: boolean = false;
    public EditPO: boolean = false;
    public RecreatePO: boolean = false;
    public loading: boolean = false;
    public POCategories: string[] = [];
    public poFormParameterValue: any;
    showBarcode: boolean = false;
    showSpecification: boolean = false;
    @Output('call-back-close') callbackClose: EventEmitter<Object> = new EventEmitter<Object>();
    public showPurchaseOrderDraftListPage: boolean = false;
    constructor(public procurementBLService: ProcurementBLService, public inventoryService: InventoryService, public coreService: CoreService, public changeDetectorRef: ChangeDetectorRef, public messageBoxService: MessageboxService, public securityService: SecurityService, public invSettingBL: InventorySettingBLService, public router: Router, public route: ActivatedRoute, private _activateInventoryService: ActivateInventoryService, public inventoryFieldCustomizationService: InventoryFieldCustomizationService, public inventoryBlService: InventoryBLService) {
        this.GetVendorList();
        this.LoadItemList();
        this.LoadPOCategory();
        this.GetPOFormCustomizationParameter();
        this.GetInventoryFieldCustomization();
        if (this.inventoryService.DraftPurchaseOrderId > 0) {
            this.LoadPurchaseOrderDraftDetails(this.inventoryService.DraftPurchaseOrderId);
        }
    }
    ngOnInit() {

    }
    ngOnDestroy() {
        this.inventoryService.DraftPurchaseOrderId = 0;
    }
    GetPOFormCustomizationParameter() {
        var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'POFormCustomization').ParameterValue;
        if (paramValue)
            this.poFormParameterValue = JSON.parse(paramValue);
        else
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Failed to get POFormCustomization value."]);
    }
    GetInventoryFieldCustomization(): void {
        let parameter = this.inventoryFieldCustomizationService.GetInventoryFieldCustomization();
        this.showBarcode = parameter.showBarcode;
        this.showSpecification = parameter.showSpecification;
    }
    ngAfterViewChecked() {
        this.changeDetectorRef.detectChanges();
    }
    public LoadPOCategory() {
        this.POCategories = Object.values(ENUM_GRItemCategory).filter(p => isNaN(p as any));
    }

    public get getValidItemCount() {
        return this.currentPOD.PurchaseOrderDraftItems.filter(a => a.ItemId > 0).length;
    }
    LoadItemList(): void {
        let itemList = this.inventoryService.allItemList;
        if (itemList == undefined || itemList.length == 0) {
            this.AddRowRequest();
        } else {
            this.ItemList = this.inventoryService.allItemList;
            if (this.EditPO == false) {
                this.ItemList = this.ItemList.filter(item => item.IsActive == true);
                this.filteredItemList = this.ItemList.filter(item => item.ItemType === "Consumables");
                this.AddRowRequest();
            }
        }
    }
    OnItemCategoryChanged(indx: number) {
        let poDraftItem = this.currentPOD.PurchaseOrderDraftItems[indx];
        this.filteredItemList = this.GetItemListByItemCategory(poDraftItem.ItemCategory);
        this.filteredItemList = this.filteredItemList.slice();
    }
    GetItemListByItemCategory(itmCategory: string) {
        let retItemList = this.ItemList.filter(item => item.ItemType == itmCategory);
        return retItemList;
    }
    GetVendorList() {
        try {
            this.VendorList = this.inventoryService.allVendorList;
            if (this.VendorList.length <= 0) {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to load the vendor list."]);
            }
            else {
                if (this.EditPO == false)
                    this.VendorList = this.VendorList.filter(vendor => vendor.IsActive == true);
                window.setTimeout(function () {
                    let itmNameBox = document.getElementById("VendorName");
                    if (itmNameBox && this.EditPO == false) {
                        itmNameBox.focus();
                    }
                }, 600);
            }
        } catch (ex) {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Something went wrong while loading vendor list."]);
        }
    }
    GetVendorDetails() {
        if (this.selectedVndr && typeof (this.selectedVndr) == "string") {
            let selectedVndr = this.VendorList.find(a => a.VendorName == this.selectedVndr);
            if (selectedVndr && selectedVndr.VendorId) {
                this.selectedVndr = selectedVndr;
                this.currentPOD.VendorId = this.selectedVndr.VendorId;
            }
        }
        if (this.selectedVndr && typeof (this.selectedVndr) == 'object') {
            var selVndr = this.VendorList.find(a => a.VendorId == this.selectedVndr.VendorId);
            if (selVndr && selVndr.VendorId) {
                this.currentPOD.VendorId = this.selectedVndr.VendorId;
                if (this.selectedVndr.DefaultCurrencyId != null) {
                    this.currentPOD.CurrencyId = this.selectedVndr.DefaultCurrencyId;
                    this.selectedCurrencyCode = this.currencyCodeList.find(c => c.CurrencyID == this.currentPOD.CurrencyId);
                }
            }
        }
        else {
            this.currentPOD.VendorId = null;
        }
    }
    //add a new row
    AddRowRequest(index: number = this.currentPOD.PurchaseOrderDraftItems.length) {
        var newPoItem = new PurchaseOrderDraftItem();
        newPoItem.Quantity = 1;
        newPoItem.ItemCategory = ENUM_GRItemCategory.Consumables;
        this.filteredItemList = this.GetItemListByItemCategory(newPoItem.ItemCategory);
        this.currentPOD.PurchaseOrderDraftItems.splice(index, 0, newPoItem);
        window.setTimeout(function () {
            let itmNameBox = document.getElementById("poItemName" + index);
            if (itmNameBox && this.EditPO == false) {
                itmNameBox.focus();
            }
        }, 600);

    }

    //to delete the row
    DeleteRow(index) {
        this.currentPOD.PurchaseOrderDraftItems.splice(index, 1);
        if (this.currentPOD.PurchaseOrderDraftItems.length == 0) {
            this.AddRowRequest(0);
        }
        this.updateItemDuplicationStatus();
        this.calculateAndUpdateAmounts();
    }
    public updateItemDuplicationStatus() {
        if (this.currentPOD.PurchaseOrderDraftItems) {
            for (var i = 0; i < this.currentPOD.PurchaseOrderDraftItems.length; i++) {
                this.currentPOD.PurchaseOrderDraftItems[i].isItemDuplicate = this.currentPOD.PurchaseOrderDraftItems.some((thisitem, index) => thisitem.ItemId == this.currentPOD.PurchaseOrderDraftItems[i].ItemId && index != i);
            }
        }
    }
    SelectItemFromSearchBox(Item: ItemMaster, index) {
        if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
            this.updateItemDuplicationStatus();

            const selectedItem = this.currentPOD.PurchaseOrderDraftItems[index];
            if (!selectedItem.DraftPurchaseOrderItemId) {
                selectedItem.ItemRate = Item.StandardRate;
                selectedItem.Code = Item.Code;
                selectedItem.UOMName = Item.UOMName;
                selectedItem.VATPercentage = Item.VAT ? Item.VAT : 0;
                selectedItem.ItemId = Item.ItemId;
            }
            this.calculateAndUpdateAmounts();
        }
    }
    ItemListFormatter(data: any): string {
        let html = data["ItemName"] + " (" + data["ItemType"] + ")";
        html += (data["Description"] == null || data["Description"] == "") ? "" : ("|" + data["Description"]);
        return html;
    }

    VendorListFormatter(data: any): string {
        let html = data["VendorName"];
        return html;
    }

    //posting to db
    AddPurchaseOrderDraft() {
        var CheckIsValid = true;
        var errorMessages = [];

        if (this.currentPOD.IsValidCheck(undefined, undefined) == false) {
            for (let b in this.currentPOD.PurchaseOrderDraftValidator.controls) {
                this.currentPOD.PurchaseOrderDraftValidator.controls[b].markAsDirty();
                this.currentPOD.PurchaseOrderDraftValidator.controls[b].updateValueAndValidity();
                if (this.currentPOD.PurchaseOrderDraftValidator.controls[b].status == "INVALID") {
                    errorMessages.push(`${b} is invalid.`);
                }
                CheckIsValid = false;
            }
        }
        for (let i = 0; i < this.currentPOD.PurchaseOrderDraftItems.length; i++) {
            if (this.currentPOD.PurchaseOrderDraftItems[i].IsValidCheck(undefined, undefined) == false) {
                for (var a in this.currentPOD.PurchaseOrderDraftItems[i].PurchaseOrderDraftItemValidator.controls) {
                    this.currentPOD.PurchaseOrderDraftItems[i].PurchaseOrderDraftItemValidator.controls[a].markAsDirty();
                    this.currentPOD.PurchaseOrderDraftItems[i].PurchaseOrderDraftItemValidator.controls[a].updateValueAndValidity();
                    if (this.currentPOD.PurchaseOrderDraftItems[i].PurchaseOrderDraftItemValidator.controls[a].status == "INVALID") {
                        errorMessages.push(`${a} is invalid in item ${i + 1}.`);
                    }
                }
                CheckIsValid = false;
            }
        }

        if (this.currentPOD.PurchaseOrderDraftItems.every(itm => itm.ItemId === 0)) {
            errorMessages.push("Please Add Item ...Before Requesting");
        }

        if (CheckIsValid == true && this.currentPOD.PurchaseOrderDraftItems.length) {
            this.currentPOD.Status = "InProgress";
            if (!this._activateInventoryService.activeInventory.StoreId) {
                this.messageBoxService.showMessage("Alert!", ["Cannot find StoreId. Please select Inventory First"])
                return;
            } else {
                this.currentPOD.PODGroupId = this._activateInventoryService.activeInventory.INV_POGroupId;
            }
            this.procurementBLService.PostToPurchaseOrderDraft(this.currentPOD).finally(() => {
                this.loading = false;
            }).subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results != null) {
                    this.ResetForm();
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Purchase Order Draft Saved successfully"]);
                    this.callbackClose.emit(true);
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
                }
            })
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, errorMessages);
        }
    }
    private ResetForm() {
        this.currentPOD = new PurchaseOrderDraft();
        this.currentPOD.PurchaseOrderDraftItems = [];
        this.selectedVndr = null;
    }

    //this is to cancel the whole PODraft at one go and adding new PODraft
    Cancel() {
        this.currentPOD.PurchaseOrderDraftItems = new Array<PurchaseOrderDraftItem>();
        this.currentPOD = new PurchaseOrderDraft();
        this.selectedVndr = '';
        this.router.navigate(['ProcurementMain/PurchaseOrder/PurchaseOrderList']);
    }
    AddItemPopUp(i) {
        this.showAddItemPopUp = false;
        this.index = i;
        this.changeDetectorRef.detectChanges();
        this.showAddItemPopUp = true;
    }

    OnNewItemAdded($event) {
        this.showAddItemPopUp = false;
        var item = $event.item;
        this.ItemList.push({
            "ItemId": item.ItemId, "ItemName": item.ItemName, StandardRate: item.StandardRate, VAT: item.VAT, ItemType: item.ItemType, Code: item.Code, UOMName: item.UOMName
        });
        var newPOItem = new PurchaseOrderDraftItem();
        newPOItem.Quantity = 1;
        newPOItem.ItemCategory = item.ItemType
        newPOItem.ItemId = item.ItemId;

        this.currentPOD.PurchaseOrderDraftItems.splice(this.index, 1, newPOItem);
        this.GoToNextInput("poDItemName" + this.index, 100);
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
        this.selectedCurrencyCode = this.currencyCodeList.find(c => c.CurrencyID == supplier.DefaultCurrencyId);
        this.currentPOD.VendorId = supplier.VendorId;
        this.currentPOD.CurrencyId = supplier.DefaultCurrencyId;
        this.inventoryService.allVendorList.push(supplier);
        console.log("vendor count-bottom:" + this.VendorList.length);
        this.GoToNextInput(`poItemName0`);

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
    onPressedEnterKeyInItemField(index: number) {
        if (this.currentPOD.PurchaseOrderDraftItems[index].ItemId > 0) {
            if (this.poFormParameterValue.showVendorItemCode == true) {
                this.GoToNextInput('vendorCode' + index, 200);
            }
            else {
                this.GoToNextInput('ipqty' + index, 200);
            }
        }
        else {
            this.GoToNextInput("PurchaseOrderDraftbtn");
        }
    }
    onPressedEnterKeyInRateField(index: number) {
        if (index == (this.currentPOD.PurchaseOrderDraftItems.length - 1)) {
            this.AddRowRequest();
        }
        else {
            this.GoToNextInput('poItemName' + (index + 1))
        }
    }
    calculateAndUpdateAmounts() {
        this.resetCalculation();
        for (var i = 0; i < this.currentPOD.PurchaseOrderDraftItems.length; i++) {
            let item = this.currentPOD.PurchaseOrderDraftItems[i];
            let itemSubTotal = item.ItemRate * item.Quantity;
            item.SubTotal = itemSubTotal;
            item.VATAmount = (itemSubTotal * item.VATPercentage) / 100;
            item.TotalAmount = itemSubTotal + (item.VATPercentage > 0 ? item.VATAmount : 0);
            this.currentPOD.SubTotal += itemSubTotal;
            this.currentPOD.VATAmount += item.VATAmount;
            this.currentPOD.TotalAmount += item.TotalAmount;
        }
    }
    private resetCalculation() {
        this.currentPOD.SubTotal = 0;
        this.currentPOD.VATAmount = 0;
        this.currentPOD.TotalAmount = 0;
    }
    LoadPurchaseOrderDraftDetails(poDraftId: number) {
        if (poDraftId != null) {
            this.inventoryBlService.GetPurchaseOrderDraftById(poDraftId)
                .subscribe(res => this.ShowPurchaseOrderDraftDetails(res));
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Please, Select PurchaseOrder for Details.']);
            this.callbackClose.emit();
        }
    }

    ShowPurchaseOrderDraftDetails(res) {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
            let currentPOD = new PurchaseOrderDraft();
            this.currentPOD = Object.assign(currentPOD, res.Results.poDraftDetails);
            let currentPOItems = new Array<PurchaseOrderDraftItem>();
            if (res.Results && res.Results.poDraftItems) {
                res.Results.poDraftItems.forEach(poItem => {
                    let currentPoItem = new PurchaseOrderDraftItem();
                    currentPOItems.push(Object.assign(currentPoItem, poItem));
                });
            }
            this.currentPOD.PurchaseOrderDraftItems = currentPOItems;
            if (this.currentPOD.Status === "InProgress") {
                this.EditPO = true;
            }
            else {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["There is no PurchaseOrder details !"]);
                this.callbackClose.emit(false);
            }
            this.selectedVndr = this.currentPOD.VendorName;
            this.currentPOD.PurchaseOrderDraftItems.forEach(item => {
                let selectedItem: ItemMaster = new ItemMaster();
                selectedItem.ItemId = item.ItemId;
                selectedItem.ItemName = item.ItemName;
                item.SelectedItem = selectedItem;
                item.Quantity = item.Quantity;
                item.Remarks = item.Remarks;
            });
            this.currentPOD.PurchaseOrderDraftItems = this.currentPOD.PurchaseOrderDraftItems.filter(i => i.IsActive == true);
        }
    }
    EditPurchaseOrderDraft() {
        var CheckIsValid = true;
        var errorMessages = [];
        if (this.currentPOD.IsValidCheck(undefined, undefined) == false) {
            for (var b in this.currentPOD.PurchaseOrderDraftValidator.controls) {
                this.currentPOD.PurchaseOrderDraftValidator.controls[b].markAsDirty();
                this.currentPOD.PurchaseOrderDraftValidator.controls[b].updateValueAndValidity();
                if (this.currentPOD.PurchaseOrderDraftValidator.controls[b].status == "INVALID") {
                    errorMessages.push(`${b} is invalid.`);
                }
                CheckIsValid = false;
            }
        }
        for (var i = 0; i < this.currentPOD.PurchaseOrderDraftItems.length; i++) {

            if (this.currentPOD.PurchaseOrderDraftItems[i].IsValidCheck(undefined, undefined) == false) {
                for (var a in this.currentPOD.PurchaseOrderDraftItems[i].PurchaseOrderDraftItemValidator.controls) {
                    this.currentPOD.PurchaseOrderDraftItems[i].PurchaseOrderDraftItemValidator.controls[a].markAsDirty();
                    this.currentPOD.PurchaseOrderDraftItems[i].PurchaseOrderDraftItemValidator.controls[a].updateValueAndValidity();
                    if (this.currentPOD.PurchaseOrderDraftItems[i].PurchaseOrderDraftItemValidator.controls[a].status == "INVALID") {
                        errorMessages.push(`${a} is invalid in item ${i + 1}.`);
                    }
                }
                CheckIsValid = false;
            }

        }
        if (this.currentPOD.PurchaseOrderDraftItems.every(itm => itm.ItemId === 0)) {
            errorMessages.push("Please Add Item ...Before Requesting");
        }

        if (CheckIsValid == true && this.currentPOD.PurchaseOrderDraftItems != null) {
            this.currentPOD.Status = "InProgress";
            if (!this._activateInventoryService.activeInventory.StoreId) {
                this.messageBoxService.showMessage("Alert!", ["Cannot find StoreId. Please select Inventory First"])
                return;
            } else {
                this.currentPOD.PODGroupId = this._activateInventoryService.activeInventory.INV_POGroupId;
            }

            this.procurementBLService.UpdatePurchaseOrderDraft(this.currentPOD).finally(() => {
                this.loading = false;
            }).subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results != null) {
                    this.currentPOD = new PurchaseOrderDraft();
                    this.currentPOD.PurchaseOrderDraftItems = [];
                    this.selectedVndr = null;
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Purchase Order Draft Saved successfully"]);
                    this.callbackClose.emit(true);
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
                }
            })
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, errorMessages);
        }
    }
    ClosePurchaseOrderDraftAddEditPage() {
        this.callbackClose.emit(false);
    }

    ClosePurchaseOrderDraftListPage() {
        this.showPurchaseOrderDraftListPage = false;
    }
}

