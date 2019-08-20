import { Component, ChangeDetectorRef, ViewChild, Input } from '@angular/core'
import { Router, RouterOutlet, RouterModule } from '@angular/router'
import { PHRMPurchaseOrder } from "../shared/phrm-purchase-order.model";
import { PHRMPurchaseOrderItems } from "../shared/phrm-purchase-order-items.model";
import * as moment from 'moment/moment';
import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
import { PharmacyService } from "../shared/pharmacy.service"
import { PHRMGoodsReceiptItemsModel } from "../shared/phrm-goods-receipt-items.model"
import { PHRMGoodsReceiptModel } from "../shared/phrm-goods-receipt.model";
import { PHRMSupplierModel } from "../shared/phrm-supplier.model"
import { PHRMCompanyModel } from "../shared/phrm-company.model"
import { PHRMItemMasterModel } from "../shared/phrm-item-master.model"
import { CommonFunctions } from '../../shared/common.functions';
import { SecurityService } from '../../security/shared/security.service';
import { PHRMGoodsReceiptViewModel } from "../shared/phrm-goods-receipt-vm.model";
import { CallbackService } from '../../shared/callback.service';
import { PHRMStoreStockModel } from '../shared/phrm-storestock.model';
//import { phrmitemaddComponent } from '../common/phrmitem-add.component';
@Component({
    templateUrl: "../../view/pharmacy-view/Order/PHRMGoodsReceiptItems.html" //  "/PharmacyView/PHRMGoodsReceiptItems"
})
export class PHRMGoodsReceiptItemsComponent {
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
    //flag for disable or enable some text boxes order
    IsPOorder: boolean = true;
    public duplicateInvoice: boolean = false;
    //get all is active item list for create new gr
    public itemList: Array<PHRMItemMasterModel> = new Array<PHRMItemMasterModel>();
    public currentCounter: number = null;
    public goodsReceiptList: Array<PHRMGoodsReceiptModel> = new Array<PHRMGoodsReceiptModel>();
    //@ViewChild('addItems')
    //addItems: phrmitemaddComponent;
    public storeList: Array<any> = new Array<any>();
    public currentStore: any;
    public tempStore: any;

    constructor(public pharmacyService: PharmacyService,
        public pharmacyBLService: PharmacyBLService,
        public securityService: SecurityService,
        public msgserv: MessageboxService,
        public router: Router,
        public callBackService: CallbackService,
        public changeDetectorRef: ChangeDetectorRef) {
        this.supplierList = new Array<PHRMSupplierModel>();//make empty supllier
        this.currentSupplier = new PHRMSupplierModel();
        this.itemList = new Array<PHRMItemMasterModel>();
        this.GetAllItemData();
        this.GetSupplierData();
        this.Load(this.pharmacyService.Id)
        this.goodsReceiptVM.goodReceipt.GoodReceiptDate = moment().format("YYYY-MM-DD");
        this.currentCounter = this.securityService.getPHRMLoggedInCounter().CounterId;
        if (this.currentCounter < 1) {
            this.callBackService.CallbackRoute = '/Pharmacy/Order/GoodsReceiptItems'
            this.router.navigate(['/Pharmacy/ActivateCounter']);
        }
        this.getGoodsReceiptList();
        this.getStoreList();
    }

