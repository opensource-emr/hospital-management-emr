import { Component } from "@angular/core";
import { ADT_BLService } from '../shared/adt.bl.service';
import { Input, Output, EventEmitter, OnInit } from "@angular/core";
import { AdmittingDocInfoVM } from '../shared/admission.view.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { Department } from "../../settings-new/shared/department.model";
import { CoreService } from "../../core/shared/core.service";

import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
@Component({
    selector: "change-doctor",
    templateUrl: "./change-doctor.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class ChangeDoctorComponent implements OnInit {
    public newAdmittingInfo: AdmittingDocInfoVM;
    public departments: Array<Department>;
    public IsValidSelProvider: boolean = true;
    public doctorList: any = [];
    public filteredDocList: Array<{ DepartmentId: number, DepartmentName: string, ProviderId: number, ProviderName: string }>;
    public selectedDoctor = { DepartmentId: 0, DepartmentName: "", ProviderId: 0, ProviderName: "" };
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
        let html = data["ProviderName"];
        return html;
    }
    Update() {
        for (var i in this.AdmittingDocValidator.controls) {
            this.AdmittingDocValidator.controls[i].markAsDirty();
            this.AdmittingDocValidator.controls[i].updateValueAndValidity();
        }
        if (this.IsValid(undefined, undefined) && this.IsValidSelProvider) {
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
                doctor = this.doctorList.find(a => a.ProviderName.toLowerCase() == String(this.selectedDoctor).toLowerCase());
            }
            else if (typeof (this.selectedDoctor) == 'object' && this.selectedDoctor.ProviderId)
                doctor = this.doctorList.find(a => a.ProviderId == this.selectedDoctor.ProviderId);
            if (doctor) {
                //to filter doctor List after department is changed (flow: assigning department by selecting doctor).
                this.departmentId = doctor.DepartmentId;
                this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);
                this.selectedDoctor = Object.assign(this.selectedDoctor, doctor);
                this.newAdmittingInfo.AdmittingDoctorId = doctor.ProviderId;//this will give providerid
                this.newAdmittingInfo.AdmittingDoctorName = doctor.ProviderName;
                this.IsValidSelProvider = true;
                // this.emitDoctorDetail.emit({ "selectedDoctor": this.selectedDoctor });
            }
            else
                this.IsValidSelProvider = false;
        }
    }
    FilterDoctorList() {
        if (typeof (this.selectedDoctor) == 'object') {
            this.selectedDoctor.ProviderName = "";
            this.selectedDoctor.ProviderId = 0;
        }
        if (this.departmentId && Number(this.departmentId) != 0)
            this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);
        else
            this.filteredDocList = this.doctorList;
    }

    GetDoctors() {
        this.admissionBLService.GetAdmittingDoctor()
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
