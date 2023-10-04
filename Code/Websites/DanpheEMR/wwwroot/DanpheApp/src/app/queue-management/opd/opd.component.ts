import { Component } from '@angular/core'
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { CoreService } from '../../core/shared/core.service';
import { QueueManagementBLService } from '../shared/Qmgnt.bl.service';
import QueueManagementGridColumns from '../shared/queue-mgnmt-grid-columns';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';

@Component({
  selector: 'QueueManagement-Opd',
  templateUrl: "./opd.component.html"
})

export class QueueManagementOpdComponent {
  public department:any;
  public doctor:any;
  public visitGridColumns:any;
  public visits:any;
  public filteredVisit:any;
  public selectedDepartmentId:number=0;
  public selectedDoctorId:number=0;
  public DepartmentList:any;
  public DoctorList:any;
  public selectedStatus:string = 'pending';
  public radioButtons:any = [
    {label: 'All', value: 'all', id:"all"},
    {label: 'Pending', value: 'pending',id:"pending" },
    {label: 'Completed', value: 'checkedin',id:"completed"},
    {label: 'Skipped', value: 'skipped',id:"skipped" }
  ];
  public showGrid:boolean = false;
  public queueLevel:string = "";
  public showCheckInConfirmation:boolean = false;
  public showUndoConfirmation = false;
  public selectedPatient:any;
  public showSkipConfirmation : boolean = false;
  public loading:boolean = false;

  constructor(public queueManagementBlService: QueueManagementBLService,public coreService:CoreService,
    public msgBoxService:MessageboxService){
    this.visitGridColumns = QueueManagementGridColumns.VisitSearch;
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
      this.getAppointmentData();
    } 
  }

  getParamter() {
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Appointment" && p.ParameterName == "QueueLevel").ParameterValue;
    this.queueLevel = parameterData;
  }

  getDepartmentList(){
      this.queueManagementBlService.GetAllApptDepartment().subscribe(res=>{
          if(res.Status == "OK"){
             this.DepartmentList = res.Results;
          }
      });
  }

  getDoctorList(){
    this.queueManagementBlService.GetAllAppointmentApplicableDoctor().subscribe(res =>{
      if(res.Status == "OK"){
        this.DoctorList = res.Results;
      }
    });
  }
  
  filterByStatus(){
     if(this.visits && this.visits.length>0){
      var value = this.selectedStatus;
      if(value == 'all')
      this.filteredVisit = this.visits;
      else if(value == 'pending')
      this.filteredVisit = this.visits.filter(a=>a.QueueStatus== null || a.QueueStatus =="pending");
      else
      this.filteredVisit = this.visits.filter(a=>a.QueueStatus== value);
    }
  }

  DepartmentListFormatter (data){
    let html = data["DepartmentName"];
    return html;
  }

  fiterByDepartment(){
    let dept = this.department;
    if(dept && typeof(dept)=='object'){
      this.selectedDepartmentId = dept.DepartmentId;
    }
    else{
      this.selectedDepartmentId = 0;
    }
  }

  DoctorListFormatter (data){
    let html = data["FullName"];
    return html;
  }

  fiterByDoctor(){
    let doc = this.doctor;
    if(doc && typeof(doc) == 'object'){
      this.selectedDoctorId = doc.EmployeeId;
    }
    else{
      this.selectedDoctorId = 0;
    }
  }

  getAppointmentData(){
    this.filteredVisit = [];
    this.showGrid = false;
    if((this.queueLevel=="department" && this.selectedDepartmentId ==0)){
      this.msgBoxService.showMessage("notice",["Please select a valid department from list."]);
      this.loading = false;
    }
    else if((this.queueLevel == "doctor" && this.selectedDoctorId ==0)){
      this.msgBoxService.showMessage("notice",["Please select a valid doctor from list."]);
      this.loading = false;
    }
    else{
      this.queueManagementBlService.GetAppointmentData(this.selectedDepartmentId,this.selectedDoctorId,false).subscribe(res=>{
        if(res.Status == "OK"){
          this.visits = res.Results;
          this.filterByStatus();
          this.showGrid = true;
        }
      },
        err=>{},
        ()=>{
          this.loading = false;
        }
      );
    }
  }

  updateQueueStatus(){
    var data = this.showCheckInConfirmation? "checkedin":this.showSkipConfirmation? "skipped" :"pending";
    var visitId = this.selectedPatient.PatientVisitId;
    this.queueManagementBlService.updateQueueStatus(data,visitId).subscribe(res=>{
      if(res.Status == "OK"){
        if(res.Results.QueueStatus == 'checkedin')
          this.msgBoxService.showMessage("success",["Patient is successfully Checked In."]);
        else if(res.Results.QueueStatus == 'pending')
        this.msgBoxService.showMessage("success",["Undo is Successful."]);
        else
        this.msgBoxService.showMessage("success",["Patient is successfully Skipped."]);
      }
      else{
        this.msgBoxService.showMessage("error",["Unable to complete your action."]);
      }
    },err=>{},
    ()=>{
      this.closeConfirmation();
      this.getAppointmentData();
    });
  }

  VisitGridActions($event: GridEmitModel) {
    this.selectedPatient = $event.Data;
    switch ($event.Action) {
      case "checkin":{
        this.showCheckInConfirmation = true;
       break;
      }
      case "skip":{
        this.showSkipConfirmation = true;
        break;
      }
      case "undo":{
        this.showUndoConfirmation = true;
        break;
      }
    }
  }

  closeConfirmation(){
    this.showCheckInConfirmation = false;
    this.showSkipConfirmation = false;
    this.showUndoConfirmation = false;
  }
}

