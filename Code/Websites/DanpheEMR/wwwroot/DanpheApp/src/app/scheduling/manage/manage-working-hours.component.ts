import { Component, ChangeDetectorRef } from "@angular/core";

import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { SchedulingBLService } from '../shared/scheduling.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../security/shared/security.service';
import { ShiftsMasterModel } from "../shared/shifts-master.model";
import * as moment from 'moment/moment';
import { EmployeeShiftMapModel } from "../shared/employee-shift-map.model";
import { WorkingHoursTxnVM, ManageWorkingHoursVM } from "../shared/scheduling-view.models";
import { SCHEmployeeModel } from "../shared/sch-employee.model";

@Component({
    templateUrl: "../../view/scheduling-view/Manage/ManageWorkingHours.html" // "/SchedulingView/ManageWorkingHours"
})
export class ManageWorkingHours {
    public currentEmpWH: ManageWorkingHoursVM = new ManageWorkingHoursVM();
    public selectedEmpWH: ManageWorkingHoursVM = new ManageWorkingHoursVM();
    public workingHoursList: Array<ManageWorkingHoursVM> = new Array<ManageWorkingHoursVM>();
    public empWHGridColumns: Array<any> = null;
    public showEmpWHUpdatePage: boolean = false;
    public workingHrsTxn: WorkingHoursTxnVM = new WorkingHoursTxnVM();
    public showDefaultShiftsPopUp: boolean = false;
    public defaultShiftsList: Array<ShiftsMasterModel> = new Array<ShiftsMasterModel>();
    public selectedShifts: Array<ShiftsMasterModel> = new Array<ShiftsMasterModel>();
    public update: boolean = false;
    public empNoShiftList: Array<SCHEmployeeModel> = new Array<SCHEmployeeModel>();
    public selectedEmp: any = null;
    public emp: SCHEmployeeModel = new SCHEmployeeModel();
    public index: number = null;
    public showAddShiftPopUp: boolean = false;

    constructor(
        public schBLservice: SchedulingBLService,
        public msgBoxServ: MessageboxService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef) {
        this.empWHGridColumns = GridColumnSettings.WorkingHoursList;
        this.getEmpWHList();
        //this.getEmployeeList();
    }

