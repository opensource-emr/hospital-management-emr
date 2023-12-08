import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from '../../security/shared/security.service';
import { PriceCategory } from '../../settings-new/shared/price.category.model';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { CommonFunctions } from '../../shared/common.functions';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { IncentiveBLService } from '../shared/incentive.bl.service';
import { INCTVGridColumnSettings } from '../shared/inctv-grid-column-settings';
import { ProfileItemMapModel } from '../shared/profile-item-map.model';
import { ProfileModel } from '../shared/profile.model';

@Component({
  selector: 'profile-item-map',
  templateUrl: './profile-item-mapping.component.html'
})
export class ProfileItemMapComponent {
  public currentProfileItems: Array<ProfileItemMapModel> = new Array<ProfileItemMapModel>();
  public currentProfile: ProfileModel = new ProfileModel();
  public PreviousProfileBillItems: Array<ProfileItemMapModel> = [];
  public uniqueDeptNames = [];
  public selServiceDepartment: string = '';
  public strSearchItem: string = '';
  //public showAddPage: boolean = false;
  public showEditFields: boolean = false;
  public isDataAvailable: boolean = false;
  public loading: boolean = false;
  //public selectAll: boolean = false;

  public ProfileObj: any = null;
  public ProfileItemSetup: ProfileItemsVM = new ProfileItemsVM();
  public FilteredItemList: any = [];
  public update: boolean = false;
  public newProfile: boolean = true;
  public IsPercentageValid: boolean = true;
  public ShowEditItem = false;
  public updateSelectedItem: ProfileItemMapModel = new ProfileItemMapModel();
  public ProfileBillItemGridColumns: Array<any> = [];
  // public allBillItems: any = [];

  @Input('profileId')
  public selectedProfileId: number = null;
  @Input('profileList')
  public profileList: any = null;
  @Input('categoryList')
  public PricecategoryList: any = null;
  @Input('all-BillitmList')
  public allBillItems: any = [];
  // public set allBillItemList(_allBillItems) {
  //   if (_allBillItems) {
  //     _allBillItems.forEach(element => {
  //       element["Price_Unit"] = this.coreService.currencyUnit + element.Price;
  //     });
  //     this.allBillItems = _allBillItems;
  //   }
  // }

  //@Input('showAddPage')
  //public set value(val: boolean) {
  //  if (val) {
  //    this.showAddPage = val;
  //    this.getProfileItemsDetails();
  //  }
  //}
  @Output('callback-add')
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public SelectedItem: ProfileItemsVM = new ProfileItemsVM();

  public PriceCategories = new Array<PriceCategory>();
  public SelectedPriceCategoryId: number = null;
  constructor(
    public incBLservice: IncentiveBLService,
    public msgBoxServ: MessageboxService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService) {
    const allPriceCategories = this.coreService.Masters.PriceCategories;
    if (allPriceCategories && allPriceCategories.length > 0) {
      this.PriceCategories = allPriceCategories.filter(p => p.IsActive);
    }

    this.GetIncentiveOpdIpdSettings();
    // this.ProfileBillItemGridColumns = GridColumnSettings.ProfileBillItemGridColumns;
  }

  ngOnInit() {
    if (this.selectedProfileId && this.selectedProfileId != 0) {
      this.update = true;
      this.newProfile = false;
      this.getProfileItemsDetails();
      // this.GetDeptsForSearchDDL(this.allBillItems);
      // this.FilteredItemList = this.allBillItems;
    }
    else {
      this.update = false;
      this.newProfile = true;
    }
  }

