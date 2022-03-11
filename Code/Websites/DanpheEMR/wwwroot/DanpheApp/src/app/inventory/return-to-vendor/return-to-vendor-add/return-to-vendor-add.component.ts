import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BillingFiscalYear } from '../../../billing/shared/billing-fiscalyear.model';
import { BillingBLService } from '../../../billing/shared/billing.bl.service';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { VendorMaster } from '../../../inventory/shared/vendor-master.model';
import { PharmacyBLService } from '../../../pharmacy/shared/pharmacy.bl.service';
import { SecurityService } from '../../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ReturnToVendorItem } from '../return-to-vendor-items.model';
import { ReturnToVendorModel } from '../return-to-vendor.model';
import { InventoryBLService } from '../../shared/inventory.bl.service';
import { ActivateInventoryService } from '../../../shared/activate-inventory/activate-inventory.service';

@Component({
  selector: 'app-return-to-vendor-add',
  templateUrl: './return-to-vendor-add.component.html',
  styles: []
})
export class ReturnToVendorAddComponent implements OnInit {
  ngOnInit() {
    this.setFocusById('vendor');
  }
  fisc;
  public SelectedVendor: VendorMaster = new VendorMaster();
  public currentItemToReturn: ReturnToVendorItem = new ReturnToVendorItem();
  public itemsToReturn: Array<ReturnToVendorItem> = new Array<ReturnToVendorItem>();
  public allFiscalYrs: Array<BillingFiscalYear> = [];
  public selFiscYrId: number = 3;
  public disableTextBox: boolean;

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

  public returnToVendor: ReturnToVendorModel = new ReturnToVendorModel(); // bikash: 26thJune'20 - new model added to handel returnToVendorItem separation into returnToVendor details and item details.


  public GoodsReceiptNo: number;
  public FiscYrId: number;
  public selectedVendor: any;
  constructor(
    public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public securityService: SecurityService,
    public router: Router,
    public messageBoxService: MessageboxService,
    public pharmacyBLService: PharmacyBLService,
    public BillingBLService: BillingBLService,
    public changeDetectorRef: ChangeDetectorRef,
    private _activateInventoryService: ActivateInventoryService) {
    this.LoadNewRequest();
    var _formBuilder = new FormBuilder();
    this.ReturnValidator = _formBuilder.group({
      'CreditNoteNo': ['', Validators.compose([Validators.required])],
      'GrNo': ['', Validators.compose([Validators.required])],
      'VendorId': ['', Validators.compose([Validators.required])]

    });
    this.GetVendorList();
    this.GetCreditNoteNo();
    this.GetAllFiscalYrs();
    this.SetCurrentFiscalYear();


  }
  GetCreditNoteNo() {
    this.inventoryBLService.GetCreditNoteNum().
      subscribe(res => {
        if (res.Status == "OK") {
          this.CreditNoteNo = res.Results;
        }
      });
  }


