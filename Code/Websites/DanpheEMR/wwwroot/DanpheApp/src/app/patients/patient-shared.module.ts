import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { DanpheAutoCompleteModule } from "../shared/danphe-autocomplete";
import { SharedModule } from "../shared/shared.module";
import { PatientsBLService } from "./shared/patients.bl.service";
import { PatientDuplicateWarningBox } from "./duplicate-warning/patient-duplicate-warning-box.component";

@NgModule({
  providers: [
    PatientsBLService
  ],
  imports: [ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    SharedModule,
    DanpheAutoCompleteModule
  ],
  declarations: [
    PatientDuplicateWarningBox
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,

    PatientDuplicateWarningBox
  ]
})

export class PatientSharedModule {

}
