import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { BillingSettingsMainComponent } from './billing-settings-main.component';
import { SharedModule } from '../../shared/shared.module';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { BillingItemAddComponent } from './bill-items/billing-item-add.component';
import { BillingItemListComponent } from './bill-items/billing-item-list.component';
import { CreditOrganizationAddComponent } from './credit-orgs/credit-organization-add.component';
import { CreditOrganizationListComponent } from './credit-orgs/credit-organization-list.component';
import { MembershipAddComponent } from './memberships/membership-add.component';
import { MembershipListComponent } from './memberships/membership-list.component';
import { BillingPackageAddComponent } from './packages/billing-package-add.component';
import { BillingPackageListComponent } from './packages/billing-package-list.component';
import { ServiceDepartmentAddComponent } from '../departments/service-dept/service-department-add.component';
import { ServiceDepartmentListComponent } from '../departments/service-dept/service-department-list';
import { AuthGuardService } from '../../security/shared/auth-guard.service';
import { ReportingItemsListComponent } from './reporting-items-mapping/reporting-items-list.component';
import { ReportingItemAndBillItemMapComponent } from './reporting-items-mapping/manage-reporting-items/manage-reporting-items.component';
import { ReportingItemsAddComponent } from './reporting-items-mapping/reporting-items-add.component';

export const billSettingsRoutes =
  [
    {
      path: '', component: BillingSettingsMainComponent,
      children: [
        { path: '', redirectTo: 'ManageBillingItems', pathMatch: 'full' },
        { path: 'ManageServiceDepartment', component: ServiceDepartmentListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageBillingItems', component: BillingItemListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageBillingPackages', component: BillingPackageListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageCreditOrganizations', component: CreditOrganizationListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageMemberships', component: MembershipListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageReportingItemsMapping', component: ReportingItemsListComponent, canActivate: [AuthGuardService] },
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
    RouterModule.forChild(billSettingsRoutes),
  ],
  declarations: [
    BillingSettingsMainComponent,
    BillingItemAddComponent,
    BillingItemListComponent,
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
    ReportingItemsAddComponent 
  ],
  bootstrap: []
})
export class BillingSettingsModule {

}
