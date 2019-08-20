import { Component, ChangeDetectorRef } from "@angular/core";

import { AccountHeadModel } from '../shared/account-head.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
//testing
@Component({
  selector: 'accounthead-list',
  templateUrl: './account-head-list.html',
})
export class AccountHeadListComponent {
  public accountheadList: Array<AccountHeadModel> = new Array<AccountHeadModel>();
  public showAccountHeadList: boolean = true;
  public accountheadGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public selectedAccountHead: AccountHeadModel;
  public index: number;

  constructor(public invSettingBL: InventorySettingBLService,
    public changeDetector: ChangeDetectorRef) {
    this.accountheadGridColumns = GridColumnSettings.AccountHeadList;
    this.getAccountHeadList();
  }
  public getAccountHeadList() {
    //Yubraj 2nd April 2019 getting all isactive true and false items by sending null value as a parameter
    this.invSettingBL.GetAccountHead(null)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.accountheadList = res.Results;

          this.showAccountHeadList = true;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }
  AccountHeadGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.selectedAccountHead = null;
        this.index = $event.RowIndex;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedAccountHead = $event.Data;
        this.showAddPage = true;
      }
      default:
        break;
    }
  }
  AddAccountHead() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {
    this.accountheadList.push($event.accounthead);
    if (this.index != null)
      this.accountheadList.splice(this.index, 1);
    this.accountheadList = this.accountheadList.slice();
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.selectedAccountHead = null;
    this.index = null;
  }


}
