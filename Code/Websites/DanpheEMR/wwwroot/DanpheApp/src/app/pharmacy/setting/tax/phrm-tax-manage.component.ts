import { ChangeDetectorRef, Component } from "@angular/core";

import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import PHRMGridColumns from '../../shared/phrm-grid-columns';

import * as moment from 'moment/moment';
import { SecurityService } from '../../../security/shared/security.service';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { PHRMTAXModel } from "../../shared/phrm-tax.model";

@Component({
    templateUrl: "./phrm-tax-manage.html"

})
export class PHRMTAXManageComponent {
    public currentTAX: PHRMTAXModel = new PHRMTAXModel();
    public selectedTAX: PHRMTAXModel = new PHRMTAXModel();
    public taxList: Array<PHRMTAXModel> = new Array<PHRMTAXModel>();
    public taxGridColumns: Array<any> = null;
    public showTAXAddPage: boolean = false;
    public update: boolean = false;
    public index: number;

    constructor(
        public pharmacyBLService: PharmacyBLService,
        public changeDetector: ChangeDetectorRef,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService) {
        this.taxGridColumns = PHRMGridColumns.PHRMTAXList;
        this.getTAXList();
    }
    public getTAXList() {
        this.pharmacyBLService.GetTAXList()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == ENUM_DanpheHTTPResponses.OK) {
                    this.taxList = res.Results;
                }
                else {
                    alert(ENUM_MessageBox_Status.Failed + res.ErrorMessage);
                    console.log(res.ErrorMessage);
                }
            });
    }
    TAXGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.selectedTAX = null;
                this.update = true;
                this.index = $event.RowIndex;
                this.showTAXAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedTAX = $event.Data;
                this.currentTAX.TAXId = this.selectedTAX.TAXId;
                this.currentTAX.TAXName = this.selectedTAX.TAXName;
                this.currentTAX.TAXPercentage = this.selectedTAX.TAXPercentage;
                this.currentTAX.Description = this.selectedTAX.Description;
                this.showTAXAddPage = true;

                break;
            }
            default:
                break;
        }
    }
    AddTAX() {
        this.showTAXAddPage = false;
        this.changeDetector.detectChanges();
        this.showTAXAddPage = true;
        this.setFocusById('tax');
    }
    Add() {
        for (var i in this.currentTAX.TAXValidator.controls) {
            this.currentTAX.TAXValidator.controls[i].markAsDirty();
            this.currentTAX.TAXValidator.controls[i].updateValueAndValidity();
        }
        if (this.currentTAX.IsValidCheck(undefined, undefined)) {
            this.currentTAX.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.currentTAX.CreatedOn = moment().format('YYYY-MM-DD');
            this.pharmacyBLService.AddTAX(this.currentTAX)
                .subscribe(
                    (res: DanpheHTTPResponse) => {
                        if (res.Status == ENUM_DanpheHTTPResponses.OK) {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["TAX Details Added."]);
                            this.CallBackAddUpdate(res);
                            this.currentTAX = new PHRMTAXModel();
                        }
                        else {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Something Wrong " + res.ErrorMessage]);
                        }
                    },
                    err => {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Something Wrong " + err.ErrorMessage]);
                    }
                );
        }
    }
    Update() {
        for (var i in this.currentTAX.TAXValidator.controls) {
            this.currentTAX.TAXValidator.controls[i].markAsDirty();
            this.currentTAX.TAXValidator.controls[i].updateValueAndValidity();
        }
        if (this.currentTAX.IsValidCheck(undefined, undefined)) {
            this.currentTAX.CreatedOn = moment().format('YYYY-MM-DD');
            this.pharmacyBLService.UpdateTAX(this.currentTAX)
                .subscribe(
                    (res: DanpheHTTPResponse) => {
                        if (res.Status == ENUM_DanpheHTTPResponses.OK) {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['TAX Details Updated.']);
                            this.CallBackAddUpdate(res)
                            this.currentTAX = new PHRMTAXModel();
                        }
                        else {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + res.ErrorMessage]);
                        }
                    },
                    err => {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + err.ErrorMessage]);
                    });
        }
    }
    CallBackAddUpdate(res) {
        if (res.Status == "OK") {
            var tax: any = {};
            tax.TAXId = res.Results.TAXId;
            tax.TAXName = res.Results.TAXName;
            tax.TAXPercentage = res.Results.TAXPercentage;
            tax.Description = res.Results.Description;
            this.CallBackAdd(tax);
        }
        else {
            this.msgBoxServ.showMessage("error", ['some error ' + res.ErrorMessage]);
        }
    }
    CallBackAdd(tax: PHRMTAXModel) {
        this.taxList.push(tax);
        if (this.index != null)
            this.taxList.splice(this.index, 1);
        this.taxList = this.taxList.slice();
        this.changeDetector.detectChanges();
        this.showTAXAddPage = false;
        this.selectedTAX = null;
        this.index = null;
    }
    Close() {
        this.currentTAX = new PHRMTAXModel();
        this.selectedTAX = null;
        this.update = false;
        this.showTAXAddPage = false;
    }
    setFocusById(IdToBeFocused) {
        window.setTimeout(function () {
            document.getElementById(IdToBeFocused).focus();
        }, 20);
    }
}