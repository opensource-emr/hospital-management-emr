import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class PayrollDLService {

  //  public http: HttpClient;
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };

  constructor(public http: HttpClient) {

  }
  public getWeekendPolicy() {
    return this.http.get<any>('/api/Payroll?reqType=get-weekend-policy', this.options);
  }

  public getLeaveCatergoryList(LeaveCategoryIds:string) {
    return this.http.get<any>('/api/Payroll?reqType=get-leave-category-list&LeaveCategoryIds='+LeaveCategoryIds, this.options)
  }

  public getLeaveRulelist(currentYear) {
    return this.http.get<any>('/api/Payroll?reqType=get-leave-rule-list&currentYear='+currentYear, this.options);
  }

  public GetEmployeelist(Year, Month, CurrEmpId) {
    return this.http.get<any>('/api/Payroll?reqType=get-emp-list&Year=' + Year + '&Month=' + Month + '&CurrEmpId='+CurrEmpId,  this.options);
  }
  public GetHolidaylist(){
    return this.http.get<any>("/api/Payroll?reqType=get-holiday-list", this.options);
  }
  public getCSVRecord() {
    return this.http.get<any>('/api/Payroll?reqType=CSVRecords', this.options);
  }
  public getLeaveList(){
    return this.http.get<any>('/api/Payroll?reqType=leave-list', this.options);
  }
  public getEmployeeLeaveDetails(status: string, currentYear){
    return this.http.get<any>('/api/Payroll?reqType=getEmployeeLeaves&currentYear='+ currentYear + '&status=' + status, this.options);
  }
  public LoadEmployeeList(){
    return this.http.get<any>('/api/Payroll?reqType=get-employeeList', this.options);
  }
  public GetEmployeeLeaveDetails(year,currEmp) {
    return this.http.get<any>("/api/Payroll?reqType=get-employee-leave-details&Year=" + year +'&CurrEmpId='+ currEmp, this.options);
  }
  public GetEmployeebyId(empId){
    return this.http.get<any>('/api/Payroll?reqType=emp-by-id&empId=' + empId, this.options);
  }
  public GetEmpEmpwiseLeaveDetails(empId,year){
    return this.http.get<any>('/api/Payroll?reqType=leave-details-by-empid&empId=' + empId+ '&Year=' + year, this.options);
  }
  //POST:
  public PostHolidayDetails(data){
    return this.http.post<any>("/api/Payroll?reqType=post-holiday-details", data,this.options);
  }
  public postAttendanceDailyTimeRecord(data) {
    return this.http.post<any>('/api/Payroll?reqType=post-attendance-daily-time-record', data, this.options);
  }

  public postCsvDataToDailyMuster(objects) {
    var data = JSON.stringify(objects);
    return this.http.post<any>('/api/Payroll?reqType=post-csv-data-to-daily-muster', data, this.options);
  }

  public postLeaveRules(data) {
    return this.http.post<any>('/api/Payroll?reqType=post-leave-rules', data, this.options);
  }
  public PostNewLeaveRequest(data) {
    return this.http.post<any>('/api/Payroll?reqType=post-emp-leave-requests', data, this.options);
  }

  public postHolidayListToDailyMuster(data){
    return this.http.post<any>('/api/Payroll?reqType=post-holiday-list-to-daily-muster', data, this.options);
  }
  public putLeaveRules(data) {
    return this.http.put<any>('/api/Payroll?reqType=put-leave-rules', data, this.options)
  }
  public putChangeAttendance(data) {
    return this.http.put<any>('/api/Payroll?reqType=put-changed-attendance', data, this.options);
  }

}
