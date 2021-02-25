import { Component, ChangeDetectorRef } from "@angular/core";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { CreditOrganization } from "../../shared/creditOrganization.model";

import * as moment from 'moment/moment';
@Component({
  selector: 'credit-organization-list',
  templateUrl: './credit-organization-list.html',
})
export class CreditOrganizationListComponent {
  public creditOrganizationList: Array<CreditOrganization> = new Array<CreditOrganization>();
  public showGrid: boolean = false;
  public creditOrganizationGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public selectedItem: CreditOrganization;
  //   public index: number;
  public selectedID: null;

  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef) {
    this.creditOrganizationGridColumns = this.settingsServ.settingsGridCols.creditOrganizationList;
    this.getCreditOrganizationList();
  }
  public getCreditOrganizationList() {
    this.settingsBLService.GetCreditOrganizationList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.creditOrganizationList = res.Results;
          this.showGrid = true;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }
  CreditOrganizationGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.selectedItem = null;
        // this.index = $event.RowIndex;
        this.selectedID = $event.Data.OrganizationId;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedItem = $event.Data;
        this.showAddPage = true;
      }
      default:
        break;
    }
  }
  AddCreditOrganization() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {
    this.creditOrganizationList.push($event.creditOrganization);
    if (this.selectedID != null) {
      let i = this.creditOrganizationList.findIndex(a => a.OrganizationId == this.selectedID);
      this.creditOrganizationList.splice(i, 1);
    }
    this.creditOrganizationList = this.creditOrganizationList.slice();
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.selectedItem = null;
    //  this.index = null;
    this.selectedID = null;

  }
}
