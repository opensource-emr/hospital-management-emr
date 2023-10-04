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
var messagebox_service_1 = require("../../shared/messagebox/messagebox.service");
var billing_transaction_model_1 = require("../../billing/shared/billing-transaction.model");
var billing_transaction_item_model_1 = require("../../billing/shared/billing-transaction-item.model");
var moment = require("moment/moment");
var security_service_1 = require("../../security/shared/security.service");
var billing_bl_service_1 = require("../../billing/shared/billing.bl.service");
var billing_service_1 = require("../../billing/shared/billing.service");
var labs_bl_service_1 = require("../../labs/shared/labs.bl.service");
var core_service_1 = require("../../core/shared/core.service");
var NursingIpBillItemRequestComponent = /** @class */ (function () {
    function NursingIpBillItemRequestComponent(labBLService, msgBoxServ, securityService, changeDetectorRef, billingBLService, billingService, coreService) {
        this.labBLService = labBLService;
        this.msgBoxServ = msgBoxServ;
        this.securityService = securityService;
        this.changeDetectorRef = changeDetectorRef;
        this.billingBLService = billingBLService;
        this.billingService = billingService;
        this.coreService = coreService;
        this.showPatientSearch = false;
        this.emitBillItemReq = new core_1.EventEmitter();
        this.showIpBillRequest = true;
        this.department = null;
        //master data
        this.billItems = [];
        this.doctorsList = [];
        //seleted items
        this.selectedItems = [];
        this.selectedServDepts = [];
        this.selectedAssignedToDr = [];
        this.selectedRequestedByDr = [];
        this.billingType = "inpatient";
        this.loading = false;
        this.taxDetail = { taxPercent: 0, taxId: 0 };
        this.currBillingContext = null;
        this.nursingCounterId = null;
        this.currPatVisitContext = null;
        //----end: add/delete rows-----
        //start: mandatory doctor validations
        ///sudarshan/dinesh: 28June2017-- for Dynamic validation according to current service department and their items
        //Create a Map of service departments with its mandatory/nonmandatory attribute and its exclusion items..
        this.srvDeptValidationMap = [{ ServDeptName: "USG", IsMandatory: true, ExcludedItems: [] },
            { ServDeptName: "CT Scan", IsMandatory: true, ExcludedItems: [] },
            {
                ServDeptName: "Dental", IsMandatory: false,
                ExcludedItems: ['[1] IOPAR (x-Ray)', '[2A] Dental extractions (Permanent)', '[4A] Scaling and Polishing (Gross)', '[4B] Scaling and Polishing (Deep)']
            },
            { ServDeptName: "ULTRASOUND", IsMandatory: true, ExcludedItems: [] },
            { ServDeptName: "ULTRASOUND COLOR DOPPLER", IsMandatory: true, ExcludedItems: [] },
            { ServDeptName: "NON INVASIVE CARDIO VASCULAR INVESTIGATIONS", IsMandatory: true, ExcludedItems: [] },
            { ServDeptName: "PHYSIOTHERAPY", IsMandatory: true, ExcludedItems: [] },
            { ServDeptName: "General Surgery Charges", IsMandatory: false, ExcludedItems: ['PAC'] },
            { ServDeptName: "Lab", IsMandatory: false, ExcludedItems: ['PAP Smear'] },
            { ServDeptName: "Ortho Procedures", IsMandatory: false, ExcludedItems: ['Plaster A (lower Extremity)', 'Injection Steroid'] },
            { ServDeptName: "Biopsy", IsMandatory: false, ExcludedItems: ['B 5-10 blocks', 'C Single Block Gallbladder,small lumps'] },
            { ServDeptName: "OBS/GYN Surgery", IsMandatory: false, ExcludedItems: ['Hydrotobation'] },
            { ServDeptName: "OT", IsMandatory: true, ExcludedItems: ['OT Theatre Charge'] },
            {
                ServDeptName: "Other", IsMandatory: false,
                ExcludedItems: ['Dressing Charge (Large)',
                    'Dressing Charge (Medium)',
                    'Dressing Charge (Small)',
                    'Endoscopy',
                    'General Round Charge',
                    'ICU  Round Charge (New)',
                    'ICU Round Charge',
                    'Procedure Charge',
                    'Suture out',
                    'Sututre In (Large)',
                    'Sututre In (small)',
                    'Colonoscopy',
                    'Intubation Charge'
                ]
            }
        ];
        this.billingTransaction = new billing_transaction_model_1.BillingTransaction();
        this.serviceDeptList = this.coreService.Masters.ServiceDepartments;
        this.serviceDeptList = this.serviceDeptList.filter(function (a) { return a.ServiceDepartmentName != "OPD"; });
        this.GetInpatientlist();
        //instead of Using in OnInit Component is initiated from inside  this function by calling InitiateComponent function
        this.GetDoctorsList();
    }
    NursingIpBillItemRequestComponent.prototype.ngOnInit = function () {
        var _this = this;
        //Asynchronous (incase if user )
        if (this.patientId && this.visitId) {
            this.labBLService.GetDataOfInPatient(this.patientId, this.visitId)
                .subscribe(function (res) {
                if (res.Status == "OK") {
                    _this.currPatVisitContext = res.Results;
                }
                else {
                    _this.msgBoxServ.showMessage("failed", ["Problem! Cannot get the Current Visit Context ! "]);
                }
            });
        }
        this.billItems = this.billItems.filter(function (val) { return val.ServiceDepartmentName != "EMERGENCY"; });
        this.GetBillingCounterForNursing();
    };
    NursingIpBillItemRequestComponent.prototype.GetBillingCounterForNursing = function () {
        var _this = this;
        this.billingBLService.GetAllBillingCounters()
            .subscribe(function (res) {
            if (res.Status == "OK") {
                var allBilCntrs = res.Results;
                var nursingCounter = allBilCntrs.find(function (cnt) { return cnt.CounterType == "NURSING"; });
                if (nursingCounter) {
                    _this.nursingCounterId = nursingCounter.CounterId;
                }
            }
        }, function (err) {
            _this.msgBoxServ.showMessage("error", ["Some error occured, please try again later."]);
            console.log(err.ErrorMessage);
        });
    };
    NursingIpBillItemRequestComponent.prototype.InitiateComponent = function () {
        this.selectedItems = [];
        this.selectedAssignedToDr = [];
        this.selectedServDepts = [];
        this.selectedRequestedByDr = [];
        this.visitList = [];
        this.AddNewBillTxnItemRow();
        this.LoadPatientBillingContext(this.patientId);
        this.GetPatientVisitList(this.patientId);
    };
    NursingIpBillItemRequestComponent.prototype.SubmitBillingTransaction = function () {
        //this.loading is set to true from the HTML. to handle double-Click.
        //check if there's other better alternative. till then let it be.. --sud:23Jan'18
        if (this.loading) {
            //set loading=true so that the butotn will be disabled to avoid Double-Click 
            ///Its COMPULSORY to disable : DON'T CHANGE THIS -- sud: 21Jan2018
            this.loading = true;
            this.SetBillingTxnDetails();
            if (this.CheckValidations()) {
                this.PostToDepartmentRequisition();
            }
            else {
                this.loading = false;
            }
        }
    };
    NursingIpBillItemRequestComponent.prototype.SetBillingTxnDetails = function () {
        var _this = this;
        var currentVisit = this.visitList.find(function (visit) { return visit.PatientVisitId == _this.visitId; });
        this.billingTransaction.BillingTransactionItems.forEach(function (txnItem) {
            txnItem.PatientVisitId = _this.visitId;
            //txnItem.RequestedBy = currentVisit ? currentVisit.ProviderId : null;
            //txnItem.BillingTransactionItemValidator.controls['RequestedBy'].setValue(txnItem.RequestedBy);
            txnItem.PatientId = _this.patientId;
            txnItem.CounterId = _this.nursingCounterId;
            txnItem.RequestingDeptId = _this.currBillingContext ? _this.currBillingContext.RequestingDeptId : null;
            txnItem.BillingType = 'inpatient';
            txnItem.VisitType = 'inpatient'; //If we use this for OutPatient Then We must modify it dynamically 
            txnItem.BillStatus = "provisional";
            txnItem.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
            txnItem.CreatedBy = _this.securityService.GetLoggedInUser().EmployeeId;
            txnItem.CounterDay = moment().format("YYYY-MM-DD");
            txnItem.SubTotal = txnItem.Price * txnItem.Quantity;
            txnItem.DiscountAmount = 0;
            txnItem.DiscountPercent = 0;
            txnItem.DiscountPercentAgg = 0;
            txnItem.TotalAmount = txnItem.SubTotal - txnItem.DiscountAmount;
            txnItem.TaxPercent = 0;
            var taxInfo1 = _this.coreService.Parameters.find(function (a) { return a.ParameterName == 'TaxInfo'; });
            if (taxInfo1) {
                var taxInfoStr = taxInfo1.ParameterValue;
                var taxInfo = JSON.parse(taxInfoStr);
                txnItem.TaxPercent = taxInfo.TaxPercent;
                _this.taxDetail.taxId = taxInfo.TaxId;
                //this.taxName = taxInfo.TaxName;
                //this.taxLabel = taxInfo.TaxLabel;
                //this.taxPercent = taxInfo.TaxPercent;               
            }
            _this.billingTransaction.TaxId = _this.taxDetail.taxId;
            if (txnItem.IsTaxApplicable) {
                txnItem.TaxableAmount = txnItem.TotalAmount;
                txnItem.NonTaxableAmount = 0;
                txnItem.Tax = txnItem.TotalAmount * (txnItem.TaxPercent / 100);
            }
            else {
                txnItem.TaxableAmount = 0;
                txnItem.NonTaxableAmount = txnItem.TotalAmount;
            }
        });
    };
    NursingIpBillItemRequestComponent.prototype.CheckValidations = function () {
        var isFormValid = true;
        if (this.patientId && this.visitId) {
            if (this.CheckSelectionFromAutoComplete() && this.billingTransaction.BillingTransactionItems.length) {
                for (var i = 0; i < this.billingTransaction.BillingTransactionItems.length; i++) {
                    var currTxnItm = this.billingTransaction.BillingTransactionItems[i];
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
        }
        else {
            this.msgBoxServ.showMessage("failed", ["Invalid Patient/Visit Id."]);
            isFormValid = false;
        }
        return isFormValid;
    };
    NursingIpBillItemRequestComponent.prototype.CheckSelectionFromAutoComplete = function () {
        if (this.billingTransaction.BillingTransactionItems.length) {
            for (var _i = 0, _a = this.billingTransaction.BillingTransactionItems; _i < _a.length; _i++) {
                var itm = _a[_i];
                if (!itm.IsValidSelDepartment) {
                    this.msgBoxServ.showMessage("failed", ["Select item from list."]);
                    this.loading = false;
                    return false;
                }
            }
            return true;
        }
    };
    //posts to Departments Requisition Table
    NursingIpBillItemRequestComponent.prototype.PostToDepartmentRequisition = function () {
        var _this = this;
        //orderstatus="active" and billingStatus="paid" when sent from billingpage.
        this.billingBLService.PostDepartmentOrders(this.billingTransaction.BillingTransactionItems, "active", "provisional", this.currPatVisitContext)
            .subscribe(function (res) {
            if (res.Status == "OK") {
                _this.PostToBillingTransaction();
            }
            else {
                _this.loading = false;
                _this.msgBoxServ.showMessage("failed", ["Unable to do lab request.Please try again later"]);
                console.log(res.ErrorMessage);
            }
        });
    };
    NursingIpBillItemRequestComponent.prototype.PostToBillingTransaction = function () {
        var _this = this;
        this.billingBLService.PostBillingTransactionItems(this.billingTransaction.BillingTransactionItems)
            .subscribe(function (res) {
            if (res.Status == "OK") {
                _this.CloseLabRequestsPage();
                _this.loading = false;
                _this.emitBillItemReq.emit();
            }
            else {
                _this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                _this.loading = false;
            }
        });
    };
    //----------end: post billing transaction-----------------------------------
    //start: get: master and patient data
    NursingIpBillItemRequestComponent.prototype.LoadPatientBillingContext = function (patientId) {
        var _this = this;
        this.billingBLService.GetPatientBillingContext(patientId)
            .subscribe(function (res) {
            if (res.Status == "OK") {
                _this.currBillingContext = res.Results;
                _this.billingService.BillingType = "inpatient";
                _this.billingType = "inpatient";
            }
        });
    };
    NursingIpBillItemRequestComponent.prototype.GetInpatientlist = function () {
        var _this = this;
        this.labBLService.GetInpatientList()
            .subscribe(function (res) {
            if (res.Status == "OK") {
                _this.inpatientList = res.Results;
            }
            else {
                _this.msgBoxServ.showMessage("failed", ["Unable to get lab items."]);
            }
        });
    };
    NursingIpBillItemRequestComponent.prototype.GetPatientVisitList = function (patientId) {
        var _this = this;
        this.labBLService.GetPatientVisitsProviderWise(patientId)
            .subscribe(function (res) {
            if (res.Status == 'OK') {
                if (res.Results.length) {
                    _this.visitList = res.Results;
                    //assign doctor of latest visit as requestedby by default to the first billing item.
                    var doc = _this.doctorsList.find(function (a) { return a.EmployeeId == _this.visitList[0].ProviderId; });
                    if (doc) {
                        _this.selectedRequestedByDr[0] = doc.FullName;
                        _this.AssignRequestedByDoctor(0);
                    }
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
    NursingIpBillItemRequestComponent.prototype.GetDoctorsList = function () {
        var _this = this;
        this.billingBLService.GetDoctorsList()
            .subscribe(function (res) {
            if (res.Status == 'OK') {
                if (res.Results.length) {
                    _this.doctorsList = res.Results;
                    var Obj = new Object();
                    Obj["EmployeeId"] = null; //change by Yub -- 23rd Aug '18
                    Obj["FullName"] = "SELF";
                    _this.doctorsList.push(Obj);
                    _this.InitiateComponent();
                }
                else {
                    console.log(res.ErrorMessage);
                }
            }
        }, function (err) {
            _this.msgBoxServ.showMessage('Failed', ["unable to get Doctors list.. check log for more details."]);
            console.log(err.ErrorMessage);
        });
    };
    NursingIpBillItemRequestComponent.prototype.GetServiceDeptNameById = function (servDeptId) {
        if (this.serviceDeptList) {
            var srvDept = this.serviceDeptList.find(function (a) { return a.ServiceDepartmentId == servDeptId; });
            return srvDept ? srvDept.ServiceDepartmentName : null;
        }
    };
    //end: get: master and patient data
    //start: autocomplete assign functions and item filter logic
    NursingIpBillItemRequestComponent.prototype.AssignSelectedItem = function (index) {
        var _this = this;
        var item = null;
        // check if user has given proper input string for item name
        //or has selected object properly from the dropdown list.
        if (this.selectedItems[index]) {
            if (typeof (this.selectedItems[index]) == 'string' && this.billingTransaction.BillingTransactionItems[index].ItemList.length) {
                item = this.billingTransaction.BillingTransactionItems[index].ItemList.find(function (a) { return a.ItemName.toLowerCase() == _this.selectedItems[index].toLowerCase(); });
            }
            else if (typeof (this.selectedItems[index]) == 'object')
                item = this.selectedItems[index];
            if (item) {
                if (this.billingType.toLowerCase() != "inpatient") {
                    var extItem = this.billingTransaction.BillingTransactionItems.find(function (a) { return a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId; });
                    var extItemIndex = this.billingTransaction.BillingTransactionItems.findIndex(function (a) { return a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId; });
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
                this.billingTransaction.BillingTransactionItems[index].ProcedureCode = item.ProcedureCode;
                this.billingTransaction.BillingTransactionItems[index].Price = item.Price;
                //add also the servicedepartmentname property of the item; needed since most of the filtering happens on this value
                this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentName = this.GetServiceDeptNameById(item.ServiceDepartmentId);
                this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId = item.ServiceDepartmentId;
                this.selectedServDepts[index] = this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentName;
                this.billingTransaction.BillingTransactionItems[index].IsValidSelDepartment = true;
                this.billingTransaction.BillingTransactionItems[index].IsValidSelItemName = true;
                this.FilterBillItems(index);
                this.CheckItemProviderValidation(index);
            }
            else
                this.billingTransaction.BillingTransactionItems[index].IsValidSelItemName = false;
            if (!item && !this.selectedServDepts[index]) {
                this.billingTransaction.BillingTransactionItems[index].ItemList = this.billItems;
            }
        }
    };
    NursingIpBillItemRequestComponent.prototype.AssignSelectedDoctor = function (index) {
        var _this = this;
        var doctor = null;
        // check if user has given proper input string for item name
        //or has selected object properly from the dropdown list.
        if (this.selectedAssignedToDr[index]) {
            if (typeof (this.selectedAssignedToDr[index]) == 'string' && this.doctorsList.length) {
                doctor = this.doctorsList.find(function (a) { return a.FullName.toLowerCase() == _this.selectedAssignedToDr[index].toLowerCase(); });
            }
            else if (typeof (this.selectedAssignedToDr[index]) == 'object')
                doctor = this.selectedAssignedToDr[index];
            if (doctor) {
                this.billingTransaction.BillingTransactionItems[index].ProviderId = doctor.EmployeeId;
                this.billingTransaction.BillingTransactionItems[index].ProviderName = doctor.FullName;
                this.billingTransaction.BillingTransactionItems[index].IsValidSelAssignedToDr = true;
            }
            else
                this.billingTransaction.BillingTransactionItems[index].IsValidSelAssignedToDr = false;
        }
        else
            this.billingTransaction.BillingTransactionItems[index].IsValidSelAssignedToDr = true;
    };
    NursingIpBillItemRequestComponent.prototype.AssignRequestedByDoctor = function (index) {
        var _this = this;
        var doctor = null;
        // check if user has given proper input string for item name
        //or has selected object properly from the dropdown list.
        if (this.selectedRequestedByDr[index]) {
            if (typeof (this.selectedRequestedByDr[index]) == 'string' && this.doctorsList.length) {
                doctor = this.doctorsList.find(function (a) { return a.FullName.toLowerCase() == _this.selectedRequestedByDr[index].toLowerCase(); });
            }
            else if (typeof (this.selectedRequestedByDr[index]) == 'object')
                doctor = this.selectedRequestedByDr[index];
            if (doctor) {
                this.billingTransaction.BillingTransactionItems[index].RequestedBy = doctor.EmployeeId;
                this.billingTransaction.BillingTransactionItems[index].RequestedByName = doctor.FullName;
                this.billingTransaction.BillingTransactionItems[index].IsValidSelRequestedByDr = true;
            }
            else
                this.billingTransaction.BillingTransactionItems[index].IsValidSelRequestedByDr = false;
        }
        else
            this.billingTransaction.BillingTransactionItems[index].IsValidSelRequestedByDr = true;
    };
    //assigns service department id and filters item list
    NursingIpBillItemRequestComponent.prototype.ServiceDeptOnChange = function (index) {
        var _this = this;
        var srvDeptObj = null;
        // check if user has given proper input string for department name 
        //or has selected object properly from the dropdown list.
        if (typeof (this.selectedServDepts[index]) == 'string') {
            if (this.serviceDeptList.length && this.selectedServDepts[index])
                srvDeptObj = this.serviceDeptList.find(function (a) { return a.ServiceDepartmentName.toLowerCase() == _this.selectedServDepts[index].toLowerCase(); });
        }
        else if (typeof (this.selectedServDepts[index]) == 'object') {
            srvDeptObj = this.selectedServDepts[index];
        }
        //if selection of department from string or selecting object from the list is true
        //then assign proper department name
        if (srvDeptObj) {
            if (srvDeptObj.ServiceDepartmentId != this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId) {
                this.ResetSelectedRow(index);
                this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId = srvDeptObj.ServiceDepartmentId;
            }
            this.FilterBillItems(index);
            this.billingTransaction.BillingTransactionItems[index].IsValidSelDepartment = true;
        }
        //else raise an invalid flag
        else {
            this.billingTransaction.BillingTransactionItems[index].ItemList = this.billItems;
            this.billingTransaction.BillingTransactionItems[index].IsValidSelDepartment = false;
        }
    };
    NursingIpBillItemRequestComponent.prototype.FilterBillItems = function (index) {
        //ramavtar:13may18: at start if no default service department is set .. we need to skip the filtering of item list.
        if (this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId) {
            if (this.billingTransaction.BillingTransactionItems.length && this.billItems.length) {
                var srvDeptId_1 = this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId;
                //initalAssign: FilterBillItems was called after assinging all the values(used in ngModelChange in SelectDepartment)
                // and was assigning ItemId=null.So avoiding assignment null value to ItemId during inital assign.
                if (this.billingTransaction.BillingTransactionItems[index].ItemId == null)
                    this.ResetSelectedRow(index);
                this.billingTransaction.BillingTransactionItems[index].ItemList = this.billItems.filter(function (a) { return a.ServiceDepartmentId == srvDeptId_1; });
                var servDeptName = this.GetServiceDeptNameById(srvDeptId_1);
                if (this.IsDoctorMandatory(servDeptName, null)) {
                    this.billingTransaction.BillingTransactionItems[index].UpdateValidator("on", "ProviderId", "required");
                }
                else {
                    this.billingTransaction.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);
                }
            }
        }
        else {
            var billItems = this.billItems.filter(function (a) { return a.ServiceDepartmentName != "OPD"; });
            this.billingTransaction.BillingTransactionItems[index].ItemList = billItems;
        }
    };
    //end: autocomplete assign functions  and item filter logic
    NursingIpBillItemRequestComponent.prototype.CloseLabRequestsPage = function () {
        this.showIpBillRequest = false;
    };
    //----start: add/delete rows-----
    NursingIpBillItemRequestComponent.prototype.ResetSelectedRow = function (index) {
        this.selectedItems[index] = null;
        this.selectedAssignedToDr[index] = null;
        this.billingTransaction.BillingTransactionItems[index] = this.NewBillingTransactionItem();
    };
    NursingIpBillItemRequestComponent.prototype.AddNewBillTxnItemRow = function (index) {
        if (index === void 0) { index = null; }
        var billItem = this.NewBillingTransactionItem();
        billItem.EnableControl("Price", false);
        this.billingTransaction.BillingTransactionItems.push(billItem);
        if (index != null) {
            var new_index_1 = this.billingTransaction.BillingTransactionItems.length - 1;
            this.selectedRequestedByDr[new_index_1] = this.selectedRequestedByDr[index];
            this.AssignRequestedByDoctor[new_index_1];
            window.setTimeout(function () {
                document.getElementById('items-box' + new_index_1).focus();
            }, 0);
        }
    };
    NursingIpBillItemRequestComponent.prototype.NewBillingTransactionItem = function (index) {
        if (index === void 0) { index = null; }
        var billItem = new billing_transaction_item_model_1.BillingTransactionItem();
        billItem.Quantity = 1;
        billItem.ItemList = this.billItems;
        return billItem;
    };
    NursingIpBillItemRequestComponent.prototype.deleteRow = function (index) {
        this.billingTransaction.BillingTransactionItems.splice(index, 1);
        this.billingTransaction.BillingTransactionItems.slice();
        this.selectedItems.splice(index, 1);
        this.selectedItems.slice();
        if (index == 0 && this.billingTransaction.BillingTransactionItems.length == 0) {
            this.AddNewBillTxnItemRow();
            this.changeDetectorRef.detectChanges();
        }
    };
    //returns whether doctor is mandatory for current combination of serv-dept and it's item.
    NursingIpBillItemRequestComponent.prototype.IsDoctorMandatory = function (serviceDeptName, itemName) {
        var isDocMandatory = false;
        var dptItmMap = this.srvDeptValidationMap;
        //go inside only when serviceDeptName is provided.
        if (serviceDeptName) {
            //check if provided serviceDeptName is present in our map--default is false.
            var curMap = dptItmMap.find(function (s) { return s.ServDeptName == serviceDeptName; });
            if (curMap) {
                //check if serviceDeptName is in mandatory map or non-mandatory map.
                if (curMap.IsMandatory) {
                    isDocMandatory = true; //default true for Mandatory srv-depts
                    //false when provided item is excluded from mandatory service department
                    if (curMap.ExcludedItems.find(function (itm) { return itm == itemName; })) {
                        isDocMandatory = false;
                    }
                }
                else if (curMap.IsMandatory == false) {
                    isDocMandatory = false; //default false for NON-Mandatory srv-depts
                    //true when provided item is excluded from non-mandatory service department
                    if (curMap.ExcludedItems.find(function (itm) { return itm == itemName; })) {
                        isDocMandatory = true;
                    }
                }
            }
            else {
                isDocMandatory = false;
            }
        }
        return isDocMandatory;
    };
    NursingIpBillItemRequestComponent.prototype.CheckItemProviderValidation = function (index) {
        var srvDeptId = this.billingTransaction.BillingTransactionItems[index].ServiceDepartmentId;
        var servDeptName = this.GetServiceDeptNameById(srvDeptId);
        if (this.IsDoctorMandatory(servDeptName, this.billingTransaction.BillingTransactionItems[index].ItemName)) {
            this.billingTransaction.BillingTransactionItems[index].UpdateValidator("on", "ProviderId", "required");
        }
        else {
            this.billingTransaction.BillingTransactionItems[index].UpdateValidator("off", "ProviderId", null);
        }
    };
    //end: mandatory doctor validations
    //start: list formatters
    NursingIpBillItemRequestComponent.prototype.ItemsListFormatter = function (data) {
        var html = data["ServiceDepartmentShortName"] + "-" + data["BillItemPriceId"] + "&nbsp;&nbsp;" + data["ItemName"] + "&nbsp;&nbsp;";
        html += "(<i>" + data["ServiceDepartmentName"] + "</i>)" + "&nbsp;&nbsp;" + "RS." + data["Price"];
        return html;
    };
    NursingIpBillItemRequestComponent.prototype.DoctorListFormatter = function (data) {
        return data["FullName"];
    };
    NursingIpBillItemRequestComponent.prototype.ServiceDeptListFormatter = function (data) {
        return data["ServiceDepartmentName"];
    };
    NursingIpBillItemRequestComponent.prototype.patientListFormatter = function (data) {
        var html = data["ShortName"] + ' [ ' + data['PatientCode'] + ' ]';
        return html;
    };
    __decorate([
        core_1.Input("showPatientSearch"),
        __metadata("design:type", Boolean)
    ], NursingIpBillItemRequestComponent.prototype, "showPatientSearch", void 0);
    __decorate([
        core_1.Input("patientId"),
        __metadata("design:type", Number)
    ], NursingIpBillItemRequestComponent.prototype, "patientId", void 0);
    __decorate([
        core_1.Input("visitId"),
        __metadata("design:type", Number)
    ], NursingIpBillItemRequestComponent.prototype, "visitId", void 0);
    __decorate([
        core_1.Output("emit-billItemReq"),
        __metadata("design:type", core_1.EventEmitter)
    ], NursingIpBillItemRequestComponent.prototype, "emitBillItemReq", void 0);
    __decorate([
        core_1.Input("department"),
        __metadata("design:type", String)
    ], NursingIpBillItemRequestComponent.prototype, "department", void 0);
    __decorate([
        core_1.Input("billItems"),
        __metadata("design:type", Array)
    ], NursingIpBillItemRequestComponent.prototype, "billItems", void 0);
    NursingIpBillItemRequestComponent = __decorate([
        core_1.Component({
            selector: 'nursing-ip-billitem-request',
            templateUrl: "/app/nursing/ward-billing/nursing-ipBillItem-Request.html"
        }),
        __metadata("design:paramtypes", [labs_bl_service_1.LabsBLService,
            messagebox_service_1.MessageboxService,
            security_service_1.SecurityService,
            core_1.ChangeDetectorRef,
            billing_bl_service_1.BillingBLService,
            billing_service_1.BillingService,
            core_service_1.CoreService])
    ], NursingIpBillItemRequestComponent);
    return NursingIpBillItemRequestComponent;
}());
exports.NursingIpBillItemRequestComponent = NursingIpBillItemRequestComponent;
//# sourceMappingURL=nursing-ip-billitem-request.component.js.map