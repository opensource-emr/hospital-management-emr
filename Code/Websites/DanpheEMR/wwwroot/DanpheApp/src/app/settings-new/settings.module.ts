import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { SettingsMainComponent } from './settings-main.component';
import { SettingsRoutingModule } from './settings-routing.module';

import { BillingDLService } from '../billing/shared/billing.dl.service';
import { SettingsService } from "./shared/settings-service";
import { SettingsBLService } from './shared/settings.bl.service';
import { SettingsDLService } from './shared/settings.dl.service';

import { TaxManageComponent } from "./tax/tax-manage.component";
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DynTemplateModule } from '../core/dyn-templates/dyn-templates.module';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { SharedModule } from "../shared/shared.module";
import { DynamicTemplateModule } from './dynamic-templates/dynamic-template.module';


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
    DynTemplateModule,
    DynamicTemplateModule
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
