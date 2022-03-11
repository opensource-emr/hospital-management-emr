import { Component } from '@angular/core';
import { HelpDeskBLService } from '../shared/helpdesk.bl.service'
import { HlpDskWardInfo } from '../shared/ward-info.model';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';


@Component({
  templateUrl: "./ward-info.html"
})

export class HlpDskWardInfoComponent {

  wardinfo: Array<any> = new Array<any>();
  wardinfoGridColumns: Array<any> = null;

  constructor(public helpDeskBLService: HelpDeskBLService,
    public msgBoxServ: MessageboxService) {
    //needs to clear previously selected employee

    this.LoadWardInfo();
    this.wardinfoGridColumns = GridColumnSettings.WardInfoSearch;
  }
  LoadWardInfo(): void {
    this.helpDeskBLService.LoadWardInfo()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.wardinfo = res.Results;
          // this.wardinfo = this.wardinfo.filter(a=>a.Total>0);
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);

        }
      });
  }
}
