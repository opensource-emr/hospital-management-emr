import { Component, ChangeDetectorRef } from '@angular/core'
import { Router } from '@angular/router'
import { SecurityService } from "../../../security/shared/security.service"
import { PHRMPurchaseOrder } from "../../shared/phrm-purchase-order.model";
import { PHRMPurchaseOrderItems } from "../../shared/phrm-purchase-order-items.model";
import { PHRMSupplierModel } from "../../shared/phrm-supplier.model"
import { PHRMItemMasterModel } from "../../shared/phrm-item-master.model"
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { MessageboxService } from "../../../shared/messagebox/messagebox.service"
import { ENUM_TermsApplication } from '../../../shared/shared-enums';
import { TermsConditionsMasterModel } from '../../../inventory/shared/terms-conditions-master.model';
import { PharmacyPOService } from '../pharmacy-po.service';
@Component({
    templateUrl: "./phrm-purchase-order.html",
    styleUrls: ["./phrm-purchase-order.css"],
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PHRMPurchaseOrderComponent {
    //binding logic
    public currentPOItem: PHRMPurchaseOrderItems = new PHRMPurchaseOrderItems();
    public currentPO: PHRMPurchaseOrder = new PHRMPurchaseOrder();
    /////For Temporary Storing and Remove Items Whose Qty is Zero When Click on Submit
    public tempcurrentPO: PHRMPurchaseOrder = new PHRMPurchaseOrder();

    //for showing the supplier details
    public SelectedSupplier: PHRMSupplierModel;

    ///this is to get supplierlist 
    public supplierList: Array<PHRMSupplierModel> = new Array<PHRMSupplierModel>();
    //this is to get terms list
    public termsList: Array<TermsConditionsMasterModel> = [];
    public taxList: Array<any>;
    //display Supplier on certain condition only
    //this Item is used for search button(means auto complete button)...
    public ItemList: Array<PHRMItemMasterModel> = new Array<PHRMItemMasterModel>();
    public showAddItemPopUp: boolean = false;
    public index: number = 0;

    public checkIsItemPresent: boolean = false;
    //declare boolean loading variable for disable the double click event of button
    loading: boolean = false;
    validRoutes: any;
    editPO: boolean = false;
    selectedPO: any;
    constructor(public pharmacyPOService: PharmacyPOService, public securityService: SecurityService, public changeDetectorRef: ChangeDetectorRef, public pharmacyBLService: PharmacyBLService, public router: Router, public msgserv: MessageboxService) {
        this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/Order");
        this.ItemList = new Array<PHRMItemMasterModel>();
        this.GetSupplierList();
        this.AddRowRequest(0);
        this.LoadAllItems();
        this.GetTaxList();
        this.GetPharmacyTermsList();
        this.LoadForEditPO();
    }
    ngOnDestroy() {
        this.pharmacyPOService.PurchaseOrderId = 0;
    }
    LoadForEditPO() {
        if (this.pharmacyPOService.PurchaseOrderId > 0) {
            this.editPO = true;
            this.findPurchaseOrder();
        }
    }
    findPurchaseOrder() {
        var poId = this.pharmacyPOService.PurchaseOrderId;
        this.pharmacyPOService.findPurchaseOrder(poId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.selectedPO = res.Results.purchaseOrder;
                    this.currentPO.SubTotal = this.selectedPO.SubTotal;
                    this.currentPO.TotalAmount = this.selectedPO.TotalAmount;
                    this.currentPO.VATAmount = this.selectedPO.VATAmount;
                    this.currentPO.Remarks = this.selectedPO.Remarks;
                    this.currentPO.PurchaseOrderId = this.selectedPO.PurchaseOrderId;
                    this.currentPO.CreatedBy = this.selectedPO.CreatedBy;
                    this.currentPO.CreatedOn = this.selectedPO.CreatedOn;
                    this.currentPO.PODate = this.selectedPO.PODate;
                    this.currentPO.POStatus = this.selectedPO.POStatus;
                    this.currentPO.PurchaseOrderValidator.get("SupplierId").setValue(this.selectedPO.SupplierName);
                    this.currentPO.PHRMPurchaseOrderItems = [];
                    for (let index = 0; index < this.selectedPO.PHRMPurchaseOrderItems.length; index++) {
                        this.currentPO.PHRMPurchaseOrderItems.push(new PHRMPurchaseOrderItems());
                        //this.currentPO.PHRMPurchaseOrderItems[index].PurchaseOrderItemValidator.get("ItemId").setValue(this.selectedPO.PHRMPurchaseOrderItems[index].ItemName);
                        //this.currentPO.PHRMPurchaseOrderItems[index].PurchaseOrderItemValidator.get("Quantity").setValue(this.selectedPO.PHRMPurchaseOrderItems[index].Quantity);
                        this.currentPO.PHRMPurchaseOrderItems[index].StandaredPrice = this.selectedPO.PHRMPurchaseOrderItems[index].StandaredPrice;
                        this.currentPO.PHRMPurchaseOrderItems[index].VatPercentage = this.selectedPO.PHRMPurchaseOrderItems[index].VatPercentage;
                        this.currentPO.PHRMPurchaseOrderItems[index].VATAmount = this.selectedPO.PHRMPurchaseOrderItems[index].VATAmount;
                        this.currentPO.PHRMPurchaseOrderItems[index].TotalAmount = this.selectedPO.PHRMPurchaseOrderItems[index].TotalAmount;
                        this.currentPO.PHRMPurchaseOrderItems[index].DeliveryDays = this.selectedPO.PHRMPurchaseOrderItems[index].DeliveryDays;
                        this.currentPO.PHRMPurchaseOrderItems[index].SelectedItem = this.selectedPO.PHRMPurchaseOrderItems[index].ItemName;
                        this.currentPO.PHRMPurchaseOrderItems[index].ItemId = this.selectedPO.PHRMPurchaseOrderItems[index].ItemId;
                        this.currentPO.PHRMPurchaseOrderItems[index].POItemStatus = this.selectedPO.PHRMPurchaseOrderItems[index].POItemStatus;
                        this.currentPO.PHRMPurchaseOrderItems[index].PendingQuantity = this.selectedPO.PHRMPurchaseOrderItems[index].PendingQuantity;
                        //this.currentPO.PHRMPurchaseOrderItems[index].PurchaseOrderId = this.selectedPO.PHRMPurchaseOrderItems[index].PurchaseOrderId;
                        this.currentPO.PHRMPurchaseOrderItems[index].PurchaseOrderItemId = this.selectedPO.PHRMPurchaseOrderItems[index].PurchaseOrderItemId;
                        this.currentPO.PHRMPurchaseOrderItems[index].Quantity = this.selectedPO.PHRMPurchaseOrderItems[index].Quantity;
                        this.currentPO.PHRMPurchaseOrderItems[index].CreatedBy = this.selectedPO.PHRMPurchaseOrderItems[index].CreatedBy;
                        this.currentPO.PHRMPurchaseOrderItems[index].CreatedOn = this.selectedPO.PHRMPurchaseOrderItems[index].CreatedOn;
                        this.currentPO.PHRMPurchaseOrderItems[index].AuthorizedBy = this.selectedPO.PHRMPurchaseOrderItems[index].AuthorizedBy;
                        this.currentPO.PHRMPurchaseOrderItems[index].AuthorizedOn = this.selectedPO.PHRMPurchaseOrderItems[index].AuthorizedOn;

                    }
                }
            })
    }

    ngAfterViewChecked() {
        this.changeDetectorRef.detectChanges();
    }

    //GET:geting List Of all Supplier 
    GetSupplierList() {
        this.pharmacyBLService.GetSupplierList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.supplierList = res.Results;
                    ///displaying only those supplier in Dropdownlist whose status is Active Now.
                    this.supplierList = this.supplierList.filter(suplr => suplr.IsActive == true);
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
                }
                else {
                    this.msgserv.showMessage("notice-message", ["No Items Avaliable for this ItemType"]);
                }
            });
    }

    //this function load all master tax data
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
    OnItemSelected(Item: any, index) {
        //if proper item is selected then the below code runs ..othewise it goes out side the function
        if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
            //this for loop with if conditon is to check whether the  item is already present in the array or not 
            //means to avoid duplication of item
            for (var i = 0; i < this.currentPO.PHRMPurchaseOrderItems.length; i++) {
                if (this.currentPO.PHRMPurchaseOrderItems[i].ItemId == Item.ItemId && i != index) {
                    this.checkIsItemPresent = true;
                }
            }
            //id item is present the it show alert otherwise it assign the value
            if (this.checkIsItemPresent == true) {
                this.msgserv.showMessage("notice-message", [Item.ItemName + " is already add..Please Check!!!"]);
                this.checkIsItemPresent = false;
                this.changeDetectorRef.detectChanges();
                this.currentPO.PHRMPurchaseOrderItems.splice(index, 1);
                this.currentPOItem = new PHRMPurchaseOrderItems();
                this.currentPO.PHRMPurchaseOrderItems.push(this.currentPOItem);

            }
            else {
                for (var a = 0; a < this.currentPO.PHRMPurchaseOrderItems.length; a++) {
                    // Assiging the value StandardRate,VatPercentage and ItemId in the particular index ..
                    //it helps for changing item after adding the item and also in adding in new item
                    if (a == index) {
                        //this.currentPO.PHRMPurchaseOrderItems[index].StandaredPrice = Item.StandardRate || 0;
                        /////we can display VATPercentage of those item which are VATApplicable because some item does not contails VAT so that we can take VATPercentage for that Zero(0)
                        this.currentPO.PHRMPurchaseOrderItems[index].VatPercentage = (Item.IsVATApplicable == true) ? this.taxList[0].TAXPercentage : 0;
                        this.currentPO.PHRMPurchaseOrderItems[index].ItemId = Item.ItemId;
                        //calculation of POItem
                        this.CalculationForPOItem();
                    }
                }
            }

        }
    }

    AddItemPopUp(i) {
        this.showAddItemPopUp = false;
        this.index = i;
        this.changeDetectorRef.detectChanges();
        this.showAddItemPopUp = true;
    }

    //add a new row 
    AddRowRequest(index) {
        if (this.currentPO.PHRMPurchaseOrderItems.length == 0) {
            this.currentPO.PHRMPurchaseOrderItems.push(this.currentPOItem);
        }
        else {
            //checking the validation
            for (var i = 0; i < this.currentPO.PHRMPurchaseOrderItems.length; i++) {
                // for loop is used to show PurchaseOrderItemValidator message ..if required  field is not filled
                for (var a in this.currentPO.PHRMPurchaseOrderItems[i].PurchaseOrderItemValidator.controls) {
                    this.currentPO.PHRMPurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].markAsDirty();
                    this.currentPO.PHRMPurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].updateValueAndValidity();
                }
            }
            this.currentPOItem = new PHRMPurchaseOrderItems();
            this.currentPO.PHRMPurchaseOrderItems.push(this.currentPOItem);
        }
    }
    //to delete the row
    DeleteRow(index) {
        //this will remove the data from the array
        this.currentPO.PHRMPurchaseOrderItems.splice(index, 1);
        // if the index is 0 then ..  currentPOItem is pushhed in POItems to show the textboxes
        if (index == 0) {
            this.currentPOItem = new PHRMPurchaseOrderItems();
            this.currentPO.PHRMPurchaseOrderItems.push(this.currentPOItem);
            /// this.currentPOItem.Quantity = 1;
            this.CalculationForPO();
            this.changeDetectorRef.detectChanges();

        }
        else {
            this.CalculationForPO();
            this.changeDetectorRef.detectChanges();
        }
    }
    //used to format display item in ng-autocomplete
    ItemListFormatter(data: any): string {
        let html = data["ItemName"];
        return html;
    }
    SupplierListFormatter(data: any): string {
        let html = data["SupplierName"];
        return html;
    }
    // to do Calculation of POItem
    CalculationForPOItem() {

        if (this.currentPOItem.StandaredPrice != null && this.currentPOItem.Quantity != null && this.currentPOItem.VatPercentage != null) {
            this.CalculationForPO();
        }
    }

    //this calculation is for the whole PO
    CalculationForPO() {
        ///local varibale declaration -> assigning all current PO SubTotal, VATAmount, TotalAmount to Zero 
        this.currentPO.SubTotal = 0;
        this.currentPO.VATAmount = 0;
        this.currentPO.TotalAmount = 0;
        for (var i = 0; i < this.currentPO.PHRMPurchaseOrderItems.length; i++) {
            ///calculating currentPO SubTotalAmount and currentPOItems SubTotalAmount using formula StandaredPrice * Quantity
            this.currentPO.PHRMPurchaseOrderItems[i].SubTotal = (this.currentPO.PHRMPurchaseOrderItems[i].StandaredPrice * this.currentPO.PHRMPurchaseOrderItems[i].Quantity)
            this.currentPO.SubTotal = this.currentPO.SubTotal + (this.currentPO.PHRMPurchaseOrderItems[i].StandaredPrice * this.currentPO.PHRMPurchaseOrderItems[i].Quantity);
            /////this Vat is the coversion of vatpercentage
            let Vat = this.currentPO.PHRMPurchaseOrderItems[i].VatPercentage / 100;
            ////calculating VATAmount 
            let vatAmount1 = (this.currentPO.PHRMPurchaseOrderItems[i].StandaredPrice * this.currentPO.PHRMPurchaseOrderItems[i].Quantity) * Vat;
            /////calculating currentPO VATAmount and currentPOItems VATAmount 
            this.currentPO.PHRMPurchaseOrderItems[i].VATAmount = vatAmount1;
            this.currentPO.VATAmount = (Math.round((this.currentPO.VATAmount + vatAmount1) * 100) / 100);
            /////calculating currentPO TotalAmount and currentPOItems TotalAmount
            this.currentPO.PHRMPurchaseOrderItems[i].TotalAmount = (this.currentPO.PHRMPurchaseOrderItems[i].StandaredPrice * this.currentPO.PHRMPurchaseOrderItems[i].Quantity + vatAmount1);
            this.currentPO.TotalAmount = (Math.round((this.currentPO.TotalAmount + this.currentPO.PHRMPurchaseOrderItems[i].TotalAmount) * 100) / 100);
        }
    }



    //POST: posting to db
    AddPurchaseOrder() {
        // this CheckIsValid varibale is used to check whether all the validation are proper or not ..
        //if the CheckIsValid == true the validation is proper else no
        var CheckIsValid = true;
        var errorMessages: string[] = [];
        if (this.currentPO.IsValidCheck(undefined, undefined) == false) {
            // for loop is used to show PurchaseOrderValidator message ..if required  field is not filled
            CheckIsValid = false;
            for (var b in this.currentPO.PurchaseOrderValidator.controls) {
                this.currentPO.PurchaseOrderValidator.controls[b].markAsDirty();
                this.currentPO.PurchaseOrderValidator.controls[b].updateValueAndValidity();
                if (this.currentPO.PurchaseOrderValidator.controls[b].invalid) {
                    errorMessages.push(`${b} is not valid.`)
                }
            }
        }
        for (var i = 0; i < this.currentPO.PHRMPurchaseOrderItems.length; i++) {
            if (this.currentPO.PHRMPurchaseOrderItems[i].IsValidCheck(undefined, undefined) == false) {
                CheckIsValid = false;
                // for loop is used to show PurchaseOrderItemValidator message ..if required  field is not filled
                for (var a in this.currentPO.PHRMPurchaseOrderItems[i].PurchaseOrderItemValidator.controls) {
                    this.currentPO.PHRMPurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].markAsDirty();
                    this.currentPO.PHRMPurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].updateValueAndValidity();
                    if (this.currentPO.PHRMPurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].invalid) {
                        errorMessages.push(`${a} is not valid for item ${i + 1}.`)
                    }
                }
            }
        }
        if (this.currentPO.PHRMPurchaseOrderItems == null || this.currentPO.PHRMPurchaseOrderItems.length == 0) {
            CheckIsValid = false;
            errorMessages.push("Please Add Item ...Before Requesting");
        }
        if (CheckIsValid == true) {
            ////Push Actual PurchaseItems To Temporary Model
            for (var i = 0; i < this.currentPO.PHRMPurchaseOrderItems.length; i++) {
                this.tempcurrentPO.PHRMPurchaseOrderItems.push(this.currentPO.PHRMPurchaseOrderItems[i]);
            }
            ////Clear all Items From Actual Obj .....and Check in Temp Obj .....and Pass those Items From Temp to Actual obj whose Quantity is not equal to Zero
            this.currentPO.PHRMPurchaseOrderItems = [];

            for (var i = 0; i < this.tempcurrentPO.PHRMPurchaseOrderItems.length; i++) {

                if (this.tempcurrentPO.PHRMPurchaseOrderItems[i].Quantity != 0) {
                    //    ///updating the each POItemsStatus to Active
                    this.tempcurrentPO.PHRMPurchaseOrderItems[i].POItemStatus = "active";
                    this.tempcurrentPO.PHRMPurchaseOrderItems[i].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                    this.tempcurrentPO.PHRMPurchaseOrderItems[i].AuthorizedBy = this.securityService.GetLoggedInUser().EmployeeId;

                    ////Now Current Return Obj has Those Item Whose Qunatity Is Greater Then Zero
                    this.currentPO.PHRMPurchaseOrderItems.push(this.tempcurrentPO.PHRMPurchaseOrderItems[i]);
                }
            }
            if (this.currentPO.PHRMPurchaseOrderItems.length) {
                this.loading = true;
                //Updating the POStatus To Active
                this.currentPO.POStatus = "active";
                this.currentPO.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                ////calling pharmacyblservice 
                this.pharmacyBLService.PostToPurchaseOrder(this.currentPO).finally(() => this.loading = false)
                    .subscribe(res => {
                        if (res.Status == 'OK') {
                            this.msgserv.showMessage("success", ["Purchase Order is Generated and Saved"]);
                            this.changeDetectorRef.detectChanges();
                            //deleting all creating new PO..after successully adding to db
                            this.currentPO.PHRMPurchaseOrderItems = new Array<PHRMPurchaseOrderItems>();
                            this.currentPO = new PHRMPurchaseOrder();
                            this.SelectedSupplier = new PHRMSupplierModel();
                            this.currentPOItem = new PHRMPurchaseOrderItems();
                            this.currentPO.PHRMPurchaseOrderItems.push(this.currentPOItem);
                            this.router.navigate(['/Pharmacy/Order/PurchaseOrderList']);
                        }
                        else {
                            err => {
                                this.msgserv.showMessage("failed", ['failed to add Purchase Order.. please check log for details.']);
                                this.logError(err.ErrorMessage);
                            }
                        }
                    });
            }
            else {
                if (this.currentPO.PHRMPurchaseOrderItems.length == 0) {
                    this.currentPOItem = new PHRMPurchaseOrderItems();
                    this.currentPO.PHRMPurchaseOrderItems.push(this.currentPOItem);
                }
                this.msgserv.showMessage("notice-message", ['All Selected Purchase Items Quantity is zero']);
                this.router.navigate(['/Pharmacy/Order/PurchaseOrderItems']);
            }
        }
        else {
            this.msgserv.showMessage("Failed", errorMessages);
        }
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

        for (var i = 0; i < this.currentPO.PHRMPurchaseOrderItems.length; i++) {
            if (this.currentPO.PHRMPurchaseOrderItems[i].IsValidCheck(undefined, undefined) == false) {
                // for loop is used to show PurchaseOrderItemValidator message ..if required  field is not filled
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
            
            this.pharmacyPOService.UpdatePurchaseOrder(this.currentPO).
                subscribe(res => {
                    if (res.Status == 'OK') {
                        this.msgserv.showMessage("success", ["Purchase Order Updated Successfully!"]);
                        this.changeDetectorRef.detectChanges();
                        //deleting all creating new PO..after successully adding to db
                        this.currentPO.PHRMPurchaseOrderItems = new Array<PHRMPurchaseOrderItems>();
                        this.currentPO = new PHRMPurchaseOrder();
                        this.currentPOItem = new PHRMPurchaseOrderItems();
                        this.currentPOItem.Quantity = 1;
                        this.currentPO.PHRMPurchaseOrderItems.push(this.currentPOItem);
                        this.pharmacyPOService.PurchaseOrderId = res.Results;
                        this.router.navigate(['/Pharmacy/Order/PurchaseOrderList']);
                        this.loading = false;
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
    OnPressedEnterKeyInPrice(index: number) {
        let isDataValid = this.currentPO.PHRMPurchaseOrderItems.every(a => a.PurchaseOrderItemValidator.valid == true);
        if (isDataValid) {
            this.AddRowRequest(index);
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

    //Discard button
    DiscardPurchaseOrder() {

        //navigate to POLIST Page
        this.router.navigate(["/Pharmacy/Order/PurchaseOrderList"]);
    }

    SetFocusById(IdToBeFocused) {
        window.setTimeout(function () {
            var element = <HTMLInputElement>document.getElementById(IdToBeFocused);
            element.focus();
            //element.select();
        }, 20);
    }
}

