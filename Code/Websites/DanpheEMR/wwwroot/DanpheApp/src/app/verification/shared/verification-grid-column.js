"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment/moment");
var VerificationGridColumns = /** @class */ (function () {
    function VerificationGridColumns() {
    }
    VerificationGridColumns.VerificationStatusRenderer = function (params) {
        if (params.data.MaxVerificationLevel > 0) {
            return ("<span>" +
                params.data.CurrentVerificationLevelCount +
                " verified out of " +
                params.data.MaxVerificationLevel +
                "</span");
        }
        else {
            return "N/A";
        }
    };
    VerificationGridColumns.RequisitionDateOnlyRenderer = function (params) {
        var date = params.data.RequisitionDate;
        return moment(date).format("YYYY-MM-DD");
    };
    VerificationGridColumns.PurchaseOrderDateOnlyRenderer = function (params) {
        var date = params.data.PoDate;
        return moment(date).format("YYYY-MM-DD");
    };
    VerificationGridColumns.GRDateOnlyRenderer = function (params) {
        var date = params.data.GoodReceiptDate;
        return moment(date).format("YYYY-MM-DD");
    };
    VerificationGridColumns.YesNoViewerforPurchaseRequest = function (params) {
        if (params.data.IsPOCreated == true) {
            var template = "\n                    <span style=\"background-color:#4CAF50\">&nbsp;&nbsp;&nbsp; Yes &nbsp;&nbsp;&nbsp;</span>\n                ";
            return template;
        }
        else {
            var template = "\n                    <span style=\"background-color:#F44336\">&nbsp;&nbsp;&nbsp; No&nbsp;&nbsp;&nbsp;</span>\n                ";
            return template;
        }
    };
    VerificationGridColumns.RequisitionList = [
        { headerName: "Req.No", field: "RequisitionNo", width: 35 },
        { headerName: "StoreName", field: "StoreName", width: 80 },
        {
            headerName: "Requested On",
            field: "RequisitionDate",
            width: 80,
            cellRenderer: VerificationGridColumns.RequisitionDateOnlyRenderer
        },
        { headerName: "Req. Status", field: "RequisitionStatus", width: 40 },
        {
            headerName: "Verification Status",
            width: 100,
            cellRenderer: VerificationGridColumns.VerificationStatusRenderer
        },
        {
            headerName: "Action",
            field: "",
            width: 120,
            template: "<a danphe-grid-action=\"view\" class=\"grid-action\">\n            View\n         </a>"
        }
    ];
    VerificationGridColumns.PurchaseRequestList = [
        { headerName: "PR No.", field: "PRNumber", width: 40 },
        {
            headerName: "Requested On",
            field: "RequestDate",
            width: 80
        },
        { headerName: "Vendor", field: "VendorName", width: 100 },
        { headerName: "Status", field: "RequestStatus", width: 40 },
        {
            headerName: "Verification Status",
            width: 100,
            cellRenderer: VerificationGridColumns.VerificationStatusRenderer
        },
        { headerName: "RequestedBy", field: "RequestedByName", width: 100 },
        { headerName: "PO Created", field: "IsPOCreated", width: 60, cellRenderer: VerificationGridColumns.YesNoViewerforPurchaseRequest },
        {
            headerName: "Action",
            field: "",
            width: 120,
            template: "<a danphe-grid-action=\"view\" class=\"grid-action\">\n            View\n         </a>"
        }
    ];
    VerificationGridColumns.PurchaseOrderList = [
        { headerName: "PO Id", field: "PurchaseOrderId", width: 110 },
        { headerName: "Req.Id", field: "RequisitionId", width: 110 },
        { headerName: "Vendor", field: "VendorName", width: 110 },
        {
            headerName: "PO Date",
            field: "PoDate",
            width: 100,
            cellRenderer: VerificationGridColumns.PurchaseOrderDateOnlyRenderer,
        },
        { headerName: "PO Status", field: "POStatus", width: 110 },
        {
            headerName: "Verification Status",
            width: 100,
            cellRenderer: VerificationGridColumns.VerificationStatusRenderer
        },
        {
            headerName: "Action",
            field: "",
            width: 120,
            template: "<a danphe-grid-action=\"verify\" class=\"grid-action\">\n            Verify\n         </a>"
        }
    ];
    VerificationGridColumns.GRList = [
        { headerName: "GR No", field: "GoodsReceiptNo", width: 110 },
        {
            headerName: "GR Date",
            field: "GoodReceiptDate",
            width: 100,
            cellRenderer: VerificationGridColumns.GRDateOnlyRenderer,
        },
        { headerName: "Po.No", field: "PurchaseOrderId", width: 110 },
        { headerName: "GRCategory", field: "GRCategory", width: 110 },
        { headerName: "Vendor", field: "VendorName", width: 110 },
        { headerName: "Bill No.", field: "BillNo", width: 50 },
        { headerName: "Pay. Mode", field: "PaymentMode", width: 60 },
        {
            headerName: "Verification Status",
            width: 100,
            cellRenderer: VerificationGridColumns.VerificationStatusRenderer
        },
        {
            headerName: "Action",
            field: "",
            width: 120,
            template: "<a danphe-grid-action=\"verify\" class=\"grid-action\">\n            Verify\n         </a>"
        }
    ];
    return VerificationGridColumns;
}());
exports.default = VerificationGridColumns;
//# sourceMappingURL=verification-grid-column.js.map