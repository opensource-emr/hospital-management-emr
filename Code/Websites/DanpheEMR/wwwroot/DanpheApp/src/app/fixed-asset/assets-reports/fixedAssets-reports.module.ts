import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { FixedAssetBLService } from '../shared/fixed-asset.bl.service';
import { FixedAssetDLService } from '../shared/fixed-asset.dl.service';
import { FixedAssetService } from '../shared/fixed-asset.service';
import { FixedAssetsReportsComponent } from './fixedAssets-reports.component';
import { FixedAssetsMovementComponent } from './fixed-assets-movement/fixed-assets-movement.component';
import { FixedAssetsReportsRoutingModule } from './fixedAssets-reports-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ReportingService } from '../../reporting/shared/reporting-service';

@NgModule({
  providers: [FixedAssetBLService,FixedAssetDLService,FixedAssetService,ReportingService,
    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FixedAssetsReportsRoutingModule,
    SharedModule
  ],
  declarations:[
    FixedAssetsReportsComponent,
    FixedAssetsMovementComponent
  ],
  bootstrap: [FixedAssetsReportsComponent],
})
export class FixedAssetsReportsModule { }
