import { Component, ChangeDetectorRef } from "@angular/core";

import { VoucherModel } from '../shared/voucher.model';
import { VoucherHeadModel } from '../shared/voucherhead.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { AccountingService } from '../../shared/accounting.service';

import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";
import { DanpheCache } from "../../../shared/danphe-cache-service-utility/cache-services";


@Component({
    selector: 'voucherhead-list',
    templateUrl: './voucher-head-list.html',
})
export class VoucherHeadListComponent {
    public voucherHeadList: Array<VoucherHeadModel> = new Array<VoucherHeadModel>();
    public showVoucherHeadList: boolean = true;
    public voucherHeadGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedVoucherHead: VoucherHeadModel;
    public index: number;

    constructor(public accountingSettingsBLService: AccountingSettingsBLService,public accountingService: AccountingService,
        public changeDetector: ChangeDetectorRef) {
        this.voucherHeadGridColumns = GridColumnSettings.voucherHeadList;
        this.getVoucherHeadList();
    }
    public getVoucherHeadList() {
        if(!!this.accountingService.accCacheData.VoucherHead && this.accountingService.accCacheData.VoucherHead.length>0){//mumbai-team-june2021-danphe-accounting-cache-change
        this.voucherHeadList = this.accountingService.accCacheData.VoucherHead;//mumbai-team-june2021-danphe-accounting-cache-change
        this.voucherHeadList = this.voucherHeadList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
         this.showVoucherHeadList = true;
        }   
    }
    VoucherHeadGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.selectedVoucherHead = null;
                this.showAddPage = false;
                this.index = $event.RowIndex;
                this.changeDetector.detectChanges();
                this.selectedVoucherHead = $event.Data;
                this.showVoucherHeadList = true;
                this.showAddPage = true;

            }
             
            default:
                break;
        }
    }
   
    AddVoucherHead() {
        this.index = null;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        if(this.index != null){
            this.voucherHeadList.splice(this.index, 1);
        }
        this.voucherHeadList.push($event.voucher);
        this.voucherHeadList = this.voucherHeadList.slice();
        this.UpdateVoucherHead();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedVoucherHead = null;
        this.index = null;
    }
    
    public UpdateVoucherHead() {
        try {
          DanpheCache.clearDanpheCacheByType(MasterType.VoucherHead);
          this.accountingService.RefreshAccCacheData();
        }
        catch (ex) {
          console.log(ex);
        }
    }

}
