import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { SharedModule } from '../../shared/shared.module';
import { SettingsSharedModule } from '../settings-shared.module';
import { BankListComponent } from './list/bank-list.component';
import { AddBanksComponent } from './add-new/add-banks.component';


export const bankSettingsRoutes =
  [
    {
      path: '', component: BankListComponent
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
    RouterModule.forChild(bankSettingsRoutes),
    SettingsSharedModule
  ],
  declarations: [ 
    BankListComponent,
    AddBanksComponent
    
  ],
  bootstrap: []
})

export class BanksModule {

}
