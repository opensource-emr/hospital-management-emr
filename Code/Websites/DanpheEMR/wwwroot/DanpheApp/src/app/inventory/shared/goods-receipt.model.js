"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodsReceipt = void 0;
var forms_1 = require("@angular/forms");
var shared_enums_1 = require("../../shared/shared-enums");
var moment = require("moment/moment");
var GoodsReceipt = /** @class */ (function () {
    function GoodsReceipt() {
        this.GoodsReceiptValidator = null;
        this.VendorName = "";
        this.VendorNo = "";
        this.GRCategory = shared_enums_1.ENUM_GRCategory.Consumables;
        this.IsCancel = false;
        this.FromDate = "";
        this.ToDate = "";
        this.CancelRemarks = "";
        //added for Verification
        this.IsVerificationEnabled = false;
        this.VerifierList = [];
        this.GoodsReceiptID = 0;
        this.GoodsReceiptNo = 0;
        this.GoodsReceiptDate = moment().format('YYYY-MM-DD');
        this.PurchaseOrderId = null;
        this.TotalAmount = 0;
        this.Remarks = "";
        this.CreatedBy = 0;
        this.CreatedOn = null;
        this.VendorId = 0;
        this.FiscalYearId = 0;
        this.CurrentFiscalYear = "";
        this.BillNo = null;
        this.ReceivedDate = moment().format('YYYY-MM-DD HH:MM:ss');
        this.ReceiptNo = null;
        this.OrderDate = null;
        //SubTotal and VATTotal only for caculation and show purpose
        this.SubTotal = 0;
        this.VATTotal = 0;
        this.CcCharge = 0;
        this.Discount = 0;
        this.DiscountAmount = 0;
        this.TDSRate = 0;
        this.TDSAmount = 0;
        this.TotalWithTDS = 0;
        this.PrintCount = 0;
        //public SelectedItem: any = null;//sud:11Apr'20-- this was misused.. hence removing.
        this.CreditPeriod = 0;
        this.OtherCharges = 0;
        this.GoodsReceiptItem = new Array();
        //for other charges
        this.InsuranceCharge = 0;
        this.CarriageFreightCharge = 0;
        this.PackingCharge = 0;
        this.TransportCourierCharge = 0;
        this.OtherCharge = 0;
        //for edit option
        this.IsTransferredToACC = false;
        this.ModifiedBy = null;
        this.ModifiedOn = null;
        var _formBuilder = new forms_1.FormBuilder();
        this.GoodsReceiptValidator = _formBuilder.group({
            //sanjit: 2Apr'20: GoodsReceiptDate somehow throws validation error when use with danphe-date-picker, so it is commented. 
            // 'GoodsReceiptDate': ['', Validators.compose([Validators.required])],
            'BillNo': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'VendorId': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'GRCategory': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'PaymentMode': ['', forms_1.Validators.compose([forms_1.Validators.required])],
        });
    }
    GoodsReceipt.prototype.IsDirty = function (fieldName) {
        if (fieldName == undefined)
            return this.GoodsReceiptValidator.dirty;
        else
            return this.GoodsReceiptValidator.controls[fieldName].dirty;
    };
    GoodsReceipt.prototype.IsValid = function () { if (this.GoodsReceiptValidator.valid) {
        return true;
    }
    else {
        return false;
    } };
    GoodsReceipt.prototype.IsValidCheck = function (fieldName, validator) {
        if (fieldName == undefined) {
            return this.GoodsReceiptValidator.valid;
        }
        else
            return !(this.GoodsReceiptValidator.hasError(validator, fieldName));
    };
    GoodsReceipt.prototype.dateValidator = function (control) {
        //get current date, month and time
        var currDate = moment().format('YYYY-MM-DD');
        //if positive then selected date is of future else it of the past || selected year can't be of future
        if (control.value) {
            if ((moment(control.value).diff(currDate) > 0)
                || (moment(control.value).diff(currDate, 'years') > 1))
                return { 'wrongDate': true };
        }
        else
            return { 'wrongDate': true };
    };
    return GoodsReceipt;
}());
exports.GoodsReceipt = GoodsReceipt;
//# sourceMappingURL=goods-receipt.model.js.map