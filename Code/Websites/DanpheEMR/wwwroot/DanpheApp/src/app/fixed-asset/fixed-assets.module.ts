import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FixedAssetsRoutingModule } from './fixed-assets-routing.module';
import { FixedAssetsMainComponent } from './fixed-assets-main.component';
import { AssetsManagementListComponent } from './assets-management/assets-list.component';
import { SharedModule } from '../shared/shared.module';
import { NotifyDamagedComponent } from './assets-management/notify-damage/notify-damage.component';
import { AssetEditComponent } from './assets-management/asset-edit/asset-edit.component';
import { AssetContractUploadComponent } from './assets-management/contract-upload/asset-contract-upload.component';
import { AssetsMaintenaceListComponent } from './assets-maintenance/assets-maintenance-list.component';
import { AssetsMaintenaceEditComponent } from './assets-maintenance/asset-edit/asset-maintenance-edit.componet';
import { AssetDepreciationListComponent } from './assets-depreciation-discarding/asset-depreciation-list.component';
import { AssetDepreciationComponent } from './assets-depreciation-discarding/depreciation-add-edit/asset-depreciation.componet';
import { AssetConditionCheckListComponent } from './assets-maintenance/environment-condition-checklist/asset-condition-check-list.componet';
import { AssetFaultUpdateComponent } from './assets-maintenance/fault-update/asset-fault-update.componet';
import { AssetInsuranceComponent } from './assets-management/insurance-add-edit/asset-insurance.componet';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { AssetScrapComponent } from './assets-depreciation-discarding/scraping/asset-scrap.component';
import { AssetServiceComponent } from './assets-maintenance/periodic-service/asset-service.componet';
import { FixedAssetDLService } from './shared/fixed-asset.dl.service';
import { FixedAssetBLService } from './shared/fixed-asset.bl.service';
import { FixedAssetService } from './shared/fixed-asset.service';
import { RouteFromService } from '../shared/routefrom.service';
import { AssetSubstoreRequisitionDispatchComponent } from './assets-substore-requisition-dispatch/assets-substore-requisition-dispatch.component';
import { AssetSubstoreRequisitionDispatchDetailsComponent } from './assets-substore-requisition-dispatch/assets-substore-requisition-dispatch-details.component';
import { DirectDispatchComponent } from './assets-substore-requisition-dispatch/assets-substore-direct-dispatch/assets-substore-direct-dispatch.component';
import { FixedAssetReqDispatchComponent } from './assets-substore-requisition-dispatch/assets-substore-req-dispatch-list/assets-substore-req-dispatch-list.component';


@NgModule({
  providers: [FixedAssetService, FixedAssetDLService, FixedAssetBLService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FixedAssetsRoutingModule,
    SharedModule,
    DanpheAutoCompleteModule,
  ],
  declarations: [
    FixedAssetsMainComponent,
    AssetsManagementListComponent,
    NotifyDamagedComponent,
    AssetEditComponent,
    AssetsMaintenaceListComponent,
    AssetsMaintenaceEditComponent,

    AssetContractUploadComponent,

    AssetDepreciationListComponent,
    AssetDepreciationComponent,
    AssetConditionCheckListComponent,
    AssetFaultUpdateComponent,

    AssetInsuranceComponent,
    AssetScrapComponent,
    AssetServiceComponent,
    AssetSubstoreRequisitionDispatchComponent,
    AssetSubstoreRequisitionDispatchDetailsComponent,
      DirectDispatchComponent,
     FixedAssetReqDispatchComponent
  ],

  bootstrap: [FixedAssetsMainComponent]
})
export class FixedAssetsModule { }
