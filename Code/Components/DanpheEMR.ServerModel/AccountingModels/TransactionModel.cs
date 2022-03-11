
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class TransactionModel
    {
        [Key]
        public int TransactionId { get; set; }
        public int VoucherId { get; set; }
        public int FiscalyearId { get; set; }
        public string Remarks { get; set; }
        public DateTime? TransactionDate { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public bool IsActive { get; set; }
        public int VoucherHeadId { get; set; }
        //public int? ReferenceTransactionId { get; set; }
        public string VoucherNumber { get; set; }
        public string PayeeName { get; set; }
        public int? ChequeNumber { get; set; }
        public int? SectionId { get; set; }
        public virtual List<TransactionItemModel> TransactionItems { get; set; }
        public virtual List<TransactionLinkModel> TransactionLinks { get; set; }
        [NotMapped]
        public string BillingAccountingSyncIds { get; set; }
        //[NotMapped]
        //public string? ReferenceIds { get; set; }
        [NotMapped]
        public List<SyncBillingAccountingModel> BillSyncs { get; set; }
        public bool? IsBackDateEntry { get; set; }
        public string TransactionType { get; set; }
        public int? TUId { get; set; }
        public int? DayVoucherNumber { get; set; }
        public bool? IsCustomVoucher { get; set; }
        public bool? IsReverseTxnAllow { get; set; }
        public bool? IsEditable { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public bool? IsGroupTxn { get; set; }

        //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        public int? HospitalId { get; set; }
        [NotMapped]
        public string Reason { get; set; }
        public int? VoucherSerialNo { get; set; }
        public bool? IsAllowReverseVoucher { get; set; }
        [NotMapped]
        public bool? IsReverseVoucher { get; set; }
        [NotMapped]
        public int? PrevTransactionId { get; set; }
    }

}
