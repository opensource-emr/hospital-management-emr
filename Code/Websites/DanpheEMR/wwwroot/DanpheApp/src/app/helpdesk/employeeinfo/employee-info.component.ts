import { Component } from '@angular/core';
import { HelpDeskBLService } from '../shared/helpdesk.bl.service'
import { HlpDskEmployeeInfo } from '../shared/employeeinfo.model';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';

@Component({
  templateUrl: "./employee-info.html"
})

export class HlpDskEmployeeInfoComponent {

  employeeinfo: Array<HlpDskEmployeeInfo> = new Array<HlpDskEmployeeInfo>();
  employeeinfoGridColumns: Array<any> = null;

  constructor(public helpDeskBLService: HelpDeskBLService,
    public msgBoxServ: MessageboxService) {
    //needs to clear previously selected employee
    this.LoadEmployeeInfo();
    this.employeeinfoGridColumns = GridColumnSettings.EmployeeInfoSearch;
  }
  LoadEmployeeInfo(): void {
    this.helpDeskBLService.LoadEmployeeInfo()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.employeeinfo = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);

        }
      });
  }
}
