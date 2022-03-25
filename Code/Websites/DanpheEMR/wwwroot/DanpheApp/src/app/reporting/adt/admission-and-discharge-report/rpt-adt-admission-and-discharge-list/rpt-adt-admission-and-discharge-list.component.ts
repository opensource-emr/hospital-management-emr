import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ReportingService } from '../../../../reporting/shared/reporting-service';
import { DLService } from '../../../../shared/dl.service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import * as moment from 'moment';
import { AdmissionAndDischargeVM, BedFeatureModel, DepartmentModel, WardModel } from './AdmissionAndDischargeVM';
import { Observable } from 'rxjs-compat';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-rpt-adt-admission-and-discharge-list',
  templateUrl: './rpt-adt-admission-and-discharge-list.component.html',
  styleUrls: ['./rpt-adt-admission-and-discharge-list.component.css']
})
export class RPTADTAdmissionAndDischargeListComponent implements OnInit {
  public dateRange : string = '';
  public fromDate:any;
  public showGrid: boolean = false;
  public toDate:any;
  public ward:any;
  public department:any;
  public bedFeature:any;
  public wardId:number=0;
  public departmentId:number=0;
  public bedFeatureId:number=0;
  public admissionStatus:string='';
  public searchText : any='';
  TotalAdmittedPatientColumns: Array<any> = null;
  TotalPatientData: Array<AdmissionAndDischargeVM> = new Array<AdmissionAndDischargeVM>();
  public WardList: Array<WardModel> = new Array<WardModel>();
  public DepartmentList: Array<DepartmentModel> = new Array<DepartmentModel>();
  public BedFeatureList: Array<BedFeatureModel> = new Array<BedFeatureModel>();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public showSummary : boolean = false;
  public summaryFormatted = {
    TotalAdmitted: 0,
    TotalDischarged: 0,
    TotalDays: 0
  }

  constructor(public httpClient: HttpClient,
    public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
      this.TotalAdmittedPatientColumns = this.reportServ.reportGridCols.AdmisssionAndDischargeList;
      this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("AdmissionDate", false));
      this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("DischargeDate", false));
      this.admissionStatus = "All";
      var reqs: Observable<any>[] = [];
      reqs.push( this.dlService.getWard().pipe(
        catchError((err) => {
          return of(err.error);
        }
        )
      ));
      reqs.push( this.dlService.getDepartment().pipe(
        catchError((err) => {
          return of(err.error);
        }
        )
      ));
      reqs.push( this.dlService.getBedFeature().pipe(
        catchError((err) => {
          return of(err.error);
        }
        )
      ));
      forkJoin(reqs).subscribe(result => {
          this.getWard(result[0]);
          this.getDepartment(result[1]);
          this.getBedFeature(result[2]);
      });
     }

  ngOnInit() {
  }

  getWard(res){ 
    if (res.Status == "OK") {
        this.WardList = res.Results;
         }
    else {
        this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    }
}
getDepartment(res){ 
  if (res.Status == "OK") {
      this.DepartmentList = res.Results;
       }
  else {
      this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
  }
}
getBedFeature(res){ 
  if (res.Status == "OK") {
      this.BedFeatureList = res.Results;
       }
  else {
      this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
  }
}
  gridExportOptions = {
    fileName:
      "AdmissionAndDischargeList" + moment().format("YYYY-MM-DD") + ".xls",
  };
  

  Load() {
     { 
      this.TotalPatientData = [];
      this.dlService
        .Read(
          "/Reporting/AdmissionAndDischargeList?FromDate=" +
          this.fromDate +
          "&ToDate=" +
          this.toDate
          +"&WardId="+
          this.wardId+
          "&DepartmentId="+
          this.departmentId+
          "&BedFeatureId="+
          this.bedFeatureId+
          "&AdmissionStatus="+
          this.admissionStatus+
          "&SearchText="+
          this.searchText
        )
        .map((res) => res)
        .subscribe(
          (res) => this.Success(res),
          (res) => this.Error(res)
        );
    } 
    
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.TotalPatientData = res.Results;

      for(var i =0; i< this.TotalPatientData.length; i++){
        if(this.TotalPatientData[i].Diagnosis && this.TotalPatientData[i].Diagnosis.trim().length > 0){
          this.TotalPatientData[i].DiagnosisList= JSON.parse(this.TotalPatientData[i].Diagnosis);
          this.TotalPatientData[i].Diagnosis = this.TotalPatientData[i].DiagnosisList.map(e => e.ICD10Description).join(",");
        }
      }
      this.showGrid = true;
      this.getSummary(this.TotalPatientData);
      if(this.TotalPatientData.length>0){
        this.showSummary=true;
      }
    } else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", [
        "No Data is Avaliable for Selected Parameters.....Try Different",
      ]);
      this.TotalPatientData = [];
    } else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  OnFromToDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }

  WardListFormatter(data: any): string {
    let html = data["WardName"];
    return html;
  }

  DepartmentListFormatter(data: any): string {
    let html = data["DepartmentName"];
    return html;
  }

  BedFeatureListFormatter(data: any): string {
    let html = data["BedFeatureName"];
    return html;
  }
  PatientListFormatter(data: any): string {
    let html: string = "";
    html = "<font size=03>" + "IP Number : [" + data["VisitCode"] + "]" + "</font>&nbsp;&nbsp;&nbsp;<font color='blue'; size=03 ><b>" + data["PatientName"] +
      "</b></font>&nbsp;&nbsp;" +  "</b>-&nbsp;&nbsp;Hospital No :" + data["PatientCode"] + "</font>";
    return html;
  }
  
  assignWardId(){
    if(this.ward){
      this.wardId = this.ward.WardId;
    }
    else{
      this.wardId = 0;
    }
  
  }
  assignDepartmentId(){
    if(this.department){
      this.departmentId = this.department.DepartmentId;
    }
    else{
      this.departmentId = 0;
    }

  }
  assignBedFeatureId(){
    if(this.bedFeature){
      this.bedFeatureId = this.bedFeature.BedFeatureId;
    }
    else{
      this.bedFeatureId = 0;
    }

  }

  assignPatientData(){
    if(this.searchText && typeof(this.searchText) == 'object'){
      this.TotalPatientData = [];
      this.TotalPatientData.push(this.searchText);
      this.TotalPatientData.forEach(a=>a.SN = 1);
      this.showGrid = true;
      this.getSummary(this.TotalPatientData);
      this.showSummary = true;
    }
  }
  getSummary(data: any) {
    this.summaryFormatted.TotalAdmitted = data.filter(a=>a.AdmissionStatus == "admitted").length;
    this.summaryFormatted.TotalDischarged = data.filter(a=>a.AdmissionStatus == "discharged").length;
    this.summaryFormatted.TotalDays = data.reduce(function (acc, obj) { return acc + obj.Number_of_Days; }, 0);
  }
  public PatientSearchAsync =(res): Observable<any[]> =>{
    return this.dlService
    .Read(
      "/Reporting/AdmissionAndDischargeList?FromDate=" +
      this.fromDate +
      "&ToDate=" +
      this.toDate
      +"&WardId="+
      this.wardId+
      "&DepartmentId="+
      this.departmentId+
      "&BedFeatureId="+
      this.bedFeatureId+
      "&AdmissionStatus="+
      this.admissionStatus+
      "&SearchText="+
      this.searchText
    ).map((res)=>res);
  }


}
