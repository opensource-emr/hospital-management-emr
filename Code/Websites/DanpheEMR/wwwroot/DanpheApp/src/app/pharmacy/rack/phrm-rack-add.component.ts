import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { PhrmRackModel } from '../shared/rack/phrm-rack.model';

import { SecurityService } from '../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { PhrmRackService } from "../shared/rack/phrm-rack.service";


@Component({
    selector: "phrm-rack-add",
    templateUrl: "./phrm-rack-add.html",
})
export class PhrmRackAddComponent {

    @Input("selected-rack")
    public CurrentRack: PhrmRackModel;
    public ParentRackList: any;
    public showAddPage: boolean = false;

    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public phrmRackService: PhrmRackService, public securityService: SecurityService,
        public msgBoxServ: MessageboxService) {
        this.GetParentList();
    }

    @Input('showAddPage')
    public set ShowAdd(_showAdd) {
        this.showAddPage = _showAdd;
        if (this.showAddPage) {
            if (this.CurrentRack && this.CurrentRack.RackId) {
                let rack = new PhrmRackModel();
                this.CurrentRack = Object.assign(rack, this.CurrentRack);
            }
            else {
                this.CurrentRack = new PhrmRackModel();
            }
        }

    }
    GetParentList() {
        this.phrmRackService.GetParentRackList()
            .subscribe(res => {
                this.ParentRackList = res;
            });
    }


    //adding new rack
    AddRack() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentRack.RackValidator.controls) {
            this.CurrentRack.RackValidator.controls[i].markAsDirty();
            this.CurrentRack.RackValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentRack.IsValidCheck(undefined, undefined)) {
            this.phrmRackService.AddRack(this.CurrentRack)
                .subscribe(
                    res => {
                        this.showMessageBox("success", "Rack Added");
                        this.CurrentRack = new PhrmRackModel();
                        this.callbackAdd.emit({ 'newRack': res });
                    },
                    err => {
                        this.logError(err);
                    });
        }
    }

    //updating rack
    UpdateRack() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentRack.RackValidator.controls) {
            this.CurrentRack.RackValidator.controls[i].markAsDirty();
            this.CurrentRack.RackValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentRack.IsValidCheck(undefined, undefined)) {
            this.phrmRackService.UpdateRack(this.CurrentRack.RackId, this.CurrentRack)
                .subscribe(
                    res => {
                        this.showMessageBox("success", "Rack Updated");
                        this.showAddPage = false;
                        //this.CurrentRack = new PhrmRackModel();
                        this.callbackAdd.emit({ 'newRack': res });
                    },
                    err => {
                        this.logError(err);
                    });
        }
    }

    Close() {
        this.showAddPage = false;
    }

    showMessageBox(status: string, message: string) {
        this.msgBoxServ.showMessage(status, [message]);
    }

    logError(err: any) {
        console.log(err);
    }

}