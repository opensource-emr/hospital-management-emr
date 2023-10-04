import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PageNotFound } from '../../404-error/404-not-found.component';
import { AuthGuardService } from '../../security/shared/auth-guard.service';
import { SharedModule } from '../../shared/shared.module';
import { UtilitiesSharedModule } from '../../utilities/shared/utilities-shared.module';
import { BillingPrintSharedModule } from '../print-pages/billing-print-shared.module';
import { BIL_DuplicatePrint_MainComponent } from './bill-duplicate-prints-main.component';
import { BIL_DuplicatePrint_CreditNoteListComponent } from './credit-notes/duplicate-credit-note-list.component';
import { BIL_DuplicatePrint_DepositListComponent } from './deposit/duplicate-deposit-list.component';
import { Bil_DuplicateDischargeStatementInvoiceListComponent } from './discharge-statement/bil-duplicate-discharge-statement-invoice-list.component';
import { BIL_DuplicatePrint_InvoiceListComponent } from './invoice/duplicate-invoice-list.component';
import { BIL_DuplicatePrint_OrganizationDepositListComponent } from './organization-deposit-receipts/bil-org-deposit-receipt-duplicate.component';
import { BIL_DuplicatePrint_ProvisionalListComponent } from './provisional/duplicate-provisional-list.component';
import { BIL_DuplicatePrint_SettlementListComponent } from './settlement/duplicate-settlement-list.component';

//declare all required routes of this module
//note: This can also be imported from different file, but since we have only 5-6 pages, we're declaring the routes here only.
export const dupPrintRoutes =
  [{
    path: '', component: BIL_DuplicatePrint_MainComponent,
    children: [
      { path: '', redirectTo: 'Invoice', pathMatch: 'full' },
      { path: 'Invoice', component: BIL_DuplicatePrint_InvoiceListComponent, canActivate: [AuthGuardService] },
      { path: 'InvoiceReturn', component: BIL_DuplicatePrint_CreditNoteListComponent, canActivate: [AuthGuardService] },
      { path: 'DepositReceipt', component: BIL_DuplicatePrint_DepositListComponent, canActivate: [AuthGuardService] },
      { path: 'CreditSettlementReceipt', component: BIL_DuplicatePrint_SettlementListComponent, canActivate: [AuthGuardService] },
      { path: 'ProvisionalReceipt', component: BIL_DuplicatePrint_ProvisionalListComponent, canActivate: [AuthGuardService] },
      { path: 'DischargeStatementReceipt', component: Bil_DuplicateDischargeStatementInvoiceListComponent, canActivate: [AuthGuardService] },
      { path: 'OrganizationDepositReceipts', component: BIL_DuplicatePrint_OrganizationDepositListComponent, canActivate: [AuthGuardService] },
      { path: "**", component: PageNotFound }

    ]
  }];



@NgModule({
  providers: [

    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild(dupPrintRoutes),
    SharedModule,
    BillingPrintSharedModule,
    UtilitiesSharedModule
  ],
  declarations: [
    BIL_DuplicatePrint_MainComponent,
    BIL_DuplicatePrint_InvoiceListComponent,
    BIL_DuplicatePrint_CreditNoteListComponent,
    BIL_DuplicatePrint_DepositListComponent,
    BIL_DuplicatePrint_ProvisionalListComponent,
    BIL_DuplicatePrint_SettlementListComponent,
    Bil_DuplicateDischargeStatementInvoiceListComponent,
    BIL_DuplicatePrint_OrganizationDepositListComponent
  ],
  bootstrap: []
})
export class Bil_DuplicatePrintsModule {

}
