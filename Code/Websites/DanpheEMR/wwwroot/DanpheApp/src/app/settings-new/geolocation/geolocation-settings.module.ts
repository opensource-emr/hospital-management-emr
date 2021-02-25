import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { AgGridModule } from 'ag-grid-angular/main';
import { SharedModule } from '../../shared/shared.module';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { GeolocationSettingsMainComponent } from './geolocation-settings-main.component';
import { CountryAddComponent } from './countries/country-add.component';
import { CountryListComponent } from './countries/country-list.component';
import { CountrySubdivisionAddComponent } from './subdivisions/country-subdivision-add.component';
import { CountrySubdivisionListComponent } from './subdivisions/country-subdivision-list.component';
import { AuthGuardService } from '../../security/shared/auth-guard.service';
export const geoLocSettingsRoutes =
  [
    {
      path: '', component: GeolocationSettingsMainComponent,
      children: [
        { path: '', redirectTo: 'ManageCountry', pathMatch: 'full' },
        { path: 'ManageCountry', component: CountryListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageSubdivision', component: CountrySubdivisionListComponent, canActivate: [AuthGuardService] }
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
    RouterModule.forChild(geoLocSettingsRoutes),
  ],
  declarations: [
    GeolocationSettingsMainComponent,
    CountryAddComponent,
    CountryListComponent,
    CountrySubdivisionAddComponent,
    CountrySubdivisionListComponent
  ],
  bootstrap: []
})
export class GeolocationSettingsModule {

}
