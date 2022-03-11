import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from "../shared/shared.module";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { MaternityMainComponent } from './maternity-main.component';
import { MaternityRoutingModule } from './maternity-routing.module';
import { MaternityPatientListComponent } from './patient-list/maternity-patient-list.component';
import { MaternityBLService } from './shared/maternity.bl.service';
import { MaternityDLService } from './shared/maternity.dl.service';
import { MaternityPatientAddComponent } from './patient-list/maternity-patient-add/maternity-patient-add.component';
import { MaternityService } from './shared/maternity.service';
import { MaternityANCComponent } from './patient-list/maternity-anc/maternity-anc.component';
import { MaternityRegisterComponent } from './patient-list/maternity-register/maternity-register.component';
import { MaternityPatientUploadFilesComponent } from './patient-list/maternity-file-upload/maternity-file-upload.component';
import { MaternityPaymentsComponent } from './payments/maternity-payments.main.component';
import { Maternity_PatientListComponent } from './payments/patient-list/mat-payment-patient-list.component';
import { MaternityPatientPaymentComponent } from './payments/maternity-patient-payment/maternity-patient-payment.component';
import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { MaternitySharedModule } from './shared/maternity-shared-module';

@NgModule({
  providers: [MaternityBLService, MaternityDLService, MaternityService],
  imports: [
    MaternityRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    AngularMultiSelectModule,
    SharedModule,
    DanpheAutoCompleteModule,
    MaternitySharedModule
  ],
  declarations: [MaternityMainComponent,
    MaternityPatientListComponent,
    MaternityPatientAddComponent,
    MaternityANCComponent,
    MaternityRegisterComponent,
    MaternityPatientUploadFilesComponent,
    MaternityPaymentsComponent,
    Maternity_PatientListComponent,
    MaternityPatientPaymentComponent,
  ],
  bootstrap: []
})
export class MaternityModule { }
