import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

//import { PatientCanDeactivateGuard } from "./shared/patient-candeactivate-guard";

import { DoctorsRoutingConstant } from "./doctors-routing.constant";
//Dashboard components
import { DoctorsMainComponent } from '../doctors/doctors-main.component';
import { DoctorDashboardComponent } from "../doctors/doctor-dashboard.component";

import { SharedModule } from "../shared/shared.module";
//to display visit lists in patient-visit-history. use the same doctor-dashboard.component as well--sudarshan 24march
import { VisitDLService } from '../appointments/shared/visit.dl.service';

import { DoctorsBLService } from './shared/doctors.bl.service';
import { DoctorsDLService } from './shared/doctors.dl.service';


import { PatientOverviewMainComponent } from "./patient/patient-overview-main.component";
import { PatientVisitHistoryComponent } from "./patient/patient-visit-history.component";

import { ClinicalDLService } from "../clinical/shared/clinical.dl.service";
import { OPDVisitSummaryComponent } from "./opd/opd-visit-summary.component";
import { DoctorRevenueComponent } from "./summary/doctor-summary.component";


//import { Ng2AutoCompleteModule } from  'ng2-auto-complete'
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';

//moved Problems+History from Clinical to Doctors Module : sud-10June'18
//import { FamilyHistoryListComponent } from '../clinical/history/family-history-list.component';
//import { FamilyHistoryAddComponent } from '../clinical/history/family-history-add.component';
//import { SurgicalHistoryListComponent } from '../clinical/history/surgical-history-list.component';
//import { SurgicalHistoryAddComponent } from '../clinical/history/surgical-history-add.component';
//import { SocialHistoryListComponent } from '../clinical/history/social-history-list.component';
//import { SocialHistoryAddComponent } from '../clinical/history/social-history-add.component';
import { ProblemsBLService } from '../clinical/shared/problems.bl.service';
import { HistoryBLService } from '../clinical/shared/history.bl.service';
import { VisitSummaryCreateComponent } from './visit/visit-summary-create.component';
import { DynTemplateModule } from '../core/dyn-templates/dyn-templates.module';
import { VisitSummaryMainComponent } from './visit/visit-summary-main.component';
import { VisitSummaryHistoryComponent } from './visit/visit-summary-history.component';
import { DoctorsNotesComponent } from './notes/doctors-notes.component';
import { IOAllergyVitalsBLService } from '../clinical/shared/io-allergy-vitals.bl.service';
import { ProblemsMainComponent } from '../clinical/problems/problems-main.component';
import { PastMedicalComponent } from '../clinical/problems/past-medical.component';
//import { MedicalProblemListComponent } from '../clinical/problems/medical-problem-list.component';
//import { ActiveMedicalAddComponent } from '../clinical/problems/active-medical-add.component';
//import { PastMedicalAddComponent } from '../clinical/problems/past-medical-add.component';
import { PatientCurrentMedicationsComponent } from '../clinical/medications/patient-current-medications.component';
import { PatientLabReportsComponent } from '../labs/reports/patient-lab-reports.component';
import { PatientClinicalDocumentsComponent } from '../clinical/others/patient-clinical-documents.component';
import { PatientImagingReportsComponent } from '../radiology/imaging/patient-imaging-reports.component';
import { OrderService } from '../orders/shared/order.service';
import { PatientsBLService } from "../patients/shared/patients.bl.service";
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { AdmissionDLService } from '../admission/shared/admission.dl.service';
import { VisitSummaryComponent } from './visit/visit-summary.component';
import { PatientScannedImages } from '../clinical/scanned-images/patient-scanned-images.component';


@NgModule({
    providers: [VisitDLService,
        DoctorsDLService,
        DoctorsBLService,
        ClinicalDLService,
        ProblemsBLService,
        HistoryBLService,
        IOAllergyVitalsBLService,
        OrderService,
        AppointmentDLService,
        AdmissionDLService,
        PatientsBLService
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        FormsModule,
        RouterModule.forChild(DoctorsRoutingConstant),
        SharedModule,
       // Ng2AutoCompleteModule,
       DanpheAutoCompleteModule,
        DynTemplateModule],
    declarations: [
        DoctorsMainComponent,
        PatientOverviewMainComponent,
        PatientVisitHistoryComponent,
        DoctorDashboardComponent,
        OPDVisitSummaryComponent,
        DoctorRevenueComponent,
        ProblemsMainComponent,
        //MedicalProblemListComponent,
        //ActiveMedicalAddComponent,
        //PastMedicalAddComponent,
        PastMedicalComponent,
        VisitSummaryComponent,
        // ClinicalHistoryComponent,
        //FamilyHistoryListComponent,
        //FamilyHistoryAddComponent,

        //SurgicalHistoryListComponent,
        //SurgicalHistoryAddComponent,
        //SocialHistoryListComponent,
        //SocialHistoryAddComponent,
        VisitSummaryCreateComponent,
        VisitSummaryMainComponent,
        VisitSummaryHistoryComponent,
        PatientCurrentMedicationsComponent,
        PatientLabReportsComponent,
        PatientClinicalDocumentsComponent,
        PatientImagingReportsComponent,
        PatientScannedImages
       
    ],
    bootstrap: []//do we need anything here ? <sudarshan:2jan2017>
})
export class DoctorsModule { }
