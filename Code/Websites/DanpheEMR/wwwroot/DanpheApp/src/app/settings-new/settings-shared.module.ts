import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { SchemeSelectComponent } from './billing/memberships/select-membership-scheme/scheme-select.component';
import { AddExternalReferralComponent } from './ext-referral/add-new/add-ext-referral.component';
import { SelectReferrerComponent } from './ext-referral/select-referrer/select-referrer.component';
import { AddPrinterSettingsComponent } from './printers/add-new/add-printer-setting.component';
import { PrinterSelectComponent } from './printers/select-printer/printer-select.component';
import { SettingsService } from './shared/settings-service';
import { SettingsBLService } from './shared/settings.bl.service';
import { SettingsDLService } from './shared/settings.dl.service';


@NgModule({
  providers: [
    SettingsBLService,
    SettingsDLService,
    SettingsService
  ],

  imports: [ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    DanpheAutoCompleteModule,
  ],

  declarations: [
    AddExternalReferralComponent,
    SelectReferrerComponent,
    SchemeSelectComponent,
    PrinterSelectComponent,
    AddPrinterSettingsComponent,
    //ListPrinterSettingsComponent
  ],

  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SelectReferrerComponent,
    AddExternalReferralComponent,
    SchemeSelectComponent,
    PrinterSelectComponent,
    AddPrinterSettingsComponent,
    DanpheAutoCompleteModule,

    //ListPrinterSettingsComponent

  ]
})
export class SettingsSharedModule {


}
