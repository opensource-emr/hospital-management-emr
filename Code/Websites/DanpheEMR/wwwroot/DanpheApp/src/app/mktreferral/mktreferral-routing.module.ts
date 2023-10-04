import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { PageNotFound } from "../404-error/404-not-found.component";
import { MarketingreferralMainComponent as MarketingReferralMainComponent } from "./mktreferral-main.component";
import { MarketingReferralSettingsComponent } from "./mktreferral-settings/mktreferral-settings.component";
import { MarketingReferralReferringOrganizationComponent } from "./mktreferral-settings/referring-organization/mktreferral-setting-referring-organization.component";
import { MarketingReferralReferringPartyComponent } from "./mktreferral-settings/referring-party/mktreferral-setting-referring-party.component";
import { MarketingReferralTransactionComponent } from "./mktreferral-transaction/List-page/mktreferral-transaction.component";
import { MarketingReferralReportMainComponent } from "./reports/mktreferral-report-main.component";
import { MarketingReferralDetailReportsComponent } from "./reports/mktreferral-reports/mktreferral-reports.component";

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        redirectTo: 'Transaction',
        pathMatch: 'full'
      },
      {
        path: '',
        component: MarketingReferralMainComponent,
        children: [
          { path: 'Transaction', component: MarketingReferralTransactionComponent },
          { path: 'mktreferral-transaction-Add', component: MarketingReferralTransactionComponent },
          {
            path: 'Reports', component: MarketingReferralReportMainComponent,
            children: [
              { path: '', redirectTo: 'MarketingReferralDetailReport', pathMatch: 'full' },
              { path: 'MarketingReferralDetailReport', component: MarketingReferralDetailReportsComponent }
            ]
          },
          {
            path: 'Settings', component: MarketingReferralSettingsComponent,
            children: [
              { path: '', redirectTo: 'ReferringOrganization', pathMatch: 'full' },
              { path: 'ReferringOrganization', component: MarketingReferralReferringOrganizationComponent },
              { path: 'ReferringParty', component: MarketingReferralReferringPartyComponent }
            ]
          },
        ]
      },
      { path: "**", component: PageNotFound }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class MarketingReferralRoutingModule { }
