import { TOUCH_BUFFER_MS } from '@angular/cdk/a11y';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PharmacyBLService } from '../../../../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../../../../pharmacy/shared/pharmacy.service';
import { PHRMStoreModel } from '../../../../../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../../../../../security/shared/security.service';
import { MessageboxService } from '../../../../../shared/messagebox/messagebox.service';
import { SharedModule } from '../../../../../shared/shared.module';
import { DispensaryService } from '../../../../shared/dispensary.service';
import { StockTransferModel } from '../transfer.model';
import { TransferService } from '../transfer.service';

@Component({
  selector: 'app-transfer-create',
  templateUrl: './transfer-create.component.html',
  styleUrls: ['./transfer-create.component.css']
})
export class TransferCreateComponent implements OnInit {
  stockList: Array<any> = new Array<any>();
  transferItems: Array<StockTransferModel> = new Array<StockTransferModel>();
  storeList: Array<any> = new Array<any>();
  selectedStore: any;
  public checkIsItemPresent: boolean = false;
  public loading: boolean = false;
  currentDispensary: PHRMStoreModel;
  itemList: any[];
  currentDate = new Date();
  storeForm = new FormGroup({ targetStore: new FormControl('', Validators.required), Remarks: new FormControl() });

  constructor(private _dispensaryTransferService: TransferService, private _dispensaryService: DispensaryService,
    public changeDetectorRef: ChangeDetectorRef, public pharmacyBLService: PharmacyBLService,
    public securityService: SecurityService, public pharmacyService: PharmacyService,
    public router: Router, public sharedModule: SharedModule,
    public messageBoxService: MessageboxService) {
    this.currentDispensary = _dispensaryService.activeDispensary;
    this.AddRowRequest();
    this.GetStockForStockTransfer();
    this.GetActiveStoreList();
  }

