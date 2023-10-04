import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CanDeactivate } from '@angular/router';
import { ChangePasswordComponent } from './changepassword/change-password.component';
import { EmployeeProfileMainComponent } from './employee-profile-main.component';
import { UserProfileComponent } from './changepassword/user-profile.component';
import { ChangePasswordGuard } from './shared/changepassword-guard';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { PageNotFound } from '../404-error/404-not-found.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'ProfileMain', component: EmployeeProfileMainComponent,canActivate: [AuthGuardService] ,
                children: [
                    { path: '', redirectTo: 'UserProfile', pathMatch: 'full' },
                    { path: 'UserProfile', component: UserProfileComponent,canActivate: [AuthGuardService]  },
                    { path: 'ChangePassword', component: ChangePasswordComponent,canActivate: [AuthGuardService] , canDeactivate: [ChangePasswordGuard] }, /////CanDeactivate applied on changepassword component because we are Forcing user to dont navigate to other route if NeedsPasswordUpdate is True
                    { path: "**", component: PageNotFound }

                ]
          },
          { path: "**", component: PageNotFound },
        
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class EmployeeRoutingModule {

}
