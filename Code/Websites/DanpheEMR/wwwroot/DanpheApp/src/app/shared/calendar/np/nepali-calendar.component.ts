import { Component, ChangeDetectorRef, OnChanges } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core";
import { NepaliCalendarService } from './nepali-calendar.service';
import {
  NepaliDate, NepaliMonth, NepaliDay, NepaliYear, NepaliHours, NepaliMinutes, NepaliAMPM
} from './nepali-dates';

import * as moment from 'moment/moment';
import { CoreService } from '../../../core/shared/core.service';
import { SecurityService } from '../../../security/shared/security.service';
import { FiscalYearModel } from '../../../accounting/settings/shared/fiscalyear.model';

@Component({
  selector: "np-calendar",
  templateUrl: "./nepali-calendar.html",
  styleUrls: ['./nepali-calender-stylesheet.css']
})
export class NepaliCalendarComponent {
  public npDateModel: NepaliDate = new NepaliDate();

  public showCalendar: boolean = false;
  public dayNo: string;
  public monthNo: string;
  public yearNo: string;
  public hoursNo: number;
  public minutesNo: number;
  public amPm: string;

  public nepYears: Array<NepaliYear> = [];
  public nepMonths: Array<NepaliMonth> = [];
  public nepDays: Array<NepaliDay> = [];
  public hoursList: Array<NepaliHours> = [];
  public minutesList: Array<NepaliMinutes> = [];
  public amPMList: Array<NepaliAMPM> = [];  

  @Input("input-focus") //coming from parent form
  public inputFocus:boolean=null;

  public outputToDatePicker:boolean = null;

  @Output('output-focus') outputFocus:EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input("showTime")
  public showTime: boolean = false;

  @Input("display")
  public display: string = "";

  //@Output() ngModelChange = new EventEmitter();
  @Output() ipDateChanged: EventEmitter<object> = new EventEmitter<object>();

  //@Input("sel-date") inputNpDate: NepaliDate;

  public inputNpDate: NepaliDate;

  ipEnDate: string
  get InputNepDate(): string {
    return this.ipEnDate;
  }

  @Input("sel-date")
  set InputNepDate(value: string) {
    this.ipEnDate = value;
    this.inputNpDate = this.npCalendarService.ConvertEngToNepDate(this.ipEnDate);
    this.ngOnInitialization();
  }

  //minimum and maximum values shown in dropdown.
  //this is different than valid dates. Invalid Dates are still loaded but will be disabled in the calendar.
  public min_calYear_Np: number = 0;//this decides the minimum year shown in calendar
  public max_calYear_Np: number = 0;//this decides the maximum year shown in calendar


  public minValidDate_en: string;
  @Input("minimum-date")
  set setMinDate(value: string) {
    this.minValidDate_en = value;
    this.minValidDate_np = this.npCalendarService.ConvertEngToNepDate(this.minValidDate_en);
  }
  get setMinDate(): string {
    return this.minValidDate_en;
  }


  public maxValidDate_en: string;
  @Input("maximum-date")
  set setMaxDate(value: string) {
    this.maxValidDate_en = value;
    this.maxValidDate_np = this.npCalendarService.ConvertEngToNepDate(this.maxValidDate_en);
  }
  get setMaxDate(): string {
    return this.maxValidDate_en;
  }

  @Input("np-year-settings")
  public npYearSettings: any;

  public minValidDate_np: NepaliDate = null;
  public maxValidDate_np: NepaliDate = null;

  public freshDayState: boolean = true;
  public freshMonthState: boolean = true;
  public freshYearState: boolean = true;
  public currentYear: string;

  public npDateModelForBoard: NepaliDate = new NepaliDate();
  public showBoard: boolean = false;
  public nepaliTime: string;

  // START:Vikas: 06th Aug 20: Added for month calendar chnages.
  public selectedFiscalYear: any;
  public showMonthsList: Array<any> = new Array<any>();
  public FilteredFiscalYearList: Array<FiscalYearModel> = [];
  public FiscalYearList: Array<FiscalYearModel> = [];
  public monthDisplayNumber: any;
  public fiscalYearId:number=0;

