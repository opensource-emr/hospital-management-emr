using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.ReportingModels
{
    public class PatientBillHistoryMaster
    {
        public List<PaidBillHistory> paidBill { get; set; }
        public List<UnpaidBillHistory> unpaidBill { get; set; }
        public List<ReturnedBillHistory> returnBill { get; set; }
        public List<CancelBillHistory> cancelBill { get; set; }

        public List<Deposit> deposits { get; set; }
    }
    public class PatientBillHistory
    {
        //SrNo,Department,Item,Rate,Quantity,Amount,Discount,Tax
        public Int64? SrNo { get; set; }
        public string Department { get; set; }
        public string Item { get; set; }
        public Nullable<double> Rate { get; set; }
        public Nullable<double> Quantity { get; set; }
        public Nullable<double> Amount { get; set; }
        public Nullable<double> Discount { get; set; }
        public Nullable<double> Tax { get; set; }
    }
    public class PaidBillHistory : PatientBillHistory
    {
        public Nullable<double> SubTotal { get; set; }
        public DateTime PaidDate { get; set; }
        public int? ReceiptNo { get; set; }
    }
    public class UnpaidBillHistory : PatientBillHistory
    {
        public Nullable<double> SubTotal { get; set; }
        public int? ReceiptNo { get; set; }
        public DateTime Date { get; set; }
    }
    public class ReturnedBillHistory : PatientBillHistory
    {
        public Nullable<double> ReturnedAmount { get; set; }
        public DateTime ReturnDate { get; set; }
        public string ReturnedBy { get; set; }
        public int? ReceiptNo { get; set; }
        public string Remarks { get; set; }
    }

    public class Deposit
    {
        public Int64? SrNo { get; set; }
        public Int32? ReceiptNo { get; set; }
        public string DepositType { get; set; }
        public Nullable<double> Amount { get; set; }
        public string Remarks { get; set; }
        public DateTime Date { get; set; }
    }

    public class CancelBillHistory : PatientBillHistory
    {
        public Nullable<double> CancelledAmount { get; set; }
        public DateTime CancelledDate { get; set; }
        public string CancelledBy { get; set; }
        public string Remarks { get; set; }
    }
}
