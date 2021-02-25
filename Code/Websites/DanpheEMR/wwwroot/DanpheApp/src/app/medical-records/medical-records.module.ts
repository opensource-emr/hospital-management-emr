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
import { InpatientServicesReportComponent } from './mr-reports/mr-inpatient-services-report';
import { OutpatientServicesReportComponent } from './mr-reports/mr-outpatient-services-report';
import { MorbidityReportComponent } from './mr-reports/mr-morbidity-report';
import { LabServicesReportComponent } from './mr-reports/mr-labservices-report';

@NgModule({
  providers: [
    MR_BLService,
    MR_DLService,
    ADT_DLService,
    DLService,
    ReportingService
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
    InpatientServicesReportComponent,
    OutpatientServicesReportComponent,
    MorbidityReportComponent,
    LabServicesReportComponent
  ],
  bootstrap: []

})
export class MedicalRecordsModule { }
