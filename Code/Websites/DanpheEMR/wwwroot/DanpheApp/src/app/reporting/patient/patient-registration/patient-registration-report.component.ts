import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../shared/reporting-service"
import { DynamicReport } from "../../shared/dynamic-report.model"
import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../../shared/common.functions';
import { Patient } from "../../../patients/shared/patient.model";
import { DanpheCache, MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";
import { RPT_PAT_PatientRegistrationReportModel } from './patient-registration-report.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
@Component({
  templateUrl: "./patient-registration-report.html"
})

export class RPT_PAT_PatientRegistrationReportComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public providerName: string = null;
  public selProvider: any = "";
  public doctorList: any;
  public Countries: Array<any> = null;
  PatientWiseRegReportColumns: Array<any> = null;
  PatientWiseRegReportData: Array<any> = new Array<RPT_PAT_PatientRegistrationReportModel>();
  dynamicColumns: Array<string> = new Array<string>();
  public CurrentPatient: DynamicReport = new DynamicReport();
  public patient: Patient = new Patient();

  public currentPatRegreport: RPT_PAT_PatientRegistrationReportModel = new RPT_PAT_PatientRegistrationReportModel();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  dlService: DLService = null;
  http: HttpClient = null;
  Status: string = "";
  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    // this.DoctorWisePatientReportColumns = ReportGridColumnSettings.DoctorWisePatientReport;
    this.http = _http;
    this.dlService = _dlService;
    // this.loadDoctorsList();
    this.GetCountry();
    this, this.LoadGender('Male');
    this.currentPatRegreport.fromDate = moment().format('YYYY-MM-DD');
    this.currentPatRegreport.toDate = moment().format('YYYY-MM-DD');
   
  }

  gridExportOptions = {
    fileName: 'PatientRegistrationReport' + moment().format('YYYY-MM-DD') + '.xls',
    /*displayColumns: ['Registered Date', 'Patient Name', 'Date of Birth ', 'Age', 'Gender', 'PhoneNumber','Country',
    'Address','MemberShiptype','BloodGrp','Insurance No.']*/
  };
  LoadGender(status) {

    if (status == "Male") {
      this.Status = "Male";
    }
    else if (status == "Female") {
      this.Status = "Female";
    }
    else if (status == "All") {
      this.Status = 'Male,Female';
    }
    else {
      this.Status = "All"
    }

  }
  GetCountry() {

    this.Countries = DanpheCache.GetData(MasterType.Country, null)

  }

  Load() {
    if (this.currentPatRegreport.fromDate != null && this.currentPatRegreport.toDate != null) {

      this.NepaliDateInGridSettings = new NepaliDateInGridParams();

      this.dlService.Read("/Reporting/PatientRegistrationReport?FromDate="
        + this.currentPatRegreport.fromDate + "&ToDate=" + this.currentPatRegreport.toDate
        + "&Gender=" + this.Status + "&Country=" + this.currentPatRegreport.Country)
        .map(res => res)
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    } else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }

  }

  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }

  /*providerChanged() {
     this.currentPatRegreport.Patient_Name = this.selProvider ? this.selProvider.FullName : "";
    }
     myListFormatter(data: any): string {
     let html = data["FullName"];
     return html;
    }*/
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.PatientWiseRegReportColumns = this.reportServ.reportGridCols.PatientRegistrationReport;
      this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RegisteredDate', false));
      this.PatientWiseRegReportData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected Parameter ....Try Different'])
      this.PatientWiseRegReportColumns = this.reportServ.reportGridCols.PatientRegistrationReport;
      this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RegisteredDate', false));
      this.PatientWiseRegReportData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }
  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentPatRegreport.fromDate = this.fromDate;
    this.currentPatRegreport.toDate = this.toDate;
  }
}
