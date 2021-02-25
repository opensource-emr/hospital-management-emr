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
var visit_model_1 = require("../visit.model");
var visit_bl_service_1 = require("../visit.bl.service");
var employee_model_1 = require("../../../employee/shared/employee.model");
var messagebox_service_1 = require("../../../shared/messagebox/messagebox.service");
var ReferalVisitComponent = /** @class */ (function () {
    function ReferalVisitComponent(visitBLService, msgBoxServ) {
        this.visitBLService = visitBLService;
        this.msgBoxServ = msgBoxServ;
        this.showReferalPage = false;
        this.addreferal = new core_2.EventEmitter();
        this.providerList = new Array();
        this.selectedProvider = new employee_model_1.Employee();
        this.doctorList = [];
        this.departmentId = 0;
        this.showmsgbox = false;
        this.status = null;
        this.message = null;
        this.loading = false; //to restrict double click
    }
    Object.defineProperty(ReferalVisitComponent.prototype, "value", {
        set: function (val) {
            if (val) {
                this.GetDepartmentList(val);
                this.GetDoctorList();
            }
            this.showReferalPage = val;
        },
        enumerable: true,
        configurable: true
    });
    ReferalVisitComponent.prototype.GetDepartmentList = function (val) {
        var _this = this;
        this.visitBLService.GetDepartmentList()
            .subscribe(function (res) {
            _this.departmentList = [];
            if (res && res.Results) {
                _this.departmentList = res.Results;
            }
        });
    };
    //load doctor  list according to department.
    //does a get request in employees table using departmentId.
    ReferalVisitComponent.prototype.GetDoctorList = function () {
        var _this = this;
        //erases previously selected doctor and clears respective schedule list
        this.selectedProvider = null;
        this.visitBLService.GetDoctorList(this.departmentId)
            .subscribe(function (res) { return _this.CallBackGenerateDoctor(res); });
    };
    ReferalVisitComponent.prototype.AssignSelectedDoctor = function () {
        this.departmentId = this.selectedProvider.DepartmentId;
    };
    //this is a success callback of GenerateDoctorList function.
    ReferalVisitComponent.prototype.CallBackGenerateDoctor = function (res) {
        var _this = this;
        if (res.Status == "OK") {
            this.providerList = [];
            //format return list into Key:Value form, since it searches also by the property name of json.
            if (res && res.Results) {
                res.Results.forEach(function (a) {
                    _this.providerList.push(a);
                });
            }
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
    };
    ReferalVisitComponent.prototype.myListFormatter = function (data) {
        var html = data["Value"];
        return html;
    };
    ReferalVisitComponent.prototype.Refer = function () {
        this.loading = true; //disables Refer button
        if (this.selectedProvider && this.selectedProvider.EmployeeId) {
            this.addreferal.emit({ referredProvider: this.selectedProvider });
        }
        else
            this.msgBoxServ.showMessage("error", ["Please!!!Select proper doctor to be referred to."]);
        this.loading = false; //enable Refer button once function completed
    };
    ReferalVisitComponent.prototype.Close = function () {
        this.showReferalPage = false;
    };
    //used to format the display of item in ng-autocomplete.
    ReferalVisitComponent.prototype.ProviderListFormatter = function (data) {
        var html = data["FullName"]; //FullName is a property in the Employee Model.
        //let html = data["Salutation"] + "." + data["FirstName"] + "  " + data["LastName"];
        return html;
    };
    __decorate([
        core_2.Input("visit"),
        __metadata("design:type", visit_model_1.Visit)
    ], ReferalVisitComponent.prototype, "selectedVisit", void 0);
    __decorate([
        core_2.Output("add-referal"),
        __metadata("design:type", core_2.EventEmitter)
    ], ReferalVisitComponent.prototype, "addreferal", void 0);
    __decorate([
        core_2.Input("showReferalPage"),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], ReferalVisitComponent.prototype, "value", null);
    ReferalVisitComponent = __decorate([
        core_1.Component({
            selector: "danphe-referal-visit",
            templateUrl: "/app/appointments/shared/continued-visit/referal-visit.html"
            //,
            //styleUrls: ['themes/theme-default/DanpheStyle.css']
        }),
        __metadata("design:paramtypes", [visit_bl_service_1.VisitBLService,
            messagebox_service_1.MessageboxService])
    ], ReferalVisitComponent);
    return ReferalVisitComponent;
}());
exports.ReferalVisitComponent = ReferalVisitComponent;
//# sourceMappingURL=referal-visit.component.js.map