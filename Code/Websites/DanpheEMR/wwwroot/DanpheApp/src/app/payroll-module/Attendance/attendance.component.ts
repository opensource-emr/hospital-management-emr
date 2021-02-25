import { Component, ViewChild, ChangeDetectorRef } from '@angular/core'
import { MatDialogRef } from '@angular/material';
import { DailyMuster } from '../Shared/daily-muster.model';
import * as moment from 'moment';
import * as _ from 'lodash';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SchedulingBLService } from '../../scheduling/shared/scheduling.bl.service';
import { Employee } from '../../employee/shared/employee.model';
import { AttendanceDailyTimeRecord } from '../Shared/Payroll-attendance-daily-time-record.model';
import { PayrollBLService } from '../Shared/payroll.bl.service';
import { MatDialog } from '@angular/material';
import { EditAttendance } from './edit-attendance/edit-attendance';
import { CommonPayrollService } from '../Shared/common-payroll.service';
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from '../../../app/security/shared/security.service';
import { WeekendHolidays } from '../Shared/Payroll-weekend-holiday-policy.model';
import { HolidayModel } from '../Shared/payroll-holiday.model';

@Component({
  templateUrl: "./attendance.component.html"
})
export class AttendanceComponent {
  public PayrollDetail: DailyMuster = new DailyMuster();
  public empatt: Array<DailyMuster> = new Array<DailyMuster>();
  public EmpDetails: Array<Employee> = new Array<Employee>();
  public csvRecords: Array<AttendanceDailyTimeRecord> = new Array<AttendanceDailyTimeRecord>();
  public empAtt: Array<any> = new Array<any>();
  public dailyAttendanceRecords: Array<DailyMuster> = new Array<DailyMuster>();
  public dailyAttendanceRecord: DailyMuster = new DailyMuster();
  public dates: any;
  public config: any;
  public loadedMonth: number = 0;
  public showPopup: boolean = false;
  public years: any = [];
  public ShowIcon: boolean = false;
  public currFullMonth: any;
  public currShortMonth: any;
  public listOfMonths: any = [];
  public ShowMonths: boolean = false;
  public currentYear: any;
  public searchText: string;
  public CurrEmpId: any;
  public WeekendPolicy: Array<WeekendHolidays> = new Array<WeekendHolidays>();
  public Sunday: WeekendHolidays = new WeekendHolidays();
  public Saturday: WeekendHolidays = new WeekendHolidays();
  public Monday: WeekendHolidays = new WeekendHolidays();
  public Tuesday: WeekendHolidays = new WeekendHolidays();
  public Wednesday: WeekendHolidays = new WeekendHolidays();
  public Thursday: WeekendHolidays = new WeekendHolidays();
  public Friday: WeekendHolidays = new WeekendHolidays();
  public HolidayList: Array<HolidayModel> = new Array<HolidayModel>();
  @ViewChild('fileImportInput') fileImportInput: any;

  public p: number = 1;//sud:12Apr'20-- for production build fixes.

