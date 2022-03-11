import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../shared/shared.module";
import { DanpheAutoCompleteModule } from "../shared/danphe-autocomplete";
import { PatientOverviewComponent } from "./patient/patient-overview.component";
import { PatientVisitHistoryComponent } from "./patient/patient-visit-history.component";
import { OPDVisitSummaryComponent } from "./opd/opd-visit-summary.component";
import { VisitSummaryMainComponent } from "./visit/visit-summary-main.component";
import { VisitSummaryCreateComponent } from "./visit/visit-summary-create.component";
import { VisitSummaryHistoryComponent } from "./visit/visit-summary-history.component";
import { PatientScannedImages } from "../clinical/scanned-images/patient-scanned-images.component";
import { PatientClinicalDocumentsComponent } from "../clinical/others/patient-clinical-documents.component";
import { PatientCurrentMedicationsComponent } from "../clinical/medications/patient-current-medications.component";
import { DynTemplateModule } from "../core/dyn-templates/dyn-templates.module";
import { ProblemsBLService } from "../clinical/shared/problems.bl.service";

@NgModule({
  providers: [ProblemsBLService],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    SharedModule,
    DanpheAutoCompleteModule,
    DynTemplateModule,
  ],
  declarations: [
    PatientOverviewComponent,
    PatientVisitHistoryComponent,
    OPDVisitSummaryComponent,
    VisitSummaryMainComponent,
    VisitSummaryCreateComponent,
    VisitSummaryHistoryComponent,
    PatientScannedImages,
    PatientClinicalDocumentsComponent,
    PatientCurrentMedicationsComponent,
  ],
  exports: [
    PatientOverviewComponent,
    PatientVisitHistoryComponent,
    OPDVisitSummaryComponent,
    VisitSummaryMainComponent,
    VisitSummaryCreateComponent,
    VisitSummaryHistoryComponent,
    PatientScannedImages,
    PatientClinicalDocumentsComponent,
    PatientCurrentMedicationsComponent,
  ],
})
export class DoctorSharedModule {}
