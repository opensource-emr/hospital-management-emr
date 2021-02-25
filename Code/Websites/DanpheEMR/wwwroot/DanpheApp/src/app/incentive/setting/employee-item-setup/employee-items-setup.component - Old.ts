import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { CommonFunctions } from '../../../shared/common.functions';
import { IncentiveBLService } from '../../shared/incentive.bl.service'; ``
import { EmployeeBillItemsMapModel } from '../../shared/employee-billItems-map.model';
import { ItemGroupDistributionModel } from '../../shared/item-group-distribution.model';
import { SecurityService } from '../../../security/shared/security.service';
import * as moment from 'moment/moment';
import { EmployeeIncentiveInfoModel } from '../../shared/employee-incentiveInfo.model';
import { ProfileModel } from '../../shared/profile.model';
import * as cloneDeep from 'lodash/cloneDeep';
import { CoreService } from '../../../core/shared/core.service';
import { INCTVGridColumnSettings } from '../../shared/inctv-grid-column-settings';



@Component({
  templateUrl: './employee-items-setup.component - Old.html'
})
export class EmployeeItemsSetupComponentOld {

  public uniqueDeptNames = [];
  public allBillItems: any = [];
  public filteredItemList: Array<EmployeeBillItemsMapModel> = [];
  public currentItemList: Array<EmployeeBillItemsMapModel> = new Array<EmployeeBillItemsMapModel>();
  public currentEmployeeIncentiveInfo: EmployeeIncentiveInfoModel = new EmployeeIncentiveInfoModel();

  public EmployeeItemSetupGridColumns: Array<any> = [];
  public EmployeeIncentiveList: Array<any> = [];
  public DocObj: any = null;
  public allDocterList: any = [];
  public ShowPopUp: boolean = false;
  public loading: boolean = false;
  public selectAll: boolean = false;
  public showEditFields: boolean = false;
  public isGroupPercentValid: boolean = true;
  //public TDSPercentage: number = 0;

  //public finalListtoUpdate: EmployeeIncentiveInfoModel = null;
  public isDataValid: boolean = true;

  public selServiceDepartmentName: string = '';
  public strSearchitem: string = '';
  public categoryList = [];

  public ShowItemGroupDistributionPopup = false;
  public index = null;
  public ItemGroupDistribution: Array<ItemGroupDistributionModel> = [];

  public GroupReferredByPercent: number = 0;
  public GroupAssignedToPercent: number = 0;


  public profileList: Array<ProfileModel> = new Array<ProfileModel>();
  public showProfleDD: boolean = false;
  public selProfileForAttach: any;
  public update: boolean = false;
  public showErrMsg: boolean = false;

  constructor(public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public incentiveBLService: IncentiveBLService,
    public securityService: SecurityService,
    public coreService: CoreService) {
    this.GetEmployeeIncentiveInfo();
    this.GetItemsForIncentive();
    this.LoadDocterList();
    this.GetCategoryList();
    this.GetProfileList();
    this.EmployeeItemSetupGridColumns = INCTVGridColumnSettings.EmployeeItemSetupList;

  }

