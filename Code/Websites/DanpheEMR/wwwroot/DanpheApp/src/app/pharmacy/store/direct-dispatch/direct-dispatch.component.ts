import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { DispensaryService } from '../../../dispensary/shared/dispensary.service';
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SharedModule } from '../../../shared/shared.module';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import { PharmacyService } from '../../shared/pharmacy.service';
import { PHRMStoreDispatchItems } from '../../shared/phrm-store-dispatch-items.model';

@Component({
  selector: 'app-direct-dispatch',
  templateUrl: './direct-dispatch.component.html',
  styleUrls: ['./direct-dispatch.component.css']
})
export class DirectDispatchComponent implements OnInit {

  public dispatchItems: Array<PHRMStoreDispatchItems> = new Array<PHRMStoreDispatchItems>();
  public stockList: Array<any> = new Array<any>();
  public checkIsItemPresent: boolean = false;
  public dispensaryList: Array<any> = new Array<any>();
  public selectedDispensary: any;
  //for double click issues.
  public loading: boolean = false;
  isSelectedDispensaryInsurance: boolean;
  itemList: any[];
  directDispatchForm = new FormGroup({ targetStore: new FormControl('', Validators.required), Remarks: new FormControl('', Validators.required), ReceivedBy: new FormControl('') });


