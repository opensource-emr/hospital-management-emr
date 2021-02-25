import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import PHRMGridColumns from '../shared/phrm-grid-columns';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { PHRMGoodsReceiptItemsModel } from "../shared/phrm-goods-receipt-items.model";
import { PharmacyBLService } from '../shared/pharmacy.bl.service';
import { PharmacyService } from "../shared/pharmacy.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
@Component({
    templateUrl:"./phrm-stock-batch-item-list.html"
})
export class PHRMStockBatchItemListComponent {

    ////variable to store StockDetail whose Available Qty is > then zero
    public stkGreaterThanZero: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
    ////variable to store StockDetail whose Available Qty is equal to zero
    public stkEqualToZero: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();

    ///final variable to combile both result Available Qty is > zero and Available Qty is equal to zero
    public finalStockList: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();

    public stockdetailGridColumns: Array<any> = null;
    public itemId: number = null;
    public itemName: string = null;

    constructor(
        public pharmacyBLService: PharmacyBLService,
        public pharmacyService: PharmacyService,
        public router: Router,
        public msgBoxServ: MessageboxService) {
        this.stockdetailGridColumns = PHRMGridColumns.PHRMStockItemAllBatchList;
        this.loadStockDetails(this.pharmacyService.Id);
    }
    //load stock item detail using item id
    loadStockDetails(id: number) {
        try {

            if (id != null) {
                this.itemId = id;
                this.itemName = this.pharmacyService.Name;
                this.pharmacyBLService.GetStockManageByItemId(this.itemId)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            ///data whose Available Qty is > then Zero store in stkGreaterThanZero variable
                            this.stkGreaterThanZero = res.Results.stockDetails;
                            ///data whose Available Qty is = Zero store in zeroStockDetails variable
                            this.stkEqualToZero = res.Results.zeroStockDetails;
                            this.finalStockList = [];
                            ////addeding both type of result to finalStockList
                            for (var i = 0; i < this.stkGreaterThanZero.length; i++) {
                                this.finalStockList.push(this.stkGreaterThanZero[i]);
                            }

                            for (var i = 0; i < this.stkEqualToZero.length; i++) {
                                this.finalStockList.push(this.stkEqualToZero[i]);
                            }
                            ///this.stockdetailsList = res.Results;
                            this.finalStockList.forEach(itm => {
                                itm.ExpiryDate = moment(itm.ExpiryDate).format('DD-MM-YYYY');
                            });
                        }
                        else {
                            this.msgBoxServ.showMessage("error", ["Failed to get details for selected Item. " + res.ErrorMessage]);
                        }
                    },
                    err => {
                        this.msgBoxServ.showMessage("error", ["Failed to get details for selected Item. " + err.ErrorMessage]);
                    });
            }
            else {
                this.msgBoxServ.showMessage("notice-message", ['Please, Select Stock-Item for Details.']);
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }


    }
    //route to manage stock page, passing item id
    NavigateToStockManage() {
        this.pharmacyService.Id = this.itemId;
        this.pharmacyService.Name = this.itemName;
        this.router.navigate(['/Pharmacy/Stock/StockManage']);
    }
    //route back to stock list page
    NavigateToStockDetailsList() {
        this.router.navigate(['/Pharmacy/Stock/StockDetails']);
    }

    ////This function only for show catch messages in console 
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }
}