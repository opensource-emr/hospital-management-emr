import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RadiologyRoutingModule } from './radiology-routing.module';
import { SelectVisitCanActivateGuard } from '../shared/select-visit-canactivate-guard';
import { RadiologyMainComponent } from './radiology-main.component';
import { ImagingRequisitionListComponent } from "./requisition-list/imaging-requisition-list.component";
import { ImagingBLService } from './shared/imaging.bl.service';
import { ImagingDLService } from './shared/imaging.dl.service';
import { BillingDLService } from '../billing/shared/billing.dl.service';
import { SharedModule } from "../shared/shared.module";
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { ImagingReportsListComponent } from "./reports-list/imaging-reports-list.component";
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { Rad_InpatientListComponent } from './ward-billing/rad-ip-list.component';
import { RadiologyWardBillingComponent } from './ward-billing/rad-wardbilling.component';
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { ADT_BLService } from '../adt/shared/adt.bl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { BillingSharedModule } from '../billing/billing-shared.module';
import { RadiologyEditDoctorsComponent } from './rad-edit-doctors/rad-edit-doctors.component';
import { RadiologyEditDoctorsPopupComponent } from './rad-edit-doctors/rad-edit-doctors-popup.component';
import { ImagingTypeSelectorComponent } from './shared/RadiologyTypeSelector/ImagingTypeSelector.component';


@NgModule({
  providers: [SelectVisitCanActivateGuard,
    ImagingBLService,
    ImagingDLService,
    BillingDLService,
    PatientsDLService,
    VisitDLService,
    ADT_DLService,
    ADT_BLService,
    AppointmentDLService
  ],
  imports: [RadiologyRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    DanpheAutoCompleteModule,
    SettingsSharedModule,
    BillingSharedModule
  ],
  declarations: [RadiologyMainComponent,
    ImagingRequisitionListComponent,
    ImagingReportsListComponent,
    Rad_InpatientListComponent,
    RadiologyWardBillingComponent,
    RadiologyEditDoctorsComponent,
    RadiologyEditDoctorsPopupComponent,
    ImagingTypeSelectorComponent
  ],
  bootstrap: []
})
export class RadiologyModule { }

