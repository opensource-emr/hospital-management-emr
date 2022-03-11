import { Component, Input, Output, EventEmitter, ChangeDetectorRef, forwardRef, HostBinding, OnChanges } from '@angular/core';
import { NepaliCalendarService } from '../calendar/np/nepali-calendar.service';
import { NepaliDate, NepaliYear, NepaliMonth } from '../../shared/calendar/np/nepali-dates';
import { CoreService } from '../../core/shared/core.service';
import * as moment from 'moment/moment';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


@Component({
  selector: "danphe-date-picker",
  templateUrl: "./danphe-datepicker.html",
  styles: [`.engcal{
    max-width: 270px;
} .invalid-msg-cal{font-size: 10px;margin-left: 5px;} .dateonly-inv-msg{max-width: 140px;} .datetime-inv-msg{max-width: 265px;}
  .flex{display: flex;} .adbs-btn{height: 30px;padding: 0px 8px;border: none;background: #0773bc; color: #fff;
    font-weight: 700;} .lft-gap{margin-left: 5px;}`],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }]
})
export class DatePickerComponent implements ControlValueAccessor,OnChanges {
  public dateModel: string = null;
  public isInitialLoad: boolean = true;

  // Required for ControlValueAccessor interface
  writeValue(value: string) {
    if(!this.showmonthCalendar){
    if (value && value.trim().length > 0) {
      this.enDate = value;
      this.isInitialLoad = false;
    } else {
      if (this.isInitialLoad) {
        let todayStr = this.todayDateString;
        let time = moment().format("HH:mm");
        this.enDate = this.showTime ? (todayStr + " " + time) : todayStr;
        this.CheckForInvalidDate(moment(this.enDate).format('YYYY-MM-DD'), moment(this.enDate).format('HH:mm'));
        this.isInitialLoad = false;
      }
    }
  }
  }

