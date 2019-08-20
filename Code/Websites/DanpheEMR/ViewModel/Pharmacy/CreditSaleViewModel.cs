using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class CreditSaleViewModel
    {
        public int PatientId{get; set;}
        public decimal TotalAmount { get; set; }
       // public IEnumerable<InvoiceItemsViewModel> InvoiceItems { get; set; }
        public IEnumerable<PHRMInvoiceTransactionItemsModel> InvoiceItems { get; set; }
        public string Status { get; set; }
    }
    //public class InvoiceItemsViewModel
    //{
    //    public int InvoiceItemId { get; set; }
    //    public int? InvoiceId { get; set; }
    //    public int? CompanyId { get; set; }
    //    public int? PatientId { get; set; }
    //    public int? ItemId { get; set; }
    //    public string ItemName { get; set; }
    //    public string BatchNo { get; set; }
    //    public double? Quantity { get; set; }
    //    public decimal? MRP { get; set; }
    //    public decimal? GrItemPrice { get; set; }
    //    public double? FreeQuantity { get; set; }
    //    public decimal? SubTotal { get; set; }
    //    public double? VATPercentage { get; set; }
    //    public double? DiscountPercentage { get; set; }
    //    public decimal? TotalAmount { get; set; }
    //    public string Remark { get; set; }
    //    public int? CreatedBy { get; set; }
    //    public DateTime? CreatedOn { get; set; }
    //    public int? PrescriptionItemId { get; set; }
    //    public int? CounterId { get; set; }
    //}
}
