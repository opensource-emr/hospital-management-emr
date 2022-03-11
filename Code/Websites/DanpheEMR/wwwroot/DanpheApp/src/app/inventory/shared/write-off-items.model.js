"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteOffItems = void 0;
var forms_1 = require("@angular/forms");
var WriteOffItems = /** @class */ (function () {
    function WriteOffItems() {
        this.WriteOffId = 0;
        this.StockId = 0;
        this.ItemId = 0;
        this.ItemRate = 0;
        this.WriteOffQuantity = 0;
        this.TotalAmount = 0;
        this.WriteOffDate = null;
        this.Remark = null;
        this.CreatedBy = 0;
        this.CreatedOn = "";
        this.GoodsReceiptItemId = 0;
        this.BatchNO = "";
        ////Selected Item as ItemMaster Model for New row
        this.SelectedItem = null;
        //Only for Display purpose
        this.ItemName = "";
        this.BatchNo = "";
        this.VAT = 0;
        this.AvailableQty = 0;
        this.SubTotal = 0;
        this.BatchNoList = new Array();
        this.WriteOffItemValidator = null;
        this.Code = null;
        var _formBuilder = new forms_1.FormBuilder();
        this.WriteOffItemValidator = _formBuilder.group({
            'ItemId': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'WriteOffDate': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'WriteOffQuantity': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'BatchNo': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'Remark': ['', forms_1.Validators.required]
        });
    }
    WriteOffItems.prototype.IsDirty = function (fieldName) {
        if (fieldName == undefined)
            return this.WriteOffItemValidator.dirty;
        else
            return this.WriteOffItemValidator.controls[fieldName].dirty;
    };
    WriteOffItems.prototype.IsValid = function () { if (this.WriteOffItemValidator.valid) {
        return true;
    }
    else {
        return false;
    } };
    WriteOffItems.prototype.IsValidCheck = function (fieldName, validator) {
        if (fieldName == undefined) {
            return this.WriteOffItemValidator.valid;
        }
        else
            return !(this.WriteOffItemValidator.hasError(validator, fieldName));
    };
    return WriteOffItems;
}());
exports.WriteOffItems = WriteOffItems;
//# sourceMappingURL=write-off-items.model.js.map