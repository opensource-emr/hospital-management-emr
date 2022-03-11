using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Procurement
{
    public class GetProcurementGRViewVm
    {
        public List<VerificationViewModel> verifier;

        public IList<GrItemsDTO> grItems { get; set; }
        public GrDTO grDetails { get; set; }
        public CreatedByUserDTO creator { get; set; }
        public bool canUserEditDate { get; set; }
       
    }

    public class CreatedByUserDTO
    {
        public string Name { get; set; }
        public string Role { get; set; }
    }

    public class GrDTO
    {
        public int GoodsReceiptID { get; set; }
        public int GoodsArrivalNo { get; set; }
        public int? DonationId { get; set; }
        public string GoodsArrivalFiscalYearFormatter { get; set; }
        public int? GoodsReceiptNo { get; set; }
        public int? PurchaseOrderId { get; set; }
        public DateTime? PurchaseOrderDate { get; set; }
        public DateTime? GoodsArrivalDate { get; set; }
        public DateTime? GoodsReceiptDate { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public string BillNo { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal? TDSAmount { get; set; }
        public decimal? TotalWithTDS { get; set; }
        public decimal CcCharge { get; set; }
        public decimal VATTotal { get; set; }
        public bool? IsCancel { get; set; }
        public string Remarks { get; set; }
        public DateTime? MaterialCoaDate { get; set; }
        public string MaterialCoaNo { get; set; }
        public string VendorName { get; set; }
        public string ContactAddress { get; set; }
        public string VendorNo { get; set; }
        public int CreditPeriod { get; set; }
        public string PaymentMode { get; set; }
        public decimal? OtherCharges { get; set; }
        public decimal? InsuranceCharge { get; set; }
        public decimal? CarriageFreightCharge { get; set; }
        public decimal? PackingCharge { get; set; }
        public decimal? TransportCourierCharge { get; set; }
        public decimal? OtherCharge { get; set; }
        public bool? IsTransferredToACC { get; set; }
        public string CancelRemarks { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string CurrentFiscalYear { get; set; }
        public bool IsVerificationEnabled { get; set; }
        public string VerifierIds { get; set; }
        public string GRStatus { get; set; }

        public Boolean IsSupplierApproved { get; set; }
        public Boolean IsDeliveryTopClosed { get; set; }
        public Boolean IsBoxNumbered { get; set; }
        public string GRCategory { get; set; }
        public int? VerificationId { get; set; }
        public int CurrentVerificationLevelCount { get; set; }
        public int? PONumber { get; set; }
    }

    public class GrItemsDTO
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public string MSSNO { get; set; }
        public string UOMName { get; set; }
        public string ItemCategory { get; set; }
        public string ItemCategoryCode { get; set; }//sud:18Sept'21--This comes from ItemCategory Table..
        public string BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public double InvoiceQuantity { get; set; }
        public double ArrivalQuantity { get; set; }
        public double ReceivedQuantity { get; set; }
        public double RejectedQuantity { get; set; }
        public double FreeQuantity { get; set; }
        public decimal GRItemRate { get; set; }
        public decimal VATAmount { get; set; }
        public double? VATPercentage { get; set; }
        public decimal CcAmount { get; set; }
        public decimal? CcChargePercent { get; set; }
        public decimal DiscountAmount { get; set; }
        public double? DiscountPercent { get; set; }
        public decimal ItemTotalAmount { get; set; }
        public decimal ItemSubTotal { get; set; }
        public decimal? OtherCharge { get; set; }
        public int GoodsReceiptId { get; set; }
        public int GoodsReceiptItemId { get; set; }
        public bool? IsTransferredToACC { get; set; }
        public DateTime? ManufactureDate { get; set; }
        public DateTime? SamplingDate { get; set; }
        public int NoOfBoxes { get; set; }
        public int SamplingQuantity { get; set; }
        public string IdentificationLabel { get; set; }
        public string GRItemSpecification { get; set; }
        public string Remarks { get; set; }
        public int? RegisterPageNumber { get; set; }
        public int? StockId { get;  set; }
    }

}
