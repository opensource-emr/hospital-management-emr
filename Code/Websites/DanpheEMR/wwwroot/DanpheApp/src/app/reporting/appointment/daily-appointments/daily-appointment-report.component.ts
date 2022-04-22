import { ChangeDetectorRef, Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RPT_APPT_DailyAppointmentReportModel } from "./daily-appointment-report.model"
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';

@Component({
  templateUrl: "./daily-appointment-report.html"
})
export class RPT_APPT_DailyAppointmentReportComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public selProvider: any = "";
  public doctorList: any;
  public AppointmentType: string = "";
  public Doctor_Name: string = "";
  DailyAppointmentReportColumns: Array<any> = null;
  DailyAppointmentReportData: Array<RPT_APPT_DailyAppointmentReportModel> = new Array<RPT_APPT_DailyAppointmentReportModel>();
  public currentdailyappointment: RPT_APPT_DailyAppointmentReportModel = new RPT_APPT_DailyAppointmentReportModel();
  dlService: DLService = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public dateRange:string="";	
  gridExportOptions = {
    fileName: 'AppointmentList' + moment().format('YYYY-MM-DD') + '.xls',
  };

  public loading: boolean = false;
  public ICD10List = [];
  public icd10Selected: { ICD10Code, ICD10Description };
  public selectedICD10Description:any = "";
  constructor(
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public changeDetector: ChangeDetectorRef) {
    this.dlService = _dlService;
    this.currentdailyappointment.fromDate = moment().format('YYYY-MM-DD');
    this.currentdailyappointment.toDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", true));
    this.loadDoctorsList();
    this.DailyAppointmentReportColumns = this.reportServ.reportGridCols.DailyAppointmentReport;
    this.GetICDList();
  }

  Load() {
    this.loading = true;//this disables the button until we get response from the api.
    if (this.currentdailyappointment.fromDate != null && this.currentdailyappointment.toDate != null) {
      this.DailyAppointmentReportData = [];
      this.dlService.Read("/Reporting/DailyAppointmentReport?FromDate="
        + this.currentdailyappointment.fromDate + "&ToDate=" + this.currentdailyappointment.toDate
        + "&Doctor_Name=" + this.currentdailyappointment.Doctor_Name + "&AppointmentType=" + this.currentdailyappointment.AppointmentType+ "&Diagnosis=" + this.selectedICD10Description)
        .map(res => res)
        .finally(() => { this.loading = false; })//re-enable the show-report button.
        .subscribe(res => this.Success(res),
          res => this.Error(res)
        );
    } else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }

  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }
  Success(res) {
    if (res.Status == "OK") {
      if (res.Results && res.Results.length > 0) {
        this.DailyAppointmentReportData = res.Results;
        
        for(var i =0; i< this.DailyAppointmentReportData.length; i++){
          if(this.DailyAppointmentReportData[i].Diagnosis && this.DailyAppointmentReportData[i].Diagnosis.trim().length > 0){
            this.DailyAppointmentReportData[i].DiagnosisList= JSON.parse(this.DailyAppointmentReportData[i].Diagnosis);
            this.DailyAppointmentReportData[i].Diagnosis = this.DailyAppointmentReportData[i].DiagnosisList.map(e => e.ICD10Description).join(",");
          }
        }
      }
      else {
        this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected Parameter ....Try Different'])
      }
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  ngOnChanges(){
    this.changeDetector.detectChanges();
    this.GetICDList();
  }
  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelDailyAppointment?FromDate="
      + this.currentdailyappointment.fromDate + "&ToDate=" + this.currentdailyappointment.toDate
      + "&Doctor_Name=" + this.currentdailyappointment.Doctor_Name + "&AppointmentType=" + this.currentdailyappointment.AppointmentType + + "&Diagnosis=" + this.selectedICD10Description)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "DailyAppointment_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },
        res => this.ErrorMsg(res));
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  loadDoctorsList() {
    this.dlService.Read("/Reporting/GetDoctorList")
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.doctorList = res.Results;
        }
      });
  }

  myListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  providerChanged() {
    this.currentdailyappointment.Doctor_Name = this.selProvider ? this.selProvider.FullName : "";
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentdailyappointment.fromDate = this.fromDate;
    this.currentdailyappointment.toDate = this.toDate;
    this.dateRange="<b>Date:</b>&nbsp;"+this.fromDate+"&nbsp;<b>To</b>&nbsp;"+this.toDate;
  }

  public GetICDList() {
    this.ICD10List = DanpheCache.GetData(MasterType.ICD,null);
   }

   public AssignSelectedICD() {
    if (typeof (this.icd10Selected) == 'object') {
        this.selectedICD10Description = this.icd10Selected.ICD10Description;
    }
    else {
      this.selectedICD10Description = "";
    }
  }
  ICDListFormatter(data: any): string {
    let html;
    //if the ICD is not valid for coding then it will be displayed as bold.
    //needs to disable the field that are not valid for coding as well.
    if (!data.ValidForCoding) {
        html = "<b>" + data["ICD10Code"] + "  " + data["ICD10Description"] + "</b>";
    }
    else
        html = data["ICD10Code"] + "  " + data["ICD10Description"];

    return html;
  }
}
