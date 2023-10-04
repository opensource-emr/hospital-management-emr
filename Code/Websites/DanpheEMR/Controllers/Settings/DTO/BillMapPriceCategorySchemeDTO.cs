using System.ComponentModel.DataAnnotations;
using System;

namespace DanpheEMR.Controllers.Settings.DTO
{
    public class BillMapPriceCategorySchemeDTO
    {
        public int PriceCategorySchemeMapId { get; set; }
        public int SchemeId { get; set; }
        public int PriceCategoryId { get; set; }
        public bool IsDefault { get; set; }
        public bool IsActive { get; set; }
    }
}
