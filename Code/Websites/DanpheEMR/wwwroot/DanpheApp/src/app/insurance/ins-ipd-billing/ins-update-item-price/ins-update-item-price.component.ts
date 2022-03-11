import { Component, Input, Output, EventEmitter, OnInit,Renderer2 } from '@angular/core'
import { BillingTransactionItem } from '../../../billing/shared/billing-transaction-item.model';
import { BillingBLService } from '../../../billing/shared/billing.bl.service'; 
import { MessageboxService } from '../../../shared/messagebox/messagebox.service'; 
import { BillingService } from '../../../billing/shared/billing.service';
import { BillItemPriceVM } from '../../../billing/shared/billing-view-models';
import { CoreService } from '../../../core/shared/core.service';
import { SecurityService } from '../../../security/shared/security.service';
import { InsuranceBlService } from '../../shared/insurance.bl.service';
import { InsuranceService } from '../../shared/ins-service';

@Component({
  selector: 'ins-update-items',
  templateUrl: "./ins-update-item-price.html"
})

export class InsuranceUpdateItemPriceComponent implements OnInit {
  @Output("close-popup")
  closeUpdatItemsPopUp: EventEmitter<Object> = new EventEmitter<Object>();
  @Input("patientDetails")
  public patientDetails: any = null;
  public isAllItemsSelected: boolean = false;
  public loading: boolean = false;
  @Input("filtered-items")
  public filteredItems: Array<BillingTransactionItem>;

  public IsInsurance: boolean = false;

  //Yubraj 29th July --Used for DiscableApplicable scenario only
  public AllItemLists: Array<BillItemPriceVM> = new Array<BillItemPriceVM>();
  public discountApplicable: boolean = true;


  public ShowAssignDocInPopup: boolean = false;
  //public DocObj = { EmployeeId: null, EmployeeName: null};
  public providerList: any;

  //@Input()
  public someItems: Array<BillingTransactionItem> = [];
  @Input("popup-action")
  popupAction: string = "add";//add or edit.. logic will change accordingly.

  public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
  constructor(public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public insuranceBLService: InsuranceBlService,
    public insuranceService: InsuranceService,
    public securityService: SecurityService,
    public renderer: Renderer2,) {
    this.GetProviderList();
  }

