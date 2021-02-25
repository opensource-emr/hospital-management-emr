"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var labs_bl_service_1 = require("../shared/labs.bl.service");
var messagebox_service_1 = require("../../shared/messagebox/messagebox.service");
var billing_transaction_model_1 = require("../../billing/shared/billing-transaction.model");
var billing_transaction_item_model_1 = require("../../billing/shared/billing-transaction-item.model");
var common_functions_1 = require("../../shared/common.functions");
var moment = require("moment/moment");
var security_service_1 = require("../../security/shared/security.service");
var billing_bl_service_1 = require("../../billing/shared/billing.bl.service");
var billing_service_1 = require("../../billing/shared/billing.service");
var admission_bl_service_1 = require("../../admission/shared/admission.bl.service");
var LabRequestsComponent = /** @class */ (function () {
    function LabRequestsComponent(labBLService, msgBoxServ, securityService, changeDetectorRef, billingBLService, billingService, admissionBLService) {
        this.labBLService = labBLService;
        this.msgBoxServ = msgBoxServ;
        this.securityService = securityService;
        this.changeDetectorRef = changeDetectorRef;
        this.billingBLService = billingBLService;
        this.billingService = billingService;
        this.admissionBLService = admissionBLService;
        this.showLabRequestsPage = true;
        this.showpatientsearch = false;
        this.selectedItems = [];
        this.billingType = "inpatient";
        this.loading = false;
        this.isInitialWarning = true;
        this.showIpBillingWarningBox = false;
        this.taxId = 0;
        this.currBillingContext = null;
        this.currPatVisitContext = null;
        //sud: 13May'18--to display patient bill summary
        this.patBillHistory = {
            IsLoaded: false,
            PatientId: null,
            CreditAmount: null,
            ProvisionalAmt: null,
            TotalDue: null,
            DepositBalance: null,
            BalanceAmount: null
        };
        this.billingCounterId = 0; //sud: 13Sept'18
        this.callBackRequestLabItem = new core_1.EventEmitter();
        this.GetInpatientlist();
        this.GetLabItems();
        this.GetBillingCounterForLab(); //sud: 13Sept'18
    }
    LabRequestsComponent.prototype.GetBillingCounterForLab = function () {
        var _this = this;
        this.billingBLService.GetAllBillingCounters()
            .subscribe(function (res) {
            if (res.Status == "OK") {
                var allBilCntrs = res.Results;
                var labCntr = allBilCntrs.find(function (cnt) { return cnt.CounterType == "LAB"; });
                if (labCntr) {
                    _this.billingCounterId = labCntr.CounterId;
                    //if (this.billingTransaction && this.billingTransaction.BillingTransactionItems && this.billingTransaction.BillingTransactionItems.length > 0) {
                    //    this.billingTransaction.BillingTransactionItems.forEach(itm => {
                    //        itm.CounterId = this.billingCounterId;
                    //    });
                    //}
                }
            }
        }, function (err) {
            _this.msgBoxServ.showMessage("error", ["Some error occured, please try again later."]);
            console.log(err.ErrorMessage);
        });
    };
    LabRequestsComponent.prototype.ngOnInit = function () {
        this.Initialize();
    };
    Object.defineProperty(LabRequestsComponent.prototype, "ShowLabRequisition", {
        set: function (value) {
            this.showLabRequestsPage = value;
            if (this.showLabRequestsPage) {
                this.Initialize();
            }
        },
        enumerable: true,
        configurable: true
    });
    LabRequestsComponent.prototype.Initialize = function () {
        var _this = this;
        // console.log(this.selectedPatient);
        //Needs some review and discussion on it
        if (this.selectedPatient) {
            this.labBLService.GetDataOfInPatient(this.selectedPatient.PatientId, this.selectedPatient.PatientVisitId)
                .subscribe(function (res) {
                if (res.Status == "OK" && res.Results.Current_WardBed) {
                    _this.currPatVisitContext = res.Results;
                    _this.InitAllData();
                }
                else {
                    _this.msgBoxServ.showMessage("failed", ["Problem! Cannot get the Current Visit Context ! "]);
                }
            }, function (err) { console.log(err.ErrorMessage); });
        }
    };
    LabRequestsComponent.prototype.InitAllData = function () {
        this.patBillHistory = null;
        this.selectedItems = [];
        this.visitList = [];
        this.isInitialWarning = true;
        this.showIpBillingWarningBox = false;
        this.billingTransaction = new billing_transaction_model_1.BillingTransaction();
        this.AddNewBillTxnItemRow();
        this.taxId = this.billingService.taxId;
        if (this.selectedPatient) {
            this.PatientChanged();
        }
    };
    LabRequestsComponent.prototype.Makerequests = function () {
        this.selectedItems = [];
        this.billingTransaction = new billing_transaction_model_1.BillingTransaction();
        this.AddNewBillTxnItemRow();
    };
    LabRequestsComponent.prototype.AddNewBillTxnItemRow = function (index) {
        if (index === void 0) { index = null; }
        var item = new billing_transaction_item_model_1.BillingTransactionItem();
        item.EnableControl("Price", false);
        item.Quantity = 1;
        item.BillStatus = "provisional";
        item.BillingType = "inpatient"; // please remove this hardcode
        item.VisitType = "inpatient"; //hard-coded since this is only used for Inpatient.. need to change if we enable this for Outpatient as well.
        this.billingTransaction.BillingTransactionItems.push(item);
        if (index != null) {
            var new_index_1 = index + 1;
            window.setTimeout(function () {
                document.getElementById('items-box' + new_index_1).focus();
            }, 0);
        }
    };
    LabRequestsComponent.prototype.deleteRow = function (index) {
        this.billingTransaction.BillingTransactionItems.splice(index, 1);
        this.selectedItems.splice(index, 1);
        if (index == 0 && this.billingTransaction.BillingTransactionItems.length == 0) {
            this.AddNewBillTxnItemRow();
            this.changeDetectorRef.detectChanges();
        }
        this.Calculationforall();
    };
    LabRequestsComponent.prototype.AssignSelectedItem = function (index) {
        var _this = this;
        var item = null;
        // check if user has given proper input string for item name
        //or has selected object properly from the dropdown list.
        if (this.selectedItems[index]) {
            if (typeof (this.selectedItems[index]) == 'string' && this.labBillItems.length) {
                item = this.labBillItems.find(function (a) { return a.ItemName.toLowerCase() == _this.selectedItems[index].toLowerCase(); });
            }
            else if (typeof (this.selectedItems[index]) == 'object')
                item = this.selectedItems[index];
            if (item) {
                if (this.billingType.toLowerCase() != "inpatient") {
                    var extItem = this.labBillItems.find(function (a) { return a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId; });
                    var extItemIndex = this.labBillItems.findIndex(function (a) { return a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId; });
                    if (extItem && index != extItemIndex) {
                        this.msgBoxServ.showMessage("failed", [item.ItemName + " is already entered."]);
                        this.changeDetectorRef.detectChanges();
                        this.billingTransaction.BillingTransactionItems[index].IsDuplicateItem = true;
                    }
                    else
                        this.billingTransaction.BillingTransactionItems[index].IsDuplicateItem = false;
                }
                this.billingTransaction.BillingTransactionItems[index].ItemId = item.ItemId;
                this.billingTransaction.BillingTransactionItems[index].ItemName = item.ItemName;
                this.billingTransaction.BillingTransactionItems[index].TaxPercent = 0;
                this.billingTransaction.BillingTransactionItems[index].IsTaxApplicable = item.TaxApplicable;
                //this.model.BillingTransactionItems[index].TaxableAmount = item.TaxApplicable ? item.Price : 0;
                this.billingTransaction.BillingTransactionItems[index].Price = item.Price;
                this.billingTransaction.BillingTransactionItems[index].ProcedureCode = item.ProcedureCode;
                //add also the servicedepartmentname property of the item; needed since most of the filtering happens on this value
                this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentName = item.ServiceDepartmentName;
                this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId = item.ServiceDepartmentId;
                this.billingTransaction.BillingTransactionItems[index].BillingTransactionItemValidator.controls['ServiceDepartmentId'].setValue(item.ServiceDepartmentId);
                this.billingTransaction.BillingTransactionItems[index].IsValidSelDepartment = true;
                this.billingTransaction.BillingTransactionItems[index].IsValidSelItemName = true;
                this.billingTransaction.BillingTransactionItems[index].VisitType = "inpatient"; //this is hardcoded since it is IP billing.
                this.Calculationforall();
            }
            else
                this.billingTransaction.BillingTransactionItems[index].IsValidSelItemName = false;
        }
    };
    //-------------- implementing individual discount from the total discount percentahe----------
    LabRequestsComponent.prototype.Calculationforall = function () {
        if (this.billingTransaction.BillingTransactionItems.length) {
            var DP = 0; //discountPercent for the model (aggregate total) 
            var Dp = 0; // discountPercent for individual item
            var totalTax = 0;
            var loopTax = 0;
            var SubTotal = 0;
            var totalAmount = 0;
            var totalAmountAgg = 0;
            var totalQuantity = 0;
            var subtotal = 0;
            var calsubtotal = 0;
            var subtotalfordiscountamount = 0;
            DP = this.billingTransaction.DiscountPercent;
            var successiveDiscount = 0;
            var totalAmountforDiscountAmount = 0;
            var DiscountAgg = 0;
            //-------------------------------------------------------------------------------------------------------------------------------
            for (var i = 0; i < this.billingTransaction.BillingTransactionItems.length; i++) {
                var curRow = this.billingTransaction.BillingTransactionItems[i];
                Dp = curRow.DiscountPercent;
                curRow.DiscountPercentAgg = Dp;
                curRow.Price = common_functions_1.CommonFunctions.parseAmount(curRow.Price);
                subtotal = (curRow.Quantity * curRow.Price); //100
                curRow.SubTotal = common_functions_1.CommonFunctions.parseAmount(subtotal);
                var DiscountedAmountItem = (subtotal - (Dp / 100) * subtotal); //Discounted Amount for individual Item 
                var DiscountedAmountTotal = (DiscountedAmountItem - DP * DiscountedAmountItem / 100); // Discounted Amount From the Total Discount
                var tax = (curRow.TaxPercent / 100 * (DiscountedAmountTotal));
                curRow.Tax = common_functions_1.CommonFunctions.parseAmount(tax);
                if (DP) {
                    successiveDiscount = ((100 - Dp) / 100 * (100 - DP) / 100 * subtotal);
                    var successiveDiscountAmount = successiveDiscount + curRow.TaxPercent / 100 * successiveDiscount;
                    DiscountAgg = ((subtotal - successiveDiscountAmount) + curRow.Tax) * 100 / subtotal;
                    //curRow.DiscountPercentAgg = (Math.round(DiscountAgg * 100) / 100);
                    curRow.DiscountAmount = common_functions_1.CommonFunctions.parseAmount(curRow.DiscountPercentAgg * subtotal / 100);
                    curRow.DiscountPercentAgg = common_functions_1.CommonFunctions.parseAmount(DiscountAgg);
                }
                loopTax = (curRow.TaxPercent * (subtotal / 100));
                //calsubtotal = calsubtotal + subtotal + loopTax;
                calsubtotal = calsubtotal + subtotal;
                totalTax = totalTax + loopTax;
                var DiscountedAmountTotalAgg = (DiscountedAmountItem - DP * DiscountedAmountItem / 100);
                totalAmountAgg = DiscountedAmountTotalAgg + curRow.Tax;
                totalAmount = DiscountedAmountTotal + curRow.Tax;
                curRow.TotalAmount = common_functions_1.CommonFunctions.parseAmount(totalAmount);
                totalAmountforDiscountAmount = totalAmountforDiscountAmount + curRow.TotalAmount;
                SubTotal = SubTotal + totalAmountAgg;
                var CurQuantity = curRow.Quantity;
                totalQuantity = Number(totalQuantity) + Number(CurQuantity);
                subtotalfordiscountamount = subtotalfordiscountamount + subtotal;
                curRow.DiscountAmount = common_functions_1.CommonFunctions.parseAmount(subtotal - DiscountedAmountTotal);
                //if tax not applicable then taxable amount will be zero. else: taxable amount = total-discount. 
                //opposite logic for NonTaxableAmount
                curRow.TaxableAmount = curRow.IsTaxApplicable ? (curRow.SubTotal - curRow.DiscountAmount) : 0; //added: sud: 29May'18
                curRow.NonTaxableAmount = curRow.IsTaxApplicable ? 0 : (curRow.SubTotal - curRow.DiscountAmount); //added: sud: 29May'18
            }
            this.billingTransaction.SubTotal = common_functions_1.CommonFunctions.parseAmount(calsubtotal);
            this.billingTransaction.TotalQuantity = common_functions_1.CommonFunctions.parseAmount(totalQuantity);
            this.billingTransaction.DiscountAmount = common_functions_1.CommonFunctions.parseAmount(DiscountAgg * (this.billingTransaction.SubTotal) / 100);
            //this.model.DiscountAmount = Math.round(((this.model.SubTotal - totalAmountforDiscountAmount) * 100) / 100);
            //this.model.DiscountPercent = this.model.SubTotal != 0 ? Math.round(((this.model.DiscountAmount * 100) / this.model.SubTotal) * 1) / 1 : this.model.DiscountPercent;
            this.billingTransaction.TotalAmount = common_functions_1.CommonFunctions.parseAmount(SubTotal);
            this.billingTransaction.TaxTotal = common_functions_1.CommonFunctions.parseAmount(totalTax);
        }
        else {
            this.billingTransaction.SubTotal = 0;
            this.billingTransaction.TotalAmount = 0;
            this.billingTransaction.DiscountAmount = 0;
            this.billingTransaction.DiscountPercent = 0;
            this.billingTransaction.TotalQuantity = 0;
        }
    };
    //-------------- implementing individual discount from the total discount percentage----------
    LabRequestsComponent.prototype.GetLabItems = function () {
        var _this = this;
        this.labBLService.GetLabBillingItems()
            .subscribe(function (res) {
            if (res.Status == "OK") {
                _this.labBillItems = res.Results;
            }
            else {
                _this.msgBoxServ.showMessage("failed", ["Unable to get lab items."]);
            }
        });
    };
    LabRequestsComponent.prototype.GetInpatientlist = function () {
        var _this = this;
        this.admissionBLService.GetAdmittedPatients()
            .subscribe(function (res) {
            if (res.Status == 'OK') {
                _this.inpatientList = res.Results;
                _this.inpatientList = _this.inpatientList.slice();
            }
            else {
                _this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            }
        }, function (err) {
            _this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
        });
    };
    LabRequestsComponent.prototype.PatientChanged = function () {
        this.patBillHistory = null;
        if (this.selectedPatient && this.selectedPatient.PatientId) {
            this.LoadPatientPastBillSummary(this.selectedPatient.PatientId);
            this.GetPatientVisitList(this.selectedPatient.PatientId);
            this.LoadPatientBillingContext(this.selectedPatient.PatientId);
        }
        else {
            this.msgBoxServ.showMessage("notice-message", ["Please select patient from the list"]);
        }
    };
    LabRequestsComponent.prototype.GetPatientVisitList = function (patientId) {
        var _this = this;
        this.labBLService.GetPatientVisitsProviderWise(patientId)
            .subscribe(function (res) {
            if (res.Status == 'OK') {
                if (res.Results.length) {
                    _this.visitList = res.Results;
                }
                else {
                    console.log(res.ErrorMessage);
                }
            }
        }, function (err) {
            _this.msgBoxServ.showMessage('Failed', ["unable to get PatientVisit list.. check log for more details."]);
            console.log(err.ErrorMessage);
        });
    };
    LabRequestsComponent.prototype.ItemsListFormatter = function (data) {
        var html = data["ServiceDepartmentShortName"] + "-" + data["BillItemPriceId"] + "&nbsp;&nbsp;" + data["ItemName"] + "&nbsp;&nbsp;";
        html += "(<i>" + data["ServiceDepartmentName"] + "</i>)" + "&nbsp;&nbsp;" + "RS." + data["Price"];
        return html;
    };
    LabRequestsComponent.prototype.CloseLabRequestsPage = function () {
        this.showLabRequestsPage = false;
    };
    //used to format display of item in ng-autocomplete
    LabRequestsComponent.prototype.patientListFormatter = function (data) {
        var html = data["ShortName"] + ' [ ' + data['PatientCode'] + ' ]';
        return html;
    };
    LabRequestsComponent.prototype.SetVisitDetailToTransaction = function () {
        var _this = this;
        if (this.visitList && this.visitList.length) {
            this.billingTransaction.BillingTransactionItems.forEach(function (billItem) {
                billItem.PatientVisitId = _this.visitList[0].PatientVisitId;
                billItem.BillingTransactionItemValidator.controls['RequestedBy'].setValue(_this.visitList[0].ProviderId);
                billItem.RequestedBy = _this.visitList[0].ProviderId;
                billItem.PatientId = _this.selectedPatient.PatientId;
                billItem.PatientVisitId = _this.selectedPatient.PatientVisitId;
            });
        }
    };
    LabRequestsComponent.prototype.SubmitBillingTransaction = function () {
        var _this = this;
        //this.loading is set to true from the HTML. to handle double-Click.
        //check if there's other better alternative. till then let it be.. --sud:23Jan'18
        if (this.loading) {
            //set loading=true so that the butotn will be disabled to avoid Double-Click 
            ///Its COMPULSORY to disable : DON'T CHANGE THIS -- sud: 21Jan2018
            this.loading = true;
            //console.log("-----Submit Clicked----");
            var isFormValid = true;
            this.SetVisitDetailToTransaction();
            for (var j = 0; j < this.billingTransaction.BillingTransactionItems.length; j++) {
                if (this.billingTransaction.BillingTransactionItems[j].Price < 0) {
                    this.msgBoxServ.showMessage("error", ["The price of some items is less than zero "]);
                    this.loading = false;
                    break;
                }
                if (this.billingTransaction.BillingTransactionItems) {
                    for (var i = 0; i < this.billingTransaction.BillingTransactionItems.length; i++) {
                        var currTxnItm = this.billingTransaction.BillingTransactionItems[i];
                        currTxnItm.EnableControl("Price", false);
                        for (var valCtrls in currTxnItm.BillingTransactionItemValidator.controls) {
                            currTxnItm.BillingTransactionItemValidator.controls[valCtrls].markAsDirty();
                            currTxnItm.BillingTransactionItemValidator.controls[valCtrls].updateValueAndValidity();
                        }
                    }
                    for (var i = 0; i < this.billingTransaction.BillingTransactionItems.length; i++) {
                        var currTxnItm_1 = this.billingTransaction.BillingTransactionItems[i];
                        //break loop if even a single txn item is invalid.
                        if (!currTxnItm_1.IsValid(undefined, undefined)) {
                            isFormValid = false;
                            break;
                        }
                    }
                }
                else {
                    isFormValid = false;
                }
                if (isFormValid) {
                    for (var j = 0; j < this.billingTransaction.BillingTransactionItems.length; j++) {
                        this.billingTransaction.BillingTransactionItems[j].CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
                        this.billingTransaction.BillingTransactionItems[j].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                        //here default counter for lab will be set..
                        //need to change if we have to activate counters for labs as well..
                        this.billingTransaction.BillingTransactionItems[j].CounterId = this.billingCounterId;
                        //this.billingTransaction.BillingTransactionItems[j].CounterId = this.securityService.getLoggedInCounter().CounterId;
                        //Move counterday to server once CounterFeature is added change--sudarshan:25July 
                        this.billingTransaction.BillingTransactionItems[j].CounterDay = moment().format("YYYY-MM-DD");
                        var visit = this.visitList.find(function (a) { return a.ProviderId == _this.billingTransaction.BillingTransactionItems[j].RequestedBy; });
                        if (visit)
                            this.billingTransaction.BillingTransactionItems[j].PatientVisitId = visit.PatientVisitId;
                    }
                    this.billingTransaction.TaxId = this.taxId;
                    this.PostToDepartmentRequisition(this.billingTransaction.BillingTransactionItems);
                }
                else {
                    this.loading = false;
                }
            }
        }
    };
    //posts to Departments Requisition Table
    LabRequestsComponent.prototype.PostToDepartmentRequisition = function (billTxnItems) {
        var _this = this;
        //orderstatus="active" and billingStatus="paid" when sent from billingpage.
        this.billingBLService.PostDepartmentOrders(billTxnItems, "active", "provisional", this.currPatVisitContext)
            .subscribe(function (res) {
            if (res.Status == "OK") {
                _this.PostToBillingTransaction(res.Results);
            }
            else {
                _this.loading = false;
                _this.msgBoxServ.showMessage("failed", ["Unable to do lab request.Please try again later"]);
                console.log(res.ErrorMessage);
            }
        });
    };
    LabRequestsComponent.prototype.PostToBillingTransaction = function (billTxnItems) {
        var _this = this;
        this.AssignReqDeptNBillingType(billTxnItems);
        this.billingBLService.PostBillingTransactionItems(billTxnItems)
            .subscribe(function (res) {
            if (res.Status == "OK") {
                _this.Makerequests();
                _this.callBackRequestLabItem.emit();
                _this.msgBoxServ.showMessage("success", ["Lab IP request added successfully!"]);
                _this.loading = false;
            }
            else {
                _this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                _this.loading = false;
            }
        });
    };
    LabRequestsComponent.prototype.CheckAndSubmitBillingTransaction = function () {
        // at the time of submission, this is not initial warning.
        this.isInitialWarning = false;
        if (this.CheckSelectionFromAutoComplete() && this.CheckIsValidIpBilling()) {
            this.SubmitBillingTransaction();
        }
    };
    LabRequestsComponent.prototype.CheckSelectionFromAutoComplete = function () {
        if (this.billingTransaction.BillingTransactionItems.length) {
            for (var _i = 0, _a = this.billingTransaction.BillingTransactionItems; _i < _a.length; _i++) {
                var itm = _a[_i];
                if (!itm.IsValidSelDepartment) {
                    this.msgBoxServ.showMessage("failed", ["Invalid Department. Please select Department from the list."]);
                    this.loading = false;
                    return false;
                }
                if (!this.selectedPatient || !this.selectedPatient.PatientId) {
                    this.msgBoxServ.showMessage("failed", ["Invalid Patient. Please select Patient from the list."]);
                    this.loading = false;
                    return false;
                }
            }
            return true;
        }
    };
    LabRequestsComponent.prototype.CheckIsValidIpBilling = function () {
        var isValid = true;
        if (this.billingType.toLowerCase() == "inpatient") {
            if (this.isInitialWarning && this.patBillHistory.BalanceAmount <= 0) {
                isValid = false;
                this.showIpBillingWarningBox = true;
            }
            else if (this.patBillHistory.BalanceAmount < this.billingTransaction.TotalAmount) {
                isValid = false;
                this.showIpBillingWarningBox = true;
            }
        }
        return isValid;
    };
    LabRequestsComponent.prototype.CloseIpWarningPopUp = function () {
        if (this.isInitialWarning)
            this.showLabRequestsPage = false;
        else {
            this.showIpBillingWarningBox = false;
            this.loading = false;
        }
    };
    LabRequestsComponent.prototype.ProceedWithoutDeposit = function () {
        this.showIpBillingWarningBox = false;
        //if this is not initial warning, we've to prceed to submit billing transaction.
        if (!this.isInitialWarning) {
            this.SubmitBillingTransaction();
        }
    };
    LabRequestsComponent.prototype.AssignReqDeptNBillingType = function (billTxnItems) {
        var _this = this;
        var requestingDeptId = null;
        requestingDeptId = this.currBillingContext.RequestingDeptId;
        if (billTxnItems && billTxnItems.length > 0) {
            billTxnItems.forEach(function (itm) {
                itm.RequestingDeptId = requestingDeptId;
                itm.BillingType = _this.billingService.BillingType;
            });
        }
    };
    LabRequestsComponent.prototype.LoadPatientBillingContext = function (patientId) {
        var _this = this;
        this.billingBLService.GetPatientBillingContext(patientId)
            .subscribe(function (res) {
            if (res.Status == "OK") {
                _this.currBillingContext = res.Results;
                _this.billingService.BillingType = _this.currBillingContext.BillingType;
                _this.billingType = _this.currBillingContext.BillingType;
            }
        });
    };
    LabRequestsComponent.prototype.LoadPatientPastBillSummary = function (patientId) {
        var _this = this;
        this.billingBLService.GetPatientPastBillSummary(patientId)
            .subscribe(function (res) {
            if (res.Status == "OK") {
                _this.patBillHistory = res.Results;
                _this.patBillHistory.ProvisionalAmt = common_functions_1.CommonFunctions.parseAmount(_this.patBillHistory.ProvisionalAmt);
                _this.patBillHistory.BalanceAmount = common_functions_1.CommonFunctions.parseAmount(_this.patBillHistory.BalanceAmount);
                _this.patBillHistory.DepositBalance = common_functions_1.CommonFunctions.parseAmount(_this.patBillHistory.DepositBalance);
                _this.patBillHistory.CreditAmount = common_functions_1.CommonFunctions.parseAmount(_this.patBillHistory.CreditAmount);
                _this.patBillHistory.TotalDue = common_functions_1.CommonFunctions.parseAmount(_this.patBillHistory.TotalDue);
                _this.patBillHistory.IsLoaded = true;
                // at the time of submission, this is not initial warning.
                _this.isInitialWarning = true;
                _this.CheckIsValidIpBilling();
            }
            else {
                _this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                _this.loading = false;
            }
        });
    };
    __decorate([
        core_1.Input("selecteditems"),
        __metadata("design:type", Object)
    ], LabRequestsComponent.prototype, "selectedPatient", void 0);
    __decorate([
        core_1.Output("callback-request-labitem"),
        __metadata("design:type", core_1.EventEmitter)
    ], LabRequestsComponent.prototype, "callBackRequestLabItem", void 0);
    __decorate([
        core_1.Input("showlabrequisition"),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], LabRequestsComponent.prototype, "ShowLabRequisition", null);
    LabRequestsComponent = __decorate([
        core_1.Component({
            selector: 'lab-requests',
            templateUrl: '/app/labs/lab-requests/lab-requests.html'
        }),
        __metadata("design:paramtypes", [labs_bl_service_1.LabsBLService,
            messagebox_service_1.MessageboxService,
            security_service_1.SecurityService,
            core_1.ChangeDetectorRef,
            billing_bl_service_1.BillingBLService,
            billing_service_1.BillingService, admission_bl_service_1.AdmissionBLService])
    ], LabRequestsComponent);
    return LabRequestsComponent;
}());
exports.LabRequestsComponent = LabRequestsComponent;
//# sourceMappingURL=lab-requests.component.js.map