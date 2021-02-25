import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { PayrollSettingComponent } from './payroll-Setting.component';
import { PayrollSettingsRoutingModule } from './payroll-setting-routing.module';
import { PayrollSettingBLService } from '../Setting/shared/PayrollSettingBLService';
import { PayrollSettingDLService } from  '../Setting/shared/PayrollSettingDLService';
import { WeekendHolidayPolicyComponent } from './Weekend-Holiday-Policy/weekend-holiday.component';
import { LeaveCategoryListComponent } from './Leave-Category/Leave-Category-List.component';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete/danphe-auto-complete.module';
import { SharedModule } from '../../shared/shared.module';
import { AddLeaveCategoryComponent} from './Leave-Category/Add-Leave-Category.component';


@NgModule({
    providers: [PayrollSettingBLService, PayrollSettingDLService, 
        { provide: LocationStrategy, useClass: HashLocationStrategy }],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        PayrollSettingsRoutingModule,
        DanpheAutoCompleteModule,
        SharedModule,
    ],
    declarations: [
      PayrollSettingComponent,
      WeekendHolidayPolicyComponent,
      LeaveCategoryListComponent,
      AddLeaveCategoryComponent,
    ],

    bootstrap: [PayrollSettingComponent]
})
export class PayrollSettingsModule { }