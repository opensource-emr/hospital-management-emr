using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace DanpheEMR.Services.Admission.DTOs
{
    public class BedFeature_DTO
    {
        public int BedFeatureId { get; set; }
        public string BedFeatureCode { get; set; }
        public string BedFeatureName { get; set; }
        public string BedFeatureFullName { get; set; }
        public decimal BedPrice { get; set; }
        public int ServiceDepartmentId { get; set; }
        public int ServiceItemId { get; set; }
        public string ItemCode { get; set; }
    }
}
