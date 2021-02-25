import { Injectable, Directive } from '@angular/core';
import { SystemAdminDLService } from './system-admin.dl.service';
import { SecurityService } from '../../security/shared/security.service';
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { DatabaseLogModel } from "../shared/database-log.model"
import { jsonpCallbackContext } from '@angular/common/http/src/module';


@Injectable()
export class SystemAdminBLService {
    constructor(public systemAdminDLService: SystemAdminDLService,
        public securityService: SecurityService) {
    }

  public GetSystemAdmin() {
    return this.systemAdminDLService.GetSystemAdmin().map(res => res);
  }

    //GET:
    //Method for get all database backup log
    public GetDBBakupLog() {
        return this.systemAdminDLService.GetDBBakupLog()
            .map(res => res);
    }
    //GET:
    //Method for get all Database Activity Log details
    //this.systemAdminBLService.GetDBAuditLogDetails(this.fromDate, this.toDate, this.actionName).
    public GetDBAuditLogDetails(fromDate, toDate, actionName) {
        return this.systemAdminDLService.GetDBAuditLogDetails(fromDate, toDate, actionName)
            .map(res => res);
    }
    //GET:
    public GetInvoiceDetails(fromDate, toDate) {
        return this.systemAdminDLService.GetInvoiceDetails(fromDate, toDate)
            .map(res => res);
        //GET:

    }
    public GetAuditList() {
        return this.systemAdminDLService.GetAuditList()
            .map(res => res);
  }
  public GetLogInInfo(frmDate, toDate) {
    return this.systemAdminDLService.GetLogInInfo(frmDate, toDate)
      .map(res => res);
  }
    //GET:
    public GetPhrmInvoiceDetails(fromDate, toDate) {
        return this.systemAdminDLService.GetPhrmInvoiceDetails(fromDate, toDate)
            .map(res => res);
    }
    //GET:
    public GetAuditTrailDetails(CurrentAudit, Table_Name, UserName, ActionName = '') {
        return this.systemAdminDLService.GetAuditTrailDetails(CurrentAudit, Table_Name, UserName, ActionName)
            .map((responseData) => {
                return responseData;
            });
    }

    //POST:
    //Method for take Database Backup
    public TakeDatabaseBackup() {
        return this.systemAdminDLService.TakeDatabaseBackup()
            .map(res => res);
    }
    //POST:
    //Method for restore Database file
    public RestoreDatabase(databaseLogModel: DatabaseLogModel) {
        let data = JSON.stringify(databaseLogModel);
        return this.systemAdminDLService.RestoreDatabase(data)
            .map(res => res);
    }
    ////POST:
    ////Method for Export Database as CSV/XML files on client machine
    //public ExportDBToCSVOrXML(exportType: string) {
    //    return this.systemAdminDLService.PostExportDBToCSVOrXML(exportType)
    //        .map(res => res);
    //}

    //POST:
    //Method for Export Database as CSV/XML files on client machine
    public ExportDBToCSVOrXmlOrPdf(exportType: string) {
        return this.systemAdminDLService.PostExportDBToCSVOrXmlOrPdf(exportType)
            .map(res => res);
    }


}
