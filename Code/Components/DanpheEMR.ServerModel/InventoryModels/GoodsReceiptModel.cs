using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class GoodsReceiptModel
    {
        [Key]
        public int GoodsReceiptID { get; set; }
        public bool? IsCancel { get; set; }
        public int GoodsArrivalNo { get; set; }
        public DateTime? VendorBillDate { get; set; }
        public DateTime? GoodsArrivalDate { get; set; }
        public int? IMIRNo { get; set; }
        public DateTime? IMIRDate { get; set; }
        public int? GoodsReceiptNo { get; set; }
        public DateTime? GoodsReceiptDate { get; set; }
        public int? PurchaseOrderId { get; set; }
        public string GRCategory { get; set; }
        public string Remarks { get; set; }
        public decimal TotalAmount { get; set; }
        public string CancelRemarks { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int VendorId { get; set; }
        public string BillNo { get; set; }
        public DateTime? ReceivedDate { get; set; } // Remove this date as it is not of any use.
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
        public int? FiscalYearId { get; set; }
        [NotMapped]
        public string GoodsArrivalFiscalYearFormatted { get; set; }
        [NotMapped]
        public string FiscalYear { get; set; }

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
        public List<SyncBillingAccountingModel> BillSyncs { get; set; }
        public bool IsVerificationEnabled { get; set; }
        public string VerifierIds { get; set; }
        [NotMapped]
        public List<POVerifier> VerifierList { get; set; }
        [NotMapped]
        public bool IsVerificationAllowed { get; set; }
        [NotMapped]
        public string VerificationStatus { get; set; }
        [NotMapped]
        public int CurrentVerificationLevel { get; set; }
        [NotMapped]
        public int CurrentVerificationLevelCount { get; set; }
        [NotMapped]
        public int MaxVerificationLevel { get; set; }
        public int? VerificationId { get; set; }
        public string GRStatus { get; set; }
        [NotMapped]
        public List<int> ReferenceIdsOne { get; set; }

        public int? CancelledBy { get; set; }//sud:15-Oct-2020: This property was there in db but not in here.
        public DateTime? CancelledOn { get; set; }//sud:15-Oct-2020: This property was there in db but not in here.
        public bool? IsDonation { get; set; }
        public int? DonationId { get; set; }


        public DateTime? MaterialCoaDate { get; set; }

        public string MaterialCoaNo { get; set; }

        public bool? IsSupplierApproved { get; set; }
        public bool? IsDeliveryTopClosed { get; set; }
        public bool? IsBoxNumbered { get; set; }
        public int? ReceivedBy { get; set; }
        public DateTime? ReceivedOn { get; set; }
        public string ReceivedRemarks { get; set; }
        public int StoreId { get; set; }

        /// <summary>
        /// Maintains sequence for GoodsReceiptNo
        /// </summary>
        public int? GRGroupId { get; set; }
        public bool IsPaymentDoneFromAcc { get; set; }
    }
}
