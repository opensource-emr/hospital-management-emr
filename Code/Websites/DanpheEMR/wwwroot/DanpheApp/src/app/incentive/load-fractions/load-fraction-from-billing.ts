import { Component, Input, Output, EventEmitter, Renderer2, OnInit } from '@angular/core'
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { DLService } from '../../shared/dl.service';
import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';

@Component({
  templateUrl: "./load-fraction-from-billing.html"
})
export class INCTV_LoadFractionFromBilling {
  public fromDate: string = moment().format('YYYY-MM-DD');
  public toDate: string = moment().format('YYYY-MM-DD');
  public calType: string = '';

  constructor(public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public coreservice: CoreService) {
    this.LoadCalenderTypes();
  }

  LoadUptoDateFractionTransactions() {
    console.log('syncing....');
    let url = "/api/Incentive?reqType=load-uptodate-transactions&fromDate=" + this.fromDate + "&toDate=" + this.toDate;
    let data = null;
    this.dlService.Add(data, url).map(res => res).subscribe(res => {
      console.log(res);
      if (res.Status == "OK") {
        console.log("UptoDate..Fraction calculation completed.. ")
        this.msgBoxServ.showMessage("success", ["Successfully Synced Bills to Incentive."]);
      }
      else {
        this.msgBoxServ.showMessage("failed", ["Couldn't update fraction calculation data. Pls try again."]);
      }
    });
  }

  LoadCalenderTypes() {
    let allParams = this.coreservice.Parameters;
    if (allParams.length) {
      let CalParms = allParams.find(a => a.ParameterName == "CalendarTypes" && a.ParameterGroupName == "Common");
      if (CalParms) {
        let Obj = JSON.parse(CalParms.ParameterValue);
        this.calType = Obj.IncentiveModule;
      }
    }
  }

    //sud:28May'20--For Reusable From-Date-To-Date component
    OnDateRangeChange($event) {
      if ($event) {
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
      }
    }

}
