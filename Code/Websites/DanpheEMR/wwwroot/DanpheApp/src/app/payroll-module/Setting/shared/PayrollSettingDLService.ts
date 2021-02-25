import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class PayrollSettingDLService {
    //  public http: HttpClient;
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    
    constructor(public http: HttpClient) {
    }
    public GetFiscalYearsList() {
        return this.http.get<any>('/api/Payroll?reqType=fiscalYearList', this.options);
    }
    //Get Leave Categories
    public getLeaveCategory() {
        return this.http.get<any>('/api/Payroll?reqType=leaveCategoriesList', this.options);
    }
    //getweekend holidays
    public getSelectedYearWeekendList(year: number) {
        return this.http.get<any>('/api/Payroll?reqType=WeekendHolidaysDetails&Year=' + year);
    }
    //post weekend holidays
    public PostWeekendHolidays(DaysObjString: string) {
        try {
            let data = DaysObjString;
            return this.http.post<any>("/api/Payroll?reqType=PostWeekendHolidays", data);
        }
        catch (ex) {
            throw (ex);
        }
    }
    public PostLeaveCategory(CurrentLeaveCategory) {
        let data = JSON.stringify(CurrentLeaveCategory);
        return this.http.post<any>("/api/Payroll?reqType=AddLeaveCategory", data);
    }

    //put
    public PutLeaveCategory(CurrentLeaveCategory){
        let data = JSON.stringify(CurrentLeaveCategory);
        return this.http.put<any>("/api/Payroll?reqType=PutLeaveCategory", data);
    }
}
