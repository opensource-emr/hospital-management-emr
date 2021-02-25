import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { PayrollBLService } from '../../Shared/payroll.bl.service';
import { SecurityService } from '../../../../../src/app/security/shared/security.service';
import { MessageboxService } from '../../../../../src/app/shared/messagebox/messagebox.service';
import { EmployeeLeaveModel } from "../../Shared/Payroll-Employee-Leave.model";
import { Employee } from "../../../employee/shared/employee.model";
import { LeaveRuleList } from "../../Shared/leave-rule-list.model";
import * as moment from 'moment/moment';

@Component({
  selector: 'add-new-leave',
  templateUrl: './add-newRequest.html'
})

export class AddNewLeaveRequestComponent {
  public showAddRequestPage: boolean = false;
  public leaveList:  Array<LeaveRuleList>  =new  Array<LeaveRuleList>(); 
  public selectedEmployeeId : number= 0;
  public employeeRequestLeaves : Array<EmployeeLeaveModel> = new Array<EmployeeLeaveModel>();
  public selLeave:  Array<LeaveRuleList>  =new  Array<LeaveRuleList>(); 
  public RequestedEmployeeList: Array<Employee> = new Array<Employee>();
  public RequestedEmployee:  Array<Employee> = new Array<Employee>();
  constructor(
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
     public msgBoxServ: MessageboxService,
     public payrollBlserv: PayrollBLService) {
      this.LeaveList();
      this.LoadEmployeeList();
  }

  @Input("showAddRequestPage")
  public set value(val: boolean) {
    this.changeDetector.detectChanges();
    this.showAddRequestPage = val;
    this.employeeRequestLeaves = new Array<EmployeeLeaveModel>();
    this.AddNewLeave();
    this.selLeave = new  Array<LeaveRuleList>(); 
  }

  @Input("selectedEmployeeId")
  public set valueID(val: number) {
    this.changeDetector.detectChanges();
    this.selectedEmployeeId = val;
  }
  Close() {
    this.showAddRequestPage = false;
    this.changeDetector.detectChanges();
  }

  LeaveListFormatter(data: any): string {
    return data["CategoryCode"] + "  " + data["LeaveCategoryName"] + " (" + data["Days"] + " Days)";
  }

  AssignSelectedLeave(index){
    if (this.selLeave[index]) {
      if (typeof (this.selLeave[index]) == 'object') {
        this.employeeRequestLeaves[index].LeaveRuleId = this.selLeave[index].LeaveRuleId;
      }
    }
  }
  public LeaveList(){
    try{
      this.payrollBlserv.getLeaveList()
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length > 0) {
          this.leaveList = new Array<LeaveRuleList>();
          this.leaveList = res.Results;
        } else {
          this.leaveList = new Array<LeaveRuleList>();
          this.msgBoxServ.showMessage("Notice", ['There are no leaves'])
        }
      });
    }
    catch(ex){
      throw ex;
    }
  }
  AddNewLeave(){
      try {
        var currentLeave = new EmployeeLeaveModel();
        this.employeeRequestLeaves.push(currentLeave);
      } catch (ex) {
        
      }
  }
  DeleteLeaveRow(index: number){
      try {
        if (this.employeeRequestLeaves.length > 1) {
          this.employeeRequestLeaves.splice(index, 1);
          this.selLeave.splice(index, 1);
        }
      } catch (ex) {
       
    }
  }
  PostLeaveRequest(){
      let check = confirm("Are you sure you want to request for leave?");
      if (check) {
        try {
          let txnValidation = true;
        //  this.CalculateLedger();
          if (this.employeeRequestLeaves.length == 0) {
            this.msgBoxServ.showMessage("notice-message", ["Please enter some data..."]);
            return;
          }
          else {
          //  this.CheckBackDateEntryValidation();
            for (var emp of this.employeeRequestLeaves) {
              for (var b in emp.EmployeeLeaveValidator.controls) {
                emp.EmployeeLeaveValidator.controls[b].markAsDirty();
                emp.EmployeeLeaveValidator.controls[b].updateValueAndValidity();
              }
            };
            if(this.IsValidDateCheck()){
              this.employeeRequestLeaves.forEach(data => {
                  data.EmployeeId = this.selectedEmployeeId;
                  data.CreatedOn = moment().format("YYYY-MM-DD HH:mm");
              });

              this.payrollBlserv.PostNewLeaveRequest(this.employeeRequestLeaves).
              subscribe(res => {
                if (res.Status == 'OK') {
                  this.Reset();
                  this.msgBoxServ.showMessage("success", ["Leave request Successful."]);
                  this.showAddRequestPage = false; 
                }
                else {
                  this.msgBoxServ.showMessage("failed", ['failed to request leave..']);
                }
              });
            }
            else{
                this.msgBoxServ.showMessage("Notice", ['Same Date cannot allowed for multiple leaves.']);
            }
          }
        } catch (ex) {
          throw ex;
        }
      }
  }
  private LoadEmployeeList() {
    this.payrollBlserv.LoadEmployeeList()
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length > 0) {
          this.RequestedEmployeeList = new Array<Employee>();
          this.RequestedEmployeeList = res.Results;
        } else {
          this.RequestedEmployeeList = new Array<Employee>();
          this.msgBoxServ.showMessage("Failed", ['No Employees..'])
        }
      });
  }
  AssignRequestedToEmployee(index){
    if (this.RequestedEmployee[index]) {
      if (typeof (this.RequestedEmployee[index]) == 'object') {
        this.employeeRequestLeaves[index].RequestedTo= this.RequestedEmployee[index].EmployeeId;
      }
    }
  }
  EmployeeListFormatter(data: any): string {
    return data["FirstName"] + " " + data["LastName"] ;
  }
  IsValidDateCheck() : boolean{
  //   try{
  //     let temp =  false;
  //     for(var i=0; i<=this.employeeRequestLeaves.length; i++){
  //       for(var j =0 ;j<= this.employeeRequestLeaves.length; j++){
  //         if(this.employeeRequestLeaves[i].Date == this.employeeRequestLeaves[j].Date && (i!=j)){
  //            temp=true;
  //            break;
  //         }
  //       }
  //     }
  //     if(temp){
  //       this.msgBoxServ.showMessage("Notice", ['Same Date cannot allowed for multiple leaves.']);
  //       return false;
  //     }
  //     else return true;
  //   }
  // catch(rx){
  //   throw rx;
  // }
  return true;
   }
  Reset()
  {
      this.employeeRequestLeaves = new Array<EmployeeLeaveModel>();
  }
  CalculateLeaveDays(){
    
  }
}
