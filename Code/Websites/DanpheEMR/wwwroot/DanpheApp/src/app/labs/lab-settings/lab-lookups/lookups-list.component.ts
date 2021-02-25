import { Component, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import LabGridColumnSettings from '../../shared/lab-gridcol-settings';
import { LabSettingsBLService } from '../shared/lab-settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { LabComponentModel } from '../../shared/lab-component-json.model';
import * as _ from 'lodash';
import { SettingsBLService } from '../../../settings-new/shared/settings.bl.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { GridEmitModel } from '../../../../../src/app/shared/danphe-grid/grid-emit.model';
import { CoreCFGLookUp } from '../shared/coreCFGLookUp.model';

@Component({
  templateUrl: './lookups-list.html'
})

export class LabLookUpComponent {
  public lookupsList: Array<CoreCFGLookUp> = new Array<CoreCFGLookUp>();
  public lookupsGridCol: Array<any> = null;

  public selectedLookup: CoreCFGLookUp = new CoreCFGLookUp();
  public rowIndex;

  public showAddLookupsComponent: boolean = false;

  public update: boolean = false;

  constructor(public labSettingBlServ: LabSettingsBLService, public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef, public settingsBLService: SettingsBLService) {
    this.lookupsGridCol = LabGridColumnSettings.LabLookUpsList;
    this.GetAllLookUpNames();
  }

  ngOnInit() {

  }

  GetAllLookUpNames() {
    this.labSettingBlServ.GetAllLabLookUpNames()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.lookupsList = res.Results;
        } else {
          this.msgBoxServ.showMessage("failed", ["Cannot Get the LookUp Name list for Lab Test Components"]);
        }
      });

  }


  public EditComponent(event: GridEmitModel) {
    switch (event.Action) {
      case "edit": {
        this.rowIndex = event.RowIndex;
        this.selectedLookup = new CoreCFGLookUp();
        this.selectedLookup = Object.assign(this.selectedLookup, event.Data);
        this.showAddLookupsComponent = false;
        this.changeDetector.detectChanges();
        this.showAddLookupsComponent = true;
        this.update = true;
      }
      default:
        break;
    }
  }

  public AddNewLookUpComponent() {
    this.selectedLookup = new CoreCFGLookUp();
    this.showAddLookupsComponent = false;
    this.changeDetector.detectChanges();
    this.showAddLookupsComponent = true;
    this.update = false;
  }

  public GetAddedAndUpdatedData($event) {
    if ($event.success) {
      this.showAddLookupsComponent = true;
      this.lookupsList[this.rowIndex] = $event.lookup;
      this.lookupsList = this.lookupsList.slice();
      this.changeDetector.detectChanges();
      this.showAddLookupsComponent = false;
      this.update = false;
    }
    else {
      this.showAddLookupsComponent = true;
      this.changeDetector.detectChanges();
      this.showAddLookupsComponent = false;
      this.update = false;
    }
  }

  Close() {
    this.selectedLookup = new CoreCFGLookUp();
    this.showAddLookupsComponent = false;
  }

}