    public getEmpWHList() {
        this.schBLservice.GetEmpWHList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.workingHoursList = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("Failed ! ", res.ErrorMessage);
                    console.log(res.ErrorMessage)
                }
            });
    }

    WorkingHrsGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.selectedEmpWH = null;
                this.showEmpWHUpdatePage = false;
                this.changeDetector.detectChanges();
                this.selectedEmpWH = $event.Data;
                if (this.selectedEmpWH.NoOfShifts > 0) {
                    this.selectedEmpWH.Shifts.forEach(a => {
                        let temp = new ShiftsMasterModel();
                        temp = Object.assign(temp, a);
                        //if current shift is default,disable its controls
                        //not working from html so coded in here. 
                        if (temp.IsDefault) {
                            temp.ShiftValidator.disable();
                        }
                        this.currentEmpWH.Shifts.push(temp);
                    });
                }
                else {
                    this.currentEmpWH.Shifts = [];
                }
                this.currentEmpWH.EmployeeId = this.selectedEmpWH.EmployeeId;
                this.currentEmpWH.EmployeeName = this.selectedEmpWH.EmployeeName;
                this.currentEmpWH.NoOfShifts = this.selectedEmpWH.NoOfShifts;
                this.currentEmpWH.TotalWorkingHrs = this.selectedEmpWH.TotalWorkingHrs;
                this.showEmpWHUpdatePage = true;
                this.update = true;

                break;
            }
            default:
                break;
        }
    }

    //AddShift() {
    //    let temp = new ShiftsMasterModel();
    //    this.currentEmpWH.Shifts.push(temp);
    //}
    ////remove shift is not being use yet
    //RemoveShift(index) {
    //    this.currentEmpWH.Shifts.splice(index, 1);
    //    if (index == 0) {
    //        this.currentEmpWH.Shifts.push(new ShiftsMasterModel());
    //    }
    //    this.changeDetector.detectChanges();
    //}


    //calculating the total hours of selected shift
    CalculationForTotalHrs(row, index) {
        if (row.StartTime != null && row.EndTime != null) {
            let start = moment(row.StartTime, "HH:mm a");
            let end = moment(row.EndTime, "HH:mm a");
            var duration = moment.duration(end.diff(start));
            var hours = parseFloat(duration.asHours().toFixed(2));
            if (hours >= 0) {
                this.currentEmpWH.Shifts[index].TotalHrs = hours;
            }
            else {
                let hrs = parseFloat((hours + 24).toFixed(2))
                this.currentEmpWH.Shifts[index].TotalHrs = hrs;
            }
            this.calculationForOverallWorkingHours();
        }
    }

    calculationForOverallWorkingHours() {
        //updating overall working hours
        let temp = 0;
        this.currentEmpWH.Shifts.forEach(a => {
            if (a.IsActive)
                temp = temp + a.TotalHrs;
        });
        this.currentEmpWH.TotalWorkingHrs = temp;
    }

    onIsActiveChange() {
        let temp = 0;
        this.currentEmpWH.Shifts.forEach(a => {
            if (a.IsActive)
                temp++;
        });
        this.currentEmpWH.NoOfShifts = temp;
        this.calculationForOverallWorkingHours();
    }

    processingData() {
        let empId = this.currentEmpWH.EmployeeId;
        this.currentEmpWH.Shifts.forEach(a => {
            if (a.EmployeeShiftMapId == 0 && a.IsActive == false) { }
            else {
                //shift data processing
                let curShift = new ShiftsMasterModel();
                curShift.ShiftId = a.ShiftId;
                curShift.ShiftName = a.ShiftName;
                curShift.StartTime = a.StartTime;
                curShift.EndTime = a.EndTime;
                curShift.TotalHrs = a.TotalHrs;
                curShift.IsActive = a.IsActive;
                this.workingHrsTxn.Shifts.push(curShift);

                //map data processing
                let curMap = new EmployeeShiftMapModel();
                curMap.EmployeeShiftMapId = a.EmployeeShiftMapId;
                curMap.EmployeeId = empId;
                curMap.ShiftId = a.ShiftId;
                curMap.IsActive = a.IsActive;
                this.workingHrsTxn.Maps.push(curMap);
            }
        });
        this.workingHrsTxn.Shifts.forEach(a => {
            if (a.ShiftId > 0) {
                a.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
            }
            else if (a.ShiftId == 0) {
                a.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            }
        });
        this.workingHrsTxn.Maps.forEach(a => {
            if (a.EmployeeShiftMapId > 0) {
                a.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
            }
            else if (a.EmployeeShiftMapId == 0) {
                a.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            }
        });
    }

    Save() {
          let CheckIsValid = true;
          for (var index = 0; index < this.currentEmpWH.Shifts.length; index++) {
            if (!this.currentEmpWH.Shifts[index].IsDefault) {
                for (var i in this.currentEmpWH.Shifts[index].ShiftValidator.controls) {
                    this.currentEmpWH.Shifts[index].ShiftValidator.controls[i].markAsDirty();
                    this.currentEmpWH.Shifts[index].ShiftValidator.controls[i].updateValueAndValidity();
                }
                if (this.currentEmpWH.Shifts[index].IsValidCheck(undefined, undefined) == false) {
                    CheckIsValid = false;
                }
            }
        }
        if (CheckIsValid) {
            this.processingData();
            let shiftIsValid = true;
            for (var i in this.workingHrsTxn.Shifts) {
                //check the shift validation only when current shift is active
                if (this.workingHrsTxn.Shifts[i].IsActive) {
                    var sTime = moment(this.workingHrsTxn.Shifts[i].StartTime, 'HH:mm');
                    var eTime = moment(this.workingHrsTxn.Shifts[i].EndTime, 'HH:mm');
                    // it is case when shift start on some date and ends on next date... therefore we add 1 day to endTime
                    if (sTime.isAfter(eTime)) {
                        eTime.add(1, 'd');
                    }
                    //this loop will check every alloted shift to the employee for over-lapping shift
                    for (var j in this.workingHrsTxn.Shifts) {
                        //if condition will prevent same shift to get compare with itself and will prevent compareing with not-active shifts
                        if (i < j && this.workingHrsTxn.Shifts[j].IsActive) {
                            var start = moment(this.workingHrsTxn.Shifts[j].StartTime, 'HH:mm');
                            var end = moment(this.workingHrsTxn.Shifts[j].EndTime, 'HH:mm');
                            if (start.isBetween(sTime, eTime))
                                shiftIsValid = false;
                            if (end.isBetween(sTime, eTime))
                                shiftIsValid = false;
                        }
                    }
                }
            }
            if (shiftIsValid) {
                this.schBLservice.EmpWorkingHours(this.workingHrsTxn)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ['Employee working hours updated.']);
                            this.CallBackAddUpdate(res)
                            this.currentEmpWH = new ManageWorkingHoursVM();
                        }
                        else {
                            this.msgBoxServ.showMessage("failed", ["Something Wrong, check logs for details."]);
                            console.log(res.ErrorMessage);
                        }
                    },
                    err => {
                        this.msgBoxServ.showMessage("error", ["Something Wrong, check logs for details."]);
                        console.log(err.ErrorMessage);
                    });
            }
            else {
                this.msgBoxServ.showMessage('error', ["Assigned shifts are invalid, one or more shifts are over-lapping each other."])
            }
        }
        else {
            this.msgBoxServ.showMessage('error', ["one or more data are not appropriate."])
        }
    }

    CallBackAddUpdate(res) {
        if (res.Status == "OK") {
            this.getEmpWHList();
            this.changeDetector.detectChanges();
            this.showEmpWHUpdatePage = false;
            this.selectedEmpWH = null;
            this.workingHrsTxn = new WorkingHoursTxnVM();
        }
        else {
            this.msgBoxServ.showMessage("error", ['some error ' + res.ErrorMessage]);
        }
    }
    //close edit manage working hours popup
    Close() {
        this.currentEmpWH = new ManageWorkingHoursVM();
        this.selectedEmpWH = null;
        this.showEmpWHUpdatePage = false;
        this.index = null;

    }
    //loads list of default shifts & show default shifts popup
    ShowDefaultShifts() {
        this.showDefaultShiftsPopUp = false;
        this.changeDetector.detectChanges();
        this.schBLservice.GetDefaultShifts()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.defaultShiftsList = res.Results;
                    this.defaultShiftsList.forEach(a => a.IsSelected = false);
                    this.showDefaultShiftsPopUp = true;
                }
                else {
                    this.msgBoxServ.showMessage("Failed ! ", res.ErrorMessage);
                    console.log(res.ErrorMessage)
                }
            });
    }
    //assign shift to selected shift
    //AssignShift(shft: ShiftsMasterModel) {
    //    this.selectedShifts.push(shft);
    //}


    //adding selected shift to Emplpoyee working hrs list
    SelectDefShift() {
        if (this.defaultShiftsList.length > 0) {
            this.defaultShiftsList.forEach(a => {
                if (a.IsSelected) {
                    let temp = new ShiftsMasterModel();
                    temp = Object.assign(temp, a);
                    temp.ShiftValidator.disable();
                    this.currentEmpWH.Shifts.push(temp);
                }
            });
            this.ClosePopUp();
        }
        else {
            this.msgBoxServ.showMessage("failed", ["Select Shift"]);
        }
    }
    //closing default shifts popup 
    ClosePopUp() {
        this.selectedShifts = new Array<ShiftsMasterModel>();
        this.showDefaultShiftsPopUp = false;
    }

    AddEmpWorkingHrs() {
        this.getEmployeeList();
        this.showEmpWHUpdatePage = true;
        this.update = false;
        this.index = null;
    }
    //gets employee list who has no shift.
    getEmployeeList() {
        this.schBLservice.GetEmployeeNoShift()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.empNoShiftList = res.Results;
                }
            });
    }

    loadEmployee() {
        this.currentEmpWH = new ManageWorkingHoursVM();
        this.currentEmpWH.EmployeeId = this.empNoShiftList[this.index].EmployeeId;
        this.currentEmpWH.EmployeeName = this.empNoShiftList[this.index].EmployeeName;
        this.currentEmpWH.NoOfShifts = 0;
        this.currentEmpWH.Shifts = [];
        this.currentEmpWH.TotalWorkingHrs = 0;
        //this.AddShift();
    }

    myListFormatter(data: any): string {
        let html = data["EmployeeName"];
        return html;
    }

    AddNewShift() {
        this.showAddShiftPopUp = false;
        this.changeDetector.detectChanges();
        this.showAddShiftPopUp = true;
    }

    OnNewShiftAdd($event) {
        this.showAddShiftPopUp = false;
        let shift: ShiftsMasterModel = $event.shift;
        shift.IsSelected = true;
        this.defaultShiftsList.push(shift);
    }
}
