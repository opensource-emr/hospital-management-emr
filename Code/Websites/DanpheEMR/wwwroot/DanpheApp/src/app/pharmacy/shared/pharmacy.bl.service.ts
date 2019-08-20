import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment/moment';

import { PharmacyDLService } from "./pharmacy.dl.service"
import { PHRMSupplierModel } from "./phrm-supplier.model"
import { PHRMCategoryModel } from "./phrm-category.model"
import { PHRMCompanyModel } from "./phrm-company.model"
import { PHRMItemTypeModel } from "./phrm-item-type.model"
import { PHRMItemMasterModel } from "./phrm-item-master.model"
import { PHRMUnitOfMeasurementModel } from "./phrm-unit-of-measurement.model"
import { PHRMTAXModel } from "./phrm-tax.model"
import { PHRMPurchaseOrder } from "./phrm-purchase-order.model"
import { PHRMPatient } from "./phrm-patient.model"
import { PHRMGoodsReceiptModel } from "./phrm-goods-receipt.model"
import { PHRMGoodsReceiptViewModel } from "./phrm-goods-receipt-vm.model"
import { PHRMReportsModel } from "./phrm-reports-model"
import { PHRMPrescription } from "./phrm-prescription.model";
import { PHRMInvoiceModel } from "./phrm-invoice.model";
import { PHRMReturnToSupplierModel } from "./phrm-return-to-supplier.model"
import { PHRMWriteOffModel } from "./phrm-write-off.model"
import { PHRMGoodsReceiptItemsModel } from "./phrm-goods-receipt-items.model"
import { PHRMInvoiceReturnItemsModel } from "./phrm-invoice-return-items.model";
import { PHRMInvoiceItemsModel } from "./phrm-invoice-items.model";
import { PHRMGenericModel } from '../shared/phrm-generic.model';
import { PHRMDepositModel } from '../shared/phrm-deposit.model';

import { WardRequisitionModel } from '../../wardsupply/shared/ward-requisition.model';
import { DrugsRequistionItemModel } from "../../nursing/shared/drugs-requistion-items.model";
import { WardispatchModel } from '../../wardsupply/shared/ward-dispatch.model';
import { PHRMDispensaryModel } from './phrm-dispensary.model';
@Injectable()
export class PharmacyBLService {

  constructor(public pharmacyDLService: PharmacyDLService) {

  }
  //GET: setting-supplier manage : list of suppliers
  public GetSupplierList() {
    return this.pharmacyDLService.GetSupplierList()
      .map(res => { return res });
  }

  ///GET: Get SupplierDetails by SupplierId for Create Order purpose
  public GetSupplierDetailsBySupplierId(SupplierId) {
    return this.pharmacyDLService.GetSupplierDetailsBySupplierId(SupplierId)
      .map((responseData) => {
        return responseData;
      });
  }
  ///GET: setting-Itemtype and  getting ItemTypelist in Create order
  public GetItemTypeList() {
    return this.pharmacyDLService.GetItemTypeList()
      .map((responseData) => {
        return responseData;
      });
  }
  // GET: Get the counters available in pharmacy 
  public GetAllPharmacyCounters() {
    return this.pharmacyDLService.GetCounter()
      .map((responseDate) => {
        return responseDate;
      });
  }

  public DeActivateCounter() {
    return this.pharmacyDLService.DeActivatePharmacyCounter()
      .map(res => {
        return res;
      });
  }


  public ActivateCounter(counterId: number, counterName: string) {
    return this.pharmacyDLService.ActivatePharmacyCounter(counterId, counterName)
      .map(res => {
        return res;
      });
  }
  //GET: Get ItemType List with all List of Item Master data
  public GetItemTypeListWithItems() {
    try {
      return this.pharmacyDLService.GetItemTypeListWithItems()
        .map((responseData) => {
          return responseData;
        });
    }
    catch (ex) {
      throw ex;
    }
  }

  //GET: Get ItemType List with Rack No
  public GetRackByItem(itemId) {
    try {
      return this.pharmacyDLService.GetRackByItem(itemId)
        .map((responseData) => {
          return responseData;
        });
    }
    catch (ex) {
      throw ex;
    }
  }




  //GET: Get Itemlist by ItemType id
  public GetItemListByItemTypeId(itemTypeId) {
    return this.pharmacyDLService.GetItemListByItemTypeId(itemTypeId)
      .map((responseData) => {
        return responseData;
      });
  }
  //Get: Get all Items in pharmacy
  public GetAllItems() {
    return this.pharmacyDLService.GetAllItems()
      .map((responseData) => {
        return responseData;
      });
  }

