import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { RadiologyMainComponent } from "./radiology-main.component";
import { ImagingRequisitionListComponent } from "./requisition-list/imaging-requisition-list.component";
import { ImagingReportsListComponent } from "./reports-list/imaging-reports-list.component";
import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { Rad_InpatientListComponent } from './ward-billing/rad-ip-list.component';
import { RadiologyWardBillingComponent } from './ward-billing/rad-wardbilling.component';
import { RadiologyEditDoctorsComponent } from './rad-edit-doctors/rad-edit-doctors.component';
import { PageNotFound } from '../404-error/404-not-found.component';


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
                    { path: 'WardBilling', component: RadiologyWardBillingComponent },
                    { path: 'EditDoctors', component: RadiologyEditDoctorsComponent },
                    { path: "**", component: PageNotFound }

                ]
            },
            { path: "**", component: PageNotFound }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class RadiologyRoutingModule { }
