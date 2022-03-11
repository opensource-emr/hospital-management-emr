import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { FixedAssetsMainComponent } from './fixed-assets-main.component';
import { AssetsManagementListComponent } from './assets-management/assets-list.component';
//import { AuthGuardService } from '../../security/shared/auth-guard.service';
import { PageNotFound } from './../404-error/404-not-found.component';
import { AssetsMaintenaceListComponent } from './assets-maintenance/assets-maintenance-list.component';
import { AssetDepreciationListComponent } from './assets-depreciation-discarding/asset-depreciation-list.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { ActivateInventoryGuardService } from '../shared/activate-inventory/activate-inventory-guard.service';
import { AssetSubstoreRequisitionDispatchComponent } from './assets-substore-requisition-dispatch/assets-substore-requisition-dispatch.component';
import { DirectDispatchComponent } from './assets-substore-requisition-dispatch/assets-substore-direct-dispatch/assets-substore-direct-dispatch.component';
import { FixedAssetReqDispatchComponent } from './assets-substore-requisition-dispatch/assets-substore-req-dispatch-list/assets-substore-req-dispatch-list.component';
import { FixedAssetsReportsComponent } from './assets-reports/fixedAssets-reports.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: FixedAssetsMainComponent,
        canActivate: [AuthGuardService, ActivateInventoryGuardService],
        children: [
          { path: '', redirectTo: 'AssetsManagement', pathMatch: 'full' },
          { path: 'AssetsManagement', component: AssetsManagementListComponent },
          { path: 'AssetsMaintenance', component: AssetsMaintenaceListComponent },
          { path: 'DepreciationAndDiscarding', component: AssetDepreciationListComponent },
          { path: 'AssetsSubstoreRequisition', component: AssetSubstoreRequisitionDispatchComponent },
          { path: 'AssetsSubstoreDirectDispatch', component: DirectDispatchComponent },
          { path: 'RequisitionDispatch', component: FixedAssetReqDispatchComponent },
          { path: 'Reports', loadChildren: './assets-reports/fixedAssets-reports.module#FixedAssetsReportsModule', canActivate: [AuthGuardService]}
        ]
      },
      { path: '**', component: PageNotFound },
    ])
  ],
  exports: [
    RouterModule
  ]
})

export class FixedAssetsRoutingModule {

}
