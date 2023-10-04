using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel
{
    public class PriceCategoryModel
    {
        [Key]
        public int PriceCategoryId { get; set; }
        public string PriceCategoryName { get; set; }
        public string Description { get; set; }
        public bool IsDefault { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool? IsPharmacyRateDifferent { get; set; }
        public string PriceCategoryCode { get; set; } //Krishna, 16thFeb'23 New Column need to handle it where needed
        public bool ShowInRegistration { get; set; }
        public bool ShowInAdmission { get; set; }
        public int? DisplaySequence { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }


        //Krishna, 16thFeb'23 Below columns are deprecated in the new structure, Hence this need impact handling, and can be removed after that
        //public bool? IsCoPayment { get; set; }
        //public decimal? Copayment_CashPercent { get; set; }
        //public decimal? Copayment_CreditPercent { get; set; }
        //public int? PharmacyDefaultCreditOrganizationId { get; set; }

    }


}
