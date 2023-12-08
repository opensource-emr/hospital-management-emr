using System.Collections;

namespace DanpheEMR.Services.DynamicTemplates.DTO
{
    public class Template_DTO
    {
        public string TemplateTypeName { get; set; }
        public int TemplateId { get; set; }
        public string TemplateCode { get; set; }
        public string TemplateName { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; } 
        public bool IsDefault { get; set; }
    }
}
