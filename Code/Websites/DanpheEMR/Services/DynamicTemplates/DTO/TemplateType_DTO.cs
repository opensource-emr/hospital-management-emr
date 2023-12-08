using System;

namespace DanpheEMR.Services.DynamicTemplates.DTO
{
    public class TemplateType_DTO
    {
        public int TemplateTypeId { get; set; }

        public string TemplateTypeCode { get; set; }

        public string TemplateTypeName { get; set; }

        public string Description { get; set; }

        public bool IsActive { get; set; }
    }
}
