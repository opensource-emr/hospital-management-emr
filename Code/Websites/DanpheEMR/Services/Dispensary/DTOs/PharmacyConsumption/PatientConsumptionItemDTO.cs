using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Dispensary.DTOs.PharmacyConsumption
{
    public class PatientConsumptionItemDTO
    {
        [Key]
        public int PatientConsumptionItemId { get; set; }
        public int PatientConsumptionId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public string VisitType { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public int GenericId { get; set; }
        public string GenericName { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal Quantity { get; set; }
        public decimal SalePrice { get; set; }
        public decimal NormalSalePrice { get; set; }
        public decimal FreeQuantity { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal VATPercentage { get; set; }
        public decimal VATAmount { get; set; }
        public string Remarks { get; set; }
        public int? CounterId { get; set; }
        public int StoreId { get; set; }
        public int? PrescriberId { get; set; }
        public int? PriceCategoryId { get; set; }
        public int? SchemeId { get; set; }
        public DateTime CreatedOn { get; set; }
        public string StoreName { get; set; }
        public string UserName { get; set; }
        public bool IsFinalize { get; set; }
        public List<int?> ConsumptionReturnItemIds { get; set; }
    }
}
