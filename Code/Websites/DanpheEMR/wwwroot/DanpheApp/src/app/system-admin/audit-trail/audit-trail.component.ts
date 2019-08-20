import { Component, Directive, ViewChild } from '@angular/core';
import { SystemAdminBLService } from '../shared/system-admin.bl.service';

import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from "../../core/shared/core.service";
import { AuditTrailModel } from "../shared/audit-trail-model";
import { RbacUser } from "../shared/rabac-user";
import { LoginInformationModel } from '../shared/login-information.model';


@Component({
  //templateUrl: "../../view/system-admin-view/AuditTrail.html"
  templateUrl: "./auditTrail.html"
})
export class AuditTrailComponent {


  private loading: boolean = false;
  public FromDate: string = null;
  public ToDate: string = null;
  private IsVAlidDate: boolean = false;
  private actionName: any;

  private UserName: any;
  private Table_Name: any;
  public CurrentAudit: AuditTrailModel = new AuditTrailModel();
  public auditTrailGridColumns: Array<any> = null;
  private auditTrailData: Array<AuditTrailModel> = new Array<AuditTrailModel>();
  private userNameList: Array<any> = new Array<any>();
  private tableNameList: Array<any> = Array<any>();
  private auditUserName: RbacUser = new RbacUser();
  private auditTableName: AuditTrailModel = new AuditTrailModel();


  public loginList: Array<LoginInformationModel> = new Array<LoginInformationModel>();
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = null;

  constructor(private systemAdminBLService: SystemAdminBLService,
    private msgBoxServ: MessageboxService,
    private coreService: CoreService) {

    this.tableNameList = new Array<any>();
    this.userNameList = new Array<any>();
    this.CurrentAudit.FromDate = moment().format('YYYY-MM-DD');
    this.CurrentAudit.ToDate = moment().format('YYYY-MM-DD');

    //this.auditTrailGridColumns = GridColumnSettings.AuditTrailDetails;
    //this.GetAuditTrailDetails();

    this.auditTrailGridColumns = GridColumnSettings.CustomAuditTrailDetails;
    this.dateRange = "last1Week";


    this.GetAuditData(null, null);
  }

  //this function load all Audit Trail details
  //GetAuditData() {
  //    this.systemAdminBLService.GetAuditList()
  //        .subscribe(
  //            res => {
  //                if (res.Status == "OK") {
  //                    this.userNameList = res.Results.UserList;
  //                    this.tableNameList = res.Results.TableNameList;

  //                } else {
  //                    this.msgBoxServ.showMessage("failed", ['Failed to get Audit list.' + res.ErrorMessage]);
  //                }
  //            },
  //        );
  //}

  GetAuditData(frmDate, toDate) {
    this.systemAdminBLService.GetLogInInfo(frmDate, toDate)
      .subscribe(
        res => {
          if (res.Status == "OK") {
            this.loginList = res.Results;
          }
        });
  }


  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetAuditData(this.fromDate, this.toDate)
      } else {
        this.msgBoxServ.showMessage("failed", ['Please enter valid From date and To date']);
      }

    }
  }


  //Get all details of Audit Trail
  ShowAuditTrailDetails() {

    this.systemAdminBLService.GetAuditTrailDetails(this.CurrentAudit, this.Table_Name, this.UserName)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length > 0) {
          this.auditTrailData = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected Parameters...Try Different']);
        }
      });

  }


  onChangeUserName($event) {
    try {
      this.UserName = this.auditUserName.UserName;
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  onChangeTableName($event) {
    try {

      this.Table_Name = this.auditTableName.Table_Name;

    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  userNameFormatter(data: any): string {
    let html = data["UserName"];
    return html;
  }


  tableNameFormatter(data: any): string {
    let html = data["Table_Name"];
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
