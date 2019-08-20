
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { EmployeeRoutingModule } from "./employee-routing.constant";
import { ChangePasswordComponent } from './changepassword/change-password.component';
import { EmployeeProfileMainComponent } from './employee-profile-main.component';
import { UserProfileComponent } from './changepassword/user-profile.component'

import { EmployeeProfileComponent } from './employee-profile.component';
import { EmployeeBLService } from './shared/employee.bl.service';
import { EmployeeDLService } from './shared/employee.dl.service';
import { ChangePasswordGuard } from './shared/changepassword-guard';
import { EmployeeService } from "./shared/employee.service";

@NgModule({
    providers: [EmployeeBLService, EmployeeService
        , EmployeeDLService
        , ChangePasswordGuard
    ],
    imports: [EmployeeRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        HttpClientModule,

    ],
    declarations: [EmployeeProfileComponent
        , ChangePasswordComponent
        , EmployeeProfileMainComponent
        , UserProfileComponent
    ],
    bootstrap: [EmployeeProfileMainComponent]
})
export class EmployeeModule { }