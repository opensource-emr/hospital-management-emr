import { Component, ChangeDetectorRef } from "@angular/core";
import { ImagingItem } from '../../../radiology/shared/imaging-item.model';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";


@Component({
  selector: 'img-item-list',
  templateUrl: './imaging-item-list.html',
})
export class ImagingItemListComponent {
  public imgItemList: Array<ImagingItem> = new Array<ImagingItem>();
  public showImgItemList: boolean = true;
  public imgItemGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public selectedImgItem: ImagingItem;
  public index: number;
  public selectedID: null;

  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef) {
    this.imgItemGridColumns = this.settingsServ.settingsGridCols.ImgItemList;
    this.getImgItemList();
  }
  public getImgItemList() {
    this.settingsBLService.GetImgItems()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.imgItemList = res.Results;
          this.showImgItemList = true;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }
  ImgItemGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.selectedImgItem = null;
        this.index = $event.RowIndex;
        this.selectedID = $event.Data.ImagingItemId;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedImgItem = $event.Data;
        this.showAddPage = true;
      }
      default:
        break;
    }
  }
  AddImgItem() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
    this.FocusElementById('imagingType')
  }

  CallBackAdd($event) {


    if (this.selectedID != null) {

      let i = this.imgItemList.findIndex(a => a.ImagingItemId == this.selectedID);

      this.imgItemList.splice(i, 1);
    }

    this.imgItemList.splice(this.index,0,$event.imgItem);
    this.imgItemList = this.imgItemList.slice();

    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.selectedImgItem = null;
    //this.index = null;
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