  GetAllFiscalYrs() {
    this.inventoryBLService.GetAllFiscalYears()
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
          let fiscYr: BillingFiscalYear = res.Results;
          if (fiscYr) {
            this.selFiscYrId = fiscYr.FiscalYearId;
          }
        }
      });
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
  GetItemList() {
    if (this.vendorId > 0 && this.GoodsReceiptNo > 0 && this.selFiscYrId > 0) {
      this.itemsToReturn = new Array<ReturnToVendorItem>();
      this.currentItemToReturn = new ReturnToVendorItem();
      this.itemsToReturn.push(this.currentItemToReturn);
      var storeId = this._activateInventoryService.activeInventory.StoreId;
      this.inventoryBLService.GetItemListForReturnToVendor(this.vendorId, this.GoodsReceiptNo, this.selFiscYrId, storeId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.SelectedVendor.VendorId = this.vendorId;
            this.SelectedVendor.ContactAddress = res.Results.vendorDetail.ContactAddress;
            this.SelectedVendor.ContactNo = res.Results.vendorDetail.ContactNo;
            this.itemList = res.Results.itemBatchList;
            this.ShowVendorDetails = true;
            this.setFocusById('itemName0')
            if (this.itemList.length == 0) {
              this.messageBoxService.showMessage("notice", ['No items available in the stock to return!']);
              this.ShowVendorDetails = false;
            }
          }
          else {
            this.messageBoxService.showMessage("failed", ['failed to get Item List.....please check log for details.']);
            console.log(res.ErrorMessage);
          }
        });
    }
    else {
      this.ReturnValidator.controls["GrNo"].markAsDirty();
      this.ReturnValidator.controls["GrNo"].updateValueAndValidity();
    }
  }

  AddRowRequest(index: number) {
    this.currentItemToReturn = new ReturnToVendorItem();
    this.currentItemToReturn.Quantity = 0;
    this.itemsToReturn.push(this.currentItemToReturn);
    this.setFocusById('itemName' + index);
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
          this.itemsToReturn[index].ItemId = Item.ItemId;
          this.itemsToReturn[index].VendorId = this.SelectedVendor.VendorId;
          this.itemsToReturn[index].ItemRate = Item.BatchDetails[0].ItemRate;
          this.itemsToReturn[index].AvailableQuantity = Item.BatchDetails[0].AvailQty;
          this.itemsToReturn[index].GoodsReceiptId = Item.BatchDetails[0].GoodsReceiptId;
          this.itemsToReturn[index].VAT = Item.BatchDetails[0].VAT;
        }
      }
    }
  }

  myListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }
  myVendorListFormatter(data: any): string {
    let html = data["VendorName"];
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
      // Re-calcuation without round-off for storing in db
      let subTotal: number = 0;
      let totalAmount: number = 0;
      let vatTotal: number = 0;

      this.itemsToReturn.forEach(a => {

        vatTotal = vatTotal + (a.ItemRate * a.Quantity) * (a.VAT / 100);

        subTotal = subTotal + (a.ItemRate * a.Quantity);
      });
      totalAmount = subTotal + vatTotal;

      this.returnToVendor.TotalAmount = totalAmount;
      this.returnToVendor.SubTotal = subTotal;
      this.returnToVendor.VATTotal = vatTotal;
      this.returnToVendor.VendorId = this.vendorId;
      this.returnToVendor.CreditNoteId = this.CreditNoteNo;
      this.returnToVendor.ReturnDate = createdOn;
      this.returnToVendor.CreatedOn = createdOn;
      this.returnToVendor.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      //this.returnToVendor.DiscountAmount; // =?
      //this.returnToVendor.CreditNotePrintNo; //=?
      this.returnToVendor.itemsToReturn = this.itemsToReturn;


      //Validation Pass then Post WriteOff Transaction and Save
      if (CheckIsValid && CheckValidQty) {
        if (!this._activateInventoryService.activeInventory.StoreId) {
          this.messageBoxService.showMessage("Alert!", ["Cannot find StoreId. Please select Inventory First"])
          return;
        } else {
          this.returnToVendor.StoreId = this._activateInventoryService.activeInventory.StoreId;
        }
        this.loading = true;
        this.inventoryBLService.PostToReturnToVendor(this.returnToVendor)
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
      this.router.navigate(['/Inventory/ReturnToVendor/ReturnToVendorList']);

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

  GetVendorList() {
    try {
      this.Vendors = this.inventoryService.allVendorList;
      if (this.Vendors.length == 0) {
        this.messageBoxService.showMessage("Failed", ["Failed to load the vendor list."]);
      }
    } catch (ex) {
      this.messageBoxService.showMessage("Failed", ["Something went wrong while loading vendor list."]);
    }
  }
  SelectVendorFromSearchBox() {

    let selVendorObj: VendorMaster = null;
    if (typeof (this.selectedVendor) == 'string' && this.selectedVendor.length) {
      selVendorObj = this.Vendors.find(v => v.VendorName.toLowerCase() == this.selectedVendor.toLowerCase());
    }
    else if (typeof (this.selectedVendor) == 'object') {
      selVendorObj = this.selectedVendor;
    }

    if (selVendorObj) {
      this.vendorId = selVendorObj.VendorId;
    }
    else {
      this.vendorId = null;
    }
  }

  GoToNextInput(idToSelect: string, Item?: any, index?: number) {
    if (document.getElementById(idToSelect) && Item) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
      nextEl.select();
    }
    else {
      this.DeleteRow(index);
      idToSelect = 'Request';
      if (document.getElementById(idToSelect)) {
        let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
        nextEl.focus();
        nextEl.select();
      }
    }
  }

  setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    var timer = window.setTimeout(function () {
      let htmlObject = document.getElementById(targetId);
      if (htmlObject) {
        htmlObject.focus();
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
  }

}
