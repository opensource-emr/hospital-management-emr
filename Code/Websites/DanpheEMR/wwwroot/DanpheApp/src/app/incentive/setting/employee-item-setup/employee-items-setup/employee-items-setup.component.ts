import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { cloneDeep } from 'lodash';
import * as moment from 'moment/moment';
import { CoreService } from '../../../../core/shared/core.service';
import { SecurityService } from '../../../../security/shared/security.service';
import { PriceCategory } from '../../../../settings-new/shared/price.category.model';
import { DanpheHTTPResponse } from '../../../../shared/common-models';
import { CommonFunctions } from '../../../../shared/common.functions';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../../shared/shared-enums';
import { EmployeeBillItemsMapModel } from '../../../shared/employee-billItems-map.model';
import { EmployeeIncentiveInfoModel } from '../../../shared/employee-incentiveInfo.model';
import { IncentiveBLService } from '../../../shared/incentive.bl.service';
import { INCTVGridColumnSettings } from '../../../shared/inctv-grid-column-settings';
import { ItemGroupDistributionModel } from '../../../shared/item-group-distribution.model';
import { ProfileModel } from '../../../shared/profile.model';

@Component({
  selector: 'employee-item-setup',
  templateUrl: './employee-items-setup.component.html'
})
export class EmployeeItemsSetupComponent {

  //sud:6-Oct'20-- we'll implement this later after requirement clarity for PriceCategory.
  //for now Normal will be our default pricecategory.
  // public defPriceCate_HardCoded = { PriceCategoryId: 1, PriceCategoryName: "Normal" }

  public currentItemList: any = [];
  public FilteredItemList: any = [];
  public currentEmployeeIncentiveInfo: EmployeeIncentiveInfoModel = new EmployeeIncentiveInfoModel();
  public EmployeePreviousBillItems: Array<EmployeeBillItemsMapModel> = [];

  public ItemsSetup: EmployeeIncentiveSetupVM = new EmployeeIncentiveSetupVM();
  public categoryList = [];
  public uniqueDeptNames = [];

  public update: boolean = false;
  public ShowItemGroupDistribution = false;
  public ShowEditItem = false;
  public ItemGroupDistribution: Array<ItemGroupDistributionModel> = [];
  public updateSelectedItem: EmployeeBillItemsMapModel = new EmployeeBillItemsMapModel();

  public showProfleDD: boolean = false;
  public showPreview: boolean = false;
  public selProfileForAttach: any;
  public selectedRadioButton: any;
  public selectedProfile: any;
  public searchText: string = null;
  public showProfileTable: boolean = true;

  @Input('all-profileList')
  public profileList: Array<ProfileModel> = new Array<ProfileModel>();

  @Input('all-employeeList')
  public allDoctorList: any = [];

  @Input("existing-emp-list")
  public existingEmpList = [];

  public filteredEmpList = [];//we need to remove existing from alldoctorlist and use that as the source for Employee DDL.

  @Input('all-BillitmList')
  public allBillItems: any = [];

  @Input('EmployeeId')
  CurrentEmployeeId: number = null

  @Output("incentive-info-change")
  incentiveInfoSetupChange: EventEmitter<object> = new EventEmitter<object>();

  public EmployeeItemGridColumns: Array<any> = [];
  public ProfilePreviewGridColumns: Array<any> = [];
  public DocObj: any = null;
  public IsPercentageValid: boolean = true;
  public ServiceItemId: number = null;
  public PriceCategories = new Array<PriceCategory>();
  public SelectedPriceCategoryId: number = null;
  public NewEmployeeIncentiveInfo: boolean = true;

  constructor(public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public incentiveBLService: IncentiveBLService,
    public securityService: SecurityService,
    public coreService: CoreService) {
    const allPriceCategories = this.coreService.Masters.PriceCategories;
    if (allPriceCategories && allPriceCategories.length > 0) {
      this.PriceCategories = allPriceCategories.filter(p => p.IsActive);
    }

    //this.EmployeeItemGridColumns = INCTVGridColumnSettings.EmployeeItemList;
    this.ProfilePreviewGridColumns = INCTVGridColumnSettings.ProfilePreviewList;
    this.GetIncentiveOpdIpdSettings();
    this.GetCategoryList();
  }

