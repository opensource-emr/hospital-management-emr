using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Billing.DTO
{
    public class OpdServiceItemPrice_DTO
    {
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public int PerformerId { get; set; }
        public string PerformerName { get; set; }

        public int ServiceDepartmentId { get; set; }
        public string ServiceDepartmentName { get; set; }
        public int ServiceItemId { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public int PriceCategoryId { get; set; }
        public decimal Price { get; set; }
        public bool IsTaxApplicable { get; set; }
        public bool IsZeroPriceAllowed { get; set; }
        public bool IsPriceChangeAllowed { get; set; }
            
        public bool IsCoPayment { get; set; }
        public decimal CoPaymentCashPercent { get; set; }
        public decimal CoPaymentCreditPercent { get; set; }
        public decimal DiscountPercent { get; set; }

        public bool IsDiscountApplicable { get; set; }
    }
}
