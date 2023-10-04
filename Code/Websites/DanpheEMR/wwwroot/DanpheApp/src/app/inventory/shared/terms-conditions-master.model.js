"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermsConditionsMasterModel = void 0;
var forms_1 = require("@angular/forms");
var shared_enums_1 = require("../../shared/shared-enums");
var TermsConditionsMasterModel = /** @class */ (function () {
    function TermsConditionsMasterModel() {
        this.TermsId = 0;
        this.ShortName = null;
        this.Text = null;
        this.Type = null;
        this.OrderBy = 0;
        this.CreatedBy = 0;
        this.CreatedOn = null;
        this.IsActive = true;
        this.TermsApplicationEnumId = shared_enums_1.ENUM_TermsApplication.Inventory;
        this.TermsValidators = null;
        var _formBuilder = new forms_1.FormBuilder();
        this.TermsValidators = _formBuilder.group({
            'Text': ['', forms_1.Validators.compose([forms_1.Validators.required, forms_1.Validators.maxLength(250)])],
        });
    }
    TermsConditionsMasterModel.prototype.IsDirty = function (fieldName) {
        if (fieldName == undefined)
            return this.TermsValidators.dirty;
        else
            return this.TermsValidators.controls[fieldName].dirty;
    };
    TermsConditionsMasterModel.prototype.IsValid = function () { if (this.TermsValidators.valid) {
        return true;
    }
    else {
        return false;
    } };
    TermsConditionsMasterModel.prototype.IsValidCheck = function (fieldName, validator) {
        if (fieldName == undefined) {
            return this.TermsValidators.valid;
        }
        else
            return !(this.TermsValidators.hasError(validator, fieldName));
    };
    return TermsConditionsMasterModel;
}());
exports.TermsConditionsMasterModel = TermsConditionsMasterModel;
//# sourceMappingURL=terms-conditions-master.model.js.map