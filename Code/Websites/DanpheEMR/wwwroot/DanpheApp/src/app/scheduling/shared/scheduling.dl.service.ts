import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class SchedulingDLService {
   public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
   
   constructor(public http: HttpClient) {

    }

    //                        *** GET ***

    //GET : List of Employees
    public GetEmployeeList() {
        return this.http.get<any>('/api/scheduling?reqType=employeelist', this.options);
    }
    //GET : assigned or default schedule of selected employees
    public GetEmpSchedule(selectedEmpIds, dates) {
        return this.http.get<any>('/api/scheduling?reqType=getEmpSchedule&EmpIds=' + selectedEmpIds + '&dates=' + dates, this.options);
    }
    //GET: list of shifts
    public GetShiftsList() {
        return this.http.get<any>('/api/scheduling?reqType=getShiftList', this.options);
    }
    //GET: list of employee working hours
    public GetEmpWHList() {
        return this.http.get<any>('/api/scheduling?reqType=getEmpWHList', this.options);
    }
    //GET: load list of shifts with 'IsDefault = true'
    public GetDefaultShifts() {
        return this.http.get<any>('/api/scheduling?reqType=getDefaultShifts', this.options);
    }
    //GET: List of Employees that doesnt have any shift assigned.(employee with no shifts)
    public GetEmployeeNoShift() {
        return this.http.get<any>('/api/scheduling?reqType=getEmployeeNoShift', this.options);
    }



    //                      *** POST ***

    //POST : employee schedules
    public PostEmpSchedule(temp) {
        let data = JSON.stringify(temp);
        return this.http.post<any>("/api/scheduling?reqType=manageEmpSchedules", data, this.options);
    }
    //
    public AddShift(temp) {
        let data = JSON.stringify(temp);
        return this.http.post<any>("/api/scheduling?reqType=AddShift", data, this.options);
    }

    public EmpWorkingHours(temp) {
        let data = JSON.stringify(temp);
        return this.http.post<any>("/api/scheduling?reqType=EmpWokringHours", data, this.options);
    }


    //                  *** PUT ***

    //
    public UpdateShift(temp) {
        let data = JSON.stringify(temp);
        return this.http.put<any>("/api/scheduling?reqType=UpdateShift", data, this.options);
    }
}