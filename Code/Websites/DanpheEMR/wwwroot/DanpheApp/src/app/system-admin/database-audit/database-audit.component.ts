import { Component, Directive, ViewChild } from '@angular/core';
import { SystemAdminBLService } from '../shared/system-admin.bl.service';
import { SqlAuditModel } from "../shared/sql-audit.model"
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from "../../core/shared/core.service"


@Component({
    templateUrl: "../../view/system-admin-view/DatabaseAudit.html" // "/SystemAdminView/DatabaseAudit"
})
export class DatabaseAuditComponent {
    //string list of Activity Action   
    public list: Array<string> = new Array<string>();
    // public actType: string;
    public toDate: string = "";
    public fromDate: string = "";
    public actionName: any;
    public loading: boolean = false;
    public actionList: Array<string> = new Array<string>();
    public databaseAuditLogGridColumns: Array<any> = null;
    public databaseAuditLogData: Array<SqlAuditModel> = new Array<SqlAuditModel>();

    constructor(public systemAdminBLService: SystemAdminBLService, public msgBoxServ: MessageboxService, public coreService: CoreService) {
        this.GetDBActivityActionList();
        this.databaseAuditLogGridColumns = GridColumnSettings.SqlAuditLog;
        this.fromDate = moment().format('YYYY-MM-DD');
        this.toDate = moment().format('YYYY-MM-DD');
    }

    GetDBActivityActionList(): void {
        try {
            this.list = ["CREATE", "ALTER", "DROP", "SELECT", "INSERT", "UPDATE", "DELETE", "TABLE", "VIEW", "TRIGGER", "STORED_PROCEDURE", "SCHEMA", "LOGIN_INFO", "SERVER_ACTIVITY"];
        } catch (ex) {
            this.msgBoxServ.showMessage("error", [ex]);
        }
    }

    //This method after selected Action from dropdown   
    SelectedAction(actionName) {
        if (actionName && this.fromDate && this.toDate) {
            this.actionName = actionName;
        } else {
            this.msgBoxServ.showMessage("notice", ['Please select FromDate,ToDate then select Action']);
        }
    }
    //Get all details of Database activity log
    ShowDBAuditDetails() {
        if ((this.fromDate && this.toDate) && this.actionName) {
            this.loading = true;
            this.systemAdminBLService.GetDBAuditLogDetails(this.fromDate, this.toDate, this.actionName).
                subscribe(res => {
                    if (res.Status == 'OK') {
                        this.databaseAuditLogData = res.Results;
                        this.loading = false;
                    }
                    else if (res.Status == 'Failed') {
                        this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                        this.loading = false;
                    }
                },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to load database audit details, Please try again.']);
                    this.loading = false;
                });
        } else {
            this.msgBoxServ.showMessage("notice", ['Please select Action,FromDate,ToDate']);
        }
    }
    //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'SqlDBActivityLogDetails_' + moment().format('YYYY-MM-DD') + '.xls',
    };
}