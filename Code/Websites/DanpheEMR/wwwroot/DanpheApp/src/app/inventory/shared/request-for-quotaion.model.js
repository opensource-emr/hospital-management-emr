"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestForQuotationModel = void 0;
var forms_1 = require("@angular/forms");
var RequestForQuotationModel = /** @class */ (function () {
    function RequestForQuotationModel() {
        this.ReqForQuotationId = 0;
        this.QuotationId = 0;
        this.ItemId = 0;
        this.ItemName = null;
        this.Subject = "";
        this.Description = "";
        this.RequestedBy = "";
        this.CreatedOn = null;
        this.ApprovedBy = 0;
        this.RequestedOn = null;
        this.RequestedCloseOn = null;
        this.Status = null;
        this.Item = null;
        this.SelectedItem = null;
        this.ReqForQuotationItems = new Array();
        this.ReqForQuotation = new Array();
        this.ReqForQuotationValidator = null;
        var _formBuilder = new forms_1.FormBuilder();
        this.ReqForQuotationValidator = _formBuilder.group({
            'Subject': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'Description': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'RequestedOn': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'RequestedCloseOn': ['', forms_1.Validators.compose([forms_1.Validators.required])],
        });
    }
    RequestForQuotationModel.prototype.IsDirty = function (fieldName) {
        if (fieldName == undefined)
            return this.ReqForQuotationValidator.dirty;
        else
            return this.ReqForQuotationValidator.controls[fieldName].dirty;
    };
    RequestForQuotationModel.prototype.IsValid = function () { if (this.ReqForQuotationValidator.valid) {
        return true;
    }
    else {
        return false;
    } };
    RequestForQuotationModel.prototype.IsValidCheck = function (fieldName, validator) {
        if (fieldName == undefined) {
            return this.ReqForQuotationValidator.valid;
        }
        else
            return !(this.ReqForQuotationValidator.hasError(validator, fieldName));
    };
    return RequestForQuotationModel;
}());
exports.RequestForQuotationModel = RequestForQuotationModel;
//# sourceMappingURL=request-for-quotaion.model.js.map