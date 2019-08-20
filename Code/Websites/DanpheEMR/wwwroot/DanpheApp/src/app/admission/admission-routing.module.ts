
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdmissionComponent } from './admission.component';
import { AdtHomeComponent } from './adt-home.component';
import { AdmissionCreateComponent } from './admission/admission-create.component';
import { AdmissionSearchPatient } from './admission/admission-search-patient.component';
import { AdmittedListComponent } from './admission/admitted-list.component';
import { DischargedListComponent } from './discharge/discharge-list.component';
import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';
import { AdmissionSelectPatientCanActivateGuard } from './shared/admission-select-patient-canactivate-guard';
import { AuthGuardService } from '../security/shared/auth-guard.service';
@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AdmissionComponent ,
                children: [
                    { path: '', redirectTo: 'AdmissionSearchPatient', pathMatch: 'full' },
					{ path: 'AdtHome', component: AdtHomeComponent  },
                    { path: 'Admission', component: AdmissionComponent ,canActivate: [AuthGuardService] },
                    { path: 'CreateAdmission', component: AdmissionCreateComponent, canDeactivate: [ResetPatientcontextGuard], canActivate: [AuthGuardService,AdmissionSelectPatientCanActivateGuard] },
                    { path: 'AdmissionSearchPatient', component: AdmissionSearchPatient,canActivate: [AuthGuardService]  },
                    { path: 'AdmittedList', component: AdmittedListComponent,canActivate: [AuthGuardService]  },
                    { path: 'DischargedList', component: DischargedListComponent,canActivate: [AuthGuardService]  },

                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class AdmissionRoutingModule { }