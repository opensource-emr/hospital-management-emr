import { NgModule, Component } from '@angular/core';
import { RouterModule } from "@angular/router";
//import { PayrollBLService } from '../../Shared/payroll.bl.service';
import { PayrollSettingBLService } from '../shared/PayrollSettingBLService';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment';
import { WeekendHolidays} from "../../Shared/Payroll-weekend-holiday-policy.model";
import { CoreService } from "../../../core/shared/core.service";

@Component({
    selector: 'weekend-holiday',
    templateUrl: './weekend-holiday.html',
})
export class WeekendHolidayPolicyComponent {
    public fiscalYearList: Array<any> = new Array<any>();
   public weekendHolidays: Array<WeekendHolidays> = new Array<WeekendHolidays>();
   public tempHolidays:Array<WeekendHolidays> = new Array<WeekendHolidays>();
   public currentYear: any;
   public years :Array<any> = new Array<any>();
   public selectedYear:any;
   public IsCheckPolicy: boolean = false;
   public ShowPolicy:boolean = false;
   public update:boolean = false;

    constructor(public msgBoxServ: MessageboxService,
        public payrollsettingBLServ: PayrollSettingBLService,
        public _coreService:CoreService ) {
        this.currentYear = moment().startOf("year").format('YYYY');
        this.selectedYear = this.currentYear;
        this.getDefaultYearForAttendance();
        this.getSelectedYearWeekendList(this.selectedYear);
    }

    
  public WeekDays: any = [
    { Day: "Sunday", Id :1,   every: false, first:false,  second:false, third:false, fourth:false },
    { Day: "Monday",Id : 2 ,   every: false, first:false,  second:false, third:false, fourth:false},
    { Day: "Tuesday" ,Id : 3 ,   every: false, first:false,  second:false, third:false, fourth:false},
    { Day: "Wednesday", Id : 4 ,    every: false, first:false,  second:false, third:false, fourth:false },
    { Day: "Thursday",Id : 5 ,    every: false, first:false,  second:false, third:false, fourth:false},
    { Day: "Friday",Id : 6 ,   every: false, first:false,  second:false, third:false, fourth:false},
    { Day: "Saturday",Id : 7,    every: false, first:false,  second:false, third:false, fourth:false }
  ]
    public UpdatePolicy(){
        this.IsCheckPolicy = true;
        this.ShowPolicy = false;
        var holidays = this.WeekDays.filter(s=> s.every == true ||  s.first==true || s.second ==true || s.third == true || s.fourth == true);
        if(holidays.length > 0){
            this.weekendHolidays = new Array<WeekendHolidays>();
            this.CalculateweekendHolidays(holidays);
            this.updateExistingWeekends();
            if(this.weekendHolidays.length > 0){
                this.payrollsettingBLServ.PostWeekendHolidays(this.weekendHolidays)
                .subscribe(res => {
                  if (res.Status == "OK") {
                    this.msgBoxServ.showMessage('success', ['Successfully set weekend holidays']);
                    //this.weekendHolidays = new Array<any>();
                    this.weekendHolidays = this.weekendHolidays.filter(data=> data.Value != null);
                    this.IsCheckPolicy = false;
                    this.ShowPolicy = true;
                    if(this.selectedYear == this.currentYear){
                        this.update = true;
                    }
                  }
                });
                }
            }
            else{
                this.msgBoxServ.showMessage('', ['Select Days of weeks.']);
                this.weekendHolidays = new Array<WeekendHolidays>();
            }
    }
    public ToggleItemSelection(index: number){
        try {
            if (this.WeekDays[index].every) {
                let selectedweek = this.WeekDays.find(s => s.every == true);
                  if(selectedweek != null){
                         this.WeekDays[index].first = false;
                         this.WeekDays[index].second = false;
                         this.WeekDays[index].third = false;
                         this.WeekDays[index].fourth = false;
                  }
            }
            else {
                this.WeekDays[index].every =false;
            }
        } catch (ex) {
            console.log(ex);
        }
    }
    public ToggleSelectDay(index: number) {
        try {
            let selectedDay =  this.WeekDays.find(s => s.first==true || s.second ==true || s.third == true || s.fourth == true );
            if (selectedDay) {
                this.WeekDays[index].every =false;
            }
            else {
                
            }
        }catch (ex) {
            console.log(ex);
        }
    }
    public CalculateweekendHolidays(holiday: Array<any>){
        holiday.forEach(data => {
            let SelectedWeekend   = new WeekendHolidays();
                SelectedWeekend.DayName = data.Day;
                SelectedWeekend.Year = this.selectedYear;
                SelectedWeekend.CreatedOn =  moment().format('YYYY-MM-DD');
                if(data.every==true){
                    SelectedWeekend.Value = "every";
                    SelectedWeekend.Description = "Every " + data.Day + " is Weekend Holiday " + "for year "+ this.selectedYear;
                }
                else{
                    if(data.first==true){
                        SelectedWeekend.Value = "First";
                    }
                    if(data.second == true){
                        SelectedWeekend.Value = SelectedWeekend.Value == null ? "Second" : SelectedWeekend.Value +", " + "Second";
                    }
                    if(data.third == true){
                        SelectedWeekend.Value = SelectedWeekend.Value == null ? "Third" : SelectedWeekend.Value +", " + "Third";
                    }
                    if(data.fourth == true){
                        SelectedWeekend.Value = SelectedWeekend.Value == null ? "Fourth" : SelectedWeekend.Value +", " + "Fourth";
                    }
                    SelectedWeekend.Description =  SelectedWeekend.Value + " " + data.Day + " is Weekend holiday of the month for year "+  this.selectedYear;
                }
               
                this.weekendHolidays.push(SelectedWeekend);
            });
    }
public Back(){
    this.IsCheckPolicy = false;
    this.ShowPolicy = true;
    if(this.selectedYear == this.currentYear){
        this.update = true;
    }
    this.weekendHolidays = new Array<WeekendHolidays>();
    this.getSelectedYearWeekendList(this.selectedYear);
}
getDefaultYearForAttendance() {
    let backYearToShow = this._coreService.Parameters.find(p => p.ParameterGroupName == "Payroll"
        && p.ParameterName == "PayrollLoadNoOfYears").ParameterValue;
    var range = [];
    for (var i = this.currentYear - backYearToShow; i <= this.currentYear; i++) {
        this.years.push(i);
    }
}
public OnYearChange()
{
    var year = this.selectedYear;
    this.ShowPolicy =false;
    this.IsCheckPolicy = false;
    this.reset();
   this.getSelectedYearWeekendList(year);
   this.update = false;
}
getSelectedYearWeekendList(year: any){
    try {
        this.payrollsettingBLServ.getSelectedYearWeekendList(year).subscribe(res => {
            if (res.Status == "OK") {
                this.weekendHolidays = new Array<WeekendHolidays>();
                this.weekendHolidays = res.Results;
                this.weekendHolidays = this.weekendHolidays.filter(data=> data.Value != null);
                this.tempHolidays = res.Results;
                if(this.weekendHolidays.length){
                    this.update = false;
                    this.ShowPolicy = true;
                    if(this.selectedYear == this.currentYear){
                        this.update = true;
                    }
                }
                else{
                    this.msgBoxServ.showMessage("", ["There is no weekend holiday policy for year "+this.selectedYear]);
                    this.ShowPolicy = false;
                    this.update = false;
                    if(this.selectedYear == this.currentYear){
                        this.update = true;
                    }
                }
            }
            else {
                this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            }
        });
    }
    catch (ex) {
        console.log(ex);
    }
}
public Edit(){
    this.IsCheckPolicy = true;
    this.ShowPolicy = false;
    this.update =false;
    this.weekendHolidays.forEach(data=>{
        var tempday = data.DayName;
        var selWeek = data.Value;
      this.WeekDays.filter(a => a.Day == data.DayName.trim()).forEach(week => {
            if(data.Value.includes("every")){
                week.every = true;
            }
            if(data.Value.includes("First")){
                week.first = true;
            }
            if(data.Value.includes("Second")){
                week.second = true;
            }
            if(data.Value.includes("Third")){
                week.third = true;
            }
            if(data.Value.includes("Fourth")){
                week.fourth = true;
            }
        });
    });
}
reset(){
    this.WeekDays = [
        { Day: "Sunday", Id :1,   every: false, first:false,  second:false, third:false, fourth:false },
        { Day: "Monday",Id : 2 ,   every: false, first:false,  second:false, third:false, fourth:false},
        { Day: "Tuesday" ,Id : 3 ,   every: false, first:false,  second:false, third:false, fourth:false},
        { Day: "Wednesday", Id : 4 ,    every: false, first:false,  second:false, third:false, fourth:false },
        { Day: "Thursday",Id : 5 ,    every: false, first:false,  second:false, third:false, fourth:false},
        { Day: "Friday",Id : 6 ,   every: false, first:false,  second:false, third:false, fourth:false},
        { Day: "Saturday",Id : 7,    every: false, first:false,  second:false, third:false, fourth:false }
    ]
}
public updateExistingWeekends(){
    var temp = "";
    this.weekendHolidays.forEach(itm => {
       temp += itm.DayName + ',';
    });
    this.tempHolidays.forEach(data =>{
      var day = data.DayName.trim();
        if(!temp.includes(day)){
            let week = new WeekendHolidays();
            week.Value = null;
            week.Description = null;
            week.IsApproved = false;
            week.Year = data.Year;
            week.DayName = data.DayName;
            week.CreatedOn =   moment().format('YYYY-MM-DD');
            this.weekendHolidays.push(week);
        }
    });
}
}
