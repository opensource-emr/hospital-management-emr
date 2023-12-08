import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { PHRMPrescription } from "../../pharmacy/shared/phrm-prescription.model";
import * as _ from 'lodash';


@Injectable()
export class OrdersDLService {
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    public optionsJson = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    constructor(public http: HttpClient,
    ) {
    }


    public PostPharmacyPrescription(prescription: PHRMPrescription) {

        let tempPrescription = _.omit(prescription, ['PHRMPrescriptionValidator']);
        let tempPrescriptionItems = tempPrescription.PHRMPrescriptionItems.map(item => {
            return _.omit(item, ['PHRMPrescriptionItemsValidator', 'ItemListByGeneric']);
        });
        // let tempPrescriptionItemWithOutValidator = tempPrescriptionItems.map(item => {
        //     return _.omit(item, ['ItemListByGeneric']);
        // });
        // tempPrescriptionItems.
        tempPrescription.PHRMPrescriptionItems = tempPrescriptionItems;

        let data = JSON.stringify(tempPrescription);


        return this.http.post<DanpheHTTPResponse>(`/api/PharmacyPrescription/NewPrescription`, data, this.optionsJson);
    }

}