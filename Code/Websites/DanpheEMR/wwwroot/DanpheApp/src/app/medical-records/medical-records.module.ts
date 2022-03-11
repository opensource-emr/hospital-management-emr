import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from "../shared/shared.module";
import { MedecialRecordsRoutingModule } from './medical-records-routing.module';
import { MedicalRecordsMainComponent } from './medical-records-main.component';
import { MRInpatientListComponent } from './inpatient-list/inpatient-list.component';
import { MR_BLService } from './shared/mr.bl.service';
import { MR_DLService } from './shared/mr.dl.service';
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { AddNewMedicalRecordComponent } from './mr-summary/mr-summary-add.component';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { ViewMedicalRecordComponent } from './mr-summary/mr-summary-view.component';
import { BirthListComponent } from './birth-list/birth-list.component';
import { BirthCertificateComponent } from './certificates/birth-certificate.component';
import { DeathListComponent } from './death-list/death-list.component';
import { DeathCertificateComponent } from './certificates/death-certificate.component';
import { MedicalRecordReportsMainComponent } from './mr-reports/mr-report-main';
import { DiseaseWiseReportComponent } from './mr-reports/disease-wise-report';
import { ReportingService } from '../reporting/shared/reporting-service';
import { DLService } from '../shared/dl.service';
import { OutpatientServicesReportComponent } from './mr-reports/mr-outpatient-services-report';
import { AddBirthDetailsComponent } from './birth-list/add-birth-details/add-birth-details.component';
import { AddDeathDetailsComponent } from './death-list/add-death-details/add-death-details.component';
import { MROutpatientListComponent } from './outpatient-list/outpatient-list.component';
import { AddFinalDiagnosisComponent } from './outpatient-list/final-diagnosis/add-final-diagnosis.component';
import { GovInpatientOutcomeReportComponent } from './mr-reports/government/inpatient-outcome/gov-inpatient-outcome-report.component';
import { GovSummaryReportComponent } from './mr-reports/government/summary/govt-summary-report.component';
import { GovLaboratoryServicesReportComponent } from './mr-reports/government/lab-services/gov-laboratory-services.component';
import { LabKeysPipe } from './mr-reports/government/lab-services/laboratory.pipe';
import { MedicalRecordService } from './shared/medical-record.service';
import { AddBirthDetailsSharedComponent } from './add-birth-details-shared/add-birth-details-shared.component';
import { InpatientMorbidityReportComponent } from './mr-reports/government/inpatient-morbidity/mr-inpatient-morbidity-report';
import { AddDeathDetailsSharedComponent } from './add-death-details-shared/add-death-details-shared.component';
import { OutpatientMorbidityReportComponent } from './mr-reports/government/outpatient-morbidity/mr-outpatient-morbidity-report';


@NgModule({
  providers: [
    MR_BLService,
    MR_DLService,
    ADT_DLService,
    DLService,
    ReportingService,
    MedicalRecordService
  ],
  imports: [
    MedecialRecordsRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    SharedModule,
    DanpheAutoCompleteModule
  ],
  declarations: [
    MedicalRecordsMainComponent,
    MRInpatientListComponent,
    AddNewMedicalRecordComponent,
    ViewMedicalRecordComponent,
    BirthListComponent,
    BirthCertificateComponent,
    DeathListComponent,
    DeathCertificateComponent,
    MedicalRecordReportsMainComponent,
    DiseaseWiseReportComponent,
    OutpatientServicesReportComponent,
    OutpatientMorbidityReportComponent,
    AddBirthDetailsComponent,
    AddBirthDetailsSharedComponent,
    AddDeathDetailsSharedComponent,
    AddDeathDetailsComponent,
    MROutpatientListComponent,
    AddFinalDiagnosisComponent,
    GovSummaryReportComponent,
    GovLaboratoryServicesReportComponent,
    GovInpatientOutcomeReportComponent,
    LabKeysPipe,
    InpatientMorbidityReportComponent
  ],
  bootstrap: []

})
export class MedicalRecordsModule { }
