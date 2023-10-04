import { Component, ChangeDetectorRef } from "@angular/core";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { Membership } from '../../shared/membership.model';
import * as momemt from 'moment/moment';


@Component({
  selector: 'membership-list',
  templateUrl: './membership-list.html',
})

export class MembershipListComponent {
  public membershipList: Array<Membership> = new Array<Membership>();
  public showGrid: boolean = false;
  public membershipGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public selectedItem: Membership;
  public selectedID: null;
  public distinctCommunityList: Array<string> = [];

  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef) {
    this.membershipGridColumns = this.settingsServ.settingsGridCols.membershipList;
    this.getMembershipList();
  }

  public getMembershipList() {
    this.settingsBLService.GetMembershipType()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.membershipList = res.Results;
          this.showGrid = true;

          this.GetDistinctCommunityList();
          //this.CommunityChkboxOnChange();//need this to set initial values to dropdowns.

        }
        else {
          alert("Failed!" + res.ErrorMessage);
        }
      });
  }

  GetDistinctCommunityList() {

    this.distinctCommunityList = [];
    var allCommunityList: Array<string> = [];

    allCommunityList = this.membershipList.map(a => {
      return a.CommunityName;
    });

    for (var i = 0; i < allCommunityList.length; i++) {
      if (this.distinctCommunityList.indexOf(allCommunityList[i]) < 0) {
        this.distinctCommunityList.push(allCommunityList[i]);
      }
    }

  }


  MembershipGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.selectedItem = new Membership();
        this.selectedID = $event.Data.MembershipTypeId;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedItem = $event.Data;
        this.showAddPage = true;
      }
      default:
        break;
    }
  }
  AddMembership() {
    this.showAddPage = false;
    this.selectedItem = null;

    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {
    this.membershipList.push($event.membership);
    if (this.selectedID != null) {
      let i = this.membershipList.findIndex(a => a.MembershipTypeId == this.selectedID);
      this.membershipList.splice(i, 1);
    }
    this.membershipList = this.membershipList.slice();
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.selectedItem = null;
    this.selectedID = null;
  }


  OnMembershipChanged($event) {

    console.log("from membership list component");
    console.log($event);

  }

  
}
