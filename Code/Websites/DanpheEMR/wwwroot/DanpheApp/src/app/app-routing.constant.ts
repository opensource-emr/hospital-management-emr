
import { DashboardHomeComponent } from './dashboards/home/dashboard-home.component';
import { AuthGuardService } from './security/shared/auth-guard.service';
import { UnAuthorizedAccessComponent } from './account/unauthorizes-access.component';
export const AppRoutingConstant = [
    { path: '', component: DashboardHomeComponent },
    { path: 'Home/Index', component: DashboardHomeComponent, },
    { path: 'Doctors', loadChildren: './doctors/doctors.module#DoctorsModule', canActivate: [AuthGuardService] },
    { path: 'Patient', loadChildren: './patients/patients.module#PatientsModule', canActivate: [AuthGuardService] },
    { path: 'Appointment', loadChildren: './appointments/appointments.module#AppointmentsModule', canActivate: [AuthGuardService] },
    { path: 'Billing', loadChildren: './billing/billing.module#BillingModule', canActivate: [AuthGuardService] },
    { path: 'Lab', loadChildren: './labs/labs.module#LabsModule' },
    { path: 'Radiology', loadChildren: './radiology/radiology.module#RadiologyModule', canActivate: [AuthGuardService] },
    { path: 'Employee', loadChildren: './employee/employee.module#EmployeeModule', canActivate: [AuthGuardService] },
    { path: 'ADTMain', loadChildren: './admission/admission.module#AdmissionModule' },
    { path: 'Settings', loadChildren: './settings/settings.module#SettingsModule', canActivate: [AuthGuardService] },
    { path: 'Reports', loadChildren: './reporting/reporting.module#ReportingModule', canActivate: [AuthGuardService] },
    { path: 'Helpdesk', loadChildren: './helpdesk/helpdesk.module#HelpdeskModule', canActivate: [AuthGuardService] },
    { path: 'Inventory', loadChildren: './inventory/inventory.module#InventoryModule', canActivate: [AuthGuardService] },
    { path: 'Accounting', loadChildren: './accounting/accounting.module#AccountingModule' },
    { path: 'SystemAdmin', loadChildren: './system-admin/system-admin.module#SystemAdminModule', canActivate: [AuthGuardService] },
    { path: 'Pharmacy', loadChildren: './pharmacy/pharmacy.module#PharmacyModule', canActivate: [AuthGuardService] },
    { path: 'Nursing', loadChildren: './nursing/nursing.module#NursingModule', canActivate: [AuthGuardService] },
    { path: 'Scheduling', loadChildren: './scheduling/scheduling.module#SchedulingModule', canActivate: [AuthGuardService] },
    { path: 'Fraction', loadChildren: './fraction/fraction.module#FractionModule' },
    { path: 'WardSupply', loadChildren: './wardsupply/wardsupply.module#WardSupplyModule' },
    { path: 'Emergency', loadChildren: './emergency/emergency.module#EmergencyModule' },
    { path: "UnAuthorized", component: UnAuthorizedAccessComponent },
];
