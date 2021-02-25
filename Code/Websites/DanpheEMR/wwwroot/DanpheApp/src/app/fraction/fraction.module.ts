import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { DesignationEndPoint } from './shared/Designation.endpoint';
import { DesignationService } from "./shared/Designation.service";
import { SharedModule } from "../shared/shared.module";

import {FractionComponent } from './fraction.component';
import { DesignationAddComponent } from './settings/designation/designation-add.component';
import { DesignationListComponent } from './settings/designation/designation-list.component';
import { FractionRoutingModule } from './fraction-routing.module';
import { FractionSettingComponent } from './settings/fraction-settings.component';
import { FractionPercentAddComponent } from './settings/fractionPercent/fraction-percent-add.component';
import { FractionPercentListComponent } from './settings/fractionPercent/fraction-percent-list.component';
import { FractionPercentService } from './shared/Fraction-Percent.service';
import { FractionPercentEndPoint } from './shared/fraction-percent.endpoint';
import { FractionCalculationComponent } from './calculation/fraction-calculation.component';
import { FractionApplicableListComponent } from './calculation/applicable/fraction-applicable-list.component';
import { SettingsBLService } from '../settings-new/shared/settings.bl.service';
import { SettingsDLService } from '../settings-new/shared/settings.dl.service';
import { SettingsService } from '../settings-new/shared/settings-service';
import { CalculateComponent } from './calculation/calculate/calculate.component';
import { FractionCalculationService } from './shared/fraction-calculation.service';
import { FractionCalculationEndPoint } from './shared/fraction-calculation.endpoint';
import { VisitBLService } from '../appointments/shared/visit.bl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { CalculateDetailsComponent } from './calculation/calculate/calculate-details.component';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { FractionReportComponent } from './reports/fraction-report.component';
import { FractionReportbyItemComponent } from './reports/fraction-report-item.component';
import { FractionReportbyDoctorComponent } from './reports/fraction-report-doctor.component';


@NgModule({
    providers: [
        DesignationService,
        DesignationEndPoint,
        FractionPercentService,
        FractionPercentEndPoint,
        FractionCalculationService,
        FractionCalculationEndPoint,
        VisitBLService,
        VisitDLService,
        AppointmentDLService,
        
        { provide: LocationStrategy, useClass: HashLocationStrategy },
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FractionRoutingModule,
        FormsModule,
        HttpClientModule,
        SharedModule,
        DanpheAutoCompleteModule
        ],
    //DesignationReportsModule],
    declarations: [
        FractionComponent,
        FractionSettingComponent,
        DesignationAddComponent,
        DesignationListComponent, 
        FractionCalculationComponent,
        FractionApplicableListComponent,
        FractionPercentAddComponent,
        FractionPercentListComponent,
        CalculateComponent,
        CalculateDetailsComponent,
        FractionReportComponent,
        FractionReportbyDoctorComponent,
        FractionReportbyItemComponent
  
    ],

    bootstrap: [FractionComponent]
})
export class FractionModule { }
