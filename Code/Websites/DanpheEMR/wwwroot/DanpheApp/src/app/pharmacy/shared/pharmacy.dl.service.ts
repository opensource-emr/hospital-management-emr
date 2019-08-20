import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PHRMDepositModel } from '../shared/phrm-deposit.model';


@Injectable()
export class PharmacyDLService {
   public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
    constructor(public http: HttpClient) {

    }
    //GET: setting-supplier manage : list of suppliers
    public GetSupplierList() {
        return this.http.get<any>("/api/Pharmacy?reqType=supplier");
    }

    public GetCounter() {
        return this.http.get<any>('/api/pharmacy?reqType=getCounter', this.options);
    }
    public ActivatePharmacyCounter(counterId: number, counterName: string) {
        return this.http.put<any>("/api/Security?reqType=activatePharmacyCounter&counterId=" + counterId + "&counterName=" + counterName , this.options);
    }
    public DeActivatePharmacyCounter() {
        return this.http.put<any>("/api/Security?reqType=deActivatePharmacyCounter", this.options);
    }

    //GET: getting vendor accodring the vendorid
    public GetSupplierDetailsBySupplierId(supplierId: number) {
        return this.http.get<any>("/api/Pharmacy?reqType=SupplierDetails&supplierId=" + supplierId, this.options);
    }
    //GET: setting-itemtype manage : List of itemtypes
    public GetItemTypeList() {
        return this.http.get<any>('/api/Pharmacy?reqType=itemtype', this.options);
    }
    //GET: List of ItemTypes with all Child Items Master data
    public GetItemTypeListWithItems() {
        try {
            return this.http.get<any>('/api/Pharmacy?reqType=itemtypeListWithItems', this.options);
        }
        catch (ex) {
            throw ex;
        }
    }