  public monthNumber: any;  
  public showmonthCalendar: boolean = false;
  @Input("showmonthCalendar")
  set setmonthCalendar(value: boolean) {
    this.showmonthCalendar = value;   
    if(this.showmonthCalendar ==true){
      this.getFiscalYear(); 
    }     
  }
  @Input("showFiscalYear")
  public showFiscalYear:boolean =false;

  // END:Vikas: 06th Aug 20: Added for month calendar chnages.

  constructor(public npCalendarService: NepaliCalendarService, public coreService: CoreService,
    public changeDetector: ChangeDetectorRef, private securityService: SecurityService) {
    this.LoadTimeDetails();
    this.LoadTodaysDate();
    //This is initial Load, it'll be modified as per Calendar Settings and Min/Max date settings
    //min 1950BS, max 2080BS.. increase this limit in future..
    this.nepYears = NepaliYear.GetAllNepaliYears();
    this.nepMonths = NepaliMonth.GetNepaliMonths();
    this.monthNumber = +  moment().format('MM');
    this.nepYears.sort(function (a, b) {
      return b.yearNumber - a.yearNumber
    });
    this.min_calYear_Np = this.npCalendarService.minNepYear;
    this.max_calYear_Np = this.npCalendarService.maxNepYear;
    this.showCalendar = true;
      
  }

  ngOnChanges(){
     if(this.inputFocus){
       if(!this.showmonthCalendar && this.showCalendar){
        this.setFocusById('inputYear');
       }
       else if(this.showmonthCalendar){
        this.setFocusById('FiscalYearName');
       }
     }
  }

  ngOnInitialization() {
    if (this.inputNpDate) {
      if (this.IsValidNepDate(this.inputNpDate)) {
        this.npDateModel = Object.assign({}, this.inputNpDate);
        this.dayNo = this.npDateModel.Day.toString();
        this.monthNo = this.npDateModel.Month.toString();
        this.yearNo = this.npDateModel.Year.toString();

        this.dayNo.length == 1 ? (this.dayNo = '0' + this.dayNo) : (this.dayNo = this.dayNo);
        this.monthNo.length == 1 ? (this.monthNo = '0' + this.monthNo) : (this.monthNo = this.monthNo);

        this.hoursNo = this.npDateModel.Hours;
        this.minutesNo = this.npDateModel.Minutes;
        this.amPm = this.npDateModel.AMPM;

        this.nepaliTime = this.convertToTypeTime(this.hoursNo, this.minutesNo, this.amPm);

        //sud:21Aug'19-this will reload the nepali calendar's days in the month..
        this.nepDays = this.npCalendarService.GetDaysOfMonthBS(+this.yearNo, +this.monthNo);
        //this.npCalendarService.nepDaysInSelectedMonth = this.npCalendarService.GetDaysOfMonthBS(this.yearNo, this.monthNo);
      }
    }


    this.npDateModel = {
      Year: +this.yearNo,
      Month: +this.monthNo, Day: +this.dayNo, Hours: this.hoursNo, Minutes: this.minutesNo,
      AMPM: this.amPm,
      npDate: this.yearNo + "-" + this.monthNo + "-" + this.dayNo
    };

    //after all set, then we need to emit the change function
    //this.ipDateChanged.emit({ npModel: this.npDateModel });

  }

  ngOnInit() {
    this.InitializeMinMaxNpDate();    
  }

  InitializeMinMaxNpDate() {
    if (this.minValidDate_en && this.minValidDate_en.trim().length > 0) {
      this.minValidDate_np = this.npCalendarService.ConvertEngToNepDate(this.minValidDate_en);
    }
    if (this.maxValidDate_en && this.maxValidDate_en.trim().length > 0) {
      this.maxValidDate_np = this.npCalendarService.ConvertEngToNepDate(this.maxValidDate_en);
    }
  }

