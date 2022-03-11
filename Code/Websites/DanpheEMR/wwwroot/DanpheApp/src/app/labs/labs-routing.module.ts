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
import { LabTypeSelectionComponent } from './lab-selection/lab-type-selection.component';
import { LabSelectionGuardService } from './shared/lab-selection-guard.service';
import { LabSendSmsComponent } from './notification/sms/send-sms.component';
import { LabNotificationComponent } from './notification/notification-main.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: LabsMainComponent, canDeactivate: [ResetPatientcontextGuard],
        children: [
          { path: '', redirectTo: 'Dashboard', pathMatch: 'full' },
          {
            path: 'Dashboard',
            component: LabDashboardComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard, LabSelectionGuardService]
          },
          { path: 'Requisition', component: LabListRequisitionComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard, LabSelectionGuardService] },
          { path: 'CollectSample', component: LabTestsCollectSampleComponent, canActivate: [AuthGuardService, LabSelectionGuardService] },
          { path: 'AddResult', component: LabTestsResults, canActivate: [AuthGuardService, LabSelectionGuardService] },
          { path: 'PendingReports', component: LabTestsPendingReports, canActivate: [AuthGuardService, ResetPatientcontextGuard, LabSelectionGuardService] },
          { path: 'PendingLabResults', component: LabTestsPendingResultsComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard, LabSelectionGuardService] },
          { path: 'FinalReports', component: LabTestsFinalReports, canActivate: [AuthGuardService, ResetPatientcontextGuard, LabSelectionGuardService] },
          { path: 'WardBilling', component: WardBillingComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard, LabSelectionGuardService] },
          { path: 'BarCode', component: LabBarCodeComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard, LabSelectionGuardService] },
          { path: 'ReportDispatch', component: LabReportDispatchComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard, LabSelectionGuardService] },
          {
            path: 'Notification', component: LabNotificationComponent,
            children: [
              { path: '', redirectTo: 'SMS', pathMatch: 'full' },
              { path: 'SMS', component: LabSendSmsComponent },
              { path: "**", component: PageNotFound }
            ]
            , canActivate: [AuthGuardService, ResetPatientcontextGuard, LabSelectionGuardService]
          },
          { path: 'Settings', loadChildren: '../labs/lab-settings/lab-settings.module#LabSettingsModule', canActivate: [LabSelectionGuardService] },
          {
            path: 'ExternalLabs', component: ExternalLabsMainComponent,
            canActivate: [LabSelectionGuardService],
            children: [
              { path: '', redirectTo: 'TestList', pathMatch: 'full' },
              { path: 'TestList', component: InternalTestListComponent },
              { path: 'ExternalTestList', component: ExternalTestListComponent },
              { path: "**", component: PageNotFound }

            ]
          },
          { path: 'LabTypeSelection', component: LabTypeSelectionComponent },
          { path: 'Lis', loadChildren: '../labs/lab-lis/lis-module#LISModule', canActivate: [AuthGuardService, LabSelectionGuardService] },
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
