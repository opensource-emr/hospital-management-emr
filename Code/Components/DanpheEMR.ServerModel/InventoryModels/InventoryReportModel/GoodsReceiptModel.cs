using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel.InventoryModels.InventoryReportModel
{
    public class GoodsReceiptModel
    {
        public bool? IsCancel { get; set; }

        [Key]
        public int GoodsReceiptID { get; set; }

        public DateTime? GoodsReceiptDate { get; set; }
        public int? PurchaseOrderId { get; set; }
        public decimal TotalAmount { get; set; }
        public string Remarks { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int VendorId { get; set; }
        public string BillNo { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public string ReceiptNo { get; set; }
        public DateTime? OrderDate { get; set; }

        public bool? IsTransferredToACC { get; set; }
        //SubTotal and VATTotal only for caculation and show purpose
        public decimal SubTotal { get; set; }
        public decimal VATTotal { get; set; }
        public decimal? TDSRate { get; set; }
        public decimal? TDSAmount { get; set; }
        public decimal? TotalWithTDS { get; set; }
        public decimal CcCharge { get; set; }
        public double Discount { get; set; }
        public decimal DiscountAmount { get; set; }
        public int PrintCount { get; set; }
        public int CreditPeriod { get; set; }
        public string PaymentMode { get; set; }
        public decimal? OtherCharges { get; set; }
        //for other charges
        public decimal? InsuranceCharge { get; set; }
        public decimal? CarriageFreightCharge { get; set; }
        public decimal? PackingCharge { get; set; }
        public decimal? TransportCourierCharge { get; set; }
        public decimal? OtherCharge { get; set; }
        public virtual List<GoodsReceiptItemsModel> GoodsReceiptItem { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

        //public VendorMasterModel Vendor { get; set; }
        //  public  decimal? TotalWithoutTDS { get; set; }

        [NotMapped]
        public int VoucherId { get; set; }
        [NotMapped]
        public string VoucherName { get; set; }
        [NotMapped]
        public string TransactionType { get; set; }
        [NotMapped]
        public decimal SalesAmount { get; set; }
        [NotMapped]
        public decimal VATAmount { get; set; }
        [NotMapped]
        public List<int> ReferenceIds { get; set; }
        [NotMapped]
        public string Type { get; set; }
        [NotMapped]
        public string VendorName { get; set; }
        [NotMapped]
        public int ItemId { get; set; }
        [NotMapped]
        public string ItemName { get; set; }
        [NotMapped]
        public string ContactNo { get; set; }
        [NotMapped]
        public List<SyncBillingAccountingModel> BillSyncs { get; set; }

        [NotMapped]
        public DateTime? PoDate { get; set; }
        public string CancelRemarks { get; set; }
        public DateTime? CancelledOn { get; set; }
        public int? CancelledBy { get; set; }
        public int? GoodsReceiptNo { get; set; }
    }
}
