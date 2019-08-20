import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { SettingsComponent } from './settings.component';

import { RadiologyManageComponent } from './radiology/radiology-manage.component';
import { DepartmentsManageComponent } from './department/departments-manage.component';
import { ADTManageComponent } from './adt/adt-manage.component';
import { EmployeeManageComponent } from './employee/employee-manage.component';
import { SecurityManageComponent } from './security/security-manage.component';
import { BillingManageComponent } from './billing/billing-manage.component';
import { GeolocationManageComponent } from './geolocation/geolocation-manage.component';
import { ClinicalManageComponent } from './clinical/clinical-manage.component';
import { TaxManageComponent } from "./tax/tax-manage.component";
import { DynamicTemplateEditComponent } from '../core/dyn-templates/settings/dyn-template-edit.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { ParameterListComponent } from './core-cfg/parameter-list.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
          component: SettingsComponent, canActivate: [AuthGuardService] ,
                children: [
                    { path: '', redirectTo: 'DepartmentsManage', pathMatch: 'full' },
                  { path: 'DepartmentsManage', component: DepartmentsManageComponent, canActivate: [AuthGuardService]  },
                  { path: 'RadiologyManage', component: RadiologyManageComponent, canActivate: [AuthGuardService] },
                  { path: 'ADTManage', component: ADTManageComponent, canActivate: [AuthGuardService] },
                  { path: 'EmployeeManage', component: EmployeeManageComponent, canActivate: [AuthGuardService] },
                  { path: 'SecurityManage', component: SecurityManageComponent, canActivate: [AuthGuardService] },
                  { path: 'BillingManage', component: BillingManageComponent, canActivate: [AuthGuardService] },
                  { path: 'GeolocationManage', component: GeolocationManageComponent, canActivate: [AuthGuardService] },
                  { path: 'ClinicalManage', component: ClinicalManageComponent, canActivate: [AuthGuardService] },
                  { path: 'TaxManage', component: TaxManageComponent, canActivate: [AuthGuardService] },
                  { path: 'DynamicTemplates', component: DynamicTemplateEditComponent },
                  { path: 'EditCoreCFG', component: ParameterListComponent }
               ]
            }

        ])
    ],
    exports: [
        RouterModule
    ]
})
export class SettingsRoutingModule { }
