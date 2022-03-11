import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';


import { NotesRoutingConstant } from './notes-routing.constant';
import { NotesMainComponent } from './notes-main.component';
import { ObjectiveNotesComponent } from './objective/objective-note.component';
import { SubjectiveNoteComponent } from './subjective/subjective-note.component';
import { OPDGeneralNoteComponenet } from './opd-general/opd-general-note.component';
import { FreeNotesComponent } from './freenotes/freenotes.component';
import { FreeTextComponent } from './templates/freetext/freetext.component';
import { EmergencyNoteComponent } from './templates/emergency-note/emergency-note.component';
import { ProgressNoteComponent } from './templates/progress-note/progress-note.component';
import { ProcedureNoteComponent } from './templates/procedure-note/procedure-note.component';
import { AssessmentPlanComponent } from './assessment-plan/assessment-plan.component';
import { PrescriptionNoteComponent } from './prescription-note/prescription-note.component';
import { OPDOrthoNoteComponent } from './opd-ortho/opd-ortho-note.component';
import { ClinicalSharedModule } from '../clinical/clinical-shared-module';
import { NoteTemplateBLService } from './shared/note-template.bl.service';
import { NotesListComponent } from './notes-list/notes-list.component';
import { HistoryAndPhsicalNoteComponent } from './templates/history-and-physical-note/history-and-physical-note.component';
import { ViewHistoryAndPhysicalNoteComponent } from './templates/history-and-physical-note/view-history-and-physical-note.component';
import { ViewEmergencyNoteComponent } from './templates/emergency-note/view-emergency-note.component';
import { ClinicalPrescriptionNoteComponent } from './prescription-note/clinical-prescription-note.component';
import { ViewClinicalPrescriptionNoteComponent } from './prescription-note/view-clinical-prescription-note.component';
import { OPDExaminationComponent } from './OPDExamination/OPD-Examination.component';
import { MedicationBLService } from '../clinical/shared/medication.bl.service';
import { OpdexaminationViewComponent } from './OPDExamination/opd-examination-view.component';


@NgModule({
  providers: [

    NoteTemplateBLService,
    MedicationBLService,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    //Ng2AutoCompleteModule
    DanpheAutoCompleteModule,
    RouterModule.forChild(NotesRoutingConstant),
    ClinicalSharedModule
  ],
  declarations: [
    NotesMainComponent,
    NotesListComponent,
    FreeNotesComponent,
    HistoryAndPhsicalNoteComponent,
    ObjectiveNotesComponent,
    SubjectiveNoteComponent,
    OPDGeneralNoteComponenet,
    FreeNotesComponent,
    FreeTextComponent,
    EmergencyNoteComponent,
    ProgressNoteComponent,
    ProcedureNoteComponent,
    AssessmentPlanComponent,
    PrescriptionNoteComponent,
    OPDOrthoNoteComponent,
    ViewHistoryAndPhysicalNoteComponent,
    ViewEmergencyNoteComponent,
    ClinicalPrescriptionNoteComponent,
    ViewClinicalPrescriptionNoteComponent,
    OPDExaminationComponent,
    OpdexaminationViewComponent
  ]
})

export class NotesModule {

}
