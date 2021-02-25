import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";

import { SystemAdminMainComponent } from './system-admin-main.component';
import { DatabaseBackupComponent } from "./database-backup/database-backup.component"
import { DatabaseAuditComponent } from './database-audit/database-audit.component';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { SalesBookReportComponent } from "./sales-book/sales-book-report.component";
import { PHRMSalesBookComponent } from './sales-book/phrm-sales-book-report.component'
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { AuditTrailComponent } from './audit-trail/audit-trail.component';
import { PageNotFound } from '../404-error/404-not-found.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
          component: SystemAdminMainComponent, canActivate: [AuthGuardService] ,
                children: [
                    { path: '', redirectTo: 'DatabaseBackup', pathMatch: 'full' },
                  { path: 'DatabaseBackup', component: DatabaseBackupComponent, canActivate: [AuthGuardService]  },
                  { path: 'DatabaseAudit', component: DatabaseAuditComponent, canActivate: [AuthGuardService]  },
                  { path: 'InvoiceDetails', component: InvoiceDetailsComponent, canActivate: [AuthGuardService]  },
                  { path: 'SalesBook', component: SalesBookReportComponent, canActivate: [AuthGuardService] },
                  { path: 'AuditTrail', component: AuditTrailComponent },
                  { path: "**", component: PageNotFound }

                ]
          },
          { path: "**", component: PageNotFound }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class SystemAdminRoutingModule {

}
