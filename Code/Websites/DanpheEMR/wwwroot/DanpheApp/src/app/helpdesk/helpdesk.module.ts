
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { HelpdeskRoutingModule } from "./helpdesk-routing.module";
import { HelpdeskMainComponent } from "./helpdesk-main.component";
import { HelpDeskBLService } from './shared/helpdesk.bl.service';
import { HelpDeskDLService } from './shared/helpdesk.dl.service'
import { HlpDskEmployeeInfoComponent } from "./employeeinfo/employee-info.component";
import { HlpDskWardInfoComponent } from "./wardinfo/ward-info.component";
import { HlpDskBedInfoComponent } from "./bedinfo/bed-info.component";
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { SharedModule } from "../shared/shared.module";
import { HlpDskQueueInfoComponent } from './queueinformation/queue-info.componet';
@NgModule({
  providers: [
    HelpDeskBLService,
    HelpDeskDLService,
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  imports: [
    HelpdeskRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    DanpheAutoCompleteModule,
    SharedModule,

  ],
  declarations: [
    HelpdeskMainComponent,
    HlpDskBedInfoComponent,
    HlpDskEmployeeInfoComponent,
    HlpDskWardInfoComponent,
    HlpDskQueueInfoComponent
  ],
  bootstrap: []
})
export class HelpdeskModule { }
