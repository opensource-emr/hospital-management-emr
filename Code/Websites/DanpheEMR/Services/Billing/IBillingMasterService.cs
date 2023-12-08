using DanpheEMR.Controllers.Billing.Shared;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Billing
{
    public interface IBillingMasterService
    {
        Task<object> GetServiceItems(int priceCategoryId, int schemeId, string serviceBillingContext, BillingDbContext billingDbContext);
        Task<object> GetSchemes(string serviceBillingContext, BillingDbContext billingDbContext);
        Task<object> GetPriceCategories(BillingDbContext billingDbContext);
        Task<object> GetSchemePriceCategoriesMap(BillingDbContext billingDbContext);
        Task<object> GetCreditOrganizations(BillingDbContext billingDbContext);
        Task<object> GetServiceDepartments(BillingDbContext billingDbContext);
        Task<object> GetServiceItemSchemeSettingsForCurrentBillingContext(string serviceBillingContext, int schemeId, BillingDbContext billingDbContext);
        Task<object> GetadditionalServiceItems(BillingDbContext billingDbContext, string groupName, int priceCategoryId);
        Task<object> GetServiceItemSchemeSettings(BillingDbContext billingDbContext, int schemeId);
        Task<object> GetVisitAdditionalServiceItems(BillingDbContext billingDbContext, string groupName);
        Task<object> GetServicePackages(BillingDbContext billingDbContext, int schemeId, int priceCategoryId);
        Task<object> Getcurrencies(BillingDbContext billingDbContext);
        Task<object> GetPriceCategoryServiceItems(BillingDbContext billingDbContext, int priceCategoryId);
        Task<object> AddServiceItemSchemeSettings(BillingDbContext billingDbContext, List<BillServiceItemSchemeSetting_DTO> billServiceItemSchemeSettingdto, RbacUser currentUser);
    }
}
