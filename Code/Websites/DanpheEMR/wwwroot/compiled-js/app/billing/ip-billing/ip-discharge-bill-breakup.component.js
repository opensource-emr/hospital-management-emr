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
var patient_service_1 = require("../../patients/shared/patient.service");
var dl_service_1 = require("../../shared/dl.service");
var discharged_patient_model_1 = require("../../reporting/admission/discharged-patient.model");
var core_service_1 = require("../../core/shared/core.service");
var IPDischargeBillBreakupComponent = /** @class */ (function () {
    function IPDischargeBillBreakupComponent(msgBoxServ, patientService, dlService, coreService) {
        this.msgBoxServ = msgBoxServ;
        this.patientService = patientService;
        this.dlService = dlService;
        this.coreService = coreService;
        this.showDischargeBillBreakup = false;
        this.onClose = new core_1.EventEmitter();
        this.isPageLoaded = false;
        this.dischargeBillBreakupRPT = new DischargeBillBreakupReport();
    }
    IPDischargeBillBreakupComponent.prototype.ngOnInit = function () {
        if (this.disPat) {
            var visitId = this.disPat.VisitId;
            if (visitId > 0) {
                this.GetPatDischargeBillBreakupReport(visitId, this.disPat.PatientId);
            }
        }
        else {
            this.ClosePopup();
        }
    };
    IPDischargeBillBreakupComponent.prototype.GetPatDischargeBillBreakupReport = function (visitId, patientId) {
        var _this = this;
        this.dlService.Read("/Reporting/DischargedPatientBillBreakup?VisitId=" + visitId + "&PatientId=" + patientId)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) {
            if (res.Status == "OK" && res.Results) {
                _this.isPageLoaded = true;
                _this.patient = res.Results.Patient.Patient;
                _this.MapReportData(res.Results.ReportData);
                var s = _this.dischargeBillBreakupRPT;
                var custHeader = _this.coreService.Parameters.find(function (s) { return s.ParameterName == "CustomerHeader"; }).ParameterValue;
                _this.hospitalName = JSON.parse(custHeader).hospitalName;
                _this.address = JSON.parse(custHeader).address;
                _this.tel = JSON.parse(custHeader).tel;
                _this.showDischargeBillBreakup = true;
            }
            else {
                _this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                _this.ClosePopup();
            }
        });
    };
    IPDischargeBillBreakupComponent.prototype.MapReportData = function (reportData) {
        var _this = this;
        var deptNamesList = reportData.map(function (itm) { return itm.departmentName; }).filter(function (value, index, self) { return self.indexOf(value) === index; });
        if (deptNamesList) {
            deptNamesList.forEach(function (i) {
                var tempData = new DischargeBillVM();
                tempData.departmentName = i;
                tempData.itemList = reportData.filter(function (t) { return t.departmentName == i; });
                tempData.calculationpart = _this.calculate(tempData.itemList);
                _this.dischargeBillBreakupRPT.reportData.push(tempData);
            });
            this.finalCalculation();
        }
    };
    IPDischargeBillBreakupComponent.prototype.calculateSubTotalTotal = function () {
    };
    IPDischargeBillBreakupComponent.prototype.ClosePopup = function () {
        this.showDischargeBillBreakup = false;
        this.disPat = new discharged_patient_model_1.DischargedPatient();
        this.patient = null;
        this.dischargeBillBreakupRPT = new DischargeBillBreakupReport();
        this.isPageLoaded = false;
        this.onClose.emit({ close: true });
    };
    IPDischargeBillBreakupComponent.prototype.Print = function () {
        try {
            var popupWinindow = void 0;
            var printContents = document.getElementById("printpage").innerHTML;
            popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
            popupWinindow.document.open();
            var documentContent = "<html><head>";
            documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
            documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
            documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
            documentContent += '</head>';
            documentContent += '<body onload="window.print()">' + printContents + '</body></html>';
            popupWinindow.document.write(documentContent);
            popupWinindow.document.close();
        }
        catch (ex) {
            console.log(ex);
        }
    };
    IPDischargeBillBreakupComponent.prototype.calculate = function (itemList) {
        var tempCal = new SubTotalModel();
        itemList.forEach(function (itm) {
            tempCal.qty = tempCal.qty + itm.qty;
            tempCal.amount = tempCal.amount + itm.amount;
            tempCal.subTotal = tempCal.subTotal + itm.subTotal;
            tempCal.discount = tempCal.discount + itm.discount;
            tempCal.total = tempCal.total + itm.total;
            tempCal.vat = tempCal.vat + itm.vat;
        });
        return tempCal;
    };
    IPDischargeBillBreakupComponent.prototype.finalCalculation = function () {
        var _this = this;
        this.dischargeBillBreakupRPT.reportData.forEach(function (i) {
            _this.dischargeBillBreakupRPT.amount = i.calculationpart.amount + _this.dischargeBillBreakupRPT.amount;
            _this.dischargeBillBreakupRPT.total = i.calculationpart.total + _this.dischargeBillBreakupRPT.total;
            _this.dischargeBillBreakupRPT.subTotal = i.calculationpart.subTotal + _this.dischargeBillBreakupRPT.subTotal;
            _this.dischargeBillBreakupRPT.discount = i.calculationpart.discount + _this.dischargeBillBreakupRPT.discount;
            _this.dischargeBillBreakupRPT.vat = i.calculationpart.vat + _this.dischargeBillBreakupRPT.vat;
        });
    };
    __decorate([
        core_1.Input("DischargedPat"),
        __metadata("design:type", discharged_patient_model_1.DischargedPatient)
    ], IPDischargeBillBreakupComponent.prototype, "disPat", void 0);
    __decorate([
        core_1.Output("on-bill-closed"),
        __metadata("design:type", Object)
    ], IPDischargeBillBreakupComponent.prototype, "onClose", void 0);
    IPDischargeBillBreakupComponent = __decorate([
        core_1.Component({
            selector: "discharge-bill-breakup",
            templateUrl: "/app/billing/ip-billing/ip-discharge-bill-breakup.html"
        }),
        __metadata("design:paramtypes", [messagebox_service_1.MessageboxService,
            patient_service_1.PatientService,
            dl_service_1.DLService,
            core_service_1.CoreService])
    ], IPDischargeBillBreakupComponent);
    return IPDischargeBillBreakupComponent;
}());
exports.IPDischargeBillBreakupComponent = IPDischargeBillBreakupComponent;
var DischargeBillBreakupReport = /** @class */ (function () {
    function DischargeBillBreakupReport() {
        this.amount = 0;
        this.discount = 0;
        this.subTotal = 0;
        this.taxable = 0;
        this.vat = 0;
        this.nonTaxable = 0;
        this.total = 0;
        this.deposit = 0;
        this.totalPayment = 0;
        this.reportData = new Array();
    }
    return DischargeBillBreakupReport;
}());
exports.DischargeBillBreakupReport = DischargeBillBreakupReport;
var DischargeBillVM = /** @class */ (function () {
    function DischargeBillVM() {
        this.departmentName = null;
        this.itemList = new Array();
        this.calculationpart = new SubTotalModel();
    }
    return DischargeBillVM;
}());
exports.DischargeBillVM = DischargeBillVM;
var SubTotalModel = /** @class */ (function () {
    function SubTotalModel() {
        this.billDate = null;
        this.description = null;
        this.qty = 0;
        this.amount = 0;
        this.discount = 0;
        this.subTotal = 0;
        this.vat = 0;
        this.total = 0;
    }
    return SubTotalModel;
}());
exports.SubTotalModel = SubTotalModel;
//# sourceMappingURL=ip-discharge-bill-breakup.component.js.map