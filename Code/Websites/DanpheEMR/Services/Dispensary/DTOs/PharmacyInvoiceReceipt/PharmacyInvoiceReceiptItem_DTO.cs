using AutoMapper.Configuration.Conventions;
using System;

namespace DanpheEMR.Services.Dispensary.DTOs.PharmacyInvoiceReceipt
{
    public class PharmacyInvoiceReceiptItem_DTO
    {
        public int? InvoiceItemId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string GenericName { get; set; }
        public double Quantity { get; set; }
        public decimal ReturnedQty { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string BatchNo { get; set; }
        public string RackNo { get; set; }
        public decimal SalePrice { get; set; }
        public decimal SubTotal { get; set; }
        public decimal VATAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
