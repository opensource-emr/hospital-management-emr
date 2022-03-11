import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { LISMachineResultComponent } from "./lis-machine-result/lis-machine-result.component";
import { LISMainComponent } from './lis-main.component';
import { LISMappingComponent } from "./lis-mapping/lis-mapping.component";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: LISMainComponent,
                children: [
                    { path: '', redirectTo: 'LISComponentMapping', pathMatch: 'LISComponentMapping' },
                    { path: 'LISComponentMapping', component: LISMappingComponent },
                    { path: 'LISMachineResult', component: LISMachineResultComponent }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class LISRoutingModule {

}
