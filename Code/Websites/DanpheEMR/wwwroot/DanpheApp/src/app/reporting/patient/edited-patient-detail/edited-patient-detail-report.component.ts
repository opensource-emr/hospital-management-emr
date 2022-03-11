import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DLService } from '../../../shared/dl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { SettingsBLService } from '../../../settings-new/shared/settings.bl.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { ReportingService } from '../../../reporting/shared/reporting-service';
import * as moment from 'moment';

@Component({
  selector: 'edit-patient-detail-report',
  templateUrl: './edited-patient-detail-report.html'
})
export class EditedPatientDetailReport{
    public fromDate : any = null;
    public toDate : any = null;
    public user : any = "----- All Users -----";
    public selectedUserId : number = 0;
    public patientDetail :Array<any>;
    public userList : any;
    public dateRange : any;
    public loading : boolean = false;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public ReportColumns : any;
    public showGrid : boolean = false;
    public showSummary : boolean = false;
    public defaultUser ={
      EmployeeName:"----- All Users -----",
      EmployeeId:0
    };
    constructor(public messageBoxServ:MessageboxService,public settingsBLService:SettingsBLService,public dlService:DLService,public reportService:ReportingService){
         this.ReportColumns = this.reportService.reportGridCols.EditedPatientDetailReportColumns;
         this.LoadUser();
    }

    Load(){
        this.showGrid = false;
        this.showSummary = false;
        if(this.selectedUserId < 0){
          this.messageBoxServ.showMessage("warning",["Please select valid user from the dropdown list."]);
          this.loading = false;
          return 0;
        }
        this.dlService
        .Read(
          "/Reporting/EditedPatientDetailReport?userId=" + this.selectedUserId + "&FromDate=" + this.fromDate + "&ToDate=" + this.toDate)
        .map((res) => res)
        .subscribe(
          (res) => {
              if(res.Status == "OK" && res.Results.length > 0){
                  this.patientDetail = res.Results;
                  this.showGrid = true;
                  this.showSummary = true;
                  this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('Registered Date', true));
                  this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('Edited Date', true));
              }
              else{
                this.messageBoxServ.showMessage("notice",["No Data is avaliable."]);
              }
          },
          (err) => console.log(err),
          ()=>{this.loading = false;}
        );
    }

    LoadUser() {
        this.settingsBLService.GetUserList()
          .subscribe(res => {
            if (res.Status == "OK") {
              this.userList = res.Results;
              CommonFunctions.SortArrayOfObjects(this.userList, "EmployeeName")
              this.userList.unshift(this.defaultUser);
            }
            else {
              alert("Failed ! " + res.ErrorMessage);
            }
          });
      }
    
      UserListFormatter(data: any): string {
        return data["EmployeeName"];
      }

      assignUser(){
        if(this.user){
            if(typeof(this.user)=='object'){
                this.selectedUserId = this.user.EmployeeId;
            }
            else{
              this.selectedUserId = -1;
            }
        }
        else{
            this.selectedUserId = -1;
        }
      }
    
      gridExportOptions = {
        fileName: 'EditedPateintDetailReport' + moment().format('YYYY-MM-DD') + '.xls',
      };

      OnFromToDateChange($event) {
        this.fromDate = $event ? $event.fromDate : this.fromDate;
        this.toDate = $event ? $event.toDate : this.toDate;
        this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
      }

}