  convertToTypeTime(hrs: number, min: number, ampm: string): string {
    if (ampm == 'AM' && hrs == 12) { hrs = 0; }
    let ret = '';
    if (ampm == "AM") {
      ret = ((hrs < 10) ? ('0' + hrs) : hrs) + ':' + ((min < 10) ? ('0' + min) : min);
    } else {
      let pmhrs = ((hrs < 12) ? (hrs + 12) : hrs);
      ret = pmhrs + ':' + ((min < 10) ? ('0' + min) : min);
    }
    return ret;
  }


  //matches regular exprsn for : YYYY-MM-DD eg: 2060-10-18, etc.
  public IsValidNepDate(nplDate: NepaliDate) {
    let ipDate = nplDate.Year + "-" + nplDate.Month + "-" + nplDate.Day;
    //matching formats: 2011-1-17, 2011-01-9, 2011-01-23, etc..
    var regEx = /^\d{4}-\d{1,2}-\d{1,2}$/;
    return ipDate.match(regEx) != null;
  }



  //Implementation Pending.--sud: 17Dec17
  //currently: npCalendarOnChange event doesn't fire after this event.
  SetTodaysDateOnClick() {
    this.LoadTodaysDate();
    //this.ngModelChange.emit(this.npDateModel);
    this.ipDateChanged.emit({ npModel: this.npDateModel });
  }

  LoadTodaysDate() {
    let nepDateToday = this.npCalendarService.GetTodaysNepDate();
    this.dayNo = nepDateToday.Day.toString();
    this.monthNo = nepDateToday.Month.toString();
    this.yearNo = nepDateToday.Year.toString();
    this.currentYear = nepDateToday.Year.toString();
    this.hoursNo = nepDateToday.Hours;
    this.minutesNo = nepDateToday.Minutes;
    this.amPm = nepDateToday.AMPM;
    this.LoadDaysOnMonthChange();
  }

  LoadDaysOnMonthChange() {
    this.nepDays = this.npCalendarService.GetDaysOfMonthBS(+this.yearNo, +this.monthNo);
    //if earlier selected dayNumber is more than the no. of days in current month then reset day to 1.
    if (this.nepDays.length < (+this.dayNo)) {
      this.dayNo = "01";
    }

  }

  OnCalendarChange() {
    this.npDateModel = {
      Year: parseInt(this.yearNo.toString()),
      Month: parseInt(this.monthNo.toString()),
      Day: parseInt(this.dayNo.toString()),
      Hours: parseInt(this.hoursNo.toString()),
      Minutes: parseInt(this.minutesNo.toString()),
      AMPM: this.amPm,
      npDate: this.yearNo.toString() + "-" + this.monthNo.toString() + "-" + this.dayNo.toString()
    };
    //we've to emit this model on change of Day,Month,Year all..
    //this.ngModelChange.emit(this.npDateModel);
    this.ipDateChanged.emit({ npModel: this.npDateModel });
  }

  OnTimeChange() {
    let splitted = this.nepaliTime.split(":");
    let min = +splitted[1];
    let hoursnum = +splitted[0];
    this.minutesNo = min;
    this.amPm = hoursnum > 11 ? 'PM' : 'AM';
    this.hoursNo = hoursnum < 12 ? (hoursnum == 0 ? 1 : hoursnum) : (hoursnum == 12 ? hoursnum : (hoursnum - 12));
    this.OnCalendarChange();
  }

  LoadTimeDetails() {
    this.hoursList = NepaliHours.GetAllNepaliHours();
    this.minutesList = NepaliMinutes.GetAllNepaliMinutes();
    this.amPMList = NepaliAMPM.GetAMPM();
  }

  public yearKeyPress(event, nextElem: HTMLInputElement) {
    let prevLenOfYear = this.yearNo.length;
    prevLenOfYear = prevLenOfYear == 4 ? 0 : prevLenOfYear;
    let keycode = event.keyCode;
    if (47 < keycode && keycode < 58) {
      let keyVal = event.key;
      if (this.yearNo && prevLenOfYear == 3) {
        this.yearNo = this.yearNo + event.key;
        nextElem.focus();
        nextElem.select();
        this.onBlur();
      }
      if (prevLenOfYear == 4) {
        this.onBlur();
      }
    } else {
      event.preventDefault();
    }
  }

