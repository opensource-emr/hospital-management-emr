"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationItemsModel = void 0;
var forms_1 = require("@angular/forms");
var QuotationItemsModel = /** @class */ (function () {
    function QuotationItemsModel() {
        this.QuotationItemId = 0;
        this.QuotationId = 0;
        this.VendorId = null;
        this.ItemId = 0;
        this.ItemName = "";
        this.Description = "";
        this.Price = 0;
        this.Quantity = 0;
        this.IsDeleted = null;
        this.IsAdded = null;
        this.UpLoadedon = "";
        this.UpLoadedBy = null;
        this.CreatedBy = 0;
        this.item = null;
        this.vendorItm = null;
        this.SelectedItem = null;
        this.QuotationItemsValidator = null;
        var _formBuilder = new forms_1.FormBuilder();
        this.QuotationItemsValidator = _formBuilder.group({
            'ItemId': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'Price': ['', forms_1.Validators.compose([forms_1.Validators.required])],
        });
    }
    QuotationItemsModel.prototype.IsDirty = function (fieldName) {
        if (fieldName == undefined)
            return this.QuotationItemsValidator.dirty;
        else
            return this.QuotationItemsValidator.controls[fieldName].dirty;
    };
    QuotationItemsModel.prototype.IsValid = function () { if (this.QuotationItemsValidator.valid) {
        return true;
    }
    else {
        return false;
    } };
    QuotationItemsModel.prototype.IsValidCheck = function (fieldName, validator) {
        if (fieldName == undefined) {
            return this.QuotationItemsValidator.valid;
        }
        else
            return !(this.QuotationItemsValidator.hasError(validator, fieldName));
    };
    return QuotationItemsModel;
}());
exports.QuotationItemsModel = QuotationItemsModel;
//# sourceMappingURL=quotation-items.model.js.map