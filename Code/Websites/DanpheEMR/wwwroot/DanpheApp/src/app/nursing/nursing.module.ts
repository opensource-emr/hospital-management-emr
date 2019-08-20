import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { NursingOrderComponent } from "./order/nursing-order.component";
import { NursingOrderListComponent } from "./order/nursing-order-list.component";

import { NursingOutPatientComponent } from "./department/nursing-outpatient.component";
import { NursingInPatientComponent } from "./department/nursing-inpatient.component";
import { NephrologyComponent } from "./department/nephrology.component";
import { NursingIpBillItemRequestComponent } from './ward-billing/nursing-ip-billitem-request.component';
import { NursingMainComponent } from "./nursing-main.component"
import { NursingRoutingModule } from "./nursing-routing.module";
import { NursingBLService } from "./shared/nursing.bl.service"
import { NursingDLService } from "./shared/nursing.dl.service"

import { BillingBLService } from '../billing/shared/billing.bl.service';
import { BillingDLService } from '../billing/shared/billing.dl.service';
import { OrdersBLService } from "../orders/shared/orders.bl.service"
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { PatientsBLService } from '../patients/shared/patients.bl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { AdmissionDLService } from '../admission/shared/admission.dl.service';

import { SharedModule } from "../shared/shared.module";
import { NursingOrderMainComponent } from "./order/nursing-order-main.component";
import { NursingWardBillingComponent } from './ward-billing/nursing-ward-billing.component';
import { LabsBLService } from '../labs/shared/labs.bl.service';
//import { DrugsRequestComponent } from "./drugs-request/drugs-request.component";
import { PharmacyBLService } from '../pharmacy/shared/pharmacy.bl.service';
import { PharmacyDLService } from '../pharmacy/shared/pharmacy.dl.service';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { DrugRequestListComponent } from './drugs-request/drug-request-list.component';
import { PharmacyService } from '../pharmacy/shared/pharmacy.service';

@NgModule({
    providers: [
        NursingBLService,
        NursingDLService,
        BillingBLService,
        VisitDLService,
        BillingDLService,
        OrdersBLService,
        PatientsDLService,
        AppointmentDLService,
        AdmissionDLService,
        PatientsBLService,
        LabsBLService,
        PharmacyService,
        PharmacyBLService,
        PharmacyDLService
    ],
    imports: [ReactiveFormsModule,
        FormsModule,
        CommonModule,
      //  Ng2AutoCompleteModule,
        NursingRoutingModule,
        SharedModule,
        DanpheAutoCompleteModule
    ],
    declarations: [
        NursingMainComponent,
        NursingOrderMainComponent,
        NursingOrderComponent,
        NursingOrderListComponent,
        NursingOutPatientComponent,
        NursingInPatientComponent,
        NursingWardBillingComponent,
        //DrugsRequestComponent,
        DrugRequestListComponent,
        NursingIpBillItemRequestComponent,
        NephrologyComponent
    ],
    bootstrap: [NursingMainComponent]
})
export class NursingModule { }
