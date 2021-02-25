
import { Component, ChangeDetectorRef } from "@angular/core";

import { Department } from '../../shared/department.model';
import { SettingsBLService } from '../../shared/settings.bl.service';

import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
import { PHRMStoreModel } from "../../../pharmacy/shared/phrm-store.model";
import { Role } from "../../../security/shared/role.model";

@Component({
  selector: 'substore-list',
  templateUrl: './substore-list.html',
})
export class SubstoreListComponent {
  public substoreList: Array<PHRMStoreModel> = new Array<PHRMStoreModel>();
  public showSubstoreList: boolean = false;
  public storeGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public selectedStore: PHRMStoreModel;

  public rbacRoleList:Array<Role> = [];

  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef) {
    this.storeGridColumns = this.settingsServ.settingsGridCols.StoreList;
    this.getsubstoreList();
    this.GetAllRbacRoles();//sud:10Apr'20
  }
  public getsubstoreList() {
    this.settingsBLService.GetStoreList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.substoreList = res.Results;
          this.substoreList.forEach(store => {
            //needs review to get parent department name
            this.substoreList.forEach(parStore => {
              if (store.ParentStoreId == parStore.StoreId && store.ParentStoreId != 0)
                store.ParentName = parStore.Name;
            });
          });
          this.showSubstoreList = true;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }
  StoreGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.selectedStore = null;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedStore = $event.Data;
        this.showAddPage = true;
        break;
      }
      case "activateDeactivateStore": {
        this.ActivateDeactivateStore($event.Data.StoreId);
        break;
      }
      default:
        break;
    }
  }
  AddStore() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {

    if ($event.action == "add") {
      this.substoreList.push($event.store);
    }
    else if ($event.action == "update") {
      let selstore = $event.store;
      let indx = this.substoreList.findIndex(a => a.StoreId == selstore.StoreId);
      this.substoreList.splice(indx, 1, selstore);
    }

    this.substoreList = this.substoreList.slice();
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.selectedStore = null;
  }

  ActivateDeactivateStore(StoreId: number) {
    this.settingsBLService.ActivateDeactivateStore(StoreId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.substoreList.find(a => a.StoreId == StoreId).IsActive = !this.substoreList.find(a => a.StoreId == StoreId).IsActive;
          this.substoreList = this.substoreList.slice();
        }
      })
  }

  //sud:10Apr'20-- we'll be passing this from list to add component
  // to save server calls and remove 'asynchronous data handling complexity' in the child component 
  GetAllRbacRoles() {
    this.settingsBLService.GetRoleList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.rbacRoleList = res.Results;
        }
      })
  }

}
