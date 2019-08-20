import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { ClinicalComponent } from '../clinical/clinical.component';
import { VitalsListComponent } from '../clinical/vitals/vitals-list.component';
import { AllergyListComponent } from '../clinical/others/allergy-list.component';
import { HomeMedicationListComponent } from '../clinical/medications/home-medication-list.component';
import { InputOutputListComponent } from '../clinical/others/input-output-list.component';
import { NotesComponent } from '../clinical/notes/notes.component';
import { DoctorsNotesComponent } from '../doctors/notes/doctors-notes.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { EyeExaminationComponent } from './eye-examination/eye-examination.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',//this is: '/Clinical'
                component: ClinicalComponent,
                children: [
                    { path: '', redirectTo: 'Vitals', pathMatch: 'full' },
                    { path: 'Vitals', component: VitalsListComponent },
                    { path: 'Allergy', component: AllergyListComponent},
                    { path: 'HomeMedication', component: HomeMedicationListComponent },
                    { path: 'InputOutput', component: InputOutputListComponent  },
                    { path: 'Notes', component: NotesComponent },
                    { path: 'DoctorsNotes', component: DoctorsNotesComponent },
                    { path: 'EyeExamination', component: EyeExaminationComponent },
                   
                ]
            }
        ])
    ],
    exports: [

        RouterModule
    ]
})
export class ClinicalRoutingModule { }
