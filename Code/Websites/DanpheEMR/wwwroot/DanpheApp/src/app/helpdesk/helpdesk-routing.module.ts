import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { HelpdeskComponent } from './helpdesk.component';
import { EmployeeInfoComponent } from './employeeinfo/employeeinfo.component';
import { BedInfoComponent } from "./bedinfo/bed-info.component";
import { WardInfoComponent } from "./wardinfo/ward-info.component";
import { AuthGuardService } from '../security/shared/auth-guard.service';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: HelpdeskComponent,canActivate: [AuthGuardService] ,
                
                children: [
                    //{ path: '', component: HelpdeskComponent },
                    { path: '', redirectTo: 'BedInformation', pathMatch: 'full' },
                    { path: 'EmployeeInformation', component: EmployeeInfoComponent,canActivate: [AuthGuardService]  },
                    { path: 'BedInformation', component: BedInfoComponent,canActivate: [AuthGuardService]  },
                    { path: 'WardInformation', component: WardInfoComponent,canActivate: [AuthGuardService]  }
                    ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class HelpdeskRoutingModule {

}