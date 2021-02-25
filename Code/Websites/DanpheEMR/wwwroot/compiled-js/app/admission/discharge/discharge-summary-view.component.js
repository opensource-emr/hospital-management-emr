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
var admission_bl_service_1 = require("../shared/admission.bl.service");
var moment = require("moment/moment");
var DischargeSummaryViewComponent = /** @class */ (function () {
    function DischargeSummaryViewComponent(admissionBLService, msgBoxServ) {
        this.admissionBLService = admissionBLService;
        this.msgBoxServ = msgBoxServ;
        this.showSummaryView = false;
    }
    Object.defineProperty(DischargeSummaryViewComponent.prototype, "value", {
        set: function (val) {
            this.showSummaryView = val;
            if (this.showSummaryView && this.selectedADT) {
                this.GetDischargeSummary();
                //this.GetLabResults();//commented: sud:9Aug'17--add it only after lab is implemented.
                this.GetLabRequests();
                this.GetImagingResults();
                this.FormatDates();
            }
        },
        enumerable: true,
        configurable: true
    });
    DischargeSummaryViewComponent.prototype.FormatDates = function () {
        this.selectedADT.DOB = moment(this.selectedADT.DateOfBirth).format('YYYY-MM-DD');
        this.selectedADT.AdmittedDate = moment(this.selectedADT.AdmittedDate).format('YYYY-MM-DD hh:mm A');
        if (this.selectedADT.DischargedDate) {
            this.selectedADT.DischargedDate = moment(this.selectedADT.DischargedDate).format('YYYY-MM-DD hh:mm A');
        }
        else
            this.selectedADT.DischargedDate = moment().format('YYYY-MM-DD HH:mm A');
    };
    DischargeSummaryViewComponent.prototype.GetDischargeSummary = function () {
        var _this = this;
        this.admissionBLService.GetDischargeSummary(this.selectedADT.PatientVisitId)
            .subscribe(function (res) {
            if (res.Status == 'OK') {
                if (res.Results)
                    _this.dischargeSummary = res.Results;
            }
            else {
                _this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            }
        }, function (err) {
            _this.msgBoxServ.showMessage("error", ['Failed to get discharge summary.. please check log for details.'], err.ErrorMessage);
        });
    };
    //Gets only the requests, Use Results once We implement the Labs-Module for data entry. -- sud: 9Aug'17
    DischargeSummaryViewComponent.prototype.GetLabRequests = function () {
        var _this = this;
        this.admissionBLService.GetLabRequestsByPatientVisit(this.selectedADT.PatientId, this.selectedADT.PatientVisitId)
            .subscribe(function (res) {
            if (res.Status == 'OK') {
                _this.labRequests = res.Results;
            }
            else {
                _this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            }
        }, function (err) {
            _this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
            _this.logError(err.ErrorMessage);
        });
    };
    //private GetLabResults() {
    //    this.admissionBLService.GetLabReportByVisitId(this.selectedADT.PatientVisitId)
    //        .subscribe(res => {
    //            if (res.Status == 'OK') {
    //                this.labResults = res.Results;
    //            } else {
    //                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    //            }
    //        },
    //        err => {
    //            this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
    //            this.logError(err.ErrorMessage);
    //        });
    //}
    DischargeSummaryViewComponent.prototype.GetImagingResults = function () {
        var _this = this;
        this.admissionBLService.GetImagingReportsReportsByVisitId(this.selectedADT.PatientVisitId)
            .subscribe(function (res) {
            if (res.Status == 'OK') {
                if (res.Results.length)
                    _this.imagingResults = res.Results;
            }
            else {
                _this.msgBoxServ.showMessage("error", ["Failed to get Imaigng Results. Check log for detail"]);
                _this.logError(res.ErrorMessage);
            }
        }, function (err) {
            _this.msgBoxServ.showMessage("error", ['Failed to get imaging results.. please check log for details.'], err.ErrorMessage);
        });
    };
    //thi sis used to print the receipt
    DischargeSummaryViewComponent.prototype.print = function () {
        var popupWinindow;
        var printContents = document.getElementById("printpage").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        var documentContent = "<html><head>";
        documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanphePrintStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
        documentContent += '</head>';
        documentContent += '<body onload="window.print()">' + printContents + '</body></html>';
        popupWinindow.document.write(documentContent);
        popupWinindow.document.close();
    };
    DischargeSummaryViewComponent.prototype.logError = function (err) {
        console.log(err);
    };
    __decorate([
        core_1.Input("selectedADT"),
        __metadata("design:type", Object)
    ], DischargeSummaryViewComponent.prototype, "selectedADT", void 0);
    __decorate([
        core_1.Input("showSummaryView"),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], DischargeSummaryViewComponent.prototype, "value", null);
    DischargeSummaryViewComponent = __decorate([
        core_1.Component({
            selector: 'discharge-summary-view',
            templateUrl: '/app/admission/discharge/discharge-summary-view.html',
        }),
        __metadata("design:paramtypes", [admission_bl_service_1.AdmissionBLService,
            messagebox_service_1.MessageboxService])
    ], DischargeSummaryViewComponent);
    return DischargeSummaryViewComponent;
}());
exports.DischargeSummaryViewComponent = DischargeSummaryViewComponent;
//# sourceMappingURL=discharge-summary-view.component.js.map