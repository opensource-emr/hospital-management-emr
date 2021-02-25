import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { LabSettingsMainComponent } from "./lab-settings-main.component";
import { ReportTemplateComponent } from "./lab-report-template/lab-report-template.component";
import { LabTestComponent } from "./lab-test/lab-test.component";
import { EditSignatoriesComponent } from "./signatories/edit-signatories.component";
import { LabTestCompComponent } from "./lab-test-component/labTestComp.component";
import { LabVendorListComponent } from "../external-labs/vendors-settings/lab-vendor-list.component";
import { LabLookUpComponent } from "./lab-lookups/lookups-list.component";
import { LabCategoryComponent } from "./lab-category/lab-category.component";
import { MapGovernmentItemsComponent } from "./map-lab-test-components/map-government-items-component";

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: LabSettingsMainComponent,
        children: [
          { path: '', redirectTo: 'LabTest', pathMatch: 'full' },
          { path: 'LabTest', component: LabTestComponent },
          { path: 'LabTestComponent', component: LabTestCompComponent },
          { path: 'ReportTemplate', component: ReportTemplateComponent },
          { path: 'Signatories', component: EditSignatoriesComponent },
          { path: 'Vendors', component: LabVendorListComponent },
          { path: 'LookUps', component: LabLookUpComponent },
          { path: 'LabCategories', component: LabCategoryComponent },
          { path: 'MapGovernmentItems', component: MapGovernmentItemsComponent }
        ]
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class LabSettingsRoutingModule {

}
