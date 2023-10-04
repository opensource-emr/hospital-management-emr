import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { AgGridModule } from 'ag-grid-angular/main';
import { RadiologySettingsMainComponent } from './radiology-settings.main.component';
import { ImagingTypeAddComponent } from './imaging-types/imaging-type-add.component';
import { ImagingTypeListComponent } from './imaging-types/imaging-type-list.component';
import { ImagingItemAddComponent } from './items/imaging-item-add.component';
import { ImagingItemListComponent } from './items/imaging-item-list.component';
import { RadiologyReportTemplateComponent } from './report-templates/radiology-report-template.component';
import { SharedModule } from '../../shared/shared.module';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { RadDefSignatoriesComponent } from './def-signatories/rad-def-signatories.component';
import { AuthGuardService } from '../../security/shared/auth-guard.service';


export const radSettingsRoutes =
  [
    {
      path: '', component: RadiologySettingsMainComponent,
      children: [
        { path: '', redirectTo: 'ManageImagingType', pathMatch: 'full' },
        { path: 'ManageImagingType', component: ImagingTypeListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageImagingItem', component: ImagingItemListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageRadiologyTemplate', component: RadiologyReportTemplateComponent, canActivate: [AuthGuardService] },
        { path: 'DefaultSignatories', component: RadDefSignatoriesComponent, canActivate: [AuthGuardService] },
      ]
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
    RouterModule.forChild(radSettingsRoutes),

  ],
  declarations: [
    RadiologySettingsMainComponent,
    ImagingTypeAddComponent,
    ImagingTypeListComponent,
    ImagingItemAddComponent,
    ImagingItemListComponent,
    RadiologyReportTemplateComponent,
    RadDefSignatoriesComponent
  ],
  bootstrap: []
})

export class RadiologySettingsModule {

}
