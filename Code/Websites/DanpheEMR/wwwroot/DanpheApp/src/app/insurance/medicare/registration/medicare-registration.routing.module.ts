import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AuthGuardService } from "../../../security/shared/auth-guard.service";
import { MedicareDependentComponent } from "./dependent/medicare-dependent.component";
import { MedicareRegistrationMainComponent } from "./medicare-registration-main.component";
import { MedicareMemberComponent } from "./member/medicare-member.component";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: MedicareRegistrationMainComponent,
                children: [
                    { path: '', redirectTo: 'Member', pathMatch: 'full' },
                    { path: 'Member', component: MedicareMemberComponent, canActivate: [AuthGuardService] },
                    { path: 'Dependent', component: MedicareDependentComponent, canActivate: [AuthGuardService] },
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class MedicareRegistrationRoutingModule { }