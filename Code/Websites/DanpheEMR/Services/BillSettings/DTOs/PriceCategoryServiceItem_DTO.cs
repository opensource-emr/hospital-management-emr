
using System;
namespace DanpheEMR.Services.BillSettings.DTOs
{
    public class PriceCategoryServiceItem_DTO
    {
        public int PriceCategoryServiceItemMapId { get; set; }
        public int PriceCategoryId { get; set; }
        public int ServiceItemId { get; set; }
        public int ServiceDepartmentId { get; set; }
        public int IntegrationItemId { get; set; }
        public decimal Price { get; set; }
        public Boolean IsDiscountApplicable { get; set; }
        public string ItemLegalCode { get; set; }
        public string ItemLegalName { get; set; }
        public decimal Discount { get; set; }
        public bool IsCoPayment { get; set; } 
        public decimal CoPaymentCashPercent { get; set; } 
        public decimal CoPaymentCreditPercent { get; set; } 
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public Boolean IsActive { get; set; }
        public bool IsPriceChangeAllowed { get; set; }
        public bool IsZeroPriceAllowed { get; set; }
        public bool IsIncentiveApplicable { get; set; }
        public bool HasAdditionalBillingItems { get; set; }
        public int ItemId { get; set; }

    }
}

    

