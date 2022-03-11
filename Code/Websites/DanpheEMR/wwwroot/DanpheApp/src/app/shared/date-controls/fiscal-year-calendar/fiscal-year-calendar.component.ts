import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, SimpleChanges} from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service';
import { AccHospitalInfoVM } from '../../../accounting/shared/acc-view-models';
import { FiscalYearModel } from '../../../accounting/settings/shared/fiscalyear.model';
import * as moment from 'moment/moment';
import { CoreService } from '../../../core/shared/core.service';
import { NepaliCalendarService } from '../../calendar/np/nepali-calendar.service';

@Component({
  selector: "fiscal-year-calendar",
  templateUrl: "./fiscal-year-calendar.html",
  styleUrls: ['./fiscal-year-calendar.css']
})
export class FiscalYearCalendarComponent implements OnInit {
  public HospitalInfoMaster: AccHospitalInfoVM;  
  public FiscalYearList: Array<FiscalYearModel> = [];
  public FilteredFiscalYearList: Array<FiscalYearModel> = [];
  public fiscalYearForMonthCalendar:Array<FiscalYearModel>=[];  
  public selectedFiscalYear: any = null;
  public revisedData: any;
  public selectedDate: string;
  public fromDate: string;
  public toDate: string;
  public minimumDate: string;
  public maximumDate: string;
  public showDatePicker: boolean = false;
  public allowFutureDate: boolean = false;
  public invalid: boolean = false;
  public calType: string = 'np';
  public currentNPMonth:string=null;
  public currentENMonth:string=null;
  public invalidMessage: string = "Enter date of selected fiscal year";

  public currentFiscalYear: FiscalYearModel;

  @Input('showSingleDatePicker')
  public showSingleDatePicker: boolean = true;

  @Input('showAllFiscalYear')
  public showAllFiscalYear: boolean = false;
  

  @Input("showFiscalYear")
  public showFiscalYear:boolean =false;

  @Input('showOkBtn')
  public showOkBtn: boolean = false;

  @Output() fiscalYearDate: EventEmitter<any> = new EventEmitter<any>();

  // START:Vikas: 06th Aug 20: Added for month calendar chnages. 
  public fiscalYearId: number = 0;
  public monthNumber: number = null;
  public year: number = null;
  public ShowMonthCalendar:boolean=false;
  @Input('ShowMonthCalendar')
  public set setMonthCalValue(value) {    
    if(this.fiscalYearForMonthCalendar.length >0){
      this.selectedMonth=null;
      this.changeDetector.detectChanges();      
      this.selectedFiscalYear=this.fiscalYearForMonthCalendar.find(f=>f.FiscalYearId==this.HospitalInfoMaster.CurrFiscalYear.FiscalYearId);
      if(this.selectedFiscalYear){
        this.selectedMonth=(this.calType=="np")?this.selectedFiscalYear.NepaliMonthList.find(x=>x.MonthName==this.currentNPMonth) :this.selectedFiscalYear.EnglishMonthList.find(e=>e.MonthName==this.currentENMonth);
        this.onMonthValueChange();  
      }      
    }
    this.showDatePicker=false;
    this.ShowMonthCalendar= value;
    this.showDatePicker=true;
    this.showSingleDatePicker=false;    
  } 
  
  public SingleFiscalYearId: number = 0;
  @Input('SingleFiscalYearId')
  public set setFiscalYear(_fiscalyearid) {
    if(_fiscalyearid){
      this.SingleFiscalYearId = _fiscalyearid;
      this.FiscalYearList = (this.SingleFiscalYearId >0) ?  this.HospitalInfoMaster.FiscalYearList.filter(f=>f.FiscalYearId == this.SingleFiscalYearId) : this.HospitalInfoMaster.FiscalYearList;      
    }
  }
  // END:Vikas: 06th Aug 20: Added for month calendar chnages. 
  public showAdBsButton:boolean =true;

