import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";

import { SharedModule } from '../shared/shared.module';
import { SchedulingDLService } from './shared/scheduling.dl.service';
import { SchedulingBLService } from './shared/scheduling.bl.service';
import { SchedulingRoutingModule } from './scheduling-routing.module';

import { SchedulingMainComponent } from './scheduling-main.component';
import { ShiftsManageComponent } from './setting/shifts-manage.component';
import { SettingMainComponent } from './setting/setting-main.component';
import { ManageSchedulingComponent } from "./manage/manage-schedules.component";
import { ManageMainComponent } from "./manage/manage-main.component";
import { ManageWorkingHours } from "./manage/manage-working-hours.component";

@NgModule({
    providers: [
        SchedulingBLService,
        SchedulingDLService,
        { provide: LocationStrategy, useClass: HashLocationStrategy }
    ],
    imports: [
        SchedulingRoutingModule,
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        FormsModule,
        SharedModule
    ],

    declarations: [
        SchedulingMainComponent,
        ManageSchedulingComponent,
        SettingMainComponent,
        ShiftsManageComponent,
        ManageMainComponent,
        ManageWorkingHours
    ],

})
export class SchedulingModule { }