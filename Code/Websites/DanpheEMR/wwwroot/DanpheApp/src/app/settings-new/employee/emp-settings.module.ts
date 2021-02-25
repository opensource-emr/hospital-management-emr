import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { SharedModule } from '../../shared/shared.module';
import { EmpSettingsMainComponent } from './emp-settings-main.component';
import { EmployeeAddComponent } from './emp-mst/employee-add.component';
import { EmployeeListComponent } from './emp-mst/employee-list.component';
import { EmployeeRoleAddComponent } from './emp-role/employee-role-add.component';
import { EmployeeRoleListComponent } from './emp-role/employee-role-list.component';
import { EmployeeTypeAddComponent } from './emp-types/employee-type-add.component';
import { EmployeeTypeListComponent } from './emp-types/employee-type-list.component';
import { AuthGuardService } from '../../security/shared/auth-guard.service';

export const empSettingsRoutes =
  [
    {
      path: '', component: EmpSettingsMainComponent,
      children: [
        { path: '', redirectTo: 'ManageEmployee', pathMatch: 'full' },
        { path: 'ManageEmployee', component: EmployeeListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageEmployeeRole', component: EmployeeRoleListComponent, canActivate: [AuthGuardService] },
        { path: 'ManageEmployeeType', component: EmployeeTypeListComponent, canActivate: [AuthGuardService] }
      ]
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
    DanpheAutoCompleteModule,
    RouterModule.forChild(empSettingsRoutes),
  ],
  declarations: [
    EmpSettingsMainComponent,
    EmployeeAddComponent,
    EmployeeListComponent,
    EmployeeRoleAddComponent,
    EmployeeRoleListComponent,
    EmployeeTypeAddComponent,
    EmployeeTypeListComponent
  ],
  bootstrap: []
})
export class EmpSettingsModule {

}
