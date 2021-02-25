import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Injectable, Directive } from '@angular/core';
import { LabTest } from "../../labs/shared/lab-test.model";
import { ImagingItem } from "../../radiology/shared/imaging-item.model";
import { ImagingType } from "../../radiology/shared/imaging-type.model";
import { PHRMPrescriptionItem } from "../../pharmacy/shared/phrm-prescription-item.model";
import * as _ from 'lodash';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { PHRMItemMasterModel } from '../../pharmacy/shared/phrm-item-master.model';
import { OrderItemsVM } from './orders-vms';
import { LabTestRequisition } from '../../labs/shared/lab-requisition.model';
import { ImagingItemRequisition } from '../../radiology/shared/imaging-item-requisition.model';
import { MedicationPrescription } from '../../clinical/shared/medication-prescription.model';
import { PHRMGenericModel } from '../../pharmacy/shared/phrm-generic.model';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';
import { BillItemPrice } from '../../billing/shared/billitem-price.model';

@Injectable()
export class OrderService {
  

    constructor(public http: HttpClient) {
    }

  


    //start: After Merging All types of orders into one: sud--10June'18
    public allImagingItems: Array<ImagingItem> = [];
    public allMedicationItems: Array<PHRMItemMasterModel> = [];
    public allGenericItems: Array<PHRMGenericModel> = [];

    public allOtherItems: Array<BillItemPrice> = [];

    public allLabtests: Array<LabTest> = new Array<LabTest>();
    public allNewOrderItems: Array<OrderItemsVM> = [];
    public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
  
     //move this to OrdersBL/OrdersDL Services later on.
    public LoadAllLabTests() {
        //call server function only if allLabTests is null/undefined or empty
        if (!this.allLabtests || this.allLabtests.length == 0) {
            this.http.get<any>("/api/Lab?reqType=allLabTests", this.options)
                .map(res => { return res })
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status == "OK") {
                        //this.allLabTests = res.Results;
                        this.allLabtests = res.Results;
                    }
                    else {
                        alert("couldn't load lab test.. remove this alert later.. ")
                    }

                });
        }
    }

    public LoadAllImagingItems() {
        //call server function only if allLabTests is null/undefined or empty
        if (!this.allImagingItems || this.allImagingItems.length == 0) {
            this.http.get<any>("/api/Radiology?reqType=allImagingItems", this.options)
                .map(res => { return res })
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status == "OK") {
                        this.allImagingItems = res.Results;
                    }
                    else {
                        alert("couldn't load lab test.. ")
                    }

                });
        }
    }

    public LoadAllMedications() {
        if (!this.allMedicationItems || this.allMedicationItems.length == 0) {

            this.http.get<any>('/api/Pharmacy?reqType=item', this.options)
                .map(res => res)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status == "OK") {
                        this.allMedicationItems = res.Results;
                    }
                });
        }
    }


    
    public LoadAllGenericItems() {
        if (!this.allGenericItems || this.allGenericItems.length == 0) {

            this.http.get<any>('/api/Pharmacy?reqType=getGenericList', this.options)
                .map(res => res)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status == "OK") {
                        this.allGenericItems = res.Results;
                    }
                });
        }
    }

    public LoadAllOtherItems() {
        if (!this.allOtherItems || this.allOtherItems.length == 0) {

            this.http.get<any>('/api/Orders?reqType=otherItems', this.options)
                .map(res => res)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status == "OK") {
                        this.allOtherItems = res.Results;
                    }
                });
        }
    }


    //end: After Merging All types of orders into one: sud--10June'18

}


