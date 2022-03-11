import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { LabsRoutingModule } from './labs-routing.module';

import { LabsBLService } from './shared/labs.bl.service';
import { LabsDLService } from './shared/labs.dl.service';
import { BillingDLService } from '../billing/shared/billing.dl.service';

import { LabsMainComponent } from './labs-main.component';
import { LabListRequisitionComponent } from '../labs/lab-tests/lab-requisition/lab-list-requisition.component';
//import { LabTestsCollectSampleComponent } from '../labs/lab-tests/lab-tests-collect-sample.component';
import { LabTestResultService, LabService } from './shared/lab.service';
import { SharedModule } from "../shared/shared.module";
import { LabDashboardComponent } from "../dashboards/labs/lab-dashboard.component";
import { WardBillingComponent } from '../labs/billing/ward-billing.component'
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { LabTestsPendingReports } from './lab-tests/lab-pending-reports/lab-tests-pending-reports';
import { LabTestsFinalReports } from './lab-tests/lab-final-reports/lab-tests-final-reports';
import { LabTestsPendingResultsComponent } from './lab-tests/lab-pending-results/lab-tests-pending-results.component';
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { BillingBLService } from '../billing/shared/billing.bl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { LabTestChangeComponent } from './shared/lab-test-change';
import { LabRequestsListComponent } from './lab-requests/lab-request-list';
import { LabStickerComponent } from './shared/lab-sticker.component';
import { LabBarCodeComponent } from './lab-tests/lab-master/lab-barcode';
import { ADT_BLService } from '../adt/shared/adt.bl.service';
import { UndoLabSampleCode } from './lab-tests/lab-collect-sample/undo-lab-samplecode.component';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { LabRequestsComponent } from './lab-requests/lab-requests.component';
import { ExternalLabsMainComponent } from './external-labs/external-labs-main.component';
import { InternalTestListComponent } from './external-labs/tests-list/internal-test-list.component';
import { VendorSelectComponent } from './external-labs/vendor-assignment/vendor-select.component';
import { ExternalTestListComponent } from './external-labs/tests-list/external-test-list.component';
import { LabTestsCollectSampleComponent } from './lab-tests/lab-collect-sample/lab-tests-collect-sample.component';
import { LabReportDispatchComponent } from './lab-tests/lab-master/lab-report-dispatch';
import { LabReportDispatchDetailComponent } from './lab-tests/lab-master/lab-report-dispatch-detail';
import { BillingSharedModule } from '../billing/billing-shared.module';
import { LabTestsEmptyAddReportComponent } from './lab-tests/lab-collect-sample/lab-empty-report-template';
import { LabTypeSelectionComponent } from './lab-selection/lab-type-selection.component';
import { LabSelectionGuardService } from './shared/lab-selection-guard.service';
import { LabCategorySelectComponent } from './shared/lab-select-category/lab-select-category.component';
import { LabWorkListReportComponent } from './lab-tests/lab-pending-results/lab-worklist-report';
import { LabSendSmsComponent } from './notification/sms/send-sms.component';
import { LabNotificationComponent } from './notification/notification-main.component';
import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  providers: [
    LabsBLService,
    LabsDLService,
    LabTestResultService,
    BillingDLService,
    PatientsDLService,
    BillingBLService,
    VisitDLService,
    AppointmentDLService,
    ADT_BLService,
    ADT_DLService,
    LabSelectionGuardService],
  imports: [LabsRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    AngularMultiSelectModule,
    SharedModule,
    DanpheAutoCompleteModule,
    BillingSharedModule,
    SettingsSharedModule,
    NgxPaginationModule,
    ScrollingModule
  ],
  declarations: [LabsMainComponent,
    LabListRequisitionComponent,
    LabTestsCollectSampleComponent,
    LabDashboardComponent,
    WardBillingComponent,
    LabTestsPendingReports,
    LabTestsFinalReports,
    LabTestsPendingResultsComponent,
    LabTestChangeComponent,
    LabRequestsComponent,
    LabRequestsListComponent,
    LabStickerComponent,
    LabBarCodeComponent,
    UndoLabSampleCode,
    ExternalLabsMainComponent,
    InternalTestListComponent,
    ExternalTestListComponent,
    VendorSelectComponent,
    LabReportDispatchComponent,
    LabReportDispatchDetailComponent,
    LabTestsEmptyAddReportComponent,
    LabTypeSelectionComponent,
    LabCategorySelectComponent,
    LabWorkListReportComponent,
    LabSendSmsComponent,
    LabNotificationComponent
  ],
  bootstrap: []

})
export class LabsModule { }
