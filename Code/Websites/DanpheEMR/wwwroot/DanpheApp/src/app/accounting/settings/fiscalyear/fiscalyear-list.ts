
import { Component, ChangeDetectorRef } from "@angular/core";

import { FiscalYearModel } from '../shared/fiscalyear.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';

@Component({
    selector: 'fiscalyear-list',
    templateUrl: './fiscalyear-list.html',
})
export class FiscalYearListComponent {
    public fiscalYearList: Array<FiscalYearModel> = new Array<FiscalYearModel>();
    public showFiscalYearList: boolean = true;
    public fiscalYearGridColumns: Array<any> = null;
    public showAddPage: boolean = false;
    public selectedFiscalYear: FiscalYearModel;
    public index: number;

    constructor(
        public accountingSettingsBLService: AccountingSettingsBLService,
        public msgBox: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        this.fiscalYearGridColumns = GridColumnSettings.FiscalYearList;
        this.getFiscalYearList();
    }
    public getFiscalYearList() {
        this.accountingSettingsBLService.GetFiscalYearList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.fiscalYearList = res.Results;
                    for (var i = 0; i < this.fiscalYearList.length; i++) {
                        this.fiscalYearList[i].StartDate = moment(this.fiscalYearList[i].StartDate).format("YYYY-MM-DD");
                        this.fiscalYearList[i].EndDate = moment(this.fiscalYearList[i].EndDate).format("YYYY-MM-DD");
                    }
                    this.showFiscalYearList = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }
            });
    }

    AddNewFiscalYear() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        let curtFiscalLen = $event.currentFiscal[0];
        curtFiscalLen.StartDate = moment(curtFiscalLen.StartDate).format("YYYY-MM-DD");
        curtFiscalLen.EndDate = moment(curtFiscalLen.EndDate).format("YYYY-MM-DD");
        this.fiscalYearList.push(curtFiscalLen);
        if (this.index)
            this.fiscalYearList.splice(this.index, 1);
        this.fiscalYearList = this.fiscalYearList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.index = null;
    }
    FiscalYearGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "endFiscalYear": {
                this.selectedFiscalYear = null;
                this.index = $event.RowIndex;
                this.selectedFiscalYear = $event.Data;
                this.DeactivateFiscalYearStatus(this.selectedFiscalYear)
                this.showFiscalYearList = true;
            }
            default:
                break;
        }
    }

    DeactivateFiscalYearStatus(selecttedFiscalYr: FiscalYearModel) {
        if (selecttedFiscalYr != null) {
            let status = selecttedFiscalYr.IsActive == true ? false : true;
            let msg = status == true ? 'Start' : 'End';
            if (confirm("Are you Sure want to " + msg + ' ' + selecttedFiscalYr.FiscalYearName + ' ?')) {

                selecttedFiscalYr.IsActive = status;
                //we want to update the ISActive property in table there for this call is necessry
                this.accountingSettingsBLService.UpdateFiscalYearStatus(selecttedFiscalYr)
                    .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            let responseMessage = res.Results.IsActive ? "is now activated." : "is now Deactivated.";
                            this.msgBox.showMessage("success", [res.Results.FiscalYearName + ' ' + responseMessage]);
                            //This for send to callbackadd function to update data in list
                            this.getFiscalYearList();
                        }
                        else {
                            this.msgBox.showMessage("error", ['Something wrong' + res.ErrorMessage]);
                        }
                    },
                    err => {
                        this.logError(err);
                    });
            }
        }
    }

    logError(err: any) {
        console.log(err);
    }

}