  ngOnInit() {
    this.AllItemLists = this.insuranceService.allBillItemsPriceList;
    if (this.filteredItems && this.filteredItems.length > 0 && this.AllItemLists && this.AllItemLists.length > 0) {
      //assign into newBillingTransaactionitem so that we can use its functions and validations.
      this.filteredItems = this.filteredItems.map(a => {
        return Object.assign(new BillingTransactionItem(), a);
      });
      this.FilterDiscountApplicableItems();
      // this.AssignDoc
    }

    this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
      if (e.keyCode == this.ESCAPE_KEYCODE) {
        //this.onClose.emit({ CloseWindow: true, EventName: "close" });
        this.CloseGroupDiscountPopUp() 
      }
    });
    //console.log(this.filteredItems);


    //var items = this.filteredItems.map(a => Object.assign(new BillingTransactionItem, a));
    //this.filteredItems = items;

    //This component is used in OutPatient, InPatient and Insurance view detail page
    //Checking for insurance billing items
    //In case of OP & IP there is no insurance items therefore from the index[0] we can identify insurance Items or not.
    //this.IsInsurance = this.filteredItems[0].IsInsurance;
    
  }
  globalListenFunc: Function;
  ngOnDestroy() {
    // remove listener
    this.globalListenFunc();
  }


  //Find and Get the DiscountApplicable item disable textbox for DiscountApplcable=false
  FilterDiscountApplicableItems() {

    this.filteredItems.forEach(a => {
      var ItemDetails = this.AllItemLists.find(b => a.ItemId == b.ItemId && a.ItemName == b.ItemName);
      if (ItemDetails) {
        this.discountApplicable = ItemDetails.DiscountApplicable;
        if (!this.discountApplicable) {
          a.EnableControl("DiscountPercent", false);
        }
        if (ItemDetails.IsDoctorMandatory) {
          this.ShowAssignDocInPopup = true;
          a.IsDoctorMandatory = ItemDetails.IsDoctorMandatory;
        }
        if (a.ProviderId) {
          a.DocObj.EmployeeId = a.ProviderId;
          a.DocObj.FullName = a.ProviderName;
        }
      }
    });
  }

  CalculateTotal(index: number) {
    let item = this.filteredItems[index];
    if (item) {
      item.SubTotal = item.Quantity * item.Price;
      item.DiscountAmount = item.SubTotal * (item.DiscountPercent / 100);
      item.TotalAmount = item.SubTotal - item.DiscountAmount;
      item.TaxableAmount = item.IsTaxApplicable ? (item.SubTotal - item.DiscountAmount) : 0;
      item.NonTaxableAmount = item.IsTaxApplicable ? 0 : (item.SubTotal - item.DiscountAmount);
      item.IsSelected = true;
    }
  }

  OnChangeSelectAll() {
    this.filteredItems.forEach(item => {
      item.IsSelected = this.isAllItemsSelected;
    });
  }

  OnChangeItemSelect() {
    if ((this.filteredItems.every(a => a.IsSelected == true))) {
      this.isAllItemsSelected = true;
      // this.discountGroupItems.every(a => a.DiscountPercent == this.groupDiscountPercent);
    }
    else if (this.filteredItems.every(a => a.IsSelected == false)) {
      this.isAllItemsSelected = false;
      this.msgBoxServ.showMessage("Warning!", ["Please select Item to update."]);
    }
    else {
      this.isAllItemsSelected = false;
    }

  }

  CheckValidation(): boolean {
    let isFormValid = true;

    if (this.filteredItems) {
      for (var i = 0; i < this.filteredItems.length; i++) {
        let currTxnItem = this.filteredItems[i];
        currTxnItem.EnableControl("ItemName", false);
        currTxnItem.EnableControl("ServiceDepartmentId", false);
        currTxnItem.EnableControl("RequestedBy", false);
        if (this.filteredItems[i].IsDoctorMandatory) {
          //currTxnItem.EnableControl("ProviderId", true);
          currTxnItem.UpdateValidator('on', 'ProviderId', 'required');
        }
        else {
          currTxnItem.UpdateValidator('off', 'ProviderId', null);
        }
        if (this.filteredItems[i].IsZeroPriceAllowed) {
          currTxnItem.UpdateValidator('off', 'Price', null);
        }

        for (var valCtrls in currTxnItem.BillingTransactionItemValidator.controls) {
          currTxnItem.BillingTransactionItemValidator.controls[valCtrls].markAsDirty();
          currTxnItem.BillingTransactionItemValidator.controls[valCtrls].updateValueAndValidity();

        }

      }
      for (var i = 0; i < this.filteredItems.length; i++) {
        let currTxnItm_1 = this.filteredItems[i];
        //break loop if even a single txn item is invalid.
        if (!currTxnItm_1.IsValidCheck(undefined, undefined)) {
          isFormValid = false;
          break;
        }
      }
    }
    else {
      isFormValid = false;
    }
    return isFormValid;
  }

  UpdatePrice() {

    if (this.CheckValidation()) {
      if (!this.loading) {
        this.loading = true;
        let modifiedItems = this.filteredItems.filter(a => a.IsSelected);
        if (modifiedItems && modifiedItems.length > 0) {
          this.PutTransactionItems(modifiedItems);
        }
        else {
          this.msgBoxServ.showMessage("Warning!", ["Please  select Item to update."]);
          this.loading = false;
        }
      }
      else {
        this.loading = false;
      }
    }
  }

  PutTransactionItems(modifiedItems: Array<BillingTransactionItem>) {
    this.insuranceBLService.UpdateBillTxnItems(modifiedItems)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.msgBoxServ.showMessage("success", ["Item/s updated successfully"]);


          //sud:1May'20--Need to set modifiedbyid to currentloggedinempie..--
          //temporary solution for now, need to get the data from server and then use that same ID ..
          //itemstoupdate and discountgroupitems are same object-reference, so we change in one and it should reflect in another as well.
          if (modifiedItems && modifiedItems.length > 0) {
            modifiedItems.forEach(itm => {
              itm.ModifiedBy = this.securityService.loggedInUser.EmployeeId;
            });
          }

          // this.UpdateLocalListItems(modifiedItems);
          this.closeUpdatItemsPopUp.emit({ modifiedItems: modifiedItems });
          this.loading = false;
          //this.showGroupDiscountPopUp = false;

        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Some error issue in updating group discount. Please try again."]);
          this.loading = false;
        });
  }

  //UpdateLocalListItems(modifiedItems: Array<BillingTransactionItem>) {
  //    //this.patAllPendingItems = res.result;
  //    this.patAllPendingItems
  //        .forEach(patItem => {
  //            for (let filterDiscountItem of modifiedItems) {
  //                if (filterDiscountItem.BillingTransactionItemId == patItem.BillingTransactionItemId) {
  //                    patItem = Object.assign(patItem, filterDiscountItem);
  //                    modifiedItems.splice(modifiedItems.findIndex(a => a.BillingTransactionItemId == filterDiscountItem.BillingTransactionItemId), 1)
  //                    break;
  //                }
  //            }
  //        });
  //    this.patAllPendingItems = this.patAllPendingItems.slice();
  //    //this.CalculationForAll();
  //}

  CloseGroupDiscountPopUp() {
    this.closeUpdatItemsPopUp.emit();
    this.loading = false;
  }

  //load doctor  
  GetProviderList(): void {
    this.insuranceBLService.GetProviderList()
      .subscribe(res => this.CallBackGenerateDoctor(res));
  }

  ////this is a success callback of GenerateDoctorList function.
  CallBackGenerateDoctor(res) {
    if (res.Status == "OK") {
      this.providerList = [];
      if (res && res.Results) {
        //res.Results.forEach(a => {
        //  this.providerList.push(a);
        //});
        let doclist: Array<any> = res.Results;
        this.providerList = doclist.map(a => {
          return { EmployeeId: a.EmployeeId, FullName: a.EmployeeName }
        });
       // this.providerList.unshift({ EmployeeId: 0, FullName: "--Select--" });
      }
    }
    else {
      this.msgBoxServ.showMessage("error", ["Not able to get Doctor list"]);
      console.log(res.ErrorMessage)
    }
  }

  //used to format the display of item in ng-autocomplete.
  ProviderListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  DoctorChange(itm: BillingTransactionItem) {
    itm.ProviderId = itm.DocObj.EmployeeId;
    itm.ProviderName = itm.DocObj.FullName;
  }
}
