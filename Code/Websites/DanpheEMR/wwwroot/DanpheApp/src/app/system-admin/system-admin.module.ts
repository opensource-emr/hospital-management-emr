import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { SystemAdminRoutingModule } from "./system-admin-routing.module";
import { SystemAdminMainComponent } from "./system-admin-main.component";
import { SystemAdminBLService } from "./shared/system-admin.bl.service"
import { SystemAdminDLService } from './shared/system-admin.dl.service';
import { DatabaseBackupComponent } from "./database-backup/database-backup.component";
import { DatabaseAuditComponent } from "./database-audit/database-audit.component"
import { InvoiceDetailsComponent } from "./invoice-details/invoice-details.component";
import { SalesBookReportComponent } from './sales-book/sales-book-report.component';
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { SharedModule } from "../shared/shared.module";
import { PHRMSalesBookComponent} from './sales-book/phrm-sales-book-report.component'
import { AuditTrailComponent  } from './audit-trail/audit-trail.component';
import { AuditTrailOlderComponent } from './audit-trail/main-older-audit-trail';
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
         AuditTrailOlderComponent
    ],
    bootstrap: []
})
export class SystemAdminModule { }

