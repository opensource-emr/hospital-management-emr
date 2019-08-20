
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule  } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { HelpdeskRoutingModule } from "./helpdesk-routing.module";
import { HelpdeskComponent } from "./helpdesk.component";
import { HelpDeskBLService } from './shared/helpdesk.bl.service';
import { HelpDeskDLService } from './shared/helpdesk.dl.service'
import { EmployeeInfoComponent } from "./employeeinfo/employeeinfo.component";
import { WardInfoComponent } from "./wardinfo/ward-info.component";
import { BedInfoComponent } from "./bedinfo/bed-info.component";
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { SharedModule } from "../shared/shared.module";
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
       // Ng2AutoCompleteModule,
       DanpheAutoCompleteModule,
        SharedModule,

    ],
    declarations: [
        HelpdeskComponent,
        BedInfoComponent,
        EmployeeInfoComponent,
        WardInfoComponent
       ],
    bootstrap: []
})
export class HelpdeskModule { }