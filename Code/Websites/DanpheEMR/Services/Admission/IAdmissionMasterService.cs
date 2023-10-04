using DanpheEMR.DalLayer;
using DanpheEMR.Services.Admission.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Admission
{
    public interface IAdmissionMasterService
    {
        Task<List<AdtAutoBillingItem_DTO>> GetAdtAutoBillingItems(AdmissionDbContext admissionDbContext);
        Task<List<AdtDepositSetting_DTO>> GetAdtDepositSettings(AdmissionDbContext admissionDbContext);
        Task<List<AdtAutoBillingItem_DTO>> GetAdtAutoBillingItemForScheme(AdmissionDbContext admissionDbContext, int schemeId, int priceCategoryId, string serviceBillingContext);
        Task<List<AdtDepositSetting_DTO>> GetAdtDepositSettingsForScheme(AdmissionDbContext admissionDbContext, int schemeId);
        Task<List<AdtBedFeatureSchemePriceCategoryMap_DTO>> GetBedFeatureSchemePriceCategoryMap(AdmissionDbContext admissionDbContext, int schemeId);
    }
}
