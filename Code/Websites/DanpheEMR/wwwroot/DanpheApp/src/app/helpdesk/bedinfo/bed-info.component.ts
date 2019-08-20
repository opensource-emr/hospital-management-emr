import { Component } from '@angular/core';
import { HelpDeskBLService } from '../shared/helpdesk.bl.service'
import { BedInfo } from '../shared/bed-info.model';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';

import { MessageboxService } from '../../shared/messagebox/messagebox.service';


@Component({
    providers: [HelpDeskBLService],
    templateUrl: "../../view/helpdesk-view/BedInformation.html" //"/HelpdeskView/BedInformation"

})

export class BedInfoComponent {
    public stats:any = ""; // = new Object();
    bedinfo: Array<BedInfo> = new Array<BedInfo>();
    searchBedInfo: BedInfo = new BedInfo();
    bedinfoGridColumns: Array<any> = null;

    constructor(
        public helpDeskBLService: HelpDeskBLService,
        public msgBoxServ: MessageboxService) {
        this.LoadBedInfo();
        this.bedinfoGridColumns = GridColumnSettings.BedInfoSearch;
    }

    LoadBedInfo(): void {
        this.helpDeskBLService.LoadBedInfo()
            .subscribe(res => {
                if (res.Status == "OK") {
                    let data = JSON.parse(res.Results.JsonData);
                    this.stats = data.LabelData[0];
                    this.bedinfo = data.BedList;
                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                }
            });
    }
}