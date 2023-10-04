"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestForQuotationItemsModel = void 0;
var forms_1 = require("@angular/forms");
var common_validator_1 = require("./../../shared/common-validator");
var RequestForQuotationItemsModel = /** @class */ (function () {
    function RequestForQuotationItemsModel() {
        this.ReqForQuotationItemId = 0;
        this.ReqForQuotationId = 0;
        this.ItemId = 0;
        this.VendorId = 0;
        this.Quantity = 0;
        this.ItemName = "";
        this.TitleName = "";
        this.Code = "";
        this.UOMName = "";
        this.Description = "";
        this.CreatedBy = 0;
        this.CreatedOn = "";
        this.ItemStatus = null;
        this.SelectedItem = null;
        this.Item = null;
        this.ReqForQuotationItemValidator = null;
        var _formBuilder = new forms_1.FormBuilder();
        this.ReqForQuotationItemValidator = _formBuilder.group({
            'ItemId': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'Quantity': ['', forms_1.Validators.compose([forms_1.Validators.required, common_validator_1.CommonValidators.positivenum])],
        });
    }
    RequestForQuotationItemsModel.prototype.IsDirty = function (fieldName) {
        if (fieldName == undefined)
            return this.ReqForQuotationItemValidator.dirty;
        else
            return this.ReqForQuotationItemValidator.controls[fieldName].dirty;
    };
    RequestForQuotationItemsModel.prototype.IsValid = function () { if (this.ReqForQuotationItemValidator.valid) {
        return true;
    }
    else {
        return false;
    } };
    RequestForQuotationItemsModel.prototype.IsValidCheck = function (fieldName, validator) {
        if (fieldName == undefined) {
            return this.ReqForQuotationItemValidator.valid;
        }
        else
            return !(this.ReqForQuotationItemValidator.hasError(validator, fieldName));
    };
    return RequestForQuotationItemsModel;
}());
exports.RequestForQuotationItemsModel = RequestForQuotationItemsModel;
//# sourceMappingURL=request-for-quotation-item.model.js.map