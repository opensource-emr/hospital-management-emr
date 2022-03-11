import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { DoctorsMainComponent } from "../doctors/doctors-main.component";
import { DoctorDashboardComponent } from "./dashboard/doctor-dashboard.component";
import { PatientOverviewMainComponent } from "../doctors/patient/patient-overview-main.component";
import { PatientOverviewComponent } from "../doctors/patient/patient-overview.component";
import { SelectVisitCanActivateGuard } from "../shared/select-visit-canactivate-guard";
import { PatientVisitHistoryComponent } from "../doctors/patient/patient-visit-history.component";
import { ResetPatientcontextGuard } from "../shared/reset-patientcontext-guard";
import { ResetDoctorcontextGuard } from "../shared/reset-doctorcontext-guard";
import { ProblemsMainComponent } from "../clinical/problems/problems-main.component";
import { MedicalProblemListComponent } from "../clinical/problems/medical-problem-list.component";
import { PastMedicalComponent } from "../clinical/problems/past-medical.component";
import { FamilyHistoryListComponent } from "../clinical/history/family-history-list.component";
import { SurgicalHistoryListComponent } from "../clinical/history/surgical-history-list.component";
import { SocialHistoryListComponent } from "../clinical/history/social-history-list.component";
import { VisitSummaryCreateComponent } from "./visit/visit-summary-create.component";
import { VisitSummaryMainComponent } from "./visit/visit-summary-main.component";
import { VisitSummaryHistoryComponent } from "./visit/visit-summary-history.component";
import { DoctorsNotesComponent } from "./notes/doctors-notes.component";
//import { NotesComponent } from '../clinical/notes/notes.component';
import { PatientCurrentMedicationsComponent } from "../clinical/medications/patient-current-medications.component";
import { PatientClinicalDocumentsComponent } from "../clinical/others/patient-clinical-documents.component";
import { AuthGuardService } from "../security/shared/auth-guard.service";
import { PatientScannedImages } from "../clinical/scanned-images/patient-scanned-images.component";
import { IPDMainComponent } from "./ipd/ipd-main.component";
import { ReferralSourceListComponent } from "./referral-source/referral-source-list.component";
import { PageNotFound } from "../404-error/404-not-found.component";
import { QuestionComponent } from "../core/dyn-templates/controls/question.component";
import { InPatientDischargeSummaryComponent } from "./patient/in-patient-discharge-summary.component";
export const DoctorsRoutingConstant = [
  {
    path: "",
    component: DoctorsMainComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [ResetPatientcontextGuard],
    children: [
      { path: "", redirectTo: "OutPatientDoctor", pathMatch: "full" },
      {
        path: "OutPatientDoctor",
        component: DoctorDashboardComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: "InPatientDepartment",
        component: IPDMainComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: "PatientOverviewMain",
        component: PatientOverviewMainComponent,
        canDeactivate: [ResetDoctorcontextGuard],
        canActivate: [AuthGuardService, ResetDoctorcontextGuard],
        children: [
          { path: "", redirectTo: "NotesSummary", pathMatch: "full" },
          {
            path: "PatientOverview",
            component: PatientOverviewComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "Clinical",
            loadChildren: "../clinical/clinical.module#ClinicalModule",
            canActivate: [AuthGuardService, SelectVisitCanActivateGuard],
          },
          {
            path: "Orders",
            loadChildren: "../orders/orders.module#OrdersModule",
            canActivate: [AuthGuardService],
          },
          {
            path: "PatientVisitHistory",
            component: PatientVisitHistoryComponent,
            canActivate: [AuthGuardService],
          },
          //{ path: 'NotesSummary', component: NotesComponent, data: { summaryMode: true }, canActivate: [AuthGuardService] },
          //sud:5Apr'20--Notes module is brought outside as a Lazy-Loaded module
          {
            path: "NotesSummary",
            loadChildren: "../clinical-notes/notes.module#NotesModule",
            canActivate: [SelectVisitCanActivateGuard],
          },

          // { path: 'DoctorsNotes', component: DoctorsNotesComponent, canActivate: [AuthGuardService] },
          {
            path: "VisitSummary",
            component: VisitSummaryMainComponent,
            canActivate: [AuthGuardService],
            children: [
              { path: "", redirectTo: "VisitSummaryCreate", pathMatch: "full" },
              {
                path: "VisitSummaryCreate",
                component: VisitSummaryCreateComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "SummaryHistory",
                component: VisitSummaryHistoryComponent,
                canActivate: [AuthGuardService],
              },
              { path: "**", component: PageNotFound },
            ],
          },
          {
            path: "ProblemsMain",
            component: ProblemsMainComponent,
            canActivate: [AuthGuardService],
            children: [
              { path: "", redirectTo: "ActiveMedical", pathMatch: "full" },
              {
                path: "ActiveMedical",
                component: MedicalProblemListComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "PastMedical",
                component: PastMedicalComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "FamilyHistory",
                component: FamilyHistoryListComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "SurgicalHistory",
                component: SurgicalHistoryListComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "SocialHistory",
                component: SocialHistoryListComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "ReferralSource",
                component: ReferralSourceListComponent,
              },
              { path: "**", component: PageNotFound },
            ],
          },
          {
            path: "CurrentMedications",
            component: PatientCurrentMedicationsComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "ClinicalDocuments",
            component: PatientClinicalDocumentsComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "ScannedImages",
            component: PatientScannedImages,
            canActivate: [AuthGuardService],
          },
          {
            path: "DischargeSummary",
            component: InPatientDischargeSummaryComponent,
            canActivate: [AuthGuardService],
          },
          { path: "**", component: PageNotFound },
        ],
      },
      { path: "**", component: PageNotFound },
    ],
  },
];
