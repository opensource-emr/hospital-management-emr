import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CanDeactivate } from '@angular/router';


import { EmployeeProfileComponent } from './employee-profile.component';
import { ChangePasswordComponent } from './changepassword/change-password.component';
import { EmployeeProfileMainComponent } from './employee-profile-main.component';
import { UserProfileComponent } from './changepassword/user-profile.component';
import { ChangePasswordGuard } from './shared/changepassword-guard';
import { AuthGuardService } from '../security/shared/auth-guard.service';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'ProfileMain', component: EmployeeProfileMainComponent,canActivate: [AuthGuardService] ,
                children: [
                    { path: '', redirectTo: 'UserProfile', pathMatch: 'full' },
                    { path: 'UserProfile', component: UserProfileComponent,canActivate: [AuthGuardService]  },
                    { path: 'ChangeProfile', component: EmployeeProfileComponent,canActivate: [AuthGuardService]  },
                    { path: 'ChangePassword', component: ChangePasswordComponent,canActivate: [AuthGuardService] , canDeactivate: [ChangePasswordGuard] } /////CanDeactivate applied on changepassword component because we are Forcing user to dont navigate to other route if NeedsPasswordUpdate is True
                  ]
            },
        
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class EmployeeRoutingModule {

}