  monthKeyPress(event, nextElem: HTMLInputElement) {
    let keycode = event.keyCode;

    if (47 < keycode && keycode < 58) {
      let netMonth = this.monthNo + event.key;
      let str: string = event.key.toString();
      if (this.freshMonthState) {
        if (netMonth.length != 2) {
          this.monthNo = '';
          this.changeDetector.detectChanges();
          this.monthNo = '0' + netMonth.substr(-1, 1);
          this.freshMonthState = false;
        }
      }
      else {
        if (netMonth.length == 3) {
          this.monthNo = '';
          this.changeDetector.detectChanges();
          let val = +(netMonth.substr(-2, 2));
          this.monthNo = (val > 12) ? '12' : netMonth.substr(-2, 2);
          this.monthNo = (val == 0) ? '01' : this.monthNo;
          if (this.monthNo && this.monthNo.length == 2 && !this.freshMonthState) {
            nextElem.select();
            this.onBlur();
          }
        }
      }
    }
    else {
      event.preventDefault();
    }
  }

  dayKeyPress(event, nextElem: HTMLInputElement) {
    let keycode = event.keyCode;
    let totalDaysInThisMonth = 28;
    let selYear = this.nepYears.find(y => y.yearNumber == this.npDateModel.Year);
    if (selYear) {
      totalDaysInThisMonth = NepaliCalendarService.yr_mth_bs_static[this.npDateModel.Year][this.npDateModel.Month - 1]
    }

    if (47 < keycode && keycode < 58) {
      let netDay = this.dayNo + event.key;
      if (this.freshDayState) {
        if (netDay.length != 2) {
          this.dayNo = '';
          this.changeDetector.detectChanges();
          this.dayNo = '0' + netDay.substr(-1, 1);
          this.freshDayState = false;
        }
      }
      else {
        if (netDay.length == 3) {
          this.dayNo = '';
          this.changeDetector.detectChanges();
          let val = +(netDay.substr(-2, 2));
          this.dayNo = (val > totalDaysInThisMonth) ? totalDaysInThisMonth.toString() : netDay.substr(-2, 2);
          this.dayNo = (val == 0) ? '01' : this.dayNo;
          if (this.dayNo && this.dayNo.length == 2 && !this.freshDayState) {
            //nextElem.select();
            this.onBlur();
          }
        }
      }
    }
    else {
      event.preventDefault();
    }
  }

