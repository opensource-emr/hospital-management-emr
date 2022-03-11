
import { Component, ChangeDetectorRef } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { SecurityService } from "../../../security/shared/security.service";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { PHRMSupplierModel } from "../../shared/phrm-supplier.model";
import { PHRMReturnToSupplierModel } from "../../shared/phrm-return-to-supplier.model";
import { PHRMReturnToSupplierItemModel } from "../../shared/phrm-return-to-supplier-items.model";
import { PHRMGoodsReceiptItemsModel } from "../../shared/phrm-goods-receipt-items.model";
import { CommonFunctions } from "../../../shared/common.functions";
import * as moment from 'moment/moment';
import { BillingFiscalYear } from '../../../billing/shared/billing-fiscalyear.model';
import { BillingBLService } from '../../../billing/shared/billing.bl.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PHRMGoodsReceiptModel } from '../../shared/phrm-goods-receipt.model';
import { PharmacyService } from '../../shared/pharmacy.service';
import { CoreService } from '../../../core/shared/core.service';

@Component({
    templateUrl: "./phrm-return-items-to-supplier.html"
})
export class PHRMReturnItemsToSupplierComponent {
    ///For Binding -- this is to get supplierlist 
    public supplierList: Array<PHRMSupplierModel> = new Array<PHRMSupplierModel>();
    ///For Binding ---this is for current ReturnSupplier
    public curtRetSuppModel: PHRMReturnToSupplierModel = new PHRMReturnToSupplierModel();
    ///Temporary ReturnToSupplierModel Obj for Checking Quantity of Actual Return Item Should Not Be Zero ...If Quantity is Zero then we can not Pass Item To Server Whose Quantity is Zero 
    public tempRetSuppModel: PHRMReturnToSupplierModel = new PHRMReturnToSupplierModel();
    ///For Binding ---this is for current ReturnSupplierItems
    public curtRetSuppItemModel: PHRMReturnToSupplierItemModel = new PHRMReturnToSupplierItemModel();
    //For Binding --this is for current ReturnItemsInvoice
    public currGRDetail: PHRMGoodsReceiptModel = new PHRMGoodsReceiptModel();
    public currGRItemDetail: PHRMGoodsReceiptItemsModel = new PHRMGoodsReceiptItemsModel();
    //this Item is used for search button(means auto complete button)...
    public ItemList: Array<any> = [];
    public RetItmToSuppList: Array<PHRMReturnToSupplierItemModel> = [];
    public AllItemList: Array<any> = [];
    public ItemListOfSelectedSupplier: Array<any> = [];
    //itemlevel discount
    public IsitemlevlDis: boolean;
    ///For Checking Items is Alredy Added or Not
    public checkIsItemPresent: boolean = false;
    public showDangerBox: boolean = false;
    selSupplier: any;
    invoiceno: any;
    supplierName: any;
    gdRptNo: any;
    public allFiscalYrs: Array<BillingFiscalYear> = [];
    public selFiscYrId: number = 3;
    public returnToSupplierListGridColumns: Array<any> = null;
    public fromDate: string = null;
    public toDate: string = null;
    public currentSupplier: PHRMSupplierModel = new PHRMSupplierModel();
    public returnToSupplierData: Array<any> = [];
    public showReturnSupp: boolean;
    public grNo?: any;
    public batchNo?: any;
    public invcno?: any;
    public suppId?: any;
    public showGoodReceipt: boolean;
    public totalAmount: number = null;
    public subTotal: number = null;
    public discountTotal: number = null;
    public goodsReceiptList: Array<PHRMGoodsReceiptModel> = new Array<PHRMGoodsReceiptModel>();
    public filterGoodsReceiptList: Array<PHRMGoodsReceiptModel> = new Array<PHRMGoodsReceiptModel>();
    public newGoodsReceiptList: Array<PHRMGoodsReceiptModel> = new Array<PHRMGoodsReceiptModel>();
    public goodsReceiptItemsList: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
    public checked: boolean;
    public dateRange: string = "last1Week";  //by default show last 1 week data.;
    IsNepali: boolean;
    showPopUp: boolean;
    showFreeQty: boolean;
    showCCCharge: boolean;
    invoiceNo: string = null;
    itemList: any[];
    constructor(public securityService: SecurityService,
        public changeDetectorRef: ChangeDetectorRef,
        public pharmacyBLService: PharmacyBLService,
        public BillingBLService: BillingBLService,
        public router: Router
        , public msgserv: MessageboxService, public route: ActivatedRoute,
        public pharmacyService: PharmacyService, public coreService: CoreService) {
        this.returnToSupplierListGridColumns = PHRMGridColumns.PHRMReturnToSupplier;
        //this.getReturnToSupplier();
        this.GetSupplierList();
        this.AddRowRequest();
        this.GetItemListForReturnToSupplier();
        this.SetCurrentFiscalYear();
        this.GetAllFiscalYrs();
        this.getGoodsReceiptList();
        this.showitemlvldiscount();
        this.ShowReceiptInNepali();
        this.checkReturnCustomization();
    }
    //Get: get return to supplier items of existing gr
    GetReturnToSupplierItemsofExistingGR() {
        this.pharmacyBLService.GetReturnToSupplierItemsofExistingGR()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.AllItemList = res.Results;
                }
                else {
                    this.msgserv.showMessage("failed", ['Failed to get Return to supplier list.' + res.ErrorMessage]);
                }
            },
                err => {
                    this.msgserv.showMessage("error", ['Failed to get Return to items.' + err.ErrorMessage]);
                }
            )
    }
    ReturnToSupplierGridAction($event: GridEmitModel) {
        switch ($event.Action) {
            case "return": {
                this.currentSupplier = Object.assign({}, $event.Data);
                this.showReturnSupp = true;
                this.curtRetSuppModel.ReferenceNo = $event.Data.GoodReceiptPrintId;
                this.curtRetSuppModel.GoodReceiptId = $event.Data.GoodReceiptId;
                this.invoiceno = $event.Data.InvoiceNo;
                this.gdRptNo = $event.Data.GoodReceiptPrintId;
                this.ShowRetSuppDetailsByRetGRNo($event.Data.GoodReceiptId);
                break;
            }
            case "preview": {
                this.currentSupplier = Object.assign({}, $event.Data);
                if (this.IsNepali == true) {
                    this.showPopUp = true;
                }
                else {
                    this.showGoodReceipt = true;
                }
                break;
            }
            default:
                break;
        }
    }
    OnGRPopUpClose() {
        this.showGoodReceipt = false;
    }

    ShowReceiptInNepali() {
        this.IsNepali = true;
        let receipt = this.coreService.Parameters.find(lang =>
            lang.ParameterName == 'NepaliReceipt' &&
            lang.ParameterGroupName == 'Common').ParameterValue;
        if (receipt == "true") {
            this.IsNepali = true;
        }
        else {
            this.IsNepali = false;
        }
    }
    OnGRViewPopUpClose() {
        this.showPopUp = false;
    }

    public getGoodsReceiptList() {
        this.pharmacyBLService.GetGoodsReceiptList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.newGoodsReceiptList = res.Results;
                    this.goodsReceiptList = res.Results;


                    for (let i = 0; i < this.goodsReceiptList.length; i++) {
                        var date2 = new Date(this.goodsReceiptList[i].GoodReceiptDate);
                        var date1 = new Date(moment().format('YYYY-MM-DD'));
                        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                        this.goodsReceiptList[i].AgingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        this.goodsReceiptList[i].UserName = res.Results[i].UserName;
                        this.goodsReceiptList[i].Time = res.Results[i].Time;
                    }
                    this.filterGoodsReceiptList = new Array<PHRMGoodsReceiptModel>();
                    this.filterGoodsReceiptList = this.goodsReceiptList.filter(s => s.IsCancel == false);

                    this.totalAmount = this.goodsReceiptList.filter(s => s.IsCancel == false).map(c => c.TotalAmount).reduce((sum, current) => sum + current);
                    this.subTotal = this.goodsReceiptList.filter(s => s.IsCancel == false).map(c => c.SubTotal).reduce((sum, current) => sum + current);
                    this.discountTotal = this.goodsReceiptList.filter(s => s.IsCancel == false).map(c => c.DiscountAmount).reduce((sum, current) => sum + current);

                }
                else {
                    this.msgserv.showMessage("error", ["Failed to get GoodsReceiptList. " + res.ErrorMessage]);
                }
            },
                err => {
                    this.msgserv.showMessage("error", ["Failed to get GoodsReceiptList. " + err.ErrorMessage]);
                });
    }

    CheckAllOptions() {
        if (this.curtRetSuppModel.returnToSupplierItems.every(val => val.checked == true)) {
            this.checked = true;
            this.curtRetSuppModel.returnToSupplierItems.forEach(val => { val.checked = false });
        }
        else {
            this.checked = true;
            this.curtRetSuppModel.returnToSupplierItems.forEach(val => { val.checked = true });
        }
    }
    //show or hide GR item level discount
    showitemlvldiscount() {
        this.IsitemlevlDis = true;
        let discountParameter = this.coreService.Parameters.find((p) => p.ParameterName == "PharmacyDiscountCustomization" && p.ParameterGroupName == "Pharmacy").ParameterValue;
        discountParameter = JSON.parse(discountParameter);
        this.IsitemlevlDis = (discountParameter.EnableItemLevelDiscount == true);
    }
    ShowRetSuppDetailsByRetGRNo(grId) {
        var todayDate = new Date();
        this.itemList = [];
        this.curtRetSuppModel.CreditNoteId = null;
        this.curtRetSuppModel.returnToSupplierItems = [];
        this.itemList = this.ItemList.filter(a => a.GoodReceiptId == grId);
        if(this.itemList.length == 0){
            this.showReturnSupp = false;
            this.msgserv.showMessage("Info", ["This GoodsReceipt is already returned"]);
        }
        for (let i = 0; i < this.itemList.length; i++) {
            var curretsupitemModel: PHRMReturnToSupplierItemModel = new PHRMReturnToSupplierItemModel();
            curretsupitemModel.SelectedItem = this.itemList[i].ItemName;
            curretsupitemModel.ItemName = this.itemList[i].ItemName;
            curretsupitemModel.TotalAvailableQuantity = this.itemList[i].ReceivedQuantity;
            curretsupitemModel.BatchNo = this.itemList[i].BatchNo;
            curretsupitemModel.ItemPrice = this.itemList[i].ItemPrice;
            curretsupitemModel.OldItemPrice = this.itemList[i].ItemPrice;
            curretsupitemModel.BatchWiseAvailableQuantity = this.itemList[i].BatchWiseAvailableQuantity;
            curretsupitemModel.VATPercentage = this.itemList[i].VATPercentage;
            curretsupitemModel.GoodReceiptItemId = this.itemList[i].GoodReceiptItemId;
            curretsupitemModel.ItemId = this.itemList[i].ItemId;
            curretsupitemModel.CCCharge = this.itemList[i].CCCharge;
            curretsupitemModel.MRP = this.itemList[i].MRP;
            curretsupitemModel.FreeQuantity = this.itemList[i].FreeQuantity;
            curretsupitemModel.DiscountPercentage = this.itemList[i].DiscountPercentage;
            this.curtRetSuppModel.SupplierId = this.itemList[i].SupplierId;
            var expdate = this.itemList[i].ExpiryDate;
            curretsupitemModel.ExpiryDate = moment(expdate).format('ll');

            this.curtRetSuppModel.ReturnDate = moment(todayDate).format('YYYY-MM-DD');
            this.curtRetSuppModel.returnToSupplierItems.push(curretsupitemModel);
            this.curtRetSuppModel.returnToSupplierItems = this.curtRetSuppModel.returnToSupplierItems.slice();
         
        }
    }
    public getBG_Color(expdate) {
        let expiryDate1 = new Date(expdate)
        let date = new Date();
        let datenow = date.setMonth(date.getMonth() + 0);
        let datethreemonth = date.setMonth(date.getMonth() + 3);
        let expDate = expiryDate1.setMonth(expiryDate1.getMonth() + 0);

        if (expDate <= datenow) {

            return 'red';

        }
        if (expDate < datethreemonth && expDate > datenow) {
            return 'yellow'
        }
        if (expDate > datethreemonth) {
            return 'white'
        }
    }
    public getColor(expdate) {
        let expiryDate1 = new Date(expdate)
        let date = new Date();
        let datenow = date.setMonth(date.getMonth() + 0);
        let datethreemonth = date.setMonth(date.getMonth() + 3);
        let expDate = expiryDate1.setMonth(expiryDate1.getMonth() + 0);

        if (expDate <= datenow) {

            return 'white';

        }
        if (expDate < datethreemonth && expDate > datenow) {
            return 'black'
        }
        if (expDate > datethreemonth) {
            return 'black'
        }
    }
    public getReturnToSupplier() {
        let grNo = this.currGRDetail.GoodReceiptPrintId ? this.currGRDetail.GoodReceiptPrintId : null;
        this.invoiceNo = this.currGRDetail.InvoiceNo ? this.currGRDetail.InvoiceNo : null;

        if (this.selSupplier != null) {
            this.suppId = this.selSupplier.SupplierId;
        }
        else {
            this.suppId = null;
        }
        this.pharmacyBLService.GetReturnToSupplier(this.suppId, grNo, this.invoiceNo, this.fromDate, this.toDate)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.returnToSupplierData = res.Results;
                    this.selSupplier = null;
                    this.curtRetSuppItemModel.BatchNo = null;
                    this.currGRDetail.GoodReceiptPrintId = 0;
                }
                else {
                    this.msgserv.showMessage("error", ["Failed to get Return  To Supplier. " + res.ErrorMessage]);
                }
            },
                err => {
                    this.msgserv.showMessage("error", ["Failed to get Return  To Supplier111. " + err.ErrorMessage]);
                });

    }



    onGridDateChange($event) {
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
        if (this.fromDate != null && this.toDate != null) {
            if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
                this.getReturnToSupplier();
            } else {
                this.msgserv.showMessage('failed', ['Please enter valid From date and To date']);
            }

        }

    }

    FilterItemListForSelectedSupplier() {
        this.ItemListOfSelectedSupplier = [];
        if (this.curtRetSuppModel.returnToSupplierItems[0].ItemId) {
            this.showDangerBox = true;
        }
        else {
            this.ItemListOfSelectedSupplier = this.ItemList.filter(a => a.SupplierId == this.curtRetSuppModel.SupplierId);
        }


    }
    Continue(decision: boolean) {
        if (decision) {
            this.ItemListOfSelectedSupplier = this.ItemList.filter(a => a.SupplierId == this.curtRetSuppModel.SupplierId);
            this.curtRetSuppModel.returnToSupplierItems = new Array<PHRMReturnToSupplierItemModel>();
            this.curtRetSuppModel.returnToSupplierItems.push(new PHRMReturnToSupplierItemModel());
            this.showDangerBox = false;
        }
        else {
            this.showDangerBox = false;
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
    ////Add New Row To UI 
    AddRowRequest() {

        if (this.curtRetSuppModel.returnToSupplierItems.length == 0) {
            this.curtRetSuppModel.returnToSupplierItems.push(this.curtRetSuppItemModel);
        }
        else {
            //checking the validation
            for (var i = 0; i < this.curtRetSuppModel.returnToSupplierItems.length; i++) {
                // for loop is used to show ReturnToSupplierItemValidator message ..if required  field is not filled
                for (var a in this.curtRetSuppModel.returnToSupplierItems[i].ReturnToSupplierItemValidator.controls) {
                    this.curtRetSuppModel.returnToSupplierItems[i].ReturnToSupplierItemValidator.controls[a].markAsDirty();
                    this.curtRetSuppModel.returnToSupplierItems[i].ReturnToSupplierItemValidator.controls[a].updateValueAndValidity();
                }

            }
            this.curtRetSuppItemModel = new PHRMReturnToSupplierItemModel();
            this.curtRetSuppModel.returnToSupplierItems.push(this.curtRetSuppItemModel);
        }
    }
    //to delete the row From UI
    DeleteRow(index) {
        //this will remove the data from the array
        this.curtRetSuppModel.returnToSupplierItems.splice(index, 1);
        // if the index is 0 then ..  returnToSupplierItems is pushhed in curtRetSuppItemModel to show the textboxes
        if (index == 0) {
            this.curtRetSuppItemModel = new PHRMReturnToSupplierItemModel();
            this.curtRetSuppModel.returnToSupplierItems.push(this.curtRetSuppItemModel);
            this.CalculationForPHRMReturnToSupplier();
            this.changeDetectorRef.detectChanges();
        }
        else {
            this.CalculationForPHRMReturnToSupplier();
            this.changeDetectorRef.detectChanges();
        }
    }

    ////Get List of Item Which Are Available In GoodsReceipt 
    GetItemListForReturnToSupplier() {
        ////Get All Item Which Are Available In GoodsReceipt 
        this.pharmacyBLService.GetItemListWithTotalAvailableQty()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.ItemList = res.Results;
                }
                else {
                    this.msgserv.showMessage("notice-message", ["No Items Avaliable for Return To Supplier"]);
                }
            });
    }
    ////used to format display item in ng-autocomplete
    myListFormatter(data: any): string {
        let html = data["ItemName"] + "|B.No.:" + data["BatchNo"] + " |Qty:" + data["BatchWiseAvailableQuantity"];
        return html;
    }



    SupplierListFormatter(data: any): string {
        let html = data["SupplierName"];
        return html;
    }


    public OnChangeSupplierOrFiscalYear() {
        try {
            if (this.curtRetSuppModel.returnToSupplierItems[0].ItemId) {
                this.showDangerBox = true;
            }
            else {
                this.curtRetSuppModel.SupplierId = this.selSupplier.SupplierId;
                this.ItemListOfSelectedSupplier = this.ItemList.filter(item => item.SupplierId == this.selSupplier.SupplierId && item.FiscalYearId == this.selFiscYrId);
                this.ItemListOfSelectedSupplier = this.ItemListOfSelectedSupplier.slice();
            }
        } catch (ex) {
            this.msgserv.showMessage("notice-message", ["Failed to select Supplier"]);
        }
    }
    /////This Function Called When Item is Selected And Here is LoGic To Select Batch No List For That Item 
    SelectItemFromSearchBox(Item: PHRMReturnToSupplierItemModel, index) {
        //if proper item is selected then the below code runs ..othewise it goes out side the function
        if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
            //this for loop with if conditon is to check whether the  item is already present in the array or not 
            //means to avoid duplication of item
            for (var i = 0; i < this.curtRetSuppModel.returnToSupplierItems.length; i++) {

                if (this.curtRetSuppModel.returnToSupplierItems[i].ItemId == Item.ItemId && this.curtRetSuppModel.returnToSupplierItems[i].BatchNo == Item.BatchNo) {
                    this.checkIsItemPresent = true;
                }
            }
            //id item is present the it show alert otherwise it assign the value
            if (this.checkIsItemPresent == true) {
                this.msgserv.showMessage("notice-message", [Item.ItemName + " is already add..Please Check!!!"]);
                this.checkIsItemPresent = false;
                this.changeDetectorRef.detectChanges();
                this.curtRetSuppModel.returnToSupplierItems.splice(index, 1);
                this.curtRetSuppItemModel = new PHRMReturnToSupplierItemModel();
                this.curtRetSuppModel.returnToSupplierItems.push(this.curtRetSuppItemModel);
            }
            else {
                for (var a = 0; a < this.curtRetSuppModel.returnToSupplierItems.length; a++) {
                    // Assiging the value TotalAvailableQuantity,ItemId and BatchNo in the particular index ..
                    //it helps for changing item after adding the item and also in adding in new item
                    if (a == index) {
                        this.curtRetSuppModel.returnToSupplierItems[index].TotalAvailableQuantity = Item.TotalAvailableQuantity;
                        this.curtRetSuppModel.returnToSupplierItems[index].ItemId = Item.ItemId;
                        ////////////When Item is Selected That time All Other Property Should be Null
                        this.curtRetSuppModel.returnToSupplierItems[index].ItemPrice = Item.ItemPrice;
                        this.curtRetSuppModel.returnToSupplierItems[index].ExpiryDate = Item.ExpiryDate;
                        this.curtRetSuppModel.returnToSupplierItems[index].GoodReceiptItemId = Item.GoodReceiptItemId;
                        this.curtRetSuppModel.returnToSupplierItems[index].SubTotal = Item.Quantity * Item.ItemPrice;
                        this.curtRetSuppModel.returnToSupplierItems[index].MRP = Item.MRP;
                        this.curtRetSuppModel.returnToSupplierItems[index].VATPercentage = 0;
                        this.curtRetSuppModel.returnToSupplierItems[index].BatchNo = Item.BatchNo;
                        this.curtRetSuppModel.returnToSupplierItems[index].DiscountedAmount = 0;
                        this.curtRetSuppModel.returnToSupplierItems[index].TotalAmount = Item.Quantity * Item.ItemPrice;
                        this.curtRetSuppModel.returnToSupplierItems[index].BatchWiseAvailableQuantity = Item.BatchWiseAvailableQuantity;
                        /////this.curtRetSuppModel.returnToSupplierItems[index].Quantity = 0;
                        //this.curtRetSuppModel.returnToSupplierItems[index].SelectedGRItems = [];
                        ////get all Batch No List For Selected Item
                        //this.pharmacyBLService.GetBatchNoByItemId(this.curtRetSuppModel.returnToSupplierItems[index].ItemId)
                        //    .subscribe(res => {
                        //        if (res.Status == "OK" && res.Results.length > 0) {
                        //            ////Assign Result to ReturnItem BatchNoList
                        //            this.curtRetSuppModel.returnToSupplierItems[index].BatchNoList = res.Results;


                        //            /////Here Is Logic To remove Batch From BatchNoList Whose Qty is Zero because there no importance to keep Batch whose QTY is Zero
                        //            ////Empty Temp Current Array list
                        //            this.curtRetSuppModel.returnToSupplierItems[index].TempBatchNoList = [];
                        //            this.curtRetSuppModel.returnToSupplierItems[index].BatchNoList.forEach(b => {
                        //                //////Push Actual Batch To Temporary Model
                        //                this.curtRetSuppModel.returnToSupplierItems[index].TempBatchNoList.push(b);
                        //            });
                        //            //////Clear all Batch From Actual Obj .....and Check in Temp Obj .....and Pass those Batch From Temp to Actual obj whose Quantity is not equal to Zero
                        //            this.curtRetSuppModel.returnToSupplierItems[index].BatchNoList = [];
                        //            this.curtRetSuppModel.returnToSupplierItems[index].TempBatchNoList.forEach(b => {
                        //                if (b.BatchWiseAvailableQuantity != 0) {
                        //                    ////Now Current Return Obj has Those Batches Whose QTY Is Greater Then Zero
                        //                    this.curtRetSuppModel.returnToSupplierItems[index].BatchNoList.push(b);
                        //                }
                        //            });
                        //        }
                        //        else {
                        //            this.msgserv.showMessage("notice-message", ["No Items Avaliable for this ItemType"]);
                        //        }
                        //    });

                    }
                    //calculation of ReturnToSupplierItem
                    this.CalculationForPHRMReturnToSupplierItem(this.curtRetSuppModel.returnToSupplierItems[index], index);
                }
            }

        }
    }

    ////Function On Changing BatchNo and Setting Required Property to ReturnToSupplierItems
    //onBatchNoChange(BatchNo, index) {

    //    if (BatchNo && index >= 0) {
    //        this.pharmacyBLService.GetItemDetailsByBatchNo(BatchNo, this.curtRetSuppModel.returnToSupplierItems[index].ItemId)
    //            .subscribe(res => {
    //                if (res.Status == "OK") {
    //                    ///SET Property to ReturnToSuplierItems
    //                    this.curtRetSuppModel.returnToSupplierItems[index].GoodReceiptItemId = res.Results.GoodReceiptItemId;
    //                    this.curtRetSuppModel.returnToSupplierItems[index].BatchWiseAvailableQuantity = res.Results.BatchWiseAvailableQuantity;
    //                    this.curtRetSuppModel.returnToSupplierItems[index].ItemPrice = res.Results.ItemPrice;
    //                    this.curtRetSuppModel.returnToSupplierItems[index].TotalAmount = res.Results.ItemPrice * res.Results.TotalAmount;;
    //                    this.curtRetSuppModel.returnToSupplierItems[index].DiscountPercentage = res.Results.DiscountPercentage;
    //                    this.curtRetSuppModel.returnToSupplierItems[index].ExpiryDate = moment(res.Results.ExpiryDate).format('YYYY-MM-DD');
    //                    this.curtRetSuppModel.returnToSupplierItems[index].VATPercentage = CommonFunctions.parseAmount(res.Results.VATPercentage);
    //                    this.curtRetSuppModel.returnToSupplierItems[index].MRP = res.Results.MRP;

    //                    ////Temporary GRItems variable to Get Property And Push To SelectedGRItems List
    //                    ///Note: This SelectedGRItemsList Is Required because we have to Update The Available Qty of GRItem After Item is Return To Supplier
    //                    let tempSelectedGrItems = new PHRMGoodsReceiptItemsModel();
    //                    tempSelectedGrItems.AvailableQuantity = this.curtRetSuppModel.returnToSupplierItems[index].BatchWiseAvailableQuantity;
    //                    tempSelectedGrItems.ExpiryDate = this.curtRetSuppModel.returnToSupplierItems[index].ExpiryDate;
    //                    //tempSelectedGrItems.ManufactureDate = res.Results.ManufactureDate;
    //                    tempSelectedGrItems.GoodReceiptItemId = res.Results.GoodReceiptItemId;

    //                    this.curtRetSuppModel.returnToSupplierItems[index].SelectedGRItems.push(tempSelectedGrItems);
    //                  }
    //                else {
    //                    this.msgserv.showMessage("notice-message", ["No Items details Available"]);
    //                }
    //            });
    //        this.CalculationForPHRMReturnToSupplierItem(this.curtRetSuppModel.returnToSupplierItems[index], index);

    //    }
    //}

    ///Function For Calculation Of all Return To Supplier Items
    CalculationForPHRMReturnToSupplierItem(row: PHRMReturnToSupplierItemModel, index) {

        if (this.curtRetSuppModel.returnToSupplierItems[index].ItemPrice != null && this.curtRetSuppModel.returnToSupplierItems[index].VATPercentage != null) {
            //this Disct is the coversion of DiscountPercentage
            let Disct = this.curtRetSuppModel.returnToSupplierItems[index].DiscountPercentage / 100;
            this.curtRetSuppModel.returnToSupplierItems[index].FreeAmount = CommonFunctions.parsePhrmAmount((this.curtRetSuppModel.returnToSupplierItems[index].FreeQuantity * this.curtRetSuppModel.returnToSupplierItems[index].ItemPrice * row.CCCharge) / 100);
            this.curtRetSuppModel.returnToSupplierItems[index].FreeAmountReturn = CommonFunctions.parsePhrmAmount((this.curtRetSuppModel.returnToSupplierItems[index].FreeQuantityReturn * this.curtRetSuppModel.returnToSupplierItems[index].ItemPrice * row.CCCharge) / 100);
            this.curtRetSuppModel.returnToSupplierItems[index].SubTotal = CommonFunctions.parsePhrmAmount((this.curtRetSuppModel.returnToSupplierItems[index].ItemPrice * (row.Quantity) + this.curtRetSuppModel.returnToSupplierItems[index].FreeAmountReturn));
            ///Calculate ReturnItem DiscountedAmount by using Formula DiscountedAmount = GRPrice*Quantity*Disct;
            this.curtRetSuppModel.returnToSupplierItems[index].DiscountedAmount = CommonFunctions.parseAmount((this.curtRetSuppModel.returnToSupplierItems[index].SubTotal * Disct));

            //this Vat is the coversion of VATPercentage
            let Vat = this.curtRetSuppModel.returnToSupplierItems[index].VATPercentage / 100;
            ///Calculate ReturnItem VatAmount by using Formula VatAmount = ((GRPrice*Quantity) - (DiscountAmt))*Vat;
            ///Calculate ReturnItem TotalAmount by using Formula TotalAmount = ((GRPrice*Quantity) - (DiscountAmt))+VatAmount;
            this.curtRetSuppModel.returnToSupplierItems[index].TotalAmount = CommonFunctions.parseAmount(this.curtRetSuppModel.returnToSupplierItems[index].SubTotal - this.curtRetSuppModel.returnToSupplierItems[index].DiscountedAmount);
            this.CalculationForPHRMReturnToSupplier();
        }
    }


    ///Function For Calculation Of all Return To Supplier Toatl calculation
    CalculationForPHRMReturnToSupplier() {
        let STotal: number = 0;

        let VAmount: number = 0;
        let DAmount: number = 0;
        var DsAmt: number;
        var vattAmt: number;
        var itmdis: any;

        for (var i = 0; i < this.curtRetSuppModel.returnToSupplierItems.length; i++) {
            if (this.curtRetSuppModel.returnToSupplierItems[i].SubTotal != null
                && this.curtRetSuppModel.returnToSupplierItems[i].TotalAmount != null) {

                STotal = STotal + this.curtRetSuppModel.returnToSupplierItems[i].SubTotal
                //TAmount = TAmount + this.curtRetSuppModel.returnToSupplierItems[i].TotalAmount
                this.curtRetSuppModel.SubTotal = CommonFunctions.parseAmount(STotal);
                //this.curtRetSuppModel.TotalAmount = CommonFunctions.parseAmount(TAmount);
                var vatttp = this.curtRetSuppModel.returnToSupplierItems[i].VATPercentage / 100;



            }
        }

        if (this.curtRetSuppModel.DiscountPercentage >= 0) {
            let Disct = this.curtRetSuppModel.DiscountPercentage / 100;
            DsAmt = (this.curtRetSuppModel.SubTotal * Disct)
            vattAmt = ((this.curtRetSuppModel.SubTotal - DsAmt) * vatttp);
        }

        for (var i = 0; i < this.curtRetSuppModel.returnToSupplierItems.length; i++) {
            if (this.curtRetSuppModel.returnToSupplierItems[i].DiscountPercentage >= 0) {

                DsAmt += this.curtRetSuppModel.returnToSupplierItems[i].DiscountedAmount
                vattAmt = this.curtRetSuppModel.SubTotal * vatttp;
                itmdis = true;
            }
            else {
                DsAmt = 0;
            }
            // vattAmt = ((this.curtRetSuppModel.SubTotal - DsAmt) * vatttp);   

        }


        DAmount = DAmount + DsAmt;
        VAmount = VAmount + vattAmt;
        this.curtRetSuppModel.VATAmount = CommonFunctions.parseAmount(VAmount);
        this.curtRetSuppModel.DiscountAmount = CommonFunctions.parseAmount(DAmount);
        //this.curtRetSuppModel.TotalAmount = CommonFunctions.parseAmount(TAmount);
        if (itmdis == true) {
            this.curtRetSuppModel.TotalAmount = this.curtRetSuppModel.SubTotal - this.curtRetSuppModel.DiscountAmount + this.curtRetSuppModel.VATAmount
        }
        else {
            this.curtRetSuppModel.TotalAmount = this.curtRetSuppModel.SubTotal + this.curtRetSuppModel.VATAmount;
        }

        this.curtRetSuppModel.Adjustment =
            CommonFunctions.parseFinalAmount(
                this.curtRetSuppModel.TotalAmount
            ) - this.curtRetSuppModel.TotalAmount;
        this.curtRetSuppModel.Adjustment = CommonFunctions.parseAmount(
            this.curtRetSuppModel.Adjustment
        );
        this.curtRetSuppModel.TotalAmount = CommonFunctions.parseFinalAmount(
            this.curtRetSuppModel.TotalAmount
        );

    }


    PostReturnToSupplier() {

        // this CheckIsValid varibale is used to check whether all the validation are proper or not ..
        //if the CheckIsValid == true the validation is proper else no

        var CheckIsValid = true;
        if (this.curtRetSuppModel.ReturnStatus == undefined) {
            alert("Please fill the Return Status");
        }
        if (this.curtRetSuppModel.IsValidCheck(undefined, undefined) == false) {
            // for loop is used to show ReturnToSupplierValidator message ..if required  field is not filled
            for (var b in this.curtRetSuppModel.ReturnToSupplierValidator.controls) {
                this.curtRetSuppModel.ReturnToSupplierValidator.controls[b].markAsDirty();
                this.curtRetSuppModel.ReturnToSupplierValidator.controls[b].updateValueAndValidity();
                CheckIsValid = false;
            }
        }


        for (var i = 0; i < this.curtRetSuppModel.returnToSupplierItems.length; i++) {
            if (this.curtRetSuppModel.returnToSupplierItems[i].IsValidCheck(undefined, undefined) == false) {
                // for loop is used to show ReturnToSupplierValidator message ..if required  field is not filled
                for (var a in this.curtRetSuppModel.returnToSupplierItems[i].ReturnToSupplierItemValidator.controls) {
                    this.curtRetSuppModel.returnToSupplierItems[i].ReturnToSupplierItemValidator.controls[a].markAsDirty();
                    this.curtRetSuppModel.returnToSupplierItems[i].ReturnToSupplierItemValidator.controls[a].updateValueAndValidity();
                }
                CheckIsValid = false;
            }
        }


        if (this.curtRetSuppModel.returnToSupplierItems.length == 0) {
            this.msgserv.showMessage("notice-message", ["Please Add Item ...Before Requesting"]);
        }

        if (CheckIsValid == true && this.curtRetSuppModel.returnToSupplierItems != null) {
            //Check if there is some quantity to be returned, i.e. with Quantity > 0
            if (this.curtRetSuppModel.returnToSupplierItems.some(item => item.Quantity > 0)) {
                //Filter out all the items with no return quantity and only send the items with return quantity > 0 in the server
                this.curtRetSuppModel.returnToSupplierItems = this.curtRetSuppModel.returnToSupplierItems.filter(item => item.Quantity > 0);

                this.curtRetSuppModel.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                this.curtRetSuppModel.returnToSupplierItems.forEach(item => item.CreatedBy = this.curtRetSuppModel.CreatedBy);

                ////Function to Update Available Quantity Of GoodsReceiptItem
                this.UpdateAvailableQtyOfGRItem();
                this.pharmacyBLService.PostReturnToSupplierItems(this.curtRetSuppModel).
                    subscribe(res => {
                        if (res.Status == 'OK') {
                            this.msgserv.showMessage("success", ["Return Order is Generated and Saved"]);
                            this.changeDetectorRef.detectChanges();
                            this.curtRetSuppModel.returnToSupplierItems = new Array<PHRMReturnToSupplierItemModel>();
                            this.curtRetSuppModel = new PHRMReturnToSupplierModel();
                            this.curtRetSuppItemModel = new PHRMReturnToSupplierItemModel();
                            this.curtRetSuppModel.returnToSupplierItems.push(this.curtRetSuppItemModel);
                            this.router.navigate(['/Pharmacy/Store/ReturnItemsToSupplierList']);
                        }
                        else {
                            this.msgserv.showMessage("failed", ['failed to add Return Item To Supplier.. please check log for details.']);
                            console.log(res);
                        }
                    });
            }
            else {
                this.msgserv.showMessage("notice-message", ['No Quantity to return.']);
            }


        }
        else {
            this.msgserv.showMessage("notice-message", ['Some Required Field is Missing ??....Please Fill...']);
        }

    }
    BackToReturnSupplier() {
        this.showReturnSupp = false;
        this.selSupplier = null;
        this.curtRetSuppModel.returnToSupplierItems = [];
        this.returnToSupplierData = [];
        this.curtRetSuppModel = new PHRMReturnToSupplierModel();

    }
    UpdateAvailableQtyOfGRItem() {
        for (var k = 0; k < this.curtRetSuppModel.returnToSupplierItems.length; k++) {

            let curtGritmAvailQty: number = 0;
            ///This Is Current GRItems Available Quantity
            curtGritmAvailQty = this.curtRetSuppModel.returnToSupplierItems[k].BatchWiseAvailableQuantity;
            this.curtRetSuppModel.returnToSupplierItems[k].FreeQuantity = this.curtRetSuppModel.returnToSupplierItems[k].FreeQuantity - this.curtRetSuppModel.returnToSupplierItems[k].FreeQuantityReturn;
            let curtxnUpdateQty: number = 0;
            ///This Is Current RetrnToSupplierItem Available Quantity
            curtxnUpdateQty = this.curtRetSuppModel.returnToSupplierItems[k].Quantity;
            this.curtRetSuppModel.returnToSupplierItems[k].TotalAvailableQuantity = curtGritmAvailQty - curtxnUpdateQty;

            // this.curtRetSuppModel.returnToSupplierItems[k].SelectedGRItems.AvailableQuantity = this.curtRetSuppModel.returnToSupplierItems[k].TotalAvailableQuantity ;
        }
    }

    Cancel() {
        this.curtRetSuppModel.returnToSupplierItems = [];
        this.AddRowRequest();
        this.showReturnSupp = false;
        this.selSupplier = null;
        this.curtRetSuppModel.returnToSupplierItems = [];
        this.returnToSupplierData = [];
        this.curtRetSuppModel = new PHRMReturnToSupplierModel();


    }

    GetAllFiscalYrs() {
        this.pharmacyBLService.GetAllFiscalYears()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.allFiscalYrs = res.Results;

                }
            });
    }

    SetCurrentFiscalYear() {
        //We may do this in client side itself since we already have list of all fiscal years with us. [Part of optimization.]

        this.BillingBLService.GetCurrentFiscalYear()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    //let fiscYr: BillingFiscalYear = ;
                    if (res.Results) {
                        this.selFiscYrId = res.Results.FiscalYearId;
                    }
                }
            });
    }
    checkReturnCustomization() {
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
}


