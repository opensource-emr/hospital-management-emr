import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { DashboardHomeComponent } from "./dashboards/home/dashboard-home.component";

import { HashLocationStrategy, LocationStrategy } from "@angular/common";

import { UnicodeService } from "./common/unicode.service";
import { PatientService } from "./patients/shared/patient.service";

import { AppointmentService } from "./appointments/shared/appointment.service";
import { VisitService } from "./appointments/shared/visit.service";
import { SecurityService } from "./security/shared/security.service";
import { CallbackService } from "./shared/callback.service";
import { RouteFromService } from "./shared/routefrom.service";
//used to deactivate the clinical module until a patient is selected
import { AppRoutingConstant } from "./app-routing.constant";
import { AppComponent } from "./app.component";
import { SelectVisitCanActivateGuard } from "./shared/select-visit-canactivate-guard";
// import { IndexComponent } from "../index.component";

import { CoreModule } from "./core/core.module";
import { SecurityModule } from "./security/security.module";
import { SharedModule } from "./shared/shared.module";

import { MessageBoxComponent } from "./shared/messagebox/messagebox.component";
import { MessageboxService } from "./shared/messagebox/messagebox.service";

import { BillingService } from "./billing/shared/billing.service"; //added for Quick-Appointment. //review it and correct it later: sudarshan.
import { DLService } from "./shared/dl.service";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { UnAuthorizedAccessComponent } from "./account/unauthorizes-access.component";
import { ClaimManagementBLService } from "./claim-management/shared/claim-management.bl.service";
import { ClaimManagementDLService } from "./claim-management/shared/claim-management.dl.service";
import { NotificationBLService } from "./core/notifications/notification.bl.service";
import { NotificationDLService } from "./core/notifications/notification.dl.service";
import { DispensaryEndpoint } from "./dispensary/shared/dispensary.endpoint";
import { DispensaryService } from "./dispensary/shared/dispensary.service";
import { DynamicReportComponent } from "./dynamic-report/dynamic-report.component";
import { EmployeeService } from "./employee/shared/employee.service";
import { PatientsDLService } from "./patients/shared/patients.dl.service";
import { ActivateInventoryGuardService } from "./shared/activate-inventory/activate-inventory-guard.service";
import { ActivateInventoryComponent } from "./shared/activate-inventory/activate-inventory.component";
import { ActivateInventoryEndpoint } from "./shared/activate-inventory/activate-inventory.endpoint";
import { ActivateInventoryService } from "./shared/activate-inventory/activate-inventory.service";
import { LoaderComponent } from "./shared/danphe-loader-intercepter/danphe-loader";
import { NavigationService } from "./shared/navigation-service";
import { ActivateBillingCounterGuardService } from "./utilities/shared/activate-billing-counter-guard-service";
import { ActivateBillingCounterService } from "./utilities/shared/activate-billing-counter.service";

@NgModule({
  providers: [
    DLService,
    PatientsDLService,
    NotificationBLService,
    NotificationDLService,
    SecurityService,
    PatientService,
    AppointmentService,
    //DesignationService,
    VisitService,
    CallbackService,
    RouteFromService,
    SelectVisitCanActivateGuard,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    MessageboxService,
    NavigationService,
    BillingService, //added for Quick-Appointment. //review it and correct it later: sudarshan.
    UnicodeService,
    EmployeeService,
    ActivateInventoryGuardService,
    ActivateInventoryService,
    ActivateInventoryEndpoint,
    DispensaryService,
    DispensaryEndpoint,
    ClaimManagementDLService,
    ClaimManagementBLService,
    ActivateBillingCounterGuardService,
    ActivateBillingCounterService
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(AppRoutingConstant),
    SharedModule,
    // NotesModule,
    HttpClientModule,
    CoreModule,
    SecurityModule,
  ],
  declarations: [
    AppComponent,
    MessageBoxComponent,
    DashboardHomeComponent,
    UnAuthorizedAccessComponent,
    LoaderComponent,
    ActivateInventoryComponent,
    DynamicReportComponent
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
