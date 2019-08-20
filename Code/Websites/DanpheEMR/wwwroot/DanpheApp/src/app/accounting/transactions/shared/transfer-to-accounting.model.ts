/// <reference path="../../../inventory/shared/goods-receipt.model.ts" />
/// <reference path="../../../inventory/shared/goods-receipt.model.ts" />
import { NgForm } from '@angular/forms';
import { BillingAccountingSyncModel } from './billing-accounting-sync.model';
import { TransactionInventoryItem } from './transaction-inventory-item.model';
import { TransactionPharmacyItem } from './transaction-pharmacy-accounting.model';
import { GoodsReceipt } from '../../../inventory/shared/goods-receipt.model';
import { GoodsReceiptItems } from '../../../inventory/shared/goods-receipt-item.model';

export class InventoryTransferAccountingModel {
    public VATAmount: number = 0;
    public TotalAmount: number = 0;  
    public CreatedOn: string = null;
    public IsSelected: boolean = true;
    public ReferenceIds: Array<any> = null;
  //  public ReferenceId: string = null;
    public Remarks: string = null; 
    public Type: string = null;
    public VendorName: string = null;
    public VendorId: number = 0;
    public DiscountAmount: number = 0; 
    public TransactionType: string = null;
    public SalesAmount: number = 0;    
}

export class BillingTransferAccountingModel { 
    public IncomeLedgerName: string = null;
    public TransactionDate: string = null;  
    public TaxAmount: number = 0;
    public SalesAmount: number = 0;         
    public TotalAmount: number = 0;         
    public DiscountAmount: number = 0;             
    public IsSelected: boolean = false;
    public ReferenceId: string = null;
    public TransactionType: string = null;
    public PaymentMode: string = null;
    public SettlementDiscountAmount: number = 0;
    public BillSyncs: Array<BillingAccountingSyncModel> = new Array<BillingAccountingSyncModel>(); 
    public Remarks: string = "";
    public BillTxnItemIds: Array<string> = null;      //contains IDs for BillingTransactionItemID
}

export class PharmacyTransferAccountingModel {

    public VATAmount: number = 0;
    public TDSAmount: number = 0;
    public TotalAmount: number = 0;
    public DiscountAmount: number = 0;
    public CreatedOn: string = null;
    public IsSelected: boolean = true;
    public ReferenceIds: Array<any> = null;
    public Remarks: string = null;
    public Type: string = null;
    public SubTotal: number = 0;
    public SupplierId: number = 0;
    public SupplierName: string = null;
    public TransactionType: string = null;
    public SalesAmount: number = 0;   
    public PatientId: number = null;
    public BillSyncs: Array<{ PatientId, TotalAmount}> = []; 
}


