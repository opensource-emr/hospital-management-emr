
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { AdmissionBLService } from '../shared/admission.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../security/shared/security.service';
import { DischargeSummary } from '../shared/discharge-summary.model';
import { Admission } from '../shared/admission.model';
import { DischargeType } from '../shared/discharge-type.model';
import { Employee } from '../../employee/shared/employee.model';

import * as moment from 'moment/moment';
import * as _ from 'lodash';
@Component({
    selector: 'discharge-summary-add1', //ag7_mig_fix: selector name changed.
    templateUrl: './discharge-summary-add.html',
})
export class DischargeSummaryAddComponent {
    public CurrentDischargeSummary: DischargeSummary = new DischargeSummary();
    @Input("selectedDischarge")
    public selectedDischarge: any;

    public admission: Admission = new Admission();
    public dischargeTypeList: Array<DischargeType> = new Array<DischargeType>();
    public providerList: Array<Employee> = new Array<Employee>();
    public AnasthetistsList: Array<Employee> = new Array<Employee>();
    public labResults: any;
    public labRequests: any;
    public imagingResults: any;

    public update: boolean = false;
    public showSummaryView: boolean = false;
    public showDischargeSummary: boolean = false;
    public disablePrint: boolean = false;
    public showUnpaidPopupBox: boolean = false;//to display the Alert-Box when trying to discharge with pending bills.

    public consultant: any = null;
    public drIncharge: any = null;
    public anasthetists: any = null;
    public residenceDr: any = null;;

    constructor(public admissionBLService: AdmissionBLService,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        this.GetProviderList();
        this.GetDischargeType();
        this.GetAnasthetistsEmpList();
    }

    @Input("showDischargeSummary")
    public set value(val: boolean) {
        this.showDischargeSummary = val;
        if (this.selectedDischarge && this.showDischargeSummary) {
            this.GetImagingResults();
            this.GetLabRequests();
            this.GetDischargeSummary();
        }
    }

