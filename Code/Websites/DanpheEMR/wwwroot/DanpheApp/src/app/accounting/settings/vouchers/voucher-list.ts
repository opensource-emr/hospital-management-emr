
import { Component, ChangeDetectorRef } from "@angular/core";

import { VoucherModel } from '../shared/voucher.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
import { AccountingService } from "../../shared/accounting.service";
import { Voucher } from "../../transactions/shared/voucher";

@Component({
    selector: 'voucher-list',
    templateUrl: './voucher-list.html',
})
export class VoucherListComponent {
    public voucherList: Array<Voucher> = new Array<Voucher>();//mumbai-team-june2021-danphe-accounting-cache-change
    public showVoucherList: boolean = true;
    public voucherGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedVoucher: VoucherModel;
    public index: number;

    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public changeDetector: ChangeDetectorRef, public accountingService:AccountingService) {
        this.voucherGridColumns = GridColumnSettings.voucherList;
        this.getVoucherList();
    }
    public getVoucherList() {
            if (!!this.accountingService.accCacheData.VoucherType && this.accountingService.accCacheData.VoucherType.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
                this.voucherList = this.accountingService.accCacheData.VoucherType;//mumbai-team-june2021-danphe-accounting-cache-change
                this.voucherList = this.voucherList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
                this.showVoucherList = true;
            }
    }
    //VoucherGridActions($event: GridEmitModel) {

    //    switch ($event.Action) {
    //        case "edit": {
    //            this.selectedVoucher = null;
    //            this.index = $event.RowIndex;
    //            this.showAddPage = false;
    //            this.changeDetector.detectChanges();
    //            this.selectedVoucher = $event.Data;
    //            this.showAddPage = true;
    //        }
    //        default:
    //            break;
    //    }
    //}
    AddVoucher() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        this.voucherList.push($event.voucher);
        if (this.index)
            this.voucherList.splice(this.index, 1);
        this.voucherList = this.voucherList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedVoucher = null;
        this.index = null;
    }


}