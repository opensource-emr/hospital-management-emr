import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';
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
    { headerName: "Date", field: "Date", width: 90, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "Type", field: "TransactionType", width: 90 },
    { headerName: "ReceiptNo", field: "ReceiptNo", width: 110 },
    { headerName: "Hospital Number", field: "HospitalNo", width: 90 },
    { headerName: "PatientName", field: "PatientName", width: 220 },
    { headerName: "SubTotal", field: "SubTotal", width: 80 },
    { headerName: "Discount", field: "DiscountAmount", width: 80 },
    { headerName: "Net Total", field: "TotalAmount", width: 100 },
    { headerName: "Cash Collection", field: "CashCollection", width: 80 },
    { headerName: "User", field: "CreatedBy", width: 100 },
    { headerName: "Remarks", field: "Remarks", width: 100 },
    { headerName: "Counter", field: "CounterName", width: 100 },
    { headerName: "Store", field: "StoreName", width: 100 }
  ]
  static PHRMUserwiseCollectionReportWithVAT = [
    { headerName: "Date", field: "Date", width: 90, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "Type", field: "TransactionType", width: 90 },
    { headerName: "ReceiptNo", field: "ReceiptNo", width: 110 },
    { headerName: "Hospital Number", field: "HospitalNo", width: 90 },
    { headerName: "PatientName", field: "PatientName", width: 220 },
    { headerName: "SubTotal", field: "SubTotal", width: 80 },
    { headerName: "Discount", field: "DiscountAmount", width: 80 },
    { headerName: "VAT Amount", field: "VATAmount", width: 80 },
    { headerName: "Net Total", field: "TotalAmount", width: 100 },
    { headerName: "Cash Collection", field: "CashCollection", width: 80 },
    { headerName: "User", field: "CreatedBy", width: 100 },
    { headerName: "Remarks", field: "Remarks", width: 100 },
    { headerName: "Counter", field: "CounterName", width: 100 },
    { headerName: "Store", field: "StoreName", width: 100 }
  ]

  static PHRMCashCollectionSummaryReport = [
    { headerName: "Date", field: "Date", width: 110, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "User Name", field: "UserName", width: 200 },
    { headerName: "Invoice Amount", field: "TotalAmount", width: 150, cellRenderer: PHRMReportsGridColumns.InvoiceAmountRenderer },
    { headerName: "Invoice Returned", field: "ReturnedAmount", width: 150 },
    { headerName: "Discount Amount", field: "DiscountAmount", width: 150 },
    { headerName: "Deposit", field: "DepositAmount", width: 150 },
    { headerName: "Deposit Return", field: "DepositReturn", width: 150 },
    { headerName: "Net Amount", field: "NetAmount", width: 150,  cellRenderer: PHRMReportsGridColumns.NetAmountRenderer },
    { headerName: "Store Name", field: "StoreName", width: 150 }
  ]
  //client side decimal upto 2 digits.
  static InvoiceAmountRenderer(params) {
    let amount = "";
    if (params.data.TotalAmount) {
      amount = CommonFunctions.parseAmount(params.data.TotalAmount);
    }
    return amount;
  }
  static NetAmountRenderer(params) {
    let amount: number = 0;
    if (params.data.NetAmount) {
      amount = CommonFunctions.parseAmount(params.data.NetAmount);
    }
    return amount;
  }
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
    { headerName: "S.Price", field: "MRP", width: 100 },
    { headerName: "Total Amount", field: "TotalAmount", width: 100 },

  ]

  static PHRMStockManageDetailReport = [
    { headerName: "Date", field: "Date", width: 110, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "Batch No.", field: "BatchNo", width: 100 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 200, cellRenderer: PHRMReportsGridColumns.DateOfExpiry },
    { headerName: "Quantity", field: "Quantity", width: 80 },
    { headerName: "In/Out", field: "InOut", width: 150 },
    { headerName: "S.Price", field: "MRP", width: 80 },
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
    { headerName: "Date", field: "Date", width: 110, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "Bill No", field: "InvoiceNo", width: 100 },
    { headerName: "Product Name", field: "ItemName", width: 250 },
    { headerName: "Supplier", field: "SupplierName", width: 200 },
    { headerName: "Batch No", field: "BatchNo", width: 100 },
    { headerName: "Qty", field: "ReceivedQuantity", width: 100 },
    { headerName: "Free Qty", field: "FreeQuantity", width: 100 },
    { headerName: "Purchase Rate", field: "ItemPrice", width: 100 },
    { headerName: "Sales Rate", field: "MRP", width: 100 },
    { headerName: "SubTotal", field: "SubTotal", width: 100 },
    { headerName: "TotalAmount", field: "TotalAmount", width: 100 }

    // { headerName: "Supplier Contact", field: "ContactNo", width: 150 },


  ]

  static PHRMItemWiseStockReport = [
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "Batch No.", field: "BatchNo", width: 100 },
    { headerName: "Stock Qty", field: "StockQty", width: 100 },
    { headerName: "S.Price", field: "MRP", width: 100 },
    { headerName: "Dispensary/Store Name", field: "StoreName", width: 100 },
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
    { headerName: "CreditAmount", field: "PaidAmount", width: 100 },
    { headername: "VisitType", field: "VisitType", width: 100 },
    { headername: "Organization", field: "OrganizationName", width: 150 },
    { headername: "Remark", field: "Remark", width: 150 },

  ]

  static PHRMStockItemsReport = [
    { headerName: "ItemName", field: "ItemName", width: 200 },
    { headerName: "Batch No.", field: "BatchNo", width: 150 },
    { headerName: "ExpiryDate", field: "ExpiryDate", width: 150, cellRenderer: PHRMReportsGridColumns.DateOfExpiry },
    { headerName: "S.Price", field: "MRP", width: 100 },
    { headerName: "Quantity", field: "AvailableQuantity", width: 100, cellRenderer: PHRMReportsGridColumns.MinimumStockRenderer },
    { headerName: "Min. Stock", field: "MinStockQuantity", width: 100 },
    { headerName: "Location", field: "Location", width: 150 },

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
    { headerName: "S.Price", field: "MRP", width: 150 },
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
    { headerName: "Receipt Date", width: 150, cellRenderer: PHRMReportsGridColumns.GoodsReceiptDateRenderer },
    { headerName: "Supplier Name", field: "SupplierName", width: 200 },
    { headerName: "Item Name", field: "ItemName", width: 170 },
    { headerName: "BatchNo", field: "BatchNo", width: 170 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 100 },
    { headerName: "Quantity", field: "ReceivedQuantity", width: 100 },
    { headerName: "Purchase Rate", field: "PurchaseRate", width: 150 },
    { headerName: "Sub Total", field: "SubTotal", width: 100 },
    // { headerName: "Discount Amount", field: "DiscountAmount", width: 150 },
    { headerName: "VAT Amount", field: "VATAmount", width: 130 },
    { headerName: "Total Amount", field: "TotalAmount", width: 150 },
  ]
  
  static SupplierWiseStockReport = [
    { headerName: "Opening Stk", field: "OpeningStock", width: 100 },
    { headerName: "Supplier Name", field: "SupplierName", width: 200 },
    { headerName: "Batch Number", field: "BatchNo", width: 150 },
    { headerName: "ExpiryDate", field: "ExpiryDate", width: 100,  cellRenderer: PHRMReportsGridColumns.DateOfExpiry },
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "Purchase Qty", field: "PurchaseQty", width: 100 },
    { headerName: "Sales Qty", field: "SalesQuantity", width: 100 },
    { headerName: "Return Qty", field: "ReturnQuantity", width: 100 },
    { headerName: "Closing Stk", field: "ClosingStock", width: 100 },
    { headerName: "Store Name", field: "StoreName", width: 150},
  ]
  static PHRMDateWisePurchaseReport = [
    { headerName: "SN", field: "SN", width: 50 },
    { headerName: "Receipt Date", field: "GoodReceiptDate", width: 150, cellRenderer: PHRMReportsGridColumns.GoodsReceiptDateRenderer },
    { headerName: "Supplier Name", field: "SupplierName", width: 170 },
    { headerName: "Bill No", field: "InvoiceNo", width: 170 },
    { headerName: "Item Name", field: "ItemName", width: 170 },
    { headerName: "Generic Name", field: "GenericName", width: 170 },
    { headerName: "BatchNo", field: "BatchNo", width: 170 },
    //{ headerName: "Expiry Date", field: "ExpiryDate", width: 100 },
    { headerName: "Quantity", field: "Quantity", width: 100 },
    { headerName: "Purchase Rate", field: "PurchaseRate", width: 150 },
    { headerName: "Sub Total", field: "SubTotal", width: 100 },
    // { headerName: "Discount Amount", field: "DiscountAmount", width: 150 },
    { headerName: "VAT Amount", field: "VATAmount", width: 130 },
    { headerName: "Total Amount", field: "TotalAmount", width: 150 },
  ]
  static SupplierWisePurchaseReport = [
    { headerName: "SN", field: "SN", width: 50 },
    { headerName: "GoodReceiptDate", field: "GoodReceiptDate", width: 150, cellRenderer: PHRMReportsGridColumns.GoodsReceiptDateRenderer },
    { headerName: "Supplier Name", field: "SupplierName", width: 170 },
    { headerName: "Bill No", field: "InvoiceNo", width: 170 },
    { headerName: "Item Name", field: "ItemName", width: 170 },
    { headerName: "Generic Name", field: "GenericName", width: 170 },
    { headerName: "BatchNo", field: "BatchNo", width: 170 },
    //{ headerName: "Expiry Date", field: "ExpiryDate", width: 100 },
    { headerName: "Quantity", field: "Quantity", width: 100 },
    { headerName: "Purchase Rate", field: "PurchaseRate", width: 150 },
    { headerName: "Sub Total", field: "SubTotal", width: 100 },
    // { headerName: "Discount Amount", field: "DiscountAmount", width: 150 },
    { headerName: "VAT Amount", field: "VATAmount", width: 130 },
    { headerName: "Total Amount", field: "TotalAmount", width: 150 },
  ]

  static PHRMExpiryReport = [
    { headerName: "Sr.No.", field: "SN", width: 110 },
    { headerName: "Generic Name", field: "GenericName", width: 150 },
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "Supplier Name", field: "SupplierName", width: 200 },
    { headerName: "BatchNo", field: "BatchNo", width: 150 },
    { headerName: "ExpiryDate", field: "ExpiryDate", width: 250, cellRenderer: PHRMReportsGridColumns.DateOfExpiry },
    { headerName: "S.Price", field: "MRP", width: 150 },
    { headerName: "Cost Price", field: "CostPrice", width: 150 },
    { headerName: "Quantity", field: "AvailableQuantity", width: 150 },
    { headerName: "StoreName", field: "Name", width: 150 },

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
    { headerName: "Invoice Date", field: "InvoiceDate", width: 130, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "Invoice Number", field: "InvoicePrintId", width: 150 },
    { headerName: "HospitalNo.", field: "HospitalNo", width: 150 },
    { headerName: "PatientName", field: "PatientName", width: 200 },
    { headerName: "SubTotal", field: "SubTotal", width: 150 },
    { headerName: "DiscountAmount", field: "DiscountAmount", width: 150 },
    { headerName: "TotalAmount", field: "TotalAmount", width: 150 },
    { headerName: "PaymentMode", field: "PaymentMode", width: 150 },
    { headerName: "Store", field: "StoreName", width: 150 },
    { headerName: "User", field: "UserName", width: 150 },

  ]
  static PHRMRackStockDistributionReport = [
    { headerName: "Rack Name", field: "RackName", width: 100 },
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Batch No.", field: "BatchNo", width: 150 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 200, cellRenderer: PHRMReportsGridColumns.DateOfExpiry },
    { headerName: "Available Quantity", field: "AvailableQuantity", width: 150 },
    { headerName: "Price", field: "Price", width: 150 },
    { headerName: "Stock Value", field: "StockValue", width: 150 },
    { headerName: "Location", field: "Location", width: 150 },
  ]
  static PHRMStockSummaryReport = [
    { headerName: "Item Name", field: "ItemName", width: 150, cellRenderer: PHRMReportsGridColumns.GetItemAction },
    { headerName: "Unit", field: "UOMName", width: 100 },
    { headerName: "Purchase", field: "Purchase", width: 100 },
    { headerName: "Purchase Return", field: "PurchaseReturn", width: 150 },
    { headerName: "Purchase Cancel", field: "PurchaseCancel", width: 150 },
    { headerName: "StockManage IN", field: "StockManageIn", width: 150 },
    { headerName: "Sale", field: "Sale", width: 100 },
    { headerName: "SaleReturn", field: "SaleReturn", width: 150 },
    { headerName: "StockManage OUT", field: "StockManageOut", width: 180 }

  ]
  static GetItemAction(params) {
    return `<a danphe-grid-action="itemTxnDetail">
               ${params.data.ItemName}
             </a>`;
  }
  static PHRMItemTxnSummaryReport = [
    { headerName: "Date", field: "TransactionDate", width: 120 },
    { headerName: "Ref No", field: "ReferenceNo", width: 100, cellRenderer: PHRMReportsGridColumns.ItemTxnReferenceNoRenderer },
    { headerName: "Type", field: "Type", width: 100 },
    { headerName: "In", field: "StockIn", width: 50 },
    { headerName: "Out", field: "StockOut", width: 50 },
    { headerName: "C.Price", field: "Rate", width: 50 },
    { headerName: "S.Price", field: "MRP", width: 50 },
    { headerName: "Expiry", field: "ExpiryDate", width: 100, cellRenderer: PHRMReportsGridColumns.DateOfExpiry },
    { headerName: "Store", field: "StoreName", width: 100 },
    { headerName: "User", field: "UserName", width: 100 }
  ]
  static ItemTxnReferenceNoRenderer(params) {
    return `<a danphe-grid-action="showPrintPopUp">
                ${params.data.ReferenceNoPrefix}${params.data.ReferencePrintNo ? params.data.ReferencePrintNo : ''}
            </a>`;
  };

  static PHRMDailyStockSummaryReport = [
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "BatchNo", field: "BatchNo", width: 150 },
    { headerName: "GenericName", field: "GenericName", width: 150 },
    { headerName: "ExpiryDate", field: "ExpiryDate", width: 150 },
    { headerName: "S.Price", field: "MRP", width: 150 },
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
  static PHRMTransferToStoreReport = [
    { headerName: "Transferred Date", field: "Date", width: 100, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "Batch No", field: "BatchNo", width: 70 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 70, cellRenderer: PHRMReportsGridColumns.DateConverterRendererForExpiry },
    { headerName: "Transferred Qty", field: "Quantity", width: 90 },
    { headerName: "Total Amt", field: "TotalAmount", width: 80 },
    { headerName: "Store Name", field: "StoreName", width: 80 },
    { headerName: "User", field: "FullName", width: 80 },
  ]
  static PHRMTransferToDispensaryReport = [
    { headerName: "Transferred Date", field: "Date", width: 100, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "Batch No", field: "BatchNo", width: 70 },
    { headerName: "Expiry Date", field: "ExpiryDate", width: 70, cellRenderer: PHRMReportsGridColumns.DateConverterRendererForExpiry },
    { headerName: "Transferred Qty", field: "Quantity", width: 90 },
    { headerName: "Total Amt", field: "TotalAmount", width: 70 },
    { headerName: "Store Name", field: "StoreName", width: 80 },
    { headerName: "User", field: "FullName", width: 80 },
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
  static ReturnFromCustomerReportList = [
    { headerName: "Returned Date", field: "ReturnedDate", width: 120, cellRenderer: PHRMReportsGridColumns.DateConverterRenderer },
    { headerName: "CRN No.", field: "CreditNoteNumber", width: 100 },
    { headerName: "Issue No", field: "IssueNo", width: 130 },
    { headerName: "Hospital No", field: "PatientCode", width: 150 },
    { headerName: "Patient", field: "PatientName", width: 150 },
    { headerName: "Generic Name", field: "GenericName", width: 150 },
    { headerName: "Item Name", field: "ItemName", width: 200 },
    { headerName: "Batch No", field: "BatchNo", width: 130 },
    { headerName: "Expiry Date", width: 110, cellRenderer: PHRMReportsGridColumns.DateOfExpiry },
    { headerName: "Ret.Qty", field: "ReturnedQty", width: 100 },
    { headerName: "S.Price", field: "MRP", width: 130 },
    { headerName: "Ret.Amount", field: "TotalAmount", width: 130 },
    { headerName: "Dispensary", field: "DispensaryName", width: 130 },
    { headerName: "User", field: "UserName", width: 130 },
    { headerName: "Counter", field: "CounterName", width: 130 },
  ]

  static DateConverterRenderer(params) {
    let Date: string = params.data.Date;
    return moment(Date).format('DD-MMM-YYYY');
  }
  static DateConverterRendererForExpiry(params) {
    let Date: string = params.data.ExpiryDate;
    return moment(Date).format('DD-MMM-YYYY');
  }
  static GoodsReceiptDateRenderer(params) {
    let date: string = params.data.GoodReceiptDate;
    return moment(date).format('YYYY-MM-DD');
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
    let expiryDate: Date = (params.data.ExpiryDate);
    let expiryDateFormatted = moment(expiryDate).format('YYYY-MM-DD');
    let expiryDate1 = new Date(params.data.ExpiryDate)
    let date = new Date();
    let datenow = date.setMonth(date.getMonth() + 0);
    let datethreemonth = date.setMonth(date.getMonth() + 3);
    let expDate = expiryDate1.setMonth(expiryDate1.getMonth() + 0);

    if (expDate <= datenow) {
      return "<span style='background-color:red;color:white'>" + expiryDateFormatted + "(" + "Expired" + ")" + "</span>";
    }
    if (expDate < datethreemonth && expDate > datenow) {

      return "<span style='background-color:yellow;color:black'>" + expiryDateFormatted + "(" + "Nearly Expired" + ")" + "</span>";
    }
    if (expDate > datethreemonth) {

      return "<span style='background-color:green;color:white'>" + expiryDateFormatted + "(" + "Not Expired" + ")" + "</span>";
    }


  }
  static PHRMSalesStatement = [
    { headerName: "Store", field: "Name", width: 150 },
    { headerName: "Sales Value", field: "SalesValue", width: 150 },
    { headerName: "Sales Cost", field: "SalesCostValue", width: 150 },
    { headerName: "Sales Return Value", field: "SalesReturnValue", width: 150 },
    { headerName: "Sales Return Cost", field: "SalesReturnCostValue", width: 150 },
    { headerName: "Profit", field: "Balance", width: 150 },
  ]
  static PHRMPurchaseStatement = [
    { headerName: "Purchase", field: "Purchase", width: 150 },
    { headerName: "Purchase Return", field: "PurchaseReturn", width: 150 },
    { headerName: "Balance", field: "Balance", width: 150 },
  ]
  static PHRMStockSummary = [
    { headerName: "Store", field: "StoreName", width: 150 },
    { headerName: "Sale Value", field: "SalesValue", width: 150 },
    { headerName: "Purchase Value", field: "PurchaseValue", width: 150 }
  ]
  static PHRMSalesSummary = [
    { headerName: "Store", field: "StoreName", width: 150 },
    { headerName: "Cash Sales", field: "CashSales", width: 150 },
    { headerName: "Cash Sales Refund", field: "CashSalesRefund", width: 150 },
    { headerName: "Total Cash Sales", field: "TotalCashSales", width: 150 },
    { headerName: "Cash In Hand", field: "CashInHand", width: 150 },
    { headerName: "Credit Sales", field: "CreditSales", width: 150 },
    { headerName: "Credit Sales Refund", field: "CreditSalesRefund", width: 150 },
    { headerName: "Total Credit Sales", field: "TotalCreditSales", width: 150 },
    { headerName: "Total Sales", field: "TotalSales", width: 150 },
  ]
  static PHRMINSPatientBima = [
    { headerName: "Date", field: "Date", width: 150, cellRenderer: PHRMReportsGridColumns.INSPatientBimaDateRenderer },
    { headerName: "Bill No", field: "InvoicePrintId", width: 150 },
    { headerName: "Hospital No", field: "HospitalNo", width: 150 },
    { headerName: "Patient", field: "PatientName", width: 150 },
    { headerName: "NSHI", field: "Ins_NshiNumber", width: 150 },
    { headerName: "ClaimCode", field: "ClaimCode", width: 150 },
    { headerName: "SubTotal", field: "SubTotal", width: 150 },
    { headerName: "Total", field: "TotalAmount", width: 150 },
    { headerName: "User", field: "CreatedByName", width: 150 },
    { headerName: "Counter", field: "CounterName", width: 150 },
  ]
  static INSPatientBimaDateRenderer(params) {
    return moment(params.data.Date).format("YYYY-MM-DD");
  }
  static PHRMStockTransfersReportList = [
    { headerName: "Item Name", field: "ItemName", width: 150 },
    { headerName: "Batch No", field: "BatchNo", width: 100 },
    { headerName: "Purchase Rate", field: "CostPrice", width: 90 },
    { headerName: "Sales Rate", field: "MRP", width: 90 },
    { headerName: "TransferQty", field: "TransferQuantity", width: 150 },
    { headerName: "Transferred By", field: "TransferredBy", width: 150 },
    { headerName: "Transferred On", field: "TransferredOn", width: 150, cellRenderer: PHRMReportsGridColumns.TransferredOnDateRenderer },
    { headerName: "Transferred From", field: "TransferredFrom", width: 150 },
    { headerName: "Transferred To", field: "TransferredTo", width: 150 },
    { headerName: "Received By", field: "ReceivedBy", width: 150 },
    { headerName: "Received On", field: "ReceivedOn", width: 150, cellRenderer: PHRMReportsGridColumns.ReceivedOnDateRenderer },
    { headerName: "Approved By", field: "ApprovedBy", width: 150 },
    { headerName: "Approved On", field: "ApprovedOn", width: 150, cellRenderer: PHRMReportsGridColumns.ApprovedOnDateRenderer }
  ]
  //For Pharmacy Stock Ladger Report
  static StockLedgerReport = [
    { headerName: "S No", valueGetter: "node.rowIndex+1", width: 40 },
    {
      headerName: "Date",
      field: "TransactionDate",
      width: 100,
      cellRenderer: PHRMReportsGridColumns.TransactionDateConverter,
    },
    { headerName: "Receipt Qty", field: "ReceiptQty", width: 100 },
    { headerName: "Receipt Rate", field: "ReceiptRate", width: 100 },
    { headerName: "Receipt Amt", field: "ReceiptAmount", width: 100 },
    { headerName: "Issue Qty", field: "IssueQty", width: 100 },
    { headerName: "Issue Rate", field: "IssueRate", width: 100 },
    { headerName: "Issue Amt", field: "IssueAmount", width: 100 },
    { headerName: "Balance Qty", field: "BalanceQty", width: 100 },
    { headerName: "Balance Rate", field: "BalanceRate", width: 100 },
    { headerName: "Balance Amt", field: "BalanceAmount", width: 100 },
    { headerName: "Reference No", field: "ReferenceNo", width: 100 },
    { headerName: "Store", field: "Store", width: 100 },
    { headerName: "Employee", field: "Username", width: 100 },
    { headerName: "Remarks", field: "Remarks", width: 100 },

  ];
  static TransactionDateConverter(params) {
    let Date: string = params.data.TransactionDate;
    return moment(Date).format("DD-MMM-YYYY");
  }

  static TransferredOnDateRenderer(params) {
    if (params.data.TransferredOn)
      return moment(params.data.TransferredOn).format("YYYY-MM-DD");
    else return '';
  }
  static ReceivedOnDateRenderer(params) {
    if (params.data.ReceivedOn)
      return moment(params.data.ReceivedOn).format("YYYY-MM-DD");
    else return '';
  }
  static ApprovedOnDateRenderer(params) {
    if (params.data.ApprovedOn)
      return moment(params.data.ApprovedOn).format("YYYY-MM-DD");
    else
      return '';
  }


}
