import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core'
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { BillingTransactionItem } from '../../shared/billing-transaction-item.model';
import { CommonFunctions } from '../../../shared/common.functions';
import { BillingBLService } from '../../shared/billing.bl.service';
import { MembershipType } from '../../../patients/shared/membership-type.model';
import { BillingService } from '../../shared/billing.service';
import { BillItemPriceVM } from '../../shared/billing-view-models';
import { CoreService } from '../../../core/shared/core.service';
import { Membership } from "../../../settings-new/shared/membership.model";
import { SecurityService } from '../../../security/shared/security.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: "group-discount",
  templateUrl: "./group-discount.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class GroupDiscountComponent {

  public isAllItemsSelected: boolean = false;  //yubraj: 28th Nov '18
  public groupDiscountPercent: number = 0;
  public showMessage: boolean = false;
  @Output("close-popup")
  closeGroupDiscountPopUp: EventEmitter<Object> = new EventEmitter<Object>();

  @Input("estimated-dis-percent")
  public estimatedDiscountPercent: number = 0;


  @Input("items-to-discount")
  public ipItemListToUpdate: Array<BillingTransactionItem> = [];

  public groupDiscountItems: Array<BillingTransactionItem> = [];
  public itemValidator: BillingTransactionItem = new BillingTransactionItem();

  @Input("admissionInfo")
  public admissionInfo: any = null;

  public allBillItmsList: Array<BillItemPriceVM> = null;
  public itemFocusJumpSequencesArray = [];

  public model:any = {
    "Subtotal": 0,
    "DiscountAmount": 0,
    "TotalAmount": 0
  }
  public loading: boolean = false; //To prevent double click on the save items button.. //Krishna ' 24th JAN'22

  constructor(public msgBoxServ: MessageboxService,
    public billingBLService: BillingBLService,
    public billingService: BillingService, public coreService: CoreService, public securityService: SecurityService) {

    this.LoadDiscountOptions();
    this.LoadMembershipSettings();
  }

  ngOnInit() {
    //assign allbillitemlist from billing service.. 
    this.allBillItmsList = this.billingService.allBillItemsPriceList;

    //need to individually map the objects to avoid Reference-Type issue
    //otherwise ipItemListToUpdate and groupDiscountItems will point to same object and will change below without saving..
    if (this.ipItemListToUpdate && this.ipItemListToUpdate.length > 0) {
      this.groupDiscountItems = this.ipItemListToUpdate.map(a => Object.assign({}, a));
      // this.groupDiscountItems.forEach(item => item.IsSelected = true);
    }

    if (this.enableDiscScheme) {
      //this.LoadAllMembershipTypes();
      this.DiscountSchemaId = this.admissionInfo.MembershipTypeId;//sundeep: 15Nov'19--We're sending Membershiptypeid in this object from server. check inside ipbilling controller-> reqType=pat-pending-items
      this.isMembershipInfoLoaded = true;
    }



    if (this.groupDiscountItems && this.groupDiscountItems.length > 0 && this.allBillItmsList && this.allBillItmsList.length > 0) {
      this.groupDiscountItems.forEach(itm => {
        itm.OldDiscountPercent = itm.DiscountPercent;//sud:6Sept'19--this will be needed in case of Un-Check items.


        let currItmPriceObj = this.allBillItmsList.find(a => a.ServiceDepartmentId == itm.ServiceDepartmentId && a.ItemId == itm.ItemId);
        if (currItmPriceObj) {
          itm.DiscountApplicable = currItmPriceObj.DiscountApplicable;
        }
      });
    }
    this.itemFocusJumpSequencesArray = []; //reset jump sequence array..
    for(let i = 0; i< this.groupDiscountItems.length; i++){
      if(this.groupDiscountItems[i].DiscountApplicable == true){
        this.itemFocusJumpSequencesArray.push(i);
      }
      this.groupDiscountItems[i].IsValidIPItemLevelDisocunt = true;
      //this.groupDiscountItems[i].BillingTransactionItemValidator = this.itemValidator.BillingTransactionItemValidator;
    }
    this.Calculations();
    this.FocusNextItemRow(-1);// index = -1 for first time loading.

  }


  //yubraj: 28th Nov '18
  OnChangeItemSelect(itm: BillingTransactionItem,showMessage:boolean) {
    /* let discPercent = this.discTypeToUse == "group" ? this.groupDiscountPercent : this.currMemDiscountPercent;

    itm.DiscountPercent = itm.IsSelected ? discPercent : itm.OldDiscountPercent;

    //below logic is copied from group-disc onchange.
    let itemDiscount = itm.SubTotal * (itm.DiscountPercent / 100);
    itm.TotalAmount = itm.SubTotal - itemDiscount;
    // let invoiceDiscount = itm.TotalAmount * (this.estimatedDiscountPercent / 100);
    // itm.TotalAmount = itm.TotalAmount - (invoiceDiscount ? invoiceDiscount : 0);
    // itm.DiscountAmount = itemDiscount + (invoiceDiscount ? invoiceDiscount : 0);

 */

    if ((this.groupDiscountItems.every(a => a.IsSelected == true))) {
      this.isAllItemsSelected = true;
    }
    else {
      this.isAllItemsSelected = false;
      //if all Items are deselected then show the warning message box.
      if (this.groupDiscountItems.every(a => a.IsSelected == false) && showMessage) {
        this.msgBoxServ.showMessage("Warning!", ["Please select at least one Item to give Group Discount."]);
      }
    }

  }


  CloseGroupDiscountPopUp() {
    this.groupDiscountItems = [];
    this.groupDiscountItems.forEach(item => item.IsSelected = true);
    this.groupDiscountItems.forEach(item => item.DiscountPercent == 0);
    this.closeGroupDiscountPopUp.emit();
  }
  //yubraj: 28th Nov '18
  OnChangeSelectAll() {
    //Isselcted status of all items will be same as that of Select All Checkbox.
    this.groupDiscountItems.forEach(item => {
      item.IsSelected = this.isAllItemsSelected;

    });

    if (!this.isAllItemsSelected) {
      this.msgBoxServ.showMessage("Warning!", ["Please select Item to give Group Discount."]);
    }
   this.GroupDiscountOnChange();
  }

  GroupDiscountOnChange() {
    this.groupDiscountPercent = this.groupDiscountPercent ? this.groupDiscountPercent : 0;
    if (this.groupDiscountPercent < 0 || this.groupDiscountPercent > 100) {
      this.showMessage = true;
      return;
    }
    this.showMessage = false;
    this.groupDiscountItems.forEach(item => {

      this.OnChangeItemSelect(item,false);

    });
  }


  //yubraj: 28th Nov '18
  SubmitGroupDiscount() {
    this.loading = true;
    let isValid = this.CheckForValidation();

    if (isValid) {
      //let itemsToUpdate = this.groupDiscountItems.filter(a => a.IsSelected);
      let itemsToUpdate = this.groupDiscountItems;

      this.billingBLService.UpdateBillTxnItems(itemsToUpdate)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.msgBoxServ.showMessage("success", ["Discount updated successfully"]);
            this.loading = false;
            //this.UpdateLocalListItems(itemsToUpdate);

            //sud:1May'20--Need to set modifiedbyid to currentloggedinemployee..--
            //temporary solution for now, need to get the data from server and then use that same ID ..
            if (itemsToUpdate && itemsToUpdate.length > 0) {
              itemsToUpdate.forEach(itm => {
                //we have to update in source object.. otherwise it won't be updated.. so.. 
                let srcObject = this.groupDiscountItems.find(a => a.BillingTransactionItemId == itm.BillingTransactionItemId);
                if (srcObject) {
                  srcObject.ModifiedBy = this.securityService.loggedInUser.EmployeeId;
                }
              });
            }
            //this.groupDiscountItems.forEach(item=>item.IsSelected = false);
            this.closeGroupDiscountPopUp.emit(this.groupDiscountItems);
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", ["Some error issue in updating group discount. Please try again."]);
            this.loading = false;
          });

    }


  }


  CheckForValidation(): boolean {
    let retVal = false;
    // if (this.groupDiscountItems.filter(a => a.IsSelected).length == 0) {
    //   retVal = false;
    //   this.msgBoxServ.showMessage("Warning!", ["Please  select at least one item for discount."]);
    //   return retVal;
    // }

    if (this.discTypeToUse == "group") {
      if (this.groupDiscountPercent != null && this.groupDiscountPercent != undefined
        && this.groupDiscountPercent >= 0 && this.groupDiscountPercent <= 100) {
        retVal = true;
      }
      else {
        retVal = false;
        this.msgBoxServ.showMessage("Warning!", ["Group Discount Percent is not valid."]);
      }

    }
    else if (this.discTypeToUse == "scheme") {
      if (this.DiscountPercentSchemeValid) {
        retVal = true;
      }
      else {
        retVal = false;
        this.msgBoxServ.showMessage("Warning!", ["Selected Discount Scheme is not valid."]);
      }

    }

    let itemsHavingInvalidDiscount = this.groupDiscountItems.filter(a => a.DiscountPercent < 0 || a.DiscountPercent > 100);
    if(itemsHavingInvalidDiscount.length > 0){
      retVal = false;
      this.msgBoxServ.showMessage('warning',["Some Items have invalid discounts."]);
    }


    return retVal;
  }



  //start: sud:4Sept'19--For DiscountScheme

  public enableDiscScheme: boolean = false;//this will come from parameter.
  public enableGroupDiscount: boolean = false;//this will come from parameter.

  public DiscountScheme: any = null;// { MembershipTypeName: "", MembershipTypeId: null };
  public MembershipTypeList: Array<MembershipType> = new Array<MembershipType>();
  public DiscountPercentSchemeValid: boolean = true;
  public currMemDiscountPercent: number = 0;
  public DiscountSchemaId: number = null;
  public discTypeToUse: string = "scheme";//it has two options: group, scheme -- set scheme for LPH, need to manage this somehow.


  LoadDiscountOptions() {
    let param = this.coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "IpBillingGroupDiscountOptions");
    if (param) {
      let paramValue = param.ParameterValue;
      if (paramValue) {
        let paramJson = JSON.parse(paramValue);

        this.enableGroupDiscount = paramJson.EnableGroupDiscount;
        this.enableDiscScheme = paramJson.EnableDiscountScheme;

        let defaultDiscType = paramJson.Default;

        //set default discount type.
        //discount type will be scheme only when discScheme is enabled and groupDiscount is disabled.
        //it'll be 'group' in all other cases. i.e: if both are enabled then by default 'group' will be selected.
        if (defaultDiscType == "scheme") {
          this.discTypeToUse = "scheme";
        }
        else {
          this.discTypeToUse = "group";
        }

        if (!this.enableDiscScheme && !this.enableGroupDiscount) {
          this.msgBoxServ.showMessage("notice", ["For Discount Enable IpBillingGroupDiscountOptions from CoreCFG Setting!!"]);
        }

      }
    }

  }


  public isMembershipInfoLoaded: boolean = false;
  public membershipSchemeParam = { ShowCommunity: false, IsMandatory: true };//this is default value, it'll be re-set by parameter value later on.

  SetDiscountPercentToItemsOnSchemeChange(schemeDiscPercent: number) {
    if (this.groupDiscountItems && this.groupDiscountItems.length > 0) {
      this.groupDiscountItems.forEach(itm => {
        if (itm.IsSelected && itm.DiscountApplicable) {
          itm.DiscountPercent = schemeDiscPercent;
        }
        else {
          itm.DiscountPercent = itm.OldDiscountPercent;
        }


        //below logic is copied from group-disc onchange.
        let itemDiscount = itm.SubTotal * (itm.DiscountPercent / 100);
        itm.TotalAmount = itm.SubTotal - itemDiscount;
        let invoiceDiscount = itm.TotalAmount * (this.estimatedDiscountPercent / 100);
        itm.TotalAmount = itm.TotalAmount - (invoiceDiscount ? invoiceDiscount : 0);
        itm.DiscountAmount = itemDiscount + (invoiceDiscount ? invoiceDiscount : 0);

      });
    }
  }



  OnDiscTypeChanged() {
    console.log(this.discTypeToUse);
  }

  //end: sud:4Sept'19--For DiscountScheme

  //start: sundeep:14Nov'19--for membership/community scheme
  public isgroupDiscountPercentLoaded: boolean = false;
  public LoadMembershipSettings() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "MembershipSchemeSettings");
    if (currParam && currParam.ParameterValue) {
      this.membershipSchemeParam = JSON.parse(currParam.ParameterValue);
    }
  }

  OnDiscountSchemeChange($event: Membership) {
    if ($event) {
      this.DiscountPercentSchemeValid = true;
      this.currMemDiscountPercent = $event.DiscountPercent;
      this.DiscountSchemaId = $event.MembershipTypeId;
      this.SetDiscountPercentToItemsOnSchemeChange(this.currMemDiscountPercent);
    }
    else {
      this.DiscountPercentSchemeValid = false;
      this.DiscountSchemaId = null;
    }

    this.groupDiscountItems.forEach(a => {
      a.DiscountSchemeId = this.DiscountSchemaId;
    });

  }
  //end: sundeep:14Nov'19--for membership/community scheme
  public hotkeys(event) {
    if (event.keyCode == 27) {//key->ESC
      this.CloseGroupDiscountPopUp();
    }
  }

  public DiscountPercentChanged(index:number){

    let currentItem = this.groupDiscountItems[index];

    //if disocunt %  is zero or empty then just remove the selection. 
    if (currentItem.DiscountPercent == null) {
      currentItem.IsSelected = false; 
    }
    else if (currentItem.DiscountPercent < 0 || currentItem.DiscountPercent > 100) {
      currentItem.IsSelected = false;
      currentItem.IsValidIPItemLevelDisocunt = false;
    }
    else {
      currentItem.IsSelected = true;
      currentItem.IsValidIPItemLevelDisocunt = true;
    }

    this.RecalculateAmounts();
  }

  public FocusNextItemRow(index:number){
    if (index == -1) {
      //currIndex is minus(1) for First Load, this time, go directly to 0th index
      let itemIndex = this.itemFocusJumpSequencesArray[0];
      this.coreService.FocusInputById('id_discPercent_' + itemIndex, 300);
     
    }
    else {
      //first find the array index of current item's index. then find out itemIndex.
      let arrayIndex = this.itemFocusJumpSequencesArray.indexOf(index) + 1;
      
      //continue finding next item's index using and jump. Else jump to Remarks textbox.
      if (this.itemFocusJumpSequencesArray.length > arrayIndex) {
        let nextItemIndex = this.itemFocusJumpSequencesArray[arrayIndex];
        this.coreService.FocusInputById('id_discPercent_' + nextItemIndex);
      }
      else {
        this.coreService.FocusInputById("id_saveItems");
      }
    }
    //this.RecalculateAmounts();

  }

  public RecalculateAmounts(){
    this.groupDiscountItems.forEach(itm => {

      let itemDiscount = itm.SubTotal * (itm.DiscountPercent / 100);
      itm.TotalAmount = itm.SubTotal - itemDiscount;
      itm.DiscountAmount = itemDiscount;
      //this.model.DiscountAmount += itm.DiscountAmount;

    });
    this.model.DiscountAmount = 0;
    this.model.TotalAmount = 0;
    this.groupDiscountItems.forEach(a =>{
      this.model.DiscountAmount += a.DiscountAmount;
      this.model.TotalAmount += a.TotalAmount;
    })
    
  }
  public Calculations(){
    this.groupDiscountItems.forEach(a => {
      this.model.Subtotal += a.SubTotal;
      this.model.DiscountAmount += a.DiscountAmount;
      this.model.TotalAmount += a.TotalAmount;
    })
  }
}
