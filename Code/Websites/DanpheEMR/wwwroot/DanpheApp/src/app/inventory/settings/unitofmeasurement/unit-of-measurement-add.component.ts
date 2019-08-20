import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { UnitOfMeasurementModel } from '../shared/unit-of-measurement.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";
import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

@Component({
    selector: 'unitofmeasurement-add',
    templateUrl: './unit-of-measurement-add.html'

})
export class UnitOfMeasurementAddComponent {
    public showAddPage: boolean = false;
    @Input("selectedUnitOfMeasurement")
    public selectedUnitOfMeasurement: UnitOfMeasurementModel;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public update: boolean = false;

    public CurrentUnitOfMeasurement: UnitOfMeasurementModel;
    public completeunitofmeasurementlist: Array<UnitOfMeasurementModel> = new Array<UnitOfMeasurementModel>();
    public unitofmeasurementlist: Array<UnitOfMeasurementModel> = new Array<UnitOfMeasurementModel>();
    
    constructor(public invSettingBL: InventorySettingBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {

    }
    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        if (this.selectedUnitOfMeasurement) {
            this.update = true;
            this.CurrentUnitOfMeasurement = Object.assign(this.CurrentUnitOfMeasurement, this.selectedUnitOfMeasurement);
            this.CurrentUnitOfMeasurement.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.unitofmeasurementlist = this.unitofmeasurementlist.filter(unitofmeasurement => (unitofmeasurement.UOMId != this.selectedUnitOfMeasurement.UOMId));
        }
        else {
            this.CurrentUnitOfMeasurement = new UnitOfMeasurementModel();
            this.CurrentUnitOfMeasurement.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.update = false;
        }
    }
    
    //adding new department
    AddUnitOfMeasurement() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentUnitOfMeasurement.UnitOfMeasurementValidator.controls) {
            this.CurrentUnitOfMeasurement.UnitOfMeasurementValidator.controls[i].markAsDirty();
            this.CurrentUnitOfMeasurement.UnitOfMeasurementValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentUnitOfMeasurement.IsValidCheck(undefined, undefined)) {
            this.invSettingBL.AddUnitOfMeasurement(this.CurrentUnitOfMeasurement)
                .subscribe(
                res => {
                    this.showMessageBox("success", "UnitOfMeasurement Added");
                    this.CurrentUnitOfMeasurement = new UnitOfMeasurementModel();
                    this.CallBackAddUnitOfMeasurement(res)
                },
                err => {
                    this.logError(err);
                });
        }
    }
    //adding new department
    Update() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentUnitOfMeasurement.UnitOfMeasurementValidator.controls) {
            this.CurrentUnitOfMeasurement.UnitOfMeasurementValidator.controls[i].markAsDirty();
            this.CurrentUnitOfMeasurement.UnitOfMeasurementValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentUnitOfMeasurement.IsValidCheck(undefined, undefined)) {
            this.invSettingBL.UpdateUnitOfMeasurement(this.CurrentUnitOfMeasurement)
                .subscribe(
                res => {
                    this.showMessageBox("success", "UnitOfMeasurement Updated");
                    this.CurrentUnitOfMeasurement = new UnitOfMeasurementModel();
                    this.CallBackAddUnitOfMeasurement(res)

                },
                err => {
                    this.logError(err);
                });
        }
    }

    Close() {
        this.selectedUnitOfMeasurement = null;
        this.update = false;
        this.unitofmeasurementlist = this.completeunitofmeasurementlist;
        this.showAddPage = false;
    }

    //after adding Vendor is succesfully added  then this function is called.
    CallBackAddUnitOfMeasurement(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ unitofmeasurement: res.Results });



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