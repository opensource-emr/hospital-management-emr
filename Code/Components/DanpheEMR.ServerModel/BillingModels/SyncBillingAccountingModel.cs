using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class SyncBillingAccountingModel
    {
        [Key]
        public int BillingAccountingSyncId { get; set; }
        public int ReferenceId { get; set; }
        public string ReferenceModelName { get; set; }
        public int? ServiceDepartmentId { get; set; }
        public int ItemId { get; set; }
        public string IncomeLedgerName { get; set; }
        public int PatientId { get; set; }
        public string TransactionType { get; set; }
        public string PaymentMode { get; set; }
        public decimal SubTotal { get; set; }  //in case of sale,sale return
        public decimal TaxAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; } //in case of deposit, deposit return, deposit deduct
        public DateTime TransactionDate { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public Boolean? IsTransferedToAcc { get; set; }
        public decimal SettlementDiscountAmount { get; set; }
        [NotMapped]
        public List<SyncBillingAccountingModel> BillSyncs { get; set; }
        [NotMapped]
        public int VoucherId { get; set; }
        [NotMapped]
        public string VoucherName { get; set; }
        [NotMapped]
        public decimal SalesAmount { get; set; }
        [NotMapped]
        public List<int> BillTxnItemIds { get; set; }
        [NotMapped]
        public string Remarks { get; set; }
        [NotMapped]
        public int? CreditOrganizationId { get; set; }
        //EMR_LPH_MERGE: NageshBB- 18-June-2021-below LedgerId column name added here for fix build error after emr accounting module paste into code
        [NotMapped]
        public int? LedgerId { get; set; }

        [NotMapped]
        public List<SyncBillingAccountingModel> BillTxnItms { get; set; }

        [NotMapped]
        public decimal CoPaymentCashAmount { get; set; }

        [NotMapped]
        public int SubLedgerId { get; set; }
    }
}


