import { Component, ChangeDetectorRef } from '@angular/core';
import LabGridColumnSettings from '../../shared/lab-gridcol-settings';
import { LabSettingsBLService } from '../shared/lab-settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { LabCategoryModel } from '../../shared/lab-category.model';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  templateUrl: './lab-category.html'
})

export class LabCategoryComponent {
  public allCategories: Array<LabCategoryModel> = new Array<LabCategoryModel>();
  public selectedCategory: LabCategoryModel = new LabCategoryModel();
  public labCategoryGridCol: Array<any> = null;
  public labGridCols: LabGridColumnSettings = null;
  public showAddLabCategory: boolean = false;
  public index: number = null;
  public selectedActivateDeactivate: LabCategoryModel = null;
  public selectedItem: LabCategoryModel = null;

  constructor(public labSettingBlServ: LabSettingsBLService, public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef, public securityService: SecurityService) {
    this.labGridCols = new LabGridColumnSettings(this.securityService);
    this.labCategoryGridCol = this.labGridCols.LabCategoryList;
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
        break;
      }
      case "activateDeactivateLabTest": {
        if (event.Data != null) {
          this.selectedActivateDeactivate = null;
          this.selectedActivateDeactivate = event.Data;
          this.ActivateDeactivateLabCategoryStatus(this.selectedActivateDeactivate);
          this.selectedItem = null;
        }
        break;
      }
      default:
        break;
    }
  }

  public ActivateDeactivateLabCategoryStatus(cat: LabCategoryModel) {
    if (cat != null) {
      let status = cat.IsActive == true ? false : true;

      if (status == true) {
        cat.IsActive = status;
        this.ChangeActiveStatus(cat);
      } else {
        if (confirm("Are you Sure want to Deactivate " + cat.TestCategoryName + ' ?')) {

          cat.IsActive = status;
          //we want to update the ISActive property in table there for this call is necessry
          this.ChangeActiveStatus(cat);
        }
      }
    }
  }

  ChangeActiveStatus(currTest) {
    this.labSettingBlServ.DeactivateLabCategory(currTest)
        .subscribe(
            res => {
                if (res.Status == "OK") {
                    let responseMessage = res.Results.IsActive ? "Lab Category is now activated." : "Lab Category is now deactivated.";
                    this.msgBoxServ.showMessage("success", [responseMessage]);
                    //This for send to callbackadd function to update data in list
                    this.GetAllLabCategory();
                }
                else {
                    this.msgBoxServ.showMessage("error", ['Something went wrong' + res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("success", [err]);
            });

}

}
