"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorsRoutingConstant = void 0;
var doctors_main_component_1 = require("../doctors/doctors-main.component");
var doctor_dashboard_component_1 = require("./dashboard/doctor-dashboard.component");
var patient_overview_main_component_1 = require("../doctors/patient/patient-overview-main.component");
var patient_overview_component_1 = require("../doctors/patient/patient-overview.component");
var select_visit_canactivate_guard_1 = require("../shared/select-visit-canactivate-guard");
var patient_visit_history_component_1 = require("../doctors/patient/patient-visit-history.component");
var reset_patientcontext_guard_1 = require("../shared/reset-patientcontext-guard");
var reset_doctorcontext_guard_1 = require("../shared/reset-doctorcontext-guard");
var problems_main_component_1 = require("../clinical/problems/problems-main.component");
var medical_problem_list_component_1 = require("../clinical/problems/medical-problem-list.component");
var past_medical_component_1 = require("../clinical/problems/past-medical.component");
var family_history_list_component_1 = require("../clinical/history/family-history-list.component");
var surgical_history_list_component_1 = require("../clinical/history/surgical-history-list.component");
var social_history_list_component_1 = require("../clinical/history/social-history-list.component");
var visit_summary_create_component_1 = require("./visit/visit-summary-create.component");
var visit_summary_main_component_1 = require("./visit/visit-summary-main.component");
var visit_summary_history_component_1 = require("./visit/visit-summary-history.component");
//import { NotesComponent } from '../clinical/notes/notes.component';
var patient_current_medications_component_1 = require("../clinical/medications/patient-current-medications.component");
var patient_clinical_documents_component_1 = require("../clinical/others/patient-clinical-documents.component");
var auth_guard_service_1 = require("../security/shared/auth-guard.service");
var patient_scanned_images_component_1 = require("../clinical/scanned-images/patient-scanned-images.component");
var ipd_main_component_1 = require("./ipd/ipd-main.component");
var referral_source_list_component_1 = require("./referral-source/referral-source-list.component");
var _404_not_found_component_1 = require("../404-error/404-not-found.component");
var in_patient_discharge_summary_component_1 = require("./patient/in-patient-discharge-summary.component");
exports.DoctorsRoutingConstant = [
    {
        path: "",
        component: doctors_main_component_1.DoctorsMainComponent,
        canActivate: [auth_guard_service_1.AuthGuardService],
        canDeactivate: [reset_patientcontext_guard_1.ResetPatientcontextGuard],
        children: [
            { path: "", redirectTo: "OutPatientDoctor", pathMatch: "full" },
            {
                path: "OutPatientDoctor",
                component: doctor_dashboard_component_1.DoctorDashboardComponent,
                canActivate: [auth_guard_service_1.AuthGuardService],
            },
            {
                path: "InPatientDepartment",
                component: ipd_main_component_1.IPDMainComponent,
                canActivate: [auth_guard_service_1.AuthGuardService],
            },
            {
                path: "PatientOverviewMain",
                component: patient_overview_main_component_1.PatientOverviewMainComponent,
                canDeactivate: [reset_doctorcontext_guard_1.ResetDoctorcontextGuard],
                canActivate: [auth_guard_service_1.AuthGuardService, reset_doctorcontext_guard_1.ResetDoctorcontextGuard],
                children: [
                    { path: "", redirectTo: "PatientOverview", pathMatch: "full" },
                    {
                        path: "PatientOverview",
                        component: patient_overview_component_1.PatientOverviewComponent,
                        canActivate: [auth_guard_service_1.AuthGuardService],
                    },
                    {
                        path: "Clinical",
                        loadChildren: "../clinical/clinical.module#ClinicalModule",
                        canActivate: [auth_guard_service_1.AuthGuardService, select_visit_canactivate_guard_1.SelectVisitCanActivateGuard],
                    },
                    {
                        path: "Orders",
                        loadChildren: "../orders/orders.module#OrdersModule",
                        canActivate: [auth_guard_service_1.AuthGuardService],
                    },
                    {
                        path: "PatientVisitHistory",
                        component: patient_visit_history_component_1.PatientVisitHistoryComponent,
                        canActivate: [auth_guard_service_1.AuthGuardService],
                    },
                    //{ path: 'NotesSummary', component: NotesComponent, data: { summaryMode: true }, canActivate: [AuthGuardService] },
                    //sud:5Apr'20--Notes module is brought outside as a Lazy-Loaded module
                    {
                        path: "NotesSummary",
                        loadChildren: "../clinical-notes/notes.module#NotesModule",
                        canActivate: [select_visit_canactivate_guard_1.SelectVisitCanActivateGuard],
                    },
                    // { path: 'DoctorsNotes', component: DoctorsNotesComponent, canActivate: [AuthGuardService] },
                    {
                        path: "VisitSummary",
                        component: visit_summary_main_component_1.VisitSummaryMainComponent,
                        canActivate: [auth_guard_service_1.AuthGuardService],
                        children: [
                            { path: "", redirectTo: "VisitSummaryCreate", pathMatch: "full" },
                            {
                                path: "VisitSummaryCreate",
                                component: visit_summary_create_component_1.VisitSummaryCreateComponent,
                                canActivate: [auth_guard_service_1.AuthGuardService],
                            },
                            {
                                path: "SummaryHistory",
                                component: visit_summary_history_component_1.VisitSummaryHistoryComponent,
                                canActivate: [auth_guard_service_1.AuthGuardService],
                            },
                            { path: "**", component: _404_not_found_component_1.PageNotFound },
                        ],
                    },
                    {
                        path: "ProblemsMain",
                        component: problems_main_component_1.ProblemsMainComponent,
                        canActivate: [auth_guard_service_1.AuthGuardService],
                        children: [
                            { path: "", redirectTo: "ActiveMedical", pathMatch: "full" },
                            {
                                path: "ActiveMedical",
                                component: medical_problem_list_component_1.MedicalProblemListComponent,
                                canActivate: [auth_guard_service_1.AuthGuardService],
                            },
                            {
                                path: "PastMedical",
                                component: past_medical_component_1.PastMedicalComponent,
                                canActivate: [auth_guard_service_1.AuthGuardService],
                            },
                            {
                                path: "FamilyHistory",
                                component: family_history_list_component_1.FamilyHistoryListComponent,
                                canActivate: [auth_guard_service_1.AuthGuardService],
                            },
                            {
                                path: "SurgicalHistory",
                                component: surgical_history_list_component_1.SurgicalHistoryListComponent,
                                canActivate: [auth_guard_service_1.AuthGuardService],
                            },
                            {
                                path: "SocialHistory",
                                component: social_history_list_component_1.SocialHistoryListComponent,
                                canActivate: [auth_guard_service_1.AuthGuardService],
                            },
                            {
                                path: "ReferralSource",
                                component: referral_source_list_component_1.ReferralSourceListComponent,
                            },
                            { path: "**", component: _404_not_found_component_1.PageNotFound },
                        ],
                    },
                    {
                        path: "CurrentMedications",
                        component: patient_current_medications_component_1.PatientCurrentMedicationsComponent,
                        canActivate: [auth_guard_service_1.AuthGuardService],
                    },
                    {
                        path: "ClinicalDocuments",
                        component: patient_clinical_documents_component_1.PatientClinicalDocumentsComponent,
                        canActivate: [auth_guard_service_1.AuthGuardService],
                    },
                    {
                        path: "ScannedImages",
                        component: patient_scanned_images_component_1.PatientScannedImages,
                        canActivate: [auth_guard_service_1.AuthGuardService],
                    },
                    {
                        path: "DischargeSummary",
                        component: in_patient_discharge_summary_component_1.InPatientDischargeSummaryComponent,
                        canActivate: [auth_guard_service_1.AuthGuardService],
                    },
                    { path: "**", component: _404_not_found_component_1.PageNotFound },
                ],
            },
            { path: "**", component: _404_not_found_component_1.PageNotFound },
        ],
    },
];
//# sourceMappingURL=doctors-routing.constant.js.map