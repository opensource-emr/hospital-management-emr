namespace DanpheEMR.Services.DynamicTemplates.DTO
{
    public class TemplateField_DTO
    {
        public string FieldName { get; set; }
        public bool IsMandatory { get; set; }
        public bool IsActive { get; set; }
        public bool IsCompulsoryField { get; set; }
    }
}
