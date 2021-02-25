import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment/moment';
import { NepaliCalendarService } from '../../calendar/np/nepali-calendar.service';
import { NepaliDate } from '../../../shared/calendar/np/nepali-dates';
import { CoreService } from '../../../core/shared/core.service';

@Component({
    selector: "date-lbl",
    templateUrl: "./date-label.html"
})
export class DateLabelComponent {
    //this class will show the Date in required format (AD/BS).
    //this was needed since there a lots of places which needs explicit conversion of this.
    // uses core-service's selected date format.
    //default date is nepali (BS) unless changed from the Global Variable.


    @Input('value')
    ipDateValue: string = "";

    displayDate: string = "";//this one will be shown to the user.
    tooltipDate: string = "";//this one will be seen on tooltip.

    @Input('show-time')
    showTime: boolean = false;

    public calendarType: string = "np";//default is np (BS date.)

    public showNepDate: boolean = false;
    public showEngDate: boolean = false;

    public npDate: string = "";
    public engDate: string = "";
    public timeValue: string = "";

    constructor(public coreService: CoreService, public nepaliCalendarServ: NepaliCalendarService) {
        this.calendarType = this.coreService.DatePreference;

        this.showNepDate = this.calendarType == "np";
        this.showEngDate = !this.showNepDate;

    }

    ngOnInit() {
        if (this.ipDateValue) {
            this.npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(this.ipDateValue);
            this.engDate = moment(this.ipDateValue).format("YYYY-MM-DD");
            this.timeValue = moment(this.ipDateValue).format("hh:mm A");

            if (this.showEngDate) {
                this.displayDate = this.showTime ? this.engDate + " " + this.timeValue : this.engDate;
            }
            else {
                this.displayDate = this.showTime ? this.npDate + " " + this.timeValue : this.npDate;
            }

            this.tooltipDate = "(AD) " + this.engDate + "\n(BS) " + this.npDate;


        }

        // console.log("from date label component");
        // console.log(this.ipDateValue);
    }


}