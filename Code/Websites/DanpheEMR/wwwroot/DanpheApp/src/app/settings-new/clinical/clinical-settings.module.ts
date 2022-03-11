import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { AgGridModule } from 'ag-grid-angular/main';
import { ClinicalSettingsMainComponent } from './clinical-settings-main.component';
import { SharedModule } from '../../shared/shared.module';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { ReactionAddComponent } from './reactions/reaction-add.component';
import { ReactionListComponent } from './reactions/reaction-list.component';
import { ICD10GroupListComponent } from './icd10-groups/icd10-group-list.component';

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
    ICD10GroupListComponent
  ],
  bootstrap: []
})
export class ClinicalSettingsModule {

}
