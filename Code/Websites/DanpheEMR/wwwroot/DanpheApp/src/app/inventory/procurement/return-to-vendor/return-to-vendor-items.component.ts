import { Component, ChangeDetectorRef } from '@angular/core';
import * as moment from 'moment/moment';

import { SecurityService } from '../../../security/shared/security.service';
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

import { ReturnToVendorItem } from "../../shared/return-to-vendor-items.model";
import { VendorMaster } from "../../shared/vendor-master.model";
import { ItemMaster } from "../../shared/item-master.model";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  templateUrl: "./return-tovendor-items.html"  // "/InventoryView/ReturnToVendorItems"
})
export class ReturnToVendorItemsComponent {
    public SelectedVendor: VendorMaster = new VendorMaster();
    public currentItemToReturn: ReturnToVendorItem = new ReturnToVendorItem();
    public itemsToReturn: Array<ReturnToVendorItem> = new Array<ReturnToVendorItem>();

    vendorId: number = null;
    returnType: string = null;
    //display vendor on certain condition only
    public ShowVendorDetails: boolean = false;
    //to disable request button until previous call is completed
    public loading: boolean = false;
    public itemList: any
    //to show the total and sub total of list return item
    public SubTotal: number;
    public VAT: number;
    public TotalAmount: number;
    public ReturnValidator: FormGroup = null;
    public CreditNoteNo: number;
    public Vendors: Array<any> = new Array<any>();


    constructor(
        public inventoryBLService: InventoryBLService,
        public securityService: SecurityService,
        public router: Router,
        public messageBoxService: MessageboxService,
        public changeDetectorRef: ChangeDetectorRef) {
            this.LoadNewRequest();
            var _formBuilder = new FormBuilder();
            this.ReturnValidator = _formBuilder.group({
                'CreditNoteNo': ['', Validators.compose([Validators.required])]                
        });
        this.GetVenderList();
    }
    
