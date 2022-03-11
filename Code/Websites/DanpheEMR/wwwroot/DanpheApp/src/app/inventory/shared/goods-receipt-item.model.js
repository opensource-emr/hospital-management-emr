"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodsReceiptItems = void 0;
var forms_1 = require("@angular/forms");
var moment = require("moment/moment");
var common_validator_1 = require("../../shared/common-validator");
var GoodsReceiptItems = /** @class */ (function () {
    function GoodsReceiptItems() {
        this.GoodsReceiptItemId = 0;
        this.GoodsReceiptId = 0;
        this.ItemId = 0;
        this.BatchNO = "";
        this.ExpiryDate = "";
        this.ReceivedQuantity = 0;
        this.FreeQuantity = 0;
        this.RejectedQuantity = 0;
        this.ItemRate = 0;
        this.VATAmount = 0;
        this.TotalAmount = 0;
        this.CreatedBy = 0;
        this.CreatedOn = null;
        this.IsTransferredToACC = false;
        //Only for display purpose
        this.ItemName = "";
        this.VAT = 0;
        this.SubTotal = 0;
        this.PendingQuantity = 0;
        this.Discount = 0;
        this.DiscountAmount = 0;
        this.MRP = 0;
        this.CcCharge = 0;
        this.CcAmount = 0;
        this.OtherCharge = 0;
        this.CounterId = 0;
        this.SelectedItem = "";
        this.GoodsReceiptItemValidator = null;
        this.Quantity = 0;
        this.ModifiedBy = null;
        this.ModifiedOn = null;
        //for display purpose
        this.itemPriceHistory = [];
        this.IsActive = true;
        var _formBuilder = new forms_1.FormBuilder();
        this.GoodsReceiptItemValidator = _formBuilder.group({
            'ReceivedQuantity': ['', forms_1.Validators.compose([forms_1.Validators.required, common_validator_1.CommonValidators.positivenum])],
            'ItemId': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'FreeQuantity': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'ItemRate': ['', forms_1.Validators.compose([forms_1.Validators.required, common_validator_1.CommonValidators.positivenum])],
        });
    }
    GoodsReceiptItems.prototype.IsDirty = function (fieldName) {
        if (fieldName == undefined)
            return this.GoodsReceiptItemValidator.dirty;
        else
            return this.GoodsReceiptItemValidator.controls[fieldName].dirty;
    };
    GoodsReceiptItems.prototype.IsValid = function () { if (this.GoodsReceiptItemValidator.valid) {
        return true;
    }
    else {
        return false;
    } };
    GoodsReceiptItems.prototype.IsValidCheck = function (fieldName, validator) {
        if (fieldName == undefined) {
            return this.GoodsReceiptItemValidator.valid;
        }
        else
            return !(this.GoodsReceiptItemValidator.hasError(validator, fieldName));
    };
    GoodsReceiptItems.prototype.dateValidator = function (control) {
        //get current date, month and time
        var currDate = moment().format('YYYY-MM-DD');
        //if positive then selected date is of future else it of the past || selected year can't be of future
        if (control.value) {
            if ((moment(control.value).diff(currDate) < 0)
                || (moment(control.value).diff(currDate, 'years') > 10)) //can make appointent upto 10 year from today only.
                return { 'wrongDate': true };
        }
        //else
        //    return { 'wrongDate': true };
    };
    return GoodsReceiptItems;
}());
exports.GoodsReceiptItems = GoodsReceiptItems;
//# sourceMappingURL=goods-receipt-item.model.js.map