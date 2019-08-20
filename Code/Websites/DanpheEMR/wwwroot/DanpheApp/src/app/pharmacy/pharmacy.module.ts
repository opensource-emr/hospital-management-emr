
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";


//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { SharedModule } from "../shared/shared.module";
import { PharmacyRoutingModule } from "./pharmacy-routing.module";

import { PharmacyBLService } from "./shared/pharmacy.bl.service"
import { PharmacyDLService } from './shared/pharmacy.dl.service';
import { PharmacyService } from './shared/pharmacy.service';
import { ReportingService } from "../reporting/shared/reporting-service";
import { PhrmRackService } from './shared/rack/phrm-rack.service';
import { PhrmRackEndPoint } from './shared/rack/phrm-rack.endpoint';

import { PhrmRackComponent } from "./rack/phrm-rack.component";
import { PharmacyMainComponent } from "./pharmacy-main.component";
import { BillingMainComponent } from "./billing/billing-main.component"
import { OrderMainComponent } from "./order/order-main.component"
import { PatientMainComponent } from "./patient/patient-main.component"
import { PrescriptionMainComponent } from "./prescription/prescription-main.component"
import { ReportMainComponent } from "./report/report-main.component"
import { SaleMainComponent } from "./sale/sale-main.component"
import { StockMainComponent } from "./stock/stock-main.component"
import { SettingMainComponent } from "./setting/setting-main.component"
import { PHRMSupplierManageComponent } from "./setting/phrm-supplier-manage.component"
import { PHRMPurchaseOrderItemsComponent } from "./order/phrm-purchase-order-items.component"
import { PHRMCompanyManageComponent } from "./setting/phrm-company-manage.component"
import { PHRMCategoryManageComponent } from "./setting/phrm-category-manage.component"
import { PHRMUnitOfMeasurementManageComponent } from "./setting/phrm-unit-of-measurement-manage.component"
import { PHRMItemTypeManageComponent } from "./setting/phrm-item-type-manage.component"
import { PHRMGenericManageComponent } from "./setting/phrm-generic-manage.component"
import { PHRMPatientListComponent } from "./patient/phrm-patient-list.component"
import { PHRMPatientComponent } from "./patient/phrm-patient.component"
import { PHRMPrescriptionComponent } from "./prescription/phrm-prescription.component"
import { PHRMItemMasterManageComponent } from "./setting/phrm-item-manage.component"
import { PHRMGoodsReceiptListComponent } from "./order/phrm-goods-receipt-list.component"
import { PHRMTAXManageComponent } from "./setting/phrm-tax-manage.component"
import { PHRMPurchaseOrderListComponent } from "./order/phrm-purchase-order-list.component"
import { PHRMGoodsReceiptItemsComponent } from "./order/phrm-goods-receipt-items.component"
import { PHRMStockDetailsListComponent } from "./stock/phrm-stock-details-list.component";
import { PHRMPurchaseOrderReportComponent } from "./report/phrm-purchase-order-report.component"
import { PHRMItemWiseStockReportComponent } from "./report/phrm-itemwise-stock-report.component"
import { PharmacyDashboardComponent } from '../dashboards/pharmacy/pharmacy-dashboard.component';
import { PHRMPrescriptionListComponent } from "./prescription/phrm-prescription-list.component";
import { PHRMWriteOffItemComponent } from "./stock/phrm-write-off-items.component";
import { PHRMWriteOffListComponent } from "./stock/phrm-write-off-items-list.component"
import { PHRMSaleComponent } from "./sale/phrm-sale.component"
import { PHRMSaleListComponent } from "./sale/phrm-sale-list.component";
import { PHRMStockManageComponent } from "./stock/phrm-stock-manage.component";
import { PHRMStockBatchItemListComponent } from "./stock/phrm-stock-batch-item-list.component";
import { PHRMSaleCreditComponent } from "./sale/phrm-sale-credit.component"
import { PHRMSaleReturnComponent } from "./sale/phrm-sale-return.component";
import { PHRMReceiptPrintComponent } from "./sale/phrm-receipt-print.component"
import { PharmacyReceiptComponent } from "./receipt/pharmacy-receipt.component";
import { PHRMSupplierInformationReportComponent } from './report/phrm-supplier-information-report.component';
import { PHRMCreditInOutPatientReportComponent } from './report/phrm-credit-in-out-patient-report.component';
import { PHRMStockItemsReportComponent } from './report/phrm-stock-items-report.component';
import { PHRMSupplierStockSummaryReportComponent } from './report/phrm-supplier-stock-summary-report.component';
import { PHRMStockMovementReportComponent } from './report/phrm-stock-movement-report.component';
import { PHRMBatchStockReportComponent } from './report/phrm-batch-stock-report.component';
import { PHRMSupplierStockReportComponent } from './report/phrm-supplier-stock-report.component';
import { PHRMEndingStockSummaryReportComponent } from './report/phrm-ending-stock-summary-report.component';
import { PHRMBillingReportComponent } from './report/phrm-billing-report.component';
import { PHRMDailyStockSummaryReportComponent } from './report/phrm-daily-stock-summary-report.component';
import { PHRMExpiryReportComponent } from './report/phrm-expiry-report.component';
import { PHRMMinStockComponent } from './report/phrm-minstock.component';
import { PHRMDailySalesSummaryComponent } from './report/phrm-daily-sales-summary.component';
import { PHRMABCVEDReportComponent } from './report/phrm-abcved-report.component';
import { PharmacyCounterActivateComponent } from './counter/pharmacy-counter-activate.component'
import { PHRMStockTxnItemsManageComponent } from './setting/phrm-stock-txn-items-manage.component';
import { PHRMUserwiseCollectionReportComponent } from './report/phrm-userwise-collection-report.component';
import { PHRMCounterwiseCollectionReportComponent } from './report/phrm-counterwise-collection-report.component';
import { PHRMReturnListComponent } from './sale/phrm-return-list.component';
import { PHRMSaleReturnReportComponent } from './report/phrm-sale-return-report';
import { phrmitemaddComponent } from './common/phrmitem-add.component';
import { PHRMCompanyAddComponent } from './common/company/company-add';
import { PHRMBreakageItemReportComponent } from "./report/phrm-breakage-item-report.component";
import { PHRMGoodsReceiptProductReportComponent } from "./report/phrm-good-receipt-product-report.component";
import { PHRMGenericAddComponent } from './common/Generic/generic-add.component';
import { PhrmRackAddComponent } from './rack/phrm-rack-add.component';
import { PhrmRackDrugListComponent } from './rack/phrm-rack-drug-list.component';
//import { PrintHeaderComponent } from '../shared/print-header/print-header';
import { PHRMCreditBillsComponent } from './sale/credit-billing/phrm-credit-bills.component';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { BillingDLService } from '../billing/shared/billing.dl.service';
import { AdmissionDLService } from '../admission/shared/admission.dl.service';
import { PHRMStockManageReportComponent } from "./report/phrm-stock-manage-report.component";
import { PHRMStoreDetailsListComponent } from "./store/phrm-store-details-list.component";
import { PHRMReturnItemsToSupplierComponent } from "./store/phrm-return-items-to-supplier.component";
import { PHRMReturnItemToSupplierListComponent } from "./store/phrm-return-item-to-supplier-list.component";
import { PHRMDrugCategoryWiseReportComponent } from "./report/phrm-drug-categorywise-report.component";

