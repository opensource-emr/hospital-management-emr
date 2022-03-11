import * as moment from 'moment/moment';
import { CommonFunctions } from '../../shared/common.functions';
import { SecurityService } from '../../security/shared/security.service';
export default class PHRMGridColumns {
    static securityService
    constructor(private _securityService: SecurityService) {
        PHRMGridColumns.securityService = this._securityService;
    }
    static GenericList = [
        { headerName: "Generic Name", field: "GenericName", width: 120 },
        { headerName: "Generic Category", field: "GeneralCategory", width: 120 },
        { headerName: "Therapeutic Category", field: "TherapeuticCategory", width: 120 },
        {
            headerName: "Actions",

            field: "",
            width: 150,
            template:
                `<a danphe-grid-action="edit" class="grid-action">
                   Edit </a>`

            //< /a><a danphe-grid-action="admit" class="grid-action">
            //   Admit
            //    </a >
        }
    ]

    static PHRMSupplierList = [
        { headerName: "Supplier Name", field: "SupplierName", width: 270 },
        { headerName: "ContactNo", field: "ContactNo", width: 100 },
        { headerName: "Description", field: "Description", width: 100 },
        { headerName: "City", field: "City", width: 100 },
        { headerName: "Pan No.", field: "PANNumber", width: 100 },
        { headerName: "ContactAddress", field: "ContactAddress", width: 100 },
        { headerName: "Email", field: "Email", width: 100, cellStyle: PHRMGridColumns.UserGridCellStyle },
        { headerName: "CreditPeriod", field: "CreditPeriod", width: 100 },
        { headerName: "Action", field: "", width: 150, cellRenderer: PHRMGridColumns.ShowActionforPHRMSetting },
    ]

    static PHRMCompanyList = [
        { headerName: "Company Name", field: "CompanyName", width: 270 },
        { headerName: "ContactNo", field: "ContactNo", width: 100 },
        { headerName: "Description", field: "Description", width: 100 },
        { headerName: "Contact Address", field: "ContactAddress", width: 100 },
        { headerName: "Email", field: "Email", width: 100, cellStyle: PHRMGridColumns.UserGridCellStyle },
        { headerName: "Action", field: "", width: 150, cellRenderer: PHRMGridColumns.ShowActionforPHRMSetting },
    ]

    static PHRMCategoryList = [
        { headerName: "Category Name", field: "CategoryName", width: 270 },
        { headerName: "Description", field: "Description", width: 100 },
        { headerName: "IsActive", field: "IsActive", width: 50 },
        { headerName: "Action", field: "", width: 150, cellRenderer: PHRMGridColumns.ShowActionforPHRMSetting },
    ]
    static PHRMUnitOfMeasurementList = [
        { headerName: "UnitOfMeasurement Name", field: "UOMName", width: 270 },
        { headerName: "Description", field: "Description", width: 100 },
        { headerName: "IsActive", field: "IsActive", width: 50 },
        { headerName: "Action", field: "", width: 150, cellRenderer: PHRMGridColumns.ShowActionforPHRMSetting },
    ]
    static PHRMItemTypeList = [
        { headerName: "Item Type", field: "ItemTypeName", width: 270 },
        { headerName: "Category", field: "CategoryName", width: 100 },
        { headerName: "Description", field: "Description", width: 100 },
        { headerName: "Action", field: "", width: 150, cellRenderer: PHRMGridColumns.ShowActionforPHRMSetting },
    ]
    static PHRMPackingTypeList = [
        { headerName: "Packing Name", field: "PackingName", width: 270 },
        { headerName: "Packing Quantity", field: "PackingQuantity", width: 100 },
        { headerName: "Action", field: "", width: 150, cellRenderer: PHRMGridColumns.ShowActionforPHRMSetting },
    ]
    static PHRMItemList = [
        { headerName: "Medicine Name", field: "ItemName", width: 200 },
        { headerName: "Company Name", field: "CompanyName", width: 150 },
        //{ headerName: "Supplier Name", field: "SupplierName", width: 200 },
        //{ headerName: "Item Code", field: "ItemCode", width: 150 },
        { headerName: "Item Type", field: "ItemTypeName", width: 150 },
        //{ headerName: "Unit", field: "UOMName", width: 150 },
        //{ headerName: "Standard Price", field: "StandardPrice", width: 150 },
        //{ headerName: "Selling Price", field: "SellingPrice", width: 90 },
        { headerName: "ReOrder Quantity", field: "ReOrderQuantity", width: 110 },
        { headerName: "MinStock Quantity", field: "MinStockQuantity", width: 120 },
        { headerName: "Rack", field: "RackName", width: 100 },
        { headerName: "IsActive", field: "IsActive", width: 100 },
        { headerName: "Action", field: "", resizable: true, cellRenderer: PHRMGridColumns.ShowActionforPHRMSettingItemManage },
    ]

    static PHRMDispensaryList = [
        { headerName: "Name", field: "Name", width: 160 },
        { headerName: "Type", field: "SubCategory", width: 80 },
        { headerName: "ContactNo", field: "ContactNo", width: 100 },
        { headerName: "Description", field: "StoreDescription", width: 80 },
        { headerName: "Label", field: "StoreLabel", width: 100 },
        { headerName: "PAN", field: "PanNo", width: 100 },
        { headerName: "Address", field: "Address", width: 100 },
        { headerName: "Email", field: "Email", width: 100, cellStyle: PHRMGridColumns.UserGridCellStyle },
        { headerName: "Default Payment Mode", field: "DefaultPaymentMode", width: 100 },
        { headerName: "Action", field: "", width: 200, cellRenderer: PHRMGridColumns.ShowActionforPHRMDispensarySetting },
    ]

