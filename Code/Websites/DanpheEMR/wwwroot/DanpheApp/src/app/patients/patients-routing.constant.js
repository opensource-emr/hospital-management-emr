"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientsRoutingConstant = void 0;
var patient_deactivate_guard_1 = require("./shared/patient-deactivate-guard");
var reset_patientcontext_guard_1 = require("../shared/reset-patientcontext-guard");
var patients_dashboard_component_1 = require("../dashboards/patients/patients-dashboard.component");
var auth_guard_service_1 = require("../security/shared/auth-guard.service");
var patient_list_component_1 = require("./patient-list/patient-list.component");
var patients_main_component_1 = require("./patients-main.component");
var patient_registration_main_component_1 = require("./registration/patient-registration-main.component");
var patient_basic_info_component_1 = require("./registration/basic-info/patient-basic-info.component");
var address_component_1 = require("./registration/address/address.component");
var guarantor_component_1 = require("./registration/guarantor/guarantor.component");
var insurance_info_component_1 = require("./registration/insurance/insurance-info.component");
var kin_emergency_contact_component_1 = require("./registration/kin/kin-emergency-contact.component");
var profile_pic_component_1 = require("./profile-pic/profile-pic.component");
var _404_not_found_component_1 = require("../404-error/404-not-found.component");
exports.PatientsRoutingConstant = [
    {
        path: '',
        component: patients_main_component_1.PatientsMainComponent, canActivate: [auth_guard_service_1.AuthGuardService], canDeactivate: [reset_patientcontext_guard_1.ResetPatientcontextGuard],
        children: [
            { path: '', redirectTo: 'SearchPatient', pathMatch: 'full' },
            { path: 'Dashboard', component: patients_dashboard_component_1.PatientsDashboardComponent, canActivate: [auth_guard_service_1.AuthGuardService] },
            { path: 'SearchPatient', component: patient_list_component_1.PatientListComponent, canActivate: [auth_guard_service_1.AuthGuardService] },
            {
                path: 'RegisterPatient', component: patient_registration_main_component_1.PatientRegistrationMainComponent, canActivate: [auth_guard_service_1.AuthGuardService], canDeactivate: [reset_patientcontext_guard_1.ResetPatientcontextGuard],
                children: [
                    { path: '', redirectTo: 'BasicInfo', pathMatch: 'full' },
                    { path: 'BasicInfo', component: patient_basic_info_component_1.PatientBasicInfoComponent, canActivate: [auth_guard_service_1.AuthGuardService] },
                    { path: 'Address', component: address_component_1.AddressComponent, canActivate: [auth_guard_service_1.AuthGuardService], canDeactivate: [patient_deactivate_guard_1.PatientDeactivateGuard] },
                    { path: 'Guarantor', component: guarantor_component_1.GuarantorComponent, canActivate: [auth_guard_service_1.AuthGuardService], canDeactivate: [patient_deactivate_guard_1.PatientDeactivateGuard] },
                    { path: 'Insurance', component: insurance_info_component_1.InsuranceInfoComponent, canActivate: [auth_guard_service_1.AuthGuardService], canDeactivate: [patient_deactivate_guard_1.PatientDeactivateGuard] },
                    { path: 'KinEmergencyContact', component: kin_emergency_contact_component_1.KinEmergencyContactComponent, canActivate: [auth_guard_service_1.AuthGuardService], canDeactivate: [patient_deactivate_guard_1.PatientDeactivateGuard] },
                    { path: "ProfilePic", component: profile_pic_component_1.PatientProfilePicComponent },
                    { path: "**", component: _404_not_found_component_1.PageNotFound }
                ]
            },
            { path: "**", component: _404_not_found_component_1.PageNotFound }
        ]
    },
    { path: "**", component: _404_not_found_component_1.PageNotFound }
];
//# sourceMappingURL=patients-routing.constant.js.map