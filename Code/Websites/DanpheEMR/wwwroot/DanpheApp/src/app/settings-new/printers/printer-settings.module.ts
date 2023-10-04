import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { SharedModule } from '../../shared/shared.module';
import { SettingsSharedModule } from '../settings-shared.module';
import { ListPrinterSettingsComponent } from './list/list-printer-settings.component';


export const printerSettingsRoutes =
  [
    {
      path: '', component: ListPrinterSettingsComponent
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
    RouterModule.forChild(printerSettingsRoutes),
    SettingsSharedModule
  ],
  declarations: [     
    ListPrinterSettingsComponent    
  ],
  bootstrap: []
})

export class PrinterSettingModule {

}
