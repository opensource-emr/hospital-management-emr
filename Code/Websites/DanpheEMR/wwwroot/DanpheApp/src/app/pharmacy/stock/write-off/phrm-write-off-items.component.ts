import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { SecurityService } from "../../../security/shared/security.service";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { PHRMWriteOffModel } from "../../shared/phrm-write-off.model";
import { PHRMWriteOffItemModel } from "../../shared/phrm-write-off-items.model";
import * as moment from 'moment/moment';
@Component({
    templateUrl:"./phrm-write-off-items.html"
})
export class PHRMWriteOffItemComponent {
    ///For Binding ---this is for current WriteOff Model
    public curtWriteOffModel: PHRMWriteOffModel = new PHRMWriteOffModel();

    public stockDetailsList: Array<any> = new Array<any>();

    ///For Binding ---this is for current WriteOffItems
    public curtWriteOffItemModel: PHRMWriteOffItemModel = new PHRMWriteOffItemModel();

    //this is to add or delete the number of row in ui
    public rowCount: number = 0;
    //this Item is used for search button(means auto complete button)...
    public ItemList: any;
    ///temp item list for Storing original itm and Remove Item whose Qty is <= zero
    public tempItemList: any;
    //declare boolean loading variable for disable the double click event of button
    loading: boolean = false;

