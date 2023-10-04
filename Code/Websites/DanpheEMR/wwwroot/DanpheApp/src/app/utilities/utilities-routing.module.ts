import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { PageNotFound } from "../404-error/404-not-found.component";
import { AuthGuardService } from "../security/shared/auth-guard.service";
import { ChangeBillingCounterComponent } from "./change-billing-counter/change-billing-counter.component";
import { ChangeSchemePriceCategoryComponent } from "./change-visit-scheme/change-scheme-price-category.component";
import { OrganizationDepositComponent } from "./organization-deposit/organization-deposit/organization-deposit.component";
import { SchemeRefundListComponent } from "./scheme-refund/list/scheme-refund-list.component";
import { ActivateBillingCounterGuardService } from "./shared/activate-billing-counter-guard-service";
import { UtilitiesMainComponent } from "./utilities-main.component";
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: UtilitiesMainComponent,
        children: [
          { path: 'SchemeRefund', component: SchemeRefundListComponent, canActivate: [AuthGuardService, ActivateBillingCounterGuardService], data: { currentRoute: 'Utilities/SchemeRefund' } },
          { path: 'ChangeVisitScheme', component: ChangeSchemePriceCategoryComponent, canActivate: [AuthGuardService] },
          { path: 'ChangeBillingCounter', component: ChangeBillingCounterComponent, canActivate: [AuthGuardService] },
          { path: 'OrganizationDeposit', component: OrganizationDepositComponent, canActivate: [AuthGuardService, ActivateBillingCounterGuardService], data: { currentRoute: 'Utilities/OrganizationDeposit' } }
        ]
      },
      { path: "**", component: PageNotFound }
    ])
  ],
  exports: [
    RouterModule
  ]
})

export class UtilitiesRoutingModule {

}