    //this fuction load all item master data
    GetAllItemData() {
        try {
            this.pharmacyBLService.GetItemList()
                .subscribe(
                res => {
                    if (res.Status == "OK") {
                        this.itemList = res.Results;
                    } else {
                        console.log(res.ErrorMessage);
                        this.msgserv.showMessage("failed", ['Failed to get item list, see detail in console log']);
                    }
                },
                err => {
                    console.log(err.ErrorMessage);
                    this.msgserv.showMessage("error", ['Failed to get item list., see detail in console log']);
                }
                );
        }
        catch (exception) {
            console.log(exception);
            this.msgserv.showMessage("error", ['error details see in console log']);
        }
    }
    //this function load all suppliers details
    GetSupplierData() {
        try {
            this.pharmacyBLService.GetSupplierList()
                .subscribe(
                res => {
                    if (res.Status == "OK") {
                        this.supplierList = res.Results;
                    } else {
                        this.msgserv.showMessage("failed", ['Failed to get supplier list.' + res.ErrorMessage]);
                    }
                },
                err => {
                    this.msgserv.showMessage("error", ['Failed to get supplier list.' + err.ErrorMessage]);
                }
                );
        }
        catch (exception) {
            console.log(exception);
            this.msgserv.showMessage("error", ['error details see in console log']);
        }
    }
    ///function to load all PO Items By passing purchaseOrderId  
    Load(PurchaseOrderId) {
        ////for fixing the issue of Null error in client side during refresh
        if (PurchaseOrderId == null) {
            // this.msgserv.showMessage("notice-message", ["Please Select Proper Goods Receipt"]);
            this.IsPOorder = false;
            this.AddRowRequest(0);
        }
        else {
            this.pharmacyBLService.GetPHRMPOItemsForGR(PurchaseOrderId)
                .subscribe(
                res => {
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
                        this.msgserv.showMessage("failed", ['Failed to get OrderList.' + res.ErrorMessage]);
                    }
                },
                err => {
                    this.msgserv.showMessage("error", ['Failed to get OrderList.' + err.ErrorMessage]);
                }
                );
        }
    }

    //Method for transforming POItems to GRItems
    GetGrItemsFromPoItems() {
        for (var i = 0; i < this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems.length; i++) {
            var currGRItem: PHRMGoodsReceiptItemsModel = new PHRMGoodsReceiptItemsModel();
            currGRItem.ItemId = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].ItemId;
            currGRItem.ItemName = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PHRMItemMaster.ItemName;
            currGRItem.SellingPrice = 0;
            currGRItem.VATPercentage = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PHRMItemMaster.VATPercentage;
            currGRItem.ExpiryDate = moment().format('YYYY-MM-DD');
            //currGRItem.ManufactureDate = moment().format('YYYY-MM-DD');
            currGRItem.GRItemPrice = 0;// need to refacor again
            currGRItem.DiscountPercentage = 0;
            currGRItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            currGRItem.SupplierName = this.currentSupplier.SupplierName;
            currGRItem.CompanyName = this.currentCompany[i].CompanyName;
            currGRItem.SelectedItem = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PHRMItemMaster;
            currGRItem.CounterId = this.currentCounter;
            //currGRItem.UOMName = itm.UOMName;
            if (this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].ReceivedQuantity == 0) {
                ///if pending qty is zero then replace it with original Purchase Oty
                currGRItem.PendingQuantity = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].Quantity;

            }
            else {
                currGRItem.PendingQuantity = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PendingQuantity;
            }
            //CC charge is hardcoded for now--------later create a separate Tbl to keep track changing cc charge
            if (this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PHRMItemMaster.IsInternationalBrand == true) {
                currGRItem.CCCharge = 7.5;
            }
            ///push  local variable GrData to GrList Variable
            this.grItemList.push(currGRItem);


        }

    }

    public getGoodsReceiptList() {
        this.pharmacyBLService.GetGoodsReceiptList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.goodsReceiptList = res.Results;
                } });
    }

    //get Store List
    public getStoreList() {
      this.pharmacyBLService.GetStoreList()
        .subscribe(res => {
          if (res.Status == "OK") {
            this.storeList = res.Results;
          }
        })
    }

    //Save data to database
  SaveGoodsReceipt() {
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
            for (let i = 0; i < this.goodsReceiptList.length; i++)
            {
                let num = this.goodsReceiptList[i].InvoiceNo;
                if (invoiceNo == num) {
                    this.duplicateInvoice = true;
                    CheckIsValid = false;
                }
            }
            // for loop is used to show GoodsReceiptValidator message ..if required  field is not filled
            for (var a in this.goodsReceiptVM.goodReceipt.GoodReceiptValidator.controls) {
                this.goodsReceiptVM.goodReceipt.GoodReceiptValidator.controls[a].markAsDirty();
                this.goodsReceiptVM.goodReceipt.GoodReceiptValidator.controls[a].updateValueAndValidity();
                if (this.goodsReceiptVM.goodReceipt.IsValidCheck(undefined, undefined) == false) { CheckIsValid = false }
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
                if (this.grItemList[c].IsValidCheck(undefined, undefined) == false) {
                    CheckIsValid = false;
                }
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

                    this.goodsReceiptVM.purchaseOrder.SupplierId = this.currentSupplier.SupplierId;
                    this.goodsReceiptVM.purchaseOrder.SupplierName = this.currentSupplier.SupplierName;
                    if (!this.IsPOorder) {
                        this.MakePoWithPOItemsForPost(this.goodsReceiptVM);
                    } else {
                        this.ChangePOAndPOItemsStatus();
                    }
                    this.pharmacyBLService.PostGoodReceipt(this.goodsReceiptVM, this.IsPOorder)
                        .subscribe(
                        res => {
                            this.CallBackAddGoodsReceipt(res);
                            this.loading = false;
                        },
                        err => {
                            this.loading = false,
                                this.logError(err);

                        });
                }
                else {
                    this.msgserv.showMessage("notice-message", ["Received Qty of All Items is Zero"]);
                }

            }

            else {
                this.msgserv.showMessage("notice-message", ['missing value, please fill it']);
            }
        }

    }

    //call after Goods Receipt saved
    CallBackAddGoodsReceipt(res) {
        if (res.Status == "OK") {
            this.msgserv.showMessage("success", ["Goods Receipt is Generated and Saved."]);
            this.pharmacyService.CreateNew();
            this.IsPOorder = false;
            this.purchaseOrderId = 0;
            //navigate to GRLIST Page
            this.router.navigate(['/Pharmacy/Order/GoodsReceiptList']);
        }
        else {
            this.msgserv.showMessage("failed", ["failed to add result.. please check log for details."]);
            this.logError(res.ErrorMessage);

        }
    }
    logError(err: any) {
        this.purchaseOrderId = 0;
        this.pharmacyService.CreateNew();
        this.IsPOorder = false;
        this.router.navigate(['/Pharmacy/Order/GoodsReceiptList']);
        console.log(err);
    }


    // Calculation for Goods Receipt Item
    CalculationForPHRMGoodsReceiptItem(row: PHRMGoodsReceiptItemsModel, index, margin?, grPrice?) {

        if (this.grItemList[index].SubTotal != null
            && this.grItemList[index].ReceivedQuantity != null
            && this.grItemList[index].FreeQuantity != null
            && this.grItemList[index].GRItemPrice != null) {    ///converting VAT and Discount Pecentage into Decimal 
            let Vat = this.grItemList[index].VATPercentage / 100;
            let Disct = this.grItemList[index].DiscountPercentage / 100;
            ///calculating Discount amount by using discAmt=(grprice*(receivedqty-freeqty)*dict%)/100
            let DisctAmt = CommonFunctions.parsePhrmAmount((this.grItemList[index].GRItemPrice * (this.grItemList[index].ReceivedQuantity)) * Disct);
            ///calculating VAT amount by using discAmt=((grprice*(receivedqty-freeqty)-disctAmt)*vat%)/100
            let vatAmount = CommonFunctions.parsePhrmAmount((((this.grItemList[index].ReceivedQuantity) * row.GRItemPrice) - DisctAmt) * Vat);
            //calculate SubTotal by formula SubTotal=(receivedQty)*GrPrice;
            this.grItemList[index].FreeGoodsAmount = CommonFunctions.parsePhrmAmount(((this.grItemList[index].FreeQuantity) * this.grItemList[index].GRItemPrice * row.CCCharge / 100) - DisctAmt);
            this.grItemList[index].SubTotal = CommonFunctions.parsePhrmAmount(((this.grItemList[index].ReceivedQuantity) * row.GRItemPrice) + this.grItemList[index].FreeGoodsAmount);
            //calculate TotalAmount by formula SubTotal=(((receivedQty-FreeQty)*GrPrice)-DisctAmt)+VATAmt;
            this.grItemList[index].TotalAmount = CommonFunctions.parsePhrmAmount((((this.grItemList[index].ReceivedQuantity) * row.GRItemPrice + this.grItemList[index].FreeGoodsAmount) - DisctAmt) + vatAmount);
            this.grItemList[index].MRP = CommonFunctions.parsePhrmAmount(this.grItemList[index].MRP);
            //to calculate GRItem Price from margin
            this.grItemList[index].GRItemPrice = CommonFunctions.parsePhrmAmount(this.grItemList[index].GRItemPrice);
            this.grItemList[index].CounterId = this.currentCounter;
            this.grItemList[index].Margin = CommonFunctions.parsePhrmAmount(this.grItemList[index].Margin);
            this.CaculationForPHRMGoodsReceipt();
            if (margin != 0 && grPrice == 0) {
                this.grItemList[index].MRP = CommonFunctions.parsePhrmAmount(this.grItemList[index].GRItemPrice * (1 + margin / 100));
                //this.grItemList[index].GRItemPrice = (this.grItemList[index].MRP) / (1 + margin / 100);
                this.grItemList[index].Margin = margin;
            }
            if ((margin == 0 && grPrice != 0)) {

                this.grItemList[index].Margin = 0;
                this.grItemList[index].MRP = grPrice;
            }
            if (margin == 0 && grPrice == 0) {
                this.grItemList[index].Margin = CommonFunctions.parsePhrmAmount((this.grItemList[index].MRP - this.grItemList[index].GRItemPrice) / this.grItemList[index].GRItemPrice * 100);
                //this.grItemList[index].GRItemPrice = (this.grItemList[index].MRP) / (1 + this.grItemList[index].Margin / 100);

            }
        }
    }

    CaculationForPHRMGoodsReceipt(discAmt?, discPer?, vatAmt?) {


        let STotal: number = 0;

        let TAmount: number = 0;
        let VAmount: number = 0;
        let DAmount: number = 0;
        for (var i = 0; i < this.grItemList.length; i++) {
            if (this.grItemList[i].SubTotal != null
                && this.grItemList[i].TotalAmount != null) {
                STotal = STotal + this.grItemList[i].SubTotal;
                TAmount = TAmount + this.grItemList[i].TotalAmount;

                let vatttp = this.grItemList[i].VATPercentage / 100;
                let Disct = this.grItemList[i].DiscountPercentage / 100;
                let DsAmt = ((this.grItemList[i].ReceivedQuantity) * (this.grItemList[i].GRItemPrice) * Disct)
                let vattAmt = (((this.grItemList[i].GRItemPrice * (this.grItemList[i].ReceivedQuantity)) - DsAmt) * vatttp);
                DAmount = DAmount + DsAmt;
                VAmount = VAmount + vattAmt;
            }
        }
        //for bulk discount calculation and conversion of percentage into amount and vice versa

        if (discPer == 0 && discAmt > 0) {
            this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parsePhrmAmount(STotal) - discAmt;
            this.goodsReceiptVM.goodReceipt.DiscountAmount = discAmt;
            discPer = (discAmt / CommonFunctions.parsePhrmAmount(STotal)) * 100
            this.goodsReceiptVM.goodReceipt.DiscountPercent = CommonFunctions.parseAmount(discPer);
        }
        if (discPer > 0 && discAmt == 0) {
            discAmt = CommonFunctions.parseAmount(TAmount * (discPer) / 100);
            this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parsePhrmAmount(STotal) - discAmt;
            this.goodsReceiptVM.goodReceipt.DiscountAmount = discAmt;
            this.goodsReceiptVM.goodReceipt.DiscountPercent = discPer;
        }
        if (discPer == 0 && discAmt == 0 && vatAmt == 0) {
            this.goodsReceiptVM.goodReceipt.SubTotal = CommonFunctions.parsePhrmAmount(STotal);
            this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parsePhrmAmount(TAmount)
            //this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parsePhrmAmount(DAmount);
            this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parsePhrmAmount(VAmount);
            this.goodsReceiptVM.goodReceipt.DiscountAmount = 0;
            this.goodsReceiptVM.goodReceipt.DiscountPercent = 0;
        }
        if (vatAmt > 0) {
            this.goodsReceiptVM.goodReceipt.VATAmount = vatAmt;
            this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parseAmount(this.goodsReceiptVM.goodReceipt.SubTotal - this.goodsReceiptVM.goodReceipt.DiscountAmount + vatAmt);
        }
        else {
            this.goodsReceiptVM.goodReceipt.SubTotal = CommonFunctions.parsePhrmAmount(STotal);
            this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parsePhrmAmount(TAmount) - this.goodsReceiptVM.goodReceipt.DiscountAmount;
            //this.goodsReceiptVM.goodReceipt.DiscountAmount = CommonFunctions.parsePhrmAmount(DAmount);
            this.goodsReceiptVM.goodReceipt.VATAmount = CommonFunctions.parsePhrmAmount(VAmount);
        }

        this.goodsReceiptVM.goodReceipt.Adjustment = CommonFunctions.parseFinalAmount(this.goodsReceiptVM.goodReceipt.TotalAmount) - this.goodsReceiptVM.goodReceipt.TotalAmount
        this.goodsReceiptVM.goodReceipt.Adjustment = CommonFunctions.parseAmount(this.goodsReceiptVM.goodReceipt.Adjustment);
        this.goodsReceiptVM.goodReceipt.TotalAmount = CommonFunctions.parseFinalAmount(this.goodsReceiptVM.goodReceipt.TotalAmount);



    }
    //add a new row 
    AddRowRequest(index) {

        if (this.grItemList.length == 0) {
            let temp = new PHRMGoodsReceiptItemsModel();
            this.grItemList.push(temp);
        }
        else {
            ////row can be added if only if the item is selected is last row            
            //this.grItemList.push(this.grItemList[index]);  
            let temp = new PHRMGoodsReceiptItemsModel();
            this.grItemList.push(temp);
        }
        //if (index != null) {

        //    let new_index = index + 1
        //    window.setTimeout(function () {
        //        document.getElementById('item-box' + new_index).focus();
        //    }, 0);
        //}

    }
    //to delete the row
    DeleteRow(index) {
        // if the index is 0 then ..  currentPOItem is pushhed in POItems to show the textboxes
        if (this.grItemList.length > 0) {
            //this will remove the data from the array
            this.grItemList.splice(index, 1);
        }
        if (index == 0 && this.grItemList.length == 0) {
            let tempGRItemObj = new PHRMGoodsReceiptItemsModel();
            this.grItemList.push(tempGRItemObj);
            this.CalculationForPHRMGoodsReceiptItem(this.grItemList[0], 0);
            this.changeDetectorRef.detectChanges();

        }
        else {
            this.CaculationForPHRMGoodsReceipt();
            this.changeDetectorRef.detectChanges();
        }
    }

    //After Goods Receipt Generation Updating The Pending and Received Qty of PO Item and also PO
    ChangePOAndPOItemsStatus() {

        //Set the Received and Pending Quantity for Each Purchaser Order Item
        for (var i = 0; i < this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems.length; i++) {

            this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].ReceivedQuantity = (this.grItemList[i].ReceivedQuantity - this.grItemList[i].FreeQuantity) + this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].ReceivedQuantity;
            let pending = this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].Quantity - this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].ReceivedQuantity;

            if (pending > 0) {
                this.goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems[i].PendingQuantity = pending;
            }
            else {
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
        goodsReceiptVM.purchaseOrder.POStatus = 'complete';
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
            tempPOItem.VATAmount =
                CommonFunctions.parsePhrmAmount(goodsReceiptVM.goodReceipt.GoodReceiptItem[x].TotalAmount - tempPOItem.SubTotal);
            tempPOItem.TotalAmount = goodsReceiptVM.goodReceipt.GoodReceiptItem[x].TotalAmount;
            tempPOItem.DeliveryDays = 1;
            tempPOItem.POItemStatus = 'complete';
            tempPOItem.AuthorizedBy = this.securityService.GetLoggedInUser().EmployeeId;
            //tempPOItem.AuthorizedOn = moment().format("YYYY-MM-DD HH:mm:sss");
            tempPOItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            // tempPOItem.CreatedOn = moment().format("YYYY-MM-DD HH:mm:sss");
            goodsReceiptVM.purchaseOrder.PHRMPurchaseOrderItems.push(tempPOItem);
        }
        return goodsReceiptVM.purchaseOrder;
    }

    //method fire when item value changed
    //perfect search text box with validation and all things
    ItemValueChanged(rowData, index): void {
        if (rowData) {
            if (typeof rowData === 'object') {
                this.grItemList[index].ItemName = rowData.ItemName;
                this.grItemList[index].ItemId = rowData.ItemId;
                this.grItemList[index].SupplierName = this.currentSupplier.SupplierName;
                this.grItemList[index].CompanyName = rowData.CompanyName;
                this.grItemList[index].VATPercentage = rowData.VATPercentage;
                this.grItemList[index].SellingPrice = rowData.SellingPrice;
                if (rowData.IsInternationalBrand == true) {
                    this.grItemList[index].CCCharge = 7.5;
                }
                else
                    this.grItemList[index].CCCharge = 0;

            } else {
                //alert('select proper item name');
                this.grItemList[index].SelectedItem = "";
                this.grItemList[index].ItemName = "";
                this.grItemList[index].VATPercentage = 0;
                this.grItemList[index].SellingPrice = 0;
                this.grItemList[index].ItemId = 0;
                this.grItemList[index].SupplierName = "";
                this.grItemList[index].CompanyName = "";
            }
        }
    }
  public AssignStore() {
      try {
        if (this.tempStore) {
          if ((this.tempStore.StoreId != 0) && (this.tempStore != null)) {
            this.currentStore = this.tempStore;
          }
          else {
            this.currentStore = null;
          }
        }
        else {
          this.currentStore = null;
        }
      } catch (ex) {
        this.msgserv.showMessage("error", ['Failed to get Store.' + ex.ErrorMessage]);
      }
    }
    //used to format display item in ng-autocomplete
    myListFormatter(data: any): string {
        let html = data["SupplierName"];
        return html;
    }
    myStoreListFormatter(data:any): string{
      let html = data["Name"];
      return html;
    }
    myItemListFormatter(data: any): string {
        let html = data["ItemName"];
        return html;
    }
    //cancel button
    Cancel() {
        this.pharmacyService.CreateNew();
        this.purchaseOrderId = 0;
        this.IsPOorder = false;
        //navigate to GRLIST Page
        this.router.navigate(['/Pharmacy/Order/GoodsReceiptList']);
    }

    //for item add popup page to turn on

    AddItemPopUp(i) {
        this.showAddItemPopUp = false;
        this.index = i;
        this.changeDetectorRef.detectChanges();
        this.showAddItemPopUp = true;
    }
    OnNewItemAdded($event) {
        this.showAddItemPopUp = false;
        var item = $event.item;


        this.itemList.unshift(item);
        this.goodReceiptItems = new PHRMGoodsReceiptItemsModel();
    }
}

