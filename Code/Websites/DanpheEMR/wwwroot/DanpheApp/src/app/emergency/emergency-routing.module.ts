import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { EmergencyMainComponent } from './emergency-main.component';
import { EmergencyDashboardComponent } from '../dashboards/emergency/emergency-dashboard.component';
import { ERPatientListComponent } from './patients-list/er-patient-list.component';
import { ERTriagePatientListComponent } from './triage/er-triage-patient-list.component';
import { ERFinalizedComponent } from './finalized-patients/er-finalized-patients.component';
import { ERLamaPatientListComponent } from './finalized-patients/er-lama-patient-list.component';
import { ERDischargedPatientListComponent } from './finalized-patients/er-discharged-patient-list.component';
import { ERTransferredPatientListComponent } from './finalized-patients/er-transferred-patient-list.component';
import { ERAdmittedPatientListComponent } from './finalized-patients/er-admitted-patient-list.component';
import { ERDeathPatientListComponent } from './finalized-patients/er-death-patient-list.component';
import { BedInformationsComponent } from './bed-informations/bed-informations.component';
import { ERDischargeSummaryComponent } from './discharge/er-discharge-summary.component';
import { ResetERPatientcontextGuard } from './shared/reset-ERpatientcontext-guard';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: EmergencyMainComponent,
                children: [
                    { path: '', redirectTo: 'Dashboard', pathMatch: 'full' },
                    { path: 'Dashboard', component: EmergencyDashboardComponent },
                    { path: 'NewPatients', component: ERPatientListComponent },
                    { path: 'TriagePatients', component: ERTriagePatientListComponent },
                    {
                        path: 'FinalizedPatients', component: ERFinalizedComponent,
                        children: [
                            { path: '', redirectTo: 'lama-patients', pathMatch: 'full' },
                            { path: 'lama-patients', component: ERLamaPatientListComponent },
                            { path: 'transferred-patients', component: ERTransferredPatientListComponent },
                            { path: 'discharged-patients', component: ERDischargedPatientListComponent },
                            { path: 'admitted-patients', component: ERAdmittedPatientListComponent },
                            { path: 'death-patients', component: ERDeathPatientListComponent }
                        ]
                    },
                    { path: 'BedInformations', component: BedInformationsComponent }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class EmergencyRoutingModule {

}