import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { ReportingService } from '../reporting/shared/reporting-service';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { DLService } from '../shared/dl.service';
import { SharedModule } from "../shared/shared.module";
import { AddBirthDetailsSharedComponent } from './add-birth-details-shared/add-birth-details-shared.component';
import { AddDeathDetailsSharedComponent } from './add-death-details-shared/add-death-details-shared.component';
import { AddBirthDetailsComponent } from './birth-list/add-birth-details/add-birth-details.component';
import { BirthListComponent } from './birth-list/birth-list.component';
import { BirthCertificateComponent } from './certificates/birth-certificate.component';
import { DeathCertificateComponent } from './certificates/death-certificate.component';
import { AddDeathDetailsComponent } from './death-list/add-death-details/add-death-details.component';
import { DeathListComponent } from './death-list/death-list.component';
import { EmergencyPatientListComponent } from './emergencypatient-list/emergency-patient-list.component';
import { EmergencyAddFinalDiagnosisComponent } from './emergencypatient-list/final-diagnosis/emergency-add-final-diagnosis.component';
import { MRInpatientListComponent } from './inpatient-list/inpatient-list.component';
import { MedicalRecordsMainComponent } from './medical-records-main.component';
import { MedecialRecordsRoutingModule } from './medical-records-routing.module';
import { DiseaseWiseReportComponent } from './mr-reports/disease-wise-report';
import { EmergencyPatientMorbidityReportComponent } from './mr-reports/government/emergency-patient-morbidity/emergency-patient-morbidity-report.component';
import { EthnicGroupStatisticsReportComponent } from './mr-reports/government/ethnic-group-statistics/ethnic-group-statistics.component';
import { HospitalMortalityComponent } from './mr-reports/government/hospital-mortaltiy/hospital-mortality.component';
import { InpatientMorbidityReportComponent } from './mr-reports/government/inpatient-morbidity/mr-inpatient-morbidity-report';
import { GovInpatientOutcomeReportComponent } from './mr-reports/government/inpatient-outcome/gov-inpatient-outcome-report.component';
import { GovLaboratoryServicesReportComponent } from './mr-reports/government/lab-services/gov-laboratory-services.component';
import { LabKeysPipe } from './mr-reports/government/lab-services/laboratory.pipe';
import { OutpatientMorbidityReportComponent } from './mr-reports/government/outpatient-morbidity/mr-outpatient-morbidity-report';
import { GovSummaryReportComponent } from './mr-reports/government/summary/govt-summary-report.component';
import { OutpatientServicesReportComponent } from './mr-reports/mr-outpatient-services-report';
import { MedicalRecordReportsMainComponent } from './mr-reports/mr-report-main';
import { AddNewMedicalRecordComponent } from './mr-summary/mr-summary-add.component';
import { ViewMedicalRecordComponent } from './mr-summary/mr-summary-view.component';
import { AddFinalDiagnosisComponent } from './outpatient-list/final-diagnosis/add-final-diagnosis.component';
import { MROutpatientListComponent } from './outpatient-list/outpatient-list.component';
import { MedicalRecordService } from './shared/medical-record.service';
import { MR_BLService } from './shared/mr.bl.service';
import { MR_DLService } from './shared/mr.dl.service';


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
    InpatientMorbidityReportComponent,
    HospitalMortalityComponent,
    EmergencyPatientListComponent,
    EmergencyAddFinalDiagnosisComponent,
    EmergencyPatientMorbidityReportComponent,
    EthnicGroupStatisticsReportComponent
  ],
  bootstrap: []

})
export class MedicalRecordsModule { }
