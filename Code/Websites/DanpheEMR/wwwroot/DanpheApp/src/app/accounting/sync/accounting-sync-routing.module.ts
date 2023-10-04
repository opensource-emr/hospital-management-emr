import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { AccountingSyncComponent } from './accounting-sync.component';
import { InventorySyncComponent } from './inventory-sync/inventory-sync.component';
@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AccountingSyncComponent,
                children: [
                    { path: '', redirectTo: 'InventorySync', pathMatch: 'full' },
                    { path: 'InventorySync', component: InventorySyncComponent}
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})

export class AccountingSyncRoutingModule {

}