import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { SchedulingBLService } from '../shared/scheduling.bl.service';
import { ShiftsMasterModel } from '../shared/shifts-master.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../security/shared/security.service';
import * as moment from 'moment/moment';

@Component({
    selector: 'shift-add',
    templateUrl: "../../view/scheduling-view/Setting/ShiftsMaster.html" //  "/SchedulingView/ShiftsManage"
})
export class ShiftsManageComponent {
    public currentShifts: ShiftsMasterModel = new ShiftsMasterModel();
    public selectedShifts: ShiftsMasterModel = new ShiftsMasterModel();
    public shiftsList: Array<ShiftsMasterModel> = new Array<ShiftsMasterModel>();
    public shiftsGridColumns: Array<any> = null;
    @Input("showAddShiftPage")
    public showShiftsAddPage: boolean = false;
    public update: boolean = false;
    public index: number;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(
        public schBLservice: SchedulingBLService,
        public msgBoxServ: MessageboxService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef) {
        this.shiftsGridColumns = GridColumnSettings.ShiftsMasterList;
        this.getShiftsList();
    }

    public getShiftsList() {
        this.schBLservice.GetShiftsList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.shiftsList = res.Results;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                    console.log(res.ErrorMessage)
                }
            });
    }

    ShiftsGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.selectedShifts = null;
                this.update = true;
                this.index = $event.RowIndex;
                this.showShiftsAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedShifts = $event.Data;
                this.currentShifts.ShiftId = this.selectedShifts.ShiftId;
                this.currentShifts.ShiftName = this.selectedShifts.ShiftName;
                this.currentShifts.StartTime = this.selectedShifts.StartTime;
                this.currentShifts.EndTime = this.selectedShifts.EndTime;
                this.currentShifts.TotalHrs = this.selectedShifts.TotalHrs;
                this.currentShifts.IsDefault = this.selectedShifts.IsDefault;
                this.showShiftsAddPage = true;

                break;
            }
            default:
                break;
        }
    }

    CalculationForTotalHrs() {
        if (this.currentShifts.StartTime != null && this.currentShifts.EndTime != null) {
            let start = moment(this.currentShifts.StartTime, "HH:mm a");
            let end = moment(this.currentShifts.EndTime, "HH:mm a");
            var duration = moment.duration(end.diff(start));
            var hours = parseFloat(duration.asHours().toFixed(2));
            if (hours >= 0) {
                this.currentShifts.TotalHrs = hours;
            }
            else {
                let hrs = parseFloat((hours + 24).toFixed(2))
                this.currentShifts.TotalHrs = hrs;
            }
        }
    }
    AddShifts() {
        this.showShiftsAddPage = false;
        this.changeDetector.detectChanges();
        this.showShiftsAddPage = true;
    }

    Add() {
        for (var i in this.currentShifts.ShiftValidator.controls) {
            this.currentShifts.ShiftValidator.controls[i].markAsDirty();
            this.currentShifts.ShiftValidator.controls[i].updateValueAndValidity();
        }
        if (this.currentShifts.IsValidCheck(undefined, undefined)) {
            this.currentShifts.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.schBLservice.AddShift(this.currentShifts)
                .subscribe(
                res => {
                    if (res.Status == "OK") {
                        this.msgBoxServ.showMessage("success", ["Shift Added."]);
                        this.CallBackAddUpdate(res)
                        this.currentShifts = new ShiftsMasterModel();
                    }
                    else {
                        this.msgBoxServ.showMessage("error", ["Something Wrong" + res.ErrorMessage]);
                    }
                },
                err => {
                    this.msgBoxServ.showMessage("error", ["Something Wrong" + err.ErrorMessage]);
                });
        }
    }

    Update() {
        for (var i in this.currentShifts.ShiftValidator.controls) {
            this.currentShifts.ShiftValidator.controls[i].markAsDirty();
            this.currentShifts.ShiftValidator.controls[i].updateValueAndValidity();
        }
        if (this.currentShifts.IsValidCheck(undefined, undefined)) {
            this.currentShifts.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.schBLservice.UpdateShift(this.currentShifts)
                .subscribe(
                res => {
                    if (res.Status == "OK") {
                        this.msgBoxServ.showMessage("success", ['Shift Details Updated.']);
                        this.CallBackAddUpdate(res)
                        this.currentShifts = new ShiftsMasterModel();
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ["Something Wrong " + res.ErrorMessage]);
                    }
                },
                err => {
                    this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
                });
        }
    }

    CallBackAddUpdate(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ shift: res.Results });
            var shift: any = {};
            shift.ShiftId = res.Results.ShiftId;
            shift.ShiftName = res.Results.ShiftName;
            shift.StartTime = res.Results.StartTime;
            shift.EndTime = res.Results.EndTime;
            shift.CreatedBy = res.Results.CreatedBy;
            shift.CreatedOn = res.Results.CreatedOn;
            shift.TotalHrs = res.Results.TotalHrs;
            shift.IsDefault = res.Results.IsDefault;
            this.CallBackAdd(shift);
        }
        else {
            this.msgBoxServ.showMessage("error", ['some error ' + res.ErrorMessage]);
        }
    }

    CallBackAdd(compny: ShiftsMasterModel) {
        this.shiftsList.push(compny);
        if (this.index != null)
            this.shiftsList.splice(this.index, 1);
        this.shiftsList = this.shiftsList.slice();
        this.changeDetector.detectChanges();
        this.showShiftsAddPage = false;
        this.selectedShifts = null;
        this.index = null;
        this.update = false;
    }

    Close() {
        this.currentShifts = new ShiftsMasterModel();
        this.selectedShifts = null;
        this.update = false;
        this.showShiftsAddPage = false;
    }

}