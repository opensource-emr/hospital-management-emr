"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment/moment");
var WARDGridColumns = /** @class */ (function () {
    function WARDGridColumns() {
    }
    WARDGridColumns.QuantityColorWarningRenderer = function (params) {
        //let invthresholdmargin = params.data.MinQuantity;
        var quantity = params.data.Quantity;
        var minimumQuantity = params.data.MinimumQuantity;
        if (quantity == 0) {
            return ("<div style='width:50%;background-color:red;'>" +
                quantity +
                "</div>");
        }
        else if (quantity <= minimumQuantity) {
            return ("<div style='width:50%;background-color:yellow;'>" +
                quantity +
                "</div>");
        }
        else {
            return "<div style='width:50%'>" + quantity + "</div>";
        }
    };
    WARDGridColumns.ExpiryDate = function (params) {
        return moment(params).format('LL');
    };
    WARDGridColumns.DateOfExpiry = function (params) {
        var expiryDate = params.data.ExpiryDate;
        var expiryDate1 = new Date(params.data.ExpiryDate);
        var date = new Date();
        var datenow = date.setMonth(date.getMonth() + 0);
        var datethreemonth = date.setMonth(date.getMonth() + 3);
        var expDate = expiryDate1.setMonth(expiryDate1.getMonth() + 0);
        if (expDate <= datenow) {
            return "<span style='background-color:red;color:white'>" + expiryDate + "(" + "Exp" + ")" + "</span>";
        }
        if (expDate < datethreemonth && expDate > datenow) {
            return "<span style='background-color:yellow;color:black'>" + expiryDate + "(" + "N. Exp" + ")" + "</span>";
        }
        if (expDate > datethreemonth) {
            return "<span style='background-color:white;color:black'>" + expiryDate + "</span>";
        }
    };
    //WARD: getting date
    WARDGridColumns.DateOnlyRenderer = function (params) {
        var Date = params.data.Date;
        return moment(Date).format('DD-MMM-YYYY');
    };
    //displays date and time in hour:minute
    WARDGridColumns.DateTimeRenderer = function (params) {
        return moment(params.data.CreatedOn).format("YYYY-MM-DD HH:mm");
    };
    //displays date and time in hour:minute
    WARDGridColumns.ConsumptionDateRenderer = function (params) {
        return moment(params.data.ConsumptionDate).format("YYYY-MM-DD");
    };
    WARDGridColumns.ConsumptionDate = function (params) {
        return moment(params.data.ConsumedDate).format("lll");
    };
    WARDGridColumns.WARDStockDetailsList = [
        { headerName: "Generic Name", field: "GenericName", width: 150 },
        { headerName: "Item Name", field: "ItemName", width: 150 },
        { headerName: "Batch No", field: "BatchNo", width: 90 },
        { headerName: "Expiry Date", field: "ExpiryDate", width: 150, cellRenderer: WARDGridColumns.ExpiryDate },
        { headerName: "Available Quantity", field: "AvailableQuantity", width: 100 },
        { headerName: "MRP", field: "MRP", width: 80 },
        {
            headerName: "Action",
            field: "",
            width: 150,
            template: "<a danphe-grid-action=\"breakage-stock\" class=\"grid-action\"> Breakage </a>"
        }
    ];
    WARDGridColumns.InternalConsumptionList = [
        { headerName: "Ward Name", field: "WardName", width: 100 },
        { headerName: "Item Name", field: "ItemName", width: 150 },
        { headerName: "Batch No", field: "BatchNo", width: 90 },
        { headerName: "Expiry Date", field: "ExpiryDate", width: 150, cellRenderer: WARDGridColumns.DateOfExpiry },
        { headerName: "Available Quantity", field: "AvailableQuantity", width: 100 },
        { headerName: "MRP", field: "MRP", width: 80 },
    ];
    WARDGridColumns.ShowInternalConsumptionList = [
        { headerName: "Consumed Date", field: "ConsumedDate", width: 150, cellRenderer: WARDGridColumns.ConsumptionDate },
        { headerName: "Department Name", field: "DepartmentName", width: 150 },
        { headerName: "Consumed By", field: "ConsumedBy", width: 150 },
        { headerName: "Remark", field: "Remark", width: 150 },
        { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' }
    ];
    WARDGridColumns.WARDInventoryStockDetailsList = [
        { headerName: "Item Name", field: "ItemName", width: 150 },
        { headerName: "Available Quantity", field: "Quantity", width: 100, cellRenderer: WARDGridColumns.QuantityColorWarningRenderer },
        { headerName: "Item Type", field: "ItemType", width: 100 },
    ];
    WARDGridColumns.ConsumptionDetailsList = [
        { headerName: "Patient Name", field: "Name", width: 150 },
        { headerName: "Address", field: "Address", width: 150 },
        { headerName: "Gender", field: "Gender", width: 100 },
        { headerName: "PhoneNumber", field: "PhoneNumber", width: 150 },
        { headerName: "Ward Name", field: "WardName", width: 100 },
        { headerName: "Quantity", field: "Quantity", width: 80 },
        { headerName: "Action", field: "", width: 100, template: "<a danphe-grid-action=\"view\" class=\"grid-action\">View</a> <a danphe-grid-action=\"showDetails\" class=\"grid-action\">Show Details</a>" }
    ];
    // all pending or completed ward request list.  
    WARDGridColumns.WARDRequestList = [
        { headerName: "Requested By", field: "CreatedBy", width: 150 },
        { headerName: "Date", field: "Date", width: 100, cellRenderer: WARDGridColumns.DateOnlyRenderer },
        { headerName: "Status", field: "Status", width: 100 },
        { headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' },
    ];
    // Ward-Inventory Consumption List
    WARDGridColumns.InventoryConsumptionList = [
        { headerName: "Consumed Date", field: "ConsumptionDate", width: 100, cellRenderer: WARDGridColumns.DateTimeRenderer },
        { headerName: "Consumed Item", field: "ItemName", width: 100 },
        { headerName: "Consumed Qty", field: "Quantity", width: 100 },
        { headerName: "Entered By", field: "UsedBy", width: 150 },
        { headerName: "Remarks", field: "Remark", width: 150 }
        //{ headerName: "Action", field: "", width: 100, template: '<a danphe-grid-action="view" class="grid-action">View</a>' }
    ];
    // Ward Supply Report
    //Ward Stock Report
    WARDGridColumns.WardStockReport = [
        { headerName: "Generic Name", field: "GenericName", width: 150 },
        { headerName: "Item Name", field: "ItemName", width: 150 },
        { headerName: "BatchNo", field: "BatchNo", width: 100 },
        { headerName: "Quantity", field: "Quantity", width: 50 },
        { headerName: "Expiry Date", field: "ExpiryDate", width: 110, cellRenderer: WARDGridColumns.DateOfExpiry },
        { headerName: "MRP", field: "MRP", width: 90 },
    ];
    //Ward Requisition Report
    WARDGridColumns.WardRequsitionReport = [
        { headerName: "Req.Id", field: "RequisitionId", width: 30 },
        { headerName: "Dis.Id", field: "DispatchId", width: 30 },
        { headerName: "Requested Date", field: "RequestedDate", width: 90 },
        { headerName: "Dispatch Date", field: "DispatchDate", width: 90, },
        { headerName: "Item Name", field: "ItemName", width: 150 },
        { headerName: "Request Qty", field: "RequestedQty", width: 70 },
        { headerName: "Dispatch Qty", field: "DispatchQty", width: 70 },
        { headerName: "MRP", field: "MRP", width: 60 },
        { headerName: "TotalAmt", field: "TotalAmt", width: 70 },
        { headerName: "Req.User", field: "RequestedByUser", width: 90 },
        { headerName: "Dis.User", field: "DispatchedByUser", width: 90 },
        { headerName: "ReceivedBy", field: "ReceivedBy", width: 90 },
    ];
    //Ward Consumption Report
    WARDGridColumns.WardConsumptionReport = [
        { headerName: "Date", field: "Date", width: 90 },
        { headerName: "Item Name", field: "ItemName", width: 150 },
        { headerName: "Generic Name", field: "GenericName", width: 100 },
        { headerName: "Quantity", field: "Quantity", width: 90 },
    ];
    ///Ward Internal Consumption
    WARDGridColumns.WardInternalConsumptionReport = [
        { headerName: "Consumed Date", field: "ConsumedDate", width: 90 },
        { headerName: "Department Name", field: "DepartmentName", width: 150 },
        { headerName: "Item Name", field: "ItemName", width: 150 },
        { headerName: "Consumed By", field: "ConsumedBy", width: 90 },
        { headerName: "Quantity", field: "Quantity", width: 90 },
    ];
    //Ward Dispatch Report
    WARDGridColumns.WardDispatchReport = [
        { headerName: "Date", field: "Date", width: 90 },
        { headerName: "Ward Name", field: "WardName", width: 100 },
        { headerName: "Item Name", field: "ItemName", width: 150 },
        { headerName: "Request Qty", field: "RequestedQty", width: 90 },
        { headerName: "Dispatch Qty", field: "DispatchQty", width: 90 },
    ];
    //Ward Breakage Report
    WARDGridColumns.WardBreakageReport = [
        { headerName: "Date", field: "Date", width: 90 },
        { headerName: "Item Name", field: "ItemName", width: 150 },
        { headerName: "Quantity", field: "Quantity", width: 90 },
        { headerName: "MRP", field: "MRP", width: 90 },
        { headerName: "Total Amount", field: "TotalAmt", width: 90 },
        { headerName: "Remarks", field: "Remarks", width: 90 },
    ];
    //Ward Transfer Report
    WARDGridColumns.WardTransferReport = [
        { headerName: "Date", field: "Date", width: 90 },
        { headerName: "Item Name", field: "ItemName", width: 150 },
        { headerName: "TransferQty", field: "TransferQty", width: 90 },
        { headerName: "Remarks", field: "Remarks", width: 90 },
        { headerName: "TransferedBy", field: "TransferedBy", width: 90 },
        { headerName: "ReceivedBy", field: "ReceivedBy", width: 90 },
    ];
    //// Ward Inventory Report
    //RequisitionDispatchReport Report
    WARDGridColumns.RequisitionDispatchReport = [
        { headerName: "RequisitionDate", field: "RequisitionDate", width: 90 },
        { headerName: "DispatchDate", field: "DispatchDate", width: 90 },
        { headerName: "DepartmentName", field: "DepartmentName", width: 150 },
        { headerName: "ItemName", field: "ItemName", width: 150 },
        { headerName: "RequestQty", field: "RequestQty", width: 90 },
        { headerName: "ReceivedQty", field: "ReceivedQuantity", width: 90 },
        { headerName: "PendingQty", field: "PendingQuantity", width: 90 },
        { headerName: "DispatchedQty", field: "DispatchedQuantity", width: 90 },
        { headerName: "Remarks", field: "Remark", width: 90 },
    ];
    //TransferReport Report
    WARDGridColumns.TransferReport = [
        { headerName: "Date", field: "Date", width: 90, cellRenderer: WARDGridColumns.DateOnlyRenderer },
        { headerName: "DepartmentName", field: "DepartmentName", width: 150 },
        { headerName: "ItemName", field: "ItemName", width: 150 },
        { headerName: "TransferQty", field: "Quantity", width: 90 },
        { headerName: "Remarks", field: "Remarks", width: 90 },
        { headerName: "TransferBy", field: "CreatedBy", width: 90 },
    ];
    //ConsumptionReport Report
    WARDGridColumns.ConsumptionReport = [
        { headerName: "Date", field: "Date", width: 90, cellRenderer: WARDGridColumns.DateOnlyRenderer },
        { headerName: "DepartmentName", field: "DepartmentName", width: 150 },
        { headerName: "ItemName", field: "ItemName", width: 150 },
        { headerName: "Quantity", field: "Quantity", width: 90 },
        { headerName: "User", field: "User", width: 90 },
        { headerName: "Remark", field: "Remark", width: 90 },
    ];
    return WARDGridColumns;
}());
exports.default = WARDGridColumns;
//# sourceMappingURL=ward-grid-cloumns.js.map