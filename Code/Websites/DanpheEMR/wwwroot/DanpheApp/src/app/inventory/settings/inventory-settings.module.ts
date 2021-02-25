import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";

import { InventorySettingsComponent } from './inventory-settings.component';
import { InventorySettingRoutingModule } from './inventory-setting-routing.module';
import { VendorListComponent } from './vendors/vendor-list';
import { ItemCategoryListComponent } from './itemcategory/item-category-list';
import { AccountHeadListComponent } from './accounthead/account-head-list.component';
import { PackagingTypeListComponent } from './packagingtype/packaging-type-list';
import { UnitOfMeasurementListComponent } from './unitofmeasurement/unit-of-measurement-list';
import { ItemListComponent } from './item/item-list';
import { CurrencyListComponent } from './currency/currency-list';
import {MappingListComponent } from './Mapping/mapping-list';

import { SharedModule } from '../../shared/shared.module';
import { InventorySharedModule } from '../shared/inventory-shared.module';
import { CompanyListComponent } from './company/company-list.component';
import { CompanyService } from './shared/company/company.service';
import { CompanyEndPoint } from './shared/company/company.endpoint';
import { VendorsManageComponent } from './vendors/vendors-manage';
import { ItemSubCategoryListComponent } from './itemsubcategory/item-subcategory-list';
@NgModule({
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }, CompanyService, CompanyEndPoint],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InventorySettingRoutingModule,
    SharedModule,
    InventorySharedModule],
  declarations: [
    InventorySettingsComponent,
    VendorListComponent,
    ItemCategoryListComponent,
    AccountHeadListComponent,
    PackagingTypeListComponent,
    UnitOfMeasurementListComponent,
    ItemListComponent,
      CurrencyListComponent,
      MappingListComponent,
    CompanyListComponent,
    VendorsManageComponent,
    ItemSubCategoryListComponent
  ],

  bootstrap: [InventorySettingsComponent]
})
export class InventorySettingsModule { }
