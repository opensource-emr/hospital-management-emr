import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PayrollRoutingModule } from './payroll-routing.module';
import { AttendanceComponent } from './Attendance/attendance.component';
import { CommonModule } from '@angular/common';
import { LeaveComponent } from './Leave/leave.component';
import { PayrollMainComponent } from './payroll-main.component';
import { PayrollComponent } from './Payroll/payroll.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { SchedulingBLService } from '../scheduling/shared/scheduling.bl.service';
import { SchedulingDLService } from '../scheduling/shared/scheduling.dl.service';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { PayrollBLService } from './Shared/payroll.bl.service';
import { PayrollDLService } from './Shared/payroll.dl.service';
import { MatSnackBarModule, MatDialogModule } from '@angular/material';
import { EditAttendance } from './Attendance/edit-attendance/edit-attendance';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import { CommonPayrollService } from './Shared/common-payroll.service';
import { LeaveRuleListComponent } from './Leave/LeaveRuleList/leave-rule-list.component';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { HolidayComponent } from './Leave/holiday/holiday-component';
import { NgxPaginationModule } from 'ngx-pagination'
import { GrdFilterPipe } from './Attendance/serach-pipe.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LeaveRequestComponent } from './Leave/Leave-Requests/leaverequest.component';
import { AddNewLeaveRequestComponent } from './Leave/Leave-Requests/add-newRequest.component';
import { EmployeeLeaveComponent } from './Leave/employee-leave-details/emp-leave-details.component';


@NgModule({
  imports: [
    PayrollRoutingModule,
    CommonModule,
    FormsModule,
    SharedModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    ReactiveFormsModule,
    DanpheAutoCompleteModule,
    NgxPaginationModule,
    MatTooltipModule
  ],
  declarations: [
    PayrollMainComponent,
    AttendanceComponent,
    LeaveComponent,
    PayrollComponent,
    EditAttendance,
    LeaveRuleListComponent,
    HolidayComponent,
    LeaveRequestComponent,
    GrdFilterPipe,
    AddNewLeaveRequestComponent,
    EmployeeLeaveComponent
  ],
  providers: [SchedulingBLService,
    SchedulingDLService,
    PayrollBLService,
    PayrollDLService,
    CommonPayrollService],
  bootstrap: [PayrollMainComponent],
  entryComponents: [EditAttendance]
})
export class PayrollMainModule {

}