  ngOnInit() {
    this.ItemsListFormatter = this.ItemsListFormatter.bind(this);//to use global variable in list formatter auto-complete

    //Check and Remove Existing employee List from the FilteredEmpList.
    this.filteredEmpList = cloneDeep(this.allDoctorList);

    //remove existing only for New-Setup, not required for Existing-> edit since that searchbox will be Readonly for Existing employee -> Edit.
    // if (!this.CurrentEmployeeId && this.filteredEmpList && this.existingEmpList && this.existingEmpList.length) {
    //   this.existingEmpList.forEach(emp => {
    //     let currIndex = this.filteredEmpList.findIndex(a => a.EmployeeId == emp.EmployeeId);
    //     if (currIndex > -1) {
    //       this.filteredEmpList.splice(currIndex, 1);
    //     }
    //   });
    // }


    if (this.CurrentEmployeeId) {
      this.update = true;
      this.NewEmployeeIncentiveInfo = false;
      this.DocObj = this.allDoctorList.find(a => a.EmployeeId == this.CurrentEmployeeId);
      this.GetEmployeeBillItemsList(this.CurrentEmployeeId);
    }
    else {
      this.update = false;
      this.NewEmployeeIncentiveInfo = true;
      this.DocObj = null;
      this.currentEmployeeIncentiveInfo = new EmployeeIncentiveInfoModel();
    }
    // this.GetDeptsForSearchDDL(this.allBillItems);
    // this.FilteredItemList = this.allBillItems;

    // console.log(this.DocObj);
  }

