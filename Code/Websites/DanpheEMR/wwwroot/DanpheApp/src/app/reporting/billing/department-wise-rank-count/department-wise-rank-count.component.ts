import { Component } from "@angular/core";
import * as moment from "moment";
import { Rank_ApfHospital } from "../../../appointments/visit/visit-patient-info.component";
import { CoreBLService } from "../../../core/shared/core.bl.service";
import { CoreService } from "../../../core/shared/core.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { IGridFilterParameter } from "../../../shared/danphe-grid/grid-filter-parameter.interface";
import { DLService } from "../../../shared/dl.service";
import { ENUM_DanpheHTTPResponseText } from "../../../shared/shared-enums";
import { ReportingService } from "../../shared/reporting-service";

@Component({
    templateUrl: './department-wise-rank-count.component.html',
    styleUrls: ['./department-wise-rank-count.component.css']
})
export class DepartmentWiseRankCountReportComponent {
    DepartmentWiseRankCountGridColumns: Array<any> = [];
    DepartmentList: Array<Department> = new Array<Department>();
    RankList: Array<Rank_ApfHospital> = new Array<Rank_ApfHospital>();
    FromDate: string = moment().format('YYYY-MM-DD');
    ToDate: string = moment().format('YYYY-MM-DD');
    loading: boolean = false;
    DepartmentWiseRankCountReportData: any[] = [];
    dateRange: string = '';

    FilterParameters: IGridFilterParameter[] = [];
    DepartmentIds: string = '';
    preselectedDepartment: Department[] = [];
    preSelectedRanks: Rank_ApfHospital[] = [];
    RankNameCSV: string = '';
    DepartmentNameCSV: string = '';

    constructor(public reportServ: ReportingService, public coreService: CoreService, public coreBlService: CoreBLService, public dlService: DLService) {
        this.LoadDepartments();

    }
    ngOnInit(): void {
        this.GetRanks();

    }

    LoadDepartments(): void {
        this.DepartmentList = [];
        this.dlService.getDepartment().subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.DepartmentList = res.Results;
            }
        })
    }
    GetRanks(): void {
        this.dlService.GetRank().subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.RankList = [];
                this.RankList = res.Results;
            }
        });
    }

    GetDepartmentWiseRankCountReportData(): void {
        this.FilterParameters = [
            { DisplayName: "DateRange:", Value: this.dateRange },
            { DisplayName: "Rank:", Value: this.RankNameCSV == undefined || this.RankNameCSV == '' || this.RankNameCSV == null ? 'All' : this.RankNameCSV },
            { DisplayName: "DepartmentName:", Value: this.DepartmentNameCSV == undefined || this.DepartmentNameCSV == '' || this.DepartmentNameCSV == null ? 'All' : this.DepartmentNameCSV },
        ]
        this.loading = true;
        this.dlService.LoadDepartmentWiseRankCountReportData(this.FromDate, this.ToDate, this.DepartmentIds, this.RankNameCSV).finally(() => {
            this.loading = false;
        }).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.DepartmentWiseRankCountReportData = res.Results;

                let Columns = [];
                let ReportColumns = [];
                for (let key in this.DepartmentWiseRankCountReportData[0]) {
                    Columns.push(key);
                }
                for (let column of Columns) {
                    let obj = null;
                    obj = { headerName: column, field: column, width: 150 }

                    ReportColumns.push(obj);
                }
                this.DepartmentWiseRankCountGridColumns = ReportColumns;
            }
        })
    }
    DepartmentFormatter(data: Department): string {
        return data["DepartmentName"];
    }
    RankFormatter(data: Rank_ApfHospital): string {
        return data["RankName"];
    }
    OnDepartmentChange($event) {
        let departmentIds = [];
        let departmentNames = [];
        if ($event.length > 0) {
            $event.forEach(x => {
                departmentIds.push(x.DepartmentId);
                departmentNames.push(x.DepartmentName);
            });
            let departmentIdCSV = '';
            if (departmentIds.length > 0) {
                departmentIdCSV = departmentIds.join(",");
                this.DepartmentIds = departmentIdCSV;
            }
            if (departmentNames.length > 0) {
                let departmentNameCSV = departmentNames.join(",");
                this.DepartmentNameCSV = departmentNameCSV;
            }
        }
        else {
            this.DepartmentNameCSV = ''
        }


    }
    OnRankChange($event) {
        let Ranks = [];
        if ($event.length > 0) {
            $event.forEach(x => {
                Ranks.push(x.RankName);
            });
            let RankNameCSV = '';
            if (Ranks.length > 0) {
                RankNameCSV = Ranks.join(",");
                this.RankNameCSV = RankNameCSV;
            }
        }
        else {
            this.RankNameCSV = '';
        }


    }
    gridExportOptions = {
        fileName: 'DepartmentWiseRankCountReport' + moment().format('YYYY-MM-DD') + '.xls',
    };
    OnFromToDateChange($event) {
        if ($event) {
            this.FromDate = $event.fromDate;
            this.ToDate = $event.toDate;
            this.dateRange = "<b>Date:</b>&nbsp;" + this.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.ToDate;
        }
    }
}

class Department {
    DepartmentId: number = null;
    DepartmentName: string = '';
}