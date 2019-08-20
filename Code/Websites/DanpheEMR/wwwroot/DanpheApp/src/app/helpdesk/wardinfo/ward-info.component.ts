import { Component } from '@angular/core';
import { HelpDeskBLService } from '../shared/helpdesk.bl.service'
import { WardInfo } from '../shared/ward-info.model';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';


@Component({
    providers: [HelpDeskBLService],
    templateUrl: "../../view/helpdesk-view/WardInformation.html"  //"/HelpdeskView/WardInformation"
})

export class WardInfoComponent {

    wardinfo: Array<WardInfo> = new Array<WardInfo>();
    wardBedInfo: WardInfo = new WardInfo();
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
                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);

                }
            });
    }
}