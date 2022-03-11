using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class GoodsReceiptItemsModel
    {
        [Key]
        public int GoodsReceiptItemId { get; set; }
        public int GoodsReceiptId { get; set; }
        public int ItemId { get; set; }
        public string BatchNO { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public double ArrivalQuantity { get; set; }
        public double ReceivedQuantity { get; set; }
        public double FreeQuantity { get; set; }
        public double RejectedQuantity { get; set; }
        public decimal ItemRate { get; set; }
        public decimal VATAmount { get; set; }
        public double? VAT { get; set; }
        public decimal TotalAmount { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public decimal SubTotal { get; set; }
        public decimal MRP { get; set; }
        public double? DiscountPercent { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal? CcCharge { get; set; }
        public decimal CcAmount { get; set; }
        public int CounterId { get; set; }
        public decimal? OtherCharge { get; set; }
        public virtual ItemMasterModel Item { get; set; }
        public GoodsReceiptModel GoodsReceipt { get; set; }
        public bool? IsTransferredToACC { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public DateTime? GRItemDate { get; set; }
        [NotMapped]
        public string ItemName { get; set; }
        [NotMapped]
        public string Code { get; set; }
        [NotMapped]
        public string UOMName { get; set; }
        [NotMapped]
        public bool IsEdited { get; set; }
        public bool IsActive { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }

        [NotMapped]
        public int? DonationId { get; set; }


        [NotMapped]
        public string MSSNO { get; set; }

        ///  Tilaganga Hospital 
        public DateTime? ManufactureDate { get; set; }
        public DateTime? SamplingDate { get; set; }

        public int NoOfBoxes { get; set; }
        public int SamplingQuantity { get; set; }
        public string IdentificationLabel { get; set; }
        public string IsSamplingLabel { get; set; }

        public string SamplingBoxes { get; set; }
        public int SampleRemoved { get; set; }
        public string MaterialNO { get; set; }
        public int? StockId { get; set; }
        public string GRItemSpecification { get; set; }
        public string Remarks { get; set; }
        public string ItemCategory { get; set; }//sud:17Sept'21: For Capital/Consumable GR Merging
    }
}
