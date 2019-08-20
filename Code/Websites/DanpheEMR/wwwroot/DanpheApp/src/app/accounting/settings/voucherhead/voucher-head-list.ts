import { Component, ChangeDetectorRef } from "@angular/core";

import { VoucherModel } from '../shared/voucher.model';
import { VoucherHeadModel } from '../shared/voucherhead.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';


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

    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public changeDetector: ChangeDetectorRef) {
        this.voucherHeadGridColumns = GridColumnSettings.voucherHeadList;
        this.getVoucherHeadList();
    }
    public getVoucherHeadList() {
        this.accountingSettingsBLService.GetVoucherHead()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.voucherHeadList = res.Results;

                    this.showVoucherHeadList = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
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
        this.voucherHeadList.push($event.voucher);
        if (this.index)
            this.voucherHeadList.splice(this.index, 1);
        this.voucherHeadList = this.voucherHeadList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedVoucherHead = null;
        this.index = null;
    }

}