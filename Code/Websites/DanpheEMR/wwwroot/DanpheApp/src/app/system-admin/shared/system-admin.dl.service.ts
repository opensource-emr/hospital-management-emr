import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
    return this.http.get<any>("/api/SystemAdmin/SystemAdmin");
  }

  //GET:
  //This method for get all
  public GetDBBakupLog() {
    return this.http.get<any>("/api/SystemAdmin/DatabaseBakupLogs");
  }
  //GET:
  //This method for get all
  public GetAuditList() {
    return this.http.get<any>("/api/SystemAdmin/AuditList", this.options);
  }
  public GetLogInInfo(fromdate, todate) {
    return this.http.get<any>("/api/SystemAdmin/LoginInformation?fromDate=" + fromdate + "&toDate=" + todate, this.options);
  }
  //GET:
  //Get all Billing Invoice Details
  public GetInvoiceDetails(fromDate, toDate) {
    return this.http.get<any>("/api/SystemAdmin/IRDInvoiceDetails?fromDate=" + fromDate + "&toDate=" + toDate);
  }

  public GetAllInvoiceDetails(fromDate, toDate) {
    return this.http.get<any>(`/api/SystemAdmin/AllIRDInvoiceDetails?fromDate=${fromDate}&toDate=${toDate}`);
  }


  //GetPhrmInvoiceDetails
  public GetPhrmInvoiceDetails(fromDate, toDate) {
    return this.http.get<any>("/api/SystemAdmin/PharmacyIRDInvoiceDetails?fromDate=" + fromDate + "&toDate=" + toDate);
  }
  //GET:
  //Get all Database activity log details
  public GetDBAuditLogDetails(fromDate, toDate, actionName) {
    return this.http.get<any>("/api/SystemAdmin/DatabaseActivity?fromDate=" + fromDate + "&toDate=" + toDate + "&logType=" + actionName);
  }
  //Get all Audit Trail details
  public GetAuditTrailDetails(CurrentAudit: AuditTrailModel, Table_Name, UserName, ActionName) {
    return this.http.get<any>("/api/SystemAdmin/AuditTrialDetails?fromDate=" + CurrentAudit.FromDate + "&toDate=" + CurrentAudit.ToDate + "&table_Name=" + Table_Name + "&userName=" + UserName + "&actionName=" + ActionName, this.options);
  }

  //POST:
  //This method for take database backup
  public TakeDatabaseBackup() {
    // why would any one post with out data WTF
    return this.http.post<any>("/api/SystemAdmin/DatabaseBackup", null);
  }
  //POST:
  //This method for restore database file
  public RestoreDatabase(databaseBackupObjString: string) {
    let data = databaseBackupObjString;
    return this.http.post<any>("/api/SystemAdmin/RestoreDatabase", data);
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
    return this.http.post<any>("/api/SystemAdmin/ExportDatabase?ExportType=" + exportType, null);
  }
}