  public OpdIpdSettings: any = null;
  public GetIncentiveOpdIpdSettings() {
    let IncentiveOpdIpdSettings = this.coreService.Parameters.find(
      a => a.ParameterGroupName == "Incentive" && a.ParameterName == "IncentiveOpdIpdSettings"
    );
    if (IncentiveOpdIpdSettings) {
      this.OpdIpdSettings = JSON.parse(IncentiveOpdIpdSettings.ParameterValue);
      if (this.OpdIpdSettings.EnableOpdIpd) {
        this.ProfileItemSetup.OpdSelected = this.OpdIpdSettings.OpdSelected;
        this.ProfileItemSetup.IpdSelected = this.OpdIpdSettings.IpdSelected;
        this.ProfileBillItemGridColumns = INCTVGridColumnSettings.ProfileBillItemGridColumnsWithOpdIpdSettingEnabled;
      }
      else {
        this.ProfileItemSetup.OpdSelected = true;
        this.ProfileItemSetup.IpdSelected = true;
        this.ProfileBillItemGridColumns = INCTVGridColumnSettings.ProfileBillItemGridColumns;
      }
    }
  }

  // not using this method
  // getItemList() {
  //   this.incBLservice.getItemsforProfile().subscribe(res => {
  //     if (res.Status == 'OK') {
  //     }
  //     else {
  //       this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
  //       console.log(res.ErrorMessage);
  //     }
  //   });
  // }

  getProfileItemsDetails() {
    try {
      this.incBLservice.GetProfileItemsMapping(this.selectedProfileId).subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.currentProfile = new ProfileModel();
          let profile = res.Results;
          if (profile) {
            this.currentProfile.ProfileId = profile.ProfileId;
            this.currentProfile.ProfileName = profile.ProfileName;
            this.currentProfile.PriceCategoryId = profile.PriceCategoryId;
            this.currentProfile.PriceCategoryName = profile.PriceCategoryName;

            this.PreviousProfileBillItems = res.Results.MappedItems;
            this.GetServiceItemsByPriceCategoryId(this.currentProfile.PriceCategoryId);
            // this.PreviousProfileBillItems.forEach(a => {
            //   var itemObj = this.allBillItems.find(itm => itm.ServiceItemId == a.ServiceItemId);
            //   if (itemObj && itemObj.ServiceItemId) {
            //     a.ItemName = itemObj.ItemName;
            //     a.DepartmentName = itemObj.ServiceDepartmentName;
            //   }
            // });
            //let itmList = res.Results.itemsDetails;
            //itmList.forEach(el => {
            //  let itm = new ProfileItemMapModel();
            //  itm.BillItemPriceId = el.BillItemPriceId;
            //  itm.ItemName = el.ItemName;
            //  itm.DepartmentName = el.ServiceDepartmentName;
            //  itm.PriceCategoryId = profile.PriceCategoryId;
            //  itm.ProfileId = profile.ProfileId;
            //  itm.DocObj = el.Doctor ? el.Doctor : {};
            //  itm.IsPercentageValid = true;//by default this will be true.

            //  this.currentProfileItems.push(itm);
            //});

            //profile.MappedItems.forEach(el => {
            //  let index = this.currentProfileItems.findIndex(a => a.BillItemPriceId == el.BillItemPriceId);
            //  if (index > -1) {
            //    this.currentProfileItems[index].BillItemProfileMapId = el.BillItemProfileMapId;
            //    this.currentProfileItems[index].AssignedToPercent = el.AssignedToPercent;
            //    this.currentProfileItems[index].ReferredByPercent = el.ReferredByPercent;
            //  }
            //});

            //this.currentProfileItems.sort((t1) => {
            //  if (t1.AssignedToPercent == null) { return 1; }
            //  if (t1.AssignedToPercent != null) { return -1; }
            //  return 0;
            //});

            //this.filteredItemList = this.currentProfileItems;
            //this.GetDeptsForSearchDDL(this.allBillItems);
          }
          this.isDataAvailable = true;
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
    } catch (error) {

    }

  }



  //SaveProfileItems() {
  //  try {

  //    //get all selected rows first then go for further processing.
  //    let rowsToUpdate = this.currentProfileItems.filter(a => a.IsSelected);
  //    rowsToUpdate.forEach(a => {
  //      a.AssignedToPercent = a.AssignedToPercent ? a.AssignedToPercent : 0;
  //      a.ReferredByPercent = a.ReferredByPercent ? a.ReferredByPercent : 0;
  //    });

