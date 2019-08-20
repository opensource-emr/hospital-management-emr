import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";

import { AgGridModule } from 'ag-grid-angular/main';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';

import { SettingsDLService } from './shared/settings.dl.service';
import { BillingDLService } from '../billing/shared/billing.dl.service';
import { SettingsBLService } from './shared/settings.bl.service';
import { SettingsService } from "./shared/settings-service";
import { RadiologyManageComponent } from './radiology/radiology-manage.component';
import { ImagingItemAddComponent } from './radiology/imaging-item-add.component';
import { ImagingTypeAddComponent } from './radiology/imaging-type-add.component';
import { ImagingItemListComponent } from './radiology/imaging-item-list';
import { ImagingTypeListComponent } from './radiology/imaging-type-list';
import { RadiologyReportTemplateComponent } from "./radiology/radiology-report-template.component";


import { DepartmentsManageComponent } from './department/departments-manage.component';
import { ServiceDepartmentListComponent } from './department/service-department-list';
import { DepartmentListComponent } from './department/department-list';
import { DepartmentAddComponent } from './department/department-add.component';
import { ServiceDepartmentAddComponent } from './department/service-department-add.component';

import { ADTManageComponent } from './adt/adt-manage.component';
import { BedAddComponent } from './adt/bed-add.component';
import { BedFeatureAddComponent } from './adt/bed-feature-add.component';
import { WardAddComponent } from './adt/ward-add.component';
import { BedListComponent } from './adt/bed-list';
import { BedFeatureListComponent } from './adt/bed-feature-list';
import { WardListComponent } from './adt/ward-list';
import { AutoBillingItemListComponent } from "./adt/autoBillingItem-list.component";

import { EmployeeManageComponent } from './employee/employee-manage.component';
import { EmployeeAddComponent } from './employee/employee-add.component';
import { EmployeeListComponent } from './employee/employee-list';
import { EmployeeRoleAddComponent } from './employee/employee-role-add.component';
import { EmployeeRoleListComponent } from './employee/employee-role-list';
import { EmployeeTypeAddComponent } from './employee/employee-type-add.component';
import { EmployeeTypeListComponent } from './employee/employee-type-list';

import { SecurityManageComponent } from "./security/security-manage.component";
import { RoleListComponent } from "./security/role-list";
import { UserListComponent } from "./security/user-list";
import { UserAddComponent } from "./security/user-add.component";
import { ResetPasswordComponent } from "./security/reset-password.component";
import { RoleAddComponent } from "./security/role-add.component";
import { RolePermissionManageComponent } from "./security/role-permission-manage.component";
import { UserRoleManageComponent } from "./security/user-role-manage.component";

import { BillingManageComponent } from "./billing/billing-manage.component";
import { BillingItemAddComponent } from "./billing/billingItem-add.component";
import { BillingItemListComponent } from "./billing/billingItem-list.component";
import { BillingPackageListComponent } from "./billing/billingPackage-list";
import { BillingPackageAddComponent } from "./billing/billingPackage-add.component";
import { MembershipListComponent } from "./billing/membership-list.component";
import { MembershipAddComponent } from "./billing/membership-add.component";

import { GeolocationManageComponent } from "./geolocation/geolocation-manage.component";
import { CountryAddComponent } from "./geolocation/country-add.component";
import { CountryListComponent } from "./geolocation/country-list.component";
import { CountrySubdivisionAddComponent } from "./geolocation/countrySubdivision-add.component";
import { CountrySubdivisionListComponent } from "./geolocation/countrySubdivision-list.component";
import { ClinicalManageComponent } from "./clinical/clinical-manage.component";
import { ReactionListComponent } from "./clinical/reaction-list.component";
import { ReactionAddComponent } from "./clinical/reaction-add.component";
import { TaxManageComponent } from "./tax/tax-manage.component";
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { SharedModule } from "../shared/shared.module";
import { DynTemplateModule } from '../core/dyn-templates/dyn-templates.module';
import { ParameterListComponent } from './core-cfg/parameter-list.component';
import { ParameterEditComponent } from './core-cfg/parameter-edit.component';

//Credit Organization
import { CreditOrganizationAddComponent } from '../settings/billing/creditOrganization-add.component';
import { CreditOrganizationListComponent } from '../settings/billing/creditOrganization-list.component';

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
    AgGridModule.withComponents(SettingsComponent),
    // Ng2AutoCompleteModule,
    DanpheAutoCompleteModule,
    SharedModule,
    DynTemplateModule
  ],
  declarations: [
    SettingsComponent,
    EmployeeAddComponent,
    //UserAddComponent,
    //ApplicationAddComponent,
    //RoleManageComponent,

    RadiologyManageComponent,
    ImagingItemAddComponent,
    ImagingTypeAddComponent,
    ImagingItemListComponent,
    ImagingTypeListComponent,
    RadiologyReportTemplateComponent,
    DepartmentsManageComponent,
    ServiceDepartmentListComponent,
    DepartmentListComponent,
    DepartmentAddComponent,
    ServiceDepartmentAddComponent,

    ADTManageComponent,
    BedAddComponent,
    BedFeatureAddComponent,
    WardAddComponent,
    BedListComponent,
    BedFeatureListComponent,
    WardListComponent,

    EmployeeManageComponent,
    EmployeeAddComponent,
    EmployeeListComponent,
    EmployeeRoleAddComponent,
    EmployeeRoleListComponent,
    EmployeeTypeAddComponent,
    EmployeeTypeListComponent,

    SecurityManageComponent,
    UserListComponent,
    RoleListComponent,
    UserAddComponent,
    RoleAddComponent,
    RolePermissionManageComponent,
    UserRoleManageComponent,
    ResetPasswordComponent,

    BillingManageComponent,
    BillingItemAddComponent,
    BillingItemListComponent,
    BillingPackageListComponent,
    BillingPackageAddComponent,
    AutoBillingItemListComponent,
    MembershipListComponent,
    MembershipAddComponent,

    GeolocationManageComponent,
    CountryAddComponent,
    CountryListComponent,
    CountrySubdivisionAddComponent,
    CountrySubdivisionListComponent,

    ClinicalManageComponent,
    ReactionListComponent,
    ReactionAddComponent,

    TaxManageComponent,
    ParameterListComponent,
    ParameterEditComponent,

    CreditOrganizationAddComponent,
    CreditOrganizationListComponent
  ],
  bootstrap: []
})

export class SettingsModule { }
