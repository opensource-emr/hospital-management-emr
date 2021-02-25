import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { AgGridModule } from 'ag-grid-angular/main';
import { SharedModule } from '../../shared/shared.module';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';

import { ADTSettingsMainComponent } from './adt-settings-main.component';
import { AutoBillingItemListComponent } from './auto-billing-items/auto-billing-item-list.component';
import { BedFeatureAddComponent } from './bed-features/bed-feature-add.component';
import { BedFeatureListComponent } from './bed-features/bed-feature-list.component';
import { BedAddComponent } from './beds/bed-add.component';
import { BedListComponent } from './beds/bed-list.component';
import { WardAddComponent } from './wards/ward-add.component';
import { WardListComponent } from './wards/ward-list.component';
import { AuthGuardService } from '../../security/shared/auth-guard.service';

export const adtSettingsRoutes =
  [
    {
      path: '', component: ADTSettingsMainComponent,
      children: [
        { path: '', redirectTo: 'ManageWard', pathMatch: 'full' },
        { path: 'ManageWard', component: WardListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageBedFeature', component: BedFeatureListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageBed', component: BedListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageAutoAddBillItems', component: AutoBillingItemListComponent, canActivate: [AuthGuardService] }
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
    RouterModule.forChild(adtSettingsRoutes),
  ],
  declarations: [
    ADTSettingsMainComponent,
    AutoBillingItemListComponent,
    BedFeatureAddComponent,
    BedFeatureListComponent,
    BedAddComponent,
    BedListComponent,
    WardAddComponent,
    WardListComponent
  ],
  bootstrap: []
})
export class ADTSettingsModule {

}
