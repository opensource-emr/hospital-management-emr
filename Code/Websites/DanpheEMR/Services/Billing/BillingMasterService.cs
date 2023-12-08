using DanpheEMR.Controllers.Billing.Shared;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.Services.Billing.DTO;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Billing
{
    public class BillingMasterService : IBillingMasterService
    {
        public async Task<object> GetPriceCategories(BillingDbContext _billingDbContext)
        {
            var priceCategories = await _billingDbContext.PriceCategoryModels.Where(a => a.IsActive == true).ToListAsync();
            return priceCategories;
        }

        public async Task<object> GetSchemes(string serviceBillingContext, BillingDbContext _billingDbContext)
        {
            var schemeList = new List<BillingScheme_DTO>();
            if (serviceBillingContext == ENUM_ServiceBillingContext.OpBilling)
            {
                schemeList = await GetOpBillingContextSchemesDetails(_billingDbContext, schemeList);
            }
            else if (serviceBillingContext == ENUM_ServiceBillingContext.IpBilling)
            {
                schemeList = await GetIpBillingContextSchemeDetails(_billingDbContext, schemeList);
            }
            else if (serviceBillingContext == ENUM_ServiceBillingContext.OpPharmacy)
            {
                schemeList = await GetOpPharmacyContextSchemeDetails(_billingDbContext, schemeList);

            }
            else if (serviceBillingContext == ENUM_ServiceBillingContext.IpPharmacy)
            {
                schemeList = await GetIpPharmacyContextSchemeDetails(_billingDbContext, schemeList);

            }

            return schemeList;
        }

        private static async Task<List<BillingScheme_DTO>> GetIpPharmacyContextSchemeDetails(BillingDbContext _billingDbContext, List<BillingScheme_DTO> schemeList)
        {
            schemeList = await (from sch in _billingDbContext.BillingSchemes
                                join priceCat in _billingDbContext.PriceCategoryModels on sch.DefaultPriceCategoryId equals priceCat.PriceCategoryId
                                where sch.IsActive == true
                                select new BillingScheme_DTO()
                                {
                                    SchemeId = sch.SchemeId,
                                    SchemeCode = sch.SchemeCode,
                                    SchemeName = sch.SchemeName,
                                    CommunityName = sch.CommunityName,
                                    IsDiscountApplicable = sch.IsIpPhrmDiscountApplicable,
                                    DiscountPercent = sch.IpPhrmDiscountPercent,
                                    IsDiscountEditable = sch.IsIpPhrmDiscountEditable,
                                    IsMembershipApplicable = sch.IsMembershipApplicable,
                                    IsMemberNumberCompulsory = sch.IsMemberNumberCompulsory,
                                    DefaultPaymentMode = sch.DefaultPaymentMode,
                                    IsCreditApplicable = sch.IsIpPhrmCreditApplicable,
                                    IsCreditOnlyScheme = sch.IsCreditOnlyScheme,
                                    CreditLimit = sch.IpCreditLimit,
                                    DefaultCreditOrganizationId = sch.DefaultCreditOrganizationId,
                                    IsCoPayment = sch.IsPharmacyCoPayment,
                                    CoPaymentCashPercent = sch.PharmacyCoPayCashPercent,
                                    CoPaymentCreditPercent = sch.PharmacyCoPayCreditPercent,
                                    DefaultPriceCategoryId = sch.DefaultPriceCategoryId,
                                    DefaultPriceCategoryName = priceCat.PriceCategoryName,
                                    IsGeneralCreditLimited = sch.IsGeneralCreditLimited,
                                    IsCreditLimited = sch.IsIpCreditLimited,
                                    GeneralCreditLimit = sch.GeneralCreditLimit,
                                    IsSystemDefault = sch.IsSystemDefault,
                                    AllowProvisionalBilling = sch.AllowProvisionalBilling
                                }).OrderBy(s => s.SchemeName).AsNoTracking().ToListAsync();
            return schemeList;
        }

        private static async Task<List<BillingScheme_DTO>> GetOpPharmacyContextSchemeDetails(BillingDbContext _billingDbContext, List<BillingScheme_DTO> schemeList)
        {
            schemeList = await (from sch in _billingDbContext.BillingSchemes
                                join priceCat in _billingDbContext.PriceCategoryModels on sch.DefaultPriceCategoryId equals priceCat.PriceCategoryId
                                where sch.IsActive == true
                                select new BillingScheme_DTO()
                                {
                                    SchemeId = sch.SchemeId,
                                    SchemeCode = sch.SchemeCode,
                                    SchemeName = sch.SchemeName,
                                    CommunityName = sch.CommunityName,
                                    IsDiscountApplicable = sch.IsOpPhrmDiscountApplicable,
                                    DiscountPercent = sch.OpPhrmDiscountPercent,
                                    IsDiscountEditable = sch.IsOpPhrmDiscountEditable,
                                    IsMembershipApplicable = sch.IsMembershipApplicable,
                                    IsMemberNumberCompulsory = sch.IsMemberNumberCompulsory,
                                    DefaultPaymentMode = sch.DefaultPaymentMode,
                                    IsCreditApplicable = sch.IsOpPhrmCreditApplicable,
                                    IsCreditOnlyScheme = sch.IsCreditOnlyScheme,
                                    CreditLimit = sch.OpCreditLimit,
                                    DefaultCreditOrganizationId = sch.DefaultCreditOrganizationId,
                                    IsCoPayment = sch.IsPharmacyCoPayment,
                                    CoPaymentCashPercent = sch.PharmacyCoPayCashPercent,
                                    CoPaymentCreditPercent = sch.PharmacyCoPayCreditPercent,
                                    DefaultPriceCategoryId = sch.DefaultPriceCategoryId,
                                    DefaultPriceCategoryName = priceCat.PriceCategoryName,
                                    IsGeneralCreditLimited = sch.IsGeneralCreditLimited,
                                    IsCreditLimited = sch.IsOpCreditLimited,
                                    GeneralCreditLimit = sch.GeneralCreditLimit,
                                    IsSystemDefault = sch.IsSystemDefault,
                                    AllowProvisionalBilling=sch.AllowProvisionalBilling
                                }).OrderBy(s => s.SchemeName).AsNoTracking().ToListAsync();
            return schemeList;
        }

        private static async Task<List<BillingScheme_DTO>> GetIpBillingContextSchemeDetails(BillingDbContext _billingDbContext, List<BillingScheme_DTO> schemeList)
        {
            schemeList = await (from sch in _billingDbContext.BillingSchemes
                                join priceCat in _billingDbContext.PriceCategoryModels on sch.DefaultPriceCategoryId equals priceCat.PriceCategoryId
                                join crOrg in _billingDbContext.CreditOrganization on sch.DefaultCreditOrganizationId equals crOrg.OrganizationId
                                into grp
                                from creditOrg in grp.DefaultIfEmpty()
                                where sch.IsActive == true
                                select new BillingScheme_DTO()
                                {
                                    SchemeId = sch.SchemeId,
                                    SchemeCode = sch.SchemeCode,
                                    SchemeName = sch.SchemeName,
                                    CommunityName = sch.CommunityName,
                                    IsDiscountApplicable = sch.IsIpBillDiscountApplicable,//Need to change this as per CurrentContext
                                    DiscountPercent = sch.IpBillDiscountPercent,//Need to change this as per CurrentContext
                                    IsDiscountEditable = sch.IsIpBillDiscountEditable,//Need to change this as per CurrentContext
                                    IsMembershipApplicable = sch.IsMembershipApplicable,
                                    IsMemberNumberCompulsory = sch.IsMemberNumberCompulsory,
                                    DefaultPaymentMode = sch.DefaultPaymentMode,
                                    IsCreditApplicable = sch.IsIpBillCreditApplicable,//Need to change this as per CurrentContext
                                    IsCreditOnlyScheme = sch.IsCreditOnlyScheme,
                                    CreditLimit = sch.IpCreditLimit, //Need to change this as per CurrentContext
                                    DefaultCreditOrganizationId = sch.DefaultCreditOrganizationId,
                                    IsCoPayment = sch.IsBillingCoPayment,
                                    DefaultPriceCategoryId = sch.DefaultPriceCategoryId,
                                    DefaultPriceCategoryName = priceCat.PriceCategoryName,
                                    ApiIntegrationName = sch.ApiIntegrationName,
                                    FieldSettingParamName = sch.FieldSettingParamName,
                                    IsSystemDefault = sch.IsSystemDefault,
                                    IsGeneralCreditLimited = sch.IsGeneralCreditLimited,
                                    IsCreditLimited = sch.IsIpCreditLimited,
                                    GeneralCreditLimit = sch.GeneralCreditLimit,
                                    IsClaimCodeAutoGenerate = creditOrg != null ? creditOrg.IsClaimCodeAutoGenerate : false,
                                    AllowProvisionalBilling = sch.AllowProvisionalBilling
                                }).OrderBy(s => s.SchemeName).AsNoTracking().ToListAsync();
            return schemeList;
        }

        private static async Task<List<BillingScheme_DTO>> GetOpBillingContextSchemesDetails(BillingDbContext _billingDbContext, List<BillingScheme_DTO> schemeList)
        {
            schemeList = await (from sch in _billingDbContext.BillingSchemes
                                join priceCat in _billingDbContext.PriceCategoryModels on sch.DefaultPriceCategoryId equals priceCat.PriceCategoryId
                                join crOrg in _billingDbContext.CreditOrganization on sch.DefaultCreditOrganizationId equals crOrg.OrganizationId
                                into grp from creditOrg in grp.DefaultIfEmpty()
                                where sch.IsActive == true
                                select new BillingScheme_DTO()
                                {
                                    SchemeId = sch.SchemeId,
                                    SchemeCode = sch.SchemeCode,
                                    SchemeName = sch.SchemeName,
                                    CommunityName = sch.CommunityName,
                                    IsDiscountApplicable = sch.IsOpBillDiscountApplicable,//Need to change this as per CurrentContext
                                    DiscountPercent = sch.OpBillDiscountPercent,//Need to change this as per CurrentContext
                                    IsDiscountEditable = sch.IsOpBillDiscountEditable,//Need to change this as per CurrentContext
                                    IsMembershipApplicable = sch.IsMembershipApplicable,
                                    IsMemberNumberCompulsory = sch.IsMemberNumberCompulsory,
                                    DefaultPaymentMode = sch.DefaultPaymentMode,
                                    IsCreditApplicable = sch.IsOpBillCreditApplicable,//Need to change this as per CurrentContext
                                    IsCreditOnlyScheme = sch.IsCreditOnlyScheme,
                                    CreditLimit = sch.OpCreditLimit, //Need to change this as per CurrentContext
                                    DefaultCreditOrganizationId = sch.DefaultCreditOrganizationId,
                                    IsCoPayment = sch.IsBillingCoPayment,
                                    DefaultPriceCategoryId = sch.DefaultPriceCategoryId,
                                    DefaultPriceCategoryName = priceCat.PriceCategoryName,
                                    ApiIntegrationName = sch.ApiIntegrationName,
                                    FieldSettingParamName = sch.FieldSettingParamName,
                                    IsSystemDefault = sch.IsSystemDefault,
                                    IsGeneralCreditLimited = sch.IsGeneralCreditLimited,
                                    IsCreditLimited = sch.IsOpCreditLimited,
                                    GeneralCreditLimit = sch.GeneralCreditLimit,
                                    IsClaimCodeAutoGenerate = creditOrg != null ? creditOrg.IsClaimCodeAutoGenerate : false,
                                    AllowProvisionalBilling = sch.AllowProvisionalBilling,
                                    HasSubScheme = sch.HasSubScheme,
                                    SubSchemes =  (_billingDbContext.BillingSubSchemes.Where(subScheme => subScheme.SchemeId == sch.SchemeId && subScheme.IsActive == true)
                                                                .Select(ss => new BillingSubScheme_DTO
                                                                 {
                                                                    SubSchemeId= ss.SubSchemeId,
                                                                    SubSchemeName = ss.SubSchemeName,
                                                                    SchemeId = ss.SchemeId,
                                                                    IsActive = ss.IsActive
                                                                 }).ToList()) 
                                }).OrderBy(s => s.SchemeName).AsNoTracking().ToListAsync();
            return schemeList;
        }

        public async Task<object> GetSchemePriceCategoriesMap(BillingDbContext _billingDbContext)
        {
            var schPriceCatMap = await (from map in _billingDbContext.PriceCategorySchemesMaps
                                        join sch in _billingDbContext.BillingSchemes on map.SchemeId equals sch.SchemeId
                                        join prc in _billingDbContext.PriceCategoryModels on map.PriceCategoryId equals prc.PriceCategoryId
                                        where map.IsActive == true && sch.IsActive == true && prc.IsActive == true
                                        select map).AsNoTracking().ToListAsync();
            return schPriceCatMap;
        }

        public async Task<object> GetServiceItems(int priceCategoryId, int schemeId, string serviceBillingContext, BillingDbContext _billingDbContext)
        {
            if (priceCategoryId == 0 || schemeId == 0 || String.IsNullOrEmpty(serviceBillingContext))
            {
                var systemDefaultScheme = await _billingDbContext.BillingSchemes.FirstOrDefaultAsync(a => a.IsSystemDefault);
                var systemDefaultPriceCategory = await _billingDbContext.PriceCategoryModels.FirstOrDefaultAsync(a => a.IsDefault);
                schemeId = systemDefaultScheme != null ? systemDefaultScheme.SchemeId : 0;
                priceCategoryId = systemDefaultPriceCategory != null ? systemDefaultPriceCategory.PriceCategoryId : 0;

                if(schemeId == 0 || priceCategoryId == 0)
                    throw new ArgumentException("Either of PriceCategory, Scheme or serviceBillingContext is invalid.");
            }

            var scheme = await _billingDbContext.BillingSchemes.AsNoTracking().SingleOrDefaultAsync(a => a.SchemeId == schemeId);


            /*Krishna, 28thApril'23, Explanation of below LINQ
                Here, we first call ToListAsync() to get an asynchronous list,
                and then use ConfigureAwait(false) to avoid capturing the current synchronization context, which can improve performance.
            */
            List<ServiceItemDetails_DTO> baseServiceItems = await (from serviceItem in _billingDbContext.BillServiceItems
                                                                   join priceCatServiceItem in _billingDbContext.BillItemsPriceCategoryMaps
                                                                   on serviceItem.ServiceItemId equals priceCatServiceItem.ServiceItemId
                                                                   join servDept in _billingDbContext.ServiceDepartment
                                                                   on serviceItem.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                                   where priceCatServiceItem.PriceCategoryId == priceCategoryId && serviceItem.IsActive == true
                                                                   select new ServiceItemDetails_DTO
                                                                   {
                                                                       ServiceItemId = serviceItem.ServiceItemId,
                                                                       PriceCategoryId = priceCatServiceItem.PriceCategoryId,
                                                                       SchemeId = scheme.SchemeId,
                                                                       ItemCode = String.IsNullOrEmpty(priceCatServiceItem.ItemLegalCode) ? serviceItem.ItemCode : priceCatServiceItem.ItemLegalCode,
                                                                       ItemName = String.IsNullOrEmpty(priceCatServiceItem.ItemLegalName) ? serviceItem.ItemName : priceCatServiceItem.ItemLegalName,
                                                                       ServiceDepartmentId = serviceItem.ServiceDepartmentId,
                                                                       ServiceDepartmentName = servDept.ServiceDepartmentName,
                                                                       Price = priceCatServiceItem.Price,
                                                                       IsTaxApplicable = serviceItem.IsTaxApplicable,
                                                                       IsDiscountApplicable = priceCatServiceItem.IsDiscountApplicable,
                                                                       DiscountPercent = 0,//this should be Zero and overwritten by below function.
                                                                       IsPriceChangeAllowed = priceCatServiceItem.IsPriceChangeAllowed,
                                                                       IsZeroPriceAllowed = priceCatServiceItem.IsZeroPriceAllowed,
                                                                       HasAdditionalBillingItems = priceCatServiceItem.HasAdditionalBillingItems,
                                                                       IsDoctorMandatory = serviceItem.IsDoctorMandatory,
                                                                       IsCoPayment = false,
                                                                       CoPayCashPercent = 0,
                                                                       CoPayCreditPercent = 0,
                                                                       IntegrationItemId = serviceItem.IntegrationItemId,
                                                                       IntegrationName = servDept.IntegrationName,
                                                                       DisplaySequence = serviceItem.DisplaySeq,
                                                                       DefaultDoctorList = serviceItem.DefaultDoctorList
                                                                   }).AsNoTracking()
                                                                   .ToListAsync().ConfigureAwait(false);


            List<ServiceItemSchemeSettings_DTO> serviceItemSchemeSettings = await GetServiceItemSchemeSettingsForCurrentServiceBillingContext(serviceBillingContext, scheme.SchemeId, _billingDbContext);

            List<ServiceItemDetails_DTO> serviceItemWithCoPayAndDiscount = (from servItemMst in baseServiceItems
                                                                            join schemeItem in serviceItemSchemeSettings
                                                                            on servItemMst.ServiceItemId equals schemeItem.ServiceItemId
                                                                            into grp
                                                                            from items in grp.DefaultIfEmpty()
                                                                            select new ServiceItemDetails_DTO
                                                                            {   
                                                                                ServiceItemId = servItemMst.ServiceItemId,
                                                                                PriceCategoryId = servItemMst.PriceCategoryId,
                                                                                SchemeId = servItemMst.SchemeId,
                                                                                ItemCode = servItemMst.ItemCode,
                                                                                ItemName = servItemMst.ItemName,
                                                                                ServiceDepartmentId = servItemMst.ServiceDepartmentId,
                                                                                ServiceDepartmentName = servItemMst.ServiceDepartmentName,
                                                                                Price = servItemMst.Price,
                                                                                IsTaxApplicable = servItemMst.IsTaxApplicable,
                                                                                IsDiscountApplicable = servItemMst.IsDiscountApplicable,
                                                                                DiscountPercent = (items != null && servItemMst.IsDiscountApplicable) ? items.DiscountPercent : 0,
                                                                                IsPriceChangeAllowed = servItemMst.IsPriceChangeAllowed,
                                                                                IsZeroPriceAllowed = servItemMst.IsZeroPriceAllowed,
                                                                                HasAdditionalBillingItems = servItemMst.HasAdditionalBillingItems,
                                                                                IsDoctorMandatory = servItemMst.IsDoctorMandatory,
                                                                                IsCoPayment = items != null && items.IsCoPayment.HasValue ? items.IsCoPayment.Value : false,
                                                                                CoPayCashPercent = items != null ? items.CoPaymentCashPercent : 0, // Need to Review/ReWrite this Logic
                                                                                CoPayCreditPercent = items != null ? items.CoPaymentCreditPercent : 0, // Need to Review/ ReWrite this Logic
                                                                                IntegrationItemId = servItemMst.IntegrationItemId,
                                                                                IntegrationName = servItemMst.IntegrationName,
                                                                                DisplaySequence = servItemMst.DisplaySequence,
                                                                                DefaultDoctorList = servItemMst.DefaultDoctorList
                                                                            }).ToList();
            return serviceItemWithCoPayAndDiscount;
        }

        private async Task<List<ServiceItemSchemeSettings_DTO>> GetServiceItemSchemeSettingsForCurrentServiceBillingContext(string serviceBillingContext, int schemeId, BillingDbContext _billingDbContext)
        {
            List<ServiceItemSchemeSettings_DTO> serviceItemSchemeSettings = new List<ServiceItemSchemeSettings_DTO>();


            if (serviceBillingContext.ToLower() == ENUM_ServiceBillingContext.OpBilling)
            {
                serviceItemSchemeSettings = await _billingDbContext.ServiceItemSchemeSettings
                                               .Where(a => a.SchemeId == schemeId)
                                               .Select(a => new ServiceItemSchemeSettings_DTO
                                               {
                                                   ServiceItemId = a.ServiceItemId,
                                                   SchemeId = a.SchemeId,
                                                   IsCoPayment = a.IsCoPayment,
                                                   DiscountPercent = a.OpBillDiscountPercent,
                                                   CoPaymentCashPercent = a.CoPaymentCashPercent,
                                                   CoPaymentCreditPercent = a.CoPaymentCreditPercent
                                               }).AsNoTracking()
                                               .ToListAsync()
                                               .ConfigureAwait(false);
            }
            else if (serviceBillingContext.ToLower() == ENUM_ServiceBillingContext.IpBilling)
            {
                serviceItemSchemeSettings = await _billingDbContext.ServiceItemSchemeSettings
                                             .Where(a => a.SchemeId == schemeId)
                                             .Select(a => new ServiceItemSchemeSettings_DTO
                                             {
                                                 ServiceItemId = a.ServiceItemId,
                                                 SchemeId = a.SchemeId,
                                                 IsCoPayment = a.IsCoPayment,
                                                 DiscountPercent = a.IpBillDiscountPercent,
                                                 CoPaymentCashPercent = a.CoPaymentCashPercent,
                                                 CoPaymentCreditPercent = a.CoPaymentCreditPercent
                                             }).AsNoTracking()
                                             .ToListAsync()
                                             .ConfigureAwait(false);
            }
            else if (serviceBillingContext.ToLower() == ENUM_ServiceBillingContext.Registration)
            {
                serviceItemSchemeSettings = await _billingDbContext.ServiceItemSchemeSettings
                                             .Where(a => a.SchemeId == schemeId)
                                             .Select(a => new ServiceItemSchemeSettings_DTO
                                             {
                                                 ServiceItemId = a.ServiceItemId,
                                                 SchemeId = a.SchemeId,
                                                 IsCoPayment = a.IsCoPayment,
                                                 DiscountPercent = a.RegDiscountPercent,
                                                 CoPaymentCashPercent = a.CoPaymentCashPercent,
                                                 CoPaymentCreditPercent = a.CoPaymentCreditPercent
                                             }).AsNoTracking()
                                             .ToListAsync()
                                             .ConfigureAwait(false);
            }
            else if (serviceBillingContext.ToLower() == ENUM_ServiceBillingContext.Admission)
            {
                serviceItemSchemeSettings = await _billingDbContext.ServiceItemSchemeSettings
                                             .Where(a => a.SchemeId == schemeId)
                                             .Select(a => new ServiceItemSchemeSettings_DTO
                                             {
                                                 ServiceItemId = a.ServiceItemId,
                                                 SchemeId = a.SchemeId,
                                                 IsCoPayment = a.IsCoPayment,
                                                 DiscountPercent = a.AdmissionDiscountPercent,
                                                 CoPaymentCashPercent = a.CoPaymentCashPercent,
                                                 CoPaymentCreditPercent = a.CoPaymentCreditPercent
                                             }).AsNoTracking()
                                             .ToListAsync()
                                             .ConfigureAwait(false);
            }
            return serviceItemSchemeSettings;
        }

        public async Task<object> GetCreditOrganizations(BillingDbContext _billingDbContext)
        {
            var crOrgList = await _billingDbContext.CreditOrganization.Where(a => a.IsActive).ToListAsync();
            return crOrgList;
        }

        public async Task<object> GetServiceDepartments(BillingDbContext _billingDbContext)
        {
            var srvDeptList = await _billingDbContext.ServiceDepartment.Where(a => a.IsActive == true).ToListAsync();
            return srvDeptList;
        }

        public async Task<object> GetServiceItemSchemeSettingsForCurrentBillingContext(string serviceBillingContext, int schemeId, BillingDbContext billingDbContext)
        {
            return await GetServiceItemSchemeSettingsForCurrentServiceBillingContext(serviceBillingContext, schemeId, billingDbContext);
        }

        public async Task<object> GetadditionalServiceItems(BillingDbContext _billingDbContext, string groupName, int priceCategoryId)
        {
            if(priceCategoryId == 0)
            {
                var systemDefaultPriceCategory = _billingDbContext.PriceCategoryModels.FirstOrDefault(a => a.IsDefault);
                priceCategoryId = systemDefaultPriceCategory != null ? systemDefaultPriceCategory.PriceCategoryId : 0;
            }
            var additionalServiceItems = await _billingDbContext.BillingAdditionalServiceItems
                                                           .Join(_billingDbContext.BillServiceItems,
                                                                 additionalServiceItem => additionalServiceItem.ServiceItemId,
                                                                 mstServiceItem => mstServiceItem.ServiceItemId,
                                                             (additional, mstServiceItem) => new BillingAdditionalServiceItem_DTO
                                                             {
                                                                 AdditionalServiceItemId = additional.AdditionalServiceItemId,
                                                                 ServiceItemId = additional.ServiceItemId,
                                                                 PriceCategoryId = additional.PriceCategoryId,
                                                                 GroupName = additional.GroupName,
                                                                 ItemName = additional.ItemName,
                                                                 UseItemSelfPrice = additional.UseItemSelfPrice,
                                                                 PercentageOfParentItemForSameDept = additional.PercentageOfParentItemForSameDept,
                                                                 PercentageOfParentItemForDiffDept = additional.PercentageOfParentItemForDiffDept,
                                                                 MinimumChargeAmount = additional.MinimumChargeAmount,
                                                                 IsPreAnaesthesia = additional.IsPreAnaesthesia,
                                                                 WithPreAnaesthesia = additional.WithPreAnaesthesia,
                                                                 IsOpServiceItem = additional.IsOpServiceItem,
                                                                 IsIpServiceItem= additional.IsIpServiceItem,
                                                                 HasChildServiceItems= additional.HasChildServiceItems,
                                                                 IsActive = additional.IsActive,
                                                                 IsMasterServiceItemActive = mstServiceItem.IsActive
                                                             })
                                                           .Where(a => a.GroupName == groupName && a.IsActive == true && a.IsMasterServiceItemActive == true && a.PriceCategoryId == priceCategoryId)
                                                           .ToListAsync();
            return additionalServiceItems;
        }

        public async Task<object> GetServiceItemSchemeSettings(BillingDbContext _billingDbContext, int schemeId)
        {
            var serviceItemSchemeSetting = await _billingDbContext.ServiceItemSchemeSettings.Where(sis => sis.SchemeId == schemeId && sis.IsActive).ToListAsync();
            return serviceItemSchemeSetting;
        }

        public async Task<object> GetVisitAdditionalServiceItems(BillingDbContext _billingDbContext, string groupName)
        {
            var VistAdditionalServiceItems = await _billingDbContext.BillingAdditionalServiceItems
                         .Join(_billingDbContext.BillServiceItems, additionalServiceItem => additionalServiceItem.ServiceItemId,
                             mstServiceItem => mstServiceItem.ServiceItemId,
                             (additionalServiceItem, mstServiceItemb) => new { additionalServiceItem, mstServiceItemb })
                         .Join(_billingDbContext.BillItemsPriceCategoryMaps, serviceItem => new { serviceItem.additionalServiceItem.ServiceItemId, serviceItem.additionalServiceItem.PriceCategoryId },
                              billItemsPriceCategoryMaps => new { billItemsPriceCategoryMaps.ServiceItemId, billItemsPriceCategoryMaps.PriceCategoryId },
                              (serviceItem, billItemsPriceCategoryMaps) => new { serviceItem, billItemsPriceCategoryMaps })
                         .Join(_billingDbContext.ServiceDepartment, itemDetail => itemDetail.billItemsPriceCategoryMaps.ServiceDepartmentId,
                              serviceDepartment => serviceDepartment.ServiceDepartmentId,
                              (itemDetail, serviceDepartment) => new BillingAdditionalServiceItem_DTO
                              {
                                  AdditionalServiceItemId = itemDetail.serviceItem.additionalServiceItem.AdditionalServiceItemId,
                                  ServiceItemId = itemDetail.serviceItem.additionalServiceItem.ServiceItemId,
                                  ServiceDepartmentId = itemDetail.serviceItem.mstServiceItemb.ServiceDepartmentId,
                                  ItemName = itemDetail.serviceItem.additionalServiceItem.ItemName,
                                  LegalName = itemDetail.billItemsPriceCategoryMaps.ItemLegalName,
                                  Price = itemDetail.billItemsPriceCategoryMaps.Price,
                                  PriceCategoryId = itemDetail.serviceItem.additionalServiceItem.PriceCategoryId,
                                  GroupName = itemDetail.serviceItem.additionalServiceItem.GroupName,
                                  IsActive = itemDetail.serviceItem.additionalServiceItem.IsActive,
                                  IsMasterServiceItemActive = itemDetail.serviceItem.mstServiceItemb.IsActive,
                                  IsDiscountApplicable = itemDetail.billItemsPriceCategoryMaps.IsDiscountApplicable,
                                  IsTaxApplicable = itemDetail.serviceItem.mstServiceItemb.IsTaxApplicable,
                                  ServiceDepartmentName = serviceDepartment.ServiceDepartmentName,
                                  ItemCode = itemDetail.billItemsPriceCategoryMaps.ItemLegalCode
                              }).Where(a => a.GroupName == groupName && a.IsActive == true && a.IsMasterServiceItemActive == true).ToListAsync();
            return VistAdditionalServiceItems;
        }

        public async Task<object> AddServiceItemSchemeSettings(BillingDbContext _billingDbContext, List<BillServiceItemSchemeSetting_DTO> billServiceItemSchemeSettingdto, RbacUser currentUser)
        {
            var currentDate = DateTime.Now;
            var billServiceItemSettings = new List<BillServiceItemSchemeSettingModel>();
            foreach (var itmstg in billServiceItemSchemeSettingdto)
            {
                var serviceitem = await _billingDbContext.ServiceItemSchemeSettings.Where(x => x.ServiceItemSchemeSettingId == itmstg.ServiceItemSchemeSettingId).FirstOrDefaultAsync();

                if (serviceitem != null)
                {
                    serviceitem.ServiceItemId = itmstg.ServiceItemId;
                    serviceitem.SchemeId = itmstg.SchemeId;
                    serviceitem.RegDiscountPercent = itmstg.RegDiscountPercent;
                    serviceitem.OpBillDiscountPercent = itmstg.OpBillDiscountPercent;
                    serviceitem.IpBillDiscountPercent = itmstg.IpBillDiscountPercent;
                    serviceitem.AdmissionDiscountPercent = itmstg.AdmissionDiscountPercent;
                    serviceitem.IsCoPayment = itmstg.IsCoPayment;
                    serviceitem.CoPaymentCashPercent = itmstg.CoPaymentCashPercent;
                    serviceitem.CoPaymentCreditPercent = itmstg.CoPaymentCreditPercent;
                    serviceitem.ModifiedBy = currentUser.EmployeeId;
                    serviceitem.ModifiedOn = currentDate;
                    serviceitem.IsActive = itmstg.itemIsSelected;
                }
                else
                {
                    var billServiceItemSetting = new BillServiceItemSchemeSettingModel();
                    billServiceItemSetting.ServiceItemSchemeSettingId = itmstg.ServiceItemSchemeSettingId;
                    billServiceItemSetting.ServiceItemId = itmstg.ServiceItemId;
                    billServiceItemSetting.SchemeId = itmstg.SchemeId;
                    billServiceItemSetting.RegDiscountPercent = itmstg.RegDiscountPercent;
                    billServiceItemSetting.OpBillDiscountPercent = itmstg.OpBillDiscountPercent;
                    billServiceItemSetting.IpBillDiscountPercent = itmstg.IpBillDiscountPercent;
                    billServiceItemSetting.AdmissionDiscountPercent = itmstg.AdmissionDiscountPercent;
                    billServiceItemSetting.IsCoPayment = itmstg.IsCoPayment;
                    billServiceItemSetting.CoPaymentCashPercent = itmstg.CoPaymentCashPercent;
                    billServiceItemSetting.CoPaymentCreditPercent = itmstg.CoPaymentCreditPercent;
                    billServiceItemSetting.CreatedBy = currentUser.EmployeeId;
                    billServiceItemSetting.CreatedOn = DateTime.Now;
                    billServiceItemSetting.IsActive = true;
                    billServiceItemSettings.Add(billServiceItemSetting);
                }
            }
            
            _billingDbContext.ServiceItemSchemeSettings.AddRange(billServiceItemSettings);
            await _billingDbContext.SaveChangesAsync();

            return "Scheme Settings Added/Updated Successfully";
        }

        public async Task<object> GetServicePackages(BillingDbContext _billingDbContext, int schemeId, int priceCategoryId)
        {
            var servicePackages = await (from packages in _billingDbContext.BillingPackages
                                        join pServiceItems in _billingDbContext.BillingPackageServiceItems on packages.BillingPackageId equals pServiceItems.BillingPackageId into items
                                        where packages.SchemeId == schemeId && packages.PriceCategoryId == priceCategoryId
                                        && packages.IsActive == true
                                        select new BillingPackage_DTO
                                        {
                                            BillingPackageId = packages.BillingPackageId,
                                            BillingPackageName = packages.BillingPackageName,
                                            PackageCode = packages.PackageCode,
                                            Description = packages.Description,
                                            TotalPrice = packages.TotalPrice,
                                            DiscountPercent = packages.DiscountPercent,
                                            IsActive = packages.IsActive,
                                            LabTypeName = packages.LabTypeName,
                                            SchemeId = packages.SchemeId,
                                            PriceCategoryId = packages.PriceCategoryId,
                                            IsEditable = packages.IsEditable,
                                            BillingPackageServiceItemList = items.Select(s => new BillingPackageServiceItems_DTO
                                            {
                                                PackageServiceItemId = s.PackageServiceItemId,
                                                BillingPackageId = s.BillingPackageId,
                                                ServiceItemId = s.ServiceItemId,
                                                Quantity = s.Quantity,
                                                DiscountPercent = s.DiscountPercent,
                                                PerformerId = s.PerformerId,
                                                IsActive = s.IsActive
                                            }).Where(w => w.IsActive == true).ToList()
                                        }).ToListAsync();
            return servicePackages;
        }

        public async Task<object> Getcurrencies(BillingDbContext billingDbContext)
        {
            var currencies = await billingDbContext.Currencies.Where(a => a.IsActive == true && a.ISBaseCurrency == false)
                                             .Select(s => new Currency_DTO
                                             {
                                                 CurrencyId = s.CurrencyId,
                                                 CurrencyCode= s.CurrencyCode,
                                                 CurrencyName   = s.CurrencyName,
                                                 ExchangeRateDividend= s.ExchangeRateDividend,
                                                 IsActive= s.IsActive,
                                                 ISBaseCurrency = s.ISBaseCurrency
                                             }).ToListAsync();
            return currencies;
        }

        public async Task<object> GetPriceCategoryServiceItems(BillingDbContext _billingDbContext, int priceCategoryId)
        {
            var priceCategoryServiceItems = await (from serviceItem in _billingDbContext.BillServiceItems
                                                   join priceCatServiceItem in _billingDbContext.BillItemsPriceCategoryMaps
                                                   on serviceItem.ServiceItemId equals priceCatServiceItem.ServiceItemId
                                                   join servDept in _billingDbContext.ServiceDepartment
                                                   on serviceItem.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                   where priceCatServiceItem.PriceCategoryId == priceCategoryId && serviceItem.IsActive == true
                                                   select new BillingPriceCategoryServiceItem_DTO
                                                   {
                                                       ServiceItemId = serviceItem.ServiceItemId,
                                                       PriceCategoryId = priceCatServiceItem.PriceCategoryId,
                                                       ItemCode = String.IsNullOrEmpty(priceCatServiceItem.ItemLegalCode) ? serviceItem.ItemCode : priceCatServiceItem.ItemLegalCode,
                                                       ItemName = String.IsNullOrEmpty(priceCatServiceItem.ItemLegalName) ? serviceItem.ItemName : priceCatServiceItem.ItemLegalName,
                                                       ServiceDepartmentId = serviceItem.ServiceDepartmentId,
                                                       Price = priceCatServiceItem.Price,
                                                       IntegrationItemId = serviceItem.IntegrationItemId
                                                   }).AsNoTracking()
                                                    .ToListAsync().ConfigureAwait(false);
            return priceCategoryServiceItems;
        }

    }
}
