import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { RadiologyMainComponent } from "./radiology-main.component";
//import { ImagingRequisitionComponent } from "./imaging/imaging-requisition-component";
import { ImagingRequisitionListComponent } from "./requisition-list/imaging-requisition-list.component";
import { ImagingResultComponent } from "./imaging/imaging-result.component";
import { ImagingReportsListComponent } from "./reports-list/imaging-reports-list.component";

//used to deactivate the radiology request and report view section until a patient is selected
import { SelectVisitCanActivateGuard } from '../shared/select-visit-canactivate-guard';
import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { Rad_InpatientListComponent } from './ward-billing/rad-ip-list.component';
import {RadiologyWardBillingComponent} from './ward-billing/rad-wardbilling.component'
@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: RadiologyMainComponent,canActivate: [AuthGuardService] , canDeactivate: [ResetPatientcontextGuard],
                children: [
                    { path: '', redirectTo: 'ImagingRequisitionList', pathMatch: 'full' },
                    { path: 'ImagingRequisitionList', component: ImagingRequisitionListComponent,canActivate: [AuthGuardService]  },
                    { path: 'ImagingReportsList', component: ImagingReportsListComponent,canActivate: [AuthGuardService]  },
                    { path: 'InpatientList', component: Rad_InpatientListComponent },
                    {path:'WardBilling',component:RadiologyWardBillingComponent},
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class RadiologyRoutingModule { }