  keyDownPressed(event, type: string = '', prev: HTMLInputElement, next: HTMLInputElement, currElm: HTMLInputElement) {
    let eventKeyCode = event.keyCode;
    let totalDaysInThisMonth = 28;
    let selYear = this.nepYears.find(y => y.yearNumber == this.npDateModel.Year);
    if (selYear) {
      totalDaysInThisMonth = NepaliCalendarService.yr_mth_bs_static[this.npDateModel.Year][this.npDateModel.Month - 1]
    }

    //next
    if (eventKeyCode == 39) {
      this.assignValidYearMonthAndDay();
      next.select();
      next.focus();
      this.onBlur();
      event.preventDefault();
      return;
    }
    //previous
    else if (eventKeyCode == 37) {
      this.assignValidYearMonthAndDay();
      prev.select();
      prev.focus();
      this.onBlur();
      event.preventDefault();
      return;
    }

    if (type && type.length == 0) { return; }
    if (type == 'year') {
      if (eventKeyCode == 38) {
        let num = +this.yearNo;
        this.yearNo = (++num).toString();
        currElm.select();
        currElm.focus();
        this.onBlur();
        event.preventDefault();
        return;
      } else if (eventKeyCode == 40) {
        let num = +this.yearNo;
        this.yearNo = (--num).toString();
        currElm.select();
        currElm.focus();
        this.onBlur();
        event.preventDefault();
        return;
      }
    }
    else if (type == 'month') {
      if (eventKeyCode == 38) {
        let num = +this.monthNo;
        this.monthNo = num == 12 ? '1' : (++num).toString();
        this.monthNo = (+this.monthNo < 10) ? '0' + this.monthNo : this.monthNo;
        if (+this.monthNo > 0) {
          let mnth = +this.monthNo;
          let netDay = NepaliCalendarService.yr_mth_bs_static[+this.yearNo][mnth - 1];
          this.dayNo = (+this.dayNo > netDay) ? netDay.toString() : this.dayNo;
        }
        this.onBlur();
      } else if (eventKeyCode == 40) {
        let num = +this.monthNo;
        this.monthNo = num == 1 ? '12' : (--num).toString();
        this.monthNo = (+this.monthNo < 10) ? '0' + this.monthNo : this.monthNo;
        if (+this.monthNo > 0) {
          let mnth = +this.monthNo;
          let netDay = NepaliCalendarService.yr_mth_bs_static[+this.yearNo][mnth - 1];
          this.dayNo = (+this.dayNo > netDay) ? netDay.toString() : this.dayNo;
        }
        this.onBlur();
      }
    }
    else {
      if (eventKeyCode == 38) {
        let num = +this.dayNo;
        this.dayNo = num == totalDaysInThisMonth ? '1' : (++num).toString();
        this.dayNo = (+this.dayNo < 10) ? '0' + this.dayNo : this.dayNo;
        this.onBlur();
      } else if (eventKeyCode == 40) {
        let num = +this.dayNo;
        this.dayNo = num == 1 ? totalDaysInThisMonth.toString() : (--num).toString();
        this.dayNo = (+this.dayNo < 10) ? '0' + this.dayNo : this.dayNo;
        this.onBlur();
      }
    }
  }

  onBlur() {
    this.freshDayState = true;
    this.freshMonthState = true;
    this.freshYearState = true;
    this.OnCalendarChange();
  }

  assignValidYearMonthAndDay() {
    if (!this.yearNo || (this.yearNo && this.yearNo.length < 4)
      || (+this.yearNo < this.min_calYear_Np) || (+this.yearNo > this.max_calYear_Np)) {
      this.yearNo = this.currentYear;
    }
    this.dayNo = (this.dayNo == "00") ? "01" : this.dayNo;
    this.monthNo = (this.monthNo == "00") ? "01" : this.monthNo;
    if (+this.monthNo > 0) {
      let mnth = +this.monthNo;
      let netDay = NepaliCalendarService.yr_mth_bs_static[+this.yearNo][mnth - 1];
      this.dayNo = (+this.dayNo > netDay) ? netDay.toString() : this.dayNo;
    }
  }

  yearOnFocusOut() {
    if (!this.yearNo || (this.yearNo && this.yearNo.length < 4)
      || (+this.yearNo < this.min_calYear_Np) || (+this.yearNo > this.max_calYear_Np)) {
      this.yearNo = this.currentYear;
      this.onBlur();
    } else {
      //show some message
    }
  }

  daysNMonthFocusOut() {
    if (this.dayNo == "00") {
      this.dayNo = "01";
      this.onBlur();
    }
    if (this.monthNo == "00") {
      this.monthNo = "01";
      this.onBlur();
    }
    if (+this.monthNo > 0) {
      let mnth = +this.monthNo;
      let netDay = NepaliCalendarService.yr_mth_bs_static[+this.yearNo][mnth - 1];
      this.dayNo = (+this.dayNo > netDay) ? netDay.toString() : this.dayNo;
      this.onBlur();
    }
  }

  currClicked(ip: HTMLInputElement) {
    this.onBlur();
    ip.focus();
    ip.select();
  }

  showCalenderView(e) {
    try {
      this.npDateModelForBoard = new NepaliDate();
      this.npDateModelForBoard.Year = +this.yearNo;
      this.npDateModelForBoard.Month = +this.monthNo;
      this.npDateModelForBoard.Day = +this.dayNo;
      this.npDateModelForBoard.npDate = this.yearNo + '-' + this.monthNo + '-' + this.dayNo;
      this.showBoard = true;
      e.stopPropagation();
    } catch (e) {
      console.log(e);
    }
  }

