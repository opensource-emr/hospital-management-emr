import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { ClinicalRoutingModule } from "./clinical-routing.module";
//BL Service
//import { HistoryBLService } from './shared/history.bl.service';
import { ClinicalDLService } from "./shared/clinical.dl.service";
import { MedicationBLService } from "./shared/medication.bl.service";
import { IOAllergyVitalsBLService } from "./shared/io-allergy-vitals.bl.service";
//import { ProblemsBLService } from './shared/problems.bl.service';

//Components
import { ClinicalComponent } from "./clinical.component";
//import { AllergyListComponent } from '../clinical/others/allergy-list.component';
//import { AllergyAddComponent } from '../clinical/others/allergy-add.component';
import { InputOutputListComponent } from "../clinical/others/input-output-list.component";
import { InputOutputAddComponent } from "../clinical/others/input-output-add.component";
//import { NotesComponent } from "../clinical/others/notes.component";
import { HomeMedicationAddComponent } from "../clinical/medications/home-medication-add.component";
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
import { DanpheAutoCompleteModule } from "../shared/danphe-autocomplete/danphe-auto-complete.module";
//import { AssessmentPlanComponent } from './notes/assessment-plan.component';
//import { SelectOrderComponent } from './notes/orderSelect.component';
import { OrderService } from "../orders/shared/order.service";
import { PatientsBLService } from "../patients/shared/patients.bl.service";
import { EyeExaminationComponent } from "./eye-examination/eye-form/eye-examination.component";
import { EyeExaminationBLService } from "./shared/eye-examination.bl.service";
//import { ObjectiveNotesComponent } from './notes/objective-note.component';
//import { SubjectiveNoteComponent } from './notes/subjective-note.component';
//import { OPDGeneralNoteComponenet } from './notes/opd-general-note.component';
import { LightboxModule } from "angular2-lightbox";
import { EyeMainComponent } from "./eye-examination/eye-main/eye-main.component";
import { EyeHistoryComponent } from "./eye-examination/eye-history/eye-history.component";
import { PrescriptionSlipBLService } from "./eye-examination/prescription-slip/shared/prescription-slip.bl.service";
import { PrescriptionSlipComponent } from "./eye-examination/prescription-slip/prescription-slip.component";
import { PrescriptionSlipHistoryComponent } from "./eye-examination/prescription-slip-history/presription-slip-history.component";
import { ScanUploadComponent } from "./eye-examination/scan-upload/scan-upload.component";

import { NoteTemplateBLService } from "../clinical-notes/shared/note-template.bl.service";
import { ClinicalSharedModule } from "./clinical-shared-module";
//import { AllergyListComponent } from "./others/allergy-list.component";

@NgModule({
  providers: [
    //HistoryBLService,
    ClinicalDLService,
    MedicationBLService,
    IOAllergyVitalsBLService,
    OrderService,
    //PatientsBLService,
    EyeExaminationBLService,
    PrescriptionSlipBLService,
    NoteTemplateBLService,
    //ProblemsBLService
  ],
  imports: [
    ClinicalRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    //Ng2AutoCompleteModule
    DanpheAutoCompleteModule,
    LightboxModule,
    ClinicalSharedModule, // sud:5Apr'2020-Imported Shared module of clinical instead of importing declaring individual components.
  ],
  declarations: [
    ClinicalComponent,
    //AllergyListComponent,
    HomeMedicationListComponent,
    //HomeMedicationAddComponent,
    InputOutputListComponent,
    EyeMainComponent,
    EyeExaminationComponent,
    EyeHistoryComponent,
    InputOutputAddComponent,
    PrescriptionSlipComponent,
    PrescriptionSlipHistoryComponent,
    ScanUploadComponent,
  ],
  exports: [ClinicalComponent],
  bootstrap: [], //do we need anything here ? <sudarshan:2jan2017>
})
export class ClinicalModule {}
