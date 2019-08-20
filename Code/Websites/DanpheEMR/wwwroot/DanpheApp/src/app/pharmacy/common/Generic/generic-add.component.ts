import { Component, ChangeDetectorRef } from "@angular/core";

import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../../security/shared/security.service';
import { PHRMGenericModel } from '../../shared/phrm-generic.model';
import * as moment from 'moment/moment';

@Component({
    templateUrl:"./generic-add.html"
   // templateUrl:"../../view/pharmacy-view/PHRMGenericManage.html" // "/PharmacyView/PHRMGenericManage"
})

export class PHRMGenericAddComponent {
    public showGenericAddPage: boolean = false;
    public update: boolean = false;
    public currentGeneric: PHRMGenericModel = new PHRMGenericModel();
    public index: number;


    constructor(public pharmacyBLService: PharmacyBLService, public changeDetector: ChangeDetectorRef,
        public securityService: SecurityService, public msgBoxServ: MessageboxService) {
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
                        this.currentGeneric = new PHRMGenericModel();
                    } else {
                        this.msgBoxServ.showMessage("failed", ["Sorry!! Generic Name Cannot be Added"]);
                    }
                });
        }
    }



    ShowAddNewPage() {
        this.currentGeneric = new PHRMGenericModel();
        this.showGenericAddPage = true;
        this.update = false;
        //this.changeDetector.detectChanges();
    }


    Close() {
        this.showGenericAddPage = false;
        this.update = false;
    }

}