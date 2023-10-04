import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";

import { OrderMainComponent } from './orders-main.component';
import { OrderRequisitionsComponent } from './order/order-requisition.component';
import { ResetOrdersGuard } from './reset-order-guard';
import { PrintMedicationsComponent } from './order/print-order';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { PageNotFound } from '../404-error/404-not-found.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: OrderMainComponent, canActivate: [AuthGuardService, ResetOrdersGuard]
            },
            { path: 'OrderRequisition', component: OrderRequisitionsComponent,canActivate: [AuthGuardService]  },
            { path: 'PrintMedication', component: PrintMedicationsComponent, canActivate: [AuthGuardService] },
            { path: "**", component: PageNotFound }
                //children: [
                //    { path: '', redirectTo: 'lab-select', pathMatch: 'full' },
                //    { path: 'lab-select', component: LabTestsSelectComponent },
                //    { path: 'OrderLabTests', component: LabTestsOrderComponent },
                //    //{ path: 'imaging-select', component: ImagingRequisitionComponent },
                //]
                    ])
    ],
    exports: [
        RouterModule
    ]
})
export class OrdersRoutingModule {

}
