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
var router_1 = require("@angular/router");
var visit_service_1 = require("../shared/visit.service");
var visit_bl_service_1 = require("../shared/visit.bl.service");
var security_service_1 = require("../../security/shared/security.service");
var core_service_1 = require("../../core/shared/core.service");
var nepali_calendar_service_1 = require("../../shared/calendar/np/nepali-calendar.service");
var common_functions_1 = require("../../shared/common.functions");
//import { Appointment } from "../shared/appointment.model";
var visit_model_1 = require("../shared/visit.model");
var quick_appointment_view_model_1 = require("../shared/quick-appointment-view.model");
//Parse, validate, manipulate, and display dates and times in JS.
var moment = require("moment/moment");
var messagebox_service_1 = require("../../shared/messagebox/messagebox.service");
var patient_service_1 = require("../../patients/shared/patient.service");
var callback_service_1 = require("../../shared/callback.service");
var routefrom_service_1 = require("../../shared/routefrom.service");
var billing_service_1 = require("../../billing/shared/billing.service");
var billing_transaction_item_model_1 = require("../../billing/shared/billing-transaction-item.model");
var billing_transaction_model_1 = require("../../billing/shared/billing-transaction.model");
var billing_receipt_model_1 = require("../../billing/shared/billing-receipt.model");
var appointment_service_1 = require("../shared/appointment.service");
var VisitComponent = /** @class */ (function () {
    function VisitComponent(visitBLService, visitService, callbackservice, securityService, router, coreService, msgBoxServ, npCalendarService, patientService, billingService, routeFromService, appointmentService) {
        this.visitBLService = visitBLService;
        this.visitService = visitService;
        this.callbackservice = callbackservice;
        this.securityService = securityService;
        this.router = router;
        this.coreService = coreService;
        this.msgBoxServ = msgBoxServ;
        this.npCalendarService = npCalendarService;
        this.patientService = patientService;
        this.billingService = billingService;
        this.routeFromService = routeFromService;
        this.appointmentService = appointmentService;
        this.CurrentVisit = new visit_model_1.Visit();
        this.currentQuickAppointment = new quick_appointment_view_model_1.QuickAppointmentView();
        this.departmentId = 0;
        this.doctorList = [];
        this.billStatus = null;
        this.test = true;
        this.enableCheckAvlBtn = false;
        //start: for check availability: added, 20Jan'17-sudarshan
        this.showSchedules = false;
        this.existingPatientVisits = new Array();
        //end: for check availability: added, 20Jan'17-sudarshan
        this.currBillCounterId = null;
        //flag for Show exsting patient list with some details
        this.showExstingPatientList = false;
        //Matching Patient List
        this.matchedPatientList = new Array();
        // this used to disble the drop down of CountrySubDivision or district/state
        this.disableTextBox = true;
        // to store the CountrySubDivision which we are getting in GetCountrySubDivision
        this.CountrySubDivisionList = [];
        //declare boolean loading variable for disable the double click event of button
        this.loading = false;
        ///this is used to check provider
        this.checkProvider = false;
        this.taxPercent = 0;
        this.calType = "";
        //ramavatar: 20aug'18
        this.OPDBillItem = new billing_transaction_item_model_1.BillingTransactionItem();
        this.HealthCardBillItem = new billing_transaction_item_model_1.BillingTransactionItem();
        this.issueHealthCard = false; //bind with healthcard checkbox
        this.visitParticulars = new Array();
        this.visitBillTotal = 0;
        this.healthCardFound = false;
        this.currBillCounterId = this.securityService.getLoggedInCounter().CounterId;
        this.taxPercent = this.billingService.taxPercent;
        this.taxId = this.billingService.taxId;
        if (this.currBillCounterId) {
            this.loadHealthCardBillItem();
            this.GetVisitDoctors();
            this.LoadCalendarTypes();
            this.CurrentVisit = visitService.CreateNewGlobal();
            this.CurrentVisit.VisitDate = moment().format('YYYY-MM-DD');
            this.CurrentVisit.VisitTime = moment().add(5, 'minutes').format('HH:mm');
            if (this.patientService.globalPatient.PatientId || this.appointmentService.globalAppointment.AppointmentId) {
                if (this.routeFromService.RouteFrom == "appointment" && this.appointmentService.globalAppointment.AppointmentId) {
                    this.AssignAppointmentToCurrAppt();
                    this.routeFromService.RouteFrom = null;
                }
                else {
                    this.AssignPatientPropertiesToCurrAppt();
                }
            }
            //this.GenerateDoctorList();
            ////assign countryid only when it's null or 0 or empty. 
            if (!this.currentQuickAppointment.Patient.CountryId) {
                this.currentQuickAppointment.Patient.CountryId = this.GetCountryParameter();
                this.GetCountrySubDivision();
            }
            //if the date isnull then only load default dob
            if (this.currentQuickAppointment.Patient.DateOfBirth == null) {
                this.currentQuickAppointment.Patient.DateOfBirth = moment().format('YYYY-MM-DD');
            }
            //this is loaded in contructor because we have to check for default condition of the dob is verifed ..
            this.ConditionalValidationOfAgeAndDOB();
        }
        else {
            this.callbackservice.CallbackRoute = '/Appointment/PatientSearch';
            this.router.navigate(['/Billing/CounterActivate']);
        }
    }
    VisitComponent.prototype.GetVisitDoctors = function () {
        var _this = this;
        if (!this.appointmentService.globalAppointment.ProviderId) {
            this.selProvider = null;
        }
        this.showSchedules = false;
        this.visitBLService.GetVisitDoctors()
            .subscribe(function (res) {
            if (res.Status == "OK") {
                _this.filteredDocList = _this.doctorList = res.Results;
                _this.AssignSelectedDoctor();
            }
            else {
                _this.msgBoxServ.showMessage("failed", ["Not able to load doctor's list."]);
                console.log(res.ErrorMessage);
            }
        });
    };
    VisitComponent.prototype.FilterDoctorList = function () {
        var _this = this;
        this.selProvider = null;
        this.ResetPrice();
        if (this.departmentId && Number(this.departmentId) != 0)
            this.filteredDocList = this.doctorList.filter(function (doc) { return doc.DepartmentId == _this.departmentId; });
        else
            this.filteredDocList = this.doctorList;
    };
    VisitComponent.prototype.GenerateDoctorList = function () {
        var _this = this;
        //erases previously selected doctor and clears respective schedule list
        this.selProvider = null;
        this.showSchedules = false;
        this.visitBLService.GenerateDoctorList(this.departmentId)
            .subscribe(function (res) { return _this.CallBackGenerateDoctor(res); });
    };
    //this is a success callback of GenerateDoctorList function.
    VisitComponent.prototype.CallBackGenerateDoctor = function (res) {
        var _this = this;
        if (res.Status == "OK") {
            this.doctorList = [];
            //format return list into Key:Value form, since it searches also by the property name of json.
            if (res && res.Results) {
                res.Results.forEach(function (a) {
                    _this.doctorList.push({
                        "Key": a.EmployeeId, "Value": a.FullName, DeptId: a.DepartmentId
                    });
                });
                var provIdFromAppt_1 = this.appointmentService.globalAppointment.ProviderId;
                if (provIdFromAppt_1 != null) {
                    var selProvFromAppt = this.doctorList.find(function (d) { return d.Key == provIdFromAppt_1; });
                    this.selProvider = selProvFromAppt;
                }
            }
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
    };
    //for visit creation
    //// this is used to get data from master table according to the countryId
    VisitComponent.prototype.GetCountrySubDivision = function () {
        var _this = this;
        if (this.currentQuickAppointment.Patient.CountryId != 0) {
            this.disableTextBox = false;
        }
        var countryId = this.currentQuickAppointment.Patient.CountryId;
        //this.appointmentBLService.GetCountrySubDivision(countryId)
        this.visitBLService.GetCountrySubDivision(countryId)
            .subscribe(function (res) {
            if (res.Status == 'OK') {
                _this.CountrySubDivisionList = [];
                res.Results.forEach(function (a) {
                    _this.CountrySubDivisionList.push({
                        "Key": a.CountrySubDivisionId, "Value": a.CountrySubDivisionName
                    });
                });
                var countryJson = _this.coreService.Parameters.filter(function (a) { return a.ParameterName == 'DefaultCountry'; })[0]["ParameterValue"];
                var cId = JSON.parse(countryJson).CountryId;
                if (cId == countryId) {
                    var DefaultSubDivisionName = JSON.parse(_this.coreService.Parameters.filter(function (a) { return a.ParameterName == 'DefaultCountrySubDivision'; })[0]["ParameterValue"]);
                    if (DefaultSubDivisionName) {
                        _this.selDistrict = DefaultSubDivisionName.CountrySubDivisionName;
                        _this.currentQuickAppointment.Patient.CountrySubDivisionId = DefaultSubDivisionName.CountrySubDivisionId;
                    }
                }
                else {
                    _this.selDistrict = null;
                }
                if (_this.patientService.globalPatient.PatientId) {
                    //changed: sud: 27May'18
                    var selDstcrct = _this.CountrySubDivisionList.find(function (a) { return a.Key == _this.currentQuickAppointment.Patient.CountrySubDivisionId; });
                    if (selDstcrct) {
                        _this.selDistrict = selDstcrct.Value;
                    }
                    //this.selDistrict = this.CountrySubDivisionList.filter(a => a.Key == this.currentQuickAppointment.Patient.CountrySubDivisionId)[0].Value;
                    //this.selDistrict = this.CountrySubDivisionList.filter(a => a.Key == this.currentQuickAppointment.Patient.CountrySubDivisionId)[0];
                }
            }
            else {
                _this.msgBoxServ.showMessage("failed", ['failed get State/District. please check log for details.']);
                console.log(res.ErrorMessage);
            }
        }, function (err) {
            _this.msgBoxServ.showMessage("failed", ['failed get State/District. please check log for details.']);
        });
    };
    //used to format display of item in ng-autocomplete.
    VisitComponent.prototype.myListFormatter = function (data) {
        var html = data["ProviderName"];
        return html;
    };
    //formatter for district/state autocomplete search text box
    VisitComponent.prototype.districtListFormatter = function (data) {
        var html = data["Value"];
        return html;
    };
    VisitComponent.prototype.ProviderChanged = function () {
        var _this = this;
        this.showSchedules = false;
        this.checkProvider = false;
        //show the departmentid when provider is selected.
        this.departmentId = this.selProvider ? this.selProvider.DeptId : 0;
        if (this.selProvider && this.departmentId) {
            //this.appointmentBLService.GetTotalAmountByProviderId(this.selProvider.Key)
            this.visitBLService.GetTotalAmountByProviderId(this.selProvider.Key)
                .subscribe(function (res) {
                _this.currentQuickAppointment.Price = res.Results[0];
                _this.CalculatePriceOnChange();
            });
        }
    };
    //for visit creation
    VisitComponent.prototype.MembershipTypeChanged = function () {
        var _this = this;
        if (this.currentQuickAppointment.PatientMembershipTypeId) {
            this.visitBLService.GetMembershipDeatilsByMembershipTyepId(this.currentQuickAppointment.PatientMembershipTypeId)
                .subscribe(function (res) {
                if (res.Status == "OK") {
                    if (res.Results) {
                        _this.currentQuickAppointment.DiscountPercent = res.Results.DiscountPercent;
                        _this.CalculatePriceOnChange();
                    }
                    else {
                    }
                }
            });
        }
    };
    VisitComponent.prototype.GetCountryParameter = function () {
        var countryId = 0;
        try {
            var countryJson = this.coreService.Parameters.filter(function (a) { return a.ParameterName == 'DefaultCountry'; })[0]["ParameterValue"];
            countryId = JSON.parse(countryJson).CountryId;
        }
        catch (ex) {
            countryId = 0;
        }
        return countryId;
    };
    VisitComponent.prototype.NepCalendarOnDateChange = function () {
        var engDate = this.npCalendarService.ConvertNepToEngDate(this.nepaliDob);
        this.currentQuickAppointment.Patient.DateOfBirth = moment(engDate).format("YYYY-MM-DD");
        ;
    };
    VisitComponent.prototype.EngCalendarOnDateChange = function () {
        if (this.currentQuickAppointment.Patient.DateOfBirth) {
            var nepDate = this.npCalendarService.ConvertEngToNepDate(this.currentQuickAppointment.Patient.DateOfBirth);
            this.nepaliDob = nepDate;
        }
    };
    //calculate DOB from age and ageUnit 
    VisitComponent.prototype.CalculateDob = function () {
        if (this.currentQuickAppointment.Patient.Age && this.currentQuickAppointment.Patient.AgeUnit) {
            var age = Number(this.currentQuickAppointment.Patient.Age);
            var ageUnit = this.currentQuickAppointment.Patient.AgeUnit;
            this.currentQuickAppointment.Patient.DateOfBirth = this.patientService.CalculateDOB(age, ageUnit);
        }
    };
    //for visit creation
    //age is stored in the format '25M', so separation is needed to map with the client object.
    VisitComponent.prototype.SeperateAgeAndUnit = function (age) {
        if (age) {
            var length = age.length;
            this.currentQuickAppointment.Patient.AgeUnit = age.slice(length - 1, length);
            this.currentQuickAppointment.Patient.Age = age.slice(0, length - 1);
        }
    };
    //FOR Quick Appointment--needs proper revision.
    VisitComponent.prototype.AssignPatientPropertiesToCurrAppt = function () {
        var currPatient = this.patientService.getGlobal();
        this.CurrentVisit.PatientId = currPatient.PatientId;
        this.currentQuickAppointment.Patient.FirstName = currPatient.FirstName;
        this.currentQuickAppointment.Patient.LastName = currPatient.LastName;
        this.currentQuickAppointment.Patient.Gender = currPatient.Gender;
        this.currentQuickAppointment.Patient.PhoneNumber = currPatient.PhoneNumber;
        this.currentQuickAppointment.Patient.MiddleName = currPatient.MiddleName;
        this.currentQuickAppointment.Patient.IsDobVerified = currPatient.IsDobVerified;
        this.currentQuickAppointment.Patient.DateOfBirth = currPatient.DateOfBirth;
        this.currentQuickAppointment.Patient.CountryId = currPatient.CountryId;
        this.currentQuickAppointment.Patient.CountrySubDivisionId = currPatient.CountrySubDivisionId;
        this.currentQuickAppointment.PatientMembershipTypeId = currPatient.MembershipTypeId;
        this.currentQuickAppointment.Patient.Address = currPatient.Address;
        //this.selDistrict = this.CountrySubDivisionList.filter(a => a.Key == this.currentQuickAppointment.Patient.CountrySubDivisionId)[0];
        this.SeperateAgeAndUnit(currPatient.Age);
        this.GetCountrySubDivision();
        //call this function to load the membership discount if its existing patient.. 
        this.MembershipTypeChanged();
        this.LoadPATHealthCardStatus(currPatient.PatientId);
    };
    //FOR Appointment to Visit--needs proper revision.
    VisitComponent.prototype.AssignAppointmentToCurrAppt = function () {
        var currPatient = this.patientService.getGlobal();
        var currAppt = this.appointmentService.getGlobal();
        if (currPatient.PatientId) {
            this.CurrentVisit.PatientId = currPatient.PatientId;
            this.currentQuickAppointment.Patient.IsDobVerified = currPatient.IsDobVerified;
            this.currentQuickAppointment.Patient.DateOfBirth = currPatient.DateOfBirth;
            this.currentQuickAppointment.Patient.CountryId = currPatient.CountryId;
            this.currentQuickAppointment.Patient.CountrySubDivisionId = currPatient.CountrySubDivisionId;
            this.currentQuickAppointment.PatientMembershipTypeId = currPatient.MembershipTypeId;
            this.currentQuickAppointment.Patient.Address = currPatient.Address;
            this.SeperateAgeAndUnit(currPatient.Age);
            this.GetCountrySubDivision();
            //call this function to load the membership discount if its existing patient.. 
            this.MembershipTypeChanged();
        }
        else {
            this.CurrentVisit.VisitDate = moment(currAppt.AppointmentDate).format('YYYY-MM-DD');
            this.CurrentVisit.VisitTime = currAppt.AppointmentTime;
        }
        if (currAppt.ProviderName && currAppt.ProviderId) {
            this.selProvider = currAppt.ProviderName;
            this.CurrentVisit.ProviderId = currAppt.ProviderId;
            this.checkProvider = false;
        }
        this.departmentId = currAppt.DepartmentId;
        this.currentQuickAppointment.Patient.PhoneNumber = currPatient.PhoneNumber;
        this.currentQuickAppointment.Patient.FirstName = currPatient.FirstName;
        this.currentQuickAppointment.Patient.LastName = currPatient.LastName;
        this.currentQuickAppointment.Patient.Gender = currPatient.Gender;
        this.currentQuickAppointment.Patient.MiddleName = currPatient.MiddleName;
    };
    //adding a new appointment
    VisitComponent.prototype.AddVisit = function () {
        var aptPat = this.appointmentService.getGlobal();
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentVisit.VisitValidator.controls) {
            this.CurrentVisit.VisitValidator.controls[i].markAsDirty();
            this.CurrentVisit.VisitValidator.controls[i].updateValueAndValidity();
        }
        for (var i in this.currentQuickAppointment.QuickAppointmentValidator.controls) {
            this.currentQuickAppointment.QuickAppointmentValidator.controls[i].markAsDirty();
            this.currentQuickAppointment.QuickAppointmentValidator.controls[i].updateValueAndValidity();
        }
        ////Update Status of Appointment
        //if (aptPat.AppointmentId) {
        //    this.visitBLService.UpdateAppointmentStatus(aptPat.AppointmentId, "checkedin")
        //        .subscribe(res => {
        //            if (res.Status != "OK") {
        //                this.msgBoxServ.showMessage("Failed", ['Your Status was not Updated Please try again later'])
        //            }
        //        });
        //}
        if (this.CurrentVisit.ProviderId) {
            if (this.CurrentVisit.IsValid(undefined, undefined) && this.currentQuickAppointment.IsValid(undefined, undefined)) {
                this.loading = true;
                if (this.currentQuickAppointment.Patient.Age && this.currentQuickAppointment.Patient.AgeUnit) {
                    this.currentQuickAppointment.Patient.Age = this.currentQuickAppointment.Patient.Age;
                }
                else {
                    if (this.currentQuickAppointment.Patient.DateOfBirth) {
                        var age = common_functions_1.CommonFunctions.GetFormattedAge(this.currentQuickAppointment.Patient.DateOfBirth);
                        var splitted = age.split(" ", 2);
                        this.currentQuickAppointment.Patient.AgeUnit = splitted[1];
                        this.currentQuickAppointment.Patient.Age = splitted[0];
                    }
                }
                //Check This is check in request or new visit creation                
                if (this.CurrentVisit.PatientId == 0) {
                    //Get existing patient list by FirstName, LastName, Mobile Number
                    this.GetExistedMatchingPatientList();
                }
                else {
                    //make quickAppointment object with all values like patient, BillingTransaction,BillingTransactionItems and Visit
                    this.AssignAllBillAndVisitDetails();
                }
            }
        }
        else {
            //if checkProvider = true then it show an error msg in cshtml...
            this.checkProvider = true;
            //this.msgBoxServ.showMessage("notice", ['Please select appropriate Docotor']);
        }
    };
    //after appointment is succesfully added this function is called.
    VisitComponent.prototype.CallBackAddQuickAppointment = function (res) {
        if (res.Status == "OK") {
            var qckAppt = res.Results;
            var returnReceipt = billing_receipt_model_1.BillingReceiptModel.GetReceiptForTransaction(qckAppt.BillingTransaction);
            returnReceipt.IsValid = true;
            returnReceipt.Patient = qckAppt.Patient;
            returnReceipt.VisitId = qckAppt.Visit.PatientVisitId;
            returnReceipt.Remarks = qckAppt.BillingTransaction.Remarks;
            returnReceipt.CurrentFinYear = qckAppt.BillingTransaction.FiscalYear; //this comes from server side. 
            returnReceipt.BillingUser = this.securityService.GetLoggedInUser().UserName;
            returnReceipt.BillingType = "opd-billing";
            this.routeFromService.RouteFrom = "OPD";
            this.billingService.globalBillingReceipt = returnReceipt;
            var apptObject_1 = this.appointmentService.getGlobal();
            try {
                //Update Status of Appointment
                if (apptObject_1.AppointmentId) {
                    this.visitBLService.UpdateAppointmentStatus(this.appointmentService.getGlobal().AppointmentId, "checkedin")
                        .subscribe(function (res) {
                        if (res.Status == "OK") {
                            console.log("appointment status of apptId:" + apptObject_1.AppointmentId + " updated successfully. ");
                            //this.msgBoxServ.showMessage("Failed", ['Your Status was not Updated Please try again later'])
                        }
                        else {
                            console.log("couldn't update status of appointment id: " + apptObject_1.AppointmentId);
                        }
                    });
                }
            }
            catch (ex) {
                console.log("couldn't update status of appointment id: " + apptObject_1.AppointmentId);
                //do nothing here.. 
            }
            this.router.navigate(['/Billing/ReceiptPrint']);
        }
        else {
            this.loading = false;
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            console.log(res.ErrorMessage);
        }
    };
    //for visit creation
    VisitComponent.prototype.CalculatePriceOnChange = function () {
        var _this = this;
        if (this.currentQuickAppointment.Price) {
            var taxAmt = 0;
            var price = this.currentQuickAppointment.Price;
            var discountPercent = (this.currentQuickAppointment.DiscountPercent) ? this.currentQuickAppointment.DiscountPercent : 0;
            var discountAmt = common_functions_1.CommonFunctions.parseAmount(price * discountPercent / 100);
            var subTotal = price;
            if (this.currentQuickAppointment.IsTaxApplicable)
                taxAmt = common_functions_1.CommonFunctions.parseAmount(((subTotal - discountAmt) * this.taxPercent) / 100);
            var totalAmt = subTotal - discountAmt + taxAmt;
            this.visitBillTotal = totalAmt; //ramavtar:20Aug'18
            var temp = this.visitParticulars.filter(function (a) { return a.ItemId != _this.HealthCardBillItem.ItemId; });
            if (temp.length > 0) {
                this.visitParticulars[0].Discount = discountAmt;
                this.visitParticulars[0].Amount = subTotal - discountAmt;
            }
            if (this.issueHealthCard) { //
                this.visitBillTotal += this.HealthCardBillItem.Price;
            }
            this.currentQuickAppointment.SubTotal = subTotal;
            this.currentQuickAppointment.DiscountAmount = discountAmt;
            this.currentQuickAppointment.TotalAmount = Math.round(totalAmt);
            this.currentQuickAppointment.TaxAmount = taxAmt;
        }
    };
    VisitComponent.prototype.ResetPrice = function () {
        this.currentQuickAppointment.Price = 0;
        this.currentQuickAppointment.SubTotal = 0;
        this.currentQuickAppointment.DiscountAmount = 0;
        this.currentQuickAppointment.TotalAmount = 0;
        this.currentQuickAppointment.TaxAmount = 0;
    };
    VisitComponent.prototype.LoadDOBdefault = function () {
        var npDateToday = this.npCalendarService.GetTodaysNepDate();
        this.nepaliDob = npDateToday;
        this.NepCalendarOnDateChange();
    };
    //conditional validation for age and Dob
    //if on is passed to the UpdateValidator in model the Age is validated and
    // if off on is passed to the UpdateValidator in model the dob is validated and
    VisitComponent.prototype.ConditionalValidationOfAgeAndDOB = function () {
        if (this.currentQuickAppointment.Patient.IsDobVerified == true) {
            //incase age was entered
            this.currentQuickAppointment.Patient.Age = null;
            var onOff = 'off';
            var formControlName = 'Age';
            this.currentQuickAppointment.UpdateValidator(onOff, formControlName);
            this.currentQuickAppointment.Patient.PatientValidator.controls['Age'].updateValueAndValidity();
        }
        else {
            var onOff = 'on';
            var formControlName = 'Age';
            this.currentQuickAppointment.UpdateValidator(onOff, formControlName);
            this.currentQuickAppointment.Patient.PatientValidator.controls['Age'].updateValueAndValidity();
        }
    };
    //This function get Matching existed patient list from server and shows to user 
    VisitComponent.prototype.GetExistedMatchingPatientList = function () {
        var _this = this;
        this.visitBLService.GetExistedMatchingPatientList(this.currentQuickAppointment.Patient.FirstName, this.currentQuickAppointment.Patient.LastName, this.currentQuickAppointment.Patient.PhoneNumber)
            .subscribe(function (res) {
            if (res.Status == "OK" && res.Results.length > 0) {
                _this.matchedPatientList = new Array();
                var nowYear = Number(moment().format("YYYY"));
                var patYear = Number(_this.currentQuickAppointment.Patient.Age);
                if (_this.currentQuickAppointment.Patient.AgeUnit == 'Y') {
                    res.Results.forEach(function (patient) {
                        var originalYear = Number(moment(patient.DateOfBirth).format("YYYY"));
                        var diff = (nowYear - originalYear - patYear);
                        if ((diff > -3 && diff < 3)
                            || (_this.currentQuickAppointment.Patient.PhoneNumber == patient.PhoneNumber)) {
                            _this.matchedPatientList.push(patient);
                            return true;
                        }
                        else {
                            return false;
                        }
                    });
                }
                else {
                    _this.matchedPatientList = res.Results;
                }
                if (_this.matchedPatientList.length) {
                    _this.showExstingPatientList = true;
                }
                else {
                    _this.showExstingPatientList = false;
                    _this.AssignAllBillAndVisitDetails();
                }
            }
            else {
                _this.AssignAllBillAndVisitDetails();
            }
        }, function (err) {
            _this.loading = false;
            _this.msgBoxServ.showMessage("Please, Try again . Error in Getting Existed Match patient list", [err.ErrorMessage]);
        });
    };
    //This method shows you all mathing Existed patient for Visit Creation
    VisitComponent.prototype.CallBackExistedPatientList = function (res) {
        if (res.Status == "OK" && res.Results.length > 0) {
        }
        else {
            this.showExstingPatientList = false;
            this.matchedPatientList = new Array();
        }
    };
    //This method for creation visit with existed patient    
    VisitComponent.prototype.AssignSelectedPatDetails = function (i) {
        this.showExstingPatientList = false;
        //we are assigning selected patient details for creation visit
        this.CurrentVisit.PatientId = this.matchedPatientList[i].PatientId;
        this.currentQuickAppointment.Patient.FirstName = this.matchedPatientList[i].FirstName;
        this.currentQuickAppointment.Patient.LastName = this.matchedPatientList[i].LastName;
        this.currentQuickAppointment.Patient.Gender = this.matchedPatientList[i].Gender;
        this.currentQuickAppointment.Patient.PhoneNumber = this.matchedPatientList[i].PhoneNumber;
        this.currentQuickAppointment.Patient.MiddleName = this.matchedPatientList[i].MiddleName;
        this.currentQuickAppointment.Patient.IsDobVerified = this.matchedPatientList[i].IsDobVerified;
        this.currentQuickAppointment.Patient.DateOfBirth = moment(this.matchedPatientList[i].DateOfBirth).format('YYYY-MM-DD');
        this.currentQuickAppointment.Patient.CountryId = this.matchedPatientList[i].CountryId;
        this.currentQuickAppointment.Patient.CountrySubDivisionId = this.matchedPatientList[i].CountrySubDivisionId;
        this.currentQuickAppointment.PatientMembershipTypeId = this.matchedPatientList[i].MembershipTypeId;
        this.currentQuickAppointment.Patient.Address = this.matchedPatientList[i].Address;
        //call MakeQuicApptObjectForDBStore() from here
        this.AssignAllBillAndVisitDetails();
    };
    //This method call if End User wants New registration with same information
    VisitComponent.prototype.ProceedAnyway = function () {
        this.showExstingPatientList = false;
        this.CurrentVisit.PatientId = 0;
        //call from here AssignAllBillAndVisitDetails
        this.AssignAllBillAndVisitDetails();
    };
    //This close existing patient list model box
    VisitComponent.prototype.Close = function () {
        this.loading = false;
        this.showExstingPatientList = false;
    };
    //This method assign and make BillingTransaction, BillingTransactionItems and Visit object with proper value
    //This fires when user select existing patient for VisitCreation
    //and call when user wants to create new patient registration 
    //also call when user "check in" patient
    VisitComponent.prototype.AssignAllBillAndVisitDetails = function () {
        var _this = this;
        //sudddd
        var payMode = this.currentQuickAppointment.BillingTransaction.PaymentMode;
        //if (payMode == "credit") {
        //    this.currentQuickAppointment.BillingTransaction.BillStatus = "unpaid";
        //}
        //else {
        //    this.model.BillStatus = "paid";
        //}
        //let billStatus = this.billStatus;
        this.CurrentVisit.AppointmentType = "New";
        var qckVisit = this.currentQuickAppointment;
        qckVisit.Patient.PatientId = this.CurrentVisit.PatientId;
        qckVisit.Visit.VisitTime = this.CurrentVisit.VisitTime;
        qckVisit.Visit.ProviderId = this.CurrentVisit.ProviderId;
        qckVisit.Visit.ProviderName = this.CurrentVisit.ProviderName;
        qckVisit.Visit.VisitDate = moment().format('YYYY-MM-DD HH:mm:ss');
        qckVisit.Visit.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
        qckVisit.Visit.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        qckVisit.Visit.Comments = this.CurrentVisit.Comments;
        qckVisit.Patient.CountryId = this.currentQuickAppointment.Patient.CountryId;
        qckVisit.Patient.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
        qckVisit.Patient.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        qckVisit.Patient.MembershipTypeId = this.currentQuickAppointment.PatientMembershipTypeId;
        qckVisit.Patient.EthnicGroup = this.currentQuickAppointment.EthnicGroup;
        var billTxnItem = new billing_transaction_item_model_1.BillingTransactionItem();
        var selectedDoctor = this.doctorList.find(function (a) { return a.ProviderId == _this.CurrentVisit.ProviderId; });
        billTxnItem.ItemName = selectedDoctor.ItemName;
        billTxnItem.ItemId = this.CurrentVisit.ProviderId;
        billTxnItem.ProcedureCode = this.CurrentVisit.ProviderId.toString(); //Procedure code is DoctorId for OPD-Ticket
        billTxnItem.CounterId = this.currBillCounterId;
        billTxnItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        billTxnItem.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
        //billTxnItem.PaidDate = moment().format('YYYY-MM-DD HH:mm:ss');
        billTxnItem.RequisitionDate = moment().format('YYYY-MM-DD HH:mm:ss');
        billTxnItem.ServiceDepartmentName = "OPD";
        billTxnItem.Quantity = 1;
        billTxnItem.Price = common_functions_1.CommonFunctions.parseAmount(qckVisit.Price);
        billTxnItem.SubTotal = common_functions_1.CommonFunctions.parseAmount(qckVisit.SubTotal);
        billTxnItem.DiscountAmount = common_functions_1.CommonFunctions.parseAmount(qckVisit.DiscountAmount);
        billTxnItem.DiscountPercent = common_functions_1.CommonFunctions.parseAmount(qckVisit.DiscountPercent);
        //here aggregate and normal discountpercent are same, hence sending same data..
        billTxnItem.DiscountPercentAgg = common_functions_1.CommonFunctions.parseAmount(qckVisit.DiscountPercent);
        //Move counterday to server once CounterFeature is added change--sudarshan:25July 
        billTxnItem.CounterDay = moment().format("YYYY-MM-DD");
        billTxnItem.Tax = common_functions_1.CommonFunctions.parseAmount(qckVisit.TaxAmount); // remove hardcode.
        billTxnItem.TaxPercent = this.taxPercent;
        billTxnItem.TotalAmount = common_functions_1.CommonFunctions.parseAmount(qckVisit.TotalAmount);
        if (this.selProvider.IsTaxApplicable)
            billTxnItem.TaxableAmount = common_functions_1.CommonFunctions.parseAmount(billTxnItem.SubTotal - billTxnItem.DiscountAmount);
        else
            billTxnItem.NonTaxableAmount = common_functions_1.CommonFunctions.parseAmount(billTxnItem.SubTotal - billTxnItem.DiscountAmount);
        billTxnItem.BillStatus = payMode == "credit" ? "unpaid" : "paid"; //billstatus is paid for all other than credit
        if (billTxnItem.BillStatus == "paid") {
            billTxnItem.PaidCounterId = this.currBillCounterId;
            billTxnItem.PaidDate = moment().format('YYYY-MM-DD HH:mm:ss');
            billTxnItem.PaymentReceivedBy = this.securityService.GetLoggedInUser().EmployeeId;
        }
        billTxnItem.PatientId = 0; ///assign it from server.
        billTxnItem.ProviderId = this.CurrentVisit.ProviderId;
        billTxnItem.ProviderName = this.CurrentVisit.ProviderName;
        var billTxn = new billing_transaction_model_1.BillingTransaction();
        billTxn.BillingTransactionItems = [billTxnItem];
        if (this.issueHealthCard) { //ramavatar: 20aug
            //add healthcard item to billTxn
            var txnItm = new billing_transaction_item_model_1.BillingTransactionItem();
            txnItm.ItemName = this.HealthCardBillItem.ItemName;
            txnItm.ItemId = this.HealthCardBillItem.ItemId;
            txnItm.ProcedureCode = this.HealthCardBillItem.ProcedureCode;
            txnItm.CounterId = this.currBillCounterId;
            txnItm.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            txnItm.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
            txnItm.RequisitionDate = moment().format('YYYY-MM-DD HH:mm:ss');
            txnItm.ServiceDepartmentId = this.HealthCardBillItem.ServiceDepartmentId;
            txnItm.Quantity = 1;
            txnItm.Price = common_functions_1.CommonFunctions.parseAmount(this.HealthCardBillItem.Price);
            txnItm.SubTotal = common_functions_1.CommonFunctions.parseAmount(this.HealthCardBillItem.Price);
            txnItm.DiscountAmount = 0; //no discount as of now
            txnItm.DiscountPercent = 0;
            txnItm.DiscountPercentAgg = 0;
            //Move counterday to server once CounterFeature is added change--sudarshan:25July 
            txnItm.CounterDay = moment().format("YYYY-MM-DD");
            txnItm.Tax = 0; // remove hardcode.
            txnItm.TaxPercent = this.taxPercent;
            txnItm.TotalAmount = this.HealthCardBillItem.Price; //right now we dont have any tax or disount on health card, so price is taken  directly as totalAmount
            txnItm.NonTaxableAmount = txnItm.SubTotal - txnItm.DiscountAmount;
            txnItm.BillStatus = payMode == "credit" ? "unpaid" : "paid"; //billstatus is paid for all other than credit
            if (txnItm.BillStatus == "paid") {
                txnItm.PaidCounterId = this.currBillCounterId;
                txnItm.PaidDate = moment().format('YYYY-MM-DD HH:mm:ss');
                txnItm.PaymentReceivedBy = this.securityService.GetLoggedInUser().EmployeeId;
            }
            txnItm.PatientId = 0; ///assign it from server.
            txnItm.ProviderId = this.CurrentVisit.ProviderId;
            txnItm.ProviderName = this.CurrentVisit.ProviderName;
            billTxn.BillingTransactionItems.push(txnItm);
        }
        ////assign below properties in server side.
        billTxn.PatientId = 0; //assign it from server.
        billTxn.PatientVisitId = 0; //assign it from server.
        billTxn.CounterId = this.currBillCounterId;
        // billTxn.PaidDate = moment().format('YYYY-MM-DD HH:mm:ss');
        billTxn.TransactionType = "ItemTransaction"; //remove hardcode.
        billTxn.TotalQuantity = 1;
        billTxn.SubTotal = common_functions_1.CommonFunctions.parseAmount(qckVisit.SubTotal + (this.issueHealthCard ? this.HealthCardBillItem.Price : 0));
        billTxn.DiscountPercent = common_functions_1.CommonFunctions.parseAmount(qckVisit.DiscountPercent);
        billTxn.DiscountAmount = common_functions_1.CommonFunctions.parseAmount(qckVisit.DiscountAmount);
        billTxn.TotalAmount = common_functions_1.CommonFunctions.parseAmount(qckVisit.TotalAmount + (this.issueHealthCard ? this.HealthCardBillItem.Price : 0));
        billTxn.PaidAmount = common_functions_1.CommonFunctions.parseAmount(qckVisit.TotalAmount + (this.issueHealthCard ? this.HealthCardBillItem.Price : 0));
        billTxn.TaxTotal = common_functions_1.CommonFunctions.parseAmount(qckVisit.TaxAmount);
        if (this.selProvider.IsTaxApplicable)
            billTxn.TaxableAmount = common_functions_1.CommonFunctions.parseAmount(billTxn.SubTotal - billTxn.DiscountAmount);
        else
            billTxn.NonTaxableAmount = common_functions_1.CommonFunctions.parseAmount(billTxn.SubTotal - billTxn.DiscountAmount);
        billTxn.Tender = common_functions_1.CommonFunctions.parseAmount(billTxn.TotalAmount);
        billTxn.Change = 0;
        billTxn.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        billTxn.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
        billTxn.CounterId = this.currBillCounterId;
        billTxn.Remarks = this.currentQuickAppointment.BillingTransaction.Remarks;
        billTxn.TaxId = this.taxId;
        billTxn.PaymentMode = this.currentQuickAppointment.BillingTransaction.PaymentMode;
        billTxn.BillStatus = payMode == "credit" ? "unpaid" : "paid"; //billstatus is paid for all other than credit
        if (billTxn.BillStatus == "paid") {
            billTxn.PaidCounterId = this.currBillCounterId;
            billTxn.PaidDate = moment().format('YYYY-MM-DD HH:mm:ss');
            billTxn.PaymentReceivedBy = this.securityService.GetLoggedInUser().EmployeeId;
        }
        this.currentQuickAppointment.BillingTransaction = billTxn;
        this.currentQuickAppointment.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.currentQuickAppointment.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
        this.currentQuickAppointment.Patient.Age = this.currentQuickAppointment.Patient.Age + this.currentQuickAppointment.Patient.AgeUnit;
        if (((this.currentQuickAppointment.BillingTransaction.DiscountPercent && this.currentQuickAppointment.BillingTransaction.DiscountPercent > 0)) && (!this.currentQuickAppointment.BillingTransaction.Remarks)) {
            this.msgBoxServ.showMessage("failed", ["Remarks is mandatory."]);
            this.loading = false;
        }
        else if (this.currentQuickAppointment.BillingTransaction.DiscountPercent && this.currentQuickAppointment.BillingTransaction.DiscountPercent > 100) {
            this.msgBoxServ.showMessage("failed", ["Discount percent cannot be greater than 100"]);
            this.loading = false;
        }
        //total amount could be zero when discountperecent is 100, in other cases we should restrict it.
        else if (this.currentQuickAppointment.BillingTransaction.TotalAmount <= 0 && this.currentQuickAppointment.BillingTransaction.DiscountPercent != 100) {
            this.msgBoxServ.showMessage("failed", ["Total amount is Zero, please update OPD charge from settings and proceed."]);
            this.loading = false;
        }
        else {
            this.visitBLService.PostVisitToDB(qckVisit)
                .subscribe(function (res) {
                _this.CallBackAddQuickAppointment(res);
            }, function (err) {
                _this.loading = false;
                _this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
            });
        }
    };
    //loads CalendarTypes from Paramter Table (database) and assign the require CalendarTypes to local variable.
    VisitComponent.prototype.LoadCalendarTypes = function () {
        var Parameter = this.coreService.Parameters;
        Parameter = Parameter.filter(function (parms) { return parms.ParameterName == "CalendarTypes"; });
        var calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
        this.calType = calendarTypeObject.PatientVisit;
    };
    //OnPaymentModeChange() {
    //    let payMode = this.currentQuickAppointment.BillingTransaction.PaymentMode;
    //    if (payMode == "credit") {
    //        this.currentQuickAppointment.BillingTransaction.BillStatus = "unpaid";
    //        if (this.model.BillingTransactionItems) {
    //            this.model.BillingTransactionItems.forEach(txnItm => {
    //                txnItm.BillStatus = "unpaid";
    //            });
    //        }
    //    }
    //    else {
    //        this.model.BillStatus = "paid";
    //    }
    //}
    VisitComponent.prototype.DistrictChanged = function () {
        this.currentQuickAppointment;
        this.currentQuickAppointment.Patient.CountrySubDivisionId = this.selDistrict ? this.selDistrict.Key : null;
    };
    VisitComponent.prototype.AssignSelectedDoctor = function () {
        var _this = this;
        var doctor = null;
        // check if user has given proper input string for item name
        //or has selected object properly from the dropdown list.
        if (this.selProvider) {
            if (typeof (this.selProvider) == 'string' && this.doctorList.length) {
                doctor = this.doctorList.find(function (a) { return a.ProviderName.toLowerCase() == _this.selProvider.toLowerCase(); });
            }
            else if (typeof (this.selProvider) == 'object')
                doctor = this.selProvider;
            if (doctor) {
                //to filter doctor List after department is changed (flow: assigning department by selecting doctor).
                this.departmentId = doctor.DepartmentId;
                this.FilterDoctorList();
                //FilterDoctorList sets selProvider to null value.
                this.selProvider = doctor.ProviderName;
                this.CurrentVisit.ProviderId = doctor.ProviderId; //this will give providerid
                this.CurrentVisit.ProviderName = doctor.ProviderName;
                this.CurrentVisit.IsValidSelProvider = true;
                this.currentQuickAppointment.IsTaxApplicable = doctor.IsTaxApplicable;
                this.currentQuickAppointment.Price = doctor.Price;
                this.UpdateParticularList(doctor);
                this.CalculatePriceOnChange();
            }
            else
                this.CurrentVisit.IsValidSelProvider = false;
        }
        else
            this.CurrentVisit.IsValidSelProvider = false;
    };
    //captalize first letter (controlName for field is use to update)
    VisitComponent.prototype.capitalizeFirstLetter = function (controlName) {
        var str = this.currentQuickAppointment.QuickAppointmentValidator.controls[controlName].value;
        var returnStr = common_functions_1.CommonFunctions.CapitalizeFirstLetter(str);
        this.currentQuickAppointment.QuickAppointmentValidator.controls[controlName].setValue(returnStr);
    };
    //ramavtar: 20Aug'18
    VisitComponent.prototype.IssueHealthCardOnChange = function () {
        var _this = this;
        if (this.issueHealthCard) {
            this.visitParticulars.push({
                ItemId: this.HealthCardBillItem.ItemId, ItemName: this.HealthCardBillItem.ItemName,
                Price: this.HealthCardBillItem.Price, Discount: 0, Amount: this.HealthCardBillItem.Price
            });
            this.CalculatePriceOnChange();
        }
        else if (!this.issueHealthCard) {
            this.visitParticulars = this.visitParticulars.filter(function (a) { return a.ItemId != _this.HealthCardBillItem.ItemId; });
            this.CalculatePriceOnChange();
        }
    };
    VisitComponent.prototype.loadHealthCardBillItem = function () {
        var _this = this;
        this.visitBLService.GetHealthCardBillItem().subscribe(function (res) {
            if (res.Status == "OK") {
                _this.HealthCardBillItem = res.Results;
            }
            else {
                _this.msgBoxServ.showMessage('Failed', [res.ErrorMessage]);
            }
        });
    };
    VisitComponent.prototype.UpdateParticularList = function (itm) {
        var _this = this;
        this.visitParticulars = this.visitParticulars.filter(function (a) { return a.ItemId == _this.HealthCardBillItem.ItemId; });
        this.visitParticulars.unshift({ ItemId: 12, ItemName: itm.ItemName, Discount: 0, Price: itm.Price, Amount: itm.Price });
    };
    VisitComponent.prototype.LoadPATHealthCardStatus = function (patId) {
        var _this = this;
        this.visitBLService.GetPatHealthCardStatus(patId)
            .subscribe(function (res) {
            if (res.Status == "OK") {
                _this.healthCardFound = res.Results;
            }
        });
    };
    VisitComponent = __decorate([
        core_1.Component({
            templateUrl: "/AppointmentView/Visit"
        }),
        __metadata("design:paramtypes", [visit_bl_service_1.VisitBLService,
            visit_service_1.VisitService, callback_service_1.CallbackService,
            security_service_1.SecurityService, router_1.Router, core_service_1.CoreService,
            messagebox_service_1.MessageboxService, nepali_calendar_service_1.NepaliCalendarService, patient_service_1.PatientService,
            billing_service_1.BillingService, routefrom_service_1.RouteFromService, appointment_service_1.AppointmentService])
    ], VisitComponent);
    return VisitComponent;
}());
exports.VisitComponent = VisitComponent;
//# sourceMappingURL=visit.component.js.map