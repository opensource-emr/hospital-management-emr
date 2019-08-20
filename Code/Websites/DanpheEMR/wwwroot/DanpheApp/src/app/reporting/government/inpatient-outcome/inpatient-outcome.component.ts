import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService} from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

import { RPT_GOVT_InpatientOutcomeModel } from './Inpatient-outcome.model';
import { DynamicGovernmentReport } from "../../shared/dynamic-gov-report.model";
import { DLService } from "../../../shared/dl.service";
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
@Component({
  templateUrl: "./inpatient-outcome.html"
})
export class RPT_GOVT_InpatientOutcomeComponent {
    
    public displayReport: boolean = false;

  public InpatientOutcomeTable: Array<RPT_GOVT_InpatientOutcomeModel> = new Array<RPT_GOVT_InpatientOutcomeModel>();

    public currentInpatientOutcome: DynamicGovernmentReport = new DynamicGovernmentReport();

    constructor(public http: HttpClient, public dlService: DLService, public msgBoxServ: MessageboxService) {
        this.currentInpatientOutcome.fromDate = moment().format('YYYY-MM-DD');
        this.currentInpatientOutcome.toDate = moment().format('YYYY-MM-DD');
    }

    gridExportOptions = {
        fileName: 'InpatientOutcome' + moment().format('YYYY-MM-DD') + '.xls',
        //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']
    };

    Print() {
        let popupWindow;
        var printContents = document.getElementById("printpage").innerHTML;
        popupWindow = window.open('', '_blank', 'width=800,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWindow.document.open();
        popupWindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css" /></head><style type="text/css">.Selected {border-collapse: collapse; border-spacing: 5px; border: 1px solid black;padding: 5px;}</style><body onload="window.print()">' + printContents + '</body></html>');
        popupWindow.document.close();
    }

    Load() {
        this.dlService.Read("/GovernmentReporting/GetInpatientOutcome?FromDate="
            + this.currentInpatientOutcome.fromDate + "&ToDate=" + this.currentInpatientOutcome.toDate)
            .map(res => res)
            .subscribe(res => this.Success(res),
            err => this.Error(err));
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
    }
    Success(res) {
        if (res.Status == "OK") {
            this.InpatientOutcomeTable = JSON.parse(res.Results.InpatientoutcomeModel);
            //For displaying the Template only after the search click
            this.displayReport = true;
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
    }
}
