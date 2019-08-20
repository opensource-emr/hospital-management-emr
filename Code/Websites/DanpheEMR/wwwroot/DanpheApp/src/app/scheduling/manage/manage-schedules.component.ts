import { Component } from '@angular/core';

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SCHEmployeeModel } from '../shared/sch-employee.model';
import { SchedulingBLService } from '../shared/scheduling.bl.service';
import { EmployeeSchedulesModel } from '../shared/employee-schedules.model';
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../shared/common.functions';

@Component({
    templateUrl: "../../view/scheduling-view/Manage/ManageSchedules.html" //  "/SchedulingView/ManageSchedules"
})
export class ManageSchedulingComponent {
    //employee list for selection
    public EmployeeList: Array<SCHEmployeeModel> = new Array<SCHEmployeeModel>();
    public showSelectedEmp: boolean = false;
    public empSchedules: Array<any> = new Array<any>();
    public selectedEmpIds: Array<number> = null;
    public currentEmpSch: Array<EmployeeSchedulesModel> = new Array<EmployeeSchedulesModel>();
    public dates: Array<any> = new Array<any>();
    public loading: boolean = false;
    public currentWeek: number = 0;
    public loadedWeek: number = 0;
    public currentMonth: number = 0;
    public loadedMonth: number = 0;
    public prevDisable: boolean = false;
    public nextDisable: boolean = false;
    public reqType: string = "";
    public monthName: string = "";

    constructor(
        public msgBoxServ: MessageboxService,
        public schBLservice: SchedulingBLService) {
        this.currentWeek = moment().week();
        this.loadEmployeeList();
    }
    //loads the selected employee IDs
    onChange($event) {
        this.selectedEmpIds = [];
        $event.forEach(a => {
            this.selectedEmpIds.push(a.EmployeeId);
        });
    }

