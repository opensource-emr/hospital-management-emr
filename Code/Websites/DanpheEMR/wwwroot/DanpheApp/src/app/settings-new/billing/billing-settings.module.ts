import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BillingSharedModule } from '../../billing/billing-shared.module';
import { AuthGuardService } from '../../security/shared/auth-guard.service';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { SharedModule } from '../../shared/shared.module';
import { ServiceDepartmentAddComponent } from '../departments/service-dept/service-department-add.component';
import { ServiceDepartmentListComponent } from '../departments/service-dept/service-department-list';
import { BillSchemeListComponent } from './Scheme/bill-scheme-list.component';
import { BillSchemeComponent } from './Scheme/bill-scheme.component';
import { AdditionalServiceItemsComponent } from './additional-service-items/additional-service-items.component';
import { BillingPackageAddComponent } from './bill-packages/billing-package-add.component';
import { BillingPackageListComponent } from './bill-packages/billing-package-list.component';
import { BillingSettingsMainComponent } from './billing-settings-main.component';
import { CreditOrganizationAddComponent } from './credit-orgs/credit-organization-add.component';
import { CreditOrganizationListComponent } from './credit-orgs/credit-organization-list.component';
import { DepositHeadAddComponent } from './deposit-heads/deposit-head-add.component';
import { DepositHeadListComponent } from './deposit-heads/deposit-head-list.component';
import { AddSchemePriceCategoryItemsComponent } from './map-scheme-and-pricecategory/add-scheme-pricecategory-items/add-scheme-pricecategory-items.component';
import { MapSchemeAndPriceCategoryComponent } from './map-scheme-and-pricecategory/map-scheme-and-pricecategory.component';
import { MembershipAddComponent } from './memberships/membership-add.component';
import { MembershipListComponent } from './memberships/membership-list.component';
import { ReportingItemAndBillItemMapComponent } from './reporting-items-mapping/manage-reporting-items/manage-reporting-items.component';
import { ReportingItemsAddComponent } from './reporting-items-mapping/reporting-items-add.component';
import { ReportingItemsListComponent } from './reporting-items-mapping/reporting-items-list.component';
import { BillServiceItemSchemeSettingComponent } from './service-item-scheme/bill-service-item-scheme-setting.component';
import { BillServiceItemListComponent } from './service-items/bill-service-item-list.component';
import { BillServiceItemComponent } from './service-items/bill-service-item.component';

export const billSettingsRoutes =
  [
    {
      path: '', component: BillingSettingsMainComponent,
      children: [
        { path: '', redirectTo: 'ServiceItems', pathMatch: 'full' },
        { path: 'ManageServiceDepartment', component: ServiceDepartmentListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageBillingPackages', component: BillingPackageListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageCreditOrganizations', component: CreditOrganizationListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageMemberships', component: MembershipListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageReportingItemsMapping', component: ReportingItemsListComponent, canActivate: [AuthGuardService] },
        { path: 'Schemes', component: BillSchemeListComponent, canActivate: [AuthGuardService] },
        { path: 'BillScheme', component: BillSchemeComponent, canActivate: [AuthGuardService] },
        { path: 'ServiceItems', component: BillServiceItemListComponent, canActivate: [AuthGuardService] },
        { path: 'MapSchemeAndPriceCategory', component: MapSchemeAndPriceCategoryComponent, canActivate: [AuthGuardService] },
        { path: 'AdditionalServiceItems', component: AdditionalServiceItemsComponent, canActivate: [AuthGuardService] },
        { path: 'DepositHeads', component: DepositHeadListComponent, canActivate: [AuthGuardService] },

      ]
    }
  ]


@NgModule({
  providers: [

    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    DanpheAutoCompleteModule,
    BillingSharedModule,
    RouterModule.forChild(billSettingsRoutes),
  ],
  declarations: [
    BillingSettingsMainComponent,
    CreditOrganizationAddComponent,
    CreditOrganizationListComponent,
    MembershipAddComponent,
    MembershipListComponent,
    BillingPackageAddComponent,
    BillingPackageListComponent,
    ServiceDepartmentAddComponent,
    ServiceDepartmentListComponent,
    ReportingItemsListComponent,
    ReportingItemAndBillItemMapComponent,
    ReportingItemsAddComponent,
    BillSchemeComponent,
    BillSchemeListComponent,
    BillServiceItemListComponent,
    BillServiceItemComponent,
    BillServiceItemSchemeSettingComponent,
    MapSchemeAndPriceCategoryComponent,
    AddSchemePriceCategoryItemsComponent,
    AdditionalServiceItemsComponent,
    DepositHeadListComponent,
    DepositHeadAddComponent,
  ],
  bootstrap: []
})
export class BillingSettingsModule {

}
