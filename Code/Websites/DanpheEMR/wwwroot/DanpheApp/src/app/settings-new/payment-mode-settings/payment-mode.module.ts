import { CommonModule, HashLocationStrategy, LocationStrategy } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../../shared/shared.module";
import { PaymentModeMainComponent } from "./payment-mode.main.component";

export const paymentModeRoutes =
  [
    {
      path: '', component: PaymentModeMainComponent
    }
  ] 


@NgModule({
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    RouterModule.forChild(paymentModeRoutes),

  ],
  declarations: [ 
      PaymentModeMainComponent    
  ],
  bootstrap: []
})

export class PaymentModeSettingsModule {

}