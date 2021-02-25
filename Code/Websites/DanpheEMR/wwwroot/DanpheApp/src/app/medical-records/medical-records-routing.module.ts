import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';
import { MedicalRecordsMainComponent } from './medical-records-main.component';
import { MRInpatientListComponent } from './inpatient-list/inpatient-list.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { BirthListComponent } from './birth-list/birth-list.component';
import { DeathListComponent } from './death-list/death-list.component';
import { MedicalRecordReportsMainComponent } from './mr-reports/mr-report-main';
import { DiseaseWiseReportComponent } from './mr-reports/disease-wise-report';
import { InpatientServicesReportComponent } from './mr-reports/mr-inpatient-services-report';
import { OutpatientServicesReportComponent } from './mr-reports/mr-outpatient-services-report';
import { LabServicesReportComponent } from './mr-reports/mr-labservices-report';
import { MorbidityReportComponent } from './mr-reports/mr-morbidity-report';
import { PageNotFound } from '../404-error/404-not-found.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: MedicalRecordsMainComponent, canDeactivate: [ResetPatientcontextGuard],
        children: [
          { path: '', redirectTo: 'InpatientList', pathMatch: 'full' },
          { path: 'InpatientList', component: MRInpatientListComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'BirthList', component: BirthListComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'DeathList', component: DeathListComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'ReportList', component: MedicalRecordReportsMainComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'ReportList/DiseaseWiseReport', component: DiseaseWiseReportComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },         
          { path: 'ReportList/InpatientServicesReport', component: InpatientServicesReportComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },         
          { path: 'ReportList/OutpatientServicesReport', component: OutpatientServicesReportComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'ReportList/LabServicesReport', component: LabServicesReportComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'ReportList/MorbidityReport', component: MorbidityReportComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: "**", component: PageNotFound }
        ]
      },
      { path: "**", component: PageNotFound }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class MedecialRecordsRoutingModule {

}
