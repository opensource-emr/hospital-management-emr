using DanpheEMR.Core;
using DanpheEMR.Core.DynamicTemplate;
using DanpheEMR.Security;
using DanpheEMR.Services.DynamicTemplates.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DanpheEMR.Services.DynamicTemplates
{
    public interface IDynamicTemplateService
    {
        object GetTemplateTypes(CoreDbContext coreDbContext);
        object GetTemplatePrintHtml(CoreDbContext coreDbContext, int templateId);
        object GetTemplates(CoreDbContext coreDbContext, string templateTypeName);
        object GetTemplateFields(CoreDbContext coreDbContext, int templateId); 
        object GetFieldMaster(CoreDbContext coreDbContext, int? templateTypeId = null);
        object GetSelectedTemplateData(CoreDbContext coreDbContext, int templateTypeId);
        object GetFieldMasterByTemplateId(CoreDbContext coreDbContext, int templateId);
        Task<object> ActivateDeactivateTemplateAsync(CoreDbContext coreDbContext, int templateId, RbacUser currentUser);
        Task<object> UpdateDynamicTemplate(CoreDbContext coreDbContext, RbacUser currentUser, TemplateModel templates);
        object AddNewTemplate(CoreDbContext coreDbContext, RbacUser currentUser, TemplateModel template);
        object AddUpdateFieldMapping(CoreDbContext coreDbContext, RbacUser currentUser, List<FieldMappings_DTO> fieldMappingsList);
    }
}
