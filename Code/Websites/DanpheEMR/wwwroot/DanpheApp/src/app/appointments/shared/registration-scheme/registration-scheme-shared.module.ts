import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../../../../app/shared/shared.module";
import { BillingSharedModule } from "../../../billing/billing-shared.module";
import { InsuranceSharedModule } from "../../../insurance/shared/insurance-shared.module";
import { SettingsSharedModule } from "../../../settings-new/settings-shared.module";
import { RegistrationSchemeSelectComponent } from "./registration-scheme-select.component";

@NgModule({
    providers: [
    ],
    imports: [ReactiveFormsModule,
        FormsModule,
        CommonModule,
        RouterModule,
        SharedModule,
        SettingsSharedModule,
        BillingSharedModule,
        InsuranceSharedModule],
    declarations: [
        RegistrationSchemeSelectComponent,
    ],
    exports: [RegistrationSchemeSelectComponent]
})
export class RegistrationSchemeSharedModule {

}