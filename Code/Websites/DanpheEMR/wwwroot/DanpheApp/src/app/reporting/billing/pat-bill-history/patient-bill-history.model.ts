
export class RPT_BIL_PatientBillHistoryMaster {

  public paidBill: Array<any> = new Array<RPT_BIL_PatientBillHistory>();
  public unpaidBill: Array<RPT_BIL_UnpaidBillHistory> = new Array<RPT_BIL_UnpaidBillHistory>();
  public returnBill: Array<RPT_BIL_ReturnedBillHistory> = new Array<RPT_BIL_ReturnedBillHistory>();

}

export class RPT_BIL_PatientBillHistory {
    
    public SrNo: Number = 0;
    public Department: string = "";
    public Item: string = "";
    public Rate: Number = 0;
    public Quantity: Number = 0;
    public Amount: Number = 0;
    public Discount: Number = 0;
    public Tax: Number = 0;
}

export class RPT_BIL_PaidBillHistory extends RPT_BIL_PatientBillHistory
{
    public  SubTotal: Number = 0;
    public  PaidDate:Date = null;
    public ReceiptNo: Number = 0;
    
}
export class RPT_BIL_UnpaidBillHistory extends RPT_BIL_PatientBillHistory
{
    public SubTotal: Number = 0;
    public Date: Date = null;
}

export class RPT_BIL_ReturnedBillHistory extends RPT_BIL_PatientBillHistory
{
    public  ReturnedAmount: Number = 0;
    public  ReturnDate: Date = null;
    public ReceiptNo: Number = 0;
}
