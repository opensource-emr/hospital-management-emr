
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ClinicalRoutingModule } from "./clinical-routing.module";
//BL Service
//import { HistoryBLService } from './shared/history.bl.service';
import { ClinicalDLService } from './shared/clinical.dl.service';
import { MedicationBLService } from './shared/medication.bl.service';
import { IOAllergyVitalsBLService } from './shared/io-allergy-vitals.bl.service';
//import { ProblemsBLService } from './shared/problems.bl.service';

//Components
import { ClinicalComponent } from "./clinical.component";
//import { AllergyListComponent } from '../clinical/others/allergy-list.component';
//import { AllergyAddComponent } from '../clinical/others/allergy-add.component';
import { VitalsListComponent } from "../clinical/vitals/vitals-list.component";
import { InputOutputListComponent } from "../clinical/others/input-output-list.component";
import { InputOutputAddComponent } from "../clinical/others/input-output-add.component";
//import { NotesComponent } from "../clinical/others/notes.component";
import { HomeMedicationAddComponent } from '../clinical/medications/home-medication-add.component';
import { HomeMedicationListComponent } from "../clinical/medications/home-medication-list.component";

//import { NotesComponent } from "../clinical/notes/notes.component";
//import { MedicationPrescriptionComponent } from "../clinical/medications/medication-prescription.component";

//import { ProblemsMainComponent } from '../clinical/problems/problems-main.component';
//import { ActiveMedicalComponent } from '../clinical/problems/active-medical.component';
//import { PastMedicalComponent } from "../clinical/problems/past-medical.component";


////import { ClinicalHistoryComponent } from "../clinical/history/clinical-history.component";
//import { FamilyHistoryComponent } from "../clinical/history/family-history.component";
//import { SurgicalHistoryComponent } from "../clinical/history/surgical-history.component";
//import { SocialHistoryComponent } from "../clinical/history/social-history.component";


import { SharedModule } from "../shared/shared.module";
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
//import { AssessmentPlanComponent } from './notes/assessment-plan.component';
//import { SelectOrderComponent } from './notes/orderSelect.component';
import { OrderService } from '../orders/shared/order.service';
import { PatientsBLService } from '../patients/shared/patients.bl.service';
import { EyeExaminationComponent } from './eye-examination/eye-examination.component';
//import { ObjectiveNotesComponent } from './notes/objective-note.component';
//import { SubjectiveNoteComponent } from './notes/subjective-note.component';
//import { OPDGeneralNoteComponenet } from './notes/opd-general-note.component';
import { LightboxModule } from 'angular2-lightbox';
@NgModule({
    providers: [
        //HistoryBLService,
        ClinicalDLService,
        MedicationBLService,
        IOAllergyVitalsBLService,
        OrderService,
        PatientsBLService
        //ProblemsBLService
    ],
    imports: [ClinicalRoutingModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        SharedModule,
        //Ng2AutoCompleteModule
        DanpheAutoCompleteModule,
        LightboxModule
    ],
    declarations: [
        ClinicalComponent,
        //AllergyListComponent,
        HomeMedicationListComponent,
        HomeMedicationAddComponent,
        InputOutputListComponent,
       VitalsListComponent,
       EyeExaminationComponent ,
        InputOutputAddComponent

        //NotesComponent,
        //ObjectiveNotesComponent,
        //SubjectiveNoteComponent,
        //OPDGeneralNoteComponenet
        //MedicationPrescriptionComponent,


       // ProblemsMainComponent,
       // ActiveMedicalComponent,
       // PastMedicalComponent,

       //// ClinicalHistoryComponent,
       // FamilyHistoryComponent,
       // SurgicalHistoryComponent,
       // SocialHistoryComponent
    ],
  exports: [ClinicalComponent],
  schemas: [NO_ERRORS_SCHEMA],
    bootstrap: []//do we need anything here ? <sudarshan:2jan2017>
})
export class ClinicalModule { }
