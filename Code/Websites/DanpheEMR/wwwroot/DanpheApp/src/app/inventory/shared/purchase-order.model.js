"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POVerifier = exports.PurchaseOrder = void 0;
var forms_1 = require("@angular/forms");
var moment = require("moment/moment");
var PurchaseOrder = /** @class */ (function () {
    function PurchaseOrder() {
        this.PurchaseOrderId = 0;
        this.RequisitionId = null;
        this.PRNumber = null;
        this.VendorId = null;
        this.PoDate = moment().format('YYYY-MM-DD');
        this.POStatus = null;
        this.SubTotal = null;
        this.VAT = 0;
        this.TotalAmount = 0;
        this.PORemark = null;
        this.CreatedBy = 0;
        this.CreatedOn = null;
        this.CancelledOn = null;
        this.CancelRemarks = "";
        this.TermsConditions = null;
        this.VendorName = "";
        this.VendorNo = "";
        this.VATAmount = 0;
        this.Terms = "";
        this.VendorAddress = "";
        this.ModifiedBy = null;
        this.ModifiedOn = null;
        this.IsCancel = false;
        this.PurchaseOrderItems = new Array();
        this.PurchaseOrderValidator = null;
        //sanjit: added for verification purpose
        this.IsVerificationEnabled = false;
        this.VerifierList = [];
        this.IsVerificationAllowed = false;
        this.Item = null;
        this.Vendor = null;
        this.InvoiceHeaderId = null;
        this.IsModificationAllowed = true;
        var _formBuilder = new forms_1.FormBuilder();
        this.PurchaseOrderValidator = _formBuilder.group({
            'VendorId': ['', forms_1.Validators.compose([forms_1.Validators.required])],
        });
    }
    PurchaseOrder.prototype.ngOnInit = function () {
        var _this = this;
        this.PurchaseOrderValidator.get('VendorId').valueChanges.subscribe(function () {
            _this.PurchaseOrderValidator.updateValueAndValidity();
        });
    };
    PurchaseOrder.prototype.IsDirty = function (fieldName) {
        if (fieldName == undefined)
            return this.PurchaseOrderValidator.dirty;
        else
            return this.PurchaseOrderValidator.controls[fieldName].dirty;
    };
    PurchaseOrder.prototype.IsValid = function () { if (this.PurchaseOrderValidator.valid) {
        return true;
    }
    else {
        return false;
    } };
    PurchaseOrder.prototype.IsValidCheck = function (fieldName, validator) {
        if (fieldName == undefined) {
            return this.PurchaseOrderValidator.valid;
        }
        else
            return !(this.PurchaseOrderValidator.hasError(validator, fieldName));
    };
    return PurchaseOrder;
}());
exports.PurchaseOrder = PurchaseOrder;
var POVerifier = /** @class */ (function () {
    function POVerifier() {
        this.Name = "";
        this.Type = "";
    }
    return POVerifier;
}());
exports.POVerifier = POVerifier;
//# sourceMappingURL=purchase-order.model.js.map