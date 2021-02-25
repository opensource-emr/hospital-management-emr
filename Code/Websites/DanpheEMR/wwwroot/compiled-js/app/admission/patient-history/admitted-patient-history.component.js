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
var core_2 = require("@angular/core");
var admission_bl_service_1 = require("../shared/admission.bl.service");
var messagebox_service_1 = require("../../shared/messagebox/messagebox.service");
var forms_1 = require("@angular/forms");
var AdmittedPatientHistory = /** @class */ (function () {
    function AdmittedPatientHistory(admissionBLService, msgBoxServ) {
        this.admissionBLService = admissionBLService;
        this.msgBoxServ = msgBoxServ;
        this.patWardList = new Array();
        this.showDatePicker = [];
        this.prevStartedOn = null;
        this.prevEndedOn = null;
        this.validDate = true;
        this.showEdit = true;
        this.AdmissionDateValidator = null;
        this.SetValidators();
    }
    AdmittedPatientHistory.prototype.ngOnInit = function () {
        if (this.ipVisitid) {
            this.GetPatientWardInfo(this.ipVisitid);
            this.validDate = true;
        }
    };
    AdmittedPatientHistory.prototype.GetPatientWardInfo = function (PatVisitId) {
        var _this = this;
        this.admissionBLService.GetAdmittedPatientInfo(PatVisitId)
            .subscribe(function (res) {
            if (res.Status == 'OK') {
                if (res.Results.length) {
                    _this.patWardList = res.Results;
                    _this.patWardList.forEach(function (a) {
                        _this.showDatePicker.push(false);
                    });
                    _this.patWardList = _this.patWardList.slice();
                }
            }
            else {
                _this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            }
        }, function (err) {
            _this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
        });
    };
    AdmittedPatientHistory.prototype.EditSelectedInfoOnClick = function (index) {
        this.showEdit = false;
        this.showDatePicker[index] = true;
        this.prevStartedOn = this.patWardList[index].StartedOn;
        this.prevEndedOn = this.patWardList[index].EndedOn;
        this.UpdateValidator(index);
    };
    AdmittedPatientHistory.prototype.CloseDateChange = function (index) {
        this.showEdit = true;
        this.showDatePicker[index] = false;
        this.patWardList[index].StartedOn = this.prevStartedOn;
        this.patWardList[index].EndedOn = this.prevEndedOn;
    };
    AdmittedPatientHistory.prototype.SaveChanges = function (index) {
        var _this = this;
        for (var i in this.AdmissionDateValidator.controls) {
            this.AdmissionDateValidator.controls[i].markAsDirty();
            this.AdmissionDateValidator.controls[i].updateValueAndValidity();
        }
        if (this.IsValid(undefined, undefined)) {
            this.admissionBLService.UpdateAdmittedPatientInfo(this.patWardList[index])
                .subscribe(function (res) {
                if (res.Status == "OK") {
                    _this.msgBoxServ.showMessage("success", ["Dates changed successfully."]);
                    _this.GetPatientWardInfo(_this.ipVisitid);
                    _this.showDatePicker[index] = false;
                    _this.showEdit = true;
                }
                else {
                    _this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            });
        }
    };
    AdmittedPatientHistory.prototype.SetValidators = function () {
        var _formBuilder = new forms_1.FormBuilder();
        this.AdmissionDateValidator = _formBuilder.group({
            'StartedOn': ['', forms_1.Validators.compose([forms_1.Validators.required])],
            'EndedOn': ['', forms_1.Validators.compose([])]
        });
    };
    AdmittedPatientHistory.prototype.UpdateValidator = function (index) {
        if (this.patWardList[index].EndedOn) {
            this.AdmissionDateValidator.controls['EndedOn'].validator = forms_1.Validators.compose([forms_1.Validators.required]);
        }
        else {
            this.AdmissionDateValidator.controls['EndedOn'].validator = forms_1.Validators.compose([]);
        }
        this.AdmissionDateValidator.controls['EndedOn'].updateValueAndValidity();
    };
    AdmittedPatientHistory.prototype.IsDirty = function (controlname) {
        if (controlname == undefined) {
            return this.AdmissionDateValidator.dirty;
        }
        else {
            return this.AdmissionDateValidator.controls[controlname].dirty;
        }
    };
    AdmittedPatientHistory.prototype.IsValid = function (controlname, typeofvalidation) {
        if (this.AdmissionDateValidator.valid) {
            return true;
        }
        if (controlname == undefined) {
            return this.AdmissionDateValidator.valid;
        }
        else {
            return !(this.AdmissionDateValidator.controls[controlname].hasError(typeofvalidation));
        }
    };
    __decorate([
        core_2.Input(),
        __metadata("design:type", Number)
    ], AdmittedPatientHistory.prototype, "ipVisitid", void 0);
    AdmittedPatientHistory = __decorate([
        core_1.Component({
            selector: "patient-admission-history",
            templateUrl: "/app/admission/patient-history/admitted-patient-history.html"
        }),
        __metadata("design:paramtypes", [admission_bl_service_1.AdmissionBLService,
            messagebox_service_1.MessageboxService])
    ], AdmittedPatientHistory);
    return AdmittedPatientHistory;
}());
exports.AdmittedPatientHistory = AdmittedPatientHistory;
//# sourceMappingURL=admitted-patient-history.component.js.map