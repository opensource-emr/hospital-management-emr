using System.ComponentModel.DataAnnotations;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using DanpheEMR.ServerModel.BillingModels.Config;

namespace DanpheEMR.ServerModel.BillingModels
{
    public class BillingSchemeModel
    {
        [Key]
        public int SchemeId { get; set; }
        public string SchemeCode { get; set; }
        public string SchemeName { get; set; }
        public string Description { get; set; }
        public string CommunityName { get; set; }
        public DateTime? ValidFromDate { get; set; }
        public DateTime? ValidToDate { get; set; }
        public bool IsMembershipApplicable { get; set; }
        public bool IsMemberNumberCompulsory { get; set; }
        public string DefaultPaymentMode { get; set; }
        public bool IsCreditApplicable { get; set; }
        public bool IsCreditOnlyScheme { get; set; }
        public bool IsOpCreditLimited { get; set; }
        public bool IsIpCreditLimited { get; set; }
        public bool IsGeneralCreditLimited { get; set; }
        public decimal GeneralCreditLimit { get; set; }
        public decimal OpCreditLimit { get; set; }
        public decimal IpCreditLimit { get; set; }
        public bool IsRegistrationCreditApplicable { get; set; }
        public bool IsOpBillCreditApplicable { get; set; }
        public bool IsIpBillCreditApplicable { get; set; }
        public bool IsAdmissionCreditApplicable { get; set; }
        public bool IsOpPhrmCreditApplicable { get; set; }
        public bool IsIpPhrmCreditApplicable { get; set; }
        public bool IsVisitCompulsoryInBilling { get; set; }
        public bool IsVisitCompulsoryInPharmacy { get; set; }
        public bool IsBillingCoPayment { get; set; }
        public bool IsPharmacyCoPayment { get; set; }
        public decimal BillCoPayCashPercent { get; set; }
        public decimal BillCoPayCreditPercent { get; set; }
        public decimal PharmacyCoPayCashPercent { get; set; }
        public decimal PharmacyCoPayCreditPercent { get; set; }
        public bool IsDiscountApplicable { get; set; }
        public decimal DiscountPercent { get; set; }
        public bool IsDiscountEditable { get; set; }
        public bool IsRegDiscountApplicable { get; set; }
        public decimal RegDiscountPercent { get; set; }
        public bool IsRegDiscountEditable { get; set; }
        public bool IsOpBillDiscountApplicable { get; set; }
        public decimal OpBillDiscountPercent { get; set; }
        public bool IsOpBillDiscountEditable { get; set; }
        public bool IsIpBillDiscountApplicable { get; set; }
        public decimal IpBillDiscountPercent { get; set; }
        public bool IsIpBillDiscountEditable { get; set; }
        public bool IsAdmissionDiscountApplicable { get; set; }
        public decimal AdmissionDiscountPercent { get; set; }
        public bool IsAdmissionDiscountEditable { get; set; }
        public bool IsOpPhrmDiscountApplicable { get; set; }
        public decimal OpPhrmDiscountPercent { get; set; }
        public bool IsOpPhrmDiscountEditable { get; set; }
        public bool IsIpPhrmDiscountApplicable { get; set; }
        public decimal IpPhrmDiscountPercent { get; set; }
        public bool IsIpPhrmDiscountEditable { get; set; }
        public int? DefaultCreditOrganizationId { get; set; }

        [NotMapped]
        public List<BillingSubSchemeModel> BillingSubSchemes { get; set; }
        [NotMapped]
        public bool IsCopaymentApplicable { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }

        public int DefaultPriceCategoryId { get; set; }

        public string ApiIntegrationName { get; set; }
        public string FieldSettingParamName { get; set; }
        public bool IsSystemDefault { get; set; }
        public string RegStickerGroupCode { get; set; }//for RegistrationSticker: sud:20March'23
        public bool HasSubScheme { get; set; }
        public bool AllowProvisionalBilling { get; set; }

    }
}
