import { Component, ChangeDetectorRef, Input, OnInit, EventEmitter, Output } from "@angular/core";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
@Component({
    selector: "app-update-mrp",
    templateUrl: "./phrm-update-mrp.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PHRMUpdateMRPComponent implements OnInit {
    public oldMRP: number;
    public oldExpiryDate: any;
    public oldBatchNo: any;
    @Input('currentStock')
    public currentStock: IMRPUpdatedStock;
    @Output('callback-update')
    public callBackUpdate: EventEmitter<Object> = new EventEmitter<Object>();
    constructor(public pharmacyBLService: PharmacyBLService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService) {
    }
    ngOnInit(): void {
        this.oldMRP = this.currentStock.MRP;
    }
    Update() {
        if (this.CheckMRP()) {
            if (confirm("Are you Sure want to update MRP?")) {
                this.pharmacyBLService.UpdateStockMRP(this.currentStock)
                    .finally(() => { this.Close() })
                    .subscribe(
                        res => {
                            if (res.Status == "OK" && res.Results != null) {
                                this.msgBoxServ.showMessage("success", ['Item MRP Updated.']);
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

    CheckMRP() {
        if (this.currentStock == null) return false;
        if (this.currentStock.MRP == null) return false;
        if (this.currentStock.MRP <= 0) return false;
        return true;
    }
    public hotkeys(event) {
        //For ESC key => close the pop up
        if (event.keyCode == 27) {
            this.Close();
        }
    }

}

export interface IMRPUpdatedStock {
    StockId?: number;//for dispensary
    ItemId?: number;//for store
    BatchNo?: string;//for store
    ExpiryDate?: string;//for store
    GoodsReceiptItemId?: number;//for store
    LocationId: number;
    MRP: number;
    oldMRP: number;
    CostPrice: number;
}