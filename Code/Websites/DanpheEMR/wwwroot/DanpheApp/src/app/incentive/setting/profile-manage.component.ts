import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { ProfileModel } from '../shared/profile.model';
import { IncentiveBLService } from '../shared/incentive.bl.service';
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { CoreService } from '../../core/shared/core.service';
import { INCTVGridColumnSettings } from '../shared/inctv-grid-column-settings';

@Component({
  templateUrl: './profile-manage.component.html'
})
export class ProfileManageComponent {

  public currentProfile: ProfileModel = new ProfileModel();
  public selectedProfile: ProfileModel = new ProfileModel();
  public profileList: Array<ProfileModel> = new Array<ProfileModel>();
  public profileGridColumns: Array<any> = null;
  public update: boolean = false;
  public index: number;
  public stopProcessing: boolean = false;
  public showProfleDD: boolean = false;
  public showErrMsg: boolean = false;
  public showConfirmationBox: boolean = false;
  public allBillitmList = [];
  public categoryList = [];
  public selProfileForAttach: any;
  public showPrintBtnOnGrid: boolean = false;
  public showEditItemsPercentPage: boolean = false;
  public showProfileRenamePage: boolean = false;
  @Output('callback-add')
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();


  constructor(
    public incBLservice: IncentiveBLService,
    public msgBoxServ: MessageboxService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService) {
    this.profileGridColumns = INCTVGridColumnSettings.ProfileMasterList;
    this.GetProfileList();
    this.GetItemsForIncentive();
    this.GetCategoryList();
  }

  public GetProfileList() {
    this.incBLservice.GetProfileList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.profileList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
  }

  GetCategoryList() {
    this.incBLservice.GetCategoryList().subscribe(res => {
      if (res.Status == 'OK') {
        this.categoryList = res.Results;
      }
      else {
        this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
        console.log(res.ErrorMessage);
      }
    });
  }

  ProfileGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case 'edit': {
        this.selectedProfile = null;
        this.update = true;
        this.index = $event.RowIndex;
        this.showProfileRenamePage = false;
        this.showEditItemsPercentPage = false;
        this.changeDetector.detectChanges();
        this.selectedProfile = $event.Data;
        this.currentProfile.ProfileId = this.selectedProfile.ProfileId;
        this.currentProfile.ProfileName = this.selectedProfile.ProfileName;
        this.currentProfile.PriceCategoryId = this.selectedProfile.PriceCategoryId;
        this.currentProfile.PriceCategoryName = this.selectedProfile.PriceCategoryName;
        this.currentProfile.TDSPercentage = this.selectedProfile.TDSPercentage;
        this.currentProfile.IsActive = this.selectedProfile.IsActive;
        this.currentProfile.Description = this.selectedProfile.Description;
        this.showProfileRenamePage = true;

        break;
      }
      case 'editItemsPercent': {
        this.selectedProfile = null;
        this.showProfileRenamePage = false;
        this.showEditItemsPercentPage = false;
        this.changeDetector.detectChanges();
        this.selectedProfile = $event.Data;
        this.showEditItemsPercentPage = true;

        break;
      }
      case 'deactivateProfile': {
        console.log($event.Data);
        var curProfile = $event.Data;
        curProfile.IsActive = false;
        this.ActivateDeactivateProfile(curProfile);
        break;
      }
      case 'activateProfile': {
        console.log($event.Data);
        var curProfile = $event.Data;
        curProfile.IsActive = true;
        this.ActivateDeactivateProfile(curProfile);
        break;
      }
      default:
        break;
    }
  }

  AddProfile() {
    this.showEditItemsPercentPage = false;
    this.changeDetector.detectChanges();
    this.showEditItemsPercentPage = true;
  }

  Add() {
    for (let i in this.currentProfile.ProfileValidator.controls) {
      this.currentProfile.ProfileValidator.controls[i].markAsDirty();
      this.currentProfile.ProfileValidator.controls[i].updateValueAndValidity();
    }
    let isValid = true,
      showConfirm = false;
    if (!this.showProfleDD) {
      isValid = showConfirm = true;
    } else if (this.showProfleDD && this.selProfileForAttach == null) {
      this.showErrMsg = true;
      isValid = false;
    }

    if (this.currentProfile.IsValidCheck(undefined, undefined) && isValid) {
      if (showConfirm) {
        this.showConfirmationBox = true;
      }
      else {
        this.confirmBxAction(true);
      }
    }
  }

  Update() {
    for (var i in this.currentProfile.ProfileValidator.controls) {
      this.currentProfile.ProfileValidator.controls[i].markAsDirty();
      this.currentProfile.ProfileValidator.controls[i].updateValueAndValidity();
    }
    if (this.currentProfile.IsValidCheck(undefined, undefined)) {
      this.incBLservice.UpdateProfile(this.currentProfile).subscribe(
        res => {
          if (res.Status == 'OK') {
            this.msgBoxServ.showMessage('success', ['Profile Details Updated.']);
            this.CallBackAddUpdate(res);
            this.currentProfile = new ProfileModel();
          }
          else {
            this.msgBoxServ.showMessage('failed', ['Something Wrong ' + res.ErrorMessage]);
          }
        },
        err => {
          this.msgBoxServ.showMessage('error', ['Something Wrong ' + err.ErrorMessage]);
        });
    }
  }

  CallBackAddUpdate(res) {
    if (res.Status == 'OK') {
      this.callbackAdd.emit({ profile: res.Results });
      const profile: any = {};
      profile.ProfileId = res.Results.ProfileId;
      profile.ProfileName = res.Results.ProfileName;
      profile.PriceCategoryId = res.Results.PriceCategoryId;
      profile.PriceCategoryName = res.Results.PriceCategoryName;
      profile.TDSPercentage = res.Results.TDSPercentage;
      profile.IsActive = res.Results.IsActive;
      profile.Description = res.Results.Description;
      this.CallBackAdd(profile);
    }
    else {
      this.msgBoxServ.showMessage('error', ['some error ' + res.ErrorMessage]);
    }
  }

  CallBackAdd(compny: ProfileModel) {
    this.profileList.push(compny);
    if (this.index != null) {
      this.profileList.splice(this.index, 1);
    }
    this.profileList = this.profileList.slice();
    this.changeDetector.detectChanges();
    this.Close();
  }

  Close() {
    this.currentProfile = new ProfileModel();
    this.selectedProfile = new ProfileModel();
    this.update = false;
    this.showProfileRenamePage = false;
    this.showErrMsg = false;
    this.showProfleDD = false;
    this.selProfileForAttach = null;
    this.index = null;
  }

  onSelCategoryChanged() {
    const index = this.categoryList.findIndex(a => a.PriceCategoryId == this.currentProfile.PriceCategoryId);
    if (index != -1) {
      this.currentProfile.PriceCategoryName = this.categoryList[index].PriceCategoryName;
    }
  }

  callBackItemMapping($event) {
    this.changeDetector.detectChanges();
    this.showEditItemsPercentPage = false;
    this.selectedProfile = new ProfileModel();
    this.GetProfileList();
  }

  profileListFormatter(data: any): string {
    const html = data['ProfileName'];
    return html;
  }

  profileChanged() {
    let profile = null;
    if (this.selProfileForAttach && this.profileList) {
      if (typeof (this.selProfileForAttach) == 'string' && this.profileList.length) {
        profile = this.profileList.find(a => a.ProfileName.toLowerCase() == this.selProfileForAttach);
      }
      else if (typeof (this.selProfileForAttach) == 'object') {
        profile = this.selProfileForAttach;
      }
      if (profile) {
        this.currentProfile.AttachedProfileId = profile.ProfileId;
        this.showErrMsg = false;
      }
      else {
        this.selProfileForAttach = null;
      }
    }
  }

  confirmBxAction(action) {
    this.showConfirmationBox = false;
    if (action) {
      this.incBLservice.AddProfile(this.currentProfile).subscribe(
        res => {
          if (res.Status == 'OK') {
            this.msgBoxServ.showMessage('success', ['Profile Added.']);
            this.CallBackAddUpdate(res);
            this.currentProfile = new ProfileModel();
          }
          else {
            this.msgBoxServ.showMessage('error', ['Something Wrong' + res.ErrorMessage]);
          }
        },
        err => {
          this.msgBoxServ.showMessage('error', ['Something Wrong' + err.ErrorMessage]);
        });
    }
  }

  public ActivateDeactivateProfile(currentProfile: ProfileModel) {

    this.incBLservice.ActivateDeactivateProfile(currentProfile)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.GetProfileList();
          this.msgBoxServ.showMessage('sucess', ['Profile Updated Successfully!!']);

        }
        else {
          this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
  }

  public GetItemsForIncentive() {
    try {
      this.incBLservice.GetItemsForIncentive()
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.allBillitmList = res.Results;
          }
          else {
            this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
            console.log(res.ErrorMessage);
          }
        });
    } catch (error) {

    }
  }
}