  //    if (rowsToUpdate && rowsToUpdate.length > 0) {
  //      if (rowsToUpdate.every(a => a.IsPercentageValid)) {
  //        this.loading = true;
  //        this.incBLservice.SaveProfileItemMap(rowsToUpdate).subscribe(
  //          res => {
  //            this.CallBackAddProfileItems(res);
  //            this.currentProfile = new ProfileModel();
  //          },
  //          err => {
  //            this.msgBoxServ.showMessage('error', [err.ErrorMessage]);
  //            console.log(err.ErrorMessage);
  //          });

  //      }
  //      else {
  //        this.msgBoxServ.showMessage("failed", ["Percentages of some items are invalid"]);
  //      }

  //    }
  //    else {
  //      this.msgBoxServ.showMessage("failed", ["Please select/check at least one item to update."]);
  //    }

  //  } catch (error) {
  //    this.loading = false;
  //  }
  //}

  Close() {
    //this.showAddPage = false;
    this.showEditFields = false;
    this.callbackAdd.emit();
  }
  CloseShowEditItemPopup() {
    this.ShowEditItem = false;
    this.callbackAdd.emit();
  }

  CallBackAddProfileItems(res) {
    this.loading = false;
    if (res.Status == 'OK') {
      this.callbackAdd.emit();
      this.msgBoxServ.showMessage('success', ['Profile Items Mapping saved.']);
    }
    else {
      this.msgBoxServ.showMessage('error', [res.ErrorMessage]);
      console.log(res.ErrorMessage);
    }
  }

  //checkBoxClicked(event) {
  //  this.showEditFields = this.currentProfileItems.some(a => a.IsSelected) ? true : false;
  //  this.selectAll = this.PreviousProfileBillItems.some(a => a.IsSelected == false) ? false : true;
  //}


  SearchItemsListFormatter(data: any): string {
    const html = data['ItemName'];
    return html;
  }

  //selectAllClicked() {
  //  this.PreviousProfileBillItems.forEach(el => {
  //    el.IsSelected = this.selectAll;
  //  });
  //  this.showEditFields = this.currentProfileItems.some(a => a.IsSelected) ? true : false;
  //}

  GetDeptsForSearchDDL(itemList: Array<any>) {
    const allDepts = itemList.map(el => {
      return el.ServiceDepartmentName;
    });

    var uniqueItms = CommonFunctions.GetUniqueItemsFromArray(allDepts);

    this.uniqueDeptNames = uniqueItms.map(el => {
      return { ServiceDepartmentName: el }
    });
  }


  // common method serve filter purpose for both item search and department dropdown
  //filterList() {
  //  this.PreviousProfileBillItems = this.currentProfileItems.filter(itm =>
  //    (this.selServiceDepartment != '' ? itm.DepartmentName == this.selServiceDepartment : true)
  //    && (this.strSearchitem.length > 1 ? itm.ItemName.toUpperCase().includes(this.strSearchitem.toUpperCase()) : true)
  //  );
  //  this.selectAll = this.PreviousProfileBillItems.some(a => a.IsSelected == false) ? false : true;
  //}

  //public RefererrPercentChange(currMap: ProfileItemMapModel) {
  //  this.CheckIfItemPercentValid(currMap);


  //}

  //public AssignPercentChange(currMap: ProfileItemMapModel) {
  //  this.CheckIfItemPercentValid(currMap);
  //}


  CheckIfItemPercentValid(currItem) {
    let prescriberPercent = currItem.PrescriberPercent ? currItem.PrescriberPercent : 0;
    let performerPercent = currItem.PerformerPercent ? currItem.PerformerPercent : 0;
    let referrerPercent = currItem.ReferrerPercent ? currItem.ReferrerPercent : 0;

    if (performerPercent < 0 || prescriberPercent < 0 || referrerPercent < 0 || (prescriberPercent + performerPercent + referrerPercent) > 100) {
      this.IsPercentageValid = false;
    }
    else {
      this.IsPercentageValid = true;
    }
  }

  ServiceDeptListFormatter(data: any): string {
    const html = data['ServiceDepartmentName'];
    return html;
  }

