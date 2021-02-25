"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchVerificationActor = exports.TrackRequisitionVM = void 0;
var inventory_requisition_details_component_1 = require("../../verification/inventory/requisition-details/inventory-requisition-details.component");
var TrackRequisitionVM = /** @class */ (function () {
    function TrackRequisitionVM() {
        this.CreatedBy = "";
        this.RequisitionDate = new Date();
        this.MaxVerificationLevel = 0;
        this.Status = "";
        this.StoreId = 0;
        this.StoreName = "";
    }
    return TrackRequisitionVM;
}());
exports.TrackRequisitionVM = TrackRequisitionVM;
var DispatchVerificationActor = /** @class */ (function (_super) {
    __extends(DispatchVerificationActor, _super);
    function DispatchVerificationActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DispatchVerificationActor;
}(inventory_requisition_details_component_1.VerificationActor));
exports.DispatchVerificationActor = DispatchVerificationActor;
//# sourceMappingURL=track-requisition-vm.model.js.map