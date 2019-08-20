import { Component, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';
import PHRMGridColumns from '../shared/phrm-grid-columns';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { CommonFunctions } from "../../shared/common.functions";
import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { MessageboxService } from '../../shared/messagebox/messagebox.service';

import { SecurityService } from '../../security/shared/security.service';

import * as moment from 'moment/moment';


@Component({
    templateUrl: "../../view/pharmacy-view/Setting/PHRMStockTxnItemsManage.html" // "/PharmacyView/PHRMStockTxnItemsManage"

})
export class PHRMStockTxnItemsManageComponent {
  

    public currentStockTxnItem: any = null;
    
    public stockTxnItemList: Array<any> = new Array<any>();
    public stockTxnItemsGridColumns: Array<any> = null;
    public showStockTxnItemsUpdatePage: boolean = false;
    public update: boolean = false;
    public index: number;
    public isValidMRP: boolean = true;
    public oldMRP: number = null;
    
    constructor(
        public pharmacyBLService: PharmacyBLService,
        public changeDetector: ChangeDetectorRef,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService) {
        this.stockTxnItemsGridColumns = PHRMGridColumns.StockTxnItems;
        this.GetStockTxnItems();
    }
    //get stock txn item list
    public GetStockTxnItems() {
        this.pharmacyBLService.GetStockTxnItems()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.stockTxnItemList = res.Results;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                    console.log(res.ErrorMessage);
                }
            });
    }
    StockTxnItemGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "update-mrp":{                
                this.update = true;
                this.index = $event.RowIndex;
                this.showStockTxnItemsUpdatePage = false;
                this.changeDetector.detectChanges();
                this.oldMRP =$event.Data.MRP;
                this.currentStockTxnItem = $event.Data;                              
                this.showStockTxnItemsUpdatePage = true;

                break;
            }
            default:
                break;
        }
    }
   
    Update() {
        this.CheckMRPValidation();
        if (this.currentStockTxnItem) {

            if (confirm("Are you Sure want to update MRP ?") && this.isValidMRP) {
                                
                this.pharmacyBLService.PutStockTxnItemMRP(this.currentStockTxnItem)
                    .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ['Item MRP Updated.']);
                            this.CallBackAddUpdate(res)                           
                        }
                        else {
                            this.msgBoxServ.showMessage("failed", ["Something Wrong " + res.ErrorMessage]);
                            this.Close()
                        }
                    },
                    err => {
                        this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
                        this.Close();
                    });
            }
        }            
    }
    CallBackAddUpdate(res) {
        if (res.Status == "OK") {
          
            var stktxnitm: any = {};
            stktxnitm.StockTxnItemId = res.Results.StockTxnItemId;
            stktxnitm.ItemId = res.Results.ItemId;
            stktxnitm.ItemName = this.currentStockTxnItem.ItemName;
            stktxnitm.BatchNo = res.Results.BatchNo
            stktxnitm.Quantity = res.Results.Quantity
            stktxnitm.Price = res.Results.Price
            stktxnitm.MRP = res.Results.MRP
            stktxnitm.SubTotal = res.Results.SubTotal
            stktxnitm.TotalAmount = res.Results.TotalAmount
            stktxnitm.InOut = res.Results.InOut
            stktxnitm.CreatedOn = res.Results.CreatedOn
            stktxnitm.CreatedBy = res.Results.CreatedBy
            stktxnitm.VATPercentage = res.Results.VATPercentage
            stktxnitm.DiscountPercentage = res.Results.DiscountPercentage
            stktxnitm.ExpiryDate = res.Results.ExpiryDate
          
            this.CallBackAdd(stktxnitm);
        }
        else {
            this.msgBoxServ.showMessage("error", ['some error ' + res.ErrorMessage]);
        }
    }
    CallBackAdd(itm) {
        this.stockTxnItemList.push(itm);
        if (this.index != null)
            this.stockTxnItemList.splice(this.index, 1);
        this.stockTxnItemList= this.stockTxnItemList.slice();
        this.changeDetector.detectChanges();
        this.showStockTxnItemsUpdatePage = false;
        this.currentStockTxnItem = null;
        this.index = null;
        this.isValidMRP = true;
    }
    Close() {        
        this.currentStockTxnItem = null;        
        this.update = false;
        this.showStockTxnItemsUpdatePage = false;
    }
    
    CheckMRPValidation() {
        if (this.currentStockTxnItem.MRP) {
            if (this.currentStockTxnItem.MRP <= 0) {
                this.isValidMRP = false;
            } else {
                this.isValidMRP = true;
            }
        } else {
            this.isValidMRP = false;
        }     
    }
}