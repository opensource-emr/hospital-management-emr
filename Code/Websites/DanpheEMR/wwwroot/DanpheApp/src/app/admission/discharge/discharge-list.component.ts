import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { PatientService } from '../../patients/shared/patient.service';
import { AdmissionBLService } from '../shared/admission.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { Admission } from "../shared/admission.model";
import { DischargeSummary } from "../shared/discharge-summary.model";
import { PatientBedInfo } from "../shared/patient-bed-info.model";
import { SecurityService } from '../../security/shared/security.service';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { CoreService } from '../../core/shared/core.service';
import { ADTGridColumnSettings } from '../shared/adt-grid-column-settings';
import { DischargeCancel } from '../shared/dischage-cancel.model';
@Component({
    templateUrl: "../../view/admission-view/DischargedList.html" //  "/AdmissionView/DischargedList"
})

export class DischargedListComponent {
    public dischargedList: any[];
    dischargedListGridColumns: Array<any> = null;
    public admission: Admission = new Admission();
    public selectedDischarge: any;
    public selectedDischargeCancel : DischargeCancel = new DischargeCancel();
    public showDischargedList: boolean = true;
    public showDischargeSummary: boolean = false;
    public showSummaryView: boolean = false;
    public selectedIndex: number;
    public adtGriColumns: ADTGridColumnSettings = null;//sud: 10Jan'19-- to use parameterized grid-columns, we created separate class for ADT-Grid-Columns.
    public IsCancelDischargePage : boolean = false;

    constructor(
        public router: Router,
        public admissionBLService: AdmissionBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService,
        public coreService: CoreService) {

        this.GetDischargedPatientsList();

        this.adtGriColumns = new ADTGridColumnSettings(this.coreService);
        this.dischargedListGridColumns = this.adtGriColumns.DischargedList;

    }
    GetDischargedPatientsList(): void {
        this.admissionBLService.GetDischargedPatientsList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.dischargedList = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
                });
    }
    DischargedListGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "dischargeSummary": {
                this.selectedDischarge = null;
                this.changeDetector.detectChanges();
                this.selectedDischarge = $event.Data;
                this.showDischargedList = false;
                if (this.selectedDischarge.IsSubmitted)
                    this.showSummaryView = true;
                else
                    this.showDischargeSummary = true;
                break;
            }
            case "clear-due": {
                this.selectedDischarge = $event.Data;
                this.selectedIndex = $event.RowIndex;
                this.mapAdmission();
                this.ClearDue();
                break;
            }
            case "discharge-cancel": {
                this.selectedDischarge = $event.Data;
                this.selectedIndex = $event.RowIndex;
                this.IsCancelDischargePage = true;
                this.selectedDischargeCancel = new DischargeCancel();
                break;
            }
            default:
                break;
        }
    }

    mapAdmission() {
        _.assign(this.admission, _.pick(this.selectedDischarge, _.keys(this.admission)));
        this.admission.AdmissionDate = moment(this.selectedDischarge.AdmittedOn).format('YYYY-MM-DDTHH:mm');
        this.admission.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
    }
    ClearDue() {
        this.admissionBLService.CheckPatientCreditBillStatus(this.selectedDischarge.PatientVisitId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results) {
                        this.msgBoxServ.showMessage("failed", ["Clear the due before proceeding.Total Due=" + res.Results]);
                    }
                    //clear due
                    else {
                        this.admissionBLService.ClearDue(this.admission.PatientVisitId)
                            .subscribe(res => {
                                if (res.Status == "OK") {
                                    this.msgBoxServ.showMessage("success", ["Cleared Patient due"]);
                                    this.dischargedList[this.selectedIndex].BillStatusOnDischarge = "paid";
                                    this.dischargedList = this.dischargedList.slice();
                                }
                                else {
                                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                                }
                            },
                                err => {
                                    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
                                });
                    }

                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to get credit details.. please check log for details.']);
                    this.logError(err.ErrorMessage);
                });


    }
    HideDischargeSummary() {
        this.showDischargeSummary = false;
        this.showSummaryView = false;
        this.GetDischargedPatientsList();
        this.showDischargedList = true;
    }
    logError(err: any) {
        console.log(err);
    }
    CancelDischarge(){
        this.selectedDischargeCancel.PatientVisitId = this.selectedDischarge.PatientVisitId;
        this.selectedDischargeCancel.PatientAdmissionId = this.selectedDischarge.PatientAdmissionId;
        this.selectedDischargeCancel.DischargedDate = this.selectedDischarge.DischargedDate;
        this.selectedDischargeCancel.DischargedBy = this.selectedDischarge.DischargedBy;

        for (var i in this.selectedDischargeCancel.DischargeCancelValidator.controls) {
            this.selectedDischargeCancel.DischargeCancelValidator.controls[i].markAsDirty();
            this.selectedDischargeCancel.DischargeCancelValidator.controls[i].updateValueAndValidity();
        }
        if (this.selectedDischargeCancel.IsValidCheck(undefined, undefined)) {
            this.selectedDischargeCancel.CreatedOn = moment().format("YYYY-MM-DD");
            this.admissionBLService.PostDischargeCancelBill(this.selectedDischargeCancel)
            .subscribe(res => {
            if (res.Status == 'OK') {
                this.msgBoxServ.showMessage("Success", ["Discharged of Patient is cancelled Successfully.."]);
                this.IsCancelDischargePage = false;
                this.router.navigate(['/Billing/InpatBilling']);
            }
            else {
                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            }
            },
            err => {
                this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
            });
        }
        else{
            this.msgBoxServ.showMessage("error", ["Enter Cancel Reason."]);
        }
    }
    Close(){
        this.IsCancelDischargePage =false;
        this.selectedDischarge = null;
        this.selectedDischargeCancel = new DischargeCancel();
    }
}
