import { Component, ChangeDetectorRef } from '@angular/core';
import LabGridColumnSettings from '../../shared/lab-gridcol-settings';
import { LabSettingsBLService } from '../shared/lab-settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { LabCategoryModel } from '../../shared/lab-category.model';

@Component({
  templateUrl: './lab-category.html'
})

export class LabCategoryComponent {
  public allCategories: Array<LabCategoryModel> = new Array<LabCategoryModel>();
  public selectedCategory: LabCategoryModel = new LabCategoryModel();
  public labCategoryGridCol: Array<any> = null;
  public showAddLabCategory: boolean = false;
  public index: number = null;

  constructor(public labSettingBlServ: LabSettingsBLService, public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef) {
    this.labCategoryGridCol = LabGridColumnSettings.LabCategoryList;
    this.GetAllLabCategory();
  }

  public GetAllLabCategory() {
    this.labSettingBlServ.GetAllLabCategory()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allCategories = res.Results;
        }
        else {
          this.msgBoxServ.showMessage('failed', ['Cannot Load the Lab Category']);
          console.log(res.ErrorMessage);
        }
      })
  }


  CallBackNewAdded($event) {   
    this.GetAllLabCategory();
    this.changeDetector.detectChanges();
    //reset page level variables once Edit/Add action is completed. 
    this.showAddLabCategory = false;
    this.selectedCategory = null;
    this.index = null;
  }

  AddNewCategory() {
    this.showAddLabCategory = false;
    this.selectedCategory = new LabCategoryModel();
    this.changeDetector.detectChanges();
    this.showAddLabCategory = true;
  }

  EditAction(event: GridEmitModel) {
    switch (event.Action) {
      case "edit": {
        this.selectedCategory = new LabCategoryModel();
        this.index = event.RowIndex;//assign index
        this.showAddLabCategory = false;
        this.changeDetector.detectChanges();
        this.selectedCategory = Object.assign(this.selectedCategory, event.Data);      
        this.showAddLabCategory = true;
      }
      default:
        break;
    }
  }
  
}
