import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { ClinicalComponent } from '../clinical/clinical.component';
import { VitalsListComponent } from '../clinical/vitals/vitals-list.component';
import { AllergyListComponent } from '../clinical/others/allergy-list.component';
import { HomeMedicationListComponent } from '../clinical/medications/home-medication-list.component';
import { InputOutputListComponent } from '../clinical/others/input-output-list.component';
import { NotesComponent } from '../clinical/notes/notes.component';
import { DoctorsNotesComponent } from '../doctors/notes/doctors-notes.component';
import { DischargeSummaryComponent } from './discharge-summary.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class DischargeSummaryRoutingModule { }
