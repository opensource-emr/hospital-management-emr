import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";

import { AgGridModule } from 'ag-grid-angular/main';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsMainComponent } from './settings-main.component';

import { SettingsDLService } from './shared/settings.dl.service';
import { BillingDLService } from '../billing/shared/billing.dl.service';
import { SettingsBLService } from './shared/settings.bl.service';
import { SettingsService } from "./shared/settings-service";

import { TaxManageComponent } from "./tax/tax-manage.component";
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { SharedModule } from "../shared/shared.module";
import { DynTemplateModule } from '../core/dyn-templates/dyn-templates.module';
import { ListPrinterSettingsComponent } from './printers/list/list-printer-settings.component';


//Credit Organization
//import { CreditOrganizationAddComponent } from '../settings/billing/creditOrganization-add.component';
//import { CreditOrganizationListComponent } from '../settings/billing/creditOrganization-list.component';

@NgModule({
  providers: [
    SettingsDLService,
    SettingsBLService,
    BillingDLService,
    SettingsService,
    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SettingsRoutingModule,
    DanpheAutoCompleteModule, 
    SharedModule,
    DynTemplateModule
  ],
  declarations: [
    SettingsMainComponent,
    TaxManageComponent,
    //ListPrinterSettingsComponent
    //CreditOrganizationAddComponent,
    //CreditOrganizationListComponent
  ],
  bootstrap: []
})

export class SettingsModule { }
