import { Component, ChangeDetectorRef } from "@angular/core";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { Bed } from '../../../adt/shared/bed.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';


@Component({
    selector: 'bed-list',
    templateUrl: './bed-list.html',
})
export class BedListComponent {
    public bedList: Array<any> = new Array<any>();
    public showGrid: boolean = false;
    public bedGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedItem: Bed;
  //  public index: number;
    public selectedID: null;

    constructor(public settingsBLService: SettingsBLService,
        public settingsServ: SettingsService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
        this.bedGridColumns = this.settingsServ.settingsGridCols.BedList;
        this.getBedList();
    }
    public getBedList() {
        this.settingsBLService.GetBedList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.bedList = res.Results;
                    this.showGrid = true;
                    this.bedList.forEach(result => {
                        let bedFeatureList: string;
                        result.BedFeature.forEach(bed => {
                          if (!bedFeatureList)
                            bedFeatureList = bed.BedFeatureName;
                          else
                            bedFeatureList = bedFeatureList + " , " + bed.BedFeatureName;
                           });
                        result.BedFeatures = bedFeatureList;
                      });
                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                }

            });
    }

    BedGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                if (!$event.Data.IsOccupied) {
                    this.selectedItem = null;
                    //this.index = $event.RowIndex;
                    this.selectedID = $event.Data.BedId;
                    this.showAddPage = false;
                    this.changeDetector.detectChanges();
                    this.selectedItem = $event.Data;
                    this.showAddPage = true;
                }
                else {
                    this.msgBoxServ.showMessage("failed", ["Cannot modify occupied beds."]);
                }

            }
            default:
                break;
        }
    }
    AddBed() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
       
        // if (this.selectedID != null) {
           // let i = this.bedList.findIndex(a => a.BedId == this.selectedID);
          //  this.bedList.splice(i, 1);
          //  this.bedList.splice(i, 0, $event.bed);
            this.getBedList();
        // }
     
        // else {
          
        //     this.bedList.push($event.bed);
        // }
        // this.bedList = this.bedList.slice();
    //    this.getBedList();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedItem = null;
        this.selectedID = null;
    }
}
