import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { IncentiveBLService } from '../shared/incentive.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../shared/common.functions';
import { CoreService } from '../../core/shared/core.service';

@Component({
  selector: 'view-emp-inctv-settings',
  templateUrl: './view-emp-incentive-settings.component.html'
})
export class ViewIncentiveSettingsComponent implements OnInit {
  inctvSettingList = [];
  filteredList = [];
  uniqueDeptNames = [];
  categories = [];
  nonMappedItems = [];
  selServDept: string = '';
  strSearchitem: string = '';
  itemIndex: number = 0;
  @Input() employeeId: number = null;
  @Input() employeeName: string = '';
  @Output('callback-close') callBackClose: EventEmitter<Object> = new EventEmitter<Object>();
  showPopUp: boolean = false;
  loading: boolean = false;
  showNonMappedItems: boolean = false;

  constructor(private incentiveBLServ: IncentiveBLService,
    private msgBoxServ: MessageboxService,
    public coreService: CoreService) { }

  ngOnInit() {
    if (this.employeeId) {
      this.getIncentiveSettings();
    }
  }

  getIncentiveSettings() {
    this.incentiveBLServ.GetIncentiveSettingByEmpId(this.employeeId).subscribe(res => {
      if (res.Status == 'OK') {
        this.inctvSettingList = this.filteredList = this.processData(res.Results);
        this.getDeptsForSearchDDL(res.Results.Items);
        this.showPopUp = true;
      }
      else {
        this.msgBoxServ.showMessage('failed', ['Error while getting data. check log for more details.']);
      }
    });
  }

  toggleNonMappedItems() {
    this.loading = true;
    if (this.nonMappedItems.length === 0) {
      this.getNonMappedItems();
    } else {
      this.processNonMappedData();
    }
  }

  getNonMappedItems() {
    this.incentiveBLServ.getItemsforProfile().subscribe(res => {
      if (res.Status == 'OK') {
        // do some process
        const itmList = [];
        res.Results.forEach(a => {
          if (this.inctvSettingList.find(i => i.ItemName === a.ItemName) == null) {
            const itm = {
              ItemName: a.ItemName,
              ServiceDepartmentName: a.ServiceDepartmentName,
              ReferredPercent: {},
              AssignedPercent: {}
            };
            itmList.push(itm);
          }
        });
        this.nonMappedItems = itmList;
        this.processNonMappedData();
      } else {
        this.loading = false;
      }
    });
  }

  close() {
    this.showPopUp = false;
    this.callBackClose.emit();
  }

  processData(data) {
    const finalList = [];
    this.categories = [];
    data.Items.forEach(item => {
      const itm = {
        ItemName: item.ItemName,
        ServiceDepartmentName: item.ServiceDepartmentName,
        ReferredPercent: {},
        AssignedPercent: {}
      };
      data.PercentageDetails.forEach(profile => {
        const i = profile.Items.find(a => a.BillItemPriceId == item.BillItemPriceId);
        itm.ReferredPercent[profile.ProfileName] = i ? i.ReferredByPercent : null; // default is null
        itm.AssignedPercent[profile.ProfileName] = i ? i.AssignedToPercent : null; // default is null
      });
      finalList.push(itm);
    });
    data.PercentageDetails.forEach(profile => {
      this.categories.push({ ProfileName: profile.ProfileName, PriceCategoryName: profile.PriceCategoryName });
    });

    return finalList;
  }

  getDeptsForSearchDDL(itemList: Array<any>) {
    const allDepts = itemList.map(el => {
      return el.ServiceDepartmentName;
    });
    const uniqueItms = CommonFunctions.GetUniqueItemsFromArray(allDepts);
    this.uniqueDeptNames = uniqueItms.map(el => {
      return { ServiceDepartmentName: el };
    });
  }

  filterList() {
    this.filteredList = this.inctvSettingList.filter(itm =>
      (this.selServDept != '' ? itm.ServiceDepartmentName == this.selServDept : true)
      && (this.strSearchitem.length > 1 ? itm.ItemName.toUpperCase().includes(this.strSearchitem.toUpperCase()) : true)
    );
  }

  processNonMappedData() {
    try {
      if (!this.showNonMappedItems) {
        this.itemIndex = this.inctvSettingList.length;
        this.inctvSettingList.push(...this.nonMappedItems);
      } else {
        this.inctvSettingList.splice(this.itemIndex);
      }
      this.filterList();
      this.showNonMappedItems = !this.showNonMappedItems;

    } catch (e) {

    }
    this.loading = false;
  }
}
