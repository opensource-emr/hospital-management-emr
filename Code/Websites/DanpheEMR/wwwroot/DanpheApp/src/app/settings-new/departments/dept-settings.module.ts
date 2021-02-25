import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { DepartmentSettingsMainComponent } from './dept-settings-main.component';
import { DepartmentAddComponent } from './dept-master/department-add.component';
import { DepartmentListComponent } from './dept-master/department-list.component';
//import { ServiceDepartmentAddComponent } from './service-dept/service-department-add.component';
//import { ServiceDepartmentListComponent } from './service-dept/service-department-list';
import { SharedModule } from '../../shared/shared.module';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { SubstoreAddComponent } from './sub-store/substore-add.component';
import { SubstoreListComponent } from './sub-store/substore-list.component';
import { AuthGuardService } from '../../security/shared/auth-guard.service';


export const deptSettingsRoutes =
  [
    {
      path: '', component: DepartmentSettingsMainComponent,
      children: [
        { path: '', redirectTo: 'Department', pathMatch: 'full' },
        { path: 'Department', component: DepartmentListComponent, canActivate: [AuthGuardService] },
        { path: 'Substore', component: SubstoreListComponent, canActivate: [AuthGuardService] },
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
    RouterModule.forChild(deptSettingsRoutes),

  ],
  declarations: [
    DepartmentSettingsMainComponent,
    DepartmentAddComponent,
    DepartmentListComponent,
    SubstoreAddComponent,
    SubstoreListComponent
    //ServiceDepartmentAddComponent,
    //ServiceDepartmentListComponent
  ],
  bootstrap: [
  ]
})

export class DepartmentSettingsModule {

}
