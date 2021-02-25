import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { AttendanceComponent } from './Attendance/attendance.component';
import { LeaveComponent } from './Leave/leave.component';
import { PayrollMainComponent } from './payroll-main.component'; 
import { PayrollComponent } from './Payroll/payroll.component';
import { LeaveRuleListComponent } from './Leave/LeaveRuleList/leave-rule-list.component';
import { HolidayComponent } from './Leave/holiday/holiday-component';
import { LeaveRequestComponent } from './Leave/Leave-Requests/leaverequest.component';
import { EmployeeLeaveComponent } from './Leave/employee-leave-details/emp-leave-details.component';
import { PageNotFound } from '../404-error/404-not-found.component';
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: PayrollMainComponent,
        children: [
          { path: '', redirectTo: 'Attendance', pathMatch: 'full' },
          {path: 'Attendance',component:AttendanceComponent},
          { path: 'Payroll', component: PayrollComponent },
          
          {
            path: 'Leave',
            component: LeaveComponent,
            children: [
              { path: '', redirectTo: 'LeaveRequest', pathMatch: 'full' },
              { path: 'Holiday', component: HolidayComponent },
              { path: 'LeaveRuleList', component: LeaveRuleListComponent },
              { path: 'LeaveRequest', component: LeaveRequestComponent },
              { path: 'EmployeeLeaves', component: EmployeeLeaveComponent },
              { path: "**", component: PageNotFound }

            ]
          },
          { path: 'Setting', loadChildren: './Setting/payroll-setting.module#PayrollSettingsModule', canActivate: [AuthGuardService] },
        ]
      },
      { path: "**", component: PageNotFound }
    ])
  ],
  exports: [
    RouterModule
  ]
})

export class PayrollRoutingModule {

}
