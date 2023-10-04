using System.Collections.Generic;

namespace DanpheEMR.Services.Billing.DTO
{
    public class BillingScheme_DTO
    {
        public int SchemeId { get; set; }
        public string SchemeCode { get; set; }
        public string SchemeName { get; set; }
        public string CommunityName { get; set; }
        public bool IsDiscountApplicable { get; set; }
        public decimal DiscountPercent { get; set; }
        public bool IsDiscountEditable { get; set; }
        public bool IsMembershipApplicable { get; set; }
        public bool IsMemberNumberCompulsory { get; set; }
        public string DefaultPaymentMode { get; set; }
        public bool IsCreditApplicable { get; set; }
        public bool IsCreditOnlyScheme { get; set; }
        public decimal CreditLimit { get; set; }
        public int? DefaultCreditOrganizationId { get; set; }
        public bool IsCoPayment { get; set; }

        public int DefaultPriceCategoryId { get; set; }
        public string DefaultPriceCategoryName { get; set; }

        public string ApiIntegrationName { get; set; }
        public string FieldSettingParamName { get; set; }
        public decimal CoPaymentCashPercent { get; set; }
        public decimal CoPaymentCreditPercent { get; set; }
        public bool IsSystemDefault { get; set; }
        public bool IsCreditLimited { get; set; }
        public bool IsGeneralCreditLimited { get; set; }
        public decimal GeneralCreditLimit { get; set; }
        public bool IsClaimCodeAutoGenerate { get; set; }
        public bool HasSubScheme { get; set; }
        public List<BillingSubScheme_DTO> SubSchemes { get; set; }
        public bool AllowProvisionalBilling { get; set; }

    }
}
