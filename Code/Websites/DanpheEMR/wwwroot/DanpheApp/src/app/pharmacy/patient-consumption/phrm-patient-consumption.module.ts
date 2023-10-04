import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BillingSharedModule } from "../../billing/billing-shared.module";
import { SettingsSharedModule } from "../../settings-new/settings-shared.module";
import { DanpheAutoCompleteModule } from "../../shared/danphe-autocomplete";
import { SharedModule } from "../../shared/shared.module";
import { PHRMFinalizeInvoiceComponent } from "./Finalize-Invoice/phrm-finalize-invoice.component";
import { ConsumptionReceiptComponent } from './consumption-receipt/consumption-receipt.component';
import { ConsumptionReturnReceiptComponent } from "./consumption-return-receipt/consumption-return-receipt.component";
import { PHRMFinalizeConsumptionWrapperComponent } from "./finalize-consumption-wrapper/phrm-finalize-consumption-wrapper.component";
import { PHRMPatientConsumptionAddComponent } from "./new-consumption/phrm-patient-consumption-add.component";
import { PHRMPatientConsumptionListComponent } from "./patient-consumption-list/phrm-patient-consumption-list.component";
import { PatientConsumptionMainComponent } from './patient-consumption-main.component';
import { PHRMPatientConsumptionFinalizeComponent } from "./phrm-finalize-consumption-list/phrm-finalize-consumption-component";
import { PHRMReturnPatientConsumptionComponent } from "./return-consumption-items/return-consumption-items.component";
import { ReturnConsumptionListComponent } from './return-consumption-list/return-consumption-list.component';

@NgModule({
    providers: [],
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, SharedModule, SettingsSharedModule, DanpheAutoCompleteModule, BillingSharedModule
    ],
    declarations: [
        PHRMPatientConsumptionListComponent,
        PHRMPatientConsumptionAddComponent,
        PHRMReturnPatientConsumptionComponent,
        PHRMFinalizeInvoiceComponent,
        PHRMFinalizeConsumptionWrapperComponent,
        PatientConsumptionMainComponent,
        ReturnConsumptionListComponent,
        ConsumptionReceiptComponent,
        PHRMPatientConsumptionFinalizeComponent,
        ConsumptionReturnReceiptComponent
    ],
    exports: [
        PHRMPatientConsumptionAddComponent,
        PHRMPatientConsumptionListComponent,
        PHRMReturnPatientConsumptionComponent,
        PHRMFinalizeInvoiceComponent,
        PHRMFinalizeConsumptionWrapperComponent,
        PatientConsumptionMainComponent,
        ReturnConsumptionListComponent,
        ConsumptionReceiptComponent,
        PHRMPatientConsumptionFinalizeComponent,
        ConsumptionReturnReceiptComponent
    ],
    bootstrap: [PHRMPatientConsumptionListComponent]
})

export class PHRMPatientConsumptionModule { }
