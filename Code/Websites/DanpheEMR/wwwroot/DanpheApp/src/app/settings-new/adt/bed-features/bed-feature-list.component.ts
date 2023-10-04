import { ChangeDetectorRef, Component } from "@angular/core";
import { BedFeature } from "../../../adt/shared/bedfeature.model";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { ENUM_DanpheHTTPResponses } from "../../../shared/shared-enums";
import { SettingsService } from '../../shared/settings-service';
import { SettingsBLService } from '../../shared/settings.bl.service';

@Component({
  selector: 'bed-feature-list',
  templateUrl: './bed-feature-list.html',
})
export class BedFeatureListComponent {
  public bedFeatureList: Array<BedFeature> = new Array<BedFeature>();
  public showGrid: boolean = false;
  public bedFeatureGridColumns: Array<any> = null;
  public showAddPage: boolean = false;
  public selectedItem: BedFeature;
  public selectedID: null;

  constructor(
    public settingsBLService: SettingsBLService,
    public settingsService: SettingsService,
    public changeDetector: ChangeDetectorRef) {
    this.bedFeatureGridColumns = this.settingsService.settingsGridCols.BedFeatureList;
    this.getBedFeature();
  }
  public getBedFeature(): void {
    this.settingsBLService.GetBedFeatureList()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.bedFeatureList = res.Results;
          this.showGrid = true;
        }
        else {
          alert(`Failed ! ${res.ErrorMessage}`);
        }

      });
  }
  public BedFeatureGridActions($event: GridEmitModel): void {

    switch ($event.Action) {
      case "edit": {
        this.selectedItem = null;
        //   this.index = $event.RowIndex; //assign index
        this.selectedID = $event.Data.BedFeatureId;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedItem = $event.Data;
        this.showAddPage = true;
      }
      default:
        break;
    }
  }
  public AddBedFeature(): void {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  public CallBackAdd($event): void {
    var bedFeature: BedFeature = $event.bedFeature;
    if (this.selectedID !== null) {
      let i = this.bedFeatureList.findIndex(a => a.BedFeatureId === bedFeature.BedFeatureId);
      this.bedFeatureList.splice(i, 1, bedFeature);
    }
    else {
      this.bedFeatureList.push(bedFeature);
    }

    this.bedFeatureList = this.bedFeatureList.slice();
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.selectedItem = null;
    this.selectedID = null;
  }
}
