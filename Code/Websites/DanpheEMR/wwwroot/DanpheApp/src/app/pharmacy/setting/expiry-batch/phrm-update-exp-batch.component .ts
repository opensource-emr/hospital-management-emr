import { Component, ChangeDetectorRef, Input, OnInit, EventEmitter, Output } from "@angular/core";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment'

@Component({
    selector: "app-update-exp-batch",
    templateUrl: "./phrm-update-exp-batch.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PHRMUpdateExpiryDateandBatchNoComponent implements OnInit {
    public oldExpiryDate: any;
    public oldBatchNo: any;
    @Input('currentStock')
    public currentStock: PHRMUpdatedStockVM;
    @Output('callback-update')
    public callBackUpdate: EventEmitter<Object> = new EventEmitter<Object>();
    constructor(public pharmacyBLService: PharmacyBLService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService) {
    }
    ngOnInit(): void {
        this.currentStock.ExpiryDate = moment(this.currentStock.ExpiryDate).format('YYYY-MM-DD');
        this.oldExpiryDate = moment(this.currentStock.ExpiryDate).format('LL');
        this.oldBatchNo = this.currentStock.BatchNo;
        this.currentStock.OldBatchNo = this.oldBatchNo;
        this.currentStock.OldExpiryDate = this.oldExpiryDate;
    }
    Update() {
        if (this.CheckExpirtyDateandBatchNoValidation()) {
            if (confirm("Are you Sure want to update Expiry Date and Batch No.?")) {
                this.pharmacyBLService.UpdateStockExpiryDateandBatchNo(this.currentStock)
                    .finally(() => { this.Close() })
                    .subscribe(
                        res => {
                            if (res.Status == "OK" && res.Results != null) {
                                this.msgBoxServ.showMessage("success", ['Item Expiry Date and Batch No. Updated.']);
                                this.changeDetector.detectChanges();
                                this.callBackUpdate.emit({ event: 'update', stock: res.Results })
                            }
                            else {
                                this.msgBoxServ.showMessage("failed", ["Something Wrong " + res.ErrorMessage]);
                            }
                        },
                        err => {
                            this.msgBoxServ.showMessage("error", ["Something Wrong " + err.error.ErrorMessage]);
                        });
            }
        }
    }
    Close() {
        this.currentStock = null;
        this.callBackUpdate.emit({ event: 'close' })
    }

    CheckExpirtyDateandBatchNoValidation() {
        if (this.currentStock == null) return false;
        if (this.currentStock.ExpiryDate == null && this.currentStock.BatchNo == null) return false;

        return true;
    }
    public hotkeys(event) {
        //For ESC key => close the pop up
        if (event.keyCode == 27) {
            this.Close();
        }
    }
}

export interface PHRMUpdatedStockVM {
    StockId?: number;//for dispensary
    ItemId?: number;//for store
    BatchNo?: string;//for store
    ExpiryDate?: string;//for store
    GoodsReceiptItemId?: number;//for store
    LocationId: number;
    MRP: number;
    OldBatchNo?: string;
    OldExpiryDate?: string;
    OldMRP: number;
    CostPrice: number;


}