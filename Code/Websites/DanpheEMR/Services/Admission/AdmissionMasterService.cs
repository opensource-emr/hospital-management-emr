using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Services.Admission.DTOs;
using DanpheEMR.Services.Billing.DTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Admission
{
    public class AdmissionMasterService : IAdmissionMasterService
    {
        public async Task<List<AdtAutoBillingItem_DTO>> GetAdtAutoBillingItems(AdmissionDbContext admissionDbContext)
        {
            var adtAutoBillingItems = await admissionDbContext.AdtAutoBillingItems.Where(a => a.IsActive)
                                      .Select(s => new AdtAutoBillingItem_DTO
                                      {
                                          AdtAutoBillingItemId = s.AdtAutoBillingItemId,
                                          SchemeId= s.SchemeId,
                                          BedFeatureId = s.BedFeatureId,
                                          ServiceItemId= s.ServiceItemId,
                                          MinimumChargeAmount= s.MinimumChargeAmount,
                                          PercentageOfBedCharges = s.PercentageOfBedCharges,
                                          UsePercentageOfBedCharges= s.UsePercentageOfBedCharges,
                                          IsRepeatable= s.IsRepeatable,
                                          IsActive  = s.IsActive
                                      }).ToListAsync();
            return adtAutoBillingItems;
        }

        public async Task<List<AdtDepositSetting_DTO>> GetAdtDepositSettings(AdmissionDbContext admissionDbContext)
        {
            var adtDepositSettings = await admissionDbContext.AdtDepositSettings.Where(a => a.IsActive)
                                     .Select(s => new AdtDepositSetting_DTO
                                     {
                                         AdtDepositSettingId = s.AdtDepositSettingId,
                                         SchemeId= s.SchemeId,
                                         BedFeatureId= s.BedFeatureId,
                                         DepositHeadId= s.DepositHeadId,
                                         MinimumDepositAmount= s.MinimumDepositAmount,
                                         IsOnlyMinimumDeposit= s.IsOnlyMinimumDeposit,
                                         IsActive= s.IsActive
                                     }).ToListAsync();
            return adtDepositSettings;
        }

        public async Task<List<AdtAutoBillingItem_DTO>> GetAdtAutoBillingItemForScheme(AdmissionDbContext admissionDbContext, int schemeId, int priceCategoryId, string serviceBillingContext)
        {

            if (priceCategoryId == 0 || schemeId == 0 || String.IsNullOrEmpty(serviceBillingContext))
            {
                var systemDefaultScheme = await admissionDbContext.Schemes.FirstOrDefaultAsync(a => a.IsSystemDefault);
                var systemDefaultPriceCategory = await admissionDbContext.PriceCategoryModels.FirstOrDefaultAsync(a => a.IsDefault);
                schemeId = systemDefaultScheme != null ? systemDefaultScheme.SchemeId : 0;
                priceCategoryId = systemDefaultPriceCategory != null ? systemDefaultPriceCategory.PriceCategoryId : 0;

                if (schemeId == 0 || priceCategoryId == 0)
                    throw new ArgumentException("Either of PriceCategory, Scheme or serviceBillingContext is invalid.");
            }

            var scheme = await admissionDbContext.Schemes.AsNoTracking().SingleOrDefaultAsync(a => a.SchemeId == schemeId);


            /*Krishna, 28thApril'23, Explanation of below LINQ
                Here, we first call ToListAsync() to get an asynchronous list,
                and then use ConfigureAwait(false) to avoid capturing the current synchronization context, which can improve performance.
            */
            List<AdtAutoBillingItem_DTO> baseServiceItems = await (from serviceItem in admissionDbContext.BillServiceItems
                                                                   join priceCatServiceItem in admissionDbContext.BillPriceCategoryServiceItems
                                                                   on serviceItem.ServiceItemId equals priceCatServiceItem.ServiceItemId
                                                                   join servDept in admissionDbContext.ServiceDepartment
                                                                   on serviceItem.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                                   join autoBillItem in admissionDbContext.AdtAutoBillingItems
                                                                   on serviceItem.ServiceItemId equals autoBillItem.ServiceItemId
                                                                   where priceCatServiceItem.PriceCategoryId == priceCategoryId && autoBillItem.SchemeId == schemeId 
                                                                   && autoBillItem.IsActive == true && serviceItem.IsActive == true
                                                                   select new AdtAutoBillingItem_DTO
                                                                   {
                                                                       AdtAutoBillingItemId = autoBillItem.AdtAutoBillingItemId,
                                                                       SchemeId = autoBillItem.SchemeId,
                                                                       BedFeatureId = autoBillItem.BedFeatureId,
                                                                       ServiceItemId = autoBillItem.ServiceItemId,
                                                                       MinimumChargeAmount = autoBillItem.MinimumChargeAmount,
                                                                       PercentageOfBedCharges = autoBillItem.PercentageOfBedCharges,
                                                                       UsePercentageOfBedCharges = autoBillItem.UsePercentageOfBedCharges,
                                                                       IsRepeatable = autoBillItem.IsRepeatable,
                                                                       IsActive = autoBillItem.IsActive,
                                                                       Price = priceCatServiceItem.Price,
                                                                       PriceCategoryId = priceCatServiceItem.PriceCategoryId,
                                                                       ItemCode = String.IsNullOrEmpty(priceCatServiceItem.ItemLegalCode) ? serviceItem.ItemCode : priceCatServiceItem.ItemLegalCode,
                                                                       ItemName = String.IsNullOrEmpty(priceCatServiceItem.ItemLegalName) ? serviceItem.ItemName : priceCatServiceItem.ItemLegalName,
                                                                       ServiceDepartmentId = serviceItem.ServiceDepartmentId,
                                                                       ServiceDepartmentName = servDept.ServiceDepartmentName,
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
                                                                       IntegrationName = servDept.IntegrationName
                                                                   }).ToListAsync().ConfigureAwait(false);


            List<ServiceItemSchemeSettings_DTO> serviceItemSchemeSettings = await GetServiceItemSchemeSettingsForCurrentServiceBillingContext(serviceBillingContext, scheme.SchemeId, admissionDbContext);

            List<AdtAutoBillingItem_DTO> adtAutoBillingItems = (from servItemMst in baseServiceItems
                                                                            join schemeItem in serviceItemSchemeSettings
                                                                            on servItemMst.ServiceItemId equals schemeItem.ServiceItemId
                                                                            into grp
                                                                            from items in grp.DefaultIfEmpty()
                                                                            select new AdtAutoBillingItem_DTO
                                                                            {
                                                                                AdtAutoBillingItemId = servItemMst.AdtAutoBillingItemId,
                                                                                SchemeId = servItemMst.SchemeId,
                                                                                BedFeatureId = servItemMst.BedFeatureId,
                                                                                ServiceItemId = servItemMst.ServiceItemId,
                                                                                MinimumChargeAmount = servItemMst.MinimumChargeAmount,
                                                                                PercentageOfBedCharges = servItemMst.PercentageOfBedCharges,
                                                                                UsePercentageOfBedCharges = servItemMst.UsePercentageOfBedCharges,
                                                                                IsRepeatable = servItemMst.IsRepeatable,
                                                                                IsActive = servItemMst.IsActive,
                                                                                Price = servItemMst.Price,
                                                                                PriceCategoryId = servItemMst.PriceCategoryId,
                                                                                ItemCode = servItemMst.ItemCode,
                                                                                ItemName = servItemMst.ItemName,
                                                                                ServiceDepartmentId = servItemMst.ServiceDepartmentId,
                                                                                ServiceDepartmentName = servItemMst.ServiceDepartmentName,
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
                                                                                IntegrationName = servItemMst.IntegrationName
                                                                            }).ToList();
            return adtAutoBillingItems;

        }

        private async Task<List<ServiceItemSchemeSettings_DTO>> GetServiceItemSchemeSettingsForCurrentServiceBillingContext(string serviceBillingContext, int schemeId, AdmissionDbContext _admissionDbContext)
        {
            List<ServiceItemSchemeSettings_DTO> serviceItemSchemeSettings = new List<ServiceItemSchemeSettings_DTO>();


            if (serviceBillingContext.ToLower() == ENUM_ServiceBillingContext.OpBilling)
            {
                serviceItemSchemeSettings = await _admissionDbContext.ServiceItemSchemeSettings
                                               .Where(a => a.SchemeId == schemeId)
                                               .Select(a => new ServiceItemSchemeSettings_DTO
                                               {
                                                   ServiceItemId = a.ServiceItemId,
                                                   SchemeId = a.SchemeId,
                                                   IsCoPayment = a.IsCoPayment,
                                                   DiscountPercent = a.OpBillDiscountPercent,
                                                   CoPaymentCashPercent = a.CoPaymentCashPercent,
                                                   CoPaymentCreditPercent = a.CoPaymentCreditPercent
                                               }).ToListAsync()
                                               .ConfigureAwait(false);
            }
            else if (serviceBillingContext.ToLower() == ENUM_ServiceBillingContext.IpBilling)
            {
                serviceItemSchemeSettings = await _admissionDbContext.ServiceItemSchemeSettings
                                             .Where(a => a.SchemeId == schemeId)
                                             .Select(a => new ServiceItemSchemeSettings_DTO
                                             {
                                                 ServiceItemId = a.ServiceItemId,
                                                 SchemeId = a.SchemeId,
                                                 IsCoPayment = a.IsCoPayment,
                                                 DiscountPercent = a.IpBillDiscountPercent,
                                                 CoPaymentCashPercent = a.CoPaymentCashPercent,
                                                 CoPaymentCreditPercent = a.CoPaymentCreditPercent
                                             }).ToListAsync()
                                             .ConfigureAwait(false);
            }
            else if (serviceBillingContext.ToLower() == ENUM_ServiceBillingContext.Registration)
            {
                serviceItemSchemeSettings = await _admissionDbContext.ServiceItemSchemeSettings
                                             .Where(a => a.SchemeId == schemeId)
                                             .Select(a => new ServiceItemSchemeSettings_DTO
                                             {
                                                 ServiceItemId = a.ServiceItemId,
                                                 SchemeId = a.SchemeId,
                                                 IsCoPayment = a.IsCoPayment,
                                                 DiscountPercent = a.RegDiscountPercent,
                                                 CoPaymentCashPercent = a.CoPaymentCashPercent,
                                                 CoPaymentCreditPercent = a.CoPaymentCreditPercent
                                             }).ToListAsync()
                                             .ConfigureAwait(false);
            }
            else if (serviceBillingContext.ToLower() == ENUM_ServiceBillingContext.Admission)
            {
                serviceItemSchemeSettings = await _admissionDbContext.ServiceItemSchemeSettings
                                             .Where(a => a.SchemeId == schemeId)
                                             .Select(a => new ServiceItemSchemeSettings_DTO
                                             {
                                                 ServiceItemId = a.ServiceItemId,
                                                 SchemeId = a.SchemeId,
                                                 IsCoPayment = a.IsCoPayment,
                                                 DiscountPercent = a.AdmissionDiscountPercent,
                                                 CoPaymentCashPercent = a.CoPaymentCashPercent,
                                                 CoPaymentCreditPercent = a.CoPaymentCreditPercent
                                             }).ToListAsync()
                                             .ConfigureAwait(false);
            }
            return serviceItemSchemeSettings;
        }

        public async Task<List<AdtDepositSetting_DTO>> GetAdtDepositSettingsForScheme(AdmissionDbContext admissionDbContext, int schemeId)
        {
            if (schemeId == 0 || schemeId == null)
            {
                var systemDefaultScheme = await admissionDbContext.Schemes.FirstOrDefaultAsync(a => a.IsActive == true && a.IsSystemDefault == true);
                schemeId = systemDefaultScheme != null ? systemDefaultScheme.SchemeId : 0;
            }

            var adtDepositSettingsForScheme = await admissionDbContext.AdtDepositSettings.Where(a => a.SchemeId == schemeId && a.IsActive == true)
                                     .Select(s => new AdtDepositSetting_DTO
                                     {
                                         AdtDepositSettingId = s.AdtDepositSettingId,
                                         SchemeId = s.SchemeId,
                                         BedFeatureId = s.BedFeatureId,
                                         DepositHeadId = s.DepositHeadId,
                                         MinimumDepositAmount = s.MinimumDepositAmount,
                                         IsOnlyMinimumDeposit = s.IsOnlyMinimumDeposit,
                                         IsActive = s.IsActive
                                     }).ToListAsync();
            return adtDepositSettingsForScheme;
        }

        public async Task<List<AdtBedFeatureSchemePriceCategoryMap_DTO>> GetBedFeatureSchemePriceCategoryMap(AdmissionDbContext admissionDbContext, int schemeId)
        {
            var adtBedFeatureSchemePriceCategory = await admissionDbContext.BedFeatureSchemePriceCategoryMaps.Where(a => a.SchemeId == schemeId && a.IsActive)
                                                .Select(a => new AdtBedFeatureSchemePriceCategoryMap_DTO 
                                                {
                                                    SchemeId = a.SchemeId,
                                                    BedFeatureId= a.BedFeatureId,
                                                    PriceCategoryId= a.PriceCategoryId,
                                                    IsActive= a.IsActive
                                                }).ToListAsync();
            return adtBedFeatureSchemePriceCategory;

        }
    }
}
