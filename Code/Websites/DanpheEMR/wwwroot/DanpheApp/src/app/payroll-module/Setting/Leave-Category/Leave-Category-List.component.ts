import { NgModule, Component, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from "@angular/router";
import { PayrollSettingBLService } from  '../shared/PayrollSettingBLService';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment';
import  GridColumnSettings  from '../../../shared/danphe-grid/grid-column-settings.constant';
import {  LeaveCategories } from '../../Shared/Payroll-Leave-Category.model';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

@Component({
  selector: 'Leave-Category',
  templateUrl: './Leave-Category-List.html',
})
export class LeaveCategoryListComponent {
  public LeaveCategoryGridColumns: Array<any> = null;
  public LeaveCategoryList: Array<LeaveCategories> = new Array<LeaveCategories>();
  public showAddPage :boolean = false;
  public index: number;
  public selectedLeave: LeaveCategories;
  constructor(public payrollBLServe: PayrollSettingBLService,
    public msgBox: MessageboxService,
    public changeDetector: ChangeDetectorRef) {
    this.LeaveCategoryGridColumns = GridColumnSettings.LeaveCategoryList;
    this.getLeaveCategory();
  }

  public getLeaveCategory(){
    try {
      this.payrollBLServe.getLeaveCategory().subscribe(res => {
        if (res.Status == "OK") {
          this.LeaveCategoryList = res.Results;
        }
        else {
          this.msgBox.showMessage("failed", [res.ErrorMessage]);
        }
      });
    }
    catch (ex) {
      console.log(ex);
    }
  }
  AddLeaveCategory(){
    this.index = null;
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }
  callbackAdd($event) {
    let tempLeave = $event.leave;
    this.LeaveCategoryList.push(tempLeave);
    if (this.index)
      this.LeaveCategoryList.splice(this.index, 1);
    this.LeaveCategoryList = this.LeaveCategoryList.slice();
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.index = null;
    //this.selectedLeave = new LeaveCategories();
  }
  LeaveGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "edit": {
        this.selectedLeave = null;
        this.showAddPage = false;
        this.index = $event.RowIndex;
        this.changeDetector.detectChanges();
        this.selectedLeave = $event.Data;
        this.showAddPage = true;
        break;
      }
      default:
        break;
    }
  }
}
