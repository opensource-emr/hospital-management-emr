using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.BillingModels
{
    public class BillMapPriceCategoryServiceItemModel
    {
        [Key]
        public int PriceCategoryServiceItemMapId { get; set; }
        public int PriceCategoryId { get; set; }
        public int ServiceItemId { get; set; }
        public int ServiceDepartmentId { get; set; }
        public int IntegrationItemId { get; set; }
        public decimal Price { get; set; }
        public bool IsDiscountApplicable { get; set; }
        public string ItemLegalCode { get; set; }
        public string ItemLegalName { get; set; }
        //public decimal Discount { get; set; }//sud:27Mar'23-- Is this column required here ??

        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsPriceChangeAllowed { get; set; } //sud:27Mar'23-- Is this column required here ??
        public bool IsZeroPriceAllowed { get; set; } //sud:27Mar'23-- Is this column required here ??
        //public bool IsIncentiveApplicable { get; set; }
        public bool HasAdditionalBillingItems { get; set; }
       
        //public int ItemId { get; set; }//Krishna: 16thFeb'23, This column is temporary, Need to handle its impact and remove after that
        //Below Columns are not needed further need to remove these columns later
        //public bool IsCoPayment { get; set; } //Krishna: 8thDec'22
        //public decimal CoPaymentCashPercent { get; set; } //Krishna: 8thDec'22
        //public decimal CoPaymentCreditPercent { get; set; } //Krishna: 8thDec'22
        public BillMapPriceCategoryServiceItemModel()
        {
            IsActive = true;
        }
    }
}
