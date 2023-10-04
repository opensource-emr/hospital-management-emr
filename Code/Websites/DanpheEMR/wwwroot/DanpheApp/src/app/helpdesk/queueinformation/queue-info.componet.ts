import { Component } from "@angular/core";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { CoreService } from "../../core/shared/core.service";
import { HelpDeskBLService } from "../shared/helpdesk.bl.service";


@Component({
    templateUrl: "./queue-info.component.html",
    styleUrls: ['./queue-info.component.css']
  })
  
  export class HlpDskQueueInfoComponent {
    public queueLevel:string = '';
    public department:any;
    public doctor:any;
    public visitGridColumns:any;
    public visits:Array<any>=[];
    public selectedDepartmentId:number=0;
    public selectedDoctorId:number=0;
    public DepartmentList:any;
    public DoctorList:any;
    public intervalId:any;
    public labelContainer:any;
    public refreshInterval:any;
    public noticeText:any;
    constructor(public coreService:CoreService,public helpdeskBlService: HelpDeskBLService,
     public msgBoxService:MessageboxService){
        this.getParamter();
    }
    ngOnInit(){
        if(this.queueLevel == "department"){
          this.getDepartmentList();
        }
        else if(this.queueLevel == "doctor"){
          this.getDoctorList();
        }
        else if(this.queueLevel == "hospital"){
          var notice = this.coreService.Parameters.find(a=>a.ParameterGroupName == "Helpdesk" && a.ParameterName == "HospitalNotice").ParameterValue;
          if(notice){
            this.noticeText = JSON.parse(notice);
          }

          this.getAppointmentData();
          this.intervalId = setInterval(() => {
            this.getAppointmentData(); 
          }, this.refreshInterval);
        } 
      }

      ngOnDestroy() {
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
      }
  
    getParamter() {
        let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Appointment" && p.ParameterName == "QueueLevel").ParameterValue;
        this.queueLevel = parameterData;
        let refreshTime = this.coreService.Parameters.find(p=>p.ParameterGroupName == "QueueManagement" && p.ParameterName == "QueueRefreshInterval").ParameterValue;
        this.refreshInterval = refreshTime;
        let labelData = this.coreService.Parameters.find(p=>p.ParameterGroupName == "Helpdesk" && p.ParameterName == "OPDQueueDisplaySettings").ParameterValue;
        if(labelData){
          this.labelContainer = JSON.parse(labelData);
        }
    }
    getDepartmentList(){
        this.helpdeskBlService.GetAllApptDepartment().subscribe(res=>{
            if(res.Status == "OK"){
               this.DepartmentList = res.Results;
            }
        });
    }
  
    getDoctorList(){
      this.helpdeskBlService.GetAllAppointmentApplicableDoctor().subscribe(res =>{
        if(res.Status == "OK"){
          this.DoctorList = res.Results;
        }
      });
    }
    getAppointmentData(){
        this.helpdeskBlService.GetAppointmentData(this.selectedDepartmentId,this.selectedDoctorId,true).subscribe(res=>{
          if(res.Status == "OK"){
            this.visits = res.Results;
          }
        },
          err=>{}
        );
      }
      DepartmentListFormatter (data){
        let html = data["DepartmentName"];
        return html;
      }
    
      fiterByDepartment(){
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
        let dept = this.department;
        if(dept && typeof(dept)=='object'){
          this.selectedDepartmentId = dept.DepartmentId;
        }
        else{
          this.visits = [];
          this.selectedDepartmentId = 0;
          this.msgBoxService.showMessage("notice",["Please select valid department from list."]);
          return 0;
        }
          this.getAppointmentData();
          this.intervalId = setInterval(() => {
            this.getAppointmentData(); 
          }, this.refreshInterval);
      }
    
      DoctorListFormatter (data){
        let html = data["FullName"];
        return html;
      }
    
      fiterByDoctor(){
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
        let doc = this.doctor;
        if(doc && typeof(doc) == 'object'){
          this.selectedDoctorId = doc.EmployeeId;
        }
        else{
          this.visits = [];
          this.selectedDoctorId = 0;
          this.msgBoxService.showMessage("notice",["Please select valid doctor from list."]);
          return 0;
        }
          this.getAppointmentData();
          this.intervalId = setInterval(() => {
            this.getAppointmentData(); 
          }, this.refreshInterval);
      }
  }
