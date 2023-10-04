import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { AgGridModule } from 'ag-grid-angular/main';
import { SharedModule } from '../../shared/shared.module';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { ParameterListComponent } from './parameters/parameter-list.component';
import { ParameterEditComponent } from './parameters/parameter-edit.component';


export const coreSettingsRoutes =
  [
    {
      path: '', component: ParameterListComponent
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
    RouterModule.forChild(coreSettingsRoutes),
  ],
  declarations: [
    ParameterListComponent,
    ParameterEditComponent
  ],
  bootstrap: []
})
export class CoreSettingsModule {

}
