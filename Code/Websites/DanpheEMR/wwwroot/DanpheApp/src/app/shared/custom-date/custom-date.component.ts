import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment/moment';

@Component({
    selector: "danphe-cust-date",
    templateUrl: "./custom-date.html"
})
export class CustomDateComponent {
    public showSelector: boolean = false;
    public fromDate: string = null;
    public toDate: string = null;
    public rangeType: string ="";

    @Output("onDateChange")
    event: EventEmitter<Object> = new EventEmitter<Object>();

    constructor() {

    }
    @Input("rangeType")
    public set value(val: string) {
        this.rangeType = val ? val : "today";
        this.RangeTypeOnChange();
    }
    RangeTypeOnChange() {
        this.showSelector = false;
        if (this.rangeType == "today") {
            //modify date as we want --> for Today --> 00:00 hrs to 23:59 hrs
            var from = new Date();
            from.setHours(0, 0, 0, 0);
            var to = new Date();
            to.setHours(23, 59, 59, 999);

            this.fromDate = moment(from).format('YYYY-MM-DD HH:mm');
            this.toDate = moment(to).format('YYYY-MM-DD HH:mm');
            this.event.emit({ fromDate: this.fromDate, toDate: this.toDate });
        }
        else if (this.rangeType == "lastWeek") {
            //from --> (-7days) 00:00 hrs, to --> (today) 23:59 hrs
            var to = new Date();
            to.setHours(23, 59, 59, 999);
            var from = new Date(to.getTime() - (7 * 24 * 60 * 60 * 1000));
            from.setHours(0, 0, 0, 0);

            this.fromDate = moment(from).format('YYYY-MM-DD HH:mm');
            this.toDate = moment(to).format('YYYY-MM-DD HH:mm');
            this.event.emit({ fromDate: this.fromDate, toDate: this.toDate });
        }
        else if (this.rangeType == "thisMonth") {
            //from --> 1st of month 00:00 hrs, to --> (today) 23:59 hrs
            var to = new Date();
            to.setHours(23, 59, 59, 999);
            var from = new Date(new Date().setDate(1));
            from.setHours(0, 0, 0, 0);

            this.fromDate = moment(from).format('YYYY-MM-DD HH:mm');
            this.toDate = moment(to).format('YYYY-MM-DD HH:mm');
            this.event.emit({ fromDate: this.fromDate, toDate: this.toDate });
        }
        else {
            this.fromDate = this.toDate = moment().format('YYYY-MM-DD');
            this.showSelector = true;
            //this.event.emit({fromDate:this.fromDate, toDate:this.toDate});
        }
    }

    ChangeCustomDate() {
        var fDate = moment(this.fromDate).format('YYYY-MM-DD 00:00');
        var tDate = moment(this.toDate).format('YYYY-MM-DD 23:59');
        this.event.emit({ fromDate: fDate, toDate: tDate });
    }
}