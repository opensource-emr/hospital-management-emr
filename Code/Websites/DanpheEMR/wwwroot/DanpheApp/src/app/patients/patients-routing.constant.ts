import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CanDeactivate } from '@angular/router';

import { PatientsMainComponent } from './patients-main.component';
import { PatientRegistrationMainComponent } from './registration/patient-registration-main.component';
import { GuarantorComponent } from './registration/guarantor.component';
import { InsuranceInfoComponent } from './registration/insurance-info.component';
import { KinEmergencyContactComponent } from './registration/kin-emergency-contact.component';
import { AddressComponent } from './registration/address.component';
import { PatientComponent } from './registration/patient.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { PatientDeactivateGuard } from './shared/patient-deactivate-guard';
import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';
import { PatientsDashboardComponent } from "../dashboards/patients/patients-dashboard.component";
import { PatientProfilePicComponent } from './registration/profile-pic.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';


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
                    { path: 'BasicInfo', component: PatientComponent,canActivate: [AuthGuardService]  },
                    { path: 'Address', component: AddressComponent,canActivate: [AuthGuardService] , canDeactivate: [PatientDeactivateGuard] },
                    { path: 'Guarantor', component: GuarantorComponent,canActivate: [AuthGuardService] , canDeactivate: [PatientDeactivateGuard] },
                    { path: 'Insurance', component: InsuranceInfoComponent,canActivate: [AuthGuardService] , canDeactivate: [PatientDeactivateGuard] },
                    { path: 'KinEmergencyContact', component: KinEmergencyContactComponent,canActivate: [AuthGuardService] , canDeactivate: [PatientDeactivateGuard] },
                    { path: "ProfilePic", component: PatientProfilePicComponent }
                ]
            },

        ]
    }
];


