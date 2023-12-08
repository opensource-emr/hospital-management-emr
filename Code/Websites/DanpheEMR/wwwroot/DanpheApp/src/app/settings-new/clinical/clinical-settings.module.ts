import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { SharedModule } from '../../shared/shared.module';
import { ClinicalSettingsMainComponent } from './clinical-settings-main.component';
import { ICD10GroupListComponent } from './icd10-groups/icd10-group-list.component';
import { IntakeOutputAddComponent } from './intakeoutput/intake-output-add.component';
import { IntakeOutputTypeListComponent } from './intakeoutput/intake-output-type.component';
import { ReactionAddComponent } from './reactions/reaction-add.component';
import { ReactionListComponent } from './reactions/reaction-list.component';

export const clnSettingsRoutes =
  [
    {
      path: '', component: ClinicalSettingsMainComponent
    }
  ]

@NgModule({
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    DanpheAutoCompleteModule,
    RouterModule.forChild(clnSettingsRoutes),
  ],
  declarations: [
    ClinicalSettingsMainComponent,
    ReactionAddComponent,
    ReactionListComponent,
    ICD10GroupListComponent,
    IntakeOutputTypeListComponent,
    IntakeOutputAddComponent
  ],
  bootstrap: []
})
export class ClinicalSettingsModule {

}