    loadEmployeeList() {
        this.schBLservice.GetEmployeeList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.EmployeeList = res.Results;
                    this.loadAllEmployeeSchedules();
                }
                else {
                    this.msgBoxServ.showMessage("falied", ['failed to get Employee List.. please check log for details.']);
                    console.log(res.ErrorMessage);
                }
            });
    }
    //filtering dates because the dates-array is filled of Date and DayName
    filteringDate() {
        let filterDates: Array<string> = [];
        this.dates.forEach(a => {
            filterDates.push(a.date);
        });
        return filterDates;
    }
    //get the employee's assigned schedule for selected dates with its default schedules
    GetEmployeeSchedules() {
        if (this.selectedEmpIds != null) {
            let Ids = this.selectedEmpIds.toString();
            let Dts = this.filteringDate();
            this.schBLservice.GetEmpSchedule(Ids, Dts)
                .subscribe(res => {
                    if (res.Status == 'OK') {
                        this.LoadEmpSchedules(res);
                    }
                    else {
                        this.msgBoxServ.showMessage("falied", ['failed to get Schedules.. please check log for details.']);
                        console.log(res.ErrorMessage);
                    }
                });
        }
        else {
            this.msgBoxServ.showMessage('attention', ['select employee to load its schedules.'])
        }
    }

    LoadEmpSchedules(res) {
        //processing of schedules
        let isFound = false;
        let data = res.Results;
        let processedData: Array<any>;
        this.empSchedules = [];
        //forEach Employee level loop
        data.forEach(a => {
            processedData = [];
            //forEach dates level loop
            this.dates.forEach(b => {
                isFound = false;
                //for loop of loadedSchedule
                for (var i = 0; i < a.loadSCH.length; i++) {
                    if (moment(a.loadSCH[i].Date).format("YYYY-MM-DD") == b.date) {
                        processedData.push(a.loadSCH[i]);
                        isFound = true;
                        break;
                    }
                }
                //if not found in loaded schedule load default schedule
                if (!isFound) {
                    let isDefaultFound = false;
                    for (var i = 0; i < a.defSCH.length; i++) {
                        if (a.defSCH[i].DayName == b.day) {
                            let obj = new Object();
                            obj["Id"] = 0;
                            obj["TxnType"] = "Insert";
                            obj["Date"] = b.date;
                            obj["DayName"] = b.day;
                            obj["IsWorkingDay"] = a.defSCH[i].IsWorkingDay;
                            //push
                            processedData.push(obj);
                            isDefaultFound = true;
                            break;
                        }
                    }
                    //when no schedule is found (in loadSCH or defSCH), then assigning temporary schedule where IsWorkingDay=false
                    if (!isDefaultFound) {
                        let obj = new Object();
                        obj["Id"] = 0;
                        obj["TxnType"] = "Insert";
                        obj["Date"] = b.date;
                        obj["DayName"] = b.day;
                        obj["IsWorkingDay"] = false;
                        //push
                        processedData.push(obj);
                    }
                }
            });
            //final structure for loading in view
            let empObj = new Object();
            empObj["EmployeeId"] = a.EmployeeId;
            empObj["EmployeeName"] = a.EmployeeName;
            empObj["DepartmentName"] = a.DepartmentName;
            empObj["EmployeeSchedules"] = processedData;
            this.empSchedules.push(empObj);
        });
        this.showSelectedEmp = true;
    }

    loadCurrentWeek() {
        if (this.reqType == "week") {
            var obj = {
                startDate: moment().startOf('week'),
                endDate: moment().endOf('week')
            };
            this.dates = CommonFunctions.getDateArray(obj);
            this.loadedWeek = moment().week();
            this.GetEmployeeSchedules();
            this.prevDisable = false;
            this.nextDisable = false;
        }
        else if (this.reqType == "month") {
            this.loadCurrentMonth();
        }
    }

    loadPreviousWeek() {
        if (this.reqType == "week") {
            if (this.currentWeek - this.loadedWeek < 2) {
                let fromDate = moment(this.dates[0].date).subtract(1, 'week').startOf('week');
                let toDate = moment(this.dates[this.dates.length - 1].date).subtract(1, 'week').endOf('week');
                var obj = {
                    startDate: fromDate,
                    endDate: toDate
                };
                this.dates = CommonFunctions.getDateArray(obj);
                this.GetEmployeeSchedules();
                this.nextDisable = false;
                this.prevDisable = (this.currentWeek - this.loadedWeek == 1) ? true : false;
                this.loadedWeek--;
            }
            else {
                this.msgBoxServ.showMessage('notice', ["You have reached maximum previous limit."]);
            }
        }
        else if (this.reqType == "month") {
            this.loadPreviousMonth();
        }
    }

    loadNextWeek() {
        if (this.reqType == "week") {
            if (this.loadedWeek - this.currentWeek < 2) {
                let fromDate = moment(this.dates[0].date).add(1, 'week').startOf('week');
                let toDate = moment(this.dates[this.dates.length - 1].date).add(1, 'week').endOf('week');
                var obj = {
                    startDate: fromDate,
                    endDate: toDate
                };
                this.dates = CommonFunctions.getDateArray(obj);
                this.GetEmployeeSchedules();
                this.prevDisable = false;
                this.nextDisable = (this.loadedWeek - this.currentWeek == 1) ? true : false;
                this.loadedWeek++;
            }
            else {
                this.msgBoxServ.showMessage('notice', ["You have reached maximum next limit."])
            }
        }
        else if (this.reqType == "month") {
            this.loadNextMonth();
        }

    }

    month() {
        this.currentMonth = moment().month();
        this.loadCurrentMonth();
    }

    loadCurrentMonth() {
        var obj = {
            startDate: moment().startOf('month'),
            endDate: moment().endOf('month')
        };
        this.dates = CommonFunctions.getDateArray(obj);
        this.loadedMonth = moment().month();
        this.monthName = moment().format('MMMM');
        this.GetEmployeeSchedules();
        this.prevDisable = false;
        this.nextDisable = false;
    }

    loadPreviousMonth() {
        if (this.currentMonth - this.loadedMonth < 2) {
            let fromDate = moment(this.dates[0].date).subtract(1, 'month').startOf('month');
            let toDate = moment(this.dates[this.dates.length - 1].date).subtract(1, 'month').endOf('month');
            var obj = {
                startDate: fromDate,
                endDate: toDate
            };
            this.dates = CommonFunctions.getDateArray(obj);
            this.GetEmployeeSchedules();
            this.nextDisable = false;
            this.prevDisable = (this.currentMonth - this.loadedMonth == 1) ? true : false;
            this.loadedMonth--;
            this.monthName = moment(this.dates[0].date).format('MMMM');
        }
        else {
            this.msgBoxServ.showMessage('notice', ["You have reached maximum previous limit."]);
        }
    }

    loadNextMonth() {
        if (this.loadedMonth - this.currentMonth < 2) {
            let fromDate = moment(this.dates[0].date).add(1, 'month').startOf('month');
            let toDate = moment(this.dates[this.dates.length - 1].date).add(1, 'month').endOf('month');
            var obj = {
                startDate: fromDate,
                endDate: toDate
            };
            this.dates = CommonFunctions.getDateArray(obj);
            this.GetEmployeeSchedules();
            this.prevDisable = false;
            this.nextDisable = (this.loadedMonth - this.currentMonth == 1) ? true : false;
            this.loadedMonth++;
            this.monthName = moment(this.dates[0].date).format('MMMM');

        }
        else {
            this.msgBoxServ.showMessage('notice', ["You have reached maximum next limit."])
        }
    }

    //making obj suitable for update/post
    processing() {
        this.currentEmpSch = [];
        this.empSchedules.forEach(a => {
            a.EmployeeSchedules.forEach(b => {
                let curEmpSch = new EmployeeSchedulesModel();
                curEmpSch.EmployeeId = a.EmployeeId;
                curEmpSch.TxnType = b.TxnType;
                curEmpSch.EmployeeSCHId = b.Id;
                curEmpSch.DayName = b.DayName;
                curEmpSch.IsWorkingDay = b.IsWorkingDay;
                curEmpSch.Date = b.Date;
                this.currentEmpSch.push(curEmpSch);
            });
        });
    }

    saveEmpSchedules() {
        this.processing();
        this.loading = true;
        this.schBLservice.AddEmpSchedule(this.currentEmpSch)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.showSelectedEmp = false;
                    this.msgBoxServ.showMessage("success", ["Schedule Assigned Successfully."])
                }
                else {
                    this.msgBoxServ.showMessage("error", ["Something Wrong" + res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["Something Wrong" + err.ErrorMessage]);
            });
        this.loading = false;
    }

    loadAllEmployeeSchedules() {
        this.selectedEmpIds = [];
        this.EmployeeList.forEach(a => {
            this.selectedEmpIds.push(a.EmployeeId);
        });
        this.reqType = "week";
        this.loadCurrentWeek();
    }
}