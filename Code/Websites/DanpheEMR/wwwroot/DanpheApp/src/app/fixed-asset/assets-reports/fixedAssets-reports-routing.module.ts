import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { FixedAssetsReportsComponent } from "../assets-reports/fixedAssets-reports.component"
import { FixedAssetsMovementComponent } from './fixed-assets-movement/fixed-assets-movement.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: FixedAssetsReportsComponent },
      { path: 'FixedAssetsMovement', component: FixedAssetsMovementComponent },
    ])
  ],
  exports: [
    RouterModule
  ]
})

export class FixedAssetsReportsRoutingModule {

}
