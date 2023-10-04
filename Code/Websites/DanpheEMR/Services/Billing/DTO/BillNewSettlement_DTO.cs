using DanpheEMR.ServerModel;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace DanpheEMR.Services.Billing.DTO
{
    public class BillNewSettlement_DTO
    {
        public int SettlementId { get; set; }
        public string SettlementType { get; set; }
        public int PatientId { get; set; }
        public double PayableAmount { get; set; }
        public double RefundableAmount { get; set; }
        public double PaidAmount { get; set; }
        public double ReturnedAmount { get; set; }
        public double DepositDeducted { get; set; }
        public double DueAmount { get; set; }
        public double DiscountAmount { get; set; }
        public string PaymentMode { get; set; }
        public string PaymentDetails { get; set; }
        public int CounterId { get; set; }
        public string Remarks { get; set; }
        public List<PatientCreditInvoices_DTO> BillingTransactions { get; set; }
        public List<PatientCreditInvoices_DTO> PHRMInvoiceTransactionModels { get; set; }
        public PatientModel Patient { get; set; }
        public double CollectionFromReceivable { get; set; }
        public double DiscountReturnAmount { get; set; }
        public int? OrganizationId { get; set; }
        public int? StoreId { get; set; }
        public string BillingUser { get; set; }
        public List<int> BillReturnIdsCSV { get; set; }
        public List<EmpCashTransactionModel> empCashTransactionModel { get; set; }
    }
}
