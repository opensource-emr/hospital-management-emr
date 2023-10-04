import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule,HttpClientJsonpModule } from '@angular/common/http';

import { LabsBLService } from '../labs/shared/labs.bl.service';
import { LabsDLService } from '../labs/shared/labs.dl.service';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { OrderMainComponent } from './orders-main.component';
import { OrderRequisitionsComponent } from './order/order-requisition.component';
import { MedicationPrescriptionComponent } from "../clinical/medications/medication-prescription.component";

import { OrdersRoutingModule } from './orders-routing.module';

import { BillingBLService } from '../billing/shared/billing.bl.service';
import { BillingDLService } from '../billing/shared/billing.dl.service';
import { ImagingBLService } from '../radiology/shared/imaging.bl.service';
import { ImagingDLService } from '../radiology/shared/imaging.dl.service';
import { ClinicalDLService } from '../clinical/shared/clinical.dl.service';
import { MedicationBLService } from '../clinical/shared/medication.bl.service';

import { OrderService } from '../orders/shared/order.service';
//import { ImagingOrderService } from '../orders/shared/order.service';

import { SharedModule } from "../shared/shared.module";
import { PrintMedicationsComponent } from './order/print-order';
import { OrdersBLService } from './shared/orders.bl.service';

@NgModule({
    providers: [OrderService,
        LabsBLService,
        LabsDLService,
        ImagingBLService,
        ImagingDLService,
        BillingBLService,
        BillingDLService,
        MedicationBLService,
        OrdersBLService,
        ClinicalDLService],
    imports: [ReactiveFormsModule,
        FormsModule,
        CommonModule,
        //Ng2AutoCompleteModule,
        DanpheAutoCompleteModule,
        OrdersRoutingModule,
        SharedModule,
        HttpClientModule, HttpClientJsonpModule
    ],
    declarations: [OrderMainComponent,
        OrderRequisitionsComponent,
        MedicationPrescriptionComponent,
        PrintMedicationsComponent
    ],
    bootstrap: []//do we need anything here ? <sudarshan:2jan2017>
})
export class OrdersModule { }
