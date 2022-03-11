import { Component, ChangeDetectorRef, EventEmitter, Input, Output, Renderer2 } from "@angular/core";

import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { PHRMUnitOfMeasurementModel } from "../../shared/phrm-unit-of-measurement.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';

@Component({
    selector: "uom-item-add",
    templateUrl: "./phrm-uom-manage.html"

})
export class PHRMUnitOfMeasurementManageComponent {
    public CurrentUnitOfMeasurement: PHRMUnitOfMeasurementModel = new PHRMUnitOfMeasurementModel();
    public selectedItem: PHRMUnitOfMeasurementModel = new PHRMUnitOfMeasurementModel();
    public unitofmeasurementList: Array<PHRMUnitOfMeasurementModel> = new Array<PHRMUnitOfMeasurementModel>();
    public unitofmeasurementGridColumns: Array<any> = null;
    public showUnitOfMeasurementList: boolean = true;
    public showUnitOfMeasurementAddPage: boolean = false;
    public update: boolean = false;
    public index: number;
    public globalListenFunc: Function;
    public ESCAPE_KEYCODE = 27;   //to close the window on click of ESCape.

    @Input("selectedUom")
    public selectedUom: PHRMUnitOfMeasurementModel;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    @Input("showAddPage")
    public set value(val: boolean) {
        this.showUnitOfMeasurementAddPage = val;
        this.setFocusById('uomname');
    }

    constructor(
        public pharmacyBLService: PharmacyBLService,
        public changeDetector: ChangeDetectorRef,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService,public renderer2:Renderer2) {
        this.unitofmeasurementGridColumns = PHRMGridColumns.PHRMUnitOfMeasurementList;
        this.getUnitOfMeasurementList();
    }

    ngOnInit() {
        this.globalListenFunc = this.renderer2.listen('document', 'keydown', e => {
            if (e.keyCode == this.ESCAPE_KEYCODE) {
                this.Close()
            }
        });
    }
    public getUnitOfMeasurementList() {
        this.pharmacyBLService.GetUnitOfMeasurementList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.unitofmeasurementList = res.Results;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                    console.log(res.ErrorMessage)
                }
            });
    }

    UnitOfMeasurementGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.selectedItem = null;
                this.update = true;
                this.index = $event.RowIndex;
                this.showUnitOfMeasurementAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedItem = $event.Data;
                this.CurrentUnitOfMeasurement.UOMId = this.selectedItem.UOMId;
                this.CurrentUnitOfMeasurement.UOMName = this.selectedItem.UOMName;
                this.CurrentUnitOfMeasurement.Description = this.selectedItem.Description;
                this.CurrentUnitOfMeasurement.IsActive = this.selectedItem.IsActive;
                this.showUnitOfMeasurementAddPage = true;

                break;
            }
            case "activateDeactivateIsActive": {
                if ($event.Data != null) {
                    this.selectedItem = null;
                    this.selectedItem = $event.Data;
                    this.ActivateDeactivateStatus(this.selectedItem);
                    this.selectedItem = null;
                }
                break;
            }
            default:
                break;
        }
    }

    AddUnitOfMeasurement() {
        this.showUnitOfMeasurementAddPage = false;
        this.changeDetector.detectChanges();
        this.showUnitOfMeasurementAddPage = true;
        this.setFocusById('uomname');
    }

    Add() {
        for (var i in this.CurrentUnitOfMeasurement.UnitOfMeasurementValidator.controls) {
            this.CurrentUnitOfMeasurement.UnitOfMeasurementValidator.controls[i].markAsDirty();
            this.CurrentUnitOfMeasurement.UnitOfMeasurementValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentUnitOfMeasurement.IsValidCheck(undefined, undefined)) {
            this.CurrentUnitOfMeasurement.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.pharmacyBLService.AddUnitOfMeasurement(this.CurrentUnitOfMeasurement)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ["Unit Of Measurement Added."]);
                            this.CallBackAddUpdate(res)
                            this.CurrentUnitOfMeasurement = new PHRMUnitOfMeasurementModel();
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
        for (var i in this.CurrentUnitOfMeasurement.UnitOfMeasurementValidator.controls) {
            this.CurrentUnitOfMeasurement.UnitOfMeasurementValidator.controls[i].markAsDirty();
            this.CurrentUnitOfMeasurement.UnitOfMeasurementValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentUnitOfMeasurement.IsValidCheck(undefined, undefined)) {
            this.pharmacyBLService.UpdateUnitOfMeasurement(this.CurrentUnitOfMeasurement)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ['Unit Of Measurement Details Updated.']);
                            this.CallBackAddUpdate(res)
                            this.CurrentUnitOfMeasurement = new PHRMUnitOfMeasurementModel();
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
            var uom: any = {};
            uom.UOMId = res.Results.UOMId;
            uom.UOMName = res.Results.UOMName;
            uom.Description = res.Results.Description;
            uom.IsActive = res.Results.IsActive;
            this.CallBackAdd(uom);
        }
        else {
            this.msgBoxServ.showMessage("error", ['some error ' + res.ErrorMessage]);
        }
    }

    CallBackAdd(uofm: PHRMUnitOfMeasurementModel) {
        if (this.index != null)
            this.unitofmeasurementList.splice(this.index, 1, uofm);
        else
            this.unitofmeasurementList.unshift(uofm);
        this.unitofmeasurementList = this.unitofmeasurementList.slice();
        this.changeDetector.detectChanges();
        this.showUnitOfMeasurementAddPage = false;
        this.selectedItem = null;
        this.index = null;
        this.AddUpdateResponseEmitter(uofm);
    }
    ActivateDeactivateStatus(currUOM: PHRMUnitOfMeasurementModel) {
        if (currUOM != null) {
            let status = currUOM.IsActive == true ? false : true;
            let msg = status == true ? 'Activate' : 'Deactivate';
            if (confirm("Are you Sure want to " + msg + ' ' + currUOM.UOMName + ' ?')) {
                currUOM.IsActive = status;
                this.pharmacyBLService.UpdateUnitOfMeasurement(currUOM)
                    .subscribe(
                        res => {
                            if (res.Status == "OK") {
                                let responseMessage = res.Results.IsActive ? "Unit of Measurement is now activated." : "Unit of Measurement is now Deactivated.";
                                this.msgBoxServ.showMessage("success", [responseMessage]);
                                this.getUnitOfMeasurementList();
                            }
                            else {
                                this.msgBoxServ.showMessage("error", ['Something wrong' + res.ErrorMessage]);
                            }
                        },
                        err => {
                            this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
                        });
            }
            //to refresh the checkbox if we cancel the prompt
            //this.getUnitOfMeasurementList();
        }
    }
    Close() {
        this.CurrentUnitOfMeasurement = new PHRMUnitOfMeasurementModel();
        this.selectedItem = null;
        this.update = false;
        this.showUnitOfMeasurementAddPage = false;
    }

    AddUpdateResponseEmitter(uom) {
        this.callbackAdd.emit({ uom: uom });
    }
    setFocusById(IdToBeFocused) {
        window.setTimeout(function () {
            document.getElementById(IdToBeFocused).focus();
        }, 20);
    }
}