  profileListFormatter(data: any): string {
    const html = data['ProfileName'];
    return html;
  }

  ItemsListFormatter(data: any): string {
    if (data["Doctor"]) {
      let html: string = data["ServiceDepartmentName"] + "-" + "<font color='blue'; size=03 >" + data["ItemName"] + "</font>"
        + "(" + data["Doctor"].DoctorName + ")" + "&nbsp;&nbsp;" + "<b>" + data["Price"] + "</b >";
      return html;
    }
    else {
      let html: string = data["ServiceDepartmentName"] + "-" + "<font color='blue'; size=03 >" + data["ItemName"] + "</font>"
        + "&nbsp;&nbsp;" + "&nbsp;&nbsp;" + "<b>" + data["Price"] + "</b >";
      return html;
    }
  }

  public OnChangeProfile() {
    if (typeof (this.ProfileObj) == 'string') {
      this.currentProfile.ProfileName = this.ProfileObj;
    }
    else if (typeof (this.ProfileObj) == 'object') {
      this.msgBoxServ.showMessage('Warning', ['Profie Name already exist!']);
      this.ProfileObj = null;
    }
  }

  public SaveProfile() {
    if (this.currentProfile && this.currentProfile.ProfileName) {
      this.currentProfile.PriceCategoryId = this.SelectedPriceCategoryId;
      // this.currentProfile.PriceCategoryName = priceCAt.PriceCategoryName;
      this.currentProfile.AttachedProfileId = 0
      this.currentProfile.TDSPercentage = 0
      this.currentProfile.IsActive = true;
      this.currentProfile.CreatedBy = this.securityService.loggedInUser.EmployeeId;//change this and assign from server side..
      this.currentProfile.CreatedOn = moment().format('YYYY-MM-DD');
      this.incBLservice.AddProfile(this.currentProfile).subscribe(
        res => {
          if (res.Status == 'OK') {
            this.currentProfile = new ProfileModel();
            this.currentProfile = res.Results;
            this.msgBoxServ.showMessage('success', ['Profile Added.']);
            this.ProfileObj = null;
            this.update = true;
            this.newProfile = false;

            this.selectedProfileId = this.currentProfile.ProfileId;
            this.getProfileItemsDetails();
          }
          else {
            this.msgBoxServ.showMessage('error', ['Something Wrong' + res.ErrorMessage]);
          }
        },
        err => {
          this.msgBoxServ.showMessage('error', ['Something Wrong' + err.ErrorMessage]);
        });
    }
  }

  public OnDepartmentChange() {

    let srvDeptObj = null;
    // check if user has given proper input string for department name
    //or has selected object properly from the dropdown list.
    if (typeof (this.ProfileItemSetup.SelServDepartment) == 'string') {
      if (this.uniqueDeptNames.length && this.ProfileItemSetup.SelServDepartment)
        srvDeptObj = this.uniqueDeptNames.find(a => a.ServiceDepartmentName.toLowerCase() == this.ProfileItemSetup.SelServDepartment.toLowerCase());
    }
    else if (typeof (this.ProfileItemSetup.SelServDepartment) == 'object') {
      srvDeptObj = this.ProfileItemSetup.SelServDepartment;
    }

    //if selection of department from string or selecting object from the list is true
    //then assign proper department name
    if (srvDeptObj && srvDeptObj.ServiceDepartmentName) {
      this.FilteredItemList = this.FilteredItemList.filter(a => a.ServiceDepartmentName == srvDeptObj.ServiceDepartmentName)
    }
    else {
      this.FilteredItemList = this.FilteredItemList;
    }
  }

