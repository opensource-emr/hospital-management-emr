import * as moment from "moment";

export class CapitalStockModel {
    public ItemId: number = null;
    public TransactionDate: string = "";
    public ReceiptQty: number = 0;
    public ReceiptRate: Number = 0;
    public ReceiptAmount: number = 0;
    public IssueQty: number = 0;
    public IssueRate: number = 0;
    public IssueAmount: number = 0;
    public BalanceQty: number = 0;
    public BalanceRate: number = 0;
    public BalanceAmount: number = 0;
    public ReferenceNo: number = 0;
    public Store: string = "";
    public Username: string = "";
    public Remarks: string = "";
    public FromDate: string = moment().format('YYYY-MM-DD');
    public ToDate: string = moment().format('YYYY-MM-DD');
    public Specification: string = null;
    public Code: string = null;
    public VendorName: string = null;
    public ModelNo: string = null;
    public CountryName: string = null;
    public Size: string = null;
    public EstimatedDate: string = null;
    public Quantity: number = null;

}