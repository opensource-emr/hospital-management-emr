import { Component, ChangeDetectorRef, Output, EventEmitter, Renderer2 } from "@angular/core";

import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { PharmacyBLService } from "../../shared/pharmacy.bl.service"

import { PharmacyService } from "../../shared/pharmacy.service"
import { MessageboxService } from "../../../shared/messagebox/messagebox.service"
import { CommonFunctions } from "../../../shared/common.functions"
import * as moment from 'moment/moment';
import { Router } from '@angular/router';
import { PHRMStockManageModel } from "../../shared/phrm-stock-manage.model";

@Component({
    selector: 'stock-list',
    templateUrl: "./stock-list.html"
})
export class PHRMStockListComponent {

    public stockDetailsGridColumns: Array<any> = null;
    public stockDetailsList: any;
    loading: boolean = false;
    public rowIndex: number = null;
    public showStockList: boolean = true;
    public selectedItem: PHRMStockManageModel = new PHRMStockManageModel();

    public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
    globalListenFunc: Function;
    
    @Output("on-closed")
    public onClose = new EventEmitter<object>();
    constructor(
        public pharmacyBLService: PharmacyBLService, public pharmacyService: PharmacyService,
        public changeDetector: ChangeDetectorRef, public router: Router,
        public msgBoxServ: MessageboxService,
        public renderer2: Renderer2) {
        this.stockDetailsGridColumns = PHRMGridColumns.PHRMStockList;
        this.getAllItemsStockDetailsList();
    }
    // GET: Stock Details with 0, null or > 0 Quantity
    //this stock details with all unique (by ItemId,ExpiryDate,BatchNo)  records with sum of Quantity
    //items with 0 quantity or more than 0 showing in list    
    //get all items list with 0 or more than 0 stock qty for manage stock items

    ngOnInit() {
        this.globalListenFunc = this.renderer2.listen('document', 'keydown', e => {
            if (e.keyCode == this.ESCAPE_KEYCODE) {
                this.onClose.emit({ CloseWindow: true, EventName: "close" });
            }
        });
    }
    public getAllItemsStockDetailsList() {
        this.pharmacyBLService.GetAllItemsStockList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.stockDetailsList = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("error", ["Failed to get StockDetailsList. " + res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ["Failed to get StockDetailsList. " + err.ErrorMessage]);
                });
    }

    ////Grid Action Method
    StockDetailsGridAction($event: GridEmitModel) {
        switch ($event.Action) {
            case "manage-stock": {
                let x = $event.Action;
                this.rowIndex = $event.RowIndex;
                this.ManageStock($event.Data);
                break;
            }
            default:
                break;
        }
    }

    ManageStock(data) {
        try {
            if (data) {
                this.selectedItem = new PHRMStockManageModel();
                this.selectedItem = Object.assign(this.selectedItem, data);
                this.selectedItem.Quantity = data.AvailableQuantity;
                this.selectedItem.UpdatedQty = 0;
                this.selectedItem.InOut = null;
                this.showStockList = false;
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    //update stockManage transaction
    //Post to StockManage table and post to stockTxnItem table 
    SaveManagedStock() {
        try {
            if (this.selectedItem) {
                for (var b in this.selectedItem.StockManageValidator.controls) {
                    this.selectedItem.StockManageValidator.controls[b].markAsDirty();
                    this.selectedItem.StockManageValidator.controls[b].updateValueAndValidity();
                }
                let flag = (this.selectedItem.InOut == "out") ? (this.selectedItem.Quantity < this.selectedItem.UpdatedQty) ? false : true : true;
                if ((this.selectedItem.IsValidCheck(undefined, undefined) == true) && flag) {
                    this.loading = true;
                    this.pharmacyBLService.PostManagedStockDetails(this.selectedItem).
                        subscribe(res => {
                            if (res.Status == 'OK') {
                                if (res.Results) {
                                    this.msgBoxServ.showMessage("success", ["stock adjustment saved"]);
                                    this.changeDetector.detectChanges();
                                    let tempItm = this.stockDetailsList[this.rowIndex];
                                    if (this.selectedItem.InOut == 'in') {
                                        this.stockDetailsList[this.rowIndex].AvailableQuantity = tempItm.AvailableQuantity + this.selectedItem.UpdatedQty;
                                    } else if (this.selectedItem.InOut == 'out') {
                                        this.stockDetailsList[this.rowIndex].AvailableQuantity = tempItm.AvailableQuantity - this.selectedItem.UpdatedQty;
                                    }

                                    this.Cancel();
                                }
                            }
                            else {
                                this.msgBoxServ.showMessage("failed", ['failed ,please check log for details.']);
                                console.log(res);
                                this.Cancel();
                            }
                        });
                } else {
                    this.msgBoxServ.showMessage("notice", ['please see error message']);
                    this.loading = false;

                }
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }


    Cancel() {
        this.loading = true;
        try {
            this.selectedItem = new PHRMStockManageModel();
            this.showStockList = true;
            this.loading = false;
            this.rowIndex = null;
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    ////This function only for show catch messages in console 
    ShowCatchErrMessage(exception) {
        if (exception) {
            this.msgBoxServ.showMessage("error", ['error please check console lo for details'])
            this.showStockList = true;
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
            this.loading = false;
        }
    }
}



