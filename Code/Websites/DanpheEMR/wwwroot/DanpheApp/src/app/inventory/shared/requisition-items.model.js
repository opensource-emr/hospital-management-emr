"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequisitionItems = void 0;
var forms_1 = require("@angular/forms");
var moment = require("moment/moment");
var RequisitionItems = /** @class */ (function () {
    function RequisitionItems() {
        this.RequisitionItemId = 0;
        this.ItemId = null;
        this.Quantity = null;
        this.ReceivedQuantity = 0;
        this.PendingQuantity = 0;
        this.RequisitionId = null;
        this.RequisitionItemStatus = null;
        this.Remark = null;
        this.AuthorizedBy = null;
        this.AuthorizedOn = null;
        this.AuthorizedRemark = null;
        this.CreatedBy = 0;
        this.CreatedOn = moment().format('YYYY-MM-DD');
        this.ModifiedBy = null;
        this.ModifiedOn = null;
        this.IsActive = true;
        this.ReceivedBy = "";
        this.DispatchRemarks = "";
        this.RequisitionItemValidator = null;
        this.RequisitionNo = 0;
        this.IssueNo = null;
        this.MSSNO = null;
        this.IsEdited = false;
        this.IsEditApplicable = true;
        //cancel itm qty
        this.CancelQuantity = 0;
        this.CancelBy = null;
        this.CancelOn = "";
        this.CancelRemarks = "";
        ////to make the instance ItemMaster with new row
        this.SelectedItem = null;
        //ItemName only for display purpose
        this.ItemName = "";
        this.Code = "";
        this.Item = null;
        this.Requisition = null;
        this.RequestedByName = null;
        this.CreatedByName = null;
        this.DispatchedByName = null;
        this.UOMName = null;
        this.Remarks = null; //this is the main remark against requisition.
        this.MatIssueTo = null;
        this.MatIssueDate = null;
        var _formBuilder = new forms_1.FormBuilder();
        this.RequisitionItemValidator = _formBuilder.group({
            'ItemId': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'Quantity': ['', forms_1.Validators.compose([this.positiveNumberValidator])],
        });
    }
    RequisitionItems.prototype.IsDirty = function (fieldName) {
        if (fieldName == undefined)
            return this.RequisitionItemValidator.dirty;
        else
            return this.RequisitionItemValidator.controls[fieldName].dirty;
    };
    RequisitionItems.prototype.IsValid = function () { if (this.RequisitionItemValidator.valid) {
        return true;
    }
    else {
        return false;
    } };
    RequisitionItems.prototype.IsValidCheck = function (fieldName, validator) {
        if (fieldName == undefined) {
            return this.RequisitionItemValidator.valid;
        }
        else
            return !(this.RequisitionItemValidator.hasError(validator, fieldName));
    };
    RequisitionItems.prototype.positiveNumberValidator = function (control) {
        if (control) {
            if (control.value <= 0)
                return { 'invalidNumber': true };
        }
    };
    return RequisitionItems;
}());
exports.RequisitionItems = RequisitionItems;
//# sourceMappingURL=requisition-items.model.js.map