"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment/moment");
var verification_grid_column_1 = require("../../verification/shared/verification-grid-column");
var ProcurementGridColumns = /** @class */ (function () {
    function ProcurementGridColumns() {
    }
    //displays date and time in hour:minute
    ProcurementGridColumns.DateTimeRendererForPurchaseRequest = function (params) {
        return moment(params.data.RequestDate).format("YYYY-MM-DD HH:mm");
    };
    ProcurementGridColumns.GetPOActions = function (params) {
        if (params.data.IsPOCreated) {
            return "<a danphe-grid-action=\"view\" class=\"grid-action\">\n            View </a>";
        }
        else {
            if (params.data.IsActive == true) {
                return "<a danphe-grid-action=\"view\" class=\"grid-action\">\n            View </a>\n            <a danphe-grid-action=\"addPO\" class=\"grid-action\">\n            Add Purchase Order </a>";
            }
        }
    };
    ProcurementGridColumns.PurchaseOrderDateOnlyRenderer = function (params) {
        var date = params.data.PoDate;
        return moment(date).format("YYYY-MM-DD");
    };
    ProcurementGridColumns.ShowActionForPOList = function (params) {
        if (params.data.POStatus == "active" || params.data.POStatus == "partial") {
            var template = "</a>\n                <a danphe-grid-action=\"view\" class=\"grid-action\">\n                View\n             </a>\n\n             <a  danphe-grid-action=\"genReceipt\" class=\"grid-action\">\n                Add Goods Receipt</a>\n             ";
            return template;
        }
        else {
            var template = "<a danphe-grid-action=\"view\" class=\"grid-action\">\n                View\n             </a> &nbsp;\n             \n             <div class=\"dropdown\" style=\"display:inline-block;\">\n                            <button class=\"dropdown-toggle grid-btnCstm\" type=\"button\" data-toggle=\"dropdown\">...\n                            <span class=\"caret\"></span></button>\n                            <ul class=\"dropdown-menu grid-ddlCstm\">\n                            <li><a danphe-grid-action=\"CreateCopy\" >Create copy from this PO</a></li>\n                            \n                            </ul>\n                        </div>\n             ";
            return template;
        }
    };
    ProcurementGridColumns.CreatedOnDateRenderer = function (params) {
        var date = params.data.CreatedOn;
        return moment(date).format("YYYY-MM-DD");
    };
    //Procurement GR date renderer
    ProcurementGridColumns.GRDateTimeRenderer = function (params) {
        var date = params.data.GoodReceiptDate;
        return moment(date).format("YYYY-MM-DD");
    };
    ProcurementGridColumns.CreatedOnDateTimeRenderer = function (params) {
        return moment(params.data.CreatedOn).format("YYYY-MM-DD HH:mm");
    };
    ProcurementGridColumns.ShowActionForRFQList = function (params) {
        if (params.data.Status == "active" || params.data.Status == "partial") {
            var template = "<a danphe-grid-action=\"View\" class=\"grid-action\">RFQ Details</a>\n             <a danphe-grid-action=\"AttachQuotationDocuments\" class=\"grid-action\">Attach Quo Files</a>\n\n                  <div class=\"dropdown\" style=\"display:inline-block;\">\n                 <button class=\"dropdown-toggle grid-btnCstm\" type=\"button\" data-toggle=\"dropdown\">...\n                 <span class=\"caret\"></span></button>\n                 <ul class=\"dropdown-menu grid-ddlCstm\">\n                     <li><a danphe-grid-action=\"AddQuotationDetails\" class=\"grid-action\">Add Supp Quotation</a></li>\n                    <li><a danphe-grid-action=\"AnalyseQuotation\" class=\"grid-action\">Analyse Quotation</a></li>\n\n                 </ul>\n               </div>";
            return template;
        }
        else {
            var template = "<a danphe-grid-action=\"View\" class=\"grid-action\">RFQ Details</a>\n          <a danphe-grid-action=\"QuotationList\" class=\"grid-action\">Quotation List</a>\n          <a danphe-grid-action=\"SelectedQuotation\" class=\"grid-action\"> Selected Quotation </a>";
            return template;
        }
    };
    ProcurementGridColumns.PurchaseRequestList = [
        { headerName: "PR No.", field: "PRNumber", width: 30 },
        { headerName: "Request Date", field: "RequestDate", width: 100, cellRenderer: ProcurementGridColumns.DateTimeRendererForPurchaseRequest },
        { headerName: "Vendor", field: "VendorName", width: 100 },
        { headerName: "Status", field: "RequestStatus", width: 60 },
        { headerName: "Verification Status", width: 100, cellRenderer: verification_grid_column_1.default.VerificationStatusRenderer },
        { headerName: "RequestedBy", field: "RequestedByName", width: 100 },
        { headerName: "PO Created", field: "IsPOCreated", width: 60, cellRenderer: verification_grid_column_1.default.YesNoViewerforPurchaseRequest },
        {
            headerName: "Actions",
            field: "",
            width: 150,
            cellRenderer: ProcurementGridColumns.GetPOActions,
        },
    ];
    ProcurementGridColumns.POList = [
        { headerName: "PO Id", field: "PurchaseOrderId", width: 110 },
        { headerName: "PR No", field: "PRNumber", width: 110 },
        { headerName: "Vendor Name", field: "VendorName", width: 110 },
        { headerName: "Vendor Contact", field: "VendorContact", width: 110 },
        {
            headerName: "PO Date",
            field: "PoDate",
            width: 100,
            cellRenderer: ProcurementGridColumns.PurchaseOrderDateOnlyRenderer,
        },
        { headerName: "Total Amount", field: "TotalAmount", width: 80 },
        { headerName: "PO Status", field: "POStatus", width: 110 },
        { headerName: "Verification Status", width: 120, cellRenderer: verification_grid_column_1.default.VerificationStatusRenderer },
        {
            headerName: "Actions",
            field: "",
            width: 200,
            ///this is used to action according to status
            cellRenderer: ProcurementGridColumns.ShowActionForPOList,
        },
    ];
    ProcurementGridColumns.GRList = [
        { headerName: "GR No.", field: "GoodsReceiptNo", width: 50 },
        {
            headerName: "Vendor Bill Date",
            field: "GoodReceiptDate",
            width: 60,
            cellRenderer: ProcurementGridColumns.GRDateTimeRenderer,
        },
        { headerName: "PO No.", field: "PurchaseOrderId", width: 40 },
        { headerName: "GR Category", field: "GRCategory", width: 60 },
        { headerName: "Vendor Name", field: "VendorName", width: 100 },
        { headerName: "Vendor Contact", field: "ContactNo", width: 80 },
        { headerName: "Bill No.", field: "BillNo", width: 50 },
        { headerName: "Total Amount", field: "TotalAmount", width: 75 },
        { headerName: "Pay. Mode", field: "PaymentMode", width: 60 },
        { headerName: "Remarks", field: "Remarks", width: 100 },
        {
            headerName: "Entry Date",
            field: "CreatedOn",
            width: 60,
            cellRenderer: ProcurementGridColumns.CreatedOnDateRenderer,
        },
        { headerName: "Verification Status", width: 100, cellRenderer: verification_grid_column_1.default.VerificationStatusRenderer },
        {
            headerName: "Action",
            field: "",
            width: 50,
            template: '<a danphe-grid-action="view" class="grid-action">View</a>',
        },
    ];
    ProcurementGridColumns.ReqQuotationList = [
        { headerName: "Subject", field: "Subject", width: 120 },
        { headerName: "Description", field: "Description", width: 200 },
        {
            headerName: "Requested Date",
            field: "RequestedOn",
            width: 100,
            cellRenderer: ProcurementGridColumns.CreatedOnDateTimeRenderer,
        },
        { headerName: "Status", field: "Status", width: 100 },
        { headerName: "Action", field: "", width: 180, cellRenderer: ProcurementGridColumns.ShowActionForRFQList },
    ];
    ProcurementGridColumns.QuotationList = [
        { headerName: "RFQ Subject", field: "Subject" },
        { headerName: "Vendor Name", field: "VendorName" },
        {
            headerName: "Created Date",
            field: "CreatedOn",
            cellRenderer: ProcurementGridColumns.CreatedOnDateTimeRenderer,
        },
        { headerName: "Status", field: "Status" },
        {
            headerName: "Action",
            field: "",
            template: "<a danphe-grid-action=\"view\" class=\"grid-action\">\n               View\n             </a>",
        },
    ];
    ProcurementGridColumns.ReturnToVendorList = [
        { headerName: "Vendor Name", field: "VendorName", width: 150 },
        { headerName: "Credit Note No", field: "CreditNoteNo", width: 150 },
        { headerName: "Returned On", field: "CreatedOn", width: 150, cellRenderer: ProcurementGridColumns.CreatedOnDateTimeRenderer, },
        {
            headerName: "Actions",
            field: "",
            width: 180,
            template: "\n                 <a danphe-grid-action=\"view\" class=\"grid-action\">\n                    View\n                 </a>",
        },
    ];
    ProcurementGridColumns.VendorsList = [
        { headerName: "S.N", field: "Sno", width: 25 },
        { headerName: "Vendor Name", field: "VendorName", width: 150 },
        { headerName: "Vendor Contact", field: "ContactNo", width: 100 },
        { headerName: "GR Date", field: "GoodReceiptDate", width: 100 },
        { headerName: "Total Amount", field: "TotalAmount", width: 100 },
        {
            headerName: "Action",
            field: "",
            width: 100,
            template: '<a danphe-grid-action="view" class="grid-action">View</a>',
        },
    ];
    return ProcurementGridColumns;
}());
exports.default = ProcurementGridColumns;
//# sourceMappingURL=procurement-grid-column.js.map