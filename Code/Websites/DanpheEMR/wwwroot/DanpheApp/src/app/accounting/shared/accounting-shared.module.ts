import { NgModule } from '@angular/core';
import { SharedModule } from "../../shared/shared.module";
import { TransactionViewComponent } from "../transactions/transaction-view.component";
import { AccountingBLService } from './accounting.bl.service';
@NgModule({
    providers: [AccountingBLService],
    imports: [
        SharedModule
    ],
    declarations: [
        TransactionViewComponent
    ],
    exports: [TransactionViewComponent,SharedModule]
})
export class AccountingSharedModule { }