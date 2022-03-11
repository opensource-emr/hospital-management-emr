import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFound } from '../404-error/404-not-found.component';
import { CssdMainComponent } from './cssd-main/cssd-main.component';
import { IntegratedCssdReportComponent } from './cssd-main/reports/integrated-cssd-report/integrated-cssd-report.component';
import { ReportsComponent } from './cssd-main/reports/reports.component';
import { SterilizationFinalizedItemsComponent } from './cssd-main/sterilization/sterilization-finalized-items/sterilization-finalized-items.component';
import { SterilizationPendingItemsComponent } from './cssd-main/sterilization/sterilization-pending-items/sterilization-pending-items.component';
import { SterilizationComponent } from './cssd-main/sterilization/sterilization.component';

const routes: Routes = [
  {
    path: '', component: CssdMainComponent,
    children: [
      { path: '', redirectTo: 'Sterilization', pathMatch: 'full' },
      {
        path: 'Sterilization', component: SterilizationComponent,
        children: [
          { path: '', redirectTo: 'PendingItems', pathMatch: 'full' },
          { path: 'PendingItems', component: SterilizationPendingItemsComponent },
          { path: 'FinalizedItems', component: SterilizationFinalizedItemsComponent },
          { path: '**', component: PageNotFound }
        ]
      },
      {
        path: 'Reports', component: ReportsComponent,
        children: [
          { path: '', redirectTo: 'IntegratedCSSD', pathMatch: 'full' },
          { path: 'IntegratedCSSD', component: IntegratedCssdReportComponent },
          { path: '**', component: PageNotFound }
        ]
      },
      { path: '**', component: PageNotFound }
    ]
  },
  { path: '**', component: PageNotFound }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CssdRoutingModule { }
