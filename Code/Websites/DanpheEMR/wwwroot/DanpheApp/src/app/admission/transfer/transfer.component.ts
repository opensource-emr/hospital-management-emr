
import { Component, Directive, ViewChild } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core";

import { AdmissionBLService } from '../shared/admission.bl.service';
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { PatientBedInfo } from '../shared/patient-bed-info.model';
import { Bed } from '../shared/bed.model';
import { Ward } from '../shared/ward.model';
import { BedFeature } from '../shared/bedfeature.model';
import { CommonFunctions } from '../../shared/common.functions';
import * as moment from 'moment/moment';
import { NepaliDate } from "../../shared/calendar/np/nepali-dates";
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { Department } from '../../settings/shared/department.model';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { Patient } from '../../patients/shared/patient.model';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';
import { Number, Object } from 'core-js';
import { element } from '@angular/core/src/render3';

@Component({
    selector: "danphe-bed-transfer",
    templateUrl: "./transfer.html"
})
export class TransferComponent {
    public showTransferPage: boolean = false;
    @Input("selectedBedInfo")
    public selectedBedInfo: { PatientAdmissionId, PatientId, PatientVisitId, MSIPAddressInfo, PatientCode, Name, BedInformation: { BedId, PatientBedInfoId, Ward, BedFeature, BedCode, BedNumber, BedFeatureId, AdmittedDate, StartedOn } };


    @Output("transfer")
    transfer: EventEmitter<Object> = new EventEmitter<Object>();

    @Output("notify-adt")
    notifyAdt: EventEmitter<boolean> = new EventEmitter<boolean>();

    public newTransferDate: PatientBedInfo = new PatientBedInfo();
    public newBedInfo: PatientBedInfo = new PatientBedInfo();
    public bedChargeBilTxnItem: BillingTransactionItem = new BillingTransactionItem();
    public bedChargeItemInfo: any;
    public existingBedFeatures: Array<any> = [];
    public selectedPatBedInfo: any
    public wardList: Array<Ward> = new Array<Ward>();

    public bedFeatureList: Array<BedFeature> = new Array<BedFeature>();
    public bedList: Array<Bed> = new Array<Bed>();
   
    public validDate: boolean = true;
    public loading: boolean;
    public disableBedType: boolean = true;
    public disableBed: boolean = true;

    public transferDateNep: NepaliDate;

    public allDepartments: Array<any> = [];
    public selectedReqDept: any = null;//added yub 26th sept 2018

    public departmentlist: Department = new Department();
    public showAdmissionHistory: boolean = false;
    constructor(public admissionBLService: AdmissionBLService,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService,
        public npCalendarService: NepaliCalendarService) {
        this.LoadDepartments();
    
    }
 
    @Input("showTransferPage")
    public set value(val: boolean) {
        this.showTransferPage = val;
        this.selectedReqDept = null;

        if (val) {
            this.GetWards();
            this.LoadBedBilTxnItem()
            this.validDate = true;
            this.newBedInfo = new PatientBedInfo();
            this.newBedInfo.PatientId = this.selectedBedInfo.PatientId;
            this.newBedInfo.PatientVisitId = this.selectedBedInfo.PatientVisitId;
            this.newBedInfo.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.newBedInfo.StartedOn = moment().format('YYYY-MM-DDTHH:mm:ss');
            this.selectedBedInfo.BedInformation.StartedOn = moment(this.selectedBedInfo.BedInformation.StartedOn).format('YYYY-MM-DD HH:mm:ss');
            this.selectedReqDept = null;
            this.showAdmissionHistory = true;
            
        }
    }

    //public SetItemProperties() {
    //    var dept = this.allDepartments.find(dept => Number(dept.DepartmentId) == Number(this.newBedInfo.RequestingDeptId));
    //    if (dept) {
    //        this.selectedReqDept = dept;
    //    }
    //}
    //GetAdmittedPatBedInfo($event)
    //{
    //    var selectedPatBedInfo = Object.create($event.Data);
    //    this.selectedBedInfo = selectedPatBedInfo;
    //}