  constructor(private securityService: SecurityService, private changeDetector: ChangeDetectorRef,
    private coreService: CoreService,private nepaliCalendarService:NepaliCalendarService) {    
      this.HospitalInfoMaster =(this.securityService.ModuleNameForFiscalYear=="inventory")?this.securityService.INVHospitalInfo: this.securityService.AccHospitalInfo;

    if (this.HospitalInfoMaster) {
      this.currentFiscalYear = this.HospitalInfoMaster.CurrFiscalYear;
      this.FiscalYearList= Array<FiscalYearModel>();           
      this.FiscalYearList = (this.SingleFiscalYearId >0) ?  this.HospitalInfoMaster.FiscalYearList.filter(f=>f.FiscalYearId == this.SingleFiscalYearId) : this.HospitalInfoMaster.FiscalYearList;     
      this.FiscalYearList.map(f => {
        f.StartDate = moment(f.StartDate).format("YYYY-MM-DD");
        f.EndDate = moment(f.EndDate).format("YYYY-MM-DD");
        if(f.IsClosed !=false && f.IsClosed !=true){
          f.IsClosed=false;
        }
      });  
      this.fiscalYearForMonthCalendar=new Array<FiscalYearModel>()
      
      this.fiscalYearForMonthCalendar= this.FiscalYearList.filter(fy=> fy.IsClosed==false); 

      this.currentENMonth=moment(this.HospitalInfoMaster.TodaysDate).format("YYYY-MMM");
      let todaysDateNepali= this.nepaliCalendarService.ConvertEngToNepDate(this.HospitalInfoMaster.TodaysDate);            
      let currFYear=this.fiscalYearForMonthCalendar.find(f=>f.FiscalYearId==this.HospitalInfoMaster.CurrFiscalYear.FiscalYearId)  ;
      this.currentNPMonth=currFYear.NepaliMonthList.find(m=>m.MonthNumber==todaysDateNepali.Month).MonthName;        

    }
    this.showAdBsButton=this.coreService.showCalendarADBSButton;
  }
 
  ngOnInit() {  
    //if showAllFiscalYear is true, then show all the fiscal years
    if (this.showAllFiscalYear) {
      this.FilteredFiscalYearList = this.FiscalYearList;
    }
    //if showAllFiscalYear is false, then only show open i.e. IsClosed = false
    else {
      this.FilteredFiscalYearList = this.FiscalYearList.filter(f => f.IsClosed != true);         
    }
    this.changeDetector.detectChanges();    
    //set the globally set calendar
    this.calType = this.coreService.DatePreference;;
    //this.selectedFiscalYear = this.currentFiscalYear;
    var selFYear= this.FilteredFiscalYearList.filter(f=>f.FiscalYearId==this.HospitalInfoMaster.CurrFiscalYear.FiscalYearId);
    if(selFYear.length >0 && this.ShowMonthCalendar==false){
      this.selectedFiscalYear = selFYear[0];
      this.fiscalYearId = this.selectedFiscalYear.FiscalYearId;

    }
    if (this.showSingleDatePicker && !this.ShowMonthCalendar) {
      this.selectedDate = moment().format("YYYY-MM-DD");
    } else {
      this.fromDate = moment().format("YYYY-MM-DD");
      this.toDate = moment().format("YYYY-MM-DD");
    }

    this.minimumDate = this.currentFiscalYear.StartDate;
    this.maximumDate = this.currentFiscalYear.EndDate;
    this.showDatePicker = true;
    this.sendSelectedFiscalYearData();
  }