  //GET: setting-company manage : list of companies
  public GetCompanyList() {
    return this.pharmacyDLService.GetCompanyList()
      .map(res => { return res });
  }
  //GET: setting-category manage : list of categories
  public GetCategoryList() {
    return this.pharmacyDLService.GetCategoryList()
      .map(res => { return res });
  }
  //GET: setting-unit of measurement manage : list of unit of measurements
  public GetUnitOfMeasurementList() {
    return this.pharmacyDLService.GetUnitOfMeasurementList()
      .map(res => { return res });
  }
  //GET: setting-item manage : list of items
  public GetItemList() {
    return this.pharmacyDLService.GetItemList()
      .map(res => { return res });
  }
  //GET: setting-tax manage : list of tax
  public GetTAXList() {
    return this.pharmacyDLService.GetTAXList()
      .map(res => { return res });
  }
  public GetGenericList() {
    return this.pharmacyDLService.GetGenericList()
      .map(res => { return res });
  }
  //GET: Patient List
  public GetPatients() {
    return this.pharmacyDLService.GetPatients()
      .map(res => { return res })
  }
  public GetPatientsListForSaleItems() {
    return this.pharmacyDLService.GetPatientsListForSaleItems()
      .map(res => { return res })
  }
  //GET: Get Matching Patient List for checking patient is already registered or not
  public GetExistedMatchingPatientList(firstName, lastName, phoneNumber) {
    try {
      return this.pharmacyDLService.GetExistedMatchingPatientList(firstName, lastName, phoneNumber)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }
  //GET: Order->OrderList : getting List of All PurchaseOrder
  public GetPHRMPurchaseOrderList(Status: string) {
    return this.pharmacyDLService.GetPHRMPurchaseOrderList(Status)
      .map(res => { return res });
  }
  ///GET: All POItems By POID
  public GetPHRMPOItemsByPOId(PurchaseOrderId) {
    return this.pharmacyDLService.GetPHRMPOItemsByPOId(PurchaseOrderId)
      .map(res => { return res }
      );
  }
  //////GET: All POItems For GoodsReceipt
  public GetPHRMPOItemsForGR(PurchaseOrderId) {
    return this.pharmacyDLService.GetPHRMPOItemsForGR(PurchaseOrderId)
      .map(res => { return res });
  }

  //GET: To get provisional Items List
  public GetPHRMProvisionalItemList(Status: string) {
    return this.pharmacyDLService.GetPHRMProvisionalItemList(Status)
      .map(res => { return res });
  }

  //GET: To get provisional Items List
  public GetAllPHRMProvisionalItemList() {
    return this.pharmacyDLService.GetAllPHRMProvisionalItemList()
      .map(res => { return res });
  }

  //GET: Requsted drug-list by patientId and VisitId(used in Emergency)--added by Anish 25 Feb Anish
  public GetAllDrugOrderOfERPatient(patientId: number, visitId: number) {
    return this.pharmacyDLService.GetAllDrugOrderOfERPatient(patientId, visitId)
      .map(res => { return res });
  }


  //GET: To get provisional Items List.
  public GetPHRMDrugsItemList(requisitionID) {
    return this.pharmacyDLService.GetPHRMDrugsItemList(requisitionID)
      .map(res => { return res });
  }

  public GetPHRMDrugsDispatchList(requisitionId) {
    return this.pharmacyDLService.GetPHRMDrugDispatchList(requisitionId)
      .map(res => { return res });
  }

  /////GET: All Return TO Supplier Item list By ReturnToSupplierID
  public GetReturnToSupplierItemsByRetSuppId(ReturnToSupplierId) {
    return this.pharmacyDLService.GetReturnToSupplierItemsByRetSuppId(ReturnToSupplierId)
      .map(res => { return res }
      );
  }



  /////GET: All WriteOff Items By WriteOff ID
  public GetWriteOffItemsByWriteOffId(writeOffId) {
    try {
      return this.pharmacyDLService.GetWriteOffItemsByWriteOffId(writeOffId)
        .map(res => { return res }
        );
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: order-goods receipt list
  public GetGoodsReceiptList() {
    return this.pharmacyDLService.GetGoodsReceiptList()
      .map(res => { return res });
  }
  //GET: Supplier account detail list
  public GetAccountDetailsList() {
    return this.pharmacyDLService.GetAccountDetailsList()
      .map(res => { return res });
  }
  public GetEachAccountDetailsList(SupplierID) {
    return this.pharmacyDLService.GetEachAccountDetailsList(SupplierID)
      .map(res => { return res });
  }
  public GetStoreList() {
    return this.pharmacyDLService.GetStoreList()
      .map(res => { return res });
  }
  //GET: Return Items To Supplier list
  public GetReturnItemsToSupplierList() {
    return this.pharmacyDLService.GetReturnItemsToSupplierList()
      .map(res => { return res });
  }


  //GET: WriteOff List With SUM of Toatal WriteOff Qty
  public GetWriteOffList() {
    try {
      return this.pharmacyDLService.GetWriteOffList()
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }

  ///GET:GET Stock Detail List
  public GetStockDetailsList() {
    return this.pharmacyDLService.GetStockDetailsList()
      .map(res => { return res });
  }

  ///GET:GET Sales Detail List
  public GetSalesDetailsList() {
    return this.pharmacyDLService.GetSalesDetailsList()
      .map(res => { return res });
  }

  // Get Items List
  public GetItemsList() {
    return this.pharmacyDLService.GetItemsList()
      .map(res => { return res });
  }



  //GET: order-goods receipt items-view  by GR-Id
  public GetGRItemsByGRId(GoodsReceiptId) {
    return this.pharmacyDLService.GetGRItemsByGRId(GoodsReceiptId)
      .map(res => { return res });
  }
  //////GET: Get All Batch No By Item Id 
  public GetBatchNoByItemId(ItemId) {
    try {
      return this.pharmacyDLService.GetBatchNoByItemId(ItemId)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  /////GET: Get All Item Details By Batch No
  public GetItemDetailsByBatchNo(BatchNo, ItemId) {
    try {
      return this.pharmacyDLService.GetItemDetailsByBatchNo(BatchNo, ItemId)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }

  ////GET: Get Purchase Order Report 
  public GetPHRMPurchaseOrderReport(phrmReports: PHRMReportsModel) {
    return this.pharmacyDLService.GetPHRMPurchaseOrderReport(phrmReports)
      .map((responseData) => {
        return responseData;
      });
  }

  //GET : Get Userwise Report
  public GetPHRMUserwiseCollectionReport(phrmReports: PHRMReportsModel) {
    return this.pharmacyDLService.GetPHRMUserwiseCollectionReport(phrmReports)
      .map((responseData) => {
        return responseData;
      });
  }

  //GET : Get Sale Return Report
  public GetPHRMSaleReturnReport(phrmReports: PHRMReportsModel) {
    return this.pharmacyDLService.GetSaleReturnReport(phrmReports)
      .map((responseData) => {
        return responseData;
      });
  }

  //GET : Get Counterwise Report
  public GetPHRMCounterwiseCollectionReport(phrmReports: PHRMReportsModel) {
    return this.pharmacyDLService.GetPHRMCounterwiseCollectionReport(phrmReports)
      .map((responseData) => {
        return responseData;
      });
  }

  // GET : Get Breakage Item details Report
  public GetPHRMBreakageItemReport(phrmReports: PHRMReportsModel) {
    return this.pharmacyDLService.GetPHRMBreakageItemReport(phrmReports)
      .map((responseData) => {
        return responseData;
      });
  }

  // GET : Get Return To Supplier Report
  public GetPHRMReturnToSupplierReport(phrmReports: PHRMReportsModel) {
    return this.pharmacyDLService.GetPHRMReturnToSupplierReport(phrmReports)
      .map((responseData) => {
        return responseData;
      });
  }

  //GET : Get stock manage details report
  public GetPHRMStockManageDetailReport(phrmReports: PHRMReportsModel) {
    return this.pharmacyDLService.GetPHRMStockManageDetailReport(phrmReports)
      .map((responseData) => {
        return responseData;
      });
  }

  //GET : Get deposit balance report
  public GetPHRMDepositBalanceReport() {
    return this.pharmacyDLService.GetPHRMDepositBalanceReport()
      .map((responseData) => {
        return responseData;
      });
  }
  // GET : Get Goods Receipt Product Report
  public GetPHRMGoodsReceiptProductReport(phrmReports: PHRMReportsModel, itemId) {
    return this.pharmacyDLService.GetPHRMGoodsReceiptProductReport(phrmReports, itemId)
      .map((responseData) => {
        return responseData;
      });
  }

  // GET : Get Drug Category Wise Report
  public GetPHRMDrugCategoryWiseReport(phrmReports: PHRMReportsModel, category) {
    return this.pharmacyDLService.GetPHRMDrugCategoryWiseReport(phrmReports, category)
      .map((responseData) => {
        return responseData;
      });
  }

  ///GET: Get Item wise Stock Report 
  public GetPHRMDispensaryStoreReport(phrmReports: PHRMReportsModel) {
    return this.pharmacyDLService.GetPHRMDispensaryStoreReport(phrmReports)
      .map((responseData) => {
        return responseData;
      });
  }
  ////GET: GET ItemList  Whose Available Qty is greater then zero
  public GetItemListWithTotalAvailableQty() {
    try {
      return this.pharmacyDLService.GetItemListWithTotalAvailableQty()
        .map((responseData) => {
          return responseData;
        });
    }
    catch (ex) {
      throw ex;
    }
  }

  //GET: STOCK : get stock manage by ItemId
  public GetStockManageByItemId(ItemId) {
    try {
      return this.pharmacyDLService.GetStockManageByItemId(ItemId)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: Return to supplier items of existing gr
  public GetReturnToSupplierItemsofExistingGR() {
    try {
      return this.pharmacyDLService.GetReturnToSupplierItemsofExistingGR()
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: Doctor details list
  //get doctors list
  public GetDoctorList() {
    return this.pharmacyDLService.GetDoctorList()
      .map(res => res);
  }

  public GetPatientSummary(patientId: number) {
    return this.pharmacyDLService.GetPatientSummary(patientId)
      .map((responseData) => {
        return responseData;
      })
  }

  //GET: Prescription List group by PatientName, DoctorName and CreatedDate
  public GetPrescriptionList() {
    try {
      return this.pharmacyDLService.GetPrescriptionList()
        .map(res => res);
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: Prescription Items list by PatientId && ProviderId for sale purpose
  public GetPrescriptionItems(PatientId: number, ProviderId: number) {
    try {
      return this.pharmacyDLService.GetPrescriptionItems(PatientId, ProviderId)
        .map(res => res);
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: sale invoice list data
  public GetSaleInvoiceList(fromDate, toDate) {
    try {
      return this.pharmacyDLService.GetSaleInvoiceList(fromDate, toDate)
        .map(res => res);
    }
    catch (ex) {
      throw ex;
    }
  }

  public GetSaleReturnList() {
    try {
      return this.pharmacyDLService.GetSaleReturnList()
        .map(res => res);
    }
    catch (ex) {
      throw ex;
    }
  }

  //GET: Sale Invoice Items data by Invoice Id
  public GetSaleInvoiceItemsByInvoiceId(invoiceId: number) {
    try {
      return this.pharmacyDLService.GetSaleInvoiceItemsByInvoiceId(invoiceId)
        .map(res => res);
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: Get GR Items as Stock details by ItemId 
  //Only get GR Items details with fullfill condition => AvailableQty > 0
  public GetGRItemsByItemId(itemId) {
    try {
      return this.pharmacyDLService.GetGRItemsByItemId(itemId)
        .map(res => res);
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: Get ReturnFromCustomer Invoice Model data for Return from customer functionality fulfill
  //passing Invoice Id and getting InvoiceReturnItemsModel
  //this for return from customer to pharmacy                
  public GetReturnFromCustomerModelDataByInvoiceId(invoiceId: number,fiscYrId) {
    try {
      return this.pharmacyDLService.GetReturnFromCustomerModelDataByInvoiceId(invoiceId,fiscYrId)
        .map(res => res);
    }
    catch (ex) {
      throw ex;
    }
  }
  public GetAllFiscalYears() {
    return this.pharmacyDLService.GetAllFiscalYears()
      .map(res => res);
  }
  //GET: Patient - Patient Details by Patient Id
  public GetPatientByPatId(patientId: number) {
    try {
      return this.pharmacyDLService.GetPatientByPatId(patientId)
        .map(res => res);
    }
    catch (ex) {
      throw ex;
    }
  }

  /////Get Supplier Information For Reporting
  public GetSupplierInformationReportList() {
    try {
      return this.pharmacyDLService.GetSupplierInformationReportList()
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }

  ////Get: Get All Patient List BAsed on PAtient Type
  public GetInOutPatientDetails(value) {
    try {
      return this.pharmacyDLService.GetInOutPatientDetails(value)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }
  ////Get: Get All Credit Report For In/OUT Patient 
  public GetCreditInOutPatReportList(phrmReports: PHRMReportsModel,IsInOutPat, patientName) {
    try {
      return this.pharmacyDLService.GetCreditInOutPatReportList(phrmReports,IsInOutPat, patientName)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }

  ////Get: Get Stock Item Report Data 
  public GetStockItemsReport(itemId) {
    try {
      return this.pharmacyDLService.GetStockItemsReport(itemId)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }

  ////Get: Get Supplier Stock Summary Report Data
  public GetSupplierStockSummaryReport(supplierName) {
    try {
      return this.pharmacyDLService.GetSupplierStockSummaryReport(supplierName)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }
  ////Get: Get Batch Stock Report Data
  public GetBatchStockReport(itemName) {
    try {
      return this.pharmacyDLService.GetBatchStockReport(itemName)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }
  ////Get: Get Expiry Report Data
  public GetExpiryReport(itemName) {
    try {
      return this.pharmacyDLService.GetExpiryReport(itemName)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }
  ////Get: Get Minimum Stock Report Data
  public GetMinStockReport(itemName) {
    try {
      return this.pharmacyDLService.GetMinStockReport(itemName)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }
  ////Get: Get Daily Stock Summary Report Data
  public GetDailyStockSummaryReport(phrmReports: PHRMReportsModel) {
    try {
      return this.pharmacyDLService.GetDailyStockSummaryReport(phrmReports)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }
  ////Get: Get Daily Sales Summary Report Data
  public GetDailySalesSummaryReport(FromDate, ToDate, itemId) {
    try {
      return this.pharmacyDLService.GetDailySalesSummaryReport(FromDate, ToDate, itemId)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }
  ////Get: Get ABC/VED Stock Report Data
  public GetPHRMABCVEDStockReport(Status) {
    try {
      return this.pharmacyDLService.GetPHRMABCVEDStockReport(Status)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }
  ////Get: Get Batch Stock Report Data
  public GetPharmacyBillingReport(phrmReports,invoiceNumber) {
    try {
      return this.pharmacyDLService.GetPharmacyBillingReport(phrmReports,invoiceNumber)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }
  ////Get: Get Stock Movement Report Data
  public GetStockMovementReport(itemName) {
    try {
      return this.pharmacyDLService.GetStockMovementReport(itemName)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }

  ////Get: Get Supplier Stock Report Data
  public GetSupplierStockReport(supplierName) {
    try {
      return this.pharmacyDLService.GetSupplierStockReport(supplierName)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }
  //Get: Get store items list
  public GetStoreRequestedItemList(Status) {
    try {
      return this.pharmacyDLService.GetStoreRequestedItemList(Status)
        .map(res => { return res });
    }
    catch (ex) { throw ex; }
  }
  //GET: get dispensary list
  public GetDispensaryList() {
    try {
      return this.pharmacyDLService.GetDispensaryList()
        .map(res => { return res });
    }
    catch (ex) { throw ex;}
  }
  
  public PostSalesCategoryDetails(salescategory) {
    try {
      var temp = _.omit(salescategory, ['SalesCategoryValidator']);
      return this.pharmacyDLService.PostSalesCategoryDetails(temp)
        .map(res => { return res });
    }
    catch (ex) { throw ex; }
  }
  public GetSalesCategoryList() {
    try {
      return this.pharmacyDLService.GetSalesCategoryList()
        .map(res => { return res });
    }
    catch (ex) { throw ex; }
  }
  ////Get: Get Ending Stock Summary Report Data
  public GetEndingStockSummaryReport(itemName) {
    try {
      return this.pharmacyDLService.GetEndingStockSummaryReport(itemName)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }

  //GET: Get Stock Txn Items
  public GetStockTxnItems() {
    try {
      return this.pharmacyDLService.GetStockTxnItems()
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }
  // GET: Stock Details with 0, null or > 0 Quantity
  //this stock details with all unique (by ItemId,ExpiryDate,BatchNo)  records with sum of Quantity
  //items with 0 quantity or more than 0 showing in list
  public GetAllItemsStockDetailsList() {

    try {
      return this.pharmacyDLService.GetAllItemsStockDetailsList()
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  // GET: Stock Details with 0, null or > 0 Quantity
  public GetWardStockDetailsList() {

    try {
      return this.pharmacyDLService.GetWardStockDetailsList()
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  // GET: Stock without 0, null or > 0 Quantity
  //this stock details is not unique (by ExpiryDate,BatchNo)  records with sum of Quantity

  public GetAllItemsStockList() {

    try {
      return this.pharmacyDLService.GetAllItemsStockList()
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  // get rack list
  public GetRackList() {
    return this.pharmacyDLService.GetRackList()
      .map(res => { return res });
  }

  //GET: To get ward requested Items List
  public GetWardRequestedItemList(Status: string) {
    return this.pharmacyDLService.GetWardRequestedItemList(Status)
      .map(res => { return res });
  }

  //Get deposit data of patient
  public GetDepositFromPatient(patientId: number) {
    return this.pharmacyDLService.GetDepositFromPatient(patientId)
      .map((responseData) => {
        return responseData;
      })
  }

  //POST : setting-supplier manage
  public AddSupplier(supplier: PHRMSupplierModel) {
    var temp = _.omit(supplier, ['SupplierValidator']);
    return this.pharmacyDLService.PostSupplier(temp)
      .map(res => { return res });
  }
  //POST : setting-company manage
  public AddCompany(company: PHRMCompanyModel) {
    var temp = _.omit(company, ['CompanyValidator']);
    return this.pharmacyDLService.PostCompany(temp)
      .map(res => { return res });
  }
  //POST : setting-dispensary manage
  public AddDispensary(dispensary: PHRMDispensaryModel) {
    var temp = _.omit(dispensary, ['DispensaryValidator']);
    return this.pharmacyDLService.PostDispensary(temp)
      .map(res => { return res });
  }
  //POST : setting-category manage
  public AddCategory(category: PHRMCategoryModel) {
    var temp = _.omit(category, ['CategoryValidator']);
    return this.pharmacyDLService.PostCategory(temp)
      .map(res => { return res });
  }
  //POST : send sms message
  public sendSMS(text: string) {
    return this.pharmacyDLService.sendSMS(text)
      .map(res => { return res });
  }
  //POST : setting-unit of measurement manage
  public AddUnitOfMeasurement(uom: PHRMUnitOfMeasurementModel) {
    var temp = _.omit(uom, ['UnitOfMeasurementValidator']);
    return this.pharmacyDLService.PostUnitOfMeasurement(temp)
      .map(res => { return res });
  }
  //POST : setting-item type manage
  public AddItemType(itemtype: PHRMItemTypeModel) {
    var temp = _.omit(itemtype, ['ItemTypeValidator']);
    return this.pharmacyDLService.PostItemType(temp)
      .map(res => { return res });
  }
  //POST : setting-item manage
  public AddItem(item: PHRMItemMasterModel) {
    var temp = _.omit(item, ['ItemValidator']);
    return this.pharmacyDLService.PostItem(temp)
      .map(res => { return res });
  }
  //POST : setting-tax manage
  public AddTAX(tax: PHRMTAXModel) {
    var temp = _.omit(tax, ['TAXValidator']);
    return this.pharmacyDLService.PostTAX(temp)
      .map(res => { return res });
  }

  //POST : Generic Name
  public AddGenericName(genericName: PHRMGenericModel) {
    var temp = _.omit(genericName, ['GenericValidator']);
    return this.pharmacyDLService.PostGenericName(temp)
      .map(res => { return res });
  }
  //POST: Patient
  //POST: Patient- Registration of Outdoor patient
  public PostPatientRegister(patient: PHRMPatient) {
    try {
      var patTempData = _.omit(patient, ['PHRMPatientValidator']);
      return this.pharmacyDLService.PostPatientRegister(patTempData)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  ///POST: Posting New Order 
  public PostToPurchaseOrder(PO: PHRMPurchaseOrder) {
    //omiting the validators during post because it causes cyclic error during serialization in server side.
    //omit validator from inputPO (this will give us object)
    let newPO: any = _.omit(PO, ['PurchaseOrderValidator']);

    let newPoItems = PO.PHRMPurchaseOrderItems.map(item => {
      item.PHRMItemMaster = null;
      return _.omit(item, ['PurchaseOrderItemValidator']);
    });
    //assign items to above 'newPO' with exact same propertyname : 'PurchaseOrderItems'
    newPO.PHRMPurchaseOrderItems = newPoItems;

    let data = JSON.stringify(newPO);
    return this.pharmacyDLService.PostToPurchaseOrder(data)
      .map(res => { return res })
  }
  ////POST: GoodsReceipt 
  public PostGoodReceipt(phrmGRVM: PHRMGoodsReceiptViewModel, isPOOrder: boolean) {
    let newRequisitionSVM: any = phrmGRVM;

    let newGR: any = _.omit(phrmGRVM.goodReceipt, ['GoodReceiptValidator']);
    let newGrItems = phrmGRVM.goodReceipt.GoodReceiptItem.map(item => {
      return _.omit(item, ['GoodReceiptItemValidator']);
    });
    let GoodReceipt: any;
    newGR.GoodReceiptItem = newGrItems;

    newRequisitionSVM.goodReceipt.GoodReceiptItem = newGR.GoodReceiptItem;

    let newPO: any = _.omit(phrmGRVM.purchaseOrder, ['PurchaseOrderValidator']);
    let newPoItems = phrmGRVM.purchaseOrder.PHRMPurchaseOrderItems.map(item => {
      return _.omit(item, ['PurchaseOrderItemValidator']);
    });
    let PurchaseOrder: any;
    //assign items to above 'newPO' with exact same propertyname : 'PurchaseOrderItems'
    newPO.PHRMPurchaseOrderItems = newPoItems;
    PurchaseOrder = newPO.PHRMPurchaseOrderItems;
    newRequisitionSVM.purchaseOrder.PHRMPurchaseOrderItems = PurchaseOrder;
    let data: any;
    if (!isPOOrder) {
      let newGR = _.omit(newRequisitionSVM.goodReceipt, ['GoodReceiptValidator']);
      newRequisitionSVM.goodReceipt = newGR;
      let newPO = _.omit(newRequisitionSVM.purchaseOrder, ['PurchaseOrderValidator']);
      newRequisitionSVM.purchaseOrder = newPO;
      phrmGRVM.purchaseOrder.PHRMPurchaseOrderItems.forEach(itm => {
        itm.PHRMItemMaster = null;
      });
      //let newPoItems = phrmGRVM.purchaseOrder.PHRMPurchaseOrderItems.map(itm => {
      //    return _.omit(itm.PHRMItemMaster, ['ItemValidator']);
      //}
      //)
      //newRequisitionSVM.purchaseOrder.PHRMPurchaseOrderItems = newPoItems;
      let xy = newRequisitionSVM;
    }
    data = JSON.stringify(newRequisitionSVM);
    return this.pharmacyDLService.PostToGoodReceipt(data)
      .map(res => { return res })
  }
  ///POST: Posting New return To Supplier Order 
  public PostReturnToSupplierItems(retSuppl: PHRMReturnToSupplierModel) {
    //omiting the validators during post because it causes cyclic error during serialization in server side.
    //omit validator from retSuppl (this will give us object)
    let newretSuppl: any = _.omit(retSuppl, ['ReturnToSupplierValidator']);

    let newretSupplItems = retSuppl.returnToSupplierItems.map(item => {
      item.SelectedGRItems[0].GoodReceiptItemValidator = null;
      return _.omit(item, ['ReturnToSupplierItemValidator']);
    });
    //assign items to above 'newretSuppl' with exact same propertyname : 'returnToSupplierItems'
    newretSuppl.returnToSupplierItems = newretSupplItems;

    let data = JSON.stringify(newretSuppl);
    return this.pharmacyDLService.PostReturnToSupplierItems(data)
      .map(res => { return res })
  }



  ///POST: Posting New Write off and WriteOffItem Order 
  public PostWriteOffItems(writeoff: PHRMWriteOffModel) {
    try {
      //omiting the validators during post because it causes cyclic error during serialization in server side.
      //omit validator from writeoff (this will give us object)
      let newwrtOff: any = _.omit(writeoff, ['WriteOffValidator']);

      let newwrtOffItem = writeoff.phrmWriteOffItem.map(item => {
        item.SelectedItem = null;
        return _.omit(item, ['WriteOffItemValidator', 'positiveNumberValdiator', 'BatchNoList', 'TempBatchNoList']);
      });
      //assign items to above 'newwrtOffItem' with exact same propertyname : 'phrmWriteOffItem'
      newwrtOff.phrmWriteOffItem = newwrtOffItem;

      let data = JSON.stringify(newwrtOff);
      return this.pharmacyDLService.PostWriteOffItems(data)
        .map(res => { return res })
    }
    catch (ex) {
      throw ex;
    }
  }



  //POST: Save Prescription with Prescription Items
  public PostPrescription(prescription: PHRMPrescription) {
    let newPrescription: any = _.omit(prescription, ['PHRMPrescriptionValidator']);
    //remove other data 
    prescription.PHRMPrescriptionItems.map(itm => {
      itm.ItemListByItemType = null;
      itm.SelectedItem = null;
      return itm;
    });
    let newPrescriptionItems = prescription.PHRMPrescriptionItems.map(item => {
      return _.omit(item, ['PHRMPrescriptionItemsValidator']);
    });
    newPrescription.PHRMPrescriptionItems = newPrescriptionItems;
    let data = JSON.stringify(newPrescription);
    return this.pharmacyDLService.PostPrescription(data)
      .map(res => { return res });
  }

  //POST: Save Invoice details(sale) with Invoice Items
  //This Post for Invoice table,InvoiceItems table,StockTransaction table, 
  //Update on GRItems, update stock
  public postInvoiceData(invoiceData: PHRMInvoiceModel) {
    try {
      let newInvoice: any = _.omit(invoiceData, ['selectedPatient.PHRMPatientValidator', 'InvoiceValidator']);
      let newInvoiceItems = invoiceData.InvoiceItems.map(item => {
        return _.omit(item, ['positiveNumberValdiator', 'InvoiceItemsValidator', 'positiveNumberValdiatortest', 'InvoiceItemsValidatortest', 'GRItems', 'Items']);
      });
      newInvoice.InvoiceItems = newInvoiceItems;
      let data = JSON.stringify(newInvoice);
      return this.pharmacyDLService.PostInvoiceDetails(data)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  //POST: Save Invoice details(sale) with Invoice Items
  //This Post for Invoice table,InvoiceItems table,StockTransaction table, 
  //Update on GRItems, update stock
  public AddInvoiceForCreditItems(invoiceData: PHRMInvoiceModel) {
    try {
      let newInvoice: any = _.omit(invoiceData, ['selectedPatient.PHRMPatientValidator', 'InvoiceValidator']);
      let newInvoiceItems = invoiceData.InvoiceItems.map(item => {
        return _.omit(item, ['positiveNumberValdiator', 'InvoiceItemsValidator', 'InvoiceValidator', 'positiveNumberValdiatortest', 'InvoiceItemsValidatortest', 'GRItems', 'Items']);
      });
      newInvoice.InvoiceItems = newInvoiceItems;
      let data = JSON.stringify(newInvoice);
      return this.pharmacyDLService.AddInvoiceForCreditItems(data)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }

  public updateInvoiceForCreditItems(invoiceItemsData: Array<PHRMInvoiceItemsModel>) {
    try {
      let newInvoiceItems = invoiceItemsData.map(item => {
        return _.omit(item, ['positiveNumberValdiator', 'InvoiceItemsValidator', 'positiveNumberValdiatortest', 'InvoiceItemsValidatortest', 'GRItems', 'Items']);
      });
      let data = JSON.stringify(newInvoiceItems);
      return this.pharmacyDLService.updateInvoiceForCreditItems(data)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  //Update credit billing on GRItems, update stock
  public PostCreditItemsDetails(invoiceData: PHRMInvoiceModel, requisitionId: number = 0) {
    try {
      let newInvoice: any = _.omit(invoiceData, ['selectedPatient.PHRMPatientValidator', 'InvoiceValidator']);
      let newInvoiceItems = invoiceData.InvoiceItems.map(item => {
        return _.omit(item, ['positiveNumberValdiator', 'InvoiceItemsValidator', 'positiveNumberValdiatortest', 'InvoiceItemsValidatortest', 'GRItems', 'Items']);
      });
      newInvoice.InvoiceItems = newInvoiceItems;
      let data = JSON.stringify(newInvoice);
      return this.pharmacyDLService.PostCreditItemsDetails(data, requisitionId)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }

  // get the drug dispatched list as per the nurse requistion
  public GetDrugDispatchListByRequistionId() {

  }

  //POSt: post data to server of Retuned invoice items from customer 
  PostReturnFromCustomerData(invoiceReturnData: Array<PHRMInvoiceReturnItemsModel>) {
    let newItems = invoiceReturnData.map(item => {
      return _.omit(item, ['InvoiceItemsReturnValidator']);
    });
    let data = JSON.stringify(newItems);
    return this.pharmacyDLService.PostReturnFromCustomerData(data)
      .map(res => { return res });
  }

  //POST:update stockManage transaction
  //Post to StockManage table and post to stockTxnItem table 
  PostManagedStockDetails(selectedData) {
    try {
      let newItem: any = _.omit(selectedData, ['StockManageValidator']);
      let data = JSON.stringify(newItem);
      return this.pharmacyDLService.PostManagedStockDetails(data)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
  }
  //POST: update Store Stock and transfer stock to Dispensary
  TransferToDispensary(selectedData) {
    try {
      let newItem: any = _.omit(selectedData, ['StoreManageValidator']);
      let data = JSON.stringify(newItem);
      return this.pharmacyDLService.TransferToDispensary(data)
        .map(res => { return res; });
    } catch (ex) {
      throw ex;
    }
  }
  //Post: update Dispensary Stock and transfer it to Store
  TransferToStore(selectedData, StoreId) {
    try {
      let newItem: any = _.omit(selectedData, ['StockManageValidator']);
      let data = JSON.stringify(newItem);
      return this.pharmacyDLService.TransferToStore(data, StoreId)
        .map(res => { return res; });
    } catch (ex) {
      throw ex;
    }
  }

  //POST:update storeManage transaction
  //Post to StoreStock table
  PostManagedStoreDetails(selectedData) {
    try {
      let newItem: any = _.omit(selectedData, ['StoreManageValidator']);
      let data = JSON.stringify(newItem);
      return this.pharmacyDLService.PostManagedStoreDetails(data)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
  }

  //POST:update goods receipt cancelation
  //post to stock transaction items
  PostGoodsReceiptCancelDetail(selectedGrId) {
    try {
      return this.pharmacyDLService.PostGoodsReceiptCancelDetail(selectedGrId)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
  }
  // Post drugs request data from nursing to pharmacy invoice item table.
  PostProvisonalItems(proItem: Array<DrugsRequistionItemModel>) {
    try {

      let ProvsionalInvoiceItems = proItem.map(item => {
        return _.omit(item, ['positiveNumberValdiator', 'DrugsRequestValidator', 'positiveNumberValdiatortest', 'DrugsRequestValidatortest', 'GRItems', 'Items']);
      });
      let data = JSON.stringify(ProvsionalInvoiceItems);
      return this.pharmacyDLService.PostProvisonalItems(data)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }
  // Post Deposit Amount Data to pharmacy deposit table
  public PostPharmacyDeposit(depositData: PHRMDepositModel) {
    try {

      var temp: any = _.omit(depositData, ['DepositValidator']);
      return this.pharmacyDLService.PostPharmacyDeposit(temp)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  //post ward request from wards to pharmacy
  PostWardRequisitionItems(wardItem: WardispatchModel) {
    try {
      //   return _.omit(item, ['positiveNumberValdiator', 'WardRequestValidator', 'positiveNumberValdiatortest', 'WardRequestValidatortest', 'selectedItem']);

      let newWardReq: any = _.omit(wardItem);
      let newWardReqItems = wardItem.WardDispatchedItemsList.map(item => {
        return _.omit(item);
      });
      newWardReq.WardRequisitionItemsList = newWardReqItems;
      let data = JSON.stringify(newWardReq);
      return this.pharmacyDLService.PostWardRequisitionItems(data)
        .map((res) => { return res });

    }
    catch (ex) {
      throw ex;
    }

  }
  //PUT : setting-supplier manage
  public UpdateSupplier(supplier: PHRMSupplierModel) {
    //to fix serializaiton problem in server side
    if (supplier.CreatedOn)
      supplier.CreatedOn = moment(supplier.CreatedOn).format('YYYY-MM-DD HH:mm');
    //if (supplier.ModifiedOn)
    //    employee.ModifiedOn = moment(employee.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(supplier, ['SupplierValidator']);
    return this.pharmacyDLService.PutSupplier(temp)
      .map(res => { return res });
  }
  //PUT : setting-company manage
  public UpdateCompany(company: PHRMCompanyModel) {
    if (company.CreatedOn)
      company.CreatedOn = moment(company.CreatedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(company, ['CompanyValidator']);
    return this.pharmacyDLService.PutCompany(temp)
      .map(res => { return res });
  }
  //PUT : setting-dispensary manage
  public UpdateDispensary(dispensary: PHRMDispensaryModel) {
    var temp = _.omit(dispensary, ['DispensaryValidator']);
    return this.pharmacyDLService.PutDispensary(temp)
      .map(res => { return res });
  }
  //PUT : setting-category manage
  public UpdateCategory(category: PHRMCategoryModel) {
    if (category.CreatedOn)
      category.CreatedOn = moment(category.CreatedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(category, ['CategoryValidator']);
    return this.pharmacyDLService.PutCategory(temp)
      .map(res => { return res });
  }
  //PUT : setting-unit of measurement manage
  public UpdateUnitOfMeasurement(uom: PHRMUnitOfMeasurementModel) {
    if (uom.CreatedOn)
      uom.CreatedOn = moment(uom.CreatedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(uom, ['UnitOfMeasurementValidator']);
    return this.pharmacyDLService.PutUnitOfMeasurement(temp)
      .map(res => { return res });
  }
  //PUT : setting-item type manage
  public UpdateItemType(itemtype: PHRMItemTypeModel) {
    if (itemtype.CreatedOn)
      itemtype.CreatedOn = moment(itemtype.CreatedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(itemtype, ['ItemTypeValidator']);
    return this.pharmacyDLService.PutItemType(temp)
      .map(res => { return res });
  }
  //PUT : setting-item manage
  public UpdateItem(item: PHRMItemMasterModel) {
    if (item.CreatedOn)
      item.CreatedOn = moment(item.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (item.ModifiedOn)
      item.ModifiedOn = moment(item.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(item, ['ItemValidator']);
    return this.pharmacyDLService.PutItem(temp)
      .map(res => { return res });
  }
  //PUT : setting-tax manage
  public UpdateTAX(tax: PHRMTAXModel) {
    if (tax.CreatedOn)
      tax.CreatedOn = moment(tax.CreatedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(tax, ['TAXValidator']);
    return this.pharmacyDLService.PutTAX(temp)
      .map(res => { return res });
  }
  //PUT Generic Name
  public UpdateGenericName(genericName: PHRMGenericModel) {
    if (genericName.CreatedOn) {
      genericName.CreatedOn = moment(genericName.CreatedOn).format('YYYY-MM-DD HH:mm');
    }
    var temp = _.omit(genericName, ['GenericValidator']);
    return this.pharmacyDLService.PutGenericName(temp)
      .map(res => { return res });
  }

  //PUT : Stock Manage
  public UpdateStock(stkManageData: Array<PHRMGoodsReceiptItemsModel>) {
    try {
      let temp = stkManageData.map(item => {
        return _.omit(item, ['GoodReceiptItemValidator']);
      });
      return this.pharmacyDLService.PutStock(temp)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }

  //PUT : DepositPrintcount
  public UpdateDepositPrintCount(data) {
    try {
      return this.pharmacyDLService.PutDepositPrintCount(data)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
  }

  //PUT: Sale -Credit Bill Payment
  public putPayInvoiceItemsCredit(selectedItems: Array<PHRMInvoiceItemsModel>) {
    try {
      let data = selectedItems.map(item => {
        return _.omit(item, ['InvoiceItemsValidator']);
      });
      return this.pharmacyDLService.putPayInvoiceItemsCredit(data)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  //PUT: Setting- Stock Txn Items MRP change
  public PutStockTxnItemMRP(stockTxnItem) {
    try {
      return this.pharmacyDLService.PutStockTxnItemMRP(stockTxnItem)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  // for cancel the credit bill.
  public CancelCreditBill(creditItems: any) {
    try {

      return this.pharmacyDLService.CancelCreditBill(creditItems)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }



  public GetAllCreditSummary() {
    return this.pharmacyDLService.GetAllCreditSummary()
      .map((responseData) => {
        return responseData;
      });
  }

  public GetPatientCreditItems(patientId: number) {
    return this.pharmacyDLService.GetPatientCreditItems(patientId)
      .map((responseData) => {
        return responseData;
      });
  }

  //update PrintCount for print on Billingtransaction
  public PutPrintCount(printCount: number, invoiceNo: number) {
    return this.pharmacyDLService.PutPrintCount(printCount, invoiceNo)
      .map((responseData) => {
        return responseData;
      })
  }

  //PUT : setting-item add to rack
  public addtoRack(itemId: number, rackId: number) {
    return this.pharmacyDLService.PutAddItemToRack(itemId, rackId)
      .map((responseData) => {
        return responseData;
      })
  }

}