    public GetDischargeType() {
        this.admissionBLService.GetDischargeType()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.dischargeTypeList = res.Results;
                } else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ['Failed to get discharge type.. please check log for details.']);
                this.logError(err.ErrorMessage);
            });
    }
    public GetProviderList() {
        this.admissionBLService.GetProviderList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.providerList = res.Results;
                } else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ['Failed to get Doctors list.. please check log for details.']);
                this.logError(err.ErrorMessage);
            });
    }

    public GetAnasthetistsEmpList() {
        this.admissionBLService.GetAnasthetistsEmpList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.AnasthetistsList = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("error", ["Failed to get Anasthetist-Doctor list.. please check the log for details."]);
                    this.logError(res.ErrorMessage);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ['Failed to get Anasthetist-Doctors list.. please check log for details.']);
                this.logError(err.ErrorMessage);
            });
    }

    public GetLabResults() {
        this.admissionBLService.GetLabReportByVisitId(this.selectedDischarge.PatientVisitId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.labResults = res.Results;
                } else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
                this.logError(err.ErrorMessage);
            });
    }

    //Gets only the requests, Use Results once We implement the Labs-Module for data entry. -- sud: 9Aug'17
    public GetLabRequests() {
        this.admissionBLService.GetLabRequestsByPatientVisit(this.selectedDischarge.PatientId, this.selectedDischarge.PatientVisitId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.labRequests = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
                this.logError(err.ErrorMessage);
            });
    }

    public GetImagingResults() {
        this.admissionBLService.GetImagingReportsReportsByVisitId(this.selectedDischarge.PatientVisitId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length)
                        this.imagingResults = res.Results;
                } else {
                    this.msgBoxServ.showMessage("error", ["Failed to get Imaigng Results. Check log for detail"]);
                    this.logError(res.ErrorMessage);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ['Failed to get imaging results.. please check log for details.'], err.ErrorMessage);
            });
    }
    //for doctor's list
    myListFormatter(data: any): string {
        let html = data["FullName"];
        return html;
    }
    //for anaesthetist doctor's list
    ListFormatter(data: any): string {
        let html = data["FullName"];
        return html;
    }
    //below methods loadConsultant(),loadDrIncharge(),loadAnasthetists(),loadResidenceDr() will set the EmployeeId for respective drs
    loadConsultant() {
        this.CurrentDischargeSummary.ConsultantId = this.consultant ? this.consultant.EmployeeId : null;
    }

    loadDrIncharge() {
        this.CurrentDischargeSummary.DoctorInchargeId = this.drIncharge ? this.drIncharge.EmployeeId : null;
    }

    loadAnasthetists() {
        this.CurrentDischargeSummary.AnaesthetistsId = this.anasthetists ? this.anasthetists.EmployeeId : null;
    }

    loadResidenceDr() {
        this.CurrentDischargeSummary.ResidenceDrId = this.residenceDr ? this.residenceDr.EmployeeId : null;
    }

    //discharge summary
    GetDischargeSummary() {
        this.admissionBLService.GetDischargeSummary(this.selectedDischarge.PatientVisitId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results) {
                        this.CurrentDischargeSummary = new DischargeSummary();
                        this.CurrentDischargeSummary = Object.assign(this.CurrentDischargeSummary, res.Results.DischargeSummary);
                        this.consultant = res.Results.ConsultantName;
                        this.drIncharge = res.Results.DoctorInchargeName;
                        //when given doctor is not present we get drname string as '.  ' , so we check if name length is greater than 3 then only will show name of doctor
                        if (res.Results.Anaesthetists.length > 3) {
                            this.anasthetists = res.Results.Anaesthetists;
                        }
                        if (res.Results.ResidenceDrName.length > 3) {
                            this.residenceDr = res.Results.ResidenceDrName;
                        }
                        this.update = true;
                    }
                    else {
                        this.update = false;
                        this.CurrentDischargeSummary = new DischargeSummary();
                        this.CurrentDischargeSummary.PatientVisitId = this.selectedDischarge.PatientVisitId;
                        this.CurrentDischargeSummary.ConsultantId = this.selectedDischarge.AdmittingDoctorId;
                        this.CurrentDischargeSummary.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                        //default residence doctor will be current logged in user.
                        //Ashim: 15Dec2017 : RResidenceDr is not mandatory
                        //this.CurrentDischargeSummary.ResidenceDrId = this.securityService.GetLoggedInUser().EmployeeId;
                        this.CurrentDischargeSummary.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
                    }

                } else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ['Failed to get discharge summary.. please check log for details.']);
                this.logError(err.ErrorMessage);
            });
    }

    Save() {
        for (var i in this.CurrentDischargeSummary.DischargeSummaryValidator.controls) {
            this.CurrentDischargeSummary.DischargeSummaryValidator.controls[i].markAsDirty();
            this.CurrentDischargeSummary.DischargeSummaryValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentDischargeSummary.IsValidCheck(undefined, undefined)) {
            this.admissionBLService.PostDischargeSummary(this.CurrentDischargeSummary)
                .subscribe(
                res => {
                    if (res.Status == "OK") {
                        this.msgBoxServ.showMessage("success", ["Discharge Summary Saved"]);
                        this.update = true;
                        this.CallBackAddUpdate(res);
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ["Check log for errors"]);
                        this.logError(res.ErrorMessage);
                    }
                },
                err => {
                    this.logError(err);

                });
        }
    }

    Update() {
        for (var i in this.CurrentDischargeSummary.DischargeSummaryValidator.controls) {
            this.CurrentDischargeSummary.DischargeSummaryValidator.controls[i].markAsDirty();
            this.CurrentDischargeSummary.DischargeSummaryValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentDischargeSummary.IsValidCheck(undefined, undefined)) {
            this.CurrentDischargeSummary.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.CurrentDischargeSummary.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
            this.admissionBLService.UpdateDischargeSummary(this.CurrentDischargeSummary)
                .subscribe(
                res => {
                    if (res.Status == "OK") {
                        this.msgBoxServ.showMessage("success", ["Discharge Summary Updated"]);
                        this.CallBackAddUpdate(res);
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ["Check log for errors"]);
                        this.logError(res.ErrorMessage);
                    }
                },
                err => {
                    this.logError(err);
                });
        }
    }
    CallBackAddUpdate(dischargeSummary: DischargeSummary) {
        this.CurrentDischargeSummary = Object.assign(this.CurrentDischargeSummary, dischargeSummary);
    }
    SubmitAndViewSummary() {
        var view: boolean;
        view = window.confirm("You won't be able to make further changes. Do you want to continue?");
        if (view) {
            this.CurrentDischargeSummary.IsSubmitted = true;
            this.Update();
            this.showDischargeSummary = false;
            this.showSummaryView = true;
        }

    }

    logError(err: any) {
        console.log(err);
    }
}