//sud:30Sept'18--to replace ng-autocomplete with danphe-autocomplete
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { PHRMProvisionalItems } from "./provisional-items/phrm-provisional-items.component"
import { PHRMDispatchComponent } from './sale/phrm-dispatch.component';
import { PatientsBLService } from '../patients/shared/patients.bl.service';
import { PHRMDepositAdd } from './patient/phrm-deposit-add.component';
import { PHRMStockListComponent } from './stock/StockList/phrm-stock-list';
import { WardRequisitionItems } from './ward-requisition/Ward-requisition.component';
import { WardSupplyBLService } from '../wardsupply/shared/wardsupply.bl.service';
import { WardSupplyDLService } from '../wardsupply/shared/wardsupply.dl.service';
import { StoreMainComponent } from './store/store-main.component';
import { PHRMDispensaryManageComponent } from "./setting/phrm-dispensary-manage.component";
import { PHRMReturnToSupplierReportComponent } from './report/phrm-return-to-supplier-report.component';
import { AccountingMainComponent } from './accounting/accounting-main.component';
import { PHRMSuppliersListComponent } from './accounting/phrm-acc-supplier-list.component';
import { PHRMDepositBalanceReport } from '../pharmacy/report/phrm-deposit-balance-report.component';
import { PHRMSalesDetailsListComponent } from './store/phrm-sales-category-list.component';
@NgModule({
  providers: [
    PharmacyBLService,
    PharmacyDLService,
    PharmacyService,
    ReportingService,
    PhrmRackService,
    PhrmRackEndPoint,
    VisitDLService,//remove this later: sud:4sept'18
    PatientsDLService,//remove this later: sud:4sept'18
    AppointmentDLService,//remove this later: sud:4sept'18
    BillingDLService,//remove this later: sud:4sept'18
    AdmissionDLService,//remove this later: sud:4sept'18
    PatientsBLService,
    WardSupplyBLService,
    WardSupplyDLService,
    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  imports: [PharmacyRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    // Ng2AutoCompleteModule,
    SharedModule,
    DanpheAutoCompleteModule
  ],
  declarations: [
    //All components here
    PharmacyMainComponent,
    BillingMainComponent,
    OrderMainComponent,
    PatientMainComponent,
    PrescriptionMainComponent,
    ReportMainComponent,
    SaleMainComponent,
    StockMainComponent,
    SettingMainComponent,
    AccountingMainComponent,
    PHRMSupplierManageComponent,
    PHRMPurchaseOrderItemsComponent,
    PHRMCompanyManageComponent,
    PHRMCategoryManageComponent,
    PHRMUnitOfMeasurementManageComponent,
    PHRMItemTypeManageComponent,
    PHRMPatientListComponent,
    PHRMPatientComponent,
    PHRMPrescriptionComponent,
    PHRMPurchaseOrderListComponent,
    PHRMGoodsReceiptItemsComponent,
    PHRMItemMasterManageComponent,
    PHRMGoodsReceiptListComponent,
    PHRMTAXManageComponent,
    PHRMPurchaseOrderReportComponent,
    PHRMItemWiseStockReportComponent,
    PHRMPrescriptionListComponent,
    PHRMStockDetailsListComponent,
    PharmacyDashboardComponent,
    PHRMWriteOffItemComponent,
    PHRMSaleComponent,
    PHRMWriteOffListComponent,
    PHRMSaleListComponent,
    PHRMStockManageComponent,
    PHRMStockBatchItemListComponent,
    PHRMSaleCreditComponent,
    PHRMSaleReturnComponent,
    PHRMReceiptPrintComponent,
    PharmacyReceiptComponent,
    PHRMDailySalesSummaryComponent,
    PHRMSupplierInformationReportComponent,
    PHRMCreditInOutPatientReportComponent,
    PHRMStockItemsReportComponent,
    PHRMSupplierStockSummaryReportComponent,
    PHRMStockMovementReportComponent,
    PHRMBatchStockReportComponent,
    PHRMSupplierStockReportComponent,
    PHRMEndingStockSummaryReportComponent,
    PHRMBillingReportComponent,
    PHRMDailyStockSummaryReportComponent,
    PHRMExpiryReportComponent,
    PHRMMinStockComponent,
    PHRMGenericManageComponent,
    PHRMABCVEDReportComponent,
    PharmacyCounterActivateComponent,
    PHRMStockTxnItemsManageComponent,
    PHRMUserwiseCollectionReportComponent,
    PHRMCounterwiseCollectionReportComponent,
    PHRMReturnListComponent,
    PHRMSaleReturnReportComponent,
    phrmitemaddComponent,
    PHRMBreakageItemReportComponent,
    PHRMGoodsReceiptProductReportComponent,
    PHRMCompanyAddComponent,
    PHRMGenericAddComponent,
    PHRMGoodsReceiptProductReportComponent,
    PhrmRackComponent,
    PhrmRackAddComponent,
    PhrmRackDrugListComponent,
    PHRMCreditBillsComponent,
    PhrmRackDrugListComponent,
    //PrintHeaderComponent,
    PHRMStockManageReportComponent,
    PHRMProvisionalItems,
    PHRMDispatchComponent,
    PHRMDepositAdd,
    PHRMStockListComponent,
    WardRequisitionItems,
    StoreMainComponent,
    PHRMStoreDetailsListComponent,
    PHRMReturnItemToSupplierListComponent,
    PHRMReturnItemsToSupplierComponent,
    PHRMDispensaryManageComponent,
    PHRMReturnToSupplierReportComponent,
    PHRMSuppliersListComponent,
    PHRMDrugCategoryWiseReportComponent,
    PHRMDepositBalanceReport,
    PHRMSalesDetailsListComponent
  ],
  bootstrap: []
})
export class PharmacyModule { }

