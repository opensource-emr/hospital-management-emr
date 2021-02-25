import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";

import { FractionComponent } from './fraction.component';
import { FractionSettingComponent } from './settings/fraction-settings.component';
import { DesignationListComponent } from './settings/designation/designation-list.component';
import { FractionCalculationComponent } from './calculation/fraction-calculation.component';
import { FractionApplicableListComponent } from './calculation/applicable/fraction-applicable-list.component';
import { FractionPercentListComponent } from './settings/fractionPercent/fraction-percent-list.component';
import { CalculateComponent } from './calculation/calculate/calculate.component';
import { CalculateDetailsComponent } from './calculation/calculate/calculate-details.component';
import { FractionReportComponent } from './reports/fraction-report.component';
import { FractionReportbyItemComponent } from './reports/fraction-report-item.component';
import { FractionReportbyDoctorComponent } from './reports/fraction-report-doctor.component';
import { PageNotFound } from '../404-error/404-not-found.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',//this is : '/Inventory'
                component: FractionComponent,
                children: [
                    { path: '', redirectTo: 'Setting', pathMatch: 'full' },
                    {
                        path: 'Setting',
                        component: FractionSettingComponent,
                        children: [
                            { path: '', redirectTo: 'Designation', pathMatch: 'full' },
                            { path: 'Designation', component: DesignationListComponent },
                            { path: 'FractionPercent', component: FractionPercentListComponent },
                            { path: "**", component: PageNotFound }

                        ]
                    },
                    {
                        path: 'Calculation',
                        component: FractionCalculationComponent,
                        children: [
                            { path: '', redirectTo: 'ApplicableList', pathMatch: 'full' },
                            { path: 'ApplicableList', component: FractionApplicableListComponent },
                            { path: 'Calculate', component: CalculateComponent },
                            { path: 'CalculateDetails', component: CalculateDetailsComponent },
                            { path: "**", component: PageNotFound }

                        ]
                    },
                    {
                        path: 'FractionReport',
                        component: FractionReportComponent,
                        children: [
                            { path: '', redirectTo: 'ReportbyDoctor', pathMatch: 'full' },
                            { path: 'ReportbyDoctor', component: FractionReportbyDoctorComponent },
                            { path: 'ReportbyItem', component: FractionReportbyItemComponent },
                            { path: "**", component: PageNotFound }
                        ]
                    },
                ]
          },
          { path: "**", component: PageNotFound },
        ])
    ],
    exports: [
        RouterModule
    ]
})

export class FractionRoutingModule {

}
