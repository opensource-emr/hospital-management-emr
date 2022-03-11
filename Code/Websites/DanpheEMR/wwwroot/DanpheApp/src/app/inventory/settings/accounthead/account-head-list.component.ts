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
        this.FocusElementById('AccountHeadName');
      }
      default:
        break;
    }
  }
  AddAccountHead() {
    this.showAddPage = false;
    this.FocusElementById('AccountHeadName');
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {
    if ($event != null) {
       //find the index of currently added/updated accounthead in the list of all items (grid)
       let index = this.accountheadList.findIndex(a => a.AccountHeadId == $event.accounthead.AccountHeadId);
       //index will be -1 when this accountheadis currently added. 
       if (index < 0) {
           this.accountheadList.splice(0, 0, $event.accounthead);//this will add this accounthead to 0th index.
       }
       else {
           this.accountheadList.splice(index, 1, $event.accounthead);//this will replace one accounthead at particular index. 
       }
    }
    this.accountheadList = this.accountheadList.slice();
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.selectedAccountHead = null;
    this.index = null;
  }
  FocusElementById(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }

}
