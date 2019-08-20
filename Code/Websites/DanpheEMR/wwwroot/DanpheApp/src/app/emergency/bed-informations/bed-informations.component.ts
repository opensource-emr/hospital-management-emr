import { Component, ChangeDetectorRef, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from '../../core/shared/core.service';
import { EmergencyPatientModel } from '../shared/emergency-patient.model';
import { CommonFunctions } from '../../shared/common.functions';
import { EmergencyBLService } from '../shared/emergency.bl.service';
import { EmergencyDLService } from '../shared/emergency.dl.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import * as moment from 'moment/moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BillingBLService } from '../../billing/shared/billing.bl.service';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';
import { InPatientLabTest } from '../../labs/shared/InpatientLabTest';
import { Patient } from '../../patients/shared/patient.model';
import { Visit } from '../../appointments/shared/visit.model';
import { PharmacyBLService } from '../../pharmacy/shared/pharmacy.bl.service';
import { PHRMDrugsOrderListModel } from '../../pharmacy/shared/pharmacy-drug-order-list.model';

@Component({
    templateUrl: './bed-informations.html'
})

// App Component class
export class BedInformationsComponent {
    public loading: boolean = false;

    public bedFeature: Array<any> = new Array<any>();
    public totaloccupid: any;
    public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
    constructor(public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService, public billingBLService: BillingBLService, public http: HttpClient,
        public emergencyBLService: EmergencyBLService, public coreService: CoreService) {
        this.LoadBedFeature();
    }

    // get bed feature summary
    LoadBedFeature(): void {
        this.http.get<any>("/api/Helpdesk?&reqType=getBedFeature").map(res => res).subscribe(res => {
            if (res.Status == "OK") {
                this.bedFeature = res.Results;
                this.totaloccupid = CommonFunctions.getGrandTotalData(this.bedFeature);
            }
            else {
                this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            }
        });
    }

  
}