import { Component, ChangeDetectorRef, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { SecurityService } from "../../../security/shared/security.service";
import { FixedAssetBLService } from "../../shared/fixed-asset.bl.service";
import { CoreService } from "../../../core/shared/core.service";
import { FixedAssetService } from "../../shared/fixed-asset.service";
import GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

import {FixedAssetDispatch} from "../../../fixed-asset/shared/fixed-asset-dispatch.model";
import {FixedAssetDispatchItems} from "../../../fixed-asset/shared/fixed-asset-dispatch-items.model"
@Component({
    selector: "assets-substore-req-dispatch",
    templateUrl: "./assets-substore-req-dispatch-list.component.html", 
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class FixedAssetReqDispatchComponent { 
    public requisitionId: number = 0;
    public showDispatchList: boolean = false;
    public dispatchList: Array<{ CreatedByName, CreatedOn, RequisitionId, DispatchId, ReceivedBy, DispatchedByName, DepartmentName }> = new Array<{ CreatedByName, CreatedOn, RequisitionId, DispatchId, ReceivedBy, DispatchedByName, DepartmentName }>();
    public DispatchListGridColumns: ({ headerName: string; field: string; width: number; template?: undefined; } | { headerName: string; field: string; width: number; template: string; })[];
    public RequisitionNepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public DispatchNepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public dateRange: string = null;
    public showDetailsbyDispatchId: boolean = false;
    public Sum: number = 0;
    public innerDispatchdetails: FixedAssetDispatch = new FixedAssetDispatch();
    public dispatchListbyId: Array<FixedAssetDispatch> = new Array<FixedAssetDispatch>();
    public itemDetails: Array<FixedAssetDispatch> = new Array<FixedAssetDispatch>();
    public details: Array<FixedAssetDispatchItems> = new Array<FixedAssetDispatchItems>();
    constructor(
        public fixedAssetBLService: FixedAssetBLService,
        public router: Router,
        public routeFrom: RouteFromService,
        public securityService: SecurityService,
        public messageBoxService: MessageboxService,
        public coreService: CoreService, public fixedAssetService:FixedAssetService){
            this.DispatchListGridColumns = GridColumnSettings.ReqDispatchList;
            this.dateRange = 'None';
            this.RequisitionNepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RequisitionDate', false));  
            this.DispatchNepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('Dispatchdate', false));
            this.GetDispatchList()
        }

GetDispatchList(){
      this.fixedAssetBLService.GetDispatchDetails(this.fixedAssetService.RequisitionId)
           .subscribe(res => this.ShoWDispatchbyRequisitionId(res));
  }

  ShoWDispatchbyRequisitionId(res) {
    if (res.Status == "OK" && res.Results.length != 0) {
      this.dispatchList = res.Results;
    }
    else {
      this.showDispatchList = false;
      this.messageBoxService.showMessage("notice-message", ["There is no Requisition details !"]);

    }

  }
  DispatchDetailsGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        if ($event.Data != null) {
            var DispatchId=$event.Data.DispatchId
          this.innerDispatchdetails = $event.Data;
         
          this.ShowbyDispatchId(DispatchId);
          this.showDispatchList = false;
        }
      
        break;
      }
      default:
        break;
    }
  }
  ShowbyDispatchId(DispatchId) {
    this.fixedAssetBLService.GetDispatchDetailsbyDispatchId(DispatchId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.dispatchListbyId = res.Results;
          this.itemDetails = this.dispatchListbyId.filter(a => a.DispatchId==this.innerDispatchdetails.DispatchId)
          
         this.details = this.itemDetails[0].DispatchItems
          this.showDetailsbyDispatchId = true;
        }
        else {
          this.messageBoxService.showMessage("failed", ['failed to get Dispatch List. ' + res.ErrorMessage]);
        }
      },
        err => {
          this.messageBoxService.showMessage("error", ['failed to get Dispatch List. ' + err.ErrorMessage]);
        }
      );
  }
  Close() {
    this.showDispatchList = false;
    this.showDetailsbyDispatchId = false;
    this.Sum = 0;
    this.router.navigate(["/FixedAssets/AssetsSubstoreRequisition"]);
  }
  Cancel(){
      this.showDispatchList=true;
      this.showDetailsbyDispatchId = false;
  }
  gridExportOptions = {
    fileName: 'DispatchLists_' + moment().format('YYYY-MM-DD') + '.xls',
  };
  public hotkeys(event) {
    //For ESC key => close the pop up
    if (event.keyCode == 27) {
      this.Close();
    }
  }
}