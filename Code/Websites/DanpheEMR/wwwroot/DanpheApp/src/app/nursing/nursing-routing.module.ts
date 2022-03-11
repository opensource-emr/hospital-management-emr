import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { NursingMainComponent } from "./nursing-main.component";
import { NursingOrderComponent } from "./order/nursing-order.component";
import { NursingOrderListComponent } from "./order/nursing-order-list.component";
import { ResetPatientcontextGuard } from "../shared/reset-patientcontext-guard";
import { NursingOutPatientComponent } from "./department/nursing-outpatient.component";
import { NursingInPatientComponent } from "./department/nursing-inpatient.component";
import { NephrologyComponent } from "./department/nephrology.component";
import { SelectVisitCanActivateGuard } from "../shared/select-visit-canactivate-guard";

import { PatientOverviewComponent } from "../doctors/patient/patient-overview.component";
import { NursingWardBillingComponent } from "./ward-billing/nursing-ward-billing.component";

import { DrugsRequestComponent } from "./drugs-request/drugs-request.component";
import { DrugRequestListComponent } from "./drugs-request/drug-request-list.component";
import { AuthGuardService } from "../security/shared/auth-guard.service";
import { WardSelectionGuardService } from "./shared/ward-selection-guard.service";
import { ActivateWardComponent } from "./department/activate-ward/activate-ward.component";
import { PageNotFound } from "../404-error/404-not-found.component";
import { PatientOverviewMainComponent } from "../doctors/patient/patient-overview-main.component";
import { ResetNursingContextGuard } from "../shared/reser-nursingcontext-guard";
import { TransferComponent } from "../adt/transfer/transfer.component";
import { NursingTransferComponent } from "./nursing-transfer/nursing-transfer.component";
import { DischargeSummaryListComponent } from "./nursing-discharge-summary/discharge-summary-list.component";

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "",
        //reset patient and visit service when route leaves out of nursing module.
        component: NursingMainComponent,
        canActivate: [AuthGuardService],
        canDeactivate: [ResetPatientcontextGuard, WardSelectionGuardService],
        children: [
          { path: "", redirectTo: "OutPatient", pathMatch: "full" },
          {
            path: "OutPatient",
            component: NursingOutPatientComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "InPatient",
            children: [
              {
                path: "",
                canActivate: [AuthGuardService],
                redirectTo: "InPatientList",
                pathMatch: "full",
              },
              {
                path: "InPatientList",
                component: NursingInPatientComponent,
                canActivate: [AuthGuardService, WardSelectionGuardService],
                runGuardsAndResolvers: "always",
              },
              {
                path: "ActivateWard",
                component: ActivateWardComponent,
                canActivate: [AuthGuardService]
              },
              { path: "**", component: PageNotFound },
              //{ path: "", redirectTo: "ActivateWard", pathMatch: "full" }, //this is done inside wardSelectionGuardService,
              //authorization problem arises if redirected this way. will be solved if different permission is created for inpatientlist.
            ],
          },
          {
            path: "PatientOverviewMain",
            component: PatientOverviewMainComponent,
            canDeactivate: [ResetNursingContextGuard],
            canActivate: [ResetNursingContextGuard, AuthGuardService],
            children: [
              {
                path: "",
                redirectTo: "PatientOverview",
                pathMatch: "full",
              },
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
                path: "WardBilling",
                component: NursingWardBillingComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "DrugsRequest",
                component: DrugsRequestComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "Transfer",
                component: NursingTransferComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "Notes",
                loadChildren: "../clinical-notes/notes.module#NotesModule",
                canActivate: [SelectVisitCanActivateGuard],
              },              
              { path: "**", component: PageNotFound },
            ],
          },
          {
            path: "Nephrology",
            component: NephrologyComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "RequisitionList",
            component: DrugRequestListComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "DischargeSummary",
            component: DischargeSummaryListComponent,
            canActivate: [AuthGuardService],
          },
          { path: "**", component: PageNotFound },
        ],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class NursingRoutingModule { }