  public AssignSelectedItem() {
    //this.ItemsSetup -> This object is binded with dropdown, so taking all property from this.
    this.ProfileItemSetup = Object.assign(this.ProfileItemSetup, this.SelectedItem);
    if (this.ProfileItemSetup.ItemName && this.ProfileItemSetup.ItemName != '') {
      if (this.PreviousProfileBillItems.find(a => a.ItemName == this.ProfileItemSetup.ItemName)) {
        this.msgBoxServ.showMessage('Warning', [this.ProfileItemSetup.ItemName + ' is already added, Please edit the percentage from below list.']);
        this.SetFocusOn_SearchBox("srch_itemName");
        this.ProfileItemSetup.SelServDepartment = null;
        this.ProfileItemSetup.Price = 0;
        this.ProfileItemSetup.ItemName = null;
      }
      else {
        this.ProfileItemSetup.SelServDepartment = this.ProfileItemSetup.ServiceDepartmentName;
        this.ProfileItemSetup.Price = this.ProfileItemSetup.Price ? this.ProfileItemSetup.Price : 0;
      }

    }
    else {
      this.ProfileItemSetup.Price = 0;
      this.ProfileItemSetup.SelServDepartment = null;
    }
    this.OnDepartmentChange();
  }

  private SetFocusOn_SearchBox(idToSelect: string) {
    window.setTimeout(function () {
      let searchBoxObj = document.getElementById(idToSelect);
      if (searchBoxObj) {
        searchBoxObj.focus();
      }
    }, 600);
  }
  GoToNextInput(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
      nextEl.select();
    }
  }

  public DiscardItem() {
    this.ProfileItemSetup = new ProfileItemsVM();
    this.SelectedItem = new ProfileItemsVM();
    this.OnDepartmentChange();
  }

  public SaveIncentiveItem() {
    if (this.ProfileItemSetup && this.ProfileItemSetup.ItemName) {
      this.currentProfileItems = [];
      var profileBillItemsObj = new ProfileItemMapModel();
      profileBillItemsObj.PriceCategoryId = this.currentProfile.PriceCategoryId;// this.currentEmployeeIncentiveInfo.PriceCategoryId;
      profileBillItemsObj.ProfileId = this.currentProfile.ProfileId;
      profileBillItemsObj.PerformerPercent = this.ProfileItemSetup.PerformerPercent ? this.ProfileItemSetup.PerformerPercent : 0;
      profileBillItemsObj.PrescriberPercent = this.ProfileItemSetup.PrescriberPercent ? this.ProfileItemSetup.PrescriberPercent : 0;
      profileBillItemsObj.ReferrerPercent = this.ProfileItemSetup.ReferrerPercent ? this.ProfileItemSetup.ReferrerPercent : 0;
      profileBillItemsObj.ServiceItemId = this.ProfileItemSetup.ServiceItemId;
      // let ServiceItem = this.allBillItems.find(f => f.ServiceItemId == this.ProfileItemSetup.ServiceItemId);
      // profileBillItemsObj.ServiceItemId = ServiceItem.ServiceItemId;
      profileBillItemsObj.ItemName = this.ProfileItemSetup.ItemName;
      profileBillItemsObj.DepartmentName = this.ProfileItemSetup.SelServDepartment;

      if (this.ProfileItemSetup.OpdSelected && this.ProfileItemSetup.IpdSelected) {
        profileBillItemsObj.BillingTypesApplicable = 'both';
      }
      else if (this.ProfileItemSetup.OpdSelected) {
        profileBillItemsObj.BillingTypesApplicable = 'outpatient';
      }
      else if (this.ProfileItemSetup.IpdSelected) {
        profileBillItemsObj.BillingTypesApplicable = 'inpatient';
      }
      else {
        //EmployeeBillItemsObj.BillingTypesApplicable = 'both';
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ['Select Ipd/Opd to proceed']);
        return;
      }
      this.currentProfileItems.push(profileBillItemsObj);


      this.incBLservice.SaveProfileItemMap(this.currentProfileItems)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.selectedProfileId = this.currentProfile.ProfileId;
            this.getProfileItemsDetails();
            this.ProfileItemSetup = new ProfileItemsVM();
            this.SelectedItem = new ProfileItemsVM();
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Profile BillItems Map is successfully saved!!']);
            this.OnDepartmentChange();//this is needed to refresh the items list.
            this.SetFocusOn_SearchBox("srch_itemName");
          }
          else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
            console.log(res.ErrorMessage);
          }
        });
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Select Item and add Assign and referer percentage.']);
    }
  }

  ProfileBillItemGridActions($event) {
    switch ($event.Action) {
      case 'edititem': {
        this.updateSelectedItem = $event.Data;
        if (this.updateSelectedItem.BillingTypesApplicable === 'outpatient') {
          this.updateSelectedItem.IpdSelected = false;
          this.updateSelectedItem.OpdSelected = true;
        }
        else if (this.updateSelectedItem.BillingTypesApplicable === 'inpatient') {
          this.updateSelectedItem.IpdSelected = true;
          this.updateSelectedItem.OpdSelected = false;
        }
        else {
          this.updateSelectedItem.IpdSelected = true;
          this.updateSelectedItem.OpdSelected = true;
        }

        this.ShowEditItem = true;
        break;
      }
      case 'removeitem': {
        this.updateSelectedItem = $event.Data;
        let proceed: boolean = true;
        proceed = window.confirm(this.currentProfile.ProfileName + " will not get Incentive from" + this.updateSelectedItem.ItemName + ". Do you want to continue ?")
        if (proceed) {
          this.RemoveSelectedBillItem();
        }

        break;
      }
      default:
        break;
    }
  }

  public RemoveSelectedBillItem() {
    if (this.updateSelectedItem && this.updateSelectedItem.BillItemProfileMapId) {
      this.incBLservice.RemoveSelectedBillItemFromProfileMap(this.updateSelectedItem)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.getProfileItemsDetails();
            this.msgBoxServ.showMessage('Success', ['Bill Item successfully Removed!!']);
          }
          else {
            this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
            console.log(res.ErrorMessage);
          }
        });
    }
  }

  UpdateBillItems() {

    if (this.updateSelectedItem && this.updateSelectedItem.BillItemProfileMapId) {
      if (this.updateSelectedItem.OpdSelected && this.updateSelectedItem.IpdSelected) {
        this.updateSelectedItem.BillingTypesApplicable = 'both';
      }
      else if (this.updateSelectedItem.OpdSelected) {
        this.updateSelectedItem.BillingTypesApplicable = 'outpatient';
      }
      else if (this.updateSelectedItem.IpdSelected) {
        this.updateSelectedItem.BillingTypesApplicable = 'inpatient';
      }

      this.incBLservice.UpdateProfileBillItemMap(this.updateSelectedItem)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.getProfileItemsDetails();
            this.msgBoxServ.showMessage('Success', ['Bill Item successfully update!!']);
            this.ShowEditItem = false;
          }
          else {
            this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
            console.log(res.ErrorMessage);
          }
        });
    }
  }

  OnPriceCategoryChanged($event): void {
    if ($event) {
      const priceCategoryId = +$event.target.value;
      this.SelectedPriceCategoryId = priceCategoryId;
      this.GetServiceItemsByPriceCategoryId(priceCategoryId);
    }
  }
  GetServiceItemsByPriceCategoryId(priceCategoryId: number): void {
    this.incBLservice.GetItemsForIncentive(priceCategoryId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.DiscardItem();
          const serviceItems = res.Results;
          this.GetDeptsForSearchDDL(serviceItems);
          this.FilteredItemList = serviceItems;
        }
        else {
          this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
  }
}


class ProfileItemsVM {
  public SelServDepartment: any = null;
  public ItemName: string = "";
  public Price: number = null;
  // public AssignedToPercent: number = 0;
  // public ReferredByPercent: number = 0;
  public PerformerPercent: number = 0; // Krishna, 27th,jun'22, AssignedToPercent changed to PerformerPercent
  public PrescriberPercent: number = 0;// Krishna, 27th,jun'22, ReferredByPercent changed to PrescriberPercent
  public ReferrerPercent: number = 0;// Krishna, 27th,jun'22, Added new ReferrerPercent
  public OpdSelected: boolean = true;
  public IpdSelected: boolean = true;
  public ServiceDepartmentName: string = "";
  public ServiceItemId: number = null;
}
