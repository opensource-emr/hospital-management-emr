"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationModel = void 0;
var forms_1 = require("@angular/forms");
var QuotationModel = /** @class */ (function () {
    function QuotationModel() {
        this.QuotationId = 0;
        this.ItemId = 0;
        this.ItemName = "";
        this.VendorId = 0;
        this.VendorName = "";
        this.ReqForQuotationId = 0;
        this.ReqForQuotationItemId = 0;
        this.CreatedBy = 0;
        this.Status = "";
        this.Quantity = 0;
        this.TotalAmount = 0;
        this.item = null;
        this.SelectedItem = null;
        this.quotationItems = new Array();
        this.QuotationValidator = null;
        var _formBuilder = new forms_1.FormBuilder();
        this.QuotationValidator = _formBuilder.group({
            'VendorId': ['', forms_1.Validators.compose([forms_1.Validators.required])],
        });
    }
    QuotationModel.prototype.IsDirty = function (fieldName) {
        if (fieldName == undefined)
            return this.QuotationValidator.dirty;
        else
            return this.QuotationValidator.controls[fieldName].dirty;
    };
    QuotationModel.prototype.IsValid = function () { if (this.QuotationValidator.valid) {
        return true;
    }
    else {
        return false;
    } };
    QuotationModel.prototype.IsValidCheck = function (fieldName, validator) {
        if (fieldName == undefined) {
            return this.QuotationValidator.valid;
        }
        else
            return !(this.QuotationValidator.hasError(validator, fieldName));
    };
    return QuotationModel;
}());
exports.QuotationModel = QuotationModel;
//# sourceMappingURL=quotation.model.js.map