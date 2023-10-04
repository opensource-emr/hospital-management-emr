import { CommonModule, HashLocationStrategy, LocationStrategy } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../../shared/shared.module";
import { SettingsSharedModule } from "../settings-shared.module";
import { AddPrintExportConfigurationComponent } from "./add-new-configuration/add-new-configuration.component";
import { PrintExportConfigurationMainComponent } from "./print-export-configuration.main.component";

export const printExportConfigurationRoutes =
  [
    {
      path: '', component: PrintExportConfigurationMainComponent
    }
  ] 


@NgModule({
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    RouterModule.forChild(printExportConfigurationRoutes),

  ],
  declarations: [     
    PrintExportConfigurationMainComponent,
    AddPrintExportConfigurationComponent 
  ],
  bootstrap: []
})

export class PrintExportConfigurationModule {

}