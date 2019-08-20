import { Component, ChangeDetectorRef } from "@angular/core";

import PHRMGridColumns from '../shared/phrm-grid-columns';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../security/shared/security.service';
import { PHRMGenericModel } from '../shared/phrm-generic.model';
import * as moment from 'moment/moment';

@Component({
    templateUrl: "../../view/pharmacy-view/Setting/PHRMGenericManage.html" //"/PharmacyView/PHRMGenericManage"
})

export class PHRMGenericManageComponent {
    public genericGridColumns: Array<any> = null;
    public genericList: Array<PHRMGenericModel> = new Array<PHRMGenericModel>();
    public showGenericAddPage: boolean = false;
    public update: boolean = false;
    public currentGeneric: PHRMGenericModel = new PHRMGenericModel();
    public index: number;


    constructor(public pharmacyBLService: PharmacyBLService,public changeDetector: ChangeDetectorRef,
        public securityService: SecurityService,public msgBoxServ: MessageboxService) {
        this.genericGridColumns = PHRMGridColumns.GenericList;
        this.GetGenericList();
    }

    GetGenericList() {
        this.pharmacyBLService.GetGenericList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.genericList = res.Results;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                    console.log(res.ErrorMessage)
                }
            });
    }

    Add() {
        for (var i in this.currentGeneric.GenericValidator.controls) {
            this.currentGeneric.GenericValidator.controls[i].markAsDirty();
            this.currentGeneric.GenericValidator.controls[i].updateValueAndValidity();
        }

        if (this.currentGeneric.IsValidCheck(undefined, undefined)) {
            this.pharmacyBLService.AddGenericName(this.currentGeneric)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.msgBoxServ.showMessage("success", ["Generic Name"]);
                        this.CallBackAddToGrid(res);
                        this.currentGeneric = new PHRMGenericModel();                       
                    } else {
                        this.msgBoxServ.showMessage("failed", ["Sorry!! Generic Name Cannot be Added"]);
                    }
                });
        }
    }

    Update() {
        for (var i in this.currentGeneric.GenericValidator.controls) {
            this.currentGeneric.GenericValidator.controls[i].markAsDirty();
            this.currentGeneric.GenericValidator.controls[i].updateValueAndValidity();
        }

        if (this.currentGeneric.IsValidCheck(undefined, undefined)) {
            this.pharmacyBLService.UpdateGenericName(this.currentGeneric)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.msgBoxServ.showMessage("success", ["Generic Name is Updated"]);
                        this.CallBackAddToGrid(res);
                        this.currentGeneric = new PHRMGenericModel();                      
                    } else {
                        this.msgBoxServ.showMessage("failed", ["Sorry!! Generic Name Cannot be Updated"]);
                    }
                });
        }
    }

    CallBackAddToGrid(res) {
        if (this.update && this.index != null) {
            this.genericList.splice(this.index, 1, res.Results);
            this.update = false;
        } else {
            this.genericList.push(res.Results);
        }
        this.genericList = this.genericList.slice();
        this.changeDetector.detectChanges();       
        this.showGenericAddPage = false;
        this.index = null;
    }

    ShowAddNewPage() {
        this.currentGeneric = new PHRMGenericModel();
        this.showGenericAddPage = true;
        this.update = false;
        //this.changeDetector.detectChanges();
    }

    GenericGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.update = true;
                this.showGenericAddPage = true;
                this.currentGeneric = Object.assign(this.currentGeneric, $event.Data);
                this.index = this.genericList.findIndex(gn => gn.GenericId == $event.Data.GenericId);

                break;
            }
        }
    }

    Close() {
        this.showGenericAddPage = false;
        this.update = false;
    }

}