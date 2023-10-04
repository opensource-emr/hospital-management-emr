import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { InventorySettingBLService } from "../settings/shared/inventory-settings.bl.service";
import { InventorySettingDLService } from "../settings/shared/inventory-settings.dl.service";

import { ItemAddComponent } from '../settings/item/item-add.component';
import { VendorsAddComponent } from '../settings/vendors/vendor-add.component';
import { CurrencyAddComponent } from '../settings/currency/currency-add.component';
import { ItemCategoryAddComponent } from '../settings/itemcategory/item-category-add.component';
import { AccountHeadAddComponent } from '../settings/accounthead/account-head-add.component';
import { PackagingTypeAddComponent } from '../settings/packagingtype/packaging-type-add.component';
import { UnitOfMeasurementAddComponent } from '../settings/unitofmeasurement/unit-of-measurement-add.component';
import { CompanyAddComponent } from '../settings/company/company-add.component';
import { ItemSubCategoryAddComponent } from '../settings/itemsubcategory/item-subcategory-add.component';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { AccountingSharedModule } from '../../accounting/shared/accounting-shared.module';
@NgModule({
  providers: [
    InventorySettingBLService, InventorySettingDLService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    DanpheAutoCompleteModule,  
    AccountingSharedModule ],
  declarations: [
    ItemAddComponent,
    VendorsAddComponent,
    CurrencyAddComponent,
    ItemCategoryAddComponent,
    AccountHeadAddComponent,
    PackagingTypeAddComponent,
    CompanyAddComponent,
    UnitOfMeasurementAddComponent,
    ItemSubCategoryAddComponent],
  exports: [
    ItemAddComponent,
    VendorsAddComponent,
    CurrencyAddComponent,
    ItemCategoryAddComponent,
    AccountHeadAddComponent,
    PackagingTypeAddComponent,
    UnitOfMeasurementAddComponent,
    CompanyAddComponent,
    ItemSubCategoryAddComponent
  ],
  bootstrap: []
})
export class InventorySharedModule {

}
