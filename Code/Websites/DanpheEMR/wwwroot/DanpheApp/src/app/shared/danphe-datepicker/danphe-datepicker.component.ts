import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NepaliCalendarService } from '../calendar/np/nepali-calendar.service';
import { NepaliDate } from '../../shared/calendar/np/nepali-dates';
import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';
@Component({
    selector: "danphe-date-picker",
    templateUrl: "./danphe-datepicker.html"
})
export class DatePickerComponent {
    public showNpCalendar: boolean = false;
    public showEnCalendar: boolean = false;
    public npDate: NepaliDate;
    public enDate: string = "";
    public showcalendar: string = "";
    @Input("CalendarTypes")
    public calTypes: string = "en";

    @Output("onDateChange")
    onDateChange: EventEmitter<object> = new EventEmitter<object>();

    get ngModel() {
        return this.enDate;
    }

    @Input()
    set ngModel(ipEngDate: string) {
        if (this.IsValidEngDate(ipEngDate)) {
            this.enDate = ipEngDate;
            this.EngCalendarOnDateChange();
        }
    }

    @Output()
    ngModelChange = new EventEmitter<any>();

  constructor(public npCalendarService: NepaliCalendarService,
    public coreService: CoreService) {

    this.showcalendar = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "IsShowNepaliCalendar").ParameterValue;

    }

    ngOnInit() {
        //this.enDate = this.ngModel();//remove it if not required.
        this.EngCalendarOnDateChange();
        this.showCalendar(this.calTypes);
        this.ngModelChange.emit(this.enDate);
        console.log("CalendarTypes=" + this.calTypes);
    }

    //checks the requirement and shows calender accordingly
    showCalendar(cal) {
        let types: string[] = cal.split(',');
        for (var i = 0; i < types.length; i++) {
            switch (types[i]) {
              case "np":

                this.showNpCalendar = this.showcalendar == "false" ? false : true;
               
                break;
              case "en":

                this.showEnCalendar = this.showcalendar == "false" ? true : false;
               
                    
                    break;
                default:
                    break;
            }
        }
    }

    //converting date from Nepali date to English date
    NepCalendarOnDateChange() {
        let engDate = this.npCalendarService.ConvertNepToEngDate(this.npDate);
        this.enDate = moment(engDate).format("YYYY-MM-DD");
        this.ngModelChange.emit(this.enDate);
        this.onDateChange.emit({ npDate: this.npDate.npDate, enDate: this.enDate });
    }
    //converting date from English date to Nepali date
    EngCalendarOnDateChange() {
        if (this.enDate) {
            let nepDate = this.npCalendarService.ConvertEngToNepDate(this.enDate);
            this.npDate = nepDate;
            this.ngModelChange.emit(this.enDate);
            this.onDateChange.emit({ npDate: this.npDate.npDate, enDate: this.enDate });
        }
    }

    //matches regular exprsn for : YYYY-MM-DD eg: 2060-10-18, etc.
    public IsValidEngDate(ipEngDate: string) {
        if (ipEngDate) {
            var regEx = /^\d{4}-\d{1,2}-\d{1,2}$/;
            return ipEngDate.match(regEx) != null;
        }
        return false;
    }
    changetoEnglish() {
        this.showNpCalendar = false;
         this.showEnCalendar = true;
    }
    changetoNepali() {
        this.showEnCalendar = false;
        this.showNpCalendar = true;
    }
}
