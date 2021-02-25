import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { LabsMainComponent } from './labs-main.component';
import { LabListRequisitionComponent } from './lab-tests/lab-requisition/lab-list-requisition.component';
//import { LabTestsCollectSampleComponent } from './lab-tests/lab-tests-collect-sample.component';
import { LabTestsAddResultComponent } from './lab-tests/lab-add-result/lab-tests-add-result.component';
import { LabTestsViewReportComponent } from '../labs/lab-tests/lab-final-reports/lab-tests-view-report.component';
import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';
import { LabDashboardComponent } from "../dashboards/labs/lab-dashboard.component";
import { LabTestsPendingReports } from './lab-tests/lab-pending-reports/lab-tests-pending-reports';
import { LabTestsFinalReports } from './lab-tests/lab-final-reports/lab-tests-final-reports';
import { LabTestsResults } from './lab-tests/lab-tests-results.component';
import { LabTestsPendingResultsComponent } from './lab-tests/lab-pending-results/lab-tests-pending-results.component';
import { WardBillingComponent } from '../labs/billing/ward-billing.component'
import { LabBarCodeComponent } from './lab-tests/lab-master/lab-barcode';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { ExternalLabsMainComponent } from './external-labs/external-labs-main.component';
import { InternalTestListComponent } from './external-labs/tests-list/internal-test-list.component';
import { ExternalTestListComponent } from './external-labs/tests-list/external-test-list.component';
import { LabTestsCollectSampleComponent } from './lab-tests/lab-collect-sample/lab-tests-collect-sample.component';
import { LabReportDispatchComponent } from './lab-tests/lab-master/lab-report-dispatch';
import { PageNotFound } from '../404-error/404-not-found.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: LabsMainComponent, canDeactivate: [ResetPatientcontextGuard],
        children: [
          { path: '', redirectTo: 'Dashboard', pathMatch: 'full' },
          { path: 'Dashboard', component: LabDashboardComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'Requisition', component: LabListRequisitionComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'CollectSample', component: LabTestsCollectSampleComponent, canActivate: [AuthGuardService] },
          { path: 'AddResult', component: LabTestsResults, canActivate: [AuthGuardService] },
          { path: 'PendingReports', component: LabTestsPendingReports, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'PendingLabResults', component: LabTestsPendingResultsComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'FinalReports', component: LabTestsFinalReports, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'WardBilling', component: WardBillingComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'BarCode', component: LabBarCodeComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'ReportDispatch', component: LabReportDispatchComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'Settings', loadChildren: '../labs/lab-settings/lab-settings.module#LabSettingsModule' },
          {
            path: 'ExternalLabs', component: ExternalLabsMainComponent,
            children: [
              { path: '', redirectTo: 'TestList', pathMatch: 'full' },
              { path: 'TestList', component: InternalTestListComponent },
              { path: 'ExternalTestList', component: ExternalTestListComponent },
              { path: "**", component: PageNotFound }

            ]
          },
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
export class LabsRoutingModule {

}
