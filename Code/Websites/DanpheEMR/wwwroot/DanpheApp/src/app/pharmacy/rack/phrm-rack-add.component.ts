import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { PhrmRackModel } from '../shared/rack/phrm-rack.model';

import { SecurityService } from '../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { PhrmRackService } from "../shared/rack/phrm-rack.service";
import { ENUM_StockLocations } from "../../shared/shared-enums";
import { Renderer2 } from "@angular/core";


@Component({
    selector: "phrm-rack-add",
    templateUrl: "./phrm-rack-add.html",
})
export class PhrmRackAddComponent {

    @Input("selected-rack")
    public CurrentRack: PhrmRackModel;
    public ParentRackList: any;
    public ParentRackListFiltered: any;
    public showAddPage: boolean = false;
    public globalListenFunc: Function;
    public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
    public LocationList;
    @Input("selectedLocation")
    public selectedLocation;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public phrmRackService: PhrmRackService, public securityService: SecurityService,
        public msgBoxServ: MessageboxService, public renderer2: Renderer2) {
        this.GetParentList();
        this.GetLocationList();
    }
    public GetLocationList() {
        this.LocationList = Object.keys(ENUM_StockLocations).filter(p => isNaN(p as any));
    }

    @Input('showAddPage')
    public set ShowAdd(_showAdd) {
        this.showAddPage = _showAdd;
        if (this.showAddPage) {
            if (this.CurrentRack && this.CurrentRack.RackId) {
                let rack = new PhrmRackModel();
                this.CurrentRack = Object.assign(rack, this.CurrentRack);
                this.ParentRackListFiltered = this.ParentRackList.filter(rack => rack.LocationId == this.CurrentRack.LocationId && rack.RackId != this.CurrentRack.RackId);

            }
            else {
                this.CurrentRack = new PhrmRackModel();
                this.ParentRackListFiltered = this.ParentRackList
                this.setFocusById('Rack');
            }
        }
    }
    ngOnInit() {
        this.globalListenFunc = this.renderer2.listen('document', 'keydown', e => {
            if (e.keyCode == this.ESCAPE_KEYCODE) {
                this.Close()
            }
        });
    }
    GetParentList() {
        this.phrmRackService.GetParentRackList()
            .subscribe(res => {
                this.ParentRackList = res;
                this.ParentRackListFiltered = res;
            });
    }



    //adding new rack
    AddRack() {
        this.CurrentRack.CreatedOn = new Date();
        this.CurrentRack.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
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

    LocationValue() {
        this.CurrentRack.LocationId = +this.selectedLocation + 1;
        //this.setFocusById('Rack');
        if (!this.CurrentRack.RackId) {
            this.setFocusById('save')
        }
        else {
            this.setFocusById('update');
        }
    }
    AssignLocationFromParent() {
        this.CurrentRack.ParentId = +this.CurrentRack.ParentId;
        this.CurrentRack.LocationId = this.ParentRackList.find(PR => PR.RackId == this.CurrentRack.ParentId).LocationId;
        this.selectedLocation = (this.CurrentRack.LocationId - 1).toString();
        this.setFocusById('description')
    }
    setFocusById(IdToBeFocused) {
        window.setTimeout(function () {
            document.getElementById(IdToBeFocused).focus();
        }, 20);
    }
}