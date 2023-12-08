import { Component } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { ENUM_DanpheHTTPResponseText } from "../../../shared/shared-enums";
import { AccountingService } from "../../shared/accounting.service";
import { AccountingReportsBLService } from "../shared/accounting-reports.bl.service";
import { CustomerHeader } from "../subledger-report/subledger-report-vm";

@Component({
    templateUrl: "./account-head-detail-report.component.html",
    styleUrls: ['./account-head-detail-report.css']
})
export class AccountHeadDetailReportComponent {

    public Data: Array<any> = null;
    public ShowSubLedger: boolean = false;
    public ShowButton: boolean = false;
    public Loading: boolean = false;
    public DateRange: string = ``;
    public HeaderDetail: CustomerHeader = new CustomerHeader();
    public subLedgerAndCostCenterSetting = {
        "EnableSubLedger": false,
        "EnableCostCenter": false
    };

    constructor(public accReportBLService: AccountingReportsBLService, public accountingService: AccountingService,
        public securityService: SecurityService,
        public coreService: CoreService,
        public nepaliCalendarServ: NepaliCalendarService) {
        this.ReadParameter()
        this.accountingService.getCoreparameterValue();
    }



    ReadParameter() {
        var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName === `Common` && a.ParameterName === `CustomerHeader`).ParameterValue;
        if (paramValue) {
            this.HeaderDetail = JSON.parse(paramValue);
        }
        let subLedgerParma = this.coreService.Parameters.find(a => a.ParameterGroupName === "Accounting" && a.ParameterName === "SubLedgerAndCostCenter");
        if (subLedgerParma) {
            this.subLedgerAndCostCenterSetting = JSON.parse(subLedgerParma.ParameterValue);
        }
    }
    LoadData() {
        this.Loading = true;
        this.accReportBLService.GetAccountHeadDetailReport()
            .finally(() => { this.Loading = false; })
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.Data = res.Results;
                    this.ShowButton = true;
                }
            })
    }

    Print(tableId) {
        this.accountingService.Print(tableId, this.DateRange)

    }
    ExportToExcel(tableId) {
        this.accountingService.ExportToExcel(tableId, this.DateRange);
    }
}