    LoadNewRequest() {
        this.vendorId = null;
        this.ShowVendorDetails = false;
        this.SelectedVendor = new VendorMaster();
        this.itemsToReturn = new Array<ReturnToVendorItem>();
        this.currentItemToReturn = new ReturnToVendorItem();
        this.currentItemToReturn.Quantity = 0;
        this.itemsToReturn.push(this.currentItemToReturn);
        this.CalculateAll(0);
    }
    //gets call when vendor is selected
    //loads the List of Items with their batch details against vendorId
    GetItemList(vendorId) {
        if (vendorId != this.SelectedVendor.VendorId) {
            this.itemsToReturn = new Array<ReturnToVendorItem>();
            this.currentItemToReturn = new ReturnToVendorItem();
            this.itemsToReturn.push(this.currentItemToReturn);

            this.inventoryBLService.GetItemListbyVendorId(vendorId)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.SelectedVendor.VendorId = vendorId;
                        this.SelectedVendor.ContactAddress = res.Results.vendorDetail.ContactAddress;
                        this.SelectedVendor.ContactNo = res.Results.vendorDetail.ContactNo;
                        this.itemList = res.Results.itemBatchList;
                        this.ShowVendorDetails = true;
                    }
                    else {
                        this.messageBoxService.showMessage("failed", ['failed to get Item List.....please check log for details.']);
                        console.log(res.ErrorMessage);
                    }
                });
        }
    }

    AddRowRequest() {
        this.currentItemToReturn = new ReturnToVendorItem();
        this.currentItemToReturn.Quantity = 0;
        this.itemsToReturn.push(this.currentItemToReturn);
    }
    
    DeleteRow(index) {
        //this will remove the data from the array
        this.itemsToReturn.splice(index, 1);
        // if the index is 0 then ..  then it will also create blank row of ReturnToVendorItem
        if (index == 0) {
            this.currentItemToReturn = new ReturnToVendorItem();
            this.currentItemToReturn.Quantity = 0;
            this.itemsToReturn.push(this.currentItemToReturn);
            this.changeDetectorRef.detectChanges();
        }
    }
    
    SelectItemFromSearchBox(Item, index) {
        var checkIsItemPresent: boolean = false;
        //if proper item is selected then the below code runs ..othewise it goes out side the function
        if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
            this.currentItemToReturn.batchNoList = Item.BatchDetails;
            for (var i = 0; i < this.currentItemToReturn.batchNoList.length; i++)
                if (this.currentItemToReturn.batchNoList[i].BatchNo == "")
                    this.currentItemToReturn.batchNoList[i].BatchNo = "NA";

            for (var a = 0; a < this.itemsToReturn.length; a++) {
                // Assiging the value VatPercentage and ItemId in the particular index ..
                if (a == index) {
                    this.itemsToReturn[index].VAT = Item.VAT;
                    this.itemsToReturn[index].ItemId = Item.ItemId;
                    this.itemsToReturn[index].VendorId = this.SelectedVendor.VendorId;
                }
            }
        }
    }

    myListFormatter(data: any): string {
        let html = data["ItemName"];
        return html;
    }

  OnSelectedBatchNo(GoodsReceiptId, index) {
    if (GoodsReceiptId != null) {
          var checkBatchNoPresent: boolean = false;
            for (var i = 0; i < this.itemsToReturn.length; i++) {
                if (i != index) {
                  if (this.itemsToReturn[i].GoodsReceiptId == GoodsReceiptId && this.itemsToReturn[i].ItemId == this.itemsToReturn[index].ItemId) {

                        checkBatchNoPresent = true
                    }
                }
            }
            //when batch is unique, its available quantity,itemrate,stockid,goodsreceiptid are set for that index
          if (checkBatchNoPresent == false) {
            var batchList: any = this.itemsToReturn[index].batchNoList.find(i => i.GoodsReceiptId == GoodsReceiptId);
              if (batchList) {
                this.itemsToReturn[index].AvailableQuantity = batchList.AvailQty;
                this.itemsToReturn[index].GoodsReceiptId = batchList.GoodsReceiptId;

                this.itemsToReturn[index].ItemRate = batchList.ItemRate;
                this.itemsToReturn[index].StockId = batchList.StockId;
                this.itemsToReturn[index].GoodsReceiptItemId = batchList.GRId;
                this.CalculateAll(index);
            }
            }
            //when batch is already present in list, the current row is delete and blank row takes its place
            else {
                this.messageBoxService.showMessage("notice-message", ["Please Check!!! This BatchNo is already added "]);
                this.changeDetectorRef.detectChanges();
                this.itemsToReturn.splice(index, 1);
                this.currentItemToReturn = new ReturnToVendorItem();
                this.currentItemToReturn.Quantity = 0;
                this.itemsToReturn.push(this.currentItemToReturn);
            }
        }
    }

    //for calculating SubTotal,VAT,TotalAmount for the list
    CalculateAll(index) {
        this.SubTotal = 0;
        this.VAT = 0;
        this.TotalAmount = 0;
        for (var i = 0; i < this.itemsToReturn.length; i++) {
            //calculate total amount for current Index
            if (i == index) {
                let Vat = this.itemsToReturn[i].VAT / 100;
                let VatAmt = (this.itemsToReturn[i].ItemRate * this.itemsToReturn[i].Quantity) * Vat;
                this.itemsToReturn[i].TotalAmount = (this.itemsToReturn[i].ItemRate * this.itemsToReturn[i].Quantity) + VatAmt;
            }
            this.SubTotal = this.SubTotal + (this.itemsToReturn[i].ItemRate * this.itemsToReturn[i].Quantity);
            this.TotalAmount = (Math.round((this.TotalAmount + this.itemsToReturn[i].TotalAmount) * 100) / 100);
            this.VAT = (Math.round((this.TotalAmount - this.SubTotal) * 100) / 100);
        }
    }

    //Save returnitems Transaction to Database with checking validation part
    AddReturnItems() {
        if (this.itemsToReturn != null) {
            //This for checking All itemsToReturns with 0
            //If all WriteOff with 0 Quantity then user can't ReturnItems
            //I think Need to restrict 0 Quantity ReturnItems entry

            //checking Validation
            let CheckIsValid = true;
            let CheckValidQty = true;

            if (!this.CreditNoteNo) {
                this.ReturnValidator.controls["CreditNoteNo"].markAsDirty();
                this.ReturnValidator.controls["CreditNoteNo"].updateValueAndValidity();

            }
            let createdOn = moment().format("YYYY-MM-DD HH:mm:ss");
            for (var i = 0; i < this.itemsToReturn.length; i++) {
                for (var x in this.itemsToReturn[i].ReturnItemValidator.controls) {
                    this.itemsToReturn[i].ReturnItemValidator.controls[x].markAsDirty();
                    this.itemsToReturn[i].ReturnItemValidator.controls[x].updateValueAndValidity();
                }

                //This is for check every item from itemsToReturn is valid or not (itemsToReturn is Array of WriteOffItems)
                if (this.itemsToReturn[i].IsValidCheck(undefined, undefined) == false || this.ReturnValidator.valid == false) { CheckIsValid = false; }

                //Assign CreatedOn and CreatedBy and CreditNoteNo value
                this.itemsToReturn[i].CreditNoteNo = this.CreditNoteNo;
                this.itemsToReturn[i].CreatedOn = createdOn;
                this.itemsToReturn[i].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

                //for checking  quantity is less than available quantity
                if (this.itemsToReturn[i].AvailableQuantity < this.itemsToReturn[i].Quantity || this.itemsToReturn[i].Quantity == 0) {
                    CheckValidQty = false;
                }
            } 

            //Validation Pass then Post WriteOff Transaction and Save
            if (CheckIsValid && CheckValidQty) {
                this.loading = true;
                this.inventoryBLService.PostToReturnToVendor(this.itemsToReturn)
                    .subscribe(
                    res => {
                        this.CallBackSaveReturnToVendorItems(res);
                    },
                    err => {
                        this.loading = false,
                            this.logError(err);
                    });
            } else {
                let warningStr = CheckValidQty == false ? this.messageBoxService.showMessage("notice-message", ['Please Enter valid quantity']) : 'Please fill value';
            }
        }
        else {
            this.messageBoxService.showMessage("notice-message", ["Add Item ...Before Requesting"]);
        }
    }
    //after post data to server
    CallBackSaveReturnToVendorItems(res) {
        if (res.Status == "OK") {
            this.messageBoxService.showMessage("success", ['Return-To-Vendor Successfully Done.']);
          this.router.navigate(['/Inventory/ProcurementMain/ReturnToVendorListItems']);

            //this.loading = false;
            //this.LoadNewRequest();
        }
        else {
            this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
            this.loading = false;
        }
    }
    Cancel() {
        this.LoadNewRequest();
    }
    logError(err: any) {
        console.log(err);
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ReturnValidator.dirty;
        else
            return this.ReturnValidator.controls[fieldName].dirty;
    }


    public IsValid(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ReturnValidator.valid;
        }
        else
            return !(this.ReturnValidator.hasError(validator, fieldName));
    }

    GetVenderList() {
        this.inventoryBLService.GetVendorList().
            subscribe(res => {
                if (res.Status == "OK") {
                    this.Vendors = res.Results;
                }
                else {
                    this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
                }
            });
    }
}
