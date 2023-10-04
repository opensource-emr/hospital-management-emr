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
var admission_bl_service_1 = require("../shared/admission.bl.service");
var messagebox_service_1 = require("../../shared/messagebox/messagebox.service");
var security_service_1 = require("../../security/shared/security.service");
var discharge_summary_model_1 = require("../shared/discharge-summary.model");
var admission_model_1 = require("../shared/admission.model");
var moment = require("moment/moment");
var DischargeSummaryAddComponent = /** @class */ (function () {
    function DischargeSummaryAddComponent(admissionBLService, securityService, msgBoxServ, changeDetector) {
        this.admissionBLService = admissionBLService;
        this.securityService = securityService;
        this.msgBoxServ = msgBoxServ;
        this.changeDetector = changeDetector;
        this.CurrentDischargeSummary = new discharge_summary_model_1.DischargeSummary();
        this.admission = new admission_model_1.Admission();
        this.dischargeTypeList = new Array();
        this.providerList = new Array();
        this.AnasthetistsList = new Array();
        this.update = false;
        this.showSummaryView = false;
        this.showDischargeSummary = false;
        this.disablePrint = false;
        this.showUnpaidPopupBox = false; //to display the Alert-Box when trying to discharge with pending bills.
        this.consultant = null;
        this.drIncharge = null;
        this.anasthetists = null;
        this.residenceDr = null;
        this.GetProviderList();
        this.GetDischargeType();
        this.GetAnasthetistsEmpList();
    }
    ;
    Object.defineProperty(DischargeSummaryAddComponent.prototype, "value", {
        set: function (val) {
            this.showDischargeSummary = val;
            if (this.selectedDischarge && this.showDischargeSummary) {
                this.GetImagingResults();
                this.GetLabRequests();
                this.GetDischargeSummary();
            }
        },
        enumerable: true,
        configurable: true
    });
    DischargeSummaryAddComponent.prototype.GetDischargeType = function () {
        var _this = this;
        this.admissionBLService.GetDischargeType()
            .subscribe(function (res) {
            if (res.Status == 'OK') {
                _this.dischargeTypeList = res.Results;
            }
            else {
                _this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            }
        }, function (err) {
            _this.msgBoxServ.showMessage("error", ['Failed to get discharge type.. please check log for details.']);
            _this.logError(err.ErrorMessage);
        });
    };
    DischargeSummaryAddComponent.prototype.GetProviderList = function () {
        var _this = this;
        this.admissionBLService.GetProviderList()
            .subscribe(function (res) {
            if (res.Status == 'OK') {
                _this.providerList = res.Results;
            }
            else {
                _this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            }
        }, function (err) {
            _this.msgBoxServ.showMessage("error", ['Failed to get Doctors list.. please check log for details.']);
            _this.logError(err.ErrorMessage);
        });
    };
    DischargeSummaryAddComponent.prototype.GetAnasthetistsEmpList = function () {
        var _this = this;
        this.admissionBLService.GetAnasthetistsEmpList()
            .subscribe(function (res) {
            if (res.Status == "OK") {
                _this.AnasthetistsList = res.Results;
            }
            else {
                _this.msgBoxServ.showMessage("error", ["Failed to get Anasthetist-Doctor list.. please check the log for details."]);
                _this.logError(res.ErrorMessage);
            }
        }, function (err) {
            _this.msgBoxServ.showMessage("error", ['Failed to get Anasthetist-Doctors list.. please check log for details.']);
            _this.logError(err.ErrorMessage);
        });
    };
    DischargeSummaryAddComponent.prototype.GetLabResults = function () {
        var _this = this;
        this.admissionBLService.GetLabReportByVisitId(this.selectedDischarge.PatientVisitId)
            .subscribe(function (res) {
            if (res.Status == 'OK') {
                _this.labResults = res.Results;
            }
            else {
                _this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            }
        }, function (err) {
            _this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
            _this.logError(err.ErrorMessage);
        });
    };
    //Gets only the requests, Use Results once We implement the Labs-Module for data entry. -- sud: 9Aug'17
    DischargeSummaryAddComponent.prototype.GetLabRequests = function () {
        var _this = this;
        this.admissionBLService.GetLabRequestsByPatientVisit(this.selectedDischarge.PatientId, this.selectedDischarge.PatientVisitId)
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
    DischargeSummaryAddComponent.prototype.GetImagingResults = function () {
        var _this = this;
        this.admissionBLService.GetImagingReportsReportsByVisitId(this.selectedDischarge.PatientVisitId)
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
    //for doctor's list
    DischargeSummaryAddComponent.prototype.myListFormatter = function (data) {
        var html = data["FullName"];
        return html;
    };
    //for anaesthetist doctor's list
    DischargeSummaryAddComponent.prototype.ListFormatter = function (data) {
        var html = data["FullName"];
        return html;
    };
    //below methods loadConsultant(),loadDrIncharge(),loadAnasthetists(),loadResidenceDr() will set the EmployeeId for respective drs
    DischargeSummaryAddComponent.prototype.loadConsultant = function () {
        this.CurrentDischargeSummary.ConsultantId = this.consultant ? this.consultant.EmployeeId : null;
    };
    DischargeSummaryAddComponent.prototype.loadDrIncharge = function () {
        this.CurrentDischargeSummary.DoctorInchargeId = this.drIncharge ? this.drIncharge.EmployeeId : null;
    };
    DischargeSummaryAddComponent.prototype.loadAnasthetists = function () {
        this.CurrentDischargeSummary.AnaesthetistsId = this.anasthetists ? this.anasthetists.EmployeeId : null;
    };
    DischargeSummaryAddComponent.prototype.loadResidenceDr = function () {
        this.CurrentDischargeSummary.ResidenceDrId = this.residenceDr ? this.residenceDr.EmployeeId : null;
    };
    //discharge summary
    DischargeSummaryAddComponent.prototype.GetDischargeSummary = function () {
        var _this = this;
        this.admissionBLService.GetDischargeSummary(this.selectedDischarge.PatientVisitId)
            .subscribe(function (res) {
            if (res.Status == 'OK') {
                if (res.Results) {
                    _this.CurrentDischargeSummary = new discharge_summary_model_1.DischargeSummary();
                    _this.CurrentDischargeSummary = Object.assign(_this.CurrentDischargeSummary, res.Results.DischargeSummary);
                    _this.consultant = res.Results.ConsultantName;
                    _this.drIncharge = res.Results.DoctorInchargeName;
                    //when given doctor is not present we get drname string as '.  ' , so we check if name length is greater than 3 then only will show name of doctor
                    if (res.Results.Anaesthetists.length > 3) {
                        _this.anasthetists = res.Results.Anaesthetists;
                    }
                    if (res.Results.ResidenceDrName.length > 3) {
                        _this.residenceDr = res.Results.ResidenceDrName;
                    }
                    _this.update = true;
                }
                else {
                    _this.update = false;
                    _this.CurrentDischargeSummary = new discharge_summary_model_1.DischargeSummary();
                    _this.CurrentDischargeSummary.PatientVisitId = _this.selectedDischarge.PatientVisitId;
                    _this.CurrentDischargeSummary.ConsultantId = _this.selectedDischarge.AdmittingDoctorId;
                    _this.CurrentDischargeSummary.CreatedBy = _this.securityService.GetLoggedInUser().EmployeeId;
                    //default residence doctor will be current logged in user.
                    //Ashim: 15Dec2017 : RResidenceDr is not mandatory
                    //this.CurrentDischargeSummary.ResidenceDrId = this.securityService.GetLoggedInUser().EmployeeId;
                    _this.CurrentDischargeSummary.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
                }
            }
            else {
                _this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            }
        }, function (err) {
            _this.msgBoxServ.showMessage("error", ['Failed to get discharge summary.. please check log for details.']);
            _this.logError(err.ErrorMessage);
        });
    };
    DischargeSummaryAddComponent.prototype.Save = function () {
        var _this = this;
        for (var i in this.CurrentDischargeSummary.DischargeSummaryValidator.controls) {
            this.CurrentDischargeSummary.DischargeSummaryValidator.controls[i].markAsDirty();
            this.CurrentDischargeSummary.DischargeSummaryValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentDischargeSummary.IsValid(undefined, undefined)) {
            this.admissionBLService.PostDischargeSummary(this.CurrentDischargeSummary)
                .subscribe(function (res) {
                if (res.Status == "OK") {
                    _this.msgBoxServ.showMessage("success", ["Discharge Summary Saved"]);
                    _this.update = true;
                    _this.CallBackAddUpdate(res);
                }
                else {
                    _this.msgBoxServ.showMessage("failed", ["Check log for errors"]);
                    _this.logError(res.ErrorMessage);
                }
            }, function (err) {
                _this.logError(err);
            });
        }
    };
    DischargeSummaryAddComponent.prototype.Update = function () {
        var _this = this;
        for (var i in this.CurrentDischargeSummary.DischargeSummaryValidator.controls) {
            this.CurrentDischargeSummary.DischargeSummaryValidator.controls[i].markAsDirty();
            this.CurrentDischargeSummary.DischargeSummaryValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentDischargeSummary.IsValid(undefined, undefined)) {
            this.CurrentDischargeSummary.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.CurrentDischargeSummary.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
            this.admissionBLService.UpdateDischargeSummary(this.CurrentDischargeSummary)
                .subscribe(function (res) {
                if (res.Status == "OK") {
                    _this.msgBoxServ.showMessage("success", ["Discharge Summary Updated"]);
                    _this.CallBackAddUpdate(res);
                }
                else {
                    _this.msgBoxServ.showMessage("failed", ["Check log for errors"]);
                    _this.logError(res.ErrorMessage);
                }
            }, function (err) {
                _this.logError(err);
            });
        }
    };
    DischargeSummaryAddComponent.prototype.CallBackAddUpdate = function (dischargeSummary) {
        this.CurrentDischargeSummary = Object.assign(this.CurrentDischargeSummary, dischargeSummary);
    };
    DischargeSummaryAddComponent.prototype.SubmitAndViewSummary = function () {
        var view;
        view = window.confirm("You won't be able to make further changes. Do you want to continue?");
        if (view) {
            this.CurrentDischargeSummary.IsSubmitted = true;
            this.Update();
            this.showDischargeSummary = false;
            this.showSummaryView = true;
        }
    };
    DischargeSummaryAddComponent.prototype.logError = function (err) {
        console.log(err);
    };
    __decorate([
        core_1.Input("selectedDischarge"),
        __metadata("design:type", Object)
    ], DischargeSummaryAddComponent.prototype, "selectedDischarge", void 0);
    __decorate([
        core_1.Input("showDischargeSummary"),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], DischargeSummaryAddComponent.prototype, "value", null);
    DischargeSummaryAddComponent = __decorate([
        core_1.Component({
            selector: 'discharge-summary-add',
            templateUrl: '/app/admission/discharge/discharge-summary-add.html',
        }),
        __metadata("design:paramtypes", [admission_bl_service_1.AdmissionBLService,
            security_service_1.SecurityService,
            messagebox_service_1.MessageboxService,
            core_1.ChangeDetectorRef])
    ], DischargeSummaryAddComponent);
    return DischargeSummaryAddComponent;
}());
exports.DischargeSummaryAddComponent = DischargeSummaryAddComponent;
//# sourceMappingURL=discharge-summary-add.component.js.map