"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequisitionStockVMModel = void 0;
var requisition_model_1 = require("./requisition.model");
var RequisitionStockVMModel = /** @class */ (function () {
    function RequisitionStockVMModel() {
        this.stock = Array();
        this.dispatchItems = Array();
        this.stockTransactions = Array();
        this.requisition = new requisition_model_1.Requisition();
    }
    return RequisitionStockVMModel;
}());
exports.RequisitionStockVMModel = RequisitionStockVMModel;
//# sourceMappingURL=requisition-stock-vm.model.js.map