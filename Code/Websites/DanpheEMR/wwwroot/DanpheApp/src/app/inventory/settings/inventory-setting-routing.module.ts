import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { VendorListComponent } from './vendors/vendor-list';
import { ItemCategoryListComponent } from './itemcategory/item-category-list';
import { AccountHeadListComponent } from './accounthead/account-head-list.component';
import { PackagingTypeListComponent } from './packagingtype/packaging-type-list';
import { UnitOfMeasurementListComponent } from './unitofmeasurement/unit-of-measurement-list';
import { ItemListComponent } from './item/item-list';
import { CurrencyListComponent } from './currency/currency-list';
import { InventorySettingsComponent } from './inventory-settings.component';
import { CompanyListComponent } from './company/company-list.component';
import { TermsListComponent } from './termsconditions/terms-list.component';
import { ItemSubCategoryListComponent } from './itemsubcategory/item-subcategory-list';
import { ENUM_TermsApplication } from '../../shared/shared-enums';
import { InvoiceHeaderListComponent } from '../../shared/invoice-header/invoice-header-list.component';
import { PageNotFound } from '../../404-error/404-not-found.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: InventorySettingsComponent,
        children: [
          { path: '', redirectTo: 'item-list', pathMatch: 'full' },
          { path: 'vendor-list', component: VendorListComponent },
          // { path: 'itemcategory-list', component: ItemCategoryListComponent }, //not required Yubraj --2nd April 2019
          { path: 'AccountHeadList', component: AccountHeadListComponent },
          { path: 'packagingtype-list', component: PackagingTypeListComponent },
          { path: 'unitofmeasurement-list', component: UnitOfMeasurementListComponent },
          { path: 'item-list', component: ItemListComponent },
          { path: 'CurrencyList', component: CurrencyListComponent },
          { path: 'company-list', component: CompanyListComponent },
          { path: 'TermsList', component: TermsListComponent },
          { path: 'sub-category-list', component: ItemSubCategoryListComponent },
          { path: 'InvoiceHeaders/:module', component: InvoiceHeaderListComponent },
          { path: "**", component: PageNotFound}
        ]
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})

export class InventorySettingRoutingModule {

}
