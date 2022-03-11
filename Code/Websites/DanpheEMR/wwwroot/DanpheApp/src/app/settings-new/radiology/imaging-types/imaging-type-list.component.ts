
import { Component, ChangeDetectorRef } from "@angular/core";

import { ImagingType } from '../../../radiology/shared/imaging-type.model';
import { SettingsBLService } from '../../shared/settings.bl.service';

import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';

@Component({
  selector: 'img-type-list',
  templateUrl: './imaging-type-list.html',
})
//testing
export class ImagingTypeListComponent {
  public imgTypeList: Array<ImagingType> = new Array<ImagingType>();
  public showImgTypeList: boolean = true;
  public imgTypeGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public selectedImgType: ImagingType;
  public selectedID: null;
  public index: number;

  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef) {
    this.imgTypeGridColumns = this.settingsServ.settingsGridCols.ImgTypeList;
    this.getImgTypeList();
  }
  public getImgTypeList() {
    this.settingsBLService.GetImgTypes()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.imgTypeList = res.Results;
          this.showImgTypeList = true;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }
  ImgTypeGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.selectedImgType = null;
        this.index = $event.RowIndex;
        this.selectedID = $event.Data.ImagingTypeId;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedImgType = $event.Data;
        this.showAddPage = true;
      }
      default:
        break;
    }
  }
  AddImgType() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
    this.FocusElementById('ImagingTypeName')
  }

  CallBackAdd($event) {
    if (this.selectedID != null) {
      let i = this.imgTypeList.findIndex(a => a.ImagingTypeId == this.selectedID);
      this.imgTypeList.splice(i, 1);
    }

    this.imgTypeList.splice(this.index, 0, $event.imgType);

    this.imgTypeList = this.imgTypeList.slice();
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.selectedImgType = null;
    //  this.index = null;
    this.selectedID = null;
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
