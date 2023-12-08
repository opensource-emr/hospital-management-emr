using DanpheEMR.CommonTypes;
using DanpheEMR.Core;
using DanpheEMR.Core.DynamicTemplate;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.Services.DynamicTemplates.DTO;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.DynamicTemplates
{
    public class DynamicTemplateService : IDynamicTemplateService
    {


        public object GetTemplateTypes(CoreDbContext coreDbContext)
        {
            var result = coreDbContext.TemplateTypes
                                      .Select(a => new TemplateType_DTO
                                      {
                                          TemplateTypeId = a.TemplateTypeId,
                                          TemplateTypeCode = a.TemplateTypeCode,
                                          TemplateTypeName = a.TemplateTypeName,
                                          Description = a.Description,
                                          IsActive = a.IsActive,
                                      }).ToList();

            return result;
        }
        public object GetTemplatePrintHtml(CoreDbContext coreDbContext, int templateId)
        {
            var result = coreDbContext.Templates.Where(a => a.TemplateId == templateId).
                                       Select(t => new HtmlContent_DTO
                                       {
                                           TemplateId = t.TemplateId,
                                           PrintContentHTML = t.PrintContentHTML,
                                       }
                                       ).FirstOrDefault();
            return result;
        }

        public object GetTemplates(CoreDbContext coreDbContext, string templateTypeName)
        {
            if (!string.IsNullOrEmpty(templateTypeName))
            {
                var result = (from TemplateType in coreDbContext.TemplateTypes
                              join Template in coreDbContext.Templates on TemplateType.TemplateTypeId equals Template.TemplateTypeId
                              where TemplateType.TemplateTypeName == templateTypeName && Template.IsActive == true
                              select new Template_DTO
                              {
                                  TemplateName = Template.TemplateName,
                                  TemplateId = Template.TemplateId,
                                  IsDefault = Template.IsDefaultForThisType

                              }).ToList();

                return result;
            }

            else
            {
                var result = (from TemplateType in coreDbContext.TemplateTypes
                              join Template in coreDbContext.Templates on TemplateType.TemplateTypeId equals Template.TemplateTypeId
                              select new Template_DTO
                              {
                                  TemplateTypeName = TemplateType.TemplateTypeName,
                                  TemplateId = Template.TemplateId,
                                  TemplateCode = Template.TemplateCode,
                                  TemplateName = Template.TemplateName,
                                  Description = Template.Description,
                                  IsActive = Template.IsActive
                              }).ToList();
                return result;
            }

        }

        public object GetTemplateFields(CoreDbContext coreDbContext, int templateId)
        {
            var result = (from Template in coreDbContext.Templates
                          join Mapping in coreDbContext.TemplateFieldMappings on Template.TemplateId equals Mapping.TemplateId
                          join FieldMaster in coreDbContext.FieldMasters on Mapping.FieldMasterId equals FieldMaster.FieldMasterId
                          where Template.TemplateId == templateId && Mapping.IsActive || FieldMaster.IsCompulsoryField == true
                          select new TemplateField_DTO
                          {
                              FieldName = FieldMaster.FieldName,
                              IsMandatory = Mapping.IsMandatory || FieldMaster.IsCompulsoryField,
                              IsActive = FieldMaster.IsActive || FieldMaster.IsCompulsoryField,
                              IsCompulsoryField = FieldMaster.IsCompulsoryField

                          }).ToList();
            return result;
        }

        public object GetFieldMaster(CoreDbContext coreDbContext, int? templateTypeId = null)
        {
            var result = (from field in coreDbContext.FieldMasters
                          join templateType in coreDbContext.TemplateTypes
                          on field.TemplateTypeId equals templateType.TemplateTypeId
                          where (templateTypeId != null && field.TemplateTypeId == templateTypeId && field.IsActive) || templateTypeId == null
                          select new FieldMaster_DTO
                          {
                              TemplateTypeName = templateType.TemplateTypeName,
                              FieldName = field.FieldName,
                              Description = field.Description,
                              IsActive = field.IsActive,
                          }).ToList();

            return result;
        }

        public object GetSelectedTemplateData(CoreDbContext coreDbContext, int templateId)
        {
            var result = coreDbContext.Templates
                                     .FirstOrDefault(template => template.TemplateId == templateId);
            return result;
        }

        public object GetFieldMasterByTemplateId(CoreDbContext coreDbContext, int templateId)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@TemplateId", templateId));
            DataTable result = DALFunctions.GetDataTableFromStoredProc("SP_DYNTMP_GetFieldMappingByTemplateId", paramsList, coreDbContext);
            return result;
        }

        public async Task<object> ActivateDeactivateTemplateAsync(CoreDbContext coreDbContext, int templateId, RbacUser currentUser)
        {
            var templateToUpdate = await coreDbContext.Templates
                    .FirstOrDefaultAsync(template => template.TemplateId == templateId);

            if (templateToUpdate == null)
            {
                throw new InvalidOperationException("Cannot find template to update");
            }
            templateToUpdate.IsActive = !templateToUpdate.IsActive;
            templateToUpdate.ModifiedBy = currentUser.EmployeeId;
            templateToUpdate.ModifiedOn = DateTime.Now;

            await coreDbContext.SaveChangesAsync();
            return "Template Settings updated Successfully";
        }

        public async Task<object> UpdateDynamicTemplate(CoreDbContext coreDbContext, RbacUser currentUser, TemplateModel templates)
        {
            if(templates == null)
            {
                throw new InvalidOperationException("Cannot find template to update");
            }
            var templateToUpdate = await coreDbContext.Templates
                .FirstOrDefaultAsync(template => template.TemplateId == templates.TemplateId);

            if (templateToUpdate != null)
            {
                templateToUpdate.ModifiedBy = currentUser.EmployeeId;
                templateToUpdate.ModifiedOn = DateTime.Now;
                templateToUpdate.TemplateTypeId = templates.TemplateTypeId;
                templateToUpdate.TemplateName = templates.TemplateName;
                templateToUpdate.Description = templates.Description;
                templateToUpdate.TemplateCode = templates.TemplateCode;
                templateToUpdate.IsDefaultForThisType = templates.IsDefaultForThisType;
                templateToUpdate.PrintContentHTML = templates.PrintContentHTML;


                await coreDbContext.SaveChangesAsync();

              
            }
            return "Template Settings Successfully updated.";
        }

        public object AddNewTemplate(CoreDbContext coreDbContext, RbacUser currentUser, TemplateModel template)
        {
            var responseData = new DanpheHTTPResponse<object>();
            TemplateModel newTemplate = new TemplateModel();
            newTemplate.TemplateTypeId = template.TemplateTypeId;
            newTemplate.TemplateCode = template.TemplateCode;
            newTemplate.TemplateName = template.TemplateName;
            newTemplate.Description = template.Description;
            newTemplate.PrintContentHTML = template.PrintContentHTML;
            newTemplate.IsDefaultForThisType = template.IsDefaultForThisType;
            newTemplate.IsActive = template.IsActive;
            newTemplate.CreatedBy = currentUser.EmployeeId;
            newTemplate.CreatedOn = DateTime.Now;

            coreDbContext.Templates.Add(newTemplate);
            coreDbContext.SaveChanges();

            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
            responseData.Results = newTemplate;

            return responseData;
        }

        public object AddUpdateFieldMapping(CoreDbContext coreDbContext, RbacUser currentUser, List<FieldMappings_DTO> fieldMappingsList)
        {

            if (fieldMappingsList == null)
            {
                throw new ArgumentNullException("Field Mapping list is null");
            }
            // Extract unique identifiers from fieldMappingsList
            var templateIds = fieldMappingsList.Select(fieldmappings => fieldmappings.TemplateId).ToList();
            var fieldMasterIds = fieldMappingsList.Select(fieldmappings => fieldmappings.FieldMasterId).ToList();

            // Load existing mappings into memory based on unique identifiers
            var existingMappings = coreDbContext.TemplateFieldMappings
                .Where(mapping => templateIds.Contains(mapping.TemplateId) && fieldMasterIds.Contains(mapping.FieldMasterId))
                .ToList();

            foreach (var fieldmappings in fieldMappingsList)
            {
                var existingMapping = existingMappings
                    .FirstOrDefault(mapping => mapping.TemplateId == fieldmappings.TemplateId && mapping.FieldMasterId == fieldmappings.FieldMasterId);

                if (existingMapping == null)
                {
                    // Create a new mapping
                    var newMapping = new TemplateFieldMappingModel
                    {
                        TemplateId = fieldmappings.TemplateId,
                        FieldMasterId = fieldmappings.FieldMasterId,
                        IsMandatory = fieldmappings.IsMandatory,
                        DisplayLabel = fieldmappings.DisplayLabel,
                        IsActive = fieldmappings.IsActive,
                        EnterSequence = fieldmappings.EnterSequence,
                        CreatedBy = currentUser.EmployeeId,
                        CreatedOn = DateTime.Now
                    };
                    coreDbContext.TemplateFieldMappings.Add(newMapping);
                }
                else
                {
                    // Update existing mapping
                    existingMapping.IsMandatory = fieldmappings.IsMandatory;
                    existingMapping.DisplayLabel = fieldmappings.DisplayLabel;
                    existingMapping.IsActive = fieldmappings.IsActive;
                    existingMapping.EnterSequence = fieldmappings.EnterSequence;
                    existingMapping.ModifiedBy = currentUser.EmployeeId;
                    existingMapping.ModifiedOn = DateTime.Now;
                }
            }

            // Perform a single SaveChanges after the loop to commit all changes
            coreDbContext.SaveChanges();

            return "Add/Update of Field mapping Successful";
        }
    }
}
