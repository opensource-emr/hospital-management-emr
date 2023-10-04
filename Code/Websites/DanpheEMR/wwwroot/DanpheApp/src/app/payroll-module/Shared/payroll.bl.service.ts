import { Injectable, Directive } from '@angular/core';
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { PayrollDLService } from './payroll.dl.service';
import { map } from 'rxjs/operators';
import { AttendanceDailyTimeRecord } from './Payroll-attendance-daily-time-record.model';
import { DailyMuster } from './daily-muster.model';
import { LeaveRuleList } from './leave-rule-list.model';
import { HolidayModel } from './payroll-holiday.model';
import { EmployeeLeaveModel } from './Payroll-Employee-Leave.model';
@Injectable()
export class PayrollBLService {

    constructor(public payrollDLService: PayrollDLService) {
    }
    public getWeekendPolicy() {
        return this.payrollDLService.getWeekendPolicy()
            .map(res => {
                return res;
            })
    }

    public getLeaveCategoryList(LeaveCategoryIds:string) {
        return this.payrollDLService.getLeaveCatergoryList(LeaveCategoryIds)
            .pipe(map(res => {
                return res
            }));
    }

    public getLeaveRulelist(currentYear) {
        return this.payrollDLService.getLeaveRulelist(currentYear)
            .pipe(map(res => {
                return res
            }));
    }
    public GetEmployeelist(Year, Month, CurrEmpId) {
        return this.payrollDLService.GetEmployeelist(Year, Month, CurrEmpId)
            .pipe(map(res => {
                return res
            }));
    }
    public GetHolidaylist() {
        try {
            return this.payrollDLService.GetHolidaylist()
                .map(res => { return res });
        }
        catch (ex) {
      throw ex;
    }
  }
  public getEmployeeLeaveDetails(Status: string, currentYear){
    try{
      return this.payrollDLService.getEmployeeLeaveDetails(Status, currentYear)
        .pipe(map(res => {
          return res
        }));
    }
    catch(ex){
      throw ex;
    }
  }
  public getLeaveList(){
    return this.payrollDLService.getLeaveList()
      .pipe(map(res => {
        return res;
      }));
  }
  public LoadEmployeeList(){
    return this.payrollDLService.LoadEmployeeList()
      .pipe(map(res => {
        return res
      }));
  }

  public GetEmployeeLeaveDetails(year,currEmp){
    try {
      return this.payrollDLService.GetEmployeeLeaveDetails(year,currEmp)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }

  public GetEmployeebyId(empId){
    return this.payrollDLService.GetEmployeebyId(empId)
      .pipe(map(res => {
        return res
      }));
  }
  public GetEmpEmpwiseLeaveDetails(empId,year){
    return this.payrollDLService.GetEmpEmpwiseLeaveDetails(empId,year)
      .pipe(map(res => {
        return res
      }));
  }
    //post      
    public postHolidayListDetails(holidayData: HolidayModel) {
        let newholidayData: any = _.omit(holidayData, ['holidayValidator']);
        var data = JSON.stringify(newholidayData);
        return this.payrollDLService.PostHolidayDetails(data)
            .pipe(map(res => {
                return res
            }));
    }


    public getCSVRecord() {
        return this.payrollDLService.getCSVRecord()
            .pipe(map(res => {
                return res
            }));
    }

    public postAttendanceDailyTimeRecord(data) {
        var dataArr = JSON.stringify(data);
        return this.payrollDLService.postAttendanceDailyTimeRecord(dataArr)
            .pipe(map(res => {
                return res
            }));
    }

    public postCsvDataToDailyMuster(attendanceDailyTimeRecord: Array<AttendanceDailyTimeRecord>) {

        return this.payrollDLService.postCsvDataToDailyMuster(attendanceDailyTimeRecord)
            .pipe(map(res => {
                return res;
            }));
    }

    public postLeaveRules(LeaveRules: LeaveRuleList) {
        var leaveRuleData = _.omit(LeaveRules, 'LeaveRuleValidator')
        var data = JSON.stringify(leaveRuleData);
        return this.payrollDLService.postLeaveRules(data)
            .pipe(map(res => {
                return res
            }));
  }

  public PostNewLeaveRequest(employeeRequestLeaves: Array<EmployeeLeaveModel>){

    var EmpleaveData : any = employeeRequestLeaves.map(itm => {
      return _.omit(itm, ['EmployeeLeaveValidator']);
    });
    var data = JSON.stringify(EmpleaveData);
    return this.payrollDLService.PostNewLeaveRequest(data)
      .pipe(map(res => {
        return res
      }));
  }

    public postHolidayListToDailyMuster(postHolidayList) {     
        var data = JSON.stringify(postHolidayList);
        return this.payrollDLService.postHolidayListToDailyMuster(data)
            .pipe(map(res => {
                return res
            }));
    }
    public putLeaveRules(LeaveRules: LeaveRuleList) {
        var leaveRuleData = _.omit(LeaveRules, 'LeaveRuleValidator')
        var data = JSON.stringify(leaveRuleData);
        return this.payrollDLService.putLeaveRules(data)
            .pipe(map(res => {
                return res
            }));
    }

    public putChangeAttendance(ChangedAttendance: DailyMuster) {
        var data = JSON.stringify(ChangedAttendance);
        return this.payrollDLService.putChangeAttendance(data)
            .pipe(map(res => {
                return res
            }));
    }
}
