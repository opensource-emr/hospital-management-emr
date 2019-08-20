import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";

import { NursingMainComponent } from "./nursing-main.component";
import { NursingOrderComponent } from "./order/nursing-order.component";
import { NursingOrderListComponent } from "./order/nursing-order-list.component";
import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';
import { NursingOutPatientComponent } from "./department/nursing-outpatient.component";
import { NursingInPatientComponent } from "./department/nursing-inpatient.component";
import { NephrologyComponent } from "./department/nephrology.component";
import { SelectVisitCanActivateGuard } from '../shared/select-visit-canactivate-guard';

import { PatientOverviewComponent } from "../doctors/patient/patient-overview.component";
import { NursingWardBillingComponent } from './ward-billing/nursing-ward-billing.component';

import { DrugsRequestComponent } from "./drugs-request/drugs-request.component";
import { DrugRequestListComponent } from './drugs-request/drug-request-list.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                //reset patient and visit service when route leaves out of nursing module.
                component: NursingMainComponent,canActivate: [AuthGuardService] , canDeactivate: [ResetPatientcontextGuard],
                children: [
                    { path: '', redirectTo: 'OutPatient', pathMatch: 'full' },
                    { path: 'OutPatient', component: NursingOutPatientComponent,canActivate: [AuthGuardService]  },
                    { path: 'InPatient', component: NursingInPatientComponent,canActivate: [AuthGuardService]  },
                    { path: 'WardBilling', component: NursingWardBillingComponent},
                    { path: 'RequisitionList', component: DrugRequestListComponent },                   
                    { path: 'Clinical', loadChildren: '../clinical/clinical.module#ClinicalModule' },
                    { path: 'PatientOverview', component: PatientOverviewComponent},
                    { path: 'DrugsRequest', component: DrugsRequestComponent },
                    { path: 'Nephrology', component: NephrologyComponent }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class NursingRoutingModule {

}
