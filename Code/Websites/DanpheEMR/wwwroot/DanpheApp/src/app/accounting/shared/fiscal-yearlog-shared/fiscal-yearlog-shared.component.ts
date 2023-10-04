import { Component, Input, Output, EventEmitter } from "@angular/core";
import  GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";
import { AccountingSettingsBLService } from "../../settings/shared/accounting-settings.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";


@Component({
    selector: "fiscal-yearlog-shared",
    templateUrl: "./fiscal-yearlog-shared.component.html"
})
export class fiscalyearlogSharedComponent {
    public fsyearactivityList: Array<any> = null;
    public fsyearactivityGridColumns: Array<any> = null;
    public loadDetail: boolean = false;
    @Input('loadDetail')
    public set reloadfsDetails(_reloadDetails) {
      this.loadDetail = _reloadDetails;    
      if (this.loadDetail) {
        this.getfsyearactivitydetail();
      }
    }
       
    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public msgBox: MessageboxService,) {
        this.fsyearactivityGridColumns = GridColumnSettings.fsyearactivity;
        this.getfsyearactivitydetail();
           
    }

    public getfsyearactivitydetail() {
        this.accountingSettingsBLService.getfsyearactivitydetail()
          .subscribe(res => {
            if (res.Status == "OK") {
              this.fsyearactivityList = res.Results;
             
            }
            else {
              alert("Failed ! " + res.ErrorMessage);
            }
    
          });
      }


}
