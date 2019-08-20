
import { Component, ChangeDetectorRef } from '@angular/core'
import { Router, RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
import { PHRMSupplierModel } from "../shared/phrm-supplier.model";
import { PHRMReturnToSupplierModel } from "../shared/phrm-return-to-supplier.model"
import { PHRMReturnToSupplierItemModel } from "../shared/phrm-return-to-supplier-items.model"
import { PHRMItemMasterModel } from "../shared/phrm-item-master.model";
import { PHRMGoodsReceiptItemsModel } from "../shared/phrm-goods-receipt-items.model"
import { CommonFunctions } from "../../shared/common.functions";
import * as moment from 'moment/moment';
@Component({
    templateUrl: '../../view/pharmacy-view/Store/PHRMReturnItemsToSupplier.html' //"/PharmacyView/PHRMReturnItemsToSupplier"
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
    //this is to add or delete the number of row in ui
    public rowCount: number = 0;
    //this Item is used for search button(means auto complete button)...
    public ItemList: any;
    ///temp item list for Storing original itm and Remove Item whose Qty is <= zero
    public tempItemList: any;
   
    ///For Checking Items is Alredy Added or Not
    public checkIsItemPresent: boolean = false;
    validRoutes: any;
    constructor(public securityService: SecurityService, public changeDetectorRef: ChangeDetectorRef
        , public pharmacyBLService: PharmacyBLService, public router: Router
        , public msgserv: MessageboxService) {
        this.GetSupplierList();
        this.AddRowRequest(0);
       // this.GetReturnToSupplierItemsofExistingGR();
        this.GetItemListForReturnToSupplier();
        this.ItemList = [];
      }
    //Get: get return to supplier items of existing gr
    GetReturnToSupplierItemsofExistingGR() {
        this.pharmacyBLService.GetReturnToSupplierItemsofExistingGR()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.ItemList = res.Results;
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
    AddRowRequest(index) {
         
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
            ////row can be added if only if the item is selected is last row
            this.rowCount++;
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
            this.CaculationForPHRMReturnToSupplier();
            this.changeDetectorRef.detectChanges();
        }
        else {
            this.CaculationForPHRMReturnToSupplier();
            this.changeDetectorRef.detectChanges();
        }
    }

    ////Get List of Item Which Are Available In GoodsReceipt 
    GetItemListForReturnToSupplier() {
        ////Get All Item Which Are Available In GoodsReceipt 
        this.pharmacyBLService.GetItemListWithTotalAvailableQty()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.ItemList = [];
                    res.Results.forEach(a => {
                        this.ItemList.push({
                            "ItemId": a.ItemId, "ItemName": a.ItemName, TotalAvailableQuantity: a.TotalAvailableQuantity
                        });
                    });
                    /////Here Is Logic To remove Item From ItemList Whose TotalAvailbleQty is Zero because there no importance to keep item whose TotalQty is Zero
                    ////Empty Current Array list
                    this.tempItemList = [];
                    this.ItemList.forEach(b => {
                        //////Push Actual Items To Temporary Model
                        this.tempItemList.push(b);
                    });
                      //////Clear all Items From Actual Obj .....and Check in Temp Obj .....and Pass those Items From Temp to Actual obj whose Quantity is not equal to Zero
                    this.ItemList = [];
                    this.tempItemList.forEach(b => {
                        if (b.TotalAvailableQuantity != 0)
                        {
                            ////Now Current Return Obj has Those Item Whose TotalAvailableQunatity Is Greater Then Zero
                            this.ItemList.push(b);
                        }
                    });
                }
                else {
                    this.msgserv.showMessage("notice-message", ["No Items Avaliable for Return To Supplier"]);
                }
            });
    }
    ////used to format display item in ng-autocomplete
    myListFormatter(data: any): string {
        let html = data["ItemName"];
        return html;
    }
    /////This Function Called When Item is Selected And Here is LoGic To Select Batch No List For That Item 
    SelectItemFromSearchBox(Item: PHRMReturnToSupplierItemModel, index) {
        //if proper item is selected then the below code runs ..othewise it goes out side the function
        if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
            //this for loop with if conditon is to check whether the  item is already present in the array or not 
            //means to avoid duplication of item
            //currently this validation is suspended
            //for (var i = 0; i < this.curtRetSuppModel.returnToSupplierItems.length; i++) {
                
            //    if (this.curtRetSuppModel.returnToSupplierItems[i].ItemId == Item.ItemId && this.curtRetSuppModel.returnToSupplierItems[i].BatchNo == Item.BatchNo) {
            //        this.checkIsItemPresent = true;
            //    }
            //}
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
                        this.curtRetSuppModel.returnToSupplierItems[index].ItemPrice = 0;
                        this.curtRetSuppModel.returnToSupplierItems[index].ExpiryDate = "";
                        this.curtRetSuppModel.returnToSupplierItems[index].SubTotal = 0;
                        this.curtRetSuppModel.returnToSupplierItems[index].VATPercentage = 0;
                        this.curtRetSuppModel.returnToSupplierItems[index].DiscountedAmount = 0; 
                        this.curtRetSuppModel.returnToSupplierItems[index].TotalAmount = 0;
                        this.curtRetSuppModel.returnToSupplierItems[index].BatchWiseAvailableQuantity = 0;
                        /////this.curtRetSuppModel.returnToSupplierItems[index].Quantity = 0;
                        this.curtRetSuppModel.returnToSupplierItems[index].SelectedGRItems = [];
                        ////get all Batch No List For Selected Item
                        this.pharmacyBLService.GetBatchNoByItemId(this.curtRetSuppModel.returnToSupplierItems[index].ItemId)
                            .subscribe(res => {
                                if (res.Status == "OK" && res.Results.length > 0) {
                                    ////Assign Result to ReturnItem BatchNoList
                                    this.curtRetSuppModel.returnToSupplierItems[index].BatchNoList = res.Results;


                                    /////Here Is Logic To remove Batch From BatchNoList Whose Qty is Zero because there no importance to keep Batch whose QTY is Zero
                                    ////Empty Temp Current Array list
                                    this.curtRetSuppModel.returnToSupplierItems[index].TempBatchNoList = [];
                                    this.curtRetSuppModel.returnToSupplierItems[index].BatchNoList.forEach(b => {
                                        //////Push Actual Batch To Temporary Model
                                        this.curtRetSuppModel.returnToSupplierItems[index].TempBatchNoList.push(b);
                                    });
                                    //////Clear all Batch From Actual Obj .....and Check in Temp Obj .....and Pass those Batch From Temp to Actual obj whose Quantity is not equal to Zero
                                    this.curtRetSuppModel.returnToSupplierItems[index].BatchNoList = [];
                                    this.curtRetSuppModel.returnToSupplierItems[index].TempBatchNoList.forEach(b => {
                                        if (b.BatchWiseAvailableQuantity != 0) {
                                            ////Now Current Return Obj has Those Batches Whose QTY Is Greater Then Zero
                                            this.curtRetSuppModel.returnToSupplierItems[index].BatchNoList.push(b);
                                        }
                                    });
                                }
                                else {
                                    this.msgserv.showMessage("notice-message", ["No Items Avaliable for this ItemType"]);
                                }
                            });

                    }
                    //calculation of ReturnToSupplierItem
                    this.CalculationForPHRMReturnToSupplierItem(this.curtRetSuppModel.returnToSupplierItems[index], index);
                 }
            }

        }
    }

    ////Function On Changing BatchNo and Setting Required Property to ReturnToSupplierItems
    onBatchNoChange(BatchNo, index) {

        if (BatchNo && index >= 0) {
            this.pharmacyBLService.GetItemDetailsByBatchNo(BatchNo, this.curtRetSuppModel.returnToSupplierItems[index].ItemId)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        ///SET Property to ReturnToSuplierItems
                        this.curtRetSuppModel.returnToSupplierItems[index].GoodReceiptItemId = res.Results.GoodReceiptItemId;
                        this.curtRetSuppModel.returnToSupplierItems[index].BatchWiseAvailableQuantity = res.Results.BatchWiseAvailableQuantity;
                        this.curtRetSuppModel.returnToSupplierItems[index].ItemPrice = res.Results.ItemPrice;
                        this.curtRetSuppModel.returnToSupplierItems[index].TotalAmount = res.Results.ItemPrice * res.Results.TotalAmount;;
                        this.curtRetSuppModel.returnToSupplierItems[index].DiscountPercentage = res.Results.DiscountPercentage;
                        this.curtRetSuppModel.returnToSupplierItems[index].ExpiryDate = moment(res.Results.ExpiryDate).format('YYYY-MM-DD');
                        this.curtRetSuppModel.returnToSupplierItems[index].VATPercentage = CommonFunctions.parseAmount(res.Results.VATPercentage);
                        this.curtRetSuppModel.returnToSupplierItems[index].MRP = res.Results.MRP;

                        ////Temporary GRItems variable to Get Property And Push To SelectedGRItems List
                        ///Note: This SelectedGRItemsList Is Required because we have to Update The Available Qty of GRItem After Item is Return To Supplier
                        let tempSelectedGrItems = new PHRMGoodsReceiptItemsModel();
                        tempSelectedGrItems.AvailableQuantity = this.curtRetSuppModel.returnToSupplierItems[index].BatchWiseAvailableQuantity;
                        tempSelectedGrItems.ExpiryDate = this.curtRetSuppModel.returnToSupplierItems[index].ExpiryDate;
                        //tempSelectedGrItems.ManufactureDate = res.Results.ManufactureDate;
                        tempSelectedGrItems.GoodReceiptItemId = res.Results.GoodReceiptItemId;

                        this.curtRetSuppModel.returnToSupplierItems[index].SelectedGRItems.push(tempSelectedGrItems);
                      }
                    else {
                        this.msgserv.showMessage("notice-message", ["No Items details Available"]);
                    }
                });
            this.CalculationForPHRMReturnToSupplierItem(this.curtRetSuppModel.returnToSupplierItems[index], index);

        }
    }

    ///Function For Calculation Of all Return To Supplier Items
    CalculationForPHRMReturnToSupplierItem(row: PHRMReturnToSupplierItemModel, index) {

        if (this.curtRetSuppModel.returnToSupplierItems[index].ItemPrice != null && this.curtRetSuppModel.returnToSupplierItems[index].VATPercentage != null) {
            //this Disct is the coversion of DiscountPercentage
            let Disct = this.curtRetSuppModel.returnToSupplierItems[index].DiscountPercentage / 100;
            ///Calculate ReturnItem SubTotal by using Formula SubTotal = GRPrice*Quantity;
            this.curtRetSuppModel.returnToSupplierItems[index].SubTotal = (this.curtRetSuppModel.returnToSupplierItems[index].ItemPrice * (row.Quantity));
             ///Calculate ReturnItem DiscountedAmount by using Formula DiscountedAmount = GRPrice*Quantity*Disct;
            this.curtRetSuppModel.returnToSupplierItems[index].DiscountedAmount = CommonFunctions.parseAmount((this.curtRetSuppModel.returnToSupplierItems[index].ItemPrice * (row.Quantity)) * Disct);

            //this Vat is the coversion of VATPercentage
            let Vat = this.curtRetSuppModel.returnToSupplierItems[index].VATPercentage / 100;
            ///Calculate ReturnItem VatAmount by using Formula VatAmount = ((GRPrice*Quantity) - (DiscountAmt))*Vat;
            let VatAmount = (((this.curtRetSuppModel.returnToSupplierItems[index].ItemPrice * (row.Quantity)) - (this.curtRetSuppModel.returnToSupplierItems[index].DiscountedAmount)) * (Vat));
            let totAmt = ((this.curtRetSuppModel.returnToSupplierItems[index].ItemPrice * (row.Quantity)) - (this.curtRetSuppModel.returnToSupplierItems[index].DiscountedAmount)) + this.curtRetSuppModel.returnToSupplierItems[index].FreeAmount;
            ///Calculate ReturnItem TotalAmount by using Formula TotalAmount = ((GRPrice*Quantity) - (DiscountAmt))+VatAmount;
            this.curtRetSuppModel.returnToSupplierItems[index].TotalAmount = CommonFunctions.parseAmount(totAmt + VatAmount);
            this.CaculationForPHRMReturnToSupplier();
        }
    }


    ///Function For Calculation Of all Return To Supplier Toatl calculation
    CaculationForPHRMReturnToSupplier() {
        let STotal: number = 0;

        let TAmount: number = 0;
        let VAmount: number = 0;
        let DAmount: number = 0;

        for (var i = 0; i < this.curtRetSuppModel.returnToSupplierItems.length; i++) {
            if (this.curtRetSuppModel.returnToSupplierItems[i].SubTotal != null
                && this.curtRetSuppModel.returnToSupplierItems[i].TotalAmount != null) {

                STotal = STotal + this.curtRetSuppModel.returnToSupplierItems[i].SubTotal + this.curtRetSuppModel.returnToSupplierItems[i].FreeAmount;
                TAmount = TAmount + this.curtRetSuppModel.returnToSupplierItems[i].TotalAmount + this.curtRetSuppModel.returnToSupplierItems[i].FreeAmount;

                let vatttp = this.curtRetSuppModel.returnToSupplierItems[i].VATPercentage / 100;
                //let Disct = this.curtRetSuppModel.returnToSupplierItems[i].DiscountPercentage / 100;
                //let DsAmt = ((this.curtRetSuppModel.returnToSupplierItems[i].Quantity) * (this.curtRetSuppModel.returnToSupplierItems[i].ItemPrice) * Disct)
                //let vattAmt = (((this.curtRetSuppModel.returnToSupplierItems[i].ItemPrice * (this.curtRetSuppModel.returnToSupplierItems[i].Quantity)) - DsAmt) * vatttp);
                //DAmount = DAmount + DsAmt;
                //VAmount = VAmount + vattAmt;


            }
        }

        this.curtRetSuppModel.SubTotal = CommonFunctions.parseAmount(STotal);
        //this.curtRetSuppModel.TotalAmount = CommonFunctions.parseAmount(TAmount);
        this.curtRetSuppModel.TotalAmount = this.curtRetSuppModel.SubTotal - this.curtRetSuppModel.DiscountAmount + this.curtRetSuppModel.VATAmount ;
       // this.curtRetSuppModel.DiscountAmount = CommonFunctions.parseAmount(DAmount);
       // this.curtRetSuppModel.VATAmount = CommonFunctions.parseAmount(VAmount);

    }


    PostReturnToSupplier() {

        // this CheckIsValid varibale is used to check whether all the validation are proper or not ..
        //if the CheckIsValid == true the validation is proper else no
        var CheckIsValid = true;

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
            //if (this.curtRetSuppModel.returnToSupplierItems[i].CheckQty == true)
            //{
            //    CheckIsValid = false;
            //}
        }


        if (this.curtRetSuppModel.returnToSupplierItems.length == 0) {
            this.msgserv.showMessage("notice-message", ["Please Add Item ...Before Requesting"]);
        }

        if (CheckIsValid == true && this.curtRetSuppModel.returnToSupplierItems != null) {
           ////Push Actual ReturnItems To Temporary Model
            for (var i = 0; i < this.curtRetSuppModel.returnToSupplierItems.length; i++)
            {
                this.tempRetSuppModel.returnToSupplierItems.push(this.curtRetSuppModel.returnToSupplierItems[i]);
            }
            ////Clear all Items From Actual Obj .....and Check in Temp Obj .....and Pass those Items From Temp to Actual obj whose Quantity is not equal to Zero
            this.curtRetSuppModel.returnToSupplierItems = [];
            
            for (var i = 0; i < this.tempRetSuppModel.returnToSupplierItems.length; i++) {
                this.tempRetSuppModel.returnToSupplierItems[i].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

                   if (this.tempRetSuppModel.returnToSupplierItems[i].Quantity != 0)
                   {
                       ////Now Current Return Obj has Those Item Whose Qunatity Is Greater Then Zero
                       this.curtRetSuppModel.returnToSupplierItems.push(this.tempRetSuppModel.returnToSupplierItems[i]);
                      
                   }
                      
              }
            /////Take Server Call
            if (this.curtRetSuppModel.returnToSupplierItems.length)
                {
                    this.curtRetSuppModel.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

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
                else 
                {   ////This is For Loading Page With One Row Item Selection
                    if (this.curtRetSuppModel.returnToSupplierItems.length == 0) {
                        this.curtRetSuppItemModel = new PHRMReturnToSupplierItemModel();
                        this.curtRetSuppModel.returnToSupplierItems.push(this.curtRetSuppItemModel);
                    }
                    this.msgserv.showMessage("notice-message", ['All Selected Return Items Quantity is zero']);
                    this.router.navigate(['/Pharmacy/Store/ReturnItemsToSupplier']);
                }

          
         }
        else {
            this.msgserv.showMessage("notice-message", ['Some Required Field is Missing ??....Please Fill...']);
        }

    }

    UpdateAvailableQtyOfGRItem()
    {
        for (var k = 0; k < this.curtRetSuppModel.returnToSupplierItems.length; k++)
        {
            let curtGritmAvailQty: number = 0;
            ///This Is Current GRItems Available Quantity
            curtGritmAvailQty = this.curtRetSuppModel.returnToSupplierItems[k].SelectedGRItems[0].AvailableQuantity;
            let curtxnUpdateQty: number = 0;
            ///This Is Current RetrnToSupplierItem Available Quantity
            curtxnUpdateQty = this.curtRetSuppModel.returnToSupplierItems[k].Quantity;
            this.curtRetSuppModel.returnToSupplierItems[k].SelectedGRItems[0].AvailableQuantity = curtGritmAvailQty - curtxnUpdateQty;
        }
    }

    Cancel()
    {
        this.curtRetSuppModel.returnToSupplierItems = [];
        this.AddRowRequest(0);
    }
   
}