    public GetRackByItem(itemId) {
        try {
            return this.http.get<any>('/api/Pharmacy?reqType=GetRackByItem&itemId=' + itemId, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }
    //GET: setting-company manage : list of companies
    public GetCompanyList() {
        return this.http.get<any>("/api/Pharmacy?reqType=company");
    }

    //GET: setting-category manage : list of categories
    public GetCategoryList() {
        return this.http.get<any>("/api/Pharmacy?reqType=category");
    }
    ///GET: get ItemList by ItemTypeId
    public GetItemListByItemTypeId(itemTypeId) {
        return this.http.get<any>("/api/Pharmacy?reqType=GetItemListByItemTypeId&itemTypeId=" + itemTypeId, this.options);
    }
    public GetAllItems() {
        return this.http.get<any>("/api/Pharmacy?reqType=GetAllItems");
    }


    //GET: setting-unit of measurement manage : list of unit of measurements
    public GetUnitOfMeasurementList() {
        return this.http.get<any>("/api/Pharmacy?reqType=unitofmeasurement");
    }
    //GET: setting-item manage : list of items
    public GetItemList() {
        return this.http.get<any>("/api/Pharmacy?reqType=item");
    }
    //GET: setting-tax manage : list of tax
    public GetTAXList() {
        return this.http.get<any>("/api/Pharmacy?reqType=tax");
    }
    public GetGenericList() {
        return this.http.get<any>("/api/Pharmacy?reqType=getGenericList");
    }

    //GET:patient List from Patient controller
    public GetPatients() {
       // return this.http.get<any>("/api/Patient", this.options);
       return this.http.get<any>("/api/Patient?reqType=patient-search-by-text", this.options);
    }    
    public GetPatientsListForSaleItems() {
        return this.http.get<any>("/api/Patient?reqType=phrm-sale-patient", this.options);
    }
    //GET:deposit
    public GetDeposit() {
        return this.http.get<any>("", this.options);
    }
    //GET: Patient List with matching info like firstname, lastname and phone number for checking existed patient or not
    //This call to Visit Controller for code reuseability because this method logic written in Visit controller
    public GetExistedMatchingPatientList(firstName, lastName, phoneNumber) {
        try {
            return this.http.get<any>("/api/Patient?reqType=GetMatchingPatList&FirstName="
                + firstName +
                "&LastName=" + lastName +
                "&PhoneNumber=" + phoneNumber,
                this.options);
        }
        catch (ex) {
            throw ex;
        }
    }

    //GET: STOCK : get stock manage by ItemId
    public GetStockManageByItemId(ItemId) {
        try {
            return this.http.get<any>("/api/Pharmacy?reqType=stockManage&itemId=" + ItemId, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }

    ///GET: POList by Passing Status 
    public GetPHRMPurchaseOrderList(status: string) {
        return this.http.get<any>("/api/Pharmacy?reqType=getPHRMOrderList&status=" + status, this.options)
    } 
    ///GET: POItemsList By Passing PurchaseOrderId
    public GetPHRMPOItemsByPOId(purchaseOrderId) {
        return this.http.get<any>("/api/Pharmacy?reqType=getPHRMPOItemsByPOId&purchaseOrderId=" + purchaseOrderId, this.options)
    }

    //GET: Provisional Items List
    public GetPHRMProvisionalItemList(status: string) {
        return this.http.get<any>("/api/Pharmacy?reqType=get-provisional-items&status=" + status, this.options)
    }

    //GET: All Provisional Items List
    public GetAllPHRMProvisionalItemList() { 
        return this.http.get<any>("/api/Pharmacy?reqType=get-all-provisional-items", this.options)
    }

    //GET: Requsted drug-list by patientId and VisitId (used in Emergency) --added by Anish 25 Feb Anish
    public GetAllDrugOrderOfERPatient(patientId: number, visitId: number) {
        return this.http.get<any>("/api/Pharmacy?reqType=get-all-drugs-order&patientId=" + patientId + "&visitId=" + visitId, this.options)
    }

    //GET: drigs Items List
    public GetPHRMDrugsItemList(requisitionId) {
        return this.http.get<any>("/api/Pharmacy?reqType=get-drugs-request-items&requisitionId=" + requisitionId, this.options)
    }

    // GET: drug dispatch list per nursing requisition
    public GetPHRMDrugDispatchList(requisitionId) {
        return this.http.get<any>("/api/Pharmacy?reqType=get-drugs-dispatch-items&requisitionId=" + requisitionId, this.options)
    }

    ////GET: PhrmPurchaseOrderItems List for GR
    public GetPHRMPOItemsForGR(purchaseOrderId) {
        return this.http.get<any>("/api/Pharmacy?reqType=getPHRMPOItemsForGR&purchaseOrderId=" + purchaseOrderId, this.options)
    }
    ///GET: Get Return To SupplierItem by ReturnToSupplierId
    public GetReturnToSupplierItemsByRetSuppId(returnToSupplierId) {
        return this.http.get<any>("/api/Pharmacy?reqType=getReturnToSupplierItemsByReturnToSupplierId&returnToSupplierId=" + returnToSupplierId, this.options)
    }

    ///GET: Get Return To SupplierItem of Goodreceipt from GR
    public GetReturnToSupplierItemsofExistingGR() {
       // return this.http.get<any>("/api/Pharmacy?reqType=getReturnToSu=" + returnToSupplierId, this.options)
        return this.http.get<any>("/api/GetCreditNoteItems", this.options);
    }

    ///GET: Get Write Off Items By WriteOffId
    public GetWriteOffItemsByWriteOffId(writeOffId) {
        try {
            return this.http.get<any>("/api/Pharmacy?reqType=getWriteOffItemsByWriteOffId&writeOffId=" + writeOffId, this.options)
        }
        catch (ex) {
            throw ex;
        }
    }
    //GET: order-goods receipt list
    public GetGoodsReceiptList() {
      return this.http.get<any>("/api/Pharmacy?reqType=goodsreceipt");
  }

  public GetAccountDetailsList() {
    return this.http.get<any>("/api/Pharmacy?reqType=get-goods-receipt-groupby-supplier");
  }

  public GetEachAccountDetailsList(SupplierID) {
    return this.http.get<any>("/api/Pharmacy?reqType=get-goods-receipt-by-SupplierID&providerId=" + SupplierID);
  }
    //Get : all the stroe list
    public GetStoreList(){
      return this.http.get<any>("/api/Pharmacy?reqType=getStoreList");
    }
    ///GET: Return Items To Supplier List
    public GetReturnItemsToSupplierList() {
        return this.http.get<any>("/api/Pharmacy?reqType=returnItemsToSupplierList");
    }

    ///////here
    //public GetPharmacyInvoiceDetailsByInvoiceId(invoiceId: number) {
    //    return this.http.get<any>("/api/Pharmacy?reqType=getInvoiceDetailsByInvoiceId" + "&invoiceId=" + invoiceId, this.options);
    //}

    //GET: WriteOff List With SUM of Toatal WriteOff Qty
    public GetWriteOffList() {
        try {
            return this.http.get<any>("/api/Pharmacy?reqType=getWriteOffList");
        }
        catch (ex) {
            throw ex;
        }
    }
    ////Get Stock Details List
    public GetStockDetailsList() {
        return this.http.get<any>("/api/Pharmacy?reqType=stockDetails");
    }
    public GetSalesDetailsList() {
        return this.http.get<any>("/api/Pharmacy?reqType=stockDetails");
    }

    // Get items List
    public GetItemsList() {
      return this.http.get<any>("/api/Pharmacy?reqType=item");
    }
    //



    ////Get:  Get Daily Sales Summary Report Data test
    public GetDailySalesSummaryReport(FromDate, ToDate, itemId) {
        try {
            return this.http.get<any>("/PharmacyReport/PHRMDailySalesReport?FromDate=" + FromDate + "&ToDate=" + ToDate + "&itemId=" + itemId, this.options);
        }
        catch (ex) { throw ex; }

    }
    ////Get:  Get ABCVED Summary Report Data test
    public GetPHRMABCVEDStockReport(Status) {
        try {
            return this.http.get<any>("/PharmacyReport/PHRMABCVEDStockReport?Status=" + Status,this.options);
        }
        catch (ex) { throw ex; }

    }
    //GET: order-goods receipt items-view by GR-Id
    public GetGRItemsByGRId(goodsReceiptId) {
        return this.http.get<any>("/api/Pharmacy?reqType=GRItemsViewByGRId&goodsReceiptId=" + goodsReceiptId, this.options);
    }
    ///GET: GetBatchNo List By ItemId
    public GetBatchNoByItemId(ItemId) {
        try {
            return this.http.get<any>("/api/Pharmacy?reqType=getBatchNoByItemId&itemId=" + ItemId, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }
    ///GET: Get Item Details By passing BatchNo 
    public GetItemDetailsByBatchNo(BatchNo,ItemId) {
        try {
            return this.http.get<any>("/api/Pharmacy?reqType=getItemDetailsByBatchNo&batchNo=" + BatchNo+"&ItemId=" + ItemId, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }
    ////GET: Get Purchase Order Report
    public GetPHRMPurchaseOrderReport(phrmReports) {
        return this.http.get<any>("/PharmacyReport/PHRMPurchaseOrderReport?FromDate="
            + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&Status=" + phrmReports.Status, this.options)
    }

    ////GET: Get User Report
    public GetPHRMUserwiseCollectionReport(phrmReports) {
        return this.http.get<any>("/PharmacyReport/PHRMUserwiseCollectionReport?FromDate="
            + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
    }


    ////GET: Get Sale Return Report
    public GetSaleReturnReport(phrmReports) {
        return this.http.get<any>("/PharmacyReport/PHRMSaleReturnReport?FromDate="
            + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
    }


    ////GET: Get Counterwise Report
    public GetPHRMCounterwiseCollectionReport(phrmReports) {
        return this.http.get<any>("/PharmacyReport/PHRMCounterwiseCollectionReport?FromDate="
            + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
    }

    ////GET: Get Breakage Items Details Report
    public GetPHRMBreakageItemReport(phrmReports) {
        return this.http.get<any>("/PharmacyReport/PHRMBreakageItemReport?FromDate="
            + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
    }

    ////GET: Get Return To Supplier Details Report
    public GetPHRMReturnToSupplierReport(phrmReports) {
        return this.http.get<any>("/PharmacyReport/PHRMReturnToSupplierReport?FromDate="
            + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
    }

    ////GET: Get Goods Receipt Product Report
    public GetPHRMGoodsReceiptProductReport(phrmReports, itemId) {
        return this.http.get<any>("/PharmacyReport/PHRMGoodsReceiptProductReport?FromDate="
            + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&ItemId=" + itemId, this.options)
    }

    ////GET:  Get Drug Category Wise Report
  public GetPHRMDrugCategoryWiseReport(phrmReports, category) {
    return this.http.get<any>("/PharmacyReport/PHRMDrugCategoryWiseReport?FromDate="
        + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&category=" + category, this.options)
    }

   //GET : Get stock manage details report
    public GetPHRMStockManageDetailReport(phrmReports) {
        try {
            return this.http.get<any>("/PharmacyReport/StockManageReport?FromDate="
                + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
        }
        catch (ex) {
            throw ex;
        }
    
  }

    //Get : Get Deposit Balance Report
  public GetPHRMDepositBalanceReport() {
    try {
      return this.http.get<any>("/PharmacyReport/DepositBalanceReport", this.options)
    }
    catch (ex) {
      throw ex;
    }

  }


    ////GET: Get Itemwise stock Report
    public GetPHRMDispensaryStoreReport(phrmReports) {
        try{
            return this.http.get<any>("/PharmacyReport/PHRMDispensaryStoreStockReport?Status=" + phrmReports.Status, this.options)
        }
        catch (ex) {
            throw ex;
        } 
    }
    ////GET: GET ItemList For Return Function Whose Available Qty is greater then zero
    public GetItemListWithTotalAvailableQty() {
        return this.http.get<any>("/api/Pharmacy?reqType=PHRMItemListWithTotalAvailableQuantity", this.options)
    }
    //GET: Get all doctors list    
    //we are taking employe
    public GetDoctorList() {
        return this.http.get<any>("/api/Master?type=departmentemployee&reqType=appointment", this.options);
    }

    public GetPatientSummary(patientId: number) {
        return this.http.get<any>("/api/Pharmacy?reqType=patientSummary" + "&patientId=" + patientId, this.options);
    }
    

    //GET: Prescription List group by PatientName, DoctorName and CreatedDate
    public GetPrescriptionList() {
        return this.http.get<any>("/api/Pharmacy?reqType=getprescriptionlist", this.options);
    }
    //GET: Prescription Items list by PatientId && ProviderId for sale purpose
    public GetPrescriptionItems(PatientId: number, ProviderId: number) {
        try {
            return this.http.get<any>("/api/Pharmacy?reqType=getPrescriptionItems&patientId=" + PatientId + "&providerId=" + ProviderId, this.options);
       }
        catch (ex) {
            throw ex;
        }
    }

    //GET: Get all Sale invoice data list
  public GetSaleInvoiceList(fromDate, toDate) { 
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getsaleinvoicelist&FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }

    //GET: Get all Sale invoice data list
    public GetSaleReturnList() {
        try {
            return this.http.get<any>("/api/Pharmacy?reqType=getsalereturnlist", this.options);
        }
        catch (ex) {
            throw ex;
        }
    }



    //GET: Get sale invoice items details by Invoice id
    public GetSaleInvoiceItemsByInvoiceId(invoiceId: number) {
        try {
            return this.http.get<any>("/api/Pharmacy?reqType=getsaleinvoiceitemsbyid&invoiceId=" + invoiceId, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }
    //GET: Get GR Items as Stock details by ItemId 
    //Only get GR Items details with fullfill condition => AvailableQty > 0   
    public GetGRItemsByItemId(ItemId) {
        try {
            return this.http.get<any>("/api/Pharmacy?reqType=getGRItemsByItemId&itemId=" + ItemId, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }
    //GET: Get ReturnFromCustomer Invoice Model data for Return from customer functionality fulfill
    //passing Invoice Id and getting InvoiceReturnItemsModel
    //this for return from customer to pharmacy                
    public GetReturnFromCustomerModelDataByInvoiceId(InvoiceId: number,fiscYrId) {
        try {
            return this.http.get<any>("/api/Pharmacy?reqType=getReturnFromCustDataModelByInvId&invoiceId=" + InvoiceId+ "&FiscalYearId=" + fiscYrId, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }
    public GetAllFiscalYears() {
        return this.http.get<any>("/api/Billing?reqType=all-fiscalYears");
      }
    //
    //GET: Patient - Patient Details by Patient Id (one patient details)
    public GetPatientByPatId(patientId: number) {
        try {
            return this.http.get<any>("/api/Pharmacy?reqType=getPatientByPatId&patientId=" + patientId, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }
    ////Get: Supplier Information List For Reporting
    public GetSupplierInformationReportList() {
        try {
            return this.http.get<any>("/PharmacyReport/PHRMSupplierInformationReport", this.options);
        }
        catch (ex) { throw ex; }

    }

    ////Get: Get All Patient List BAsed on PAtient Type
    public GetInOutPatientDetails(value) {
        try {
            return this.http.get<any>("/api/Pharmacy?reqType=getInOutPatientDetails&IsOutdoorPat=" + value, this.options);
        }
        catch (ex) { throw ex; }

    }
    ////Get: Get All Credit Report For In/OUT Patient 
  public GetCreditInOutPatReportList(phrmReports,IsInOutPat, patientName) {
        try {
          return this.http.get<any>("/PharmacyReport/PHRMCreditInOutPatReport?FromDate="
            + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&IsInOutPat=" + IsInOutPat + "&patientName=" + patientName, this.options);
        }
        catch (ex) { throw ex; }

    }

    ////Get: Get Stock Item Report Data
    public GetStockItemsReport(itemId) {
        try {
            return this.http.get<any>("/PharmacyReport/PHRMStockItemsReport?itemId=" + itemId, this.options);
        }
        catch (ex) { throw ex; }

    }

    //// Get: Get ABC/VDE Report Data
    public GetABCVDEReport(itemName) {
        try {
            return this.http.get<any>("/PharmacyReport/PHRMStockItemsReport?ItemName=" + itemName, this.options);
        }
        catch (ex) { throw ex; }

    }
    ////Get: ////Get: Get Supplier Stock Summary Report Data
    public GetSupplierStockSummaryReport(supplierName) {
        try {
            return this.http.get<any>("/PharmacyReport/PHRMSupplierStockSummaryReport?SupplierName=" + supplierName, this.options);
        }
        catch (ex) { throw ex; }

    }

    ////Get:  Get Batch Stock Report Data
    public GetBatchStockReport(itemName) {
        try {
            return this.http.get<any>("/PharmacyReport/PHRMBatchStockReport?ItemName=" + itemName, this.options);
        }
        catch (ex) { throw ex; }

    }
    ////Get:  Get Expiry Report Data
    public GetExpiryReport(itemName) {
        try {
            return this.http.get<any>("/PharmacyReport/PHRMExpiryStockReport?ItemName=" + itemName, this.options);
        }
        catch (ex) { throw ex; }

    }
    ////Get:  Get Minimum Stock Report Data
    public GetMinStockReport(itemName) {
        try {
            return this.http.get<any>("/PharmacyReport/PHRMMinStockReport?ItemName=" + itemName, this.options);
        }
        catch (ex) { throw ex; }

    }
    ////Get:  Get Batch Stock Report Data
  public GetPharmacyBillingReport(phrmReports,invoiceNumber) {
        try {
          return this.http.get<any>("/PharmacyReport/PHRMBillingReport?FromDate="
            + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate +"&InvoiceNumber=" + invoiceNumber, this.options);
        }
        catch (ex) { throw ex; }

    }
    ////Get:  Get Batch Stock Report Data
    public GetStockMovementReport(itemName) {
        try {
            return this.http.get<any>("/PharmacyReport/PHRMStockMovementReport?ItemName=" + itemName, this.options);
        }
        catch (ex) { throw ex; }

    }

    ////Get:  Get Supplier Stock Report Data
    public GetSupplierStockReport(supplierName) {
        try {
            return this.http.get<any>("/PharmacyReport/PHRMSupplierStockReport?SupplierName=" + supplierName, this.options);
        }
        catch (ex) { throw ex; }

    }
    ////Get:  Get Ending Stock Summary Report Data
    public GetEndingStockSummaryReport(itemName) {
        try {
            return this.http.get<any>("/PharmacyReport/PHRMEndingStockSummaryReport?ItemName=" + itemName, this.options);
        }
        catch (ex) { throw ex; }

  }

  //Get: Store Stock Item List
  public GetStoreRequestedItemList(Status) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMStoreStock?Status=" + Status, this.options);
    }
    catch (ex) { throw ex; }
  }
  //GET: Dispensary List
  public GetDispensaryList() {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getDispenaryList", this.options);
    }
    catch (ex) { throw ex; }
  }

    ////Get:  Get Daily Stock Summary Report Data
  public GetDailyStockSummaryReport(phrmReports) {
        try {
          return this.http.get<any>("/PharmacyReport/PHRMDailyStockSummaryReport?FromDate=" + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options);
        }
        catch (ex) { throw ex; }

    }
    ////Get:  Get Daily Sales Summary Report Data
    //public GetDailySalesSummaryReport(fromDate, currentDate, itemName) {
    //    try {
    //        return this.http.get<any>("/PharmacyReport/PHRMDailySalesSummaryReport?FromDate=" + fromDate + "&CurrentDate=" + currentDate + "&ItemName=" + itemName, this.options);
    //    }
    //    catch (ex) { throw ex; }

    //}

    //GET: Get Stock Txn Items
    public GetStockTxnItems() {
        try {
            return this.http.get<any>("/api/Pharmacy?reqType=getStockTxnItemList", this.options);
        }
        catch (ex) { throw ex; }
    }


    // GET: Stock Details with 0, null or > 0 Quantity
    //this stock details with all unique (by ItemId,ExpiryDate,BatchNo)  records with sum of Quantity
    //items with 0 quantity or more than 0 showing in list
    public GetAllItemsStockDetailsList() {
        return this.http.get<any>("/api/Pharmacy?reqType=allItemsStockDetails");
    }

    //Get ward stock details
    public GetWardStockDetailsList() {
    return this.http.get<any>("/api/Pharmacy?reqType=phrm-stock");
    }
    // GET: Stock Details with 0, null or > 0 Quantity
    //this stock details with all unique (by ItemId,ExpiryDate,BatchNo)  records with sum of Quantity
    //items with 0 quantity or more than 0 showing in list
    public GetAllItemsStockList() {
        return this.http.get<any>("/api/Pharmacy?reqType=allItemsStock");
    }
    // get rack list
    public GetRackList() {
        return this.http.get<any>("/api/Pharmacy?reqType=getRackList");
    }
    //Get: Ward Request Item list
    public GetWardRequestedItemList(status: string) {
        return this.http.get<any>("/api/Pharmacy?reqType=get-ward-requested-items&status=" + status, this.options)
    }
  
    //get deposit record of patient
    public GetDepositFromPatient(patientId: number) {
        return this.http.get<any>("/api/Pharmacy?reqType=patAllDeposits" + "&patientId=" + patientId, this.options);
    }

    //POST : setting-supplier manage
    public PostSupplier(supplier) {
        let data = JSON.stringify(supplier);
        return this.http.post<any>("/api/Pharmacy?reqType=supplier", data, this.options);
    }
    //POST : setting-company manage
    public PostCompany(company) {
        let data = JSON.stringify(company);
        return this.http.post<any>("/api/Pharmacy?reqType=company", data, this.options);
    }
    //POST: setting-dispense add
  public PostDispensary(Dispensary) {
    let data = JSON.stringify(Dispensary);
    return this.http.post<any>("/api/Pharmacy?reqType=dispensary", data, this.options);
  }
    //POST : setting-category manage
    public PostCategory(category) {
        let data = JSON.stringify(category);
        return this.http.post<any>("/api/Pharmacy?reqType=category", data, this.options);
    }
    //POST : send SMS
    public sendSMS(text) {
        let data = JSON.stringify(text);
        return this.http.post<any>("/api/Pharmacy?reqType=sendsms", data, this.options);
    }
    //POST : setting-unit of measurement manage
    public PostUnitOfMeasurement(uom) {
        let data = JSON.stringify(uom);
        return this.http.post<any>("/api/Pharmacy?reqType=unitofmeasurement", data, this.options);
    }
    //POST : setting-item type manage
    public PostItemType(itemtype) {
        let data = JSON.stringify(itemtype)
        return this.http.post<any>("/api/Pharmacy?reqType=itemtype", data, this.options);
    }
    //POST : setting-item manage
    public PostItem(item) {
        let data = JSON.stringify(item)
        return this.http.post<any>("/api/Pharmacy?reqType=item", data, this.options);
    }
    //POST : setting-tax manage
    public PostTAX(tax) {
        let data = JSON.stringify(tax)
        return this.http.post<any>("/api/Pharmacy?reqType=tax", data, this.options);
    }
    //POST : Generic Name
    public PostGenericName(genericName) {
        let data = JSON.stringify(genericName);
        return this.http.post<any>("/api/Pharmacy?reqType=genericName", data, this.options);
    }
    //POST : narcotic Record
    public PostNarcoticRecord(narcoticRecord) {
        let data = JSON.stringify(narcoticRecord);
        return this.http.post<any>("/api/Pharmacy?reqType=narcoticRecord", data, this.options);
    }

    //POST: Patient
    //POST: Outdoor Patient Registration post to server/controller/api
    public PostPatientRegister(patient) {
        try {
            let data = JSON.stringify(patient);
            return this.http.post<any>("/api/Pharmacy?reqType=outdoorPatRegistration", data, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }
    //POST: Save Purchase Order
    public PostToPurchaseOrder(PurchaseOrderObjString: string) {
        let data = PurchaseOrderObjString;
        return this.http.post<any>("/api/Pharmacy?reqType=PurchaseOrder", data, this.options);

    }
    //POST:Save Goods Receipt
    public PostToGoodReceipt(GoodReceiptVMObjString: string) {
        let data = GoodReceiptVMObjString;
        return this.http.post<any>("/api/Pharmacy?reqType=postGoodReceipt", data, this.options);
  }
    ////POST: Return To Supplier Items
    public PostReturnToSupplierItems(ReturnToSupplierObjString: string) {
        let data = ReturnToSupplierObjString;
        return this.http.post<any>("/api/Pharmacy?reqType=postReturnToSupplierItems", data, this.options);

  }





    ////POST: WriteOff and WriteOffItems
    public PostWriteOffItems(WriteOffObjString: string) {
        try {
            let data = WriteOffObjString;
            return this.http.post<any>("/api/Pharmacy?reqType=postWriteOffItems", data, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }



    //POST: Save Prescription with Prescription Items
    public PostPrescription(data: string) {
        return this.http.post<any>("/api/Pharmacy?reqType=postprescription", data, this.options);
    }

    //POST:
    public PostInvoiceDetails(data: string) {
        try {
            return this.http.post<any>("/api/Pharmacy?reqType=postinvoice", data, this.options);
        } catch (ex) {
            throw ex;
        }
  }
  public PostSalesCategoryDetails(data: string) {
    try {
      return this.http.post<any>("/api/Pharmacy?reqType=postsalescategorydetail", data, this.options);
    } catch (ex) {
      throw ex;
    }
  }
  
  public GetSalesCategoryList() {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getsalescategorylist", this.options);
    } catch (ex) {
      throw ex;
    }
  }

    //POST:return from customer invoice data to post server
    public PostReturnFromCustomerData(data: string) {
        try {
            return this.http.post<any>("/api/Pharmacy?reqType=returnfromcustomer", data, this.options);
        } catch (ex) {
            throw ex;
        }
    }

    //POST:update stockManage transaction
    //Post to StockManage table and post to stockTxnItem table 
    PostManagedStockDetails(data) {
        try {
            return this.http.post<any>("/api/Pharmacy?reqType=manage-stock-detail", data, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }

  //POST:update storeManage transaction
  //Post to StoreStock table
  PostManagedStoreDetails(data) {
    try {
      return this.http.post<any>("/api/Pharmacy?reqType=manage-store-detail", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
    //POST: transfer to Dispensary and update store stock
    TransferToDispensary(data){
      try {
        return this.http.post<any>("/api/Pharmacy?reqType=transfer-to-dispensary", data, this.options);
      } catch (ex) {
        throw ex;
      }
  }
  //POST: transfer to Store and update Dispensary stock
  TransferToStore(data,StoreId) {
    try {
      return this.http.post<any>("/api/Pharmacy?reqType=transfer-to-store&storeId=" + StoreId, data, this.options);
    } catch (ex) {
      throw ex;
    }
  }
    //POST:update goods receipt cancelation
    //post to stock transaction items
    PostGoodsReceiptCancelDetail(data) {
        try {
            return this.http.post<any>("/api/Pharmacy?reqType=cancel-goods-receipt", data, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }
    //Post drugs request data from nursing to pharmacy invoice item table.
    public PostProvisonalItems(requisitionObjString: string) {
        return this.http.post<any>("/api/Pharmacy?reqType=post-provisional-item", requisitionObjString, this.options);
    }

    public PostPharmacyDeposit(PHRMDepositModel: PHRMDepositModel) {
        let data = JSON.stringify(PHRMDepositModel);
        return this.http.post<any>("/api/Pharmacy?reqType=depositData", data, this.options);
    }
     //Post ward request data from ward supply to pharmacy
    public PostWardRequisitionItems(requisitionObjString: string) {
        return this.http.post<any>("/api/Pharmacy?reqType=post-ward-requesition-item", requisitionObjString, this.options);
    }
    //PUT : setting-supplier manage
    public PutSupplier(supplier) {
        let data = JSON.stringify(supplier);
        return this.http.put<any>("/api/Pharmacy?reqType=supplier", data, this.options);
    }
    //PUT : setting-company manage
    public PutCompany(company) {
        let data = JSON.stringify(company);
        return this.http.put<any>("/api/Pharmacy?reqType=company", data, this.options);
    }
    //PUT : setting-dispensary manage
    public PutDispensary(dispensary) {
      let data = JSON.stringify(dispensary);
      return this.http.put<any>("/api/Pharmacy?reqType=dispensary", data, this.options);
    }
    //PUT : setting-category manage
    public PutCategory(category) {
        let data = JSON.stringify(category);
        return this.http.put<any>("/api/Pharmacy?reqType=category", data, this.options);
    }
    //PUT : setting-unit of measurement manage
    public PutUnitOfMeasurement(uom) {
        let data = JSON.stringify(uom);
        return this.http.put<any>("/api/Pharmacy?reqType=unitofmeasurement", data, this.options);
    }
    //PUT : setting-item type manage
    public PutItemType(itemtype) {
        let data = JSON.stringify(itemtype);
        return this.http.put<any>("/api/Pharmacy?reqType=itemtype", data, this.options);
    }
    //PUT : setting-item  manage
    public PutItem(item) {
        let data = JSON.stringify(item);
        return this.http.put<any>("/api/Pharmacy?reqType=item", data, this.options);
    }
    //PUT : setting-item type manage
    public PutTAX(tax) {
        let data = JSON.stringify(tax);
        return this.http.put<any>("/api/Pharmacy?reqType=tax", data, this.options);
    }
    //PUT GenericName
    public PutGenericName(genericName) {
        let data = JSON.stringify(genericName);
        return this.http.put<any>("/api/Pharmacy?reqType=genericName", data, this.options);
    }

    //PUT : Stock Manage
    PutStock(stkManage) {
        try {
            let data = JSON.stringify(stkManage);
            return this.http.put<any>("/api/Pharmacy?reqType=stockManage", data, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }

    //PUT: DepositPrintCount
    PutDepositPrintCount(depositdata) {
        let data = JSON.stringify(depositdata);
        return this.http.put<any>("/api/Pharmacy?reqType=updateDepositPrint",data,this.options);
    }

    //PUT: Sale -Payment of Credit Invoice Items
    putPayInvoiceItemsCredit(CreditPayData) {
        try {
            let data = JSON.stringify(CreditPayData);
            return this.http.put<any>("/api/Pharmacy?reqType=InvItemsCreditPay", data, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }

    //PUT: Setting- Stock Txn Items MRP change
    public PutStockTxnItemMRP(stockTxnItem) {
        try {
            let data = JSON.stringify(stockTxnItem);
            return this.http.put<any>("/api/Pharmacy?reqType=put-stockTxnItemMRP", data, this.options);
        }
        catch (ex) {
            throw ex;
        }
    }



    ///Abhishek: 4Sept'18 -- for credit billing

    public GetAllCreditSummary() {
        return this.http.get<any>("/api/Pharmacy?reqType=listpatientunpaidtotal");
    }

    public GetPatientCreditItems(patientId: number) {
        return this.http.get<any>("/api/Pharmacy?reqType=provisionalItemsByPatientId&patientId=" + patientId);
    }

    //POST:
    public PostCreditItemsDetails(data: string, requisitionId: number) {
        try {
            return this.http.post<any>("/api/Pharmacy?reqType=postCreditItems&requisitionId=" + requisitionId, data, this.options);
        } catch (ex) {
            throw ex;
        }
    }

    public AddInvoiceForCreditItems(data: string) {
        try {
            return this.http.post<any>("/api/Pharmacy?reqType=addInvoiceForCrItems", data, this.options);
        } catch (ex) {
            throw ex;
        }
    }
    public updateInvoiceForCreditItems(data: string) {
        try {
            return this.http.post<any>("/api/Pharmacy?reqType=updateInvoiceForCrItems", data, this.options);
        } catch (ex) {
            throw ex;
        }
    }

    // print to update the print count on billtransaction
    public PutPrintCount(printCount: number, invoiceNo: number) {
        return this.http.put<any>("/api/Pharmacy?reqType=UpdatePrintCountafterPrint" + "&PrintCount=" + printCount + "&invoiceNo=" + invoiceNo, this.options);
    }

   public PutAddItemToRack(itemId: number, rackId: number) {
       return this.http.put<any>("/api/Pharmacy?reqType=add-Item-to-rack" + "&itemId=" + itemId + "&rackId=" + rackId, this.options);
    }
    // for cancel the credit bill.
   public CancelCreditBill(creditItems: string) {
       try {
           let data = JSON.stringify(creditItems);
           return this.http.post<any>("/api/Pharmacy?reqType=cancelCreditItems", data, this.options);
       } catch (ex) {
           throw ex;
       }
   }
}
