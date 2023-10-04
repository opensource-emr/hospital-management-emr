import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { HelpdeskMainComponent } from "./helpdesk-main.component";
import { HlpDskEmployeeInfoComponent } from './employeeinfo/employee-info.component';
import { HlpDskBedInfoComponent } from "./bedinfo/bed-info.component";
import { HlpDskWardInfoComponent } from "./wardinfo/ward-info.component";
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { PageNotFound } from '../404-error/404-not-found.component';
import { HlpDskQueueInfoComponent } from './queueinformation/queue-info.componet';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: HelpdeskMainComponent, canActivate: [AuthGuardService],

        children: [
          //{ path: '', component: HelpdeskComponent },
          { path: '', redirectTo: 'BedInformation', pathMatch: 'full' },
          { path: 'EmployeeInformation', component: HlpDskEmployeeInfoComponent, canActivate: [AuthGuardService] },
          { path: 'BedInformation', component: HlpDskBedInfoComponent, canActivate: [AuthGuardService] },
          { path: 'WardInformation', component: HlpDskWardInfoComponent, canActivate: [AuthGuardService] },
          { path: 'QueueInformation', component: HlpDskQueueInfoComponent, canActivate: [AuthGuardService] },
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
export class HelpdeskRoutingModule {

}
