import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AccountingSyncDLService } from "../shared/accounting-sync.dl.service";
import { InventorySyncModel } from "../shared/inventory-sync.model";
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { AccountingSyncBaseComponent } from '../accounting-sync-base.component';
import { TransactionModel } from '../../transactions/shared/transaction.model';
import { TransactionInventoryItem } from '../../transactions/shared/transaction-inventory-item.model';
import { TransactionItem } from '../../transactions/shared/transaction-item.model';
import { AccountingService } from '../../shared/accounting.service';
@Component({
    templateUrl: './inventory-sync-main.html',
})
export class InventorySyncComponent extends AccountingSyncBaseComponent<InventorySyncModel>{
    syncType = 'inventory';
    constructor(
        public accSyncDLService: AccountingSyncDLService,
        public msgBoxServ: MessageboxService,public accountingService:AccountingService) {
        super(accSyncDLService, msgBoxServ,accountingService);
        this.currentVoucher = this.voucherList.find(a => a.VoucherName == "Purchase Voucher");
    }
   
    public PullToAccounting() {
        let txns = this.MapInvToTxn(this.items.filter(a => a.IsSelected));
        this.PostToAccountingTransaction(txns);
    }
    public MapInvToTxn(items: Array<InventorySyncModel>): Array<TransactionModel> {
        let txns = new Array<TransactionModel>();
        items.forEach(itm => {
            let txn = new TransactionModel();
            let totalVAT = 0;
            //mapping for transaction.
            txn.TotalAmount = itm.TotalAmount;
            txn.TransactionDate = itm.GoodsReceiptDate;
            txn.Remarks = itm.Remarks;
            txn.FiscalYearId = this.currentFiscalYear.FiscalYearId;
            txn.VoucherId = this.currentVoucher.VoucherId;
            //mapping for account head ledger.
            let txnItm = new TransactionItem;
            txnItm.LedgerId = this.GetLedgerId("Medicine");
            //txnItm.HasInventoryItems = true;
            txnItm.DrCr = true;
            itm.GoodsReceiptItems.forEach(receiptItem => {
                let invItm = new TransactionInventoryItem();
                invItm.Amount = receiptItem.TotalAmount;
                invItm.Quantity = receiptItem.ReceivedQuantity;
                invItm.ItemId = receiptItem.ItemId;
                txnItm.Amount += receiptItem.TotalAmount;
                txnItm.Quantity += receiptItem.ReceivedQuantity;
                totalVAT += receiptItem.VATAmount; 
            });
            txn.TransactionItems.push(txnItm);
            //mapping for vendor/cash/credit.
            txnItm = new TransactionItem();
            txnItm.LedgerId = this.GetLedgerId("Cash");
            txnItm.Amount = itm.TotalAmount;
            txnItm.DrCr = false;
            txn.TransactionItems.push(txnItm);
            //mapping for VAT.
            txnItm = new TransactionItem();
            txnItm.LedgerId = this.GetLedgerId("Duties and Taxes");
            txnItm.Amount = totalVAT;
            txnItm.DrCr = true;
            txn.TransactionItems.push(txnItm);

            txns.push(txn);
        });

        return txns;
    }
    
    public ToggleSelectAll() {
        if (this.selectAll) {
            this.items.forEach(itm => {
                itm.IsSelected = true;
            });
        }
        else {
            this.items.forEach(itm => {
                itm.IsSelected = false;
            });
        }
    }
    public ToggleItemSelection(index: number) {
        if (this.items[index].IsSelected) {
            for (let itm of this.items) {
                if (!itm.IsSelected) {
                    this.selectAll = false;
                    return;
                }
            }
            this.selectAll = true;
        }
        else
            this.selectAll = false;
    }
}