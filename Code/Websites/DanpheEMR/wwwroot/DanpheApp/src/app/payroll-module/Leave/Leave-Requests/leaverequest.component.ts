import { Component, ChangeDetectorRef } from "@angular/core";
import { PayrollBLService } from "../../Shared/payroll.bl.service";
import { CoreService } from "../../../core/shared/core.service";
import { MessageboxService } from "./../../../shared/messagebox/messagebox.service";
import * as moment from 'moment';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { Employee } from "../../../employee/shared/employee.model";
import { EmployeeLeaveModel } from "../../Shared/Payroll-Employee-Leave.model";

@Component({
  selector:'leave-request',
  templateUrl: "./leave-request.html",

})

export class LeaveRequestComponent {
  public currentYear: any;
  public LeaveRequestList: Array<any> = new Array<any>();
  LeaveRequestListComlumns: Array<any> = new Array<any>();
  public showAddRequestPage: boolean = false;
  public selectedEmployee:  Array<Employee> = new Array<Employee>();
  public EmployeeList: Array<Employee> = new Array<Employee>();
  public employee: Employee = new Employee();
  public selLeaveRequests : EmployeeLeaveModel = new EmployeeLeaveModel();
  public EmployeeListwithStatus: Array<Employee> = new Array<Employee>();
  public selectedEmployeeId : number = 0;

  constructor(public payrollBLService: PayrollBLService, public _coreService: CoreService,
    public messageboxService: MessageboxService,
    public changeDetectorRef: ChangeDetectorRef) {
    this.currentYear = moment().startOf("year").format('YYYY');
    //this.getEmployeeLeaveDetails(this.currentYear);
    this.LoadEmployeeList();
    this.LeaveRequestListComlumns = GridColumnSettings.EmployeeListwithStatus;
    this.selLeaveRequests.LeaveStatus = "all";
    this.OnSelectStatus("all");
  }
  private LoadEmployeeList() {
    this.payrollBLService.LoadEmployeeList()
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length > 0) {
          this.EmployeeList = new Array<Employee>();
          this.EmployeeList = res.Results;
        } else {
          this.EmployeeList = new Array<Employee>();
          this.messageboxService.showMessage("Failed", ['No Employees..'])
        }
      });
  }
  // private getEmployeeLeaveDetails(year) {
  //   try {
  //     this.payrollBLService.getEmployeeLeaveDetails(year)
  //       .subscribe(res => {
  //         if (res.Status == "OK" && res.Results.length > 0) {
  //           this.LeaveRequestList = new Array<any>();
  //           this.LeaveRequestList = res.Results;
  //         } else {
  //           this.LeaveRequestList = new Array<any>();
  //           this.messageboxService.showMessage("Notice", ['There is no leave request for the Year..' + year])
  //         }
  //       });
  //   }
  //   catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }
  //This function only for show catch messages
  public ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.messageboxService.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  public CreateRequest() {
    this.showAddRequestPage = false;
    this.changeDetectorRef.detectChanges();
    if(this.employee.EmployeeId > 0){
      this.showAddRequestPage = true;
      this.selectedEmployeeId = this.employee.EmployeeId;
    }
    else{
      this.messageboxService.showMessage("error", ["Select Employee!"]);
    }
  }
  EmployeeListFormatter(data: any): string {
    return data["FirstName"] + " " + data["LastName"] ;
  }
  AssignSelectedEmployee(index){
    if (this.selectedEmployee[index]) {
      if (typeof (this.selectedEmployee[index]) == 'object') {
        this.employee.EmployeeId = this.selectedEmployee[index].EmployeeId;
       // this.getEmployeeLeaveDetails(this.currentYear);
       //this.OnSelectStatus();
      }
    }
  }
    //   OnSelectStatus() {
    //     this.EmployeeListwithStatus = new Array<any>();
    //     if(this.employee.EmployeeId == 0){
    //       if (this.selLeaveRequests.LeaveStatus == "pending") {
    //         this.EmployeeListwithStatus = this.LeaveRequestList.filter(a=> a.LeaveStatus =="pending");
    //      }
    //      else if(this.selLeaveRequests.LeaveStatus =="approved") {
    //        this.EmployeeListwithStatus = this.LeaveRequestList.filter(a=> a.LeaveStatus =="approved");
    //      }
    //      else if(this.selLeaveRequests.LeaveStatus =="cancelled") {
    //        this.EmployeeListwithStatus = this.LeaveRequestList.filter(a=> a.LeaveStatus =="cancelled");
    //      }
    //      else{
    //        this.EmployeeListwithStatus = this.LeaveRequestList;
    //      }
    //     }
    //     else{
    //       if (this.selLeaveRequests.LeaveStatus == "pending") {
    //         this.EmployeeListwithStatus = this.LeaveRequestList.filter(a=> a.LeaveStatus =="pending" && a.EmployeeId== this.employee.EmployeeId);
    //      }
    //      else if(this.selLeaveRequests.LeaveStatus =="approved") {
    //        this.EmployeeListwithStatus = this.LeaveRequestList.filter(a=> a.LeaveStatus =="approved" && a.EmployeeId== this.employee.EmployeeId);
    //      }
    //      else if(this.selLeaveRequests.LeaveStatus =="cancelled") {
    //        this.EmployeeListwithStatus = this.LeaveRequestList.filter(a=> a.LeaveStatus =="cancelled" && a.EmployeeId== this.employee.EmployeeId);
    //      }
    //      else{
    //       this.EmployeeListwithStatus = this.LeaveRequestList.filter(a=> a.EmployeeId== this.employee.EmployeeId);
    //      }
    //     }
    //     this.LeaveRequestListComlumns = GridColumnSettings.EmployeeListwithStatus;
    // }

    OnSelectStatus(status): void {
      //there is if condition because we have to check diferent and multiple status in one action ....
      //like in pending we have to check the active and partial both...
      let year = this.currentYear;
      var Status = "";
      if (status == "pending") {
          Status = "pending";
      }
      else if (status == "approved") {
          Status = "approved";
      }
      else if (status == "all") {
          Status = "pending,approved,approvedCancel,cancelled";
      }
      else {
          Status = "cancelled,approvedCancel"
      }
      this.payrollBLService.getEmployeeLeaveDetails(Status, year)
          .subscribe(res => {
              if (res.Status == "OK") {
                  this.LeaveRequestList = res.Results;
                  this.EmployeeListwithStatus = this.LeaveRequestList;
              }
              else {
                  this.messageboxService.showMessage("failed", ['failed to get Purchase Order.. please check log for details.']);
                  console.log(res.ErrorMessage);
              }
          });
  }
}