  public selectedMonth:any=null;
  public onMonthValueChange(){
    if(this.selectedMonth){      
      let check=true;
      this.fiscalYearId=this.selectedFiscalYear.FiscalYearId;  
      if(this.calType=="np"){             
        let sDate=this.selectedFiscalYear.NepaliMonthList.find(nm=>nm.MonthName==this.selectedMonth.MonthName);
        if(sDate){
          this.fromDate=sDate.FirstDay;
          this.toDate=sDate.LastDay;
        }else{
          check=false;
        }
      }else if(this.calType=="en"){
        let sDate=this.selectedFiscalYear.EnglishMonthList.find(nm=>nm.MonthName==this.selectedMonth.MonthName);
        if(sDate){
          this.fromDate=sDate.FirstDay;
          this.toDate=sDate.LastDay;
        }else{
          check=false;
        }
      }
      if(check==true){
        this.fiscalYearDate.emit({ fiscalYearId: this.selectedFiscalYear.FiscalYearId, fromDate: this.fromDate, toDate: this.toDate });
      }else{
        this.fiscalYearDate.emit(null); 
        this.invalidMessage = "Invalid Date"
      }      
    }
  }
  FiscalYearChanged(){
    //selectedMonth set here
    ///if this is current fiscal year then set current month as selected month
    //if it's other than current fiscal year then set 1 month of year  
    if(this.selectedFiscalYear){
      this.changeDetector.detectChanges();          
      let isCurrentFiscalYear=(this.selectedFiscalYear.FiscalYearId==this.currentFiscalYear.FiscalYearId)?true:false;
      if(isCurrentFiscalYear==true)      {
        this.selectedMonth=(this.calType=="np")?this.selectedFiscalYear.NepaliMonthList.find(x=>x.MonthName==this.currentNPMonth) :this.selectedFiscalYear.EnglishMonthList.find(e=>e.MonthName==this.currentENMonth);
        this.onMonthValueChange();          
      }else{
        this.selectedMonth=(this.calType=="np")?this.selectedFiscalYear.NepaliMonthList[0] :this.selectedFiscalYear.EnglishMonthList[0];
        this.onMonthValueChange();  
      }
     
    }    
  }
  public OnFiscalYearValueChange() {
    this.showDatePicker = false;
    this.fiscalYearId = this.selectedFiscalYear.FiscalYearId;
    if (this.showSingleDatePicker) {
      this.selectedDate = (this.currentFiscalYear.FiscalYearId == this.selectedFiscalYear.FiscalYearId) ? moment().format("YYYY-MM-DD") : this.selectedFiscalYear.StartDate;
    } else {
      this.fromDate = (this.currentFiscalYear.FiscalYearId == this.selectedFiscalYear.FiscalYearId) ? moment().format("YYYY-MM-DD") : this.selectedFiscalYear.StartDate;
      this.toDate = (this.currentFiscalYear.FiscalYearId == this.selectedFiscalYear.FiscalYearId) ? moment().format("YYYY-MM-DD") : this.selectedFiscalYear.EndDate;
    }

    this.showDatePicker = true;
    this.checkForFutureMinDate();
    this.changeDetector.detectChanges();
    this.minimumDate = this.selectedFiscalYear.StartDate;
    this.maximumDate = this.selectedFiscalYear.EndDate;


    let today = moment().format("YYYY-MM-DD");
    if (this.showSingleDatePicker) {
      this.invalid = moment(this.selectedDate).isAfter(today);
    } else {
      this.invalid = moment(this.fromDate).isAfter(today) || moment(this.toDate).isAfter(today);
    }

    if (this.invalid) {
      this.fiscalYearDate.emit(null); this.invalidMessage = "Invalid Date"; return;
    }
    this.sendSelectedFiscalYearData();
  }

  //if the selected fiscal year has future date as minimum date then in that case we need to allow the future date to be selected
  public checkForFutureMinDate() {
    if (moment().isBefore(this.selectedFiscalYear.StartDate)) {
      this.allowFutureDate = true;
    }
  }

  public changeToEnglish() {
    this.calType = 'en';   
    if(this.ShowMonthCalendar){
      this.sendSelectedFiscalYearData();
    }
  }

  public changeToNepali() {
    this.calType = 'np';    
    if(this.ShowMonthCalendar){
      this.sendSelectedFiscalYearData();
    }
  }

  public CheckFromDate(data) {
    if (!data) { this.fiscalYearDate.emit(null); return; }
    if (this.fromDate) {
      this.fromDate = data;
      if (this.fromDate && this.toDate && moment(this.fromDate).isAfter(this.toDate)) {
        this.invalid = true;
        this.invalidMessage = "From date should be before to date";
      }
      else if(this.fromDate && this.toDate && moment(this.fromDate).isBefore(moment(this.minimumDate).format("YYYY-MM-DD"))){
        this.invalid = true;
        this.invalidMessage = "From date should be within fiscal year date range";
      }
      else {
        this.invalid = false;
      }
      if (!this.showOkBtn) {
        this.sendSelectedFiscalYearData();
      }
    }
  }

