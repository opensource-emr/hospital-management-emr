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
import { MappingListComponent } from './Mapping/mapping-list';

import { SharedModule } from '../../shared/shared.module';
import { InventorySharedModule } from '../shared/inventory-shared.module';
import { CompanyListComponent } from './company/company-list.component';
import { CompanyService } from './shared/company/company.service';
import { CompanyEndPoint } from './shared/company/company.endpoint';
import { VendorsManageComponent } from './vendors/vendors-manage';
import { ItemSubCategoryListComponent } from './itemsubcategory/item-subcategory-list';
import { OtherChargesListComponent } from './othercharges/other-charges-list/other-charges-list.component';
import { OtherChargesFormComponent } from './othercharges/other-charges-form/other-charges-form.component';
import { OtherChargesEditComponent } from './othercharges/other-charges-edit/other-charges-edit.component';
import { OtherChargesService } from './othercharges/other-charges.service';
import { OtherChargesEndPoint } from './othercharges/other-charges.endpoint';
@NgModule({
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }, CompanyService, CompanyEndPoint, OtherChargesService, OtherChargesEndPoint],
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
    ItemSubCategoryListComponent,
    OtherChargesListComponent,
    OtherChargesFormComponent,
    OtherChargesEditComponent,

  ],

  bootstrap: [InventorySettingsComponent]
})
export class InventorySettingsModule { }
