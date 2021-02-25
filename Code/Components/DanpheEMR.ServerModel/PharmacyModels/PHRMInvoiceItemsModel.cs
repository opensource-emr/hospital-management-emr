using Audit.EntityFramework;
using DanpheEMR.ServerModel.PharmacyModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    [AuditInclude]
    public class PHRMInvoiceTransactionItemsModel
    {
        [Key]
        public int InvoiceItemId { get; set; }
        public int? InvoiceId { get; set; }
        public int? CompanyId { get; set; }
        public int? PatientId { get; set; }
        public int? ItemId { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public double? Quantity { get; set; }
        public decimal? Price { get; set; }
        public decimal? MRP { get; set; }
        public decimal? GrItemPrice { get; set; }
        public double? FreeQuantity { get; set; }
        public decimal? SubTotal { get; set; }
        public double? VATPercentage { get; set; }
        public double? DiscountPercentage { get; set; }
        public decimal? TotalAmount { get; set; }
        public string BilItemStatus { get; set; }
        public string Remark { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? PrescriptionItemId { get; set; }
        public int? CounterId { get; set; }
        public int? GrItemId { get; set; }
        public string VisitType { get; set; }
        public decimal? TotalDisAmt { get; set; }
        public decimal? PerItemDisAmt { get; set; }
        //[NotMapped]
        public DateTime? ExpiryDate { get; set; }
        [NotMapped]
        public int StockId { get; set; }
        [NotMapped]
        public int? GoodReceiptItemId { get; set; }
        [NotMapped]
        public double AvailableQuantity { get; set; }
         [NotMapped]
        public PHRMNarcoticRecord NarcoticsRecord { get; set; }
        [NotMapped]
        public int DispatchQty { get; set; }
        [NotMapped]
        public int ReturnQty { get; set; }
        [NotMapped]
        public int InvoicePrintId { get; set; }
        [NotMapped]
        public string PatientName { get; set; }
        [NotMapped]
        public string CreatedOnNp { get; set; }
        //for stock we considering GR Items as stock
        //below properties used for post data to server with invoice details
        //this used to update stock (gritems ) details
        public  List<PHRMGoodsReceiptItemsModel> SelectedGRItems = new List<PHRMGoodsReceiptItemsModel>();
        //clones input inovoice items and returns a new object. 
        public static PHRMInvoiceTransactionItemsModel GetClone(PHRMInvoiceTransactionItemsModel ipInvItem)
        {
            PHRMInvoiceTransactionItemsModel retInvItem = (PHRMInvoiceTransactionItemsModel)ipInvItem.MemberwiseClone();
            return retInvItem;
        }
        [NotMapped]
        public string WardName { get; set; }
        [NotMapped]
        public string WardUser { get; set; }
     }

}