  closeCalendarView($event) {
    if ($event && $event.changed) {
      let mnth = $event.month.toString();
      let da = $event.day.toString();
      this.yearNo = $event.year.toString();
      this.monthNo = mnth.length == 2 ? mnth : ('0' + mnth);
      this.dayNo = da.length == 2 ? da : ('0' + da);
      this.onBlur();
    } else {

    }
    this.showBoard = false;
  }

 // START:Vikas: 06th Aug 20: Added for month calendar chnages. 
  getFiscalYear() {
    this.FiscalYearList = Array<FiscalYearModel>();
    this.FiscalYearList = this.securityService.AccHospitalInfo.FiscalYearList;
    this.FiscalYearList.map(f => {
      f.StartDate = moment(f.StartDate).format("YYYY-MM-DD");
      f.EndDate = moment(f.EndDate).format("YYYY-MM-DD");
      let npStartYear =  moment(this.npCalendarService.ConvertEngToNepDateString(f.StartDate)).format('YYYY')
      let npEndYear =  moment(this.npCalendarService.ConvertEngToNepDateString(f.EndDate)).format('YYYY')
      f.FiscalYearName = npStartYear +'/'+npEndYear
    });
    this.FilteredFiscalYearList = this.FiscalYearList.filter(f => f.IsClosed != true);
    var selFYear = this.FilteredFiscalYearList.filter(f => f.FiscalYearId == this.securityService.AccHospitalInfo.CurrFiscalYear.FiscalYearId);
    if (selFYear.length > 0) {
      this.selectedFiscalYear = selFYear[0];
      this.fiscalYearId = this.selectedFiscalYear.FiscalYearId;
      this.monthselection();
    }
  }
  public OnFiscalYearValueChange() {
    this.fiscalYearId = this.selectedFiscalYear.FiscalYearId;
    this.monthselection();
  }
  onMonthValueChange() {
    let month = this.showMonthsList.filter(m => m.monthDisplayNumber == this.monthDisplayNumber);
    if (month.length > 0) {
      this.monthNumber = month[0].monthNumber;
      let date = this.monthDate(month[0]);
      this.ipDateChanged.emit(date);
    }
  }
  monthselection() {
    var fs = this.securityService.AccHospitalInfo.FiscalYearList.filter(f => f.FiscalYearId == this.securityService.AccHospitalInfo.CurrFiscalYear.FiscalYearId);
    this.fiscalYearId = (this.fiscalYearId == 0) ? fs[0].FiscalYearId : this.fiscalYearId;
    this.selectedFiscalYear = this.securityService.AccHospitalInfo.FiscalYearList.filter(fs => fs.FiscalYearId == this.fiscalYearId)[0];

    this.showMonthsList = [];
    let months = this.dateRange(this.selectedFiscalYear.StartDate, this.selectedFiscalYear.EndDate);
    let npStartYear = moment(this.npCalendarService.ConvertEngToNepDateString(this.selectedFiscalYear.StartDate)).format('YYYY');
    let npEndYear = moment(this.npCalendarService.ConvertEngToNepDateString(this.selectedFiscalYear.EndDate)).format('YYYY');

    let YrEndDate = months.filter(f => moment(f.Date).format('MM') == "12")[0].Date;

    for (let i = 0; i < months.length; i++) {
      if (moment(months[i].Date).isBetween(this.selectedFiscalYear.StartDate, YrEndDate, undefined, '[]')) {

        let monthNo = + moment(months[i].Date).format('MM');       
        let month = this.nepMonths.filter(n=> n.EngmonthSeq == monthNo)[0].monthName + '-' + npStartYear; 
        let disabled = this.disbaledValue(months[i].Date);
        this.showMonthsList.push({ monthNumber: monthNo, monthDisplayNumber: i + 1, monthName: month,year: moment(this.selectedFiscalYear.StartDate).format('YYYY'), disabled: disabled });
      }
      else {
        let monthNo = + moment(months[i].Date).format('MM');       
        let month = this.nepMonths.filter(n=> n.EngmonthSeq == monthNo)[0].monthName + '-' + npEndYear; 
        let disabled = this.disbaledValue(months[i].Date);
        this.showMonthsList.push({ monthNumber: monthNo, monthDisplayNumber: i + 1, monthName: month,year: moment(this.selectedFiscalYear.EndDate).format('YYYY'), disabled: disabled });
      }
    }
    this.monthNumber = + moment().format('MM');
    this.monthDisplayNumber = this.showMonthsList.filter(m => m.monthNumber == this.monthNumber)[0].monthDisplayNumber;

  }
  monthDate(monthData) {
    let year, monthNumber, fromDate, toDate
    let currentMonth = + moment(this.securityService.AccHospitalInfo.TodaysDate).format('MM');
    this.monthNumber = (this.monthNumber == null) ? currentMonth : this.monthNumber;
    year = moment(monthData.year).format('YYYY');
    monthNumber = this.monthNumber;

    if (monthNumber == parseInt(moment(this.selectedFiscalYear.EndDate).format('MM'))) {
      if (moment(this.selectedFiscalYear.StartDate).format('YYYY') == year) {
        fromDate = moment(new Date(year, this.monthNumber - 1, parseInt(moment(this.selectedFiscalYear.StartDate).format('DD')))).format('YYYY-MM-DD');
        toDate = moment(new Date(year, this.monthNumber, 0)).format('YYYY-MM-DD');
      }
      else {
        fromDate = moment(new Date(year, this.monthNumber - 1, 1)).format('YYYY-MM-DD');
        toDate = moment(new Date(year, this.monthNumber - 1, parseInt(moment(this.selectedFiscalYear.EndDate).format('DD')))).format('YYYY-MM-DD');
      }

    }
    else {
      fromDate = moment(new Date(year, this.monthNumber - 1, 1)).format('YYYY-MM-DD');
      if (this.monthNumber == currentMonth) {
        toDate = moment(this.securityService.AccHospitalInfo.TodaysDate).format('YYYY-MM-DD');
      }
      else {
        toDate = moment(new Date(year, this.monthNumber, 0)).format('YYYY-MM-DD');
      }
    }
    let data = { fiscalYearId: this.fiscalYearId, fromDate: fromDate, toDate: toDate };
    return data;
  }

