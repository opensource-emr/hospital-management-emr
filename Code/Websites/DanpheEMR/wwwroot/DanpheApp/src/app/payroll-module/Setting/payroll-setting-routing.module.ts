import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { PayrollSettingComponent } from './payroll-Setting.component';
import { WeekendHolidayPolicyComponent } from './Weekend-Holiday-Policy/weekend-holiday.component';
import {  LeaveCategoryListComponent} from './Leave-Category/Leave-Category-List.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: PayrollSettingComponent, 
                children: [
                    { path: '', redirectTo: 'WeekendHoliday', pathMatch: 'full' },
                    { path: 'WeekendHoliday', component: WeekendHolidayPolicyComponent },
                    { path: 'LeaveCategory', component:LeaveCategoryListComponent},
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})

export class PayrollSettingsRoutingModule {

}