    static PHRMTAXList = [
        { headerName: "TAX Name", field: "TAXName", width: 270 },
        { headerName: "TAX Percentage", field: "TAXPercentage", width: 100 },
        { headerName: "Description", field: "Description", width: 100 },
        { headerName: "Action", field: "", width: 150, template: '<a danphe-grid-action="edit" class="grid-action">Edit</a>' },
    ]
    static PHRMGoodsReceiptList = [
        { headerName: "G.R. No.", field: "GoodReceiptPrintId", width: 80 },//using GoodReceiptPrintId instead of GrID
        { headerName: "GR Date", field: "GoodReceiptDate", width: 100, cellRenderer: PHRMGridColumns.PHRMGRDateOnlyRenderer },
        { headerName: "SupplierBillDate", field: "SupplierBillDate", width: 100, cellRenderer: PHRMGridColumns.PHRMSBDateOnlyRenderer },
        { headerName: "Bill No", field: "InvoiceNo", width: 100 },
        { headerName: "Supplier Name", field: "SupplierName", width: 150 },
        { headerName: "Sub Total", field: "SubTotal", width: 100 },
        { headerName: "Discount Amount", field: "DiscountAmount", width: 100 },
        { headerName: "VAT Amount", field: "VATAmount", width: 100 },
        { headerName: "Total Amount", field: "TotalAmount", width: 100 },
        { headerName: "Remarks", field: "Remarks", width: 100 },
        { headerName: "Aging Days", field: "AgingDays", width: 100 },
        { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' },
    ]
    static PHRMACCTGoodsReceiptList = [
        { headerName: "Supplier Name", field: "SupplierName", width: 150 },
        { headerName: "Sub Total", field: "SubTotal", width: 100 },
        { headerName: "Discount Amount", field: "DiscountAmount", width: 100 },
        { headerName: "VAT Amount", field: "VATAmount", width: 100 },
        { headerName: "Total Amount", field: "TotalAmount", width: 100 },
        { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' },
    ]
    static PHRMACCTSuppliersList = [
        { headerName: "Receipt Date", field: "GoodReceiptDate", width: 150, cellRenderer: PHRMGridColumns.PHRMGRDateOnlyRenderer },
        { headerName: "Invoice No", field: "InvoiceNo", width: 150 },
        { headerName: "Supplier Name", field: "SupplierName", width: 150 },
        { headerName: "Sub Total", field: "SubTotal", width: 100 },
        { headerName: "Discount Amount", field: "DiscountAmount", width: 100 },
        { headerName: "VAT Amount", field: "VATAmount", width: 100 },
        { headerName: "Total Amount", field: "TotalAmount", width: 100 },
        { headerName: "Credit Period", field: "CreditPeriod", width: 100 },
        { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' },
    ]
    static PHRMReturnToSupplier = [
        { headerName: "Supplier Name", field: "SupplierName", width: 150 },
        { headerName: "GRNo", field: "GoodReceiptPrintId", width: 100 },
        { headerName: "InvoiceNo", field: "InvoiceNo", width: 100 },
        // { headerName: "TotalQty", field: "TotalQty", width: 150 },
        { headerName: "Sub Total", field: "SubTotal", width: 100 },
        { headerName: "Discount Amount", field: "DiscountAmount", width: 100 },
        { headerName: "VAT Amount", field: "VATAmount", width: 100 },
        { headerName: "Total Amount", field: "TotalAmount", width: 100 },
        { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="return" class="grid-action">Return</a> &nbsp;<a danphe-grid-action="preview" class="grid-action">Preview</a>' },
    ]

    static PHRMReturnItemToSupplierList = [
        { headerName: "Supplier Name", field: "SupplierName", width: 150 },
        { headerName: "Return Date", field: "ReturnDate", width: 100, cellRenderer: PHRMGridColumns.PHRMReturnDateOnlyRenderer },
        { headerName: "TotalQty", field: "Quantity", width: 150 },
        { headerName: "Sub Total", field: "SubTotal", width: 100 },
        { headerName: "Discount Amount", field: "DiscountAmount", width: 100 },
        { headerName: "VAT Amount", field: "VATAmount", width: 100 },
        { headerName: "Total Amount", field: "TotalAmount", width: 100 },
        { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' },
    ]
    static PHRMWriteOffList = [
        { headerName: "WriteOff Date", field: "WriteOffDate", width: 100, cellRenderer: PHRMGridColumns.PHRMReturnDateRenderer },
        { headerName: "Write-Off Id", field: "WriteOffId", width: 100 },
        // { headerName: "BatchNo", field: "BatchNo", width: 120 },
        // { headerName: "ItemPrice", field: "ItemPrice", width: 100 },         now no need to show.
        { headerName: "TotalQty", field: "Quantity", width: 100 },
        { headerName: "Sub Total", field: "SubTotal", width: 100 },
        { headerName: "Discount Amount", field: "DiscountAmount", width: 100 },
        { headerName: "VAT Amount", field: "VATAmount", width: 100 },
        { headerName: "Total Amount", field: "TotalAmount", width: 100 },
        { headerName: "Remarks", field: "Remarks", width: 100 },
        { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' },

    ]
    static creditOrganizationList = [
        { headerName: "Organization Name", field: "OrganizationName", width: 100 },
        { headerName: "IsActive Status", field: "IsActive", width: 120 },
        {
            headerName: "Action",
            field: "",

            width: 80,
            template:
                `<a danphe-grid-action="edit" class="grid-action">
                    Edit
                 </a>`
        }]

    static PHRMStockItemAllBatchList = [
        { headerName: "Batch No", field: "BatchNo", width: 150 },
        { headerName: "Item Price", field: "GRItemPrice", width: 150 },
        { headerName: "Received Quantity", field: "ReceivedQuantity", width: 150 },
        { headerName: "Available Quantity", field: "curtQuantity", width: 150 },
        { headerName: "Expiry Date", field: "ExpiryDate", width: 150 }
    ]

    static PHRMSalesitemList = [
        { headerName: "Bill No", field: "InvoicePrintId", width: 150 },
        { headerName: "Date", field: "CreatedOn", width: 150, cellRenderer: PHRMGridColumns.PHRMGRSalesIremCreated },
        { headerName: "Generic Name", field: "GenericName", width: 150 },
        { headerName: "Medicine Name", field: "ItemName", width: 150 },
        { headerName: "Patient", field: "PatientName", width: 150 },
        { headerName: "BatchNo", field: "BatchNo", width: 150 },
        { headerName: "Expiry", field: "ExpiryDate", width: 150, cellRenderer: PHRMGridColumns.DateOfExpiry },
        { headerName: "Quantity", field: "Quantity", width: 150 },
        { headerName: "Sales Rate", field: "MRP", width: 150 },
        { headerName: "Sale Value", field: "TotalAmount", width: 150 },
        { headerName: "Stock Value", field: "StockValue", width: 150 },
        { headerName: "Store", field: "StoreName", width: 150 },
        { headerName: "Counter", field: "CounterName", width: 150 },
        { headerName: "User", field: "CreatedByName", width: 150 },

    ]

    //sud:6Sept'21--We need to hide CostPrice columns from Dispensary.. so created column setting similar to pharmacy report except cost price columns
    static Dispensary_PHRMSalesitemList = [
        { headerName: "Bill No", field: "InvoicePrintId", width: 150 },
        { headerName: "Date", field: "CreatedOn", width: 150, cellRenderer: PHRMGridColumns.PHRMGRSalesIremCreated },
        { headerName: "Generic Name", field: "GenericName", width: 150 },
        { headerName: "Medicine Name", field: "ItemName", width: 150 },
        { headerName: "Patient", field: "PatientName", width: 150 },
        { headerName: "BatchNo", field: "BatchNo", width: 150 },
        { headerName: "Expiry", field: "ExpiryDate", width: 150, cellRenderer: PHRMGridColumns.DateOfExpiry },
        { headerName: "Quantity", field: "Quantity", width: 150 },
        { headerName: "SP", field: "MRP", width: 150 },
        { headerName: "Sale Value", field: "TotalAmount", width: 150 },
        { headerName: "Store", field: "StoreName", width: 150 },
        { headerName: "Counter", field: "CounterName", width: 150 },
        { headerName: "User", field: "CreatedByName", width: 150 },

    ]


    static ItemWisePurchaseList = [
        { headerName: "GR Date", field: "GoodReceiptDate", width: 150, cellRenderer: PHRMGridColumns.PHRMGRSalesIremCreated },
        { headerName: "GR NO.", field: "GoodsReceiptNo", width: 100 },
        { headerName: "Supplier", field: "SupplierName", width: 150 },
        { headerName: "Bill No.", field: "InvoiceNo", width: 80 },
        { headerName: "Generic Name", field: "GenericName", width: 150 },
        { headerName: "Item", field: "ItemName", width: 150 },
        { headerName: "Batch", field: "BatchNo", width: 80 },
        { headerName: "Expiry", field: "ExpiryDate", width: 100, cellRenderer: PHRMGridColumns.PHRMExpiryDateRenderer_PurItmRpt },
        { headerName: "Quantity", field: "ReceivedQuantity", width: 80 },
        { headerName: "Purchase Rate", field: "PurchaseRate", width: 150 },
        { headerName: "SubTotal", field: "SubTotal", width: 150 },
        { headerName: "VAT Amt.", field: "VATAmount", width: 150 },
        { headerName: "TotalAmount", field: "TotalAmount", width: 150 }
    ]

    //PHRM: showing Expiry date in YYYY-MM-DD
    static PHRMExpiryDateRenderer_PurItmRpt(params) {
        let date: string = params.data.ExpiryDate;
        return moment(date).format('YYYY-MM-DD');
    }

    static PHRMNarcoticsSalesitemList = [
        { headerName: "InvoiceNo", field: "InvoicePrintId", width: 150 },
        { headerName: "Date", field: "CreatedOn", width: 150, cellRenderer: PHRMGridColumns.PHRMGRSalesIremCreated },
        // { headerName: "InvoiceId", field: "InvoiceId", width: 150 },
        { headerName: "Medicine Name", field: "ItemName", width: 150 },
        { headerName: "Patient", field: "PatientName", width: 150 },
        { headerName: "Doctor", field: "DoctorName", width: 150 },
        { headerName: "NMC No.", field: "NMCNumber", width: 150 },
        { headerName: "BatchNo", field: "BatchNo", width: 150 },
        { headerName: "Quantity", field: "Quantity", width: 150 },
        { headerName: "S.Price", field: "MRP", width: 150 },
        { headerName: "TotalAmount", field: "TotalAmount", width: 150 }

    ]

    static PHRMSettlementHeaderList = [
        { headerName: "Hospital No.", field: "PatientCode", width: 120 },
        { headerName: "Patient Name", field: "PatientName", width: 150 },
        {
            headerName: "Age/Sex",
            field: "Gender",
            width: 110,
            cellRenderer: PHRMGridColumns.AgeSexRendererPatient,
        },
        { headerName: "Contact", field: "ContactNo", width: 150 },
        { headerName: "Receivable Amount", field: "CollnFromReceivable", width: 150 },
        { headerName: "Cash Discount", field: "CashDiscountGiven", width: 150 },
        { headerName: "Discount Return", field: "CashDiscReturn", width: 150 },
        { headerName: "Settlement Date", field: "SettlementDate", width: 150, cellRenderer: PHRMGridColumns.SettlementCreated },
        {
            headerName: "Actions",
            field: "",
            width: 200,
            ///this is used to action according to status
            cellRenderer: PHRMGridColumns.ShowActionForSettlementList
        }
    ];
    static ShowActionForSettlementList() {

        let template =
            `<a danphe-grid-action="view" class="grid-action">
                View Details
            </a>`

        return template
    }
    static PHRMABCVEDList = [
        { headerName: "InvoiceId", field: "InvoiceId", width: 150 },
        { headerName: "Medicine Name", field: "ItemName", width: 150 },
        { headerName: "BatchNo", field: "BatchNo", width: 150 },
        { headerName: "Quantity", field: "Quantity", width: 150 },
        { headerName: "Price", field: "Price", width: 150 },
        { headerName: "TotalAmount", field: "TotalAmount", width: 150 },
        { headerName: "Date", field: "CreatedOn", width: 150, cellRenderer: PHRMGridColumns.PHRMGRSalesIremCreated }
    ]
    PHRMStockDetailsList = [

        //{ headerName: "Item Type", field: "CategoryName", width: 100},
        { headerName: "Medicine Name", field: "ItemName", width: 200 },
        { headerName: "Batch No", field: "BatchNo", width: 90 },
        { headerName: "Expiry Date", field: "ExpiryDate", width: 150, cellRenderer: PHRMGridColumns.DateOfExpiry },
        { headerName: "Cost Price", field: "Price", width: 90 },
        { headerName: "Available Quantity", field: "AvailableQuantity", width: 100 },
        //{ headerName: "Price", field: "Price", width: 100 },
        { headerName: "MRP", field: "MRP", width: 80 },
        {
            headerName: "Actions",
            field: "", width: 350,
            cellRenderer: this.GetDispensaryStockActions
        }
    ]


    static PHRMNArcoticsStockDetailsList = [

        //{ headerName: "Item Type", field: "CategoryName", width: 100},
        { headerName: "Medicine Name", field: "ItemName", width: 150 },
        { headerName: "Batch No", field: "BatchNo", width: 80 },
        { headerName: "Expiry Date", field: "ExpiryDate", width: 150, cellRenderer: PHRMGridColumns.DateOfExpiry },
        // { headerName: "Cost Price", field: "Price", width: 80  },
        { headerName: "Stock Qty", field: "StockQty", width: 100 },
        //{ headerName: "Price", field: "Price", width: 100 },
        { headerName: "S.Price", field: "MRP", width: 80 },
        { headerName: "Dispensary/Store Name", field: "Name", width: 100 },
        // {
        //   headerName: "Action",
        //   field: "", width: 150,
        //   template:
        //     ` <a  danphe-grid-action="manage-stock" class="grid-action">
        //                     Manage Stock </a>
        //       <a  danphe-grid-action="transfer-store" class="grid-action">
        //                     Store Transfer </a>
        //                  `
        // },
        //<a danphe- grid - action="view" class="grid-action" >
        //View
        //< /a>
    ]
    static PHRMStockList = [
        { headerName: "Medicine Name", field: "ItemName", width: 200 },
        { headerName: "Generic Name", field: "GenericName", width: 200 },
        { headerName: "Batch No", field: "BatchNo", width: 100 },
        { headerName: "Expiry Date", width: 150, field: "ExpiryDate", cellRenderer: PHRMGridColumns.DateOfExpiry },
        { headerName: "Available Quantity", field: "AvailableQuantity", width: 100 },
        { headerName: "S.Price", field: "MRP", width: 100 },
    ]
    static PHRMInsuranceStockList = [
        { headerName: "Medicine Name", field: "ItemName", width: 150 },
        { headerName: "Generic Name", field: "GenericName", width: 150 },
        { headerName: "Batch No", field: "BatchNo", width: 100 },
        { headerName: "Expiry Date", width: 150, cellRenderer: PHRMGridColumns.DateOfExpiry },
        { headerName: "Available Quantity", field: "AvailableQuantity", width: 100 },
        { headerName: "Govt-Insurance Price", field: "GovtInsurancePrice", width: 100 },
        { headerName: "S.Price", field: "MRP", width: 100 },
    ]


    static PHRMPOList = [
        { headerName: "PO No", field: "PurchaseOrderNo", width: 80 },
        { headerName: "PO Date", field: "PODate", width: 100, cellRenderer: PHRMGridColumns.PHRMPurchaseOrderDateOnlyRenderer },
        { headerName: "Supplier Name", field: "SupplierName", width: 110 },
        { headerName: "ContactNo", field: "ContactNo", width: 110 },
        { headerName: "Total Amount", field: "TotalAmount", width: 80 },
        { headerName: "PO Status", field: "POStatus", width: 110 },

        {
            headerName: "Actions",
            field: "",
            width: 200,
            ///this is used to action according to status
            cellRenderer: PHRMGridColumns.ShowActionForPHRMPOList
        }

    ]

    static PHRMProvisionalItemsList = [
        { headerName: "Patient Name", field: "ShortName", width: 150 },
        { headerName: "ContactNo", field: "ContactNo", width: 120 },
        { headerName: "Ward Name", field: "WardName", width: 120 },
        { headerName: "Date", field: "CreatedOn", width: 100, cellRenderer: PHRMGridColumns.PHRMProItemsDateOnlyRenderer },
        { headerName: "Status", field: "Status", width: 100 },
        {
            headerName: "Actions",
            field: "",
            width: 100,
            template:
                `
                	<a danphe-grid-action="dispatch" class="grid-action">
					 Dispatch
                     </a>                      
                     `
        }

    ]
    static ProvisionalReturnList = [
        { headerName: "Hospital Number", field: "PatientCode", width: 170, pinned: true },
        { headerName: "Patient Name", field: "ShortName", width: 160, pinned: true },
        { headerName: "Contact No.", field: "ContactNo", width: 100, pinned: true },
        { headerName: "Age/Sex", field: "", width: 110, cellRenderer: PHRMGridColumns.AgeSexRendererPatient, pinned: true },
        { headerName: "Date", field: "LastCreditBillDate", width: 180, pinned: true, cellRenderer: PHRMGridColumns.PHRMRetunProvisionalRenderer },
        { headerName: "Total", field: "TotalCredit", width: 110, pinned: true },
        {
            headerName: "Action",
            field: "",
            pinned: true,
            width: 200,
            template:
                ` <a danphe-grid-action="view" class="grid-action">
                        Print
                     </a>`
        }
    ]

    static WardRequestItemsList = [
        { headerName: "Store Name", field: "StoreName", width: 100 },
        { headerName: "Requested By", field: "CreatedBy", width: 100 },
        { headerName: "Date", field: "CreatedOn", width: 100, cellRenderer: PHRMGridColumns.PHRMProItemsDateOnlyRenderer },
        { headerName: "Status", field: "Status", width: 100 },
        {
            headerName: "Actions",
            field: "",
            width: 100,
            template:
                `<a danphe-grid-action="dispatch" class="grid-action">
                       Dispatch
                     </a>                      
                     `
        }

    ]

    StoreStockDetailList = [
        { headerName: "Generic Name", field: "GenericName", width: 300 },
        { headerName: "Medicine Name", field: "ItemName", width: 300 },
        { headerName: "Batch No", field: "BatchNo", width: 100 },
        { headerName: "Expiry Date", width: 150, cellRenderer: PHRMGridColumns.DateOfExpiry },
        { headerName: "Available Qty", field: "AvailableQuantity", width: 180, sort: "desc" },
        { headerName: "Sales Rate", field: "MRP", width: 100 },
        { headerName: "Purchase Rate", field: "CostPrice", width: 100 },
        { headerName: "Store", field: "StoreName", width: 300 },
        {
            headerName: "Actions",
            field: "",
            width: 300,
            cellRenderer: PHRMGridColumns.GetStoreStockActions
        }
    ]

    static SalesCategoryList = [
        { headerName: "Sales Category ID", field: "SalesCategoryId", width: 100 },
        { headerName: "Category Type.", field: "Name", width: 100 },
        { headerName: "Batch Applicable", field: "IsBatchApplicable", width: 150 },
        { headerName: "Expiry Date Applicable", field: "IsExpiryApplicable", width: 150 },
        { headerName: "Description", field: "Description", width: 150 },

    ]
    static NursingRequsitionList = [
        { headerName: "Patient Name", field: "ShortName", width: 200 },
        { headerName: "ContactNo", field: "ContactNo", width: 120 },
        { headerName: "Date", field: "CreatedOn", width: 100, cellRenderer: PHRMGridColumns.PHRMProItemsDateOnlyRenderer },
        { headerName: "Status", field: "Status", width: 100 },
        {
            headerName: "Actions",
            field: "",
            width: 100,
            template:
                `</a>
                        <a danphe-grid-action="view" class="grid-action">
                       View
                     </a>                      
                     `
        }

    ]

    static StockTxnItems = [
        //StockTxnItemId,ItemId,ItemName,BatchNo,,Quantity,Price,MRP,SubTotal,TotalAmount,InOut ,CreatedOn,ExpiryDate        
        { headerName: "Medicine Name", field: "ItemName", width: 150 },
        { headerName: "Batch", field: "BatchNo", width: 100 },
        { headerName: "Qty", field: "Quantity", width: 100 },
        { headerName: "Price", field: "Price", width: 80 },
        { headerName: "MRP", field: "MRP", width: 80 },
        //{ headerName: "Sub Total", field: "SubTotal", width: 100 },
        //{ headerName: "Total", field: "TotalAmount", width: 100 },
        { headerName: "In/Out", field: "InOut", width: 80 },
        //{ headerName: "Date", field: "CreatedOn", width: 100, cellRenderer: PHRMGridColumns.StockTxnItemDateRender },
        //{ headerName: "Exp Date", field: "ExpiryDate", width: 100, cellRenderer: PHRMGridColumns.StockTxnItemExpDateRender },        
        {
            headerName: "Action",
            field: "", width: 100,
            template:
                `</a>
                        <a danphe-grid-action="update-mrp" class="grid-action">
                       Update MRP
                     </a>                      
                     `
        },
    ]
    //This for prescription List createdOn date format rendering
    static StockTxnItemDateRender(params) {
        let CreatedOn: string = params.data.CreatedOn;
        if (CreatedOn)
            return moment(CreatedOn).format('DD-MMM-YYYY hh:mm A');
        else
            return null;
    }
    //This for prescription List createdOn date format rendering
    static StockTxnItemExpDateRender(params) {
        let expDate: string = params.data.ExpiryDate;
        if (expDate)
            return moment(expDate).format('DD-MMM-YYYY hh:mm A');
        else
            return null;
    }
    static UserGridCellStyle(params) {
        return { 'text-transform': 'none' };
    }

    //this is cell renderer return function for PHRM-setting manage
    //if u need activate/deactivate button and edit when activated, use this function
    static ShowActionforPHRMSetting(params) {
        if (params.data.IsActive == true) {
            let template =
                `
                    <a danphe-grid-action="edit" class="grid-action">Edit</a>                    
                    <a danphe-grid-action="activateDeactivateIsActive" class="grid-action">Deactivate</a>            
                `
            return template
        }
        else {
            let template =
                `
                    <a danphe-grid-action="activateDeactivateIsActive" class="grid-action">Activate</a>
                `
            return template;
        }
    }
    //this is the cell renderer function for Settings-Dispensary Manage
    static ShowActionforPHRMDispensarySetting(params) {
        if (params.data.IsActive == true) {
            let template =
                `
                    <a danphe-grid-action="edit" class="grid-action">Edit</a>                    
                    <a danphe-grid-action="activateDeactivateIsActive" class="grid-action">Deactivate</a>             
                    <a danphe-grid-action="showPaymentModes" class="grid-action">Payment Modes</a>             
                `
            return template
        }
        else {
            let template =
                `
                    <a danphe-grid-action="activateDeactivateIsActive" class="grid-action">Activate</a>
                `
            return template;
        }
    }


    static ShowActionforPHRMSettingItemManage(params) {
        if (params.data.IsActive == true) {
            let template =
                `  
                    <a danphe-grid-action="add-rack" class="grid-action">Add to Rack</a>
                    <a danphe-grid-action="edit" class="grid-action">Edit</a>                    
                    <a danphe-grid-action="activateDeactivateIsActive" class="grid-action">Deactivate</a>             
                `
            return template
        }
        else {
            let template =
                `
                    <a danphe-grid-action="activateDeactivateIsActive" class="grid-action">Activate</a>
                `
            return template;
        }
    }

    //PHRM: getting date for goodsreceipt grid
    static PHRMGRDateOnlyRenderer(params) {
        let date: string = params.data.GoodReceiptDate;
        return moment(date).format('YYYY-MM-DD');
    }

    //PHRM: getting date for goodsreceipt grid
    static PHRMSBDateOnlyRenderer(params) {
        let date: string = params.data.SupplierBillDate;
        return moment(date).format('YYYY-MM-DD');
    }
    //PHRM: getting date for Sales Item grid
    static PHRMGRSalesIremCreated(params) {
        let date: string = params.data.CreatedOn;
        return moment(date).format('YYYY-MM-DD');
    }
    static SettlementCreated(params) {
        let date: string = params.data.CreatedOn;
        return moment(date).format('YYYY-MM-DD');
    }

    static PHRMReturnDateOnlyRenderer(params) {
        let date: string = params.data.ReturnDate;
        return moment(date).format('YYYY-MM-DD');
    }
    static PHRMReturnDateRenderer(params) {
        let date: string = params.data.WriteOffDate;
        return moment(date).format('YYYY-MM-DD');
    }
    static PHRMRetunProvisionalRenderer(params) {
        let date: string = params.data.LastCreditBillDate;
        return moment(date).format('YYYY-MM-DD');

    }
    static PHRMWriteOffDateOnlyRenderer(params) {
        let date: string = params.data.WriteOffDate;
        return moment(date).format('YYYY-MM');
    }
    //static PHRMExpiryDateRenderer(params) {
    //    let date: string = params.data.WriteOffDate;
    //    return moment(date).format('YYYY-MM-DD');
    //}
    static PHRMPurchaseOrderDateOnlyRenderer(params) {
        let date: string = params.data.PODate;
        return moment(date).format('YYYY-MM-DD');

    }

    static PHRMProItemsDateOnlyRenderer(params) {
        let date: string = params.data.CreatedOn;
        return moment(date).format('YYYY-MM-DD');
    }
    //Grid column setting for Pharmacy Patient search page
    static PHRMPatientList = [
        { headerName: "Hospital Number", field: "PatientCode", width: 100 },
        { headerName: "Patient Name", field: "ShortName", width: 200 },
        { headerName: "Age/Sex", field: "", width: 110, cellRenderer: PHRMGridColumns.AgeSexRendererPatient },
        { headerName: "Address", field: "Address", width: 110 },
        { headerName: "Phone", field: "PhoneNumber", width: 110 },
        { headerName: "Patient Type", field: "IsOutdoorPat", width: 100, cellRenderer: PHRMGridColumns.IsOutdoorPatientText },
        {
            headerName: "Actions",
            field: "",
            width: 320,
            template:
                `<a danphe-grid-action="sale" class="grid-action">
                    Sale
                </a>
                &nbsp;
                <a danphe-grid-action="deposit" class="grid-action">
                    Deposit
                </a>`
        }

    ]
    //Render column value bool to test for outdoor patient
    static IsOutdoorPatientText(params) {
        let Isoutdootpat = params.data.IsOutdoorPat;
        return Isoutdootpat == true ? 'Outdoor Patient' : 'Indoor Patient';
    }
    static PHRMPrescriptionList = [
        // { headerName: "PrescriptionId", field: "PrescriptionId", width: 100 },
        { headerName: "Code", field: "PatientCode", width: 100 },
        { headerName: "Patient Name", field: "PatientName", width: 200 },
        { headerName: "Requested By", field: "ProviderFullName", width: 200 },
        //{ headerName: "Created By", field: "CreatedByName", width: 200 },
        { headerName: "Date", field: "CreatedOn", width: 110, cellRenderer: PHRMGridColumns.PrescriptionListDateRender },
        // { headerName: "Patient Type", field: "IsOutdoorPat", width: 120, cellRenderer: PHRMGridColumns.PatientTypeRender },       
        {
            headerName: "Actions",
            field: "",
            width: 200,
            template:
                `<a danphe-grid-action="view" class="grid-action">
                View Availability
             </a>
            `
        }
    ]
    //This for prescription List createdOn date format rendering
    static PrescriptionListDateRender(params) {
        let CreatedOn: string = params.data.CreatedOn;
        if (CreatedOn)
            return moment(CreatedOn).format('DD-MMM-YYYY hh:mm A');
        else
            return null;
    }


    //pharmacy - sale invoice list details grid column setting
    static PHRMSaleList = [
        { headerName: "Hospital Number", field: "PatientCode", width: 100 },
        //real invoice number for taxation
        { headerName: "Invoice No", field: "InvoicePrintId", width: 100, cellRenderer: PHRMGridColumns.InvoicePrintIdRenderer },
        { headerName: "Patient Name", field: "PatientName", width: 200 },
        { headerName: "Sub Total", field: "SubTotal", width: 100 },
        { headerName: "Dis Amt", field: "DiscountAmount", width: 100 },
        //{ headerName: "VAT Amt", field: "VATAmount", width: 100 },
        { headerName: "Total Amt", field: "PaidAmount", width: 100 },
        // { headerName: "Credit", field: "TotalAmount", width: 100 },
        { headerName: "Date", field: "CreateOn", width: 110, cellRenderer: PHRMGridColumns.SaleListDateRender },
        { headerName: "Patient Type", field: "PatientType", width: 120 },
        // { headerName: "Status", field: "BilStatus", width: 110 },
        {
            headerName: "Actions",
            field: "",
            width: 200,
            ///this is used to action according to status
            cellRenderer: PHRMGridColumns.ShowActionForPHRMSaleList
        }
        //,{
        //    headerName: "Actions",
        //    field: "",
        //    width: 200,
        //    template:
        //    `<a danphe-grid-action="view" class="grid-action">
        //        View
        //     </a>
        //    `
        //}
    ]

    //pharmacy - sale  invoice  return list details grid column setting
    static PHRMSaleReturnList = [
        { headerName: "Hospital Number", field: "PatientCode", width: 100 },
        { headerName: "Ref. Invoice No", field: "InvoicePrintId", width: 100, cellRenderer: PHRMGridColumns.InvoicePrintIdRenderer },
        { headerName: "Patient Name", field: "PatientName", width: 200 },
        { headerName: "Sub Total", field: "SubTotal", width: 100 },
        { headerName: "Dis Amt", field: "DiscountAmount", width: 100 },
        { headerName: "Total Amt", field: "PaidAmount", width: 100 },
        { headerName: "Return Date", field: "CreateOn", width: 110, cellRenderer: PHRMGridColumns.SaleReturnListDateRender },
        { headerName: "Credit Note No.", field: "CreditNoteID", width: 110 },
        { headerName: "Patient Type", field: "PatientType", width: 120 },

        , {
            headerName: "Actions",
            field: "",
            width: 100,
            template:
                `<a danphe-grid-action="view" class="grid-action">
           Print
        </a>
       `
        }
    ]
    static PHRMInsuranceSaleReturnList = [
        { headerName: "Hospital Number", field: "PatientCode", width: 100 },
        { headerName: "Ref. Invoice No.", field: "InvoicePrintId", width: 130, cellRenderer: PHRMGridColumns.InvoicePrintIdRenderer },
        { headerName: "Claim Code", field: "ClaimCode", width: 120 },
        { headerName: "Patient Name", field: "PatientName", width: 200 },
        { headerName: "NSHI No.", field: "NSHINumber", width: 120 },
        { headerName: "Sub Total", field: "SubTotal", width: 100 },
        { headerName: "Dis Amt", field: "DiscountAmount", width: 90 },
        { headerName: "Total Amt", field: "PaidAmount", width: 100 },
        { headerName: "Return Date", field: "CreateOn", width: 110, cellRenderer: PHRMGridColumns.SaleReturnListDateRender },
        { headerName: "Credit Note No.", field: "CreditNoteID", width: 120 },
        { headerName: "Patient Type", field: "PatientType", width: 120 },
        , {
            headerName: "Actions",
            field: "",
            width: 100,
            template:
                `<a danphe-grid-action="view" class="grid-action">
           Print
        </a>
       `
        }
    ]

    static ShowActionForPHRMSaleList(params) {
        //Shankar_3rdDec2020_Commented out this code to hide Make Payment Button since we have settlement page to handle credit invoices. 

        // if ((params.data.BilStatus == "unpaid" && params.data.PaymentMode == "credit" )) {
        //     for (let i = 0; i < params.data.InvoiceItems.length; i++) {
        //        if((params.data.InvoiceRetItems.length !=0)){
        //            if(params.data.InvoiceItems[i].Quantity> params.data.InvoiceRetItems[i].ReturnedQty)
        //            {
        //         let template =
        //         `
        //                 <a danphe-grid-action="view" class="grid-action">
        //                 Print
        //              </a>

        //                <a  danphe-grid-action="saleCredit" class="grid-action">
        //                 Make Payment </a>
        //              `
        //     return template
        //            }
        //            else{
        //             let template =
        //             `
        //                     <a danphe-grid-action="view" class="grid-action">
        //                     Print
        //                  </a>
        //                  `
        //         return template
        //            }
        //        }

        //        else{
        //         let template =
        //         `
        //                 <a danphe-grid-action="view" class="grid-action">
        //                 Print
        //              </a>

        //                <a  danphe-grid-action="saleCredit" class="grid-action">
        //                 Make Payment </a>
        //              `
        //              return template
        //        }
        //     }

        // }
        // else {
        let template =
            `<a danphe-grid-action="view" class="grid-action">
                Print
             </a>`
        return template;


    }

    //This for sale List createOn date format rendering
    static SaleListDateRender(params) {
        let CreateOn: string = params.data.CreateOn;
        if (CreateOn)
            return moment(CreateOn).format('DD-MMM-YYYY hh:mm A');
        else
            return null;
    }
    //This for sale return List createdOn date format rendering
    static SaleReturnListDateRender(params) {
        let CreateOn: string = params.data.CreateOn;
        if (CreateOn)
            return moment(CreateOn).format('DD-MMM-YYYY hh:mm A');
        else
            return null;
    }


    static ShowActionForPHRMPOList(params) {
        if (["pending", "active", "partial"].includes(params.data.POStatus)) {
            let template =
                `</a>
                        <a danphe-grid-action="view" class="grid-action">
                        View
                     </a>

                       <a  danphe-grid-action="genReceipt" class="grid-action">
                        Add Goods Receipt
                     `
            return template
        }
        else {
            let template =
                `<a danphe-grid-action="view" class="grid-action">
                View
             </a>`
            return template;
        }

    }
    static AgeSexRendererPatient(params) {
        let dob = params.data.DateOfBirth;
        let gender: string = params.data.Gender;
        return CommonFunctions.GetFormattedAgeSex(dob, gender);

    }

    //Render column value bool to text for patient type
    static PatientTypeRender(params) {
        let Isoutdoorpat = params.data.IsOutdoorPat;
        return Isoutdoorpat == true ? 'Outdoor' : 'Indoor';
    }
    //this rederer add PH before number 
    static InvoicePrintIdRenderer(params) {
        return 'PH' + params.data.InvoicePrintId;
    }
    static PHRMRackList = [
        { headerName: "Rack Name", field: "Name", width: 270 },
        { headerName: "Parent Name", field: "ParentRackName", width: 100 },
        { headerName: "Description", field: "Description", width: 100 },
        { headerName: "Location", field: "LocationName", width: 100 },
        {
            hearName: "Actions",
            field: "",
            width: 150,
            cellRenderer: PHRMGridColumns.GetRackActions
        }

    ]

    static GetRackActions(params) {

        if (params.data.ParentId) {
            {
                return `<a danphe-grid-action="view" class="grid-action">
                   View Drugs
                 </a>
                 <a danphe-grid-action="edit" class="grid-action">
                   Edit
                 </a>`;
            }
        } else {
            {
                return `<a danphe-grid-action="edit" class="grid-action">
                   Edit
                 </a>`;
            }
        }


    }

    static DateOfExpiry(params) {
        let expiryDate: Date = params.data.ExpiryDate;
        let expiryDate1 = new Date(params.data.ExpiryDate)
        let date = new Date();
        let datenow = date.setMonth(date.getMonth() + 0);
        let datethreemonth = date.setMonth(date.getMonth() + 3);
        let expDate = expiryDate1.setMonth(expiryDate1.getMonth() + 0);

        if (expDate <= datenow) {
            return "<span style='background-color:red;color:white'>" + moment(expiryDate).format('YYYY-MM-DD') + "(" + "Exp" + ")"; //Without moment it seperate Date and Time with Letter T
        }
        if (expDate < datethreemonth && expDate > datenow) {

            return "<span style='background-color:yellow;color:black'>" + moment(expiryDate).format('YYYY-MM-DD') + "(" + "N. Exp" + ")";
        }
        if (expDate > datethreemonth) {

            return "<span style='background-color:white;color:black'>" + moment(expiryDate).format('YYYY-MM-DD') + "</span>";
        }


    }
    static GetStoreStockActions(params) {
        let template = ``;
        template += '<a danphe-grid-action="print-barcode" class="grid-action phrm-stock-action fa fa-barcode" title = "Print Barcode" > </a>'
        if (PHRMGridColumns.securityService.HasPermission('store-update-mrp-button'))
            template += `<a danphe-grid-action="update-mrp" class="grid-action">Update S.Price</a>`
        if (PHRMGridColumns.securityService.HasPermission('store-update-expirydate-batchno-button'))
            template += `<a danphe-grid-action="update-expirydate-batchno" class="grid-action">Update Exp&Batch</a>`
        return template;

    }
    GetDispensaryStockActions() {
        let template = `<a  danphe-grid-action="transfer-store" class="grid-action">Store Transfer</a>`;
        if (PHRMGridColumns.securityService.HasPermission('dispensary-update-mrp-button'))
            template += `<a danphe-grid-action="update-mrp" class="grid-action">Update MRP</a>`
        return template;
    }

    //for Supplier Ledger : HardCoded ones
    static SupplierLedgerList = [
        { headerName: "Supplier Name", field: "SupplierName", width: 100 },
        { headerName: "Total Amt", field: "TotalAmount", width: 100 },
        { headerName: "Paid Amount", field: "PaidAmount", width: 100 },
        { headerName: "Due Amount", field: "DueAmount", width: 100 },
        // { headerName: "Invoice No", field: "InvoicePrintId", width: 100, cellRenderer: PHRMGridColumns.InvoicePrintIdRenderer },
        , {
            headerName: "Actions",
            field: "",
            width: 200,
            template:
                `<a danphe-grid-action="view" class="grid-action">
           View Details
        </a>
       `
        }
    ]
    static SupplierLedgerViewList = [
        { headerName: "GRNo", field: "GRNo", width: 100 }, ,
        { headerName: "Vendor Bill No", field: "BillNo", width: 100 },
        { headerName: "Total Amount", field: "TotalAmount", width: 100 },
        {
            headerName: "Actions",
            field: "",
            width: 200,
            template:
                `<a danphe-grid-action="pay" class="grid-action">
           Payment
        </a>
       `
        }
    ]
}
