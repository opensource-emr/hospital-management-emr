import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { ClinicalComponent } from '../clinical/clinical.component';
import { VitalsListComponent } from '../clinical/vitals/vitals-list.component';
import { AllergyListComponent } from '../clinical/others/allergy-list.component';
import { HomeMedicationListComponent } from '../clinical/medications/home-medication-list.component';
import { InputOutputListComponent } from '../clinical/others/input-output-list.component';
//import { NotesComponent } from '../clinical/notes/notes.component';
import { DoctorsNotesComponent } from '../doctors/notes/doctors-notes.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { EyeMainComponent } from './eye-examination/eye-main/eye-main.component';
import { EyeExaminationComponent } from './eye-examination/eye-form/eye-examination.component';
import { EyeHistoryComponent } from './eye-examination/eye-history/eye-history.component';
import { PrescriptionSlipComponent } from './eye-examination/prescription-slip/prescription-slip.component';
import { PrescriptionSlipHistoryComponent } from './eye-examination/prescription-slip-history/presription-slip-history.component';
import { ScanUploadComponent } from './eye-examination/scan-upload/scan-upload.component';
import { PageNotFound } from '../404-error/404-not-found.component';
import { PatientVisitNoteComponent } from './patient-visit-notes/patient-visit-notes.component';
import { PatientVisitNoteViewComponent } from './patient-visit-notes/patient-visit-notes-view.component';
// import { FreeNotesComponent } from './notes/freenotes/freenotes.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',//this is: '/Clinical'
                component: ClinicalComponent,
                children: [
                    { path: '', redirectTo: 'PatientVisitNote', pathMatch: 'full' },
                    { path: 'Vitals', component: VitalsListComponent },
                    { path: 'Allergy', component: AllergyListComponent },
                    { path: 'HomeMedication', component: HomeMedicationListComponent },
                    { path: 'InputOutput', component: InputOutputListComponent },
                    { path: 'DoctorsNotes', component: DoctorsNotesComponent },
                    { path: 'PatientVisitNote', component: PatientVisitNoteComponent },
                    { path: 'PatientVisitNoteView', component: PatientVisitNoteViewComponent },
                 
                    // {
                    //     path: 'Notes', component: ViewTemplateComponent,
                    //     children: [
                    //         { path: 'FreeNotes', component: FreeNotesComponent },
                    //         { path: 'ViewNotes', component: ViewTemplateComponent }
                    //     ]
                    // },
                    
                    {
                        path: 'EyeExamination', component: EyeMainComponent,
                        children: [
                            { path: '', redirectTo: 'Prescriptionslip', pathMatch: 'full' },
                            { path: 'NewEMR', component: EyeExaminationComponent },
                            { path: 'EMRHistory', component: EyeHistoryComponent },
                            { path: 'Prescriptionslip', component: PrescriptionSlipComponent },
                            { path: 'ScanUpload', component: ScanUploadComponent },
                            { path: 'PrescriptionslipHistory', component: PrescriptionSlipHistoryComponent },
                            { path: "**", component: PageNotFound }
                      ]

                    },
                    { path: "**", component: PageNotFound },
                ]
          }
        ])
    ],
    exports: [

        RouterModule
    ]
})
export class ClinicalRoutingModule { }
