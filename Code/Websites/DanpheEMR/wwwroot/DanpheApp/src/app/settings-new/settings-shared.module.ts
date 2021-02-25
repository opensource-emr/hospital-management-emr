import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { AddExternalReferralComponent } from './ext-referral/add-new/add-ext-referral.component';
import { SettingsBLService } from './shared/settings.bl.service';
import { SettingsDLService } from './shared/settings.dl.service';
import { SettingsService } from './shared/settings-service';
import { SelectReferrerComponent } from './ext-referral/select-referrer/select-referrer.component';
import { MembershipSelectComponent } from './billing/memberships/select-membership-scheme/membership-select.component';


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
    MembershipSelectComponent
  ],

  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SelectReferrerComponent,
    AddExternalReferralComponent,
    MembershipSelectComponent

  ]
})
export class SettingsSharedModule {

    
}
