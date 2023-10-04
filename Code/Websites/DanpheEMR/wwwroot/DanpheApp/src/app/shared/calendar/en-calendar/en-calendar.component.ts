import { Component, OnChanges } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core";
import { NepaliCalendarService } from '../np/nepali-calendar.service';
import * as moment from 'moment/moment';
import { SecurityService } from '../../../security/shared/security.service';
import { FiscalYearModel } from '../../../accounting/settings/shared/fiscalyear.model';
@Component({
  selector: "en-calendar",
  templateUrl: "./en-calendar.html",
  styles: [`.en-cal-flx{
    display: flex;
}
input[type="date"] {
  font-size: 12px;
  font-weight: 600;
  color: #777;
  letter-spacing: 1px;
  border: 1px solid #ccc;
  width: 140px;
  font-family: 'Quicksand', 'Open Sans', sans-serif;
  padding: 0 5px;
}
.iptime {
  width: 90px;
  padding: 0px 0px 0px 3px;
  font-size: 12px;
  border: 1px solid #ced0d4;
  border-radius: 0 !important;
  margin-left: 3px;
}
input {
  height: 30px;
  font-size: 12px;
  border: 1px solid #ced0d4;
  border-radius: 0 !important;
}
.ipdateonly
{
    width: 150px;
    font-size: 12px;
}
`]
})

export class EnglishCalendarComponent implements OnChanges {

  public minimumDate: string;
  @Input("minimum-date")
  set setMinDate(value: string) {
    this.minimumDate = value;
  }
  get setMinDate(): string {
    return this.minimumDate;
  }

  @Input("input-focus") //coming from parent form
  public inputFocus:boolean=null;
  public outputToDatePicker:boolean = null;

  @Output('output-focus') outputFocus:EventEmitter<boolean> = new EventEmitter<boolean>();

  public maximumDate: string;
  @Input("maximum-date")
  set setMaxDate(value: string) {
    this.maximumDate = value;
  }
  get setMaxDate(): string {
    return this.maximumDate;
  }

  @Input("showTime")
  public showTime: boolean = false;

  //set the input parameter sel-date to inputEngDate
  public inputEngDate: string;

  get InputNepDate(): string {
    return this.inputEngDate;
  }

  @Input("sel-date")
  set InputNepDate(value: string) {
    this.inputEngDate = value;
    this.enDateOnly = moment(this.inputEngDate).format("YYYY-MM-DD");
    if (this.showTime) {
      this.enTimeOnly = moment(this.inputEngDate).format("HH:mm");
    }
  }

  @Output() ipDateChanged: EventEmitter<object> = new EventEmitter<object>();

  public enDateOnly: string = "";
  public enTimeOnly: string = "";

  // START:Vikas: 06th Aug 20: Added for month calendar chnages.
  public monthNumber: any;
  public engMonths: Array<any> = new Array<any>();
  public monthDisplayNumber: any;
  public fiscalYearId:number=0;
  public selectedFiscalYear: any;
  public showMonthsList: Array<any> = new Array<any>();
  public FilteredFiscalYearList: Array<FiscalYearModel> = [];
  public FiscalYearList:Array<FiscalYearModel> = [];
  
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
 
  constructor(public npCalendarService: NepaliCalendarService, private securityService: SecurityService) 
  {   
  }

  ngOnChanges(){
     if(this.inputFocus){
       if(this.showmonthCalendar){
        this.setFocusById('FiscalYearName');
       }
       else if(!this.showmonthCalendar){
        this.setFocusById('date');
       }   
     }
  }

  ngOnInit() {   
  }

  public EngCalendarOnDateChange() {
    if (this.enDateOnly && this.enDateOnly.trim().length > 0) {
      this.ipDateChanged.emit({ enDate: this.enDateOnly, enTime: this.enTimeOnly });
    }
  }
  // START:Vikas: 06th Aug 20: Added for month calendar chnages.
  getFiscalYear()
  {
      this.FiscalYearList = Array<FiscalYearModel>();
      this.FiscalYearList = this.securityService.AccHospitalInfo.FiscalYearList;
      this.FiscalYearList.map(f => {
        f.StartDate = moment(f.StartDate).format("YYYY-MM-DD");
        f.EndDate = moment(f.EndDate).format("YYYY-MM-DD");
        f.FiscalYearName = moment(f.StartDate).format("YYYY")+'/'+moment(f.EndDate).format("YYYY")
      });
    this.FilteredFiscalYearList = this.FiscalYearList.filter(f => f.IsClosed != true);   
    var selFYear = this.FilteredFiscalYearList.filter(f => f.FiscalYearId == this.securityService.AccHospitalInfo.CurrFiscalYear.FiscalYearId);
    if (selFYear.length > 0) {
      this.selectedFiscalYear = selFYear[0];
      this.fiscalYearId = this.selectedFiscalYear.FiscalYearId;
      this.monthselection();
    }
  }
  public OnFiscalYearValueChange(){
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
    let YrEndDate = months.filter(f => moment(f.Date).format('MM') == "12")[0].Date;

    for (let i = 0; i < months.length; i++) {
      if (moment(months[i].Date).isBetween(this.selectedFiscalYear.StartDate, YrEndDate, undefined, '[]')) {
        let month = moment(months[i].Date).format('MMM') + '-' + moment(this.selectedFiscalYear.StartDate).format('YYYY');
        let monthNo = + moment(months[i].Date).format('MM');
        let disabled = this.disbaledValue(months[i].Date);
        this.showMonthsList.push({ monthNumber: monthNo, monthDisplayNumber: i + 1, monthName: month , disabled: disabled});
      }
      else {
        let month = moment(months[i].Date).format('MMM') + '-' + moment(this.selectedFiscalYear.EndDate).format('YYYY');
        let monthNo = + moment(months[i].Date).format('MM');
        let disabled = this.disbaledValue(months[i].Date);
        this.showMonthsList.push({ monthNumber: monthNo, monthDisplayNumber: i + 1, monthName: month , disabled: disabled});
      }
    }
    this.monthNumber = + moment().format('MM');
    this.monthDisplayNumber =  this.showMonthsList.filter(m=> m.monthNumber == this.monthNumber)[0].monthDisplayNumber;


  }
  monthDate(monthData) {
    let year, monthNumber, fromDate, toDate
    let currentMonth = + moment(this.securityService.AccHospitalInfo.TodaysDate).format('MM');
    this.monthNumber = (this.monthNumber == null) ? currentMonth : this.monthNumber;
    year = moment(monthData.monthName).format('YYYY');
    monthNumber = this.monthNumber;

    if (monthNumber == parseInt(moment(this.selectedFiscalYear.EndDate).format('MM'))) 
    {
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