    ///For Checking Items is Alredy Added or Not
    public checkIsItemPresent: boolean = false;
    public checkIsBatchNoPresent: boolean = false;
    validRoutes: any;
    constructor(public securityService: SecurityService, public changeDetectorRef: ChangeDetectorRef
        , public pharmacyBLService: PharmacyBLService, public router: Router
        , public msgserv: MessageboxService) {
        this.GetStockItemsListDetails();
        this.AddRowRequest(0);
        //this.GetItemListForWriteOff();
    }
    public GetStockItemsListDetails():void {
        try {
            this.pharmacyBLService.GetStockDetailsList()
                .subscribe(res => this.CallBackGetItemTypeList(res));
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
  
    CallBackGetItemTypeList(res) {
        try {
            if (res.Status == 'OK') {
                if (res.Results) {
                    this.stockDetailsList = new Array<any>();
                    this.stockDetailsList = res.Results;                   
                }
            }
            else {
                err => {
                    this.msgserv.showMessage("failed", ['failed to get items..']);
                }
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    myItemListFormatter(data: any): string {
        let html = data["ItemName"] + " |B.No.|" + data["BatchNo"] + " |M.R.P|" + data["MRP"];
        return html;
    }
    onChangeItem($event, index) {
        try {
   
            if ($event.ItemId > 0) {
                this.curtWriteOffModel.phrmWriteOffItem[index] = Object.assign(this.curtWriteOffModel.phrmWriteOffItem[index], $event);
                this.curtWriteOffModel.phrmWriteOffItem[index].ItemPrice = this.curtWriteOffModel.phrmWriteOffItem[index].MRP;
                this.curtWriteOffModel.phrmWriteOffItem[index].ItemId = $event.ItemId;
                this.CalculationForPHRMWriteOffItem(this.curtWriteOffModel.phrmWriteOffItem[index], index);
                this.curtWriteOffModel.phrmWriteOffItem[index].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

                let duplicateCount = this.curtWriteOffModel.phrmWriteOffItem.filter(i => i.BatchNo == $event.BatchNo && i.ItemId == $event.ItemId && i.ExpiryDate == $event.ExpiryDate).length;
                if (duplicateCount>1) {
                    this.msgserv.showMessage("notice-message", [$event.BatchNo + " is already added ...Please Check!!!"]);                    
                    this.changeDetectorRef.detectChanges();
                    this.curtWriteOffModel.phrmWriteOffItem.splice(index, 1);
                    this.curtWriteOffItemModel = new PHRMWriteOffItemModel();
                    this.curtWriteOffModel.phrmWriteOffItem.push(this.curtWriteOffItemModel);
                }   
            }
            else {
                this.msgserv.showMessage("notice-message", [" item not selected ...Please Check!!!"]);                    
            }

        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    ////Add New Row To UI 
    AddRowRequest(index) {
        try {
            if (this.curtWriteOffModel.phrmWriteOffItem.length == 0) {
                this.curtWriteOffItemModel = new PHRMWriteOffItemModel();
                this.curtWriteOffModel.phrmWriteOffItem.push(this.curtWriteOffItemModel);
            }
            else {
                //checking the validation
                for (var i = 0; i < this.curtWriteOffModel.phrmWriteOffItem.length; i++) {
                    // for loop is used to show WriteOffItemValidator message ..if required  field is not filled
                    for (var a in this.curtWriteOffModel.phrmWriteOffItem[i].WriteOffItemValidator.controls) {
                        this.curtWriteOffModel.phrmWriteOffItem[i].WriteOffItemValidator.controls[a].markAsDirty();
                        this.curtWriteOffModel.phrmWriteOffItem[i].WriteOffItemValidator.controls[a].updateValueAndValidity();
                    }

                }
                ////row can be added if only if the item is selected is last row
                this.rowCount++;
                this.curtWriteOffItemModel = new PHRMWriteOffItemModel();
                this.curtWriteOffModel.phrmWriteOffItem.push(this.curtWriteOffItemModel);
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }

    //to delete the row From UI
    DeleteRow(index) {
        try {
            //this will remove the data from the array
            this.curtWriteOffModel.phrmWriteOffItem.splice(index, 1);
            // if the index is 0 then ..  phrmWriteOffItem is pushhed in curtWriteOffItemModel to show the textboxes
            if (index == 0) {
                this.AddRowRequest(0);
                this.CaculationForPHRMWriteOff();
                this.changeDetectorRef.detectChanges();
            }
            else {
                this.CaculationForPHRMWriteOff();
                this.changeDetectorRef.detectChanges();
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

  
    CheckProperSelectedItem(Item, index) {
        try {
            if ((typeof Item !== 'object') || (typeof Item === "undefined") || (typeof Item === null)) {
                this.curtWriteOffModel.phrmWriteOffItem[index].SelectedItem = null;
                this.MakePropertyEmpty(index);
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    /////Make Empty all Current Row Coloumn Property
    MakePropertyEmpty(index) {
        this.curtWriteOffModel.phrmWriteOffItem[index].TotalAvailableQuantity = 0;
        this.curtWriteOffModel.phrmWriteOffItem[index].BatchNoList = [];
        this.curtWriteOffModel.phrmWriteOffItem[index].AvailableQuantity = 0;
        this.curtWriteOffModel.phrmWriteOffItem[index].WriteOffQuantity = 0;
        this.curtWriteOffModel.phrmWriteOffItem[index].ItemPrice = 0;
        this.curtWriteOffModel.phrmWriteOffItem[index].SubTotal = 0;
        this.curtWriteOffModel.phrmWriteOffItem[index].DiscountedAmount = 0;
        this.curtWriteOffModel.phrmWriteOffItem[index].VATPercentage = 0;
        this.curtWriteOffModel.phrmWriteOffItem[index].TotalAmount = 0;
        this.curtWriteOffModel.phrmWriteOffItem[index].SelectedItem = null;
    }
   

    ///Function For Calculation Of all Pharmacy WriteOff Item
    CalculationForPHRMWriteOffItem(row: PHRMWriteOffItemModel, index) {
        try {
            if (this.curtWriteOffModel.phrmWriteOffItem[index].ItemPrice != null && this.curtWriteOffModel.phrmWriteOffItem[index].VATPercentage != null) {
                //this Disct is the coversion of DiscountPercentage
                let Disct = this.curtWriteOffModel.phrmWriteOffItem[index].DiscountPercentage / 100;
                ///Calculate WriteOffItem SubTotal by using Formula SubTotal = GRPrice*Quantity;
                this.curtWriteOffModel.phrmWriteOffItem[index].SubTotal = (this.curtWriteOffModel.phrmWriteOffItem[index].ItemPrice * (row.WriteOffQuantity));
                ///Calculate WriteOffItem DiscountedAmount by using Formula DiscountedAmount = GRPrice*Quantity*Disct;
                this.curtWriteOffModel.phrmWriteOffItem[index].DiscountedAmount = CommonFunctions.parseAmount((this.curtWriteOffModel.phrmWriteOffItem[index].ItemPrice * (row.WriteOffQuantity)) * Disct);

                //this Vat is the coversion of VATPercentage
                let Vat = this.curtWriteOffModel.phrmWriteOffItem[index].VATPercentage / 100;
                ///Calculate WriteOffItem VatAmount by using Formula VatAmount = ((GRPrice*Quantity) - (DiscountAmt))*Vat;
                let VatAmount = (((this.curtWriteOffModel.phrmWriteOffItem[index].ItemPrice * (row.WriteOffQuantity)) - (this.curtWriteOffModel.phrmWriteOffItem[index].DiscountedAmount)) * (Vat));
                let totAmt = ((this.curtWriteOffModel.phrmWriteOffItem[index].ItemPrice * (row.WriteOffQuantity)) - (this.curtWriteOffModel.phrmWriteOffItem[index].DiscountedAmount));
                ///Calculate WriteOffItem TotalAmount by using Formula TotalAmount = ((GRPrice*Quantity) - (DiscountAmt))+VatAmount;
                this.curtWriteOffModel.phrmWriteOffItem[index].TotalAmount = CommonFunctions.parseAmount(totAmt + VatAmount);
                this.CaculationForPHRMWriteOff();
            }

        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }


    ///Function For Calculation Of all WriteOff Toatl calculation
    CaculationForPHRMWriteOff() {
        try {
            let STotal: number = 0;

            let TAmount: number = 0;
            let VAmount: number = 0;
            let DAmount: number = 0;
            for (var i = 0; i < this.curtWriteOffModel.phrmWriteOffItem.length; i++) {
                if (this.curtWriteOffModel.phrmWriteOffItem[i].SubTotal != null
                    && this.curtWriteOffModel.phrmWriteOffItem[i].TotalAmount != null) {

                    STotal = STotal + this.curtWriteOffModel.phrmWriteOffItem[i].SubTotal;
                    TAmount = TAmount + this.curtWriteOffModel.phrmWriteOffItem[i].TotalAmount;

                    let vatttp = this.curtWriteOffModel.phrmWriteOffItem[i].VATPercentage / 100;
                    let Disct = this.curtWriteOffModel.phrmWriteOffItem[i].DiscountPercentage / 100;
                    let DsAmt = ((this.curtWriteOffModel.phrmWriteOffItem[i].WriteOffQuantity) * (this.curtWriteOffModel.phrmWriteOffItem[i].ItemPrice) * Disct)
                    let vattAmt = (((this.curtWriteOffModel.phrmWriteOffItem[i].ItemPrice * (this.curtWriteOffModel.phrmWriteOffItem[i].WriteOffQuantity)) - DsAmt) * vatttp);
                    DAmount = DAmount + DsAmt;
                    VAmount = VAmount + vattAmt;


                }
            }
            this.curtWriteOffModel.SubTotal = CommonFunctions.parseAmount(STotal);
            this.curtWriteOffModel.TotalAmount = CommonFunctions.parseAmount(TAmount);
            this.curtWriteOffModel.DiscountAmount = CommonFunctions.parseAmount(DAmount);
            this.curtWriteOffModel.VATAmount = CommonFunctions.parseAmount(VAmount);
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }


    ////This function only for show catch messages in console 
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }

    ////Function Call to Reset the Context to Original Mode when Cancel is done From User
    Cancel() {
        try {
            this.curtWriteOffModel.phrmWriteOffItem = [];
            this.AddRowRequest(0);
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    ////Save Write of and WriteOffItems in db
    PostWriteOffItems() {
        try {          

            var CheckIsValid = true;
            for (var b in this.curtWriteOffModel.WriteOffValidator.controls) {
                this.curtWriteOffModel.WriteOffValidator.controls[b].markAsDirty();
                this.curtWriteOffModel.WriteOffValidator.controls[b].updateValueAndValidity();               
            }                
            if (this.curtWriteOffModel.IsValidCheck(undefined, undefined) == false) {
                CheckIsValid = false;
            }

            for (var i = 0; i < this.curtWriteOffModel.phrmWriteOffItem.length; i++) {
                for (var a in this.curtWriteOffModel.phrmWriteOffItem[i].WriteOffItemValidator.controls) {
                    this.curtWriteOffModel.phrmWriteOffItem[i].WriteOffItemValidator.controls[a].markAsDirty();
                    this.curtWriteOffModel.phrmWriteOffItem[i].WriteOffItemValidator.controls[a].updateValueAndValidity();
                }
                if (this.curtWriteOffModel.phrmWriteOffItem[i].IsValidCheck(undefined, undefined) == false) {                                 
                    CheckIsValid = false;
                }
            }

            if (CheckIsValid == true && this.curtWriteOffModel.phrmWriteOffItem != null) {
              
                /////Take Server Call
                if (this.curtWriteOffModel.phrmWriteOffItem.length) {
                    ////Loading = true to Disable Multiclick event the Button
                    this.loading = true;

                    this.curtWriteOffModel.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                 
                    this.pharmacyBLService.PostWriteOffItems(this.curtWriteOffModel).
                        subscribe(res => {
                            if (res.Status == 'OK') {
                                if (res.Results) {
                                    this.msgserv.showMessage("success", ["Breakage  order is Generated and Saved"]);
                                    this.changeDetectorRef.detectChanges();
                                    this.curtWriteOffModel.phrmWriteOffItem = new Array<PHRMWriteOffItemModel>();
                                    this.curtWriteOffModel = new PHRMWriteOffModel();
                                    this.curtWriteOffItemModel = new PHRMWriteOffItemModel();
                                    this.curtWriteOffModel.phrmWriteOffItem.push(this.curtWriteOffItemModel);
                                    this.loading = false; 
                              }
                              this.router.navigate(['Pharmacy/Stock/WriteOffItemsList']);
                            }
                            else {
                                this.msgserv.showMessage("failed", ['failed to add breakage Items.. please check log for details.']);
                                console.log(res);
                            }
                        });
                }

            }
            else {
                this.msgserv.showMessage("notice-message", ['Some Required Field is Missing ??....Please Fill...']);
            }

        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
   
}


