import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LabSettingsRoutingModule } from './lab-settings-routing.module';
import { LabSettingsMainComponent } from './lab-settings-main.component';
import { ReportTemplateComponent } from './lab-report-template/lab-report-template.component';
import { LabTestComponent } from './lab-test/lab-test.component';
import { LabSettingsBLService } from './shared/lab-settings.bl.service';
import { LabSettingsDLService } from './shared/lab-settings.dl.service';
import { SharedModule } from "../../shared/shared.module";
import { AddNewLabReportComponent } from "./lab-report-template/add-lab-report-template.component";
import { AddLabTestCompComponent } from "../lab-settings/lab-test-component/add-lab-test-comp.component";
import { SettingsBLService } from '../../settings-new/shared/settings.bl.service';
import { SettingsDLService } from '../../settings-new/shared/settings.dl.service';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete/danphe-auto-complete.module';
import { EditSignatoriesComponent } from './signatories/edit-signatories.component';
import { LabTestCompComponent } from './lab-test-component/labTestComp.component';
import { AddLabTestComponent } from './lab-test/add-labtest.component';
import { LabVendorAddComponent } from '../external-labs/vendors-settings/lab-vendor-add.component';
import { LabVendorListComponent } from '../external-labs/vendors-settings/lab-vendor-list.component';
import { LabLookUpComponent } from './lab-lookups/lookups-list.component';
import { AddLookUpComponent } from './lab-lookups/lookups-add.component';
import { AddLabCategoryComponent } from './lab-category/add-lab-category.component';
import { LabCategoryComponent } from './lab-category/lab-category.component';
import { MapGovernmentItemsComponent } from './map-lab-test-components/map-government-items-component';
import { AddGovernmentItemsComponent } from './map-lab-test-components/add-government-items.component';
// import { LabVendorAddComponent } from './external-labs/vendors/lab-vendor-add.component';
// import { LabVendorListComponent } from './external-labs/vendors/lab-vendor-list.component';


export const LabSettingsRoutingConstant = [
    
]

@NgModule({
    providers: [LabSettingsBLService, LabSettingsDLService, SettingsBLService, SettingsDLService],
    imports: [LabSettingsRoutingModule, SharedModule, ReactiveFormsModule, FormsModule, CommonModule,DanpheAutoCompleteModule
    ],
    declarations: [LabSettingsMainComponent, ReportTemplateComponent, LabTestComponent, 
      AddNewLabReportComponent, AddLabTestCompComponent, AddLabTestComponent, AddLabCategoryComponent, LabCategoryComponent,
      EditSignatoriesComponent, LabTestCompComponent, LabVendorAddComponent, LabVendorListComponent, LabLookUpComponent, AddLookUpComponent, MapGovernmentItemsComponent,
      AddGovernmentItemsComponent],
    bootstrap: []
})

export class LabSettingsModule {

}
