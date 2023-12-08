import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "../../core/shared/core.service";
import { Department } from "../../settings-new/shared/department.model";
import { DanpheHTTPResponse } from '../../shared/common-models';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { AdmittingDocInfoVM } from '../shared/admission.view.model';
import { ADT_BLService } from '../shared/adt.bl.service';

import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
@Component({
    selector: "change-doctor",
    templateUrl: "./change-doctor.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class ChangeDoctorComponent implements OnInit {
    public newAdmittingInfo: AdmittingDocInfoVM;
    public departments: Array<Department>;
    public IsValidSelPerformer: boolean = true;
    public doctorList: any = [];
    public filteredDocList: Array<{ DepartmentId: number, DepartmentName: string, PerformerId: number, PerformerName: string }>;
    public selectedDoctor = { DepartmentId: 0, DepartmentName: "", PerformerId: 0, PerformerName: "" };
    public AdmittingDocValidator: FormGroup = null;
    public departmentId: number;
    constructor(
        public admissionBLService: ADT_BLService,
        public msgBoxServ: MessageboxService,
        public coreService: CoreService) {
        this.GetDepartments();
        this.GetDoctors();

    }
    ngOnInit() {
        this.newAdmittingInfo = new AdmittingDocInfoVM();
        this.SetValidators();
    }
    @Input("admittedPatientDrInfo")
    public admittedPatDrInfo: AdmittingDocInfoVM;


    @Output("changeDoc-close")
    closeChangeDocEmitter: EventEmitter<Object> = new EventEmitter<Object>();

    public ClosePopUp() {
        this.departmentId = null;
        this.selectedDoctor = null;
        this.closeChangeDocEmitter.emit();

    }
    GetDepartments() {
        this.departments = this.coreService.Masters.Departments;

    }

    myListFormatter(data: any): string {
        let html = data["PerformerName"];
        return html;
    }
    Update() {
        for (var i in this.AdmittingDocValidator.controls) {
            this.AdmittingDocValidator.controls[i].markAsDirty();
            this.AdmittingDocValidator.controls[i].updateValueAndValidity();
        }
        if (this.IsValid(undefined, undefined) && this.IsValidSelPerformer) {
            this.newAdmittingInfo.PatientVisitId = this.admittedPatDrInfo.PatientVisitId;
            this.admissionBLService.ChangeAdmittingDoc(this.newAdmittingInfo)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status == "OK") {
                        this.msgBoxServ.showMessage("success", ["Doctor changed successfully."]);
                        this.closeChangeDocEmitter.emit({ newAdmittingInfo: res.Results });
                        this.newAdmittingInfo = new AdmittingDocInfoVM();
                        this.departmentId = null;
                        this.selectedDoctor = null;
                    }
                    else {
                        this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                    }
                });
        }


    }
    public AssignSelectedDoctor() {
        let doctor = null;
        // check if user has given proper input string for item name
        //or has selected object properly from the dropdown list.
        //        this.emitDoctorDetail.emit({ "selectedDoctor": null });
        if (this.selectedDoctor && this.doctorList && this.doctorList.length) {
            if (typeof (this.selectedDoctor) == 'string') {
                doctor = this.doctorList.find(a => a.PerformerName.toLowerCase() == String(this.selectedDoctor).toLowerCase());
            }
            else if (typeof (this.selectedDoctor) == 'object' && this.selectedDoctor.PerformerId)
                doctor = this.doctorList.find(a => a.PerformerId == this.selectedDoctor.PerformerId);
            if (doctor) {
                //to filter doctor List after department is changed (flow: assigning department by selecting doctor).
                this.departmentId = doctor.DepartmentId;
                this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);
                this.selectedDoctor = Object.assign(this.selectedDoctor, doctor);
                this.newAdmittingInfo.AdmittingDoctorId = doctor.PerformerId;//this will give providerid
                this.newAdmittingInfo.AdmittingDoctorName = doctor.PerformerName;
                this.IsValidSelPerformer = true;
                // this.emitDoctorDetail.emit({ "selectedDoctor": this.selectedDoctor });
            }
            else
                this.IsValidSelPerformer = false;
        }
    }
    FilterDoctorList() {
        if (typeof (this.selectedDoctor) == 'object') {
            this.selectedDoctor.PerformerName = "";
            this.selectedDoctor.PerformerId = 0;
        }
        if (this.departmentId && Number(this.departmentId) != 0) {
            this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);
            if (this.filteredDocList) {
                this.newAdmittingInfo.DepartmentId = this.filteredDocList[0].DepartmentId;
                this.newAdmittingInfo.Department = this.filteredDocList[0].DepartmentName;
            }
        }
        else
            this.filteredDocList = this.doctorList;
    }

    GetDoctors() {
        this.admissionBLService.GetAppointmentApplicableDoctorsInfo()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.filteredDocList = this.doctorList = res.Results;
                    this.AssignSelectedDoctor();
                }
                else {
                    this.msgBoxServ.showMessage("failed", ["Not able to load doctor's list."]);
                    console.log(res.ErrorMessage);
                }
            });
    }
    public SetValidators() {
        var _formBuilder = new FormBuilder();
        this.AdmittingDocValidator = _formBuilder.group({
            'Doctor': ['', Validators.compose([Validators.required])]
        });
    }
    public IsDirty(controlname): boolean {
        if (controlname == undefined) {
            return this.AdmittingDocValidator.dirty;
        }
        else {
            return this.AdmittingDocValidator.controls[controlname].dirty;
        }
    }

    public IsValid(controlname, typeofvalidation): boolean {
        if (this.AdmittingDocValidator.valid) {
            return true;
        }
        if (controlname == undefined) {
            return this.AdmittingDocValidator.valid;
        }
        else {
            return !(this.AdmittingDocValidator.controls[controlname].hasError(typeofvalidation));
        }
    }

    public hotkeys(event) {
        if (event.keyCode == 27) {
            this.ClosePopUp();
        }
    }


}
