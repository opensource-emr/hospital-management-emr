import { Component, Directive, ViewChild } from '@angular/core';
import { SystemAdminBLService } from '../shared/system-admin.bl.service';

import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from "../../core/shared/core.service";
import { AuditTrailModel } from "../shared/audit-trail-model";
import { RbacUser } from "../shared/rabac-user";
import { LoginInformationModel } from '../shared/login-information.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../shared/danphe-grid/NepaliColGridSettingsModel';


@Component({
  templateUrl: "./auditTrail.html"
})
export class AuditTrailComponent {


  public loading: boolean = false;
  public FromDate: string = null;
  public ToDate: string = null;
  public IsVAlidDate: boolean = false;
  public ActionName: string = '';

  public UserName: string = '';
  public Table_Name: string = '';
  public CurrentAudit: AuditTrailModel = new AuditTrailModel();
  public auditTrailGridColumns: Array<any> = null;
  public loginInfoGridColumns: Array<any> = null;
  public auditTrailData: Array<AuditTrailModel> = new Array<AuditTrailModel>();
  public userNameList: Array<any> = new Array<any>();
  public tableNameList: Array<any> = Array<any>();
  public auditUserName: RbacUser = new RbacUser();
  public auditTableName: AuditTrailModel = new AuditTrailModel();
  actionList: Array<string> = new Array<string>();

  public loginList: Array<LoginInformationModel> = new Array<LoginInformationModel>();
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = null;
  tableNameMappingList: any = [];
  public reportHeaderHtml_auditTrail: string = '';
  public reportHeaderHtml_loginInfo: string = '';

  public showPrintButton: boolean = true;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public ConvertToNepaliDate: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(private systemAdminBLService: SystemAdminBLService,
    private msgBoxServ: MessageboxService,
    private coreService: CoreService) {
    this.tableNameList = new Array<any>();
    this.userNameList = new Array<any>();
    this.CurrentAudit.FromDate = moment().format('YYYY-MM-DD');
    this.CurrentAudit.ToDate = moment().format('YYYY-MM-DD');
    this.auditTrailGridColumns = GridColumnSettings.AuditTrailDetails;
    this.loginInfoGridColumns = GridColumnSettings.CustomAuditTrailDetails;
    this.auditUserName = new RbacUser();
    this.auditTableName = new AuditTrailModel();    
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("InsertedDate", true));
    this.ConvertToNepaliDate.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("CreatedOn", true));

    this.dateRange = "last1Week";


    this.GetLoginInfoData(null, null);


    //this.GetAuditTrailDetails();
    this.GetAuditData();
    this.GetDBActivityActionList();
  }

  GetLoginInfoData(frmDate, toDate) {
    this.systemAdminBLService.GetLogInInfo(frmDate, toDate)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            this.reportHeaderHtml_loginInfo = this.coreService.GetReportHeaderParameterHTML(moment(frmDate).format('YYYY-MM-DD'),
            moment(toDate).format('YYYY-MM-DD'), ('Login Information Report')
          );
            this.loginList = res.Results;
          }
        });
  }


  //this function load all Audit Trail details
  GetAuditData() {
    this.systemAdminBLService.GetAuditList()
      .subscribe(
        res => {
          if (res.Status == "OK") {
            res.Results.UserList.forEach(element => {
              element['UserNameValue'] = element['UserName'];
            });
            this.userNameList = res.Results.UserList;
            this.tableNameList = res.Results.TableNameList;
            this.tableNameMappingList = res.Results.TableDisplayNameMap;
          } else {
            this.msgBoxServ.showMessage("failed", ['Failed to get Audit list.' + res.ErrorMessage]);
          }
        },
      );
  }

  GetDBActivityActionList(): void {
    try {
      // currently list is hard-coded
      this.actionList = ['CREATE', 'ALTER', 'DROP', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TABLE', 'VIEW', 'TRIGGER', 'STORED_PROCEDURE', 'SCHEMA', 'LOGIN_INFO', 'SERVER_ACTIVITY'];
    } catch (ex) {
      this.msgBoxServ.showMessage('error', [ex]);
    }
  }

  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetLoginInfoData(this.fromDate, this.toDate)
      } else {
        this.msgBoxServ.showMessage("failed", ['Please enter valid From date and To date']);
      }

    }
  }

  onDateChangeForAuditTrail($event){
    this.CurrentAudit.FromDate = $event.fromDate;
    this.CurrentAudit.ToDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.CurrentAudit.FromDate).isBefore(this.CurrentAudit.ToDate) || moment(this.CurrentAudit.FromDate).isSame(this.CurrentAudit.ToDate)) {
        this.ShowAuditTrailDetails();
      } else {
        this.msgBoxServ.showMessage("failed", ['Please enter valid From date and To date']);
      }

    }
  }


  //Get all details of Audit Trail
  ShowAuditTrailDetails() {

    this.systemAdminBLService.GetAuditTrailDetails(this.CurrentAudit, this.Table_Name, this.UserName, this.ActionName)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length > 0) {
          this.reportHeaderHtml_auditTrail = this.coreService.GetReportHeaderParameterHTML(moment(this.CurrentAudit.FromDate).format('YYYY-MM-DD'),
            moment(this.CurrentAudit.ToDate).format('YYYY-MM-DD'), ('Audit Trail Report')
          );
          this.auditTrailData = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected Parameters...Try Different']);
        }
      });

  }


  onChangeUserName($event) {
    try {
      const arr = [];
      $event.forEach(element => {
        arr.push(element.UserName);
      });
      this.UserName = arr.join(',');
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  onChangeTableName($event) {
    try {
      const arr = [];
      $event.forEach(element => {
        arr.push(element.Table_Name);
      });
      this.Table_Name = arr.join(',');
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  userNameFormatter(data: any): string {
    let html = data["UserName"];
    return html;
  }


  tableNameFormatter(data: any): string {
    let html = data['TableDisplayName'];
    return html;
  }

  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'SqlDBActivityLogDetails_' + moment().format('YYYY-MM-DD') + '.xls',
  };
}