    public compareDate() {
        if ((moment(this.newBedInfo.StartedOn).diff(this.selectedBedInfo.BedInformation.StartedOn) < 0)
            || (moment(this.newBedInfo.StartedOn).diff(moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm')) > 0)
            || !this.newBedInfo.StartedOn)
            this.validDate = false;
        else
            this.validDate = true;
    }
    public GetWards() {
        this.admissionBLService.GetWards()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.wardList = res.Results;
                    }
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
                });
    }
    public WardChanged(wardId: number) {
        if (wardId) {
            this.disableBedType = false;
            this.newBedInfo.BedFeatureId = null;
            this.bedList = null;
            this.newBedInfo.BedPrice = null;
            this.bedFeatureList=null;
            this.admissionBLService.GetWardBedFeatures(wardId)
                .subscribe(res => {
                    if (res.Status == 'OK') {
                        if (res.Results.length) {
                            this.bedFeatureList = res.Results;
                        }
                    }
                });
        }
    }
    GetPatientWardInfo(PatVisitId: number) {
        this.admissionBLService.GetAdmittedPatientInfo(PatVisitId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.newTransferDate = res.Results;
                        this.selectedBedInfo.BedInformation.StartedOn = this.newTransferDate[0].StartedOn;

                    }
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
                });
    }
 



    public GetAvailableBeds(wardId: number, bedFeatureId: number) {
        if (bedFeatureId && wardId) {
            var selectedFeature = this.bedFeatureList.find(a => a.BedFeatureId == bedFeatureId);
            this.newBedInfo.BedPrice = selectedFeature.BedPrice;
            this.disableBed = false;
            this.admissionBLService.GetAvailableBeds(wardId, bedFeatureId)
                .subscribe(res => {
                    if (res.Status == 'OK') {
                        if (res.Results.availableBeds.length) {
                            this.bedList = res.Results.availableBeds;
                            this.InitializeBedBillItem(res.Results.BedbillItm)
                        }
                        else {
                            this.msgBoxServ.showMessage("failed", ["No beds are available for this type."]);
                            this.newBedInfo.BedPrice = null;
                            this.bedList = null;
                            this.newBedInfo.BedId = 0;
                        }
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

    Transfer() {
        if (this.CheckSelectionFromAutoComplete()) {
            if (this.newBedInfo) {
                this.compareDate();
                for (var i in this.newBedInfo.PatientBedInfoValidator.controls) {
                    this.newBedInfo.PatientBedInfoValidator.controls[i].markAsDirty();
                    this.newBedInfo.PatientBedInfoValidator.controls[i].updateValueAndValidity();
                }
                if (this.newBedInfo.IsValidCheck(undefined, undefined) && this.validDate) {
                    this.InitializeBedBilItem();
                    this.loading = true;
                    this.admissionBLService.TransferBed(this.newBedInfo, this.selectedBedInfo.BedInformation.PatientBedInfoId, this.bedChargeBilTxnItem)
                        .subscribe(res => {
                            if (res.Status == 'OK') {
                                this.newBedInfo = new PatientBedInfo();
                                this.msgBoxServ.showMessage("success", ["Patient transfered to new bed."]);
                                this.transfer.emit({ newBedInfo: res.Results });
                                this.notifyAdt.emit(false);
                                this.loading = false;
                            }
                            else {
                                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                                this.loading = false;
                            }
                        },
                            err => {
                                this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
                                this.loading = false;
                            });
                }
            }
            else
                this.msgBoxServ.showMessage("failed", ["Select bed."]);

        }
    }

    UpgradeStartedDate($event) {
        this.GetPatientWardInfo(this.selectedBedInfo.PatientVisitId);
        console.log(this.selectedBedInfo);
    }
    public CheckSelectionFromAutoComplete(): boolean {
        if (this.newBedInfo.IsValidReqDepartment) {
            return true;
        }
        else {
            this.msgBoxServ.showMessage("failed", ["Invalid Request Department. Please select Department from the list."]);
            this.loading = false;
            return false;
        }
    }

    Close() {
        this.showTransferPage = false;
        this.notifyAdt.emit(false);
    }

    //convert nepali date to english date and assign to english calendar
    NepCalendarOnDateChange() {
        let engDate = this.npCalendarService.ConvertNepToEngDate(this.transferDateNep);
        this.newBedInfo.StartedOn = engDate;
    }
    //this method fire when english calendar date changed
    //convert english date to nepali date and assign to nepali canlendar
    EngCalendarOnDateChange() {
        if (this.newBedInfo.StartedOn) {
            let nepDate = this.npCalendarService.ConvertEngToNepDate(this.newBedInfo.StartedOn);
            this.transferDateNep = nepDate;
        }
    }


    //sud: 20Jun'18
    LoadDepartments() {
        this.admissionBLService.GetDepartments()
            .subscribe((res: DanpheHTTPResponse) => {
                this.allDepartments = res.Results;
            });
    }

    public InitializeBedBilItem() {
        let isPresent = false;
        this.bedChargeBilTxnItem = new BillingTransactionItem();
        for (var i = 0; i < this.existingBedFeatures.length; i++) {
          if (this.existingBedFeatures[i].BedFeatureId == this.newBedInfo.BedFeatureId) {
            this.newBedInfo.IsExistBedFeatureId = true;
            this.bedChargeBilTxnItem = null;
            isPresent = true;
            //break;
          }
        }
        if (!isPresent) {
            this.bedChargeBilTxnItem = this.bedChargeItemInfo;
        }

    }
    //load bedcharge item and loads bedfeatureId (against patientId and patientVisitId)
    public LoadBedBilTxnItem() {
        this.admissionBLService.GetBedChargeBilItem(this.selectedBedInfo.PatientId, this.selectedBedInfo.PatientVisitId)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    this.existingBedFeatures = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("error", ["unable to load existing bed features for selected Patient visit. " + res.ErrorMessage]);
                }
            });
    }

    public InitializeBedBillItem(bedData) {
        if (bedData != null) {
            let bilItm = new BillingTransactionItem();
            bilItm.PatientId = this.newBedInfo.PatientId;
            bilItm.PatientVisitId = this.newBedInfo.PatientVisitId;
            bilItm.ServiceDepartmentId = bedData.ServiceDepartmentId;
            bilItm.ServiceDepartmentName = bedData.ServiceDepartmentName;
            bilItm.ItemId = bedData.ItemId;
            bilItm.ItemName = bedData.ItemName;
            bilItm.Price = CommonFunctions.parseAmount(bedData.Price);
            bilItm.Quantity = 1;
            bilItm.SubTotal = CommonFunctions.parseAmount(bilItm.Price * bilItm.Quantity);
            bilItm.NonTaxableAmount = CommonFunctions.parseAmount(bilItm.SubTotal);
            bilItm.TotalAmount = CommonFunctions.parseAmount(bilItm.SubTotal);
            bilItm.BillStatus = "provisional";
            bilItm.CounterId = this.securityService.getLoggedInCounter().CounterId;
            bilItm.CounterDay = moment().format("YYYY-MM-DD");
            bilItm.BillingType = "inpatient";
            bilItm.ProcedureCode = bedData.ProcedureCode;
            bilItm.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            bilItm.VisitType = "inpatient";

            this.bedChargeItemInfo = bilItm;
        }
    }

    deptListFormatter(data: any): string {
        let html = data["DepartmentName"];
        return html;
    }

    public AssignSelectedDepartment() {
        let reqDeptObj = null;
        // check if user has given proper input string for department name 
        //or has selected object properly from the dropdown list.
        if (typeof (this.selectedReqDept) == 'string') {
            if (this.allDepartments && this.allDepartments.length && this.selectedReqDept)
                reqDeptObj = this.allDepartments.find(a => a.DepartmentName.toLowerCase() == this.selectedReqDept.toLowerCase());
        }
        else if (typeof (this.selectedReqDept) == 'object')
            reqDeptObj = this.selectedReqDept;
        //if selection of department from string or selecting object from the list is true
        //then assign proper department name
        if (reqDeptObj) {
            if (reqDeptObj.DepartmentId != this.newBedInfo.RequestingDeptId) {

                this.newBedInfo.RequestingDeptId = reqDeptObj.DepartmentId;
            }

            this.newBedInfo.IsValidReqDepartment = true;
        }
        //else raise an invalid flag
        else {
            //this.newBedInfo.FilteredItem = this.allDepartments;
            this.newBedInfo.IsValidReqDepartment = false;
        }
    }
}
