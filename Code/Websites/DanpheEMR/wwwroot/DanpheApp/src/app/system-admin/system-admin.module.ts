import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatabaseAuditComponent } from "./database-audit/database-audit.component";
import { DatabaseBackupComponent } from "./database-backup/database-backup.component";
import { InvoiceDetailsComponent } from "./invoice-details/invoice-details.component";
import { SalesBookReportComponent } from './sales-book/sales-book-report.component';
import { SystemAdminBLService } from "./shared/system-admin.bl.service";
import { SystemAdminDLService } from './shared/system-admin.dl.service';
import { SystemAdminMainComponent } from "./system-admin-main.component";
import { SystemAdminRoutingModule } from "./system-admin-routing.module";
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { SharedModule } from "../shared/shared.module";
import { AuditTrailComponent } from './audit-trail/audit-trail.component';
import { AuditTrailOlderComponent } from './audit-trail/main-older-audit-trail';
import { NewSalesBookComponent } from './new-sales-book/new-sales-book.component';
import { PHRMSalesBookComponent } from './sales-book/phrm-sales-book-report.component';
@NgModule({
  providers: [
    SystemAdminBLService,
    SystemAdminDLService,

    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  imports: [SystemAdminRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    // Ng2AutoCompleteModule,
    DanpheAutoCompleteModule,
    SharedModule,
  ],
  declarations: [
    SystemAdminMainComponent,
    DatabaseBackupComponent,
    DatabaseAuditComponent,
    InvoiceDetailsComponent,
    SalesBookReportComponent,
    PHRMSalesBookComponent,
    AuditTrailComponent,
    AuditTrailOlderComponent,
    NewSalesBookComponent
  ],
  bootstrap: []
})
export class SystemAdminModule { }

