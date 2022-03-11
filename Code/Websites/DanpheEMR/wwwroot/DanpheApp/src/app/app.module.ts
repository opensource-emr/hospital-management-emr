import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { DashboardHomeComponent } from "./dashboards/home/dashboard-home.component";

import { HashLocationStrategy, LocationStrategy } from "@angular/common";

import { PatientService } from "./patients/shared/patient.service";
import { UnicodeService } from "./common/unicode.service";

import { CallbackService } from "./shared/callback.service";
import { VisitService } from "./appointments/shared/visit.service";
import { AppointmentService } from "./appointments/shared/appointment.service";
import { SecurityService } from "./security/shared/security.service";
import { RouteFromService } from "./shared/routefrom.service";
//used to deactivate the clinical module until a patient is selected
import { SelectVisitCanActivateGuard } from "./shared/select-visit-canactivate-guard";
import { AppRoutingConstant } from "./app-routing.constant";
import { AppComponent } from "./app.component";
// import { IndexComponent } from "../index.component";

import { SharedModule } from "./shared/shared.module";
import { CoreModule } from "./core/core.module";
import { SecurityModule } from "./security/security.module";

import { MessageboxService } from "./shared/messagebox/messagebox.service";
import { MessageBoxComponent } from "./shared/messagebox/messagebox.component";

import { BillingService } from "./billing/shared/billing.service"; //added for Quick-Appointment. //review it and correct it later: sudarshan.
import { DLService } from "./shared/dl.service";

import { NotificationBLService } from "./core/notifications/notification.bl.service";
import { NotificationDLService } from "./core/notifications/notification.dl.service";
import { NavigationService } from "./shared/navigation-service";
import { PatientsDLService } from "./patients/shared/patients.dl.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AgGridModule } from "ag-grid-angular";
import { UnAuthorizedAccessComponent } from "./account/unauthorizes-access.component";
import { DesignationService } from "./fraction/shared/Designation.service";
import { LoaderComponent } from "./shared/danphe-loader-intercepter/danphe-loader";
import { DanpheLoadingInterceptor } from "./shared/danphe-loader-intercepter/danphe-loading.services";
import { EmployeeService } from "./employee/shared/employee.service";
import { ActivateInventoryGuardService } from "./shared/activate-inventory/activate-inventory-guard.service";
import { ActivateInventoryEndpoint } from "./shared/activate-inventory/activate-inventory.endpoint";
import { ActivateInventoryService } from "./shared/activate-inventory/activate-inventory.service";
import { ActivateInventoryComponent } from "./shared/activate-inventory/activate-inventory.component";
import { DispensaryService } from "./dispensary/shared/dispensary.service";
import { DispensaryEndpoint } from "./dispensary/shared/dispensary.endpoint";

@NgModule({
  providers: [
    DLService,
    PatientsDLService,
    NotificationBLService,
    NotificationDLService,
    SecurityService,
    PatientService,
    AppointmentService,
    DesignationService,
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
    DispensaryEndpoint
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

  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