  public CheckToDate(data) {
    if (!data) { this.fiscalYearDate.emit(null); return; }
    if (this.toDate) {
      this.toDate = data;
      if (this.fromDate && this.toDate && moment(this.fromDate).isAfter(this.toDate)) {
        this.invalid = true;
        this.invalidMessage = "To date should be after  from date";
      }
      else if(this.fromDate && this.toDate && moment(this.toDate).isAfter(moment(this.maximumDate).format("YYYY-MM-DD"))){
        this.invalid = true;
        this.invalidMessage = "To date should be within fiscal year date range";
      }
      else {
        this.invalid = false;
      }
      if (!this.showOkBtn) {
        this.sendSelectedFiscalYearData();
      }
    }
  }

  public CheckSelectedDate(data) {
    if (!data) { this.fiscalYearDate.emit(null); return; }
    if (this.selectedDate) {
      this.selectedDate = data;
      if (!moment(this.selectedDate).isBetween(moment(this.minimumDate).format("YYYY-MM-DD"), moment(this.maximumDate).format("YYYY-MM-DD"), undefined, '[]')) {
        this.invalid = true;
      }
      if (!this.showOkBtn) {
        this.sendSelectedFiscalYearData();
      }
    }
  }

  public sendSelectedFiscalYearData() {
    if (this.showDatePicker && !this.invalid ) {
      if (this.showSingleDatePicker && this.selectedDate && !this.ShowMonthCalendar) {
        if (moment(this.selectedDate).isBetween(moment(this.minimumDate).format("YYYY-MM-DD"), moment(this.maximumDate).format("YYYY-MM-DD"), undefined, '[]')) {
          this.fiscalYearDate.emit({ fiscalYearId: this.selectedFiscalYear.FiscalYearId, selectedDate: this.selectedDate });
        }
      }
      else if (!this.showSingleDatePicker && !this.ShowMonthCalendar) {
        //NageshBB- keep this for reference - moment isBetween verification
        // var a=moment(this.minimumDate).format("YYYY-MM-DD");
        // var b=moment("2020-07-15").isBetween("2020-07-15","2020-07-15",undefined,'[]');
        // var b1=moment("2020-07-15").isBetween("2020-06-15","2020-07-15",undefined,'[]');
        // var b2=moment("2020-07-15").isBetween("2020-06-15","2020-09-15",undefined,'[]');
        // var b3=moment("2020-07-15").isBetween("2020-07-15","2020-09-15",undefined,'[]');        
        if (this.fromDate && this.toDate && moment(this.fromDate).isBetween(moment(this.minimumDate).format("YYYY-MM-DD"), moment(this.maximumDate).format("YYYY-MM-DD"), undefined, '[]')
          && moment(this.toDate).isBetween(moment(this.minimumDate).format("YYYY-MM-DD"), moment(this.maximumDate).format("YYYY-MM-DD"), undefined, '[]')) {
          this.fiscalYearDate.emit({ fiscalYearId: this.selectedFiscalYear.FiscalYearId, fromDate: this.fromDate, toDate: this.toDate });
        }
      }
      else if (this.ShowMonthCalendar) {        
        this.selectedFiscalYear=this.fiscalYearForMonthCalendar.find(f=>f.FiscalYearId==this.HospitalInfoMaster.CurrFiscalYear.FiscalYearId);        
          this.selectedMonth=(this.calType=="np")?this.selectedFiscalYear.NepaliMonthList.find(x=>x.MonthName==this.currentNPMonth) :this.selectedFiscalYear.EnglishMonthList.find(e=>e.MonthName==this.currentENMonth);
          this.onMonthValueChange();                       
      }
    }else
    {
      this.fiscalYearDate.emit(null);
    }
  }


}