  ngOnInit() {
    this.SetFocusById('selectedStore');
  }
  GetActiveStoreList() {
    this._dispensaryTransferService.GetAllStores()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.storeList = res.Results;
          //filter the store list with active Dispensary.
          this.storeList = this.storeList.filter(a => a.StoreId != this.currentDispensary.StoreId);
        }
      })
  }
  GetStockForStockTransfer() {
    this._dispensaryTransferService.GetDispensariesStock(this.currentDispensary.StoreId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.stockList = res.Results;
          //filter the stock with 0 quantity
          this.stockList = this.stockList.filter(s => s.AvailableQuantity > 0);
        }
        else {
          this.messageBoxService.showMessage("error", ["Failed to get Items. " + res.ErrorMessage]);
        }
      },
        err => {
          this.messageBoxService.showMessage("error", ["Failed to get Items. " + err.ErrorMessage]);
        });
  }
  ////add a new row 
  AddRowRequest() {
    let newTransferItem = new StockTransferModel();
    newTransferItem.TransferredQuantity = 1;
    this.transferItems.push(newTransferItem);
  }
  //to delete the row
  DeleteRow(index) {
    try {
      this.transferItems.splice(index, 1);
      if (this.transferItems.length == 0) {
        this.AddRowRequest();
      }
    }
    catch (exception) {
      this.messageBoxService.showMessage("Error", [exception]);
    }
  }
  // used to select dispensary in autocomplete
  OnStoreChange() {
    let store = null;
    if (!this.selectedStore) {
      this.transferItems[0].TargetStoreId = null;
    }
    else if (typeof (this.selectedStore) == 'string') {
      store = this.storeList.find(a => a.Name.toLowerCase() == this.selectedStore.toLowerCase());
    }
    else if (typeof (this.selectedStore) == "object") {
      store = this.selectedStore;
    }
    if (store) {
      this.storeForm.get("targetStore").setValue(store.StoreId);
      this.SetFocusOnItemName(this.transferItems.length - 1);
    }
    else {
      this.transferItems[0].TargetStoreId = null;
    }
    this.SetFocusById('itemName0');
    this.filterItemBasedOnDispensarySelected();
  }
  private filterItemBasedOnDispensarySelected() {
    if (this.selectedStore.SubCategory == "insurance") {
      if (this.transferItems[0].SelectedItem == undefined || this.transferItems[0].SelectedItem == " ") {
        this.transferItems = this.transferItems;
      }
      else {
        this.transferItems = this.transferItems.filter(a => a.ItemId > 0 && a.ItemId != null);
        this.transferItems = this.transferItems.filter(item => item.SelectedItem.IsInsuranceApplicable == true);
        if (this.transferItems.length == 0) {
          this.AddRowRequest();
        }

      }
      this.itemList = this.stockList.filter(a => a.IsInsuranceApplicable == true);
    }
    else {
      this.itemList = this.stockList;
    }
  }

  StoreListFormatter(data: any): string {
    return data["Name"];
  }
  ////used to format display item in ng-autocomplete
  ItemListFormatter(data: any): string {
    let html = `<font color='blue'; size=03 >${data["ItemName"]}</font> (<i>${data["GenericName"]}</i>)- Batch: ${data.BatchNo} - Qty: ${data.AvailableQuantity}`;
    return html;
  }
  Cancel() {
    this.transferItems = new Array<StockTransferModel>();
    this.AddRowRequest();
    //route back to requisition list
    this.router.navigate(['/Dispensary/Stock/Transfer']);
  }
  SelectItemFromSearchBox(Item: any, index) {
    //if proper item is selected then the below code runs ..othewise it goes out side the function
    if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
      //this for loop with if conditon is to check whether the  item is already present in the array or not 
      //means to avoid duplication of item
      //if proper item is selected then the below code runs ..othewise it goes out side the function
      if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
        for (var i = 0; i < this.transferItems.length; i++) {
          if (this.transferItems[i].ItemId == Item.ItemId && this.transferItems[i].BatchNo == Item.BatchNo && index != i) {
            this.checkIsItemPresent = true;
          }
        }
        //id item is present the it show alert otherwise it assign the value
        if (this.checkIsItemPresent == true) {
          this.messageBoxService.showMessage("notice-message", [`Item: ${Item.ItemName} Batch: ${Item.BatchNo} is already add..Please Check!!!`]);
          this.checkIsItemPresent = false;
          this.changeDetectorRef.detectChanges();
          this.transferItems.splice(index, 1);
          this.AddRowRequest();
          this.SetFocusOnItemName(index);
        }
        else {
          this.transferItems[index].ItemId = Item.ItemId;
          this.transferItems[index].Code = Item.Code;
          this.transferItems[index].UOMName = Item.UOMName;
          this.transferItems[index].BatchNo = Item.BatchNo;
          this.transferItems[index].ExpiryDate = Item.ExpiryDate;
          this.transferItems[index].AvailableQuantity = Item.AvailableQuantity;
          this.transferItems[index].MRP = Item.MRP;
          this.transferItems[index].CostPrice = Item.CostPrice;
        }
      }
    }
    else {
      this.transferItems[index].ItemId = null;
    }
  }
  StockTransfer() {
    this.loading = true;
    var errorMessages: Array<string> = [];
    var CheckIsValid = true;
    this.transferItems = this.transferItems.filter(item => item.ItemId > 0 && item.ItemId != null);
    for (var i = 0; i < this.transferItems.length; i++) {
      //Assign all the transferItems with the zero index dispatch items as we are saving all the details in only first dispatch item. 
      this.transferItems[i].TargetStoreId = this.selectedStore.StoreId;
      this.transferItems[i].SourceStoreId = this.currentDispensary.StoreId;
      this.transferItems[i].TransferredDate = this.currentDate.toDateString();
      this.transferItems[i].Remarks = this.storeForm.get("Remarks").value;

      if (this.transferItems[i].TransferredQuantity > this.transferItems[i].AvailableQuantity) {
        CheckIsValid = false;
        errorMessages.push(`Transferred Quantity is greater than Available Quantity for ${this.transferItems[i].SelectedItem.ItemName}`)
      }
      for (var a in this.transferItems[i].StockTransferValidator.controls) {
        this.transferItems[i].StockTransferValidator.controls[a].markAsDirty();
        this.transferItems[i].StockTransferValidator.controls[a].updateValueAndValidity();
      }
      if (this.transferItems[i].IsValidCheck(undefined, undefined) == false) {
        CheckIsValid = false;
      }
    }
    if (!this.transferItems[0].Remarks || this.transferItems[0].Remarks.trim() == "") {
      CheckIsValid = false;
      errorMessages.push("Remarks is mandatory. Please fill remarks.");
    }
    for (var b in this.storeForm.controls) {
      this.storeForm.controls[b].markAsDirty();
      this.storeForm.controls[b].updateValueAndValidity();
    }
    if (CheckIsValid == true) {
      this._dispensaryTransferService.PostStockTransfer(this.transferItems)
        .finally(() => this.loading = false)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.messageBoxService.showMessage("success", ["Transfer done successfully."]);
            this.router.navigate(["/Dispensary/Stock/Transfer"]);
          }
        });
    }
    else {
      this.messageBoxService.showMessage("Failed", errorMessages);
      this.loading = false;
    }
  }
  OnPressedEnterKeyInItemField(index) {
    if (this.transferItems[index].SelectedItem != null && this.transferItems[index].ItemId != null) {
      this.SetFocusById(`qtyip${index}`);
    }
    else {
      if (this.transferItems.length == 1) {
        this.SetFocusOnItemName(index)
      }
      else {
        this.transferItems.splice(index, 1);
        this.SetFocusById('remarks');
      }

    }
  }
  OnPressedEnterKeyInQuantityField(index) {
    var isinputvalid = this.transferItems.every(item => item.TransferredQuantity > 0 && item.TransferredQuantity <= item.AvailableQuantity)
    if (isinputvalid == true) {
      //If index is last element of array, then create new row
      if (index == (this.transferItems.length - 1)) {
        this.AddRowRequest();
        this.SetFocusOnItemName(1);
      }
      this.SetFocusOnItemName(index + 1);
    }
  }
  private SetFocusOnItemName(index: number) {
    this.SetFocusById("itemName" + index);
  }
  SetFocusById(id: string) {
    var Timer = setTimeout(() => {
      if (document.getElementById(id)) {
        let nextEl = <HTMLInputElement>document.getElementById(id);
        nextEl.focus();
        nextEl.select();
        clearTimeout(Timer);
      }
    }, 100)
  }
}
