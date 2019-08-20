import { Injectable } from '@angular/core';
import { CanDeactivate, CanActivate } from '@angular/router';
import { OrderService } from './shared/order.service';
import { LabTest } from "./../labs/shared/lab-test.model";
import { ImagingItem } from "./../radiology/shared/imaging-item.model";
import { ImagingType } from "./../radiology/shared/imaging-type.model";
import { PHRMPrescriptionItem } from "./../pharmacy/shared/phrm-prescription-item.model";

@Injectable()
export class ResetOrdersGuard<T> implements CanActivate{
    constructor(public ordServ: OrderService) {

    }    
    canActivate() {
        //this.ordServ.allLabtests = new Array<LabTest>();
        //this.ordServ.labTests = new Array<LabTest>();
        //this.ordServ.imagingItems = new Array<ImagingItem>();
        //this.ordServ.labTestPreference = new Array<LabTest>();
        //this.ordServ.imagingItemPreference = new Array<ImagingItem>();
        //this.ordServ.medicationPreference = [];
        //this.ordServ.medicationList = [];
        return true;
    }
}