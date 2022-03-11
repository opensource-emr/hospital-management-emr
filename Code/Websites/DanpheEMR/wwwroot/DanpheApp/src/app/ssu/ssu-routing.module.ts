import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SSU_PatientListComponent } from './patient-list/ssu-patient-list.component';
import { SocialServiceUnitMainComponent } from './social-service-unit-main.component';



@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: SocialServiceUnitMainComponent,
                children: [
                    { path: '', redirectTo: 'PatientList', pathMatch: 'full' },
                    { path: 'PatientList',component: SSU_PatientListComponent },
                    // {
                    //     path: 'Reports',
                    //     component: SettingMainComponent
                        
                    // },
                ]
          }
        ])
    ],
    exports: [
        RouterModule
    ]
})

export class SocialServiceUnitRoutingModule {

}
