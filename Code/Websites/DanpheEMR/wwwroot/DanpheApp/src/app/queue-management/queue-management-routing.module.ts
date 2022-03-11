import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { PageNotFound } from '../404-error/404-not-found.component';
import { QueueManagementMainComponent } from './queue-management-main-component';
import { QueueManagementOpdComponent } from './opd/opd.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: QueueManagementMainComponent,
        children: [
          { path: '', redirectTo: 'Opd', pathMatch: 'full' },
          {
            path: 'Opd',
            component: QueueManagementOpdComponent, canActivate: [AuthGuardService]
          },
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

export class QueueManagementRoutingModule {

}
