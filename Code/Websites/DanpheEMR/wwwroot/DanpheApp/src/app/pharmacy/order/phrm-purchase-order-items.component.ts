import { Component, ChangeDetectorRef } from '@angular/core'
import { Router, RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
import { PHRMPurchaseOrder } from "../shared/phrm-purchase-order.model";
import { PHRMPurchaseOrderItems } from "../shared/phrm-purchase-order-items.model";
import { PHRMSupplierModel } from "../shared/phrm-supplier.model"
import { PHRMItemMasterModel } from "../shared/phrm-item-master.model"
import { PHRMItemTypeModel } from "../shared/phrm-item-type.model"
import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { phrmitemaddComponent } from "../common/phrmitem-add.component"
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
@Component({
    templateUrl: "../../view/pharmacy-view/Order/PHRMPurchaseOrderItems.html" // "/PharmacyView/PHRMPurchaseOrderItems"
})
export class PHRMPurchaseOrderItemsComponent {
    //binding logic
    public currentPOItem: PHRMPurchaseOrderItems = new PHRMPurchaseOrderItems();
    public currentPO: PHRMPurchaseOrder = new PHRMPurchaseOrder();
    /////For Temporary Storing and Remove Items Whose Qty is Zero When Click on Submit
    public tempcurrentPO: PHRMPurchaseOrder = new PHRMPurchaseOrder();

    //for showing the supplier details
    public SelectedSupplier: PHRMSupplierModel = new PHRMSupplierModel();

    ///this is to get supplierlist 
    public supplierList: Array<PHRMSupplierModel> = new Array<PHRMSupplierModel>();
    //display Supplier on certain condition only
    public ShowSupplierDetails: boolean = false;
    //this Item is used for search button(means auto complete button)...
    public ItemList: Array<PHRMItemMasterModel> = new Array<PHRMItemMasterModel>();
    public ItemTypeList: Array<PHRMItemTypeModel> = new Array<PHRMItemTypeModel>();
    //public ItemTypeList: any;
    public itemTypeMapItemListData = new Array<{ ItemTypeId: number, ItemList: Array<PHRMItemMasterModel> }>();
    public showAddItemPopUp: boolean = false;
    public index: number = 0;
    
    public checkIsItemPresent: boolean = false;
    //this is to add or delete the number of row in ui
    public rowCount: number = 0;
    //declare boolean loading variable for disable the double click event of button
    loading: boolean = false;
    validRoutes: any;
    constructor(public securityService: SecurityService, public changeDetectorRef: ChangeDetectorRef
        , public pharmacyBLService: PharmacyBLService, public router: Router
        , public msgserv: MessageboxService) {
        this.validRoutes = this.securityService.GetChildRoutes("Pharmacy/Order");
        this.ItemList = new Array<PHRMItemMasterModel>();
        this.GetSupplierList();
       // this.LoadItemTypeList();
        this.AddRowRequest(0);
        this.LoadAllItems();
    }

    ngAfterViewChecked()
    {
    this.changeDetectorRef.detectChanges();
    }

    //GET:getting supplier details By Supplier Id
    GetSupplierDetails(SupplierId) {
        if (SupplierId != null && SupplierId != 0) {
            this.pharmacyBLService.GetSupplierDetailsBySupplierId(SupplierId)
                .subscribe(res => {
                    if (res.Status == 'OK') {
                        this.SelectedSupplier = res.Results[0];
                        //display Supplier on certain condition only
                        this.ShowSupplierDetails = true;

                    }
                    else {
                        err => {
                            this.msgserv.showMessage("falied", ['failed to get SupplierDetails.. please check log for details.']);
                        }
                    }
                });

        }
    }

    //GET:geting List Of all Supplier 
    GetSupplierList() {
        this.pharmacyBLService.GetSupplierList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.supplierList = res.Results;
                    ///displaying only those supplier in Dropdownlist whose status is Active Now.
                    this.supplierList = this.supplierList.filter(suplr => suplr.IsActive == true);
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


    //GET: to load the itemType in the start
    //LoadItemTypeList(): void {
    //    this.pharmacyBLService.GetItemTypeList()
    //        .subscribe(res => this.CallBackGetItemTypeList(res));
    //}
    //CallBackGetItemTypeList(res) {
    //    if (res.Status == 'OK') {
    //        ////this.ItemTypeList = [];
    //        if (res.Results) {
    //            this.ItemTypeList = res.Results;
    //            ///displaying only those ItemTypeList in Dropdown whose Status is Active Now. 
    //            this.ItemTypeList = this.ItemTypeList.filter(itmtype => itmtype.IsActive == true);

    //        }

    //    }
    //    else {
    //        err => {
    //            this.msgserv.showMessage("failed", ['failed to get ItemsList.. please check log for details.']);
    //        }
    //    }
    //}
    //onChange(itemTypeId, index) {
    //    //find itemtype with itemlist as locally if yes then take this else go to server
    //    let ItemTypeData = this.itemTypeMapItemListData.find(a => a.ItemTypeId == itemTypeId);
    //    if (ItemTypeData && itemTypeId) {
    //        this.currentPO.PHRMPurchaseOrderItems[index].ItemListByItemType = [];
    //        this.currentPO.PHRMPurchaseOrderItems[index].ItemListByItemType = ItemTypeData.ItemList;
    //    }
    //    else {
    //        if (itemTypeId && index >= 0) {
    //            this.pharmacyBLService.GetItemListByItemTypeId(itemTypeId)
    //                .subscribe(res => {
    //                    if (res.Status == "OK" && res.Results.length > 0) {
    //                        this.currentPO.PHRMPurchaseOrderItems[index].ItemListByItemType = [];
    //                        this.currentPO.PHRMPurchaseOrderItems[index].ItemListByItemType = res.Results;
    //                        let tempItmList = { ItemTypeId: itemTypeId, ItemList: res.Results };
    //                        this.itemTypeMapItemListData.push(tempItmList);
    //                    }
    //                    else {
    //                        this.currentPO.PHRMPurchaseOrderItems[index].ItemListByItemType = [];
    //                        this.msgserv.showMessage("notice-message", ["No Items Avaliable for this ItemType"]);
    //                    }
    //                });
    //        }
    //    }
    //}
    LoadAllItems() {
            this.pharmacyBLService.GetAllItems()
                .subscribe(res => {
                    if (res.Status == "OK" && res.Results.length > 0) {
                        //this.currentPO.PHRMPurchaseOrderItems[index].ItemListByItemType = [];
                        //this.currentPO.PHRMPurchaseOrderItems[index].ItemListByItemType = res.Results;
                        let tempItmList = { ItemTypeId: null, ItemList: res.Results };

                        this.itemTypeMapItemListData.push(tempItmList);
                        this.ItemList = res.Results;
                    }
                    else {
                        //this.currentPO.PHRMPurchaseOrderItems[].ItemListByItemType = [];
                        this.msgserv.showMessage("notice-message", ["No Items Avaliable for this ItemType"]);
                    }
                });

        
    }

    SelectItemFromSearchBox(Item: PHRMItemMasterModel, index) {
        //if proper item is selected then the below code runs ..othewise it goes out side the function
        if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
            //this for loop with if conditon is to check whether the  item is already present in the array or not 
            //means to avoid duplication of item
            for (var i = 0; i < this.currentPO.PHRMPurchaseOrderItems.length; i++) {
                if (this.currentPO.PHRMPurchaseOrderItems[i].ItemId == Item.ItemId) {
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
                /// this.currentPOItem.Quantity = 1;
                this.currentPO.PHRMPurchaseOrderItems.push(this.currentPOItem);

            }
            else {
                for (var a = 0; a < this.currentPO.PHRMPurchaseOrderItems.length; a++) {
                    // Assiging the value StandardRate,VatPercentage and ItemId in the particular index ..
                    //it helps for changing item after adding the item and also in adding in new item
                    if (a == index) {
                        this.currentPO.PHRMPurchaseOrderItems[index].StandaredPrice = 0;
                        /////we can display VATPercentage of those item which are VATApplicable because some item does not contails VAT so that we can take VATPercentage for that Zero(0)
                        this.currentPO.PHRMPurchaseOrderItems[index].VatPercentage = (Item.IsVATApplicable == true) ? Item.VATPercentage : 0;
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
            ////this.currentPOItem.Quantity = 1;
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
            ////row can be added if only if the item is selected is last row
            this.rowCount++;
            this.currentPOItem = new PHRMPurchaseOrderItems();
            ////this.currentPOItem.Quantity = 1;
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
    myListFormatter(data: any): string {
        let html = data["ItemName"];
        return html;
    }
    // to do Calculation of POItem
    CalculationForPOItem() {

        if (this.currentPOItem.StandaredPrice != null && this.currentPOItem.Quantity != null && this.currentPOItem.VatPercentage != null) {
            //this Vat is the coversion of vatpercentage
            let Vat = this.currentPOItem.VatPercentage / 100;
            ///this vatAmount is calculating VATAmount of Each items
            let vatAmount = (this.currentPOItem.StandaredPrice * this.currentPOItem.Quantity) * Vat;
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

        if (this.currentPO.IsValidCheck(undefined, undefined) == false) {
            // for loop is used to show PurchaseOrderValidator message ..if required  field is not filled
            for (var b in this.currentPO.PurchaseOrderValidator.controls) {
                this.currentPO.PurchaseOrderValidator.controls[b].markAsDirty();
                this.currentPO.PurchaseOrderValidator.controls[b].updateValueAndValidity();
                CheckIsValid = false;
            }
        }


        for (var i = 0; i < this.currentPO.PHRMPurchaseOrderItems.length; i++) {
            if (this.currentPO.PHRMPurchaseOrderItems[i].IsValidCheck(undefined, undefined) == false) {
                // for loop is used to show PurchaseOrderItemValidator message ..if required  field is not filled
                for (var a in this.currentPO.PHRMPurchaseOrderItems[i].PurchaseOrderItemValidator.controls) {
                    this.currentPO.PHRMPurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].markAsDirty();
                    this.currentPO.PHRMPurchaseOrderItems[i].PurchaseOrderItemValidator.controls[a].updateValueAndValidity();
                }
                CheckIsValid = false;
            }
        }


        if (this.currentPO.PHRMPurchaseOrderItems.length == 0) {
            this.msgserv.showMessage("notice-message", ["Please Add Item ...Before Requesting"]);
        }

        if (CheckIsValid == true && this.currentPO.PHRMPurchaseOrderItems != null) {

            ////Push Actual PurchaseItems To Temporary Model
            for (var i = 0; i < this.currentPO.PHRMPurchaseOrderItems.length; i++) {
                this.tempcurrentPO.PHRMPurchaseOrderItems.push(this.currentPO.PHRMPurchaseOrderItems[i]);
            }
            ////Clear all Items From Actual Obj .....and Check in Temp Obj .....and Pass those Items From Temp to Actual obj whose Quantity is not equal to Zero
            this.currentPO.PHRMPurchaseOrderItems = [];

            for (var i = 0; i < this.tempcurrentPO.PHRMPurchaseOrderItems.length; i++) {
                ///this.tempRetSuppModel.returnToSupplierItems[i].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

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
                this.pharmacyBLService.PostToPurchaseOrder(this.currentPO).
                    subscribe(res => {
                        if (res.Status == 'OK') {
                            this.msgserv.showMessage("success", ["Purchase Order is Generated and Saved"]);
                            this.changeDetectorRef.detectChanges();
                            //deleting all creating new PO..after successully adding to db
                            this.currentPO.PHRMPurchaseOrderItems = new Array<PHRMPurchaseOrderItems>();
                            this.currentPO = new PHRMPurchaseOrder();
                            this.SelectedSupplier = new PHRMSupplierModel();
                            this.ShowSupplierDetails = false;
                            this.currentPOItem = new PHRMPurchaseOrderItems();
                            /// this.currentPOItem.Quantity = 1;
                            this.currentPO.PHRMPurchaseOrderItems.push(this.currentPOItem);
                            this.router.navigate(['/Pharmacy/Order/PurchaseOrderList']);
                            this.loading = false;
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

    }


    logError(err: any) {
        console.log(err);
    }
}