  // Required forControlValueAccessor interface
  public registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  // Required forControlValueAccessor interface
  public registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }
  public onChange: any = Function.prototype; // Trascend the onChange event
  public onTouched: any = Function.prototype; // Trascend the onTouch event

  public showNpCalendar: boolean = false;
  public showEnCalendar: boolean = false;

  //this enDate is send to en-calendar and np-calendar
  public enDate: string = "";

  showChangeBtn: boolean = false;
  defaultCalenderTypes: string = '';
  public isInvalid: boolean = false;

  @Input("showTime")
  public showTime: boolean = false;

  public calTypes: string = "";

  @Input("CalendarTypes")
  set setCalendarType(value: string) {
    if(value){
         this.calTypes = value; 
    }
    else{
       this.calTypes = "np";//sud-8Aug'20: Hard-Coded for temporary fix, correct it properly later.
    }  

    this.showCalendar(this.calTypes);
  }

  get setCalendarType(): string {
    return this.calTypes;
  }
  // START:Vikas: 06th Aug 20: Added for month calendar chnages. 
  public showmonthCalendar: boolean = false;
  @Input("showmonthCalendar") 
  set setmonthCalendar(value: boolean) {
    this.showmonthCalendar = value;      
  }

  @Input("input-focus") //coming from parent form
  public inputFocus:boolean=null;

  public inputFocusToEnCalendar:boolean= null;
  public inputFocusToNpCalendar:boolean= null;

  public outputToParent:boolean = null;

  @Output('output-focus') outputFocus:EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input("showFiscalYear")
  public showFiscalYear:boolean =false;

  @Output() monthChanged: EventEmitter<object> = new EventEmitter<object>();
  // END:Vikas: 06th Aug 20: Added for month calendar chnages. 
  
  //sud:29May'20-values can be: 'SoftwareStart' ,  'DateOfBirth', check in nepali-calendar component for all othe available options.
  @Input("year-settings")
  public nepYearSettings: string = "SoftwareStart";


  public minimumDate: string;
  @Input("min-date")
  set setMinDate(value: string) {
    this.minimumDate = value;
    this.setMinimumDate();
    if (!this.isInitialLoad) {
      if (!this.allowFutureDate && moment(this.minimumDate).isAfter(this.todayDateString)) {
        this.minimumDate = this.npCalendarService.minEngYear + "-01-01";
      }
    }
    if (this.enDate && this.enDate.trim().length > 0) {
      this.CheckForInvalidDate(moment(this.enDate).format('YYYY-MM-DD'), moment(this.enDate).format('HH:mm'));
    }    
  }
  get setMinDate(): string {
    return this.minimumDate;
  }


  public maximumDate: string;
  @Input("max-date")
  set setMaxDate(value: string) {
    this.maximumDate = value;
    this.setMaximumDate();
    if (!this.isInitialLoad) {
      if (!this.allowFutureDate && moment(this.maximumDate).isAfter(this.todayDateString)) {
        this.maximumDate = this.todayDateString;
      }
    }
    if (this.enDate && this.enDate.trim().length > 0) {
      this.CheckForInvalidDate(moment(this.enDate).format('YYYY-MM-DD'), moment(this.enDate).format('HH:mm'));
    }    
  }
  get setMaxDate(): string {
    return this.maximumDate;
  }


  @Input("invalid-date-error-msg")
  public valErrMessage: string = "Invalid Date. Please enter again";

  @Input("allow-future-date")
  public allowFutureDate: boolean = false;

  @Input("isFromToDateSelect")
  isFromToDateSelect: boolean = false;

  @Output()
  ngModelChange = new EventEmitter<any>();

  public nepYears: Array<NepaliYear> = [];
  public todayDateString: string = "";
  public showAdBsButton:boolean =true;

  constructor(public npCalendarService: NepaliCalendarService, private coreService: CoreService, public changeDetector: ChangeDetectorRef) {
    this.nepYears = NepaliYear.GetAllNepaliYears();
    this.showAdBsButton=this.coreService.showCalendarADBSButton;
  }

  ngOnChanges(){
      if(this.inputFocus){
          if(this.showEnCalendar){
          this.inputFocusToEnCalendar = false;
          this.changeDetector.detectChanges();
          this.inputFocusToEnCalendar = true;
          this.changeDetector.detectChanges();
      }
      else if(this.showNpCalendar){
          this.inputFocusToNpCalendar = false;
          this.changeDetector.detectChanges();
          this.inputFocusToNpCalendar = true;
          this.changeDetector.detectChanges();
      }
    }
  }

  ngOnInit() {
    //if the maximum date is not provided in the input parameter then set it to max possible value 
    //for our application according to the np calendar service
    if (!this.maximumDate || (this.maximumDate && this.maximumDate.trim().length == 0)) {
      this.setMaximumDate();
    }

    //if the minimum date is not provided in the input parameter then set it to min possible value
    //for our application according to the np calendar service
    if (!this.minimumDate || (this.minimumDate && this.minimumDate.trim().length == 0)) {
      this.setMinimumDate();
    }      

    if (!this.isFromToDateSelect) {
      this.calTypes = "en,np";
      //get the global preference for calendar type
      let calPref = this.coreService.DatePreference;
      this.showCalendar(calPref);
    } else {
      this.showCalendar(this.calTypes);
    }

    if (!this.allowFutureDate && moment(this.maximumDate).isAfter(this.todayDateString)) {
      this.maximumDate = this.todayDateString;
    }

    //incase if we do not allow the future date && our min date itself is future date then in that case this min date is changed to
    //beginning date: 1991-01-01
    if (!this.allowFutureDate && moment(this.minimumDate).isAfter(this.todayDateString)) {
      this.minimumDate = this.npCalendarService.minEngYear + "-01-01";
    }
  }

  setMaximumDate() {
    //set todays date string here
    this.todayDateString = moment().format("YYYY-MM-DD");
    //check if the max date is within our calendar year range
    //if not then set it between then only
    let minEngYear = this.npCalendarService.minEngYear;
    let maxEngYear = this.npCalendarService.maxEngYear;
    //if max date is not set
    if (!this.maximumDate || (this.maximumDate && this.maximumDate.trim().length == 0)) {
      this.maximumDate = maxEngYear + "-12-30";
    }
    //if the max date is set
    else {
      let max = moment(this.maximumDate).format("YYYY");
      this.maximumDate = ((+max < minEngYear) || (+max > maxEngYear)) ? (maxEngYear + "-12-30") : this.maximumDate;
    }
  }

  setMinimumDate() {
    this.todayDateString = moment().format("YYYY-MM-DD");
    //check if the min date is within our calendar year range
    //if not then set it between then only
    let minEngYear = this.npCalendarService.minEngYear;
    let maxEngYear = this.npCalendarService.maxEngYear;
    if (!this.minimumDate || (this.minimumDate && this.minimumDate.trim().length == 0)) {
      this.minimumDate = minEngYear + "-01-01";
    } else {
      let min = moment(this.minimumDate).format("YYYY");
      this.minimumDate = ((+min < minEngYear) || (+min > maxEngYear)) ? (minEngYear + "-01-01") : this.minimumDate;
    }
  }

  //checks the requirement and shows calender accordingly
  showCalendar(calTypesCSV: string) {
    let calTypesArr: string[] = calTypesCSV.split(',');
    //Show AD-BS Change button only if there are more than one calendars.
    if (calTypesArr.length > 1) {
      this.showChangeBtn = true;
    }
    //whichever is at the first of array should be shown at first.
    if (calTypesArr[0] == 'en') {
      this.showEnCalendar = true;
      this.showNpCalendar = false;
    }
    else if (calTypesArr[0] == 'np') {
      this.showEnCalendar = false;
      this.showNpCalendar = true;
    }
  }

  //converting date from Nepali date to English date
  NepCalendarOnChange($event) {
    if(this.showmonthCalendar){
      this.monthChanged.emit($event);
    }
    else
    {   
      let emittedNpDate = $event.npModel;
      if ((typeof (emittedNpDate)) == 'object' && this.nepYears.find(y => y.yearNumber == emittedNpDate.Year)) {
        let emittedDateInEng = this.npCalendarService.ConvertNepToEngDate(emittedNpDate);
        let enDateOnlyStr = moment(emittedDateInEng).format("YYYY-MM-DD");
        let time = moment(emittedDateInEng).format("HH:mm");
        this.enDate = this.showTime ? (enDateOnlyStr + " " + time) : enDateOnlyStr;

        this.CheckForInvalidDate(enDateOnlyStr, time);
      }
    }
  }


  //catches the model change of encalendar and converting date from English date to Nepali date for np-calendar
  //and emits the validation info and the model
  EngCalendarOnChange($event) {
    if(this.showmonthCalendar){
      this.monthChanged.emit($event);
    }
    else
    {   
      let engDate = $event.enDate;
      let time = $event.enTime;
      this.enDate = this.showTime ? (engDate + " " + time) : engDate;  
      this.CheckForInvalidDate(engDate, time);
    }

  }

  CheckForInvalidDate(engDate: string, time: string) {
    let isBetweenMinMax = moment(engDate).isBetween(this.minimumDate, this.maximumDate, undefined, '[]');
    if (engDate && this.IsValidEngDate(engDate)) {
      if (!this.allowFutureDate && moment(engDate).isAfter(this.todayDateString)) {
        this.isInvalid = true; this.valErrMessage = "Future date is not allowed.";
        this.ngModelChange.emit(null);
        return;
      }
      if (!isBetweenMinMax) {
        this.isInvalid = true;
        let todayStr = moment().format("YYYY-MM-DD");
        this.valErrMessage = "Date is not between Range. Please enter again";
        this.ngModelChange.emit(null);
        return;
      }
      this.isInvalid = false;
      if (this.showTime) {
        this.ngModelChange.emit(engDate + "T" + time);
      } else {
        this.ngModelChange.emit(engDate);
      }
    } else {
      this.isInvalid = true;
      this.ngModelChange.emit(null);
    }
  }


  //matches regular exprsn for : YYYY-MM-DD eg: 2060-10-18, etc.
  public IsValidEngDate(ipEngDate: string) {
    let date = moment(ipEngDate).format("YYYY-MM-DD");
    if (date) {
      //return moment(ipEngDate).isValid();
      var regEx = /^\d{4}-\d{1,2}-\d{1,2}$/;
      return date.match(regEx) != null;
    }
    return false;
  }

  changetoEnglish() {
    this.showNpCalendar = false;
    this.changeDetector.detectChanges();
    this.showEnCalendar = true;
  }

  changetoNepali() {
    this.showEnCalendar = false;
    this.changeDetector.detectChanges();
    this.showNpCalendar = true;
  }

  loadCommonConfig() {
    if (this.defaultCalenderTypes.length == 0) {
      const Parameter = this.coreService.Parameters;
      const Params = Parameter.filter(parms => parms.ParameterGroupName === 'Common' && parms.ParameterName === 'CalendarTypes');
      const calendarTypeObject = JSON.parse(Params[0].ParameterValue);
      this.defaultCalenderTypes = calendarTypeObject.Common ? calendarTypeObject.Common : 'en';
    }
    return this.defaultCalenderTypes;
  }

  FocusOutFromCalender(event:any){
    if(event){
      this.inputFocusToEnCalendar = false;
      this.inputFocusToNpCalendar = false;
      this.outputFocus.emit(this.outputToParent=true);
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
