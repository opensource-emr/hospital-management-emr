import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuditTrailModel } from "./audit-trail-model";

@Injectable()
export class SystemAdminDLService {
    public http: HttpClient;
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    constructor(_http: HttpClient) {
        this.http = _http;
  }
  public GetSystemAdmin() {
    return this.http.get<any>("/api/SystemAdmin?reqType=get-system-admin");
  }

    //GET:
    //This method for get all
    public GetDBBakupLog() {
        return this.http.get<any>("/api/SystemAdmin?reqType=getDBBakupLog");
    }
    //GET:
    //This method for get all
    public GetAuditList() {
        return this.http.get<any>("/api/SystemAdmin?reqType=get-audit-list", this.options);
    }
  public GetLogInInfo(frmdate, todate) {
      return this.http.get<any>("/api/SystemAdmin?reqType=get-login-info&FromDate=" + frmdate + "&ToDate=" + todate, this.options);
    }
    //GET:
    //Get all Billing Invoice Details
    public GetInvoiceDetails(fromDate, toDate) {
        return this.http.get<any>("/api/SystemAdmin?reqType=getIRDInvoiceDetails" + "&FromDate=" + fromDate + "&ToDate=" + toDate);
    }
    //GetPhrmInvoiceDetails
    public GetPhrmInvoiceDetails(fromDate, toDate) {
        return this.http.get<any>("/api/SystemAdmin?reqType=getPhrmIRDInvoiceDetails" + "&FromDate=" + fromDate + "&ToDate=" + toDate);
    }
    //GET:
    //Get all Database activity log details
    public GetDBAuditLogDetails(fromDate, toDate, actionName) {
        return this.http.get<any>("/api/SystemAdmin?reqType=getDbActivityLogDetails" + "&FromDate=" + fromDate + "&ToDate=" + toDate + "&LogType=" + actionName);
    }
    //Get all Audit Trail details
    public GetAuditTrailDetails(CurrentAudit: AuditTrailModel, Table_Name, UserName, ActionName) {
        return this.http.get<any>("/api/SystemAdmin?reqType=get-audit-trail-details&FromDate=" + CurrentAudit.FromDate + "&ToDate=" + CurrentAudit.ToDate + "&Table_Name=" + Table_Name + "&UserName=" + UserName + "&ActionName=" + ActionName, this.options);
    }

    //POST:
    //This method for take database backup
    public TakeDatabaseBackup() {
        // why would any one post with out data WTF
        return this.http.post<any>("/api/SystemAdmin?reqType=databaseBackup", null);
    }
    //POST:
    //This method for restore database file
    public RestoreDatabase(databaseBackupObjString: string) {
        let data = databaseBackupObjString;
        return this.http.post<any>("/api/SystemAdmin?reqType=databaseRestore", data);
    }
    ////POST:
    ////This method for export database as csv/xml files
    //public PostExportDBToCSVOrXML(exportType: string) {
    //    return this.http.post<any>("/api/SystemAdmin?reqType=exportDBToCSVOrXML&ExportType=" + exportType, this.options);
    //}
    //POST:
    //This method for export database as csv/xml files
    public PostExportDBToCSVOrXmlOrPdf(exportType: string) {
        // sick we are making a post call and passing
        // data through query string
        return this.http.post<any>("/api/SystemAdmin?reqType=exportDBToCSVOrXMLOrPDF&ExportType=" + exportType, null);
    }
}