  GetEmployeeBillItemsList(empId) {
    try {
      this.incentiveBLService.GetEmployeeBillItemsList(empId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            var employeeIncentiveInfo = res.Results;
            this.EmployeePreviousBillItems = employeeIncentiveInfo.EmployeeBillItemsMap;
            this.currentEmployeeIncentiveInfo = employeeIncentiveInfo;
            //console.log(this.currentEmployeeIncentiveInfo);
            //var pricecategoryObj = this.categoryList.find(a => a.PriceCategoryName == "Normal");
            //this.currentEmployeeIncentiveInfo.PriceCategoryId = pricecategoryObj.PriceCategoryId;

            if (this.EmployeePreviousBillItems && this.EmployeePreviousBillItems.length) {
              // this.EmployeePreviousBillItems.forEach(a => {
              //   var bilitm = this.allBillItems.find(b => b.ServiceItemId == a.ServiceItemId);
              //   if (bilitm) {
              //     a.ItemName = bilitm.ItemName;
              //     a.DepartmentName = bilitm.ServiceDepartmentName;
              //   }
              //   a.GroupDistributionCount = a.GroupDistribution.length;
              // });
            }
            else {
              //if no item found then set focus on itemname searchbox.
              this.SetFocusOn_SearchBox("srch_itemName");
            }

          }
          else {
            this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
            console.log(res.ErrorMessage);
          }
        });
    } catch (error) {

    }
  }

  public GetCategoryList() {
    this.incentiveBLService.GetCategoryList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.categoryList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
  }

  public GetDepartmentsForSearchDDL(itemList: Array<any>) {
    let allDepartments = itemList.map(el => {
      return el.ServiceDepartmentName;
    });

    let uniqueItms = CommonFunctions.GetUniqueItemsFromArray(allDepartments);

    //to change Array<string> to Array<Object>
    //searchbox needs Object array for binding, but above uniqueItems list gives Array<string>
    this.uniqueDeptNames = uniqueItms.map(el => {
      return { ServiceDepartmentName: el }
    });
  }

  ClosePopup() {
    this.DocObj = null;
    this.CurrentEmployeeId = null;
    this.currentEmployeeIncentiveInfo = new EmployeeIncentiveInfoModel();
    this.incentiveInfoSetupChange.emit();
  }
  CloseGroupDistributionPopup() {
    this.ShowItemGroupDistribution = false;
  }
  CloseShowEditItemPopup() {
    this.ShowEditItem = false;
  }
  //selectedItemId: number = null;
  public EmployeeItemGridActions($event) {
    switch ($event.Action) {
      case 'edititem': {
        //this.selectedItemId = $event.Data.BillItemPriceId;
        this.updateSelectedItem = $event.Data;
        if (this.updateSelectedItem.BillingTypesApplicable == 'outpatient') {
          this.updateSelectedItem.IpdSelected = false;
          this.updateSelectedItem.OpdSelected = true;
        }
        else if (this.updateSelectedItem.BillingTypesApplicable == 'inpatient') {
          this.updateSelectedItem.IpdSelected = true;
          this.updateSelectedItem.OpdSelected = false;
        }
        else {
          this.updateSelectedItem.IpdSelected = true;
          this.updateSelectedItem.OpdSelected = true;
        }

        this.ShowItemGroupDistribution = false;
        this.ShowEditItem = true;
        break;
      }
      case 'removeitem': {
        this.updateSelectedItem = $event.Data;
        let proceed: boolean = true;
        proceed = window.confirm(this.DocObj.FullName + " will not get Incentive from" + this.updateSelectedItem.ItemName + ". Do you want to continue ?")
        if (proceed) {
          this.updateSelectedItem.IsActive = false;
          this.updateSelectedItem.GroupDistribution.forEach(a => {
            a.IsActive = false;
          });
          this.RemoveSelectedBillItem();
        }

        break;
      }
      case 'groupdistribution': {
        this.updateSelectedItem = $event.Data;
        this.ServiceItemId = $event.Data.ServiceItemId;
        this.ItemGroupDistribution = this.updateSelectedItem.GroupDistribution;
        this.ItemGroupDistribution.forEach(a => {
          a.DocObj = this.allDoctorList.find(b => b.EmployeeId == a.DistributeToEmployeeId);
          if (a.DistributeToEmployeeId == this.CurrentEmployeeId) {
            a.isSelfGroupDistribution = true;
          }
          else {
            a.isSelfGroupDistribution = false;
          }
        });

        //add new row if current bill-item doesn't already have group distribution.
        if (!(this.updateSelectedItem && this.updateSelectedItem.HasGroupDistribution)) {
          this.AddFirstRowForEmptyGroupDistribution(this.updateSelectedItem);
        }
        //
        this.ShowEditItem = false;
        this.ShowItemGroupDistribution = true;
        break;
      }
      default:
        break;
    }
  }

  public OnDepartmentChange() {

    let srvDeptObj = null;
    // check if user has given proper input string for department name
    //or has selected object properly from the dropdown list.
    if (typeof (this.ItemsSetup.SelServDepartment) == 'string') {
      if (this.uniqueDeptNames.length && this.ItemsSetup.SelServDepartment)
        srvDeptObj = this.uniqueDeptNames.find(a => a.ServiceDepartmentName.toLowerCase() == this.ItemsSetup.SelServDepartment.toLowerCase());
    }
    else if (typeof (this.ItemsSetup.SelServDepartment) == 'object') {
      srvDeptObj = this.ItemsSetup.SelServDepartment;
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
    if (this.ItemsSetup.ItemName && this.ItemsSetup.ItemName != '') {
      if (this.EmployeePreviousBillItems.find(a => a.ServiceItemId === this.ItemsSetup.ItemName.ServiceItemId && a.PriceCategoryId === this.SelectedPriceCategoryId)) {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, [` ${this.ItemsSetup.ItemName} is already added with selected PriceCategory , Please edit the percentage from below list.`]);
        this.SetFocusOn_SearchBox("srch_itemName");
        this.ItemsSetup.SelServDepartment = null;
        this.ItemsSetup.Price = 0;
        this.ItemsSetup.ItemName = null;
      }
      else {
        this.ItemsSetup.SelServDepartment = this.ItemsSetup.ItemName.ServiceDepartmentName;
        this.ItemsSetup.Price = this.ItemsSetup.ItemName.Price ? this.ItemsSetup.ItemName.Price : 0;
      }

    }
    else {
      this.ItemsSetup.Price = 0;
      this.ItemsSetup.SelServDepartment = null;
    }
    this.OnDepartmentChange();
  }

  public SaveIncentiveItem() {
    if (this.ItemsSetup && this.ItemsSetup.ItemName) {
      var EmployeeBillItemsObj = new EmployeeBillItemsMapModel();
      EmployeeBillItemsObj.EmployeeId = this.DocObj.EmployeeId;
      EmployeeBillItemsObj.PriceCategoryId = this.SelectedPriceCategoryId;// this.currentEmployeeIncentiveInfo.PriceCategoryId;
      EmployeeBillItemsObj.ServiceItemId = this.ItemsSetup.ItemName.ServiceItemId;
      EmployeeBillItemsObj.PerformerPercent = this.ItemsSetup.PerformerPercent ? this.ItemsSetup.PerformerPercent : 0;
      EmployeeBillItemsObj.PrescriberPercent = this.ItemsSetup.PrescriberPercent ? this.ItemsSetup.PrescriberPercent : 0;
      EmployeeBillItemsObj.ReferrerPercent = this.ItemsSetup.ReferrerPercent ? this.ItemsSetup.ReferrerPercent : 0;
      // let serviceItem = this.allBillItems.find(a => a.ServiceItemId == this.ItemsSetup.ItemName.ServiceItemId);
      // EmployeeBillItemsObj.ServiceItemId = serviceItem.ServiceItemId;
      EmployeeBillItemsObj.ItemName = this.ItemsSetup.ItemName;
      EmployeeBillItemsObj.DepartmentName = this.ItemsSetup.SelServDepartment;
      EmployeeBillItemsObj.GroupDistribution = null;
      EmployeeBillItemsObj.HasGroupDistribution = false;
      EmployeeBillItemsObj.IsActive = true;
      EmployeeBillItemsObj.CreatedBy = this.securityService.loggedInUser.EmployeeId;//change this and assign from server side..
      EmployeeBillItemsObj.CreatedOn = moment().format('YYYY-MM-DD');

      if (this.ItemsSetup.OpdSelected && this.ItemsSetup.IpdSelected) {
        EmployeeBillItemsObj.BillingTypesApplicable = 'both';
      }
      else if (this.ItemsSetup.OpdSelected) {
        EmployeeBillItemsObj.BillingTypesApplicable = 'outpatient';
      }
      else if (this.ItemsSetup.IpdSelected) {
        EmployeeBillItemsObj.BillingTypesApplicable = 'inpatient';
      }
      else {
        //EmployeeBillItemsObj.BillingTypesApplicable = 'both';
        this.msgBoxServ.showMessage('Warning', ['Select Ipd/Opd to proceed']);
        return;
      }
      this.currentEmployeeIncentiveInfo.EmployeeBillItemsMap.push(EmployeeBillItemsObj)

      this.currentEmployeeIncentiveInfo.CreatedBy = this.securityService.loggedInUser.EmployeeId;//change this and assign from server side..
      this.currentEmployeeIncentiveInfo.CreatedOn = moment().format('YYYY-MM-DD');


      this.incentiveBLService.SaveEmployeeBillItemsMap(this.currentEmployeeIncentiveInfo)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.GetEmployeeBillItemsList(res.Results.EmployeeId);
            this.ItemsSetup = new EmployeeIncentiveSetupVM();
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Employee BillItems Map is successfully saved!!']);
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

  public EmployeeListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
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
        + "(" + data["Doctor"].DoctorName + ")" + "&nbsp;&nbsp;" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + " " + "<b>" + data["Price"] + "</b >";
      return html;
    }
    else {
      let html: string = data["ServiceDepartmentName"] + "-" + "<font color='blue'; size=03 >" + data["ItemName"] + "</font>"
        + "&nbsp;&nbsp;" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + " " + "<b>" + data["Price"] + "</b >";
      return html;
    }
  }


  public ChangeDoctorInGroupDistribution(frcItem) {
    frcItem.IncentiveReceiverId = frcItem.DocObj.EmployeeId;
    frcItem.IncentiveReceiverName = frcItem.DocObj.FullName;
  }



  public UndoRemove_FractionItem_Single(itm: ItemGroupDistributionModel) {
    itm.IsRemoved = false;
    itm.IsActive = true;
  }

  public RemoveFractionItem_Single(itm: ItemGroupDistributionModel, indx) {
    //if current item is old one then just set as removed status, if it's new item then remove it..
    if (itm.ItemGroupDistributionId) {
      itm.IsRemoved = true;
      itm.IsActive = false;
    }
    else {
      this.ItemGroupDistribution.splice(indx, 1);
    }
  }

  //this adds a new row only when Current BillItem has NO-Group Distribution.
  //by default it adds the assigned to percentage to this newly created row.
  public AddFirstRowForEmptyGroupDistribution(itemObj) {
    //Add a new row and assign the current employee to it, only when there's nothing in the group-distribution of current bill-item.
    if (this.ItemGroupDistribution.length == 0) {
      let firstRow: ItemGroupDistributionModel = new ItemGroupDistributionModel();
      //assign values to newRow from available variables
      firstRow.ItemGroupDistributionId = 0;
      firstRow.IncentiveType = 'assigned';// now is hardcoded need to change later after adding other type in group distribution
      firstRow.DocObj = this.DocObj;
      firstRow.FromEmployeeId = this.DocObj.EmployeeId;
      firstRow.DistributeToEmployeeId = this.DocObj.EmployeeId;
      firstRow.DistributionPercent = itemObj.PerformerPercent;
      firstRow.isSelfGroupDistribution = true;
      firstRow.IsActive = true;
      firstRow.IsRemoved = false;
      firstRow.CreatedBy = this.securityService.loggedInUser.EmployeeId;//change this and assign from server side..
      // firstRow.CreatedOn = moment().format('YYYY-MM-DD');
      this.ItemGroupDistribution.push(firstRow);
    }
    else {
      //remove if there are one or more empty rows.
      //this happens when user clicks on Plus button and doesn't select any emplyee, and then clicks on other item from left side.
      let i = this.ItemGroupDistribution.length;
      //decrement i since we're removing the item from the same array we're looping.
      while (i--) {
        if (!this.ItemGroupDistribution[i].DistributeToEmployeeId) {
          this.ItemGroupDistribution.splice(i, 1);
        }
      }
    }
  }

  public AddNewRow_GroupDistribution() {

    let newRow: ItemGroupDistributionModel = new ItemGroupDistributionModel();
    //assign values to newRow from available variables
    newRow.ItemGroupDistributionId = 0;
    newRow.IncentiveType = 'assigned';// now is hardcoded need to change later after adding other type in group distribution
    newRow.isSelfGroupDistribution = false;
    newRow.IsActive = true;
    newRow.IsRemoved = false;
    newRow.CreatedBy = this.securityService.loggedInUser.EmployeeId;//change this and assign from server side..
    newRow.CreatedOn = moment().format('YYYY-MM-DD');
    this.ItemGroupDistribution.push(newRow);

    this.SetFocusOnEmployeeName(this.ItemGroupDistribution.length - 1);

  }
  private SetFocusOnEmployeeName(index: number) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById("empIp_" + index);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }

  public SaveItemGroupDistribution() {
    var totalGroupPercentage = 0;
    if (this.ItemGroupDistribution && this.ItemGroupDistribution.length > 1) {
      this.ItemGroupDistribution.forEach(a => {
        if (a.DocObj.EmployeeId) {
          a.ServiceItemId = this.ServiceItemId;
          a.DistributeToEmployeeId = a.DocObj.EmployeeId;
          a.FromEmployeeId = this.DocObj.EmployeeId;
          a.EmployeeBillItemsMapId = this.updateSelectedItem.EmployeeBillItemsMapId ? this.updateSelectedItem.EmployeeBillItemsMapId : 0;
          totalGroupPercentage += a.DistributionPercent;
        }
        else {
          let indx = this.ItemGroupDistribution.indexOf(a)
          this.ItemGroupDistribution.splice(indx, 1);
        }
      });
      if (totalGroupPercentage <= 100) {
        this.incentiveBLService.SaveItemGroupDistribution(this.ItemGroupDistribution)
          .subscribe(res => {
            if (res.Status == 'OK') {
              this.GetEmployeeBillItemsList(this.updateSelectedItem.EmployeeId);
              this.msgBoxServ.showMessage('Sucess', ['Item Group Distribution is successfully saved!!']);
              this.ShowItemGroupDistribution = false;
            }
            else {
              this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
              console.log(res.ErrorMessage);
            }
          });
      }
      else {
        this.msgBoxServ.showMessage('failed', ['Sum of Group distribution percentage cann\'t be greater than 100%']);
      }
    }
    else {
      this.msgBoxServ.showMessage('Notice', ['Add employee and percentage for group distribution']);
    }
  }

  UpdateItems() {

    if (this.updateSelectedItem && this.updateSelectedItem.EmployeeId) {
      if (this.updateSelectedItem.OpdSelected && this.updateSelectedItem.IpdSelected) {
        this.updateSelectedItem.BillingTypesApplicable = 'both';
      }
      else if (this.updateSelectedItem.OpdSelected) {
        this.updateSelectedItem.BillingTypesApplicable = 'outpatient';
      }
      else if (this.updateSelectedItem.IpdSelected) {
        this.updateSelectedItem.BillingTypesApplicable = 'inpatient';
      }

      this.incentiveBLService.UpdateEmployeeBillItem(this.updateSelectedItem)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.GetEmployeeBillItemsList(this.updateSelectedItem.EmployeeId);
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
  public CheckIfItemPercentValid(currItem) {
    let performerPercent = currItem.PerformerPercent ? currItem.PerformerPercent : 0;
    let prescriberPercent = currItem.PrescriberPercent ? currItem.PrescriberPercent : 0;
    let referrerPercent = currItem.ReferrerPercent ? currItem.ReferrerPercent : 0;

    if (performerPercent < 0 || prescriberPercent < 0 || (performerPercent + prescriberPercent + referrerPercent) > 100) {
      this.IsPercentageValid = false;
    }
    else {
      this.IsPercentageValid = true;
    }
  }

  public ChangeDoctor() {
    if (this.DocObj) {
      this.CurrentEmployeeId = this.DocObj.EmployeeId;
      this.currentEmployeeIncentiveInfo.EmployeeId = this.DocObj.EmployeeId;
      this.currentEmployeeIncentiveInfo.TDSPercent = this.DocObj.TDSPercent ? this.DocObj.TDSPercent : 0;
    }
  }

  //public onSelCategoryChanged(priceCatObj) {
  //  console.log(priceCatObj);
  //}

  public DiscardItem() {
    this.ItemsSetup = new EmployeeIncentiveSetupVM();
    this.OnDepartmentChange();
  }


  public SaveEmployeeIncentiveInfo() {
    if (this.existingEmpList && this.existingEmpList.length > 0) {
      let employeeIncentive = this.existingEmpList.find(e => e.EmployeeId === this.DocObj.EmployeeId);
      if (employeeIncentive && employeeIncentive.EmployeeId > 0) {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Employee is Already Added, try to add another employee']);
        return;
      }
    }
    if (this.showProfleDD && this.selProfileForAttach == null) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Please select a profile first']);
    } else {
      if (this.currentEmployeeIncentiveInfo && this.currentEmployeeIncentiveInfo.EmployeeId) {
        this.currentEmployeeIncentiveInfo.CreatedBy = this.securityService.loggedInUser.EmployeeId;//change this and assign from server side..
        this.currentEmployeeIncentiveInfo.CreatedOn = moment().format('YYYY-MM-DD');
        this.incentiveBLService.SaveEmployeeBillItemsMap(this.currentEmployeeIncentiveInfo)
          .subscribe(res => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.NewEmployeeIncentiveInfo = false;
              this.update = true;//after this part, it will be treated as update.
              //this.changeDetector.detectChanges();
              this.currentEmployeeIncentiveInfo = res.Results;
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Employee Incentive Info is successfully saved!!']);


              //After the success, we need to Re-Bind with the grid and group distribution part..
              this.GetEmployeeBillItemsList(this.currentEmployeeIncentiveInfo.EmployeeId);
              //this.EmployeePreviousBillItems = this.currentEmployeeIncentiveInfo.EmployeeBillItemsMap;

              this.changeDetector.detectChanges();
            }
            else {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Something Went Wrong ,Please Try Again']);
              console.log(res.ErrorMessage);
            }
          });
      }
      else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Select Dotor to save employee incentive info.']);
      }
    }

  }

  profileChanged() {
    let profile = null;
    this.selectedProfile = this.selProfileForAttach;
    if (this.selProfileForAttach && this.profileList) {
      if (typeof (this.selProfileForAttach) == 'string' && this.profileList.length) {
        profile = this.profileList.find(a => a.ProfileName.toLowerCase() == this.selProfileForAttach);
      }
      else if (typeof (this.selProfileForAttach) == 'object') {
        profile = this.selProfileForAttach;
      }
      if (profile) {
        //this.currentProfile.AttachedProfileId = profile.ProfileId;
        this.GetBillItemProfileMap(profile.ProfileId);
      }
      else {
        this.selProfileForAttach = null;
      }
    }
  }
  public GetBillItemProfileMap(profileId) {
    this.incentiveBLService.GetProfileItemsMapping(profileId)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          let profile = res.Results;

          this.currentEmployeeIncentiveInfo.EmployeeBillItemsMap = [];//clear billitems map on profile changed.

          profile.MappedItems.forEach(el => {
            var EmployeeBillItemsObj = new EmployeeBillItemsMapModel();
            EmployeeBillItemsObj.EmployeeId = this.DocObj.EmployeeId;
            EmployeeBillItemsObj.PriceCategoryId = profile.PriceCategoryId;// el.PriceCategoryId;
            EmployeeBillItemsObj.PriceCategoryName = el.PriceCategoryName;
            EmployeeBillItemsObj.ServiceItemId = el.ServiceItemId;
            EmployeeBillItemsObj.ItemName = el.ItemName;
            EmployeeBillItemsObj.DepartmentName = el.DepartmentName;
            EmployeeBillItemsObj.PerformerPercent = el.PerformerPercent ? el.PerformerPercent : 0;
            EmployeeBillItemsObj.PrescriberPercent = el.PrescriberPercent ? el.PrescriberPercent : 0;
            EmployeeBillItemsObj.ReferrerPercent = el.ReferrerPercent ? el.ReferrerPercent : 0;
            EmployeeBillItemsObj.GroupDistribution = null;
            EmployeeBillItemsObj.HasGroupDistribution = false;
            EmployeeBillItemsObj.IsActive = true;
            this.currentEmployeeIncentiveInfo.EmployeeBillItemsMap.push(EmployeeBillItemsObj)
          });

          this.EmployeePreviousBillItems = this.currentEmployeeIncentiveInfo.EmployeeBillItemsMap;

          // this.EmployeePreviousBillItems.forEach(a => {
          //   var bilitm = this.allBillItems.find(b => b.ServiceItemId == a.ServiceItemId);
          //   if (bilitm) {
          //     a.ItemName = bilitm.ItemName;
          //     a.DepartmentName = bilitm.ServiceDepartmentName;
          //   }
          //   a.GroupDistributionCount = a.GroupDistribution ? a.GroupDistribution.length : 0;
          // });

        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
  }

  GoToNextInput(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
      nextEl.select();
    }
  }
  SetFocusOnButton(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
    }
  }

  private SetFocusOn_SearchBox(idToSelect: string) {
    window.setTimeout(function () {
      let searchBoxObj = document.getElementById(idToSelect);
      if (searchBoxObj) {
        searchBoxObj.focus();
      }
    }, 600);
  }


  public RemoveSelectedBillItem() {
    if (this.updateSelectedItem && this.updateSelectedItem.EmployeeId) {
      this.incentiveBLService.RemoveSelectedBillItem(this.updateSelectedItem)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.GetEmployeeBillItemsList(this.updateSelectedItem.EmployeeId);
            this.msgBoxServ.showMessage('Success', ['Bill Item successfully Removed!!']);
          }
          else {
            this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
            console.log(res.ErrorMessage);
          }
        });
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
        this.ItemsSetup.OpdSelected = this.OpdIpdSettings.OpdSelected;
        this.ItemsSetup.IpdSelected = this.OpdIpdSettings.IpdSelected;
        this.EmployeeItemGridColumns = INCTVGridColumnSettings.EmployeeItemListWithOpdIpdSettingEnabled;
      }
      else {
        this.ItemsSetup.OpdSelected = true;
        this.ItemsSetup.IpdSelected = true;
        this.EmployeeItemGridColumns = INCTVGridColumnSettings.EmployeeItemList;
      }
    }
  }

  public PreviewItem(data) {
    this.selProfileForAttach = data;
    this.incentiveBLService.GetProfileItemsMapping(this.selProfileForAttach.ProfileId)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          let profile = res.Results;

          this.currentEmployeeIncentiveInfo.EmployeeBillItemsMap = [];//clear billitems map on profile changed.

          profile.MappedItems.forEach(el => {
            let EmployeeBillItemsObj = new EmployeeBillItemsMapModel();
            EmployeeBillItemsObj.PriceCategoryId = this.SelectedPriceCategoryId;// el.PriceCategoryId;
            EmployeeBillItemsObj.PriceCategoryName = el.PriceCategoryName;
            EmployeeBillItemsObj.ServiceItemId = el.ServiceItemId;
            EmployeeBillItemsObj.ItemName = el.ItemName;
            EmployeeBillItemsObj.DepartmentName = el.DepartmentName;
            EmployeeBillItemsObj.PerformerPercent = el.PerformerPercent ? el.PerformerPercent : 0;
            EmployeeBillItemsObj.PrescriberPercent = el.PrescriberPercent ? el.PrescriberPercent : 0;
            EmployeeBillItemsObj.ReferrerPercent = el.ReferrerPercent ? el.ReferrerPercent : 0;
            EmployeeBillItemsObj.GroupDistribution = null;
            EmployeeBillItemsObj.HasGroupDistribution = false;
            EmployeeBillItemsObj.IsActive = true;
            this.currentEmployeeIncentiveInfo.EmployeeBillItemsMap.push(EmployeeBillItemsObj)
          });

          this.EmployeePreviousBillItems = this.currentEmployeeIncentiveInfo.EmployeeBillItemsMap;
          // this.EmployeePreviousBillItems.forEach(a => {
          //   var bilitm = this.allBillItems.find(b => b.ServiceItemId == a.ServiceItemId);
          //   if (bilitm) {
          //     a.ItemName = bilitm.ItemName;
          //     a.DepartmentName = bilitm.ServiceDepartmentName;
          //   }
          // });
          this.EmployeePreviousBillItems = this.EmployeePreviousBillItems.filter(e => {
            return e.ItemName !== "";
          })
          this.showPreview = true;
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
    // if(this.DocObj == null){
    //   this.msgBoxServ.showMessage('failed', ['Please select Employee Name to preview the profile.']);
    // }else{
    //   this.showPreview = true;
    //   this.selProfileForAttach = data;
    //   this.profileChanged();
    // }
  }

  public SaveSelectedProfile() {
    if (this.DocObj == null) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Select Employee Name first.']);
    } else {
      this.profileChanged();
      this.showProfileTable = false;
    }

  }
  public ClosePreviewPopup() {
    this.showPreview = false;
  }
  public radioChanged(event, profile) {
    if (this.selectedRadioButton == null) {
      this.selProfileForAttach = null;
    } else {
      this.selProfileForAttach = profile;
    }
  }

  public DiscardSelectedProfile() {
    this.selectedRadioButton = null;
    this.selProfileForAttach = null;
    if (this.selectedProfile != null) {
      this.selectedProfile = null;
      this.showProfileTable = true;
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
    this.incentiveBLService.GetItemsForIncentive(priceCategoryId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.DiscardItem();
          const serviceItems = res.Results;
          this.GetDepartmentsForSearchDDL(serviceItems);
          this.FilteredItemList = serviceItems;
        }
        else {
          this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
  }
}

class EmployeeIncentiveSetupVM {
  public SelServDepartment: any = null;
  public ItemName: any = null;
  public Price: number = null;
  // public AssignedToPercent: number = 0;
  // public ReferredByPercent: number = 0;
  public PerformerPercent: number = 0; // Krishna, 24th,jun'22, AssignedToPercent changed PerformerPercent.
  public PrescriberPercent: number = 0;// Krishna, 24th,jun'22, ReferredByPercent changed to PrescriberPercent.
  public ReferrerPercent: number = 0; // Krishna, 24th,jun'22, Added new ReferrerPercent.
  public OpdSelected: boolean = true;
  public IpdSelected: boolean = true;
  public ServiceItemId: number = null;
  public PriceCategoryId: number = null;
}



