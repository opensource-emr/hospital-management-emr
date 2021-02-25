import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import * as moment from 'moment/moment';


//File: Danphe Range Select
//CreatedBy: Sud: 16Apr'20
//Description: It provides Custom Date Ranges but in a formatted manner like: Last1Week, Last1Month, etc.

@Component({
    selector: "danphe-date-range-select",
    templateUrl: "./danphe-date-range-select.html"
})
export class DanpheDateRangeSelectComponent {



    public showSelector: boolean = false;
    public showLabel: boolean = false;

    public fromDate: string = null;
    public toDate: string = null;

    @Output("onDateChange")
    onDateRangeChange: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public changeDetector: ChangeDetectorRef) {

    }


    @Input("rangeType")
    rangeType: string = "None";

    // public set value(val: string) {
    //     this.rangeType = val ? val : "None";
    //     this.RangeTypeOnChange();
    // }

    //User can give what all ranges options they want in dropdown. default: all
    //Custom will be available all the time,  other are parameterized.
    @Input("date-range-options")
    public dateRangeOptionsStr: string = "1W,1M,3M,6M";
    public dateRangeOptions = { week1: true, month1: true, month3: true, month6: true };



    ngOnInit() {

        this.CheckForGlobalDateRange();

        if (this.rangeType) {
            this.RangeTypeOnChange();
        }

        if (this.dateRangeOptionsStr) {
            //public dateRangeOptionsStr: string = "1W,1M,3M,6M";
            //public dateRangeOptions = { week1: true, month1: true, month3: true, month6: true };
            this.dateRangeOptions.week1 = this.dateRangeOptionsStr.indexOf('1W') > -1;
            this.dateRangeOptions.month1 = this.dateRangeOptionsStr.indexOf('1M') > -1;
            this.dateRangeOptions.month3 = this.dateRangeOptionsStr.indexOf('3M') > -1;
            this.dateRangeOptions.month6 = this.dateRangeOptionsStr.indexOf('6M') > -1;
        }
    }


    public CheckForGlobalDateRange() {
        var savedRangeStr = localStorage.getItem("Custom_DateRange");
        if (savedRangeStr) {
            var LocalDateParsed = JSON.parse(savedRangeStr);
            this.isFavourite = LocalDateParsed.useFavourite;
            if (this.isFavourite == true) {
                this.rangeType = LocalDateParsed.dateRangeName;
                this.fromDate = LocalDateParsed.fromDate;
                this.toDate = LocalDateParsed.toDate;
            }
        }
    }

    RangeTypeOnChange() {
        this.showSelector = false;
        this.showLabel = false;

        this.changeDetector.detectChanges();
        if (this.rangeType == "None") {
            var from = new Date();
            var to = new Date();
            to.setHours(23, 59, 59, 999);
            from.setHours(0, 0, 0, 0);
            from.setMonth(from.getMonth() - 1);
            this.fromDate = moment(from).format('YYYY-MM-DD');
            this.toDate = moment(to).format('YYYY-MM-DD');
            this.showLabel = true;
            this.onDateRangeChange.emit({ fromDate: this.fromDate, toDate: this.toDate });
        }
        else if (this.rangeType == "last1Week") {
            var from = new Date();
            from.setHours(0, 0, 0, 0);
            from.setDate(from.getDate() - 7);
            this.fromDate = moment(from).format('YYYY-MM-DD');
            this.toDate = moment(to).format('YYYY-MM-DD');
            this.showLabel = true;
            this.onDateRangeChange.emit({ fromDate: this.fromDate, toDate: this.toDate });
        }
        else if (this.rangeType == "last3Months") {
            //from --> 1st of month 00:00 hrs, to --> (today) 23:59 hrs
            var from = new Date();
            from.setHours(0, 0, 0, 0);
            from.setMonth(from.getMonth() - 3);
            this.fromDate = moment(from).format('YYYY-MM-DD');

            this.toDate = moment(to).format('YYYY-MM-DD');
            this.showLabel = true;
            this.onDateRangeChange.emit({ fromDate: this.fromDate, toDate: this.toDate });
        }
        else if (this.rangeType == "last6Months") {
            //from --> 1st of month 00:00 hrs, to --> (today) 23:59 hrs
            var from = new Date();
            from.setHours(0, 0, 0, 0);
            from.setMonth(from.getMonth() - 6);
            this.fromDate = moment(from).format('YYYY-MM-DD');
            // }
            this.toDate = moment(to).format('YYYY-MM-DD');
            this.showLabel = true;
            this.onDateRangeChange.emit({ fromDate: this.fromDate, toDate: this.toDate });
        }
        else {//this is Custom Date Range
            //even for Custom, if there's a favourite set, then we have to use that only.
            if(!this.isFavourite){
                this.fromDate = this.toDate = moment().format('YYYY-MM-DD');
                this.showSelector = true;
            }
        }

        this.changeDetector.detectChanges();

        if (this.isFavourite) {
            localStorage.setItem("Custom_DateRange", JSON.stringify({ useFavourite: true, dateRangeName: this.rangeType, fromDate: this.fromDate, toDate: this.toDate }));
        }
    }

    OnFromToChange($event) {
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
    }

    ChangeCustomDate() {
        var fDate = moment(this.fromDate).format('YYYY-MM-DD');
        var tDate = moment(this.toDate).format('YYYY-MM-DD');
        this.onDateRangeChange.emit({ fromDate: fDate, toDate: tDate });
    }

    public isFavourite: boolean = false;
    RemoveFavourite() {
        this.isFavourite = false;
        localStorage.removeItem("Custom_DateRange");
    }
    AddToFavourite() {
        this.isFavourite = true;
        localStorage.setItem("Custom_DateRange", JSON.stringify({ useFavourite: true, dateRangeName: this.rangeType, fromDate: this.fromDate, toDate: this.toDate }));
    }


}