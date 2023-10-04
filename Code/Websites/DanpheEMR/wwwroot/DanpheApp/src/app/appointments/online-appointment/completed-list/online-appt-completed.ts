import { Component } from '@angular/core'
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { AppointmentBLService } from '../../shared/appointment.bl.service';
import { CoreService } from '../../../core/shared/core.service';
import { LoginToTelemed } from '../../../labs/shared/labMasterData.model';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import * as moment from 'moment';
@Component({
  templateUrl: "./online-appt-completed.html"
})
export class OnlineAppointmentCompletedListComponent {
  public onlineAppointmentList: any;
  public teleMedicineConfiguration: any;
  public Login = new LoginToTelemed();
  public isTeleMedicineEnabled: boolean = false;
  public onlineAppointmentListFiltered: any;
  public onlineAppointmentGridColumns : any;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public fromDate: any;
  public toDate: any;
  public loading : boolean = false;
  public initialLoad : boolean = true;
  constructor(public appointmentBLService : AppointmentBLService,
    public msgBoxService : MessageboxService, public coreService : CoreService) {
      this.getParameter();
      this.onlineAppointmentGridColumns = GridColumnSettings.OnlineAppointmentList;
      this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("VisitDate",true));
  }

  ngOnInit(){

  }

  OnFromToDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if(this.initialLoad)
    this.getOnlineAppointmentData();
  }

  getParameter(){
    let TeleMedicineConfig = this.coreService.Parameters.find(p =>p.ParameterGroupName == "TeleMedicine" && p.ParameterName == "DanpheConfigurationForTeleMedicine").ParameterValue;
    this.teleMedicineConfiguration = JSON.parse(TeleMedicineConfig);
  } 

  gridExportOptions = {
    fileName:
      "OnlineAppointmentCompletedList" + moment().format("YYYY-MM-DD") + ".xls",
  };

  getOnlineAppointmentData(){
    this.initialLoad = false;
    this.onlineAppointmentList = [];
    this.onlineAppointmentListFiltered = [];
    this.appointmentBLService.getOnlineAppointmentData(this.teleMedicineConfiguration.TeleMedicineBaseUrl,this.fromDate,this.toDate).subscribe(res=>{
      if(res.length > 0){
        this.onlineAppointmentList = res;
        this.filterData();
      }
      else{
        this.onlineAppointmentList = [];
        this.onlineAppointmentListFiltered = [];
      }
    },
    err=>{
      this.msgBoxService.showMessage("error",["Unable to fetch online appointment data."]);
    },
    ()=>{
      this.loading = false;
    });
  }

  filterData(){
    if(this.onlineAppointmentList && this.onlineAppointmentList.length>0){
     this.onlineAppointmentListFiltered = this.onlineAppointmentList.filter(a=>a.Status != "initiated");
   }
 }
}
