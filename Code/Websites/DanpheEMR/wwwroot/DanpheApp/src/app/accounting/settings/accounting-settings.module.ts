/// <reference path="shared/accounting-settings.bl.service.ts" />
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete/danphe-auto-complete.module';
import { AccountingSettingsRoutingModule } from './accounting-settings-routing.module';
import { AccountingSettingsComponent } from './accounting-settings.component';

import { ItemsAddComponent } from './items/item-add.component';
import { ItemListComponent } from './items/item-list';

import { LedgersAddComponent } from './ledgers/ledger-add.component';
import { LedgersEditComponent } from './ledgers/ledger-edit.component';
import { LedgerListComponent } from './ledgers/ledger-list';

import { VouchersAddComponent } from './vouchers/voucher-add.component';
import { VoucherListComponent } from './vouchers/voucher-list';

import { AccountingSettingsBLService } from './shared/accounting-settings.bl.service';
import { AccountingSettingsDLService } from './shared/accounting-settings.dl.service';

import { LedgerGroupAddComponent } from './ledgersgroup/ledger-group-add.component';
import { LedgerGroupListComponent } from './ledgersgroup/ledger-group-list';
import { LedgerGroupVoucherManageComponent } from './ledgersgroup/ledgergroup-voucher-manage.component';

import { FiscalYearAddComponent } from './fiscalyear/fiscalyear-add.component';
import { FiscalYearListComponent } from './fiscalyear/fiscalyear-list';

import { CostCenterItemListComponent } from './costcenter/cost-center-item-list';

import { SharedModule } from '../../shared/shared.module';
import { LedgerGroupCategoryAddComponent } from './ledgersgroupcategory/ledger-group-category-add.component';
import { LedgerGroupCategoryListComponent } from './ledgersgroupcategory/ledger-group-category-list';

import { VoucherHeadAddComponent } from './voucherhead/voucher-head-add';
import { VoucherHeadListComponent } from './voucherhead/voucher-head-list';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { MedicareBLService } from '../../insurance/medicare/shared/medicare.bl.service';
import { MedicareDLService } from '../../insurance/medicare/shared/medicare.dl.service';
import { COAListComponent } from '../settings/coa/coa-list.component';
import { TransferRulesComponent } from '../settings/transfer-rules/transfer-rules.component';
import { BankReconciliationCategoryLedgerMappingComponent } from './ledger-mapping/bank-reconciliation-category-mapping/bank-reconciliation-mapping';
import { BillingLedgerMappingComponent } from './ledger-mapping/billing-ledger/billing-ledger-mapping.component';
import { Old_BillingLedgerMappingComponent } from './ledger-mapping/billing-ledger/old-billing-ledger-mapping.component';
import { ConsultantLedgerMappingComponent } from './ledger-mapping/consultant-ledger-mapping/consultant-ledger-mapping.component';
import { CreditOrganizationLedgerMappingComponent } from './ledger-mapping/credit-org-ledger-mapping/credit-org-ledger-mapping.component';
import { InventorySubcategoryLedgerMappingComponent } from './ledger-mapping/inv-subcategory-ledger-mapping/inv-subcategory-ledger-mapping.component';
import { InventoryVendorLedgerMappingComponent } from './ledger-mapping/inv-vendor-ledger-mapping/inv-vendor-ledger-mapping.component';
import { LedgerMappingComponent } from './ledger-mapping/ledger-mapping.component';
import { MedicareTypesLedgerMappingComponent } from './ledger-mapping/medicare-types-ledger-mapping/medicare-type-ledger-mapping.component';
import { PaymentModeLedgerMappingComponent } from './ledger-mapping/payment-mode-ledger-mapping/payment-mode-ledger-mapping.component';
import { PharmacySupplierLedgerMappingComponent } from './ledger-mapping/phrm-supplier-ledger-mapping/phrm-supplier-ledger-mapping.component';
import { ReverseTransaction } from './reverse-transaction/reverse-transaction.component';
import { SectionListComponent } from './section/section-list';
import { SubLedgerComponent } from './subLedger/sub-ledger.component';
///import { CommonFunctions } from '../../shared/common.functions';
@NgModule({
    providers: [AccountingSettingsBLService, AccountingSettingsDLService, MedicareBLService, MedicareDLService,
        { provide: LocationStrategy, useClass: HashLocationStrategy }],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        DanpheAutoCompleteModule,
        AccountingSettingsRoutingModule,
        SharedModule, ScrollingModule],
    declarations: [
        AccountingSettingsComponent,
        ItemsAddComponent,
        ItemListComponent,
        LedgersAddComponent,
        LedgerListComponent,
        VouchersAddComponent,
        VoucherListComponent,
        LedgerGroupListComponent,
        LedgerGroupAddComponent,
        LedgerGroupVoucherManageComponent,
        FiscalYearListComponent,
        FiscalYearAddComponent,
        CostCenterItemListComponent,
        LedgerGroupCategoryListComponent,
        LedgerGroupCategoryAddComponent,
        VoucherHeadListComponent,
        VoucherHeadAddComponent,
        LedgersEditComponent,
        ReverseTransaction,
        SectionListComponent,
        COAListComponent,
        TransferRulesComponent,
        LedgerMappingComponent,
        Old_BillingLedgerMappingComponent,
        ConsultantLedgerMappingComponent,
        CreditOrganizationLedgerMappingComponent,
        PharmacySupplierLedgerMappingComponent,
        InventoryVendorLedgerMappingComponent,
        InventorySubcategoryLedgerMappingComponent,
        PaymentModeLedgerMappingComponent,
        BankReconciliationCategoryLedgerMappingComponent,
        SubLedgerComponent,
        BillingLedgerMappingComponent,
        MedicareTypesLedgerMappingComponent
    ],

    bootstrap: [AccountingSettingsComponent]
})
export class AccountingSettingsModule { }
