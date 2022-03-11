import { Component, Input, Output, EventEmitter, ChangeDetectorRef, forwardRef, HostBinding, AfterViewInit } from '@angular/core';
import * as moment from 'moment/moment';
import { NepaliCalendarService } from '../../calendar/np/nepali-calendar.service';
import { NepaliDate } from '../../../shared/calendar/np/nepali-dates';
import { CoreService } from '../../../core/shared/core.service';
import { FromToDateSettings } from './from-to-settings';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: "from-to-date-select",
  templateUrl: "./from-to-date-select.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FromToDateSelectComponent),
      multi: true
    }]
})
export class FromToDateSelectComponent implements AfterViewInit {
  showTimeOptionBtn: boolean;
  showTimeBtn: any;
  // Required for ControlValueAccessor interface
  writeValue(value: any) {
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


  public calendarType: string;//default is np- change it after global settings later on.

  public showNpCalendar: boolean = true;//default is np calendar..
  public showEnCalendar: boolean = false;

  public npDate_from: NepaliDate;
  public npDate_to: NepaliDate;

  //below two are for display purpose only.
  public npDateString_from: string = "";
  public npDateString_to: string = "";

  public enDate_from: string;
  public enDate_to: string;


  @Output("on-change")
  onDateChange: EventEmitter<object> = new EventEmitter<object>();

  @Input('from-date')
  fromDate: string = null;

  @Input('to-date')
  toDate: string = null;

  @Input("def-range-name")
  defaultRangeName: string = null;//null by default.
  public rangeShortName: string = "-";//this is for icon . Default = dash (-)
  public rangeFullName: string = "Not-Set";//this is for tooltip .Default = Not Set

  //sud:6June: below comma separated array provides list of valid date ranges
  @Input("date-range-options")
  dateRangeOptionString: string = "1W,1M,3M";//available options are: 1D,1W,1M,3M,6M. 1D means Today.
  @Input("showToogleTimeBtn") showToogleTimeBtn: boolean = false;
  showTimeField: boolean = false;
  public dateRangeOptions = {
    today: true,
    week1: true,
    month1: true,
    month3: true,
    month6: true,
  };

  //If auto-reload=false then user has to Click on OK button to emit the selected date.
  //this is true by default.
  //If False then From-To will not emit the changed date until clicked on OK button.
  //Exception: If range is selected then it'll AutoReload everytime.
  @Input("emit-always")
  alwaysEmit_OkBtnNotRequired: boolean = true;
  @Input("enable-favourite")
  public enableFavourite: boolean = true;

  public isFavourite: boolean = false;

  //this use a Dictionary for Common From-To-Date Settings used across the module
  @Input("date-settings-name")
  dateSettingsName: string = "Default";


  dateSettingsObj: FromToDateSettings = new FromToDateSettings();
  public isDateRangeChangeCalled: boolean = false;
  public showDatePicker: boolean = false;
  public isValidToLoad: boolean = true;
  public showAdBsButton: boolean = true;

  constructor(public npCalendarService: NepaliCalendarService, private coreService: CoreService, public changeDetector: ChangeDetectorRef) {
    this.showAdBsButton = this.coreService.showCalendarADBSButton;
  }

  ngOnInit() {
    this.assignADorBS();
    this.ConfigureDateSettings();
    this.DateRange_InitialAssign();
  }
 
  ngAfterViewInit(){
    let showToogleTimeBtnString = this.coreService.Parameters.find(a => a.ParameterName == 'ShowTimeOptionInFromToDatePicker' && a.ParameterGroupName == 'Common');
    if (showToogleTimeBtnString != null) {
      let showTimeOptionParameter = JSON.parse(showToogleTimeBtnString.ParameterValue);
      this.showTimeOptionBtn = (showTimeOptionParameter.ShowTimeOptionInFromToDatePicker == true);
    }
    if ((this.showTimeOptionBtn && this.showToogleTimeBtn) == true){
      this.showTimeBtn = true;
    }
    else{
      this.showTimeBtn = false;
    }
  }
  assignADorBS() {
    let savedDateRange = localStorage.getItem("FromTo_DateRange");
    if (savedDateRange) {
      let dateRangeParsed = JSON.parse(savedDateRange);
      if (dateRangeParsed && dateRangeParsed.useFavourite == true) {
        this.calendarType = dateRangeParsed.calendarType;
        this.showEnCalendar = this.calendarType == "en" ? true : false;//assign calendarType from here. 
        this.showNpCalendar = !this.showEnCalendar;
        return;
      }
    } else {
      if (!this.calendarType || !(this.calendarType.trim().length > 0)) {
        this.calendarType = this.coreService.DatePreference;
        this.showNpCalendar = this.calendarType == "np";
        this.showEnCalendar = !this.showNpCalendar;
        return;
      }
    }

    this.calendarType = "np";//default is nepali calendar.. 
    this.showNpCalendar = true;
    this.showEnCalendar = !this.showNpCalendar;
  }

  public ConfigureDateSettings() {
    //load date settings name first, then go further..
    this.dateSettingsObj = FromToDateSettings.GetDateSettingsByName(this.dateSettingsName);
    this.dateRangeOptionString = this.dateSettingsObj.validDateRangesCSV;
    this.defaultRangeName = this.dateSettingsObj.defaultRangeName;

    if (this.dateRangeOptionString) {
      // // 1D means Today..
      //comparing with tolowercase to avoid case-sensitive issue by developers.
      this.dateRangeOptions.today = this.dateRangeOptionString.toLowerCase().indexOf("1d") > -1;
      this.dateRangeOptions.week1 = this.dateRangeOptionString.toLowerCase().indexOf("1w") > -1;
      this.dateRangeOptions.month1 = this.dateRangeOptionString.toLowerCase().indexOf("1m") > -1;
      this.dateRangeOptions.month3 = this.dateRangeOptionString.toLowerCase().indexOf("3m") > -1;
      this.dateRangeOptions.month6 = this.dateRangeOptionString.toLowerCase().indexOf("6m") > -1;
    }
  }


  DateRange_InitialAssign() {
    //check for the user preference in calendartype.
    //these are global values from User-Preference and will be overwritten by local preference has saved his favourite in this component. 


    //FirstPrio: From/ToDate.
    //SecondPrio: SavedDateRange
    //ThirdPrio: DefaultDateRange
    //4th: today

    this.showDatePicker = true;

    if (this.fromDate && this.toDate) {
      this.changeDetector.detectChanges();
      this.enDate_from = this.fromDate;
      this.enDate_to = this.toDate;
    }
    else {
      var savedDateRange = localStorage.getItem("FromTo_DateRange");
      if (savedDateRange) {
        var dateRangeParsed = JSON.parse(savedDateRange);
        this.isFavourite = dateRangeParsed.useFavourite;
        if (this.isFavourite == true) {

          this.defaultRangeName = dateRangeParsed.rangeName;

          if (this.defaultRangeName) {
            this.ChangeCustomDateRange(this.defaultRangeName);
            this.showDatePicker = true;
            return;
          }
          else {
            this.changeDetector.detectChanges();
            this.enDate_from = dateRangeParsed.fromDate;
            this.enDate_to = dateRangeParsed.toDate;
          }
        }
      }
      else if (this.defaultRangeName) {
        this.ChangeCustomDateRange(this.defaultRangeName);
        this.showDatePicker = true;
        return;//customdaterange automatically assigns and emits the required values.. so we can return from here.. 
      }
      else {
        this.enDate_from = moment().format("YYYY-MM-DD");
        this.enDate_to = moment().format("YYYY-MM-DD");
      }
    }

    //nepali dates should also be set after date change in english..
    this.npDate_from = this.npCalendarService.ConvertEngToNepDate(this.enDate_from);
    this.npDateString_from = this.npCalendarService.ConvertEngToNepDateString(this.enDate_from);
    this.npDate_to = this.npCalendarService.ConvertEngToNepDate(this.enDate_to);
    this.npDateString_to = this.npCalendarService.ConvertEngToNepDateString(this.enDate_to);

    this.SetRangeDescriptions();
    this.EmitDatesAfterChange();

  }

  //converting date from English date to Nepali date
  EngCalendarOnDateChange_From() {
    if (!this.isDateRangeChangeCalled) {
      this.ClearDateRange();

      if (this.alwaysEmit_OkBtnNotRequired) {
        this.IsValidCheck();
        if (this.validationObject.isValid) {
          this.SaveDateRangeToLocalStorage();
          this.onDateChange.emit({ fromDate: this.enDate_from, toDate: this.enDate_to });
        } else {
          this.onDateChange.emit({ fromDate: null, toDate: null });
        }
      } else {
        this.IsValidCheck();
      }

    }
  }

  //converting date from English date to Nepali date
  EngCalendarOnDateChange_To() {
    if (!this.isDateRangeChangeCalled) {
      this.ClearDateRange();
      if (this.alwaysEmit_OkBtnNotRequired) {
        this.IsValidCheck();//check for validation before emitting the data.    
        if (this.validationObject.isValid) {
          this.SaveDateRangeToLocalStorage();
          this.onDateChange.emit({ fromDate: this.enDate_from, toDate: this.enDate_to });
        } else {
          this.onDateChange.emit({ fromDate: null, toDate: null });
        }
      } else {
        this.IsValidCheck();
      }
    }
  }

  //matches regular exprsn for : YYYY-MM-DD eg: 2060-10-18, etc.
  public IsValidEngDate(ipEngDate: string) {
    if (ipEngDate) {
      //return moment(ipEngDate).isValid();
      var regEx = /^\d{4}-\d{1,2}-\d{1,2}$/;
      return ipEngDate.match(regEx) != null;
    }
    return false;
  }

  changetoEnglish() {
    this.showNpCalendar = false;
    this.showEnCalendar = true;
    this.calendarType = "en";
    this.SaveDateRangeToLocalStorage();
  }

  changetoNepali() {
    this.showEnCalendar = false;
    this.showNpCalendar = true;
    this.calendarType = "np";
    this.SaveDateRangeToLocalStorage();
  }


  //This sets the Name to be Displayed in the Dropdown & tooltip of the Range.
  SetRangeDescriptions() {

    if (this.defaultRangeName == "today") {
      this.rangeShortName = "1D";
      this.rangeFullName = "TODAY";
      //no need to change for today since new Date() gives today's value
    }
    else if (this.defaultRangeName == "last1week") {
      this.rangeShortName = "1W";
      this.rangeFullName = "Last 1 Week";
    }
    else if (this.defaultRangeName == "last1month") {
      this.rangeShortName = "1M";
      this.rangeFullName = "Last 1 Month";
    }
    else if (this.defaultRangeName == "last3month") {
      this.rangeShortName = "3M";
      this.rangeFullName = "Last 3 Months";
    }
    else if (this.defaultRangeName == "last6month") {
      this.rangeShortName = "6M";
      this.rangeFullName = "Last 6 Months";
    }
    else {
      this.rangeShortName = "-";
      this.rangeFullName = "Not-Set";
    }
  }

  AddToFavourite() {
    if (this.validationObject.isValid) {
      this.isFavourite = true;
      this.SaveDateRangeToLocalStorage();
    }
    else {
      window.alert("Dates are INVALID, please check error message.")
    }
  }

  RemoveFavourite() {
    this.isFavourite = false;
    localStorage.removeItem("FromTo_DateRange");
  }

  SaveDateRangeToLocalStorage() {
    if (this.isFavourite) {
      let calType = this.showEnCalendar ? "en" : "np";
      localStorage.setItem("FromTo_DateRange", JSON.stringify({ useFavourite: true, calendarType: calType, rangeName: this.defaultRangeName, fromDate: this.enDate_from, toDate: this.enDate_to }));
    }
  }

  //eventtype could be 'date' or 'range'  (default=date)
  //Parent component can decide whether or not to reload the data based on these types.
  EmitDatesAfterChange(changeEventType: string = "date") {
    this.IsValidCheck();//check for validation before emitting the data.    
    if (this.validationObject.isValid) {
      this.SaveDateRangeToLocalStorage();
      this.onDateChange.emit({ fromDate: this.enDate_from, toDate: this.enDate_to, eventType: changeEventType });
    }
  }

  ClearDateRange() {
    this.defaultRangeName = null;
    this.rangeShortName = "-";//this is for icon
    this.rangeFullName = "Not-Set";//this is for tooltip    
  }




  ChangeCustomDateRange(rangeName: string) {
    this.isDateRangeChangeCalled = true;
    this.defaultRangeName = rangeName;

    var newDate_from = new Date();
    var newDate_to = new Date();

    this.changeDetector.detectChanges();
    if (this.defaultRangeName == "today") {
      //no need to change for today since new Date() gives today's value
    }
    else if (this.defaultRangeName == "last1week") {
      newDate_from.setDate(newDate_from.getDate() - 7);
    }
    else if (this.defaultRangeName == "last1month") {
      newDate_from.setMonth(newDate_from.getMonth() - 1);
    }
    else if (this.defaultRangeName == "last3month") {
      newDate_from.setMonth(newDate_from.getMonth() - 3);
    }
    else if (this.defaultRangeName == "last6month") {
      newDate_from.setMonth(newDate_from.getMonth() - 6);
    }

    this.changeDetector.detectChanges();
    this.enDate_from = moment(newDate_from).format('YYYY-MM-DD');
    this.enDate_to = moment(newDate_to).format('YYYY-MM-DD');

    //we need to change Nepali calendar as well.

    this.npDate_from = this.npCalendarService.ConvertEngToNepDate(this.enDate_from);
    this.npDateString_from = this.npCalendarService.ConvertEngToNepDateString(this.enDate_from);
    this.npDate_to = this.npCalendarService.ConvertEngToNepDate(this.enDate_to);
    this.npDateString_to = this.npCalendarService.ConvertEngToNepDateString(this.enDate_to);

    this.SetRangeDescriptions();

    this.changeDetector.detectChanges();
    //here eventytype= 'range'
    this.EmitDatesAfterChange("range");
    this.isDateRangeChangeCalled = false;
  }


  public validationObject = { isValid: true, errorMessages: [] };

  IsValidCheck() {
    //we need to set this everytime.
    this.validationObject = { isValid: true, errorMessages: [] };

    if (!this.enDate_from || !this.enDate_to) {
      this.validationObject.isValid = false;
      this.validationObject.errorMessages.push("Please enter the date"); return;
    }

    let currDate = moment();
    let selFromDate = moment(this.enDate_from);
    let selToDate = moment(this.enDate_to);


    //validation-1: FromDate can't be greater than ToDate
    if (selFromDate > selToDate) {
      this.validationObject.isValid = false;
      this.validationObject.errorMessages.push("FromDate cannot be more than ToDate");
    }

    //validation-2: check for FutureDate when allowfuturedate is false.
    let allowFutureDate: boolean = this.dateSettingsObj.allowFutureDate;
    if (!allowFutureDate) {
      if (selFromDate > currDate || selToDate > currDate) {
        this.validationObject.isValid = false;
        this.validationObject.errorMessages.push("future date not allowed");
      }
    }

    //validation-3: max allowed days in the range.
    let maxDays = this.dateSettingsObj.maxDaysInRange;
    //if date is selected using DefaultDateRange then we shouldn't compare that otherwise it might be more than maxDays.
    //eg: if 3months is available in range selection, then we shouldn't keep 20days or 30 days in maxDaysInRange..
    if (maxDays && !this.defaultRangeName) {
      let diff = selToDate.diff(selFromDate, 'days');
      if (diff > maxDays) {
        this.validationObject.isValid = false;
        this.validationObject.errorMessages.push("Only " + maxDays + " days are allowed to view. Pls Change the Selection. Current selection = " + diff + " days.");
      }
    }

  }

  ReloadDataBtnClick() {
    this.EmitDatesAfterChange("date");
  }


  toogleTimeField() {
    if (this.showToogleTimeBtn == true)
      this.showTimeField = !this.showTimeField;
  }
}




