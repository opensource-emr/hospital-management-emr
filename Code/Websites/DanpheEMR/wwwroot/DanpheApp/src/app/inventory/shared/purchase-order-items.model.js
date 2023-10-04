"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderItems = void 0;
var forms_1 = require("@angular/forms");
var common_validator_1 = require("./../../shared/common-validator");
var PurchaseOrderItems = /** @class */ (function () {
    function PurchaseOrderItems() {
        this.PurchaseOrderItemId = 0;
        this.ItemId = 0;
        this.PurchaseOrderId = 0;
        this.Quantity = null;
        this.StandardRate = 0;
        this.TotalAmount = 0;
        this.ReceivedQuantity = 0;
        this.PendingQuantity = 0;
        this.DeliveryDays = 0;
        this.AuthorizedRemark = null;
        this.Remark = null;
        this.AuthorizedBy = 0;
        this.AuthorizedOn = null;
        this.CreatedBy = 0;
        this.CreatedOn = null;
        this.POItemStatus = null;
        this.PurchaseOrder = null;
        this.ModifiedBy = null;
        this.ModifiedOn = null;
        //to get the data ...and use it for calculation
        this.VatPercentage = 0;
        this.VATAmount = 0;
        ////to make the instance ItemMaster with new row
        this.SelectedItem = null;
        this.Item = null;
        this.Code = null;
        this.UOMName = null;
        this.PurchaseOrderItemValidator = null;
        this.IsActive = true;
        var _formBuilder = new forms_1.FormBuilder();
        this.PurchaseOrderItemValidator = _formBuilder.group({
            'ItemId': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'Quantity': ['', forms_1.Validators.compose([forms_1.Validators.required, common_validator_1.CommonValidators.positivenum])],
            'StandardRate': ['', forms_1.Validators.compose([forms_1.Validators.required, common_validator_1.CommonValidators.positivenum])],
            'VatPercentage': ['', forms_1.Validators.compose([forms_1.Validators.required])]
        });
    }
    PurchaseOrderItems.prototype.ngOnInit = function () {
        var _this = this;
        this.PurchaseOrderItemValidator.get('ItemId').valueChanges.subscribe(function () {
            _this.PurchaseOrderItemValidator.updateValueAndValidity();
        });
        this.PurchaseOrderItemValidator.get('Quantity').valueChanges.subscribe(function () {
            _this.PurchaseOrderItemValidator.updateValueAndValidity();
        });
    };
    PurchaseOrderItems.prototype.IsDirty = function (fieldName) {
        if (fieldName == undefined)
            return this.PurchaseOrderItemValidator.dirty;
        else
            return this.PurchaseOrderItemValidator.controls[fieldName].dirty;
    };
    PurchaseOrderItems.prototype.IsValid = function () { if (this.PurchaseOrderItemValidator.valid) {
        return true;
    }
    else {
        return false;
    } };
    PurchaseOrderItems.prototype.IsValidCheck = function (fieldName, validator) {
        if (fieldName == undefined) {
            return this.PurchaseOrderItemValidator.valid;
        }
        else
            return !(this.PurchaseOrderItemValidator.hasError(validator, fieldName));
    };
    return PurchaseOrderItems;
}());
exports.PurchaseOrderItems = PurchaseOrderItems;
//# sourceMappingURL=purchase-order-items.model.js.map