  constructor(public msgBoxServ: MessageboxService,
    public schBLservice: SchedulingBLService,
    public payrollBLService: PayrollBLService,
    public dialog: MatDialog,
    public commonPayrollService: CommonPayrollService,
    public _coreService: CoreService,
    public changeDef: ChangeDetectorRef,
    public securityService: SecurityService) {
    this.getWeekendPolicy();
    this.CurrEmpId = this.securityService.GetLoggedInUser().EmployeeId;
    this.currentYear = moment().startOf("year").format('YYYY');
    this.PayrollDetail.Year = this.currentYear
    this.currFullMonth = moment().startOf("month").format('MMMM');
    this.PayrollDetail.mm = this.currFullMonth
    let year = parseInt(moment().startOf("year").format('YYYY'));
    this.currShortMonth = parseInt(moment().startOf("month").year(year).format('M'));
    this.loadEmpAttendance(year, this.currShortMonth, this.CurrEmpId);
    this.getDefaultMonths();
    this.getDefaultYears();
    // this.getHolidayList();
    // this.getCSVRecord();
  }
  Close() {
    this.showPopup = false;
  }
  GetFileToImportData() {
    this.showPopup = true;
  }
  openDialog(data) {
    let dialogRef: MatDialogRef<EditAttendance> = this.dialog.open(EditAttendance, {
      width: '250px',
    });
    dialogRef.componentInstance.getdata(data);
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        this.loadEmpAttendance(result.Year, result.Month, this.CurrEmpId);
        this.ShowIcon = true;
      }
    });
  }
  ngOnInit() { }
  OnSelectYearLoadMonth() {
    this.OnSelectMonthLoadMonth();
  }
  OnSelectMonthLoadMonth() {
    let date = {
      month: this.PayrollDetail.mm,
      year: this.PayrollDetail.Year
    }
    let mm = parseInt(moment().startOf("month").year(date.year).month(date.month).format('M'));
    this.loadEmpAttendance(date.year, mm, this.CurrEmpId);
  }
  getDefaultMonths() {
    this.listOfMonths = [];
    var value = parseInt(moment().startOf("month").format('M'));
    for (let i = 0; i < value; i++) {
      this.listOfMonths.push(moment().month(i).format('MMMM'));
    }
  }
  getDefaultYears() {
    let backYearToShow = this._coreService.Parameters.find(p => p.ParameterGroupName == "Payroll"
      && p.ParameterName == "PayrollLoadNoOfYears").ParameterValue;
    for (var i = this.currentYear - backYearToShow; i <= this.currentYear; i++) {
      this.years.push(i);
    }
  }
  getCurrMonthYear(year, month) {
    let obj = {
      startDate: moment().startOf('month').year(year).month(month),
      currDate: moment(new Date(), "DD/MM/YYYY")
    }
    this.dates = this.getCurrDataArray(obj);
  }
  getAllMonthYear(year, month) {
    let obj = {
      startDate: moment().subtract(1, 'month').startOf('month').year(year).month(month),
      endDate: moment().subtract(1, 'month').endOf('month').year(year).month(month),
    }
    this.dates = this.getAllDateArray(obj);
  }
  public getAllDateArray(obj) {
    var start = obj.startDate.clone();
    var end = obj.endDate.clone();
    var res = this.getDateArray(start, end);
    return res;
  }
  getDays(date, num) {
    var d = new Date(date),
      month = d.getMonth(),
      days = [];
    d.setDate(1);
    // Get the first saturdays in the month
    while (d.getDay() !== num) {
      d.setDate(d.getDate() + 1);
    }
    // Get all the other saturdays in the month
    while (d.getMonth() === month) {
      days.push(new Date(d.getTime()));
      d.setDate(d.getDate() + 7);
    }
    return days;
  }
  public getCurrDataArray(obj) {
    var start = obj.startDate.clone();
    var curr = obj.currDate.clone();
    var res = this.getDateArray(start, curr);
    return res;
  }
  getDateArray(start, end) {
    this.getHolidayList();
    var processData = [];
    var finalData = [];
    while (start.isBefore(end)) {
      let object = new Object();
      object["date"] = start.format('YYYY-MM-DD');
      object["day"] = parseInt(start.format('D'));
      object["DayName"] = start.format('dddd');
      if (start.format('dddd') == this.Sunday.DayName) {
        if (this.Sunday.Value == "every") {
          object["color"] = '#D3D3D3'
        } else {
          let selectedNum = this.Sunday.Value.split(', ');
          var days = this.getDays(start, 0)
          for (let i = 0; i < selectedNum.length; i++) {
            if (selectedNum[i] == "First") {
              if (start.toISOString() == days[0].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Second") {
              if (start.toISOString() == days[1].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Third") {
              if (start.toISOString() == days[2].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Fourth") {
              if (start.toISOString() == days[3].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            }
          }
        }
      } else if (start.format('dddd') == this.Saturday.DayName) {
        if (this.Saturday.Value == "every") {
          object["color"] = '#D3D3D3'
        } else {
          let selectedNum = this.Saturday.Value.split(', ');
          var days = this.getDays(start, 6)
          for (let i = 0; i < selectedNum.length; i++) {
            if (selectedNum[i] == "First") {
              if (start.toISOString() == days[0].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Second") {
              if (start.toISOString() == days[1].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Third") {
              if (start.toISOString() == days[2].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Fourth") {
              if (start.toISOString() == days[3].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            }
          }
        }
      } else if (start.format('dddd') == this.Monday.DayName) {
        if (this.Monday.Value == "every") {
          object["color"] = '#D3D3D3'
        } else {
          let selectedNum = this.Monday.Value.split(', ');
          var days = this.getDays(start, 1)
          for (let i = 0; i < selectedNum.length; i++) {
            if (selectedNum[i] == "First") {
              if (start.toISOString() == days[0].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Second") {
              if (start.toISOString() == days[1].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Third") {
              if (start.toISOString() == days[2].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Fourth") {
              if (start.toISOString() == days[3].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            }
          }
        }
      } else if (start.format('dddd') == this.Tuesday.DayName) {
        if (this.Tuesday.Value == "every") {
          object["color"] = '#D3D3D3'
        } else {
          let selectedNum = this.Tuesday.Value.split(', ');
          var days = this.getDays(start, 2)
          for (let i = 0; i < selectedNum.length; i++) {
            if (selectedNum[i] == "First") {
              if (start.toISOString() == days[0].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Second") {
              if (start.toISOString() == days[1].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Third") {
              if (start.toISOString() == days[2].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Fourth") {
              if (start.toISOString() == days[3].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            }
          }
        }
      } else if (start.format('dddd') == this.Wednesday.DayName) {
        if (this.Wednesday.Value == "every") {
          object["color"] = '#D3D3D3'
        } else {
          let selectedNum = this.Wednesday.Value.split(', ');
          var days = this.getDays(start, 3)
          for (let i = 0; i < selectedNum.length; i++) {
            if (selectedNum[i] == "First") {
              if (start.toISOString() == days[0].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Second") {
              if (start.toISOString() == days[1].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Third") {
              if (start.toISOString() == days[2].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Fourth") {
              if (start.toISOString() == days[3].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            }
          }
        }
      } else if (start.format('dddd') == this.Thursday.DayName) {
        if (this.Thursday.Value == "every") {
          object["color"] = '#D3D3D3'
        } else {
          let selectedNum = this.Thursday.Value.split(', ');
          var days = this.getDays(start, 4)
          for (let i = 0; i < selectedNum.length; i++) {
            if (selectedNum[i] == "First") {
              if (start.toISOString() == days[0].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Second") {
              if (start.toISOString() == days[1].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Third") {
              if (start.toISOString() == days[2].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Fourth") {
              if (start.toISOString() == days[3].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            }
          }
        }
      } else if (start.format('dddd') == this.Friday.DayName) {
        if (this.Friday.Value == "every") {
          object["color"] = '#D3D3D3'
        } else {
          let selectedNum = this.Friday.Value.split(', ');
          var days = this.getDays(start, 5)
          for (let i = 0; i < selectedNum.length; i++) {
            if (selectedNum[i] == "First") {
              if (start.toISOString() == days[0].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Second") {
              if (start.toISOString() == days[1].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Third") {
              if (start.toISOString() == days[2].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            } else if (selectedNum[i] == "Fourth") {
              if (start.toISOString() == days[3].toISOString()) {
                object["color"] = '#D3D3D3'
              }
            }
          }
        }
      }
      else {
        object["color"] = '#3598dc'
      }
      object["shortDay"] = start.format('ddd');
      processData.push(object);
      start.add(1, 'd');
    }
    processData.forEach(b => {
      let isDefaultFound = false;
      for (var i = 0; i < this.HolidayList.length; i++) {
        let dateTime = this.HolidayList[i].Date.split("T");
        var date = dateTime[0];
        if (b.date == date) {
          let obj = new Object();
          obj["date"] = date;
          obj["day"] = b.day;
          obj["DayName"] = b.DayName;
          obj["color"] = "#ffa500";
          obj["HolidayTitle"] = this.HolidayList[i].Title;
          obj["shortDay"] = b.shortDay
          finalData.push(obj);
          isDefaultFound = true;
          break;
        }
      }
      if (!isDefaultFound) {
        let obj = new Object();
        obj["date"] = b.date;
        obj["day"] = b.day;
        obj["DayName"] = b.DayName;
        obj["color"] = b.color;
        obj["HolidayTitle"] = "";
        obj["shortDay"] = b.shortDay
        finalData.push(obj);
      }
    });
    return finalData;
  }
  getWeekendPolicy() {
    this.payrollBLService.getWeekendPolicy()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.WeekendPolicy = res.Results;
          for (let i = 0; i < this.WeekendPolicy.length; i++) {
            switch (this.WeekendPolicy[i].DayName.trim()) {
              case "Sunday":
                {
                  this.Sunday.Value = this.WeekendPolicy[i].Value;
                  this.Sunday.DayName = this.WeekendPolicy[i].DayName;
                  this.Sunday.Year = this.WeekendPolicy[i].Year;
                }
                break;
              case "Saturday":
                {
                  this.Saturday.Value = this.WeekendPolicy[i].Value;
                  this.Saturday.DayName = this.WeekendPolicy[i].DayName;
                  this.Saturday.Year = this.WeekendPolicy[i].Year;
                }
                break;
              case "Monday":
                {
                  this.Monday.Value = this.WeekendPolicy[i].Value;
                  this.Monday.DayName = this.WeekendPolicy[i].DayName;
                  this.Monday.Year = this.WeekendPolicy[i].Year;
                }
                break;
              case "Tuesday":
                {
                  this.Tuesday.Value = this.WeekendPolicy[i].Value;
                  this.Tuesday.DayName = this.WeekendPolicy[i].DayName;
                  this.Tuesday.Year = this.WeekendPolicy[i].Year;
                }
                break;
              case "Wednesday":
                {
                  this.Wednesday.Value = this.WeekendPolicy[i].Value;
                  this.Wednesday.DayName = this.WeekendPolicy[i].DayName;
                  this.Wednesday.Year = this.WeekendPolicy[i].Year;
                }
                break;
              case "Thursday":
                {
                  this.Thursday.Value = this.WeekendPolicy[i].Value;
                  this.Thursday.DayName = this.WeekendPolicy[i].DayName;
                  this.Thursday.Year = this.WeekendPolicy[i].Year;
                }
                break;
              case "Friday":
                {
                  this.Friday.Value = this.WeekendPolicy[i].Value;
                  this.Friday.DayName = this.WeekendPolicy[i].DayName;
                  this.Friday.Year = this.WeekendPolicy[i].Year;
                }
                break;
              default: { }
                break;
            }
          }


        }
      })
  }
  LoadEmployeeList(status) {
    this.CurrEmpId = 0;
    let mm = parseInt(moment().startOf("month").month(this.PayrollDetail.mm).format('M'));
    this.loadEmpAttendance(this.PayrollDetail.Year, mm, this.CurrEmpId);
  }
  loadEmpAttendance(yy, mm, CurrEmpId) {
    this.payrollBLService.GetEmployeelist(yy, mm, CurrEmpId)
      .subscribe(res => {
        if (res.Status == "OK") {
          var month = mm - 1
          if (this.currShortMonth == mm && this.currentYear == yy) {
            this.dates = [];
            this.getCurrMonthYear(yy, month);
          } else {
            this.dates = [];
            this.getAllMonthYear(yy, month);
          }
          this.LoadEmpAttendance(res);
          //   this.msgBoxServ.showMessage("Notice", ['There is no Attendance for Selected Month and Year...'])
          this.getDefaultMonths();
          this.ShowIcon = false;
        }
      });
  }
  LoadEmpAttendance(res) {
    //processing of attendance
    let isFound = false;
    let data = res.Results;
    let processedData: Array<any>;
    this.empAtt = [];
    //forEach Employee level loop
    data.forEach(a => {
      processedData = [];
      //forEach dates level loop
      this.dates.forEach(b => {
        isFound = false;
        if (!isFound) {
          let isDefaultFound = false;
          for (var i = 0; i < a.empAttend.length; i++) {
            if (a.empAttend[i].Day == b.day) {
              let obj = new Object();
              obj["EmployeeId"] = a.EmployeeId;
              obj["Date"] = b.date;
              obj["DayName"] = b.day;
              obj["Present"] = a.empAttend[i].Present;
              obj["AttStatus"] = a.empAttend[i].AttStatus;
              obj["ColorCode"] = a.empAttend[i].ColorCode;
              // obj["Title"] = a.empAttend[i].Title;
              processedData.push(obj);
              isDefaultFound = true;
              break;
            }
          }
          if (!isDefaultFound) {
            let obj = new Object();
            obj["EmployeeId"] = a.EmployeeId;
            obj["Date"] = b.date;
            obj["DayName"] = b.day;
            obj["AttStatus"] = '';
            obj["ColorCode"] = '';
            //obj["Title"] = '';
            obj["Present"] = false;
            processedData.push(obj);
          }
        }
      });
      //final structure for loading in view
      let empObj = new Object();
      empObj["EmployeeId"] = a.EmployeeId;
      empObj["EmployeeName"] = a.EmployeeName;
      empObj["DailyAttend"] = processedData;
      this.empAtt.push(empObj);
    });
  }
  EditAttendance() {
    this.ShowIcon = true;
  }
  // getCSVRecord() {
  //   this.payrollBLService.getCSVRecord()
  //     .subscribe(res => {
  //       if (res.Status == "OK") {
  //         this.csvRecords = res.Results

  //         this.postCsvDataToDailyMuster(this.csvRecords);
  //       }
  //     }) //CSVRecords
  // }
  postAttendanceDailyTimeRecord() {
    this.payrollBLService.postAttendanceDailyTimeRecord(this.csvRecords)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.csvRecords = [];
          this.csvRecords = res.Results;
          this.postCsvDataToDailyMuster(this.csvRecords);
        } else {
          this.msgBoxServ.showMessage("Failed", ['Unable to load data..']);
        }
      });
  }
  postCsvDataToDailyMuster(records) {
    var dailyMusterData = [];
    var processdata = [];
    var timeInData = [];
    var timeOutData = [];
    for (let i = 0; i < records.length; i++) {
      var dateTime = records[i].RecordDateTime;
      var datetime = dateTime.split(" ");
      var date = datetime[0].split("-");
      var obj = {
        dd: parseInt(date[0]),
        mm: parseInt(date[1]),
        yyyy: parseInt(date[2])
      }
      if (processdata.length == 0) {
        var objtime = new Object();
        objtime["TimeIn"] = datetime[1];
        objtime["Date"] = datetime[0];
        objtime["Day"] = obj.dd;
        objtime["Month"] = obj.mm;
        objtime["Year"] = obj.yyyy;
        objtime["EmployeeId"] = records[i].EmployeeId
        processdata.push(objtime);
        timeInData.push(objtime);
      } else if (datetime[1] != processdata[0].TimeIn) {
        var objtime = new Object();
        objtime["TimeOut"] = datetime[1];
        objtime["Date"] = datetime[0];
        objtime["Day"] = obj.dd;
        objtime["Month"] = obj.mm;
        objtime["Year"] = obj.yyyy;
        objtime["EmployeeId"] = records[i].EmployeeId
        processdata.push(objtime);
        timeOutData.push(objtime);
        processdata = [];
      }
    }
    for (let i = 0; i < timeInData.length; i++) {
      for (let j = 0; j < timeOutData.length; j++) {
        if (timeInData[i].Date == timeOutData[j].Date && timeInData[i].EmployeeId == timeOutData[j].EmployeeId) {
          var objtime = new Object();
          objtime["TimeIn"] = timeInData[i].TimeIn;
          objtime["TimeOut"] = timeOutData[j].TimeOut;
          objtime["Date"] = timeInData[i].Date;
          objtime["Day"] = timeInData[i].Day;
          objtime["Month"] = timeInData[i].Month;
          objtime["Year"] = timeInData[i].Year;
          objtime["Present"] = true;
          objtime["AttStatus"] = "P";
          objtime["ColorCode"] = "#4dd84d";
          objtime["HoursInDay"] = 8;
          objtime["EmployeeId"] = timeInData[i].EmployeeId;
          dailyMusterData.push(objtime);
        }
      }
    }

    this.payrollBLService.postCsvDataToDailyMuster(dailyMusterData)
      .subscribe(res => {
        if (res.Status == "OK") {
          let year = parseInt(moment().startOf("year").format('YYYY'));
          let month = parseInt(moment().startOf("month").year(year).format('M'));
          this.loadEmpAttendance(year, month, this.CurrEmpId);
          this.showPopup = false;
        }
      });
  }
  getHolidayList() {
    this.payrollBLService.GetHolidaylist()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.HolidayList = res.Results;
          //  this.postHolidayListToDailyMuster(HolidayList);
        }
      });

  }
  // postHolidayListToDailyMuster(HolidayList: Array<HolidayModel>) {
  //   var postHolidayList: Array<DailyMuster> = new Array<DailyMuster>();
  //   for (let i = 0; i < HolidayList.length; i++) {
  //     let datetime = HolidayList[i].Date.split("T");
  //     let date = datetime[0].split("-");
  //     let obj = {
  //       yyyy: parseInt(date[0]),
  //       mm: parseInt(date[1]),
  //       dd: parseInt(date[2]),
  //     }
  //     var postHolidays = new DailyMuster();
  //     postHolidays.Year = obj.yyyy;
  //     postHolidays.Day = obj.dd;
  //     postHolidays.Month = obj.mm;
  //     postHolidays.Present = false;
  //     postHolidays.AttStatus = "GH";
  //     postHolidays.Title = HolidayList[i].Title;
  //     postHolidays.TimeIn = null;
  //     postHolidays.TimeOut = null;
  //     postHolidays.HoursInDay = 0;
  //     postHolidays.ColorCode = "#ffa500"
  //     postHolidays.EmployeeId = 0;
  //     postHolidayList.push(postHolidays);
  //   }
  //   this.payrollBLService.postHolidayListToDailyMuster(postHolidayList)
  //     .subscribe(res => {
  //       if (res.Status == "OK") {

  //       }
  //     });
  // }
  ChangeWeeks() {

  }
  /* here is logic to import csv data to database table */
  fileChangeListener($event: any): void {
    var files = $event.srcElement.files;
    if (this.commonPayrollService.isCSVFile(files[0])) {
      var input = $event.target;
      var reader = new FileReader();
      reader.readAsText(input.files[0]);
      reader.onload = (data) => {
        let csvData = reader.result;
        let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);
        let headersRow = this.commonPayrollService.getHeaderArray(csvRecordsArray);
        this.csvRecords =
          this.commonPayrollService.getDataRecordsArrayFromCSVFile(csvRecordsArray,
            headersRow.length);
        this.postAttendanceDailyTimeRecord();
      }
      reader.onerror = function () {
        alert('Unable to read ' + input.files[0]);
      };
    } else {
      alert("Please import valid .csv file.");
      this.fileReset();
    }
  }
  fileReset() {
    this.fileImportInput.nativeElement.value = "";
    this.csvRecords = [];
  }
}
