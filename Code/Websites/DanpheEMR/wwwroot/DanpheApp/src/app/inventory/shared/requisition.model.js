"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Requisition = void 0;
var forms_1 = require("@angular/forms");
var moment = require("moment/moment");
var Requisition = /** @class */ (function () {
    function Requisition() {
        this.RequisitionId = 0;
        this.StoreId = null;
        this.DepartmentId = null;
        this.RequisitionDate = moment().format();
        this.RequisitionStatus = null;
        this.RequisitionNo = 0;
        this.IssueNo = null;
        this.CreatedBy = 0;
        this.CreatedOn = moment().format('YYYY-MM-DD');
        this.ModifiedBy = null;
        this.ModifiedOn = null;
        this.CancelRemarks = null;
        this.RequisitionValidator = null;
        this.MSSNO = null;
        this.StoreName = ""; //for displaying and data manipulation purpose : sanjit 31Mar'2020
        this.CurrentVerificationLevelCount = 0; //for displaying and data manipulation purpose : sanjit 31Mar'2020
        this.CurrentVerificationLevel = 0; //for displaying and data manipulation purpose : sanjit 31Mar'2020
        this.MaxVerificationLevel = 0; //for displaying and data manipulation purpose : sanjit 31Mar'2020
        this.PermissionId = 0; //for displaying and data manipulation purpose : sanjit 31Mar'2020
        this.isVerificationAllowed = false; //for authorization purpose : sanjit 6Apr'2020
        this.VerificationStatus = null; //for filtering purpose : sanjit 14Apr'2020
        this.RequisitionItems = new Array();
        this.CancelledItems = new Array(); //this is used for cancellation.
        this.canDispatchItem = false;
        this.isReceiveItemsEnabled = false;
        this.NewDispatchAvailable = false;
        var _formBuilder = new forms_1.FormBuilder();
        this.RequisitionValidator = _formBuilder.group({
            'StoreId': ['', forms_1.Validators.compose([forms_1.Validators.required])]
        });
    }
    Requisition.prototype.IsDirty = function (fieldName) {
        if (fieldName == undefined)
            return this.RequisitionValidator.dirty;
        else
            return this.RequisitionValidator.controls[fieldName].dirty;
    };
    Requisition.prototype.IsValid = function () { if (this.RequisitionValidator.valid) {
        return true;
    }
    else {
        return false;
    } };
    Requisition.prototype.IsValidCheck = function (fieldName, validator) {
        if (fieldName == undefined) {
            return this.RequisitionValidator.valid;
        }
        else
            return !(this.RequisitionValidator.hasError(validator, fieldName));
    };
    return Requisition;
}());
exports.Requisition = Requisition;
//# sourceMappingURL=requisition.model.js.map