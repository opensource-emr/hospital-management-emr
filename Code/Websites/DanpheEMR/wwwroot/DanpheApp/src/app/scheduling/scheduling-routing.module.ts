import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SchedulingMainComponent } from './scheduling-main.component';
import { ShiftsManageComponent } from './setting/shifts-manage.component';
import { SettingMainComponent } from './setting/setting-main.component';
import { ManageSchedulingComponent } from "./manage/manage-schedules.component";
import { ManageMainComponent } from "./manage/manage-main.component";
import { ManageWorkingHours } from "./manage/manage-working-hours.component";
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { PageNotFound } from '../404-error/404-not-found.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: SchedulingMainComponent, canActivate: [AuthGuardService] ,
                children: [
                    { path: '', redirectTo: 'Manage', pathMatch: 'full' },
                    { path: 'Manage',component: ManageMainComponent, canActivate: [AuthGuardService] ,
                        children: [
                          { path: '', redirectTo: 'ManageSchedules', pathMatch: 'full' },
                          { path: 'ManageSchedules', component: ManageSchedulingComponent, canActivate: [AuthGuardService] },
                          { path: '', redirectTo: 'ManageWorkingHours', pathMatch: 'full' },
                          { path: 'ManageWorkingHours', component: ManageWorkingHours, canActivate: [AuthGuardService] },
                          { path: "**", component: PageNotFound }

                        ]
                    },
                    {
                        path: 'Setting',
                        component: SettingMainComponent,
                        children: [
                            { path: '', redirectTo: 'ShiftsManage', pathMatch: 'full' },
                          { path: 'ShiftsManage', component: ShiftsManageComponent, canActivate: [AuthGuardService] },
                          { path: "**", component: PageNotFound }

                        ]
                    },
                ]
          },
          { path: "**", component: PageNotFound }
        ])
    ],
    exports: [
        RouterModule
    ]
})

export class SchedulingRoutingModule {

}