  public EmployeeItemSetupGridActions($event) {
    switch ($event.Action) {

      case 'editItemsPercent': {
        this.currentEmployeeIncentiveInfo = new EmployeeIncentiveInfoModel();
        this.currentEmployeeIncentiveInfo = $event.Data;
        this.DocObj = { EmployeeId: $event.Data.EmployeeId, FullName: $event.Data.FullName };
        //this.TDSPercentage = this.currentEmployeeIncentiveInfo.TDSPercent;
        var PriceCategoryObj = this.categoryList.find(a => a.PriceCategoryId == this.currentEmployeeIncentiveInfo.EmployeeBillItemsMap[0].PriceCategoryId);
        this.currentEmployeeIncentiveInfo.PriceCategoryId = PriceCategoryObj.PriceCategoryId;
        this.currentEmployeeIncentiveInfo.PriceCategoryName = PriceCategoryObj.PriceCategoryName;

        this.currentItemList = cloneDeep(this.allBillItems);

        // this will assign percentages etc after finding the item.. 
        this.currentEmployeeIncentiveInfo.EmployeeBillItemsMap.forEach(el => {
          let currItm = this.currentItemList.find(a => a.BillItemPriceId == el.BillItemPriceId);
          if (currItm) {
            currItm.EmployeeBillItemsMapId = el.EmployeeBillItemsMapId;
            currItm.AssignedToPercent = el.AssignedToPercent;
            currItm.ReferredByPercent = el.ReferredByPercent;
            currItm.IsSelected = true;
            currItm.HasGroupDistribution = el.HasGroupDistribution;
            currItm.GroupDistribution = el.GroupDistribution;
            currItm.GroupDistributionCount = el.GroupDistribution ? el.GroupDistribution.length : 0;
            currItm.GroupDistribution.forEach(a => {
              a.DocObj = this.allDocterList.find(b => b.EmployeeId == a.DistributeToEmployeeId);
            })
          }
        });

        this.filteredItemList = cloneDeep(this.currentItemList);//assign fresh copy of curr-items list to filtered items list

        this.filteredItemList.sort((t1) => {
          if ((t1.AssignedToPercent == null || t1.AssignedToPercent == 0) && (t1.ReferredByPercent == null || t1.ReferredByPercent == 0)) {
            return 1;
          }
          else { return -1; }
        });



        this.showEditFields = true;
        this.update = true;
        this.ShowPopUp = true;
        break;
      }
      default:
        break;
    }
  }

  public ClosePopup() {
    this.ShowPopUp = false;
    this.strSearchitem = "";//reset search string to empty
    this.selectAll = false;//set select all checkbox to false, otherwise it will remain selected.
    this.selServiceDepartmentName="";
    this.ShowItemGroupDistributionPopup = false;
    this.currentEmployeeIncentiveInfo = new EmployeeIncentiveInfoModel();
    this.DocObj = null;
    this.showProfleDD = false;
  }

  public CloseGroupDistributionPopup() {
    this.ShowItemGroupDistributionPopup = false;

    let indx = this.ItemGroupDistribution.findIndex(x => x.DocObj == null)
    this.ItemGroupDistribution.splice(indx, 1);
  }


  public AddEmployeeIncentive_ForNEW() {
    this.currentEmployeeIncentiveInfo = new EmployeeIncentiveInfoModel();
    this.filteredItemList = cloneDeep(this.allBillItems);//show fresh copy of all bill items into filtered items for new doct
    this.DocObj = null;
    this.showProfleDD = false;
    this.update = false;
    this.ShowPopUp = true;
  }

  public GetDeptsForSearchDDL(itemList: Array<any>) {
    const allDepts = itemList.map(el => {
      return el.DepartmentName;
    });

    const uniqueItms = CommonFunctions.GetUniqueItemsFromArray(allDepts);

    this.uniqueDeptNames = uniqueItms.map(el => {
      return { ServiceDepartmentName: el }
    });
  }