  dateRange(startDate, endDate) {
    var start = startDate.split('-');
    var end = endDate.split('-');
    var startYear = parseInt(start[0]);
    var endYear = parseInt(end[0]);
    var dates = [];
    for (var i = startYear; i <= endYear; i++) {
      var endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
      var startMon = i === startYear ? parseInt(start[1]) - 1 : 0;
      for (var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
        var month = j + 1;
        var displayMonth = + month < 10 ? '0' + month : month;
        var date = i != endYear ? parseInt(start[2]) : parseInt(end[2]);
        dates.push({ Date: [i, displayMonth, date].join('-') });
      }
    }
    return dates;
  }
  disbaledValue(month)
  {
    let todaydate = moment(this.securityService.AccHospitalInfo.TodaysDate).format('YYYY-MM-DD');
    let year =+ moment(todaydate).format('YYYY');
    let mn = + moment(todaydate).format('MM')
    let m = moment(new Date(year, mn, 0)).format('YYYY-MM-DD');
    let currentmonth = moment(m).format('YYYY-MM-DD');
    //
    if (moment(month).isAfter(currentmonth)) {    
      return true;
    } 
    else{
      return false;
    }
  }
 // END:Vikas: 06th Aug 20: Added for month calendar chnages.

 FocusOut(){
  if(this.inputFocus){
    this.inputFocus = false;
    this.outputFocus.emit(this.outputToDatePicker=true); 
  }
  else{
    return;
  }
 }

   //common function to set focus on  given Element. 
   setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    var timer = window.setTimeout(function () {
      let htmlObject = document.getElementById(targetId);
      if (htmlObject) {
        htmlObject.focus();
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
  }
}