  constructor(private _dispensaryService: DispensaryService,
    public changeDetectorRef: ChangeDetectorRef, public pharmacyBLService: PharmacyBLService,
    public securityService: SecurityService, public pharmacyService: PharmacyService,
    public router: Router, public sharedModule: SharedModule,
    public messageBoxService: MessageboxService) {
    ////pushing currentPOItem for the first Row in UI 
    this.AddRowRequest();
    this.GetStockForItemDispatch();
    this.GetActiveDispensaryList();
  }
  ngOnInit() {
  }
  GetStockForItemDispatch() {
    this.pharmacyBLService.GetMainStoreStock()
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
  GetActiveDispensaryList() {
    this._dispensaryService.GetAllDispensaryList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.dispensaryList = JSON.parse(JSON.stringify(res.Results));
          this.dispensaryList = this.dispensaryList.filter(a => a.IsActive != false);
          this.SetFocusById("dispensary");
        }
      })
  }
  ////add a new row 
  AddRowRequest() {
    let newDispatchItem = new PHRMStoreDispatchItems();
    this.dispatchItems.push(newDispatchItem);
  }
  //to delete the row
  DeleteRow(index) {
    try {
      this.dispatchItems.splice(index, 1);
      if (this.dispatchItems.length == 0) {
        this.AddRowRequest();
        this.SetFocusOnItemName(1);
      }
    }
    catch (exception) {
      this.messageBoxService.showMessage("Error", [exception]);
    }
  }

  SelectItemFromSearchBox(Item: any, index) {
    //if proper item is selected then the below code runs ..othewise it goes out side the function
    if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
      //this for loop with if conditon is to check whether the  item is already present in the array or not 
      //means to avoid duplication of item
      for (var i = 0; i < this.dispatchItems.length; i++) {
        if (this.dispatchItems[i].ItemId == Item.ItemId && this.dispatchItems[i].BatchNo == Item.BatchNo && index != i) {
          this.checkIsItemPresent = true;
        }
      }
      //id item is present the it show alert otherwise it assign the value
      if (this.checkIsItemPresent == true) {
        this.messageBoxService.showMessage("notice-message", [`Item: ${Item.ItemName} Batch: ${Item.BatchNo} is already add..Please Check!!!`]);
        this.checkIsItemPresent = false;
        this.changeDetectorRef.detectChanges();
        this.dispatchItems.splice(index, 1);
        this.AddRowRequest();
        var interval = setTimeout(() => { this.SetFocusOnItemName(index); clearTimeout(interval); }, 300);

      }
      else {
        this.dispatchItems[index].ItemId = Item.ItemId;
        this.dispatchItems[index].Code = Item.Code;
        this.dispatchItems[index].UOMName = Item.UOMName;
        this.dispatchItems[index].BatchNo = Item.BatchNo;
        this.dispatchItems[index].ExpiryDate = Item.ExpiryDate;
        this.dispatchItems[index].AvailableQuantity = Item.AvailableQuantity;
        this.dispatchItems[index].MRP = Item.MRP;
        this.dispatchItems[index].CostPrice = Item.CostPrice;
      }
    }
  }
  DirectDispatch() {
    this.loading = true;
    var errorMessages: Array<string> = [];
    var CheckIsValid = true;
    for (var b in this.directDispatchForm.controls) {
      this.directDispatchForm.controls[b].markAsDirty();
      this.directDispatchForm.controls[b].updateValueAndValidity();
    }
    if (this.directDispatchForm.invalid) {
      CheckIsValid = false;
      this.messageBoxService.showMessage("Failed", ["Check all *mandatory fields."])
    }
    else {
      for (var i = 0; i < this.dispatchItems.length; i++) {
        //Assign all the dispatchitems with the zero index dispatch items as we are saving all the details in only first dispatch item. 
        this.dispatchItems[i].TargetStoreId = this.selectedDispensary.StoreId;
        this.dispatchItems[i].DispatchedDate = this.dispatchItems[0].DispatchedDate;
        this.dispatchItems[i].Remarks = this.directDispatchForm.get('Remarks').value;
        this.dispatchItems[i].ReceivedBy = this.directDispatchForm.get('ReceivedBy').value;
        this.dispatchItems[i].DispatchItemValidator.get("DispensaryId").setValue(this.dispatchItems[0].TargetStoreId);

        if (this.dispatchItems[i].DispatchedQuantity > this.dispatchItems[i].AvailableQuantity) {
          CheckIsValid = false;
          errorMessages.push(`Dispatched Quantity is greater than Available Quantity for ${this.dispatchItems[i].SelectedItem.ItemName}`)
        }
        for (var a in this.dispatchItems[i].DispatchItemValidator.controls) {
          this.dispatchItems[i].DispatchItemValidator.controls[a].markAsDirty();
          this.dispatchItems[i].DispatchItemValidator.controls[a].updateValueAndValidity();
        }
        if (this.dispatchItems[i].IsValidCheck(undefined, undefined) == false) {
          CheckIsValid = false;
        }
      }
    }
    if (CheckIsValid == true) {
      this.pharmacyBLService.PostDirectDispatch(this.dispatchItems)
        .finally(() => this.loading = false)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.messageBoxService.showMessage("success", ["Dispatch done successfully."]);
            this.router.navigate(["/Pharmacy/Store/StoreRequisition"]);
          }
        });
    }
    else {
      this.messageBoxService.showMessage("Failed", errorMessages);
      this.loading = false;
    }
  }
  // used to select dispensary in autocomplete
  OnDispensaryChange() {
    let dispensary = null;
    if (!this.selectedDispensary) {
      this.dispatchItems[0].TargetStoreId = null;
    }
    else if (typeof (this.selectedDispensary) == 'string') {
      dispensary = this.dispensaryList.find(a => a.Name.toLowerCase() == this.selectedDispensary.toLowerCase());
    }
    else if (typeof (this.selectedDispensary) == "object") {
      dispensary = this.selectedDispensary;
    }
    if (dispensary) {
      this.dispatchItems[0].TargetStoreId = dispensary.StoreId;
      this.dispatchItems[0].DispatchItemValidator.get("DispensaryId").setValue(dispensary.StoreId);
    }
    else {
      this.dispatchItems[0].TargetStoreId = null;
    }

    this.FilterItemsBasedOnDispensaryType();
  }
  FilterItemsBasedOnDispensaryType() {
    if (this.selectedDispensary.SubCategory == "insurance") {
      if (this.dispatchItems[0].SelectedItem == undefined || this.dispatchItems[0].SelectedItem == " ") {
        this.dispatchItems = this.dispatchItems;
        console.log(this.dispatchItems);
      }
      else {
        this.dispatchItems = this.dispatchItems.filter(item => item.ItemId > 0 && item.ItemId != null);
        this.dispatchItems = this.dispatchItems.filter(item => item.SelectedItem.IsInsuranceApplicable == true);
        if (this.dispatchItems.length == 0) {
          this.AddRowRequest();
        }

      }
      this.itemList = this.stockList.filter(a => a.IsInsuranceApplicable == true);
    }
    else {
      this.itemList = this.stockList;
    }
  }


  DispensaryListFormatter(data: any): string {
    return data["Name"];
  }
  ////used to format display item in ng-autocomplete
  ItemListFormatter(data: any): string {
    let html = "";
    let todaysDate = new Date();
    todaysDate.setMonth(todaysDate.getMonth() + 3);
    let expiryDate = new Date(data["ExpiryDate"]);
    if (expiryDate < todaysDate) {
      html = `<font color='crimson'; size=03 >${data["ItemName"]}</font> |E:${moment(data["ExpiryDate"]).format('YYYY-MM-DD')} |B.No.|${data["BatchNo"]} |Qty|${data["AvailableQuantity"]} |S.Price|${data["MRP"]}`;
    }
    else {
      html = `<font color='blue'; size=03 >${data["ItemName"]}</font> |E:${moment(data["ExpiryDate"]).format('YYYY-MM-DD')} |B.No.|${data["BatchNo"]} |Qty|${data["AvailableQuantity"]} |S.Price|${data["MRP"]}`;
    }
    // html = `<font color='blue'; size=03 >${data["ItemName"]}</font> (<i>${data["GenericName"]}</i>)- Batch: ${data.BatchNo} - Qty: ${data.AvailableQuantity}`;
    return html;
  }
  Cancel() {
    this.dispatchItems = new Array<PHRMStoreDispatchItems>();
    this.AddRowRequest();
    //route back to requisition list
    this.router.navigate(['/Pharmacy/Store/StoreRequisition']);
  }
  logError(err: any) {
    console.log(err);
  }
  OnPressedEnterKeyInItemField(index) {
    if (this.dispatchItems[index].SelectedItem != null && this.dispatchItems[index].ItemId != null) {
      this.SetFocusById(`qtyip${index}`);
    }
    else {
      if (this.dispatchItems.length == 1) {
        this.SetFocusOnItemName(index)
      }
      else {
        this.dispatchItems.splice(index, 1);
        this.SetFocusById('remarks');
      }

    }
  }
  OnPressedEnterKeyInQuantityField(index) {
    var isinputvalid = this.dispatchItems.every(item => item.DispatchedQuantity > 0 && item.DispatchedQuantity <= item.AvailableQuantity)
    if (isinputvalid == true) {
      //If index is last element of array, then create new row
      if (index == (this.dispatchItems.length - 1)) {
        this.AddRowRequest();
      }
      this.SetFocusOnItemName(index + 1);
    }
  }
  public SetFocusOnItemName(index: number) {
    this.SetFocusById("itemName" + index);
  }

  SetFocusById(IdToBeFocused) {
    window.setTimeout(function () {
      var element = <HTMLInputElement>document.getElementById(IdToBeFocused);
      element.focus();
      //element.select();
    }, 20);
  }
}