  public EmployeeListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }
  profileListFormatter(data: any): string {
    const html = data['ProfileName'];
    return html;
  }

  public ChangeDoctor(docObj) {

    this.currentEmployeeIncentiveInfo.EmployeeId = docObj.EmployeeId;
    this.currentEmployeeIncentiveInfo.TDSPercent = docObj.TDSPercent ? docObj.TDSPercent : 0;
    //this.curDocReportMain.DoctorName = docObj.FullName;
  }

  public LoadDocterList() {
    this.incentiveBLService.GetIncentiveApplicableDocterList()
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allDocterList = res.Results;
        }
      });
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


  public GetEmployeeIncentiveInfo() {
    try {
      this.incentiveBLService.GetEmployeeIncentiveInfo()
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.EmployeeIncentiveList = res.Results;
          }
          else {
            this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
            console.log(res.ErrorMessage);
          }
        });
    } catch (error) {

    }
  }

  

  public GetItemsForIncentive() {
    try {
      this.incentiveBLService.GetItemsForIncentive()
        .subscribe(res => {
          if (res.Status == 'OK') {
            let itmList = res.Results;
            this.allBillItems = [];//reset allbillitems to empty..
            itmList.forEach(el => {
              let itm = new EmployeeBillItemsMapModel();
              itm.BillItemPriceId = el.BillItemPriceId;
              itm.ItemName = el.ItemName;
              itm.DepartmentName = el.ServiceDepartmentName;
              itm.DocObj = el.Doctor ? el.Doctor : { DoctorId: null, DoctorName: null };
              itm.IsPercentageValid = true;//by defaDoctorNameult this will be true.

              this.allBillItems.push(itm);
            });

            this.currentItemList = cloneDeep(this.allBillItems);// to make new empty copy of all Item list 

            this.GetDeptsForSearchDDL(this.currentItemList);
          }
          else {
            this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
            console.log(res.ErrorMessage);
          }
        });
    } catch (error) {

    }
  }

  public GetProfileList() {
    this.incentiveBLService.GetProfileList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.profileList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
  }

  public onSelCategoryChanged() {
    var index = this.categoryList.findIndex(a => a.PriceCategoryId == this.currentEmployeeIncentiveInfo.PriceCategoryId);
    if (index != -1) {
      this.currentEmployeeIncentiveInfo.PriceCategoryName = this.categoryList[index].PriceCategoryName;
    }
  }

  public selectAllClicked() {
    this.filteredItemList.forEach(el => {
      el.IsSelected = this.selectAll;
    });
    this.showEditFields = this.filteredItemList.some(a => a.IsSelected) ? true : false;
  }
  public checkBoxClicked($event) {
    this.showEditFields = this.filteredItemList.some(a => a.IsSelected) ? true : false;

    this.selectAll = this.filteredItemList.some(a => a.IsSelected == false) ? false : true;
  }


  public GroupPercentChange() {
    let rowsToUpdate = this.filteredItemList.filter(a => a.IsSelected);
    if (rowsToUpdate && rowsToUpdate.length > 0) {

      if (this.GroupReferredByPercent < 0 || this.GroupAssignedToPercent < 0 || (this.GroupReferredByPercent + this.GroupAssignedToPercent) > 100) {
        this.isGroupPercentValid = false;
      }
      else {
        this.isGroupPercentValid = true;
      }

      rowsToUpdate.forEach(itm => {
        if (this.GroupAssignedToPercent != null && this.GroupAssignedToPercent != undefined) {
          itm.AssignedToPercent = this.GroupAssignedToPercent;
        }
        if (this.GroupReferredByPercent != null && this.GroupReferredByPercent != undefined) {
          itm.ReferredByPercent = this.GroupReferredByPercent;
        }
        itm.IsPercentageValid = this.isGroupPercentValid;

        this.CheckIfItemPercentValid(itm);

      });
    }
  }

  public RefererrPercentChange(currMap: EmployeeBillItemsMapModel) {
    if (currMap.ReferredByPercent > 0) {
      currMap.IsSelected = true;
      this.showEditFields = true;
    }
    this.CheckIfItemPercentValid(currMap);
  }

  public AssignPercentChange(currMap: EmployeeBillItemsMapModel) {
    if (currMap.AssignedToPercent > 0) {
      currMap.IsSelected = true;
      this.showEditFields = true;
    }
    this.CheckIfItemPercentValid(currMap);
  }


  public CheckIfItemPercentValid(currItem: EmployeeBillItemsMapModel) {
    let refPercent = currItem.ReferredByPercent ? currItem.ReferredByPercent : 0;
    let assignPercent = currItem.AssignedToPercent ? currItem.AssignedToPercent : 0;

    if (refPercent < 0 || assignPercent < 0 || (refPercent + assignPercent) > 100) {
      currItem.IsPercentageValid = false;
    }
    else {
      currItem.IsPercentageValid = true;
    }
  }

  public filterList() {
    this.filteredItemList = this.currentItemList.filter(itm =>
      (this.selServiceDepartmentName != '' ? itm.DepartmentName == this.selServiceDepartmentName : true)
      && (this.strSearchitem.length > 1 ? itm.ItemName.toUpperCase().includes(this.strSearchitem.toUpperCase()) : true)
    );
    this.selectAll = this.filteredItemList.some(a => a.IsSelected == false) ? false : true;

    this.filteredItemList.sort((t1) => {
      if ((t1.AssignedToPercent == null || t1.AssignedToPercent == 0) && (t1.ReferredByPercent == null || t1.ReferredByPercent == 0)) {
        return 1;
      }
      else { return -1; }
    });

  }



  public SaveEmployeeBillItemsMap() {
    this.isDataValid = this.CheckValidation();
    if (this.isDataValid) {
      this.currentEmployeeIncentiveInfo.EmployeeBillItemsMap = [];
      let rowsToUpdate = this.filteredItemList.filter(a => a.IsSelected);
      rowsToUpdate.forEach(a => {
        var EmployeeBillItemsObj = new EmployeeBillItemsMapModel();
        EmployeeBillItemsObj.EmployeeBillItemsMapId = a.EmployeeBillItemsMapId;
        EmployeeBillItemsObj.EmployeeId = this.currentEmployeeIncentiveInfo.EmployeeId;
        EmployeeBillItemsObj.PriceCategoryId = this.currentEmployeeIncentiveInfo.PriceCategoryId;
        EmployeeBillItemsObj.BillItemPriceId = a.BillItemPriceId;
        EmployeeBillItemsObj.AssignedToPercent = a.AssignedToPercent ? a.AssignedToPercent : 0;
        EmployeeBillItemsObj.ReferredByPercent = a.ReferredByPercent ? a.ReferredByPercent : 0;
        EmployeeBillItemsObj.ItemName = a.ItemName;
        EmployeeBillItemsObj.DepartmentName = a.DepartmentName;
        EmployeeBillItemsObj.IsActive = a.IsActive;
        EmployeeBillItemsObj.GroupDistribution = a.GroupDistribution;
        EmployeeBillItemsObj.HasGroupDistribution = a.GroupDistribution.length > 0 ? true : false;
        if (EmployeeBillItemsObj.HasGroupDistribution) {
          EmployeeBillItemsObj.GroupDistribution.forEach(b => {
            b.FromEmployeeId = EmployeeBillItemsObj.EmployeeId;

          });
        }

        if (this.currentEmployeeIncentiveInfo.IsActive == false) {
          EmployeeBillItemsObj.IsActive = false;
          if (EmployeeBillItemsObj.GroupDistribution) {
            EmployeeBillItemsObj.GroupDistribution.forEach(a => {
              a.IsActive = false;
            });
          }
        }

        if (EmployeeBillItemsObj.GroupDistribution.some(a => a.DistributeToEmployeeId == a.FromEmployeeId) ? false : true) {
          let firstRow: ItemGroupDistributionModel = new ItemGroupDistributionModel();
          //assign values to newRow from available variables
          firstRow.ItemGroupDistributionId = 0;
          firstRow.IncentiveType = 'assigned';// now is hardcoded need to change later after adding other type in group distribution
          firstRow.DocObj = this.DocObj;
          firstRow.FromEmployeeId = this.DocObj.EmployeeId;
          firstRow.DistributeToEmployeeId = this.DocObj.EmployeeId;
          firstRow.BillItemPriceId = EmployeeBillItemsObj.BillItemPriceId;
          firstRow.DistributionPercent = EmployeeBillItemsObj.AssignedToPercent;
          firstRow.isSelfGroupDistribution = true;
          firstRow.IsActive = true;
          firstRow.IsRemoved = false;
          firstRow.CreatedBy = this.securityService.loggedInUser.EmployeeId;//change this and assign from server side..
          firstRow.CreatedOn = moment().format('YYYY-MM-DD');
          EmployeeBillItemsObj.GroupDistribution.push(firstRow);
        }

        this.currentEmployeeIncentiveInfo.EmployeeBillItemsMap.push(EmployeeBillItemsObj);
      });

      this.currentEmployeeIncentiveInfo.CreatedBy = this.securityService.loggedInUser.EmployeeId;//change this and assign from server side..
      this.currentEmployeeIncentiveInfo.CreatedOn = moment().format('YYYY-MM-DD');
      //this.currentEmployeeIncentiveInfo.TDSPercent = this.TDSPercentage;

      if (this.currentEmployeeIncentiveInfo && this.currentEmployeeIncentiveInfo.EmployeeBillItemsMap.length > 0) {
        this.loading = true;
        this.incentiveBLService.SaveEmployeeBillItemsMap(this.currentEmployeeIncentiveInfo)
          .subscribe(res => {
            if (res.Status == 'OK') {
              this.currentEmployeeIncentiveInfo = new EmployeeIncentiveInfoModel();
              this.GetEmployeeIncentiveInfo();
              this.ClosePopup();
              this.msgBoxServ.showMessage('sucess', ['Employee BillItems Map is successfully saved!!']);
              this.loading = false;
            }
            else {
              this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
              console.log(res.ErrorMessage);
              this.loading = false;
            }
          });
      }
      else {
        this.msgBoxServ.showMessage('notice', ['Assign incentive percentage to the items']);
        this.isDataValid = false;
      }
    }
  }

  public CheckValidation(): boolean {
    if (!this.currentEmployeeIncentiveInfo.EmployeeId) {
      this.msgBoxServ.showMessage('notice', ['Select Empoyee']);
      return false;
    }
    if (!this.currentEmployeeIncentiveInfo.PriceCategoryId) {
      this.msgBoxServ.showMessage('notice', ['Select Price Category']);
      return false;
    }

    if (!this.update && this.EmployeeIncentiveList.find(a => a.EmployeeId == this.currentEmployeeIncentiveInfo.EmployeeId)) {
      this.DocObj = null;
      this.msgBoxServ.showMessage('Notice', ['Select Other Employee. this employee has already item incentive percentage']);
      return false;
    }

    if (this.showProfleDD && !this.selProfileForAttach) {
      //this.msgBoxServ.showMessage('notice', ['Select Profile to Map item from the Profile']);
      this.showErrMsg = true;
      return false;
    }
    return true;
  }

  public itemName: string = '';
  public ItemGroupDistribution_Click(itemObj, i) {
    this.ItemGroupDistribution = null;
    this.ItemGroupDistribution = cloneDeep(itemObj.GroupDistribution);
    this.ItemGroupDistribution.forEach(a => {
      a.DocObj = this.allDocterList.find(b => b.EmployeeId == a.DistributeToEmployeeId);
    })
    this.itemName = itemObj.ItemName;
    this.index = i;
    this.ShowItemGroupDistributionPopup = true;

    this.AddNewRow(itemObj);
  }

  public ChangeDoctorInGroupDistribution(frcItem) {
    frcItem.IncentiveReceiverId = frcItem.DocObj.EmployeeId;
    frcItem.IncentiveReceiverName = frcItem.DocObj.FullName;
  }

  public GoToNextInput(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
      nextEl.select();
    }
  }
  public SetFocusOnButton(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
    }
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

  public AddNewRow(itemObj) {
    if (this.update && (this.ItemGroupDistribution.some(a => a.DistributeToEmployeeId == this.DocObj.EmployeeId) ? false : true)) {
      let firstRow: ItemGroupDistributionModel = new ItemGroupDistributionModel();
      //assign values to newRow from available variables
      firstRow.ItemGroupDistributionId = 0;
      firstRow.IncentiveType = 'assigned';// now is hardcoded need to change later after adding other type in group distribution
      firstRow.DocObj = this.DocObj;
      firstRow.FromEmployeeId = this.DocObj.EmployeeId;
      firstRow.DistributeToEmployeeId = this.DocObj.EmployeeId;
      firstRow.DistributionPercent = itemObj.AssignedToPercent;
      firstRow.isSelfGroupDistribution = true;
      firstRow.IsActive = true;
      firstRow.IsRemoved = false;
      firstRow.CreatedBy = this.securityService.loggedInUser.EmployeeId;//change this and assign from server side..
      firstRow.CreatedOn = moment().format('YYYY-MM-DD');
      this.ItemGroupDistribution.push(firstRow);
    }

    let newRow: ItemGroupDistributionModel = new ItemGroupDistributionModel();
    //assign values to newRow from available variables
    newRow.ItemGroupDistributionId = 0;
    newRow.IncentiveType = 'assigned';// now is hardcoded need to change later after adding other type in group distribution
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
    if (this.ItemGroupDistribution && this.ItemGroupDistribution.length > 0) {
      this.ItemGroupDistribution.forEach(a => {
        if (a.DocObj.EmployeeId) {
          a.BillItemPriceId = this.filteredItemList[this.index].BillItemPriceId
          a.DistributeToEmployeeId = a.DocObj.EmployeeId;
          a.FromEmployeeId = this.DocObj.EmployeeId;
          a.EmployeeBillItemsMapId = this.filteredItemList[this.index].EmployeeBillItemsMapId ? this.filteredItemList[this.index].EmployeeBillItemsMapId : 0;
        }
        else {
          let indx = this.ItemGroupDistribution.indexOf(a)
          this.ItemGroupDistribution.splice(indx, 1);
        }
      });
      this.filteredItemList[this.index].HasGroupDistribution = this.ItemGroupDistribution.length > 0 ? true : false;
      this.filteredItemList[this.index].GroupDistribution = this.ItemGroupDistribution;
      this.filteredItemList[this.index].GroupDistributionCount = this.ItemGroupDistribution ? this.ItemGroupDistribution.length : 0;


      if (this.filteredItemList[this.index].EmployeeBillItemsMapId && this.filteredItemList[this.index].EmployeeBillItemsMapId > 0) {
        this.incentiveBLService.SaveItemGroupDistribution(this.ItemGroupDistribution)
          .subscribe(res => {
            if (res.Status == 'OK') {
              this.msgBoxServ.showMessage('Sucess', ['Item Group Distribution is successfully saved!!']);
              this.filteredItemList[this.index].GroupDistribution = res.Results;
              this.filteredItemList[this.index].GroupDistribution.forEach(a => {
                a.DocObj = this.allDocterList.find(b => b.EmployeeId == a.DistributeToEmployeeId);
              });
            }
            else {
              this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
              console.log(res.ErrorMessage);
              this.loading = false;
            }
          });
      }
    }
    this.ShowItemGroupDistributionPopup = false;
  }



  profileChanged() {
    let profile = null;
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
        this.showErrMsg = false;
      }
      else {
        this.selProfileForAttach = null;
      }
    }
  }

  public GetBillItemProfileMap(profileId) {
    try {
      this.incentiveBLService.GetProfileItemsMapping(profileId)
        .subscribe(res => {
          if (res.Status == 'OK') {
            let profile = res.Results.profileDetails;

            profile.MappedItems.forEach(el => {
              let index = this.currentItemList.findIndex(a => a.BillItemPriceId == el.BillItemPriceId);
              if (index > -1) {
                this.currentItemList[index].AssignedToPercent = el.AssignedToPercent;
                this.currentItemList[index].ReferredByPercent = el.ReferredByPercent;
                this.currentItemList[index].IsSelected = true;
                this.currentItemList[index].HasGroupDistribution = false;
              }
            });

            this.currentItemList.sort((t1) => {
              if (t1.AssignedToPercent == null || t1.AssignedToPercent == 0) {
                return 1;
              }
              else { return -1; }             
            });
            this.filteredItemList = cloneDeep(this.currentItemList);
            this.showEditFields = true;
          }
          else {
            this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
            console.log(res.ErrorMessage);
          }
        });
    } catch (error) {

    }
  }
}



