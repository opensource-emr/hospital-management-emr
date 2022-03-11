import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AccountingSyncDLService } from "./shared/accounting-sync.dl.service";
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { TransactionModel } from '../transactions/shared/transaction.model';
import { LedgerModel } from '../settings/shared/ledger.model';
import { FiscalYearModel } from '../settings/shared/fiscalyear.model';
import { VoucherModel } from '../settings/shared/voucher.model';
import * as _ from 'lodash';
import { AccountingService } from '../shared/accounting.service';
@Component({
    templateUrl: './inventory-sync/inventory-sync-main.html',
})
export class AccountingSyncBaseComponent<TItem> {
    public items: Array<TItem>;
    public selItem: TItem;
    public selectAll: boolean = true;
    public ledgerList: Array<LedgerModel>;
    public syncType: string;
    public transactions: Array<TransactionModel> = new Array<TransactionModel>();
    public fiscalYearList: Array<FiscalYearModel> = new Array<FiscalYearModel>();
    public currentFiscalYear: FiscalYearModel = new FiscalYearModel();
    public voucherList: Array<VoucherModel> = new Array<VoucherModel>();
    public currentVoucher: VoucherModel = new VoucherModel();
    constructor(public accSyncDLService: AccountingSyncDLService,
        public msgBoxServ: MessageboxService,public accountingService: AccountingService) {
        this.GetItems();
        this.GetFiscalYearList();
        this.GetLedgers();
        this.GetVoucherList();
    }
    public GetLedgers() {
      if(!!this.accountingService.accCacheData.Ledgers && this.accountingService.accCacheData.Ledgers.length>0){//mumbai-team-june2021-danphe-accounting-cache-change
        this.ledgerList = this.accountingService.accCacheData.Ledgers;//mumbai-team-june2021-danphe-accounting-cache-change
        this.ledgerList = this.ledgerList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
    }//mumbai-team-june2021-danphe-accounting-cache-change
    }
    public GetFiscalYearList() {
      if(!!this.accountingService.accCacheData.FiscalYearList && this.accountingService.accCacheData.FiscalYearList.length>0){//mumbai-team-june2021-danphe-accounting-cache-change
        this.fiscalYearList = this.accountingService.accCacheData.FiscalYearList;//mumbai-team-june2021-danphe-accounting-cache-change
        this.fiscalYearList = this.fiscalYearList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        this.currentFiscalYear = this.fiscalYearList[0];            //mumbai-team-june2021-danphe-accounting-cache-change
       }
    }
    public GetItems() {
        this.accSyncDLService.Read("/api/AccountingSync?reqType=inventory")
            .map(res => res)
            .subscribe(res => this.GetSuccess(res),
            res => this.Error(res));
    }
    public GetVoucherList() {
        this.accSyncDLService.Read("/api/Accounting?reqType=Vouchers")
            .map(res => res)
            .subscribe(res => {
                if (res.Results == "OK") {
                    if (res.Results.length) {
                        this.fiscalYearList = res.Results;
                        this.currentFiscalYear = this.fiscalYearList[0];
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ["Unable to get ledger list"]);
                        console.log(res.Errors);
                    }
                }
            });
    }
    public GetLedgerId(ledgerName: string) {
        let ledger = this.ledgerList.find(a => a.LedgerName == ledgerName);
        if (ledger)
            return ledger.LedgerId;
    }
    public PostToAccountingTransaction(transactions: Array<TransactionModel>) {
        var data = JSON.stringify(this.transactions);
        this.accSyncDLService.Add(data, '/api/Accounting?reqType=post-txns');
    }

    public PullToAccounting() {
        throw new Error('Not implemented.');
    }

    public ToggleSelectAll() {
        throw new Error('Not implemented.');
    }
    public ToggleItemSelection(index: number) {
        throw new Error('Not implemented.');
    }
    public GetSuccess(res) {
        if (res.Status == "OK") {
            this.items = res.Results;
        }
        else {
            this.msgBoxServ.showMessage("failed", ["Unable to get item list."]);
            console.log(res.Errors);
        }
    }
    public ViewDetail(item: TItem) {
        this.selItem = item;
    }
    public Error(err) {
        this.msgBoxServ.showMessage("error", [err]);
    }
    public OmitValidators(txns: Array<TransactionModel>) {
        txns.forEach(transaction => {
            var newTxn: any = _.omit(transaction, ['TransactionValidator']);
            var newTxnItems: any = newTxn.TransactionItems.map(item => {
                return _.omit(item, ['TransactionItemValidator', 'LedgerList', 'SelectedInvItems', 'SelectedCstCntItems']);
            });
            newTxnItems.forEach(txnItem => {
                if (txnItem.HasInventoryItems) {
                    var invItems: any = txnItem.InventoryItems.map(invItm => {
                        return _.omit(invItm, ['TxnInvItemValidator']);
                    });
                    txnItem.InventoryItems = invItems;
                }
                if (txnItem.HasCostCenterItems) {
                    var cstItems: any = txnItem.CostCenterItems.map(cstItm => {
                        return _.omit(cstItm, ['TxnCstItemValidator']);
                    });
                    txnItem.CostCenterItems = cstItems;
                }
            });
            newTxn.TransactionItems = newTxnItems;
        });
        return txns;
    }
}