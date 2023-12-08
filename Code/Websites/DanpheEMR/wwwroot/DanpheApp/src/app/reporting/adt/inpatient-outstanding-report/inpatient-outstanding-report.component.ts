import { Component } from "@angular/core";
import * as moment from "moment";
import { CoreService } from "../../../core/shared/core.service";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { InpatientOutstandingReport_DTO } from "../../shared/inpatient-outstanding-report.dto";
import { ReportingService } from "../../shared/reporting-service";

@Component({
    templateUrl: "./inpatient-outstanding-report.html",
})
export class RPT_ADT_InPatientOutstandingReport {
    InpatientOutstandingReportColumns: Array<any> = null;
    Operator: string = "";
    Amount: number = null;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    InpatientOutstandingReportList: Array<InpatientOutstandingReport_DTO> = new Array<InpatientOutstandingReport_DTO>();
    public OperatorFilters = [
        { FilterName: 'None', FilterValue: "" },
        { FilterName: 'LessThanOrEqualsTo', FilterValue: 'LessThanOrEqualsTo' },
        { FilterName: 'GreaterThanOrEqualsTo', FilterValue: 'GreaterThanOrEqualsTo' }
    ]

    constructor(public reportServ: ReportingService, public dlService: DLService, public msgBoxServ: MessageboxService, public coreService: CoreService
    ) {
        this.InpatientOutstandingReportColumns = this.reportServ.reportGridCols.InPatientOutstandingReportCols;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("AdmittedOn", false));
    }
    Load() {

        this.dlService
            .Read(
                "/Reporting/InpatientOutstandingReport?Operator=" +
                this.Operator +
                "&Amount=" +
                this.Amount
            )
            .map((res) => res)
            .subscribe(
                (res) => this.Success(res),
                (res) => this.Error(res)
            );
    }
    Success(res) {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results.length > 0) {
            this.InpatientOutstandingReportList = res.Results;
        }
    }
    Error(err) {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [err]);
    }
    gridExportOptions = {
        fileName:
            "InPatientOutstandingReport_" + moment().format("YYYY-MM-DD") + ".xls",
    };
}

