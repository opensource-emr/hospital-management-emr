import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { RadiologyRoutingModule } from './radiology-routing.module';
import { SelectVisitCanActivateGuard } from '../shared/select-visit-canactivate-guard';

import { RadiologyMainComponent } from './radiology-main.component';
import { ImagingRequisitionListComponent } from "./requisition-list/imaging-requisition-list.component";
import { ImagingResultComponent } from './imaging/imaging-result.component';

import { ImagingBLService } from './shared/imaging.bl.service';
import { ImagingDLService } from './shared/imaging.dl.service';
import { BillingDLService } from '../billing/shared/billing.dl.service';
//import { RadiologyService } from './shared/radiology-service';
import { SharedModule } from "../shared/shared.module";
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
//import { ViewReportComponent } from './shared/report/view-report.component';
//import { PostReportComponent } from './shared/report/post-report.component';

import { ImagingReportsListComponent } from "./reports-list/imaging-reports-list.component";
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { Rad_InpatientListComponent } from './ward-billing/rad-ip-list.component';
import { RadiologyWardBillingComponent } from './ward-billing/rad-wardbilling.component';
import { AdmissionDLService } from '../admission/shared/admission.dl.service';
import { AdmissionBLService } from '../admission/shared/admission.bl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';

@NgModule({
    providers: [SelectVisitCanActivateGuard,
        ImagingBLService,
        ImagingDLService,
        BillingDLService,
        PatientsDLService,
        VisitDLService,
        AdmissionBLService,
        AdmissionDLService,
        AppointmentDLService
        ],
    imports: [RadiologyRoutingModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        SharedModule,
        //Ng2AutoCompleteModule,
        DanpheAutoCompleteModule
    ],
    declarations: [RadiologyMainComponent,
        //ImagingRequisitionComponent,
        ImagingRequisitionListComponent,
        ImagingResultComponent,
       // ViewReportComponent,
        //PostReportComponent,
        ImagingReportsListComponent,
        Rad_InpatientListComponent,
        RadiologyWardBillingComponent
    ],
    bootstrap: []
})
export class RadiologyModule { }

