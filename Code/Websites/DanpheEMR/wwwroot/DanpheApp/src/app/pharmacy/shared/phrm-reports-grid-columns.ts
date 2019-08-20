import * as moment from 'moment/moment';
import { CommonFunctions } from '../../shared/common.functions';
export default class PHRMReportsGridColumns {

  static PHRMPurchaseOrderReport = [
    { headerName: "Date", field: "Date", width: 110, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "ItemName", field: "ItemName", width: 200 },
    { headerName: "POStatus", field: "POStatus", width: 150 },
    { headerName: "Quantity", field: "Quantity", width: 150 },
    { headerName: "ReceivedQuantity", field: "ReceivedQuantity", width: 150 },
    { headerName: "StandaredPrice", field: "StandaredPrice", width: 150 },
    { headerName: "SubTotal", field: "Subtotal", width: 150 },
    { headerName: "VATAmount", field: "VATAmount", width: 150 },
    { headerName: "TotalAmount", field: "TotalAmount", width: 150 },

  ]
  static PHRMUserwiseCollectionReport = [
    { headerName: "Date", field: "Date", width: 110, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "User Name", field: "UserName", width: 200 },
    { headerName: "Total Amount", field: "TotalAmount", width: 150 },
    { headerName: "Returned Amount", field: "ReturnedAmount", width: 150 },
    { headerName: "Net Amount", field: "NetAmount", width: 150 },
  ]

  static PHRMSaleReturnReport = [
    { headerName: "Return Date", field: "Date", width: 100, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "Invoice Date", field: "InvDate", width: 100, cellRenderer: PHRMReportsGridColumns.InvoiceDate },
    { headerName: "Invoice PrintId", field: "InvoicePrintId", width: 100 },
    { headerName: "User Name", field: "UserName", width: 100 },
    { headerName: "Patient Name", field: "PatientName", width: 200 },
    { headerName: "Returned Quantity", field: "Quantity", width: 100 },
    { headerName: "Total Amount", field: "TotalAmount", width: 100 },
    { headerName: "Discount Amount", field: "Discount", width: 100 },
  ]


