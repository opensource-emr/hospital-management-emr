
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { Department } from '../shared/department.model';
import { SettingsBLService } from '../shared/settings.bl.service';

import { SecurityService } from '../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from "../../core/shared/core.service";


@Component({
    selector: "department-add",
    templateUrl: "./department-add.html"

})
export class DepartmentAddComponent {

    public showAddPage: boolean = false;
    @Input("selectedDepartment")
    public selectedDepartment: Department;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public update: boolean = false;

    public CurrentDepartment: Department;

    //public showmsgbox: boolean = false;
    //public status: string = null;
    //public message: string = null;
    public completeDeptList: Array<Department> = new Array<Department>();
    public deptList: Array<Department> = new Array<Department>();

    constructor(public settingsBLService: SettingsBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService,
        public coreService: CoreService) {
        this.GetDepartments();
    }
    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        if (this.selectedDepartment) {
            this.update = true;
            this.CurrentDepartment = Object.assign(this.CurrentDepartment, this.selectedDepartment);
            this.CurrentDepartment.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.deptList = this.deptList.filter(dept => (dept.DepartmentId != this.selectedDepartment.DepartmentId));
        }
        else {
            this.CurrentDepartment = new Department();
            this.CurrentDepartment.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.update = false;
        }
    }


    public GetDepartments() {
        this.settingsBLService.GetDepartments()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.deptList = res.Results;
                        this.deptList.forEach(dept => {
                            //needs review to get parent department name
                            this.deptList.forEach(parDept => {
                                if (dept.ParentDepartmentId == parDept.DepartmentId)
                                    dept.ParentDepartmentName = parDept.DepartmentName;
                            });
                        });
                        this.completeDeptList = this.deptList;
                    }
                }
                else {
                    this.showMessageBox("error", "Check log for error message.");
                    this.logError(res.ErrorMessage);
                }
            },
                err => {
                    this.showMessageBox("error", "Failed to get wards. Check log for error message.");
                    this.logError(err.ErrorMessage);
                });
    }

    //adding new department
    AddDepartment() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentDepartment.DepartmentValidator.controls) {
            this.CurrentDepartment.DepartmentValidator.controls[i].markAsDirty();
            this.CurrentDepartment.DepartmentValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentDepartment.IsValidCheck(undefined, undefined)) {
            this.settingsBLService.AddDepartment(this.CurrentDepartment)
                .subscribe(
                    res => {
                        this.showMessageBox("success", "Department Added");
                        this.CurrentDepartment = new Department();
                        this.CallBackAddDepartment(res)
                    },
                    err => {
                        this.logError(err);
                    });
        }
    }
    //adding new department
    Update() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentDepartment.DepartmentValidator.controls) {
            this.CurrentDepartment.DepartmentValidator.controls[i].markAsDirty();
            this.CurrentDepartment.DepartmentValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentDepartment.IsValidCheck(undefined, undefined)) {
            this.settingsBLService.UpdateDepartment(this.CurrentDepartment)
                .subscribe(
                    res => {
                        if (res.Status == "OK" && res.Results) {
                            let dept = this.coreService.Masters.Departments.find(dept => dept.DepartmentId == res.Results.DepartmentId);
                            if (dept) {
                                dept = Object.assign(dept, res.Results)
                            }
                            this.showMessageBox("success", "Department Updated");
                            this.CurrentDepartment = new Department();
                            this.CallBackAddDepartment(res)
                        }
                    },
                    err => {
                        this.logError(err);
                    });
        }
    }

    Close() {
        this.selectedDepartment = null;
        this.update = false;
        this.deptList = this.completeDeptList;
        this.showAddPage = false;
    }

    //after adding department is succesfully added  then this function is called.
    CallBackAddDepartment(res) {
        if (res.Status == "OK") {
            for (let dept of this.completeDeptList) {
                if (dept.DepartmentId == res.Results.ParentDepartmentId) {
                    res.Results.ParentDepartmentName = dept.DepartmentName;
                    break;
                }
            };
            this.coreService.Masters.Departments.push(res.Results);
            res.Results.ParentDepartmentName =
                this.callbackAdd.emit({ department: res.Results });
        }
        else {
            this.showMessageBox("error", "Check log for details");
            console.log(res.ErrorMessage);
        }
    }
    showMessageBox(status: string, message: string) {
        this.msgBoxServ.showMessage(status, [message]);
    }

    logError(err: any) {
        console.log(err);
    }



}