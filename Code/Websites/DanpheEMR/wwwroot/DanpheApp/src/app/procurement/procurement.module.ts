import { NgModule } from '@angular/core';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ProcurementComponent } from './procurement-main/procurement.component';
import { ADT_BLService } from '../adt/shared/adt.bl.service';
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { BillingBLService } from '../billing/shared/billing.bl.service';
import { CompanyEndPoint } from '../inventory/settings/shared/company/company.endpoint';
import { CompanyService } from '../inventory/settings/shared/company/company.service';
import { EmailEndPoint } from '../inventory/shared/email.endpoint';
import { EmailService } from '../inventory/shared/email.service';
import { GoodReceiptEndPoint } from './goods-receipt/good-receipt.endpoint';
import { GoodReceiptService } from './goods-receipt/good-receipt.service';
import { InventoryBLService } from '../inventory/shared/inventory.bl.service';
import { InventoryDLService } from '../inventory/shared/inventory.dl.service';
import { InventoryService } from '../inventory/shared/inventory.service';
import { PharmacyBLService } from '../pharmacy/shared/pharmacy.bl.service';
import { PharmacyDLService } from '../pharmacy/shared/pharmacy.dl.service';
import { WardSupplyBLService } from '../wardsupply/shared/wardsupply.bl.service';
import { WardSupplyDLService } from '../wardsupply/shared/wardsupply.dl.service';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InventorySharedModule } from '../inventory/shared/inventory-shared.module';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { SharedModule } from '../shared/shared.module';
import { ProcurementRoutingModule } from './procurement-routing.module';
import { PurchaseRequestListComponent } from './purchase-request/purchase-request-list/purchase-request-list.component';
import { PurchaseRequestViewComponent } from './purchase-request/purchase-request-view/purchase-request-view.component';
import { ProcurementBLService } from './shared/procurement.bl.service';
import { PurchaseOrderAddComponent } from './purchase-order/purchase-order-add/purchase-order-add.component';
import { PurchaseOrderListComponent } from './purchase-order/purchase-order-list/purchase-order-list.component';
import { PurchaseOrderViewComponent } from './purchase-order/purchase-order-view/purchase-order-view.component';
import { GoodsReceiptListComponent } from './goods-receipt/goods-receipt-list/goods-receipt-list.component';
import { GoodsReceiptAddComponent } from './goods-receipt/goods-receipt-add/goods-receipt-add.component';
import { GoodsReceiptViewComponent } from './goods-receipt/goods-receipt-view/goods-receipt-view.component';
import { QuotationListComponent } from './quotation/quotation-list/quotation-list.component';
import { QuotationAddComponent } from './quotation/quotation-add/quotation-add.component';
import { QuotationAnalysisComponent } from './quotation/quotation-analysis/quotation-analysis.component';
import { RequestForQuotationListComponent } from './quotation/request-for-quotation-list/request-for-quotation-list.component';
import { RequestForQuotationAddComponent } from './quotation/request-for-quotation-add/request-for-quotation-add.component';
import { QuotationBLService } from './quotation/quotation.bl.service';
import { VendorListComponent } from './vendor-list/vendor-list.component';
import { PurchaseOrderNpViewComponent } from './purchase-order/purchase-order-view/purchase-order-np-view/purchase-order-np-view.component';
import { GoodsReceiptNpViewComponent } from './goods-receipt/goods-receipt-view/goods-receipt-np-view/goods-receipt-np-view.component';
import { QuotationAnalysisNpComponent } from './quotation/quotation-analysis/quotation-analysis-np.component';
import { DonationGrViewComponent } from './goods-receipt/donation-gr-view/donation-gr-view.component';

@NgModule({
  providers: [
    ProcurementBLService, QuotationBLService,
    InventoryBLService,
    InventoryDLService, InventoryService, WardSupplyBLService,
    WardSupplyDLService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    GoodReceiptService,
    GoodReceiptEndPoint,
    CompanyService,
    CompanyEndPoint,
    EmailService,
    EmailEndPoint,
    PharmacyBLService,
    PharmacyDLService,
    VisitDLService,
    ADT_BLService,
    AppointmentDLService,
    BillingBLService, PurchaseRequestViewComponent,
    ADT_DLService],

  declarations: [ProcurementComponent,
    PurchaseRequestListComponent,
    PurchaseRequestViewComponent,
    PurchaseOrderAddComponent,
    PurchaseOrderListComponent,
    PurchaseOrderViewComponent,
    GoodsReceiptListComponent,
    GoodsReceiptAddComponent,
    GoodsReceiptViewComponent,
    QuotationListComponent,
    QuotationAddComponent,
    QuotationAnalysisComponent,
    QuotationAnalysisNpComponent,
    RequestForQuotationListComponent,
    RequestForQuotationAddComponent,
    VendorListComponent,
    PurchaseOrderNpViewComponent,
    GoodsReceiptNpViewComponent,
    DonationGrViewComponent
  ],

  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    ProcurementRoutingModule,
    SharedModule,
    DanpheAutoCompleteModule,
    InventorySharedModule,
  ]
})
export class ProcurementModule { }