  static PHRMCounterwiseCollectionReport = [
    { headerName: "Date", field: "Date", width: 110, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "User Name", field: "UserName", width: 200 },
    { headerName: "Counter Name", field: "CounterName", width: 150 },
    { headerName: "Total Amount", field: "TotalAmount", width: 150 },
    { headerName: "Returned Amount", field: "ReturnedAmount", width: 150 },
    { headerName: "Net Amount", field: "NetAmount", width: 150 },
    { headerName: "Discount Amount", field: "DiscountAmount", width: 150 },
  ]
  static PHRMBreakageItemReport = [
    { headerName: "Date", field: "Date", width: 100, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "User Name", field: "UserName", width: 100 },
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "BreakageQty", field: "BreakageQty", width: 100 },
    { headerName: "MRP", field: "MRP", width: 100 },
    { headerName: "Total Amount", field: "TotalAmount", width: 100 },

  ]

  static PHRMStockManageDetailReport = [
    { headerName: "Date", field: "Date", width: 110, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "Batch No.", field: "BatchNo", width: 100 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 200, cellRenderer: PHRMReportsGridColumns.DateOfExpiry },
    { headerName: "Quantity", field: "Quantity", width: 80 },
    { headerName: "In/Out", field: "InOut", width: 150 },
    { headerName: "MRP", field: "MRP", width: 80 },
    { headerName: "Price", field: "Price", width: 80 },
    { headerName: "Total Amt", field: "TotalAmount", width: 100 },
    { headerName: "Remarks", field: "Remark", width: 250 },

  ]

  static PHRMDepositBalanceReport = [
    { headerName: "SR No.", field: "SN", width: 20 },
    { headerName: "Hospital Number", field: "PatientCode", width: 80 },
    { headerName: "Patient Name", field: "PatientName", width: 80 },
    { headerName: "Deposit Amt", field: "DepositBalance", width: 80 },
  
  ]

  static PHRMGoodsReceiptProductReport = [
    { headerName: "G.R. No", field: "GoodReceiptPrintId", width: 100 },
    { headerName: "Product Name", field: "ItemName", width: 250 },
    { headerName: "Batch No", field: "BatchNo", width: 100 },
    { headerName: "Qty", field: "ReceivedQuantity", width: 100 },
    { headerName: "Free Qty", field: "FreeQuantity", width: 100 },
    { headerName: "GR Price", field: "ItemPrice", width: 100 },
    { headerName: "MRP", field: "MRP", width: 100 },
    { headerName: "Supplier", field: "SupplierName", width: 200 },
    { headerName: "Supplier Contact", field: "ContactNo", width: 150 },
    { headerName: "Date", field: "Date", width: 110, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },

  ]

  static PHRMItemWiseStockReport = [
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "Batch No.", field: "BatchNo", width: 100 },
    { headerName: "Stock Qty", field: "StockQty", width: 100 },
    { headerName: "MRP", field: "MRP", width: 100 },
    { headerName: "Dispensary/Store Name", field: "Name", width: 100 },
  ]

    static PHRMSupplierInfoReport = [
        { headerName: "SupplierName", field: "SupplierName", width: 110 },
        { headerName: "Contact No", field: "ContactNo", width: 200 },
        { headerName: "City", field: "City", width: 150 },
        { headerName: "Pan No.", field: "Pin", width: 150 },
        { headerName: "ContactAddress", field: "ContactAddress", width: 150 },
        { headerName: "Email", field: "Email", width: 150 },
    ]

  static PHRMCreditInOutPatReport = [
        { headerName: 'Date', field: "Date", width: 80, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
        { headerName: "InvoiceNo", field: "InvoiceNum", width: 100 },
        { headerName: "HospitalNo", field: "PatientCode", width: 110 },
        { headerName: "PatientName", field: "PatientName", width: 200 },
        { headerName: "Address", field: "Address", width: 150 },
        { headerName: "CreditAmount", field: "PaidAmount", width: 150 },
        { headername: "VisitType", field: "VisitType", width: 150 },

  ]

  static PHRMStockItemsReport = [
    { headerName: "ItemName", field: "ItemName", width: 200 },
    { headerName: "Batch No.", field: "BatchNo", width: 150 },
    { headerName: "GRP", field: "GRItemPrice", width: 100 },
    { headerName: "MRP", field: "MRP", width: 100 },
    { headerName: "Quantity", field: "AvailableQuantity", width: 100, cellRenderer: PHRMReportsGridColumns.MinimumStockRenderer },
    { headerName: "Min. Stock", field: "MinStockQuantity", width: 100 },
    { headerName: "NetAmount", field: "TotalAmount", width: 150 },

  ]

  static PHRMSupplierStockSummaryReport = [
    { headerName: "Sr.No.", field: "SN", width: 110 },
    { headerName: "Supplier Name", field: "SupplierName", width: 150 },
    { headerName: "Qty", field: "Qty", width: 150 },
    { headerName: "Purchase Value", field: "PurchaseValue", width: 150 },
    { headerName: "Sales Value", field: "SalesValue", width: 150 },
  ]

  static PHRMBatchStockReport = [
    { headerName: "Sr.No.", field: "SN", width: 80 },
    { headerName: "Batch No", field: "BatchNo", width: 100 },
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "Generic Name", field: "GenericName", width: 200 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 150, cellRenderer: PHRMReportsGridColumns.DateOfExpiry },
    { headerName: "Total Qty", field: "TotalQty", width: 150 },
    { headerName: "MRP", field: "MRP", width: 150 },
  ]

  static PHRMStockMovementReport = [
    { headerName: "Sr.No.", field: "SN", width: 110 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Item Code", field: "ItemCode", width: 150 },
    { headerName: "Purchase Qty", field: "PurchaseQty", width: 150 },
    { headerName: "Purchase Rate", field: "PurchaseRate", width: 150 },
    { headerName: "Purchase Value", field: "PurchaseValue", width: 150 },
    { headerName: "Sales Qty", field: "SalesQty", width: 150 },
    { headerName: "Sales Rate", field: "SalesRate", width: 150 },
    { headerName: "Sales Value", field: "SalesValue", width: 150 },
  ]
  static PHRMSupplierStockReport = [
    { headerName: "Company Name", field: "CompanyName", width: 150 },
    { headerName: "Supplier Name", field: "SupplierName", width: 200 },
    { headerName: "Item Name", field: "ItemName", width: 170 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 100 },
    { headerName: "Quantity", field: "Quantity", width: 100 },
    { headerName: "Purchase Rate", field: "PurchaseRate", width: 150 },
    { headerName: "Sub Total", field: "SubTotal", width: 100 },
    { headerName: "Discount Amount", field: "DiscountAmount", width: 150 },
    { headerName: "VAT Amount", field: "VATAmount", width: 130 },
    { headerName: "Total Amount", field: "TotalAmount", width: 150 },
  ]

  static PHRMExpiryReport = [
    { headerName: "Sr.No.", field: "SN", width: 110 },
    { headerName: "Generic Name", field: "GenericName", width: 150 },
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "BatchNo", field: "BatchNo", width: 150 },
    { headerName: "ExpiryDate", field: "ExpiryDate", width: 250, cellRenderer: PHRMReportsGridColumns.DateOfExpiry },
    { headerName: "Code", field: "ItemId", width: 150 },
    { headerName: "Quantity", field: "Qty", width: 150 },

  ]
  static PHRMMinStockReport = [
    { headerName: "Item Name", field: "ItemName", width: 250 },
    { headerName: "BatchNo", field: "BatchNo", width: 100 },
    { headerName: "AvailableQuantity", field: "Quantity", width: 100 },
    { headerName: "MinStockQuantity", field: "MinStockQuantity", width: 100 },
    { headerName: "ExpiryDate", field: "ExpiryDate", width: 250, cellRenderer: PHRMReportsGridColumns.DateOfExpiry },
  ]

  static PHRMEndingStockSummaryReport = [
    { headerName: "Sr.No.", field: "SN", width: 110 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Item Code", field: "ItemCode", width: 150 },
    { headerName: "Quantity", field: "Quantity", width: 150 },
    { headerName: "Purchase Rate", field: "PurchaseRate", width: 150 },
    { headerName: "Purchase Value", field: "PurchaseValue", width: 150 },

  ]
  static PHRMBillingReport = [
    { headerName: "Date", field: "Date", width: 100, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "Invoice Number", field: "InvoicePrintId", width: 150 },
    { headerName: "HospitalNo.", field: "HospitalNo", width: 150 },
    { headerName: "PatientName", field: "PatientName", width: 200 },
    { headerName: "UserName", field: "UserName", width: 150 },
    { headerName: "DiscountAmount", field: "DiscountAmount", width: 150 },
    { headerName: "TotalAmount", field: "TotalAmount", width: 150 },
    { headerName: "PaymentMode", field: "PaymentMode", width: 150 },

  ]
  static PHRMDailyStockSummaryReport = [
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "BatchNo", field: "BatchNo", width: 150 },
    { headerName: "GenericName", field: "GenericName", width: 150 },
    { headerName: "ExpiryDate", field: "ExpiryDate", width: 150 },
    { headerName: "MRP", field: "MRP", width: 150 },
    { headerName: "Price", field: "Price", width: 150 },
    { headerName: "Opening Stock", field: "OpeningQty", width: 150 },
    { headerName: "Ending Stock", field: "EndQty", width: 150 },

  ]
  static DailySalesSummaryReportColumns = [
    { headerName: "Sr.No.", field: "SN", width: 110 },
    { headerName: "Date", field: "TxnDate", width: 150 },
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "Opening Stock", field: "OpeningStock", width: 150 },
    { headerName: "Purchase Qty", field: "PurchaseQty", width: 150 },
    { headerName: "Purchase Rate", field: "PurchaseValue", width: 150 },
    { headerName: "Sales Qty", field: "SalesQty", width: 150 },
    { headerName: "Sales Value", field: "SalesValue", width: 150 },
    { headerName: "Ending Stock Qty", field: "EndingStockQty", width: 150 },
  ]
  static PHRMABCVEDStockReportColumns = [
    { headerName: "Item Name", field: "ItemName", width: 250 },
    { headerName: "Generic Name", field: "GenericName", width: 200 },
    { headerName: "Quantity", field: "Quantity", width: 100 },
    { headerName: "ABC", field: "ABC", width: 100 },
    { headerName: "VED", field: "VED", width: 100 },
  ]

  static PHRMReturnToSupplierReport = [
    { headerName: "S.N.", field: "SN", width: 70 },
    { headerName: "Date", field: "Date", width: 120, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "Supplier Name", field: "SupplierName", width: 200 },
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "Return Date", field: "ReturnDate", width: 140, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "Qty", field: "Qty", width: 70 },
    { headerName: "Sub Total", field: "SubTotal", width: 130 },
    { headerName: "Dis. Amt", field: "DiscountAmount", width: 130 },
    { headerName: "VAT Amt", field: "VATAmount", width: 130 },
    { headerName: "Total Amt", field: "TotalAmount", width: 140 },
    { headerName: "Supplier CreditNote Num", field: "SupplierCreditNoteNum", width: 180 },
    { headerName: "CreditNote Num", field: "CreditNoteNum", width: 150 },
    { headerName: "Remarks", field: "Remarks", width: 150 },
  ]

  static PHRMDrugCategoryWiseReport = [
    { headerName: "Date", field: "Date", width: 110, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "CategoryName", field: "CategoryName", width: 150 },
    { headerName: "ItemName", field: "ItemName", width: 200 },
    { headerName: "PatientName", field: "PatientName", width: 200 },
    { headerName: "ProviderName", field: "ProviderName", width: 130 },
    { headerName: "BatchNo", field: "BatchNo", width: 130 },
    { headerName: "Quantity", field: "Quantity", width: 130 },
    { headerName: "Price", field: "Price", width: 130 },
    { headerName: "TotalAmount", field: "TotalAmount", width: 130 },
  ]

  static DateConverterRenderer(params) {
    let Date: string = params.data.Date;
    return moment(Date).format('DD-MMM-YYYY');
  }


  static InvoiceDate(params) {
    let InvDate: string = params.data.InvDate;
    return moment(InvDate).format('DD-MMM-YYYY');
  }
  static MinimumStockRenderer(params) {
    let quantity: number = params.data.AvailableQuantity;
    let minQty: number = params.data.MinStockQuantity;
    if (quantity < minQty) {
      return "<span style='background-color:red;color:white'>" + quantity + "(" + "Low Stock" + ")" + "</span>";
    }
    else
      return "<span style=';color:black'>" + quantity + "</span>";
  }
  static DateOfExpiry(params) {
    let expiryDate: Date = params.data.ExpiryDate;
    let expiryDate1 = new Date(params.data.ExpiryDate)
    let date = new Date();
    let datenow = date.setMonth(date.getMonth() + 0);
    let datethreemonth = date.setMonth(date.getMonth() + 3);
    let expDate = expiryDate1.setMonth(expiryDate1.getMonth() + 0);

    if (expDate <= datenow) {
      return "<span style='background-color:red;color:white'>" + expiryDate + "(" + "Expired" + ")" + "</span>";
    }
    if (expDate < datethreemonth && expDate > datenow) {

      return "<span style='background-color:green;color:white'>" + expiryDate + "(" + "Nearly Expired" + ")" + "</span>";
    }
    if (expDate > datethreemonth) {

      return "<span style='background-color:green;color:white'>" + expiryDate + "(" + "Not Expire" + ")" + "</span>";
    }


  }
}
