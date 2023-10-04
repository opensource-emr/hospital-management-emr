import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { PayrollSettingDLService } from "./PayrollSettingDLService";
import { map } from 'rxjs/operators';
import { WeekendHolidays } from '../../Shared/Payroll-weekend-holiday-policy.model';
import { LeaveCategories } from '../../Shared/Payroll-Leave-Category.model';

@Injectable()
export class PayrollSettingBLService {
    constructor(public payrollsettingDLService: PayrollSettingDLService) {
    }
    public GetFiscalYearList() {
        return this.payrollsettingDLService.GetFiscalYearsList()
            .pipe(map(res => {
                return res;
            }));
    }
    public getLeaveCategory() {
        return this.payrollsettingDLService.getLeaveCategory()
            .pipe(map(res => {
                return res;
            }));
    }
    public getSelectedYearWeekendList(year: number){
            return this.payrollsettingDLService.getSelectedYearWeekendList(year)
                .map((res) => {
                    return res;
                });
    }
    //post weekend holidays
    public PostWeekendHolidays(daysList: Array<WeekendHolidays>) {
        try {
            var data = JSON.stringify(daysList);
            return this.payrollsettingDLService.PostWeekendHolidays(data)
                .map(res => { return res; });
        }
        catch (ex) {
            throw ex;
        }
    }
        //Post
        public AddLeaveCategory(CurrentLeaveCategory: LeaveCategories) {
             var temp = _.omit(CurrentLeaveCategory, ['LeaveCategoryValidator']);
            return this.payrollsettingDLService.PostLeaveCategory(temp)
                .map(res => { return res });
        }

        //put
        public UpdateLeaveCategory(CurrentLeaveCategory: LeaveCategories) {
            var temp = _.omit(CurrentLeaveCategory, ['LeaveCategoryValidator']);
            return this.payrollsettingDLService.PutLeaveCategory(temp)
                .map(res => { return res });
        }
}
