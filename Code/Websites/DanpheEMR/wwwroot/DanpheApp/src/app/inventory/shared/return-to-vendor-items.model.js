"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnToVendorItem = void 0;
var forms_1 = require("@angular/forms");
var ReturnToVendorItem = /** @class */ (function () {
    function ReturnToVendorItem() {
        this.ReturnToVendorItemId = 0;
        this.ReturnToVendorId = null;
        this.VendorId = null;
        this.ItemId = null;
        this.VendorName = null;
        this.ItemName = null;
        this.GoodsReceiptItemId = null;
        this.GoodsReceiptId = null;
        this.CreditNoteNo = null;
        this.StockId = null;
        this.Quantity = null;
        this.ItemRate = null;
        this.TotalAmount = null;
        this.VATAmount = null;
        this.Remark = null;
        this.ReturnType = null;
        this.CreatedOn = null;
        this.CreatedBy = null;
        this.ItemCode = null;
        this.SupplierBillNo = null;
        this.Item = null;
        this.VAT = null;
        this.BatchNo = null;
        this.AvailableQuantity = null;
        this.batchNoList = new Array();
        this.ReturnItemValidator = null;
        var _formBuilder = new forms_1.FormBuilder();
        this.ReturnItemValidator = _formBuilder.group({
            'ItemId': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'Quantity': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'BatchNo': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'GoodsReceiptId': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            //'CreditNoteNo': ['', Validators.compose([Validators.required])],
            'Remark': ['', forms_1.Validators.compose([forms_1.Validators.required])]
        });
    }
    ReturnToVendorItem.prototype.IsDirty = function (fieldName) {
        if (fieldName == undefined)
            return this.ReturnItemValidator.dirty;
        else
            return this.ReturnItemValidator.controls[fieldName].dirty;
    };
    ReturnToVendorItem.prototype.IsValid = function () { if (this.ReturnItemValidator.valid) {
        return true;
    }
    else {
        return false;
    } };
    ReturnToVendorItem.prototype.IsValidCheck = function (fieldName, validator) {
        if (fieldName == undefined) {
            return this.ReturnItemValidator.valid;
        }
        else
            return !(this.ReturnItemValidator.hasError(validator, fieldName));
    };
    return ReturnToVendorItem;
}());
exports.ReturnToVendorItem = ReturnToVendorItem;
//# sourceMappingURL=return-to-vendor-items.model.js.map