import { Component, ChangeDetectorRef } from "@angular/core";
import { ExternalReferralModel } from '../../shared/external-referral.model';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";


@Component({
  templateUrl: './list-ext-referral.html',
})
export class ListExternalReferralComponent {

  public extRefList: Array<ExternalReferralModel> = new Array<ExternalReferralModel>();
  public extRefGridColumns: Array<any> = null;
  public showAddNewPage: boolean = false;


  public receivedChildData: any;

  constructor(public settingsServ: SettingsService,
    public settingsBlService: SettingsBLService,
    public msgBoxServ: MessageboxService) {

    this.extRefGridColumns = this.settingsServ.settingsGridCols.ExtRefGridCols;

    this.LoadExtRefList();
  }
  

  public LoadExtRefList() {
    this.settingsBlService.GetExtReferrerList()
      .subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.extRefList = res.Results;
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          }
        },
        err => {
          this.msgBoxServ.showMessage("", [err.ErrorMessage])
        }
      );



  }
  

  getDataFromAdd($event) {
    // this.receivedChildData = callbackAdd;


    if ($event.action == "add") {

      let newExtRefObj: ExternalReferralModel = $event.data;
      this.extRefList.push(newExtRefObj);
    }
    else if ($event.action == "edit") {

      let updatedRefObj: ExternalReferralModel = $event.data;
      let updtedRefId = updatedRefObj.ExternalReferrerId;

      let gridItemIndex = this.extRefList.findIndex(a => a.ExternalReferrerId == updtedRefId);
      if (gridItemIndex != -1) {
        this.extRefList.splice(gridItemIndex, 1, updatedRefObj);
      }

    }


    this.showAddNewPage = false;

    this.extRefList = this.extRefList.slice();
  }

  ShowAddNewPage() {
    this.selExtRefToEdit = null;
    this.showAddNewPage = true;
  }

  HideNewPage() {
    this.showAddNewPage = false;
  }


  public selExtRefToEdit: ExternalReferralModel = null;

  ExtRefGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "edit": {
        this.selExtRefToEdit = new ExternalReferralModel();
        this.selExtRefToEdit = Object.assign(this.selExtRefToEdit, $event.Data);
        this.showAddNewPage = true;

      }
      default:
        break;
    }

  }

}

