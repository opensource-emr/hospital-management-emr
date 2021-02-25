import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CanDeactivate } from '@angular/router';


import { PatientDeactivateGuard } from './shared/patient-deactivate-guard';
import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';
import { PatientsDashboardComponent } from "../dashboards/patients/patients-dashboard.component";

import { AuthGuardService } from '../security/shared/auth-guard.service';



import { PatientListComponent } from './patient-list/patient-list.component';
import { PatientsMainComponent } from './patients-main.component';
import { PatientRegistrationMainComponent } from './registration/patient-registration-main.component';
import { PatientBasicInfoComponent } from './registration/basic-info/patient-basic-info.component';
import { AddressComponent } from './registration/address/address.component';
import { GuarantorComponent } from './registration/guarantor/guarantor.component';
import { InsuranceInfoComponent } from './registration/insurance/insurance-info.component';
import { KinEmergencyContactComponent } from './registration/kin/kin-emergency-contact.component';
import { PatientProfilePicComponent } from './profile-pic/profile-pic.component';
import { PageNotFound } from '../404-error/404-not-found.component';



export const PatientsRoutingConstant = [
    {
        path: '',
        component: PatientsMainComponent,canActivate: [AuthGuardService] , canDeactivate: [ResetPatientcontextGuard],
        children: [
            { path: '', redirectTo: 'SearchPatient', pathMatch: 'full' },
            { path: 'Dashboard', component: PatientsDashboardComponent,canActivate: [AuthGuardService]  },
            { path: 'SearchPatient', component: PatientListComponent,canActivate: [AuthGuardService]  },
            {
                path: 'RegisterPatient', component: PatientRegistrationMainComponent,canActivate: [AuthGuardService] , canDeactivate: [ResetPatientcontextGuard],

                children: [
                    { path: '', redirectTo: 'BasicInfo', pathMatch: 'full' },
                    { path: 'BasicInfo', component: PatientBasicInfoComponent,canActivate: [AuthGuardService]  },
                    { path: 'Address', component: AddressComponent,canActivate: [AuthGuardService] , canDeactivate: [PatientDeactivateGuard] },
                    { path: 'Guarantor', component: GuarantorComponent,canActivate: [AuthGuardService] , canDeactivate: [PatientDeactivateGuard] },
                    { path: 'Insurance', component: InsuranceInfoComponent,canActivate: [AuthGuardService] , canDeactivate: [PatientDeactivateGuard] },
                    { path: 'KinEmergencyContact', component: KinEmergencyContactComponent,canActivate: [AuthGuardService] , canDeactivate: [PatientDeactivateGuard] },
                    { path: "ProfilePic", component: PatientProfilePicComponent },
                    { path: "**", component: PageNotFound }

                ]
            },
            { path: "**", component: PageNotFound }

        ]
    },
    { path: "**", component: PageNotFound }
];


