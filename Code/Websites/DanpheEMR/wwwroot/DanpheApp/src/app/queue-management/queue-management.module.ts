import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from "../shared/shared.module";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { QueueManagementRoutingModule } from './queue-management-routing.module';
import { QueueManagementMainComponent } from './queue-management-main-component';
import { QueueManagementOpdComponent } from './opd/opd.component';
import { QueueManagementService } from './shared/Qmgnt.service';
import { QueueManagementDLService } from './shared/Qmgnt.dl.service';
import { QueueManagementBLService } from './shared/Qmgnt.bl.service';
@NgModule({
  providers: [QueueManagementService, QueueManagementDLService, QueueManagementBLService],
  imports: [
    QueueManagementRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    AngularMultiSelectModule,
    SharedModule,
    DanpheAutoCompleteModule,
    SettingsSharedModule
  ],
  declarations: [
    QueueManagementMainComponent,
    QueueManagementOpdComponent
  ],
  bootstrap: []
})
export class QueueManagementModule { }
