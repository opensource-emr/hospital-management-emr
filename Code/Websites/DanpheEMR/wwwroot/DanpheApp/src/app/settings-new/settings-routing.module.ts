import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { PageNotFound } from '../404-error/404-not-found.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { SettingsMainComponent } from './settings-main.component';
import { TaxManageComponent } from "./tax/tax-manage.component";


@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: SettingsMainComponent, canActivate: [AuthGuardService],

        children: [
          // { path: '', redirectTo: 'DepartmentsManage', pathMatch: 'full' },
          { path: 'DepartmentsManage', loadChildren: './departments/dept-settings.module#DepartmentSettingsModule', canActivate: [AuthGuardService] },
          { path: 'RadiologyManage', loadChildren: './radiology/radiology-settings.module#RadiologySettingsModule', canActivate: [AuthGuardService] },
          { path: 'ADTManage', loadChildren: './adt/adt-settings.module#ADTSettingsModule', canActivate: [AuthGuardService] },
          { path: 'EmployeeManage', loadChildren: './employee/emp-settings.module#EmpSettingsModule', canActivate: [AuthGuardService] },
          { path: 'SecurityManage', loadChildren: "./security/security-settings.module#SecuritySettingsModule", canActivate: [AuthGuardService] },
          { path: 'BillingManage', loadChildren: "./billing/billing-settings.module#BillingSettingsModule", canActivate: [AuthGuardService] },
          { path: 'GeolocationManage', loadChildren: "./geolocation/geolocation-settings.module#GeolocationSettingsModule", canActivate: [AuthGuardService] },
          { path: 'ClinicalManage', loadChildren: "./clinical/clinical-settings.module#ClinicalSettingsModule", canActivate: [AuthGuardService] },
          { path: 'TaxManage', component: TaxManageComponent, canActivate: [AuthGuardService] },
          // { path: 'DynamicTemplates', component: DynamicTemplateEditComponent }, replaced with new module 
          { path: 'DynamicTemplates', loadChildren: "./dynamic-templates/dynamic-template.module#DynamicTemplateModule", canActivate: [AuthGuardService] },
          { path: 'EditCoreCFG', loadChildren: "./core/core-settings.module#CoreSettingsModule" },
          { path: 'ExtReferral', loadChildren: "./ext-referral/external-referral.module#ExternalReferralModule", canActivate: [AuthGuardService] },
          { path: 'Banks', loadChildren: "./banks/banks.module#BanksModule", canActivate: [AuthGuardService] },
          { path: 'Printers', loadChildren: "./printers/printer-settings.module#PrinterSettingModule", canActivate: [AuthGuardService] },
          { path: 'PrintExportConfiguration', loadChildren: "./print-export-configuration/print-export-configuration.module#PrintExportConfigurationModule", canActivate: [AuthGuardService] },
          { path: 'PaymentModeSettings', loadChildren: "./payment-mode-settings/payment-mode.module#PaymentModeSettingsModule", canActivate: [AuthGuardService] },
          { path: 'PriceCategory', loadChildren: "./price-cateogory/pricecategory.module#PriceCategoryModule", canActivate: [AuthGuardService] },
        ]
      },
      { path: "**", component: PageNotFound }

    ])
  ],
  exports: [
    RouterModule
  ]
})
export class SettingsRoutingModule { }
