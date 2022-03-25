import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { RouterModule } from "@angular/router";
import { DanpheAutoCompleteModule } from "../shared/danphe-autocomplete";
import { PastMedicalAddComponent } from "./problems/past-medical-add.component";
import { FamilyHistoryAddComponent } from "./history/family-history-add.component";
import { SurgicalHistoryAddComponent } from "./history/surgical-history-add.component";
import { VitalsAddComponent } from "./vitals/vitals-add.component";
import { AllergyAddComponent } from "./others/allergy-add.component";
import { ActiveMedicalAddComponent } from "./problems/active-medical-add.component";
import { MedicalProblemListComponent } from "./problems/medical-problem-list.component";
import { SurgicalHistoryListComponent } from "./history/surgical-history-list.component";
import { SocialHistoryListComponent } from "./history/social-history-list.component";
import { FamilyHistoryListComponent } from "./history/family-history-list.component";
import { SharedModule } from "../shared/shared.module";
import { SocialHistoryAddComponent } from "./history/social-history-add.component";
import { SelectOrderComponent } from "../orders/orders-select/order-select.component";
import { PastMedicalComponent } from "./problems/past-medical.component";
import { VitalsListComponent } from "./vitals/vitals-list.component";
import { DoctorsNotesComponent } from "../doctors/notes/doctors-notes.component";
import { AllergyListComponent } from "./others/allergy-list.component";
import { HomeMedicationAddComponent } from "./medications/home-medication-add.component";
import { PatientVisitNoteComponent } from "./patient-visit-notes/patient-visit-notes.component";
import { PatientVisitNoteViewComponent } from "./patient-visit-notes/patient-visit-notes-view.component";

@NgModule({
  providers: [],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    DanpheAutoCompleteModule,
    SharedModule,
  ],
  declarations: [
    //add components...
    VitalsAddComponent,
    VitalsListComponent,
    AllergyAddComponent,
    ActiveMedicalAddComponent,
    PastMedicalComponent,
    PastMedicalAddComponent,
    FamilyHistoryAddComponent,
    SurgicalHistoryAddComponent,
    SocialHistoryAddComponent,

    //list components...
    MedicalProblemListComponent,
    SurgicalHistoryListComponent,
    SocialHistoryListComponent,
    FamilyHistoryListComponent,

    SelectOrderComponent,
    DoctorsNotesComponent,
    AllergyListComponent,
    HomeMedicationAddComponent,
    PatientVisitNoteComponent,
    PatientVisitNoteViewComponent,
  ],
  exports: [
    VitalsAddComponent,
    VitalsListComponent,
    AllergyAddComponent,
    AllergyListComponent,
    ActiveMedicalAddComponent,
    PastMedicalAddComponent,
    FamilyHistoryAddComponent,
    SurgicalHistoryAddComponent,
    SocialHistoryAddComponent,
    SelectOrderComponent,
    PastMedicalComponent,
    DoctorsNotesComponent,
    HomeMedicationAddComponent,
    PatientVisitNoteComponent,
    PatientVisitNoteViewComponent,
  ],
})
export class ClinicalSharedModule {}
