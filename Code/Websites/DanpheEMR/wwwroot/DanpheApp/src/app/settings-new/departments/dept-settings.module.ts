import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DepartmentAddComponent } from './dept-master/department-add.component';
import { DepartmentListComponent } from './dept-master/department-list.component';
import { DepartmentSettingsMainComponent } from './dept-settings-main.component';
//import { ServiceDepartmentAddComponent } from './service-dept/service-department-add.component';
//import { ServiceDepartmentListComponent } from './service-dept/service-department-list';
import { AuthGuardService } from '../../security/shared/auth-guard.service';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { SharedModule } from '../../shared/shared.module';
import { SubstoreAddComponent } from './sub-store/substore-add.component';
import { SubstoreListComponent } from './sub-store/substore-list.component';
import { WardSubstoreMapManageEditComponent } from './ward-substore-map-manage/ward-substore-map-manage-edit.component';
import { WardSubstoreMapManageListComponent } from './ward-substore-map-manage/ward-substore-map-manage-list.component';
import { WardSubstoreMapManageAddComponent } from './ward-substore-map-manage/ward-substore-map-manage.component';


export const deptSettingsRoutes =
  [
    {
      path: '', component: DepartmentSettingsMainComponent,
      children: [
        { path: '', redirectTo: 'Department', pathMatch: 'full' },
        { path: 'Department', component: DepartmentListComponent, canActivate: [AuthGuardService] },
        { path: 'Substore', component: SubstoreListComponent, canActivate: [AuthGuardService] },
        { path: 'WardSubstoreMapManage', component: WardSubstoreMapManageListComponent, canActivate: [AuthGuardService] },

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
    SubstoreListComponent,
    WardSubstoreMapManageListComponent,
    WardSubstoreMapManageAddComponent,
    WardSubstoreMapManageEditComponent
    //ServiceDepartmentAddComponent,
    //ServiceDepartmentListComponent
  ],
  exports: [
    DepartmentAddComponent
  ],
  bootstrap: [
  ]
})

export class DepartmentSettingsModule {

}
